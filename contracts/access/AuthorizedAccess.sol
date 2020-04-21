pragma solidity ^0.6.0;
import "@openzeppelin/contracts/access/Ownable.sol";


/// @dev AuthorizedAccess allows to define simple access control for multiple authorized
/// Think of it as a simple two tiered access control contract. It has an owner which can
/// execute functions with the `onlyOwner` modifier, and the owner can give access to other
/// addresses which then can execute functions with the `onlyAuthorized` modifier.
contract AuthorizedAccess is Ownable {
    event GrantedAccess(address user);
    event RevokedAccess(address user);

    mapping(address => bool) private authorized;

    constructor () public Ownable() {}

    /// @dev Restrict usage to authorized users
    modifier onlyAuthorized(string memory err) {
        require(authorized[msg.sender], err);
        _;
    }

    /// @dev Add user to the authorized users list
    function grantAccess(address user) public onlyOwner {
        authorized[user] = true;
        emit GrantedAccess(user);
    }

    /// @dev Remove user to the authorized users list
    function revokeAccess(address user) public onlyOwner {
        authorized[user] = false;
        emit RevokedAccess(user);
    }
}
