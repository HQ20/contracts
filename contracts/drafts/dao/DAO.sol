pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../../issuance/IssuanceEth.sol";
import "../token/ERC20MultiDividendable.sol";


/**
 * @title DAO
 * @notice This is an exeprimental DAO (Decentralised Autonomous Organization) implementation. Use with caution.
 * @dev The contract inhertis from ERC20Mintable and IssuanceEth, so it's an issuance that has its own address as issuance token. It also inherits from ERC20MultiDividendable, so it can invest in other IssuanceEth's issuance tokens and distribute them to the investors.
 */
contract DAO is ERC20Mintable, ERC20MultiDividendable, IssuanceEth {

    using SafeMath for uint256;

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

    /**
     * @notice Blocks the call of transferFunds, inherited from IssuanceEth
     */
    function transferFunds(address payable _wallet) public onlyOwner {
        require(currentState == "NEVER", "You can never do this.");
    }

    /**
     * @notice Restarts the funding round. To be used when new investors board on the DAO. Can only be used after the original funding round.
     */
    function restartFundingRound() public onlyOwner {
        require(
            currentState == "LIVE" || currentState == "FAILED",
            "Initial funding round not ended."
        );
        _transition("SETUP");
    }

    /**
     * @notice Beg money for idea. Can only be used after the original funding round. idea must be of type IssuanceEth.
     * @param amount The amount to beg
     * @param idea The idea to beg for. Must be of type IssuanceEth.
     */
    function begMoneyForIdea(uint256 amount, address idea) public {
        require(currentState == "LIVE", "DAO needs to be LIVE.");
        require(
            totalAmounts.add(amount) <= address(this).balance,
            "You beg too much."
        );
        begAmount[idea] = amount;
    }

    /**
     * @notice Vote for idea. Can only be used after the original funding round.
     * @param votes The amount of tokens to lock for the idea
     * @param idea The idea to vote for. Must be of type IssuanceEth.
     */
    function voteForIdea(uint256 votes, address idea) public {
        require(currentState == "LIVE", "DAO needs to be LIVE.");
        require(
            this.balanceOf(msg.sender).sub(totalVotesByHolder[msg.sender]) >= votes,
            "Not enough power."
        );
        totalVotesForIdea[idea] = totalVotesForIdea[idea].add(votes);
        totalVotesByHolder[msg.sender] = totalVotesByHolder[msg.sender].add(
            votes
        );
        votesForIdeaByHolder[idea][msg.sender] = votesForIdeaByHolder[idea][
            msg.sender].add(votes);
        resolveBackerForIdea(idea, msg.sender);
    }

    /**
     * @notice Fund idea. Can only be used after the original funding round, and after voting total is over 50% + 1 of total DAO tokens.
     * @param idea The idea to fund. Must be of type IssuanceEth.
     */
    function fundIdea(address idea) public {
        require(currentState == "LIVE", "DAO needs to be LIVE.");
        require(
            totalVotesForIdea[idea] >= this.totalSupply().div(2).add(1),
            "Not enough expressed votes."
        );
        uint256 amount = begAmount[idea];
        totalAmounts -= amount;
        for (uint256 i = 0; i < backersForIdea[idea].length; i++) {
            totalVotesByHolder[backersForIdea[
                    idea
                ][i]] -= votesForIdeaByHolder[
                    idea
                ][backersForIdea[idea][i]];
        }
        delete totalVotesForIdea[idea];
        delete begAmount[idea];
        // solium-disable-next-line security/no-call-value
        IssuanceEth(idea).invest.value(amount)();
    }

    /**
     * @notice Withdraws issuance tokens from funded idea. Can only be used after the original funding round, and after funding the idea.
     * @param idea The idea to withdraw tokens from. Must be of type IssuanceEth.
     */
    function getTokensForFundedIdea(address idea) public {
        require(currentState == "LIVE", "DAO needs to be LIVE.");
        IssuanceEth issuance = IssuanceEth(idea);
        ERC20Mintable issuanceToken = ERC20Mintable(
            address(issuance.issuanceToken())
        );
        issuance.withdraw();
    }

    /**
     * @dev Disburses dividends from tokens withdrawn from funded idea. Can only be used after the original funding round, and withdrawing the tokens for funded idea.
     * @param idea The idea whose issuance tokens to add to the dividends pool. Must be of type IssuanceEth.
     */
    function getReturnsFromTokensOfFundedIdea(address idea) public {
        require(currentState == "LIVE", "DAO needs to be LIVE.");
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