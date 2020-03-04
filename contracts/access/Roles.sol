pragma solidity ^0.5.10;
import "@openzeppelin/contracts/utils/EnumerableSet.sol";


/**
 * @title Roles
 * @author Alberto Cuesta Canada
 * @notice Implements runtime configurable Role Based Access Control.
 */
contract Roles {
    using EnumerableSet for EnumerableSet.AddressSet;
    event MemberAdded(address member, bytes32 roleId);
    event MemberRemoved(address member, bytes32 roleId);

    mapping (bytes32 => EnumerableSet.AddressSet) private _roles;

    /**
     * @notice A method to verify whether an member is a member of a role
     * @param account The member to verify.
     * @param roleId The role to look into.
     * @return Whether the member is a member of the role.
     */
    function hasRole(address account, bytes32 roleId)
        public
        view
        returns(bool)
    {
        return _roles[roleId].contains(account);
    }

    /**
     * @notice A method to enumerate the members from a role
     * @param roleId The role to remove the member from.
     */
    function enumerateMembers(bytes32 roleId)
        public
        view
        returns (address[] memory)
    {
        return _roles[roleId].enumerate();
    }

    /**
     * @notice A method to add a member to a role
     * @param account The member to add as a member.
     * @param roleId The role to add the member to.
     */
    function _addMember(address account, bytes32 roleId)
        internal
    {
        require(
            !hasRole(account, roleId),
            "Address is member of role."
        );

        _roles[roleId].add(account);
        emit MemberAdded(account, roleId);
    }

    /**
     * @notice A method to remove a member from a role
     * @param account The member to remove as a member.
     * @param roleId The role to remove the member from.
     */
    function _removeMember(address account, bytes32 roleId)
        internal
    {
        require(
            hasRole(account, roleId),
            "Address is not member of role."
        );

        _roles[roleId].remove(account);
        emit MemberRemoved(account, roleId);
    }
}
