import * as chai from 'chai';

// tslint:disable-next-line:no-var-requires
const { BN, ether, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

import { DAOInstance, VentureEthInstance, VotingInstance } from '../../../types/truffle-contracts';

const DAO = artifacts.require(
    'DAO',
) as Truffle.Contract<DAOInstance>;
const VentureEth = artifacts.require(
    'VentureEth',
) as Truffle.Contract<VentureEthInstance>;
const Voting = artifacts.require(
    'Voting',
) as Truffle.Contract<VotingInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('DAO', (accounts) => {

    const [ holder1, holder2, ventureHolder1, ventureHolder2, ventureClient1, ventureClient2 ] = accounts;

    let dao: DAOInstance;
    let venture1: VentureEthInstance;
    let venture2: VentureEthInstance;
    let voting1: VotingInstance;
    let voting2: VotingInstance;

    beforeEach(async () => {
        dao = await DAO.new('DAOToken', 'DAO', 18, 5001);
        venture1 = await VentureEth.new('VentureToken1', 'VNT1', 19);
        venture2 = await VentureEth.new('VentureToken2', 'VNT2', 17);
    });

    /**
     * @test {DAO#proposeVenture}
     */
    it('cannot propose venture if DAO not in "LIVE" state', async () => {
        await expectRevert(
            dao.proposeVenture(venture1.address, ether('1')),
            'DAO needs to be LIVE.',
        );
    });

    describe('once DAO tokens issued to investors', () => {

        beforeEach(async () => {
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
         * @test {DAO#withdraw}
         */
        it('cannot withdraw funds under any circumstances', async () => {
            await expectRevert(
                dao.withdraw(holder1),
                'Withdraw is disabled.',
            );
        });

        /**
         * @test {DAO#investVenture}
         */
        it('cannot invest in venture from outside voting contract', async () => {
            await expectRevert(
                dao.investVenture(venture1.address, ether('1')),
                'Only a proposal can execute.',
            );
        });

        /**
         * @test {DAO#proposeVenture}
         */
        it('can propose venture', async () => {
            expectEvent(
                await dao.proposeVenture(venture1.address, ether('1')),
                'VentureProposed',
            );
        });

        describe('once ventures are proposed and invested in', () => {

            beforeEach(async () => {
                voting1 = await Voting.at(
                    (await dao.proposeVenture(venture1.address, ether('1'))).logs[5].args.proposal
                );
                voting2 = await Voting.at(
                    (await dao.proposeVenture(venture2.address, ether('2'))).logs[5].args.proposal
                );
                await dao.approve(voting1.address, ether('10'), { from: holder1 });
                await dao.approve(voting1.address, ether('10'), { from: holder2 });
                await dao.approve(voting2.address, ether('10'), { from: holder1 });
                await dao.approve(voting2.address, ether('10'), { from: holder2 });
                await voting1.cast(ether('3'), { from: holder1 });
                await voting1.cast(ether('8'), { from: holder2 });
                await voting1.validate();
                await voting1.cancel({ from: holder1 });
                await voting1.cancel({ from: holder2 });
                await voting1.enact();
                await voting2.cast(ether('2'), { from: holder1 });
                await voting2.cast(ether('10'), { from: holder2 });
                await voting2.validate();
                await voting2.cancel({ from: holder1 });
                await voting2.cancel({ from: holder2 });
                await voting2.enact();
            });

            it('retrieve tokens from invested venture', async () => {
                await venture1.startDistribution();
                await venture2.startDistribution();
                await dao.retrieveVentureTokens(venture1.address);
                await dao.retrieveVentureTokens(venture2.address);
                BN(await venture1.balanceOf(dao.address)).should.be.bignumber.equal(ether('10'));
                BN(await venture2.balanceOf(dao.address)).should.be.bignumber.equal(ether('0.2'));
            });

            describe('once venture tokens are retrieved', async () => {

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
                });

                it('investors can profit from venture dividends', async () => {
                    voting1 = await Voting.at(
                        (await dao.proposeProfit(venture1.address)).logs[5].args.proposal
                    );
                    voting2 = await Voting.at(
                        (await dao.proposeProfit(venture2.address)).logs[5].args.proposal
                    );
                    await dao.approve(voting1.address, ether('10'), { from: holder1 });
                    await dao.approve(voting1.address, ether('10'), { from: holder2 });
                    await dao.approve(voting2.address, ether('10'), { from: holder1 });
                    await dao.approve(voting2.address, ether('10'), { from: holder2 });
                    await voting1.cast(ether('3'), { from: holder1 });
                    await voting1.cast(ether('8'), { from: holder2 });
                    await voting1.validate();
                    await voting1.cancel({ from: holder1 });
                    await voting1.cancel({ from: holder2 });
                    await voting1.enact();
                    await voting2.cast(ether('2'), { from: holder1 });
                    await voting2.cast(ether('10'), { from: holder2 });
                    await voting2.validate();
                    await voting2.cancel({ from: holder1 });
                    await voting2.cancel({ from: holder2 });
                    await voting2.enact();
                    BN(await dao.claimDividends.call({ from: holder1 })).should.be
                        .bignumber.gt(ether('0.95')).and.bignumber.lt(ether('1.05'));
                    BN(await dao.claimDividends.call({ from: holder2 })).should.be
                        .bignumber.gt(ether('2.95')).and.bignumber.lt(ether('3.05'));
                });

            });

        });

    });

});
