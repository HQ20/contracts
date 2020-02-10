pragma solidity ^0.5.10;
import "@openzeppelin/contracts/utils/EnumerableSet.sol";


/**
 * @title Roles
 * @author Alberto Cuesta Canada
 * @notice Implements runtime configurable Role Based Access Control.
 */
contract Roles {
    using EnumerableSet for EnumerableSet.AddressSet;
    event RoleAdded(bytes32 roleId);
    event RoleRemoved(bytes32 roleId);
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
        bool exists;
        EnumerableSet.AddressSet members;
    }

    mapping (bytes32 => Role) private _roles;

    /**
     * @notice A method to verify if a role exists.
     * @param roleId The id of the role being verified.
     * @return True or false.
     * @dev roleExists of NO_ROLE returns false.
     */
    function roleExists(bytes32 roleId)
        public
        view
        returns(bool)
    {
        return (_roles[roleId].exists);
    }

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
        require(roleExists(roleId), "Role doesn't exist.");
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
        require(roleExists(roleId), "Role doesn't exist.");
        return _roles[roleId].members.enumerate();
    }

    /**
     * @notice A method to create a new role.
     * @param roleId The id for role that is being created
     */
    function _addRole(bytes32 roleId)
        internal
    {
        require(!roleExists(roleId), "Role already exists.");

        _roles[roleId] = Role({
            exists: true,
            members: EnumerableSet.AddressSet({
                values: new address[](0)
            })
        });
        emit RoleAdded(roleId);
    }

    /**
     * @notice A method to add a member to a role
     * @param account The member to add as a member.
     * @param roleId The role to add the member to.
     */
    function _addMember(address account, bytes32 roleId)
        internal
    {
        require(roleExists(roleId), "Role doesn't exist.");
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
        require(roleExists(roleId), "Role doesn't exist.");
        require(
            hasRole(account, roleId),
            "Address is not member of role."
        );

        _roles[roleId].members.remove(account);
        emit MemberRemoved(account, roleId);
    }
}
