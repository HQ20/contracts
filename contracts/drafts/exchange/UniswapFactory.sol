pragma solidity ^0.5.10;
import "./UniswapExchange.sol";


interface IUniswapFactory {
    function launchExchange(
        address _token
    ) external returns (address exchange);
    function getExchangeCount() external view returns (uint exchangeCount);
    function tokenToExchangeLookup(
        address _token
    ) external view returns (address payable exchange);
    function exchangeToTokenLookup(
        address _exchange
    ) external view returns (address token);
    event ExchangeLaunch(address indexed exchange, address indexed token);
}


contract UniswapFactory is IUniswapFactory {
    event ExchangeLaunch(address indexed exchange, address indexed token);

    // index of tokens with registered exchanges
    address[] public tokenList;
    mapping(address => address payable) tokenToExchange;
    mapping(address => address) exchangeToToken;

    function launchExchange(address _token) public returns (address exchange) {
        require(
            tokenToExchange[_token] == address(0),
            "Already an exchange for that."
        ); //There can only be one exchange per token
        require(
            _token != address(0) && _token != address(this),
            "Not a valid token address."
        );
        address payable newExchange = address(new UniswapExchange(_token));
        tokenList.push(_token);
        tokenToExchange[_token] = newExchange;
        exchangeToToken[newExchange] = _token;
        emit ExchangeLaunch(newExchange, _token);
        return newExchange;
    }

    function getExchangeCount() public view returns (uint exchangeCount) {
        return tokenList.length;
    }

    function tokenToExchangeLookup(
        address _token
    ) public view returns (address payable exchange) {
        return tokenToExchange[_token];
    }

    function exchangeToTokenLookup(
        address _exchange
    ) public view returns (address token) {
        return exchangeToToken[_exchange];
    }
}
