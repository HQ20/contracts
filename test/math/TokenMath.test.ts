import * as chai from 'chai';
// tslint:disable-next-line:no-var-requires
const { BN } = require('@openzeppelin/test-helpers');
import { TokenMathMockInstance } from '../../types/truffle-contracts';

const TokenMath = artifacts.require('TokenMathMock') as Truffle.Contract<TokenMathMockInstance>;

// tslint:disable-next-line:no-var-requires
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('TokenMath', () => {

    let tokenMath: TokenMathMockInstance;
    let fixed1: BN;
    let fixed2: BN;
    let fixed3: BN;
    let fixed6: BN;
    let decimals: BN;

    beforeEach(async () => {
        tokenMath = await TokenMath.new();
        fixed1 = new BN(await tokenMath.fixed1());
        fixed2 = fixed1.mul(new BN('2'));
        fixed3 = fixed1.mul(new BN('3'));
        fixed6 = fixed1.mul(new BN('6'));
        decimals = new BN(await tokenMath.decimals());
    });

    /**
     * @test {TokenMath#fixed1()} and {TokenMath#decimals()}
     */
    it('returns consistent fixed1() and decimals() values.', async () => {
        BN(fixed1).should.be.bignumber.equal((new BN('10')).pow(decimals));
    });

    /**
     * @test {TokenMath#addf()}
     */
    it('adds values.', async () => {
        BN(await tokenMath.addf(fixed1.toString(), fixed1.toString())).should.be.bignumber.equal(fixed2);
    });

    /**
     * @test {TokenMath#subf()}
     */
    it('substracts values.', async () => {
        BN(await tokenMath.subf(fixed3.toString(), fixed2.toString())).should.be.bignumber.equal(fixed1);
    });

    /**
     * @test {TokenMath#mulf()}
     */
    it('multiplies values.', async () => {
        BN(await tokenMath.mulf(fixed2.toString(), fixed3.toString())).should.be.bignumber.equal(fixed6);
    });

    /**
     * @test {TokenMath#divf()}
     */
    it('divides values.', async () => {
        BN(await tokenMath.divf(fixed6.toString(), fixed3.toString())).should.be.bignumber.equal(fixed2);
    });

    /**
     * @test {TokenMath#split()}
     */
    it('splits integer and fractional part.', async () => {
        const result = await tokenMath.split(fixed2.add(new BN('1')).toString());
        BN(result[0]).should.be.bignumber.equal(fixed2);
        BN(result[1]).should.be.bignumber.equal(new BN('1'));
    });
});