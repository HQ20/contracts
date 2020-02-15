import { should } from 'chai';
import { StringConversionInstance } from '../../../types/truffle-contracts';

const StringConversion = artifacts.require('StringConversion')  as Truffle.Contract<StringConversionInstance>;
should();

/** @test {StringConversion} contract */
contract('StringConversion', () => {
    let stringConversionInstance: StringConversionInstance;
    const originalString = 'test string';

    /**
     * Test the two contract methods
     * @test {StringConversion#bytes32ToString} and {StringConversion#stringToBytes32}
     */
    beforeEach(async () => {
        stringConversionInstance = await StringConversion.new();
    });

    it('Extract characters from bytes32', async () => {
        const convertedBytes32 = stringToBytes32(originalString);
        for (let i = 0; i < originalString.length; i += 1) {
            // eslint-disable-next-line no-await-in-loop
            const bytes1Char = await stringConversionInstance.byteAt(convertedBytes32, i);
            const stringChar = bytes32ToString(bytes1Char);
            stringChar.should.be.equal(originalString.charAt(i));
        }
    });

    it('Convert from bytes32 to string', async () => {
        const convertedBytes32 = stringToBytes32(originalString);
        const convertedString = await stringConversionInstance.bytes32ToString(convertedBytes32);
        convertedString.should.be.equal(originalString);
    });

    it('Convert from string to bytes32', async () => {
        const convertedBytes32 = await stringConversionInstance.stringToBytes32(originalString);
        const convertedString = bytes32ToString(convertedBytes32);
        convertedString.should.be.equal(originalString);
    });
});

function stringToBytes32(input: string) {
    return web3.utils.fromAscii(input);
}

function bytes32ToString(input: string) {
    return web3.utils.toAscii(input).replace(/\0/g, '');
}
