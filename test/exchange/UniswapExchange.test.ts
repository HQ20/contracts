import chai = require('chai');
// tslint:disable-next-line:no-var-requires
const { balance, BN, constants, ether, expectEvent, expectRevert, send } = require('@openzeppelin/test-helpers');
import { TestERC20MintableInstance } from '../../types/truffle-contracts';
import { UniswapExchangeInstance, UniswapFactoryInstance } from '../../types/truffle-contracts';

// tslint:disable:max-line-length
const TestERC20Mintable = artifacts.require('./test/issuance/TestERC20Mintable.sol') as Truffle.Contract<TestERC20MintableInstance>;
const UniswapExchange = artifacts.require('./exchange/UniswapExchange.sol') as Truffle.Contract<UniswapExchangeInstance>;
const UniswapFactory = artifacts.require('./exchange/UniswapFactory.sol') as Truffle.Contract<UniswapFactoryInstance>;
// tslint:enable:max-line-length

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

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
        await token.mint(initialiser1, ether('1'));
        await token.approve(uniswapExchange.address, ether('1'), { from: initialiser1 });
        await uniswapExchange.initializeExchange.sendTransaction(
            ether('1'),
            { from: initialiser1, value: ether('1').toString() },
        );
        (await web3.eth.getBalance(uniswapExchange.address)).should.be.bignumber.equal(ether('1'));
        BN(await token.balanceOf(uniswapExchange.address)).should.be.bignumber.equal(ether('1'));
    });
});

