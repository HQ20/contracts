# OneTokenOneVote

## Description

A voting contract that can be used for registering proposals, casting votes, validating the majority and enacting the proposals. A proposal consists in calling some data (a function signature and encoded arguments) on a contract's address.

## Usage

 1. Initialize the voting with:
      The address of the contract that will be used as a voting token.
      The address of the target contract for a proposal to be enacted.
      The proposal data, obtained as an abi encoding of a function in the target contract with any desired arguments.
      The voting threshold. The threshold must be expressed as an integer between 1 and 10000, representing a double digit percentage of the total supply of the voting tokens, with the comma shifted two digits to the right.
 2. Cast votes.
 3. You can cancel your vote at any time and recover your voting tokens.
 4. Validate the threshold. If the voting threshold is met the voting proposal passes. A voting can be validated any number of times, but once the validation is successful the voting is considered successful forever.
 5. Enact the proposal. There is no limit to how many times the proposal can be enacted from one successful vote.
