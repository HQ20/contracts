pragma solidity ^0.6.0;


/**
 * @title LinkedList
 * @dev Data structure
 * @author Alberto Cuesta Cañada
 */
contract LinkedList {

    event ObjectCreated(uint256 id, address data);
    event ObjectsLinked(uint256 prev, uint256 next);
    event ObjectRemoved(uint256 id);
    event NewHead(uint256 id);

    struct Object{
        uint256 id;
        uint256 next;
        address data;
    }

    uint256 public head;
    uint256 public idCounter;
    mapping (uint256 => Object) public objects;

    /**
     * @dev Creates an empty list.
     */
    constructor() public {
        head = 0;
        idCounter = 1;
    }

    /**
     * @dev Retrieves the Object denoted by `_id`.
     */
    function get(uint256 _id)
        public
        virtual
        view
        returns (uint256, uint256, address)
    {
        Object memory object = objects[_id];
        return (object.id, object.next, object.data);
    }

    /**
     * @dev Given an Object, denoted by `_id`, returns the id of the Object that points to it, or 0 if `_id` refers to the Head.
     */
    function findPrevId(uint256 _id)
        public
        virtual
        view
        returns (uint256)
    {
        if (_id == head) return 0;
        Object memory prevObject = objects[head];
        while (prevObject.next != _id) {
            prevObject = objects[prevObject.next];
        }
        return prevObject.id;
    }

    /**
     * @dev Returns the id for the Tail.
     */
    function findTailId()
        public
        virtual
        view
        returns (uint256)
    {
        Object memory oldTailObject = objects[head];
        while (oldTailObject.next != 0) {
            oldTailObject = objects[oldTailObject.next];
        }
        return oldTailObject.id;
    }

    /**
     * @dev Return the id of the first Object matching `_data` in the data field.
     */
    function findIdForData(address _data)
        public
        virtual
        view
        returns (uint256)
    {
        Object memory object = objects[head];
        while (object.data != _data) {
            object = objects[object.next];
        }
        return object.id;
    }

    /**
     * @dev Insert a new Object as the new Head with `_data` in the data field.
     */
    function addHead(address _data)
        public
        virtual
    {
        uint256 objectId = _createObject(_data);
        _link(objectId, head);
        _setHead(objectId);
    }

    /**
     * @dev Insert a new Object as the new Tail with `_data` in the data field.
     */
    function addTail(address _data)
        public
        virtual
    {
        if (head == 0) {
            addHead(_data);
        }
        else {
            uint256 oldTailId = findTailId();
            uint256 newTailId = _createObject(_data);
            _link(oldTailId, newTailId);
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
        if (head == _id) {
            _setHead(removeObject.next);
        }
        else {
            uint256 prevObjectId = findPrevId(_id);
            _link(prevObjectId, removeObject.next);
        }
        delete objects[removeObject.id];
        emit ObjectRemoved(_id);
    }

    /**
     * @dev Insert a new Object after the Object denoted by `_id` with `_data` in the data field.
     */
    function insertAfter(uint256 _prevId, address _data)
        public
        virtual
    {
        Object memory prevObject = objects[_prevId];
        uint256 newObjectId = _createObject(_data);
        _link(newObjectId, prevObject.next);
        _link(prevObject.id, newObjectId);
    }

    /**
     * @dev Insert a new Object before the Object denoted by `_id` with `_data` in the data field.
     */
    function insertBefore(uint256 _nextId, address _data)
        public
        virtual
    {
        if (_nextId == head) {
            addHead(_data);
        }
        else {
            uint256 prevId = findPrevId(_nextId);
            insertAfter(prevId, _data);
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
     * @dev Internal function to create an unlinked Object.
     */
    function _createObject(address _data)
        internal
        returns (uint256)
    {
        uint256 newId = idCounter;
        idCounter += 1;
        Object memory object = Object(newId, 0, _data);
        objects[object.id] = object;
        emit ObjectCreated(
            object.id,
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
        objects[_prevId].next = _nextId;
        emit ObjectsLinked(_prevId, _nextId);
    }
}
