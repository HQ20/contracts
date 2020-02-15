import { should } from 'chai';
import { ERC20MintableHQ20Instance } from '../../../types/truffle-contracts';
// tslint:disable-next-line no-var-requires
const { BN, expectRevert } = require('@openzeppelin/test-helpers');
const ERC20Mintable = artifacts.require('ERC20MintableHQ20') as Truffle.Contract<ERC20MintableHQ20Instance>;

should();

contract('ERC20MintableHQ20', (accounts) => {

    const admin = accounts[0];
    const user = accounts[1];
    const other = accounts[2];

    let token: ERC20MintableHQ20Instance;

    beforeEach(async () => {
        token = await ERC20Mintable.new(admin);
        await token.addUser(user);
    });

    /**
     * @test {ERC20Mintable#mint}
     */
    it('minting is restricted to users', async () => {
        await expectRevert(
            token.mint(other, 1, { from: other }),
            'Restricted to users.',
        );
    });

    /**
     * @test {ERC20Mintable#mint}
     */
    it('minters can mint', async () => {
        await token.mint(other, 1, { from: user });
        BN(await token.balanceOf(other)).should.be.bignumber.equal('1');
    });
});
