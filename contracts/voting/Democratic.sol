pragma solidity ^0.6.0;
import "./../voting/OneTokenOneVote.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";


/**
 * @title Democratic
 * @author Alberto Cuesta Canada
 * @dev Implements a module to add voting-based actions to other contracts.
 */
contract Democratic {
    using EnumerableSet for EnumerableSet.AddressSet;

    event Proposal(address proposal);

    EnumerableSet.AddressSet internal proposals;
    IERC20 public votingToken;
    uint256 public threshold;

    constructor (address _votingToken, uint256 _threshold)
        public
    {
        votingToken = IERC20(_votingToken);
        threshold = _threshold;
    }

    /// @dev Restricted to proposals. Same proposal cannot be used twice.
    modifier onlyProposal() {
        require(proposals.contains(msg.sender), "Restricted to proposals.");
        _;
        proposals.remove(msg.sender);
    }

    /**
     * @notice Returns the voting proposals.
     */
    /* function enumerateProposals()
        public virtual view returns (address[] memory)
    {
        return proposals.enumerate();
    }*/ // Disabled until fixed by OpenZeppelin

    /// @dev Propose a democratic action.
    /// @param proposalData The abi encoding of the proposal, as one function of this contract and any parameters.
    function propose(
        bytes memory proposalData
    ) public virtual {
        OneTokenOneVote voting = new OneTokenOneVote(
            address(votingToken),
            address(this),
            proposalData,
            threshold
        );
        proposals.add(address(voting));
        emit Proposal(address(voting));
    }
}
