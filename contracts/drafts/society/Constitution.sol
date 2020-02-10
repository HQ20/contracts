pragma solidity ^0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "./Terms.sol";


/**
 * @title Constitution
 * @notice Implements the consitution of a society enshrined by a founding father.
 */
contract Constitution {

    using EnumerableSet for EnumerableSet.AddressSet;

    address public terms;
    EnumerableSet.AddressSet public adoptiveSocieties;

    /**
    * @notice The constructor for the constitution of a society.
    * @param _terms The terms contract of the constitution.
    */
    constructor(address _terms) public {
        terms = _terms;
        Terms(_terms).adoptFor(address(this));
    }

    function enshrine(address society) public {
        adoptiveSocieties.add(society);
    }

    // TODO: constitution functions

}