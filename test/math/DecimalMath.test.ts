// tslint:disable:variable-name
import * as chai from 'chai';
// tslint:disable-next-line:no-var-requires
const { BN, expectRevert } = require('@openzeppelin/test-helpers');
import { DecimalMathMockInstance } from '../../types/truffle-contracts';

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
    let decimal4_18: BN;
    let decimal6_18: BN;
    let decimal1_16: BN;
    let decimal2_16: BN;
    let minus1: BN;

    beforeEach(async () => {
        tokenMath = await DecimalMath.new();
        decimals18 = new BN('18');
        decimals16 = new BN('16');
        decimal1_18 = new BN(await tokenMath.unit(decimals18.toString()));
        decimal2_18 = decimal1_18.mul(new BN('2'));
        decimal3_18 = decimal1_18.mul(new BN('3'));
        decimal4_18 = decimal1_18.mul(new BN('4'));
        decimal6_18 = decimal1_18.mul(new BN('6'));
        decimal1_16 = new BN(await tokenMath.unit(decimals16.toString()));
        decimal2_16 = decimal1_16.mul(new BN('2'));
        minus1 = new BN('-1');
    });

    /**
     * @test {DecimalMath#unit()}
     */
    it('rejects units beyond MAXINT256.', async () => {
        await expectRevert(
            tokenMath.unit(new BN('78')),
            'Too many decimals',
        );
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
        BN(await tokenMath.addd(
            decimal1_18.toString(),
            decimal1_18.toString(),
        )).should.be.bignumber.equal(decimal2_18);
        BN(await tokenMath.adddInt(
            decimal1_18.mul(minus1).toString(),
            decimal1_18.mul(minus1).toString(),
        )).should.be.bignumber.equal(decimal2_18.mul(minus1));
    });

    /**
     * @test {DecimalMath#subd()}
     */
    it('substracts decimal values.', async () => {
        BN(await tokenMath.subd(
            decimal3_18.toString(),
            decimal2_18.toString(),
        )).should.be.bignumber.equal(decimal1_18);
        BN(await tokenMath.subdInt(
            decimal3_18.mul(minus1).toString(),
            decimal2_18.mul(minus1).toString(),
        )).should.be.bignumber.equal(decimal1_18.mul(minus1));
    });

    /**
     * @test {DecimalMath#muld()}
     */
    it('multiplies decimal values.', async () => {
        BN(await tokenMath.muld(
            decimal2_18.toString(),
            decimal3_18.toString(),
        )).should.be.bignumber.equal(decimal6_18);
        BN(await tokenMath.muldInt(
            decimal2_18.mul(minus1).toString(),
            decimal3_18.toString(),
        )).should.be.bignumber.equal(decimal6_18.mul(minus1));
        BN(await tokenMath.muld2(
            decimal2_16.toString(),
            decimal3_18.toString(),
            decimals16.toString(),
        )).should.be.bignumber.equal(decimal6_18);
        BN(await tokenMath.muld2Int(
            decimal2_16.mul(minus1).toString(),
            decimal3_18.toString(),
            decimals16.toString(),
        )).should.be.bignumber.equal(decimal6_18.mul(minus1));
    });

    /**
     * @test {DecimalMath#divd()}
     */
    it('divides decimal values.', async () => {
        BN(await tokenMath.divd(
            decimal6_18.toString(),
            decimal3_18.toString(),
        )).should.be.bignumber.equal(decimal2_18);
        BN(await tokenMath.divdInt(
            decimal6_18.mul(minus1).toString(),
            decimal3_18.toString(),
        )).should.be.bignumber.equal(decimal2_18.mul(minus1));
        BN(await tokenMath.divd2(
            decimal6_18.toString(),
            decimal3_18.toString(),
            decimals16.toString(),
        )).should.be.bignumber.equal(decimal2_16);
        BN(await tokenMath.divd2Int(
            decimal6_18.mul(minus1).toString(),
            decimal3_18.toString(),
            decimals16.toString(),
        )).should.be.bignumber.equal(decimal2_16.mul(minus1));
    });

    /**
     * @test {DecimalMath#divdr()}
     */
    it('divides decimal values, rounding away from zero to the closest representable number.', async () => {
        BN(await tokenMath.divdr(
            decimal4_18.toString(),
            decimal6_18.toString(),
        )).should.be.bignumber.equal(new BN('666666666666666667'));
        BN(await tokenMath.divdrInt(
            decimal4_18.toString(),
            decimal6_18.toString(),
        )).should.be.bignumber.equal(new BN('666666666666666667'));
        BN(await tokenMath.divdrInt(
            decimal4_18.mul(minus1).toString(),
            decimal6_18.toString(),
        )).should.be.bignumber.equal((new BN('666666666666666667')).mul(minus1));
    });

    /**
     * @test {DecimalMath#divdr()}
     */
    it('divides decimal values, rounding towards zero to the closest representable number.', async () => {
        BN(await tokenMath.divdr(
            decimal2_18.toString(),
            decimal6_18.toString(),
        )).should.be.bignumber.equal(new BN('333333333333333333'));
        BN(await tokenMath.divdrInt(
            decimal2_18.toString(),
            decimal6_18.toString(),
        )).should.be.bignumber.equal(new BN('333333333333333333'));
        BN(await tokenMath.divdrInt(
            decimal2_18.mul(minus1).toString(),
            decimal6_18.toString(),
        )).should.be.bignumber.equal((new BN('333333333333333333')).mul(minus1));
    });

    /**
     * @test {DecimalMath#divdr()}
     */
    it('divides decimal values, rounding towards zero to the closest representable number.', async () => {
        BN(await tokenMath.divdrup(
            decimal2_18.toString(),
            decimal6_18.toString(),
        )).should.be.bignumber.equal(new BN('333333333333333334'));
        BN(await tokenMath.divdrupInt(
            decimal2_18.toString(),
            decimal6_18.toString(),
        )).should.be.bignumber.equal(new BN('333333333333333334'));
        BN(await tokenMath.divdrupInt(
            decimal2_18.mul(minus1).toString(),
            decimal6_18.toString(),
        )).should.be.bignumber.equal((new BN('333333333333333334')).mul(minus1));
    });
});