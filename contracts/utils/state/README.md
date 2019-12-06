# State Machine

This is an Ethereum project that implements a simple state machine.

## Usage

The state ids in the contract are kept as bytes32 for two reasons:
1. Possibility of returning several bytes32 in an array, as oppossed to strings.
2. Possibility of encoding a state id as recognizable text.

To interact with bytes32 from javascript you can use these two functions:
```
function stringToBytes32(_string: String) {
    return web3.utils.fromAscii(_string);
}

function bytes32ToString(_bytes32: String) {
    return web3.utils.toAscii(_bytes32).replace(/\0/g, '');
}
```

In `StateMachine.sol`:
* constant SETUP_STATE = 'SETUP': Reserved bytes32 value for the start state. States and transitions can only be added while in SETUP.
* currentState: The state the machine is at.

* constructor: Creates the setup state and updates currentState to it.

* function `stateExists(bytes32 _state)`: Returns `true` if `_state` exists.
* function `createState(bytes32 _state`: Adds a new state with id `_state` to the contract. There is no function to remove states.
* function `createTransition(bytes32 _originState, bytes32 _targetState)`: Adds a transition from `_originState` to `_targetState`.
* function `transition(bytes32 _targetState)`: Transitions the machine from `currentState` to `_targetState`.