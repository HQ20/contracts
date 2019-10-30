# simple-ethereum-dapp

[![Build Status](https://travis-ci.com/HQ20/simple-ethereum-dapp.svg?branch=master)](https://travis-ci.com/HQ20/simple-ethereum-dapp)
[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=HQ20/simple-ethereum-dapp)](https://dependabot.com)

:herb: This is the techhq simple ethereum dapp in a github template :octocat: All you need in a nut:shell:

This template is based on a truffle project structure, having the **contracts**, **migrations** and **test** folder as usual, as well as the **truffle-config.js** file. Besides that, this template is packed with an example smart contract with an example of a test including coverage. It also contains linters for javascript and solidity, plus a script to run tests.

This template also asumes the developer will use [travis](https://travis-ci.org/), [coveralls](https://coveralls.io/) and [dependabot](https://dependabot.com/).

## Installation

Use the package manager [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com) to install dependencies.

```bash
$ npm install
# or
$ yarn
```

## Usage

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
