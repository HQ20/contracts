# State Machine

This is an Ethereum project that implements a simple state machine.

## Usage

Implements a simple state machine:
 * All states exist by default.
 * No transitions exist by default.
 * The state machine starts at "SETUP".
 * New transitions can be created while in the "SETUP state".


In `StateMachine.sol`:
* constant SETUP_STATE = 'SETUP': Initial state. States and transitions can only be added while in SETUP.
* currentState: The state the machine is at.

* constructor: Sets the current state to 'SETUP'.

* function `transitionExists(bytes32 originState, bytes32 targetState)`: Returns `true` if a transition exists from `originState` to `targetState`.
* function `_createTransition(bytes32 originState, bytes32 targetState)`: Adds a transition from `originState` to `targetState`.
* function `_transition(bytes32 targetState)`: Transitions the machine from `currentState` to `targetState`.

## Use of bytes32

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
