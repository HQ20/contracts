pragma solidity ^0.5.10;


/**
 * @title StateMachine
 * @author Alberto Cuesta Canada
 * @dev Implements a simple state machine.
 */
contract StateMachine {
    event StateCreated(bytes32 state);
    event TransitionCreated(bytes32 originState, bytes32 targetState);
    event CurrentState(bytes32 state);

    bytes32 public constant SETUP_STATE = "SETUP";

    bytes32 public currentState;

    /**
     * @dev A state in the machine.
     */
    struct State {
        bool exists;
        bytes32[] transitions;
    }

    /**
     * @dev All states ever created.
     */
    mapping (bytes32 => State) internal states;

    /**
     * @notice The contract constructor. It adds SETUP_STATE with state id 'SETUP' and sets the current state to it.
     */
    constructor() public {
        states[SETUP_STATE] = State({
            exists: true,
            transitions: new bytes32[](0)
        });
        emit StateCreated(SETUP_STATE);
        currentState = SETUP_STATE;
        emit CurrentState(SETUP_STATE);
    }

    /**
     * @dev Verify if a state exists.
     */
    function stateExists(bytes32 _state)
        public
        view
        returns(bool)
    {
        return (states[_state].exists == true);
    }

    /**
     * @dev Create a new state.
     */
    function _createState(bytes32 _state)
        internal
    {
        require(currentState == SETUP_STATE, "State machine not in SETUP.");
        require(!stateExists(_state), "State already exists.");

        states[_state] = State({
            exists: true,
            transitions: new bytes32[](0)
        });
        emit StateCreated(_state);
    }

    /**
     * @dev Create a transition between two states.
     */
    function _createTransition(bytes32 _originState, bytes32 _targetState)
        internal
    {
        require(currentState == SETUP_STATE, "State machine not in SETUP.");
        require(stateExists(_originState), "Origin state doesn't exist.");
        require(stateExists(_targetState), "Target state doesn't exist.");

        states[_originState].transitions.push(_targetState);
        emit TransitionCreated(_originState, _targetState);
    }

    /**
     * @dev Transition the state machine between states
     */
    function _transition(bytes32 _targetState)
        internal
    {
        require(stateExists(_targetState), "Target state doesn't exist.");
        State memory originState = states[currentState];
        for (uint i = 0; i < originState.transitions.length; i++) {
            if (originState.transitions[i] == _targetState) {
                currentState = _targetState;
                emit CurrentState(_targetState);
                return;
            }
        }
        require(false, "Transition doesn't exist.");
    }
}
