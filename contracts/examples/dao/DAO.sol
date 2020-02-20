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
    event VentureAdded(address venture);

    uint256 public threshold;

    mapping(address => address) private proposals;
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
        proposals[venture] = address(voting);
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
            proposals[venture] == msg.sender,
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
        VentureEth(venture).claim();
    }

    /**
     * @notice Profit from an investment by claiming dividends for the DAO on the venture.
     * @param venture The address of the VentureEth contract to profit from.
     */
    function profitFromVenture(address venture) public {
        totalDividends = totalDividends.add(
            VentureEth(venture).updateAccount(address(this))
        );
        totalDividendPoints = totalDividends
            .mul(pointMultiplier).div(this.totalSupply());
    }

    /**
     * @notice Returns the invested ventures.
     */
    function enumerateVentures() public view returns (address[] memory) {
        return ventures.enumerate();
    }

}