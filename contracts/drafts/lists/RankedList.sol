pragma solidity ^0.6.0;


/**
 * @title RankedList
 * @dev Doubly linked list of ranked objects. The head will always have the highest rank and
 * elements will be ordered down towards the tail.
 * @author Alberto Cuesta Cañada
 */
contract RankedList {

    event ObjectCreated(uint256 id, uint256 rank, address data);
    event ObjectsLinked(uint256 prev, uint256 next);
    event ObjectRemoved(uint256 id);
    event NewHead(uint256 id);
    event NewTail(uint256 id);

    struct Object{
        uint256 id;
        uint256 next;
        uint256 prev;
        uint256 rank;
        address data;
    }

    uint256 public head;
    uint256 public tail;
    uint256 public idCounter;
    mapping (uint256 => Object) public objects;

    /**
     * @dev Creates an empty list.
     */
    constructor() public {
        head = 0;
        tail = 0;
        idCounter = 1;
    }

    /**
     * @dev Retrieves the Object denoted by `_id`.
     */
    function get(uint256 _id)
        public
        virtual
        view
        returns (uint256, uint256, uint256, uint256, address)
    {
        Object memory object = objects[_id];
        return (object.id, object.next, object.prev, object.rank, object.data);
    }

    /**
     * @dev Return the id of the first Object with a lower or equal rank, starting from the head.
     */
    function findRank(uint256 _rank)
        public
        virtual
        view
        returns (uint256)
    {
        Object memory object = objects[head];
        while (object.rank > _rank) {
            object = objects[object.next];
        }
        return object.id;
    }

    /**
     * @dev Insert the object immediately before the one with the closest lower rank.
     * WARNING: This method loops through the whole list before inserting, and therefore limits the
     * size of the list to a few tens of thousands of objects before becoming unusable. For a scalable
     * contract make _insertBefore public but check prev and next on insertion.
     */
    function insert(uint256 _rank, address _data)
        public
        virtual
    {
        uint256 nextId = findRank(_rank);
        if (nextId == 0) {
            _addTail(_rank, _data);
        }
        else {
            _insertBefore(nextId, _rank, _data);
        }
    }

    /**
     * @dev Remove the Object denoted by `_id` from the List.
     */
    function remove(uint256 _id)
        public
        virtual
    {
        Object memory removeObject = objects[_id];
        if (head == _id && tail == _id) {
            _setHead(0);
            _setTail(0);
        }
        else if (head == _id) {
            _setHead(removeObject.next);
            objects[removeObject.next].prev = 0;
        }
        else if (tail == _id) {
            _setTail(removeObject.prev);
            objects[removeObject.prev].next = 0;
        }
        else {
            _link(removeObject.prev, removeObject.next);
        }
        delete objects[removeObject.id];
        emit ObjectRemoved(_id);
    }

    /**
     * @dev Insert a new Object as the new Head with `_data` in the data field.
     */
    function _addHead(uint256 _rank, address _data)
        internal
    {
        uint256 objectId = _createObject(_rank, _data);
        _link(objectId, head);
        _setHead(objectId);
        if (tail == 0) _setTail(objectId);
    }

    /**
     * @dev Insert a new Object as the new Tail with `_data` in the data field.
     */
    function _addTail(uint256 _rank, address _data)
        internal
    {
        if (head == 0) {
            _addHead(_rank, _data);
        }
        else {
            uint256 objectId = _createObject(_rank, _data);
            _link(tail, objectId);
            _setTail(objectId);
        }
    }

    /**
     * @dev Insert a new Object after the Object denoted by `_id` with `_data` in the data field.
     */
    function _insertAfter(uint256 _prevId, uint256 _rank, address _data)
        internal
    {
        if (_prevId == tail) {
            _addTail(_rank, _data);
        }
        else {
            Object memory prevObject = objects[_prevId];
            Object memory nextObject = objects[prevObject.next];
            uint256 newObjectId = _createObject(_rank, _data);
            _link(newObjectId, nextObject.id);
            _link(prevObject.id, newObjectId);
        }
    }

    /**
     * @dev Insert a new Object before the Object denoted by `_id` with `_data` in the data field.
     */
    function _insertBefore(uint256 _nextId, uint256 _rank, address _data)
        internal
    {
        if (_nextId == head) {
            _addHead(_rank, _data);
        }
        else {
            _insertAfter(objects[_nextId].prev, _rank, _data);
        }
    }

    /**
     * @dev Internal function to update the Head pointer.
     */
    function _setHead(uint256 _id)
        internal
    {
        head = _id;
        emit NewHead(_id);
    }

    /**
     * @dev Internal function to update the Tail pointer.
     */
    function _setTail(uint256 _id)
        internal
    {
        tail = _id;
        emit NewTail(_id);
    }

    /**
     * @dev Internal function to create an unlinked Object.
     */
    function _createObject(uint256 _rank, address _data)
        internal
        returns (uint256)
    {
        uint256 newId = idCounter;
        idCounter += 1;
        Object memory object = Object(
            newId,
            0,
            0,
            _rank,
            _data
        );
        objects[object.id] = object;
        emit ObjectCreated(
            object.id,
            object.rank,
            object.data
        );
        return object.id;
    }

    /**
     * @dev Internal function to link an Object to another.
     */
    function _link(uint256 _prevId, uint256 _nextId)
        internal
    {
        if (_prevId != 0 && _nextId != 0) {
            objects[_prevId].next = _nextId;
            objects[_nextId].prev = _prevId;
            emit ObjectsLinked(_prevId, _nextId);
        }
    }
}
