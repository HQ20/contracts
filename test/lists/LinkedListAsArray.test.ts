import { should } from 'chai';
import { LinkedListAsArrayInstance } from '../../types/truffle-contracts';

const LinkedList = artifacts.require('./lists/LinkedListAsArray.sol')  as Truffle.Contract<LinkedListAsArrayInstance>;
should();


const emptyData = '0x0000000000000000000000000000000000000000';
const headData = '0x0000000000000000000000000000000000000001';
const middleData = '0x0000000000000000000000000000000000000002';
const tailData = '0x0000000000000000000000000000000000000003';

contract('LinkedListAsArray', (accounts) => {

    let linkedList: LinkedListAsArrayInstance;

    beforeEach(async () => {
        linkedList = await LinkedList.new();
    });

    /* it('get on a non existing object reverts.', async () => {
        await linkedList.get(0);
    }); */

    it('adds an object at the head - event emission.', async () => {
        const transaction = (await linkedList.addHead(headData));
        transaction.logs[0].args.id.toNumber().should.be.equal(0);
        transaction.logs[0].args.data.should.be.equal(headData);
        transaction.logs[1].args.id.toNumber().should.be.equal(0);
    });

    it('adds an object at the head - data storage.', async () => {
        const headId = (
            await linkedList.addHead(headData)
        ).logs[0].args.id.toNumber();

        (await linkedList.get(headId)).should.be.equal(headData);
    });

    it('adds two objects.', async () => {
        const tailId = (
            await linkedList.addHead(tailData)
        ).logs[0].args.id.toNumber();
        const headId = (
            await linkedList.addHead(headData)
        ).logs[0].args.id.toNumber();

        const returnedTailData = (await linkedList.get(tailId));
        returnedTailData.should.be.equal(tailData);

        const returnedHeadData = (await linkedList.get(headId));
        returnedHeadData.should.be.equal(headData);

        ((await linkedList.head()).toNumber()).should.be.equal(headId);
    });

    it('prev and next.', async () => {
        const tailId = (
            await linkedList.addHead(tailData)
        ).logs[0].args.id.toNumber();
        const middleId = (
            await linkedList.addHead(middleData)
        ).logs[0].args.id.toNumber();
        const headId = (
            await linkedList.addHead(headData)
        ).logs[0].args.id.toNumber();

        const headPrev = (await linkedList.prev(headId))[0];
        headPrev.should.be.false;

        const headNext = (await linkedList.next(headId))[1].toNumber();
        headNext.should.be.equal(middleId);

        const tailNext = (await linkedList.next(tailId))[0];
        tailNext.should.be.false;

        const tailPrev = (await linkedList.prev(tailId))[1].toNumber();
        tailPrev.should.be.equal(middleId);
    });

    it('get.', async () => {
        const tailId = (
            await linkedList.addHead(tailData)
        ).logs[0].args.id.toNumber();
        const middleId = (
            await linkedList.addHead(middleData)
        ).logs[0].args.id.toNumber();
        const headId = (
            await linkedList.addHead(headData)
        ).logs[0].args.id.toNumber();

        (await linkedList.get(tailId)).should.be.equal(tailData);
        (await linkedList.get(middleId)).should.be.equal(middleData);
        (await linkedList.get(headId)).should.be.equal(headData);
    });

    it('find.', async () => {
        const tailId = (
            await linkedList.addHead(tailData)
        ).logs[0].args.id.toNumber();
        const middleId = (
            await linkedList.addHead(middleData)
        ).logs[0].args.id.toNumber();
        const headId = (
            await linkedList.addHead(headData)
        ).logs[0].args.id.toNumber();

        (await linkedList.find(tailData))[1].toNumber().should.be.equal(tailId);
        (await linkedList.find(middleData))[1].toNumber().should.be.equal(middleId);
        (await linkedList.find(headData))[1].toNumber().should.be.equal(headId);
        (await linkedList.find(emptyData))[0].should.be.false;
    });

    it('remove head.', async () => {
        const tailId = (
            await linkedList.addHead(tailData)
        ).logs[0].args.id.toNumber();
        const middleId = (
            await linkedList.addHead(middleData)
        ).logs[0].args.id.toNumber();
        const headId = (
            await linkedList.addHead(headData)
        ).logs[0].args.id.toNumber();

        const transaction = (await linkedList.remove(headId));
        transaction.logs[0].args.id.toNumber().should.be.equal(middleId);
        transaction.logs[1].args.id.toNumber().should.be.equal(headId);

        ((await linkedList.head()).toNumber()).should.be.equal(middleId);
    });

    it('remove tail.', async () => {
        const tailId = (
            await linkedList.addHead(tailData)
        ).logs[0].args.id.toNumber();
        const middleId = (
            await linkedList.addHead(middleData)
        ).logs[0].args.id.toNumber();
        const headId = (
            await linkedList.addHead(headData)
        ).logs[0].args.id.toNumber();

        const transaction = (await linkedList.remove(tailId));
        transaction.logs[0].args.id.toNumber().should.be.equal(middleId);
        transaction.logs[1].args.id.toNumber().should.be.equal(tailId);

        ((await linkedList.tail()).toNumber()).should.be.equal(middleId);
    });

    it('remove middle.', async () => {
        const tailId = (
            await linkedList.addHead(tailData)
        ).logs[0].args.id.toNumber();
        const middleId = (
            await linkedList.addHead(middleData)
        ).logs[0].args.id.toNumber();
        const headId = (
            await linkedList.addHead(headData)
        ).logs[0].args.id.toNumber();

        const transaction = (await linkedList.remove(middleId));
        transaction.logs[0].args.id.toNumber().should.be.equal(middleId);

        ((await linkedList.head()).toNumber()).should.be.equal(headId);
        ((await linkedList.tail()).toNumber()).should.be.equal(tailId);
    });

    it('remove all.', async () => {
        const tailId = (
            await linkedList.addHead(tailData)
        ).logs[0].args.id.toNumber();
        const middleId = (
            await linkedList.addHead(middleData)
        ).logs[0].args.id.toNumber();
        const headId = (
            await linkedList.addHead(headData)
        ).logs[0].args.id.toNumber();

        await linkedList.remove(tailId);
        await linkedList.remove(middleId);
        await linkedList.remove(headId);

        ((await linkedList.head()).toNumber()).should.be.equal(0);
        ((await linkedList.head()).toNumber()).should.be.equal(0);
    });
});

/* contract('LinkedListAsArray - gas tests', (accounts) => {
    let linkedList: LinkedListAsArrayInstance;
    const dummyData = '0x0000000000000000000000000000000000000001';

    beforeEach(async () => {
        linkedList = await LinkedList.new();
        for (let i = 0; i < 100; i++) {
            await linkedList.addHead(dummyData);
        }
    });

    it('Add Head.', async () => {
        await linkedList.addHead(dummyData);
    });

    it('Remove.', async () => {
        await linkedList.remove(0);
    });
}); */
