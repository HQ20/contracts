pragma solidity ^0.6.0;
import "./../voting/Democratic.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";


/**
 * @title Democracy
 * @author Alberto Cuesta Canada
 * @notice Implements a voting-based structure for Roles
 */
contract Democracy is AccessControl, Democratic {
    event Proposal(address proposal);

    bytes32 public constant LEADER_ROLE = "LEADER";
    bytes32 public constant VOTER_ROLE = "VOTER";

    /// @dev Create a leader and a voter roles, and add `root` to the voter role.
    constructor (address root, address votingToken, uint256 threshold)
        public
        Democratic(votingToken, threshold)
    {
        _setupRole(VOTER_ROLE, root);
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
    function isLeader(address account) public virtual view returns (bool) {
        return hasRole(LEADER_ROLE, account);
    }

    /// @dev Return `true` if the account belongs to the voter role.
    function isVoter(address account) public virtual view returns (bool) {
        return hasRole(VOTER_ROLE, account);
    }

    /// @dev Add an account to the voter role. Restricted to proposals.
    function addVoter(address account) public virtual onlyProposal {
        grantRole(VOTER_ROLE, account);
    }

    /// @dev Add an account to the leader role. Restricted to proposals.
    function addLeader(address account) public virtual onlyProposal {
        grantRole(LEADER_ROLE, account);
    }

    /// @dev Remove an account from the voter role. Restricted to proposals.
    function removeVoter(address account) public virtual onlyProposal {
        revokeRole(VOTER_ROLE, account);
    }

    /// @dev Remove an account from the leader role. Restricted to proposals.
    function removeLeader(address account) public virtual onlyProposal {
        revokeRole(LEADER_ROLE, account);
    }

    /// @dev Remove oneself from the leader role.
    function renounceLeader() public virtual {
        revokeRole(LEADER_ROLE, msg.sender);
    }

    /// @dev Remove oneself from the voter role.
    function renounceVoter() public virtual {
        revokeRole(VOTER_ROLE, msg.sender);
    }

    /// @dev Propose a democratic action.
    /// @param proposalData The abi encoding of the proposal, as one function of this contract and any parameters.
    function propose (
        bytes memory proposalData
    ) public virtual override onlyVoter {
        super.propose(proposalData);
    }
}
