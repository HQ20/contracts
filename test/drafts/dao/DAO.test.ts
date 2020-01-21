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

// contract('DAO - pre initial funding cases', (accounts) => {

//     const [ holder1 ] = accounts;

//     let dao: DAOInstance;
//     let issuanceToken1: TestERC20MintableInstance;
//     let issuanceEth1: IssuanceEthInstance;

//     beforeEach(async () => {
//         dao = await DAO.new();
//         issuanceToken1 = await TestERC20Mintable.new();
//         issuanceEth1 = await IssuanceEth.new(issuanceToken1.address);
//     });

//     /**
//      * @test {DAO#restartFundingRound}
//      */
//     it('cannot restart funding round if DAO in "SETUP" state', async () => {
//         await expectRevert(
//             dao.restartFundingRound(),
//             'Initial funding round not ended.',
//         );
//     });

//     /**
//      * @test {DAO#begMoneyForIdea}
//      */
//     it('cannot beg money for idea if DAO not in "LIVE" state', async () => {
//         await expectRevert(
//             dao.begMoneyForIdea(ether('1'), issuanceEth1.address),
//             'Founders not defined yet.',
//         );
//     });

//     /**
//      * @test {DAO#voteIdea}
//      */
//     it('cannot vote idea if DAO not in "LIVE" state', async () => {
//         await expectRevert(
//             dao.voteForIdea(ether('1'), issuanceEth1.address),
//             'Founders not defined yet.',
//         );
//     });

//     /**
//      * @test {DAO#fundIdea}
//      */
//     it('cannot fund idea if DAO not in "LIVE" state', async () => {
//         await expectRevert(
//             dao.fundIdea(issuanceEth1.address),
//             'Founders not defined yet.',
//         );
//     });

//     /**
//      * @test {DAO#restartFundingRound}
//      */
//     it('cannot get returns for funded idea if DAO not in "LIVE" state', async () => {
//         await expectRevert(
//             dao.getTokensForFundedIdea(issuanceEth1.address),
//             'Founders not defined yet.',
//         );
//     });

//     /**
//      * @test {DAO#transferFunds}
//      */
//     it('cannot transfer funds under any circumstances', async () => {
//         await expectRevert(
//             dao.transferFunds(holder1),
//             'You can never do this.',
//         );
//     });
// });

// contract('DAO - post initial funding cases', (accounts) => {

//     const [ holder1, holder2 ] = accounts;

//     let dao: DAOInstance;
//     let issuanceToken1: TestERC20MintableInstance;
//     let issuanceEth1: IssuanceEthInstance;

//     beforeEach(async () => {
//         dao = await DAO.new();
//         issuanceToken1 = await TestERC20Mintable.new();
//         issuanceEth1 = await IssuanceEth.new(issuanceToken1.address);
//         await dao.setIssuePrice(5);
//         await dao.openIssuance();
//         await dao.invest({ from: holder1, value: ether('1')});
//         await dao.invest({ from: holder2, value: ether('1')});
//         await dao.startDistribution();
//         await dao.withdraw({ from: holder1 });
//         await dao.withdraw({ from: holder2 });
//         await issuanceEth1.setIssuePrice(10);
//         await issuanceEth1.openIssuance();
//     });

//     /**
//      * @test {DAO#begMoneyForIdea}
//      */
//     it('cannot beg more money than available', async () => {
//         await expectRevert(
//             dao.begMoneyForIdea(ether('3'), issuanceEth1.address),
//             'You beg too much.',
//         );
//     });

//     /**
//      * @test {DAO#voteForIdea}
//      */
//     it('cannot vote for idea with insufficient voting power', async () => {
//         await expectRevert(
//             dao.voteForIdea(ether('0.3'), issuanceEth1.address),
//             'Not enough power.',
//         );
//     });

//     /**
//      * @test {DAO#fundIdea}
//      */
//     it('cannot fund idea with insufficient votes', async () => {
//         await expectRevert(
//             dao.fundIdea(issuanceEth1.address),
//             'Not enough expressed votes.',
//         );
//     });
// });

contract('DAO - ideas', (accounts) => {

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
     * @test {DAO#begMoneyForIdea} and {DAO#voteIdea} and {DAO#fundIdea} and {DAO#getReturnsForFundedIdea}
     */
    it('can succcesfully get returns for a funded idea', async () => {
        await dao.begMoneyForIdea(ether('2.4'), issuanceEth1.address);
        await dao.begMoneyForIdea(ether('0.6'), issuanceEth2.address);
        await dao.voteForIdea(ether('0.4'), issuanceEth1.address, { from: holder2 });
        await dao.fundIdea(issuanceEth1.address);
        await issuanceEth1.startDistribution();
        await dao.getTokensForFundedIdea(issuanceEth1.address);
        await dao.getReturnsFromTokensOfFundedIdea(issuanceEth1.address);
        await dao.voteForIdea(ether('0.2'), issuanceEth2.address, { from: holder1 });
        await dao.voteForIdea(ether('0.2'), issuanceEth2.address, { from: holder2 });
        await dao.fundIdea(issuanceEth2.address);
        await issuanceEth2.startDistribution();
        await dao.getTokensForFundedIdea(issuanceEth2.address);
        await dao.getReturnsFromTokensOfFundedIdea(issuanceEth1.address);
        await dao.updateAccount(holder1, issuanceEth1.address);
        await dao.updateAccount(holder2, issuanceEth1.address);
        await dao.updateAccount(holder1, issuanceEth2.address);
        await dao.updateAccount(holder2, issuanceEth2.address);
        BN(await issuanceToken1.balanceOf(holder1)).should.be.bignumber.equal(ether('0.08'));
        BN(await issuanceToken1.balanceOf(holder2)).should.be.bignumber.equal(ether('0.16'));
        BN(await issuanceToken2.balanceOf(holder1)).should.be.bignumber.equal(ether('0.2'));
        BN(await issuanceToken2.balanceOf(holder2)).should.be.bignumber.equal(ether('0.4'));
    });
});