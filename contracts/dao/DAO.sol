pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "./VentureEth.sol";
import "../voting/Democratic.sol";


/**
 * @title DAO
 * @dev The contract inherits from VentureEth.
 * @notice This is an exeprimental DAO (Decentralised Autonomous Organization) implementation. Use with caution.
 * 1. Issue the DAO tokens through an initial investment round.
 * 2. Propose a venture, and investment amount.
 * 3. Vote for a venture. Each DAO token is 1 vote. If the proposal passes, or if you renounce your vote, you must manualy take back the tokens.
 * 4. Fund a venture. Votes count must surpass the DAO's threshold for a majority.
 * 5. Retrieve the venture tokens for the DAO.
 * 6. Increase the DAO pool with returns (if any) on the tokens from a venture.
 * 7. Claim ether dividends from the DAO on behalf of your DAO tokens.
 */
contract DAO is VentureEth, Democratic {

    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    event VentureAdded(address venture);

    EnumerableSet.AddressSet internal ventures;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 threshold
    )
    VentureEth(name, symbol, decimals)
    Democratic(address(this), threshold)
    public {
        _createTransition("LIVE", "SETUP");
        _createTransition("FAILED", "SETUP");
    }

    /**
     * @dev Fallback function. Required when collecting ether dividends from ventures.
     */
    receive() external virtual override payable {}

    /**
     * @notice To be called during the first investment round.
     */
    function startDistribution() public virtual override onlyOwner {
        // solium-disable-next-line security/no-low-level-calls
        (bool success, ) = address(this).delegatecall(
            abi.encodeWithSignature("transferOwnership(address)", address(this))
        );
        require(success, "Could not transfer ownership to the DAO.");
        _transition("LIVE");
    }

    /** Venture investment */

    /**
     * @notice Fund a venture proposal.
     * @param venture The address of the VentureEth contract to invest in.
     * @param investment The ether to invest in the venture.
     */
    function investVenture(
        address payable venture,
        uint256 investment
    ) public virtual onlyProposal {
        ventures.add(venture);
        VentureEth(venture).invest.value(investment)();
        emit VentureAdded(venture);
    }

    /**
     * @notice Retrieve tokens minted for the DAO after an investment.
     * @param venture The address of the VentureEth contract to retrieve tokens from.
     */
    function retrieveVentureTokens(
        address payable venture
    ) public virtual {
        VentureEth(venture).claim();
    }

    /**
     * @notice Cancel an investment of the DAO.
     * @param venture The address of the VentureEth contract from which to cancel the investment.
     */
    function cancelVenture(
        address payable venture
    ) public virtual onlyProposal {
        VentureEth(venture).cancelInvestment();
        ventures.remove(venture);
    }

    /**
     * @notice Instruct the DAO to claim dividends from a venture.
     * @param venture The venture to claim dividends from.
     */
    function claimDividendsFromVenture(
        address payable venture
    ) public virtual returns(uint256) {
        return VentureEth(venture).claimDividends();
    }

    /** Dividend distribution */

    /**
     * @notice Hook for proposals to release dividends.
     * @param amount The ether amount to be released as dividends.
     */
    function releaseDividends(uint256 amount) public virtual onlyProposal {
        _releaseDividends(amount);
    }

    /** Restart investor round */

    /**
     * @notice Hook for proposals to restart investor rounds.
     */
    function restartInvestorRound(uint256 _issuePrice) public virtual onlyProposal {
        _transition("SETUP");
        this.setIssuePrice(_issuePrice);
        this.startIssuance();
    }

    /**
     * @notice Hook for proposals to start distribution in a non-initial investment round.
     */
    function restartDistribution() public virtual onlyProposal {
        _transition("LIVE");
    }

    /**
     * @notice Hook for proposals to cancel all new investments in a non-initial investment round.
     */
    function cancelInvestmentRound() public virtual onlyProposal {
        this.cancelAllInvestments();
    }

    /** Enumerators */

    /**
     * @notice Returns the invested ventures.
     */
    /* function enumerateVentures() public virtual view returns (address[] memory) {
        return ventures.enumerate();
    } */ // Disabled until fixed by OpenZeppelin
}