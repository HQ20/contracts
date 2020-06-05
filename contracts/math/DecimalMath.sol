pragma solidity ^0.6.0;
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/math/SignedSafeMath.sol";


/// @dev Implements simple fixed point math add, sub, mul and div operations.
/// @author Alberto Cuesta Cañada
library DecimalMath {
    using SafeMath for uint256;
    using SignedSafeMath for int256;

    /// @dev Returns 1 in the fixed point representation, with `decimals` decimals.
    function unit(uint8 decimals) internal pure returns (uint256) {
        require(decimals <= 77, "Too many decimals");
        return 10**uint256(decimals);
    }

    /// @dev Adds x and y, assuming they are both fixed point with 18 decimals.
    function addd(uint256 x, uint256 y) internal pure returns (uint256) {
        return x.add(y);
    }

    /// @dev Adds x and y, assuming they are both fixed point with 18 decimals.
    function addd(int256 x, int256 y) internal pure returns (int256) {
        return x.add(y);
    }

    /// @dev Substracts y from x, assuming they are both fixed point with 18 decimals.
    function subd(uint256 x, uint256 y) internal pure returns (uint256) {
        return x.sub(y);
    }

    /// @dev Substracts y from x, assuming they are both fixed point with 18 decimals.
    function subd(int256 x, int256 y) internal pure returns (int256) {
        return x.sub(y);
    }

    /// @dev Multiplies x and y, assuming they are both fixed point with 18 digits.
    function muld(uint256 x, uint256 y) internal pure returns (uint256) {
        return muld(x, y, 18);
    }

    /// @dev Multiplies x and y, assuming they are both fixed point with 18 digits.
    function muld(int256 x, int256 y) internal pure returns (int256) {
        return muld(x, y, 18);
    }

    /// @dev Multiplies x and y, assuming they are both fixed point with `decimals` digits.
    function muld(uint256 x, uint256 y, uint8 decimals)
        internal pure returns (uint256)
    {
        return x.mul(y).div(unit(decimals));
    }

    /// @dev Multiplies x and y, assuming they are both fixed point with `decimals` digits.
    function muld(int256 x, int256 y, uint8 decimals)
        internal pure returns (int256)
    {
        return x.mul(y).div(int256(unit(decimals)));
    }

    /// @dev Divides x between y, assuming they are both fixed point with 18 digits.
    function divd(uint256 x, uint256 y) internal pure returns (uint256) {
        return divd(x, y, 18);
    }

    /// @dev Divides x between y, assuming they are both fixed point with 18 digits.
    function divd(int256 x, int256 y) internal pure returns (int256) {
        return divd(x, y, 18);
    }

    /// @dev Divides x between y, assuming they are both fixed point with `decimals` digits.
    function divd(uint256 x, uint256 y, uint8 decimals)
        internal pure returns (uint256)
    {
        return x.mul(unit(decimals)).div(y);
    }

    /// @dev Divides x between y, assuming they are both fixed point with `decimals` digits.
    function divd(int256 x, int256 y, uint8 decimals)
        internal pure returns (int256)
    {
        return x.mul(int(unit(decimals))).div(y);
    }

    /// @dev Divides x between y, rounding to the closes representable number.
    /// Assumes x and y are both fixed point with 18 digits.
    function divdr(uint256 x, uint256 y) internal pure returns (uint256) {
        return divdr(x, y, 18);
    }

    /// @dev Divides x between y, rounding to the closes representable number.
    /// Assumes x and y are both fixed point with 18 digits.
    function divdr(int256 x, int256 y) internal pure returns (int256) {
        return divdr(x, y, 18);
    }

    /// @dev Divides x between y, rounding to the closest representable number.
    /// Assumes x and y are both fixed point with `decimals` digits.
    function divdr(uint256 x, uint256 y, uint8 decimals)
        internal pure returns (uint256)
    {
        uint256 z = x.mul(unit(decimals + 1)).div(y);
        if (z % 10 > 5) return z / 10 + 1;
        else return z / 10;
    }

    /// @dev Divides x between y, rounding to the closest representable number.
    /// Assumes x and y are both fixed point with `decimals` digits.
    function divdr(int256 x, int256 y, uint8 decimals)
        internal pure returns (int256)
    {
        int256 z = x.mul(int256(unit(decimals + 1))).div(y);
        if (z % 10 > 5) return z / 10 + 1;
        else if (z % 10 < -5) return z / 10 - 1;
        else return z / 10;
    }

    /// @dev Divides x between y, rounding to the closes representable number.
    /// Assumes x and y are both fixed point with 18 digits.
    function divdrup(uint256 x, uint256 y) internal pure returns (uint256) {
        return divdrup(x, y, 18);
    }

    /// @dev Divides x between y, rounding to the closes representable number.
    /// Assumes x and y are both fixed point with 18 digits.
    function divdrup(int256 x, int256 y) internal pure returns (int256) {
        return divdrup(x, y, 18);
    }

    /// @dev Divides x between y, rounding to the closest representable number.
    /// Assumes x and y are both fixed point with `decimals` digits.
    function divdrup(uint256 x, uint256 y, uint8 decimals)
        internal pure returns (uint256)
    {
        uint256 z = x.mul(unit(decimals + 1)).div(y);
        if (z % 10 > 0) return z / 10 + 1;
        else return z / 10;
    }

    /// @dev Divides x between y, rounding to the closest representable number.
    /// Assumes x and y are both fixed point with `decimals` digits.
    function divdrup(int256 x, int256 y, uint8 decimals)
        internal pure returns (int256)
    {
        int256 z = x.mul(int256(unit(decimals + 1))).div(y);
        if (z % 10 > 0) return z / 10 + 1;
        else if (z % 10 < 0) return z / 10 - 1;
        else return z / 10;
    }
}
