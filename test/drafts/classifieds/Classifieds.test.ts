import { BigNumber } from 'bignumber.js';
import { should } from 'chai';
// tslint:disable-next-line:no-var-requires
const { advanceTimeAndBlock, takeSnapshot, revertToSnapshot } = require('ganache-time-traveler');
import { ClassifiedsInstance, ERC20MintableMockInstance, ERC721MintableMockInstance } from '../../../types/truffle-contracts';

const Classifieds = artifacts.require('./drafts/classifieds/Classifieds.sol') as Truffle.Contract<ClassifiedsInstance>;
const ERC20MintableMock = artifacts.require(
        './drafts/test/issuance/ERC20MintableMock.sol',
    ) as Truffle.Contract<ERC20MintableMockInstance>;
const ERC721MintableMock = artifacts.require(
        './drafts/test/classifieds/ERC721MintableMock.sol',
    ) as Truffle.Contract<ERC721MintableMockInstance>;

should();

// tslint:disable-next-line no-var-requires
const { itShouldThrow } = require('./../../utils');

contract('Classifieds', (accounts) => {
    let snapshotId: any;

    const poster = accounts[1];
    const filler = accounts[2];

    let classifieds: ClassifiedsInstance;
    let erc20token: ERC20MintableMockInstance;
    let erc721token: ERC721MintableMockInstance;

    beforeEach(async () => {
        const snapShot = await takeSnapshot();
        snapshotId = snapShot.result;
        classifieds = await Classifieds.new();
        erc20token = await ERC20MintableMock.new();
        erc721token = await ERC721MintableMock.new();
    });

    afterEach(async  () => {
        await revertToSnapshot(snapshotId);
    });

    /**
     * @test {Classifieds#newAd}
     */
    it('newAd can succefully open a new ad', async () => {
        erc20token.mint(poster, new BigNumber(1e18));
        erc20token.approve(classifieds.address, new BigNumber(1e18), { from: poster });
        const creationDateInMin = new BigNumber(
            Math.floor((await web3.eth.getBlock(await web3.eth.getBlockNumber())).timestamp / 60),
        );
        await classifieds.newAd(
            erc20token.address,
            new BigNumber(1e18),
            new BigNumber(Math.floor((new Date()).getTime() / 1000) + 3600),
            false,
            { from: poster },
        );
        assert.equal(
            (await classifieds.adsByHash(await classifieds.adsByCreationDateInMin(creationDateInMin, 0)))[0],
            poster,
            'Ad was not opened correctly.',
        );
    });

    /**
     * @test {Classifieds#fillAd}
     */
    it('fillAd can succefully fill an ad', async () => {
        erc20token.mint(poster, new BigNumber(1e18));
        erc721token.mint(filler, 0);
        erc20token.approve(classifieds.address, new BigNumber(1e18), { from: poster });
        erc721token.approve(classifieds.address, 0, { from: filler });
        const creationDateInMin = new BigNumber(
            Math.floor((await web3.eth.getBlock(await web3.eth.getBlockNumber())).timestamp / 60),
        );
        await classifieds.newAd(
            erc20token.address,
            new BigNumber(1e18),
            new BigNumber(Math.floor((new Date()).getTime() / 1000) + 3600),
            false,
            { from: poster },
        );
        await classifieds.fillAd(
            await classifieds.adsByCreationDateInMin(creationDateInMin, 0),
            erc721token.address,
            0,
            true,
            { from: filler },
        );
        assert.equal(
            (await classifieds.adsByHash(
                await classifieds.fillersByAd(await classifieds.adsByCreationDateInMin(creationDateInMin, 0), 0),
            ))[0],
            filler,
            'Ad was not filled correctly',
        );
    });

    /**
     * @test {Classifieds#resolveAd}
     */
    it('resolveAd can succefully resolve an ad', async () => {
        erc20token.mint(poster, new BigNumber(1e18));
        erc721token.mint(filler, 0);
        erc20token.approve(classifieds.address, new BigNumber(1e18), { from: poster });
        erc721token.approve(classifieds.address, 0, { from: filler });
        const creationDateInMin = new BigNumber(
            Math.floor((await web3.eth.getBlock(await web3.eth.getBlockNumber())).timestamp / 60),
        );
        await classifieds.newAd(
            erc20token.address,
            new BigNumber(1e18),
            new BigNumber(Math.floor((new Date()).getTime() / 1000) + 3600),
            false,
            { from: poster },
        );
        await classifieds.fillAd(
            await classifieds.adsByCreationDateInMin(creationDateInMin, 0),
            erc721token.address,
            0,
            true,
            { from: filler },
        );
        await classifieds.resolveAd(
            await classifieds.adsByCreationDateInMin(creationDateInMin, 0),
            await classifieds.fillersByAd(await classifieds.adsByCreationDateInMin(creationDateInMin, 0), 0),
            { from: poster },
        );
        assert.equal(
            (await erc20token.balanceOf(filler)).toString(),
            new BigNumber(1e18).toString(),
            'ERC20 tokens not transferred correctly',
        );
        assert.equal(await erc721token.ownerOf(0), poster, 'ERC721 tokens not transferred correctly.');
    });

    /**
     * @test {Classifieds#cancelAd}
     */
    it('cancelAd can succefully cancel an ad', async () => {
        erc20token.mint(poster, new BigNumber(1e18));
        erc20token.approve(classifieds.address, new BigNumber(1e18), { from: poster });
        const creationDateInMin = new BigNumber(
            Math.floor((await web3.eth.getBlock(await web3.eth.getBlockNumber())).timestamp / 60),
        );
        await classifieds.newAd(
            erc20token.address,
            new BigNumber(1e18),
            new BigNumber(Math.floor((new Date()).getTime() / 1000) + 3600),
            false,
            { from: poster },
        );
        await classifieds.cancelAd(
            await classifieds.adsByCreationDateInMin(creationDateInMin, 0),
            { from: poster },
        );
        assert.equal(
            (await erc20token.balanceOf(poster)).toString(),
            new BigNumber(1e18).toString(),
            'ERC20 tokens not cancelled correctly',
        );
        assert.equal(
            (await classifieds.adsByHash(
                await classifieds.adsByCreationDateInMin(creationDateInMin, 0),
            ))[5],
            true,
            'Cancellation errored.',
        );
    });

});
