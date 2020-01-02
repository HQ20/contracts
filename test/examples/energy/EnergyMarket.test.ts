import { BigNumber } from 'bignumber.js';
// tslint:disable-next-line:no-var-requires
import { EnergyMarketInstance } from '../../../types/truffle-contracts';

const EnergyMarket = artifacts.require(
    './examples/energy/EnergyMarket.sol',
    ) as Truffle.Contract<EnergyMarketInstance>;

// tslint:disable:no-var-requires
const chai = require('chai');
const girino = require('girino');
// tslint:enable:no-var-requires

const { expect } = chai;

chai.use(girino);

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
     * @test {EnergyMarket#produce}
     */
    it('Produce energy', async () => {
        expect(energyMarket.produce({ from: authorized })).to.emit('EnergyProduced').withArgs(authorized);
    });

    /**
     * @test {EnergyMarket#produce}
     */
    it('Produce throws with unauthorized producer', async () => {
        expect(energyMarket.produce({ from: unauthorized })).to.revertWith('Unknown meter.');
    });

    /**
     * @test {EnergyMarket#consume}
     */
    it('Consume energy', async () => {
        await energyMarket.produce({from: authorized });
        await energyMarket.approve(energyMarket.address, await energyMarket.getConsumptionPrice(), { from: authorized });
        expect(energyMarket.consume({ from: authorized })).to.emit('EnergyConsumed').withArgs(authorized);
    });

    /**
     * @test {EnergyMarket#consume}
     */
    it('Consume throws with unauthorized consumer', async () => {
        expect(energyMarket.consume({ from: unauthorized })).to.revertWith('Unknown meter.');
    });

    /**
     * @test {EnergyMarket#consume}
     */
    it('Consume throws if consumer has insufficient balance', async () => {
        expect(energyMarket.consume({ from: authorized })).to.revert;
    });
});
