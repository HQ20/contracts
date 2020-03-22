pragma solidity ^0.6.0;

import "./ERC20Mintable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";


/**
 * @dev Contract of the additional functions added by `ERC20Mintable` and `ERC20Detailed` to `ERC20`.
 */
contract ERC20MintableDetailed is ERC20Mintable, ERC20Detailed {

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) public ERC20Mintable() ERC20Detailed(name, symbol, decimals) {}

}
