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
    it('openTrade can succefully open a new trade', async () => {
        await erc721token.mint(poster, 0);
        await erc721token.approve(classifiedsV2.address, 0, { from: poster });
        const tx = await classifiedsV2.openTrade(0, new BigNumber(1e18), { from: poster });
        assert.equal(tx.logs[0].event, 'TradeStatusChange', 'Should have fired TradeStatusChange.');
        assert.equal(bytes32ToString(tx.logs[0].args.status), 'Open', 'Status should be "Open".');
    });

    /**
     * @test {Classifieds#getTrade}
     */
    it('getTrade can succesfully retrieve a trade', async () => {
        await erc721token.mint(poster, 0);
        await erc721token.approve(classifiedsV2.address, 0, { from: poster });
        await classifiedsV2.openTrade(0, new BigNumber(1e18), { from: poster });
        assert.equal((await classifiedsV2.getTrade(0))[0].toString(), poster, 'Incorrect trade fetched.');
    });

    /**
     * @test {Classifieds#executeTrade}
     */
    it('executeTrade can succesfully close a trade', async () => {
        await erc20token.mint(filler, new BigNumber(1e18));
        await erc721token.mint(poster, 0);
        await erc20token.approve(classifiedsV2.address, new BigNumber(1e18), { from: filler });
        await erc721token.approve(classifiedsV2.address, 0, { from: poster });
        await classifiedsV2.openTrade(0, new BigNumber(1e18), { from: poster });
        await classifiedsV2.executeTrade(0, { from: filler });
        assert.equal(bytes32ToString((await classifiedsV2.getTrade(0))[3]), 'Executed', 'Incorrect trade execution.');
    });

    /**
     * @test {Classifieds#cancelTrade}
     */
    it('cancelTrade can succefully cancel a trade', async () => {
        await erc721token.mint(poster, 0);
        await erc721token.approve(classifiedsV2.address, 0, { from: poster });
        await classifiedsV2.openTrade(0, new BigNumber(1e18), { from: poster });
        await classifiedsV2.cancelTrade(0, { from: poster });
        assert.equal(
            bytes32ToString((await classifiedsV2.getTrade(0))[3]),
            'Cancelled',
            'Incorrect trade cancellation.',
        );
    });

    /**
     * @test {Classifieds#cancelTrade}
     */
    itShouldThrow('cancelTrade should succefully cancel a trade', async () => {
        await erc20token.mint(filler, new BigNumber(1e18));
        await erc721token.mint(poster, 0);
        await erc20token.approve(classifiedsV2.address, new BigNumber(1e18), { from: filler });
        await erc721token.approve(classifiedsV2.address, 0, { from: poster });
        await classifiedsV2.openTrade(0, new BigNumber(1e18), { from: poster });
        await classifiedsV2.executeTrade(0, { from: filler });
        await classifiedsV2.cancelTrade(0, { from: poster });
    }, 'Cannot cancel executed trade.');

});

function stringToBytes32(text: string) {
    return web3.utils.fromAscii(text);
}

function bytes32ToString(text: string) {
    return web3.utils.toAscii(text).replace(/\0/g, '');
}
