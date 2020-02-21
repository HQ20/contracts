pragma solidity ^0.5.10;

import "@hq20/fixidity/contracts/FixidityLib.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "./ERC20MintableDetailed.sol";
import "../utils/SafeCast.sol";


/**
 * @title ERC20DividendableEth
 * @dev Implements an ERC20MintableDetailed token with a dividend distribution procedure for etehreum received
 * @notice This contract was implemented from algorithms proposed by Nick Johnson here: https://medium.com/@weka/dividend-bearing-tokens-on-ethereum-42d01c710657
 */
contract ERC20DividendableEth is ERC20MintableDetailed {

    using SafeMath for uint256;
    using SafeCast for uint256;
    using SafeCast for int256;
    using FixidityLib for int256;

    uint256 public dividendsPerToken; // This should be a Fixidity fixed point number

    mapping(address => uint256) public lastDividendsPerToken; // This should be a Fixidity fixed point number

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) ERC20MintableDetailed(name, symbol, decimals) public {}

    /**
     * @notice Send ether to this function in orther to disburse dividends
     */
    function releaseDividends() external payable {
        releaseDividends(msg.value);
    }

    /**
     * @dev Function to update the account of the sender
     * @notice Will revert if account need not be updated
     */
    function claimDividends() public returns(uint256) {
        return claimDividends(msg.sender);
    }

    // Specify in natspec this takes an amount in wei.
    function releaseDividends(uint256 amount) internal {
        int256 fixedSupply = this.totalSupply().safeUintToInt(); // This needs to be converted from ether/wei to Fixidity with .newFixed(this.decimals())
        int256 fixedValue = amount.safeUintToInt().newFixed(); // This needs to be converted from ether/wei to Fixidity with .newFixed(this.decimals())
        uint256 releasedDividends = fixedValue
            .divide(fixedSupply).fromFixed(this.decimals()).safeIntToUint(); // dividendsPerToken is a Fixidity number, so no need to convert back.
        dividendsPerToken = dividendsPerToken.add(releasedDividends);
    }

    function claimDividends(
        address payable account
    ) internal returns(uint256) {
        uint256 owing = dividendsOwing(account);
        require(owing > 0, "Account need not be updated now.");
        account.transfer(owing);
        lastDividendsPerToken[account] = dividendsPerToken;
        return owing;
    }

    /**
     * @dev Internal function to compute dividends owing to an account
     * @param account The account for which to compute the dividends
     */
    // Specify in natspec this returns an amount in wei.
    // Let's make sure that we have numerical tests for this one, not only 100% overage. I'll think of a test suite.
    function dividendsOwing(address account) internal view returns(uint256) {
        uint256 owedDividendsPerToken = dividendsPerToken
            .sub(lastDividendsPerToken[account]);
        int256 fixedBalance = this.balanceOf(account)
            .safeUintToInt(); // This needs to be converted from ether/wei to Fixidity with .newFixed(this.decimals())
        int256 fixedOwed = owedDividendsPerToken
            .safeUintToInt().newFixed(this.decimals()); // owedDividendsPerToken is already a Fixidity number, remove the .newFixed(this.decimals()) extra conversion
        return fixedBalance.multiply(fixedOwed).fromFixed().safeIntToUint(); // To convert back from fixidity to ether/wei is .fromFixed(this.decimals())
    }

}