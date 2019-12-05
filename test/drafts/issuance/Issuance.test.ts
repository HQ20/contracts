import { BigNumber } from 'bignumber.js';
import { should } from 'chai';
import { IssuanceInstance } from '../../../types/truffle-contracts';
import { IssuanceTokenInstance } from '../../../types/truffle-contracts';

const Issuance = artifacts.require('./state/Issuance.sol') as Truffle.Contract<IssuanceInstance>;
const IssuanceToken = artifacts.require('./issuance/IssuanceToken.sol') as Truffle.Contract<IssuanceTokenInstance>;

should();

import helper = require('ganache-time-traveler');
// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../../utils');

contract('Issuance', (accounts) => {
    let snapshotId: any;

    const investor1 = accounts[1];
    const investor2 = accounts[2];

    let issuance: IssuanceInstance;
    let acceptedToken: IssuanceTokenInstance;

    const acceptedTokenName = 'AcceptedToken';
    const acceptedTokenSymbol = 'ACT';
    const acceptedTokenDecimals = 18;

    const issuanceTokenName = 'IssuanceToken';
    const issuanceTokenSymbol = 'IST';
    const issuanceTokenDecimals = 18;

    beforeEach(async () => {
        const snapShot = await helper.takeSnapshot();
        snapshotId = snapShot.result;
        // We are using IssuanceToken also as a test instantiator for the accepted token
        acceptedToken = await IssuanceToken.new(acceptedTokenName, acceptedTokenSymbol, acceptedTokenDecimals);
        issuance = await Issuance.new(
            issuanceTokenName,
            issuanceTokenSymbol,
            issuanceTokenDecimals,
            acceptedToken.address,
        );
        await issuance.setIssuePrice(5);
        await issuance.setOpeningDate(Math.floor((new Date()).getTime() / 1000) - 3600);
        await issuance.setClosingDate(Math.floor((new Date()).getTime() / 1000) + 3600);
        await issuance.setSoftCap(new BigNumber(50e18));
        await issuance.setMinInvestment(new BigNumber(10e18));
    });

    afterEach(async  () => {
        await helper.revertToSnapshot(snapshotId);
    });

    /**
     * @test {Issuance#openIssuance}
     */
    it('openIssuance can succefully open the Issuance', async () => {
        await issuance.openIssuance();
        bytes32ToString(await issuance.currentState()).should.be.equal('OPEN');
    });

    /**
     * @test {Issuance#openIssuance}
     */
    itShouldThrow('cannot open issuance outside allotted timeframe', async () => {
        await helper.advanceTimeAndBlock(4000);
        await issuance.openIssuance();
    }, 'Not the right time.');

    /**
     * @test {Issuance#invest}
     */
    it('invest should succesfully invest', async () => {
        await acceptedToken.mint(investor1, new BigNumber(100e18));
        await acceptedToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
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
        await acceptedToken.mint(investor1, new BigNumber(100e18));
        await acceptedToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await issuance.invest(new BigNumber(50e18), { from: investor1 });
    }, 'Not open for investments.');

    /**
     * @test {Issuance#invest}
     */
    itShouldThrow('cannot invest outisde allotted timespan', async () => {
        await acceptedToken.mint(investor1, new BigNumber(100e18));
        await acceptedToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await issuance.openIssuance();
        await helper.advanceTimeAndBlock(4000);
        await issuance.invest(new BigNumber(50e18), { from: investor1 });
    }, 'Not the right time.');

    /**
     * @test {Issuance#invest}
     */
    itShouldThrow('cannot invest with fractional investments', async () => {
        await acceptedToken.mint(investor1, new BigNumber(100e18));
        await acceptedToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await issuance.openIssuance();
        await issuance.invest(new BigNumber(13e18), { from: investor1 });
    }, 'Fractional investments not allowed.');

    /**
     * @test {Issuance#invest}
     */
    itShouldThrow('cannot invest with investment below minimum threshold', async () => {
        await acceptedToken.mint(investor1, new BigNumber(100e18));
        await acceptedToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await issuance.openIssuance();
        await issuance.invest(new BigNumber(5e18), { from: investor1 });
    }, 'Investment below minimum threshold.');

    /**
     * @test {Issuance#startDistribution}
     */
    it('startDistribution can succesfully close the Issuance', async () => {
        await acceptedToken.mint(investor1, new BigNumber(100e18));
        await acceptedToken.mint(investor2, new BigNumber(50e18));
        await acceptedToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await acceptedToken.approve(issuance.address, new BigNumber(10e18), { from: investor2 });
        await issuance.openIssuance();
        await issuance.invest(new BigNumber(50e18), { from: investor1 });
        await issuance.invest(new BigNumber(10e18), { from: investor2 });
        await helper.advanceTimeAndBlock(4000);
        await issuance.startDistribution();
        bytes32ToString(await issuance.currentState()).should.be.equal('LIVE');
    });

    /**
     * @test {Issuance#startDistribution}
     */
    itShouldThrow('cannot start distribution before closing time', async () => {
        await acceptedToken.mint(investor1, new BigNumber(100e18));
        await acceptedToken.mint(investor2, new BigNumber(50e18));
        await acceptedToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await acceptedToken.approve(issuance.address, new BigNumber(10e18), { from: investor2 });
        await issuance.openIssuance();
        await issuance.invest(new BigNumber(50e18), { from: investor1 });
        await issuance.invest(new BigNumber(10e18), { from: investor2 });
        await issuance.startDistribution();
    }, 'Not the right time yet.');

    /**
     * @test {Issuance#startDistribution}
     */
    itShouldThrow('cannot start distribution when soft cap not reached', async () => {
        await acceptedToken.mint(investor1, new BigNumber(100e18));
        await acceptedToken.mint(investor2, new BigNumber(50e18));
        await acceptedToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await acceptedToken.approve(issuance.address, new BigNumber(10e18), { from: investor2 });
        await issuance.openIssuance();
        await issuance.invest(new BigNumber(10e18), { from: investor1 });
        await issuance.invest(new BigNumber(10e18), { from: investor2 });
        await helper.advanceTimeAndBlock(4000);
        await issuance.startDistribution();
    }, 'Not enough funds collected.');

    /**
     * @test {Issuance#withdraw}
     */
    it('withdraw sends tokens to investors', async () => {
        await acceptedToken.mint(investor1, new BigNumber(100e18));
        await acceptedToken.mint(investor2, new BigNumber(50e18));
        await acceptedToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await acceptedToken.approve(issuance.address, new BigNumber(10e18), { from: investor2 });
        await issuance.openIssuance();
        await issuance.invest(new BigNumber(50e18), { from: investor1 });
        await issuance.invest(new BigNumber(10e18), { from: investor2 });
        await helper.advanceTimeAndBlock(4000);
        await issuance.startDistribution();
        bytes32ToString(await issuance.currentState()).should.be.equal('LIVE');
        await issuance.withdraw({ from: investor1 });
        await issuance.withdraw({ from: investor2 });
        const issuanceToken = await IssuanceToken.at(await issuance.issuanceToken());
        web3.utils.fromWei(await issuanceToken.balanceOf(investor1), 'ether').should.be.equal('10');
        web3.utils.fromWei(await issuanceToken.balanceOf(investor2), 'ether').should.be.equal('2');
    });

    /**
     * @test {Issuance#withdraw}
     */
    itShouldThrow('cannot withdraw when state is not "LIVE"', async () => {
        await acceptedToken.mint(investor1, new BigNumber(100e18));
        await acceptedToken.mint(investor2, new BigNumber(50e18));
        await acceptedToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await acceptedToken.approve(issuance.address, new BigNumber(10e18), { from: investor2 });
        await issuance.openIssuance();
        await issuance.invest(new BigNumber(50e18), { from: investor1 });
        await issuance.invest(new BigNumber(10e18), { from: investor2 });
        await helper.advanceTimeAndBlock(4000);
        await issuance.withdraw({ from: investor1 });
    }, 'Cannot withdraw now.');

    /**
     * @test {Issuance#withdraw}
     */
    itShouldThrow('cannot withdraw when not invested', async () => {
        await acceptedToken.mint(investor1, new BigNumber(100e18));
        await acceptedToken.mint(investor2, new BigNumber(50e18));
        await acceptedToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await acceptedToken.approve(issuance.address, new BigNumber(10e18), { from: investor2 });
        await issuance.openIssuance();
        await issuance.invest(new BigNumber(50e18), { from: investor1 });
        await helper.advanceTimeAndBlock(4000);
        await issuance.startDistribution();
        await issuance.withdraw({ from: investor2 });
    }, 'No investments found.');

    /**
     * @test {Issuance#cancelInvestment}
     */
    it('cancelInvestment should cancel an investor investments', async () => {
        await acceptedToken.mint(investor1, new BigNumber(100e18));
        await acceptedToken.approve(issuance.address, new BigNumber(60e18), { from: investor1 });
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
        await acceptedToken.mint(investor1, new BigNumber(100e18));
        await acceptedToken.approve(issuance.address, new BigNumber(60e18), { from: investor1 });
        await issuance.openIssuance();
        await issuance.invest(new BigNumber(50e18), { from: investor1 });
        await issuance.invest(new BigNumber(10e18), { from: investor1 });
        await helper.advanceTimeAndBlock(4000);
        await issuance.startDistribution();
        await issuance.cancelInvestment({ from: investor1 });
    }, 'Cannot cancel now.');

    /**
     * @test {Issuance#cancelInvestment}
     */
    itShouldThrow('cannot cancel investment when not invested', async () => {
        await acceptedToken.mint(investor1, new BigNumber(100e18));
        await acceptedToken.approve(issuance.address, new BigNumber(60e18), { from: investor1 });
        await issuance.openIssuance();
        await issuance.cancelInvestment({ from: investor1 });
    }, 'No investments found.');

    /**
     * @test {Issuance#cancelAllInvestments}
     */
    it('cancelAllInvestments should begin the process to cancel all investor investments', async () => {
        await acceptedToken.mint(investor1, new BigNumber(100e18));
        await acceptedToken.mint(investor2, new BigNumber(50e18));
        await acceptedToken.approve(issuance.address, new BigNumber(50e18), { from: investor1 });
        await acceptedToken.approve(issuance.address, new BigNumber(10e18), { from: investor2 });
        await issuance.openIssuance();
        await issuance.invest(new BigNumber(50e18), { from: investor1 });
        await issuance.invest(new BigNumber(10e18), { from: investor2 });
        await issuance.cancelAllInvestments();
        bytes32ToString(await issuance.currentState()).should.be.equal('FAILED');
        await issuance.cancelInvestment({ from: investor1 });
        await issuance.cancelInvestment({ from: investor2 });
        web3.utils.fromWei(await acceptedToken.balanceOf(investor1), 'ether').should.be.equal('100');
        web3.utils.fromWei(await acceptedToken.balanceOf(investor2), 'ether').should.be.equal('50');
    });

    it('setIssuePrice sets the issue price', async () => {
        await issuance.setIssuePrice(5);
        (await issuance.issuePrice()).toString().should.be.equal('5');
    });

    it('setOpeningDate sets the opening date', async () => {
        const openingDate = Math.floor((new Date()).getTime() / 1000);
        await issuance.setOpeningDate(openingDate);
        (await issuance.openingDate()).toString().should.be.equal(openingDate.toString());
    });

    it('setClosingDate sets the closing date', async () => {
        const closingDate = Math.floor((new Date()).getTime() / 1000);
        await issuance.setClosingDate(closingDate);
        (await issuance.closingDate()).toString().should.be.equal(closingDate.toString());
    });

    it('setSoftCap sets the soft cap', async () => {
        await issuance.setSoftCap(new BigNumber(100e18));
        web3.utils.fromWei(await issuance.softCap(), 'ether').should.be.equal('100');
    });

    it('setMinInvestment sets the minimum investment', async () => {
        await issuance.setMinInvestment(new BigNumber(1e18));
        web3.utils.fromWei(await issuance.minInvestment(), 'ether').should.be.equal('1');
    });

});

function bytes32ToString(text: string) {
    return web3.utils.toAscii(text).replace(/\0/g, '');
}
