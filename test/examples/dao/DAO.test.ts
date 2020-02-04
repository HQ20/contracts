import * as chai from 'chai';

// tslint:disable-next-line:no-var-requires
const { balance, BN, constants, ether, expectEvent, expectRevert, send } = require('@openzeppelin/test-helpers');

import { DAOInstance, IssuanceEthInstance, TestERC20MintableInstance, VentureEthInstance } from '../../../types/truffle-contracts';

const DAO = artifacts.require(
    'DAO',
) as Truffle.Contract<DAOInstance>;
const VentureEth = artifacts.require(
    'VentureEth',
) as Truffle.Contract<VentureEthInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('DAO - pre initial funding cases', (accounts) => {

    const [ holder1 ] = accounts;

    let dao: DAOInstance;
    let venture1: VentureEthInstance;

    beforeEach(async () => {
        dao = await DAO.new('DAOToken', 'DAO', 18);
        venture1 = await VentureEth.new('VentureToken', 'VNT', 18);
    });

    /**
     * @test {DAO#proposeVenture}
     */
    it('cannot propose venture if DAO not in "LIVE" state', async () => {
        await expectRevert(
            dao.proposeVenture(ether('1'), venture1.address),
            'DAO needs to be LIVE.',
        );
    });

    /**
     * @test {DAO#voteVenture}
     */
    it('cannot vote venture if DAO not in "LIVE" state', async () => {
        await expectRevert(
            dao.voteForVenture(ether('1'), venture1.address),
            'DAO needs to be LIVE.',
        );
    });

    /**
     * @test {DAO#fundVenture}
     */
    it('cannot fund venture if DAO not in "LIVE" state', async () => {
        await expectRevert(
            dao.fundVenture(venture1.address),
            'DAO needs to be LIVE.',
        );
    });

    /**
     * @test {DAO#claimTokensForFundedVenture}
     */
    it('cannot get tokens for funded venture if DAO not in "LIVE" state', async () => {
        await expectRevert(
            dao.claimTokensForFundedVenture(venture1.address),
            'DAO needs to be LIVE.',
        );
    });

    /**
     * @test {DAO#getReturnsFromTokensOfFundedVenture}
     */
    it('cannot get returns from tokens of funded venture if DAO not in "LIVE" state', async () => {
        await expectRevert(
            dao.getReturnsFromTokensOfFundedVenture(venture1.address),
            'DAO needs to be LIVE.',
        );
    });

    /**
     * @test {DAO#reopenInvestorRound}
     */
    it('cannot get returns for funded venture if DAO not in "LIVE" state', async () => {
        await expectRevert(
            dao.claimTokensForFundedVenture(venture1.address),
            'DAO needs to be LIVE.',
        );
    });

    /**
     * @test {DAO#transferFunds}
     */
    it('cannot transfer funds under any circumstances', async () => {
        await expectRevert(
            dao.withdraw(holder1),
            'Cannot transfer funds.',
        );
    });
});

contract('DAO - post initial funding cases', (accounts) => {

    const [ holder1, holder2 ] = accounts;

    let dao: DAOInstance;
    let venture1: VentureEthInstance;

    beforeEach(async () => {
        dao = await DAO.new('DAOToken', 'DAO', 18);
        venture1 = await VentureEth.new('VentureToken', 'VNT', 18);
        await dao.setIssuePrice(ether('5'));
        await dao.openIssuance();
        await dao.invest({ from: holder1, value: ether('1').toString() });
        await dao.invest({ from: holder2, value: ether('1').toString() });
        await dao.startDistribution();
        await dao.claim({ from: holder1 });
        await dao.claim({ from: holder2 });
        await venture1.setIssuePrice(ether('10'));
        await venture1.openIssuance();
    });

    /**
     * @test {DAO#proposeVenture}
     */
    it('cannot propose more funding than is available', async () => {
        await expectRevert(
            dao.proposeVenture(ether('3'), venture1.address),
            'Not enough funds.',
        );
    });

    /**
     * @test {DAO#voteForVenture}
     */
    it('cannot vote for venture with insufficient voting power', async () => {
        await expectRevert(
            dao.voteForVenture(ether('0.3'), venture1.address),
            'Not enough power.',
        );
    });

    /**
     * @test {DAO#fundVenture}
     */
    it('cannot fund venture with insufficient votes', async () => {
        await expectRevert(
            dao.fundVenture(venture1.address),
            'Not enough expressed votes.',
        );
    });
});

contract('DAO - ventures', (accounts) => {

    const [ holder1, holder2, ventureHolder1, ventureHolder2, ventureClient1, ventureClient2 ] = accounts;

    let dao: DAOInstance;
    let venture1: VentureEthInstance;
    let venture2: VentureEthInstance;

    beforeEach(async () => {
        dao = await DAO.new('DAOToken', 'DAO', 18);
        venture1 = await VentureEth.new('VentureToken1', 'VNT1', 18);
        venture2 = await VentureEth.new('VentureToken2', 'VNT2', 18);
        await dao.setIssuePrice(ether('5'));
        await dao.openIssuance();
        await dao.invest({ from: holder1, value: ether('1').toString() });
        await dao.invest({ from: holder2, value: ether('2').toString() });
        await dao.startDistribution();
        await dao.claim({ from: holder1 });
        await dao.claim({ from: holder2 });
        await venture1.setIssuePrice(ether('10'));
        await venture2.setIssuePrice(ether('1'));
        await venture1.openIssuance();
        await venture2.openIssuance();
    });

    /**
     * @test {DAO#proposeVenture} and {DAO#voteVenture} and {DAO#fundVenture} and {DAO#getReturnsForFundedVenture}
     */
    it('can get returns for two funded ventures', async () => {
        await dao.proposeVenture(ether('2.4'), venture1.address);
        await dao.proposeVenture(ether('0.6'), venture2.address);
        await dao.voteForVenture(ether('0.4'), venture1.address, { from: holder2 });
        await dao.fundVenture(venture1.address);
        await venture1.invest({ from: ventureHolder1, value: ether('2.4').toString() });
        await venture1.invest({ from: ventureHolder2, value: ether('2.4').toString() });
        await venture1.startDistribution();
        await venture1.claim({ from: ventureHolder1 });
        await venture1.claim({ from: ventureHolder2 });
        await dao.claimTokensForFundedVenture(venture1.address);
        await venture1.increasePool({ from: ventureClient1, value: ether('1').toString() });
        await venture1.increasePool({ from: ventureClient2, value: ether('2').toString() });
        await dao.getReturnsFromTokensOfFundedVenture(venture1.address);
        await dao.voteForVenture(ether('0.2'), venture2.address, { from: holder1 });
        await dao.voteForVenture(ether('0.2'), venture2.address, { from: holder2 });
        await dao.fundVenture(venture2.address);
        await venture2.startDistribution();
        await dao.claimTokensForFundedVenture(venture2.address);
        await venture2.increasePool({ from: ventureClient1, value: ether('1').toString() });
        await venture2.increasePool({ from: ventureClient2, value: ether('1').toString() });
        await dao.getReturnsFromTokensOfFundedVenture(venture2.address);
        BN(await dao.updateAccount.call(holder1)).should.be.bignumber.gt(ether('0.9'));
        BN(await dao.updateAccount.call(holder2)).should.be.bignumber.gt(ether('1.9'));
    });
});
