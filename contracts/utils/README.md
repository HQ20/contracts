# Utils

This is an Ethereum project that provides useful tools for a hassle-free developing of smart contracts.

## SafeCast

### Description

This library comes with functions equipped with a safety net when casting between Solidity types.

### Usage

The library supports casting between:

1. `uint256` <-> `int256`: 
    - `safeUintToInt(uint256 x) internal pure returns(int256)` will revert if x > `MAX_INT_256`.
    - `safeIntToUint(int256 x) internal pure returns(uint256)` will revert if x < 0.


