pragma solidity ^0.5.10;
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "./../../drafts/token/ERC20Whitelisted.sol";


contract ERC20WhitelistedMock is ERC20Whitelisted, Ownable {
    IWhitelist whitelist;

    constructor (address whitelistAddress)
        public
        ERC20Whitelisted(whitelistAddress)
        Ownable()
    {

    }

    function mint(address account, uint256 amount)
        public
        onlyOwner
    {
        return super._mint(account, amount);
    }
}
