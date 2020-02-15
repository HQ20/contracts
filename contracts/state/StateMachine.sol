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

    mapping (bytes32 => bool) internal states;
    mapping (bytes32 => mapping(bytes32 => bool)) internal transitions;

    /**
     * @notice The contract constructor. It adds SETUP_STATE with state id 'SETUP' and sets the current state to it.
     */
    constructor() public {
        states[SETUP_STATE] = true;
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
        return (states[_state] == true);
    }

    /**
     * @dev Verify if a transition exists.
     */
    function transitionExists(bytes32 _originState, bytes32 _targetState)
        public
        view
        returns(bool)
    {
        return (transitions[_originState][_targetState] == true);
    }

    /**
     * @dev Create a new state.
     */
    function _createState(bytes32 _state)
        internal
    {
        require(currentState == SETUP_STATE, "State machine not in SETUP.");
        require(!stateExists(_state), "State already exists.");

        states[_state] = true;
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
        require(
            !transitionExists(_originState, _targetState),
            "Transition already exists."
        );

        transitions[_originState][_targetState] = true;
        emit TransitionCreated(_originState, _targetState);
    }

    /**
     * @dev Transition the state machine between states
     */
    function _transition(bytes32 _targetState)
        internal
    {
        require(stateExists(_targetState), "Target state doesn't exist.");
        require(
            transitionExists(currentState, _targetState),
            "Transition doesn't exist."
        );
        currentState = _targetState;
        emit CurrentState(_targetState);
    }
}
