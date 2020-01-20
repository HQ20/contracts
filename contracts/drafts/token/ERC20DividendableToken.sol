pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";


/**
 * @title ERC20DividendableToken
 * @dev Implements an ERC20Mintable token with a dividend distribution procedure for dividendTokens received
 * @notice This contract was implemented from algorithms proposed by Nick Johnson here: https://medium.com/@weka/dividend-bearing-tokens-on-ethereum-42d01c710657
 */
contract ERC20DividendableToken is ERC20 {

    using SafeMath for uint;

    uint pointMultiplier = 10e18;
    mapping(address => uint) public totalDividends;
    mapping(address => uint) public totalDividendPoints;
    mapping(address => mapping(address => uint)) public lastDividendPoints;
    mapping(uint256 => address) public dividendTokens;
    uint256 public tokenIndex;

    constructor() public {}

    /**
     * @notice Send dividendTokens to this function in orther to increase the dividends pool
     * @dev Must have approved this contract to spend amount of dividendToken from msg.sender
     * @param amount The amount of dividendTokens to transfer from msg.sender to this contract
     */
    function increasePool(uint256 amount, address dividendToken) external {
        IERC20 dividendTokenContract = IERC20(dividendToken);
        resolveDividendToken(dividendToken);
        dividendTokenContract.transferFrom(msg.sender, address(this), amount);
        totalDividends[dividendToken] = totalDividends[dividendToken].add(
                amount
            );
        totalDividendPoints[dividendToken] = totalDividends[dividendToken]
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
        IERC20(dividendToken).transfer(account, owing);
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