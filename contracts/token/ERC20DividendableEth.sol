pragma solidity ^0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


/**
 * @title ERC20Dividendable
 * @dev Implements an ERC20 token with a dividend distribution procedure for etehreum received
 * @notice This contract was implemented from algorithms proposed by Nick Johnson here: https://medium.com/@weka/dividend-bearing-tokens-on-ethereum-42d01c710657
 */
contract ERC20DividendableEth is ERC20 {

    using SafeMath for uint;

    uint public pointMultiplier = 10e18;
    uint public totalDividends;
    uint public totalDividendPoints;
    mapping(address => uint) public lastDividendPoints;
    constructor() public {}

    /**
     * @notice Send ether to this function in orther to disburse dividends
     */
    function increasePool() external payable {
        totalDividends = totalDividends.add(msg.value);
        totalDividendPoints = totalDividends
            .mul(pointMultiplier).div(this.totalSupply());
    }

    /**
     * @dev Function to update an account
     * @param account The account to update
     * @notice Will revert if account need not be updated
     */
    function updateAccount(
        address payable account,
        address dividendToken
    ) public {
        uint owing = dividendsOwing(account, dividendToken);
        require(
            owing > 0,
            "Account need not be updated now for this dividend token."
        );
        IERC20(dividendToken).transferFrom(address(this), account, owing);
        lastDividendPoints[account][dividendToken] = totalDividendPoints[
                dividendToken
            ];
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
     */
    function dividendsOwing(
        address account,
        address dividendToken
    ) internal view returns(uint) {
        uint newDividendPoints = totalDividendPoints[dividendToken]
            .sub(lastDividendPoints[account][dividendToken]);
        return this.balanceOf(account)
            .mul(newDividendPoints).div(pointMultiplier);
    }
}