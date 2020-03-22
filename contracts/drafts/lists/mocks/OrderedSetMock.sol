pragma solidity ^0.6.0;
import "../OrderedSet.sol";


/**
 * @title OrderedSetMock
 * @dev Data structure
 * @author Alberto Cuesta Cañada
 */
contract OrderedSetMock{

    using OrderedSet for OrderedSet.Set;

    OrderedSet.Set private set;

    constructor() public {
        set = OrderedSet.Set();
    }

    function testContains(address item)
        public
        view
        returns (bool)
    {
        return OrderedSet.contains(set, item);
    }

    function testAppend(address item)
        public
    {
        OrderedSet.append(set, item);
    }

    function testRemove(address remove)
        public
    {
        OrderedSet.remove(set, remove);
    }

    function testPrepend(address item)
        public
    {
        OrderedSet.prepend(set, item);
    }

    function testLength()
        public
        view
        returns (uint256)
    {
        return OrderedSet.length(set);
    }

    function testEnumerate()
        public
        view
        returns (address[] memory)
    {
        return OrderedSet.enumerate(set);
    }

    function testHead()
        public
        view
        returns (address)
    {
        return OrderedSet.head(set);
    }

    function testTail()
        public
        view
        returns (address)
    {
        return OrderedSet.tail(set);
    }

    function testNext(address item)
        public
        view
        returns (address)
    {
        return set.next[item];
    }

    function testPrev(address item)
        public
        view
        returns (address)
    {
        return set.prev[item];
    }
}
