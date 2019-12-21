import { BigNumber } from 'bignumber.js';
import { should } from 'chai';
// tslint:disable-next-line:no-var-requires
import { EnergyMarketInstance } from '../../../types/truffle-contracts';

const EnergyMarket = artifacts.require(
    './drafts/energy/EnergyMarket.sol',
    ) as Truffle.Contract<EnergyMarketInstance>;

should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../../utils');

contract('EnergyMarket', (accounts) => {
    const owner = accounts[0];
    const authorized = accounts[1];
    const unauthorized = accounts[2];

    let energyMarket: EnergyMarketInstance;

    const initialSupply = 1000000;
    const maxPrice = 10;

    beforeEach(async () => {
        energyMarket = await EnergyMarket.new(
            initialSupply,
            maxPrice,
        );
        await energyMarket.addMember(authorized);
    });

    /**
     * @test {EnergyMarket#}
     */
    // it('', async () => {
    // });

    /**
     * @test {EnergyMarket#}
     */
    // itShouldThrow('', async () => {
    // }, 'Error message.');
});
