pragma solidity ^0.6.0;
import "./TestUniswapExchange.sol";
import "../../exchange/UniswapFactory.sol";


contract TestUniswapFactory is UniswapFactory {

    function testLaunchExchange(
        address _token
    ) public virtual returns (address exchange) {
        require(
            tokenToExchange[_token] == address(0),
            "Already an exchange for that."
        ); //There can only be one exchange per token
        require(
            _token != address(0) && _token != address(this),
            "Not a valid token address."
        );
        address payable newExchange = address(new TestUniswapExchange(_token));
        tokenList.push(_token);
        tokenToExchange[_token] = newExchange;
        exchangeToToken[newExchange] = _token;
        emit ExchangeLaunch(newExchange, _token);
        return newExchange;
    }

}