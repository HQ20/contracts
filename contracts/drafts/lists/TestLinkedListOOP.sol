pragma solidity ^0.5.10;
import "./LinkedListOOP.sol";


/**
 * @title LinkedListOOPTest
 * @dev Test contract to find the gas use of TestLinkedList.findFirst(...) when used transactionally.
 * @author Alberto Cuesta Cañada
 */
contract TestLinkedListOOP is LinkedListOOP {

    /**
     * @dev Run `findFirst(...) transactionally.
     */
    function findFirstWithGas(address _data) public returns (address)
    {
        emit ViewToTransaction();
        return findFirst(_data);
    }

    event ViewToTransaction();
}
