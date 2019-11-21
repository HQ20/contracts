# string-to-bytes32-to-string

This is an Ethereum project with helper functions that help you convert between string and bytes32 types.

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

In `StringConversion.sol`:
* function `bytes32ToString(bytes32 _data)`: Converts and returns bytes32 `_data` as a string.
* function `stringToBytes32(string memory _data)`: Converts and returns the string `_data` as bytes32.

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
