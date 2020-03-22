pragma solidity ^0.6.0;
import "@openzeppelin/contracts/access/Ownable.sol";


/**
 * @title LinkedListElement
 * @dev Each list element for LinkedListOOP
 * @author Alberto Cuesta Cañada
 */
contract LinkedListElement is Ownable {
    LinkedListElement public next;
    address public data;

    /**
     * @dev The LinkedListElement is created with just an address payload as data.
     */
    constructor(address _data) public Ownable()
    {
        data = _data;
        emit NewElement(address(this), data);
    }

    /**
     * @dev The LinkedListElement can only be linked by the contract that created it.
     */
    function setNext(LinkedListElement _next) public virtual onlyOwner
    {
        next = _next;
        emit NextSet(address(this), address(next));
    }

    event NewElement(address element, address data);
    event NextSet(address element, address next);
}