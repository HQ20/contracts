pragma solidity ^0.5.10;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./../../token/IERC20Mintable.sol";
import "./../../state/StateMachine.sol";


/**
 * @title IssuanceEth
 * @notice Implements the investment round procedure for issuances that accept ethereum
 */
contract IssuanceEth is Ownable, StateMachine, ReentrancyGuard {

    using SafeMath for uint256;

    event IssuanceCreated();

    event IssuePriceSet();
    event OpeningDateSet();
    event ClosingDateSet();
    event SoftCapSet();
    event MinInvestmentSet();

    event InvestmentAdded(address investor, uint256 amount);
    event InvestmentCancelled(address investor, uint256 amount);

    IERC20Mintable public issuanceToken;

    address[] public investors;
    mapping(address => uint256) public investments;

    uint256 public amountRaised;
    uint256 public issuePrice;
    uint256 public softCap;
    uint256 public minInvestment;

    uint256 public openingDate;
    uint256 public closingDate;

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
     * @dev Fallback function.
     * @notice Use this function to invest.
     */
    function () external payable {
        require(
            currentState == "OPEN",
            "Not open for investments."
        );
        require(
            // solium-disable-next-line security/no-block-members
            now >= openingDate && now <= closingDate,
            "Not the right time."
        );
        require(
            msg.value.mod(issuePrice) == 0,
            "Fractional investments not allowed."
        );
        require(
            msg.value >= minInvestment,
            "Investment below minimum threshold."
        );

        if (investments[msg.sender] == 0){
            investors.push(msg.sender);
        }

        investments[msg.sender] = investments[msg.sender].add(msg.value);

        amountRaised = amountRaised.add(msg.value);

        emit InvestmentAdded(msg.sender, msg.value);
    }

    function withdraw() external nonReentrant {
        require(currentState == "LIVE", "Cannot withdraw now.");
        require(investments[msg.sender] > 0, "No investments found.");
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
        require(investments[msg.sender] > 0, "No investments found.");
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
            // solium-disable-next-line security/no-block-members
            now >= openingDate && now <= closingDate,
            "Not the right time."
        );
        _transition("OPEN");
    }

    /**
     * @dev Function to move to the distributing phase
     */
    function startDistribution() public onlyOwner {
        require(
            // solium-disable-next-line security/no-block-members
            now >= closingDate,
            "Not the right time yet."
        );
        require(
            amountRaised >= softCap,
            "Not enough funds collected."
        );
        _transition("LIVE");
    }

    /**
     * @dev Function to cancel all investments
     */
    function cancelAllInvestments() public onlyOwner {
        _transition("FAILED");
    }

    /**
     * @dev Function to transfer all collected tokens to the wallet of the owner
     */
    function transferFunds(address payable _wallet) public onlyOwner {
        require(currentState == "LIVE", "Cannot transfer funds now.");
        _wallet.transfer(amountRaised);
    }

    function setIssuePrice(uint256 _issuePrice) public onlyOwner {
        require(currentState == "SETUP", "Cannot setup now.");
        issuePrice = _issuePrice;
        emit IssuePriceSet();
    }

    function setOpeningDate(uint256 _openingDate) public onlyOwner {
        require(currentState == "SETUP", "Cannot setup now.");
        openingDate = _openingDate;
        emit OpeningDateSet();
    }

    function setClosingDate(uint256 _closingDate) public onlyOwner {
        require(currentState == "SETUP", "Cannot setup now.");
        closingDate = _closingDate;
        emit ClosingDateSet();
    }

    function setSoftCap(uint256 _softCap) public onlyOwner {
        require(currentState == "SETUP", "Cannot setup now.");
        softCap = _softCap;
        emit SoftCapSet();
    }

    function setMinInvestment(uint256 _minInvestment) public onlyOwner {
        require(currentState == "SETUP", "Cannot setup now.");
        minInvestment = _minInvestment;
        emit MinInvestmentSet();
    }

}