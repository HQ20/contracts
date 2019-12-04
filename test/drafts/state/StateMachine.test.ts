import { should } from 'chai';
import { StateMachineInstance } from '../../../types/truffle-contracts';

const StateMachine = artifacts.require('./state/StateMachine.sol') as Truffle.Contract<StateMachineInstance>;
should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../../utils');

contract('StateMachine', (accounts) => {
    let stateMachine: StateMachineInstance;
    const SETUP_STATE = 'SETUP';
    const NEW_STATE = 'NEW';

    beforeEach(async () => {
        stateMachine = await StateMachine.new();
    });

    /**
     * @test {StateMachine#stateExists}
     */
    it('stateExists returns false for non existing states', async () => {
        assert.isFalse(await stateMachine.stateExists(stringToBytes32(stringToBytes32(NEW_STATE))));
    });

    /**
     * @test {StateMachine#stateExists}
     */
    it('stateExists returns true for existing states', async () => {
        assert.isTrue(await stateMachine.stateExists(stringToBytes32(SETUP_STATE)));
    });

    /**
     * @test {StateMachine#createState}
     */
    itShouldThrow(
        'createState reverts with existing states.',
        async () => {
            await stateMachine.createState(stringToBytes32(SETUP_STATE));
        },
        'State already exists.',
    );

    /**
     * @test {StateMachine#createState}
     */
    it('createState adds a new state.', async () => {
        const event = (
            await stateMachine.createState(stringToBytes32(NEW_STATE))
        ).logs[0];
        event.event.should.be.equal('StateCreated');
        bytes32ToString(event.args.state).should.be.equal(NEW_STATE);
    });

    /**
     * @test {StateMachine#createTransition}
     */
    itShouldThrow(
        'createTransition reverts with not existing states as the origin state.',
        async () => {
            await stateMachine.createTransition(stringToBytes32(NEW_STATE), stringToBytes32(SETUP_STATE));
        },
        'Origin state doesn\'t exist.',
    );

    /**
     * @test {StateMachine#createTransition}
     */
    itShouldThrow(
        'createTransition reverts with not existing states as the target state.',
        async () => {
            await stateMachine.createTransition(stringToBytes32(SETUP_STATE), stringToBytes32(NEW_STATE));
        },
        'Target state doesn\'t exist.',
    );

    /**
     * @test {StateMachine#createTransition}
     */
    it('createTransition adds a new transition.', async () => {
        await stateMachine.createState(stringToBytes32(NEW_STATE));
        const event = (
            await stateMachine.createTransition(stringToBytes32(SETUP_STATE), stringToBytes32(NEW_STATE))
        ).logs[0];
        event.event.should.be.equal('TransitionCreated');
        bytes32ToString(event.args.originState).should.be.equal(SETUP_STATE);
        bytes32ToString(event.args.targetState).should.be.equal(NEW_STATE);
    });

    /**
     * @test {StateMachine#transition}
     */
    itShouldThrow(
        'transition reverts for non existing target states.',
        async () => {
            await stateMachine.transition(stringToBytes32(NEW_STATE));
        },
        'Target state doesn\'t exist.',
    );

    /**
     * @test {StateMachine#transition}
     */
    itShouldThrow(
        'transition reverts for non existing transitions.',
        async () => {
            await stateMachine.createState(stringToBytes32(NEW_STATE));
            await stateMachine.transition(stringToBytes32(NEW_STATE));
        },
        'Transition doesn\'t exist.',
    );

    /**
     * @test {StateMachine#transition}
     */
    it('transition follows a transition between states.', async () => {
        await stateMachine.createState(stringToBytes32(NEW_STATE));
        await stateMachine.createTransition(stringToBytes32(SETUP_STATE), stringToBytes32(NEW_STATE));
        const event = (
            await stateMachine.transition(stringToBytes32(NEW_STATE))
        ).logs[0];
        event.event.should.be.equal('CurrentState');
        bytes32ToString(event.args.state).should.be.equal(NEW_STATE);
    });

    /**
     * @test {StateMachine#createState}
     */
    itShouldThrow(
        'createState reverts if not in SETUP state.',
        async () => {
            await stateMachine.createState(stringToBytes32(NEW_STATE));
            await stateMachine.createTransition(stringToBytes32(SETUP_STATE), stringToBytes32(NEW_STATE));
            await stateMachine.transition(stringToBytes32(NEW_STATE));
            await stateMachine.createState(stringToBytes32(NEW_STATE));
        },
        'State machine not in SETUP.',
    );

    /**
     * @test {StateMachine#createTransition}
     */
    itShouldThrow(
        'createTransition reverts if not in SETUP state.',
        async () => {
            await stateMachine.createState(stringToBytes32(NEW_STATE));
            await stateMachine.createTransition(stringToBytes32(SETUP_STATE), stringToBytes32(NEW_STATE));
            await stateMachine.transition(stringToBytes32(NEW_STATE));
            await stateMachine.createTransition(stringToBytes32(SETUP_STATE), stringToBytes32(NEW_STATE));
        },
        'State machine not in SETUP.',
    );
});

function stringToBytes32(text: string) {
    return web3.utils.fromAscii(text);
}

function bytes32ToString(text: string) {
    return web3.utils.toAscii(text).replace(/\0/g, '');
}
