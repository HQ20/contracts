import * as chai from 'chai';
// tslint:disable-next-line:no-var-requires
const { BN } = require('@openzeppelin/test-helpers');
import { DecimalMathMockInstance } from '../../types/truffle-contracts';

const DecimalMath = artifacts.require('DecimalMathMock') as Truffle.Contract<DecimalMathMockInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('DecimalMath', () => {

    let tokenMath: DecimalMathMockInstance;
    let decimal1: BN;
    let decimal2: BN;
    let decimal3: BN;
    let decimal6: BN;
    let decimals: BN;

    beforeEach(async () => {
        tokenMath = await DecimalMath.new();
        decimal1 = new BN(await tokenMath.decimal1());
        decimal2 = decimal1.mul(new BN('2'));
        decimal3 = decimal1.mul(new BN('3'));
        decimal6 = decimal1.mul(new BN('6'));
        decimals = new BN(await tokenMath.decimals());
    });

    /**
     * @test {DecimalMath#decimal1()} and {DecimalMath#decimals()}
     */
    it('returns consistent decimal1() and decimals() values.', async () => {
        BN(decimal1).should.be.bignumber.equal((new BN('10')).pow(decimals));
    });

    /**
     * @test {DecimalMath#addd()}
     */
    it('adds decimal values.', async () => {
        BN(await tokenMath.addd(decimal1.toString(), decimal1.toString())).should.be.bignumber.equal(decimal2);
    });

    /**
     * @test {DecimalMath#subd()}
     */
    it('substracts decimal values.', async () => {
        BN(await tokenMath.subd(decimal3.toString(), decimal2.toString())).should.be.bignumber.equal(decimal1);
    });

    /**
     * @test {DecimalMath#muld()}
     */
    it('multiplies decimal values.', async () => {
        BN(await tokenMath.muld(decimal2.toString(), decimal3.toString())).should.be.bignumber.equal(decimal6);
    });

    /**
     * @test {DecimalMath#divd()}
     */
    it('divides decimal values.', async () => {
        BN(await tokenMath.divd(decimal6.toString(), decimal3.toString())).should.be.bignumber.equal(decimal2);
    });
});