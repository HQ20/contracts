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

    /**
     * @notice A role, which will be used to group users.
     * @dev The role id is its position in the roles array.
     * @param admin The only role that can add or remove members from this role. To have the role
     * members to be also the role admins you should pass roles.length as the admin role.
     * @param members Addresses belonging to this role.
     */
    struct Role {
        EnumerableSet.AddressSet members;
    }

    mapping (bytes32 => Role) private _roles;

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
        return _roles[roleId].members.contains(account);
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
        return _roles[roleId].members.enumerate();
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

        _roles[roleId].members.add(account);
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

        _roles[roleId].members.remove(account);
        emit MemberRemoved(account, roleId);
    }
}
