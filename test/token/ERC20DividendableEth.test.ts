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
    const profits = ether('10');
    const dividends1 = ether('4');
    const dividends2 = ether('6');

    let erc20dividendableEth: TestERC20DividendableEthInstance;

    beforeEach(async () => {
        erc20dividendableEth = await TestERC20DividendableEth.new('DividendableToken', 'DTK', 17);
        await erc20dividendableEth.mint(account1, balance1);
        await erc20dividendableEth.mint(account2, balance2);
    });

    /**
     * @test {ERC20DividendableEth#updateAccount}
     */
    it('updateAccount can succesfully update an account', async () => {
        await erc20dividendableEth.releaseDividends({ from: user1, value: profits.toString()});
        BN(await erc20dividendableEth.claimDividends.call({ from: account1 })).should.be.bignumber.equal(dividends1);
        BN(await erc20dividendableEth.claimDividends.call({ from: account2 })).should.be.bignumber.equal(dividends2);
    });

    /**
     * @test {ERC20DividendableEth#updateAccount}
     */
    it('more updateAccount usage, including a revert', async () => {
        await erc20dividendableEth.releaseDividends({ from: user1, value: profits.toString()});
        BN(await erc20dividendableEth.claimDividends.call({ from: account1 })).should.be.bignumber.equal(dividends1);
        await erc20dividendableEth.claimDividends({ from: account1 });
        await expectRevert(erc20dividendableEth.claimDividends({ from: account1 }), 'Account need not be updated now.');
        await erc20dividendableEth.releaseDividends({ from: user1, value: profits.toString()});
        BN(await erc20dividendableEth.claimDividends.call({ from: account2 }))
            .should.be.bignumber.equal(dividends2.add(dividends2));
    });

    /**
     * @test {ERC20DividendableEth#updateAccount}
     */
    it('dividends can be claimed after minting tokens', async () => {
        await erc20dividendableEth.releaseDividends({ from: user1, value: profits.toString()});
        await erc20dividendableEth.mint(account2, balance1.add(balance2));
        await erc20dividendableEth.releaseDividends({ from: user1, value: profits.toString()});
        BN(await erc20dividendableEth.claimDividends.call({ from: account1 })).should.be.bignumber.equal(dividends2);
    });

    /**
     * @test {ERC20DividendableEth#updateAccount}
     */
    it('dividends can be claimed after burning tokens', async () => {
        await erc20dividendableEth.mint(account2, balance1.add(balance2));
        await erc20dividendableEth.releaseDividends({ from: user1, value: profits.toString()});
        await erc20dividendableEth.burn(balance1.add(balance2), { from: account2 });
        await erc20dividendableEth.releaseDividends({ from: user1, value: profits.toString()});
        BN(await erc20dividendableEth.claimDividends.call({ from: account1 })).should.be.bignumber.equal(dividends2);
    });
});
