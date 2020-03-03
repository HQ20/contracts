import { should } from 'chai';
import { DemocracyInstance, ERC20MintableDetailedInstance } from '../../types/truffle-contracts';
// tslint:disable:no-var-requires
const { expectRevert } = require('@openzeppelin/test-helpers');

const Democracy = artifacts.require('Democracy') as Truffle.Contract<DemocracyInstance>;
const Token = artifacts.require('ERC20MintableDetailed') as Truffle.Contract<ERC20MintableDetailedInstance>;
should();

/** @test {Democracy} contract */
contract('Democracy', (accounts) => {
    let democracy: DemocracyInstance;
    let token: ERC20MintableDetailedInstance;
    const root = accounts[0];
    const voter1 = accounts[1];
    const threshold = 5000;

    beforeEach(async () => {
        token = await Token.new('VotingToken', 'VOT', 18);
        democracy = await Democracy.new(root, token.address, threshold);
    });

    /**
     * @test {Democracy#isLeader}
     */
    /* it('isLeader returns true for leaders', async () => {
        assert.isTrue(await democracy.isLeader(root));
        assert.isFalse(await democracy.isLeader(voter1));
    }); */

    /**
     * @test {Democracy#isVoter}
     */
    it('knows if an account is a voter', async () => {
        assert.isTrue(await democracy.isVoter(root));
        assert.isFalse(await democracy.isVoter(voter1));
    });

    /**
     * @test {Democracy#renounceVoter}
     */
    it('voters can renounce to their rights.', async () => {
        await democracy.renounceVoter({ from: root });
        assert.isFalse(await democracy.isVoter(root));
    });

    /**
     * @test {Democracy#addVoter}
     */
    it('voters cannot be added by regular accounts.', async () => {
        await expectRevert(
            democracy.addVoter(voter1, { from: voter1 }),
            'Restricted to proposals.',
        );
    });

    /**
     * @test {Democracy#propose}
     */
    it('proposals cannot be done by regular accounts.', async () => {
        const proposalData = web3.eth.abi.encodeFunctionCall({
            name: 'addVoter',
            type: 'function',
            inputs: [{
                type: 'address',
                name: 'account',
            }]
        }, [voter1]);
        await expectRevert(
            democracy.propose(
                proposalData,
                { from: voter1 },
            ),
            'Restricted to voters.',
        );
    });

    /**
     * @test {Democracy#propose}
     */
    it('proposals can be done by voters.', async () => {
        const proposalData = web3.eth.abi.encodeFunctionCall({
            name: 'addVoter',
            type: 'function',
            inputs: [{
                type: 'address',
                name: 'account',
            }]
        }, [voter1]);
        const tx = await democracy.propose(proposalData, { from: root });
        tx.logs[0].event.should.be.equal('Proposal');
    });


    /**
     * @test {Democracy#addLeader}
     */
    /* it('addLeader throws if not called by an leader account.', async () => {
        await expectRevert(
            democracy.addLeader(voter1, { from: voter1 }),
            'Restricted to leaders.',
        );
    }); */

    /**
     * @test {Democracy#renounceLeader}
     */
    /* it('renounceLeader removes an account from the leader role.', async () => {
        await democracy.renounceLeader({ from: root });
        assert.isFalse(await democracy.isLeader(root));
    }); */

    /**
     * @test {Democracy#removeVoter}
     */
    /* it('removeVoter throws if not called by an leader account.', async () => {
        await expectRevert(
            democracy.removeVoter(voter1, { from: voter1 }),
            'Restricted to leaders.',
        );
    }); */

    /**
     * @test {Democracy#addVoter} and {Democracy#isVoter}
     */
    /* it('addVoter adds an account as an voter.', async () => {
        await democracy.addVoter(voter1, { from: root });
        assert.isTrue(await democracy.isVoter(voter1));
    }); */

    /**
     * @test {Democracy#addVoter} and {Democracy#isVoter}
     */
    /* it('addLeader adds an account as an leader.', async () => {
        await democracy.addLeader(voter1, { from: root });
        assert.isTrue(await democracy.isLeader(voter1));
    }); */

    /* describe('with existing voters', () => {
        beforeEach(async () => {
            await democracy.addVoter(voter1, { from: root });
        }); */

        /**
         * @test {Democracy#removeVoter}
         */
        /* it('removeVoter removes an voter.', async () => {
            await democracy.removeVoter(voter1, { from: root });
            assert.isFalse(await democracy.isVoter(voter1));
        });
    });*/
});
