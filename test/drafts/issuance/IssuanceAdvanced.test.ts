// tslint:disable:no-var-requires
import * as chai from 'chai';
const { balance, BN, ether, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
const { advanceTimeAndBlock, takeSnapshot, revertToSnapshot } = require('ganache-time-traveler');

import { IssuanceAdvancedInstance, ERC20MintableDetailedInstance } from '../../../types/truffle-contracts';

const IssuanceAdvanced = artifacts.require(
    './drafts/issuance/IssuanceAdvanced.sol',
    ) as Truffle.Contract<IssuanceAdvancedInstance>;
const ERC20MintableDetailed = artifacts.require(
        'ERC20MintableDetailed',
    ) as Truffle.Contract<ERC20MintableDetailedInstance>;

chai.use(require('chai-bn')(require('bn.js')));
chai.should();
// tslint:enable:no-var-requires


contract('IssuanceAdvanced', (accounts) => {
    let snapshotId: any;

    const investor1 = accounts[1];
    const investor2 = accounts[2];
    const wallet = accounts[3];

    let issuance: IssuanceAdvancedInstance;
    let currencyToken: ERC20MintableDetailedInstance;
    let issuanceToken: ERC20MintableDetailedInstance;

    describe('Setters', () => {

        beforeEach(async () => {
            currencyToken = await ERC20MintableDetailed.new('CurrencyToken', 'CURT', 18);
            issuanceToken = await ERC20MintableDetailed.new('IssuanceToken', 'ISST', 17);
            issuance = await IssuanceAdvanced.new(
                issuanceToken.address,
                currencyToken.address,
            );
            await issuanceToken.addMinter(issuance.address);
        });

        it('setOpeningDate sets the opening date', async () => {
            const openingDate = Math.floor((new Date()).getTime() / 1000);
            await issuance.setOpeningDate(openingDate);
            (await issuance.openingDate()).toString().should.be.equal(openingDate.toString());
        });

        it('setClosingDate sets the closing date', async () => {
            const closingDate = Math.floor((new Date()).getTime() / 1000);
            await issuance.setClosingDate(closingDate);
            (await issuance.closingDate()).toString().should.be.equal(closingDate.toString());
        });

        it('setSoftCap sets the soft cap', async () => {
            await issuance.setSoftCap(ether('100'));
            web3.utils.fromWei(await issuance.softCap(), 'ether').should.be.equal('100');
        });

        it('setMinInvestment sets the minimum investment', async () => {
            await issuance.setMinInvestment(ether('1'));
            web3.utils.fromWei(await issuance.minInvestment(), 'ether').should.be.equal('1');
        });

        describe('Open Issuance', () => {

            beforeEach(async () => {
                const snapShot = await takeSnapshot();
                snapshotId = snapShot.result;
                await issuance.setIssuePrice(ether('5'));
                await issuance.setOpeningDate(Math.floor((new Date()).getTime() / 1000) - 3600);
                await issuance.setClosingDate(Math.floor((new Date()).getTime() / 1000) + 3600);
                await issuance.setSoftCap(ether('50'));
                await issuance.setMinInvestment(ether('10'));
            });


            afterEach(async () => {
                await revertToSnapshot(snapshotId);
            });

            it('setIssuePrice sets the issue price', async () => {
                BN(await issuance.issuePrice()).toString().should.be.bignumber.equal(ether('5'));
            });

            /**
             * @test {IssuanceAdvanced#openIssuance}
             */
            it('openIssuance can succefully open the Issuance', async () => {
                await issuance.openIssuance();
                bytes32ToString(await issuance.currentState()).should.be.equal('OPEN');
            });

            /**
             * @test {IssuanceAdvanced#openIssuance}
             */
            it('cannot open issuance outside allotted timeframe', async () => {
                await advanceTimeAndBlock(4000);
                await expectRevert(
                    issuance.openIssuance(),
                    'Not the right time.',
                );
            });

            describe('Invest', () => {

                beforeEach(async () => {
                    await issuance.openIssuance();
                    await currencyToken.mint(investor1, ether('100'));
                    await currencyToken.approve(issuance.address, ether('100'), { from: investor1 });
                });

                /**
                 * @test {IssuanceAdvanced#invest}
                 */
                it('invest should succesfully invest', async () => {
                    expectEvent(
                        await issuance.invest(ether('50'), { from: investor1 }),
                        'InvestmentAdded',
                        {
                            investor: investor1,
                            amount: ether('50'),
                        },
                    );
                });

                describe('Start distribution', () => {

                    beforeEach(async () => {
                        await currencyToken.mint(investor2, ether('50'));
                        await currencyToken.approve(issuance.address, ether('50'), { from: investor2 });
                    });

                    /**
                     * @test {IssuanceAdvanced#startDistribution}
                     */
                    it('startDistribution can succesfully close the Issuance', async () => {
                        await issuance.invest(ether('50'), { from: investor1 });
                        await issuance.invest(ether('10'), { from: investor2 });
                        await advanceTimeAndBlock(4000);
                        await issuance.startDistribution();
                        bytes32ToString(await issuance.currentState()).should.be.equal('LIVE');
                    });

                    describe('Claim & Withdraw', () => {

                        beforeEach(async () => {
                            await issuance.invest(ether('50'), { from: investor1 });
                            await issuance.invest(ether('10'), { from: investor2 });
                            await advanceTimeAndBlock(4000);
                            await issuance.startDistribution();
                        });

                        /**
                         * @test {IssuanceAdvanced#claim}
                         */
                        it('claim sends tokens to investors', async () => {
                            await issuance.claim({ from: investor1 });
                            await issuance.claim({ from: investor2 });
                            web3.utils.fromWei(await issuanceToken.balanceOf(investor1), 'ether').should.be.equal('1');
                            web3.utils.fromWei(await issuanceToken.balanceOf(investor2), 'ether')
                                .should.be.equal('0.2');
                        });

                        /**
                         * @test {IssuanceAdvanced#withdraw}
                         */
                        it('withdraw should transfer all collected tokens to the wallet of the owner', async () => {
                            await issuance.claim({ from: investor1 });
                            await issuance.claim({ from: investor2 });
                            await issuance.withdraw(wallet);
                            web3.utils.fromWei(await currencyToken.balanceOf(wallet), 'ether').should.be.equal('60');
                        });

                    });

                    describe('Claim fail', () => {
                        /**
                         * @test {IssuanceAdvanced#claim}
                         */
                        it('cannot claim when state is not "LIVE"', async () => {
                            await issuance.invest(ether('50'), { from: investor1 });
                            await issuance.invest(ether('10'), { from: investor2 });
                            await advanceTimeAndBlock(4000);
                            await expectRevert(
                                issuance.claim({ from: investor1 }),
                                'Cannot claim now.',
                            );
                        });

                        /**
                         * @test {IssuanceAdvanced#claim}
                         */
                        it('cannot claim when not invested', async () => {
                            await issuance.invest(ether('50'), { from: investor1 });
                            await advanceTimeAndBlock(4000);
                            await issuance.startDistribution();
                            await expectRevert(
                                issuance.claim({ from: investor2 }),
                                'No investments found.',
                            );
                        });
                    });

                    describe('Start distribution fail', () => {
                        /**
                         * @test {IssuanceAdvanced#startDistribution}
                         */
                        it('cannot start distribution before closing time', async () => {
                            await issuance.invest(ether('50'), { from: investor1 });
                            await issuance.invest(ether('10'), { from: investor2 });
                            await expectRevert(
                                issuance.startDistribution(),
                                'Not the right time yet.',
                            );
                        });

                        /**
                         * @test {IssuanceAdvanced#startDistribution}
                         */
                        it('cannot start distribution when soft cap not reached', async () => {
                            await issuance.invest(ether('10'), { from: investor1 });
                            await issuance.invest(ether('10'), { from: investor2 });
                            await advanceTimeAndBlock(4000);
                            await expectRevert(
                                issuance.startDistribution(),
                                'Not enough funds collected.',
                            );
                        });
                    });

                    describe('Cancel', () => {

                        /**
                         * @test {IssuanceAdvanced#cancelInvestment}
                         */
                        it('cancelInvestment should cancel an investor investments', async () => {
                            await issuance.invest(ether('50'), { from: investor1 });
                            await issuance.invest(ether('10'), { from: investor1 });
                            expectEvent(
                                await issuance.cancelInvestment({ from: investor1 }),
                                'InvestmentCancelled',
                                {
                                    investor: investor1,
                                    amount: ether('60'),
                                },
                            );
                        });

                        /**
                         * @test {IssuanceAdvanced#cancelAllInvestments}
                         */
                        it(
                            'cancelAllInvestments should begin the process to cancel all investor investments',
                            async () => {
                                await issuance.invest(ether('50'), { from: investor1 });
                                await issuance.invest(ether('10'), { from: investor2 });
                                await issuance.cancelAllInvestments();
                                bytes32ToString(await issuance.currentState()).should.be.equal('FAILED');
                                await issuance.cancelInvestment({ from: investor1 });
                                await issuance.cancelInvestment({ from: investor2 });
                                web3.utils.fromWei(await currencyToken.balanceOf(investor1), 'ether')
                                    .should.be.equal('100');
                                web3.utils.fromWei(await currencyToken.balanceOf(investor2), 'ether')
                                    .should.be.equal('50');
                            },
                        );

                    });

                    describe('Cancel fail', () => {
                        /**
                         * @test {IssuanceAdvanced#cancelInvestment}
                         */
                        it('cannot cancel investment when state is not "OPEN" or "FAILED"', async () => {
                            await issuance.invest(ether('50'), { from: investor1 });
                            await issuance.invest(ether('10'), { from: investor1 });
                            await advanceTimeAndBlock(4000);
                            await issuance.startDistribution();
                            await expectRevert(
                                issuance.cancelInvestment({ from: investor1 }),
                                'Cannot cancel now.',
                            );
                        });

                        /**
                         * @test {IssuanceAdvanced#cancelInvestment}
                         */
                        it('cannot cancel investment when not invested', async () => {
                            await expectRevert(
                                issuance.cancelInvestment({ from: investor1 }),
                                'No investments found.',
                            );
                        });
                    });

                });

            });

            describe('Invest fail', () => {
                /**
                 * @test {IssuanceAdvanced#invest}
                 */
                it('cannot invest if state is not "OPEN"', async () => {
                    await currencyToken.mint(investor1, ether('100'));
                    await currencyToken.approve(issuance.address, ether('50'), { from: investor1 });
                    await expectRevert(
                        issuance.invest(ether('50'), { from: investor1 }),
                        'Not open for investments.',
                    );
                });

                /**
                 * @test {IssuanceAdvanced#invest}
                 */
                it('cannot invest outisde allotted timespan', async () => {
                    await currencyToken.mint(investor1, ether('100'));
                    await currencyToken.approve(issuance.address, ether('50'), { from: investor1 });
                    await issuance.openIssuance();
                    await advanceTimeAndBlock(4000);
                    await expectRevert(
                        issuance.invest(ether('50'), { from: investor1 }),
                        'Not the right time.',
                    );
                });

                /**
                 * @test {IssuanceAdvanced#invest}
                 */
                it('cannot invest with fractional investments', async () => {
                    await currencyToken.mint(investor1, ether('100'));
                    await currencyToken.approve(issuance.address, ether('50'), { from: investor1 });
                    await issuance.openIssuance();
                    await expectRevert(
                        issuance.invest(new BN('1000000000000000001'), { from: investor1 }),
                        'Fractional investments not allowed.',
                    );
                });

                /**
                 * @test {IssuanceAdvanced#invest}
                 */
                it('cannot invest with investment below minimum threshold', async () => {
                    await currencyToken.mint(investor1, ether('100'));
                    await currencyToken.approve(issuance.address, ether('50'), { from: investor1 });
                    await issuance.openIssuance();
                    await expectRevert(
                        issuance.invest(ether('5'), { from: investor1 }),
                        'Investment below minimum threshold.',
                    );
                });

            });

            describe('Withdraw fail', () => {
                /**
                 * @test {IssuanceAdvanced#withdraw}
                 */
                it('cannot transfer funds when issuance state is not "LIVE"', async () => {
                    await issuance.openIssuance();
                    await expectRevert(
                        issuance.withdraw(wallet),
                        'Cannot transfer funds now.',
                    );
                });

            });

        });

    });

});

function bytes32ToString(text: string) {
    return web3.utils.toAscii(text).replace(/\0/g, '');
}
