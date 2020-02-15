pragma solidity ^0.5.0;

import "@hq20/fixidity/contracts/FixidityLib.sol";


/**
 * @title SafeCast
 * @notice This library provides safe casting services. Currently supported:
 * - int256 to uint256
 * - uint256 to int256
 */
library SafeCast {

    /**
     * @notice Safe casting from int256 to uint256
     * @param x int256 to cast
     * @return casted uint256
     */
    function safeIntToUint(int256 x) internal pure returns(uint256) {
        require(
            x >= 0,
            "Cannot cast negative signed integer to unsigned integer."
        );
        return uint256(x);
    }

    /**
     * @notice Safe casting from uint256 to int256
     * @param x uint256 to cast
     * @return casted int256
     */
    function safeUintToInt(uint256 x) internal pure returns(int256) {
        require(
            x <= safeIntToUint(FixidityLib.maxInt256()),
            "Cannot cast overflowing unsigned integer to signed integer."
        );
        return int256(x);
    }
}
