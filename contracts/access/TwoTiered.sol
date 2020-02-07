pragma solidity ^0.5.10;
import "./Roles.sol";
import "./Renounceable.sol";


/**
 * @title TwoTiered
 * @author Alberto Cuesta Canada
 * @notice Implements a two-role Roles
 */
contract TwoTiered is Roles, Renounceable {

    bytes32 public constant ADMIN_ROLE_ID = "ADMIN";
    bytes32 public constant USER_ROLE_ID = "USER";

    /// @dev Create an admin and a user role, and add `root` to the admin role as a member.
    constructor (address root) public {
        _addRole(ADMIN_ROLE_ID);
        _addRole(USER_ROLE_ID);
        _addMember(root, ADMIN_ROLE_ID);
    }

    /// @dev Restricted to members of the admin role.
    modifier onlyAdmin() {
        require(isAdmin(msg.sender), "Restricted to admins.");
        _;
    }

    /// @dev Restricted to members of the user role.
    modifier onlyUser() {
        require(isUser(msg.sender), "Restricted to users.");
        _;
    }

    /// @dev Return `true` if the account belongs to the admin role.
    function isAdmin(address account) public view returns (bool) {
        return hasRole(account, ADMIN_ROLE_ID);
    }

    /// @dev Return `true` if the account belongs to the user role.
    function isUser(address account) public view returns (bool) {
        return hasRole(account, USER_ROLE_ID);
    }

    /// @dev Add an account to the user role. Restricted to admins.
    function addUser(address account) public onlyAdmin {
        _addMember(account, USER_ROLE_ID);
    }

    /// @dev Add an account to the admin role. Restricted to admins.
    function addAdmin(address account) public onlyAdmin {
        _addMember(account, ADMIN_ROLE_ID);
    }

    /// @dev Remove an account from the user role. Restricted to admins.
    function removeUser(address account) public onlyAdmin {
        _removeMember(account, USER_ROLE_ID);
    }

    /// @dev Remove oneself from the admin role.
    function renounceAdmin() public {
        renounceMembership(ADMIN_ROLE_ID);
    }
}
