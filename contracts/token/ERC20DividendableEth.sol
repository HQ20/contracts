pragma solidity ^0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


/**
 * @title ERC20DividendableEth
 * @dev Implements an ERC20 token with a dividend distribution procedure for etehreum received
 * @notice This contract was implemented from algorithms proposed by Nick Johnson here: https://medium.com/@weka/dividend-bearing-tokens-on-ethereum-42d01c710657
 */
contract ERC20DividendableEth is ERC20 {

    using SafeMath for uint;

    uint public pointMultiplier = 10e18; // This should be 10**decimals(). We should use Fixidity instead.
    uint public totalDividends; // Remove
    uint public totalDividendPoints; // Rename as dividendsPerToken.

    mapping(address => uint) public lastDividendPoints; // Rename as lastDividendsPerToken

    constructor() public {}

    /**
     * @notice Send ether to this function in orther to disburse dividends
     */
    function increasePool() external payable { // Rename as releaseDividends
        totalDividends = totalDividends.add(msg.value); // Remove
        totalDividendPoints = totalDividends.mul(pointMultiplier).div(this.totalSupply()); // Rename to dividendsPerToken and change formula as below.
        // dividendsPerToken = dividendsPerToken + ((msg.value * pointMultiplier) / this.totalSupply())
    } // Split into an internal function _releaseDividends(uint256) and an external one releaseDividends() that calls _releaseDividends(msg.value)

    /**
     * @dev Function to update an account
     * @param account The account to update
     * @notice Will revert if account need not be updated
     */
    function updateAccount(address payable account) public returns(uint) { // Rename as claimDividends
        uint owing = dividendsOwing(account);
        require(owing > 0, "Account need not be updated now.");
        lastDividendPoints[account] = totalDividendPoints;
        account.transfer(owing);
        return owing;
    } // Split into an internal _claimDividends(address payable) with this exact functionality, and a public claimDividends that calls _claimDividends(msg.sender).

    /**
     * @dev Internal function to compute dividends owing to an account
     * @param account The account for which to compute the dividends
     */
    function dividendsOwing(address account) internal view returns(uint) {
        uint newDividendPoints = totalDividendPoints // Rename newDividendPoints to owedDividendsPerToken.
            .sub(lastDividendPoints[account]);
        return this.balanceOf(account)
            .mul(newDividendPoints).div(pointMultiplier);
    }

}