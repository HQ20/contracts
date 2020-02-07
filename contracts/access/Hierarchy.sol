pragma solidity ^0.5.10;
import "./Roles.sol";


/**
 * @title Hierarchy
 * @author Alberto Cuesta Canada
 * @notice Implements a dynamic role structure for Roles
 */
contract Hierarchy is Roles {
    event AdminRoleSet(bytes32 roleId, bytes32 adminRoleId);

    bytes32 public constant ROOT_ROLE_ID = "ROOT";
    // adminRoles[roleId] is admin role of roleId.
    mapping (bytes32 => bytes32) private _adminRoles;

    /// @dev Create a root role, with itself as an admin role, and `root` as a member.
    constructor (address root) public {
        _addRole(ROOT_ROLE_ID);
        _addAdminRole(ROOT_ROLE_ID, ROOT_ROLE_ID);
        _addMember(root, ROOT_ROLE_ID);
    }

    /// @dev Restricted to members of the admin role of the one passed as a parameter.
    modifier onlyAdmin(bytes32 roleId) {
        require(isAdmin(msg.sender, roleId), "Restricted to admins.");
        _;
    }

    /// @dev Restricted to members of the role passed as a parameter.
    modifier onlyMember(bytes32 roleId) {
        require(hasRole(msg.sender, roleId), "Restricted to members.");
        _;
    }

    /// @dev Returns `true` if the account belongs to the admin role of the one passed as a parameter.
    function isAdmin(address account, bytes32 roleId)
        public view returns (bool) {
        return hasRole(account, _adminRoles[roleId]);
    }

    /// @dev Returns `true` if the `account` belongs to the role.
    function isMember(address account, bytes32 roleId)
        public view returns (bool) {
        return hasRole(account, roleId);
    }

    /// @dev Create a new role with the specified admin role.
    function addRole(bytes32 roleId, bytes32 adminRoleId)
        public onlyMember(adminRoleId) {
        _addRole(roleId);
        _addAdminRole(roleId, adminRoleId);
    }

    /// @dev Add a member to a role, caller must belong to its admin role.
    function addMember(address account, bytes32 roleId)
        public onlyAdmin(roleId) {
        _addMember(account, roleId);
    }

    /// @dev Remove a member from a role, caller must belong to its admin role.
    function removeMember(address account, bytes32 roleId)
        public onlyAdmin(roleId) {
        _removeMember(account, roleId);
    }

    /// @dev Set a role as the admin of another.
    function _addAdminRole(bytes32 roleId, bytes32 adminRoleId) internal {
        require(roleExists(roleId), "Role does not exist");
        require(roleExists(adminRoleId), "Admin role does not exist");
        _adminRoles[roleId] = adminRoleId;
        emit AdminRoleSet(roleId, adminRoleId);
    }
}
