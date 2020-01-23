pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../../issuance/IssuanceEth.sol";
import "../token/ERC20MultiDividendable.sol";


/**
 * @title DAO
 * @notice This is an exeprimental DAO (Decentralised Autonomous Organization) implementation. Use with caution.
 * @dev The contract inhertis from ERC20Mintable and IssuanceEth, so it's an issuance that has its own address
 * as issuance token. It also inherits from ERC20MultiDividendable, so it can invest in other IssuanceEth's
 * issuance tokens and distribute them to the investors.
 */
contract DAO is ERC20Mintable, ERC20MultiDividendable, IssuanceEth {

    using SafeMath for uint256;

    mapping(address => uint256) public proposedFundingForVenture;
    uint256 fundingPool;
    mapping(address =>
        mapping(address => uint256)
    ) public votesForVentureByHolder;
    mapping(address => uint256) public totalVotesForVenture;
    mapping(address => uint256) public totalVotesByHolder;
    mapping(address => address[]) public backersForVenture;
    event Here();

    constructor()
    ERC20Mintable()
    ERC20MultiDividendable()
    IssuanceEth(address(this))
    public
    {
        _createTransition("LIVE", "SETUP");
        _createTransition("FAILED", "SETUP");
        addMinter(address(this));
    }

    /**
     * @notice Disables removing all Ether funds, inherited from IssuanceEth
     */
    function transferFunds(address payable _wallet) public onlyOwner {
        revert("Ether can only be invested or withdrawn.");
    }

    /**
     * @notice Restarts the funding round. To be used when new investors board on the DAO. Can only be used after the original funding round.
     */
    function reopenInvestorRound() public onlyOwner {
        require(
            currentState == "LIVE" || currentState == "FAILED",
            "Initial funding round not ended."
        );
        _transition("SETUP");
    }

    /**
     * @notice Propose funding for venture. Can only be used after the original funding round. venture must be of type IssuanceEth.
     * @param funding The amount to proposed as funding for the venture.
     * @param venture The proposed venture. Must be of type IssuanceEth.
     */
    function proposeVenture(uint256 funding, address venture) public {
        require(currentState == "LIVE", "DAO needs to be LIVE.");
        require(
            fundingPool.add(funding) <= address(this).balance,
            "Not enough funds."
        );
        proposedFundingForVenture[venture] = funding;
    }

    /**
     * @notice Vote for venture. Can only be used after the original funding round.
     * @param votes The amount of tokens to lock for the venture
     * @param venture The venture to vote for. Must be of type IssuanceEth.
     */
    function voteForVenture(uint256 votes, address venture) public {
        require(currentState == "LIVE", "DAO needs to be LIVE.");
        require(
            this.balanceOf(msg.sender).sub(totalVotesByHolder[msg.sender]) >= votes,
            "Not enough power."
        );
        totalVotesForVenture[venture] = totalVotesForVenture[venture].add(votes);
        totalVotesByHolder[msg.sender] = totalVotesByHolder[msg.sender].add(
            votes
        );
        votesForVentureByHolder[venture][msg.sender] = votesForVentureByHolder[venture][
            msg.sender].add(votes);
        resolveBackerForVenture(venture, msg.sender);
    }

    /**
     * @notice Fund venture. Can only be used after the original funding round, and after voting total is over 50% + 1 of total DAO tokens.
     * @param venture The venture to fund. Must be of type IssuanceEth.
     */
    function fundVenture(address venture) public {
        require(currentState == "LIVE", "DAO needs to be LIVE.");
        require(
            totalVotesForVenture[venture] >= this.totalSupply().div(2).add(1),
            "Not enough expressed votes."
        );
        uint256 amount = proposedFundingForVenture[venture];
        fundingPool -= amount;
        for (uint256 i = 0; i < backersForVenture[venture].length; i++) {
            totalVotesByHolder[backersForVenture[
                    venture
                ][i]] -= votesForVentureByHolder[
                    venture
                ][backersForVenture[venture][i]];
        }
        delete totalVotesForVenture[venture];
        delete proposedFundingForVenture[venture];
        // solium-disable-next-line security/no-call-value
        IssuanceEth(venture).invest.value(amount)();
    }

    /**
     * @notice Withdraws issuance tokens from funded venture. Can only be used after the original funding round, and after funding the venture.
     * @param venture The venture to withdraw tokens from. Must be of type IssuanceEth.
     */
    function getTokensForFundedVenture(address venture) public {
        require(currentState == "LIVE", "DAO needs to be LIVE.");
        IssuanceEth issuance = IssuanceEth(venture);
        ERC20Mintable issuanceToken = ERC20Mintable(
            address(issuance.issuanceToken())
        );
        issuance.withdraw();
    }

    /**
     * @dev Disburses dividends from tokens withdrawn from funded venture. Can only be used after the original funding round, and withdrawing the tokens for funded venture.
     * @param venture The venture whose issuance tokens to add to the dividends pool. Must be of type IssuanceEth.
     */
    function getReturnsFromTokensOfFundedVenture(address venture) public {
        require(currentState == "LIVE", "DAO needs to be LIVE.");
        IssuanceEth issuance = IssuanceEth(venture);
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

    function resolveBackerForVenture(address venture, address backer) internal {
        for (uint256 i = 0; i < backersForVenture[venture].length; i++) {
            if (backersForVenture[venture][i] == backer){
                return;
            }
        }
        backersForVenture[venture].push(backer);
    }

}