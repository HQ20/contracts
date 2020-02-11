pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../../access/TwoTiered.sol";


/**
 * @dev Extension of {ERC20} using a {TwoTiered} organization to give minting rights.
 * Users are allowed to mint (create) new tokens.
 * Admins are allowed to add or remove accounts to the Users group.
 * Admins are allowed to add accounts to the Admins group.
 * Admins are allowed to renounce their membership to the Admins group.
 * At construction, the deployer of the contract is the only Admin.
 */
contract ERC20MintableHQ20 is ERC20, TwoTiered {
    constructor (address admin) TwoTiered(admin) public {}

    /// @dev Only Users can mint new tokens
    function mint(address account, uint256 amount)
        public
        onlyUser
        returns (bool)
    {
        _mint(account, amount);
        return true;
    }
}
