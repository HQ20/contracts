import { should } from 'chai';
import { RenounceableQueueInstance } from '../../../types/truffle-contracts';

const RenounceableQueue = artifacts.require('RenounceableQueue')  as Truffle.Contract<RenounceableQueueInstance>;
should();


const emptyData = '0x0000000000000000000000000000000000000000';
const headData = '0x0000000000000000000000000000000000000001';
const middleData = '0x0000000000000000000000000000000000000002';
const tailData = '0x0000000000000000000000000000000000000003';

contract('RenounceableQueue', (accounts) => {

    let queue: RenounceableQueueInstance;

    beforeEach(async () => {
        queue = await RenounceableQueue.new();
    });

    /* it('get on a non existing object reverts.', async () => {
        await queue.get(0);
    }); */

    it('adds an object at the head - event emission.', async () => {
        const transaction = (await queue.addHead(headData));
        transaction.logs[0].args.id.toNumber().should.be.equal(0);
        transaction.logs[0].args.data.should.be.equal(headData);
        transaction.logs[1].args.id.toNumber().should.be.equal(0);
    });

    it('adds an object at the head - data storage.', async () => {
        const headId = (
            await queue.addHead(headData)
        ).logs[0].args.id.toNumber();

        (await queue.get(headId)).should.be.equal(headData);
    });

    it('adds two objects.', async () => {
        const tailId = (
            await queue.addHead(tailData)
        ).logs[0].args.id.toNumber();
        const headId = (
            await queue.addHead(headData)
        ).logs[0].args.id.toNumber();

        const returnedTailData = (await queue.get(tailId));
        returnedTailData.should.be.equal(tailData);

        const returnedHeadData = (await queue.get(headId));
        returnedHeadData.should.be.equal(headData);

        ((await queue.head()).toNumber()).should.be.equal(headId);
    });

    it('prev and next.', async () => {
        const tailId = (
            await queue.addHead(tailData)
        ).logs[0].args.id.toNumber();
        const middleId = (
            await queue.addHead(middleData)
        ).logs[0].args.id.toNumber();
        const headId = (
            await queue.addHead(headData)
        ).logs[0].args.id.toNumber();

        const headPrev = (await queue.prev(headId))[0];
        headPrev.should.be.false;

        const headNext = (await queue.next(headId))[1].toNumber();
        headNext.should.be.equal(middleId);

        const tailNext = (await queue.next(tailId))[0];
        tailNext.should.be.false;

        const tailPrev = (await queue.prev(tailId))[1].toNumber();
        tailPrev.should.be.equal(middleId);
    });

    it('get.', async () => {
        const tailId = (
            await queue.addHead(tailData)
        ).logs[0].args.id.toNumber();
        const middleId = (
            await queue.addHead(middleData)
        ).logs[0].args.id.toNumber();
        const headId = (
            await queue.addHead(headData)
        ).logs[0].args.id.toNumber();

        (await queue.get(tailId)).should.be.equal(tailData);
        (await queue.get(middleId)).should.be.equal(middleData);
        (await queue.get(headId)).should.be.equal(headData);
    });

    it('find.', async () => {
        const tailId = (
            await queue.addHead(tailData)
        ).logs[0].args.id.toNumber();
        const middleId = (
            await queue.addHead(middleData)
        ).logs[0].args.id.toNumber();
        const headId = (
            await queue.addHead(headData)
        ).logs[0].args.id.toNumber();

        (await queue.find(tailData))[1].toNumber().should.be.equal(tailId);
        (await queue.find(middleData))[1].toNumber().should.be.equal(middleId);
        (await queue.find(headData))[1].toNumber().should.be.equal(headId);
        (await queue.find(emptyData))[0].should.be.false;
    });

    it('remove head.', async () => {
        const tailId = (
            await queue.addHead(tailData)
        ).logs[0].args.id.toNumber();
        const middleId = (
            await queue.addHead(middleData)
        ).logs[0].args.id.toNumber();
        const headId = (
            await queue.addHead(headData)
        ).logs[0].args.id.toNumber();

        const transaction = (await queue.remove(headId));
        transaction.logs[0].args.id.toNumber().should.be.equal(middleId);
        transaction.logs[1].args.id.toNumber().should.be.equal(headId);

        ((await queue.head()).toNumber()).should.be.equal(middleId);
    });

    it('remove tail.', async () => {
        const tailId = (
            await queue.addHead(tailData)
        ).logs[0].args.id.toNumber();
        const middleId = (
            await queue.addHead(middleData)
        ).logs[0].args.id.toNumber();
        const headId = (
            await queue.addHead(headData)
        ).logs[0].args.id.toNumber();

        const transaction = (await queue.remove(tailId));
        transaction.logs[0].args.id.toNumber().should.be.equal(middleId);
        transaction.logs[1].args.id.toNumber().should.be.equal(tailId);

        ((await queue.tail()).toNumber()).should.be.equal(middleId);
    });

    it('remove middle.', async () => {
        const tailId = (
            await queue.addHead(tailData)
        ).logs[0].args.id.toNumber();
        const middleId = (
            await queue.addHead(middleData)
        ).logs[0].args.id.toNumber();
        const headId = (
            await queue.addHead(headData)
        ).logs[0].args.id.toNumber();

        const transaction = (await queue.remove(middleId));
        transaction.logs[0].args.id.toNumber().should.be.equal(middleId);

        ((await queue.head()).toNumber()).should.be.equal(headId);
        ((await queue.tail()).toNumber()).should.be.equal(tailId);
    });

    it('remove all.', async () => {
        const tailId = (
            await queue.addHead(tailData)
        ).logs[0].args.id.toNumber();
        const middleId = (
            await queue.addHead(middleData)
        ).logs[0].args.id.toNumber();
        const headId = (
            await queue.addHead(headData)
        ).logs[0].args.id.toNumber();

        await queue.remove(tailId);
        await queue.remove(middleId);
        await queue.remove(headId);

        ((await queue.head()).toNumber()).should.be.equal(0);
        ((await queue.head()).toNumber()).should.be.equal(0);
    });
});

/* contract('RenounceableQueue - gas tests', (accounts) => {
    let queue: RenounceableQueueInstance;
    const dummyData = '0x0000000000000000000000000000000000000001';

    beforeEach(async () => {
        queue = await RenounceableQueue.new();
        for (let i = 0; i < 100; i++) {
            await queue.addHead(dummyData);
        }
    });

    it('Add Head.', async () => {
        await queue.addHead(dummyData);
    });

    it('Remove.', async () => {
        await queue.remove(0);
    });
}); */
