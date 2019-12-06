pragma solidity ^0.5.10;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./../state/StateMachine.sol";


/**
 * @title IssuanceToken
 * @notice This is the ERC20 token that the Issuance will mint to investors
 */
contract IssuanceToken is ERC20Mintable, ERC20Detailed {

    constructor(string memory name, string memory symbol, uint8 decimals)
    public
    ERC20Detailed(name, symbol, decimals) {}

}


/**
 * @title Issuance
 * @notice Implements the investment round procedure for issuances
 */
contract Issuance is Ownable, StateMachine, ReentrancyGuard {

    using SafeMath for uint256;

    event IssuanceCreated();

    event IssuePriceSet();
    event OpeningDateSet();
    event ClosingDateSet();
    event SoftCapSet();
    event MinInvestmentSet();

    event InvestmentAdded(address investor, uint256 amount);
    event InvestmentCancelled(address investor, uint256 amount);

    IERC20 public currencyToken;
    IssuanceToken public issuanceToken;

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
        address _issuanceToken,
        address _currencyToken
    ) public Ownable() StateMachine() {
        issuanceToken = IssuanceToken(_issuanceToken);
        currencyToken = IssuanceToken(_currencyToken);
        createState("OPEN");
        createState("LIVE");
        createState("FAILED");
        createTransition("SETUP", "OPEN");
        createTransition("OPEN", "LIVE");
        createTransition("OPEN", "FAILED");
        emit IssuanceCreated();
    }

    /**
     * @dev Use this function to invest. Must have approved this contract (from the frontend) to spend _amount of currencyToken tokens.
     * @param _amount The amount of currencyToken tokens that will be invested.
     */
    function invest(uint256 _amount) external {
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
            _amount.div(10 ** uint256(issuanceToken.decimals())).mod(issuePrice) == 0,
            "Fractional investments not allowed."
        );
        require(
            _amount >= minInvestment,
            "Investment below minimum threshold."
        );

        currencyToken.transferFrom(msg.sender, address(this), _amount);

        if (investments[msg.sender] == 0){
            investors.push(msg.sender);
        }
        investments[msg.sender] = investments[msg.sender].add(_amount);

        amountRaised = amountRaised.add(_amount);

        emit InvestmentAdded(msg.sender, _amount);
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
        currencyToken.transfer(msg.sender, amount);
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
        transition("OPEN");
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
        transition("LIVE");
    }

    /**
     * @dev Function to cancel all investments
     */
    function cancelAllInvestments() public onlyOwner{
        transition("FAILED");
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