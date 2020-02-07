pragma solidity ^0.5.10;
import "./Roles.sol";


/**
 * @title Transferrable
 * @author Alberto Cuesta Canada
 * @notice Gives anyone in Roles permissions to renounce to their role in favour of someone else.
 */
contract Transferrable is Roles {

    /// @dev Remove oneself from a role, and add someone else to it at the same time.
    function transferMembership(address to, bytes32 roleId) public {
        _removeMember(msg.sender, roleId);
        _addMember(to, roleId);
    }
}
