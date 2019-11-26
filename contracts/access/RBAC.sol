pragma solidity ^0.5.10;


/**
 * @title RBAC
 * @author Alberto Cuesta Canada
 * @notice Implements runtime configurable Role Based Access Control.
 */
contract RBAC {
    event RoleCreated(uint256 roleId);
    event MemberAdded(address member, uint256 roleId);
    event MemberRemoved(address member, uint256 roleId);

    uint256 constant NO_ROLE = 0;
    uint256 constant ROOT_ROLE = 1;

    /**
     * @notice A role, which will be used to group users.
     * @dev The role id is its position in the roles array.
     * @param admin The only role that can add or remove members from this role. To have the role
     * members to be also the role admins you should pass roles.length as the admin role.
     * @param members Addresses belonging to this role.
     */
    struct Role {
        uint256 adminRoleId;
        mapping (address => bool) members;
    }

    /**
     * @notice All roles ever created.
     */
    Role[] internal roles;

    /**
     * @notice The contract initializer. It adds NO_ROLE as with role id 0, and ROOT_ROLE with role id 1.
     */
    constructor(address _root) public {
        uint256 role = roles.push(Role({ adminRoleId: NO_ROLE })) - 1;

        role = roles.push(Role({ adminRoleId: ROOT_ROLE })) - 1;
        emit RoleCreated(role);
        roles[role].members[_root] = true;
        emit MemberAdded(_root, role);
    }

    /**
     * @notice A method to verify if a role exists.
     * @param _roleId The id of the role being verified.
     * @return True or false.
     * @dev roleExists of NO_ROLE returns false.
     */
    function roleExists(uint256 _roleId)
        public
        view
        returns(bool)
    {
        return (_roleId != 0) && (_roleId < roles.length);
    }

    /**
     * @notice A method to retrieve the number of roles in the contract.
     * @dev The zero position in the roles array is reserved for NO_ROLE and doesn't count towards
     * this total.
     */
    function totalRoles()
        public
        view
        returns(uint256)
    {
        return roles.length - 1;
    }

    /**
     * @notice A method to verify whether an member is a member of a role
     * @param _member The member to verify.
     * @param _roleId The role to look into.
     * @return Whether the member is a member of the role.
     */
    function hasRole(address _member, uint256 _roleId)
        public
        view
        returns(bool)
    {
        require(roleExists(_roleId), "Role doesn't exist.");
        return roles[_roleId].members[_member];
    }

    /**
     * @notice A method to create a new role.
     * @param _adminRoleIdId The role that is allowed to add and remove members from
     * the role being created.
     * @return The role id.
     */
    function addRole(uint256 _adminRoleIdId)
        public
    {
        require(roleExists(_adminRoleIdId), "Admin role doesn't exist.");
        require(hasRole(msg.sender, _adminRoleIdId), "Not admin of role.");
        uint256 role = roles.push(
            Role({
                adminRoleId: _adminRoleIdId
            })
        ) - 1;
        emit RoleCreated(role);
    }

    /**
     * @notice A method to add a member to a role
     * @param _member The member to add as a member.
     * @param _roleId The role to add the member to.
     */
    function addMember(address _member, uint256 _roleId)
        public
    {
        require(roleExists(_roleId), "Role doesn't exist.");
        require(
            hasRole(msg.sender, roles[_roleId].adminRoleId),
            "User can't add members."
        );
        require(
            !hasRole(_member, _roleId),
            "Address is member of role."
        );

        roles[_roleId].members[_member] = true;
        emit MemberAdded(_member, _roleId);
    }

    /**
     * @notice A method to remove a member from a role
     * @param _member The member to remove as a member.
     * @param _roleId The role to remove the member from.
     */
    function removeMember(address _member, uint256 _roleId)
        public
    {
        require(roleExists(_roleId), "Role doesn't exist.");
        require(
            hasRole(msg.sender, roles[_roleId].adminRoleId),
            "User can't remove members."
        );
        require(
            hasRole(_member, _roleId),
            "Address is not member of role."
        );

        delete roles[_roleId].members[_member];
        emit MemberRemoved(_member, _roleId);
    }
}
