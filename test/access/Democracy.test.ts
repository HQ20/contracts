import { should } from 'chai';
import { DemocracyInstance, ERC20MintableInstance, OneTokenOneVoteInstance } from '../../types/truffle-contracts';
// tslint:disable:no-var-requires
const { expectRevert } = require('@openzeppelin/test-helpers');

const Democracy = artifacts.require('Democracy') as Truffle.Contract<DemocracyInstance>;
const Token = artifacts.require('ERC20Mintable') as Truffle.Contract<ERC20MintableInstance>;
const Voting = artifacts.require('OneTokenOneVote') as Truffle.Contract<OneTokenOneVoteInstance>;
should();

/** @test {Democracy} contract */
contract('Democracy', (accounts) => {
    let democracy: DemocracyInstance;
    let token: ERC20MintableInstance;
    let voting: OneTokenOneVoteInstance;
    const root = accounts[0];
    const voter1 = accounts[1];
    const threshold = 5000;

    beforeEach(async () => {
        token = await Token.new('VotingToken', 'VOT', 18);
        democracy = await Democracy.new(root, token.address, threshold);
        await token.mint(root, 1);
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
     * @test {Democracy#addVoter}
     */
    it('voters can be added through a proposal.', async () => {
        const proposalData = web3.eth.abi.encodeFunctionCall({
            name: 'addVoter',
            type: 'function',
            inputs: [{
                type: 'address',
                name: 'account',
            }]
        }, [voter1]);
        const votingAddress = (
            await democracy.propose(proposalData, { from: root })
        ).logs[0].args.proposal;
        voting = await Voting.at(votingAddress);
        await token.approve(voting.address, 1, { from: root });
        await voting.vote(1, { from: root });
        await voting.validate();
        (await voting.passed()).should.be.true;
        await voting.enact();
        assert.isTrue(await democracy.isVoter(voter1));
    });

    /**
     * @test {Democracy#removeVoter}
     */
    it('voters can be removed through a proposal.', async () => {
        const proposalData = web3.eth.abi.encodeFunctionCall({
            name: 'removeVoter',
            type: 'function',
            inputs: [{
                type: 'address',
                name: 'account',
            }]
        }, [root]);
        const votingAddress = (
            await democracy.propose(proposalData, { from: root })
        ).logs[0].args.proposal;
        voting = await Voting.at(votingAddress);
        await token.approve(voting.address, 1, { from: root });
        await voting.vote(1, { from: root });
        await voting.validate();
        await voting.enact();
        assert.isFalse(await democracy.isVoter(root));
    });

    /**
     * @test {Democracy#addLeader}
     */
    it('leaders can be added through a proposal.', async () => {
        const proposalData = web3.eth.abi.encodeFunctionCall({
            name: 'addLeader',
            type: 'function',
            inputs: [{
                type: 'address',
                name: 'account',
            }]
        }, [root]);
        const votingAddress = (
            await democracy.propose(proposalData, { from: root })
        ).logs[0].args.proposal;
        voting = await Voting.at(votingAddress);
        await token.approve(voting.address, 1, { from: root });
        await voting.vote(1, { from: root });
        await voting.validate();
        await voting.enact();
        assert.isTrue(await democracy.isLeader(root));
    });

    describe('with existing leaders', async () => {
        beforeEach(async () => {
            const proposalData = web3.eth.abi.encodeFunctionCall({
                name: 'addLeader',
                type: 'function',
                inputs: [{
                    type: 'address',
                    name: 'account',
                }]
            }, [root]);
            const votingAddress = (
                await democracy.propose(proposalData, { from: root })
            ).logs[0].args.proposal;
            voting = await Voting.at(votingAddress);
            await token.approve(voting.address, 1, { from: root });
            await voting.vote(1, { from: root });
            await voting.validate();
            await voting.enact();
            await voting.cancel({ from: root });
        });

        /**
         * @test {Democracy#renounceLeader}
         */
        it('voters can renounce to their rights.', async () => {
            await democracy.renounceLeader({ from: root });
            assert.isFalse(await democracy.isLeader(root));
        });

        /**
         * @test {Democracy#removeLeader}
         */
        it('leaders can be removed through a proposal.', async () => {
            const proposalData = web3.eth.abi.encodeFunctionCall({
                name: 'removeLeader',
                type: 'function',
                inputs: [{
                    type: 'address',
                    name: 'account',
                }]
            }, [root]);
            const votingAddress = (
                await democracy.propose(proposalData, { from: root })
            ).logs[0].args.proposal;
            voting = await Voting.at(votingAddress);
            await token.approve(voting.address, 1, { from: root });
            await voting.vote(1, { from: root });
            await voting.validate();
            await voting.enact();
            assert.isFalse(await democracy.isLeader(root));
        });
    });
});
