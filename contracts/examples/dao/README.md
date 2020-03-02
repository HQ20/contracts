# Decentralized Autonomous Organization (DAO)

The DAO model is analogous to a VC fund. 
Individual investors invest ether into the fund in exchange of VC shares (DAO tokens).
The fund invests ether into ventures (coded as IssuanceEth contracts) and receives back company shares (Venture tokens).
The fund collects ether revenue from ventures, investors can collect their share of revenue from the fund.

## Warning

This contract is rather experimental. Use with caution.

## Usage

Investors are accepted into the DAO during the investor rounds. The initial one is executed with `DAO.startIssuance()`, callable only by the DAO owner. After the initial investor round additional investors can be welcomed by opening another investor round. To do that you need to call `DAO.reopenInvestorRound()`

Any individual can invest ether in this DAO by calling `DAO.invest()` during an investor round. Once the investor round is complete, and if the investor round is succesful, they will be allowed to call `DAO.claim()` to get their allotted DAO tokens in return.

You will use these tokens for voting purposes. 

 1. Issue the DAO tokens through an initial investment round.
 2. Propose a venture, and investment amount.
 3. Vote for a venture. Each DAO token is 1 vote. If venture is funded, or if you renounce your vote, you must manually take back the tokens.
 4. Fund a venture. Votes count must surpass the DAO's threshold for a majority.
 5. Retrieve the venture tokens for the DAO.
 6. Increase the DAO pool with returns (if any) on the tokens from a venture the DAO has invested in.
 7. Propose an amount of ether dividends to be released for future claim by DAO token holders.
 8. Vote for the dividends release proposal. Each DAO token is 1 vote. If dividends are released, or if you renounce your vote, you must manually take back the tokens.
 9. Claim ether dividends from the DAO on behalf of your DAO tokens.

## VentureEth

A hybrid mating of IssuanceEth and ERC20DividendableEth. 

### Description

0. Initialize or inherit the contract. There are no parameters for the constructor.
1. Use it as a regular `IssuanceEth`, whose `issuanceToken` is its own address. The dividendable qualities are disabled in this phase.
2. After issuance, you can use the dividendable qualities for any ether sent to `increasePool`.