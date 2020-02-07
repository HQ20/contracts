import { should } from 'chai';
import { HierarchicalInstance } from '../../types/truffle-contracts';

const Hierarchical = artifacts.require('Hierarchical') as Truffle.Contract<HierarchicalInstance>;
should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../utils');

/** @test {Hierarchical} contract */
contract('Hierarchical', (accounts) => {
    let hierarchical: HierarchicalInstance;
    const ROOT_ROLE_ID = stringToBytes32('ROOT');
    const ADDED_ROLE_ID = stringToBytes32('ADDED');
    const root = accounts[0];
    const user1 = accounts[1];

    beforeEach(async () => {
        hierarchical = await Hierarchical.new(root);
    });

    /**
     * @test {Hierarchical#isMember}
     */
    it('isMember returns true for members of a role', async () => {
        assert.isTrue(await hierarchical.isMember(root, ROOT_ROLE_ID));
        assert.isFalse(await hierarchical.isMember(user1, ROOT_ROLE_ID));
    });

    /**
     * @test {Hierarchical#isAdmin}
     */
    it('isAdmin returns true for admins', async () => {
        assert.isTrue(await hierarchical.isAdmin(root, ROOT_ROLE_ID));
        assert.isFalse(await hierarchical.isAdmin(user1, ROOT_ROLE_ID));
    });

    /**
     * @test {Hierarchical#addRole}
     */
    itShouldThrow(
        'addRole throws if not called by a member of the admin role.',
        async () => {
            await hierarchical.addRole(ADDED_ROLE_ID, ROOT_ROLE_ID, { from: user1 });
        },
        'Restricted to members.',
    );

    /**
     * @test {Hierarchical#addMember}
     */
    itShouldThrow(
        'addMember throws if not called by a member of the admin role.',
        async () => {
            await hierarchical.addMember(user1, ROOT_ROLE_ID, { from: user1 });
        },
        'Restricted to admins.',
    );

    /**
     * @test {Hierarchical#removeMember}
     */
    itShouldThrow(
        'removeMember throws if not called by a member of the admin role.',
        async () => {
            await hierarchical.removeMember(user1, ROOT_ROLE_ID, { from: user1 });
        },
        'Restricted to admins.',
    );

    /**
     * @test {Hierarchical#addMember}
     */
    it('addMember adds an account to a role.', async () => {
        await hierarchical.addMember(user1, ROOT_ROLE_ID, { from: root });
        assert.isTrue(await hierarchical.isMember(user1, ROOT_ROLE_ID));
    });
});

function stringToBytes32(text: string) {
    return web3.utils.fromAscii(text);
}

function bytes32ToString(text: string) {
    return web3.utils.toAscii(text).replace(/\0/g, '');
}
