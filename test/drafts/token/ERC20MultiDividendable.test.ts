import * as chai from 'chai';

// tslint:disable-next-line:no-var-requires
const { balance, BN, constants, ether, expectEvent, expectRevert, send } = require('@openzeppelin/test-helpers');

import { ERC20MintableInstance, TestERC20MultiDividendableInstance } from '../../../types/truffle-contracts';

const TestERC20MultiDividendable = artifacts.require(
    'TestERC20MultiDividendable',
) as Truffle.Contract<TestERC20MultiDividendableInstance>;
const ERC20Mintable = artifacts.require(
    'ERC20Mintable',
) as Truffle.Contract<ERC20MintableInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('ERC20DividendableToken', (accounts) => {

    const [user1, user2, account1, account2] = accounts;

    let dividendable: TestERC20MultiDividendableInstance;
    let mintable1: ERC20MintableInstance;
    let mintable2: ERC20MintableInstance;

    beforeEach(async () => {
        dividendable = await TestERC20MultiDividendable.new('MultiDividendableToken', 'MDT', 19);
        mintable1 = await ERC20Mintable.new('Name', 'Symbol', 0);
        mintable2 = await ERC20Mintable.new('Name', 'Symbol', 0);
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
        await dividendable.releaseDividends(ether('20'), mintable1.address, { from: user1 });
        await dividendable.releaseDividends(ether('10'), mintable2.address, { from: user2 });
        await dividendable.claimDividends(account1, mintable1.address);
        await dividendable.claimDividends(account1, mintable2.address);
        await dividendable.claimDividends(account2, mintable1.address);
        await dividendable.claimDividends(account2, mintable2.address);
        BN(await mintable1.balanceOf(account1)).should.be.bignumber.equal(ether('8'));
        BN(await mintable1.balanceOf(account2)).should.be.bignumber.equal(ether('12'));
        BN(await mintable2.balanceOf(account1)).should.be.bignumber.equal(ether('4'));
        BN(await mintable2.balanceOf(account2)).should.be.bignumber.equal(ether('6'));
    });

    /**
     * @test {ERC20DividendableEth#updateAccount}
     */
    it('more updateAccount usage, including a revert', async () => {
        await dividendable.releaseDividends(ether('20'), mintable1.address, { from: user1 });
        await dividendable.releaseDividends(ether('10'), mintable2.address, { from: user2 });
        await dividendable.claimDividends(account1, mintable1.address);
        await dividendable.claimDividends(account1, mintable2.address);
        BN(await mintable1.balanceOf(account1)).should.be.bignumber.equal(ether('8'));
        BN(await mintable2.balanceOf(account1)).should.be.bignumber.equal(ether('4'));
        await expectRevert(dividendable.claimDividends(account1, mintable1.address), 'Account need not be updated now for this dividend token.');
        await expectRevert(dividendable.claimDividends(account1, mintable2.address), 'Account need not be updated now for this dividend token.');
        await dividendable.releaseDividends(ether('20'), mintable1.address, { from: user1 });
        await dividendable.releaseDividends(ether('10'), mintable2.address, { from: user2 });
        await dividendable.claimDividends(account2, mintable1.address);
        await dividendable.claimDividends(account2, mintable2.address);
        BN(await mintable1.balanceOf(account2)).should.be.bignumber.equal(ether('24'));
        BN(await mintable2.balanceOf(account2)).should.be.bignumber.equal(ether('12'));
    });
});
