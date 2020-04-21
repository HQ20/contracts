import { should } from 'chai';
import { TestAuthorizedAccessInstance } from '../../types/truffle-contracts';

const TestAuthorizedAccess = artifacts.require(
    'TestAuthorizedAccess'
) as Truffle.Contract<TestAuthorizedAccessInstance>;

should();

// tslint:disable:no-var-requires
const { expectRevert } = require('@openzeppelin/test-helpers');

contract('AuthorizedAccess', async (accounts) =>    {
    let testAccess: TestAuthorizedAccessInstance;
    const [ owner, user ] = accounts;

    beforeEach(async() => {
        testAccess = await TestAuthorizedAccess.new({ from: owner });
    });

    it('unauthorized access is rejected', async() => {
        const err = 'Error';
        await expectRevert(
            testAccess.testOnlyAuthorized(err, { from: user }),
            err,
        );
    });

    it('addresses can be granted access', async() => {
        const tx = await testAccess.grantAccess(user, { from: owner });
        assert.equal(
            tx.logs[0].event,
            'GrantedAccess',
        );
    });

    describe('with authorized users', async() => {
        beforeEach(async() => {
            await testAccess.grantAccess(user, { from: owner });
        });

        it('authorized access is allowed', async() => {
            const err = 'Error';
            assert(await testAccess.testOnlyAuthorized(err, { from: user }));
        });

        it('addresses can be revoked access', async() => {
            const tx = await testAccess.revokeAccess(user, { from: owner });
            assert.equal(
                tx.logs[0].event,
                'RevokedAccess',
            );
        });
    });
});
