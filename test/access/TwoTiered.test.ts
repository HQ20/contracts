import { should } from 'chai';
import { AdministeredInstance } from '../../types/truffle-contracts';
// tslint:disable:no-var-requires
const { expectRevert } = require('@openzeppelin/test-helpers');

const Administered = artifacts.require('Administered') as Truffle.Contract<AdministeredInstance>;
should();

/** @test {Administered} contract */
contract('Administered', (accounts) => {
    let administered: AdministeredInstance;
    const root = accounts[0];
    const user1 = accounts[1];

    beforeEach(async () => {
        administered = await Administered.new(root);
    });

    /**
     * @test {Administered#isAdmin}
     */
    it('isAdmin returns true for admins', async () => {
        assert.isTrue(await administered.isAdmin(root));
        assert.isFalse(await administered.isAdmin(user1));
    });

    /**
     * @test {Administered#isUser}
     */
    it('isUser returns false for non existing users', async () => {
        assert.isFalse(await administered.isUser(user1));
    });

    /**
     * @test {Administered#addUser}
     */
    it('addUser throws if not called by an admin account.', async () => {
        await expectRevert(
            administered.addUser(user1, { from: user1 }),
            'Restricted to admins.',
        );
    });

    /**
     * @test {Administered#addAdmin}
     */
    it('addAdmin throws if not called by an admin account.', async () => {
        await expectRevert(
            administered.addAdmin(user1, { from: user1 }),
            'Restricted to admins.',
        );
    });

    /**
     * @test {Administered#renounceAdmin}
     */
    it('renounceAdmin removes an user from the admin role.', async () => {
        await administered.renounceAdmin({ from: root });
        assert.isFalse(await administered.isAdmin(root));
    });

    /**
     * @test {Administered#removeUser}
     */
    it('removeUser throws if not called by an admin account.', async () => {
        await expectRevert(
            administered.removeUser(user1, { from: user1 }),
            'Restricted to admins.',
        );
    });

    /**
     * @test {Administered#addUser} and {Administered#isUser}
     */
    it('addUser adds an account as an user.', async () => {
        await administered.addUser(user1, { from: root });
        assert.isTrue(await administered.isUser(user1));
    });

    /**
     * @test {Administered#addUser} and {Administered#isUser}
     */
    it('addAdmin adds an account as an admin.', async () => {
        await administered.addAdmin(user1, { from: root });
        assert.isTrue(await administered.isAdmin(user1));
    });

    describe('with existing users', () => {
        beforeEach(async () => {
            await administered.addUser(user1, { from: root });
        });

        /**
         * @test {Administered#removeUser}
         */
        it('removeUser removes an user.', async () => {
            await administered.removeUser(user1, { from: root });
            assert.isFalse(await administered.isUser(user1));
        });
    });
});
