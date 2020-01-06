pragma solidity ^0.5.10;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/math/Math.sol";
// import "@hq20/contracts/contracts/access/Whitelist.sol";
import "./../../access/Whitelist.sol";


/**
 * @title Energy Market
 * @notice Implements a simple energy market, using ERC20 and Whitelist.
 * ERC20 is used to enable payments from the consumers to the distribution
 * network, represented by this contract, and from the distribution network
 * to the producers. Whitelist is used to keep a list of compliant smart
 * meters that communicate the production and consumption of energy.
 */
contract EnergyMarket is ERC20, Whitelist {
    using SafeMath for uint256;

    event EnergyProduced(address producer, uint256 time);
    event EnergyConsumed(address consumer, uint256 time);

    mapping(uint256 => uint256) public consumption;
    mapping(uint256 => uint256) public production;
    uint256 public maxPrice;

    /**
     * @dev The constructor initializes the underlying currency token and the
     * smart meter whitelist. The constructor also mints the requested amount
     * of the underlying currency token to fund the network load. Also sets the
     * maximum energy price, used for calculating prices.
     */
    constructor (uint256 _initialSupply, uint256 _maxPrice)
        public
        ERC20()
        Whitelist()
    {
        _mint(address(this), _initialSupply);
        maxPrice = _maxPrice;
    }

    /**
     * @dev The production price for each time slot is maxPrice / max((consumption - production + 1), 1)
     */
    function getProductionPrice(uint256 _time) public view returns(uint256) {
        if (production[_time] >= consumption[_time]) return maxPrice;
        return maxPrice.div(
            Math.max(
                consumption[_time].sub(production[_time].add(1)),
                1
            )
        );
    }

    /**
     * @dev The consumption price for each time slot is maxPrice / max((production - consumption + 1), 1)
     */
    function getConsumptionPrice(uint256 _time) public view returns(uint256) {
        if (consumption[_time] >= production[_time]) return maxPrice;
        return maxPrice.div(
            Math.max(
                production[_time].sub(consumption[_time].add(1)),
                1
            )
        );
    }

    /**
     * @dev Add one energy unit to the distribution network at the specified
     * time and be paid the production price. Only whitelisted smart meters can
     * call this function.
     */
    function produce(uint256 _time) public {
        require(isMember(msg.sender), "Unknown meter.");
        this.transfer(
            msg.sender,
            getProductionPrice(_time)
        );
        production[_time] = production[_time].add(1);
        emit EnergyProduced(msg.sender, _time);
    }

    /**
     * @dev Take one energy unit from the distribution network at the specified
     * time by paying the consumption price. Only whitelisted smart meters can
     * call this function.
     */
    function consume(uint256 _time) public {
        require(isMember(msg.sender), "Unknown meter.");
        this.transferFrom(
            msg.sender,
            address(this),
            getConsumptionPrice(_time)
        );
        consumption[_time] = consumption[_time].add(1);
        emit EnergyConsumed(msg.sender, _time);
    }
}