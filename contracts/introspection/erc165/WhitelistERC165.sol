pragma solidity ^0.6.0;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/introspection/ERC165.sol";
import "./IWhitelist.sol";
import "./WhitelistInterfaceId.sol";


/**
 * @title WhitelistERC165
 * @author Alberto Cuesta Canada
 * @dev Implements a simple whitelist of addresses registered via ERC165
 * @dev TODO: Can be done inheriting from hq20/contracts/access/Whitelist.sol,
 * but it becomes a bit confusing for WhitelistERC165 to inherit from both
 * Whitelist.sol and IWhitelist.sol. Maybe do after moving IWwhitelist.sol to
 * hq20/contracts/access.
 */
contract WhitelistERC165 is Ownable, ERC165, IWhitelist, WhitelistInterfaceId {
    event MemberAdded(address member);
    event MemberRemoved(address member);

    mapping (address => bool) internal members;

    /**
     * @dev The contract constructor.
     */
    constructor() public Ownable() IERC165() {
        _registerInterface(WhitelistInterfaceId.IWHITELIST_ID);
    }

    /**
     * @dev A method to verify whether an address is a member of the whitelist
     * @param _member The address to verify.
     * @return Whether the address is a member of the whitelist.
     */
    function isMember(address _member)
        public
        virtual
        view
        override
        returns(bool)
    {
        return members[_member];
    }

    /**
     * @dev A method to add a member to the whitelist
     * @param _member The member to add as a member.
     */
    function addMember(address _member)
        public
        virtual
        override
        onlyOwner
    {
        require(
            !isMember(_member),
            "Address is member already."
        );

        members[_member] = true;
        emit MemberAdded(_member);
    }

    /**
     * @dev A method to remove a member from the whitelist
     * @param _member The member to remove as a member.
     */
    function removeMember(address _member)
        public
        virtual
        override
        onlyOwner
    {
        require(
            isMember(_member),
            "Not member of whitelist."
        );

        delete members[_member];
        emit MemberRemoved(_member);
    }
}
