# Lists

This is an Ethereum project that implements a singly linked lists (https://en.wikipedia.org/wiki/Linked_list) using Object Oriented Principles. In this context a contract is considered to be an Object.

# Terminology
Element: Element are linked to each other and together they are a Linked List
Head: The first object in the list. No other object points to the head.
Tail: The last object in the list. The tail points to no other object.
Data: In this contract the data is an Ethereum address, which can be used for any purpose.

# Implementation
This implementation relies on a LinkedListOOP contract that uses a factory pattern to deploy LinkedListElement contracts. 

# Usage

`LinkedListOOP.sol`:
* constructor: Creates an empty list.
* `head()`: Retrieves the Object denoted by `_id`.
* `function addHead(address _data)`: Prepend a LinkedListElement at the head of this list with `_data` as payload.
* `function insertAfter(address _prevElement, address _data)`: Create a LinkedListElement after `_prevElement` with `_data` as payload.
* `function removeAfter(address _prevElement)`: Remove the element after `_prevElement` from the list.
* `function findFirst(address _data)`: Return the address of the first element matching `_data` in the payload.

`LinkedListElement.sol`:
* constructor `address _data`: Creates an element with `_data` as the payload and assigns the caller as owner.
* `data()`: Retrieves the address stored as payload.
* `next()`: Retrieves the address of the next element, or 0 if this element is the tail.
* `function setNext(address _next)`: Links this element to another one. Can only be called by the owning list contracts.
