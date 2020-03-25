pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "../../../drafts/token/ERC20MultiDividendable.sol";


contract TestERC20MultiDividendable is ERC20MultiDividendable, ERC20Burnable {

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) ERC20MultiDividendable(name, symbol, decimals) ERC20Burnable() public {}

}