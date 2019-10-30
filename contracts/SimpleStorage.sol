pragma solidity ^0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";


/**
 * @title Simple Storage
 * @dev A simple way to save a number.
 */
contract SimpleStorage {
    using SafeMath for uint256;

    uint256 private storedData;

    /**
     * constructor method setting an initial value
     */
    constructor() public {
        storedData = 5;
    }

    /**
     * @dev Set the number to be saved.
     * @param x uint256 The number to be saved.
     */
    function set(uint256 x) public {
        storedData = x;
    }

    /**
     * @dev Gets the saved number.
     * @return An uint256 representing the saved number.
     */
    function get() public view returns (uint256) {
        return storedData;
    }
}
