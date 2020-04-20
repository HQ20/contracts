import * as chai from 'chai';
// tslint:disable-next-line:no-var-requires
const { BN, ether, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
import { ERC20MintableInstance, OneTokenOneVoteInstance, TestDemocraticInstance } from '../../types/truffle-contracts';

const Democratic = artifacts.require('TestDemocratic') as Truffle.Contract<TestDemocraticInstance>;
const ERC20Mintable = artifacts.require('ERC20Mintable') as Truffle.Contract<ERC20MintableInstance>;
const Voting = artifacts.require('OneTokenOneVote') as Truffle.Contract<OneTokenOneVoteInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('Democratic', (accounts) => {

    const owner = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];
    const threshold = 5000;
    const balance1 = ether('10');
    const balance2 = ether('10');
    const votes1 = ether('8');
    const votes2 = ether('4');

    let democratic: TestDemocraticInstance;
    let votingToken: ERC20MintableInstance;
    let voting: OneTokenOneVoteInstance;

    beforeEach(async () => {
        votingToken = await ERC20Mintable.new('VotingToken', 'VOT', 0);
        democratic = await Democratic.new(votingToken.address, threshold);

        await votingToken.mint(voter1, balance1);
        await votingToken.mint(voter2, balance2);
    });

    /**
     * @test {Democratic#propose}
     */
    it('proposals can be done.', async () => {
        const proposalData = web3.eth.abi.encodeFunctionCall({
            name: 'testProposal',
            type: 'function',
            inputs: [{
                type: 'bool',
                name: 'output',
             }],
        }, [true]);
        const tx = await democratic.propose(proposalData, { from: owner });
        tx.logs[0].event.should.be.equal('Proposal');
    });

    describe('once proposed', () => {

        beforeEach(async () => {
            const proposalData = web3.eth.abi.encodeFunctionCall({
                name: 'testProposal',
                type: 'function',
                inputs: [{
                    type: 'bool',
                    name: 'output',
                 }],
            }, [true]);
            const votingAddress = (
                await democratic.propose(proposalData, { from: owner })
            ).logs[0].args.proposal;
            voting = await Voting.at(votingAddress);
        });

        /**
         * @test {Voting#vote}
         */
        it('votes can be casted', async () => {
            await votingToken.approve(voting.address, votes1, { from: voter1 });
            expectEvent(
                await voting.vote(votes1, { from: voter1 }),
                'VoteCasted',
                {
                    voter: voter1,
                    votes: votes1
                },
            );
        });

        describe('once voted', () => {

            beforeEach(async () => {
                await votingToken.approve(voting.address, votes1, { from: voter1 });
                await votingToken.approve(voting.address, votes2, { from: voter2 });
                await voting.vote(votes1, { from: voter1 });
                await voting.vote(votes2, { from: voter2 });
            });

            /**
             * @test {Voting#validate}
             */
            it('can validate the vote', async () => {
                await voting.validate();
                (await voting.passed()).should.be.true;
            });

            describe('once validated', () => {

                beforeEach(async () => {
                    await voting.validate();
                });

                /**
                 * @test {Voting#enact}
                 */
                it('proposals can be enacted', async () => {
                    expectEvent(
                        await voting.enact(),
                        'ProposalEnacted',
                    );
                });
            });
        });
    });
});
