# Token

This is an Ethereum project that enhances some of the popular implementations of token standards.

## IERC20Mintable

It is an interface that adds to the `IERC20` interface the `mint` function from the `ERC20Mintable` OpenZeppelin contract.

## ERC20DividendableEth

It is a `ERC20` token contract that is endowed with some rather dividendable qualities. 

0. In order to be useful in practice, the contract has to be customized by inheriting from, for example, a mintable standard implementation, like openzeppelin's `ERC20Mintable` contract, in this way:

```
contract MyERC20DividendableEth is ERC20DividendableEth, ERC20Mintable {
    // here goes your fantasy
}
```

1. Anyone can send `ether` to the contract at any time using `increasePool`. That amount of `ether` will be added to a dividend pool.

2. Any token holder can draw their fair share of `ether` from the dividend pool according to the amount of tokens they hold. To do this they must call the `updateAccount` function.

Changes in the token supply will affect any dividend distribution events. Any ongoing distribution events for which the contract has received the `ether` before the total supply change are unaffected.