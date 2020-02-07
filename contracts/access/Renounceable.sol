pragma solidity ^0.5.10;
import "./RBAC.sol";


/**
 * @title Renounceable
 * @author Alberto Cuesta Canada
 * @notice Gives anyone in RBAC permissions to renounce from their role.
 */
contract Renounceable is RBAC {

    function renounceMembership(bytes32 roleId) public {
        _removeMember(msg.sender, roleId);
    }
}
