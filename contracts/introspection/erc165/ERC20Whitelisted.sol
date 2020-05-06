pragma solidity ^0.6.0;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/introspection/ERC165Checker.sol";
import "./IWhitelist.sol";
import "./WhitelistInterfaceId.sol";


contract ERC20Whitelisted is ERC20, WhitelistInterfaceId {
    IWhitelist whitelist;

    constructor (
        string memory name,
        string memory symbol,
        address whitelistAddress
    )
        public ERC20(name, symbol)
    {
        require(
            ERC165Checker.supportsInterface(whitelistAddress, IWHITELIST_ID),
            "Address is not IWhitelist."
        );
        whitelist = IWhitelist(whitelistAddress);
    }

    function transfer(address recipient, uint256 amount)
        public virtual override returns(bool)
    {
        require(
            whitelist.isMember(recipient),
            "Recipient not in whitelist."
        );
        super.transfer(recipient, amount);
    }

    function transferFrom(address sender, address recipient, uint256 amount)
        public virtual override returns(bool)
    {
        require(
            whitelist.isMember(recipient),
            "Recipient not in whitelist."
        );
        return super.transferFrom(sender, recipient, amount);
    }

    function _mint(address account, uint256 amount)
        internal override
    {
        require(
            whitelist.isMember(account),
            "Recipient not in whitelist."
        );
        return super._mint(account, amount);
    }
}
