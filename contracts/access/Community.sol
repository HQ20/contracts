pragma solidity ^0.6.0;
import "@openzeppelin/contracts/access/AccessControl.sol";


/**
 * @title Community
 * @author Alberto Cuesta Canada
 * @notice Implements a single role access control contract.
 */
contract Community is AccessControl {

    /// @dev Create the community role, with `root` as a member.
    constructor (address root) public {
        _setupRole(DEFAULT_ADMIN_ROLE, root);
    }

    /// @dev Restricted to members of the community.
    modifier onlyMember() {
        require(isMember(msg.sender), "Restricted to members.");
        _;
    }

    /// @dev Return `true` if the `account` belongs to the community.
    function isMember(address account) public virtual view returns (bool) {
        return hasRole(DEFAULT_ADMIN_ROLE, account);
    }

    /// @dev Add a member of the community. Caller must already belong to the community.
    function addMember(address account) public virtual onlyMember {
        grantRole(DEFAULT_ADMIN_ROLE, account);
    }

    /// @dev Remove oneself as a member of the community.
    function leaveCommunity() public virtual { // Roles will check membership.
        renounceRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
}
