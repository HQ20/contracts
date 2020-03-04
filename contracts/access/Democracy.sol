pragma solidity ^0.5.10;
import "./Roles.sol";
import "./Renounceable.sol";
import "./../voting/Democratic.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/**
 * @title Democracy
 * @author Alberto Cuesta Canada
 * @notice Implements a voting-based structure for Roles
 */
contract Democracy is Roles, Renounceable, Democratic {
    event Proposal(address proposal);

    bytes32 public constant LEADER_ROLE_ID = "LEADER";
    bytes32 public constant VOTER_ROLE_ID = "VOTER";

    /// @dev Create a leader and a voter roles, and add `root` to the voter role.
    constructor (address root, address votingToken, uint256 threshold)
        public
        Democratic(votingToken, threshold)
    {
        _addRole(LEADER_ROLE_ID);
        _addRole(VOTER_ROLE_ID);
        _addMember(root, VOTER_ROLE_ID);
    }

    /// @dev Restricted to members of the leader role.
    modifier onlyLeader() {
        require(isLeader(msg.sender), "Restricted to leaders.");
        _;
    }

    /// @dev Restricted to members of the voter role.
    modifier onlyVoter() {
        require(isVoter(msg.sender), "Restricted to voters.");
        _;
    }

    /// @dev Return `true` if the account belongs to the leader role.
    function isLeader(address account) public view returns (bool) {
        return hasRole(account, LEADER_ROLE_ID);
    }

    /// @dev Return `true` if the account belongs to the voter role.
    function isVoter(address account) public view returns (bool) {
        return hasRole(account, VOTER_ROLE_ID);
    }

    /// @dev Add an account to the voter role. Restricted to proposals.
    function addVoter(address account) public onlyProposal {
        _addMember(account, VOTER_ROLE_ID);
    }

    /// @dev Add an account to the leader role. Restricted to proposals.
    function addLeader(address account) public onlyProposal {
        _addMember(account, LEADER_ROLE_ID);
    }

    /// @dev Remove an account from the voter role. Restricted to proposals.
    function removeVoter(address account) public onlyProposal {
        _removeMember(account, VOTER_ROLE_ID);
    }

    /// @dev Remove an account from the leader role. Restricted to proposals.
    function removeLeader(address account) public onlyProposal {
        _removeMember(account, LEADER_ROLE_ID);
    }

    /// @dev Remove oneself from the leader role.
    function renounceLeader() public {
        renounceMembership(LEADER_ROLE_ID);
    }

    /// @dev Remove oneself from the voter role.
    function renounceVoter() public {
        renounceMembership(VOTER_ROLE_ID);
    }

    /// @dev Propose a democratic action.
    /// @param proposalData The abi encoding of the proposal, as one function of this contract and any parameters.
    function propose(
        bytes memory proposalData
    ) public onlyVoter {
        super.propose(proposalData);
    }
}
