pragma solidity ^0.5.10;
import "./RBAC.sol";


/**
 * @title RBAC
 * @author Alberto Cuesta Canada
 * @dev Implements runtime configurable Role Based Access Control.
 */
contract RBACExtended is RBAC {
    bytes32[] public roleList;

    /**
     * @dev Return the role list.
     */
    function getRoles()
        external
        view
        returns(bytes32[] memory)
    {
        return roleList;
    }

    /**
     * @dev Return all the roles that a _member belongs to. For scalability reasons, this function is external.
     */
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
        bytes32[] memory roleMembershipsTrimmed = new bytes32[](rolesReturned);
        for (uint256 i = 0; i < rolesReturned; i++) {
            roleMembershipsTrimmed[i] = roleMemberships[i];
        }
        return roleMembershipsTrimmed;
    }

    /**
     * @dev A method to create a new role.
     * @param _roleId The id for role that is being created
     * @return The role id.
     */
    function addRole(bytes32 _roleId)
        public
    {
        super.addRole(_roleId);
        roleList.push(_roleId);
    }
}
