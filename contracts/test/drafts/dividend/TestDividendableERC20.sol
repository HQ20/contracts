pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../../../drafts/dividend/DividendableERC20.sol";


/**
 * @title DividendableERC20
 * @notice Implements an ERC20 mintable token with a dividend distribution procedure
 */
contract TestDividendableERC20 is ERC20Mintable, DividendableERC20 {}
