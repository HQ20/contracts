# Role Based Access Control

This is an Ethereum project that implements runtime configurable access control. It is expected to be used as a data layer for you to code your own permissioning rules on top. For this reason all transactional methods are internal.

## Usage

In `RBAC.sol`:
* function `roleExists(bytes32 roleId)`: Returns `true` if a role with id `roleId` exists.
* function `hasRole(address account, bytes32 roleId)`: Returns `true` if `account` is a member of the role denoted by `roleId`, and `false` otherwise. Reverts if a role denoted by `roleId` doesn't exist.
* function `enumerateMembers(bytes32 roleId)`: Returns all members from the role denoted by `roleId`.
* function `_addRole(bytes32 roleId)`: Adds a new role with id `roleId` to the contract. There is no function to remove roles.
* function `_addMember(address account, bytes32 roleId)`: Adds `account` as a member to the role denoted by `roleId`. 
* function `_removeMember(address account, bytes32 roleId)`: Removes `account` as a member from the role denoted by `roleId`.


# TwoTiered

This is an Ethereum project extending `RBAC.sol` that implements a simple two-tier access control system.

## Usage

In `TwoTiered.sol`:

* constructor `(address root)`: The address deploying TwoTiered.sol will be the first admin. Only admins can execute transactional methods.

* function `isUser(address account)`: Returns `true` if `account` is an user, and `false` otherwise.
* function `isAdmin(address account)`: Returns `true` if `account` is an admin, and `false` otherwise.
* function `addUser(address account)`: Adds `account` as an user.
* function `removeUser(address account)`: Removes `account` as an user.
* function `addAdmin(address account)`: Adds `account` as an admin.
* function `removeAdmin(address account)`: Removes `account` as an admin.

# Renounceable

This is an Ethereum project extending `RBAC.sol` that allows members to renounce from their roles.

## Usage

In `Renounceable.sol`:
* function `renounceMembership(bytes32 roleId)`: Removes the member from the role denoted by `roleId`.

# Transferrable

This is an Ethereum project extending `RBAC.sol` that allows members to renounce from their roles in favour of others.

## Usage

In `Transferrable.sol`:
* function `transferMembership(address to, bytes32 roleId)`: Transfers the role denoted by `roleId` to account `to`. 
 
