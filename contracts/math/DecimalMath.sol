pragma solidity ^0.5.10;
import "@openzeppelin/contracts/math/SafeMath.sol";


/// @dev Implements simple fixed point math add, sub, mul and div operations.
/// @author Alberto Cuesta Cañada
library DecimalMath {
    using SafeMath for uint256;

    /// @dev Returns the number of decimals in the fixed point representation, currently 18.
    function decimals() internal pure returns (uint8) {
        return 18;
    }

    /// @dev Returns 1 in the fixed point representation, currently 1000000000000000000.
    function decimal1() internal pure returns (uint256) {
        return 1000000000000000000;
    }

    /// @dev Adds x and y, assuming they are both fixed point with 18 decimals.
    function addd(uint256 x, uint256 y) internal pure returns (uint256) {
        return x.add(y);
    }

    /// @dev Substracts y from x, assuming they are both fixed point with 18 decimals.
    function subd(uint256 x, uint256 y) internal pure returns (uint256) {
        return x.sub(y);
    }

    /// @dev Multiplies x and y, assuming they are both fixed point with 18 decimals.
    function muld(uint256 x, uint256 y) internal pure returns (uint256) {
        return x.mul(y).div(decimal1());
    }

    /// @dev Divides x between y, assuming they are both fixed point with 18 decimals.
    function divd(uint256 x, uint256 y) internal pure returns (uint256) {
        return x.mul(decimal1()).div(y);
    }
}