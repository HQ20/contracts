pragma solidity ^0.5.10;
import "../Roles.sol";


contract RolesMock is Roles {

    function addRole(bytes32 roleId) public {
        _addRole(roleId);
    }

    function addMember(address account, bytes32 roleId) public {
        _addMember(account, roleId);
    }

    function removeMember(address account, bytes32 roleId) public {
        _removeMember(account, roleId);
    }
}
