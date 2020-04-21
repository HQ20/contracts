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
contract('UniswapExchange - Internal Trades', (accounts) => {

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
     * @test {UniswapExchange#ethToToken}
     */
    it('eth to token internal', async () => {
        expectEvent(
            await uniswapExchange.testEthToToken(
                swapper1,
                swapper2,
                ether('0.5').toString(),
                ether('0.3').toString(),
                { from: swapper1 },
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
     * @test {UniswapExchange#ethToToken}
     */
    it('eth to token internal with tokens out of range reverts', async () => {
        await expectRevert(
            uniswapExchange.testEthToToken.call(
                swapper1,
                swapper2,
                ether('0.5'),
                ether('0.5'),
            ),
            'tokensOut not in range.',
        );
    });

    /**
     * @test {UniswapExchange#tokenToEth}
     */
    it('token to eth internal', async () => {
        const tokenAmount = ether('0.5');
        token.mint(swapper1, tokenAmount);
        token.approve(uniswapExchange.address, tokenAmount, { from: swapper1 });
        const tracker2 = await balance.tracker(swapper2);
        tracker2.get();
        expectEvent(
            await uniswapExchange.testTokenToEth(
                swapper1,
                swapper2,
                tokenAmount,
                ether('0.3'),
            ),
            'TokenToEthPurchase',
            {
                buyer: swapper1,
                ethOut: await tracker2.delta(),
                tokensIn: tokenAmount,
            },
        );
    });

    /**
     * @test {UniswapExchange#ethToToken}
     */
    it('token to eth internal with ether out of range reverts', async () => {
        const tracker2 = await balance.tracker(swapper2);
        tracker2.get();
        await expectRevert(
            uniswapExchange.testTokenToEth(
                swapper1,
                swapper2,
                ether('0.5'),
                ether('0.5'),
            ),
            'ethOut not in range',
        );
    });

    /**
     * @test {UniswapExchange#tokenToTokenOut}
     */
    it('Token to token out internal', async () => {
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
        const swap = await uniswapExchange.testTokenToTokenOut(
            token2.address,
            swapper1,
            swapper2,
            tokenAmount,
            minEth,
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
     * @test {UniswapExchange#tokenToTokenOut}
     */
    it('Token to token out internal with invalid purchased token address reverts', async () => {
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const tokenAmount = ether('0.5');
        const minEth = ether('0.2');
        await expectRevert(
            uniswapExchange.testTokenToTokenOut(
                constants.ZERO_ADDRESS,
                swapper1,
                swapper2,
                tokenAmount,
                minEth,
            ),
            'Invalid purchased token address.',
        );
    });

    /**
     * @test {UniswapExchange#tokenToTokenOut}
     */
    it('Token to token out internal with invalid exchange address reverts', async () => {
        const token2 = await ERC20Mintable.new('ERC20Mintable2', 'TST2', 18);
        const timeout = Math.floor((new Date().getTime()) / 1000) + 3600;
        const tokenAmount = ether('0.5');
        const minEth = ether('0.2');
        await expectRevert(
            uniswapExchange.testTokenToTokenOut(
                token2.address,
                swapper1,
                swapper2,
                tokenAmount,
                minEth,
            ),
            'Invalid exchange address.',
        );
    });

});
