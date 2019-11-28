import { should } from 'chai';
import { RBACExtendedInstance } from '../../types/truffle-contracts';

const RBAC = artifacts.require('./access/RBACExtended.sol') as Truffle.Contract<RBACExtendedInstance>;
should();

contract('RBAC', (accounts) => {
    let rbac: RBACExtendedInstance;
    const root = accounts[1];
    const user1 = accounts[2];
    const ROOT_ROLE = stringToBytes32('ROOT');


    beforeEach(async () => {
        rbac = await RBAC.new(root);
        for (let i = 0; i < 10; i++) {
            const roleId = stringToBytes32('ROLE_' + i);
            await rbac.addRole(roleId, ROOT_ROLE, { from: root });
        }
    });

    /**
     * @test {RBACExtended#getRoles}
     */
    it('Retrieve list of roles.', async () => {
        const roles = await rbac.getRoles();
        roles.length.should.be.equal(11);
        bytes32ToString(roles[0]).should.be.equal('ROOT');
        for (let i = 0; i < 10; i++) {
            bytes32ToString(roles[i + 1]).should.be.equal('ROLE_' + i);
        }
    });

    /**
     * @test {RBACExtended#rolesForMember}
     */
    it('Retrieve no roles for user.', async () => {
        const roles = await rbac.rolesForMember(user1);
        roles.length.should.be.equal(0);
    });

    /**
     * @test {RBACExtended#rolesForMember}
     */
    it('Retrieve roles for user.', async () => {
        const role5 = 'ROLE_5';
        await rbac.addMember(user1, stringToBytes32(role5), { from: root });
        const roles = await rbac.rolesForMember(user1);
        bytes32ToString(roles[0]).should.be.equal(role5);
    });

    /**
     * @test {RBACExtended#rolesForMember}
     */
    it('Retrieve many roles for user.', async () => {
        for (let i = 0; i < 10; i++) {
            const roleId = stringToBytes32('ROLE_' + i);
            await rbac.addMember(user1, roleId, { from: root });
        }

        const roles = await rbac.rolesForMember(user1);
        
        for (let i = 0; i < 10; i++) {
            bytes32ToString(roles[i]).should.be.equal('ROLE_' + i);
        }
    });
});

function stringToBytes32(_string: String) {
    return web3.utils.fromAscii(_string);
}

function bytes32ToString(_bytes32: String) {
    return web3.utils.toAscii(_bytes32).replace(/\0/g, '');
}