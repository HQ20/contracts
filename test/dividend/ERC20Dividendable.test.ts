import { should } from 'chai';

// tslint:disable-next-line:no-var-requires
const { balance, BN, constants, ether, expectEvent, expectRevert, send } = require('@openzeppelin/test-helpers');

import { TestERC20DividendableInstance } from '../../types/truffle-contracts';

const TestERC20Dividendable = artifacts.require(
    './test/dividend/TestERC20Dividendable.sol',
    ) as Truffle.Contract<TestERC20DividendableInstance>;


should();

contract('ERC20Dividendable', (accounts) => {

    const [user1, account1, account2] = accounts;

    let erc20dividendable: TestERC20DividendableInstance;

    beforeEach(async () => {
        erc20dividendable = await TestERC20Dividendable.new();
        await erc20dividendable.mint(account1, ether('40'));
        await erc20dividendable.mint(account2, ether('60'));
    });

    /**
     * @test {ERC20Dividendable#updateAccount}
     */
    it('updateAccount can succesfully update an account', async () => {
        const tracker1 = await balance.tracker(account1, 'ether');
        const tracker2 = await balance.tracker(account2, 'ether');
        await tracker1.get();
        await tracker2.get();
        await send.ether(user1, erc20dividendable.address, ether('10'));
        await erc20dividendable.updateAccount(account1);
        await erc20dividendable.updateAccount(account2);
        (await tracker1.delta()).should.be.bignumber.equal('4');
        (await tracker2.delta()).should.be.bignumber.equal('6');
    });

    /**
     * @test {ERC20Dividendable#updateAccount}
     */
    it('more updateAccount usage, including a revert', async () => {
        const tracker1 = await balance.tracker(account1, 'ether');
        const tracker2 = await balance.tracker(account2, 'ether');
        await tracker1.get();
        await tracker2.get();
        await send.ether(user1, erc20dividendable.address, ether('10'));
        await erc20dividendable.updateAccount(account1);
        (await tracker1.delta()).should.be.bignumber.equal('4');
        await expectRevert(erc20dividendable.updateAccount(account1), 'Account need not be updated now.');
        await send.ether(user1, erc20dividendable.address, ether('10'));
        await erc20dividendable.updateAccount(account2);
        (await tracker2.delta()).should.be.bignumber.equal('12');
    });
});
