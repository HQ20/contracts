pragma solidity ^0.5.10;

import "@hq20/fixidity/contracts/FixidityLib.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "../../token/ERC20MintableDetailed.sol";
import "./../../state/StateMachine.sol";


/**
 * @title IssuanceAdvanced
 * @notice Implements the investment round procedure for issuances
 */
contract IssuanceAdvanced is Ownable, StateMachine, ReentrancyGuard {

    using SafeMath for uint256;
    using FixidityLib for int256;

    event IssuanceCreated();

    event IssuePriceSet();
    event OpeningDateSet();
    event ClosingDateSet();
    event SoftCapSet();
    event MinInvestmentSet();

    event InvestmentAdded(address investor, uint256 amount);
    event InvestmentCancelled(address investor, uint256 amount);

    IERC20 public currencyToken;
    ERC20MintableDetailed public issuanceToken;

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
        issuanceToken = ERC20MintableDetailed(_issuanceToken);
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
        if (issuePrice > 0){
            require(
                _amount.mod(uint256(issuePrice)) == 0,
                "Fractional investments not allowed."
            );
        }
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

    function claim() external nonReentrant {
        require(currentState == "LIVE", "Cannot claim now.");
        require(investments[msg.sender] > 0, "No investments found.");
        uint256 amount = investments[msg.sender];
        investments[msg.sender] = 0;
        issuanceToken.mint(
            msg.sender,
            // formula here
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
    function cancelAllInvestments() public onlyOwner{
        _transition("FAILED");
    }

    /**
     * @dev Function to transfer all collected tokens to the wallet of the owner
     */
    function withdraw(address _wallet) public onlyOwner {
        require(currentState == "LIVE", "Cannot transfer funds now.");
        currencyToken.transfer(_wallet, amountRaised);
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