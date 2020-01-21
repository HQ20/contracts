pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "../../drafts/token/ERC20MultiDividendable.sol";


contract TestERC20MultiDividendable is ERC20MultiDividendable, ERC20Mintable {}