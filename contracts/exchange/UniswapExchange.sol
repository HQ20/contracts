pragma solidity ^0.6.0;
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./UniswapFactory.sol";


/**
 * @title UniswapExchange
 * @notice Uniswap style exchange
 */
contract UniswapExchange {
    using SafeMath for uint256;

    /// EVENTS
    event EthToTokenPurchase(
        address indexed buyer,
        uint256 indexed ethIn,
        uint256 indexed tokensOut
    );
    event TokenToEthPurchase(
        address indexed buyer,
        uint256 indexed tokensIn,
        uint256 indexed ethOut
    );
    event Investment(
        address indexed liquidityProvider,
        uint256 indexed sharesPurchased
    );
    event Divestment(
        address indexed liquidityProvider,
        uint256 indexed sharesBurned
    );

    /// CONSTANTS
    uint256 public constant FEE_RATE = 500;        //fee = 1/feeRate = 0.2%

    /// STORAGE
    uint256 public ethPool;
    uint256 public tokenPool;
    uint256 public invariant;
    uint256 public totalShares;
    address public tokenAddress;
    address public factoryAddress;
    mapping(address => uint256) shares;
    IERC20 token;
    IUniswapFactory factory;

    /// MODIFIERS
    modifier exchangeInitialized() {
        require(
            invariant > 0 && totalShares > 0,
            "Exchange wasn't initialized."
        );
        _;
    }

    /// CONSTRUCTOR
    constructor(address _tokenAddress) public {
        tokenAddress = _tokenAddress;
        factoryAddress = msg.sender;
        token = IERC20(tokenAddress);
        factory = IUniswapFactory(factoryAddress);
    }

    /// RECEIVE FUNCTION
    receive() external virtual payable {
        require(
            msg.value != 0,
            "Need to send some ether."
        );
        ethToToken(
            msg.sender,
            msg.sender,
            msg.value,
            1
        );
    }

    /// EXTERNAL FUNCTIONS
    /// @notice Initializes the exchange
    /// @param _tokenAmount the number of tokens to initialize the exchange with
    function initializeExchange(uint256 _tokenAmount) external virtual payable {
        require(
            invariant == 0 && totalShares == 0,
            "Invariant or totalShares != 0"
        );
        // Prevents share cost from being too high or too low - potentially needs work
        require(
            msg.value >= 10000 && _tokenAmount >= 10000 && msg.value <= 5*10**18,
            "Share cost not in range."
        );
        ethPool = msg.value;
        tokenPool = _tokenAmount;
        invariant = ethPool.mul(tokenPool);
        shares[msg.sender] = 1000;
        totalShares = 1000;
        token.transferFrom(msg.sender, address(this), _tokenAmount);
    }

    /// @notice Buyer swaps ETH for Tokens
    /// @param _minTokens Minimum amount of tokens to be recieved
    /// @param _timeout Timeout period before call fails
    function ethToTokenSwap(
        uint256 _minTokens,
        uint256 _timeout
    )
        external
        virtual
        payable
    {
        require(
            // solium-disable-next-line security/no-block-members
            msg.value > 0 && _minTokens > 0 && now < _timeout,
            "Invalid ethToTokenSwap parameters"
        );
        ethToToken(
            msg.sender,
            msg.sender,
            msg.value,
            _minTokens
        );
    }

    /// @notice Payer pays in ETH, recipient receives Tokens
    /// @param _minTokens Minimum amount of tokens to be recieved
    /// @param _timeout Timeout period before call fails
    /// @param _recipient The recipient of the tokens
    function ethToTokenPayment(
        uint256 _minTokens,
        uint256 _timeout,
        address _recipient
    )
        external
        virtual
        payable
    {
        require(
            // solium-disable-next-line security/no-block-members
            msg.value > 0 && _minTokens > 0 && now < _timeout,
            "Invalid ethToTokenPayment parameters."
        );
        require(
            _recipient != address(0) && _recipient != address(this),
            "Invalid ethToTokenPayment recipient."
        );
        ethToToken(
            msg.sender,
            _recipient,
            msg.value,
            _minTokens
        );
    }

    /// @notice Buyer swaps Tokens for ETH
    /// @param _tokenAmount The amount of tokens to swap
    /// @param _minEth Minimum eth to be recieved
    /// @param _timeout Timeout period before call fails
    function tokenToEthSwap(
        uint256 _tokenAmount,
        uint256 _minEth,
        uint256 _timeout
    )
        external
        virtual
    {
        require(
            // solium-disable-next-line security/no-block-members
            _tokenAmount > 0 && _minEth > 0 && now < _timeout,
            "Invalid tokenToEthSwap parameters."
        );
        tokenToEth(
            msg.sender,
            msg.sender,
            _tokenAmount,
            _minEth
        );
    }

    /// @notice Payer pays in Tokens, recipient receives ETH
    /// @param _tokenAmount The amount of tokens to swap
    /// @param _minEth Minimum eth to be recieved
    /// @param _timeout Timeout period before call fails
    /// @param _recipient The recipient of eth
    function tokenToEthPayment(
        uint256 _tokenAmount,
        uint256 _minEth,
        uint256 _timeout,
        address payable _recipient
    )
        external
        virtual
    {
        require(
            // solium-disable-next-line security/no-block-members
            _tokenAmount > 0 && _minEth > 0 && now < _timeout,
            "Invalid tokenToEthPayment parameters."
        );
        require(
            _recipient != address(0) && _recipient != address(this),
            "Invalid tokenToEthPayment recipient."
        );
        tokenToEth(
            msg.sender,
            _recipient,
            _tokenAmount,
            _minEth
        );
    }

    /// @notice Buyer swaps Tokens in current exchange for Tokens of provided address
    /// @param _tokenPurchased The address of the token you wish to trade
    /// @param _tokensSold The amount of tokens you wish to trade
    /// @param _minTokensReceived The minimum amount of tokens to be recieved
    /// @param _timeout Timeout period before call fails
    function tokenToTokenSwap(
        address _tokenPurchased,                  // Must be a token with an attached Uniswap exchange
        uint256 _tokensSold,
        uint256 _minTokensReceived,
        uint256 _timeout
    )
        external
        virtual
    {
        require(
            // solium-disable-next-line security/no-block-members
            _tokensSold > 0 && _minTokensReceived > 0 && now < _timeout,
            "Invalid tokenToTokenSwap parameters."
        );
        tokenToTokenOut(
            _tokenPurchased,
            msg.sender,
            msg.sender,
            _tokensSold,
            _minTokensReceived
        );
    }

    /// @notice Payer pays in exchange Token, recipient receives Tokens of provided address
    /// @param _tokenPurchased The address of the token you wish to trade
    /// @param _recipient The recipient of the tokens
    /// @param _tokensSold The amount of tokens you wish to trade
    /// @param _minTokensReceived The minimum amount of tokens to be recieved
    /// @param _timeout Timeout period before call fails
    function tokenToTokenPayment(
        address _tokenPurchased,
        address _recipient,
        uint256 _tokensSold,
        uint256 _minTokensReceived,
        uint256 _timeout
    )
        external
        virtual
    {
        require(
            // solium-disable-next-line security/no-block-members
            _tokensSold > 0 && _minTokensReceived > 0 && now < _timeout,
            "Invalid tokenToTokenPayment parameters."
        );
        require(
            _recipient != address(0) && _recipient != address(this),
            "Invalid tokenToTokenPayment recipient."
        );
        tokenToTokenOut(
            _tokenPurchased,
            msg.sender,
            _recipient,
            _tokensSold,
            _minTokensReceived
        );
    }

    // Function called by another Uniswap exchange in Token to Token swaps and payments
    function tokenToTokenIn(
        address _recipient,
        uint256 _minTokens
    )
        external
        virtual
        payable
        returns (bool)
    {
        require(
            msg.value > 0,
            "Not enough ether sent."
        );
        address exchangeToken = factory.exchangeToTokenLookup(msg.sender);
        require(
            exchangeToken != address(0),
            "Invalid Exchange."
        );   // Only a Uniswap exchange can call this function
        ethToToken(
            msg.sender,
            _recipient,
            msg.value,
            _minTokens
        );
        return true;
    }

    /// @notice Invest liquidity and receive market shares
    /// @param _minShares The minimum amount of shares to be issued
    function investLiquidity(
        uint256 _minShares
    )
        external
        virtual
        payable
        exchangeInitialized
    {
        require(
            msg.value > 0 && _minShares > 0,
            "Invalid investLiquidity parameters."
        );
        uint256 ethPerShare = ethPool.div(totalShares);
        require(
            msg.value >= ethPerShare,
            "Not enough ether sent."
        );
        uint256 sharesPurchased = msg.value.div(ethPerShare);
        require(
            sharesPurchased >= _minShares,
            "Not enough shares purchased"
        );
        uint256 tokensPerShare = tokenPool.div(totalShares);
        uint256 tokensRequired = sharesPurchased.mul(tokensPerShare);
        shares[msg.sender] = shares[msg.sender].add(sharesPurchased);
        totalShares = totalShares.add(sharesPurchased);
        ethPool = ethPool.add(msg.value);
        tokenPool = tokenPool.add(tokensRequired);
        invariant = ethPool.mul(tokenPool);
        token.transferFrom(msg.sender, address(this), tokensRequired);
        emit Investment(msg.sender, sharesPurchased);
    }

    /// @notice Divest market shares and receive liquidity
    /// @param _sharesBurned The amount of shares to be bruned
    /// @param _minEth The minimum amount of eth to be recieved
    /// @param _minTokens The minimum amount of tokens to be recieved
    function divestLiquidity(
        uint256 _sharesBurned,
        uint256 _minEth,
        uint256 _minTokens
    )
        external
        virtual
    {
        require(
            _sharesBurned > 0,
            "Not enough shares to burn."
        );
        shares[msg.sender] = shares[msg.sender].sub(_sharesBurned);
        uint256 ethPerShare = ethPool.div(totalShares);
        uint256 tokensPerShare = tokenPool.div(totalShares);
        uint256 ethDivested = ethPerShare.mul(_sharesBurned);
        uint256 tokensDivested = tokensPerShare.mul(_sharesBurned);
        require(
            ethDivested >= _minEth && tokensDivested >= _minTokens,
            "Tried to divest too much."
        );
        totalShares = totalShares.sub(_sharesBurned);
        ethPool = ethPool.sub(ethDivested);
        tokenPool = tokenPool.sub(tokensDivested);
        if (totalShares == 0) {
            invariant = 0;
        } else {
            invariant = ethPool.mul(tokenPool);
        }
        token.transfer(msg.sender, tokensDivested);
        msg.sender.transfer(ethDivested);
        emit Divestment(msg.sender, _sharesBurned);
    }

    /// @notice View share balance of an address
    /// @param _provider The address of the shareholder
    function getShares(
        address _provider
    )
        external
        virtual
        view
        returns(uint256 _shares)
    {
        return shares[_provider];
    }

    /// INTERNAL FUNCTIONS
    function ethToToken(
        address buyer,
        address recipient,
        uint256 ethIn,
        uint256 minTokensOut
    )
        internal
        exchangeInitialized
    {
        uint256 fee = ethIn.div(FEE_RATE);
        uint256 newEthPool = ethPool.add(ethIn);
        uint256 tempEthPool = newEthPool.sub(fee);
        uint256 newTokenPool = invariant.div(tempEthPool);
        uint256 tokensOut = tokenPool.sub(newTokenPool);
        require(
            tokensOut >= minTokensOut && tokensOut <= tokenPool,
            "tokensOut not in range."
        );
        ethPool = newEthPool;
        tokenPool = newTokenPool;
        invariant = newEthPool.mul(newTokenPool);
        token.transfer(recipient, tokensOut);
        emit EthToTokenPurchase(buyer, ethIn, tokensOut);
    }

    function tokenToEth(
        address buyer,
        address payable recipient,
        uint256 tokensIn,
        uint256 minEthOut
    )
        internal
        exchangeInitialized
    {
        uint256 fee = tokensIn.div(FEE_RATE);
        uint256 newTokenPool = tokenPool.add(tokensIn);
        uint256 tempTokenPool = newTokenPool.sub(fee);
        uint256 newEthPool = invariant.div(tempTokenPool);
        uint256 ethOut = ethPool.sub(newEthPool);
        require(
            ethOut >= minEthOut && ethOut <= ethPool,
            "ethOut not in range"
        );
        tokenPool = newTokenPool;
        ethPool = newEthPool;
        invariant = newEthPool.mul(newTokenPool);
        token.transferFrom(buyer, address(this), tokensIn);
        recipient.transfer(ethOut);
        emit TokenToEthPurchase(buyer, tokensIn, ethOut);
    }

    function tokenToTokenOut(
        address tokenPurchased,
        address buyer,
        address recipient,
        uint256 tokensIn,
        uint256 minTokensOut
    )
        internal
        exchangeInitialized
    {
        require(
            tokenPurchased != address(0) && tokenPurchased != address(this),
            "Invalid purchased token address.");
        address payable exchangeAddress = factory.tokenToExchangeLookup(
            tokenPurchased
        );
        require(
            exchangeAddress != address(0) && exchangeAddress != address(this),
            "Invalid exchange address."
        );
        uint256 fee = tokensIn.div(FEE_RATE);
        uint256 newTokenPool = tokenPool.add(tokensIn);
        uint256 tempTokenPool = newTokenPool.sub(fee);
        uint256 newEthPool = invariant.div(tempTokenPool);
        uint256 ethOut = ethPool.sub(newEthPool);
        UniswapExchange exchange = UniswapExchange(exchangeAddress);
        emit TokenToEthPurchase(buyer, tokensIn, ethOut);
        tokenPool = newTokenPool;
        ethPool = newEthPool;
        invariant = newEthPool.mul(newTokenPool);
        token.transferFrom(buyer, address(this), tokensIn);
        exchange.tokenToTokenIn.value(ethOut)(recipient, minTokensOut);
    }
}
