import { should } from 'chai';

// tslint:disable-next-line:no-var-requires
const { balance, BN, constants, ether, expectEvent, expectRevert, send } = require('@openzeppelin/test-helpers');

import { VentureEthInstance } from '../../../types/truffle-contracts';

const VentureEth = artifacts.require(
    'VentureEth.sol',
    ) as Truffle.Contract<VentureEthInstance>;


should();

contract('VentureEth - after issuance', (accounts) => {

    const [wallet, user1, investor1, investor2] = accounts;

    let ventureEth: VentureEthInstance;

    beforeEach(async () => {
        ventureEth = await VentureEth.new('VentureToken', 'VNT', 16);
        await ventureEth.setIssuePrice(ether('0.05'));
        await ventureEth.startIssuance();
        await ventureEth.invest({ from: investor1, value: ether('0.5').toString() });
        await ventureEth.invest({ from: investor2, value: ether('0.1').toString() });
        await ventureEth.startDistribution();
        (bytes32ToString(await ventureEth.currentState())).should.be.equal('LIVE');
        await ventureEth.claim({ from: investor1 });
        await ventureEth.claim({ from: investor2 });
        BN(await ventureEth.balanceOf(investor1)).should.be.bignumber.equal(ether('0.1'));
        BN(await ventureEth.balanceOf(investor2)).should.be.bignumber.equal(ether('0.02'));
        const tracker = await balance.tracker(wallet, 'wei');
        await tracker.get();
        await ventureEth.withdraw(wallet);
        BN(await tracker.delta()).should.be.bignumber.gte(ether('0.5')).and.bignumber.lte(ether('0.6'));
    });

    /**
     * @test {VentureEth#updateAccount} and {VentureEth#increasePool}
     */
    it('updateAccount can succesfully update an account', async () => {
        const tracker1 = await balance.tracker(investor1, 'ether');
        const tracker2 = await balance.tracker(investor2, 'ether');
        await tracker1.get();
        await tracker2.get();
        await ventureEth.increasePool({ from: user1, value: ether('6').toString()});
        await ventureEth.updateAccount(investor1);
        await ventureEth.updateAccount(investor2);
        (await tracker1.delta()).should.be.bignumber.equal('5');
        (await tracker2.delta()).should.be.bignumber.equal('1');
    });

    /**
     * @test {VentureEth#updateAccount} and {VentureEth#increasePool}
     */
    it('more updateAccount usage, including a revert', async () => {
        const tracker1 = await balance.tracker(investor1, 'ether');
        const tracker2 = await balance.tracker(investor2, 'ether');
        await tracker1.get();
        await tracker2.get();
        await ventureEth.increasePool({ from: user1, value: ether('6').toString()});
        await ventureEth.updateAccount(investor1);
        (await tracker1.delta()).should.be.bignumber.equal('5');
        await expectRevert(ventureEth.updateAccount(investor1), 'Account need not be updated now.');
        await ventureEth.increasePool({ from: user1, value: ether('6').toString()});
        await ventureEth.updateAccount(investor2);
        (await tracker2.delta()).should.be.bignumber.equal('2');
    });
});

function bytes32ToString(text: string) {
    return web3.utils.toAscii(text).replace(/\0/g, '');
}

