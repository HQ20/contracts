import { BigNumber } from 'bignumber.js';
import { should } from 'chai';
import { IssuanceInstance, TestERC20MintableInstance } from '../../types/truffle-contracts';

const Issuance = artifacts.require(
    './drafts/issuance/Issuance.sol',
    ) as Truffle.Contract<IssuanceInstance>;
const TestERC20Mintable = artifacts.require(
        './test/issuance/TestERC20Mintable.sol',
    ) as Truffle.Contract<TestERC20MintableInstance>;

should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../utils');

contract('Issuance', (accounts) => {

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
        await issuance.setIssuePrice(5);
    });

    /**
     * @test {Issuance#invest}
     */
    itShouldThrow('cannot open issuance without issue price', async () => {
        await issuance.setIssuePrice(0);
        await issuance.openIssuance();
    }, 'Issue price not set.');

    /**
     * @test {Issuance#openIssuance}
     */
    it('openIssuance can succefully open the Issuance', async () => {
        await issuance.openIssuance();
        bytes32ToString(await issuance.currentState()).should.be.equal('OPEN');
    });

    /**
     * @test {Issuance#invest}
     */
    it('invest should succesfully invest', async () => {
        await currencyToken.mint(investor1, new BigNumber(100e18));
        await currencyToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await issuance.openIssuance();
        const event = (await issuance.invest(new BigNumber(50e18), { from: investor1 })).logs[0];
        event.event.should.be.equal('InvestmentAdded');
        event.args.investor.should.be.equal(investor1);
        web3.utils.fromWei(event.args.amount, 'ether').should.be.equal('50');
    });

    /**
     * @test {Issuance#invest}
     */
    itShouldThrow('cannot invest if state is not "OPEN"', async () => {
        await currencyToken.mint(investor1, new BigNumber(100e18));
        await currencyToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await issuance.invest(new BigNumber(50e18), { from: investor1 });
    }, 'Not open for investments.');

    /**
     * @test {Issuance#invest}
     */
    itShouldThrow('cannot invest with fractional investments', async () => {
        await currencyToken.mint(investor1, new BigNumber(100e18));
        await currencyToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await issuance.openIssuance();
        await issuance.invest(new BigNumber('1000000000000000001'), { from: investor1 });
    }, 'Fractional investments not allowed.');

    /**
     * @test {Issuance#startDistribution}
     */
    it('startDistribution can succesfully close the Issuance', async () => {
        await currencyToken.mint(investor1, new BigNumber(100e18));
        await currencyToken.mint(investor2, new BigNumber(50e18));
        await currencyToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await currencyToken.approve(issuance.address, new BigNumber(10e18), { from: investor2 });
        await issuance.openIssuance();
        await issuance.invest(new BigNumber(50e18), { from: investor1 });
        await issuance.invest(new BigNumber(10e18), { from: investor2 });
        await issuance.startDistribution();
        bytes32ToString(await issuance.currentState()).should.be.equal('LIVE');
    });

    /**
     * @test {Issuance#withdraw}
     */
    it('withdraw sends tokens to investors', async () => {
        await currencyToken.mint(investor1, new BigNumber(100e18));
        await currencyToken.mint(investor2, new BigNumber(50e18));
        await currencyToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await currencyToken.approve(issuance.address, new BigNumber(10e18), { from: investor2 });
        await issuance.openIssuance();
        await issuance.invest(new BigNumber(50e18), { from: investor1 });
        await issuance.invest(new BigNumber(10e18), { from: investor2 });
        await issuance.startDistribution();
        bytes32ToString(await issuance.currentState()).should.be.equal('LIVE');
        await issuance.withdraw({ from: investor1 });
        await issuance.withdraw({ from: investor2 });
        web3.utils.fromWei(await issuanceToken.balanceOf(investor1), 'ether').should.be.equal('10');
        web3.utils.fromWei(await issuanceToken.balanceOf(investor2), 'ether').should.be.equal('2');
    });

    /**
     * @test {Issuance#withdraw}
     */
    itShouldThrow('cannot withdraw when state is not "LIVE"', async () => {
        await currencyToken.mint(investor1, new BigNumber(100e18));
        await currencyToken.mint(investor2, new BigNumber(50e18));
        await currencyToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await currencyToken.approve(issuance.address, new BigNumber(10e18), { from: investor2 });
        await issuance.openIssuance();
        await issuance.invest(new BigNumber(50e18), { from: investor1 });
        await issuance.invest(new BigNumber(10e18), { from: investor2 });
        await issuance.withdraw({ from: investor1 });
    }, 'Cannot withdraw now.');

    /**
     * @test {Issuance#withdraw}
     */
    itShouldThrow('cannot withdraw when not invested', async () => {
        await currencyToken.mint(investor1, new BigNumber(100e18));
        await currencyToken.mint(investor2, new BigNumber(50e18));
        await currencyToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await currencyToken.approve(issuance.address, new BigNumber(10e18), { from: investor2 });
        await issuance.openIssuance();
        await issuance.invest(new BigNumber(50e18), { from: investor1 });
        await issuance.startDistribution();
        await issuance.withdraw({ from: investor2 });
    }, 'No investments found.');

    /**
     * @test {Issuance#cancelInvestment}
     */
    it('cancelInvestment should cancel an investor investments', async () => {
        await currencyToken.mint(investor1, new BigNumber(100e18));
        await currencyToken.approve(issuance.address, new BigNumber(60e18), { from: investor1 });
        await issuance.openIssuance();
        await issuance.invest(new BigNumber(50e18), { from: investor1 });
        await issuance.invest(new BigNumber(10e18), { from: investor1 });
        const event = (await issuance.cancelInvestment({ from: investor1 })).logs[0];
        event.event.should.be.equal('InvestmentCancelled');
        event.args.investor.should.be.equal(investor1);
        web3.utils.fromWei(event.args.amount, 'ether').should.be.equal('60');
    });

    /**
     * @test {Issuance#cancelInvestment}
     */
    itShouldThrow('cannot cancel investment when state is not "OPEN" or "FAILED"', async () => {
        await currencyToken.mint(investor1, new BigNumber(100e18));
        await currencyToken.approve(issuance.address, new BigNumber(60e18), { from: investor1 });
        await issuance.openIssuance();
        await issuance.invest(new BigNumber(50e18), { from: investor1 });
        await issuance.invest(new BigNumber(10e18), { from: investor1 });
        await issuance.startDistribution();
        await issuance.cancelInvestment({ from: investor1 });
    }, 'Cannot cancel now.');

    /**
     * @test {Issuance#cancelInvestment}
     */
    itShouldThrow('cannot cancel investment when not invested', async () => {
        await currencyToken.mint(investor1, new BigNumber(100e18));
        await currencyToken.approve(issuance.address, new BigNumber(60e18), { from: investor1 });
        await issuance.openIssuance();
        await issuance.cancelInvestment({ from: investor1 });
    }, 'No investments found.');

    /**
     * @test {Issuance#cancelAllInvestments}
     */
    it('cancelAllInvestments should begin the process to cancel all investor investments', async () => {
        await currencyToken.mint(investor1, new BigNumber(100e18));
        await currencyToken.mint(investor2, new BigNumber(50e18));
        await currencyToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await currencyToken.approve(issuance.address, new BigNumber(10e18), { from: investor2 });
        await issuance.openIssuance();
        await issuance.invest(new BigNumber(50e18), { from: investor1 });
        await issuance.invest(new BigNumber(10e18), { from: investor2 });
        await issuance.cancelAllInvestments();
        bytes32ToString(await issuance.currentState()).should.be.equal('FAILED');
        await issuance.cancelInvestment({ from: investor1 });
        await issuance.cancelInvestment({ from: investor2 });
        web3.utils.fromWei(await currencyToken.balanceOf(investor1), 'ether').should.be.equal('100');
        web3.utils.fromWei(await currencyToken.balanceOf(investor2), 'ether').should.be.equal('50');
    });

    /**
     * @test {Issuance#transferFunds}
     */
    it('transferFunds should transfer all collected tokens to the wallet of the owner', async () => {
        await currencyToken.mint(investor1, new BigNumber(100e18));
        await currencyToken.mint(investor2, new BigNumber(50e18));
        await currencyToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await currencyToken.approve(issuance.address, new BigNumber(10e18), { from: investor2 });
        await issuance.openIssuance();
        await issuance.invest(new BigNumber(50e18), { from: investor1 });
        await issuance.invest(new BigNumber(10e18), { from: investor2 });
        await issuance.startDistribution();
        await issuance.withdraw({ from: investor1 });
        await issuance.withdraw({ from: investor2 });
        await issuance.transferFunds(wallet);
        web3.utils.fromWei(await currencyToken.balanceOf(wallet), 'ether').should.be.equal('60');
    });

    /**
     * @test {Issuance#transferFunds}
     */
    itShouldThrow('cannot transfer funds when issuance state is not "LIVE"', async () => {
        await issuance.openIssuance();
        await issuance.transferFunds(wallet);
    }, 'Cannot transfer funds now.');
});

function bytes32ToString(text: string) {
    return web3.utils.toAscii(text).replace(/\0/g, '');
}
