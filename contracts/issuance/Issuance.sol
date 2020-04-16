pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../token/IERC20Detailed.sol";
import "../token/IERC20Mintable.sol";
import "../state/StateMachine.sol";
import "../math/DecimalMath.sol";


/**
 * @title Issuance
 * @dev Implements a very simple issuance process for tokens
 *
 * 1. Initialize contract with issuance token and currency token. Both tokens must inherit from ERC20Minatble and ERC20Detailed.
 * 2. Use `setIssuePrice` to determine how many currency tokens do investors
 *    have to pay for each issued token.
 * 3. Use `startIssuance` to allow investors to invest.
 * 4. Investors can `invest` their currency tokens at will.
 * 5. Investors can also `cancelInvestment` and get their currency tokens back.
 * 6. The contract owner can `cancelAllInvestments` to close the investment phase.
 *    In this case `invest` is not available, but `cancelInvestment` is.
 * 7. Use `startDistribution` to close the investment phase.
 * 8. Investors can only `claim` their issuance tokens now.
 * 9. Owner can use `withdraw` to send collected currency tokens to a wallet.
 */
contract Issuance is Ownable, StateMachine, ReentrancyGuard {
    using SafeMath for uint256;
    using DecimalMath for uint256;

    event IssuanceCreated();
    event IssuePriceSet();
    event InvestmentAdded(address investor, uint256 amount);
    event InvestmentCancelled(address investor, uint256 amount);

    address public currencyToken;
    address public issuanceToken;

    address[] public investors;
    mapping(address => uint256) public investments;

    uint256 public amountRaised;
    uint256 public amountWithdrawn;
    uint256 public issuePrice;

    /**
     * @dev Initialize the issuance with the token to issue and the token to
     * accept as payment.
     */
    constructor(
        address _issuanceToken,
        address _currencyToken
    ) public Ownable() StateMachine() {
        issuanceToken = _issuanceToken;
        currencyToken = _currencyToken;
        _createTransition("SETUP", "OPEN");
        _createTransition("OPEN", "LIVE");
        _createTransition("OPEN", "FAILED");
        emit IssuanceCreated();
    }

    /**
     * @dev Use this function to invest. Must have approved this contract
     * (from the frontend) to spend _amount of currencyToken tokens.
     * @param _amount The amount of currencyToken tokens that will be invested.
     */
    function invest(uint256 _amount) external virtual {
        require(
            currentState == "OPEN",
            "Not open for investments."
        );
        require(
            _amount.mod(issuePrice) == 0,
            "Fractional investments not allowed."
        );
        IERC20(currencyToken).transferFrom(msg.sender, address(this), _amount);
        if (investments[msg.sender] == 0){
            investors.push(msg.sender);
        }
        investments[msg.sender] = investments[msg.sender].add(_amount);
        amountRaised = amountRaised.add(_amount);
        emit InvestmentAdded(msg.sender, _amount);
    }

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
        IERC20(currencyToken).transfer(msg.sender, amount);
        emit InvestmentCancelled(msg.sender, amount);
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
    function withdraw(address _wallet) public virtual onlyOwner {
        require(
            currentState == "LIVE",
            "Cannot withdraw funds now."
        );
        uint256 amount = amountRaised - amountWithdrawn;
        amountWithdrawn = amount;
        IERC20(currencyToken).transfer(_wallet, amountRaised);
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
