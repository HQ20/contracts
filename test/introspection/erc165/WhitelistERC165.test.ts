import { should } from 'chai';
import { WhitelistERC165Instance } from '../../../types/truffle-contracts';

const WhitelistERC165 = artifacts.require(
    './examples/introspection/erc165/WhitelistERC165.sol',
) as Truffle.Contract<WhitelistERC165Instance>;
should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../../utils');

/** @test {Whitelist} contract */
contract('Whitelist', (accounts) => {
    let whitelist: WhitelistERC165Instance;
    const root = accounts[0];
    const user1 = accounts[1];

    beforeEach(async () => {
        whitelist = await WhitelistERC165.new();
    });

    /**
     * @test {Whitelist#isMember}
     */
    it('isMember returns false for non existing memberships', async () => {
        assert.isFalse(await whitelist.isMember(user1));
    });

    /**
     * @test {Whitelist#addMember}
     */
    it('addMember adds a member to the whitelist.', async () => {
        await whitelist.addMember(user1, { from: root });
        assert.isTrue(await whitelist.isMember(user1));
    });

    /**
     * @test {Whitelist#addMember}
     */
    itShouldThrow(
        'addMember throws if the member already belongs to the whitelist.',
        async () => {
            await whitelist.addMember(user1, { from: root });
            await whitelist.addMember(user1, { from: root });
        },
        'Address is member already.',
    );

    /**
     * @test {Whitelist#removeMember}
     */
    itShouldThrow(
        'removeMember throws if the member doesn\'t belong to the whitelist.',
        async () => {
            await whitelist.removeMember(user1, { from: root });
        },
        'Not member of whitelist.',
    );

    /**
     * @test {Whitelist#removeMember}
     */
    it('removeMember removes a member from a role.', async () => {
        await whitelist.addMember(user1, { from: root });
        assert.isTrue(await whitelist.isMember(user1));
        await whitelist.removeMember(user1, { from: root });
        assert.isFalse(await whitelist.isMember(user1));
    });
});
