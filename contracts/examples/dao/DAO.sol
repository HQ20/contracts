pragma solidity ^0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "./VentureEth.sol";
import "../../drafts/voting/Voting.sol";


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
    event VentureAdded(address venture);

    uint256 public threshold;

    mapping(address => address) private ventureProposals;
    address private dividendProposal;
    EnumerableSet.AddressSet internal ventures;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 _threshold
    ) VentureEth(name, symbol, decimals) public {
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
        ventureProposals[venture] = address(voting);
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
            ventureProposals[venture] == msg.sender,
            "Only a proposal can execute."
        );
        VentureEth(venture).invest.value(investment)();
        ventures.add(venture);
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

    /**
     * @notice Returns the invested ventures.
     */
    function enumerateVentures() public view returns (address[] memory) {
        return ventures.enumerate();
    }

    /** Dividend distribution */

    /**
     * @notice Propose to release DAO dividends.
     * @param amount The ether amount to be released as dividends.
     */
    function proposeDividends(uint256 amount) public {
        require(currentState == "LIVE", "DAO needs to be LIVE");
        require(
            dividendProposal == address(0),
            "A proposal has already been submitted."
        );
        Voting voting = new Voting(address(this), threshold);
        voting.registerProposal(
            address(this),
            abi.encodeWithSignature("releaseDividends(uint256)", amount)
        );
        voting.open();
        // solium-disable-next-line security/no-block-members
        dividendProposal = address(voting);
        emit ProfitProposed(address(voting));
    }

    /**
     * @notice Hook for proposals to release dividends.
     * @param amount The ether amount to be released as dividends.
     */
    function releaseDividends(uint256 amount) public {
        require(
            dividendProposal == msg.sender,
            "Only a proposal can execute."
        );
        _releaseDividends(amount);
        dividendProposal = address(0);
    }
}