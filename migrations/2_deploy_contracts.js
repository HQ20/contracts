const StringConversion = artifacts.require('./StringConversion.sol');

module.exports = (deployer) => {
    deployer.deploy(StringConversion);
};
