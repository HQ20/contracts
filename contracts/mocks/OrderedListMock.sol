pragma solidity ^0.5.10;
import "../lists/OrderedList.sol";


/**
 * @title OrderedListMock
 * @dev Data structure
 * @author Alberto Cuesta Cañada
 */
contract OrderedListMock is OrderedList{

    /**
     * @dev Insert a new Object as the new Head with `_data` in the data field.
     */
    function addHead(uint256 _rank, address _data)
        public
        returns (bool)
    {
        return super._addHead(_rank, _data);
    }

    /**
     * @dev Insert a new Object as the new Tail with `_data` in the data field.
     */
    function addTail(uint256 _rank, address _data)
        public
        returns (bool)
    {
        return super._addTail(_rank, _data);
    }

    /**
     * @dev Insert a new Object after the Object denoted by `_id` with `_data` in the data field.
     */
    function insertAfter(uint256 _prevId, uint256 _rank, address _data)
        public
        returns (bool)
    {
        return super._insertAfter(_prevId, _rank, _data);
    }

    /**
     * @dev Insert a new Object before the Object denoted by `_id` with `_data` in the data field.
     */
    function insertBefore(uint256 _nextId, uint256 _rank, address _data)
        public
        returns (bool)
    {
        return super._insertBefore(_nextId, _rank, _data);
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
