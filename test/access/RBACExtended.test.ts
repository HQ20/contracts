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
        // console.log(await rbac.roleList({ from: root }));
    });

    it('Retrieve list of roles.', async () => {
        
    });

    it('Retrive roles for user.', async () => {
        
    });
});
