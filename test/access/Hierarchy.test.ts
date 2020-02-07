import { should } from 'chai';
import { HierarchyInstance } from '../../types/truffle-contracts';

const Hierarchy = artifacts.require('Hierarchy') as Truffle.Contract<HierarchyInstance>;
should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../utils');

/** @test {Hierarchy} contract */
contract('Hierarchy', (accounts) => {
    let hierarchy: HierarchyInstance;
    const ROOT_ROLE_ID = stringToBytes32('ROOT');
    const ADDED_ROLE_ID = stringToBytes32('ADDED');
    const root = accounts[0];
    const user1 = accounts[1];

    beforeEach(async () => {
        hierarchy = await Hierarchy.new(root);
    });

    /**
     * @test {Hierarchy#isMember}
     */
    it('isMember returns true for members of a role', async () => {
        assert.isTrue(await hierarchy.isMember(root, ROOT_ROLE_ID));
        assert.isFalse(await hierarchy.isMember(user1, ROOT_ROLE_ID));
    });

    /**
     * @test {Hierarchy#isAdmin}
     */
    it('isAdmin returns true for admins', async () => {
        assert.isTrue(await hierarchy.isAdmin(root, ROOT_ROLE_ID));
        assert.isFalse(await hierarchy.isAdmin(user1, ROOT_ROLE_ID));
    });

    /**
     * @test {Hierarchy#addRole}
     */
    itShouldThrow(
        'addRole throws if not called by a member of the admin role.',
        async () => {
            await hierarchy.addRole(ADDED_ROLE_ID, ROOT_ROLE_ID, { from: user1 });
        },
        'Restricted to members.',
    );

    /**
     * @test {Hierarchy#addMember}
     */
    itShouldThrow(
        'addMember throws if not called by a member of the admin role.',
        async () => {
            await hierarchy.addMember(user1, ROOT_ROLE_ID, { from: user1 });
        },
        'Restricted to admins.',
    );

    /**
     * @test {Hierarchy#removeMember}
     */
    itShouldThrow(
        'removeMember throws if not called by a member of the admin role.',
        async () => {
            await hierarchy.removeMember(user1, ROOT_ROLE_ID, { from: user1 });
        },
        'Restricted to admins.',
    );

    /**
     * @test {Hierarchy#addMember}
     */
    it('addMember adds an account to a role.', async () => {
        await hierarchy.addMember(user1, ROOT_ROLE_ID, { from: root });
        assert.isTrue(await hierarchy.isMember(user1, ROOT_ROLE_ID));
    });
});

function stringToBytes32(text: string) {
    return web3.utils.fromAscii(text);
}

function bytes32ToString(text: string) {
    return web3.utils.toAscii(text).replace(/\0/g, '');
}
