# Voting

## Description

A Voting contract that can be used for registering proposals, casting votes, validating the majority and enacting the proposals. A proposal consists in calling some data (a function signature and encoded arguments) on a contract's address.

## Usage

1. Setup the Voting contract by providing to the constructor these parameters:
- the address of the voting token, used for locking votes by transfering that token to this contract. The `_votingToken` must inherit from ERC20Detailed.
- the majority deciding threshold, expressed as an integer between 1 and 10000, included. The `_threshold` is a percentage with a double-digit precision and with the comma shifted two places to the right. For example, `50.1%` is input as `5010`.

2. Register some proposals. You can choose a contract's address as `_proposalContract` and a function from that contract and its arguments encoded as `_proposalData`. To encode the last argument, use web3's `encodeFunctionCall` or `abi.encodeWithSignature` in solidity.

3. Open the Voting to lock the proposals and begin the vote.

4. Cast votes. To cast `N` votes you will have to approve Voting to transfer `N` `votingToken` tokens from you.

5. You can cancel your vote at any time.

6. Once you think the majority of the `votingToken` holders have voted, you can validate the vote against the `threshold` so that proposals might be enacted.

7. Enact the proposals, one by one.
