pragma solidity ^0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "../utils/Branch.sol";


/**
 * @title Legislative
 * @notice Implements the legislative of a society capable of deciding to enact or not a proposal to become law for the society's judiciary.
 */
contract Legislative is Branch {

    constructor(
        address _constitution,
        address payable _society
    ) Branch(_constitution, _society) public {}

    // TODO: legislative functions

}
