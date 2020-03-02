# Voting

## Description

A Voting contract that can be used for registering proposals, casting votes, validating the majority and enacting the proposals. A proposal consists in calling some data (a function signature and encoded arguments) on a contract's address.

## Usage

 1. Initialize the Voting with:
      The votingToken address
      The address and the callData of the proposals you wish to enact, should this Voting pass.
      The voting threshold. The threshold must be expressed as an integer between 1 and 10000, representing a double digit percentage of the total supply of the voting tokens, with the comma shifted two digits to the right.
 2. Cast votes.
 3. You can cancel your vote at any time and recover your voting tokens.
 4. Validate the threshold. If the voting threshold is met the voting proposal passes.
 5. Enact the proposal.
