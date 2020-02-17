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
 * 1. Issue the DAO tokens through an inital funding round.
 * 2. Propose a venture, and funding amount. You will have to stake the DAO's gage until either the venture is funded or you decide to drop the proposal.
 * 3. Vote for a venture. Each DAO token is 1 vote. If venture is funded, or if you renounce your vote, you must manualy take back the tokens.
 * 4. Fund a venture. Votes count must surpass the DAO's threshold for a majority.
 * 5. Retrieve the venture tokens.
 * 6. Increase the DAO pool with returns (if any) on the tokens from a funded venture.
 * 7. Claim ether dividends from the DAO on behalf of your DAO tokens.
 */
contract DAO is VentureEth {

    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    event VentureProposed(address proposal);

    uint256 public fundingPool;
    uint256 public gage;
    uint256 public threshold;

    mapping(address => address) private proposals;
    EnumerableSet.AddressSet internal ventures;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 _threshold,
        uint256 _gage
    ) VentureEth(name, symbol, decimals) public {
        gage = _gage;
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
        revert("Cannot transfer funds.");
    }

    /**
     * @notice Propose a venture. Must have approved the DAO to spend gage of your DAO tokens. venture must inherit from VentureEth.
     * @param venture The address of the VentureEth contract
     * @param funding The ether to fund the venture with.
     */
    function proposeVenture(
        address venture,
        uint256 funding
    ) public {
        require(currentState == state, "DAO needs to be LIVE");

        this.transferFrom(msg.sender, address(this), gage);
        VentureProposal proposal = new VentureProposal(address(this), venture, funding, threshold);
        proposal.open();
        proposals[venture] = address(proposal);
        emit VentureProposed(address(proposal));
    }

    /**
     * @notice Fund a venture proposal.
     * @param venture The address of the VentureEth contract to fund.
     * @param funding The ether to fund the venture with.
     */
    function fundVenture(
        address venture,
        unit256 funding
    ) public {
        require(proposals[venture] == msg.sender);
        VentureProposal proposal = VentureProposal(msg.sender);
        require(proposal.currentState == "PASSED");

        VentureEth(venture).invest.value(funding)()  // Maybe use ERC165 to make sure it's a VentureEth
        fundingPool = fundingPool.sub(funding);
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
        require(proposals[venture] == msg.sender);
        VentureProposal proposal = VentureProposal(msg.sender);
        require(proposal.currentState == "FUNDED");
        VentureEth(venture).claim();
    }

    /**
     * @notice Profit from an investment by claiming dividends for the DAO on the venture.
     * @param venture The address of the VentureEth contract to profit from.
     */
    function profitFromVenture(address venture) public {
        require(
            ventures.contains(venture),
            "Venture not in portfolio."
        );
        totalDividends = totalDividends.add(
            VentureEth(venture).updateAccount(address(this))
        );
        totalDividendPoints = totalDividends
            .mul(pointMultiplier).div(this.totalSupply());
    }

    /**
     * @notice Returns the currently proposed ventures.
     */
    function enumerateVentures() public view returns (address[] memory) {
        return ventures.enumerate();
    }

}