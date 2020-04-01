import { should } from 'chai';
import { HierarchyInstance } from '../../types/truffle-contracts';
// tslint:disable:no-var-requires
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const Hierarchy = artifacts.require('Hierarchy') as Truffle.Contract<HierarchyInstance>;
should();

/** @test {Hierarchy} contract */
contract('Hierarchy', (accounts) => {
    let hierarchy: HierarchyInstance;
    const ROOT_ROLE = stringToBytes32('');
    const ADDED_ROLE = stringToBytes32('ADDED');
    const root = accounts[0];
    const user1 = accounts[1];

    beforeEach(async () => {
        hierarchy = await Hierarchy.new(root);
    });

    /**
     * @test {Hierarchy#hasRole}
     */
    it('hasRole returns true for members of a role', async () => {
        assert.isTrue(await hierarchy.hasRole(ROOT_ROLE, root));
        assert.isFalse(await hierarchy.hasRole(ROOT_ROLE, user1));
    });

    /**
     * @test {Hierarchy#addRole}
     */
    it('addRole throws if not called by a member of the admin role.', async () => {
        await expectRevert(
            hierarchy.addRole(ADDED_ROLE, ROOT_ROLE, { from: user1 }),
            'Restricted to members.',
        );
    });

    /**
     * @test {Hierarchy#grantRole}
     */
    it('grantRole throws if not called by a member of the admin role.', async () => {
        await expectRevert(
            hierarchy.grantRole(ROOT_ROLE, user1, { from: user1 }),
            'AccessControl: sender must be an admin to grant',
        );
    });

    /**
     * @test {Hierarchy#revokeRole}
     */
    it('revokeRole throws if not called by a member of the admin role.', async () => {
        await expectRevert(
            hierarchy.revokeRole(ROOT_ROLE, user1, { from: user1 }),
            'AccessControl: sender must be an admin to revoke',
        );
    });

    /**
     * @test {Hierarchy#grantRole}
     */
    it('grantRole adds an account to a role.', async () => {
        await hierarchy.grantRole(ROOT_ROLE, user1, { from: root });
        assert.isTrue(await hierarchy.hasRole(ROOT_ROLE, user1));
    });

    /**
     * @test {Hierarchy#grantRole}
     */
    it('adds an admin role.', async () => {
        expectEvent(
            await hierarchy.addRole(ADDED_ROLE, ROOT_ROLE, { from: root }),
            'AdminRoleSet',
            {
                roleId: ADDED_ROLE,
                adminRoleId: ROOT_ROLE,
            },
        );
        // assert.equal(await hierarchy.getAdminRole(ADDED_ROLE), ROOT_ROLE);
    });

    describe('with existing users and roles', () => {
        beforeEach(async () => {
            await hierarchy.addRole(ADDED_ROLE, ROOT_ROLE, { from: root });
            await hierarchy.grantRole(ADDED_ROLE, user1, { from: root });
        });

        /**
         * @test {Community#revokeRole}
         */
        it('revokeRole removes a member from a role.', async () => {
            await hierarchy.revokeRole(ADDED_ROLE, user1, { from: root });
            assert.isFalse(await hierarchy.hasRole(ADDED_ROLE, user1));
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
