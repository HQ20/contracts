import * as chai from 'chai';
// tslint:disable-next-line:no-var-requires
const { balance, BN, ether, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
import { IssuanceEthInstance, ERC20MintableInstance } from '../../types/truffle-contracts';

const IssuanceEth = artifacts.require('IssuanceEth') as Truffle.Contract<IssuanceEthInstance>;
const ERC20Mintable = artifacts.require(
        'ERC20Mintable'
    ) as Truffle.Contract<ERC20MintableInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('IssuanceEth', (accounts) => {

    const investor1 = accounts[1];
    const investor2 = accounts[2];
    const notInvestor = accounts[3];
    const beneficiary = accounts[4];
    const issuePrice = ether('0.05');
    const investment1 = ether('0.5');
    const investment2 = ether('0.1');
    const claimed1 = ether('1');
    const claimed2 = ether('0.2');

    let issuanceEth: IssuanceEthInstance;
    let issuanceToken: ERC20MintableInstance;

    beforeEach(async () => {
        issuanceToken = await ERC20Mintable.new('IssuanceToken', 'ISST', 17);
        issuanceEth = await IssuanceEth.new(issuanceToken.address);
        await issuanceToken.addAdmin(issuanceEth.address);
    });

    /**
     * @test {Issuance#invest}
     */
    it('cannot invest if state is not "OPEN"', async () => {
        await expectRevert(
            issuanceEth.invest({ from: investor1, value: ether('0.5').toString() }),
            'Not open for investments.',
        );
    });

    /**
     * @test {Issuance#invest}
     */
    it('cannot open issuanceEth without setting issue price', async () => {
        await expectRevert(issuanceEth.startIssuance(), 'Issue price not set.');
    });

    it('can set issue price', async () => {
        await issuanceEth.setIssuePrice(issuePrice);
        BN(await issuanceEth.issuePrice()).should.be.bignumber.equal(issuePrice);
    });

    /**
     * @test {Issuance#startIssuance}
     */
    it('can start the Issuance process', async () => {
        await issuanceEth.setIssuePrice(issuePrice);
        await issuanceEth.startIssuance();
        (bytes32ToString(await issuanceEth.currentState())).should.be.equal('OPEN');
    });

    describe('after opening issuance', () => {

        beforeEach(async () => {
            await issuanceEth.setIssuePrice(issuePrice);
            await issuanceEth.startIssuance();
        });

        /**
         * @test {Issuance#withdraw}
         */
        it('the beneficiary cannot withdraw funds yet', async () => {
            await expectRevert(
                issuanceEth.withdraw(beneficiary),
                'Cannot withdraw funds now.',
            );
        });

        /**
         * @test {Issuance#cancelInvestment}
         */
        it('investors cannot cancel investments if not invested', async () => {
            await expectRevert(
                issuanceEth.cancelInvestment({ from: investor1 }),
                'No investments found.',
            );
        });

        /**
         * @test {Issuance#invest}
         */
        it('fractional investments are not accepted', async () => {
            const fractionalInvestment = BN(investment1) + 1;
            await expectRevert(
                issuanceEth.invest({ from: investor1, value: fractionalInvestment.toString() }),
                'Fractional investments not allowed.',
            );
        });

        /**
         * @test {Issuance#invest}
         */
        it('investments are acccepted', async () => {
            expectEvent(
                await issuanceEth.invest({ from: investor1, value: investment1.toString() }),
                'InvestmentAdded',
                {
                    amount: ether('0.5'),
                    investor: investor1,
                },
            );
        });

        describe('once invested', () => {

            beforeEach(async () => {
                await issuanceEth.invest({ from: investor1, value: investment1.toString() });
                await issuanceEth.invest({ from: investor2, value: investment2.toString() });
            });

            /**
             * @test {Issuance#claim}
             */
            it('investors cannot claim tokens yet', async () => {
                await expectRevert(
                    issuanceEth.claim({ from: investor1 }),
                    'Cannot claim now.',
                );
            });

            /**
             * @test {Issuance#cancelInvestment}
             */
            it('investors can cancel their investments', async () => {
                expectEvent(
                    await issuanceEth.cancelInvestment({ from: investor1 }),
                    'InvestmentCancelled',
                    {
                        amount: investment1,
                        investor: investor1,
                    },
                );
            });

            /**
             * @test {Issuance#cancelAllInvestments}
             */
            it('the issuance process can be cancelled', async () => {
                await issuanceEth.cancelAllInvestments();
                bytes32ToString(await issuanceEth.currentState()).should.be.equal('FAILED');
            });

            /**
             * @test {Issuance#startDistribution}
             */
            it('distribution can start', async () => {
                await issuanceEth.startDistribution();
                bytes32ToString(await issuanceEth.currentState()).should.be.equal('LIVE');
            });

            describe('once distribution starts', () => {

                beforeEach(async () => {
                    await issuanceEth.startDistribution();
                });

                /**
                 * @test {Issuance#cancelInvestment}
                 */
                it('investments cannot be cancelled', async () => {
                    await expectRevert(
                        issuanceEth.cancelInvestment({ from: investor1 }),
                        'Cannot cancel now.',
                    );
                });

                /**
                 * @test {Issuance#claim}
                 */
                it('investors cannot claim when not invested', async () => {
                    await expectRevert(
                        issuanceEth.claim({ from: notInvestor }),
                        'No investments found.',
                    );
                });

                /**
                 * @test {Issuance#claim}
                 */
                it('investors can claim tokens for their investments', async () => {
                    await issuanceEth.claim({ from: investor1 });
                    await issuanceEth.claim({ from: investor2 });
                    BN(await issuanceToken.balanceOf(investor1)).should.be.bignumber.equal(claimed1);
                    BN(await issuanceToken.balanceOf(investor2)).should.be.bignumber.equal(claimed2);
                });

                /**
                 * @test {Issuance#withdraw}
                 */
                it('the beneficiary can withdraw all collected funds', async () => {
                    const trackerBeneficiary = await balance.tracker(beneficiary);
                    trackerBeneficiary.get();
                    await issuanceEth.withdraw(beneficiary);
                    (await trackerBeneficiary.delta()).should.be.bignumber.equal(investment1.add(investment2));
                });

            });

            describe('once the issuance process is cancelled', () => {

                beforeEach(async () => {
                    await issuanceEth.cancelAllInvestments();
                });

                /**
                 * @test {Issuance#cancelAllInvestments}
                 */
                it('investors can claim their investments back', async () => {
                    await issuanceEth.cancelInvestment({ from: investor1 });
                    await issuanceEth.cancelInvestment({ from: investor2 });
                    (await balance.current(issuanceEth.address)).should.be.bignumber.equal(ether('0'));
                });

                /**
                 * @test {Issuance#withdraw}
                 */
                it('the beneficiary cannot withdraw funds', async () => {
                    await expectRevert(
                        issuanceEth.withdraw(beneficiary),
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
