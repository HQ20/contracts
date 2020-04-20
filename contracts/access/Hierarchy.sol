pragma solidity ^0.6.0;
import "@openzeppelin/contracts/access/AccessControl.sol";


/**
 * @title Hierarchy
 * @author Alberto Cuesta Canada
 * @notice Implements a dynamic role structure for Roles
 */
contract Hierarchy is AccessControl {
    event AdminRoleSet(bytes32 roleId, bytes32 adminRoleId);

    /// @dev Add `root` as a member of the root role.
    constructor (address root) public {
        _setupRole(DEFAULT_ADMIN_ROLE, root);
    }

    /// @dev Restricted to members of the role passed as a parameter.
    modifier onlyMember(bytes32 roleId) {
        require(hasRole(roleId, msg.sender), "Restricted to members.");
        _;
    }

    /// @dev Create a new role with the specified admin role.
    function addRole(bytes32 roleId, bytes32 adminRoleId)
        public onlyMember(adminRoleId) {
        _setRoleAdmin(roleId, adminRoleId);
        emit AdminRoleSet(roleId, adminRoleId);
    }
}
