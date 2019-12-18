pragma solidity ^0.5.10;
import "@openzeppelin/contracts/ownership/Ownable.sol";


contract LinkedListElement is Ownable {
    LinkedListElement public next;
    address public data;

    constructor(address _data) public Ownable()
    {
        data = _data;
        emit NewElement(address(this), data);
    }

    function setNext(LinkedListElement _next) public onlyOwner
    {
        next = _next;
        emit NextSet(address(this), address(next));
    }

    event NewElement(address element, address data);
    event NextSet(address element, address next);
}