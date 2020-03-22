pragma solidity ^0.6.0;
import "../RankedList.sol";


contract RankedListMock is RankedList{


    function addHead(uint256 _rank, address _data)
        public
    {
        _addHead(_rank, _data);
    }

    function addTail(uint256 _rank, address _data)
        public
    {
        _addTail(_rank, _data);
    }

    function insertAfter(uint256 _prevId, uint256 _rank, address _data)
        public
    {
        _insertAfter(_prevId, _rank, _data);
    }

    function insertBefore(uint256 _nextId, uint256 _rank, address _data)
        public
    {
        _insertBefore(_nextId, _rank, _data);
    }

    function setHead(uint256 _id)
        public
    {
        _setHead(_id);
    }

    function setTail(uint256 _id)
        public
    {
        _setTail(_id);
    }

    function createObject(uint256 _rank, address _data)
        public
        returns (uint256)
    {
        return _createObject(_rank, _data);
    }

    function link(uint256 _prevId, uint256 _nextId)
        public
    {
        _link(_prevId, _nextId);
    }
}
