import * as chai from 'chai';
// tslint:disable-next-line:no-var-requires
const { balance, BN, ether, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
import { ERC20MintableInstance, IssuanceInstance } from '../../types/truffle-contracts';

const Issuance = artifacts.require('Issuance') as Truffle.Contract<IssuanceInstance>;
const ERC20Mintable = artifacts.require(
        'ERC20Mintable'
    ) as Truffle.Contract<ERC20MintableInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('Issuance', (accounts) => {

    const investor1 = accounts[1];
    const investor2 = accounts[2];
    const notInvestor = accounts[3];
    const beneficiary = accounts[4];
    const issuePrice = ether('5');
    const balance1 = ether('100');
    const balance2 = ether('50');
    const investment1 = ether('50');
    const investment2 = ether('10');
    const claimed1 = '1';
    const claimed2 = '0.2';

    let issuance: IssuanceInstance;
    let currencyToken: ERC20MintableInstance;
    let issuanceToken: ERC20MintableInstance;

    beforeEach(async () => {
        currencyToken = await ERC20Mintable.new('CurrencyToken', 'CURT', 18);
        issuanceToken = await ERC20Mintable.new('IssuanceToken', 'ISST', 17);
        issuance = await Issuance.new(
            issuanceToken.address,
            currencyToken.address,
        );
        await issuanceToken.addAdmin(issuance.address);
        await currencyToken.mint(investor1, balance1);
        await currencyToken.mint(investor2, balance2);
        await currencyToken.approve(issuance.address, investment1, { from: investor1 });
        await currencyToken.approve(issuance.address, investment2, { from: investor2 });
    });

    /**
     * @test {Issuance#invest}
     */
    it('cannot invest if state is not "OPEN"', async () => {
        await expectRevert(
            issuance.invest(investment1, { from: investor1 }),
            'Not open for investments.',
        );
    });

    /**
     * @test {Issuance#startIssuance}
     */
    it('cannot start issuance without setting issue price', async () => {
        await expectRevert(
            issuance.startIssuance(),
            'Issue price not set.',
        );
    });

    it('can set issue price', async () => {
        await issuance.setIssuePrice(issuePrice);
        BN(await issuance.issuePrice()).should.be.bignumber.equal(issuePrice);
    });

    /**
     * @test {Issuance#startIssuance}
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
         * @test {Issuance#withdraw}
         */
        it('the beneficiary cannot withdraw funds yet', async () => {
            await expectRevert(
                issuance.withdraw(beneficiary),
                'Cannot withdraw funds now.',
            );
        });

        /**
         * @test {Issuance#cancelInvestment}
         */
        it('investors cannot cancel investments if not invested', async () => {
            await expectRevert(
                issuance.cancelInvestment({ from: investor1 }),
                'No investments found.',
            );
        });

        /**
         * @test {Issuance#invest}
         */
        it('fractional investments are not accepted', async () => {
            const fractionalInvestment = BN(investment1) + 1;
            await expectRevert(
                issuance.invest(fractionalInvestment, { from: investor1 }),
                'Fractional investments not allowed.',
            );
        });

        /**
         * @test {Issuance#invest}
         */
        it('investments are accepted', async () => {
            expectEvent(
                await issuance.invest(investment1, { from: investor1 }),
                'InvestmentAdded',
                {
                    investor: investor1,
                    amount: investment1
                },
            );
        });

        describe('once invested', () => {

            beforeEach(async () => {
                await issuance.invest(investment1, { from: investor1 });
                await issuance.invest(investment2, { from: investor2 });
            });

            /**
             * @test {Issuance#claim}
             */
            it('investors cannot claim tokens yet', async () => {
                await expectRevert(
                    issuance.claim({ from: investor1 }),
                    'Cannot claim now.',
                );
            });

            /**
             * @test {Issuance#cancelInvestment}
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
             * @test {Issuance#startDistribution}
             */
            it('distribution can start', async () => {
                await issuance.startDistribution();
                bytes32ToString(await issuance.currentState()).should.be.equal('LIVE');
            });

            describe('once distribution starts', () => {

                beforeEach(async () => {
                    await issuance.startDistribution();
                });

                /**
                 * @test {Issuance#cancelInvestment}
                 */
                it('investments cannot be cancelled', async () => {
                    await expectRevert(
                        issuance.cancelInvestment({ from: investor1 }),
                        'Cannot cancel now.',
                    );
                });

                /**
                 * @test {Issuance#claim}
                 */
                it('investors cannot claim when not invested', async () => {
                    await expectRevert(
                        issuance.claim({ from: notInvestor }),
                        'No investments found.',
                    );
                });

                /**
                 * @test {Issuance#claim}
                 */
                it('investors can claim tokens for their investments', async () => {
                    await issuance.claim({ from: investor1 });
                    await issuance.claim({ from: investor2 });
                    web3.utils.fromWei(await issuanceToken.balanceOf(investor1), 'ether').should.be.equal(claimed1);
                    web3.utils.fromWei(await issuanceToken.balanceOf(investor2), 'ether').should.be.equal(claimed2);
                });

                /**
                 * @test {Issuance#withdraw}
                 */
                it('the beneficiary can withdraw all collected funds', async () => {
                    await issuance.withdraw(beneficiary);
                    BN(await currencyToken.balanceOf(beneficiary)).should.be.bignumber.equal(
                        BN(investment1).add(BN(investment2))
                    );
                });
            });

            describe('once the issuance process is cancelled', () => {
                beforeEach(async () => {
                    await issuance.cancelAllInvestments();
                });

                /**
                 * @test {Issuance#cancelAllInvestments}
                 */
                it('investors can claim their investments back', async () => {
                    await issuance.cancelInvestment({ from: investor1 });
                    await issuance.cancelInvestment({ from: investor2 });
                    BN(await currencyToken.balanceOf(investor1)).should.be.bignumber.equal(balance1);
                    BN(await currencyToken.balanceOf(investor2)).should.be.bignumber.equal(balance2);
                });

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

function bytes32ToString(text: string) {
    return web3.utils.toAscii(text).replace(/\0/g, '');
}
