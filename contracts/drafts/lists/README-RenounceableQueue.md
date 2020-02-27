# Lists

This is an Ethereum project that implements a queue with random extraction (https://en.wikipedia.org/wiki/Linked_list).

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

# Usage

High performance implementation of a Doubly Linked List based on a dynamic array and without structs. It only allows inserting by the head and suffers from some fragmentation which can be managed.

`RenounceableQueue.sol`:
* constructor: Creates an empty list.
* `function get(uint256 _id)`: Retrieves the Object denoted by `_id`.
* `function next(uint256 _id)`: Given an Object, denoted by `_id`, returns (true, id) for the Object it points to, or (false, 0) if `_id` refers to the Tail.
* `function prev(uint256 _id)`: Given an Object, denoted by `_id`, returns (true, id) for the Object that points to it, or (false, 0) if `_id` refers to the Head.
* `function find(address _data)`: Return the id of the first Object matching `_data`.
* `function addHead(address _data)`: Insert a new Object as the new Head with `_data` as payload.
* `function remove(uint256 _id)`: Remove the Object denoted by `_id` from the List.