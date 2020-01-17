import { should } from 'chai';

// tslint:disable-next-line:no-var-requires
const { balance, BN, constants, ether, expectEvent, expectRevert, send } = require('@openzeppelin/test-helpers');

import { ERC20DividendableEthInstance } from '../../types/truffle-contracts';

const ERC20DividendableEth = artifacts.require(
    './token/ERC20DividendableEth.sol',
    ) as Truffle.Contract<ERC20DividendableEthInstance>;


should();

contract('ERC20DividendableEth', (accounts) => {

    const [user1, account1, account2] = accounts;

    let erc20dividendableEth: ERC20DividendableEthInstance;

    beforeEach(async () => {
        erc20dividendableEth = await ERC20DividendableEth.new();
        await erc20dividendableEth.mint(account1, ether('40'));
        await erc20dividendableEth.mint(account2, ether('60'));
    });

    /**
     * @test {ERC20DividendableEth#updateAccount}
     */
    it('updateAccount can succesfully update an account', async () => {
        const tracker1 = await balance.tracker(account1, 'ether');
        const tracker2 = await balance.tracker(account2, 'ether');
        await tracker1.get();
        await tracker2.get();
        await send.ether(user1, erc20dividendableEth.address, ether('10'));
        await erc20dividendableEth.updateAccount(account1);
        await erc20dividendableEth.updateAccount(account2);
        (await tracker1.delta()).should.be.bignumber.equal('4');
        (await tracker2.delta()).should.be.bignumber.equal('6');
    });

    /**
     * @test {ERC20DividendableEth#updateAccount}
     */
    it('more updateAccount usage, including a revert', async () => {
        const tracker1 = await balance.tracker(account1, 'ether');
        const tracker2 = await balance.tracker(account2, 'ether');
        await tracker1.get();
        await tracker2.get();
        await send.ether(user1, erc20dividendableEth.address, ether('10'));
        await erc20dividendableEth.updateAccount(account1);
        (await tracker1.delta()).should.be.bignumber.equal('4');
        await expectRevert(erc20dividendableEth.updateAccount(account1), 'Account need not be updated now.');
        await send.ether(user1, erc20dividendableEth.address, ether('10'));
        await erc20dividendableEth.updateAccount(account2);
        (await tracker2.delta()).should.be.bignumber.equal('12');
    });
});
