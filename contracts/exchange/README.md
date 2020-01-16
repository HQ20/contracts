# Uniswap Exchange
This is an Ethereum project that implements a decentralized exchange in the manner of the uniswap protocol.

## Description
The project has two main components: the `UniswapFactory`, which is a factory contract that creates and stores exchanges; and `UniswapExchange`, which is an exchange for a certain ERC20 token.

For more details please refer to the official Uniswap documentation at https://docs.uniswap.io/.

## Implementation
For simplicity this smart contract assumes that only ERC20 tokens that follow the OpenZeppelin implementation (i.e. reverting on failed transfers) will be used. If this code would be used by ERC20 tokens that return false on failed transactions we recommend modifying the exchange to wrap all tokens in SafeERC20 libraries.

## Usage

### Launch an exchange

1. If you want to launch an exchange, the first thing you need is to deploy a `UniswapFactory` (if you haven't already). The `UniswapFactory` contract takes no parameters.

2. Then, you can call the `launchExchange` method from that contract, feeding it as parameter the address of the token you wish to trade using that exchange. For every token that wish to trade, you have to launch a `UniswapExchange` contract associated with that token by calling `launchExchange` on `UniswapFactory`.

### Invest liquidity

1. Any exchange needs to first be initialized. That is, to invest some liquidity (ether and tokens) into that exchange. You can do this by sending a transaction to `initializeExchange` on a certain `UniswapExchange` with the desired liquidity amount of ether. The function takes as parameter the amount of tokens you wish to initialize the exchange with, so you must have previously approved the `UniswapExchange` to use your tokens. In exchange, you will recieve an amount of shares, which you can later divest for profits based on the exchange fees. The shares are stored inside `UniswapExhange` and can be retrieved with `getShares(address)`.

2. At any point after initialization, you can invest liquidity into the exchange by sending ether to `investLiquidity`. The function takes as a parameter the minimum amount of shares you are willing to receive, and will fail if those shares cannot be acquired.

### Divest liquidity

1. You can divest your shares by calling `divestLiquidity` on `UniswapExchange`. You need to specify the amount of shares to burn and the minimum ethereum and minimum amount of tokens you would accept to receive.

### Trade eth for token

1. You can simply send ether to `UniswapExchange`, and the contract will send you back tokens based on an invariant formula. There is also a fee which gets deducted (the `FEE_RATE` is by default `500` and is expressed in permillages (i.e., `FEE_RATE` = `0.005%`)) that is deductable for all types of trades.

2. You can also send ether to `ethToTokenSwap`, if you wish to receive tokens at the same address as that by which you initiated the swap. Bear in mind that all trades (swaps and payments) also require as parameters the minimum amount you would accept to receive and the timeout by which the transaction should fail.

3. If you have another recipient in mind, please use the `ethToTokenPayment` method.

### Trade token for eth

1. You have to approve `UniswapExchange` to use your tokens.
2. Specify the amount of tokens which you wish to trade in a call to `tokenToEthSwap` on `UniswapExchange`. You will receive your ether in the same wallet.
3. If you have another recipient in mind, please use the `tokenToEthPayment` method.

### Trade tokens for tokens

1. The token you wish to trade to must have an associated `UniswapExchange` launched.
2. You have to approve `UniswapExchange` to use your tokens which you wish to trade with.
3. Specify the address of the token and the amount of tokens which you wish to trade in a call to `tokenToTokenSwap` on `UniswapExchange`. You will receive your tokens in the same wallet.
4. If you have another recipient in mind, please use the `tokenToTokenPayment` method.

