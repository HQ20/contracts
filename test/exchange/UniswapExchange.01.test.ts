import chai = require('chai');
// tslint:disable-next-line:no-var-requires
const { balance, BN, constants, ether, expectEvent, expectRevert, send } = require('@openzeppelin/test-helpers');
import {
    ERC20MintableInstance,
    TestUniswapExchangeInstance,
    TestUniswapFactoryInstance,
} from '../../types/truffle-contracts';


const ERC20Mintable = artifacts.require('ERC20Mintable') as Truffle.Contract<ERC20MintableInstance>;
const UniswapExchange = artifacts.require('TestUniswapExchange') as Truffle.Contract<TestUniswapExchangeInstance>;
const UniswapFactory = artifacts.require('TestUniswapFactory') as Truffle.Contract<TestUniswapFactoryInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

/** @test {UniswapExchange} contract */
contract('UniswapExchange - Initialization', (accounts) => {

    let token: ERC20MintableInstance;
    let uniswapFactory: TestUniswapFactoryInstance;
    let uniswapExchange: TestUniswapExchangeInstance;
    const initialiser1 = accounts[1];

    /**
     * @test {UniswapExchange#initializeExchange}
     */
    it('Intialize an exchange for test token.', async () => {
        token = await ERC20Mintable.new('ERC20Mintable', 'TST', 18);
        uniswapFactory = await UniswapFactory.new();
        uniswapExchange = await UniswapExchange.at(
            (await uniswapFactory.testLaunchExchange(token.address)).logs[0].args.exchange,
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

    /**
     * @test {UniswapExchange#initializeExchange}
     */
    it('Cannot initialize exchange after first initialization', async () => {
        token = await ERC20Mintable.new('ERC20Mintable', 'TST', 18);
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
        await expectRevert(
            uniswapExchange.initializeExchange.sendTransaction(
                ether('1'),
                { from: initialiser1, value: ether('1').toString() },
            ),
            'Invariant or totalShares != 0',
        );
    });

    /**
     * @test {UniswapExchange#initializeExchange}
     */
    it('Cannot initialize exchange after first initialization', async () => {
        token = await ERC20Mintable.new('ERC20Mintable', 'TST', 18);
        uniswapFactory = await UniswapFactory.new();
        uniswapExchange = await UniswapExchange.at(
            (await uniswapFactory.launchExchange(token.address)).logs[0].args.exchange,
        );
        await token.mint(initialiser1, ether('1'));
        await token.approve(uniswapExchange.address, ether('1'), { from: initialiser1 });
        await expectRevert(
            uniswapExchange.initializeExchange.sendTransaction(
                ether('1'),
                { from: initialiser1, value: ether('6').toString() },
            ),
            'Share cost not in range.',
        );
    });

});

/** @test {UniswapExchange} contract */
contract('UniswapExchange - Trades', (accounts) => {

    let token: ERC20MintableInstance;
    let uniswapFactory: TestUniswapFactoryInstance;
    let uniswapExchange: TestUniswapExchangeInstance;
    const initialiser1 = accounts[1];
    const initialiser2 = accounts[2];
    const swapper1 = accounts[3];
    const swapper2 = accounts[4];

    beforeEach(async () => {
        token = await ERC20Mintable.new('ERC20Mintable', 'TST', 18);
        uniswapFactory = await UniswapFactory.new();
        uniswapExchange = await UniswapExchange.at(
            (await uniswapFactory.testLaunchExchange(token.address)).logs[0].args.exchange,
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
    it('Fallback function', async () => {
        const { transactionHash } = await web3.eth.sendTransaction(
            { from: swapper1, to: uniswapExchange.address, value: ether('0.5').toString() },
        );
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
     * @test {UniswapExchange#}
     */
    it('Fallback function fails if not sent any ether', async () => {
        await expectRevert(
            web3.eth.sendTransaction({ from: swapper1, to: uniswapExchange.address, value: '0' }),
            'Need to send some ether.',
        );
    });

    /**
     * @test {UniswapExchange#ethToTokenSwap}
     */
    it('Ether to token swap', async () => {
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const minTokens = ether('0.3');
        expectEvent(
            await uniswapExchange.ethToTokenSwap.sendTransaction(
                minTokens,
                timeout,
                { from: swapper1, value: ether('0.5').toString() },
            ),
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
    it('Ether to token swap with invalid paramaters reverts', async () => {
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const minTokens = ether('0.3');
        await expectRevert(
            uniswapExchange.ethToTokenSwap.sendTransaction(
                minTokens,
                timeout,
                { from: swapper1, value: '0' },
            ),
            'Invalid ethToTokenSwap parameters',
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
     * @test {UniswapExchange#ethToTokenPayment}
     */
    it('Ether to token payment with invalid parameters reverts', async () => {
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const minTokens = ether('0.3');
        await expectRevert(
            uniswapExchange.ethToTokenPayment.sendTransaction(
                minTokens,
                timeout,
                swapper2,
                { from: swapper1, value: '0' },
            ),
            'Invalid ethToTokenPayment parameters.',
        );
    });

    /**
     * @test {UniswapExchange#ethToTokenPayment}
     */
    it('Ether to token payment with invalid recipient reverts', async () => {
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const minTokens = ether('0.3');
        await expectRevert(
            uniswapExchange.ethToTokenPayment.sendTransaction(
                minTokens,
                timeout,
                constants.ZERO_ADDRESS,
                { from: swapper1, value: ether('0.5').toString() },
            ),
            'Invalid ethToTokenPayment recipient.',
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
    it('Token to ether swap with invalid parameters reverts', async () => {
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const minEth = ether('0.3');
        await expectRevert(
            uniswapExchange.tokenToEthSwap(0, minEth, timeout, { from: swapper1 }),
            'Invalid tokenToEthSwap parameters.',
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
        const swap = await uniswapExchange.tokenToEthPayment(
            tokenAmount,
            minEth,
            timeout,
            swapper2,
            { from: swapper1 },
        );
        expectEvent(
            swap,
            'TokenToEthPurchase',
            {
                buyer: swapper1,
                ethOut: await tracker2.delta(),
                tokensIn: tokenAmount,
            },
        );
    });

    /**
     * @test {UniswapExchange#tokenToEthSwap}
     */
    it('Token to ether payment with invalid parameters reverts', async () => {
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const minEth = ether('0.3');
        await expectRevert(
            uniswapExchange.tokenToEthPayment(0, minEth, timeout, swapper2, { from: swapper1 }),
            'Invalid tokenToEthPayment parameters.',
        );
    });

    /**
     * @test {UniswapExchange#tokenToEthSwap}
     */
    it('Token to ether payment with invalid recipient reverts', async () => {
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const tokenAmount = ether('0.5');
        const minEth = ether('0.3');
        token.mint(swapper1, tokenAmount);
        token.approve(uniswapExchange.address, tokenAmount, { from: swapper1 });
        await expectRevert(
            uniswapExchange.tokenToEthPayment(tokenAmount, minEth, timeout, constants.ZERO_ADDRESS, { from: swapper1 }),
            'Invalid tokenToEthPayment recipient.',
        );
    });

    /**
     * @test {UniswapExchange#tokenToTokenSwap}
     */
    it('Token to token swap', async () => {
        // Initialize another exchange
        const token2 = await ERC20Mintable.new('ERC20Mintable2', 'TST2', 18);
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
     * @test {UniswapExchange#tokenToTokenSwap}
     */
    it('Token to token swap with invalid parameters reverts', async () => {
        // Initialize another exchange
        const token2 = await ERC20Mintable.new('ERC20Mintable2', 'TST2', 18);
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const minEth = ether('0.2');
        await expectRevert(
            uniswapExchange.tokenToTokenSwap(
                token2.address,
                0,
                minEth,
                timeout,
                { from: swapper1 },
            ),
            'Invalid tokenToTokenSwap parameters.',
        );
    });

    /**
     * @test {UniswapExchange#tokenToTokenPayment}
     */
    it('Token to token payment', async () => {
        // Initialize another exchange
        const token2 = await ERC20Mintable.new('ERC20Mintable2', 'TST2', 18);
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

    /**
     * @test {UniswapExchange#tokenToTokenPayment}
     */
    it('Token to token payment with invalid parameters reverts', async () => {
        // Initialize another exchange
        const token2 = await ERC20Mintable.new('ERC20Mintable2', 'TST2', 18);
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const minEth = ether('0.2');
        await expectRevert(
            uniswapExchange.tokenToTokenPayment(
                token2.address,
                swapper2,
                0,
                minEth,
                timeout,
                { from: swapper1 },
            ),
            'Invalid tokenToTokenPayment parameters.',
        );
    });

    /**
     * @test {UniswapExchange#tokenToTokenPayment}
     */
    it('Token to token payment with invalid recipient reverts', async () => {
        // Initialize another exchange
        const token2 = await ERC20Mintable.new('ERC20Mintable2', 'TST2', 18);
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const tokenAmount = ether('0.5');
        const minEth = ether('0.2');
        await expectRevert(
            uniswapExchange.tokenToTokenPayment(
                token2.address,
                constants.ZERO_ADDRESS,
                tokenAmount,
                minEth,
                timeout,
                { from: swapper1 },
            ),
            'Invalid tokenToTokenPayment recipient.',
        );
    });

    /**
     * @test {UniswapExchange#getShares}
     */
    it('get shares', async () => {
        BN(await uniswapExchange.getShares(initialiser1)).should.be.bignumber.equal(new BN('1000'));
    });

    /**
     * @test {UniswapExchange#investLiquidity}
     */
    it('invest liquidity', async () => {
        await token.mint(swapper1, ether('1'));
        await token.approve(uniswapExchange.address, ether('1'), { from: swapper1 });
        const sharesBefore = await uniswapExchange.getShares(swapper1);
        expectEvent(
            await uniswapExchange.investLiquidity.sendTransaction(
                300,
                { from: swapper1, value: ether('1').toString() },
            ),
            'Investment',
            {
                liquidityProvider: swapper1,
                sharesPurchased: BN(await uniswapExchange.getShares(swapper1)).sub(sharesBefore),
            },
        );
    });

    /**
     * @test {UniswapExchange#investLiquidity}
     */
    it('invest liquidity with invalid parameters reverts', async () => {
        await expectRevert(
            uniswapExchange.investLiquidity.sendTransaction(0, { from: swapper1, value: ether('1').toString() }),
            'Invalid investLiquidity parameters.',
        );
    });

    /**
     * @test {UniswapExchange#investLiquidity}
     */
    it('invest liquidity with insufficient ether reverts', async () => {
        await expectRevert(
            uniswapExchange.investLiquidity.sendTransaction(300, { from: swapper1, value: ether('0.0001').toString() }),
            'Not enough ether sent.',
        );
    });

    /**
     * @test {UniswapExchange#investLiquidity}
     */
    it('invest liquidity with insufficient shares reverts', async () => {
        await expectRevert(
            uniswapExchange.investLiquidity.sendTransaction(2000, { from: swapper1, value: ether('1').toString() }),
            'Not enough shares purchased',
        );
    });

    /**
     * @test {UniswapExchange#divestLiquidity}
     */
    it('divest liquidity', async () => {
        const sharesBefore = await uniswapExchange.getShares(initialiser1);
        expectEvent(
            await uniswapExchange.divestLiquidity(300, ether('0.1'), ether('0.1'), { from: initialiser1 }),
            'Divestment',
            {
                liquidityProvider: initialiser1,
                sharesBurned: BN(sharesBefore).sub(await uniswapExchange.getShares(initialiser1)),
            },
        );
    });

    /**
     * @test {UniswapExchange#divestLiquidity}
     */
    it('divest liquidity with insufficient shares reverts', async () => {
        await expectRevert(
            uniswapExchange.divestLiquidity(0, ether('0.1'), ether('0.1'), { from: initialiser1 }),
            'Not enough shares to burn.',
        );
    });

    /**
     * @test {UniswapExchange#divestLiquidity}
     */
    it('divest liquidity with too much expectations reverts', async () => {
        await expectRevert(
            uniswapExchange.divestLiquidity(500, ether('1'), ether('1'), { from: initialiser1 }),
            'Tried to divest too much.',
        );
    });

});
