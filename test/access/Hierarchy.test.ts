import { should } from 'chai';
import { HierarchyInstance } from '../../types/truffle-contracts';
// tslint:disable:no-var-requires
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const Hierarchy = artifacts.require('Hierarchy') as Truffle.Contract<HierarchyInstance>;
should();

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
    it('addRole throws if not called by a member of the admin role.', async () => {
        await expectRevert(
            hierarchy.addRole(ADDED_ROLE_ID, ROOT_ROLE_ID, { from: user1 }),
            'Restricted to members.',
        );
    });

    /**
     * @test {Hierarchy#addMember}
     */
    it('addMember throws if not called by a member of the admin role.', async () => {
        await expectRevert(
            hierarchy.addMember(user1, ROOT_ROLE_ID, { from: user1 }),
            'Restricted to admins.',
        );
    });

    /**
     * @test {Hierarchy#removeMember}
     */
    it('removeMember throws if not called by a member of the admin role.', async () => {
        await expectRevert(
            hierarchy.removeMember(user1, ROOT_ROLE_ID, { from: user1 }),
            'Restricted to admins.',
        );
    });

    /**
     * @test {Hierarchy#addMember}
     */
    it('addMember adds an account to a role.', async () => {
        await hierarchy.addMember(user1, ROOT_ROLE_ID, { from: root });
        assert.isTrue(await hierarchy.isMember(user1, ROOT_ROLE_ID));
    });

    /**
     * @test {Hierarchy#addMember}
     */
    it('adds a role.', async () => {
        expectEvent(
            await hierarchy.addRole(ADDED_ROLE_ID, ROOT_ROLE_ID, { from: root }),
            'AdminRoleSet',
            {
                roleId: ADDED_ROLE_ID,
                adminRoleId: ROOT_ROLE_ID,
            },
        );
        assert.isTrue(await hierarchy.roleExists(ADDED_ROLE_ID));
    });

    describe('with existing users and roles', () => {
        beforeEach(async () => {
            await hierarchy.addRole(ADDED_ROLE_ID, ROOT_ROLE_ID, { from: root });
            await hierarchy.addMember(user1, ADDED_ROLE_ID, { from: root });
        });

        /**
         * @test {Community#removeMember}
         */
        it('removeMember removes a member from a role.', async () => {
            await hierarchy.removeMember(user1, ADDED_ROLE_ID, { from: root });
            assert.isFalse(await hierarchy.isMember(user1, ADDED_ROLE_ID));
        });
    });
});

function stringToBytes32(text: string) {
    let result = web3.utils.fromAscii(text);
    while (result.length < 66) result += '0'; // 0x + 64 digits
    return result
}

function bytes32ToString(text: string) {
    return web3.utils.toAscii(text).replace(/\0/g, '');
}
