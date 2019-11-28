import { should } from 'chai';
import { RBACExtendedInstance } from '../../types/truffle-contracts';

const RBAC = artifacts.require('./access/RBACExtended.sol') as Truffle.Contract<RBACExtendedInstance>;
should();

contract('RBAC', (accounts) => {
    let rbac: RBACExtendedInstance;
    const root = accounts[1];
    const NO_ROLE = '0x0';
    const ROOT_ROLE = web3.utils.fromAscii('ROOT');
    const ADDED_ROLE = web3.utils.fromAscii('ADDED');
    const user1 = accounts[2];
    const user2 = accounts[3];

    beforeEach(async () => {
        rbac = await RBAC.new(root);
        for (let i = 0; i < 10; i++) {
            const ROLE_ID = web3.utils.fromAscii('ROLE_' + i);
            await rbac.addRole(ROLE_ID, ROOT_ROLE, { from: root });
        }
    });


    it('Retrieve role list length.', async () => {
        // console.log(await rbac.roleList());
    });

    it('Retrieve list of roles.', async () => {
        // 
    });

    it('Retrieve roles for user.', async () => {
        const ROLE_5 = 'ROLE_5';
        await rbac.addMember(user1, stringToBytes32(ROLE_5), { from: root });
        const roles = await rbac.rolesForMember(user1);
        bytes32ToString(roles[0]).should.be.equal(ROLE_5);
    });
});

function stringToBytes32(_string: String) {
    return web3.utils.fromAscii(_string);
}

function bytes32ToString(_bytes32: String) {
    return web3.utils.toAscii(_bytes32).replace(/\0/g, '');
}