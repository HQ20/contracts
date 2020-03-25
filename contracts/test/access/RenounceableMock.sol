pragma solidity ^0.6.0;
import "./RolesMock.sol";
import "./../../access/Renounceable.sol";


contract RenounceableMock is RolesMock, Renounceable {
}
