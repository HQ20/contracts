pragma solidity ^0.6.0;
import "./LinkedListElement.sol";


/**
 * @title LinkedListOOP
 * @dev Data structure implementing a Singly Linked List following Object Oriented Programming principles.
 * @author Alberto Cuesta Cañada
 */
contract LinkedListOOP {
    LinkedListElement public head;

    /**
     * @dev The constructor is empty as of now.
     */
    constructor() public
    {}

    /**
     * @dev Prepend a LinkedListElement at the head of this list.
     */
    function addHead(address _data) public virtual
    {
        LinkedListElement create = new LinkedListElement(_data);
        create.setNext(head);
        head = create;
        emit HeadSet(address(head));
    }

    /**
     * @dev Create a LinkedListElement after the one passed as an address.
     */
    function insertAfter(address _prev, address _data) public virtual
    {
        LinkedListElement create = new LinkedListElement(_data);
        LinkedListElement prev = LinkedListElement(_prev);
        LinkedListElement next = prev.next();
        create.setNext(next);
        prev.setNext(create);
    }

    /**
     * @dev Remove the LinkedListElement after the one passed as an address.
     */
    function removeAfter(address _prev) public virtual
    {
        LinkedListElement prev = LinkedListElement(_prev);
        LinkedListElement del = prev.next();
        LinkedListElement next = del.next();

        prev.setNext(next);
        // Implement a function on del to selfdestruct
    }

    /**
     * Travel the list from the head and return the address of the first LinkedListElement with matching `_data`.
     */
    function findFirst(address _data) public virtual view returns (address)
    {
        LinkedListElement current = head;
        while (
            address(current) != address(0) &&
            current.data() != _data
        ) {
            current = current.next();
        }
        return address(current);
    }

    event HeadSet(address head);
}
