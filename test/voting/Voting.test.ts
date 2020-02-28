import * as chai from 'chai';
// tslint:disable-next-line:no-var-requires
const { BN, ether, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
import { ERC20MintableDetailedInstance, VotingInstance, IssuanceEthInstance } from '../../types/truffle-contracts';

const IssuanceEth = artifacts.require('IssuanceEth') as Truffle.Contract<IssuanceEthInstance>;
const Voting = artifacts.require('Voting') as Truffle.Contract<VotingInstance>;
const ERC20MintableDetailed = artifacts.require(
        'ERC20MintableDetailed'
    ) as Truffle.Contract<ERC20MintableDetailedInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('Voting', (accounts) => {

    const owner = accounts[0];
    const voter1 = accounts[1];
    const voter2 = accounts[2];
    const issuePrice = ether('0.5');
    const threshold = 5000;
    const balance1 = ether('10');
    const balance2 = ether('10');
    const votes1 = ether('8');
    const votes2 = ether('4');
    const issued = ether('0.5');

    let voting: VotingInstance;
    let issuanceEth: IssuanceEthInstance;
    let votingToken: ERC20MintableDetailedInstance;

    beforeEach(async () => {
        votingToken = await ERC20MintableDetailed.new('VotingToken', 'VOT', 18);
        issuanceEth = await IssuanceEth.new(votingToken.address);
        await votingToken.addMinter(issuanceEth.address);
        await issuanceEth.setIssuePrice(issuePrice);
        await issuanceEth.startIssuance();
        voting = await Voting.new(
            votingToken.address,
            threshold
        );
        await votingToken.mint(voter1, balance1);
        await votingToken.mint(voter2, balance2);
        await votingToken.approve(voting.address, votes1, { from: voter1 });
        await votingToken.approve(voting.address, votes2, { from: voter2 });
    });

    /**
     * @test {Voting#cast}
     */
    it('cannot cast vote if state is not "OPEN"', async () => {
        await expectRevert(
            voting.cast(votes1, { from: voter1 }),
            'Not open for voting.',
        );
    });

    it('can register proposals', async () => {
        expectEvent(
            await voting.registerProposal(
                issuanceEth.address,
                web3.eth.abi.encodeFunctionCall({
                    type: 'function',
                    name: 'invest',
                    payable: true,
                    inputs: [],
                }, [])
            ),
            'ProposalRegistered',
        );
            votingToken.address,
            web3.eth.abi.encodeFunctionCall({
                type: 'function',
                name: 'approve',
                inputs: [{
                    name: 'spender',
                    type: 'address',
                }, {
                    name: 'amount',
                    type: 'uint256',
                }]
            }, [owner, issued.toString()])
    });

    /**
     * @test {Voting#open}
     */
    it('can open the voting process', async () => {
        await voting.open();
        bytes32ToString(await voting.currentState()).should.be.equal('OPEN');
    });

    describe('after opening the vote', () => {

        beforeEach(async () => {
            await voting.registerProposal(
                issuanceEth.address,
                web3.eth.abi.encodeFunctionCall({
                    type: 'function',
                    name: 'invest',
                    payable: true,
                    inputs: [],
                }, [])
            );
            await voting.registerProposal(
                issuanceEth.address,
                web3.eth.abi.encodeFunctionCall({
                    type: 'function',
                    name: 'claim',
                    inputs: [],
                }, [])
            );
            await voting.registerProposal(
                votingToken.address,
                web3.eth.abi.encodeFunctionCall({
                    type: 'function',
                    name: 'approve',
                    inputs: [{
                        name: 'spender',
                        type: 'address',
                    }, {
                        name: 'amount',
                        type: 'uint256',
                    }],
                }, [owner, issued.toString()])
            );
            await voting.open();
        });

        /**
         * @test {Voting#cancel}
         */
        it('voters cannot cancel vote if not casted', async () => {
            await expectRevert(
                voting.cancel({ from: voter1 }),
                'No votes casted.',
            );
        });

        /**
         * @test {Voting#cast}
         */
        it('votes can be casted', async () => {
            expectEvent(
                await voting.cast(votes1, { from: voter1 }),
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
            await voting.cast(votes1, { from: voter1 }),
            await expectRevert(
                voting.validate(),
                'Not enough votes to meet the threshold.'
            );
        });

        describe('once voted', () => {

            beforeEach(async () => {
                await voting.cast(votes1, { from: voter1 });
                await voting.cast(votes2, { from: voter2 });
            });

            /**
             * @test {Voting#enact}
             */
            it('cannot enact proposal yet', async () => {
                await expectRevert(
                    voting.enact(),
                    'Cannot enact proposal until vote passes.',
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
                bytes32ToString(await voting.currentState()).should.be.equal('PASSED');
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
                        await voting.enact({ value: ether('1').toString() }),
                        'ProposalEnacted',
                    );
                    issuanceEth.startDistribution();
                    expectEvent(
                        await voting.enact(),
                        'ProposalEnacted',
                    );
                    expectEvent(
                        await voting.enact(),
                        'ProposalEnacted',
                    );
                    await votingToken.transferFrom(voting.address, owner, issued);
                    BN(await votingToken.balanceOf(owner)).should.be.bignumber.equal(issued);
                });

                /**
                 * @test {Voting#enact}
                 */
                it('no proposals can be enacted any further', async () => {
                    await voting.enact({ value: ether('1').toString() }),
                    issuanceEth.startDistribution();
                    await voting.enact(),
                    await voting.enact(),
                    await expectRevert(
                        voting.enact(),
                        'No more proposals to enact.',
                    );
                });
            });
        });
    });
});

function bytes32ToString(text: string) {
    return web3.utils.toAscii(text).replace(/\0/g, '');
}
