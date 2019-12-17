import { should } from 'chai';
import { IWhitelistIdInstance } from '../../../../types/truffle-contracts';

const IWhitelistId = artifacts.require(
    './examples/introspection/erc165/IWhitelistId.sol',
) as Truffle.Contract<IWhitelistIdInstance>;

should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../../../utils');

/** @test {IWhitelistId} contract */
contract('IWhitelistId', (accounts) => {
    let iWhitelistId: IWhitelistIdInstance;

    /**
     * @test {IWhitelistId#calc}
     */
    it('calculates the interface id for IWhitelist', async () => {
        iWhitelistId = await IWhitelistId.new();
        // tslint:disable-next-line no-console
        console.log(await iWhitelistId.calc());
    });

    it('checks the constant interface id for IWhitelist', async () => {
        iWhitelistId = await IWhitelistId.new();
        const id = (await iWhitelistId.calc());
        id.should.be.equal(await iWhitelistId.IWHITELIST_ID());
    });
});
