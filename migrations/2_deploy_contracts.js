const SimpleStorage = artifacts.require('./SimpleStorage.sol');

module.exports = (deployer) => {
    deployer.deploy(SimpleStorage);
};
