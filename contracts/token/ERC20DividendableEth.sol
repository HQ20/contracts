pragma solidity ^0.6.0;

import "./ERC20MintableDetailed.sol";
import "../math/DecimalMath.sol";
import "../utils/SafeCast.sol";

/**
 * @title ERC20DividendableEth
 * @dev Implements an ERC20MintableDetailed token with a dividend distribution procedure for etehreum received
 * @notice This contract was implemented from algorithms proposed by Nick Johnson here: https://medium.com/@weka/dividend-bearing-tokens-on-ethereum-42d01c710657
 */
contract ERC20DividendableEth is ERC20MintableDetailed {
    using DecimalMath for int256;
    using DecimalMath for uint256;
    using SafeCast for int256;
    using SafeCast for uint256;

    int256 public dividendsPerToken;
    mapping(address => int256) private claimedDPT;

    constructor(string memory name, string memory symbol, uint8 decimals)
        ERC20MintableDetailed(name, symbol, decimals) public
    {}

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
        claimedDPT[address(0)] = dividendsPerToken; // Hack to mint tokens at DPT
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
        if (this.balanceOf(to) == 0){
            // If transferring, initializes to the dpt of the sender
            // If minting, initializes to contract dpt
            claimedDPT[to] = claimedDPT[from];
        }
        else{
            int256 weight = amount.divd(this.balanceOf(to).addd(amount)).toInt();
            int256 differentialDPT = claimedDPT[from].subd(claimedDPT[to]);
            int256 weightedDPT = differentialDPT.muld(weight);
            claimedDPT[to] = claimedDPT[to].addd(weightedDPT);
        }
    }
}

/*
b1 100
dpt1 1
dpt2 2

c1 = 100 * (2 - 1)

t 100
dptt 2

w = 100/200 = 0.5
ddpt = 2 - 1 = 1
wd = 1 * 0.5 = 0.5
dpt1 = 1 + 0.5

c1 = 200 * (1 - 1.5) = 200 * 0.5 = 100 

-------------------

b1 100
dpt1 2
dpt2 1

c1 = 100 * (2 - 2)

t 100
dptt 1

w = 100/200 = 0.5
ddpt = 1 - 2 = -1
wd = -1 * 0.5 = -0.5
dpt1 = 2 - 0.5 = 1.5

c1 = 200 * (2 - 1.5) = 200 * 0.5 = 100
*/

/*
b1 100
dpt1 1
dpt2 2

c1 = 100 * (2 - 1)

t 300
dptt 2

w = 300/400 = 0.75
ddpt = 2 - 1 = 1
wd = 1 * 0.75 = 0.75
dpt1 = 1 + 0.75

c1 = 400 * (1 - 1.75) = 400 * 0.25 = 100 

-------------------

b1 100
dpt1 2
dpt2 1

c1 = 100 * (2 - 2)

t 300
dptt 1

w = 300/400 = 0.75
ddpt = 1 - 2 = -1
wd = -1 * 0.75 = -0.75
dpt1 = 2 - 0.75 = 1.25

c1 = 400 * (2 - 1.25) = 400 * 0.75 = 300
*/