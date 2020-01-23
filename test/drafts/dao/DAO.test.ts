import * as chai from 'chai';

// tslint:disable-next-line:no-var-requires
const { balance, BN, constants, ether, expectEvent, expectRevert, send } = require('@openzeppelin/test-helpers');

import { DAOInstance, IssuanceEthInstance, TestERC20MintableInstance } from '../../../types/truffle-contracts';

const DAO = artifacts.require(
    'DAO',
) as Truffle.Contract<DAOInstance>;
const IssuanceEth = artifacts.require(
    'IssuanceEth',
) as Truffle.Contract<IssuanceEthInstance>;
const TestERC20Mintable = artifacts.require(
    'TestERC20Mintable',
) as Truffle.Contract<TestERC20MintableInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('DAO - pre initial funding cases', (accounts) => {

    const [ holder1 ] = accounts;

    let dao: DAOInstance;
    let issuanceToken1: TestERC20MintableInstance;
    let issuanceEth1: IssuanceEthInstance;

    beforeEach(async () => {
        dao = await DAO.new();
        issuanceToken1 = await TestERC20Mintable.new();
        issuanceEth1 = await IssuanceEth.new(issuanceToken1.address);
    });

    /**
     * @test {DAO#restartFundingRound}
     */
    it('cannot restart funding round if DAO in "SETUP" state', async () => {
        await expectRevert(
            dao.restartFundingRound(),
            'Initial funding round not ended.',
        );
    });

    /**
     * @test {DAO#begMoneyForVenture}
     */
    it('cannot beg money for venture if DAO not in "LIVE" state', async () => {
        await expectRevert(
            dao.begMoneyForVenture(ether('1'), issuanceEth1.address),
            'DAO needs to be LIVE.',
        );
    });

    /**
     * @test {DAO#voteVenture}
     */
    it('cannot vote venture if DAO not in "LIVE" state', async () => {
        await expectRevert(
            dao.voteForVenture(ether('1'), issuanceEth1.address),
            'DAO needs to be LIVE.',
        );
    });

    /**
     * @test {DAO#fundVenture}
     */
    it('cannot fund venture if DAO not in "LIVE" state', async () => {
        await expectRevert(
            dao.fundVenture(issuanceEth1.address),
            'DAO needs to be LIVE.',
        );
    });

    /**
     * @test {DAO#getTokensForFundedVenture}
     */
    it('cannot get tokens for funded venture if DAO not in "LIVE" state', async () => {
        await expectRevert(
            dao.getTokensForFundedVenture(issuanceEth1.address),
            'DAO needs to be LIVE.',
        );
    });

    /**
     * @test {DAO#getReturnsFromTokensOfFundedVenture}
     */
    it('cannot get returns from tokens of funded venture if DAO not in "LIVE" state', async () => {
        await expectRevert(
            dao.getReturnsFromTokensOfFundedVenture(issuanceEth1.address),
            'DAO needs to be LIVE.',
        );
    });

    /**
     * @test {DAO#restartFundingRound}
     */
    it('cannot get returns for funded venture if DAO not in "LIVE" state', async () => {
        await expectRevert(
            dao.getTokensForFundedVenture(issuanceEth1.address),
            'DAO needs to be LIVE.',
        );
    });

    /**
     * @test {DAO#transferFunds}
     */
    it('cannot transfer funds under any circumstances', async () => {
        await expectRevert(
            dao.transferFunds(holder1),
            'Ether can only be invested or withdrawn.',
        );
    });
});

contract('DAO - post initial funding cases', (accounts) => {

    const [ holder1, holder2 ] = accounts;

    let dao: DAOInstance;
    let issuanceToken1: TestERC20MintableInstance;
    let issuanceEth1: IssuanceEthInstance;

    beforeEach(async () => {
        dao = await DAO.new();
        issuanceToken1 = await TestERC20Mintable.new();
        issuanceEth1 = await IssuanceEth.new(issuanceToken1.address);
        await dao.setIssuePrice(5);
        await dao.openIssuance();
        await dao.invest({ from: holder1, value: ether('1')});
        await dao.invest({ from: holder2, value: ether('1')});
        await dao.startDistribution();
        await dao.withdraw({ from: holder1 });
        await dao.withdraw({ from: holder2 });
        await issuanceEth1.setIssuePrice(10);
        await issuanceEth1.openIssuance();
    });

    /**
     * @test {DAO#begMoneyForVenture}
     */
    it('cannot beg more money than available', async () => {
        await expectRevert(
            dao.begMoneyForVenture(ether('3'), issuanceEth1.address),
            'You beg too much.',
        );
    });

    /**
     * @test {DAO#voteForVenture}
     */
    it('cannot vote for venture with insufficient voting power', async () => {
        await expectRevert(
            dao.voteForVenture(ether('0.3'), issuanceEth1.address),
            'Not enough power.',
        );
    });

    /**
     * @test {DAO#fundVenture}
     */
    it('cannot fund venture with insufficient votes', async () => {
        await expectRevert(
            dao.fundVenture(issuanceEth1.address),
            'Not enough expressed votes.',
        );
    });
});

