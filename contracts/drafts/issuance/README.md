# Issuance

This is an Ethereum project that implements a simple Issuance that can be used for an ICO.

## Description

To open the `Issuance`, the owner must call `openIssuance()`.
The `Issuance` will mint `IssuanceToken`s (which inherit from `ERC20Mintable` and `ERCDetailed`, hence they are ERC20 tokens) to all investors who `participated` in the ICO (having `invest()`ed more than `minInvestment` and their investment being a multiple of `issuePrice`) during `openingDate` and `closingDate`.
If the `softcap` has been reach, investors are free to `withdraw()` their alloted tokens after the owner of the `Issuance` proceeds to `startDistribution()`.
Otherwise, investors are invited to reclaim their investemnts using `cancelInvestment()` after the owner of the `Issuance` does `cancelAllInvestments()`.
At any time during which the `Issuance` is in `OPEN` state, the investors can change their minds and reclaim their investments with `cancelInvestment()`.

## Usage
---
```
constructor(
    string memory _issuanceName,
    string memory _issuanceSymbol,
    uint8 _issuanceDecimals,
    address _acceptedToken
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
Request from investor to invest

---

```
cancelInvestment()
```
Request from investor to cancel his investment

---

```
startDistribution()
```
Opens the distributing phase, setting the `Issuance` state to `LIVE`.

---

```
withdraw()
```
Request from investor to withdraw `IssuanceToken`s

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

---

```
setOpeningDate(uint256 _openingDate)
```
Setter for _openingDate. Can only be called during `SETUP`.

---

```
setClosingDate(uint256 _closingDate)
```
Setter for _closingDate. Can only be called during `SETUP`.

---

```
setSoftCap(uint256 _softCap)
```
Setter for _softCap. Can only be called during `SETUP`.

---

```
setMinInvestment(uint256 _minInvestment)
```
Setter for _minInvestment. Can only be called during `SETUP`.

---
