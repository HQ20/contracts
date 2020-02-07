pragma solidity ^0.5.10;
import "./RBAC.sol";

/**
 * @title SuperAdmin
 * @author Alberto Cuesta Canada
 * @notice Implements a two-role RBAC
 */
contract SuperAdmin is RBAC {

    bytes32 public constant ADMIN_ROLE_ID = "ADMIN";
    bytes32 public constant USER_ROLE_ID = "USER";

    constructor (address root) public {
        _addRole(ADMIN_ROLE_ID);
        _addRole(USER_ROLE_ID);
        _addMember(root, ADMIN_ROLE_ID);
    }

    function isAdmin(address account) public view returns (bool) {
        return hasRole(account, USER_ROLE_ID);
    }

    function isUser(address account) public view returns (bool) {
        return hasRole(account, USER_ROLE_ID);
    }

    function addUser(address account)
        public
    {
        require(isAdmin(msg.sender), "Restricted to admin.");
        _addMember(account, USER_ROLE_ID);
    }

    function addAdmin(address account)
        public
    {
        require(isAdmin(msg.sender), "Restricted to admin.");
        _addMember(account, ADMIN_ROLE_ID);
    }

    function removeUser(address account)
        public
    {
        require(isAdmin(msg.sender), "Restricted to admin.");
        _removeMember(account, USER_ROLE_ID);
    }

    function removeAdmin(address account)
        public
    {
        require(isAdmin(msg.sender), "Restricted to admin.");
        _removeMember(account, ADMIN_ROLE_ID);
    }
}
