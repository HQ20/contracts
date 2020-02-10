pragma solidity ^0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "./Bank.sol";
import "./Citizen.sol";
import "./Constitution.sol";
import "./Executive.sol";
import "./Judiciary.sol";
import "./Legislative.sol";



/**
 * @title Society
 * @notice Implements a society established by a founding father which becomes its first citizen, enshrining a constitution and organizing a bank. Aspiring or leaving citizens must meet the conditions of the constitution at that time of their acceptance or resignation. Citizens can acquire extraordinary qualities such as debaters, executors or jurors by virtue of election by the majority decided through the mechanism provisioned by the constitution. The society will self-destruct if all citizens leave.
 */
contract Society is Ownable {

    using EnumerableSet for EnumerableSet.AddressSet;

    Bank public bank;
    Constitution public constitution;
    Executive public executive;
    Judiciary public judiciary;
    Legislative public legislative;
    EnumerableSet.AddressSet citizens;

    /**
     * @notice Constructor for society. Must be called by the founding father who will provide a constitution and a bank.
     */
    constructor(address _constitution, address _bank) Ownable() public {
        constitution = Constitution(_constitution);
        bank = Bank(_bank);
        require(bank.currentState == "LIVE");
        executive = new Executive();
        consitution.enshrine(address(this));
        citizens.add(this.owner());
    }

    function acquireCitizenship() public {
        if (Constitution.canEnter(msg.sender)){
            citizens.add(msg.sender);
        }
    }

    function renounceCitizenship() public {
        if (Constitution.canLeave(msg.sender)){
            citizens.remove(msg.sender);
        }
    }

}