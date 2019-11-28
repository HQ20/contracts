# Role Based Access Control

This is an Ethereum project that implements runtime configurable access control.

## Usage

In `RBAC.sol`:
* constructor `address _root`: Creates the root role and adds _root as a member.
* function `roleExists(uint256 _roleId)`: Returns `true` if a role with id `_roleId` exists.
* function `totalRoles()`: Returns the number of roles in the contract, including the root role. The role ids are sequentially generated so that the return value of `totalRoles()` is also the highest role id for which `roleExists(...)` will return `true`.
* function `addRole(uint256 _adminRoleId)`: Adds a new role to the contract. Adding or removing bearers to this new role is restricted to members of the role denoted by `_adminRoleId`. `msg.sender` must be a member as well of the role denoted by `adminRoleId`. There is no function to remove roles.
* function `addMember(address _member, uint256 _roleId)`: Adds `_member` as a member to the role denoted by `_roleId`. `msg.sender` must be a member of the admin role for the role denoted by `roleId`.
* function `removeMember(address _member, uint256 _roleId)`: Removes `_member` as a member from the role denoted by `_roleId`. `msg.sender` must be a member of the admin role for the role denoted by `roleId`.
* function `hasRole(address _member, uint256 _roleId)`: Returns `true` if `_member` is a member of the role denoted by `_roleId`, and `false` otherwise. Reverts if a role denoted by `_roleId` doesn't exist.