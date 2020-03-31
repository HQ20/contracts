# DecimalMath

This is an Ethereum library to implement decimal arithmetic tailored to cryptocurrency operations.

## Usage
Tokens implementing `ERC20Detailed` already are in a decimal representation, with a virtual comma `decimals()` positions to the left of the least significant digit.


Using tokens and wei, with `N` decimals, the number stored to represent 1 wei would be 1, and the number stored to represent 1 token would be 100...`pad(0, N)`...0 (== 10**decimals()).

`DecimalMath` implements the four basic arithmetic operations (`addd`, `subd`, `muld` and `divd`) to operate on token amounts respecting the position of the comma.

`DecimalMath` assumes that all operands are in the widespread `wei` representation with 18 decimals, unless a different number of decimals is specified.

When using `DecimalMath` the representation should be the same. For example:
 - Multiply 1 token by 0.5: `DecimalMath.muld(1000000000000000000, 500000000000000000)`
 - Multiply 1 wei by 2: `DecimalMath.muld(1, 2000000000000000000)`
 - Multiply 1.01 by 2.02: `DecimalMath.muld(1010000000000000000, 2020000000000000000)`

## Number Conversions


No functions are supplied to convert to and from decimal representation, as an user you just need to remember that you need to add 18 zeros (or multiply by `DecimalMath.unit(token.decimals())`) to convert from solidity integer to DecimalMath decimal. Remove zeros or divide by `DecimalMath.unit(token.decimals())` to convert back.

```
using SafeMath for uint256;
using DecimalMath for uint256;
using DecimalMath for uint8;

uint256 one = 1;                                        // = 1
uint256 decimalOne = 18.unit();                         // = 1000000000000000000
uint256 decimalTwo = decimalOne.addd(decimalOne);       // = 2000000000000000000
uint256 decimalHalf = decimalOne.divd(decimalTwo);      // = 500000000000000000
uint256 two = decimalTwo.div(decimalOne);               // = 2
uint256 half = decimalHalf.div(decimalOne);             // = 0, because decimals get truncated when going back to solidity integers.
```

## Overflow Protection

`DecimalMath` uses `SafeMath` for all internal operations, so `DecimalMath` is safe against overflow. When losing precision (like for example in `DecimalMath.muld(1, 1)`) the least significant digits of the fractional part are truncated (i.e. `DecimalMath` rounds down), keeping only as many as defined in `decimals()` (so `DecimalMath.muld(1, 1)` returns 0).

## Implemented Operations

All operations assume that operands are decimal numbers with 18 digits.
* `function unit(uint8 decimals)`: Returns 1 in decimal representation, right padded by `decimals` zeros.
* `function addd(uint256 x, uint256 y)`: Adds x and y.
* `function addd(int256 x, int256 y)`: Adds x and y.
* `function subd(uint256 x, uint256 y)`: Substracts y from x.
* `function subd(int256 x, int256 y)`: Substracts y from x.
* `function muld(uint256 x, uint256 y)`: Multiplies x and y.
* `function muld(int256 x, int256 y)`: Multiplies x and y.
* `function divd(uint256 x, uint256 y)`: Divides x by y.
* `function divd(int256 x, int256 y)`: Divides x by y.
* `function muld(uint256 x, uint256 y, uint8 decimals)` Multiplies x and y, for decimal numbers with `decimals` decimals.
* `function muld(int256 x, int256 y, uint8 decimals)` Multiplies x and y, for decimal numbers with `decimals` decimals.
* `function divd(uint256 x, uint256 y, uint8 decimals)` Divides x by y, for decimal numbers with `decimals` decimals.
* `function divd(int256 x, int256 y, uint8 decimals)` Divides x by y, for decimal numbers with `decimals` decimals.
