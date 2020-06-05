# Classifieds

This is an Ethereum project which implements a classifieds board.

For a longer explanation of the contracts here, [please read this article](https://medium.com/coinmonks/how-to-implement-an-erc721-market-f805959ddcf?source=friends_link&sk=5a9c2bb92a2bb92403a32e389e933613).

## Description

A classifieds board can be used to open and close trades between ERC20 and ERC721 tokens.

## Implementation

The contract uses the ERC20 address and ERC721 address of the traded fungible/non-fungible tokens. The trades are objects of type:
```
struct Trade {
        address poster;
        uint256 item;
        uint256 price;
        bytes32 status; // Open, Executed, Cancelled
    }
```
and are stored in `mapping(uint256 => Trade) public trades` by their incremental index. You can query the trades at any time using `getTrade` and passing in the index of the trade.

## Usage

1. To launch the contract, deploy a new instance of `Classifieds` and pass in your ERC20 and ERC721 addresses.
2. To start a trade, you can `openTrade`.
3. To close a trade, you can `executeTrade`.
4. To cancel a trade, you can `cancelTrade`.