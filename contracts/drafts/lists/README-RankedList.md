# Lists

This is an Ethereum project that implements an ranked doubly linked list (https://en.wikipedia.org/wiki/Linked_list).

# Terminology
Object: Objects are linked to each other and together they are a Linked List
Head: The first object in the list. No other object points to the head.
Tail: The last object in the list. The tail points to no other object.
Data: In this contract the data is an Ethereum address, which can be used for any purpose.

# Implementation
Solidity doesn't support recursive type references, as in:
```
struct Object {
    Object nextObject;
}
```
This renders a traditional implementation of Linked Lists impossible. In this implementation all Objects are given an id and stored in a mapping instead. This results in an extra inefficiency of doing an extra mapping lookup when following a link between objects.

## Usage

`RankedList.sol`: Doubly Linked List, sorted by `rank` descending from the head.
* constructor: Creates an empty list.
* `function get(uint256 _id)`: Retrieves the Object denoted by `_id`.
* `function findRank(uint256 _rank)`: Return the id of the first Object with a lower or equal `_rank`, starting from the head.
* `function insert(uint256 _rank, address _data)`: Insert a new Object immediately before the one with the closest lower `_rank`.
* `function remove(uint256 _id)`: Remove the Object denoted by `_id` from the List.
* `function _addHead(address _data)`: Insert a new Object as the new Head with `_data` in the data field.
* `function _addTail(address _data)`: Insert a new Object as the new Tail with `_data` in the data field.
* `function _insertAfter(uint256 _prevId, address _data)`: Insert a new Object after the Object denoted by `_id` with `_data` in the data field.
* `function _insertBefore(uint256 _nextId, address _data)`: Insert a new Object before the Object denoted by `_id` with `_data` in the data field.
* `function _setHead(uint256 _id)`: Internal function to update the Head pointer.
* `function _createObject(address _data)`: Internal function to create an unlinked Object.
* `function _link(uint256 _prevId, uint256 _nextId)`: Internal function to link an Object to another.

