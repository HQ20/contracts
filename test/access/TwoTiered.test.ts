import { should } from 'chai';
import { TwoTieredInstance } from '../../types/truffle-contracts';
// tslint:disable:no-var-requires
const { expectRevert } = require('@openzeppelin/test-helpers');

const TwoTiered = artifacts.require('TwoTiered') as Truffle.Contract<TwoTieredInstance>;
should();

/** @test {TwoTiered} contract */
contract('TwoTiered', (accounts) => {
    let twoTiered: TwoTieredInstance;
    const root = accounts[0];
    const user1 = accounts[1];

    beforeEach(async () => {
        twoTiered = await TwoTiered.new(root);
    });

    /**
     * @test {TwoTiered#isAdmin}
     */
    it('isAdmin returns true for admins', async () => {
        assert.isTrue(await twoTiered.isAdmin(root));
        assert.isFalse(await twoTiered.isAdmin(user1));
    });

    /**
     * @test {TwoTiered#isUser}
     */
    it('isUser returns false for non existing users', async () => {
        assert.isFalse(await twoTiered.isUser(user1));
    });

    /**
     * @test {TwoTiered#addUser}
     */
    it('addUser throws if not called by an admin account.', async () => {
        await expectRevert(
            twoTiered.addUser(user1, { from: user1 }),
            'Restricted to admins.',
        );
    });

    /**
     * @test {TwoTiered#renounceAdmin}
     */
    it('renounceAdmin removes an user from the admin role.', async () => {
        await twoTiered.renounceAdmin({ from: root });
        assert.isFalse(await twoTiered.isAdmin(root));
    });

    /**
     * @test {TwoTiered#removeUser}
     */
    it('removeUser throws if not called by an admin account.', async () => {
        await expectRevert(
            twoTiered.removeUser(user1, { from: user1 }),
            'Restricted to admins.',
        );
    });

    /**
     * @test {TwoTiered#addUser} and {TwoTiered#isUser}
     */
    it('addUser adds an account as an user.', async () => {
        await twoTiered.addUser(user1, { from: root });
        assert.isTrue(await twoTiered.isUser(user1));
    });

    describe('with existing users', () => {
        beforeEach(async () => {
            await twoTiered.addUser(user1, { from: root });
        });

        /**
         * @test {TwoTiered#removeUser}
         */
        it('removeUser removes an user.', async () => {
            await twoTiered.removeUser(user1, { from: root });
            assert.isFalse(await twoTiered.isUser(user1));
        });
    });
});
