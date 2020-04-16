import chai = require('chai');
// tslint:disable-next-line:no-var-requires
const { balance, BN, constants, ether, expectEvent, expectRevert, send } = require('@openzeppelin/test-helpers');
import { ERC20MintableInstance } from '../../types/truffle-contracts';
import { UniswapFactoryInstance } from '../../types/truffle-contracts';

// tslint:disable-next-line:max-line-length
const ERC20Mintable = artifacts.require('ERC20Mintable') as Truffle.Contract<ERC20MintableInstance>;
const UniswapFactory = artifacts.require('UniswapFactory') as Truffle.Contract<UniswapFactoryInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

/** @test {UniswapFactory} contract */
contract('UniswapFactory - launchExchange', (accounts) => {

    /**
     * @test {UniswapFactory#launchExchange}
     */
    it('Launch an exchange for test token.', async () => {
        const token = await ERC20Mintable.new('ERC20Mintable', 'TST', 18);
        const uniswapFactory = await UniswapFactory.new();
        expectEvent(
            await uniswapFactory.launchExchange(token.address),
            'ExchangeLaunch',
            {
                token: token.address,
            },
        );
    });

    /**
     * @test {UniswapFactory#launchExchange}
     */
    it('Cannot launch an exchnage for an already existing token', async () => {
        const token = await ERC20Mintable.new('ERC20Mintable', 'TST', 18);
        const uniswapFactory = await UniswapFactory.new();
        await uniswapFactory.launchExchange(token.address);
        await expectRevert(
            uniswapFactory.launchExchange(token.address),
            'Already an exchange for that.',
        );
    });

    /**
     * @test {UniswapFactory#launchExchange}
     */
    it('Cannot launch an exchnage with invalid token address', async () => {
        const uniswapFactory = await UniswapFactory.new();
        await expectRevert(
            uniswapFactory.launchExchange(constants.ZERO_ADDRESS),
            'Not a valid token address.',
        );
    });

});

/** @test {UniswapFactory} contract */
contract('UniswapFactory - view methods', (accounts) => {
    let token: ERC20MintableInstance;
    let uniswapFactory: UniswapFactoryInstance;

    beforeEach(async () => {
        token = await ERC20Mintable.new('ERC20Mintable', 'TST', 18);
        uniswapFactory = await UniswapFactory.new();
        await uniswapFactory.launchExchange(token.address);
    });

    /**
     * @test {UniswapFactory#getExchangeCount}
     */
    it('getExchangeCount', async () => {
        (await uniswapFactory.getExchangeCount()).toNumber().should.be.equal(1);
    });

    /**
     * @test {UniswapFactory#tokenToExchangeLookup} and {UniswapFactory#exchangeToTokenLookup}
     */
    it('address lookups', async () => {
        const mockAddress = '0x0000000000000000000000000000000000000001';

        const exchangeAddress = (await uniswapFactory.tokenToExchangeLookup(token.address));
        exchangeAddress.should.be.not.equal(constants.ZERO_ADDRESS);
        const tokenAddress = (await uniswapFactory.exchangeToTokenLookup(exchangeAddress));
        tokenAddress.should.be.equal(token.address);

        const noExchangeAddress = (await uniswapFactory.tokenToExchangeLookup(mockAddress));
        noExchangeAddress.should.be.equal(constants.ZERO_ADDRESS);
        const noTokenAddress = (await uniswapFactory.exchangeToTokenLookup(mockAddress));
        noTokenAddress.should.be.equal(constants.ZERO_ADDRESS);
    });
});
