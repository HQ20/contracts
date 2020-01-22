pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "../../issuance/IssuanceEth.sol";
import "../token/ERC20MultiDividendable.sol";


contract DAO is ERC20Mintable, ERC20MultiDividendable, IssuanceEth {

    mapping(address => uint256) public begAmount;
    uint256 totalAmounts;
    mapping(address =>
        mapping(address => uint256)
    ) public votesForIdeaByHolder;
    mapping(address => uint256) public totalVotesForIdea;
    mapping(address => uint256) public totalVotesByHolder;
    mapping(address => address[]) public backersForIdea;
    event Here();

    constructor()
    ERC20Mintable()
    ERC20MultiDividendable()
    IssuanceEth(address(this))
    public
    {
        _createState("NEVER");
        _createTransition("LIVE", "SETUP");
        _createTransition("FAILED", "SETUP");
        addMinter(address(this));
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
        // solium-disable-next-line security/no-call-value
        IssuanceEth(idea).invest.value(begAmount[idea])();
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
    }

    function getTokensForFundedIdea(address idea) public {
        require(currentState == "LIVE", "Founders not defined yet.");
        IssuanceEth issuance = IssuanceEth(idea);
        ERC20Mintable issuanceToken = ERC20Mintable(
            address(issuance.issuanceToken())
        );
        issuance.withdraw();
    }

    function getReturnsFromTokensOfFundedIdea(address idea) public {
        require(currentState == "LIVE", "Founders not defined yet.");
        IssuanceEth issuance = IssuanceEth(idea);
        address dividendToken = address(issuance.issuanceToken());
        uint256 tokenIndexBefore = tokenIndex;
        resolveDividendToken(dividendToken);
        require(tokenIndex != tokenIndexBefore, "Cannot get returns again.");
        totalDividends[dividendToken] = totalDividends[dividendToken].add(
                ERC20Mintable(dividendToken).balanceOf(address(this))
            );
        totalDividendPoints[dividendToken] = totalDividends[dividendToken]
            .mul(pointMultiplier).div(this.totalSupply());
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