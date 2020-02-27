import { should } from 'chai';
import { TestStateMachineInstance } from '../../types/truffle-contracts';

const StateMachine = artifacts.require(
    './test/state/TestStateMachine.sol',
) as Truffle.Contract<TestStateMachineInstance>;
should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../utils');

contract('StateMachine', (accounts) => {
    let stateMachine: TestStateMachineInstance;
    const SETUP_STATE = 'SETUP';
    const NEW_STATE = 'NEW';

    beforeEach(async () => {
        stateMachine = await StateMachine.new();
    });

    /**
     * @test {StateMachine#transitionExists}
     */
    it('recognizes that a transition does not exist', async () => {
        assert.isFalse(
            await stateMachine.transitionExists(
                stringToBytes32(stringToBytes32(SETUP_STATE)),
                stringToBytes32(stringToBytes32(SETUP_STATE)),
            )
        );
    });

    /**
     * @test {StateMachine#transition}
     */
    itShouldThrow(
        'reverts if attempting not existing transitions',
        async () => {
            await stateMachine.transition(stringToBytes32(NEW_STATE));
        },
        'Transition doesn\'t exist.',
    );

    /**
     * @test {StateMachine#createTransition}
     */
    it('adds a new transition.', async () => {
        const event = (
            await stateMachine.createTransition(stringToBytes32(SETUP_STATE), stringToBytes32(NEW_STATE))
        ).logs[0];
        event.event.should.be.equal('TransitionCreated');
        bytes32ToString(event.args.originState).should.be.equal(SETUP_STATE);
        bytes32ToString(event.args.targetState).should.be.equal(NEW_STATE);
    });

    describe('with existing transitions', () => {
        beforeEach(async () => {
            await stateMachine.createTransition(stringToBytes32(SETUP_STATE), stringToBytes32(NEW_STATE));
        });

        /**
         * @test {StateMachine#createTransition}
         */
        itShouldThrow(
            'does not allow to add the same transition more than once.',
            async () => {
                await stateMachine.createTransition(stringToBytes32(SETUP_STATE), stringToBytes32(NEW_STATE));
            },
            'Transition already exists.',
        );

        /**
         * @test {StateMachine#transitionExists}
         */
        it('recognizes that a transition exists', async () => {
            assert.isTrue(
                await stateMachine.transitionExists(
                    stringToBytes32(SETUP_STATE),
                    stringToBytes32(NEW_STATE),
                )
            );
        });

        /**
         * @test {StateMachine#transition}
         */
        it('transitions between states', async () => {
            const event = (
                await stateMachine.transition(stringToBytes32(NEW_STATE))
            ).logs[0];
            event.event.should.be.equal('CurrentState');
            bytes32ToString(event.args.state).should.be.equal(NEW_STATE);
            bytes32ToString(await stateMachine.currentState()).should.be.equal(NEW_STATE);
        });

        describe('when not in the initial state', () => {
            beforeEach(async () => {
                await stateMachine.transition(stringToBytes32(NEW_STATE));
            });

            /**
             * @test {StateMachine#createTransition}
             */
            itShouldThrow(
                'does not allow to create new transitions outside the SETUP state.',
                async () => {
                    await stateMachine.createTransition(stringToBytes32(NEW_STATE), stringToBytes32(NEW_STATE));
                },
                'State machine not in SETUP.',
            );
        });
    });
});

function stringToBytes32(text: string) {
    return web3.utils.fromAscii(text);
}

function bytes32ToString(text: string) {
    return web3.utils.toAscii(text).replace(/\0/g, '');
}
