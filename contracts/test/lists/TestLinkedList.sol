pragma solidity ^0.6.0;
import "./../../lists/LinkedList.sol";


/**
 * @title TestLinkedList
 * @dev Data structure
 * @author Alberto Cuesta Cañada
 */
contract TestLinkedList is LinkedList {

    /**
     * @dev Creates an empty list.
     */
    constructor() public LinkedList() {
    }

    /**
     * @dev Returns the id for the Tail, forcing a transaction.
     */
    function findTailIdWithGas()
        public
        returns (uint256)
    {
        emit ViewToTransaction();
        return findTailId();
    }

    event ViewToTransaction();
}
