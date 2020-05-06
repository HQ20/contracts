pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../access/Administered.sol";


/**
 * @title Energy Market
 * @notice Implements a simple energy market, using ERC20 and Whitelist.
 * ERC20 is used to enable payments from the consumers to the distribution
 * network, represented by this contract, and from the distribution network
 * to the producers. Whitelist is used to keep a list of compliant smart
 * meters that communicate the production and consumption of energy.
 */
contract EnergyMarket is ERC20, Administered {

    event EnergyProduced(address producer, uint256 time);
    event EnergyConsumed(address consumer, uint256 time);

    // uint128 is used here to facilitate the price formula
    // Casting between uint128 and int256 never overflows
    // int256(uint128) - int256(uint128) never overflows
    mapping(uint256 => uint128) public consumption;
    mapping(uint256 => uint128) public production;
    uint128 public basePrice;

    /**
     * @dev The constructor initializes the underlying currency token and the
     * smart meter whitelist. The constructor also mints the requested amount
     * of the underlying currency token to fund the network load. Also sets the
     * maximum energy price, used for calculating prices.
     */
    constructor (uint256 _initialSupply, uint128 _basePrice)
        public
        ERC20("Energy", "POW")
        Administered(msg.sender)
    {
        _mint(address(this), _initialSupply);
        basePrice = _basePrice;
    }

    /**
     * @dev The production price for each time slot.
     */
    function getProductionPrice(uint256 _time)
        public virtual view returns(uint256)
    {
        return uint256(
            max(
                0,
                int256(basePrice) *
                    (3 + safeSub(production[_time], consumption[_time]))
            )
        );
    }

    /**
     * @dev The consumption price for each time slot
     */
    function getConsumptionPrice(uint256 _time)
        public virtual view returns(uint256)
    {
        return uint256(
            max(
                0,
                int256(basePrice) *
                    (3 + safeSub(consumption[_time], production[_time]))
            )
        );
    }

    /**
     * @dev Add one energy unit to the distribution network at the specified
     * time and be paid the production price. Only whitelisted smart meters can
     * call this function.
     */
    function produce(uint256 _time) public virtual {
        require(isUser(msg.sender), "Unknown meter.");
        this.transfer(
            msg.sender,
            getProductionPrice(_time)
        );
        production[_time] = production[_time] + 1;
        emit EnergyProduced(msg.sender, _time);
    }

    /**
     * @dev Take one energy unit from the distribution network at the specified
     * time by paying the consumption price. Only whitelisted smart meters can
     * call this function.
     */
    function consume(uint256 _time) public virtual {
        require(isUser(msg.sender), "Unknown meter.");
        this.transferFrom(
            msg.sender,
            address(this),
            getConsumptionPrice(_time)
        );
        consumption[_time] = consumption[_time] + 1;
        emit EnergyConsumed(msg.sender, _time);
    }

    /**
     * @dev Returns the largest of two numbers.
     */
    function max(int256 a, int256 b) internal pure returns (int256) {
        return a >= b ? a : b;
    }

    /**
     * @dev Substracts b from a using types safely casting from uint128 to int256.
     */
    function safeSub(uint128 a, uint128 b) internal pure returns (int256) {
        return int256(a) - int256(b);
    }
}