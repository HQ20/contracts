pragma solidity ^0.5.10;

import "@hq20/fixidity/contracts/FixidityLib.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../state/StateMachine.sol";
import "../../utils/SafeCast.sol";


/**
 * @title Issuance
 * @dev Implements a simple voting process for proposals
 *
 * 1. Initialize the Voting with the votingToken address and the address and the callData of the proposal you wish to enact, should this Voting pass.
 * 2. Setup the Voting by providing a threshold. The threshold must be expressed as an integer between 1 and 10000, representing a double digit percentage of the total supply of the voting tokens, with the comma shifted two digits to the right.
 * 3. Open the voting.
 * 4. Cast votes.
 * 5. You can cancel your vote at any time. You should cancel it after the voting proposal has passed or after the voting has been cancelled.
 * 6. Validate the threshold.
 * 7. Enact the proposal.
 */
contract Voting is Ownable, StateMachine {
    using SafeMath for uint256;
    using FixidityLib for int256;
    using SafeCast for int256;
    using SafeCast for uint256;

    event VotingCreated();
    event ThresholdSet();
    event VoteCasted(address voter, uint256 votes);
    event VoteCancelled(address voter, uint256 votes);

    address public votingToken;
    address public proposalContract;
    bytes public proposalData;

    address[] public voters;
    mapping(address => uint256) public votes;

    uint256 public threshold;

    /**
     * @dev Initialize the issuance with the token to issue and the token to
     * accept as payment.
     */
    constructor(
        address _votingToken,
        address _proposalContract,
        bytes memory _proposalData
    ) public Ownable() StateMachine() {
        votingToken = _votingToken;
        proposalContract = _proposalContract;
        proposalData = _proposalData;
        _createState("OPEN");
        _createState("PASSED");
        _createState("FAILED");
        _createTransition("SETUP", "OPEN");
        _createTransition("OPEN", "PASSED");
        _createTransition("OPEN", "FAILED");
        emit VotingCreated();
    }

    /**
     * @dev Function to enact the proposal of this voting
     */
    function enact() external payable {
        require(
            currentState == "PASSED",
            "Cannot enact proposal until vote passes."
        );
        // solium-disable-next-line security/no-call-value
        (bool success, ) = proposalContract
            .call.value(msg.value)(proposalData);
        require(success, "Failed to enact proposal.");
    }

    /**
     * @dev Use this function to cast votes. Must have approved this contract
     * (from the frontend) to spend _votes of votingToken tokens.
     * @param _votes The amount of votingToken tokens that will be casted.
     */
    function cast(uint256 _votes) external {
        require(
            currentState == "OPEN",
            "Not open for voting."
        );
        IERC20(votingToken).transferFrom(msg.sender, address(this), _votes);
        if (votes[msg.sender] == 0){
            voters.push(msg.sender);
        }
        votes[msg.sender] = votes[msg.sender].add(_votes);
        emit VoteCasted(msg.sender, _votes);
    }

    /**
     * @dev Use this function to retrieve your votingToken votes in case you changed your mind.
     */
    function cancel() external {
        require(
            votes[msg.sender] > 0,
            "No votes casted."
        );
        uint256 count = votes[msg.sender];
        votes[msg.sender] = 0;
        IERC20(votingToken).transfer(msg.sender, count);
        emit VoteCancelled(msg.sender, count);
    }

    /**
     * @dev Function to open the voting
     */
    function open() public onlyOwner {
        require(
            threshold > 0,
            "Threshold not set."
        );
        _transition("OPEN");
    }

    /**
     * @dev Function to validate the threshold
     */
    function validate() public onlyOwner {
        require(
            IERC20(votingToken).balanceOf(address(this)) >= thresholdVotes(),
            "Not enough votes to meet the threshold."
        );
        _transition("PASSED");
    }

    /**
     * @dev Function to cancel all votes
     */
    function cancelAllVotes() public onlyOwner {
        _transition("FAILED");
    }

    /**
     * @notice Set the threshold during SETUP state. Threshold must be a percentage of the votingToken's totalSupply, with the comma shifted two digits to the right. For example:
     * If desired threshold is 100% (unanimity), then pass to this function: 10000.
     * If desired threshold is 66.67% (super majority), then passs to this function: 6667.
     */
    function setThreshold(uint256 _threshold) public onlyOwner {
        require(
            currentState == "SETUP",
            "Cannot setup now."
        );
        require(
            _threshold > 0 && _threshold <= 10000,
            "Quroum must be a percentage."
        );
        threshold = _threshold;
        emit ThresholdSet();
    }

    function thresholdVotes() internal returns (uint256) {
        ERC20Detailed _votingToken = ERC20Detailed(votingToken);
        int256 totalSupplyFixed = _votingToken.totalSupply()
            .safeUintToInt().newFixed(_votingToken.decimals());
        int256 thresholdFixed = threshold.safeUintToInt().newFixed(2);
        return totalSupplyFixed.multiply(thresholdFixed)
            .fromFixed(_votingToken.decimals()).safeIntToUint();
    }
}
