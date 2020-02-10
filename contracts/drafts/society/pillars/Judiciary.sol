pragma solidity ^0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../utils/Branch.sol";


/**
 * @title Judiciary
 * @notice Implements the judiciary of a society capable of deciding between guilt and innocence in according to facts and prescribing penalties to be enacted by the society's executive.
 */
contract Judiciary is Branch {

    constructor(
        address _constitution,
        address payable _society
    ) Branch(_constitution, _society) public {}

    // TODO: judiciary functions

}