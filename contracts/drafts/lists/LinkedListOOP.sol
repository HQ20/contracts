pragma solidity ^0.5.10;
import "./LinkedListElement.sol";


/**
 * @title LinkedListOOP
 * @dev Data structure
 * @author Alberto Cuesta Cañada
 */
contract LinkedListOOP {
    LinkedListElement public head;

    constructor() public
    {}

    function addHead(address _data) public
    {
        LinkedListElement newElement = new LinkedListElement(_data);
        newElement.setNext(head);
        head = newElement;
        emit HeadSet(address(head));
    }

    function insertAfter(address _prevElement, address _data) public
    {
        LinkedListElement newElement = new LinkedListElement(_data);
        LinkedListElement prevElement = LinkedListElement(_prevElement);
        LinkedListElement nextElement = prevElement.next();
        newElement.setNext(nextElement);
        prevElement.setNext(newElement);
    }

    function removeAfter(address _prevElement) public
    {
        LinkedListElement prevElement = LinkedListElement(_prevElement);
        LinkedListElement delElement = prevElement.next();
        LinkedListElement nextElement = delElement.next();

        prevElement.setNext(nextElement);
        // Implement a function on delElement to selfdestruct
    }

    function findFirst(address _data) public view returns (address)
    {
        LinkedListElement currentElement = head;
        while (
            address(currentElement) != address(0) &&
            currentElement.data() != _data
        ) {
            currentElement = currentElement.next();
        }
        return address(currentElement);
    }

    event HeadSet(address head);
}
