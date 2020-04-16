pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../access/Administered.sol";


/**
 * @dev Extension of {ERC20} that gives the owner permission to mint (create) new tokens as he sees fit.
 */
contract ERC20Mintable is ERC20, Administered {
    constructor(string memory name, string memory symbol, uint8 decimals)
        public ERC20(name, symbol, decimals) Administered(msg.sender)
    {}

    function mint(address account, uint256 amount)
        public
        virtual
        onlyAdmin
        returns (bool)
    {
        _mint(account, amount);
        return true;
    }
}
