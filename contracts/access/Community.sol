pragma solidity ^0.6.0;
import "./Roles.sol";
import "./Renounceable.sol";


/**
 * @title Community
 * @author Alberto Cuesta Canada
 * @notice Implements a single role Roles
 */
contract Community is Roles, Renounceable {

    bytes32 public constant COMMUNITY_ROLE_ID = "";

    /// @dev Create the community role, with `root` as a member.
    constructor (address root) public {
        _addMember(root, COMMUNITY_ROLE_ID);
    }

    /// @dev Restricted to members of the community.
    modifier onlyMember() {
        require(isMember(msg.sender), "Restricted to members.");
        _;
    }

    /// @dev Return `true` if the `account` belongs to the community.
    function isMember(address account) public virtual view returns (bool) {
        return hasRole(account, COMMUNITY_ROLE_ID);
    }

    /// @dev Add a member of the community. Caller must already belong to the community.
    function addMember(address account) public virtual onlyMember {
        _addMember(account, COMMUNITY_ROLE_ID);
    }

    /// @dev Remove oneself as a member of the community.
    function leaveCommunity() public virtual { // Roles will check membership.
        renounceMembership(COMMUNITY_ROLE_ID);
    }
}
