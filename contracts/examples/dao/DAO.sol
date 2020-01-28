pragma solidity ^0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./VentureEth.sol";


/**
 * @title DAO
 * @dev The contract inherits from VentureEth.
 * @notice This is an exeprimental DAO (Decentralised Autonomous Organization) implementation. Use with caution.
 * 1. Issue the DAO tokens through an inital funding round.
 * 2. Propose a venture, and funding amount.
 * 3. Vote for a venture. Each DAO token is 1 vote. If venture is funded, tokens are reenabled for voting.
 * 4. Fund a venture. Votes must total 50% + 1 or more.
 * 5. Claim the venture tokens.
 * 6. Increase the DAO pool with returns (if any) on the tokens from a funded venture.
 * 7. Claim ether dividends from the DAO.
 * 8. Raise new capital for the DAO by restarting the funding round.
 */
contract DAO is VentureEth {

    using SafeMath for uint256;

    mapping(address => uint256) public proposedFundingForVenture;
    uint256 public fundingPool;
    mapping(address =>
        mapping(address => uint256)
    ) public votesForVentureByHolder;
    mapping(address => uint256) public totalVotesForVenture;
    mapping(address => uint256) public totalVotesByHolder;
    mapping(address => address[]) public backersForVenture;

    constructor() VentureEth() public {}

    /**
     * @dev Fallback function. Required when collecting ether dividends from ventures.
     */
    function () external payable {}

    /**
     * @notice The withdraw function inherited from VentureEth is disabled. The funds can be transferred exclusively by the vote of the investors.
     */
    function withdraw(address payable) public onlyOwner nonReentrant {
        revert("Cannot transfer funds.");
    }

    /**
     * @notice Propose funding for venture. Can only be used after the original funding round. venture must be of type IssuanceEth.
     * @param funding The amount to proposed as funding for the venture.
     * @param venture The proposed venture. Must be of type IssuanceEth.
     */
    function proposeVenture(uint256 funding, address venture) public {
        require(currentState == "LIVE", "DAO needs to be LIVE.");
        uint256 newFundingPool = fundingPool.add(funding);
        require(
            newFundingPool <= address(this).balance,
            "Not enough funds."
        );
        fundingPool = newFundingPool;
        proposedFundingForVenture[address(VentureEth(venture))] = funding;
    }

    /**
     * @notice Vote for venture. Can only be used after the original funding round.
     * @param votes The amount of tokens to lock for the venture
     * @param venture The venture to vote for. Must be of type VentureEth.
     */
    function voteForVenture(uint256 votes, address venture) public {
        require(currentState == "LIVE", "DAO needs to be LIVE.");
        require(
            this.balanceOf(msg.sender).sub(totalVotesByHolder[msg.sender]) >= votes,
            "Not enough power."
        );
        totalVotesForVenture[venture] = totalVotesForVenture[venture].add(
            votes
        );
        totalVotesByHolder[msg.sender] = totalVotesByHolder[msg.sender].add(
            votes
        );
        votesForVentureByHolder[venture][msg.sender] = votesForVentureByHolder[
            venture][msg.sender].add(votes);
        addBackerForVenture(venture, msg.sender);
    }

    /**
     * @notice Fund venture. Can only be used after the original funding round, and after voting total is over 50% + 1 of total DAO tokens.
     * @param venture The venture to fund. Must be of type VentureEth.
     */
    function fundVenture(address venture) public {
        require(currentState == "LIVE", "DAO needs to be LIVE.");
        require(
            totalVotesForVenture[venture] >= this.totalSupply().div(2).add(1),
            "Not enough expressed votes."
        );
        uint256 amount = proposedFundingForVenture[venture];
        fundingPool = fundingPool.sub(amount);
        address backer;
        for (uint256 i = 0; i < backersForVenture[venture].length; i++) {
            backer = backersForVenture[venture][i];
            totalVotesByHolder[backer] = totalVotesByHolder[backer].sub(
                votesForVentureByHolder[venture][backer]
            );
        }
        delete totalVotesForVenture[venture];
        delete proposedFundingForVenture[venture];
        // solium-disable-next-line security/no-call-value
        VentureEth(venture).invest.value(amount)();
    }

    /**
     * @notice Claims issuance tokens from funded venture. Can only be used after the original funding round, and after funding the venture.
     * @param venture The venture to claim tokens from. Must be of type VentureEth.
     */
    function claimTokensForFundedVenture(address venture) public {
        require(currentState == "LIVE", "DAO needs to be LIVE.");
        VentureEth(venture).claim();
    }

    /**
     * @notice Disburses dividends from tokens claimed from funded venture. Can only be used after the original funding round, and after claiming the tokens from a funded venture.
     * @param venture The venture whose issuance tokens to add to the dividends pool. Must be of type VentureEth.
     */
    function getReturnsFromTokensOfFundedVenture(address venture) public {
        require(currentState == "LIVE", "DAO needs to be LIVE.");
        totalDividends = totalDividends.add(
            VentureEth(venture).updateAccount(address(this))
        );
        totalDividendPoints = totalDividends
            .mul(pointMultiplier).div(this.totalSupply());
    }

    /**
     * @dev Adds a backer for a venture, i.e. pushes it at the end of the backersForVenture array if not present already.
     * @param venture The venture whose backer to add
     * @param backer The backer to add for the given venture
     */
    function addBackerForVenture(
        address venture,
        address backer
    ) internal {
        for (uint256 i = 0; i < backersForVenture[venture].length; i++) {
            if (backersForVenture[venture][i] == backer){
                return;
            }
        }
        backersForVenture[venture].push(backer);
    }

}