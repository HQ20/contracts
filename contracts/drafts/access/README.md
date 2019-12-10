# Whitelist

This is an Ethereum project that implements a simple whitelist of addresses for access control.

## Usage

In `Whitelist.sol`:

* constructor `Ownable()`: The address deploying Whitelist.sol will be the only one that can add and remove members.

* function `isMember(address _member)`: Returns `true` if `_member` is a member of the whitelist, and `false` otherwise.
* function `addMember(address _member)`: Adds `_member` to the whitelist.
* function `removeMember(address _member)`: Removes `_member` from the whitelist.

## Whitelist.sol vs. OpenZeppelin's Roles.sol and WhitelistedRole.sol

Please have a look at the `access` and `ownership` contracts from OpenZeppelin since they deal with the same features in a slightly different way. Their code is of the highest quality and we use it ourselves when we can.

OpenZeppelin's `Roles.sol` is a library that has the purpose of screening who can call specific functions in the contracts that use it. It is widely used in other OpenZeppelin contracts (like `ERC20Mintable`) and as such it is a good fit for certain use cases.

`Whitelist.sol` aims to implement simple access control with three differences:
 - It is an standalone contract. While you can inherit from it to have a whitelist of addresses as part of your contract, its purpose is to function as a separate contract that can be called from any other contract that needs to use the same whitelist.
 - Managing the whitelist is reserved to the contract owner.
 - It is as simple and clear as we could make it. The purpose is for you to understand perfectly what the contract does, so that you can extend it or modify it to fit your requirements. 