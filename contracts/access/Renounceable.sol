pragma solidity ^0.6.0;
import "./Roles.sol";


/**
 * @title Renounceable
 * @author Alberto Cuesta Canada
 * @notice Gives anyone in Roles permissions to renounce from their role.
 */
contract Renounceable is Roles {

    /// @dev Remove oneself from the role specified.
    function renounceMembership(bytes32 roleId) public virtual {
        _removeMember(msg.sender, roleId);
    }
}
