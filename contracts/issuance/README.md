# Issuance

This is an Ethereum project that implements a simple Issuance that can be used for an ICO.

## Issuance

### Description

This issuance contract accepts investments using an accepted ERC20 token, and it will return to the investor a different ERC20 token if certain conditions are met.

The issuance is governed by the following parameters:
`currencyToken`: The token that is accepted in payment for investments.
`issuanceToken`: The token that will be issued if conditions are met.
`issuePrice`:  The amount of currency tokens that are required to buy one issued token.

```
SETUP ─── OPEN ─┬─ LIVE
                │
                └──FAILED
```

First set the issuance parameters using the `set*` functions.

To open the issuance to investors, the owner must call `openIssuance()`.

The `Issuance` will mint `ERC20Mintable` to all investors who participated in the ICO.

Investors are free to `withdraw()` their alloted tokens after the owner of the `Issuance` proceeds to `startDistribution()`.

Otherwise, investors are invited to reclaim their investemnts using `cancelInvestment()` after the owner of the `Issuance` does `cancelAllInvestments()`.

At any time during which the `Issuance` is in `OPEN` state, the investors can change their minds and reclaim their investments with `cancelInvestment()`.

### Usage
---
```
constructor(
    address _issuanceToken,
    address _currencyToken
)
```
Initializes the `Issuance` with the `_issuanceName`, `_issuanceSymbol` and `_issuanceDecimals` for the `IssuanceToken` that will be minted to investors and also takes as a paramater the address of the `_acceptedToken` that will be the ERC20 token that investors will pay in.

---
```
openIssuance()
```
Opens the investing phase, setting the `Issuance` state to `OPEN`.

---

```
invest(uint256 _amount)
```
Request from investor to invest.

---

```
cancelInvestment()
```
Request from investor to cancel his investment.

---

```
startDistribution()
```
Opens the distributing phase, setting the `Issuance` state to `LIVE`.

---

```
withdraw()
```
Request from investor to withdraw `IssuanceToken`.

---

```
cancelAllInvestments()
```
Starts the cancellation phase, setting the `Issuance` state to `FAILED`.

---

```
setIssuePrice(uint256 _issuePrice)
```
Setter for _issuePrice. Can only be called during `SETUP`.

## IssuanceEth

It has the same structure and functionality as the `Issuance` contract, however, investments are in Ether.
