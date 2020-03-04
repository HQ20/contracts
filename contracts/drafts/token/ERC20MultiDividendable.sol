pragma solidity ^0.5.10;

import "@hq20/fixidity/contracts/FixidityLib.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../../token/ERC20MintableDetailed.sol";
import "../../utils/SafeCast.sol";


/**
 * @title ERC20MultiDividendable
 * @dev Implements an ERC20Mintable token with a dividend distribution procedure for dividendTokens received
 * @notice This contract was implemented from algorithms proposed by Nick Johnson here: https://medium.com/@weka/dividend-bearing-tokens-on-ethereum-42d01c710657
 */
contract ERC20MultiDividendable is ERC20MintableDetailed {

    using SafeMath for uint256;
    using FixidityLib for int256;
    using SafeCast for uint256;

    mapping(address => uint256) public dividendsPerToken;
    mapping(address =>
        mapping(address => uint256)
    ) public lastDividendsPerToken;
    mapping(uint256 => address) public dividendTokens;
    uint256 public tokenIndex;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) ERC20MintableDetailed(name, symbol, decimals) public {}

    /**
     * @notice Send dividendTokens to this function in orther to increase the dividends pool
     * @dev Must have approved this contract to spend amount of dividendToken from msg.sender
     * @param amount The amount of dividendTokens to transfer from msg.sender to this contract
     * @param dividendToken The address of the token you wish to transfer to this contract
     */
    function releaseDividends(uint256 amount, address dividendToken) external {
        IERC20 dividendTokenContract = IERC20(dividendToken);
        resolveDividendToken(dividendToken);
        dividendTokenContract.transferFrom(msg.sender, address(this), amount);
        int256 fixedSupply = this.totalSupply()
            .safeUintToInt();
        int256 fixedValue = amount.safeUintToInt().newFixed();
        uint256 releasedDividends = fixedValue
            .divide(fixedSupply).fromFixed(this.decimals()).safeIntToUint();
        dividendsPerToken[dividendToken] = dividendsPerToken[dividendToken]
            .add(releasedDividends);
    }

    /**
     * @dev Function to update an account
     * @param account The account to update
     * @param dividendToken The address of the token you wish to transfer to this contract
     * @notice Will revert if account need not be updated
     */
    function claimDividends(
        address payable account,
        address dividendToken
    ) public returns (uint256) {
        uint owing = dividendsOwing(account, dividendToken);
        require(
            owing > 0,
            "Account need not be updated now for this dividend token."
        );
        IERC20(dividendToken).transfer(account, owing);
        lastDividendsPerToken[account][dividendToken] = dividendsPerToken[
                dividendToken
            ];
        return owing;
    }

    function resolveDividendToken(
        address dividendToken
    ) internal {
        for (uint256 i = 0; i < tokenIndex; i++){
            if (dividendTokens[i] == dividendToken){
                return;
            }
        }
        dividendTokens[tokenIndex] = dividendToken;
        tokenIndex = tokenIndex + 1;
    }

    /**
     * @dev Internal function to compute dividends owing to an account
     * @param account The account for which to compute the dividends
     * @param dividendToken The address of the token you wish to transfer to this contract
     */
    function dividendsOwing(
        address account,
        address dividendToken
    ) internal view returns(uint256) {
        uint256 owedDividendsPerToken = dividendsPerToken[dividendToken]
            .sub(lastDividendsPerToken[account][dividendToken]);
        int256 fixedBalance = this.balanceOf(account)
            .safeUintToInt();
        int256 fixedOwed = owedDividendsPerToken
            .safeUintToInt().newFixed(this.decimals());
        return fixedBalance.multiply(fixedOwed).fromFixed().safeIntToUint();
    }
}