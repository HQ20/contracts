pragma solidity ^0.6.0;
import "./../../voting/Democratic.sol";


contract TestDemocratic is Democratic {
    constructor (address _votingToken, uint256 _threshold)
        public Democratic(_votingToken, _threshold)
    { }

    function testProposal(bool output) public pure virtual returns (bool) {
        return output;
    }
}
