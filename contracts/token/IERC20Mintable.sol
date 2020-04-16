pragma solidity ^0.6.0;


/**
 * @dev Interface of the additional functions added by `ERC20Mintable` to `ERC20`.
 */
interface IERC20Mintable {
    function mint(address account, uint256 amount) external returns(bool);

    function name() external view returns (string memory);

    function symbol() external view returns (string memory);

    function decimals() external view returns (uint8);
}
