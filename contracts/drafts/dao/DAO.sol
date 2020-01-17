pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "../issuance/IssuanceEth.sol";
import "../../token/ERC20Dividendable.sol";


contract DAO is ERC20Dividendable, IssuanceEth {

    mapping(address => uint256) begAmount;
    uint256 totalAmounts;
    mapping(address => mapping(address => uint256)) individualVotes;
    mapping(address => uint256) totalVotes;

    constructor() ERC20Dividendable() IssuanceEth(address(this)) public {
        _createState("NEVER");
    }

    function transferFunds(address payable _wallet) public onlyOwner {
        require(currentState == "NEVER", "You can never do this.");
    }

    function begMoneyForIdea(uint256 amount, address payable idea) public {
        require(currentState == "LIVE", "Founders not defined yet.");
        require(
            totalAmounts + amount <= address(this).balance,
            "You beg too much."
        );
        resolveDividendToken(address(IssuanceEth(idea).issuanceToken()));
        begAmount[idea] = amount;
    }

    function voteForIdea(uint256 votes, address idea) public {
        require(currentState == "LIVE", "Founders not defined yet.");
        require(
            this.balanceOf(msg.sender) - individualVotes[idea][msg.sender] >= votes,
            "Not enough power."
        );
        individualVotes[idea][msg.sender] += votes;
        totalVotes[idea] += votes;
    }

    function fundIdea(address payable idea) public {
        require(currentState == "LIVE", "Founders not defined yet.");
        require(
            totalVotes[idea] >= this.totalSupply().div(2) + 1,
            "Not enough expressed votes."
        );
        totalAmounts -= begAmount[idea];
        delete totalVotes[idea];
        delete individualVotes[idea];
        delete begAmount[idea];
        address(IssuanceEth(idea)).transfer(begAmount[idea]);
    }

    function getReturnsForFundedIdea(address payable idea) public {
        require(currentState == "LIVE", "Founders not defined yet.");
        IssuanceEth issuance = IssuanceEth(idea);
        issuance.withdraw();
        this.increasePool(
            ERC20Mintable(address(issuance.issuanceToken())).balanceOf(address(this)),
            address(issuance.issuanceToken())
        );
    }

}