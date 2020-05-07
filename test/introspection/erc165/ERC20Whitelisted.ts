import { should } from 'chai';
import { WhitelistERC165Instance } from '../../../types/truffle-contracts';
import { ERC20WhitelistedInstance } from '../../../types/truffle-contracts';
import { ERC20WhitelistedMockInstance } from '../../../types/truffle-contracts';

const Whitelist = artifacts.require(
    './examples/introspection/erc165/WhitelistERC165.sol',
) as Truffle.Contract<WhitelistERC165Instance>;
const ERC20Whitelisted = artifacts.require(
    './examples/introspection/erc165/ERC20Whitelisted.sol',
) as Truffle.Contract<ERC20WhitelistedInstance>;
const ERC20WhitelistedMock = artifacts.require(
    './test/examples/introspection/erc165/ERC20WhitelistedMock.sol',
) as Truffle.Contract<ERC20WhitelistedMockInstance>;
should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../../utils');

/** @test {ERC20Whitelisted} contract */
contract('ERC20Whitelisted', (accounts) => {
    let whitelist: WhitelistERC165Instance;
    let erc20Whitelisted: ERC20WhitelistedInstance;
    const root = accounts[0];
    // const whitelistedUser = accounts[1];
    // const notWhitelistedUser = accounts[2];


    /**
     * @test {ERC20Whitelisted#constructor}
     */
    itShouldThrow(
        'constructor throws if called with an address not implementing IWhitelist.',
        async () => {
            await ERC20Whitelisted.new('name', 'symbol', root, { from: root });
        },
        'Address is not IWhitelist.',
    );

    /**
     * @test {ERC20Whitelisted#constructor}
     */
    it('constructor succeeds if called with an address implementing IWhitelist.', async () => {
        whitelist = await Whitelist.new();
        erc20Whitelisted = await ERC20Whitelisted.new('name', 'symbol', whitelist.address);
    });
});

/** @test {ERC20Whitelisted} contract */
contract('ERC20Whitelisted', (accounts) => {
    let whitelist: WhitelistERC165Instance;
    let erc20Whitelisted: ERC20WhitelistedMockInstance;
    const root = accounts[0];
    const whitelistedUser = accounts[1];
    const notWhitelistedUser = accounts[2];

    beforeEach(async () => {
        whitelist = await Whitelist.new();
        erc20Whitelisted = await ERC20WhitelistedMock.new('name', 'symbol', whitelist.address);
    });

    /**
     * @test {ERC20WhitelistedMock#mint}
     */
    itShouldThrow(
        'mint throws if called by non owner.',
        async () => {
            await erc20Whitelisted.mint(root, 1000000, { from: notWhitelistedUser });
        },
        'Ownable: caller is not the owner',
    );

    /**
     * @test {ERC20Whitelisted#_mint}
     */
    itShouldThrow(
        '_mint throws if recipient not in whitelist.',
        async () => {
            await erc20Whitelisted.mint(notWhitelistedUser, 1000000, { from: root });
        },
        'Recipient not in whitelist.',
    );

    /**
     * @test {ERC20Whitelisted#_mint}
     */
    it('_mint sends tokens to whitelisted addresses.', async () => {
        const mintedAmount = 1000000;
        await whitelist.addMember(whitelistedUser, { from: root });
        await erc20Whitelisted.mint(whitelistedUser, mintedAmount, { from: root });
        const userBalance = (await erc20Whitelisted.balanceOf(whitelistedUser, { from: root }));
        userBalance.toNumber().should.be.equal(mintedAmount);
    });
});


/** @test {ERC20Whitelisted} contract */
contract('ERC20Whitelisted', (accounts) => {
    let whitelist: WhitelistERC165Instance;
    let erc20Whitelisted: ERC20WhitelistedMockInstance;
    const root = accounts[0];
    const whitelistedUser1 = accounts[1];
    const whitelistedUser2 = accounts[2];
    const notWhitelistedUser = accounts[3];
    const mintedAmount = 1000000;

    beforeEach(async () => {
        whitelist = await Whitelist.new();
        erc20Whitelisted = await ERC20WhitelistedMock.new('name', 'symbol', whitelist.address);
        await whitelist.addMember(whitelistedUser1, { from: root });
        await whitelist.addMember(whitelistedUser2, { from: root });
        await erc20Whitelisted.mint(whitelistedUser1, mintedAmount, { from: root });
    });

    /**
     * @test {ERC20Whitelisted#transfer}
     */
    itShouldThrow(
        'transfer throws if recipient not in whitelist.',
        async () => {
            await erc20Whitelisted.transfer(
                notWhitelistedUser,
                mintedAmount,
                { from: whitelistedUser1 },
            );
        },
        'Recipient not in whitelist.',
    );

    /**
     * @test {ERC20Whitelisted#transfer}
     */
    it('transfer sends tokens to whitelisted addresses.', async () => {
        await erc20Whitelisted.transfer(
            whitelistedUser2,
            mintedAmount,
            { from: whitelistedUser1 },
        );
        const userBalance = (await erc20Whitelisted.balanceOf(whitelistedUser2, { from: root }));
        userBalance.toNumber().should.be.equal(mintedAmount);
    });

    /**
     * @test {ERC20Whitelisted#transferFrom}
     */
    itShouldThrow(
        'transferFrom throws if recipient not in whitelist.',
        async () => {
            await erc20Whitelisted.transferFrom(
                whitelistedUser1,
                notWhitelistedUser,
                mintedAmount,
                { from: root },
            );
        },
        'Recipient not in whitelist.',
    );

    /**
     * @test {ERC20Whitelisted#transferFrom}
     */
    it('transferFrom sends tokens to whitelisted addresses.', async () => {
        await erc20Whitelisted.approve(root, mintedAmount, { from: whitelistedUser1 });
        await erc20Whitelisted.transferFrom(
            whitelistedUser1,
            whitelistedUser2,
            mintedAmount,
            { from: root },
        );
        const userBalance = (await erc20Whitelisted.balanceOf(whitelistedUser2, { from: root }));
        userBalance.toNumber().should.be.equal(mintedAmount);
    });
});
