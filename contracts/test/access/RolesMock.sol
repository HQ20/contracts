pragma solidity ^0.6.0;
import "./../../access/Roles.sol";


contract RolesMock is Roles {

    function addMember(address account, bytes32 roleId) public virtual {
        _addMember(account, roleId);
    }

    function removeMember(address account, bytes32 roleId) public virtual {
        _removeMember(account, roleId);
    }
}
