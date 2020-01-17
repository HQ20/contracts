pragma solidity ^0.5.10;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./../token/IERC20Mintable.sol";
import "./../state/StateMachine.sol";


/**
 * @title Issuance
 * @notice Implements a very simple issuance process for tokens
 */
contract IssuanceEth is Ownable, StateMachine, ReentrancyGuard {

    using SafeMath for uint256;

    event IssuanceCreated();

    event IssuePriceSet();

    event InvestmentAdded(address investor, uint256 amount);
    event InvestmentCancelled(address investor, uint256 amount);

    IERC20Mintable public issuanceToken;

    address[] public investors;
    mapping(address => uint256) public investments;

    uint256 public amountRaised;
    uint256 public issuePrice;

    uint256 nextInvestor;

    constructor(
        address _issuanceToken
    ) public Ownable() StateMachine() {
        issuanceToken = IERC20Mintable(_issuanceToken);
        _createState("OPEN");
        _createState("LIVE");
        _createState("FAILED");
        _createTransition("SETUP", "OPEN");
        _createTransition("OPEN", "LIVE");
        _createTransition("OPEN", "FAILED");
        emit IssuanceCreated();
    }

    /**
     * @dev Use this function to invest. Must have approved this contract (from the frontend) to spend _amount of currencyToken tokens.
     */
    function () external payable {
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

    function withdraw() external nonReentrant {
        require(
            currentState == "LIVE",
            "Cannot withdraw now."
        );
        require(
            investments[msg.sender] > 0,
            "No investments found."
        );
        uint256 amount = investments[msg.sender];
        investments[msg.sender] = 0;
        issuanceToken.mint(msg.sender, amount.div(issuePrice));
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
     * @dev Function to open the issuance to investors
     */
    function openIssuance() public onlyOwner {
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
    function transferFunds(address payable _wallet) public onlyOwner {
        require(
            currentState == "LIVE",
            "Cannot transfer funds now."
        );
        _wallet.transfer(amountRaised);
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