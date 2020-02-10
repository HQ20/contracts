pragma solidity ^0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "./Bank.sol";
import "./Constitution.sol";
import "./Executive.sol";
import "./Judiciary.sol";
import "./Legislative.sol";



/**
 * @title Society
 * @notice Implements a society established by a founding father which becomes its first citizen, enshrining a constitution and organizing a bank. Aspiring or leaving citizens must meet the conditions of the constitution at that time of their acceptance or resignation. Citizens can acquire extraordinary qualities such as debaters, executors or jurors by virtue of election by the majority decided through the mechanism provisioned by the constitution. The society will self-destruct if all citizens leave.
 */
contract Society is Branch {

    address public bank;
    address public executive;
    address public judiciary;
    address public legislative;

    /**
     * @notice Constructor for society. Must be called by the founding father who will provide a constitution and a bank.
     * @param _constitution The Constitution contract adopted for this society
     * @param _bank The bank of the society. Must be in "OPEN" state.
     */
    constructor(
        address _constitution,
        address _bank
    ) public Branch(_constitution, address(this)) {
        bank = _bank;
        require(Bank(_bank).currentState == "OPEN");
        this.hire(msg.sender);
    }

    function openExecutive(address _constitution) public onlyOwner {
        executive = address(new Executive(_constitution, address(this)));
    }

    function openLegislative(address _constitution) public onlyOwner {
        legislative = address(new Legislative(_constitution, address(this)));
    }

    function openJudiciary(address _constitution) public onlyOwner {
        judiciary = address(new Judiciary(_constitution, address(this)));
    }
}