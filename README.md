<div align="center">
    <img width="300" alt="Icons made by Eucalyp from www.flaticon.com" src="rocking.svg">
    <h1>HQ20 contracts</h1>
    <div>
        <a
            href="https://app.netlify.com/sites/hq20-contracts/deploys"><img
                src="https://api.netlify.com/api/v1/badges/13cb75c8-7d47-4cb9-808d-1657b46091c4/deploy-status" /></a>&emsp;
        <a
            href="https://travis-ci.com/HQ20/contracts"><img
                src="https://travis-ci.com/HQ20/contracts.svg?branch=dev" /></a>&emsp;
        <a
            href="https://coveralls.io/github/HQ20/contracts?branch=dev"><img
                src="https://coveralls.io/repos/github/HQ20/contracts/badge.svg?branch=dev" /></a>&emsp;
        <a
            href="https://dependabot.com"><img
                src="https://api.dependabot.com/badges/status?host=github&repo=HQ20/contracts" /></a>&emsp;
    </div>
</div>

> HQ20/contracts is a Solidity project with contracts, libraries and examples to help you build fully-featured distributed applications for the real world.

## Installation

Use the package manager [yarn](https://yarnpkg.com) to install dependencies.

```bash
$ yarn add @hq20/contracts
```

## Usage

```solidity
pragma solidity ^0.5.10;
import "@hq20/contracts/contracts/access/RBAC.sol"


contract MyContract is RBAC {
	constructor() public RBAC(msg.sender) {
		// do something
	}
}
```

## Directories

Contracts go in `contracts`, test files go in `test`.

Inside the contracts folder the files are organized by topic and by type.

Current topics are access, lists, state, strings and token. This list might not be exhaustive.

At the root of `contracts` are directories for each one of the topics, containing the simplest implementations that are in a mature state.

For contracts that are used as example implementations there is a `contracts/examples` directory with the appropriate topic folders inside.

For contracts that are more complex and complete implementations of the base topics there is a `contracts/advanced` directory with the appropriate topic folders inside.

For contracts that are under development there is a `contracts/drafts` directory with the appropriate topic folders inside.

For contracts that are used for testing of libraries or internal methods there is a `contracts/tests` directory with the appropriate topic folders inside.

The `test` directory replicates the structure of the `contracts` directory.

At the time of writing and as an example, this is the directory structure.

```
contracts ──┬─── examples ────── access
            │
            ├─── advanced ────── access
            │
            ├─── test     ──┬─── issuance
            │               └─── token
            │
            ├─── drafts   ──┬─── access
            │               ├─── issuance
            │               ├─── strings
            │               └─── token
            │
            ├─── access
            ├─── lists
            └─── state
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

As well as bug fixes , we will welcome updates to the basic contracts that make them even easier to understand, examples of contracts implementing a particular feature, or advanced contracts that put together a number of features into a complete use case.

Please make sure to update tests as appropriate.

## License
[Apache-2.0](LICENSE)
