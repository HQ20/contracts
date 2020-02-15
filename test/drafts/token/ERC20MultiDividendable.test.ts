import * as chai from 'chai';

// tslint:disable-next-line:no-var-requires
const { balance, BN, constants, ether, expectEvent, expectRevert, send } = require('@openzeppelin/test-helpers');

import { TestERC20MintableInstance, TestERC20MultiDividendableInstance } from '../../../types/truffle-contracts';

const TestERC20MultiDividendable = artifacts.require(
    'TestERC20MultiDividendable',
) as Truffle.Contract<TestERC20MultiDividendableInstance>;
const TestERC20Mintable = artifacts.require(
    'TestERC20Mintable',
) as Truffle.Contract<TestERC20MintableInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('ERC20DividendableToken', (accounts) => {

    const [user1, user2, account1, account2] = accounts;

    let dividendable: TestERC20MultiDividendableInstance;
    let mintable1: TestERC20MintableInstance;
    let mintable2: TestERC20MintableInstance;

    beforeEach(async () => {
        dividendable = await TestERC20MultiDividendable.new();
        mintable1 = await TestERC20Mintable.new();
        mintable2 = await TestERC20Mintable.new();
        await mintable1.mint(user1, ether('100'));
        await mintable2.mint(user2, ether('100'));
        await dividendable.mint(account1, ether('40'));
        await dividendable.mint(account2, ether('60'));
        await mintable1.approve(dividendable.address, ether('100'), { from: user1 });
        await mintable2.approve(dividendable.address, ether('100'), { from: user2 });
    });

    /**
     * @test {ERC20DividendableEth#updateAccount}
     */
    it('updateAccount can succesfully update an account', async () => {
        await dividendable.increasePool(ether('20'), mintable1.address, { from: user1 });
        await dividendable.increasePool(ether('10'), mintable2.address, { from: user2 });
        await dividendable.updateAccount(account1, mintable1.address);
        await dividendable.updateAccount(account1, mintable2.address);
        await dividendable.updateAccount(account2, mintable1.address);
        await dividendable.updateAccount(account2, mintable2.address);
        BN(await mintable1.balanceOf(account1)).should.be.bignumber.equal(ether('8'));
        BN(await mintable1.balanceOf(account2)).should.be.bignumber.equal(ether('12'));
        BN(await mintable2.balanceOf(account1)).should.be.bignumber.equal(ether('4'));
        BN(await mintable2.balanceOf(account2)).should.be.bignumber.equal(ether('6'));
    });

    /**
     * @test {ERC20DividendableEth#updateAccount}
     */
    it('more updateAccount usage, including a revert', async () => {
        await dividendable.increasePool(ether('20'), mintable1.address, { from: user1 });
        await dividendable.increasePool(ether('10'), mintable2.address, { from: user2 });
        await dividendable.updateAccount(account1, mintable1.address);
        await dividendable.updateAccount(account1, mintable2.address);
        BN(await mintable1.balanceOf(account1)).should.be.bignumber.equal(ether('8'));
        BN(await mintable2.balanceOf(account1)).should.be.bignumber.equal(ether('4'));
        await expectRevert(dividendable.updateAccount(account1, mintable1.address), 'Account need not be updated now for this dividend token.');
        await expectRevert(dividendable.updateAccount(account1, mintable2.address), 'Account need not be updated now for this dividend token.');
        await dividendable.increasePool(ether('20'), mintable1.address, { from: user1 });
        await dividendable.increasePool(ether('10'), mintable2.address, { from: user2 });
        await dividendable.updateAccount(account2, mintable1.address);
        await dividendable.updateAccount(account2, mintable2.address);
        BN(await mintable1.balanceOf(account2)).should.be.bignumber.equal(ether('24'));
        BN(await mintable2.balanceOf(account2)).should.be.bignumber.equal(ether('12'));
    });
});
