pragma solidity ^0.5.10;
import "./RBAC.sol";


/**
 * @title Hierarchical
 * @author Alberto Cuesta Canada
 * @notice Implements a dynamical role structure for RBAC
 */
contract Hierarchical is RBAC {

    bytes32 public constant ROOT_ROLE_ID = "ROOT";
    // adminRoles[roleId] is admin role of roleId.
    mapping (bytes32 => bytes32) private _adminRoles;

    constructor (address root) public {
        _addRole(ROOT_ROLE_ID);
        _addAdminRole(ROOT_ROLE_ID, ROOT_ROLE_ID);
        _addMember(root, ROOT_ROLE_ID);
    }

    modifier onlyAdmin(bytes32 roleId) {
        require(isAdmin(msg.sender, roleId), "Restricted to admins.");
        _;
    }

    modifier onlyMember(bytes32 roleId) {
        require(hasRole(msg.sender, roleId), "Restricted to members.");
        _;
    }

    function isAdmin(address account, bytes32 roleId)
        public view returns (bool) {
        return hasRole(account, _adminRoles[roleId]);
    }

    function isMember(address account, bytes32 roleId)
        public view returns (bool) {
        return hasRole(account, roleId);
    }

    function addRole(bytes32 roleId, bytes32 adminRoleId)
        public onlyMember(adminRoleId) {
        _addRole(roleId);
        _addAdminRole(roleId, adminRoleId);
    }

    function addMember(address account, bytes32 roleId)
        public onlyAdmin(roleId) {
        _addMember(account, roleId);
    }

    function removeMember(address account, bytes32 roleId)
        public onlyAdmin(roleId) {
        _removeMember(account, roleId);
    }

    function _addAdminRole(bytes32 roleId, bytes32 adminRoleId) internal {
        require(roleExists(roleId), "Role does not exist");
        require(roleExists(adminRoleId), "Admin role does not exist");
        _adminRoles[roleId] = adminRoleId;
    }
}
