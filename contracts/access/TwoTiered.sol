pragma solidity ^0.5.10;
import "./RBAC.sol";


/**
 * @title TwoTiered
 * @author Alberto Cuesta Canada
 * @notice Implements a two-role RBAC
 */
contract TwoTiered is RBAC {

    bytes32 public constant ADMIN_ROLE_ID = "ADMIN";
    bytes32 public constant USER_ROLE_ID = "USER";

    constructor (address root) public {
        _addRole(ADMIN_ROLE_ID);
        _addRole(USER_ROLE_ID);
        _addMember(root, ADMIN_ROLE_ID);
    }

    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "Restricted to admins.");
        _;
    }

    modifier onlyUser() {
        require(isUser(msg.sender), "Restricted to users.");
        _;
    }

    function isAdmin(address account) public view returns (bool) {
        return hasRole(account, ADMIN_ROLE_ID);
    }

    function isUser(address account) public view returns (bool) {
        return hasRole(account, USER_ROLE_ID);
    }

    function addUser(address account) public onlyAdmin {
        _addMember(account, USER_ROLE_ID);
    }

    function addAdmin(address account) public onlyAdmin {
        _addMember(account, ADMIN_ROLE_ID);
    }

    function removeUser(address account) public onlyAdmin {
        _removeMember(account, USER_ROLE_ID);
    }

    function removeAdmin(address account) public onlyAdmin {
        _removeMember(account, ADMIN_ROLE_ID);
    }
}
