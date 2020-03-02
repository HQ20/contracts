pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "../../token/ERC20DividendableEth.sol";


contract TestERC20DividendableEth is ERC20DividendableEth, ERC20Burnable
{
    constructor(string memory name, string memory symbol, uint8 decimals)
        ERC20DividendableEth(name, symbol, decimals)
        ERC20Burnable()
        public
    {}

    function testReleaseDividends(uint256 amount) public {
        _releaseDividends(amount);
    }
}