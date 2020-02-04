import * as chai from 'chai';
// tslint:disable-next-line:no-var-requires
const { balance, BN, ether, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
import { IssuanceInstance, TestERC20MintableInstance } from '../../types/truffle-contracts';

const Issuance = artifacts.require('Issuance') as Truffle.Contract<IssuanceInstance>;
const TestERC20Mintable = artifacts.require('TestERC20Mintable') as Truffle.Contract<TestERC20MintableInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('IssuanceToken', (accounts) => {

    const investor1 = accounts[1];
    const investor2 = accounts[2];
    const wallet = accounts[3];

    let issuance: IssuanceInstance;
    let currencyToken: TestERC20MintableInstance;
    let issuanceToken: TestERC20MintableInstance;

    beforeEach(async () => {
        currencyToken = await TestERC20Mintable.new();
        issuanceToken = await TestERC20Mintable.new();
        issuance = await Issuance.new(
            issuanceToken.address,
            currencyToken.address,
        );
        await issuanceToken.addMinter(issuance.address);
    });

    /**
     * @test {Issuance#openIssuance}
     */
    it('cannot open issuance without setting issue price', async () => {
        await expectRevert(
            issuance.openIssuance(),
            'Issue price not set.'
        );
    });

    /**
     * @test {Issuance#setIssuePrice}
     */
    it('cannot set issue price to be zero', async () => {
        await expectRevert(
            issuance.setIssuePrice(0),
            'Cannot set issuePrice to be zero.'
        );
    });

    /**
     * @test {Issuance#openIssuance}
     */
    it('openIssuance can succefully open the Issuance', async () => {
        await issuance.setIssuePrice(5);
        await issuance.openIssuance();
        bytes32ToString(await issuance.currentState()).should.be.equal('OPEN');
    });

    /**
     * @test {Issuance#invest}
     */
    it('invest should succesfully invest', async () => {
        await currencyToken.mint(investor1, ether('100'));
        await currencyToken.approve(issuance.address, ether('50'), { from: investor1 });
        await issuance.setIssuePrice(5);
        await issuance.openIssuance();
        expectEvent(
            await issuance.invest(ether('50'), { from: investor1 }),
            'InvestmentAdded',
            {
                investor: investor1,
                amount: ether('50')
            },
        );
    });

    /**
     * @test {Issuance#invest}
     */
    it('cannot invest if state is not "OPEN"', async () => {
        await currencyToken.mint(investor1, ether('100'));
        await currencyToken.approve(issuance.address, ether('50'), { from: investor1 });
        await issuance.setIssuePrice(5);
        await expectRevert(
            issuance.invest(ether('50'), { from: investor1 }),
            'Not open for investments.',
        );
    });

    /**
     * @test {Issuance#invest}
     */
    it('cannot invest with fractional investments', async () => {
        await currencyToken.mint(investor1, ether('100'));
        await currencyToken.approve(issuance.address, ether('50'), { from: investor1 });
        await issuance.setIssuePrice(5);
        await issuance.openIssuance();
        await expectRevert(
            issuance.invest(new BN('1000000000000000001'), { from: investor1 }),
            'Fractional investments not allowed.',
        );
    });

    /**
     * @test {Issuance#startDistribution}
     */
    it('startDistribution can succesfully close the Issuance', async () => {
        await currencyToken.mint(investor1, ether('100'));
        await currencyToken.mint(investor2, ether('50'));
        await currencyToken.approve(issuance.address, ether('50'), { from: investor1 });
        await currencyToken.approve(issuance.address, ether('10'), { from: investor2 });
        await issuance.setIssuePrice(5);
        await issuance.openIssuance();
        await issuance.invest(ether('50'), { from: investor1 });
        await issuance.invest(ether('10'), { from: investor2 });
        await issuance.startDistribution();
        bytes32ToString(await issuance.currentState()).should.be.equal('LIVE');
    });

    /**
     * @test {Issuance#claim}
     */
    it('claim sends tokens to investors', async () => {
        await currencyToken.mint(investor1, ether('100'));
        await currencyToken.mint(investor2, ether('50'));
        await currencyToken.approve(issuance.address, ether('50'), { from: investor1 });
        await currencyToken.approve(issuance.address, ether('10'), { from: investor2 });
        await issuance.setIssuePrice(5);
        await issuance.openIssuance();
        await issuance.invest(ether('50'), { from: investor1 });
        await issuance.invest(ether('10'), { from: investor2 });
        await issuance.startDistribution();
        bytes32ToString(await issuance.currentState()).should.be.equal('LIVE');
        await issuance.claim({ from: investor1 });
        await issuance.claim({ from: investor2 });
        web3.utils.fromWei(await issuanceToken.balanceOf(investor1), 'ether').should.be.equal('10');
        web3.utils.fromWei(await issuanceToken.balanceOf(investor2), 'ether').should.be.equal('2');
    });

    /**
     * @test {Issuance#claim}
     */
    it('claim sends tokens to investors, with negative issuePrice', async () => {
        await currencyToken.mint(investor1, ether('100'));
        await currencyToken.mint(investor2, ether('50'));
        await currencyToken.approve(issuance.address, ether('50'), { from: investor1 });
        await currencyToken.approve(issuance.address, ether('10'), { from: investor2 });
        await issuance.setIssuePrice(-5);
        await issuance.openIssuance();
        await issuance.invest(ether('50'), { from: investor1 });
        await issuance.invest(ether('10'), { from: investor2 });
        await issuance.startDistribution();
        bytes32ToString(await issuance.currentState()).should.be.equal('LIVE');
        await issuance.claim({ from: investor1 });
        await issuance.claim({ from: investor2 });
        web3.utils.fromWei(await issuanceToken.balanceOf(investor1), 'ether').should.be.equal('250');
        web3.utils.fromWei(await issuanceToken.balanceOf(investor2), 'ether').should.be.equal('50');
    });

    /**
     * @test {Issuance#claim}
     */
    it('cannot claim when state is not "LIVE"', async () => {
        await currencyToken.mint(investor1, ether('100'));
        await currencyToken.mint(investor2, ether('50'));
        await currencyToken.approve(issuance.address, ether('50'), { from: investor1 });
        await currencyToken.approve(issuance.address, ether('10'), { from: investor2 });
        await issuance.setIssuePrice(5);
        await issuance.openIssuance();
        await issuance.invest(ether('50'), { from: investor1 });
        await issuance.invest(ether('10'), { from: investor2 });
        await expectRevert(
            issuance.claim({ from: investor1 }),
            'Cannot claim now.',
        );
    });

    /**
     * @test {Issuance#claim}
     */
    it('cannot claim when not invested', async () => {
        await currencyToken.mint(investor1, ether('100'));
        await currencyToken.mint(investor2, ether('50'));
        await currencyToken.approve(issuance.address, ether('50'), { from: investor1 });
        await currencyToken.approve(issuance.address, ether('10'), { from: investor2 });
        await issuance.setIssuePrice(5);
        await issuance.openIssuance();
        await issuance.invest(ether('50'), { from: investor1 });
        await issuance.startDistribution();
        await expectRevert(
            issuance.claim({ from: investor2 }),
            'No investments found.',
        );
    });

    /**
     * @test {Issuance#cancelInvestment}
     */
    it('cancelInvestment should cancel an investor investments', async () => {
        await currencyToken.mint(investor1, ether('100'));
        await currencyToken.approve(issuance.address, ether('60'), { from: investor1 });
        await issuance.setIssuePrice(5);
        await issuance.openIssuance();
        await issuance.invest(ether('50'), { from: investor1 });
        await issuance.invest(ether('10'), { from: investor1 });
        expectEvent(
            await issuance.cancelInvestment({ from: investor1 }),
            'InvestmentCancelled',
            {
                investor: investor1,
                amount: ether('60'),
            },
        );
    });

    /**
     * @test {Issuance#cancelInvestment}
     */
    it('cannot cancel investment when state is not "OPEN" or "FAILED"', async () => {
        await currencyToken.mint(investor1, ether('100'));
        await currencyToken.approve(issuance.address, ether('60'), { from: investor1 });
        await issuance.setIssuePrice(5);
        await issuance.openIssuance();
        await issuance.invest(ether('50'), { from: investor1 });
        await issuance.invest(ether('10'), { from: investor1 });
        await issuance.startDistribution();
        await expectRevert(
            issuance.cancelInvestment({ from: investor1 }),
            'Cannot cancel now.',
        );
    });

    /**
     * @test {Issuance#cancelInvestment}
     */
    it('cannot cancel investment when not invested', async () => {
        await currencyToken.mint(investor1, ether('100'));
        await currencyToken.approve(issuance.address, ether('60'), { from: investor1 });
        await issuance.setIssuePrice(5);
        await issuance.openIssuance();
        await expectRevert(
            issuance.cancelInvestment({ from: investor1 }),
            'No investments found.',
        );
    });

    /**
     * @test {Issuance#cancelAllInvestments}
     */
    it('cancelAllInvestments should begin the process to cancel all investor investments', async () => {
        await currencyToken.mint(investor1, ether('100'));
        await currencyToken.mint(investor2, ether('50'));
        await currencyToken.approve(issuance.address, ether('50'), { from: investor1 });
        await currencyToken.approve(issuance.address, ether('10'), { from: investor2 });
        await issuance.setIssuePrice(5);
        await issuance.openIssuance();
        await issuance.invest(ether('50'), { from: investor1 });
        await issuance.invest(ether('10'), { from: investor2 });
        await issuance.cancelAllInvestments();
        bytes32ToString(await issuance.currentState()).should.be.equal('FAILED');
        await issuance.cancelInvestment({ from: investor1 });
        await issuance.cancelInvestment({ from: investor2 });
        web3.utils.fromWei(await currencyToken.balanceOf(investor1), 'ether').should.be.equal('100');
        web3.utils.fromWei(await currencyToken.balanceOf(investor2), 'ether').should.be.equal('50');
    });

    /**
     * @test {Issuance#withdraw}
     */
    it('withdraw should transfer all collected tokens to the wallet of the owner', async () => {
        await currencyToken.mint(investor1, ether('100'));
        await currencyToken.mint(investor2, ether('50'));
        await currencyToken.approve(issuance.address, ether('50'), { from: investor1 });
        await currencyToken.approve(issuance.address, ether('10'), { from: investor2 });
        await issuance.setIssuePrice(5);
        await issuance.openIssuance();
        await issuance.invest(ether('50'), { from: investor1 });
        await issuance.invest(ether('10'), { from: investor2 });
        await issuance.startDistribution();
        await issuance.claim({ from: investor1 });
        await issuance.claim({ from: investor2 });
        await issuance.withdraw(wallet);
        web3.utils.fromWei(await currencyToken.balanceOf(wallet), 'ether').should.be.equal('60');
    });

    /**
     * @test {Issuance#withdraw}
     */
    it('cannot transfer funds when issuance state is not "LIVE"', async () => {
        await issuance.setIssuePrice(5);
        await issuance.openIssuance();
        await expectRevert(
            issuance.withdraw(wallet),
            'Cannot transfer funds now.',
        );
    });
});

function bytes32ToString(text: string) {
    return web3.utils.toAscii(text).replace(/\0/g, '');
}
