pragma solidity ^0.5.10;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../math/DecimalMath.sol";



/**
 * @title Voting
 * @dev Implements a simple voting process for proposals
 *
 * 1. Initialize the Voting with:
 *       The address of the contract that will be used as a voting token.
 *       The address of the target contract for a proposal to be enacted.
 *       The proposal data, obtained as an abi encoding of a function in the target contract with any desired arguments.
 *       The voting threshold. The threshold must be expressed as an integer between 1 and 10000, representing a double digit percentage of the total supply of the voting tokens, with the comma shifted two digits to the right.
 *  2. Cast votes.
 *  3. You can cancel your vote at any time and recover your voting tokens.
 *  4. Validate the threshold. If the voting threshold is met the voting proposal passes. A voting can be validated any number of times, but once the validation is successful the voting is considered successful forever.
 *  5. Enact the proposal. There is no limit to how many times the proposal can be enacted from one successful vote.
 */
contract Voting is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;
    using SafeMath for uint256;
    using DecimalMath for uint256;

    event VotingCreated();
    event ProposalEnacted();
    event VoteCasted(address voter, uint256 votes);
    event VoteCanceled(address voter, uint256 votes);

    IERC20 public votingToken;

    mapping(address => uint256) public votes;

    address public targetContract;
    bytes public proposalData;

    uint256 public threshold;
    bool public passed;

    /**
     * @dev Initialize the voting.
     * @param _votingToken The address of the contract that will be used as a voting token.
     * @param _targetContract The address of the target contract for a proposal to be enacted.
     * @param _proposalData The proposal data, obtained as an abi encoding of a function in the target contract with any desired arguments.
     * @param _threshold The voting threshold. The threshold must be expressed as an integer between 1 and 10000, representing a double digit percentage of the total supply of the voting tokens, with the comma shifted two digits to the right.
     */
    constructor(
        address _votingToken,
        address _targetContract,
        bytes memory _proposalData,
        uint256 _threshold
    ) public Ownable() {
        votingToken = IERC20(_votingToken);
        threshold = _threshold;
        targetContract = _targetContract;
        proposalData = _proposalData;
        emit VotingCreated();
    }

    /**
     * @dev Function to enact one proposal of this voting.
     */
    function enact() external {
        require(
            passed == true,
            "Cannot enact proposal until vote passes."
        );
        // solium-disable-next-line security/no-low-level-calls
        (bool success, ) = targetContract.call(proposalData);
        require(success, "Failed to enact proposal.");
        emit ProposalEnacted();
    }

    /**
     * @dev Use this function to cast votes. Must have approved this contract
     * (from the frontend) to spend _votes of votingToken tokens.
     * @param _votes The amount of votingToken tokens that will be casted.
     */
    function cast(uint256 _votes) external {
        votingToken.transferFrom(msg.sender, address(this), _votes);
        votes[msg.sender] = votes[msg.sender].add(_votes);
        emit VoteCasted(msg.sender, _votes);
    }

    /**
     * @dev Use this function to retrieve your votingToken votes in case you changed your mind or the voting has passed
     */
    function cancel() external {
        require(
            votes[msg.sender] > 0,
            "No votes casted."
        );
        uint256 count = votes[msg.sender];
        votes[msg.sender] = 0;
        votingToken.transfer(msg.sender, count);
        emit VoteCanceled(msg.sender, count);
    }

    /**
     * @dev Function to validate the threshold
     */
    function validate() public {
        require(
            votingToken.balanceOf(address(this)) >= thresholdVotes(),
            "Not enough votes to meet the threshold."
        );
        passed = true;
    }

    function thresholdVotes() internal view returns (uint256) {
        return votingToken.totalSupply().muld(threshold, 4);
    }
}
