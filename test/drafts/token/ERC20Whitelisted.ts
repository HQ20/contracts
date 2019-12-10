import { should } from 'chai';
import { WhitelistInstance } from '../../../types/truffle-contracts';
import { ERC20WhitelistedInstance } from '../../../types/truffle-contracts';

const Whitelist = artifacts.require(
    './drafts/access/Whitelist.sol',
) as Truffle.Contract<WhitelistInstance>;
const ERC20Whitelisted = artifacts.require(
    './drafts/token/ERC20Whitelisted.sol',
) as Truffle.Contract<ERC20WhitelistedInstance>;
should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../../utils');

/** @test {ERC20Whitelisted} contract */
contract('ERC20Whitelisted', (accounts) => {
    let whitelist: WhitelistInstance;
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
            await ERC20Whitelisted.new(root, { from: root });
        },
        'Address is not IWhitelist.',
    );

    /**
     * @test {ERC20Whitelisted#constructor}
     */
    it('constructor succeeds if called with an address implementing IWhitelist.', async () => {
        whitelist = await Whitelist.new();
        erc20Whitelisted = await ERC20Whitelisted.new(whitelist.address);
    });
});