contract('DAO - ventures', (accounts) => {

    const [ holder1, holder2 ] = accounts;

    let dao: DAOInstance;
    let issuanceToken1: TestERC20MintableInstance;
    let issuanceToken2: TestERC20MintableInstance;
    let issuanceEth1: IssuanceEthInstance;
    let issuanceEth2: IssuanceEthInstance;

    beforeEach(async () => {
        dao = await DAO.new();
        issuanceToken1 = await TestERC20Mintable.new();
        issuanceToken2 = await TestERC20Mintable.new();
        issuanceEth1 = await IssuanceEth.new(issuanceToken1.address);
        issuanceEth2 = await IssuanceEth.new(issuanceToken2.address);
        await issuanceToken1.addMinter(issuanceEth1.address);
        await issuanceToken2.addMinter(issuanceEth2.address);
        await dao.setIssuePrice(5);
        await dao.openIssuance();
        await dao.invest({ from: holder1, value: ether('1')});
        await dao.invest({ from: holder2, value: ether('2')});
        await dao.startDistribution();
        await dao.withdraw({ from: holder1 });
        await dao.withdraw({ from: holder2 });
        await issuanceEth1.setIssuePrice(10);
        await issuanceEth2.setIssuePrice(1);
        await issuanceEth1.openIssuance();
        await issuanceEth2.openIssuance();
    });

    /**
     * @test {DAO#begMoneyForVenture} and {DAO#voteVenture} and {DAO#fundVenture} and {DAO#getReturnsForFundedVenture}
     */
    it('cannot get returns twice for a funded venture', async () => {
        await dao.begMoneyForVenture(ether('2.4'), issuanceEth1.address);
        await dao.begMoneyForVenture(ether('0.6'), issuanceEth2.address);
        await dao.voteForVenture(ether('0.4'), issuanceEth1.address, { from: holder2 });
        await dao.fundVenture(issuanceEth1.address);
        await issuanceEth1.startDistribution();
        await dao.getTokensForFundedVenture(issuanceEth1.address);
        await dao.getReturnsFromTokensOfFundedVenture(issuanceEth1.address);
        await dao.voteForVenture(ether('0.2'), issuanceEth2.address, { from: holder1 });
        await dao.voteForVenture(ether('0.2'), issuanceEth2.address, { from: holder2 });
        await dao.fundVenture(issuanceEth2.address);
        await issuanceEth2.startDistribution();
        await dao.getTokensForFundedVenture(issuanceEth2.address);
        await expectRevert(
            dao.getReturnsFromTokensOfFundedVenture(issuanceEth1.address),
            'Cannot get returns again.',
        );
    });

    /**
     * @test {DAO#begMoneyForVenture} and {DAO#voteVenture} and {DAO#fundVenture} and {DAO#getReturnsForFundedVenture}
     */
    it('can succcesfully get returns for a funded venture', async () => {
        await dao.begMoneyForVenture(ether('2.4'), issuanceEth1.address);
        await dao.begMoneyForVenture(ether('0.6'), issuanceEth2.address);
        await dao.voteForVenture(ether('0.4'), issuanceEth1.address, { from: holder2 });
        await dao.fundVenture(issuanceEth1.address);
        await issuanceEth1.startDistribution();
        await dao.getTokensForFundedVenture(issuanceEth1.address);
        await dao.getReturnsFromTokensOfFundedVenture(issuanceEth1.address);
        await dao.voteForVenture(ether('0.2'), issuanceEth2.address, { from: holder1 });
        await dao.voteForVenture(ether('0.2'), issuanceEth2.address, { from: holder2 });
        await dao.fundVenture(issuanceEth2.address);
        await issuanceEth2.startDistribution();
        await dao.getTokensForFundedVenture(issuanceEth2.address);
        await dao.getReturnsFromTokensOfFundedVenture(issuanceEth2.address);
        await dao.updateAccount(holder1, issuanceToken1.address);
        await dao.updateAccount(holder2, issuanceToken1.address);
        await dao.updateAccount(holder1, issuanceToken2.address);
        await dao.updateAccount(holder2, issuanceToken2.address);
        BN(await issuanceToken1.balanceOf(holder1)).should.be.bignumber.equal(ether('0.08'));
        BN(await issuanceToken1.balanceOf(holder2)).should.be.bignumber.equal(ether('0.16'));
        BN(await issuanceToken2.balanceOf(holder1)).should.be.bignumber.equal(ether('0.2'));
        BN(await issuanceToken2.balanceOf(holder2)).should.be.bignumber.equal(ether('0.4'));
    });
});
