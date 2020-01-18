pragma solidity ^0.5.10;
import "../EnumerableSet.sol";


/**
 * @title EnumerableSetMock
 * @dev Data structure
 * @author Alberto Cuesta Cañada
 */
contract EnumerableSetMock{

    using EnumerableSet for EnumerableSet.Set;

    EnumerableSet.Set private set;

    constructor() public {
        set = EnumerableSet.Set();
    }

    /**
     * @dev Returns true if the item is in the set.
     */
    function testContains(address item)
        public
        view
        returns (bool)
    {
        return EnumerableSet.contains(set, item);
    }

    /**
     * @dev Insert an item as the new tail.
     */
    function testAppend(address item)
        public
    {
        EnumerableSet.append(set, item);
    }

    /**
     * @dev Remove an item.
     */
    function testRemove(address remove)
        public
    {
        EnumerableSet.remove(set, remove);
    }

    /**
     * @dev Insert an item as the new head.
     */
    function testPrepend(address item)
        public
    {
        EnumerableSet.prepend(set, item);
    }

    /**
     * @dev Return the number of items in the set.
     */
    function testLength()
        public
        view
        returns (uint256)
    {
        return EnumerableSet.length(set);
    }

    /**
     * @dev Return an array with all items in the set, from Head to Tail.
     */
    function testEnumerate()
        public
        view
        returns (address[] memory)
    {
        return EnumerableSet.enumerate(set);
    }

    /**
     * @dev Insert an item between another two.
     */
    /* function testInsert(address prev, address insert, address next)
        public
    {
        EnumerableSet._insert(set, prev, insert, next);
    } */

    /**
     * @dev Internal function to update the Head pointer.
     */
    /* function testSetHead(address item)
        public
    {
        EnumerableSet._setHead(set, item);
    } */

    /**
     * @dev Internal function to update the Tail pointer.
     */
    /* function testSetTail(address item)
        public
    {
        EnumerableSet._setTail(set, item);
    } */

    /**
     * @dev Return a set head.
     */
    function testHead()
        public
        view
        returns (address)
    {
        return EnumerableSet.head(set);
    }

    /**
     * @dev Return a set tail.
     */
    function testTail()
        public
        view
        returns (address)
    {
        return EnumerableSet.tail(set);
    }

    /**
     * @dev Return the next item to the given one.
     */
    function testNext(address item)
        public
        view
        returns (address)
    {
        return set.next[item];
    }

    /**
     * @dev Return the previous item to the given one.
     */
    function testPrev(address item)
        public
        view
        returns (address)
    {
        return set.prev[item];
    }
}
