pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "../../token/ERC20DividendableEth.sol";


contract TestERC20DividendableEth is ERC20DividendableEth, ERC20Burnable
{
    constructor(string memory name, string memory symbol, uint8 decimals)
        ERC20DividendableEth(name, symbol, decimals)
        ERC20Burnable()
        public
    {}

    function testReleaseDividends(uint256 amount) public virtual {
        _releaseDividends(amount);
    }

    /// @dev There is some bug. If you override a function you seem to need to override it in all derived contracts.
    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal override(ERC20, ERC20DividendableEth)
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}