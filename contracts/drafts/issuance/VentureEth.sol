pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../../issuance/IssuanceEth.sol";
import "../../token/ERC20DividendableEth.sol";


/**
 * @title VentureEth
 * @notice Implements a venture
 *
 * 1. Use `setIssuePrice` to determine how many ether (in wei) do investors
 *    have to pay for each issued token.
 * 2. Use `openIssuance` to allow investors to invest.
 * 3. Investors can `invest` their ether at will.
 * 4. Investors can also `cancelInvestment` and get their ether back.
 * 5. The contract owner can `cancelAllInvestments` to close the investment phase.
 *    In this case `invest` is not available, but `cancelInvestment` is.
 * 6. Use `startDistribution` to close the investment phase.
 * 7. Investors can only `withdraw` their issued tokens now.
 * 8. Owner can use `transferFunds` to send collected ether to a wallet.
 * 9. Clients can `increasePool` of ether
 * 10. Investors can be return dividends with `updateAccount`
 */
contract VentureEth is ERC20Mintable, ERC20DividendableEth, IssuanceEth {

    constructor() public ERC20Mintable()
    ERC20DividendableEth() IssuanceEth(address(this)) {
        addMinter(address(this));
    }

}