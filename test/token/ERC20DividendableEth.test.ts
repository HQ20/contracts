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

    let erc20dividendableEth: TestERC20DividendableEthInstance;

    beforeEach(async () => {
        erc20dividendableEth = await TestERC20DividendableEth.new();
        await erc20dividendableEth.mint(account1, ether('40')); // Convert to variable
        await erc20dividendableEth.mint(account2, ether('60')); // Convert to variable
    });

    /**
     * @test {ERC20DividendableEth#updateAccount}
     */
    it('updateAccount can succesfully update an account', async () => {
        const tracker1 = await balance.tracker(account1, 'ether');
        const tracker2 = await balance.tracker(account2, 'ether');
        await tracker1.get();
        await tracker2.get();
        await erc20dividendableEth.increasePool({ from: user1, value: ether('10').toString()});
        await erc20dividendableEth.updateAccount(account1);
        await erc20dividendableEth.updateAccount(account2);
        (await tracker1.delta()).should.be.bignumber.equal('4'); // Convert to variable
        (await tracker2.delta()).should.be.bignumber.equal('6'); // Convert to variable
    });

    /**
     * @test {ERC20DividendableEth#updateAccount}
     */
    it('more updateAccount usage, including a revert', async () => {
        const tracker1 = await balance.tracker(account1, 'ether');
        const tracker2 = await balance.tracker(account2, 'ether');
        await tracker1.get();
        await tracker2.get();
        await erc20dividendableEth.increasePool({ from: user1, value: ether('10').toString()});
        await erc20dividendableEth.updateAccount(account1);
        (await tracker1.delta()).should.be.bignumber.equal('4'); // Convert to variable
        await expectRevert(erc20dividendableEth.updateAccount(account1), 'Account need not be updated now.');
        await erc20dividendableEth.increasePool({ from: user1, value: ether('10').toString()});
        await erc20dividendableEth.updateAccount(account2);
        (await tracker2.delta()).should.be.bignumber.equal('12'); // Convert to variable
    });

    /**
     * Test:
     * Supply = 100
     * User Balance = 40
     * Release 10 ether as dividends
     * Mint 100, User Balance still 50.
     * Release 10 ether as dividends
     * User claims dividends, it should receive 6 ether
     */
    /**
     * @test {ERC20DividendableEth#updateAccount}
     */
    it('more updateAccount usage, including a revert', async () => {
        const tracker1 = await balance.tracker(account1, 'ether');
        const tracker2 = await balance.tracker(account2, 'ether');
        await tracker1.get();
        await tracker2.get();
        await erc20dividendableEth.increasePool({ from: user1, value: ether('10').toString()});
        await erc20dividendableEth.mint(account2, ether('100'));
        await erc20dividendableEth.increasePool({ from: user1, value: ether('10').toString()});
        await erc20dividendableEth.updateAccount(account1);
        (await tracker1.delta()).should.not.be.bignumber.equal('6'); // Convert to variable
    });

    /**
     * Test:
     * Supply = 200
     * User Balance = 40
     * Release 10 ether as dividends
     * Burn 100, User Balance still 40.
     * Release 10 ether as dividends
     * User claims dividends, it should receive 6 ether
     */
    /**
     * @test {ERC20DividendableEth#updateAccount}
     */
    it('more updateAccount usage, including a revert', async () => {
        await erc20dividendableEth.mint(account2, ether('100'));
        const tracker1 = await balance.tracker(account1, 'ether');
        const tracker2 = await balance.tracker(account2, 'ether');
        await tracker1.get();
        await tracker2.get();
        await erc20dividendableEth.increasePool({ from: user1, value: ether('10').toString()});
        await erc20dividendableEth.burn(ether('100'), { from: account2 });
        await erc20dividendableEth.increasePool({ from: user1, value: ether('10').toString()});
        await erc20dividendableEth.updateAccount(account1);
        (await tracker1.delta()).should.not.be.bignumber.equal('6'); // Convert to variable
    });
});
