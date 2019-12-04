pragma solidity ^0.5.10;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
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
contract Issuance is Ownable, StateMachine {

    using SafeMath for uint256;

    event IssuanceCreated();
    event IssuanceOpened();
    event IssuanceDistributing();
    event IssuanceLive();
    event IssuanceFailed();

    event IssuePriceSet();
    event OpeningDateSet();
    event ClosingDateSet();
    event MinIssueSizeSet();
    event MinTicketSizeSet();

    event InvestmentProcessed(address investor, uint256 amount);
    event SentTokensToInvestor(address investor, uint256 amount);
    event InvestmentCancelled(address investor, uint256 amount);

    IERC20 public acceptedToken;
    IssuanceToken public issuanceToken;

    address[] public investors;
    mapping(address => uint256) public investments;

    uint256 public issueSize;
    uint256 public issuePrice;
    uint256 public minIssueSize;
    uint256 public minTicketSize;

    uint256 public openingDate;
    uint256 public closingDate;

    uint256 nextInvestor;

    constructor(
        string memory _issuanceName,
        string memory _issuanceSymbol,
        uint8 _issuanceDecimals,
        address _acceptedToken
    ) public Ownable() StateMachine() {
        issuanceToken = new IssuanceToken(
            _issuanceName,
            _issuanceSymbol,
            _issuanceDecimals
        );
        acceptedToken = IssuanceToken(_acceptedToken);
        createState("OPEN");
        createState("DISTRIBUTING");
        createState("LIVE");
        createState("FAILED");
        createTransition("SETUP", "OPEN");
        createTransition("OPEN", "DISTRIBUTING");
        createTransition("DISTRIBUTING", "LIVE");
        createTransition("OPEN", "FAILED");
        emit IssuanceCreated();
    }

    /**
     * @dev Use this function to invest. Must have approved this contract (from the frontend) to spend _amount of acceptedToken tokens.
     * @param _amount The amount of acceptedToken tokens that will be invested.
     */
    function invest(uint256 _amount) external {
        require(
            // solium-disable-next-line security/no-block-members
            now >= openingDate && now <= closingDate && currentState == "OPEN",
            "Not open for investments."
        );
        require(
            _amount.mod(issuePrice) == 0,
            "Fractional investments not allowed."
        );
        require(
            _amount >= minTicketSize,
            "Investment below minimum threshold."
        );

        acceptedToken.transferFrom(msg.sender, address(this), _amount);

        if (investments[msg.sender] == 0){
            investors.push(msg.sender);
        }
        investments[msg.sender] = investments[msg.sender].add(_amount);

        issueSize = issueSize.add(_amount);

        emit InvestmentProcessed(msg.sender, _amount);
    }

    /**
     * @dev Function to open the issuance to investors
     */
    function openIssuance() public onlyOwner {
        require(
            // solium-disable-next-line security/no-block-members
            now >= openingDate && now <= closingDate && currentState == "SETUP",
            "Cannot open now."
        );
        require(
            address(issuanceToken) != address(0),
            "Issuance address not set."
        );
        transition("OPEN");
        emit IssuanceOpened();
    }

    /**
     * @dev Function to move to the distributing phase
     */
    function closeInvestments() public onlyOwner {
        require(
            // solium-disable-next-line security/no-block-members
            now >= closingDate && currentState == "OPEN",
            "Cannot send tokens now."
        );
        require(issueSize >= minIssueSize, "Not enough funds collected yet.");
        transition("DISTRIBUTING");
        emit IssuanceDistributing();
    }

    /**
     * @dev Function to call repeatedly from frontend, until all investors receive their tokens
     */
    function sendToNextInvestor() public onlyOwner {
        require(currentState == "DISTRIBUTING", "Cannot send tokens now.");
        if (nextInvestor >= investors.length) {
            transition("LIVE");
            emit IssuanceLive();
        } else {
            issuanceToken.mint(
                investors[nextInvestor],
                investments[investors[nextInvestor]].div(issuePrice)
            );
            emit SentTokensToInvestor(
                investors[nextInvestor],
                investments[investors[nextInvestor]].div(issuePrice)
            );
            nextInvestor = nextInvestor.add(1);
        }
    }

    /**
     * @dev Function to cancel the investment of a certain investor
     */
    function cancelInvestment() public {
        require (currentState == "OPEN", "Cannot cancel now.");
        acceptedToken.transfer(msg.sender, investments[msg.sender]);
        emit InvestmentCancelled(msg.sender, investments[msg.sender]);
        investments[msg.sender] = 0;
    }

    /**
     * @dev Function to cancel all investments and close the issuance
     */
    function cancelAllInvestments() public onlyOwner{
        require (currentState == "OPEN", "Cannot cancel now.");
        for (uint256 i = 0; i < investors.length; i++){
            acceptedToken.transfer(investors[i], investments[investors[i]]);
        }
        transition("FAILED");
        emit IssuanceFailed();
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

    function setMinIssueSize(uint256 _minIssueSize) public onlyOwner {
        require(currentState == "SETUP", "Cannot setup now.");
        minIssueSize = _minIssueSize;
        emit MinIssueSizeSet();
    }

    function setMinTicketSize(uint256 _minTicketSize) public onlyOwner {
        require(currentState == "SETUP", "Cannot setup now.");
        minTicketSize = _minTicketSize;
        emit MinTicketSizeSet();
    }

}