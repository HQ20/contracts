pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "../../token/ERC20DividendableEth.sol";


contract TestERC20DividendableEth is ERC20DividendableEth, ERC20Mintable {}