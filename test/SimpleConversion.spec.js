const chai = require('chai');

const SimpleConversion = artifacts.require('./SimpleConversion.sol');
chai.should();

/** @test {SimpleConversion} contract */
contract('SimpleConversion', (accounts) => {
    /**
     * Test the two contract methods
     * @test {SimpleConversion#bytes32ToString} and {SimpleConversion#stringToBytes32}
     */
    it('Should correctly convert from bytes32 to string and back', async () => {
        const SimpleConversionInstance = await SimpleConversion.deployed();
        (await SimpleConversionInstance.bytes32ToString(web3.utils.fromAscii('converted'))).should.be.equal('converted');
        web3.utils.toAscii(
            (
                await SimpleConversionInstance.stringToBytes32('converted')
            ),
        ).replace(/\0/g, '').should.be.equal('converted');
    });
});
