pragma solidity ^0.5.10;
import "./RBAC.sol";
import "./Renounceable.sol";


/**
 * @title Community
 * @author Alberto Cuesta Canada
 * @notice Implements a single role RBAC
 */
contract Community is RBAC, Renounceable {

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

    function leaveCommunity() public { // RBAC will check membership.
        renounceMembership(COMMUNITY_ROLE_ID);
    }
}
