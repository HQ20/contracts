import { should } from 'chai';
import { WhitelistInterfaceIdInstance } from '../../../types/truffle-contracts';

const WhitelistInterfaceId = artifacts.require(
    './examples/introspection/erc165/WhitelistInterfaceId.sol',
) as Truffle.Contract<WhitelistInterfaceIdInstance>;

should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../../utils');

/** @test {WhitelistInterfaceId} contract */
contract('WhitelistInterfaceId', (accounts) => {
    let whitelistInterfaceId: WhitelistInterfaceIdInstance;

    /**
     * @test {WhitelistInterfaceId#calc}
     */
    it('calculates the interface id for IWhitelist', async () => {
        whitelistInterfaceId = await WhitelistInterfaceId.new();
        // tslint:disable-next-line no-console
        console.log(await whitelistInterfaceId.calc());
    });

    it('checks the constant interface id for IWhitelist', async () => {
        whitelistInterfaceId = await WhitelistInterfaceId.new();
        const id = (await whitelistInterfaceId.calc());
        id.should.be.equal(await whitelistInterfaceId.IWHITELIST_ID());
    });
});
