pragma solidity ^0.5.10;

import "../../examples/dao/VentureEth.sol";


/**
 * @title Bank
 * @notice Implements the bank of a society's citizens
 */
contract Bank is VentureEth {

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals
    ) VentureEth(
        name,
        symbol,
        decimals
    ) public { }
}