pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "../../dividend/ERC20Dividendable.sol";


/**
 * @title ERC20Dividendable
 * @notice Implements an ERC20 mintable token with a dividend distribution procedure
 */
contract TestERC20Dividendable is ERC20Mintable, ERC20Dividendable {}
