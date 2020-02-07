import { should } from 'chai';
import { RBACInstance } from '../../types/truffle-contracts';

const RBAC = artifacts.require('./access/RBAC.sol') as Truffle.Contract<RBACInstance>;
should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../utils');

contract('RBAC', (accounts) => {
    let rbac: RBACInstance;
    const root = accounts[1];
    // const NO_ROLE = '0x0';
    const ADDED_ROLE = web3.utils.fromAscii('ADDED');
    const user1 = accounts[2];
    const user2 = accounts[3];

    beforeEach(async () => {
        rbac = await RBAC.new();
    });

    it('roleExists returns false for non existing roles', async () => {
        assert.isFalse(await rbac.roleExists(ADDED_ROLE));
    });

    itShouldThrow(
        'addMember throws on non existing roles',
        async () => {
            await rbac.addMember(user1, ADDED_ROLE);
        },
        'Role doesn\'t exist.',
    );

    itShouldThrow(
        'removeMember throws on non existing roles',
        async () => {
            await rbac.removeMember(user1, ADDED_ROLE);
        },
        'Role doesn\'t exist.',
    );

    itShouldThrow(
        'hasRole throws for non existing roles.',
        async () => {
            await rbac.hasRole(user1, ADDED_ROLE);
        },
        'Role doesn\'t exist.',
    );

    it('addRole adds a new role.', async () => {
        const roleId = (
            await rbac.addRole(ADDED_ROLE)
        ).logs[0].args.roleId;
        assert.isTrue(await rbac.roleExists(roleId));
    });

    describe('with existing roles', () => {
        beforeEach(async () => {
            await rbac.addRole(ADDED_ROLE);
        });

        it('roleExists returns true for existing roles', async () => {
            assert.isTrue(await rbac.roleExists(ADDED_ROLE));
        });

        it('hasRole returns false for non existing memberships', async () => {
            assert.isFalse(await rbac.hasRole(user1, ADDED_ROLE));
        });

        itShouldThrow(
            'removeMember throws if the member doesn\'t belong to the role.',
            async () => {
                await rbac.removeMember(user1, ADDED_ROLE);
            },
            'Address is not member of role.',
        );

        it('addMember adds a member to a role.', async () => {
            await rbac.addMember(user1, ADDED_ROLE);
            assert.isTrue(await rbac.hasRole(user1, ADDED_ROLE));
        });

        describe('with existing memberships', () => {
            beforeEach(async () => {
                await rbac.addMember(user1, ADDED_ROLE);
            });

            itShouldThrow(
                'addMember throws if the member already belongs to the role.',
                async () => {
                    await rbac.addMember(user1, ADDED_ROLE);
                },
                'Address is member of role.',
            );

            it('removeMember removes a member from a role.', async () => {
                await rbac.removeMember(user1, ADDED_ROLE);
                assert.isFalse(await rbac.hasRole(user1, ADDED_ROLE));
            });
        });
    });
});
