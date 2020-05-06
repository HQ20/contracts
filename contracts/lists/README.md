# Lists

This is an Ethereum project that implements singly and doubly linked lists (https://en.wikipedia.org/wiki/Linked_list).

For a longer explanation of some of the contracts here, [please read this article](https://medium.com/coinmonks/a-linked-list-implementation-for-ethereum-a2915bf8122f?source=friends_link&sk=be8889a651eed8193b1c4421a50484dd).

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

`LinkedList.sol`: Singly Linked List.
* constructor: Creates an empty list.
* `function get(uint256 _id)`: Retrieves the Object denoted by `_id`.
* `function findPrevId(uint256 _id)`: Given an Object, denoted by `_id`, returns the id of the Object that points to it, or 0 if `_id` refers to the Head. Method not available for `DoubleLinkedList.sol`, please use `get(_id).prev` instead.
* `function findTailId()`: Returns the id for the Tail.
* `function findIdForData(address _data)`: Return the id of the first Object matching `_data` in the data field.
* `function addHead(address _data)`: Insert a new Object as the new Head with `_data` in the data field.
* `function addTail(address _data)`: Insert a new Object as the new Tail with `_data` in the data field.
* `function remove(uint256 _id)`: Remove the Object denoted by `_id` from the List.
* `function insertAfter(uint256 _prevId, address _data)`: Insert a new Object after the Object denoted by `_id` with `_data` in the data field.
* `function insertBefore(uint256 _nextId, address _data)`: Insert a new Object before the Object denoted by `_id` with `_data` in the data field.
* `function _setHead(uint256 _id)`: Internal function to update the Head pointer.
* `function _createObject(address _data)`: Internal function to create an unlinked Object.
* `function _link(uint256 _prevId, uint256 _nextId)`: Internal function to link an Object to another.

`DoubleLinkedList.sol`: Doubly Linked List.
* constructor: Creates an empty list.
* `function get(uint256 _id)`: Retrieves the Object denoted by `_id`.
* `function findIdForData(address _data)`: Return the id of the first Object matching `_data` in the data field.
* `function addHead(address _data)`: Insert a new Object as the new Head with `_data` in the data field.
* `function addTail(address _data)`: Insert a new Object as the new Tail with `_data` in the data field.
* `function remove(uint256 _id)`: Remove the Object denoted by `_id` from the List.
* `function insertAfter(uint256 _prevId, address _data)`: Insert a new Object after the Object denoted by `_id` with `_data` in the data field.
* `function insertBefore(uint256 _nextId, address _data)`: Insert a new Object before the Object denoted by `_id` with `_data` in the data field.
* `function _setHead(uint256 _id)`: Internal function to update the Head pointer.
* `function _createObject(address _data)`: Internal function to create an unlinked Object.
* `function _link(uint256 _prevId, uint256 _nextId)`: Internal function to link an Object to another.

