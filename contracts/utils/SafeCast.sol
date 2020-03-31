pragma solidity ^0.6.0;


/// @dev Implements safe casting between int256 and uint256
/// @author Alberto Cuesta Cañada
library SafeCast {

    /// @dev Maximum value that can be represented in an int256
    function maxInt256() internal pure returns(int256) {
        // solium-disable-next-line max-len
        return 57896044618658097711785492504343953926634992332820282019728792003956564819967;
    }

    /// @dev Safe casting from int256 to uint256
    function toUint(int256 x) internal pure returns(uint256) {
        require(
            x >= 0,
            "Cannot cast negative signed integer to unsigned integer."
        );
        return uint256(x);
    }

    /// @dev Safe casting from uint256 to int256
    function toInt(uint256 x) internal pure returns(int256) {
        require(
            x <= toUint(maxInt256()),
            "Cannot cast overflowing unsigned integer to signed integer."
        );
        return int256(x);
    }
}
