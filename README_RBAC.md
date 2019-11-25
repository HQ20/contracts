# rbac

This is an Ethereum project that implements runtime configurable access control.

This template is based on a truffle project structure, having the **contracts**, **migrations** and **test** folder as usual, as well as the **truffle-config.js** file. Besides that, this template is packed with an example of a test including coverage. It also contains linters for javascript and solidity, plus a script to run tests.

This template also asumes the developer will use [travis](https://travis-ci.org/), [coveralls](https://coveralls.io/) and [dependabot](https://dependabot.com/).

## Installation

Use the package manager [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com) to install dependencies.

```bash
$ npm install
# or
$ yarn
```

## Usage

In `RBAC.sol`:
* constructor `address _root`: Creates the root role and adds _root as a member.
* function `roleExists(uint256 _roleId)`: Returns `true` if a role with id `_roleId` exists.
* function `totalRoles()`: Returns the number of roles in the contract, including the root role. The role ids are sequentially generated so that the return value of `totalRoles()` is also the highest role id for which `roleExists(...)` will return `true`.
* function `addRole(uint256 _adminRoleId)`: Adds a new role to the contract. Adding or removing bearers to this new role is restricted to members of the role denoted by `_adminRoleId`. `msg.sender` must be a member as well of the role denoted by `adminRoleId`. There is no function to remove roles.
* function `addMember(address _member, uint256 _roleId)`: Adds `_member` as a member to the role denoted by `_roleId`. `msg.sender` must be a member of the admin role for the role denoted by `roleId`.
* function `removeMember(address _member, uint256 _roleId)`: Removes `_member` as a member from the role denoted by `_roleId`. `msg.sender` must be a member of the admin role for the role denoted by `roleId`.
* function `hasRole(address _member, uint256 _roleId)`: Returns `true` if `_member` is a member of the role denoted by `_roleId`, and `false` otherwise. Reverts if a role denoted by `_roleId` doesn't exist.

The package.json file contains a set of npm scripts to help on the development phase. Below is a short description for each
* **"deploy:ganache"** deploy the contracts on development network
* **"start:ganache:dev"** start a ganache instance, always with the same mnemonic, port and networkid
* **"test"** run tests locally
* **"test:ci"** run tests in CI system
* **"coverage"** run coverage locally
* **"coverage:ci"** run coverage in CI system
* **"lint:sol"** lint solidity code according to rules
* **"lint:js"** lint javascript code according to rules
* **"lint"** lint solidity and javascript code
* **"security"** run security validation using mythril
* **"docs"** generates documentation based in your comments in solidity code

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[Apache-2.0](LICENSE)
