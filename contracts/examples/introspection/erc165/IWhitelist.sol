pragma solidity ^0.6.0;


/**
 * @title IWhitelist
 * @author Alberto Cuesta Canada
 * @dev Defines the interface for Whitelist.sol.
 */
interface IWhitelist {
    /**
     * @dev A method to verify whether an address is a member of the whitelist
     * @param _member The address to verify.
     * @return Whether the address is a member of the whitelist.
     */
    function isMember(address _member)
        external
        view
        returns(bool);

    /**
     * @dev A method to add a member to the whitelist
     * @param _member The member to add as a member.
     */
    function addMember(address _member)
        external;

    /**
     * @dev A method to remove a member from the whitelist
     * @param _member The member to remove as a member.
     */
    function removeMember(address _member)
        external;
}
