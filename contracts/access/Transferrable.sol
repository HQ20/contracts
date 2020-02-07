pragma solidity ^0.5.10;
import "./RBAC.sol";


/**
 * @title Transferrable
 * @author Alberto Cuesta Canada
 * @notice Gives anyone in RBAC permissions to renounce to their role in favour of someone else.
 */
contract Transferrable is RBAC {

    function transferMembership(address to, bytes32 roleId) public {
        _removeMember(msg.sender, roleId);
        _addMember(to, roleId);
    }
}
