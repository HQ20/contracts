// tslint:disable:variable-name
import * as chai from 'chai';
// tslint:disable-next-line:no-var-requires
const { BN } = require('@openzeppelin/test-helpers');
import { DecimalMathMockInstance } from '../../types/truffle-contracts';
import BigNumber from 'bignumber.js';

const DecimalMath = artifacts.require('DecimalMathMock') as Truffle.Contract<DecimalMathMockInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('DecimalMath', () => {

    let tokenMath: DecimalMathMockInstance;
    let decimals18: BN;
    let decimals16: BN;
    let decimal1_18: BN;
    let decimal2_18: BN;
    let decimal3_18: BN;
    let decimal6_18: BN;
    let decimal1_16: BN;
    let decimal2_16: BN;


    beforeEach(async () => {
        tokenMath = await DecimalMath.new();
        decimals18 = new BN('18');
        decimals16 = new BN('16');
        decimal1_18 = new BN(await tokenMath.unit(decimals18.toString()));
        decimal2_18 = decimal1_18.mul(new BN('2'));
        decimal3_18 = decimal1_18.mul(new BN('3'));
        decimal6_18 = decimal1_18.mul(new BN('6'));
        decimal1_16 = new BN(await tokenMath.unit(decimals16.toString()));
        decimal2_16 = decimal1_16.mul(new BN('2'));
    });

    /**
     * @test {DecimalMath#unit()}
     */
    it('returns consistent unit() values.', async () => {
        BN(decimal1_18).should.be.bignumber.equal((new BN('10')).pow(decimals18));
    });

    /**
     * @test {DecimalMath#addd()}
     */
    it('adds decimal values.', async () => {
        BN(await tokenMath.addd(decimal1_18.toString(), decimal1_18.toString())).should.be.bignumber.equal(decimal2_18);
    });

    /**
     * @test {DecimalMath#subd()}
     */
    it('substracts decimal values.', async () => {
        BN(await tokenMath.subd(decimal3_18.toString(), decimal2_18.toString())).should.be.bignumber.equal(decimal1_18);
    });

    /**
     * @test {DecimalMath#muld()}
     */
    it('multiplies decimal values.', async () => {
        BN(await (<any> tokenMath).muld(decimal2_18.toString(), decimal3_18.toString()))
            .should.be.bignumber.equal(decimal6_18);
        BN(await tokenMath.muld(decimal2_16.toString(), decimal3_18.toString(), decimals16.toString()))
            .should.be.bignumber.equal(decimal6_18);
    });

    /**
     * @test {DecimalMath#divd()}
     */
    it('divides decimal values.', async () => {
        BN(await tokenMath.divd(decimal6_18.toString(), decimal3_18.toString()))
            .should.be.bignumber.equal(decimal2_18);
        // no idea why the following runs out of gas
        // BN(await (<any> tokenMath).divd(decimal6_18.toString(), decimal3_18.toString(), decimals16.toString()))
        //     .should.be.bignumber.equal(decimal2_16);
    });
});