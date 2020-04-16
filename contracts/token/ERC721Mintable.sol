pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../access/Administered.sol";


/**
 * @dev Extension of {ERC721} that gives the owner permission to mint (create) new tokens as he sees fit.
 */
contract ERC721Mintable is ERC721, Administered {
    constructor(string memory name, string memory symbol, uint8 decimals)
        public ERC721(name, symbol) Administered(msg.sender)
    {}

    function mint(address account, uint256 amount)
        public virtual onlyAdmin returns (bool)
    {
        _mint(account, amount);
        return true;
    }
}
