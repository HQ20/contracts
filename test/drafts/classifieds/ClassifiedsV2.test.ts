import { BigNumber } from 'bignumber.js';
import { should } from 'chai';
// tslint:disable-next-line:no-var-requires
const { advanceTimeAndBlock, takeSnapshot, revertToSnapshot } = require('ganache-time-traveler');
import { ClassifiedsV2Instance, TestERC20MintableInstance, TestERC721MintableInstance } from '../../../types/truffle-contracts';

const ClassifiedsV2 = artifacts.require(
    './drafts/classifieds/ClassifiedsV2.sol',
) as Truffle.Contract<ClassifiedsV2Instance>;
const TestERC20Mintable = artifacts.require(
    './test/issuance/TestERC20Mintable.sol',
) as Truffle.Contract<TestERC20MintableInstance>;
const TestERC721Mintable = artifacts.require(
    './test/classifieds/TestERC721Mintable.sol',
) as Truffle.Contract<TestERC721MintableInstance>;

should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../../utils');

contract('ClassifiedsV2', (accounts) => {
    let snapshotId: any;

    const poster = accounts[1];
    const filler = accounts[2];

    let classifiedsV2: ClassifiedsV2Instance;
    let erc20token: TestERC20MintableInstance;
    let erc721token: TestERC721MintableInstance;

    const ERC721id = 0;
    const POSTER = 0;
    const ITEM = 1;
    const PRICE = 2;
    const STATUS = 3;

    beforeEach(async () => {
        const snapShot = await takeSnapshot();
        snapshotId = snapShot.result;
        erc20token = await TestERC20Mintable.new();
        erc721token = await TestERC721Mintable.new();
        classifiedsV2 = await ClassifiedsV2.new(erc20token.address, erc721token.address);
    });

    afterEach(async  () => {
        await revertToSnapshot(snapshotId);
    });

    /**
     * @test {Classifieds#openTrade}
     */
    it('openTrade emits an event to signal trade opening', async () => {
        await erc721token.mint(poster, ERC721id);
        await erc721token.approve(classifiedsV2.address, ERC721id, { from: poster });
        const tx = await classifiedsV2.openTrade(0, new BigNumber(1e18), { from: poster });
        assert.equal(tx.logs[0].event, 'TradeStatusChange', 'Should have fired TradeStatusChange.');
        assert.equal(bytes32ToString(tx.logs[0].args.status), 'Open', 'Status should be "Open".');
    });

    /**
     * @test {Classifieds#openTrade} and {Classifieds#getTrade}
     */
    it('getTrade can succesfully retrieve a trade', async () => {
        await erc721token.mint(poster, ERC721id);
        await erc721token.approve(classifiedsV2.address, ERC721id, { from: poster });
        await classifiedsV2.openTrade(0, new BigNumber(1e18), { from: poster });
        assert.equal((await classifiedsV2.getTrade(0))[POSTER].toString(), poster, 'Incorrect trade fetched.');
        assert.equal(
            (await classifiedsV2.getTrade(0))[ITEM].toString(),
            ERC721id.toString(),
            'Incorrect trade fetched.',
        );
        assert.equal((await classifiedsV2.getTrade(0))[PRICE].toString(), (new BigNumber(1e18)).toString(), 'Incorrect trade fetched.');
        assert.equal(bytes32ToString((await classifiedsV2.getTrade(0))[STATUS]), 'Open', 'Incorrect trade fetched.');
    });

    /**
     * @test {Classifieds#executeTrade}
     */
    it('executeTrade can succesfully close a trade', async () => {
        await erc20token.mint(filler, new BigNumber(1e18));
        await erc721token.mint(poster, ERC721id);
        await erc20token.approve(classifiedsV2.address, new BigNumber(1e18), { from: filler });
        await erc721token.approve(classifiedsV2.address, ERC721id, { from: poster });
        await classifiedsV2.openTrade(0, new BigNumber(1e18), { from: poster });
        await classifiedsV2.executeTrade(0, { from: filler });
        assert.equal((await classifiedsV2.getTrade(0))[POSTER].toString(), poster, 'Incorrect trade execution.');
        assert.equal((await classifiedsV2.getTrade(0))[ITEM].toString(), ERC721id.toString(), 'Incorrect trade execution.');
        assert.equal((await classifiedsV2.getTrade(0))[PRICE].toString(), (new BigNumber(1e18)).toString(), 'Incorrect trade execution.');
        assert.equal(bytes32ToString((await classifiedsV2.getTrade(0))[STATUS]), 'Executed', 'Incorrect trade execution.');
        assert.equal(await erc721token.ownerOf(ERC721id), filler, 'Incorrect trade execution.');
        assert.equal((await erc20token.balanceOf(poster)).toString(), (new BigNumber(1e18)).toString(), 'Incorrect trade execution.');
    });

    /**
     * @test {Classifieds#cancelTrade}
     */
    it('cancelTrade can succefully cancel a trade', async () => {
        await erc721token.mint(poster, ERC721id);
        await erc721token.approve(classifiedsV2.address, ERC721id, { from: poster });
        await classifiedsV2.openTrade(0, new BigNumber(1e18), { from: poster });
        await classifiedsV2.cancelTrade(0, { from: poster });
        assert.equal((await classifiedsV2.getTrade(0))[POSTER].toString(), poster, 'Incorrect trade cancellation.');
        assert.equal((await classifiedsV2.getTrade(0))[ITEM].toString(), ERC721id.toString(), 'Incorrect trade cancellation.');
        assert.equal((await classifiedsV2.getTrade(0))[PRICE].toString(), (new BigNumber(1e18)).toString(), 'Incorrect trade cancellation.');
        assert.equal(bytes32ToString((await classifiedsV2.getTrade(0))[STATUS]), 'Cancelled', 'Incorrect trade cancellation.');
        assert.equal(await erc721token.ownerOf(ERC721id), poster, 'Incorrect trade cancellation.');
    });

    /**
     * @test {Classifieds#cancelTrade}
     */
    itShouldThrow('cancelTrade cannot cancel a trade which is not Open', async () => {
        await erc20token.mint(filler, new BigNumber(1e18));
        await erc721token.mint(poster, ERC721id);
        await erc20token.approve(classifiedsV2.address, new BigNumber(1e18), { from: filler });
        await erc721token.approve(classifiedsV2.address, ERC721id, { from: poster });
        await classifiedsV2.openTrade(0, new BigNumber(1e18), { from: poster });
        await classifiedsV2.executeTrade(0, { from: filler });
        await classifiedsV2.cancelTrade(0, { from: poster });
    }, 'Trade is not Open.');

});

function stringToBytes32(text: string) {
    return web3.utils.fromAscii(text);
}

function bytes32ToString(text: string) {
    return web3.utils.toAscii(text).replace(/\0/g, '');
}
