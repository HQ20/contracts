pragma solidity ^0.5.10;


/**
 * @title EnumerableSet
 * @dev Data structure
 * @author Alberto Cuesta Cañada
 */
library EnumerableSet {

    event ItemInserted(address prev, address inserted, address next);
    event ItemRemoved(address removed);
    event NewHead(address item);
    event NewTail(address item);

    struct Set {
        address head;
        address tail;
        mapping (address => address) next;
        mapping (address => address) prev;
    }

    /**
     * @dev Insert an item as the new tail.
     */
    function append(Set storage set, address item)
        public
    {
        _insert(set, set.tail, item, address(0));
    }

    /**
     * @dev Insert an item as the new head.
     */
    function prepend(Set storage set, address item)
        public
    {
        _insert(set, address(0), item, set.head);
    }

    /**
     * @dev Remove an item.
     */
    function remove(Set storage set, address item)
        public
    {
        require(
            item != address(0),
            "EnumerableSet: Cannot remove the empty address"
        );
        require(
            contains(set, item) == true,
            "EnumerableSet: Cannot remove a non existing item"
        );
        if (set.next[item] == address(0))
            _setTail(set, set.prev[item]);
        if (set.prev[item] == address(0))
            _setHead(set, set.next[item]);
        set.next[set.prev[item]] = set.next[item];
        set.prev[set.next[item]] = set.prev[item];
        delete set.next[item];
        delete set.prev[item];
        emit ItemRemoved(item);
    }

    /**
     * @dev Returns true if the item is in the set.
     */
    function contains(Set storage set, address item)
        public
        view
        returns (bool)
    {
        return set.head == item ||
            set.next[item] != address(0) ||
            set.prev[item] != address(0);
    }

    /**
     * @dev Return the number of items in the set.
     */
    function length(Set storage set)
        public
        view
        returns (uint256)
    {
        uint256 count = 0;
        address item = set.head;
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
        public
        view
        returns (address[] memory)
    {
        address[] memory items = new address[](length(set));
        uint256 count = 0;
        address item = set.head;
        while (item != address(0)) {
            items[count] = item;
            count += 1;
            item = set.next[item];
        }
        return items;
    }

    /**
     * @dev Insert an item between another two.
     */
    function _insert(Set storage set, address prev_, address item, address next_)
        internal
    {
        require(
            item != address(0),
            "EnumerableSet: Cannot insert the empty address"
        );
        require(
            contains(set, item) == false,
            "EnumerableSet: Cannot insert an existing item"
        );
        if (prev_ == address(0))
            _setHead(set, item);
        if (next_ == address(0))
            _setTail(set, item);
        set.next[prev_] = item;
        set.next[item] = next_;
        set.prev[next_] = item;
        set.prev[item] = prev_;
        emit ItemInserted(prev_, item, next_);
    }

    /**
     * @dev Internal function to update the Head pointer.
     */
    function _setHead(Set storage set, address item)
        internal
    {
        set.head = item;
        emit NewHead(item);
    }

    /**
     * @dev Internal function to update the Tail pointer.
     */
    function _setTail(Set storage set, address item)
        internal
    {
        set.tail = item;
        emit NewTail(item);
    }
}
