pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "../issuance/IssuanceEth.sol";
import "../../token/ERC20Dividendable.sol";


contract DAO is ERC20Dividendable, IssuanceEth {

    mapping(address => uint256) begAmount;
    uint256 totalAmounts;
    mapping(address => mapping(address => uint256)) votesForIdeaByHolder;
    mapping(address => uint256) totalVotesForIdea;
    mapping(address => uint256) totalVotesByHolder;
    mapping(address => address[]) backersForIdea;


    constructor() ERC20Dividendable() IssuanceEth(address(this)) public {
        _createState("NEVER");
        _createTransition("LIVE", "SETUP");
        _createTransition("FAILED", "SETUP");
    }

    function transferFunds(address payable _wallet) public onlyOwner {
        require(currentState == "NEVER", "You can never do this.");
    }

    function restartFundingRound() public onlyOwner {
        require(
            currentState == "LIVE" || currentState == "FAILED",
            "Initial funding round not ended."
        );
        _transition("SETUP");
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
            this.balanceOf(msg.sender) - totalVotesByHolder[msg.sender] >= votes,
            "Not enough power."
        );
        totalVotesForIdea[idea] += votes;
        totalVotesByHolder[msg.sender] += votes;
        votesForIdeaByHolder[idea][msg.sender] += votes;
        resolveBackerForIdea(idea, msg.sender);
    }

    function fundIdea(address payable idea) public {
        require(currentState == "LIVE", "Founders not defined yet.");
        require(
            totalVotesForIdea[idea] >= this.totalSupply().div(2) + 1,
            "Not enough expressed votes."
        );
        totalAmounts -= begAmount[idea];
        for (uint256 i = 0; i < backersForIdea[idea].length; i++) {
            totalVotesByHolder[backersForIdea[
                    idea
                ][i]] -= votesForIdeaByHolder[
                    idea
                ][backersForIdea[idea][i]];
        }
        delete totalVotesForIdea[idea];
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

    function resolveBackerForIdea(address idea, address backer) internal {
        for (uint256 i = 0; i < backersForIdea[idea].length; i++) {
            if (backersForIdea[idea][i] == backer){
                return;
            }
        }
        backersForIdea[idea].push(backer);
    }

}