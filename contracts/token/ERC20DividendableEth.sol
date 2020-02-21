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
    using FixidityLib for int256;
    using SafeCast for uint256;
    using SafeCast for int256;

    uint256 public dividendsPerToken;

    mapping(address => uint256) public lastDividendsPerToken;
    mapping(address => uint256) public dividendsPerTokenAdjustment;

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
     * @dev See {IERC20-transfer}.
     *
     * Requirements:
     *
     * - `recipient` cannot be the zero address.
     * - the caller must have a balance of at least `amount`.
     */
    function transfer(
        address recipient,
        uint256 amount
    ) public returns (bool) {
        int256 weight = amount.safeUintToInt().newFixed()
            .divide(this.balanceOf(recipient).safeUintToInt())
            .fromFixed(this.decimals());
        int256 dividendsPerTokenDifferential = lastDividendsPerToken[
            msg.sender].safeUintToInt()
            .subtract(lastDividendsPerToken[recipient].safeUintToInt())
            .abs();
        int256 weightedDifferential = dividendsPerTokenDifferential
            .newFixed(this.decimals())
            .multiply(weight).fromFixed();
        dividendsPerTokenAdjustment[recipient] = dividendsPerTokenAdjustment[
            recipient].safeUintToInt()
            .add(weightedDifferential).safeIntToUint();
        return super.transfer(recipient, amount);
    }

    /**
     * @dev See {IERC20-transferFrom}.
     *
     * Emits an {Approval} event indicating the updated allowance. This is not
     * required by the EIP. See the note at the beginning of {ERC20};
     *
     * Requirements:
     * - `sender` and `recipient` cannot be the zero address.
     * - `sender` must have a balance of at least `amount`.
     * - the caller must have allowance for `sender`'s tokens of at least
     * `amount`.
     */
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) public returns (bool) {
        int256 weight = amount.safeUintToInt().newFixed()
            .divide(this.balanceOf(recipient).safeUintToInt())
            .fromFixed(this.decimals());
        uint256 dividendsPerTokenDifferential = lastDividendsPerToken[
            sender].safeUintToInt()
            .subtract(lastDividendsPerToken[recipient].safeUintToInt())
            .abs().safeIntToUint();
        int256 weightedDifferential = dividendsPerTokenDifferential
            .safeUintToInt().newFixed(this.decimals())
            .multiply(weight).fromFixed();
        dividendsPerTokenAdjustment[recipient] = dividendsPerTokenAdjustment[
            recipient].safeUintToInt()
            .add(weightedDifferential).safeIntToUint();
        return super.transferFrom(sender, recipient, amount);
    }

    /**
     * @dev Function to update the account of the sender
     * @notice Will revert if account need not be updated
     */
    function claimDividends() public returns(uint256) {
        return claimDividends(msg.sender);
    }

    function releaseDividends(uint256 amount) internal {
        int256 fixedSupply = this.totalSupply()
            .safeUintToInt();
        int256 fixedValue = amount.safeUintToInt().newFixed();
        uint256 releasedDividends = fixedValue
            .divide(fixedSupply).fromFixed(this.decimals()).safeIntToUint();
        dividendsPerToken = dividendsPerToken.add(releasedDividends);
    }

    function claimDividends(
        address payable account
    ) internal returns(uint256) {
        uint256 owing = dividendsOwing(account);
        require(owing > 0, "Account need not be updated now.");
        dividendsPerTokenAdjustment[account] = 0;
        lastDividendsPerToken[account] = dividendsPerToken;
        account.transfer(owing);
        return owing;
    }

    /**
     * @dev Internal function to compute dividends owing to an account
     * @param account The account for which to compute the dividends
     */
    function dividendsOwing(address account) internal view returns(uint256) {
        uint256 owedDividendsPerToken = dividendsPerToken.safeUintToInt()
            .subtract(lastDividendsPerToken[account].safeUintToInt())
            .add(dividendsPerTokenAdjustment[account].safeUintToInt())
            .safeIntToUint();
        int256 fixedBalance = this.balanceOf(account)
            .safeUintToInt();
        int256 fixedOwed = owedDividendsPerToken
            .safeUintToInt().newFixed(this.decimals());
        return fixedBalance.multiply(fixedOwed).fromFixed().safeIntToUint();
    }

}