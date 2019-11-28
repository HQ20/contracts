pragma solidity ^0.5.10;
import './RBAC.sol';

/**
 * @title RBAC
 * @author Alberto Cuesta Canada
 * @notice Implements runtime configurable Role Based Access Control.
 */
contract RBACExtended is RBAC {
    bytes32[] public roleList;

    /**
     * @notice The contract initializer. It adds NO_ROLE as with role id 0x0, and ROOT_ROLE with role id 'ROOT'.
     */
    constructor(address _root) public RBAC(_root) {
        roleList.push(ROOT_ROLE);
    }

    /**
     * @notice A method to create a new role.
     * @param _roleId The id for role that is being created
     * @param _adminRoleId The role that is allowed to add and remove members from
     * the role being created.
     * @return The role id.
     */
    function addRole(bytes32 _roleId, bytes32 _adminRoleId)
        public
    {
        super.addRole(_roleId, _adminRoleId);
        roleList.push(_roleId);
    }

    function rolesForMember(address _member)
        external
        view
        returns(bytes32[] memory)
    {
        bytes32[] memory roleMemberships = new bytes32[](roleList.length);
        uint256 rolesReturned = 0;
        for (uint256 i = 0; i < roleList.length; i++) {
            if (hasRole(_member, roleList[i])) {
                roleMemberships[rolesReturned++] = roleList[i];
            }
        }
        return roleMemberships;
    }
}
