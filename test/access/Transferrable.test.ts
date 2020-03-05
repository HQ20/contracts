import { should } from 'chai';
import { TransferrableMockInstance } from '../../types/truffle-contracts';

const Transferrable = artifacts.require('TransferrableMock') as Truffle.Contract<TransferrableMockInstance>;
should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../utils');

contract('Transferrable', (accounts) => {
    let roles: TransferrableMockInstance;
    const ADDED_ROLE = web3.utils.fromAscii('ADDED');
    const user1 = accounts[1];
    const user2 = accounts[2];

    beforeEach(async () => {
        roles = await Transferrable.new();
        await roles.addMember(user1, ADDED_ROLE);
    });

    it('transfers role membership to another account', async () => {
        await roles.transferMembership(user2, ADDED_ROLE, { from: user1 });
        assert.isFalse(await roles.hasRole(user1, ADDED_ROLE));
        assert.isTrue(await roles.hasRole(user2, ADDED_ROLE));
    });
});
