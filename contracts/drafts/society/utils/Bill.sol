pragma solidity ^0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";


/**
 * @title Bill
 * @notice Implements a bill regarding a certain issue to be treated in the manner of certain artciles of this bill
 */
contract Bill is Ownable {

    using SafeMath for uint256;

    address public issue;
    address public vetter;
    uint256 public paragraphs;
    mapping(uint256 => bytes) public draft;
    mapping(uint256 => uint256) public amounts;

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
    ) public onlyOwner returns (uint256) {
        draft[paragraphs] = article;
        amounts[paragraphs] = amount;
        paragraphs = paragraphs.add(1);
        return paragraphs;
    }

    function sign(uint256 paragraph) public payable onlyVetter {
        // solium-disable-next-line security/no-call-value
        (bool success, ) = issue.call.value(amounts[paragraph])(draft[paragraph]);
        require(
            success,
            "Bill could not be signed into law."
        );
    }

}