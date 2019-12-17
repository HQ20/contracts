 # ERC165 implementation

 This project implements ERC165.

 In `IWhitelist.sol`:

 This contract is the interface for `Whitelist.sol`, specifying the `isMember(...)`, `addMember(...)` and `removeMember(...)` methods.
 
 In `IWhitelistId.sol`:

 This contract keeps the `IWhitelist.sol` ERC165 signature and the method to calculate it. The output of `IWhitelistId.calc()` and the `IWhitelistId.IWHITELIST_ID` must match at all times.

 In `Whitelist.sol`:

 This contract implements `IWhitelist.sol` and inherits from `ERC165.sol`. On construction registers the `IWhitelist.sol` implementation using `_registerInterface(IWhitelistId.IWHITELIST_ID);` (method from `ERC165.sol`).

 In contracts accepting `Whitelist` instances through an address parameter:
 ```
 import "@openzeppelin/contracts/introspection/ERC165Checker.sol";
 import "./../access/IWhitelist.sol";
 import "./../access/IWhitelistId.sol";


 contract [name] is IWhitelistId {
     IWhitelist whitelist;

     constructor (address whitelistAddress) public {
         require(
             ERC165Checker._supportsInterface(whitelistAddress, IWHITELIST_ID),
             "Address is not IWhitelist."
         );
         whitelist = IWhitelist(whitelistAddress);
    }
 }
 ```