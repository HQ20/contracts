// tslint:disable-next-line:no-var-requires
const { balance, BN, constants, ether, expectEvent, expectRevert, send, time } = require('@openzeppelin/test-helpers');
import { ClassifiedsInstance, TestERC20MintableInstance, TestERC721MintableInstance } from '../../types/truffle-contracts';

const Classifieds = artifacts.require(
    './classifieds/Classifieds.sol',
) as Truffle.Contract<ClassifiedsInstance>;
const TestERC20Mintable = artifacts.require(
    './test/issuance/TestERC20Mintable.sol',
) as Truffle.Contract<TestERC20MintableInstance>;
const TestERC721Mintable = artifacts.require(
    './test/classifieds/TestERC721Mintable.sol',
) as Truffle.Contract<TestERC721MintableInstance>;

// tslint:disable-next-line:no-var-requires
const chai = require('chai');
chai.use(require('chai-bn')(require('bn.js')));
chai.should();

contract('Classifieds', (accounts) => {
    let snapshot: any;

    const poster = accounts[1];
    const filler = accounts[2];

    let classifieds: ClassifiedsInstance;
    let erc20token: TestERC20MintableInstance;
    let erc721token: TestERC721MintableInstance;

    const ERC721id = 0;
    const POSTER = 0;
    const ITEM = 1;
    const PRICE = 2;
    const STATUS = 3;

    beforeEach(async () => {
        snapshot = await time.latest();
        erc20token = await TestERC20Mintable.new();
        erc721token = await TestERC721Mintable.new();
        classifieds = await Classifieds.new(erc20token.address, erc721token.address);
    });

    /**
     * @test {Classifieds#openTrade}
     */
    it('openTrade emits an event to signal trade opening', async () => {
        await erc721token.mint(poster, ERC721id);
        await erc721token.approve(classifieds.address, ERC721id, { from: poster });
        expectEvent(
            await classifieds.openTrade(0, ether('1'), { from: poster }),
            'TradeStatusChange',
            {
                ad: new BN('0'),
                status: stringToBytes32('Open'),
            },
        );
    });

    /**
     * @test {Classifieds#openTrade} and {Classifieds#getTrade}
     */
    it('getTrade can succesfully retrieve a trade', async () => {
        await erc721token.mint(poster, ERC721id);
        await erc721token.approve(classifieds.address, ERC721id, { from: poster });
        await classifieds.openTrade(0, ether('1'), { from: poster });
        const tx = await classifieds.getTrade(0);
        expect(tx).to.include({
            [POSTER]: poster,
            [STATUS]: stringToBytes32('Open')
        });
        chai.expect(tx[ITEM]).to.be.bignumber.equal(new BN(ERC721id));
        chai.expect(tx[PRICE]).to.be.bignumber.equal(ether('1'));
    });

    /**
     * @test {Classifieds#executeTrade}
     */
    it('executeTrade can succesfully close a trade', async () => {
        await erc20token.mint(filler, ether('1'));
        await erc721token.mint(poster, ERC721id);
        await erc20token.approve(classifieds.address, ether('1'), { from: filler });
        await erc721token.approve(classifieds.address, ERC721id, { from: poster });
        await classifieds.openTrade(0, ether('1'), { from: poster });
        await classifieds.executeTrade(0, { from: filler });
        const tx = await classifieds.getTrade(0);
        expect(tx).to.include({
            [POSTER]: poster,
            [STATUS]: stringToBytes32('Executed')
        });
        chai.expect(tx[ITEM]).to.be.bignumber.equal(new BN(ERC721id));
        chai.expect(tx[PRICE]).to.be.bignumber.equal(ether('1'));
        expect(await erc721token.ownerOf(ERC721id)).to.be.equal(filler);
        chai.expect(await erc20token.balanceOf(poster)).to.be.bignumber.equal(ether('1'));
    });

    /**
     * @test {Classifieds#executeTrade}
     */
    it('executeTrade cannot execute trade when it is not opened', async () => {
        await erc20token.mint(filler, ether('1'));
        await erc721token.mint(poster, ERC721id);
        await erc20token.approve(classifieds.address, ether('1'), { from: filler });
        await erc721token.approve(classifieds.address, ERC721id, { from: poster });
        await classifieds.openTrade(0, ether('1'), { from: poster });
        await classifieds.cancelTrade(0, { from: poster });
        await expectRevert(classifieds.executeTrade(0, { from: poster }), 'Trade is not Open.');
    });

    /**
     * @test {Classifieds#cancelTrade}
     */
    it('cancelTrade can succefully cancel a trade', async () => {
        await erc721token.mint(poster, ERC721id);
        await erc721token.approve(classifieds.address, ERC721id, { from: poster });
        await classifieds.openTrade(0, new ether('1'), { from: poster });
        await classifieds.cancelTrade(0, { from: poster });
        const tx = await classifieds.getTrade(0);
        expect(tx).to.include({
            [POSTER]: poster,
            [STATUS]: stringToBytes32('Cancelled')
        });
        chai.expect(tx[ITEM]).to.be.bignumber.equal(new BN(ERC721id));
        chai.expect(tx[PRICE]).to.be.bignumber.equal(ether('1'));
        expect(await erc721token.ownerOf(ERC721id)).to.be.equal(poster);
    });

    /**
     * @test {Classifieds#cancelTrade}
     */
    it('cancelTrade cannot cancel a trade by inavlid caller', async () => {
        await erc20token.mint(filler, ether('1'));
        await erc721token.mint(poster, ERC721id);
        await erc20token.approve(classifieds.address, ether('1'), { from: filler });
        await erc721token.approve(classifieds.address, ERC721id, { from: poster });
        await classifieds.openTrade(0, ether('1'), { from: poster });
        await expectRevert(classifieds.cancelTrade(0, { from: filler }), 'Trade can be cancelled only by poster.');
    });

    /**
     * @test {Classifieds#cancelTrade}
     */
    it('cancelTrade cannot cancel a trade which is not Open', async () => {
        await erc20token.mint(filler, ether('1'));
        await erc721token.mint(poster, ERC721id);
        await erc20token.approve(classifieds.address, ether('1'), { from: filler });
        await erc721token.approve(classifieds.address, ERC721id, { from: poster });
        await classifieds.openTrade(0, ether('1'), { from: poster });
        await classifieds.executeTrade(0, { from: filler });
        await expectRevert(classifieds.cancelTrade(0, { from: poster }), 'Trade is not Open.');
    });

});

function stringToBytes32(text: string) {
    return web3.utils.padRight(web3.utils.fromAscii(text), 64);
}

function bytes32ToString(text: string) {
    return web3.utils.toAscii(text).replace(/\0/g, '');
}
