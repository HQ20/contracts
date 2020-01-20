pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";
import "../../drafts/token/ERC20DividendableToken.sol";


contract TestERC20DividendableToken is ERC20DividendableToken, ERC20Mintable {}