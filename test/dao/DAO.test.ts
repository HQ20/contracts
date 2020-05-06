import * as chai from 'chai';

// tslint:disable-next-line:no-var-requires
const { balance, BN, constants, ether, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

import { DAOInstance, VentureEthInstance, OneTokenOneVoteInstance } from '../../types/truffle-contracts';

const DAO = artifacts.require(
    'DAO',
) as Truffle.Contract<DAOInstance>;
const VentureEth = artifacts.require(
    'VentureEth',
) as Truffle.Contract<VentureEthInstance>;
const Voting = artifacts.require(
    'OneTokenOneVote',
) as Truffle.Contract<OneTokenOneVoteInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('DAO', (accounts) => {

    const [
        holder1,
        holder2,
        holder3,
        holder4,
        ventureHolder1,
        ventureHolder2,
        ventureClient1,
        ventureClient2
    ] = accounts;

    let dao: DAOInstance;
    let venture1: VentureEthInstance;
    let venture2: VentureEthInstance;
    let voting1: OneTokenOneVoteInstance;
    let voting2: OneTokenOneVoteInstance;

    describe('once DAO tokens issued to investors', () => {

        beforeEach(async () => {
            dao = await DAO.new('DAOToken', 'DAO', 18, 5001);
            venture1 = await VentureEth.new('VentureToken1', 'VNT1', 19);
            venture2 = await VentureEth.new('VentureToken2', 'VNT2', 17);
            await dao.setIssuePrice(ether('0.2'));
            await dao.startIssuance();
            await dao.invest({ from: holder1, value: ether('1').toString() });
            await dao.invest({ from: holder2, value: ether('3').toString() });
            await dao.startDistribution();
            await dao.claim({ from: holder1 });
            await dao.claim({ from: holder2 });
            await venture1.setIssuePrice(ether('1'));
            await venture2.setIssuePrice(ether('1'));
            await venture1.startIssuance();
            await venture2.startIssuance();
        });

        /**
         * @test {DAO#investVenture}
         */
        it('cannot invest in venture from outside voting contract', async () => {
            await expectRevert(
                dao.investVenture(venture1.address, ether('1')),
                'Restricted to proposals.',
            );
        });

        /**
         * @test {DAO#propose}
         */
        it('can propose venture', async () => {
            expectEvent(
                await dao.propose(
                    web3.eth.abi.encodeFunctionCall({
                        type: 'function',
                        name: 'investVenture',
                        payable: false,
                        inputs: [{
                            name: 'venture',
                            type: 'address',
                        }, {
                            name: 'investment',
                            type: 'uint256',
                        }],
                    }, [venture1.address, ether('1').toString()])
                ),
                'Proposal',
            );
        });

        describe('once ventures are proposed and invested in', () => {

            beforeEach(async () => {
                voting1 = await Voting.at(
                    (await dao.propose(
                        web3.eth.abi.encodeFunctionCall({
                            type: 'function',
                            name: 'investVenture',
                            payable: false,
                            inputs: [{
                                name: 'venture',
                                type: 'address',
                            }, {
                                name: 'investment',
                                type: 'uint256',
                            }],
                        }, [venture1.address, ether('1').toString()])
                    )).logs[1].args.proposal
                );
                voting2 = await Voting.at(
                    (await dao.propose(
                        web3.eth.abi.encodeFunctionCall({
                            type: 'function',
                            name: 'investVenture',
                            payable: false,
                            inputs: [{
                                name: 'venture',
                                type: 'address',
                            }, {
                                name: 'investment',
                                type: 'uint256',
                            }],
                        }, [venture2.address, ether('2').toString()])
                    )).logs[1].args.proposal
                );
                await dao.approve(voting1.address, ether('10'), { from: holder1 });
                await dao.approve(voting1.address, ether('10'), { from: holder2 });
                await dao.approve(voting2.address, ether('10'), { from: holder1 });
                await dao.approve(voting2.address, ether('10'), { from: holder2 });
                await voting1.vote(ether('3'), { from: holder1 });
                await voting1.vote(ether('8'), { from: holder2 });
                await voting1.validate();
                await voting1.cancel({ from: holder1 });
                await voting1.cancel({ from: holder2 });
                await voting1.enact();
                await voting2.vote(ether('2'), { from: holder1 });
                await voting2.vote(ether('10'), { from: holder2 });
                await voting2.validate();
                await voting2.cancel({ from: holder1 });
                await voting2.cancel({ from: holder2 });
                await voting2.enact();
            });

            it('can retrieve tokens from invested venture', async () => {
                await venture1.startDistribution();
                await venture2.startDistribution();
                await dao.retrieveVentureTokens(venture1.address);
                await dao.retrieveVentureTokens(venture2.address);
                BN(await venture1.balanceOf(dao.address)).should.be.bignumber.equal(ether('10'));
                BN(await venture2.balanceOf(dao.address)).should.be.bignumber.equal(ether('0.2'));
            });

            it('can cancel investment in venture', async () => {
                const daoTracker = await balance.tracker(dao.address);
                await daoTracker.get();
                voting1 = await Voting.at(
                    (await dao.propose(
                        web3.eth.abi.encodeFunctionCall({
                            type: 'function',
                            name: 'cancelVenture',
                            payable: false,
                            inputs: [{
                                name: 'venture',
                                type: 'address',
                            }],
                        }, [venture1.address])
                    )).logs[1].args.proposal
                );
                await dao.approve(voting1.address, ether('10'), { from: holder1 });
                await dao.approve(voting1.address, ether('10'), { from: holder2 });
                await voting1.vote(ether('3'), { from: holder1 });
                await voting1.vote(ether('8'), { from: holder2 });
                await voting1.validate();
                await voting1.cancel({ from: holder1 });
                await voting1.cancel({ from: holder2 });
                await voting1.enact();
                BN(await daoTracker.delta()).should.be.bignumber.equal(ether('1'));
            });

            describe('once venture tokens are retrieved', async () => {

                let dividends1: BN;
                let dividends2: BN;

                beforeEach(async () => {
                    await venture1.invest({ from: ventureHolder1, value: ether('2').toString() });
                    await venture1.invest({ from: ventureHolder2, value: ether('1').toString() });
                    await venture2.invest({ from: ventureHolder1, value: ether('1').toString() });
                    await venture2.invest({ from: ventureHolder2, value: ether('1').toString() });
                    await venture1.startDistribution();
                    await venture2.startDistribution();
                    await dao.retrieveVentureTokens(venture1.address);
                    await dao.retrieveVentureTokens(venture2.address);
                    await venture1.claim({ from: ventureHolder1 });
                    await venture1.claim({ from: ventureHolder2 });
                    await venture2.claim({ from: ventureHolder1 });
                    await venture2.claim({ from: ventureHolder2 });
                    await venture1.releaseDividends({ from: ventureClient1, value: ether('1').toString() });
                    await venture1.releaseDividends({ from: ventureClient2, value: ether('3').toString() });
                    await venture2.releaseDividends({ from: ventureClient1, value: ether('1').toString() });
                    await venture2.releaseDividends({ from: ventureClient2, value: ether('5').toString() });
                    dividends1 = new BN((await dao.claimDividendsFromVenture.call(venture1.address)).toString());
                    dividends2 = new BN((await dao.claimDividendsFromVenture.call(venture2.address)).toString());
                    await dao.claimDividendsFromVenture(venture1.address);
                    await dao.claimDividendsFromVenture(venture2.address);
                });

                it('investors can profit from venture dividends', async () => {
                    voting1 = await Voting.at(
                        (await dao.propose(
                            web3.eth.abi.encodeFunctionCall({
                                type: 'function',
                                name: 'releaseDividends',
                                payable: false,
                                inputs: [{
                                    name: 'amount',
                                    type: 'uint256',
                                }],
                            }, [dividends1.add(dividends2).toString()])
                        )).logs[1].args.proposal
                    );
                    await dao.approve(voting1.address, ether('10'), { from: holder1 });
                    await dao.approve(voting1.address, ether('10'), { from: holder2 });
                    await voting1.vote(ether('3'), { from: holder1 });
                    await voting1.vote(ether('8'), { from: holder2 });
                    await voting1.validate();
                    await voting1.cancel({ from: holder1 });
                    await voting1.cancel({ from: holder2 });
                    await voting1.enact();
                    BN(await dao.claimDividends.call({ from: holder1 })).should.be
                        .bignumber.gt(ether('0.95')).and.bignumber.lt(ether('1.05'));
                    BN(await dao.claimDividends.call({ from: holder2 })).should.be
                        .bignumber.gt(ether('2.95')).and.bignumber.lt(ether('3.05'));
                });

                it('investors can reopen an investor round', async () => {
                    voting1 = await Voting.at(
                        (await dao.propose(
                            web3.eth.abi.encodeFunctionCall({
                                type: 'function',
                                name: 'restartInvestorRound',
                                payable: false,
                                inputs: [{
                                    name: '_issuePrice',
                                    type: 'uint256',
                                }],
                            }, [ether('1').toString()])
                        )).logs[1].args.proposal
                    );
                    await dao.approve(voting1.address, ether('10'), { from: holder1 });
                    await dao.approve(voting1.address, ether('10'), { from: holder2 });
                    await voting1.vote(ether('3'), { from: holder1 });
                    await voting1.vote(ether('8'), { from: holder2 });
                    await voting1.validate();
                    await voting1.cancel({ from: holder1 });
                    await voting1.cancel({ from: holder2 });
                    await voting1.enact();
                    bytes32ToString(await dao.currentState()).should.be.equal('OPEN');
                });

                describe('once investing round is restarted', () => {

                    beforeEach(async () => {
                        voting1 = await Voting.at(
                            (await dao.propose(
                                web3.eth.abi.encodeFunctionCall({
                                    type: 'function',
                                    name: 'restartInvestorRound',
                                    payable: false,
                                    inputs: [{
                                        name: '_issuePrice',
                                        type: 'uint256',
                                    }],
                                }, [ether('1').toString()])
                            )).logs[1].args.proposal
                        );
                        await dao.approve(voting1.address, ether('10'), { from: holder1 });
                        await dao.approve(voting1.address, ether('10'), { from: holder2 });
                        await voting1.vote(ether('3'), { from: holder1 });
                        await voting1.vote(ether('8'), { from: holder2 });
                        await voting1.validate();
                        await voting1.cancel({ from: holder1 });
                        await voting1.cancel({ from: holder2 });
                        await voting1.enact();
                    });

                    it('new investors can claim dao tokens', async () => {
                        await dao.invest({ from: holder3, value: ether('1').toString() });
                        await dao.invest({ from: holder4, value: ether('3').toString() });
                        voting1 = await Voting.at(
                            (await dao.propose(
                                web3.eth.abi.encodeFunctionCall({
                                    type: 'function',
                                    name: 'restartDistribution',
                                    payable: false,
                                    inputs: [],
                                }, []),
                            )).logs[1].args.proposal
                        );
                        await dao.approve(voting1.address, ether('10'), { from: holder1 });
                        await dao.approve(voting1.address, ether('10'), { from: holder2 });
                        await voting1.vote(ether('3'), { from: holder1 });
                        await voting1.vote(ether('8'), { from: holder2 });
                        await voting1.validate();
                        await voting1.cancel({ from: holder1 });
                        await voting1.cancel({ from: holder2 });
                        await voting1.enact();
                        await dao.claim({ from: holder3 });
                        await dao.claim({ from: holder4 });
                        BN(await dao.balanceOf(holder3)).should.be.bignumber.equal(ether('1'));
                        BN(await dao.balanceOf(holder4)).should.be.bignumber.equal(ether('3'));
                    });

                    it('investors can cancel new founding round', async () => {
                        const daoTracker = await balance.tracker(dao.address);
                        await daoTracker.get();
                        await dao.invest({ from: holder3, value: ether('1').toString() });
                        await dao.invest({ from: holder4, value: ether('3').toString() });
                        voting1 = await Voting.at(
                            (await dao.propose(
                                web3.eth.abi.encodeFunctionCall({
                                    type: 'function',
                                    name: 'cancelInvestmentRound',
                                    payable: false,
                                    inputs: [],
                                }, []),
                            )).logs[1].args.proposal
                        );
                        await dao.approve(voting1.address, ether('10'), { from: holder1 });
                        await dao.approve(voting1.address, ether('10'), { from: holder2 });
                        await voting1.vote(ether('3'), { from: holder1 });
                        await voting1.vote(ether('8'), { from: holder2 });
                        await voting1.validate();
                        await voting1.cancel({ from: holder1 });
                        await voting1.cancel({ from: holder2 });
                        await voting1.enact();
                        await dao.cancelInvestment({ from: holder3 });
                        await dao.cancelInvestment({ from: holder4 });
                        BN(await daoTracker.delta()).should.be.bignumber.equal(ether('0'));
                    });

                });

            });

        });

    });

});

function bytes32ToString(text: string) {
    return web3.utils.toAscii(text).replace(/\0/g, '');
}
