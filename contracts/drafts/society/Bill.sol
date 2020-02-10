pragma solidity ^0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";


/**
 * @title Bill
 * @notice Implements a bill regarding a certain issue to be treated in the manner of certain artciles of this bill
 */
contract Bill is Ownable {

    using SafeMath for uint8;

    address public issue;
    address public vetter;
    uint8 public paragraphs;
    mapping(uint8 => bytes) public draft;
    mapping(uint8 => uint256) public amounts;

    constructor(address _issue, address _vetter) Ownable() public {
        issue = _issue;
        vetter = _vetter;
    }

    modifier onlyVetter {
        require(msg.sender == vetter, "Not vetter.");
        _;
    }

    function write(
        bytes memory article,
        uint256 amount
    ) public onlyOwner returns (uint8) {
        draft[paragraphs] = article;
        amounts[paragraphs] = article;
        paragraphs = paragraphs.add(1);
        return paragraphs;
    }

    function sign(uint8 paragraph) public onlyVetter {
        require (
            // solium-disable-next-line security/no-call-value
            issue.call.value(amounts[paragraph])(draft[paragraph]),
            "Bill could not be signed into law."
        );
    }

}