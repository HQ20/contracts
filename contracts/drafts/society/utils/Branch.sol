pragma solidity ^0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "../Society.sol";
import "./Bill.sol";
import "./Bank.sol";
import "../foundations/Terms.sol";
import "../foundations/Constitution.sol";


/**
 * @title Branch
 * @notice Implements a branch of society.
 */
contract Branch is Ownable {

    using EnumerableSet for EnumerableSet.AddressSet;
    using SafeMath for uint256;

    EnumerableSet.AddressSet members;
    EnumerableSet.AddressSet bills;
    EnumerableSet.AddressSet vetters;

    address constitution;
    address payable society;

    constructor(
        address _constitution,
        address payable _society
    ) Ownable() public {
        constitution = _constitution;
        society = _society;
        vetters.add(society);
        members.add(address(this));
        Constitution(constitution).enshrine(address(this));
    }

    function() external payable {}

    modifier onlyMembers {
        require(members.contains(msg.sender), "Not a member.");
        _;
    }

    function addVetter(address vetter) public onlyOwner returns (bool){
        return vetters.add(vetter);
    }

    function propose(address issue) public onlyMembers returns (uint256) {
        bills.add(address(new Bill(issue, address(this))));
        return bills.length();
    }

    function draft(
        address bill,
        bytes memory article,
        uint256 amount
    ) public onlyMembers returns (uint256) {
        require(
            bills.contains(bill),
            "Cannot add articles to bill which has not been proposed."
        );
        return Bill(bill).write(article, amount);
    }

    function vote(address bill, uint256 paragraph) public payable onlyMembers {
        // TODO: add money for the cause
    }

    function count(address bill, uint256 paragraph) public returns (bool) {
        // TODO: meet the consitution's terms
    }

    function sign(address bill, uint256 paragraph) public onlyMembers {
        require(count(bill, paragraph), "Not enough votes yet.");
        Bill(bill).sign.value(Bill(bill).amounts(paragraph))(paragraph);
    }

    function hire(address citizen) public {
        Terms terms = Terms(Constitution(constitution).terms());
        // enter condition is mechanism
        if (terms.conditions(0, 0) == 0) {
            address hiringVetter = address(Branch(address(uint160(Bill(msg.sender).vetter()))));
            require(vetters.contains(hiringVetter), "Not in a position to hire.");
        } else
        // enter condition is taxable
        if (terms.conditions(0, 0) == 1) {
            // transfer from citizen enter condition tax
            require(
                Bank(Society(society).bank()).transferFrom(citizen, address(this), terms.conditions(0, 1)),
                "Not enough money to enter."
            );
        }
        members.add(citizen);
    }

    function fire(address citizen) public {
        Terms terms = Terms(Constitution(constitution).terms());
        // leave condition is mechanism
        if (terms.conditions(1, 0) == 0) {
            address firingVetter = address(Branch(address(uint160(Bill(msg.sender).vetter()))));
            require(vetters.contains(firingVetter), "Not in a position to hire.");
        } else
        // leave condition is taxable
        if (terms.conditions(1, 0) == 1) {
            // trasnfer from citizen leave condition tax
            require(
                Bank(Society(society).bank()).transferFrom(citizen, address(this), terms.conditions(1, 1)),
                "Not enough money to leave."
            );
        }
        members.remove(citizen);
    }
}