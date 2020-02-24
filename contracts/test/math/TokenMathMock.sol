pragma solidity ^0.5.10;
import "../../math/TokenMath.sol";


contract TokenMathMock {
    using TokenMath for uint256;

    function decimals() public pure returns (uint8) {
        return TokenMath.decimals();
    }

    function fixed1() public pure returns (uint256) {
        return TokenMath.fixed1();
    }

    function addf(uint256 x, uint256 y) public pure returns (uint256) {
        return x.addf(y);
    }

    function subf(uint256 x, uint256 y) public pure returns (uint256) {
        return x.subf(y);
    }

    function mulf(uint256 x, uint256 y) public pure returns (uint256) {
        return x.mulf(y);
    }

    function divf(uint256 x, uint256 y) public pure returns (uint256) {
        return x.divf(y);
    }

    function split(uint256 x) public pure returns (uint256, uint256) {
        return x.split();
    }
}