import * as chai from 'chai';

// tslint:disable-next-line:no-var-requires
const { balance, BN, constants, ether, expectEvent, expectRevert, send } = require('@openzeppelin/test-helpers');

import { TestERC20DividendableTokenInstance, TestERC20MintableInstance } from '../../../types/truffle-contracts';

const TestERC20DividendableToken = artifacts.require(
    './test/drafts/token/TestERC20DividendableToken.sol',
    ) as Truffle.Contract<TestERC20DividendableTokenInstance>;
const TestERC20Mintable = artifacts.require(
    './test/issuance/TestERC20Mintable.sol',
    ) as Truffle.Contract<TestERC20MintableInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('ERC20DividendableToken', (accounts) => {

    const [user1, user2, account1, account2] = accounts;

    let erc20dividendableToken: TestERC20DividendableTokenInstance;
    let erc20mintable1: TestERC20MintableInstance;
    let erc20mintable2: TestERC20MintableInstance;

    beforeEach(async () => {
        erc20dividendableToken = await TestERC20DividendableToken.new();
        erc20mintable1 = await TestERC20Mintable.new();
        erc20mintable2 = await TestERC20Mintable.new();
        await erc20mintable1.mint(user1, ether('100'));
        await erc20mintable2.mint(user2, ether('100'));
        await erc20dividendableToken.mint(account1, ether('40'));
        await erc20dividendableToken.mint(account2, ether('60'));
        await erc20mintable1.approve(erc20dividendableToken.address, ether('100'), { from: user1 });
        await erc20mintable2.approve(erc20dividendableToken.address, ether('100'), { from: user2 });
    });

    /**
     * @test {ERC20DividendableEth#updateAccount}
     */
    it('updateAccount can succesfully update an account', async () => {
        await erc20dividendableToken.increasePool(ether('20'), erc20mintable1.address, { from: user1 });
        await erc20dividendableToken.increasePool(ether('10'), erc20mintable2.address, { from: user2 });
        await erc20dividendableToken.updateAccount(account1, erc20mintable1.address);
        await erc20dividendableToken.updateAccount(account1, erc20mintable2.address);
        await erc20dividendableToken.updateAccount(account2, erc20mintable1.address);
        await erc20dividendableToken.updateAccount(account2, erc20mintable2.address);
        BN(await erc20mintable1.balanceOf(account1)).should.be.bignumber.equal(ether('8'));
        BN(await erc20mintable1.balanceOf(account2)).should.be.bignumber.equal(ether('12'));
        BN(await erc20mintable2.balanceOf(account1)).should.be.bignumber.equal(ether('4'));
        BN(await erc20mintable2.balanceOf(account2)).should.be.bignumber.equal(ether('6'));
    });

    /**
     * @test {ERC20DividendableEth#updateAccount}
     */
    it('more updateAccount usage, including a revert', async () => {
        await erc20dividendableToken.increasePool(ether('20'), erc20mintable1.address, { from: user1 });
        await erc20dividendableToken.increasePool(ether('10'), erc20mintable2.address, { from: user2 });
        await erc20dividendableToken.updateAccount(account1, erc20mintable1.address);
        await erc20dividendableToken.updateAccount(account1, erc20mintable2.address);
        BN(await erc20mintable1.balanceOf(account1)).should.be.bignumber.equal(ether('8'));
        BN(await erc20mintable2.balanceOf(account1)).should.be.bignumber.equal(ether('4'));
        await expectRevert(erc20dividendableToken.updateAccount(account1, erc20mintable1.address), 'Account need not be updated now for this dividend token.');
        await expectRevert(erc20dividendableToken.updateAccount(account1, erc20mintable2.address), 'Account need not be updated now for this dividend token.');
        await erc20dividendableToken.increasePool(ether('20'), erc20mintable1.address, { from: user1 });
        await erc20dividendableToken.increasePool(ether('10'), erc20mintable2.address, { from: user2 });
        await erc20dividendableToken.updateAccount(account2, erc20mintable1.address);
        await erc20dividendableToken.updateAccount(account2, erc20mintable2.address);
        BN(await erc20mintable1.balanceOf(account2)).should.be.bignumber.equal(ether('24'));
        BN(await erc20mintable2.balanceOf(account2)).should.be.bignumber.equal(ether('12'));
    });
});
