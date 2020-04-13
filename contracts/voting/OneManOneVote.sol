pragma solidity ^0.6.0;
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "../math/DecimalMath.sol";
import "../access/Administered.sol";


/**
 * @title OneManOneVote
 * @dev Implements a simple voting process, using AccessControl.sol and Administered.sol to register electoral officers and voters.
 *
 * 1. Initialize the voting with:
 *       The address of the account that will be the initial electoral officer (admin).
 *       The address of the target contract for a proposal to be enacted.
 *       The proposal data, obtained as an abi encoding of a function in the target contract with any desired arguments.
 *       The voting threshold. The threshold must be expressed as an integer between 1 and 10000, representing a double digit percentage of the total supply of the voting tokens, with the comma shifted two digits to the right.
 * 2. The electoral officers can add more electoral officers (`addAdmin(address)`).
 * 2. The electoral officers can add voters to the electoral roll (`addUser(address)`).
 * 3. Voters (users) cast votes.
 * 4. Voters can cancel their vote at any time before the voting process is validated.
 * 5. Electoral officers validate the threshold. If the voting threshold is met the voting proposal passes. A voting can be validated any number of times, but once the validation is successful the voting is considered successful forever.
 * 6. Electoral officers enact the proposal. There is no limit to how many times the proposal can be enacted from one successful vote.
 * As-is, this contract can be easily abused by dishonest electoral officers. A time-bound voting process with a limit block for voter enrollment and a limit block for vote casting would be more robust.
 */
contract OneManOneVote is Administered {
    using DecimalMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    event VotingCreated();
    event VotingValidated();
    event ProposalEnacted();
    event VoteCasted(address voter);
    event VoteCanceled(address voter);

    EnumerableSet.AddressSet internal votes;
    address public targetContract;
    bytes public proposalData;
    uint256 public threshold;
    bool public passed;

    /**
     * @dev Initialize the voting.
     * @param _root The address of the initial admin officer.
     * @param _targetContract The address of the target contract for a proposal to be enacted.
     * @param _proposalData The proposal data, obtained as an abi encoding of a function in the target contract with any desired arguments.
     * @param _threshold The voting threshold. The threshold must be expressed as an integer between 1 and 10000, representing a double digit percentage of the total supply of the voting tokens, with the comma shifted two digits to the right.
     */
    constructor(
        address _root,
        address _targetContract,
        bytes memory _proposalData,
        uint256 _threshold
    ) public Administered(_root) {
        threshold = _threshold;
        targetContract = _targetContract;
        proposalData = _proposalData;
        emit VotingCreated();
    }

    modifier proposalPassed() {
        require(passed == true, "Cannot execute until vote passes.");
        _;
    }

    /// @dev Function to enact one proposal of this voting.
    function enact() external virtual onlyAdmin proposalPassed {
        // solium-disable-next-line security/no-low-level-calls
        (bool success, ) = targetContract.call(proposalData);
        require(success, "Failed to enact proposal.");
        emit ProposalEnacted();
    }

    /// @dev Use this function to cast your vote.
    function vote() external virtual onlyUser {
        votes.add(msg.sender);
        emit VoteCasted(msg.sender);
    }

    /// @dev Use this function to cancel your vote.
    function cancel() external virtual onlyUser {
        votes.remove(msg.sender);
        emit VoteCanceled(msg.sender);
    }

    /// @dev Number of votes casted in favour of the proposal.
    function inFavour() public virtual view returns (uint256) {
        return votes.length();
    }

    /// @dev Number of votes needed to pass the proposal.
    function thresholdVotes() public virtual view returns (uint256) {
        return getRoleMemberCount(USER_ROLE).muld(threshold, 4);
    }

    /// @dev Function to validate the threshold
    function validate() public virtual onlyAdmin {
        require(
            inFavour() >= thresholdVotes(),
            "Not enough votes to pass."
        );
        passed = true;
        emit VotingValidated();
    }
}
