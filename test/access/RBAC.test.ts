import { should } from 'chai';
import { RBACInstance } from '../../types/truffle-contracts';

const RBAC = artifacts.require('./access/RBAC.sol') as Truffle.Contract<RBACInstance>;
should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../utils');

contract('RBAC', (accounts) => {
    let rbac: RBACInstance;
    const ADDED_ROLE = web3.utils.fromAscii('ADDED');
    const user1 = accounts[1];
    const user2 = accounts[2];

    beforeEach(async () => {
        rbac = await RBAC.new();
    });

    it('replies whether a role does not exist', async () => {
        assert.isFalse(await rbac.roleExists(ADDED_ROLE));
    });

    itShouldThrow(
        'does not add members to non existing roles',
        async () => {
            await rbac.addMember(user1, ADDED_ROLE);
        },
        'Role doesn\'t exist.',
    );

    itShouldThrow(
        'does not remove members from non existing roles',
        async () => {
            await rbac.removeMember(user1, ADDED_ROLE);
        },
        'Role doesn\'t exist.',
    );

    itShouldThrow(
        'does not check membership for non existing roles.',
        async () => {
            await rbac.hasRole(user1, ADDED_ROLE);
        },
        'Role doesn\'t exist.',
    );

    it('adds a new role.', async () => {
        const roleId = (
            await rbac.addRole(ADDED_ROLE)
        ).logs[0].args.roleId;
        assert.isTrue(await rbac.roleExists(roleId));
    });

    describe('with existing roles', () => {
        beforeEach(async () => {
            await rbac.addRole(ADDED_ROLE);
        });

        it('replies whether a role exists.', async () => {
            assert.isTrue(await rbac.roleExists(ADDED_ROLE));
        });

        it('replies if a member doe not belong to a role.', async () => {
            assert.isFalse(await rbac.hasRole(user1, ADDED_ROLE));
        });

        itShouldThrow(
            'does not remove a member from a the role it does not belong to.',
            async () => {
                await rbac.removeMember(user1, ADDED_ROLE);
            },
            'Address is not member of role.',
        );

        it('adds a member to a role.', async () => {
            await rbac.addMember(user1, ADDED_ROLE);
            assert.isTrue(await rbac.hasRole(user1, ADDED_ROLE));
        });

        describe('with existing memberships', () => {
            beforeEach(async () => {
                await rbac.addMember(user1, ADDED_ROLE);
            });

            itShouldThrow(
                'does not add a member to a role he already belongs to.',
                async () => {
                    await rbac.addMember(user1, ADDED_ROLE);
                },
                'Address is member of role.',
            );

            it('removes a member from a role.', async () => {
                await rbac.removeMember(user1, ADDED_ROLE);
                assert.isFalse(await rbac.hasRole(user1, ADDED_ROLE));
            });

            // Test rbac.enumerateMembers(ADDED_ROLE)
        });
    });
});
