pragma solidity ^0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "./VentureEth.sol";
import "./../../voting/Voting.sol";


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
contract DAO is VentureEth {

    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    event VentureProposed(address proposal);
    event ProfitProposed(address proposal);
    event RoundProposed(address proposal);
    event VentureAdded(address venture);

    uint256 public threshold;

    EnumerableSet.AddressSet internal proposals;
    EnumerableSet.AddressSet internal ventures;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 _threshold
    ) VentureEth(name, symbol, decimals) public {
        // solium-disable-next-line security/no-low-level-calls
        (bool success, ) = address(this).delegatecall(
            abi.encodeWithSignature("transferOwnership(address)", address(this))
        );
        require(success, "Could not transfer ownership to the DAO.");
        _createTransition("LIVE", "SETUP");
        _createTransition("FAILED", "SETUP");
        threshold = _threshold;
    }

    /**
     * @dev Fallback function. Required when collecting ether dividends from ventures.
     */
    function () external payable {}

    /**
     * @notice The withdraw function inherited from VentureEth is disabled. The funds can be transferred exclusively by the vote of the investors.
     */
    function withdraw(address payable) public onlyOwner nonReentrant {
        revert("Withdraw is disabled.");
    }

    /** DAO investment round */

    /**
     * @notice To be called during an investor round.
     * @param daoPrice The issue price of the DAO.
     */
    function setDAOprice(uint256 daoPrice) public {
        require(
            totalSupply() == 0 || proposals.contains(msg.sender),
            "Could not set the DAO price."
        );
        setIssuePrice(daoPrice);
        proposals.remove(msg.sender);
    }

    /**
     * @notice To be called during an investor round.
     */
    function startDAO() public {
        require(
            totalSupply() == 0 || proposals.contains(msg.sender),
            "Could not start the DAO."
        );
        startIssuance();
        proposals.remove(msg.sender);
    }

    /**
     * @notice To be called during an investment round.
     */
    function startDistribution() public {
        require(
            totalSupply() == 0 || proposals.contains(msg.sender),
            "Could not start distribution."
        );
        super.startDistribution();
        proposals.remove(msg.sender);
    }

    /**
     * @notice To be called during an investment round.
     */
    function cancelAllInvestments() public {
        require(
            totalSupply() == 0 || proposals.contains(msg.sender),
            "Could not cancel investments."
        );
        cancelAllInvestments();
        proposals.remove(msg.sender);
    }

    /** Venture investment */

    /**
     * @notice Propose a venture. Must have approved the DAO to spend gage of your DAO tokens. venture must inherit from VentureEth.
     * @param venture The address of the VentureEth contract
     * @param investment The ether to invest in the venture.
     */
    function proposeVenture(
        address venture,
        uint256 investment
    ) public {
        // Maybe use ERC165 to make sure venture it's a VentureEth
        require(currentState == "LIVE", "DAO needs to be LIVE");
        Voting voting = new Voting(address(this), threshold);
        voting.registerProposal(
            address(this),
            abi.encodeWithSignature("investVenture(address,uint256)", venture, investment)
        );
        voting.open();
        proposals.add(address(voting));
        emit VentureProposed(address(voting));
    }

    /**
     * @notice Fund a venture proposal.
     * @param venture The address of the VentureEth contract to invest in.
     * @param investment The ether to invest in the venture.
     */
    function investVenture(
        address venture,
        uint256 investment
    ) public {
        require(
            proposals.contains(msg.sender),
            "Only a proposal can execute."
        );
        VentureEth(venture).invest.value(investment)();
        ventures.add(venture);
        proposals.remove(msg.sender);
        emit VentureAdded(venture);
    }

    /**
     * @notice Retrieve tokens minted for the DAO after an investment.
     * @param venture The address of the VentureEth contract to retrieve tokens from.
     */
    function retrieveVentureTokens(
        address venture
    ) public {
        require(currentState == "LIVE", "DAO needs to be LIVE");
        VentureEth(venture).claim();
    }

    /**
     * @notice Instruct the DAO to claim dividends from a venture.
     * @param venture The venture to claim dividends from.
     */
    function claimDividendsFromVenture(
        address venture
    ) public returns(uint256) {
        return VentureEth(venture).claimDividends();
    }

    /** Dividend distribution */

    /**
     * @notice Propose to release DAO dividends.
     * @param amount The ether amount to be released as dividends.
     */
    function proposeDividends(uint256 amount) public {
        require(currentState == "LIVE", "DAO needs to be LIVE");
        Voting voting = new Voting(address(this), threshold);
        voting.registerProposal(
            address(this),
            abi.encodeWithSignature("releaseDividends(uint256)", amount)
        );
        voting.open();
        proposals.add(address(voting));
        emit ProfitProposed(address(voting));
    }

    /**
     * @notice Hook for proposals to release dividends.
     * @param amount The ether amount to be released as dividends.
     */
    function releaseDividends(uint256 amount) public {
        require(
            proposals.contains(msg.sender),
            "Only a proposal can execute."
        );
        _releaseDividends(amount);
        proposals.remove(msg.sender);
    }

    /** Reopen investor round */

    function proposeInvestorRound() public {
        require(
            currentState == "LIVE" || currentState == "FAILED",
            "DAO needs to be LIVE or FAILED."
        );
        Voting voting = new Voting(address(this), threshold);
        voting.registerProposal(
            address(this),
            abi.encodeWithSignature("reopenInvestorRound()", 0x0);
        );
        voting.open();
        proposals.add(address(voting));
        emit RoundProposed(address(voting));
    }

    /**
     * @notice Hook for proposals to reopen investor rounds.
     */
    function reopenInvestorRound() public {
        require(
            proposals.contains(msg.sender),
            "Only a proposal can execute."
        );
        _transition("SETUP");
        proposals.remove(msg.sender);
    }

    /** Enumerators */

    /**
     * @notice Returns the invested ventures.
     */
    function enumerateVentures() public view returns (address[] memory) {
        return ventures.enumerate();
    }

    /**
     * @notice Returns the voting proposals.
     */
    function enumerateProposals() public view returns (address[] memory) {
        return proposals.enumerate();
    }
}