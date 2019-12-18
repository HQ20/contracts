pragma solidity ^0.5.10;
import "./LinkedListOOP.sol";


/**
 * @title LinkedListOOPTest
 * @dev Data structure
 * @author Alberto Cuesta Cañada
 */
contract TestLinkedListOOP is LinkedListOOP {

    function findFirstWithGas(address _data) public returns (address)
    {
        emit ViewToTransaction();
        return findFirst(_data);
    }

    event ViewToTransaction();
}
