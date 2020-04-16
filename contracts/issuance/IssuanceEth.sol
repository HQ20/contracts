pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../token/IERC20Mintable.sol";
import "../state/StateMachine.sol";
import "../math/DecimalMath.sol";


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
    using DecimalMath for uint256;

    event IssuanceCreated();
    event IssuePriceSet();
    event InvestmentAdded(address investor, uint256 amount);
    event InvestmentCancelled(address investor, uint256 amount);

    address public issuanceToken;

    address[] public investors;
    mapping(address => uint256) public investments;

    uint256 public amountRaised;
    uint256 public amountWithdrawn;
    uint256 public issuePrice;

    constructor(
        address _issuanceToken
    ) public Ownable() StateMachine() {
        issuanceToken = _issuanceToken;
        _createTransition("SETUP", "OPEN");
        _createTransition("OPEN", "LIVE");
        _createTransition("OPEN", "FAILED");
        emit IssuanceCreated();
    }

    /**
     * @notice Use this function to claim your issuance tokens
     * @dev Each user will call this function on his behalf
     */
    function claim() external virtual nonReentrant {
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
        IERC20Mintable _issuanceToken = IERC20Mintable(
            issuanceToken
        );
        _issuanceToken.mint(
            msg.sender,
            amount.divd(issuePrice, _issuanceToken.decimals())
        );
    }

    /**
     * @dev Function for an investor to cancel his investment
     */
    function cancelInvestment() external virtual nonReentrant {
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
    function invest() public virtual payable {
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
    function startIssuance() public virtual onlyOwner {
        require(
            issuePrice > 0,
            "Issue price not set."
        );
        _transition("OPEN");
    }

    /**
     * @dev Function to move to the distributing phase
     */
    function startDistribution() public virtual onlyOwner {
        _transition("LIVE");
    }

    /**
     * @dev Function to cancel all investments
     */
    function cancelAllInvestments() public virtual onlyOwner{
        _transition("FAILED");
    }

    /**
     * @dev Function to transfer all collected tokens to the wallet of the owner
     */
    function withdraw(address payable _wallet)
        public
        virtual
        onlyOwner
        nonReentrant
    {
        require(
            currentState == "LIVE",
            "Cannot withdraw funds now."
        );
        uint256 amount = amountRaised - amountWithdrawn;
        amountWithdrawn = amount;
        _wallet.transfer(amount);
    }

    function setIssuePrice(uint256 _issuePrice) public virtual onlyOwner {
        require(
            currentState == "SETUP",
            "Cannot setup now."
        );
        issuePrice = _issuePrice;
        emit IssuePriceSet();
    }
}