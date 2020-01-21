## ERC20Dividendable

It is a `ERC20` token contract that is endowed with some rather dividendable qualities. 

0. In order to be useful in practice, the contract has to be customized by inheriting from, for example, a mintable standard implementation, like openzeppelin's `ERC20Mintable` contract, in this way:

```
contract MyERC20DividendableToken is ERC20DividendableToken, ERC20Mintable {
    // here goes your fantasy
}
```
1. Anyone can send `dividendToken` to the contract at any time using `increasePool` and specifying the amount. That amount of `dividendToken` will be added to a dividend pool.

2. Any token holder can draw their fair share of `dividendToken` from the dividend pool according to the amount of tokens they hold. To do this they must call the `updateAccount` function.

Changes in the token supply will affect any dividend distribution events. Any ongoing distribution events for which the contract has received the `dividendToken` before the total supply change, are unaffected.
