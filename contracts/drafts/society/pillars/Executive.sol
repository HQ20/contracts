pragma solidity ^0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../utils/Branch.sol";


/**
 * @title Executive
 * @notice Implements the executive of a society capable of enacting prescribed penalties to the society's citizens.
 */
contract Executive is Branch {

    constructor(
        address _constitution,
        address payable _society
    ) Branch(_constitution, _society) public {}

    // TODO: executive functions

}