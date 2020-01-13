# ERC165 implementation

This project shows an example contract as an user of the ERC165 standard for registration of contract interfaces.

## Usage

The example is built on a modified ERC20 contract that restricts transferring of tokens to whitelisted addresses. On construction `ERC20Whitelisted.sol` requires an address for the `WhitelistERC165.sol` deployed contract containing such addresses.

`WhitelistERC165.sol` implements `IWhitelist.sol` and inherits from `ERC165.sol`. On construction registers the `IWhitelist.sol` implementation using `_registerInterface(WhitelistInterfaceId.IWHITELIST_ID);` (method from `ERC165.sol`).

`IWhitelist.sol` is the interface for `WhitelistERC165.sol`, specifying the `isMember(...)`, `addMember(...)` and `removeMember(...)` methods.
 
`WhitelistInterfaceId.sol` keeps the `IWhitelist.sol` ERC165 signature and the method to calculate it. The output of `WhitelistInterfaceId.calc()` and the `WhitelistInterfaceId.IWHITELIST_ID` must match at all times.


Contracts accepting `WhitelistERC165` instances through an address parameter should check for its implementation of `IWhitelist.sol` as follows:

```
import "@openzeppelin/contracts/introspection/ERC165Checker.sol";
import "./../access/IWhitelist.sol";
import "./../access/WhitelistInterfaceId.sol";


contract [name] is WhitelistInterfaceId {
    IWhitelist whitelist;

    constructor (address whitelistAddress) public {
        require(
            ERC165Checker._supportsInterface(whitelistAddress, IWHITELIST_ID),
            "Address is not IWhitelist."
        );
        whitelist = IWhitelist(whitelistAddress);
    }
}
```

`ERC20Whitelisted.sol`  is an Ethereum contract that restricts the recipients of an ERC20 token to a whitelist of addresses.
The ERC165 standard is implemented to ensure that the whitelist passed on to the constructor implements to the IWhitelist.sol interface. For testing purposes, a ERC20WhitelistedMock is included that also allows the contract owner to mint tokens using Ownable.sol.

* constructor `constructor (address)`: The address passed on to the constructor must implement the IWhitelist.sol interface and will contain the addresses that are allowed to receive tokens.

* function `transfer(...)`: Same signature as in ERC20, transfers tokens to a recipient if it is in the whitelist. 
* function `transferFrom(...)`: Same signature as in ERC20, transfers tokens from a sender to a recipient if it is in the whitelist.
* function `_mint(...)`: Same signature as in ERC20, internal method that creates tokens and transfers them to a recipient if it is in the whitelist.

In `../../test/token/ERC20WhitelistedMock.sol`:

* constructor `constructor (address)`: The address passed on to the constructor must implement the IWhitelist.sol interface and will contain the addresses that are allowed to receive tokens. The caller is allowed to mint tokens.

* function `mint(...)`: Same parameters as in `ERC20Whitelisted._mint(...)`, public method that allows the contract owner to create tokens and transfers them to a recipient if it is in the whitelist.
