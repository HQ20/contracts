pragma solidity ^0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "./Branch.sol";
import "./Society.sol";
import "./Executive.sol";
import "./Bill.sol";


/**
 * @title Legislative
 * @notice Implements the legislative of a society capable of deciding to enact or not a proposal to become law for the society's judiciary.
 */
contract Legislative is Branch {

    constructor(
        address _consitution,
        address _society
    ) Branch(_constitution, _society) public {}

    // TODO: legislative functions

}