/** @test {UniswapExchange} contract */
contract('UniswapExchange - Trades', (accounts) => {

    let token: TestERC20MintableInstance;
    let uniswapFactory: UniswapFactoryInstance;
    let uniswapExchange: UniswapExchangeInstance;
    const initialiser1 = accounts[1];
    const initialiser2 = accounts[2];
    const swapper1 = accounts[3];
    const swapper2 = accounts[4];

    beforeEach(async () => {
        token = await TestERC20Mintable.new('TestERC20Mintable', 'TST', 18);
        uniswapFactory = await UniswapFactory.new();
        uniswapExchange = await UniswapExchange.at(
            (await uniswapFactory.launchExchange(token.address)).logs[0].args.exchange,
        );
        await token.mint(initialiser1, ether('1'));
        await token.approve(uniswapExchange.address, ether('1'), { from: initialiser1 });
        await uniswapExchange.initializeExchange.sendTransaction(
            ether('1'),
            { from: initialiser1, value: ether('1').toString() },
        );
    });

    /**
     * @test {UniswapExchange#}
     */
    it('Fallback function should exchange ether to token', async () => {
        const { transactionHash } = await web3.eth.sendTransaction({ from: swapper1, to: uniswapExchange.address, value: ether('0.5').toString() });
        expectEvent.inTransaction(
            transactionHash,
            uniswapExchange,
            'EthToTokenPurchase',
            {
                buyer: swapper1,
                ethIn: ether('0.5'),
                tokensOut: await token.balanceOf(swapper1),
            },
        );

    });

    /**
     * @test {UniswapExchange#ethToTokenSwap}
     */
    it('Ether to token swap', async () => {
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const minTokens = new BN('3e17');
        expectEvent(
            await uniswapExchange.ethToTokenSwap.sendTransaction(
                minTokens,
                timeout,
                { from: swapper1, value: (new BN('5e17')).toString() },
            ),
            'EthToTokenPurchase',
            {
                buyer: swapper1,
                ethIn: new BN('5e17'),
                tokensOut: await token.balanceOf(swapper1),
            },
        );
    });

    /**
     * @test {UniswapExchange#ethToTokenPayment}
     */
    it('Ether to token payment', async () => {
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const minTokens = ether('0.3');
        expectEvent(
            await uniswapExchange.ethToTokenPayment.sendTransaction(
                minTokens,
                timeout,
                swapper2,
                { from: swapper1, value: (ether('0.5')).toString() },
            ),
            'EthToTokenPurchase',
            {
                buyer: swapper1,
                ethIn: ether('0.5'),
                tokensOut: await token.balanceOf(swapper2),
            },
        );
    });

    /**
     * @test {UniswapExchange#tokenToEthSwap}
     */
    it('Token to ether swap', async () => {
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const tokenAmount = ether('0.5');
        const minEth = ether('0.3');
        token.mint(swapper1, tokenAmount);
        token.approve(uniswapExchange.address, tokenAmount, { from: swapper1 });
        const swap = await uniswapExchange.tokenToEthSwap(tokenAmount, minEth, timeout, { from: swapper1 });
        expectEvent(
            swap,
            'TokenToEthPurchase',
            {
                buyer: swapper1,
                tokensIn: tokenAmount,
            },
        );
    });

    /**
     * @test {UniswapExchange#tokenToEthSwap}
     */
    it('Token to ether payment', async () => {
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const tokenAmount = ether('0.5');
        const minEth = ether('0.3');
        token.mint(swapper1, tokenAmount);
        token.approve(uniswapExchange.address, tokenAmount, { from: swapper1 });
        const tracker2 = await balance.tracker(swapper2);
        tracker2.get();
        const swap = await uniswapExchange.tokenToEthPayment(tokenAmount, minEth, timeout, swapper2, { from: swapper1 });
        expectEvent(
            swap,
            'TokenToEthPurchase',
            {
                buyer: swapper1,
                tokensIn: tokenAmount,
                ethOut: await tracker2.delta(),
            },
        );
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
        await token2.mint(initialiser2, ether('1'));
        await token2.approve(uniswapExchange2.address, ether('1'), { from: initialiser2 });
        await uniswapExchange2.initializeExchange.sendTransaction(
            ether('1'),
            { from: initialiser2, value: (ether('1')).toString() },
        );
        // Swap tokens
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const tokenAmount = ether('0.5');
        const minEth = ether('0.2');
        token.mint(swapper1, tokenAmount);
        token.approve(uniswapExchange.address, tokenAmount, { from: swapper1 });
        const swap = await uniswapExchange.tokenToTokenSwap(
            token2.address,
            tokenAmount,
            minEth,
            timeout,
            { from: swapper1 },
        );
        expectEvent(
            swap,
            'TokenToEthPurchase',
            {
                buyer: swapper1,
                tokensIn: tokenAmount,
            },
        );
        expectEvent(
            swap,
            'EthToTokenPurchase',
            {
                buyer: uniswapExchange.address,
                tokensOut: await token2.balanceOf(swapper1),
            },
        );
    });

    /**
     * @test {UniswapExchange#tokenToTokenPayment}
     */
    it('Token to token payment', async () => {
        // Initialize another exchange
        const token2 = await TestERC20Mintable.new('TestERC20Mintable2', 'TST2', 18);
        const uniswapExchange2 = await UniswapExchange.at(
            (await uniswapFactory.launchExchange(token2.address)).logs[0].args.exchange,
        );
        await token2.mint(initialiser2, ether('1'));
        await token2.approve(uniswapExchange2.address, ether('1'), { from: initialiser2 });
        await uniswapExchange2.initializeExchange.sendTransaction(
            ether('1'),
            { from: initialiser2, value: (ether('1')).toString() },
        );
        // Swap tokens
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const tokenAmount = ether('0.5');
        const minEth = ether('0.2');
        token.mint(swapper1, tokenAmount);
        token.approve(uniswapExchange.address, tokenAmount, { from: swapper1 });
        const swap = await uniswapExchange.tokenToTokenPayment(
            token2.address,
            swapper2,
            tokenAmount,
            minEth,
            timeout,
            { from: swapper1 },
        );
        expectEvent(
            swap,
            'TokenToEthPurchase',
            {
                buyer: swapper1,
                tokensIn: tokenAmount,
            },
        );
        expectEvent(
            swap,
            'EthToTokenPurchase',
            {
                buyer: uniswapExchange.address,
                tokensOut: await token2.balanceOf(swapper2),
            },
        );
    });
});
