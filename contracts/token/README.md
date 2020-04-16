# Token

This is an Ethereum project that enhances some of the popular implementations of token standards.

## IERC20Mintable

It is an interface that adds to the `IERC20` interface the `mint` function from the `ERC20Mintable` OpenZeppelin contract.


## IERC20Detailed

It is an interface that adds to the `IERC20` interface the `name`, `symbol` and `decimals` functions from the `ERC20Detailed` OpenZeppelin contract.


## IERC20Mintable

It is an interface that adds to the `IERC20` interface the `mint`, `name`, `symbol` and `decimals` functions from the `ERC20Mintable` and `ERC20Detailed` OpenZeppelin contracts.

## ERC20Mintable

It is a contract that implements the `IERC20Mintable` interface.

## ERC20DividendableEth

It is a `ERC20` token contract that is endowed with some rather dividendable qualities. 

1. Anyone can send `ether` to the contract at any time using the `receive` function. That amount of `ether` will be added to a dividend pool.

2. The contract has an internal `_releaseDividends` function that will earmark a portion of the `ether` in the contract to be claimed by token holders proportionally to their holdings.

3. Any token holder can claim their share of `ether` dividends calling the `claimDividends` function.

4. A token holder can transfer tokens while having dividends available for claiming. In that case, only the recipient can claim the share of dividends related to the tokens transferred.

5. Minted tokens don't give any right to claim dividends from prior events.

6. Burning tokens while having dividends available for claiming proportionally reduces the dividends that can be claimed.