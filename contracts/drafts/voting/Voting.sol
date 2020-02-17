pragma solidity ^0.5.10;

import "@hq20/fixidity/contracts/FixidityLib.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../state/StateMachine.sol";
import "../../utils/SafeCast.sol";


/**
 * @title Voting
 * @dev Implements a simple voting process for proposals
 *
 * 1. Initialize the Voting with the votingToken address and the address and the callData of the proposals you wish to enact, should this Voting pass.
 * 2. Setup the Voting by providing a threshold. The threshold must be expressed as an integer between 1 and 10000, representing a double digit percentage of the total supply of the voting tokens, with the comma shifted two digits to the right.
 * 3. Open the voting.
 * 4. Cast votes.
 * 5. You can cancel your vote at any time. You should cancel it after the voting proposals have passed or after the voting has been Canceled.
 * 6. Validate the threshold.
 * 7. Enact the proposal.
 */
contract Voting is Ownable, StateMachine {
    using EnumerableSet for EnumerableSet.AddressSet;
    using SafeMath for uint256;
    using FixidityLib for int256;
    using SafeCast for int256;
    using SafeCast for uint256;

    event VotingCreated();
    event ThresholdSet();
    event ProposalEnacted();
    event ProposalRegistered();
    event VoteCasted(address voter, uint256 votes);
    event VoteCanceled(address voter, uint256 votes);

    address public votingToken;

    address[] public voters;
    mapping(address => uint256) public votes;

    address[] proposalContracts;
    bytes[] public proposalData;

    uint256 public threshold;
    uint256 nextProposal;

    /**
     * @dev Initialize the issuance with the token to issue and the token to
     * accept as payment.
     */
    constructor(
        address _votingToken,
        uint256 _threshold
    ) public Ownable() StateMachine() {
        votingToken = _votingToken;
        require(
            _threshold > 0,
            "Threshold cannot be zero."
        );
        threshold = _threshold;
        _createTransition("SETUP", "OPEN");
        _createTransition("OPEN", "PASSED");
        emit VotingCreated();
    }

    /**
     * @dev Function to enact one proposal of this voting. This function should be called
     * repeatedly until all the passed proposals have been enacted.
     */
    function enact() external payable {
        require(
            currentState == "PASSED",
            "Cannot enact proposal until vote passes."
        );
        require(
            nextProposal < proposalContracts.length,
            "No more proposals to enact."
        );
        // solium-disable-next-line security/no-call-value
        (bool success, ) = proposalContracts[nextProposal]
            .call.value(msg.value)(proposalData[nextProposal]);
        require(success, "Failed to enact proposal.");
        nextProposal = nextProposal.add(1);
        emit ProposalEnacted();
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
        emit VoteCanceled(msg.sender, count);
    }

    /**
     * @dev Add a proposal to be enacted if the vote passes. A proposal is a contract address and
     * data to pass on to it, usually a function call with encoded parameters.
     */
    function registerProposal(
        address _proposalContract,
        bytes memory _proposalData
    ) public onlyOwner {
        require(currentState == "SETUP", "Can propose only when in SETUP");
        proposalContracts.push(_proposalContract);
        proposalData.push(_proposalData);
        emit ProposalRegistered();
    }

    /**
     * @dev Function to open the voting
     */
    function open() public onlyOwner {
        _transition("OPEN");
    }

    /**
     * @dev Function to validate the threshold
     */
    function validate() public {
        require(
            IERC20(votingToken).balanceOf(address(this)) >= thresholdVotes(),
            "Not enough votes to meet the threshold."
        );
        _transition("PASSED");
    }

    function thresholdVotes() internal view returns (uint256) {
        ERC20Detailed _votingToken = ERC20Detailed(votingToken);
        int256 totalSupplyFixed = _votingToken.totalSupply()
            .safeUintToInt().newFixed(_votingToken.decimals());
        int256 thresholdFixed = threshold.safeUintToInt().newFixed(4);
        return totalSupplyFixed.multiply(thresholdFixed)
            .fromFixed(_votingToken.decimals()).safeIntToUint();
    }
}
