import { should } from 'chai';

// tslint:disable-next-line:no-var-requires
const { balance, BN, constants, ether, expectEvent, expectRevert, send } = require('@openzeppelin/test-helpers');

import { TestDividendableERC20Instance } from '../../../types/truffle-contracts';

const TestDividendableERC20 = artifacts.require(
    './test/drafts/dividend/TestDividendableERC20.sol',
    ) as Truffle.Contract<TestDividendableERC20Instance>;


should();

contract('DividenableERC20', (accounts) => {

    const [user1, account1, account2] = accounts;

    let dividendableERC20: TestDividendableERC20Instance;

    beforeEach(async () => {
        dividendableERC20 = await TestDividendableERC20.new();
        await dividendableERC20.mint(account1, ether('40'));
        await dividendableERC20.mint(account2, ether('60'));
    });

    /**
     * @test {DividendableERC20#updateAccount}
     */
    it('updateAccount can succesfully update an account', async () => {
        const tracker1 = await balance.tracker(account1, 'ether');
        const tracker2 = await balance.tracker(account2, 'ether');
        await tracker1.get();
        await tracker2.get();
        await send.ether(user1, dividendableERC20.address, ether('10'));
        await dividendableERC20.updateAccount(account1);
        await dividendableERC20.updateAccount(account2);
        (await tracker1.delta()).should.be.bignumber.equal('4');
        (await tracker2.delta()).should.be.bignumber.equal('6');
    });

    /**
     * @test {DividendableERC20#updateAccount}
     */
    it('more updateAccount usage, including a revert', async () => {
        const tracker1 = await balance.tracker(account1, 'ether');
        const tracker2 = await balance.tracker(account2, 'ether');
        await tracker1.get();
        await tracker2.get();
        await send.ether(user1, dividendableERC20.address, ether('10'));
        await dividendableERC20.updateAccount(account1);
        (await tracker1.delta()).should.be.bignumber.equal('4');
        await expectRevert(dividendableERC20.updateAccount(account1), 'Account need not be updated now.');
        await send.ether(user1, dividendableERC20.address, ether('10'));
        await dividendableERC20.updateAccount(account2);
        (await tracker2.delta()).should.be.bignumber.equal('12');
    });
});
