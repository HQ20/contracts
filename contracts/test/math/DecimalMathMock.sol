pragma solidity ^0.5.10;
import "../../math/DecimalMath.sol";


contract DecimalMathMock {
    using DecimalMath for uint8;
    using DecimalMath for uint256;

    function unit(uint8 decimals) public pure returns (uint256) {
        return decimals.unit();
    }

    function addd(uint256 x, uint256 y) public pure returns (uint256) {
        return x.addd(y);
    }

    function subd(uint256 x, uint256 y) public pure returns (uint256) {
        return x.subd(y);
    }

    function muld(uint256 x, uint256 y) public pure returns (uint256) {
        return x.muld(y);
    }

    function muld2(
        uint256 x,
        uint256 y,
        uint8 decimals
    ) public pure returns (uint256) {
        return x.muld(y, decimals);
    }

    function divd(uint256 x, uint256 y) public pure returns (uint256) {
        return x.divd(y);
    }

    function divd2(
        uint256 x,
        uint256 y,
        uint8 decimals
    ) public pure returns (uint256) {
        return x.divd(y, decimals);
    }
}
