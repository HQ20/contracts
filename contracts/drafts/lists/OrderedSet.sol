pragma solidity ^0.6.0;


/**
 * @title OrderedSet
 * @dev Data structure. It has the properties of a mapping for addresses, but members are ordered
 * and can be enumerated. Items can be inserted only at the head or the tail, but can be removed
 * from anywhere. Append, prepend, remove and contains are O(1). Length and enumerate O(N). InsertAfter
 * and insertBefore could be implemented at O(1).
 * @author Alberto Cuesta Cañada
 */
library OrderedSet {

    event ItemInserted(address prev, address inserted, address next);
    event ItemRemoved(address removed);

    struct Set {
        mapping (address => address) next;
        mapping (address => address) prev;
    }

    /**
     * @dev Insert an item as the new tail.
     */
    function append(Set storage set, address item)
        internal
    {
        _insert(
            set,
            tail(set),
            item,
            address(0)
        );
    }

    /**
     * @dev Insert an item as the new head.
     */
    function prepend(Set storage set, address item)
        internal
    {
        _insert(
            set,
            address(0),
            item,
            head(set)
        );
    }

    /**
     * @dev Remove an item.
     */
    function remove(Set storage set, address item)
        internal
    {
        require(
            item != address(0),
            "OrderedSet: Cannot remove the empty address"
        );
        require(
            contains(set, item) == true,
            "OrderedSet: Cannot remove a non existing item"
        );
        set.next[set.prev[item]] = set.next[item];
        set.prev[set.next[item]] = set.prev[item];
        delete set.next[item];
        delete set.prev[item];
        emit ItemRemoved(item);
    }

    /**
     * @dev Returns the Head.
     */
    function head(Set storage set)
        internal
        view
        returns (address)
    {
        return set.next[address(0)];
    }

    /**
     * @dev Returns the Tail.
     */
    function tail(Set storage set)
        internal
        view
        returns (address)
    {
        return set.prev[address(0)];
    }

    /**
     * @dev Returns true if the item is in the set.
     */
    function contains(Set storage set, address item)
        internal
        view
        returns (bool)
    {
        return head(set) == item ||
            set.next[item] != address(0) ||
            set.prev[item] != address(0);
    }

    /**
     * @dev Return the number of items in the set.
     */
    function length(Set storage set)
        internal
        view
        returns (uint256)
    {
        uint256 count = 0;
        address item = head(set);
        while (item != address(0)) {
            count += 1;
            item = set.next[item];
        }
        return count;
    }

    /**
     * @dev Return an array with all items in the set, from Head to Tail.
     */
    function enumerate(Set storage set)
        internal
        view
        returns (address[] memory)
    {
        address[] memory items = new address[](length(set));
        uint256 count = 0;
        address item = head(set);
        while (item != address(0)) {
            items[count] = item;
            count += 1;
            item = set.next[item];
        }
        return items;
    }

    /**
     * @dev Insert an item between another two..
     */
    function _insert(
        Set storage set,
        address prev_,
        address item,
        address next_
    )
        private
    {
        require(
            item != address(0),
            "OrderedSet: Cannot insert the empty address"
        );
        require(
            contains(set, item) == false,
            "OrderedSet: Cannot insert an existing item"
        );
        set.next[prev_] = item;
        set.next[item] = next_;
        set.prev[next_] = item;
        set.prev[item] = prev_;
        emit ItemInserted(prev_, item, next_);
    }
}
