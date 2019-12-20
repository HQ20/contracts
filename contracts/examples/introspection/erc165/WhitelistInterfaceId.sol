pragma solidity ^0.5.10;
import "./IWhitelist.sol";


contract WhitelistInterfaceId {
    bytes4 public constant IWHITELIST_ID = 0x63413762;

    function calc() external pure returns (bytes4) {
        IWhitelist i;
        return i.isMember.selector ^
            i.addMember.selector ^
            i.removeMember.selector;
    }
}