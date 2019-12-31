import BigNumber from 'bignumber.js';
import { TestERC20MintableInstance } from '../../../types/truffle-contracts';
import { UniswapExchangeInstance, UniswapFactoryInstance } from '../../../types/truffle-contracts';

// tslint:disable:max-line-length
const TestERC20Mintable = artifacts.require('./test/issuance/TestERC20Mintable.sol') as Truffle.Contract<TestERC20MintableInstance>;
const UniswapExchange = artifacts.require('./exchange/UniswapExchange.sol') as Truffle.Contract<UniswapExchangeInstance>;
const UniswapFactory = artifacts.require('./exchange/UniswapFactory.sol') as Truffle.Contract<UniswapFactoryInstance>;
// tslint:enable:max-line-length

// tslint:disable:no-var-requires
const chai = require('chai');
const girino = require('girino');
// tslint:enable:no-var-requires

const { expect } = chai;

chai.use(girino);

/** @test {UniswapExchange} contract */
contract('UniswapExchange - Initialization', (accounts) => {

    let token: TestERC20MintableInstance;
    let uniswapFactory: UniswapFactoryInstance;
    let uniswapExchange: UniswapExchangeInstance;
    const initialiser1 = accounts[1];

    /**
     * @test {UniswapExchange#initializeExchange}
     */
    it('Intialize an exchange for test token.', async () => {
        token = await TestERC20Mintable.new('TestERC20Mintable', 'TST', 18);
        uniswapFactory = await UniswapFactory.new();
        uniswapExchange = await UniswapExchange.at(
            (await uniswapFactory.launchExchange(token.address)).logs[0].args.exchange,
        );
        await token.mint(initialiser1, new BigNumber(1e18));
        await token.approve(uniswapExchange.address, new BigNumber(1e18), { from: initialiser1 });
        await uniswapExchange.initializeExchange.sendTransaction(
            new BigNumber(1e18),
            { from: initialiser1, value: (new BigNumber(1e18)).toString() },
        );
        assert.equal((await token.balanceOf(uniswapExchange.address)).toString(), (new BigNumber(1e18)).toString(), 'Token amount not transferred correctly.');
        assert.equal((await web3.eth.getBalance(uniswapExchange.address)).toString(), (new BigNumber(1e18)).toString(), 'Ether not transferred correctly.');
    });
});

/** @test {UniswapExchange} contract */
contract('UniswapExchange - Trades', (accounts) => {

    let token: TestERC20MintableInstance;
    let uniswapFactory: UniswapFactoryInstance;
    let uniswapExchange: UniswapExchangeInstance;
    const initialiser1 = accounts[1];
    const initialiser2 = accounts[2];
    const swapper = accounts[3];

    beforeEach(async () => {
        token = await TestERC20Mintable.new('TestERC20Mintable', 'TST', 18);
        uniswapFactory = await UniswapFactory.new();
        uniswapExchange = await UniswapExchange.at(
            (await uniswapFactory.launchExchange(token.address)).logs[0].args.exchange,
        );
        await token.mint(initialiser1, new BigNumber(1e18));
        await token.approve(uniswapExchange.address, new BigNumber(1e18), { from: initialiser1 });
        await uniswapExchange.initializeExchange.sendTransaction(
            new BigNumber(1e18),
            { from: initialiser1, value: (new BigNumber(1e18)).toString() },
        );
    });

    /**
     * @test {UniswapExchange#ethToTokenSwap}
     */
    it('Ether to token swap', async () => {
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const minTokens = new BigNumber(3e17);
        expect(
            uniswapExchange.ethToTokenSwap.sendTransaction(
                minTokens,
                timeout,
                { from: swapper, value: (new BigNumber(5e17)).toString() },
            ),
        ).to.emit(
            'EthToTokenPurchase',
        ).withArgs(
            swapper,
            (new BigNumber(5e17)).toString(),
            (await token.balanceOf(swapper)),
        );
    });

    /**
     * @test {UniswapExchange#tokenToEthSwap}
     */
    it('Token to ether swap', async () => {
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const tokenAmount = new BigNumber(5e17);
        const minEth = new BigNumber(3e17);
        token.mint(swapper, tokenAmount);
        token.approve(uniswapExchange.address, tokenAmount, { from: swapper });
        const balanceBefore = await web3.eth.getBalance(swapper);
        expect(uniswapExchange.tokenToEthSwap(tokenAmount, minEth, timeout, { from: swapper })).to.emit('TokenToEthPurchase');
    });

    /**
     * @test {UniswapExchange#tokenToTokenSwap}
     */
    it('Token to token swap', async () => {
        // Initialize another exchange
        const token2 = await TestERC20Mintable.new('TestERC20Mintable2', 'TST2', 18);
        const uniswapExchange2 = await UniswapExchange.at(
            (await uniswapFactory.launchExchange(token2.address)).logs[0].args.exchange,
        );
        await token2.mint(initialiser2, new BigNumber(1e18));
        await token2.approve(uniswapExchange2.address, new BigNumber(1e18), { from: initialiser2 });
        await uniswapExchange2.initializeExchange.sendTransaction(
            new BigNumber(1e18),
            { from: initialiser2, value: (new BigNumber(1e18)).toString() },
        );
        // Swap tokens
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const tokenAmount = new BigNumber(5e17);
        const minEth = new BigNumber(2e17);
        token.mint(swapper, tokenAmount);
        token.approve(uniswapExchange.address, tokenAmount, { from: swapper });
        expect(
            uniswapExchange.tokenToTokenSwap(
                token2.address,
                tokenAmount,
                minEth,
                timeout,
                { from: swapper },
            ),
        ).to.emit('TokenToEthPurchase').to.emit('EthToTokenPurchase');
    });
});

