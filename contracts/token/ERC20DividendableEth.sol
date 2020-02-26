pragma solidity ^0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "./ERC20MintableDetailed.sol";
import "../math/DecimalMath.sol";


/**
 * @title ERC20DividendableEth
 * @dev Implements an ERC20MintableDetailed token with a dividend distribution procedure for etehreum received
 * @notice This contract was implemented from algorithms proposed by Nick Johnson here: https://medium.com/@weka/dividend-bearing-tokens-on-ethereum-42d01c710657
 */
contract ERC20DividendableEth is ERC20MintableDetailed {

    using SafeMath for uint256;
    using DecimalMath for uint256;

    uint256 public dividendsPerToken; // This is a decimal number
    mapping(address => uint256) public lastDPT; // These are decimal numbers

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) ERC20MintableDetailed(name, symbol, decimals) public {}

    /**
     * @notice Send ether to this function in orther to disburse dividends
     */
    function releaseDividends() external payable {
        _releaseDividends(msg.value);
    }

    /**
     * @dev Function to update the account of the sender
     * @notice Will revert if account need not be updated
     */
    function claimDividends() public returns(uint256) {
        return _claimDividends(msg.sender);
    }

    /**
     * @dev Release an `amount` of ether in the contract as dividends.
     */
    function _releaseDividends(uint256 amount) internal {
        require(address(this).balance >= amount, "Not enough funds.");
        // Wei amounts are already decimals.
        uint256 releasedDPT = amount.divd(this.totalSupply());
        dividendsPerToken = dividendsPerToken.addd(releasedDPT);
    }

    /**
     * @dev Transfer owed dividends to its account.
     */
    function _claimDividends(address payable account)
        internal
        returns(uint256)
    {
        uint256 owing = _dividendsOwing(account);
        require(owing > 0, "Account need not be updated now.");
        account.transfer(owing);
        lastDPT[account] = dividendsPerToken;
        return owing;
    }

    /**
     * @dev Internal function to compute dividends owing to an account
     * @param account The account for which to compute the dividends
     */
    function _dividendsOwing(address account) internal view returns(uint256) {
        uint256 owedDPT = dividendsPerToken.subd(lastDPT[account]);
        return this.balanceOf(account).muld(owedDPT);
    }

}