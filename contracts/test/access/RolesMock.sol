pragma solidity ^0.5.10;
import "./../../access/Roles.sol";


contract RolesMock is Roles {

    function addMember(address account, bytes32 roleId) public {
        _addMember(account, roleId);
    }

    function removeMember(address account, bytes32 roleId) public {
        _removeMember(account, roleId);
    }
}
