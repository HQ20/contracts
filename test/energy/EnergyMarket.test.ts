// tslint:disable:no-var-requires
import * as chai from 'chai';
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');
import { EnergyMarketInstance } from '../../types/truffle-contracts';

const EnergyMarket = artifacts.require('EnergyMarket') as Truffle.Contract<EnergyMarketInstance>;

chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('EnergyMarket', (accounts) => {
    const [ owner, authorized, unauthorized ] = accounts;

    let energyMarket: EnergyMarketInstance;

    const initialSupply = 1000000;
    const basePrice = 10;

    const timeSlot = 1;

    beforeEach(async () => {
        energyMarket = await EnergyMarket.new(
            initialSupply,
            basePrice,
            { from: owner },
        );
        await energyMarket.addUser(authorized, { from: owner });
    });

    /**
     * @test {EnergyMarket#produce}
     */
    it('Produce energy', async () => {
        expectEvent(
            await energyMarket.produce(timeSlot, { from: authorized }),
            'EnergyProduced',
            {
                producer: authorized,
                time: new BN(timeSlot.toString()),
            },
        );
    });

    /**
     * @test {EnergyMarket#produce}
     */
    it('Produce throws with unauthorized producer', async () => {
        await expectRevert(
            energyMarket.produce(timeSlot, { from: unauthorized }),
            'Unknown meter.',
        );
    });

    /**
     * @test {EnergyMarket#consume}
     */
    it('Consume energy', async () => {
        await energyMarket.produce(timeSlot, {from: authorized });
        await energyMarket.approve(
            energyMarket.address, await energyMarket.getConsumptionPrice(1), { from: authorized },
        );
        expectEvent(
            await energyMarket.consume(timeSlot, { from: authorized }),
            'EnergyConsumed',
            {
                consumer: authorized,
                time: new BN(timeSlot.toString()),
            },
        );
    });

    /**
     * @test {EnergyMarket#consume}
     */
    it('Consume throws with unauthorized consumer', async () => {
        await expectRevert(
            energyMarket.consume(timeSlot, { from: unauthorized }),
            'Unknown meter.',
        );
    });

    /**
     * @test {EnergyMarket#consume}
     */
    it('Consume throws if consumer has insufficient balance', async () => {
        await expectRevert.unspecified(energyMarket.consume(timeSlot, { from: authorized }));
    });
});
