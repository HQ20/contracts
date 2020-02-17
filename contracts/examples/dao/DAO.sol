pragma solidity ^0.5.10;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import "./VentureEth.sol";
import "../../drafts/voting/Voting.sol";


/**
 * @title DAO
 * @dev The contract inherits from VentureEth.
 * @notice This is an exeprimental DAO (Decentralised Autonomous Organization) implementation. Use with caution.
 * 1. Issue the DAO tokens through an inital funding round.
 * 2. Propose a venture, and funding amount. You will have to stake the DAO's gage until either the venture is funded or you decide to drop the proposal.
 * 3. Vote for a venture. Each DAO token is 1 vote. If venture is funded, or if you renounce your vote, you must manualy take back the tokens.
 * 4. Fund a venture. Votes count must surpass the DAO's threshold for a majority.
 * 5. Retrieve the venture tokens.
 * 6. Increase the DAO pool with returns (if any) on the tokens from a funded venture.
 * 7. Claim ether dividends from the DAO on behalf of your DAO tokens.
 */
contract DAO is VentureEth {

    using SafeMath for uint256;
    using EnumerableSet for EnumerableSet.AddressSet;

    uint256 public fundingPool;
    uint256 public gage;
    uint256 public threshold;
    mapping(address => uint256) public requests;
    mapping(address => address) public proponents;
    mapping(address => address) private votings;
    EnumerableSet.AddressSet ventures;

    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 _threshold,
        uint256 _gage
    ) VentureEth(name, symbol, decimals) public {
        gage = _gage;
        threshold = _threshold;
    }

    modifier onlyWhen(bytes32 state) {
        require(currentState == state, "DAO needs to be LIVE");
        _;
    }

    modifier activeVoting(address venture) {
        require(
            ventures.contains(venture),
            "Voting is not active for venture."
        );
        _;
    }

    /**
     * @dev Fallback function. Required when collecting ether dividends from ventures.
     */
    function () external payable {}

    /**
     * @notice The withdraw function inherited from VentureEth is disabled. The funds can be transferred exclusively by the vote of the investors.
     */
    function withdraw(address payable) public onlyOwner nonReentrant {
        revert("Cannot transfer funds.");
    }

    /**
     * @notice Propose a venture. Must have approved the DAO to spend proposalGage of your DAO tokens. venture must inherit from VentureEth.
     * @param venture The address of the VentureEth contract
     */
    function propose(
        address venture,
        uint256 funding
    ) public onlyWhen("LIVE") {
        uint256 newFundingPool = fundingPool.add(funding);
        require(
            newFundingPool <= address(this).balance,
            "Not enough funds."
        );
        this.transferFrom(msg.sender, address(this), gage);
        ventures.add(address(VentureEth(venture)));
        proponents[venture] = msg.sender;
        fundingPool = newFundingPool;
        requests[venture] = funding;
        Voting voting = new Voting(address(this), threshold);
        votings[venture] = address(voting);
        voting.registerProposal(
            venture,
            abi.encodeWithSignature("invest()", "")
        );
        voting.registerProposal(
            venture,
            abi.encodeWithSignature("claim()", "")
        );
        voting.registerProposal(
            venture,
            abi.encodeWithSignature("approve(address, uint256)",
                address(this),
                IERC20(venture).totalSupply()
            )
        );
        voting.open();
    }

    /**
     * @notice Drop a venture proposal.
     * @param venture The address of the VentureEth contract to drop.
     */
    function drop(
        address venture
    ) public onlyWhen("LIVE") activeVoting(venture) {
        require(proponents[venture] == msg.sender, "Cannot renounce venture.");
        this.transfer(msg.sender, gage);
        ventures.remove(venture);
    }

    /**
     * @dev Use this function to cast votes. Must have approved this contract to spend votes of DAO tokens.
     * @param votes The amount of DAO tokens that will be casted.
     */
    function vote(
        address venture,
        uint256 votes
    ) public onlyWhen("LIVE") activeVoting(venture) {
        // solium-disable-next-line security/no-low-level-calls
        (bool success, ) = votings[venture].delegatecall(
            abi.encodeWithSignature("cast()", votes)
        );
        require(success, "Could not cast votes.");
    }

    /**
     * @dev Use this function to retrieve your DAO tokens in case you changed your mind or the voting has passed.
     * @param venture The venture from which votes will be canceled
     */
    function renounce(address venture) public onlyWhen("LIVE") {
        // solium-disable-next-line security/no-low-level-calls
        (bool success, ) = votings[venture].delegatecall(
            abi.encodeWithSignature("cancel()", "")
        );
        require(success, "Could not cancel votes.");
    }

    /**
     * @notice Fund a venture proposal.
     * @param venture The address of the VentureEth contract to fund.
     */
    function fund(
        address venture
    ) public onlyWhen("LIVE") activeVoting(venture) {
        Voting voting = Voting(votings[venture]);
        voting.validate();
        // solium-disable-next-line security/no-call-value
        (bool success, ) = address(voting).call.value(requests[venture])(
            abi.encodeWithSignature("enact()", "")
        );
        require(success, "Could not fund venture.");
        fundingPool = fundingPool.sub(requests[venture]);
    }

    /**
     * @notice Retrieve tokens minted for the DAO after an investment.
     * @param venture The address of the VentureEth contract to retrieve tokens from.
     */
    function retrieve(address venture) public onlyWhen("LIVE") {
        Voting voting = Voting(votings[venture]);
        require(
            voting.nextProposal() == 1,
            "Cannot take tokens from venture."
        );
        voting.enact();
        voting.enact();
        IERC20(venture).transferFrom(
            address(voting),
            address(this),
            IERC20(venture).balanceOf(address(voting))
        );
    }

    /**
     * @notice Profit from an investment by claiming dividends for the DAO on the venture.
     * @param venture The address of the VentureEth contract to profit from.
     */
    function profit(address venture) public onlyWhen("LIVE") {
        require(
            Voting(votings[venture]).nextProposal() == 3,
            "Cannot profit from venture."
        );
        totalDividends = totalDividends.add(
            VentureEth(venture).updateAccount(address(this))
        );
        totalDividendPoints = totalDividends
            .mul(pointMultiplier).div(this.totalSupply());
    }

    /**
     * @notice Returns the currently proposed ventures.
     */
    function enumerate() public view returns (address[] memory) {
        return ventures.enumerate();
    }

}