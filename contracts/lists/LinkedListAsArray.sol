pragma solidity ^0.5.0;


/**
 * @title LinkedListAsArray
 * @dev Doubly Linked List tweaked for performance. Only allows adding at the Head.
 * @author Alberto Cuesta Cañada
 */
contract LinkedListAsArray {

    event ObjectCreated(uint256 id, address data);
    event ObjectRemoved(uint256 id);
    event NewHead(uint256 id);
    event NewTail(uint256 id);

    uint256 public head;
    uint256 public tail;
    address[] public objects;

    /**
     * @dev Creates an empty list.
     */
    constructor() public {
        head = 0;
        tail = 0;
    }

    /**
     * @dev Returns the id of the next element, or 0 if `_id` refers to the Tail.
     */
    function next(uint256 _id)
        public
        view
        returns (bool, uint256)
    {
        while (_id > tail) {
            if (objects[_id - 1] != address(0)) return (true, _id - 1);
            else _id -= 1;
        }
        return (false, 0);
    }

    /**
     * @dev Returns the id of the previous element, or 0 if `_id` refers to the Head.
     */
    function prev(uint256 _id)
        public
        view
        returns (bool, uint256)
    {
        while (_id < head) {
            if (objects[_id + 1] != address(0)) return (true, _id + 1);
            else _id += 1;
        }
        return (false, 0);
    }

    /**
     * @dev Retrieves the data of the element denoted by `_id`.
     */
    function get(uint256 _id)
        public
        view
        returns (address)
    {
        return objects[_id];
    }

    /**
     * @dev Return the id of the first element that matches `_data`.
     */
    function find(address _data)
        public
        view
        returns (bool, uint256)
    {
        uint256 i = tail;
        while (i <= head) {
            if (objects[i] == _data) return (true, i);
            else i += 1;
        }
        return (false, 0);
    }

    /**
     * @dev Insert a new element as the new Head containing `_data`.
     */
    function addHead(address _data)
        public
    {
        head = objects.push(_data) - 1;
        emit ObjectCreated(head, _data);
        emit NewHead(head);
    }

    /**
     * @dev Remove the element denoted by `_id` from the List.
     */
    function remove(uint256 _id)
        public
    {
        if (_id == head) {
            (,head) = next(head);
            emit NewHead(head);
        }
        if (_id == tail) {
            (,tail) = prev(tail);
            emit NewTail(tail);
        }
        delete objects[_id];
        emit ObjectRemoved(_id);
    }
}