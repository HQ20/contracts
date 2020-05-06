pragma solidity ^0.6.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "./../../../introspection/erc165/ERC20Whitelisted.sol";


contract ERC20WhitelistedMock is ERC20Whitelisted, Ownable {

    constructor (
        string memory name,
        string memory symbol,
        address whitelistAddress
    )
        public ERC20Whitelisted(name, symbol, whitelistAddress) Ownable()
    {

    }

    function mint(address account, uint256 amount)
        public onlyOwner
    {
        return super._mint(account, amount);
    }
}
