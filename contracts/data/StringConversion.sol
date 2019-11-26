pragma solidity ^0.5.0;


/**
 * @title String Conversion
 * @dev Functions to convert between string and bytes32
 */
contract StringConversion {

    /**
     * @dev Extract byte at position _at from _data.
     */
    function byteAt(bytes32 _data, uint256 _at)
        public
        pure
        returns (bytes1)
    {
        return bytes1(bytes32(uint256(_data) * 2 ** (8 * _at)));
    }

    /**
     * @dev Resize _bytes to a new _length. If the result is longer
     * than the original the data remains at the beginning. If the
     * result is shorter any extra bytes at the end are truncated.
     */
    function resizeBytes(bytes memory _bytes, uint256 _length)
        public
        pure
        returns (bytes memory)
    {
        bytes memory result = new bytes(_length);

        for (uint256 c = 0; c < _length; c++) {
            result[c] = _bytes[c];
        }
        return result;
    }

    /**
     * @dev Convert _data from bytes32 to a string.
     */
    function bytes32ToString(bytes32 _data)
        public
        pure
        returns (string memory)
    {
        bytes memory result = new bytes(32);
        uint256 charCount = 0;
        for (uint256 byteCount = 0; byteCount < 32; byteCount++) {
            bytes1 char = byteAt(_data, byteCount);
            if (char == 0) {
                break;
            }
            result[charCount] = char;
            charCount++;
        }

        return string(resizeBytes(result, charCount));
    }

    /**
     * @dev Convert _data from a string to bytes 32. Any data after
     * the 32nd byte is truncated.
     */
    function stringToBytes32(string memory _data)
        public
        pure
        returns (bytes32 result)
    {
        if (bytes(_data).length == 0) {
            return 0x0;
        }
        // solium-disable-next-line security/no-inline-assembly
        assembly {
            result := mload(add(_data, 32))
        }
    }
}
