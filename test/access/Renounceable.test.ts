import { should } from 'chai';
import { RenounceableMockInstance } from '../../types/truffle-contracts';

const Renounceable = artifacts.require('./access/mocks/RenounceableMock.sol') as Truffle.Contract<RenounceableMockInstance>;
should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../utils');

contract('Renounceable', (accounts) => {
    let roles: RenounceableMockInstance;
    const ADDED_ROLE = web3.utils.fromAscii('ADDED');
    const user1 = accounts[1];

    beforeEach(async () => {
        roles = await Renounceable.new();
        await roles.addRole(ADDED_ROLE);
        await roles.addMember(user1, ADDED_ROLE);
    });

    it('transfers role membership to another account', async () => {
        await roles.renounceMembership(ADDED_ROLE, { from: user1 });
        assert.isFalse(await roles.hasRole(user1, ADDED_ROLE));
    });
});
