// tslint:disable-next-line:no-var-requires
const { balance, BN, constants, ether, expectEvent, expectRevert, send, time } = require('@openzeppelin/test-helpers');
import { ClassifiedsInstance, ERC20MintableInstance, ERC721MintableInstance } from '../../types/truffle-contracts';

const Classifieds = artifacts.require('Classifieds') as Truffle.Contract<ClassifiedsInstance>;
const ERC20Mintable = artifacts.require('ERC20Mintable.sol') as Truffle.Contract<ERC20MintableInstance>;
const ERC721Mintable = artifacts.require('ERC721Mintable.sol') as Truffle.Contract<ERC721MintableInstance>;

// tslint:disable:no-var-requires
const chai = require('chai');
chai.use(require('chai-bn')(require('bn.js')));
// tslint:enable:no-var-requires
chai.should();

contract('Classifieds', (accounts) => {
    let snapshot: any;

    const poster = accounts[1];
    const filler = accounts[2];

    let classifieds: ClassifiedsInstance;
    let erc20token: ERC20MintableInstance;
    let erc721token: ERC721MintableInstance;

    const ERC721id = 42;
    const POSTER = 0;
    const ITEM = 1;
    const PRICE = 2;
    const STATUS = 3;

    beforeEach(async () => {
        snapshot = await time.latest();
        erc20token = await ERC20Mintable.new('Name', 'Symbol', 18);
        erc721token = await ERC721Mintable.new('Name', 'Symbol');
        classifieds = await Classifieds.new(erc20token.address, erc721token.address);
    });

    /**
     * @test {Classifieds#openTrade}
     */
    it('emits an event when opening trades', async () => {
        await erc721token.mint(poster, ERC721id);
        await erc721token.approve(classifieds.address, ERC721id, { from: poster });
        expectEvent(
            await classifieds.openTrade(ERC721id, ether('1'), { from: poster }),
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
    it('opens a trade', async () => {
        await erc721token.mint(poster, ERC721id);
        await erc721token.approve(classifieds.address, ERC721id, { from: poster });
        const tradeId = (
            await classifieds.openTrade(ERC721id, ether('1'), { from: poster })
        ).logs[0].args.ad;
        const trade = await classifieds.getTrade(tradeId);
        expect(trade).to.include({
            [POSTER]: poster,
            [STATUS]: stringToBytes32('Open'),
        });
        chai.expect(trade[ITEM]).to.be.bignumber.equal(new BN(ERC721id));
        chai.expect(trade[PRICE]).to.be.bignumber.equal(ether('1'));
    });

    describe('after opening a trade', () => {
        let tradeId : string;

        beforeEach(async () => {
            await erc721token.mint(poster, ERC721id);
            await erc721token.approve(classifieds.address, ERC721id, { from: poster });
            tradeId = (
                await classifieds.openTrade(ERC721id, ether('1'), { from: poster })
            ).logs[0].args.ad;
        });

        /**
         * @test {Classifieds#executeTrade}
         */
        it('trades can be executed', async () => {
            await erc20token.mint(filler, ether('1'));
            await erc20token.approve(classifieds.address, ether('1'), { from: filler });
            await classifieds.executeTrade(tradeId, { from: filler });
            const trade = await classifieds.getTrade(tradeId);
            expect(trade).to.include({
                [POSTER]: poster,
                [STATUS]: stringToBytes32('Executed'),
            });
            chai.expect(trade[ITEM]).to.be.bignumber.equal(new BN(ERC721id));
            chai.expect(trade[PRICE]).to.be.bignumber.equal(ether('1'));

            expect(await erc721token.ownerOf(ERC721id)).to.be.equal(filler);
            chai.expect(await erc20token.balanceOf(poster)).to.be.bignumber.equal(ether('1'));
        });

        /**
         * @test {Classifieds#cancelTrade}
         */
        it('trades can be cancelled', async () => {
            await classifieds.cancelTrade(tradeId, { from: poster });
            const trade = await classifieds.getTrade(tradeId);
            expect(trade).to.include({
                [POSTER]: poster,
                [STATUS]: stringToBytes32('Cancelled'),
            });
            chai.expect(trade[ITEM]).to.be.bignumber.equal(new BN(ERC721id));
            chai.expect(trade[PRICE]).to.be.bignumber.equal(ether('1'));
            expect(await erc721token.ownerOf(ERC721id)).to.be.equal(poster);
        });


        /**
         * @test {Classifieds#cancelTrade}
         */
        it('trades can only be cancelled by their posters', async () => {
            await erc20token.mint(filler, ether('1'));
            await erc20token.approve(classifieds.address, ether('1'), { from: filler });
            await expectRevert(
                classifieds.cancelTrade(tradeId, { from: filler }),
                'Trade can be cancelled only by poster.',
            );
        });

        describe('after closing a trade', () => {
            beforeEach(async () => {
                await classifieds.cancelTrade(tradeId, { from: poster });
            });

            /**
             * @test {Classifieds#executeTrade}
             */
            it('closed trades cannot be executed', async () => {
                await expectRevert(
                    classifieds.executeTrade(tradeId, { from: poster }),
                    'Trade is not Open.',
                );
            });

            /**
             * @test {Classifieds#cancelTrade}
             */
            it('closed trades cannot be cancelled', async () => {
                await expectRevert(
                    classifieds.cancelTrade(tradeId, { from: poster }),
                    'Trade is not Open.',
                );
            });
        });
    });
});

function stringToBytes32(text: string) {
    return web3.utils.padRight(web3.utils.fromAscii(text), 64);
}

function bytes32ToString(text: string) {
    return web3.utils.toAscii(text).replace(/\0/g, '');
}