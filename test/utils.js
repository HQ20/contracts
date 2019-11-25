const itShouldThrow = (reason, fun, expectedMessage) => {
    it(reason, async () => {
        let error = false;
        try {
            await Promise.resolve(fun()).catch((e) => {
                error = e;
            });
        } catch (e) {
            error = e;
        }

        // No error was returned or raised - make the test fail plain and simple.
        if (!error) {
            assert.ok(false, 'expected to throw, did not');
        }

        // No exception message was provided, we'll only test against the important VM ones.
        if (expectedMessage === undefined) {
            assert.match(
                error.message,
                /invalid JUMP|invalid opcode|out of gas|The contract code couldn't be stored, please check your gas amount/,
            );
        // An expected exception message was passed - match it.
        } else if (error.message.length > 0) {
            // Get the error message from require method within the contract
            const errorReason = error.message.match('Reason given: (.*)\\.');
            // If there's no message error provided, check for default errors
            if (errorReason === null) {
                assert.ok(
                    error.message.indexOf(expectedMessage) >= 0,
                    'threw the wrong exception type',
                );
            } else {
                assert.equal(
                    expectedMessage,
                    errorReason[1],
                    'threw the wrong exception type',
                );
            }
        // In case that nothing matches!
        } else {
            assert.ok(false, `something went wrong with asserts. Given error ${error}`);
        }
    });
};

module.exports = {
    itShouldThrow,
};
