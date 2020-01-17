const StringConversion = artifacts.require('./StringConversion.sol');
const RBAC = artifacts.require('./access/RBAC.sol');
const EnumerableSet = artifacts.require('./drafts/lists/EnumerableSet.sol');
const EnumerableSetMock = artifacts.require('./drafts/lists/mocks/EnumerableSetMock.sol');

module.exports = async (deployer, network, accounts) => {
    deployer.deploy(StringConversion);
    deployer.deploy(RBAC, accounts[0]);
    deployer.deploy(EnumerableSet);
    deployer.link(EnumerableSet, EnumerableSetMock);
    deployer.deploy(EnumerableSetMock);
};