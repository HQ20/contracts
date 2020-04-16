import * as chai from 'chai';
// tslint:disable-next-line:no-var-requires
const { BN, ether, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
import { ERC20MintableInstance, OneTokenOneVoteInstance } from '../../types/truffle-contracts';

const Voting = artifacts.require('OneTokenOneVote') as Truffle.Contract<OneTokenOneVoteInstance>;
const ERC20Mintable = artifacts.require(
        'ERC20Mintable'
    ) as Truffle.Contract<ERC20MintableInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('OneTokenOneVote', (accounts) => {

    const owner = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];
    const threshold = 5000;
    const balance1 = ether('10');
    const balance2 = ether('10');
    const votes1 = ether('8');
    const votes2 = ether('4');

    let voting: OneTokenOneVoteInstance;
    let votingToken: ERC20MintableInstance;
    let votedToken: ERC20MintableInstance;

    beforeEach(async () => {
        votingToken = await ERC20Mintable.new('VotingToken', 'VOT', 18);
        votedToken = await ERC20Mintable.new('VotedToken', 'VTD', 18);
        voting = await Voting.new(
            votingToken.address,
            votedToken.address,
            web3.eth.abi.encodeFunctionCall({
                type: 'function',
                name: 'mint',
                payable: false,
                inputs: [{
                    name: 'account',
                    type: 'address',
                }, {
                    name: 'amount',
                    type: 'uint256',
                }],
            }, [owner, '1']),
            threshold,
        );
        await votingToken.mint(voter1, balance1);
        await votingToken.mint(voter2, balance2);
        await votingToken.approve(voting.address, votes1, { from: voter1 });
        await votingToken.approve(voting.address, votes2, { from: voter2 });
        await votedToken.addAdmin(voting.address);
    });

    /**
     * @test {Voting#vote}
     */
    it('votes can be casted', async () => {
        expectEvent(
            await voting.vote(votes1, { from: voter1 }),
            'VoteCasted',
            {
                voter: voter1,
                votes: votes1
            },
        );
    });

    /**
     * @test {Voting#validate}
     */
    it('cannot validate the vote', async () => {
        await voting.vote(votes1, { from: voter1 }),
        await expectRevert(
            voting.validate(),
            'Not enough votes to pass.'
        );
    });

    describe('once voted', () => {

        beforeEach(async () => {
            await voting.vote(votes1, { from: voter1 });
            await voting.vote(votes2, { from: voter2 });
        });

        /**
         * @test {Voting#enact}
         */
        it('cannot enact proposal yet', async () => {
            await expectRevert(
                voting.enact(),
                'Cannot execute until vote passes.',
            );
        });

        /**
         * @test {Voting#cancel}
         */
        it('voters can cancel their vote', async () => {
            expectEvent(
                await voting.cancel({ from: voter1 }),
                'VoteCanceled',
                {
                    voter: voter1,
                    votes: votes1,
                },
            );
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
             * @test {Voting#cancel}
             */
            it('votes can be canceled', async () => {
                expectEvent(
                    await voting.cancel({ from: voter1 }),
                    'VoteCanceled',
                    {
                        voter: voter1,
                        votes: votes1,
                    },
                );
            });

            /**
             * @test {Voting#enact}
             */
            it('proposals can be enacted', async () => {
                expectEvent(
                    await voting.enact(),
                    'ProposalEnacted',
                );
                BN(await votedToken.balanceOf(owner)).should.be.bignumber.equal('1');
            });
        });
    });

    /**
     * @test {Voting#enact}
     */
    it('fails to enact invalid proposals', async () => {
        voting = await Voting.new(
            votingToken.address,
            votedToken.address,
            web3.eth.abi.encodeFunctionCall({
                type: 'function',
                name: 'mint',
                payable: false,
                inputs: [{
                    name: 'account',
                    type: 'address',
                }, {
                    name: 'amount',
                    type: 'uint256',
                }],
            }, [owner, '1']),
            threshold,
        );
        await votingToken.approve(voting.address, votes1, { from: voter1 });
        await votingToken.approve(voting.address, votes2, { from: voter2 });
        await voting.vote(votes1, { from: voter1 });
        await voting.vote(votes2, { from: voter2 });
        await voting.validate();
        await expectRevert(
            voting.enact(),
            'Failed to enact proposal.',
        );
    });
});
