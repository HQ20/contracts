pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../issuance/IssuanceEth.sol";
import "../token/ERC20DividendableEth.sol";
import "../token/ERC20Mintable.sol";


/**
 * @title VentureEth
 * @notice Implements a venture
 *
 * 1. Use `setIssuePrice` to determine how many ether do investors
 *    have to pay for each issued token.
 * 2. Use `startIssuance` to allow investors to invest.
 * 3. Investors can `invest` their ether at will.
 * 4. Investors can also `cancelInvestment` and get their ether back.
 * 5. The contract owner can `cancelAllInvestments` to close the investment phase.
 *    In this case `invest` is not available, but `cancelInvestment` is.
 * 6. Use `startDistribution` to close the investment phase.
 * 7. Investors can only `claim` their issued tokens now.
 * 8. Owner can use `withdraw` to send collected ether to a wallet.
 * 9. Clients can `increasePool` of ether
 * 10. Investors can be returned dividends with `updateAccount`
 */
contract VentureEth is
ERC20DividendableEth,
IssuanceEth {

    constructor(string memory name, string memory symbol, uint8 decimals)
    public
    ERC20DividendableEth(name, symbol, decimals)
    IssuanceEth(address(this))
    {
        addAdmin(address(this));
    }

}