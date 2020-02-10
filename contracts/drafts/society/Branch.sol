pragma solidity ^0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "./Society.sol";
import "./Bill.sol";


/**
 * @title Branch
 * @notice Implements a branch of society.
 */
contract Branch {

    using EnumerableSet for EnumerableSet.AddressSet;
    using SafeMath for uint256;

    EnumerableSet.AddressSet public members;
    EnumerableSet.AddressSet public bills;
    EnumerableSet.AddressSet public vetters;

    address constitution;
    address society;

    constructor(address _constitution, address _society) public {
        constitution = _constitution;
        society = _society;
        vetters.add(society);
        members.add(address(this));
        consitution.enshrine(address(this));
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
        bills.add(new Bill(issue, address(this)));
        return bills.length();
    }

    function draft(address bill, bytes article, uint256 amount) public onlyMembers returns (uint8) {
        require(bills.contains(bill), "Cannot add articles to bill which has not been proposed.");
        return Bill(bill).write(article, amount);
    }

    function vote(address bill, uint8 paragraph) public payable onlyMembers {
        // TODO: add money for the cause
    }

    function count(address bill, uint8 paragraph) public returns (bool) {
        // TODO: meet the consitution's terms
    }

    function sign(address bill, uint8 paragraph) public onlyMembers {
        require(count(bill, paragraph), "Not enough votes yet.");
        Bill(bill).sign.value((Bill(bill).amounts())[paragraph])(paragraph);
    }

    function hire(address citizen) public {
        Terms terms = Terms(Constitution(_constitution).terms());
        if (terms.conditions[uint8(terms.Condition.ENTER)][uint8(terms.Property.TYPE)] == terms.ConditionType.MECHANISM) {
            address hiringVetter = Branch(Bill(msg.sender).vetter);
            require(vetters.contains(hiringVetter) , "Not in a position to hire.");
        } else if (terms.conditions[uint8(terms.Condition.ENTER)][uint8(terms.Property.TYPE)] == terms.ConditionType.TAXABLE) {
            require(Bank(society.bank).transferFrom(citizen, address(this), terms.conditions[uint8(terms.Condition.ENTER)][uint8(terms.Property.PARAMETER)]), "Not enough money to enter.");
        }
        members.add(citizen);
    }

    function fire(address citizen) public {
        Terms terms = Terms(Constitution(_constitution).terms());
        if (terms.conditions[uint8(terms.Condition.LEAVE)][uint8(terms.Property.TYPE)] == terms.ConditionType.MECHANISM) {
            address firingVetter = Branch(Bill(msg.sender).vetter);
            require(vetters.contains(firingVetter) , "Not in a position to hire.");
        } else if (terms.conditions[uint8(terms.Condition.LEAVE)][uint8(terms.Property.TYPE)] == terms.ConditionType.TAXABLE) {
            require(Bank(society.bank).transferFrom(citizen, address(this), terms.conditions[uint8(terms.Condition.LEAVE)][uint8(terms.Property.PARAMETER)]), "Not enough money to leave.");
        }
        members.remove(citizen);
    }
}