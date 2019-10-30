#!/usr/bin/env bash

# thanks to open-zeppelin folks!

# Exit script as soon as a command fails.
set -o errexit

# Executes cleanup function at script exit.
trap cleanup EXIT

cleanup() {
    # Kill the ganache instance that we started (if we started one and if it's still running).
    if [ -n "$ganache_pid" ] && ps -p $ganache_pid > /dev/null; then
        kill -9 $ganache_pid
    fi
}

if [ "$SOLIDITY_COVERAGE" = true ]; then
    ganache_port=8555
else
    ganache_port=8545
fi

ganache_running() {
    nc -z localhost "$ganache_port"
}

start_ganache() {
    npx ganache-cli --gasLimit 0xfffffffffff --port "$ganache_port" > /dev/null &
    ganache_pid=$!
    echo "Waiting for ganache to launch on port "$ganache_port"..."
    while ! ganache_running; do
        sleep 0.1 # wait for 1/10 of the second before check again
    done
    echo "Ganache launched!"
}

npx truffle version

if [ "$SOLIDITY_COVERAGE" = true ]; then
    npx solidity-coverage

    # if [ "$CI" = true ]; then
    #     cat coverage/lcov.info | npx coveralls
    # fi
else
    if ganache_running; then
        echo "Using existing ganache instance"
    else
        echo "Starting our own ganache instance"
        start_ganache
    fi
    npx truffle test "$@"
fi