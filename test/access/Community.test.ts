import { should } from 'chai';
import { CommunityInstance } from '../../types/truffle-contracts';

const Community = artifacts.require('Community') as Truffle.Contract<CommunityInstance>;
should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../utils');

/** @test {Community} contract */
contract('Community', (accounts) => {
    let community: CommunityInstance;
    const root = accounts[0];
    const user1 = accounts[1];

    beforeEach(async () => {
        community = await Community.new(root);
    });

    /**
     * @test {Community#isMember}
     */
    it('isMember returns false for non existing members', async () => {
        assert.isFalse(await community.isMember(user1));
    });

    /**
     * @test {Community#addMember}
     */
    itShouldThrow(
        'addMember throws if not called by a member.',
        async () => {
            await community.addMember(user1, { from: user1 });
        },
        'Restricted to members.',
    );

    /**
     * @test {Community#addMember} and {Community#isMember}
     */
    it('addMember adds an account as an user.', async () => {
        await community.addMember(user1, { from: root });
        assert.isTrue(await community.isMember(user1));
    });

    describe('with existing users', () => {
        beforeEach(async () => {
            await community.addMember(user1, { from: root });
        });

        /**
         * @test {Community#removeMember}
         */
        it('renounceMembership removes a member from the community.', async () => {
            await community.leaveCommunity({ from: user1 });
            assert.isFalse(await community.isMember(user1));
        });
    });
});
