# Token

This is an Ethereum project that enhances some of the popular implementations of token standards.

## IERC20Mintable

It is an interface that adds to the `IERC20` interface the `mint` function from the `ERC20Mintable` OpenZeppelin contract.

## ERC20Dividenable

It is a `IERC20` token contract that is endowed with some rather dividendable qualities. You can send eth to the contract at any time, as much as you want, and a holder of the token can retrieve their fair share of the revenue at any time based on the proportional amount of tokens they hold at the moment the `updateAccount` function is called.