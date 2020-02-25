# TokenMath

This is an Ethereum library to implement fixed point arithmetic tailored to cryptocurrency operations.

## Usage
Tokens implementing `ERC20Detailed` already are in a fixed point representation, with a virtual comma `decimals()` positions to the left of the least significant digit.

Using tokens and wei, with 18 decimals, the number stored to represent 1 wei would be 1, and the number stored to represent 1 token would be 1000000000000000000 (== 10**decimals()).

`TokenMath` implements the four basic arithmetic operations (`addf`, `subf`, `mulf` and `divf`) to operate on token amounts respecting the position of the comma. Operating with decimals becomes possible if the same representation is used.

`TokenMath` assumes that all operands are in the widespread `wei` representation and have 18 decimals.

When using `TokenMath` the representation should be the same. For example:
 - Multiply 1 token by 0.5: `TokenMath.mulf(1000000000000000000, 500000000000000000)`
 - Multiply 1 wei by 2: `TokenMath.mulf(1, 2000000000000000000)`
 - Multiply 1.01 by 2.02: `TokenMath.mulf(1010000000000000000, 2020000000000000000)`

`TokenMath` uses `SafeMath` for all internal operations, so `TokenMath` is safe against overflow. When losing precision (like for example in `TokenMath.mulf(1, 1)`) the least significant digits of the fractional part are truncated (i.e. `TokenMath` rounds down), keeping only as many as defined in `decimals()` (so `TokenMath.mulf(1, 1)` returns 0).

All operations assume that operands are fixed point numbers with 18 digits.
* `function fixed1()`: Returns 1 in fixed point representation (1000000000000000000).
* `function decimals()`: Returns the number of decimals in the fixed point representation (18).
* `function addf(uint256 x, uint256 y)`: Adds x and y.
* `function subf(uint256 x, uint256 y)`: Substracts y from x.
* `function mulf(uint256 x, uint256 y)`: Multiplies x and y.
* `function divf(uint256 x, uint256 y)`: Divides x by y.
* `function split(uint256 x)`: Returns `(uint256 i, uint256 f)`, where i is the integer part of x, and f the fractional part of x, with all zeroes to the left of the least significant digit omitted. `split(1500000000000000000)` (== 1.5) returns `(1000000000000000000, 500000000000000000)`.
