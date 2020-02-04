pragma solidity ^0.5.10;

import "@hq20/fixidity/contracts/FixidityLib.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./../token/IERC20Mintable.sol";
import "./../state/StateMachine.sol";


/**
 * @title Issuance
 * @dev Implements a very simple issuance process for tokens
 *
 * 1. Initialize contract with issuance token and currency token.
 * 2. Use `setIssuePrice` to determine how many currency tokens do investors
 *    have to pay for each issued token. The `issuePrice` parameter works like this:
 *    - issuePrice > 0 : issuanceToken.mintAmount = currencyToken.investedAmount / issuePrice;
      - issuePrice < 0 : issuanceToken.mintAmount = currencyToken.investedAmount * (-1) * issuePrice;
      - issuePrice = 0 : revert.
 * 3. Use `openIssuance` to allow investors to invest.
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
    using FixidityLib for int256;

    event IssuanceCreated();
    event IssuePriceSet();
    event InvestmentAdded(address investor, uint256 amount);
    event InvestmentCancelled(address investor, uint256 amount);

    IERC20 public currencyToken;
    IERC20Mintable public issuanceToken;

    address[] public investors;
    mapping(address => uint256) public investments;

    uint256 public amountRaised;
    int256 public issuePrice;
    uint256 internal nextInvestor;

    /**
     * @dev Initialize the issuance with the token to issue and the token to
     * accept as payment.
     */
    constructor(
        address _issuanceToken,
        address _currencyToken
    ) public Ownable() StateMachine() {
        issuanceToken = IERC20Mintable(_issuanceToken);
        currencyToken = IERC20(_currencyToken);
        _createState("OPEN");
        _createState("LIVE");
        _createState("FAILED");
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
    function invest(uint256 _amount) external {
        require(
            currentState == "OPEN",
            "Not open for investments."
        );
        if (issuePrice > 0){
            require(
                _amount.mod(uint256(issuePrice)) == 0,
                "Fractional investments not allowed."
            );
        }
        currencyToken.transferFrom(msg.sender, address(this), _amount);
        if (investments[msg.sender] == 0){
            investors.push(msg.sender);
        }
        investments[msg.sender] = investments[msg.sender].add(_amount);
        amountRaised = amountRaised.add(_amount);
        emit InvestmentAdded(msg.sender, _amount);
    }

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
        if (issuePrice > 0) {
            issuanceToken.mint(
                msg.sender,
                uint256(int256(amount).newFixed().divide(issuePrice.newFixed()).fromFixed())
            );
        }
        else {
            issuanceToken.mint(
                msg.sender,
                uint256(int256(amount).newFixed().multiply(issuePrice.newFixed().abs()).fromFixed())
            );
        }
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
        currencyToken.transfer(msg.sender, amount);
        emit InvestmentCancelled(msg.sender, amount);
    }

    /**
     * @dev Function to open the issuance to investors
     */
    function openIssuance() public onlyOwner {
        require(
            issuePrice != 0,
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
    function withdraw(address _wallet) public onlyOwner {
        require(
            currentState == "LIVE",
            "Cannot transfer funds now."
        );
        currencyToken.transfer(_wallet, amountRaised);
    }

    function setIssuePrice(int256 _issuePrice) public onlyOwner {
        require(
            currentState == "SETUP",
            "Cannot setup now."
        );
        require(_issuePrice != 0, "Cannot set issuePrice to be zero.");
        issuePrice = _issuePrice;
        emit IssuePriceSet();
    }
}
