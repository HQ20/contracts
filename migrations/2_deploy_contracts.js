const StringConversion = artifacts.require('./StringConversion.sol');

module.exports = async (deployer, network, accounts) => {
    deployer.deploy(StringConversion);
};