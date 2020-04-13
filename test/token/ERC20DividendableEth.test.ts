import { should } from 'chai';

// tslint:disable-next-line:no-var-requires
const { balance, BN, constants, ether, expectEvent, expectRevert, send } = require('@openzeppelin/test-helpers');

import { TestERC20DividendableEthInstance } from '../../types/truffle-contracts';

const TestERC20DividendableEth = artifacts.require(
    './test/token/TestERC20DividendableEth.sol',
    ) as Truffle.Contract<TestERC20DividendableEthInstance>;


should();

contract('ERC20DividendableEth', (accounts) => {

    const [user1, account1, account2] = accounts;

    const balance1 = ether('40');
    const balance2 = ether('60');
    const releasedDividends = ether('10');
    const dividendsPerToken = ether('0.1');
    const claimedDividends1 = ether('4');
    const claimedDividends2 = ether('6');

    let erc20dividendableEth: TestERC20DividendableEthInstance;

    beforeEach(async () => {
        erc20dividendableEth = await TestERC20DividendableEth.new('DividendableToken', 'DTK', 18);
        await erc20dividendableEth.mint(account1, balance1);
        await erc20dividendableEth.mint(account2, balance2);
    });

    /**
     * @test {ERC20DividendableEth#claimDividends}
     */
    it('doesn\'t allow to claim dividends if none are owed', async () => {
        await expectRevert(erc20dividendableEth.claimDividends({ from: account1 }), 'Account need not be updated now.');
    });

    /**
     * @test {ERC20DividendableEth#releaseDividends}
     */
    it('can\'t release dividends without enough ether in the contract', async () => {
        await expectRevert(erc20dividendableEth.testReleaseDividends(claimedDividends1, { from: account1 }), 'Not enough funds.');
    });

    /**
     * @test {ERC20DividendableEth#releaseDividends}
     */
    it('can release dividends', async () => {
        await erc20dividendableEth.releaseDividends({ from: user1, value: releasedDividends.toString()});
        BN(await erc20dividendableEth.dividendsPerToken()).should.be.bignumber.equal(dividendsPerToken);
    });

    describe('With dividends released', () => {
        beforeEach(async () => {
            await erc20dividendableEth.releaseDividends({ from: user1, value: releasedDividends.toString()});
        });

        /**
         * @test {ERC20DividendableEth#claimDividends}
         */
        it('allows owed dividends to be claimed', async () => {
            BN(await erc20dividendableEth.claimDividends.call({ from: account1 }))
                .should.be.bignumber.equal(claimedDividends1);
            BN(await erc20dividendableEth.claimDividends.call({ from: account2 }))
                .should.be.bignumber.equal(claimedDividends2);
        });

        /**
         * @test {ERC20DividendableEth#claimDividends}
         */
        it('dividends per token are adjusted downwards after minting tokens', async () => {
            await erc20dividendableEth.mint(account2, balance1.add(balance2));
            BN(await erc20dividendableEth.claimDividends.call({ from: account1 }))
            .should.be.bignumber.equal(claimedDividends1);
            BN(await erc20dividendableEth.claimDividends.call({ from: account2 }))
            .should.be.bignumber.equal(claimedDividends2);
        });

        /**
         * @test {ERC20DividendableEth#claimDividends}
         */
        it('dividends per token remain constant after burning tokens', async () => {
            await erc20dividendableEth.burn(balance2.div(new BN('2')), { from: account2 });
            BN(await erc20dividendableEth.claimDividends.call({ from: account2 }))
            .should.be.bignumber.equal(claimedDividends2.div(new BN('2')));
        });

        /**
         * @test {ERC20DividendableEth#claimDividends}
         */
        it('dividends can be claimed after transferring tokens', async () => {
            await erc20dividendableEth.transfer(account2, balance1, { from: account1 });
            await expectRevert(erc20dividendableEth.claimDividends({ from: account1 }), 'Account need not be updated now.');
            BN(await erc20dividendableEth.claimDividends.call({ from: account2 }))
            .should.be.bignumber.equal(claimedDividends1.add(claimedDividends2));
        });

        /**
         * @test {ERC20DividendableEth#claimDividends}
         */
        it('dividends per token are adjusted downwards after transferring tokens', async () => {
            await erc20dividendableEth.claimDividends({ from: account1 })
            await erc20dividendableEth.transfer(account2, balance1, { from: account1 });
            BN(await erc20dividendableEth.claimDividends.call({ from: account2 }))
            .should.be.bignumber.equal(claimedDividends2);
        });

        /**
         * @test {ERC20DividendableEth#claimDividends}
         */
        it('dividends per token are adjusted upwards after transferring tokens', async () => {
            await erc20dividendableEth.claimDividends({ from: account2 })
            await erc20dividendableEth.transfer(account2, balance1, { from: account1 });
            BN(await erc20dividendableEth.claimDividends.call({ from: account2 }))
            .should.be.bignumber.equal(claimedDividends1);
        });
    });

    /**
     * @test {ERC20DividendableEth#claimDividends}
     */
    it('dividends can be claimed after burning tokens', async () => {
        await erc20dividendableEth.mint(account2, balance1.add(balance2));
        await erc20dividendableEth.releaseDividends({ from: user1, value: releasedDividends.toString()});
        await erc20dividendableEth.burn(balance1.add(balance2), { from: account2 });
        await erc20dividendableEth.releaseDividends({ from: user1, value: releasedDividends.toString()});
        BN(await erc20dividendableEth.claimDividends.call({ from: account1 }))
            .should.be.bignumber.equal(claimedDividends2);
    });
});
