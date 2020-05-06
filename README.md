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

**Disclaimer:** The contracts are expected to be used as smart contract patterns for you to draw inspiration from, and for them to be easy to understand they have been kept deliberately simple. If you decide to reuse the contracts, or to copy and paste code in them, make sure that you look for and close the vulnerabilities. If you plan to go to the mainnet, please get a third party audit done.

## In a Nutshell

At the time of this writing (`May 2020`), this are the contents of this repository:

```
contracts ──┬─── access        - Access Control Contracts, some of them built on top of `AccessControl.sol`
            ├─── classifieds   - Example of a decentralized classifieds market for ERC721
            ├─── dao           - Example of building a decentralized venture capital fund
            ├─── energy        - Example of building a decentralized market for energy distribution
            ├─── exchange      - The Uniswap decentralized market contracts, with solidity tests
            ├─── introspection - Example of using ERC165 to verify contract types before casting
            ├─── issuance      - Example of an ICO, can be used as well for share issuances
            ├─── lists         - Reusable implementations of different types of linked lists
            ├─── math          - Reusable implementation of a lightweight fixed point math library
            ├─── state         - Reusable implementation of a fully-featured state machine
            ├─── token         - Token implementations, including a reusable dividend-bearing ERC20
            ├─── utils         - Reusable library to cast between `uint` and `int`.
            └─── voting        - Example implementations of token-based and address-based votings
```

## Installation

Use the package manager [yarn](https://yarnpkg.com) to install dependencies.

```bash
$ yarn add @hq20/contracts
```

## Usage

```solidity
pragma solidity ^0.6.0;
import "@hq20/contracts/contracts/access/Roles.sol"


contract MyContract is Roles {
	constructor() public Roles(msg.sender) {
		// do something
	}
}
```

## Directories

Contracts go in `contracts`, test files go in `test`.

Inside the contracts folder the files are organized by topic and by type.

At the root of `contracts` are directories for each one of the topics, containing the simplest implementations that are in a mature state.

For contracts that are under development there is a `contracts/drafts` directory with the appropriate topic folders inside.

For contracts that are used for testing of libraries or internal methods there is a `contracts/test` directory with the appropriate topic folders inside.

The `test` directory replicates the structure of the `contracts` directory.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

As well as bug fixes, we will welcome updates to the basic contracts that make them even easier to understand, examples of contracts implementing a particular feature, or advanced contracts that put together a number of features into a complete use case.

Please make sure to update tests as appropriate.

## License
[Apache-2.0](LICENSE)
