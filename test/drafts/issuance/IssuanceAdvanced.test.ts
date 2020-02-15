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
    const notInvestor = accounts[3];
    const beneficiary = accounts[4];
    const issuePrice = ether('5');
    const softCap = ether('50');
    const minInvestment = ether('10');
    const openingDate = Math.floor((new Date()).getTime() / 1000) - 3600;
    const closingDate = Math.floor((new Date()).getTime() / 1000) + 3600;
    const balance1 = ether('100');
    const balance2 = ether('50');
    const investment1 = ether('50');
    const investment2 = ether('10');
    const claimed1 = ether('1');
    const claimed2 = ether('0.2');

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
            await currencyToken.mint(investor1, balance1);
            await currencyToken.mint(investor2, balance2);
            await currencyToken.approve(issuance.address, balance1, { from: investor1 });
            await currencyToken.approve(issuance.address, balance2, { from: investor2 });
        });

        it('setOpeningDate sets the opening date', async () => {
            await issuance.setOpeningDate(openingDate);
            (await issuance.openingDate()).toString().should.be.equal(openingDate.toString());
        });

        it('setClosingDate sets the closing date', async () => {
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

        describe('before opening the issuance', () => {

            beforeEach(async () => {
                const snapShot = await takeSnapshot();
                snapshotId = snapShot.result;
                await issuance.setOpeningDate(openingDate);
                await issuance.setClosingDate(closingDate);
                await issuance.setSoftCap(softCap);
                await issuance.setMinInvestment(minInvestment);
            });


            afterEach(async () => {
                await revertToSnapshot(snapshotId);
            });

            it('can set the issue price', async () => {
                await issuance.setIssuePrice(issuePrice);
                BN(await issuance.issuePrice()).toString().should.be.bignumber.equal(issuePrice);
            });

            /**
             * @test {IssuanceAdvanced#startIssuance}
             */
            it('cannot open issuance outside allotted timeframe', async () => {
                await issuance.setIssuePrice(issuePrice);
                await advanceTimeAndBlock(4000);
                await expectRevert(
                    issuance.startIssuance(),
                    'Not the right time.',
                );
            });

            /**
             * @test {IssuanceAdvanced#invest}
             */
            it('cannot invest if state is not "OPEN"', async () => {
                await expectRevert(
                    issuance.invest(investment1, { from: investor1 }),
                    'Not open for investments.',
                );
            });

            /**
             * @test {IssuanceAdvanced#startIssuance}
             */
            it('can start the issuance process', async () => {
                await issuance.setIssuePrice(issuePrice);
                await issuance.startIssuance();
                bytes32ToString(await issuance.currentState()).should.be.equal('OPEN');
            });

            describe('after opening issuance', () => {

                beforeEach(async () => {
                    await issuance.setIssuePrice(issuePrice);
                    await issuance.startIssuance();
                });

                /**
                 * @test {IssuanceAdvanced#withdraw}
                 */
                it('the beneficiary cannot withdraw funds yet', async () => {
                    await expectRevert(
                        issuance.withdraw(beneficiary),
                        'Cannot withdraw funds now.',
                    );
                });

                /**
                 * @test {IssuanceAdvanced#cancelInvestment}
                 */
                it('investors cannot cancel investments if not invested', async () => {
                    await expectRevert(
                        issuance.cancelInvestment({ from: investor1 }),
                        'No investments found.',
                    );
                });

                /**
                 * @test {IssuanceAdvanced#invest}
                 */
                it('fractional investments are not accepted', async () => {
                    await expectRevert(
                        issuance.invest(investment1 + 1, { from: investor1 }),
                        'Fractional investments not allowed.',
                    );
                });

                /**
                 * @test {IssuanceAdvanced#invest}
                 */
                it('cannot invest outisde allotted timespan', async () => {
                    await advanceTimeAndBlock(4000);
                    await expectRevert(
                        issuance.invest(investment1, { from: investor1 }),
                        'Not the right time.',
                    );
                });

                /**
                 * @test {IssuanceAdvanced#invest}
                 */
                it('cannot invest with investment below minimum threshold', async () => {
                    await expectRevert(
                        issuance.invest(issuePrice, { from: investor1 }),
                        'Investment below minimum threshold.',
                    );
                });

                /**
                 * @test {IssuanceAdvanced#invest}
                 */
                it('investments are accepted', async () => {
                    expectEvent(
                        await issuance.invest(investment1, { from: investor1 }),
                        'InvestmentAdded',
                        {
                            investor: investor1,
                            amount: investment1,
                        },
                    );
                });

                /**
                 * @test {IssuanceAdvanced#startDistribution}
                 */
                it('cannot start distribution when soft cap not reached', async () => {
                    await issuance.invest(investment2, { from: investor1 });
                    await issuance.invest(investment2, { from: investor2 });
                    await advanceTimeAndBlock(4000);
                    await expectRevert(
                        issuance.startDistribution(),
                        'Not enough funds collected.',
                    );
                });

                describe('once invested', () => {

                    beforeEach(async () => {
                        await issuance.invest(investment1, { from: investor1 });
                        await issuance.invest(investment2, { from: investor2 });
                    });

                    /**
                     * @test {IssuanceAdvanced#startDistribution}
                     */
                    it('cannot start distribution before closing time', async () => {
                        await expectRevert(
                            issuance.startDistribution(),
                            'Not the right time yet.',
                        );
                    });

                    /**
                     * @test {IssuanceAdvanced#claim}
                     */
                    it('investors cannot claim tokens yet', async () => {
                        await advanceTimeAndBlock(4000);
                        await expectRevert(
                            issuance.claim({ from: investor1 }),
                            'Cannot claim now.',
                        );
                    });

                    /**
                     * @test {IssuanceAdvanced#cancelInvestment}
                     */
                    it('investors can cancel their investments', async () => {
                        expectEvent(
                            await issuance.cancelInvestment({ from: investor1 }),
                            'InvestmentCancelled',
                            {
                                investor: investor1,
                                amount: investment1,
                            },
                        );
                    });

                    /**
                     * @test {Issuance#cancelAllInvestments}
                     */
                    it('the issuance process can be cancelled', async () => {
                        await issuance.cancelAllInvestments();
                        bytes32ToString(await issuance.currentState()).should.be.equal('FAILED');
                    });

                    /**
                     * @test {IssuanceAdvanced#startDistribution}
                     */
                    it('distribution can start', async () => {
                        await advanceTimeAndBlock(4000);
                        await issuance.startDistribution();
                        bytes32ToString(await issuance.currentState()).should.be.equal('LIVE');
                    });

                    describe('once distribution starts', () => {

                        beforeEach(async () => {
                            await advanceTimeAndBlock(4000);
                            await issuance.startDistribution();
                        });

                        /**
                         * @test {IssuanceAdvanced#cancelInvestment}
                         */
                        it('investments cannot be cancelled', async () => {
                            await expectRevert(
                                issuance.cancelInvestment({ from: investor1 }),
                                'Cannot cancel now.',
                            );
                        });

                        /**
                         * @test {IssuanceAdvanced#claim}
                         */
                        it('cannot claim when not invested', async () => {
                            await expectRevert(
                                issuance.claim({ from: notInvestor }),
                                'No investments found.',
                            );
                        });

                        /**
                         * @test {IssuanceAdvanced#claim}
                         */
                        it('investors can claim tokens for their investments', async () => {
                            await issuance.claim({ from: investor1 });
                            await issuance.claim({ from: investor2 });
                            BN(await issuanceToken.balanceOf(investor1)).should.be.bignumber.equal(claimed1);
                            BN(await issuanceToken.balanceOf(investor2)).should.be.bignumber.equal(claimed2);
                        });

                        /**
                         * @test {IssuanceAdvanced#withdraw}
                         */
                        it('the beneficiary can withdraw all collected funds', async () => {
                            await issuance.claim({ from: investor1 });
                            await issuance.claim({ from: investor2 });
                            await issuance.withdraw(beneficiary);
                            BN(await currencyToken.balanceOf(beneficiary))
                                .should.be.bignumber.equal(investment1.add(investment2));
                        });

                    });

                    describe('once the issuance process is cancelled', () => {

                        beforeEach(async () => {
                            await issuance.cancelAllInvestments();
                        });

                        /**
                         * @test {IssuanceAdvanced#cancelAllInvestments}
                         */
                        it(
                            'investors can claim their investments back',
                            async () => {
                                await issuance.cancelInvestment({ from: investor1 });
                                await issuance.cancelInvestment({ from: investor2 });
                                BN(await currencyToken.balanceOf(investor1))
                                    .should.be.bignumber.equal(balance1);
                                BN(await currencyToken.balanceOf(investor2))
                                    .should.be.bignumber.equal(balance2);
                            },
                        );

                        /**
                         * @test {Issuance#withdraw}
                         */
                        it('the beneficiary cannot withdraw funds', async () => {
                            await expectRevert(
                                issuance.withdraw(beneficiary),
                                'Cannot withdraw funds now.',
                            );
                        });

                    });

                });

            });

        });

    });

});

function bytes32ToString(text: string) {
    return web3.utils.toAscii(text).replace(/\0/g, '');
}
