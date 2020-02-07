import { should } from 'chai';
import { SuperAdminInstance } from '../../types/truffle-contracts';

const SuperAdmin = artifacts.require('./access/SuperAdmin.sol') as Truffle.Contract<SuperAdminInstance>;
should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../utils');

/** @test {SuperAdmin} contract */
contract('SuperAdmin', (accounts) => {
    let superAdmin: SuperAdminInstance;
    const root = accounts[0];
    const user1 = accounts[1];

    beforeEach(async () => {
        superAdmin = await SuperAdmin.new(root);
    });

    /**
     * @test {SuperAdmin#isUser}
     */
    it('isUser returns false for non existing users', async () => {
        assert.isFalse(await superAdmin.isUser(user1));
    });

    /**
     * @test {SuperAdmin#addUser}
     */
    itShouldThrow(
        'addUser throws if not called by an admin account.',
        async () => {
            await superAdmin.addUser(user1, { from: user1 });
        },
        'Restricted to admins.',
    );

    /**
     * @test {SuperAdmin#removeUser}
     */
    itShouldThrow(
        'removeUser throws if not called by an admin account.',
        async () => {
            await superAdmin.removeUser(user1, { from: user1 });
        },
        'Restricted to admins.',
    );

    /**
     * @test {SuperAdmin#removeUser}
     */
    itShouldThrow(
        'removeUser throws if the account is not an user.',
        async () => {
            await superAdmin.removeUser(user1, { from: root });
        },
        'Address is not member of role.',
    );

    /**
     * @test {SuperAdmin#addUser} and {SuperAdmin#isUser}
     */
    it('addUser adds an account as an user.', async () => {
        await superAdmin.addUser(user1, { from: root });
        assert.isTrue(await superAdmin.isUser(user1));
    });

    describe('with existing users', () => {
        beforeEach(async () => {
            await superAdmin.addUser(user1, { from: root });
        });

        /**
         * @test {SuperAdmin#addUser}
         */
        itShouldThrow(
            'addUser throws if the account is already an user.',
            async () => {
                await superAdmin.addUser(user1, { from: root });
            },
            'Address is member of role.',
        );

        /**
         * @test {SuperAdmin#removeUser}
         */
        it('removeUser removes an user.', async () => {
            await superAdmin.removeUser(user1, { from: root });
            assert.isFalse(await superAdmin.isUser(user1));
        });
    });
});
