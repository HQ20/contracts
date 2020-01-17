import * as chai from 'chai';
// tslint:disable-next-line:no-var-requires
const { balance, BN, constants, ether, expectEvent, expectRevert, send } = require('@openzeppelin/test-helpers');
import { IssuanceEthInstance, TestERC20MintableInstance } from '../../types/truffle-contracts';

const IssuanceEth = artifacts.require(
    './issuance/IssuanceEth.sol',
    ) as Truffle.Contract<IssuanceEthInstance>;
const TestERC20Mintable = artifacts.require(
        './test/issuance/TestERC20Mintable.sol',
    ) as Truffle.Contract<TestERC20MintableInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('IssuanceEth', (accounts) => {

    const investor1 = accounts[1];
    const investor2 = accounts[2];
    const wallet = accounts[3];

    let issuanceEth: IssuanceEthInstance;
    let issuanceToken: TestERC20MintableInstance;

    beforeEach(async () => {
        issuanceToken = await TestERC20Mintable.new();
        issuanceEth = await IssuanceEth.new(issuanceToken.address);
        await issuanceToken.addMinter(issuanceEth.address);
        await issuanceEth.setIssuePrice(5);
    });

    /**
     * @test {Issuance#invest}
     */
    it('cannot open issuanceEth without issue price', async () => {
        await issuanceEth.setIssuePrice(0);
        await expectRevert(issuanceEth.openIssuance(), 'Issue price not set.');
    });

    /**
     * @test {Issuance#openIssuance}
     */
    it('openIssuance can succefully open the Issuance', async () => {
        await issuanceEth.openIssuance();
        chai.expect(bytes32ToString(await issuanceEth.currentState())).to.be.equal('OPEN');
    });

    /**
     * @test {Issuance#invest}
     */
    it('invest should succesfully invest', async () => {
        await issuanceEth.openIssuance();
        expectEvent(
            await send.ether(investor1, issuanceEth.address, ether('50')),
            'InvestmentAdded',
            {
                investor: investor1,
                amount: ether('5'),
            },
        );
    });

    /**
     * @test {Issuance#invest}
     */
    it('cannot invest if state is not "OPEN"', async () => {
        await expectRevert(
            send.ether(investor1, issuanceEth.address, ether('50')),
            'Not open for investments.',
        );
    });

    /**
     * @test {Issuance#invest}
     */
    it('cannot invest with fractional investments', async () => {
        await issuanceEth.openIssuance();
        await expectRevert(
            send.ether(investor1, issuanceEth.address, ether('1').add(BN(1))),
            'Fractional investments not allowed.',
        );
    });

    /**
     * @test {Issuance#startDistribution}
     */
    it('startDistribution can succesfully close the Issuance', async () => {
        await issuanceEth.openIssuance();
        await send.ether(investor1, issuanceEth.address, ether('50'));
        await send.ether(investor2, issuanceEth.address, ether('10'));
        await issuanceEth.startDistribution();
        chai.expect(bytes32ToString(await issuanceEth.currentState())).to.be.equal('LIVE');
    });

    /**
     * @test {Issuance#withdraw}
     */
    it('withdraw sends tokens to investors', async () => {
        await issuanceEth.openIssuance();
        await send.ether(investor1, issuanceEth.address, ether('50'));
        await send.ether(investor2, issuanceEth.address, ether('10'));
        await issuanceEth.startDistribution();
        chai.expect(bytes32ToString(await issuanceEth.currentState())).to.be.equal('LIVE');
        await issuanceEth.withdraw({ from: investor1 });
        await issuanceEth.withdraw({ from: investor2 });
        BN(await issuanceToken.balanceOf(investor1)).should.be.bignumber.equal(ether('10'));
        BN(await issuanceToken.balanceOf(investor2)).should.be.equal(ether('2'));
    });

    /**
     * @test {Issuance#withdraw}
     */
    it('cannot withdraw when state is not "LIVE"', async () => {
        await issuanceEth.openIssuance();
        await send.ether(investor1, issuanceEth.address, ether('50'));
        await send.ether(investor2, issuanceEth.address, ether('10'));
        await expectRevert(
            await issuanceEth.withdraw({ from: investor1 }),
            'Cannot withdraw now.',
        );
    });

    /**
     * @test {Issuance#withdraw}
     */
    it('cannot withdraw when not invested', async () => {
        await issuanceEth.openIssuance();
        await send.ether(investor1, issuanceEth.address, ether('50'));
        await issuanceEth.startDistribution();
        await expectRevert(
            issuanceEth.withdraw({ from: investor2 }),
            'No investments found.',
        );
    });

    /**
     * @test {Issuance#cancelInvestment}
     */
    it('cancelInvestment should cancel an investor investments', async () => {
        await issuanceEth.openIssuance();
        await send.ether(investor1, issuanceEth.address, ether('50'));
        await send.ether(investor2, issuanceEth.address, ether('10'));
        expectEvent(
            await issuanceEth.cancelInvestment({ from: investor1 }),
            'InvestmentCancelled',
            {
                investor: investor1,
                amount: ether('60'),
            }
        );
    });

    /**
     * @test {Issuance#cancelInvestment}
     */
    it('cannot cancel investment when state is not "OPEN" or "FAILED"', async () => {
        await issuanceEth.openIssuance();
        await send.ether(investor1, issuanceEth.address, ether('50'));
        await send.ether(investor2, issuanceEth.address, ether('10'));
        await issuanceEth.startDistribution();
        await expectRevert(
            issuanceEth.cancelInvestment({ from: investor1 }),
            'Cannot cancel now.',
        );
    });

    /**
     * @test {Issuance#cancelInvestment}
     */
    it('cannot cancel investment when not invested', async () => {
        await issuanceEth.openIssuance();
        await expectRevert(
            issuanceEth.cancelInvestment({ from: investor1 }),
            'No investments found.',
        );
    });

    /**
     * @test {Issuance#cancelAllInvestments}
     */
    it('cancelAllInvestments should begin the process to cancel all investor investments', async () => {
        await issuanceEth.openIssuance();
        await send.ether(investor1, issuanceEth.address, ether('50'));
        await send.ether(investor2, issuanceEth.address, ether('10'));
        await issuanceEth.cancelAllInvestments();
        bytes32ToString(await issuanceEth.currentState()).should.be.equal('FAILED');
        await issuanceEth.cancelInvestment({ from: investor1 });
        await issuanceEth.cancelInvestment({ from: investor2 });
        BN(await balance.current(investor1)).should.be.bignumber.equal(ether('100'));
        BN(await balance.current(investor2)).should.be.bignumber.equal(ether('50'));
    });

    /**
     * @test {Issuance#transferFunds}
     */
    it('transferFunds should transfer all collected tokens to the wallet of the owner', async () => {
        await issuanceEth.openIssuance();
        await send.ether(investor1, issuanceEth.address, ether('50'));
        await send.ether(investor2, issuanceEth.address, ether('10'));
        await issuanceEth.startDistribution();
        await issuanceEth.withdraw({ from: investor1 });
        await issuanceEth.withdraw({ from: investor2 });
        await issuanceEth.transferFunds(wallet);
        BN(await balance.current(wallet)).should.be.bignumber.equal(ether('60'));
    });

    /**
     * @test {Issuance#transferFunds}
     */
    it('cannot transfer funds when issuanceEth state is not "LIVE"', async () => {
        await issuanceEth.openIssuance();
        await expectRevert(
            issuanceEth.transferFunds(wallet),
            'Cannot transfer funds now.',
        );
    });
});

function bytes32ToString(text: string) {
    return web3.utils.toAscii(text).replace(/\0/g, '');
}
