pragma solidity ^0.5.10;
import "./Roles.sol";
import "./Renounceable.sol";


/**
 * @title Community
 * @author Alberto Cuesta Canada
 * @notice Implements a single role Roles
 */
contract Community is Roles, Renounceable {

    bytes32 public constant COMMUNITY_ROLE_ID = "COMMUNITY";

    constructor (address root) public {
        _addRole(COMMUNITY_ROLE_ID);
        _addMember(root, COMMUNITY_ROLE_ID);
    }

    modifier onlyMember() {
        require(isMember(msg.sender), "Restricted to members.");
        _;
    }

    function isMember(address account) public view returns (bool) {
        return hasRole(account, COMMUNITY_ROLE_ID);
    }

    function addMember(address account) public onlyMember {
        _addMember(account, COMMUNITY_ROLE_ID);
    }

    function leaveCommunity() public { // Roles will check membership.
        renounceMembership(COMMUNITY_ROLE_ID);
    }
}
