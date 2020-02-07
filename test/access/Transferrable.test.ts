import { should } from 'chai';
import { TransferrableMockInstance } from '../../types/truffle-contracts';

const Transferrable = artifacts.require('./access/mocks/TransferrableMock.sol') as Truffle.Contract<TransferrableMockInstance>;
should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../utils');

contract('Transferrable', (accounts) => {
    let rbac: TransferrableMockInstance;
    const ADDED_ROLE = web3.utils.fromAscii('ADDED');
    const user1 = accounts[1];
    const user2 = accounts[2];

    beforeEach(async () => {
        rbac = await Transferrable.new();
        await rbac.addRole(ADDED_ROLE);
        await rbac.addMember(user1, ADDED_ROLE);
    });

    it('transfers role membership to another account', async () => {
        await rbac.transferMembership(user2, ADDED_ROLE, { from: user1 });
        assert.isFalse(await rbac.hasRole(user1, ADDED_ROLE));
        assert.isTrue(await rbac.hasRole(user2, ADDED_ROLE));
    });
});
