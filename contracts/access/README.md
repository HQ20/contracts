# Access Control

This is an Ethereum project that implements different access control structures on top of OpenZeppelin's AccessControl.sol.


# Community

This is an Ethereum project extending `AccessControl.sol` that implements a single-group access control system.

## Usage

In `Community.sol`:

* constructor `(address root)`: The address deploying Community.sol will be the first member. Only members can execute transactional methods.

* function `isMember(address account)`: Returns `true` if `account` is an member, and `false` otherwise.
* function `addMember(address account)`: Adds `account` as a member.
* function `leaveCommunity()`: Removes the caller as a member.


# Administered

This is an Ethereum project extending `AccessControl.sol` that implements a simple two-tier access control system.

## Usage

In `Administered.sol`:

* constructor `(address root)`: The address deploying Administered.sol will be the first admin. Only admins can execute transactional methods.

* function `isUser(address account)`: Returns `true` if `account` is an user, and `false` otherwise.
* function `isAdmin(address account)`: Returns `true` if `account` is an admin, and `false` otherwise.
* function `addUser(address account)`: Adds `account` as an user.
* function `removeUser(address account)`: Removes `account` as an user.
* function `addAdmin(address account)`: Adds `account` as an admin.
* function `renounceAdmin()`: Removes the caller as an admin.


# Hierarchy

This is an Ethereum project extending `AccessControl.sol` that implements a hierarchy access control system.

## Usage

In `Hierarchy.sol`:

* constructor `(address root)`: The address deploying Hierarchy.sol will be the first member of the root role. Only admins of a role can execute transactional methods related to it.

* function `isMember(address account, bytes32 roleId)`: Returns `true` if `account` belongs to the admin role of `roleId`.
* function `addRole(bytes32 roleId, bytes32 adminRoleId)`: Adds `roleId` with `adminRoleId` as the admin role.
