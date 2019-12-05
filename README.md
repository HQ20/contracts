# techhq-contracts
[![Netlify Status](https://api.netlify.com/api/v1/badges/13cb75c8-7d47-4cb9-808d-1657b46091c4/deploy-status)](https://app.netlify.com/sites/hq20-contracts/deploys)&emsp;[![Travis Status](https://travis-ci.com/HQ20/contracts.svg?branch=dev)](https://travis-ci.com/HQ20/contracts)&emsp;[![Coverage Status](https://coveralls.io/repos/github/HQ20/contracts/badge.svg?branch=dev)](https://coveralls.io/github/HQ20/contracts?branch=dev)&emsp;[![Dependabot Status](https://api.dependabot.com/badges/status?host=github&repo=HQ20/contracts)](https://dependabot.com)


This is an Ethereum project with contracts and libraries to help you build fully featured dapps.

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
