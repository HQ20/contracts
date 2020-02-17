pragma solidity ^0.5.10;
import "./RolesMock.sol";
import "./../../access/Renounceable.sol";


contract RenounceableMock is RolesMock, Renounceable {
}
