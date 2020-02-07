pragma solidity ^0.5.10;
import "./Roles.sol";


/**
 * @title Renounceable
 * @author Alberto Cuesta Canada
 * @notice Gives anyone in Roles permissions to renounce from their role.
 */
contract Renounceable is Roles {

    function renounceMembership(bytes32 roleId) public {
        _removeMember(msg.sender, roleId);
    }
}
