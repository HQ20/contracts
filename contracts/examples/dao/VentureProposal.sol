pragma solidity ^0.5.10;

import "./DAO.sol";
import "../../voting/Voting.sol";


contract VentureProposal is Voting {
    DAO internal dao;
    address public venture;
    uint256 public funding;

    constructor(
        address _dao, // The DAO is also the voting token
        address _venture,
        uint256 _funding,
        uint256 _threshold
    ) public Voting(_dao, _threshold) {
        dao = DAO(_dao);
        venture = _venture;
        funding = _funding;

        _createTransition("PASSED", "FUNDED");
        _createTransition("FUNDED", "RETRIEVED");
        _createTransition("RETRIEVED", "COMPLETED");
    }

    function fund() public {
        _transition("FUNDED");
        dao.fund(venture, funding);
    }

    function retrieve() public {
        _transition("COMPLETED");
        dao.retrieve(venture);
    }
}
