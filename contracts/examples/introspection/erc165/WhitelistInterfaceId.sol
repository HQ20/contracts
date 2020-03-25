pragma solidity ^0.6.0;
import "./IWhitelist.sol";


contract WhitelistInterfaceId {
    bytes4 public constant IWHITELIST_ID = 0x63413762;

    function calc() external virtual pure returns (bytes4) {
        IWhitelist i;
        return i.isMember.selector ^
            i.addMember.selector ^
            i.removeMember.selector;
    }
}