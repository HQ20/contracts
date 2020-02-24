pragma solidity ^0.5.10;
import "@openzeppelin/contracts/math/SafeMath.sol";


/// @dev Implements simple fixed point math add, sub, mul and div operations.
library TokenMath {
    using SafeMath for uint256;

    /// @dev Returns the number of decimals in the fixed point representation, currently 18.
    function decimals() internal pure returns (uint8) {
        return 18;
    }

    /// @dev Returns 1 in the fixed point representation, currently 1000000000000000000.
    function fixed1() internal pure returns (uint256) {
        return 1000000000000000000;
    }

    /// @dev Adds x and y, assuming they are both fixed point with 18 decimals.
    function addf(uint256 x, uint256 y) internal pure returns (uint256) {
        return x.add(y);
    }

    /// @dev Substracts y from x, assuming they are both fixed point with 18 decimals.
    function subf(uint256 x, uint256 y) internal pure returns (uint256) {
        return x.sub(y);
    }

    /// @dev Multiplies x and y, assuming they are both fixed point with 18 decimals.
    function mulf(uint256 x, uint256 y) internal pure returns (uint256) {
        return x.mul(y).div(fixed1());
    }

    /// @dev Divides x between y, assuming they are both fixed point with 18 decimals.
    function divf(uint256 x, uint256 y) internal pure returns (uint256) {
        return x.mul(fixed1()).div(y);
    }

    /// @dev Returns x in its integer and fractional parts, assuming it is a fixed point number with 18 decimals.
    function split(uint256 x) internal pure returns (uint256, uint256) {
        return (x - x.mod(fixed1()), x.mod(fixed1()));
    }
}