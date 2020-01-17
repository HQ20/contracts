pragma solidity ^0.5.10;


/**
 * @dev Interface of the additional functions added by `ERC20Mintable` to `ERC20`.
 */
interface IERC20Mintable {
    /**
     * @dev See {ERC20-_mint}.
     *
     * Requirements:
     *
     * - the caller must have the {MinterRole}.
     */
    function mint(address account, uint256 amount)
        external
        returns(bool);
}
