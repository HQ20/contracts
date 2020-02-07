import { should } from 'chai';
import { TwoTieredInstance } from '../../types/truffle-contracts';

const TwoTiered = artifacts.require('./access/TwoTiered.sol') as Truffle.Contract<TwoTieredInstance>;
should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../utils');

/** @test {TwoTiered} contract */
contract('TwoTiered', (accounts) => {
    let twoTiered: TwoTieredInstance;
    const root = accounts[0];
    const user1 = accounts[1];

    beforeEach(async () => {
        twoTiered = await TwoTiered.new(root);
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
    itShouldThrow(
        'addUser throws if not called by an admin account.',
        async () => {
            await twoTiered.addUser(user1, { from: user1 });
        },
        'Restricted to admins.',
    );

    /**
     * @test {TwoTiered#removeUser}
     */
    itShouldThrow(
        'removeUser throws if not called by an admin account.',
        async () => {
            await twoTiered.removeUser(user1, { from: user1 });
        },
        'Restricted to admins.',
    );

    /**
     * @test {TwoTiered#removeUser}
     */
    itShouldThrow(
        'removeUser throws if the account is not an user.',
        async () => {
            await twoTiered.removeUser(user1, { from: root });
        },
        'Address is not member of role.',
    );

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
         * @test {TwoTiered#addUser}
         */
        itShouldThrow(
            'addUser throws if the account is already an user.',
            async () => {
                await twoTiered.addUser(user1, { from: root });
            },
            'Address is member of role.',
        );

        /**
         * @test {TwoTiered#removeUser}
         */
        it('removeUser removes an user.', async () => {
            await twoTiered.removeUser(user1, { from: root });
            assert.isFalse(await twoTiered.isUser(user1));
        });
    });
});
