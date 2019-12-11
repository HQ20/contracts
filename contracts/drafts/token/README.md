# ERC20Whitelisted

This is an Ethereum project that restricts the recipients of an ERC20 token to a whitelist of addresses.

The ERC165 standard is implemented to ensure that the whitelist passed on to the constructor implements to the IWhitelist.sol interface.

For testing purposes, a ERC20WhitelistedMock is included that also allows the contract owner to mint tokens using Ownable.sol.

## Usage

In `ERC20Whitelisted.sol`:

* constructor `constructor (address)`: The address passed on to the constructor must implement the IWhitelist.sol interface and will contain the addresses that are allowed to receive tokens.

* function `transfer(...)`: Same signature as in ERC20, transfers tokens to a recipient if it is in the whitelist. 
* function `transferFrom(...)`: Same signature as in ERC20, transfers tokens from a sender to a recipient if it is in the whitelist.
* function `_mint(...)`: Same signature as in ERC20, internal method that creates tokens and transfers them to a recipient if it is in the whitelist.

In `../../test/token/ERC20WhitelistedMock.sol`:

* constructor `constructor (address)`: The address passed on to the constructor must implement the IWhitelist.sol interface and will contain the addresses that are allowed to receive tokens. The caller is allowed to mint tokens.

* function `mint(...)`: Same parameters as in `ERC20Whitelisted._mint(...)`, public method that allows the contract owner to create tokens and transfers them to a recipient if it is in the whitelist.