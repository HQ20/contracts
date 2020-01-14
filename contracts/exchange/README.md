# Uniswap Exchange
This is an Ethereum project that implements a decentralized exchange in the manner of the uniswap protocol.

## Description
www.uniswap.io

## Implementation
For simplicity this smart contract assumes that only ERC20 tokens that follow the OpenZeppelin implementation (i.e. reverting on failed transfers) will be used. If this code would be used by ERC20 tokens that return false on failed transactions we recommend modifying the exchange to wrap all tokens in SafeERC20 libraries.

## Usage
