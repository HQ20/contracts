import { should } from 'chai';
import { RolesMockInstance } from '../../types/truffle-contracts';
// tslint:disable:no-var-requires
const { expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

const Roles = artifacts.require('RolesMock') as Truffle.Contract<RolesMockInstance>;
should();


contract('Roles', (accounts) => {
    let roles: RolesMockInstance;
    const ADDED_ROLE = stringToBytes32('ADDED');
    const user1 = accounts[1];
    const user2 = accounts[2];

    beforeEach(async () => {
        roles = await Roles.new();
    });

    it('roles that do not exist do not have members', async () => {
        assert.isFalse(await roles.hasRole(user1, ADDED_ROLE));
        const members = await roles.enumerateMembers(ADDED_ROLE);
        expect(members).to.have.members([]);
    });

    describe('with existing roles', () => {
        beforeEach(async () => {
            // await roles.addRole(ADDED_ROLE);
        });

        it('replies if a member does not belong to a role.', async () => {
            assert.isFalse(await roles.hasRole(user1, ADDED_ROLE));
        });

        it('does not remove a member from a the role it does not belong to.', async () => {
            await expectRevert(
                roles.removeMember(user1, ADDED_ROLE),
                'Address is not member of role.',
            );
        });

        it('adds a member to a role.', async () => {
            await expectEvent(
                await roles.addMember(user1, ADDED_ROLE),
                'MemberAdded',
                {
                    roleId: ADDED_ROLE,
                    member: user1,
                },
            );
            assert.isTrue(await roles.hasRole(user1, ADDED_ROLE));
        });

        describe('with existing memberships', () => {
            beforeEach(async () => {
                await roles.addMember(user1, ADDED_ROLE);
                await roles.addMember(user2, ADDED_ROLE);
            });

            it('does not add a member to a role he already belongs to.', async () => {
                await expectRevert(
                    roles.addMember(user1, ADDED_ROLE),
                    'Address is member of role.',
                );
            });

            it('removes a member from a role.', async () => {
                expectEvent(
                    await roles.removeMember(user1, ADDED_ROLE),
                    'MemberRemoved',
                    {
                        roleId: ADDED_ROLE,
                        member: user1,
                    },
                );
                assert.isFalse(await roles.hasRole(user1, ADDED_ROLE));
            });

            it('enumerates the members from a role.', async () => {
                const members = await roles.enumerateMembers(ADDED_ROLE);
                expect(members).to.have.members([user1, user2]);
            });
        });
    });
});

function stringToBytes32(text: string) {
    let result = web3.utils.fromAscii(text);
    while (result.length < 66) result += '0'; // 0x + 64 digits
    return result
}