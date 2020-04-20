pragma solidity ^0.6.0;


/**
 * @dev Interface of the additional functions added by `ERC20Mintable` to `ERC20`.
 */
interface IERC20Mintable {
    function decimals() external view returns (uint8);
    function mint(address account, uint256 amount) external returns(bool);
}
