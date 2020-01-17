pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";


/**
 * @title ERC20Dividendable
 * @dev Implements an ERC20Mintable token with a dividend distribution procedure for etehreum received
 * @notice This contract was implemented from algorithms proposed by Nick Johnson here: https://medium.com/@weka/dividend-bearing-tokens-on-ethereum-42d01c710657
 */
contract ERC20DividendableEth is ERC20Mintable {

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
