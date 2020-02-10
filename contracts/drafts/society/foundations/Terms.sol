pragma solidity ^0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";


/**
 * @title Terms
 * @notice Implements the terms for deciding vote majorities, and conditions to be met at acceptance to and resignation from the society.
 */
contract Terms {
    using EnumerableSet for EnumerableSet.AddressSet;

    enum Property {
        TYPE,
        PARAMETER
    }

    enum Mechanism {
        STAKE,
        VOTE,
        SUFFRAGE,
        LIMITATION,
        MAJORITY
    }

    enum StakeType {
        EQUAL, // Can have 1 vote
        PROPORTIONAL // Can have many votes
    }

    enum VoteType {
        FREE, // Vote for free
        CENSITARY // Pay to vote
    }

    enum SuffrageType {
        VOLUNTARY, // Anyone may vote
        COMPULSORY // Anyone must vote
    }

    enum LimitationType {
        UNIVERSAL, // All vote
        LEGISLATIVE, // Legislatives vote
        JUDICIARY, // Judiciaries vote
        EXECUTIVE // Executives vote
    }

    enum MajorityType {
        PLURALITY, // Wins the proposal with the most votes of quorum
        SIMPLE, // Wins the proposal with at least (including) a percentage of the quorum
        QUALIFIED, // Wins the proposal with at least (excluding) a percentage of the quorum
        SIMPLE_ABSOLUTE, // Wins the proposal with a simple majority of the total population
        QUALIFIED_ABSOLUTE, // Wins the proposal with a qualified majority of the total population
        UNANIMOUS, // Wins the proposal with all the votes of the quorum
        VETO // Wins the proposal with all the votes of the total population
    }

    enum Condition {
        ENTER,
        LEAVE
    }

    enum ConditionType {
        MECHANISM, // Any new member must be approved using the constitution's mechanism of voting
        FREE, // Everybody can enter
        TAXABLE // Aspiring member must pay a tax in bank's tokens
    }

    mapping(uint8 => mapping(uint8 => uint256)) public mechanism;
    mapping(uint8 => mapping(uint8 => uint256)) public conditions;

    EnumerableSet.AddressSet adoptiveConstitutions;

    /**
    * @notice The constructor for the terms.
    * @param _mechanism The voting mechanism of the terms. The mechanism array must have exactly 10 elements, matching:
    * 0: uint256 stakeType,
    * 1: uint256 stakeProportion,
    * 2: uint256 voteType,
    * 3: uint256 votePrice,
    * 4: uint256 suffrageType,
    * 5: uint256 suffragePenalty,
    * 6: uint256 limitationType,
    * 7: uint256 limitationAmount,
    * 8: uint256 majorityType,
    * 9: uint256 majorityPercentage.
    * @param _conditions The conditions of the terms. The condition array must have exactly 4 elements, matching:
    * 0: uint256 enterType,
    * 1: uint256 enterParam,
    * 2: uint256 leaveType,
    * 3: uint256 leaveParam.
    */
    constructor(
        uint256[] memory _mechanism,
        uint256[] memory _conditions
    ) public {
        // solium-disable max-len
        mechanism[uint8(Mechanism.STAKE)][uint8(Property.TYPE)] = _mechanism[0];
        mechanism[uint8(Mechanism.STAKE)][uint8(Property.PARAMETER)] = _mechanism[1];
        mechanism[uint8(Mechanism.VOTE)][uint8(Property.TYPE)] = _mechanism[2];
        mechanism[uint8(Mechanism.VOTE)][uint8(Property.PARAMETER)] = _mechanism[3];
        mechanism[uint8(Mechanism.SUFFRAGE)][uint8(Property.TYPE)] = _mechanism[4];
        mechanism[uint8(Mechanism.SUFFRAGE)][uint8(Property.PARAMETER)] = _mechanism[5];
        mechanism[uint8(Mechanism.LIMITATION)][uint8(Property.TYPE)] = _mechanism[6];
        mechanism[uint8(Mechanism.LIMITATION)][uint8(Property.PARAMETER)] = _mechanism[7];
        mechanism[uint8(Mechanism.MAJORITY)][uint8(Property.TYPE)] = _mechanism[8];
        mechanism[uint8(Mechanism.MAJORITY)][uint8(Property.PARAMETER)] = _mechanism[9];
        conditions[uint8(Condition.ENTER)][uint8(Property.TYPE)] = _conditions[0];
        conditions[uint8(Condition.ENTER)][uint8(Property.PARAMETER)] = _conditions[1];
        conditions[uint8(Condition.LEAVE)][uint8(Property.TYPE)] = _conditions[2];
        conditions[uint8(Condition.LEAVE)][uint8(Property.PARAMETER)] = _conditions[3];
        // solium-enable max-len
    }

    function adoptFor(address constitution) public {
        adoptiveConstitutions.add(constitution);
    }
}