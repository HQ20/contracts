import { should } from 'chai';
import { RolesMockInstance } from '../../types/truffle-contracts';
const { /* expectEvent, */ expectRevert } = require('@openzeppelin/test-helpers');

const Roles = artifacts.require('RolesMock') as Truffle.Contract<RolesMockInstance>;
should();


contract('Roles', (accounts) => {
    let roles: RolesMockInstance;
    const ADDED_ROLE = web3.utils.fromAscii('ADDED');
    const user1 = accounts[1];
    const user2 = accounts[2];

    beforeEach(async () => {
        roles = await Roles.new();
    });

    it('replies whether a role does not exist', async () => {
        assert.isFalse(await roles.roleExists(ADDED_ROLE));
    });

    it('does not add members to non existing roles', async () => {
        await expectRevert(
            roles.addMember(user1, ADDED_ROLE),
            'Role doesn\'t exist.',
        );
    });

    it('does not remove members from non existing roles', async () => {
        await expectRevert(
            roles.removeMember(user1, ADDED_ROLE),
            'Role doesn\'t exist.',
        );
    });

    it('does not check membership for non existing roles.', async () => {
        await expectRevert(
            roles.hasRole(user1, ADDED_ROLE),
            'Role doesn\'t exist.',
        );
    });

    it('adds a new role.', async () => {
        const roleId = (
            await roles.addRole(ADDED_ROLE)
        ).logs[0].args.roleId;
        assert.isTrue(await roles.roleExists(roleId));
    });

    describe('with existing roles', () => {
        beforeEach(async () => {
            await roles.addRole(ADDED_ROLE);
        });

        it('replies whether a role exists.', async () => {
            assert.isTrue(await roles.roleExists(ADDED_ROLE));
        });

        it('replies if a member doe not belong to a role.', async () => {
            assert.isFalse(await roles.hasRole(user1, ADDED_ROLE));
        });

        it('does not remove a member from a the role it does not belong to.', async () => {
            await expectRevert(
                roles.removeMember(user1, ADDED_ROLE),
                'Address is not member of role.',
            );
        });

        it('adds a member to a role.', async () => {
            await roles.addMember(user1, ADDED_ROLE);
            assert.isTrue(await roles.hasRole(user1, ADDED_ROLE));
        });

        describe('with existing memberships', () => {
            beforeEach(async () => {
                await roles.addMember(user1, ADDED_ROLE);
            });

            it('does not add a member to a role he already belongs to.', async () => {
                await expectRevert(
                    roles.addMember(user1, ADDED_ROLE),
                    'Address is member of role.',
                );
            });

            it('removes a member from a role.', async () => {
                await roles.removeMember(user1, ADDED_ROLE);
                assert.isFalse(await roles.hasRole(user1, ADDED_ROLE));
            });

            // Test roles.enumerateMembers(ADDED_ROLE)
        });
    });
});
