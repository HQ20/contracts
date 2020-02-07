pragma solidity ^0.5.10;
import "@openzeppelin/contracts/utils/EnumerableSet.sol";

/**
 * @title RBAC
 * @author Alberto Cuesta Canada
 * @notice Implements runtime configurable Role Based Access Control.
 */
contract RBAC {
    using EnumerableSet for EnumerableSet.AddressSet;
    event RoleCreated(bytes32 roleId);
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

    mapping (bytes32 => Role) internal roles;

    /**
     * @notice A method to verify if a role exists.
     * @param _roleId The id of the role being verified.
     * @return True or false.
     * @dev roleExists of NO_ROLE returns false.
     */
    function roleExists(bytes32 _roleId)
        public
        view
        returns(bool)
    {
        return (roles[_roleId].exists);
    }

    /**
     * @notice A method to verify whether an member is a member of a role
     * @param _member The member to verify.
     * @param _roleId The role to look into.
     * @return Whether the member is a member of the role.
     */
    function hasRole(address _member, bytes32 _roleId)
        public
        view
        returns(bool)
    {
        require(roleExists(_roleId), "Role doesn't exist.");
        return roles[_roleId].members.contains(_member);
    }

    /**
     * @notice A method to create a new role.
     * @param _roleId The id for role that is being created
     */
    function addRole(bytes32 _roleId)
        public
    {
        require(!roleExists(_roleId), "Role already exists.");

        roles[_roleId] = Role({
            exists: true,
            members: EnumerableSet.AddressSet({
                values: new address[](0)
            })
        });
        emit RoleCreated(_roleId);
    }

    /**
     * @notice A method to add a member to a role
     * @param _member The member to add as a member.
     * @param _roleId The role to add the member to.
     */
    function addMember(address _member, bytes32 _roleId)
        public
    {
        require(roleExists(_roleId), "Role doesn't exist.");
        require(
            !hasRole(_member, _roleId),
            "Address is member of role."
        );

        roles[_roleId].members.add(_member);
        emit MemberAdded(_member, _roleId);
    }

    /**
     * @notice A method to remove a member from a role
     * @param _member The member to remove as a member.
     * @param _roleId The role to remove the member from.
     */
    function removeMember(address _member, bytes32 _roleId)
        public
    {
        require(roleExists(_roleId), "Role doesn't exist.");
        require(
            hasRole(_member, _roleId),
            "Address is not member of role."
        );

        roles[_roleId].members.remove(_member);
        emit MemberRemoved(_member, _roleId);
    }
}
