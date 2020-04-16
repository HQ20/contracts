# Issuance

This is an Ethereum project that implements a simple Issuance that can be used for an ICO.

## Issuance

### Description

This issuance contract accepts investments using an accepted ERC20 token, and it will return to the investor a different ERC20 token if certain conditions are met.

The issuance is governed by the following parameters:
* `currencyToken`: The token that is accepted in payment for investments. Must inherit from `ERC20Detailed`.
* `issuanceToken`: The token that will be issued if conditions are met. Must inherit from `ERC20Detailed` and `ERC20Mintable`. Also, see `@hq20/contracts/token/ERC20Mintable`.
* `issuePrice`:  The amount of currency tokens that are required to buy one issued token.

```
SETUP ─── OPEN ─┬─ LIVE
                │
                └──FAILED
```

First set the issuance parameters using the `set*` functions.

To open the issuance to investors, the owner must call `startIssuance()`.

The `Issuance` will mint `ERC20Mintable` to all investors who participated in the ICO.

Investors are free to `claim()` their alloted tokens after the owner of the `Issuance` proceeds to `startDistribution()`.

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
Initializes the `Issuance` with the `IssuanceToken` that will be minted to investors and also takes as a paramater the address of the `_currencyToken` that will be the ERC20 token that investors will pay in.

---
```
startIssuance()
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
claim()
```
Request from investor to claim `issuanceToken`.

---
```
withdraw(address _wallet)
```
Request from `owner` to transfer `amountRaised` to `_wallet`. Even though can be called many times, will transfer funds only once.

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
