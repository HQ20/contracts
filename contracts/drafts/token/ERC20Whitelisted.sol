pragma solidity ^0.5.10;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/introspection/ERC165Checker.sol";
import "./../access/IWhitelist.sol";
import "./../access/IWhitelistId.sol";


contract ERC20Whitelisted is ERC20, IWhitelistId {
    IWhitelist whitelist;

    constructor (address whitelistAddress) public {
        require(
            ERC165Checker._supportsInterface(whitelistAddress, IWHITELIST_ID),
            "Address is not IWhitelist."
        );
        whitelist = IWhitelist(whitelistAddress);
    }

    function transfer(address recipient, uint256 amount)
        public
        returns (bool)
    {
        require(
            whitelist.isMember(recipient),
            "Recipient not in whitelist."
        );
        super.transfer(recipient, amount);
    }
}
