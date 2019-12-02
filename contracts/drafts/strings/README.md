# string-to-bytes32-to-string

This is an Ethereum project with helper functions that help you convert between string and bytes32 types.


## Usage

In `StringConversion.sol`:
* function `byteAt(bytes32 _data, uint256 _at)`: Return the byte from `_data` at position `_at`.
* function `resizeBytes(bytes memory _bytes, uint256 _length)`: Resize _bytes to a new _length. If the result is longer than the original the data remains at the beginning. If the result is shorter any extra bytes at the end are truncated.
* function `trimEmptyChars(bytes32 _bytes)`: Resize a bytes32 containing ascii characters, padded by 0, to a bytes variable of the right size with no padding.
* function `bytes32ToString(bytes32 _data)`: Converts and returns bytes32 `_data` as a string.
* function `stringToBytes32(string memory _data)`: Converts and returns the string `_data` as bytes32.