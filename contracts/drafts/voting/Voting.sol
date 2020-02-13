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
 * 2. Setup the Voting by providing a quorum. The quorum must be expressed as an integer between 1 and 10000, representing a double digit percentage of the total supply of the voting tokens, with the comma shifted two digits to the right.
 * 3. Open the voting.
 * 4. Cast votes.
 * 5. You can cancel your vote at any time. You should cancel it after the voting proposal has passed or after the voting has been cancelled.
 * 6. Validate the quorum.
 * 7. Enact the proposal.
 */
contract Voting is Ownable, StateMachine {
    using SafeMath for uint256;
    using FixidityLib for int256;
    using SafeCast for int256;
    using SafeCast for uint256;

    event VotingCreated();
    event QuorumSet();
    event VoteCasted(address voter, uint256 votes);
    event VoteCancelled(address voter, uint256 votes);

    address public votingToken;
    address public proposalContract;
    bytes public proposalData;

    address[] public voters;
    mapping(address => uint256) public votes;

    uint256 public quorum;

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
    function enact() external payable onlyOwner {
        require(
            currentState == "PASSED",
            "Cannot enact proposal now."
        );
        // solium-disable-next-line security/no-call-value
        (bool success, ) = proposalContract
            .call.value(msg.value)(proposalData);
        require(success, "Could not enact proposal.");
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
            currentState != "SETUP",
            "Cannot retrieve now."
        );
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
            quorum > 0,
            "Quorum not set."
        );
        _transition("OPEN");
    }

    /**
     * @dev Function to validate the quorum
     */
    function validate() public onlyOwner {
        ERC20Detailed _votingToken = ERC20Detailed(votingToken);
        int256 totalSupplyFixed = _votingToken.totalSupply()
            .safeUintToInt().newFixed(_votingToken.decimals());
        int256 quorumFixed = quorum.safeUintToInt().newFixed(2);
        uint256 threshold = totalSupplyFixed.multiply(quorumFixed)
            .fromFixed(_votingToken.decimals()).safeIntToUint();
        require(
            _votingToken.balanceOf(address(this)) >= threshold,
            "Not enough votes to meet the quorum."
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
     * @notice Set the quorum during SETUP state. Quorum must be a percentage of the votingToken's totalSupply, with the comma shifted two digits to the right. For example:
     * If desired quorum is 100% (unanimity), then pass to this function: 10000.
     * If desired quorum is 66.67% (super majority), then passs to this function: 6667.
     */
    function setQuorum(uint256 _quorum) public onlyOwner {
        require(
            currentState == "SETUP",
            "Cannot setup now."
        );
        require(
            _quorum > 0 && _quorum <= 10000,
            "Quroum must be a percentage."
        );
        quorum = _quorum;
        emit QuorumSet();
    }
}
