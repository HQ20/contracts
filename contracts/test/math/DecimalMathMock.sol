pragma solidity ^0.6.0;
import "../../math/DecimalMath.sol";


contract DecimalMathMock {
    using DecimalMath for uint8;
    using DecimalMath for uint256;
    using DecimalMath for int256;

    function unit(uint8 decimals) public virtual pure returns (uint256) {
        return decimals.unit();
    }

    function addd(uint256 x, uint256 y) public virtual pure returns (uint256) {
        return x.addd(y);
    }

    function adddInt(int256 x, int256 y) public virtual pure returns (int256) {
        return x.addd(y);
    }

    function subd(uint256 x, uint256 y) public virtual pure returns (uint256) {
        return x.subd(y);
    }

    function subdInt(int256 x, int256 y) public virtual pure returns (int256) {
        return x.subd(y);
    }

    function muld(uint256 x, uint256 y) public virtual pure returns (uint256) {
        return x.muld(y);
    }

    function muldInt(int256 x, int256 y) public virtual pure returns (int256) {
        return x.muld(y);
    }

    function muld2(uint256 x, uint256 y, uint8 decimals)
        public virtual pure returns (uint256)
    {
        return x.muld(y, decimals);
    }

    function muld2Int(int256 x, int256 y, uint8 decimals)
        public virtual pure returns (int256)
    {
        return x.muld(y, decimals);
    }

    function divd(uint256 x, uint256 y) public virtual pure returns (uint256) {
        return x.divd(y);
    }

    function divdInt(int256 x, int256 y) public virtual pure returns (int256) {
        return x.divd(y);
    }

    function divd2(uint256 x, uint256 y, uint8 decimals)
        public virtual pure returns (uint256)
    {
        return x.divd(y, decimals);
    }

    function divd2Int(int256 x, int256 y, uint8 decimals)
        public virtual pure returns (int256)
    {
        return x.divd(y, decimals);
    }

    function divdr(uint256 x, uint256 y)
        public virtual pure returns (uint256)
    {
        return x.divdr(y);
    }

    function divdrInt(int256 x, int256 y)
        public virtual pure returns (int256)
    {
        return x.divdr(y);
    }

    function divdr2(uint256 x, uint256 y, uint8 decimals)
        public virtual pure returns (uint256)
    {
        return x.divdr(y, decimals);
    }

    function divdr2Int(int256 x, int256 y, uint8 decimals)
        public virtual pure returns (int256)
    {
        return x.divdr(y, decimals);
    }

    function divdrup(uint256 x, uint256 y)
        public virtual pure returns (uint256)
    {
        return x.divdrup(y);
    }

    function divdrupInt(int256 x, int256 y)
        public virtual pure returns (int256)
    {
        return x.divdrup(y);
    }

    function divdrup2(uint256 x, uint256 y, uint8 decimals)
        public virtual pure returns (uint256)
    {
        return x.divdrup(y, decimals);
    }

    function divdrup2Int(int256 x, int256 y, uint8 decimals)
        public virtual pure returns (int256)
    {
        return x.divdrup(y, decimals);
    }
}
