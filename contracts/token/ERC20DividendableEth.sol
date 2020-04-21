pragma solidity ^0.6.0;

import "./ERC20Mintable.sol";
import "../math/DecimalMath.sol";
import "../utils/SafeCast.sol";


/**
 * @title ERC20DividendableEth
 * @dev Implements an ERC20Mintable token with a dividend distribution procedure for etehreum received
 * @notice This contract was implemented from algorithms proposed by Nick Johnson here: https://medium.com/@weka/dividend-bearing-tokens-on-ethereum-42d01c710657
 */
contract ERC20DividendableEth is ERC20Mintable {
    using DecimalMath for int256;
    using DecimalMath for uint256;
    using SafeCast for int256;
    using SafeCast for uint256;

    int256 public dividendsPerToken;
    mapping(address => int256) private claimedDPT;

    constructor(string memory name, string memory symbol, uint8 decimals)
        ERC20Mintable(name, symbol, decimals) public
    {}

    /// @dev Receive function
    receive() external virtual payable {}

    /// @dev Send ether to this function in order to release dividends
    function releaseDividends()
        external virtual payable
    {
        _releaseDividends(msg.value);
    }

    /// @dev Function to update the account of the sender
    /// @notice Will revert if account need not be updated
    function claimDividends()
        public virtual returns(uint256)
    {
        return _claimDividends(msg.sender);
    }

    /// @dev Release an `amount` of ether in the contract as dividends.
    function _releaseDividends(uint256 amount)
        internal
    {
        require(address(this).balance >= amount, "Not enough funds.");
        int256 releasedDPT = amount.divd(this.totalSupply()).toInt();
        dividendsPerToken = dividendsPerToken.addd(releasedDPT);
        claimedDPT[address(0)] = dividendsPerToken; // Mint tokens at DPT
    }

    /// @dev Transfer owed dividends to its account.
    function _claimDividends(address payable account)
        internal returns(uint256)
    {
        uint256 owing = _dividendsOwing(account);
        require(owing > 0, "Account need not be updated now.");
        account.transfer(owing);
        claimedDPT[account] = dividendsPerToken;
        return owing;
    }

    /// @dev Internal function to compute dividends owing to an account
    /// @param account The account for which to compute the dividends
    function _dividendsOwing(address account)
        internal view returns(uint256)
    {
        int256 owedDPT = dividendsPerToken.subd(claimedDPT[account]);
        return owedDPT.toUint().muld(this.balanceOf(account));
    }

    /// @dev Add to the adjustment DPT the weighted average between the recipient's balance DPT, and the transfer tokens DPT
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal virtual override
    {
        // If burning, do nothing
        if (to == address(0)) return;

        // If transferring to an empty account, reset its claimed DTP
        if (this.balanceOf(to) == 0) delete claimedDPT[to];

        int256 weight = amount.divd(this.balanceOf(to).addd(amount)).toInt();
        int256 differentialDPT = claimedDPT[from].subd(claimedDPT[to]);
        int256 weightedDPT = differentialDPT.muld(weight);
        claimedDPT[to] = claimedDPT[to].addd(weightedDPT);
    }
}