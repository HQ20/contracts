const StringConversion = artifacts.require('./StringConversion.sol');
const RBAC = artifacts.require('./access-control/RBAC.sol');

module.exports = async (deployer, network, accounts) => {
    deployer.deploy(StringConversion);
    deployer.deploy(RBAC, accounts[0]);
};
