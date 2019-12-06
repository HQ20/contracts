pragma solidity ^0.5.10;

import "./StateMachine.sol";


contract TestStateMachine is StateMachine {

    function testCreateState(bytes32 _state) external {
        createState(_state);
    }

    function testCreateTransition(
        bytes32 _originState,
        bytes32 _targetState
    ) external {
        createTransition(_originState, _targetState);
    }

    function testTransition(bytes32 _targetState) external {
        transition(_targetState);
    }

}