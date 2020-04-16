import * as chai from 'chai';
// tslint:disable-next-line:no-var-requires
const { BN, ether, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
import { ERC20MintableInstance, OneManOneVoteInstance } from '../../types/truffle-contracts';

const Voting = artifacts.require('OneManOneVote') as Truffle.Contract<OneManOneVoteInstance>;
const ERC20Mintable = artifacts.require(
        'ERC20Mintable'
    ) as Truffle.Contract<ERC20MintableInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('OneManOneVote', (accounts) => {

    const owner = accounts[0];
    const officer = accounts[1];
    const voter1 = accounts[2];
    const voter2 = accounts[3];
    const threshold = 5000;

    let voting: OneManOneVoteInstance;
    let votedToken: ERC20MintableInstance;

    beforeEach(async () => {
        votedToken = await ERC20Mintable.new('VotedToken', 'VTD', 18);
        voting = await Voting.new(
            officer,
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
        await votedToken.addAdmin(voting.address);
        await voting.addUser(voter1, { from: officer });
        await voting.addUser(voter2, { from: officer });
    });

    /**
     * @test {Voting#validate}
     */
    it('cannot validate the vote', async () => {
        await expectRevert(
            voting.validate({ from: officer }),
            'Not enough votes to pass.'
        );
    });

    /**
     * @test {Voting#vote}
     */
    it('votes can be casted', async () => {
        expectEvent(
            await voting.vote({ from: voter1 }),
            'VoteCasted',
            {
                voter: voter1,
            },
        );
    });

    describe('once voted', () => {

        beforeEach(async () => {
            await voting.vote({ from: voter1 });
            await voting.vote({ from: voter2 });
        });

        /**
         * @test {Voting#enact}
         */
        it('cannot enact proposal yet', async () => {
            await expectRevert(
                voting.enact({ from: officer }),
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
                },
            );
        });

        /**
         * @test {Voting#validate}
         */
        it('can validate the vote', async () => {
            await voting.validate({ from: officer });
            (await voting.passed()).should.be.true;
        });

        describe('once validated', () => {

            beforeEach(async () => {
                await voting.validate({ from: officer });
            });

            /**
             * @test {Voting#enact}
             */
            it('proposals can be enacted', async () => {
                expectEvent(
                    await voting.enact({ from: officer }),
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
            officer,
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
        await voting.addUser(voter1, { from: officer });
        await voting.addUser(voter2, { from: officer });
        await voting.vote({ from: voter1 });
        await voting.vote({ from: voter2 });
        await voting.validate({ from: officer });
        await expectRevert(
            voting.enact({ from: officer }),
            'Failed to enact proposal.',
        );
    });
});
