pragma solidity ^0.5.10;

import "@hq20/fixidity/contracts/FixidityLib.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../token/ERC20MintableDetailed.sol";
import "../state/StateMachine.sol";
import "../utils/SafeCast.sol";


/**
 * @title Issuance
 * @notice Implements a very simple issuance process for tokens
 *
 * 1. Initialize contract with the issuance token contract address. This address must inherit from `ERC20Mintable` and `ERC20Detailed`.
 * 2. Use `setIssuePrice` to determine how many ether (in wei) do investors
 *    have to pay for each issued token.
 * 3. Use `startIssuance` to allow investors to invest.
 * 4. Investors can `invest` their ether at will.
 * 5. Investors can also `cancelInvestment` and get their ether back.
 * 6. The contract owner can `cancelAllInvestments` to close the investment phase.
 *    In this case `invest` is not available, but `cancelInvestment` is.
 * 7. Use `startDistribution` to close the investment phase.
 * 8. Investors can only `claim` their issued tokens now.
 * 9. Owner can use `withdraw` to send collected ether to a wallet.
 */
contract IssuanceEth is Ownable, StateMachine, ReentrancyGuard {
    using SafeMath for uint256;
    using FixidityLib for int256;
    using SafeCast for *;

    event IssuanceCreated();
    event IssuePriceSet();
    event InvestmentAdded(address investor, uint256 amount);
    event InvestmentCancelled(address investor, uint256 amount);

    ERC20MintableDetailed public issuanceToken;

    address[] public investors;
    mapping(address => uint256) public investments;

    uint256 public amountRaised;
    uint256 public amountWithdrawn;
    uint256 public issuePrice;
    uint256 internal nextInvestor;

    constructor(
        address _issuanceToken
    ) public Ownable() StateMachine() {
        issuanceToken = ERC20MintableDetailed(_issuanceToken);
        _createState("OPEN");
        _createState("LIVE");
        _createState("FAILED");
        _createTransition("SETUP", "OPEN");
        _createTransition("OPEN", "LIVE");
        _createTransition("OPEN", "FAILED");
        emit IssuanceCreated();
    }

    /**
     * @notice Use this function to claim your issuance tokens
     * @dev Each user will call this function on his behalf
     */
    function claim() external nonReentrant {
        require(
            currentState == "LIVE",
            "Cannot claim now."
        );
        require(
            investments[msg.sender] > 0,
            "No investments found."
        );
        uint256 amount = investments[msg.sender];
        investments[msg.sender] = 0;
        int256 investedFixed = amount.safeUintToInt().newFixed(18);
        int256 issuePriceFixed = issuePrice.safeUintToInt().newFixed(18);
        int256 issuanceTokensFixed = investedFixed.divide(issuePriceFixed);
        uint256 issuanceTokens = issuanceTokensFixed.fromFixed(
                issuanceToken.decimals()
            ).safeIntToUint();
        issuanceToken.mint(
            msg.sender,
            issuanceTokens
        );
    }

    /**
     * @dev Function for an investor to cancel his investment
     */
    function cancelInvestment() external nonReentrant {
        require (
            currentState == "OPEN" || currentState == "FAILED",
            "Cannot cancel now."
        );
        require(
            investments[msg.sender] > 0,
            "No investments found."
        );
        uint256 amount = investments[msg.sender];
        investments[msg.sender] = 0;
        msg.sender.transfer(amount);
        emit InvestmentCancelled(msg.sender, amount);
    }

    /**
     * @notice Invest into the issuance by sending ether to this function
     */
    function invest() public payable {
        require(
            currentState == "OPEN",
            "Not open for investments."
        );
        require(
            msg.value.mod(issuePrice) == 0,
            "Fractional investments not allowed."
        );
        if (investments[msg.sender] == 0){
            investors.push(msg.sender);
        }
        investments[msg.sender] = investments[msg.sender].add(msg.value);
        amountRaised = amountRaised.add(msg.value);
        emit InvestmentAdded(msg.sender, msg.value);
    }

    /**
     * @dev Function to open the issuance to investors
     */
    function startIssuance() public onlyOwner {
        require(
            issuePrice > 0,
            "Issue price not set."
        );
        _transition("OPEN");
    }

    /**
     * @dev Function to move to the distributing phase
     */
    function startDistribution() public onlyOwner {
        _transition("LIVE");
    }

    /**
     * @dev Function to cancel all investments
     */
    function cancelAllInvestments() public onlyOwner{
        _transition("FAILED");
    }

    /**
     * @dev Function to transfer all collected tokens to the wallet of the owner
     */
    function withdraw(address payable _wallet) public onlyOwner nonReentrant {
        require(
            currentState == "LIVE",
            "Cannot withdraw funds now."
        );
        uint256 amount = amountRaised - amountWithdrawn;
        amountWithdrawn = amount;
        _wallet.transfer(amount);
    }

    function setIssuePrice(uint256 _issuePrice) public onlyOwner {
        require(
            currentState == "SETUP",
            "Cannot setup now."
        );
        issuePrice = _issuePrice;
        emit IssuePriceSet();
    }
}