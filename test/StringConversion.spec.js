const chai = require('chai');

const StringConversion = artifacts.require('./StringConversion.sol');
chai.should();

/** @test {StringConversion} contract */
contract('StringConversion', () => {
    let stringConversion;
    const originalString = 'test string';

    /**
     * Test the two contract methods
     * @test {StringConversion#bytes32ToString} and {StringConversion#stringToBytes32}
     */
    beforeEach(async () => {
        stringConversion = await StringConversion.deployed();
    });

    it('Extract characters from bytes32', async () => {
        const convertedBytes32 = web3.utils.fromAscii(originalString);
        for (let i = 0; i < originalString.length; i += 1) {
            // eslint-disable-next-line no-await-in-loop
            const bytes1Char = await stringConversion.byteAt(convertedBytes32, i);
            const stringChar = web3.utils.toAscii(bytes1Char).replace(/\0/g, '');
            stringChar.should.be.equal(originalString.charAt(i));
        }
    });

    it('Convert from bytes32 to string', async () => {
        const convertedBytes32 = web3.utils.fromAscii(originalString);
        const convertedString = await stringConversion.bytes32ToString(convertedBytes32);
        convertedString.should.be.equal(originalString);
    });

    it('Convert from string to bytes32', async () => {
        const convertedBytes32 = await stringConversion.stringToBytes32(originalString);
        const convertedString = web3.utils.toAscii(convertedBytes32).replace(/\0/g, '');
        convertedString.should.be.equal(originalString);
    });
});
