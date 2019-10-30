pragma solidity ^0.5.0;

import "@openzeppelin/contracts/math/SafeMath.sol";


/**
 * @title Simple Storage
 * @dev A simple way to save a number.
 */
contract SimpleConversion {

    /**
     * constructor method setting an initial value
     */
    constructor() public {
    }

    function bytes32ToString(bytes32 _data)
    public
    pure
    returns (string memory) {
        bytes memory _bytesContainer = new bytes(32);
        uint256 _charCount = 0;
        for (uint256 _bytesCounter = 0; _bytesCounter < 32; _bytesCounter++) {
            bytes1 _char = bytes1(
                bytes32(
                    uint256(_data) * 2 ** (8 * _bytesCounter)
                )
            );
            if (_char != 0) {
                _bytesContainer[_charCount] = _char;
                _charCount++;
            }
        }

        bytes memory _bytesContainerTrimmed = new bytes(_charCount);

        for (
            uint256 _charCounter = 0;
            _charCounter < _charCount;
            _charCounter++
        ) {
            _bytesContainerTrimmed[
                _charCounter
            ] = _bytesContainer[_charCounter];
        }

        return string(_bytesContainerTrimmed);
    }

    function stringToBytes32(string memory _data)
    public
    pure
    returns
    (bytes32 result) {
        bytes memory tempEmptyStringTest = bytes(_data);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            result := mload(add(_data, 32))
        }
    }
}
