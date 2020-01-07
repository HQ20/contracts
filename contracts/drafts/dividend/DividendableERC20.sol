pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";


/**
 * @title DividendableERC20
 * @notice Implements an ERC20 mintable token with a dividend distribution procedure
 * This contract was implemented from algorithms proposed by Nick Johnson.
 * https://medium.com/@weka/dividend-bearing-tokens-on-ethereum-42d01c710657
 */
contract DividendableERC20 is IERC20 {

    using SafeMath for uint;

    uint pointMultiplier = 10e18;
    uint totalDividends;
    uint totalDividendPoints;
    mapping(address => uint) lastDividendPoints;

    constructor() public {}

    /**
     * @dev Fallback function
     * @notice Send ether to this contract in orther to disburse dividends
     */
    function () external payable {
        totalDividends = totalDividends.add(msg.value);
        totalDividendPoints = totalDividends
            .mul(pointMultiplier).div(this.totalSupply());
    }

    /**
     * @dev Function to update an account
     * @param account The account to update
     * @notice Will revert if account need not be updated
     */
    function updateAccount(address payable account) public {
        uint owing = dividendsOwing(account);
        require(owing > 0, "Account need not be updated now.");
        account.transfer(owing);
        lastDividendPoints[account] = totalDividendPoints;
    }

    /**
     * @dev Internal function to compute dividends owing to an account
     * @param account The account for which to compute the dividends
     */
    function dividendsOwing(address account) internal view returns(uint) {
        uint newDividendPoints = totalDividendPoints
            .sub(lastDividendPoints[account]);
        return this.balanceOf(account)
            .mul(newDividendPoints).div(pointMultiplier);
    }
}
