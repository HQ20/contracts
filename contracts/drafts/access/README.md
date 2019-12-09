# Whitelist

This is an Ethereum project that implements a simple whitelist of addresses for access control.

## Usage

In `Whitelist.sol`:

* constructor `Ownable()`: The address deploying Whitelist.sol will be the only one that can add and remove members.

* function `isMember(address _member)`: Returns `true` if `_member` is a member of the whitelist, and `false` otherwise.
* function `addMember(address _member)`: Adds `_member` to the whitelist.
* function `removeMember(address _member)`: Removes `_member` from the whitelist.