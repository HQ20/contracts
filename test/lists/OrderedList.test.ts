import { should } from 'chai';
import { OrderedListInstance } from '../../types/truffle-contracts';

const OrderedList = artifacts
    .require('./lists/OrderedList.sol') as Truffle.Contract<OrderedListInstance>;
should();

const emptyData = '0x0000000000000000000000000000000000000000';
const headData = '0x0000000000000000000000000000000000000001';
const middleData = '0x0000000000000000000000000000000000000002';
const tailData = '0x0000000000000000000000000000000000000003';

const headRank = 30;
const middleRank = 20;
const tailRank = 10;

/** @test {OrderedList} contract */
contract('OrderedList - add', (accounts) => {

    let orderedList: OrderedListInstance;

    beforeEach(async () => {
        orderedList = await OrderedList.new();
    });

    /**
     * @test {OrderedList#new} and {OrderedList#idCounter}
     */
    it('Constructor variables.', async () => {
        (await orderedList.idCounter()).toNumber().should.be.equal(1);
    });

    /**
     * @test {OrderedList#get}
     */
    it('get on a non existing object returns (0,0,0,0,0).', async () => {
        const result = (await orderedList.get(0));
        result[0].toNumber().should.be.equal(0);
        result[1].toNumber().should.be.equal(0);
        result[2].toNumber().should.be.equal(0);
        result[3].toNumber().should.be.equal(0);
        result[4].should.be.equal(emptyData);
    });

    /**
     * @test {OrderedList#addHead}
     */
    it('adds an object at the head - event emission.', async () => {
        const transaction = (
            await orderedList.addHead(headRank, headData)
        );
        transaction.logs[0].event.should.be.equal('ObjectCreated');
        transaction.logs[0].args.id.toNumber().should.be.equal(1);
        transaction.logs[0].args.rank.toNumber().should.be.equal(headRank);
        transaction.logs[0].args.data.should.be.equal(headData);
        transaction.logs[1].event.should.be.equal('NewHead');
        transaction.logs[1].args.id.toNumber().should.be.equal(1);
        transaction.logs[2].event.should.be.equal('NewTail');
        transaction.logs[2].args.id.toNumber().should.be.equal(1);
    });

    /**
     * @test {OrderedList#addHead}
     */
    it('adds an object at the head - data storage.', async () => {
        const objectId = (
            await orderedList.addHead(headRank, headData)
        ).logs[0].args.id.toNumber();

        const result = (await orderedList.get(objectId));
        result[0].toNumber().should.be.equal(objectId);
        result[1].toNumber().should.be.equal(0);
        result[2].toNumber().should.be.equal(0);
        result[3].toNumber().should.be.equal(headRank);
        result[4].should.be.equal(headData);
    });

    /**
     * @test {OrderedList#addHead}
     */
    it('adds two objects from the head.', async () => {
        const objectOneId = (
            await orderedList.addHead(middleRank, middleData)
        ).logs[0].args.id.toNumber();
        const objectTwoId = (
            await orderedList.addHead(headRank, headData)
        ).logs[0].args.id.toNumber();

        const objectOne = (await orderedList.get(objectOneId));
        objectOne[0].toNumber().should.be.equal(objectOneId);
        objectOne[1].toNumber().should.be.equal(0);
        objectOne[2].toNumber().should.be.equal(objectTwoId);
        objectOne[3].toNumber().should.be.equal(middleRank);
        objectOne[4].should.be.equal(middleData);

        const objectTwo = (await orderedList.get(objectTwoId));
        objectTwo[0].toNumber().should.be.equal(objectTwoId);
        objectTwo[1].toNumber().should.be.equal(objectOneId);
        objectTwo[2].toNumber().should.be.equal(0);
        objectTwo[3].toNumber().should.be.equal(headRank);
        objectTwo[4].should.be.equal(headData);

        ((await orderedList.head()).toNumber()).should.be.equal(objectTwoId);
    });

    /**
     * @test {OrderedList#addTail}
     */
    it('adds an object at the tail - event emission.', async () => {
        const objectEvent = (
            await orderedList.addTail(headRank, headData)
        ).logs[0];
        objectEvent.args.id.toNumber().should.be.equal(1);
        objectEvent.args.rank.toNumber().should.be.equal(headRank);
        objectEvent.args.data.should.be.equal(headData);
    });

    /**
     * @test {OrderedList#addTail}
     */
    it('adds an object at the tail - data storage.', async () => {
        const objectId = (
            await orderedList.addTail(headRank, headData)
        ).logs[0].args.id.toNumber();

        const result = (await orderedList.get(objectId));
        result[0].toNumber().should.be.equal(objectId);
        result[1].toNumber().should.be.equal(0);
        result[2].toNumber().should.be.equal(0);
        result[3].toNumber().should.be.equal(headRank);
        result[4].should.be.equal(headData);
    });

    /**
     * @test {OrderedList#addTail}
     */
    it('adds two objects from the tail.', async () => {
        const objectOneId = (
            await orderedList.addTail(middleRank, middleData)
        ).logs[0].args.id.toNumber();
        const objectTwoId = (
            await orderedList.addTail(headRank, headData)
        ).logs[0].args.id.toNumber();

        const objectOne = (await orderedList.get(objectOneId));
        objectOne[0].toNumber().should.be.equal(objectOneId);
        objectOne[1].toNumber().should.be.equal(objectTwoId);
        objectOne[2].toNumber().should.be.equal(0);
        objectOne[3].toNumber().should.be.equal(middleRank);
        objectOne[4].should.be.equal(middleData);

        const objectTwo = (await orderedList.get(objectTwoId));
        objectTwo[0].toNumber().should.be.equal(objectTwoId);
        objectTwo[1].toNumber().should.be.equal(0);
        objectTwo[2].toNumber().should.be.equal(objectOneId);
        objectTwo[3].toNumber().should.be.equal(headRank);
        objectTwo[4].should.be.equal(headData);

        ((await orderedList.head()).toNumber()).should.be.equal(objectOneId);
    });
});

/* contract('OrderedList - find', (accounts) => {

    let orderedList: OrderedListInstance;
    let headId: number;
    let middleId: number;
    let tailId: number;

    beforeEach(async () => {
        orderedList = await OrderedList.new();
        tailId = (
            await orderedList.addHead(tailData)
        ).logs[0].args.id.toNumber();
        middleId = (
            await orderedList.addHead(middleData)
        ).logs[0].args.id.toNumber();
        headId = (
            await orderedList.addHead(headData)
        ).logs[0].args.id.toNumber();
    });

    it('finds an id for given data.', async () => {
        let resultId = (await orderedList.findIdForData(headData));
        resultId.toNumber().should.be.equal(headId);
        resultId = (await orderedList.findIdForData(middleData));
        resultId.toNumber().should.be.equal(middleId);
        resultId = (await orderedList.findIdForData(tailData));
        resultId.toNumber().should.be.equal(tailId);
    });
}); */

/** @test {orderedList} contract */
contract('OrderedList - remove', (accounts) => {

    let orderedList: OrderedListInstance;
    let headId: number;
    let middleId: number;
    let tailId: number;

    beforeEach(async () => {
        orderedList = await OrderedList.new();
        tailId = (
            await orderedList.addHead(tailRank, tailData)
        ).logs[0].args.id.toNumber();
        middleId = (
            await orderedList.addHead(middleRank, middleData)
        ).logs[0].args.id.toNumber();
        headId = (
            await orderedList.addHead(headRank, headData)
        ).logs[0].args.id.toNumber();

    });

    /**
     * @test {OrderedList#remove}
     */
    it('removes the head.', async () => {
        const removedId = (
            await orderedList.remove(headId)
        ).logs[1].args.id.toNumber();
        ((await orderedList.head()).toNumber()).should.be.equal(middleId);

        const middleObject = (await orderedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(tailId);
        middleObject[2].toNumber().should.be.equal(0);
        middleObject[3].toNumber().should.be.equal(middleRank);
        middleObject[4].should.be.equal(middleData);

        const tailObject = (await orderedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].toNumber().should.be.equal(middleId);
        tailObject[3].toNumber().should.be.equal(tailRank);
        tailObject[4].should.be.equal(tailData);
    });

    /**
     * @test {OrderedList#remove}
     */
    it('removes the tail.', async () => {
        const removedId = (
            await orderedList.remove(tailId)
        ).logs[1].args.id.toNumber();
        ((await orderedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await orderedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(middleId);
        headObject[2].toNumber().should.be.equal(0);
        headObject[3].toNumber().should.be.equal(headRank);
        headObject[4].should.be.equal(headData);

        const middleObject = (await orderedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(0);
        middleObject[2].toNumber().should.be.equal(headId);
        middleObject[3].toNumber().should.be.equal(middleRank);
        middleObject[4].should.be.equal(middleData);
    });

    /**
     * @test {OrderedList#remove}
     */
    it('removes the middle.', async () => {
        const removedId = (
            await orderedList.remove(middleId)
        ).logs[1].args.id.toNumber();
        ((await orderedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await orderedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(tailId);
        headObject[2].toNumber().should.be.equal(0);
        headObject[3].toNumber().should.be.equal(headRank);
        headObject[4].should.be.equal(headData);

        const tailObject = (await orderedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].toNumber().should.be.equal(headId);
        tailObject[3].toNumber().should.be.equal(tailRank);
        tailObject[4].should.be.equal(tailData);
    });

    /**
     * @test {OrderedList#remove}
     */
    it('removes all.', async () => {
        (await orderedList.remove(headId)).logs[1].args.id.toNumber();
        ((await orderedList.head()).toNumber()).should.be.equal(middleId);

        (await orderedList.remove(tailId)).logs[1].args.id.toNumber();
        ((await orderedList.head()).toNumber()).should.be.equal(middleId);
        ((await orderedList.tail()).toNumber()).should.be.equal(middleId);

        (await orderedList.remove(middleId)).logs[1].args.id.toNumber();
        ((await orderedList.head()).toNumber()).should.be.equal(0);
        ((await orderedList.tail()).toNumber()).should.be.equal(0);
    });
});

/** @test {orderedList} contract */
contract('OrderedList - insert', (accounts) => {

    const insertedData = '0x0000000000000000000000000000000000000004';
    const insertedRank = 4;

    let orderedList: OrderedListInstance;
    let headId: number;
    let middleId: number;
    let tailId: number;

    beforeEach(async () => {
        orderedList = await OrderedList.new();
        tailId = (
            await orderedList.addHead(tailRank, tailData)
        ).logs[0].args.id.toNumber();
        middleId = (
            await orderedList.addHead(middleRank, middleData)
        ).logs[0].args.id.toNumber();
        headId = (
            await orderedList.addHead(headRank, headData)
        ).logs[0].args.id.toNumber();

    });

    it('inserts after the head.', async () => {
        const insertedId = (
            await orderedList.insertAfter(headId, insertedRank, insertedData)
        ).logs[0].args.id.toNumber();
        ((await orderedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await orderedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(insertedId);
        headObject[2].toNumber().should.be.equal(0);
        headObject[3].toNumber().should.be.equal(headRank);
        headObject[4].should.be.equal(headData);

        const insertedObject = (await orderedList.get(insertedId));
        insertedObject[0].toNumber().should.be.equal(insertedId);
        insertedObject[1].toNumber().should.be.equal(middleId);
        insertedObject[2].toNumber().should.be.equal(headId);
        insertedObject[3].toNumber().should.be.equal(insertedRank);
        insertedObject[4].should.be.equal(insertedData);

        const middleObject = (await orderedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(tailId);
        middleObject[2].toNumber().should.be.equal(insertedId);
        middleObject[3].toNumber().should.be.equal(middleRank);
        middleObject[4].should.be.equal(middleData);

        const tailObject = (await orderedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].toNumber().should.be.equal(middleId);
        tailObject[3].toNumber().should.be.equal(tailRank);
        tailObject[4].should.be.equal(tailData);
    });

    it('inserts after the tail.', async () => {
        const insertedId = (
            await orderedList.insertAfter(tailId, insertedRank, insertedData)
        ).logs[0].args.id.toNumber();
        ((await orderedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await orderedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(middleId);
        headObject[2].toNumber().should.be.equal(0);
        headObject[3].toNumber().should.be.equal(headRank);
        headObject[4].should.be.equal(headData);

        const middleObject = (await orderedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(tailId);
        middleObject[2].toNumber().should.be.equal(headId);
        middleObject[3].toNumber().should.be.equal(middleRank);
        middleObject[4].should.be.equal(middleData);

        const tailObject = (await orderedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(insertedId);
        tailObject[2].toNumber().should.be.equal(middleId);
        tailObject[3].toNumber().should.be.equal(tailRank);
        tailObject[4].should.be.equal(tailData);

        const insertedObject = (await orderedList.get(insertedId));
        insertedObject[0].toNumber().should.be.equal(insertedId);
        insertedObject[1].toNumber().should.be.equal(0);
        insertedObject[2].toNumber().should.be.equal(tailId);
        insertedObject[3].toNumber().should.be.equal(insertedRank);
        insertedObject[4].should.be.equal(insertedData);
    });

    it('inserts after the middle.', async () => {
        const insertedId = (
            await orderedList.insertAfter(middleId, insertedRank, insertedData)
        ).logs[0].args.id.toNumber();
        ((await orderedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await orderedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(middleId);
        headObject[2].toNumber().should.be.equal(0);
        headObject[3].toNumber().should.be.equal(headRank);
        headObject[4].should.be.equal(headData);

        const middleObject = (await orderedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(insertedId);
        middleObject[2].toNumber().should.be.equal(headId);
        middleObject[3].toNumber().should.be.equal(middleRank);
        middleObject[4].should.be.equal(middleData);

        const insertedObject = (await orderedList.get(insertedId));
        insertedObject[0].toNumber().should.be.equal(insertedId);
        insertedObject[1].toNumber().should.be.equal(tailId);
        insertedObject[2].toNumber().should.be.equal(middleId);
        insertedObject[3].toNumber().should.be.equal(insertedRank);
        insertedObject[4].should.be.equal(insertedData);

        const tailObject = (await orderedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].toNumber().should.be.equal(insertedId);
        tailObject[3].toNumber().should.be.equal(tailRank);
        tailObject[4].should.be.equal(tailData);
    });

    it('inserts before the head.', async () => {
        const insertedId = (
            await orderedList.insertBefore(headId, insertedRank, insertedData)
        ).logs[0].args.id.toNumber();
        ((await orderedList.head()).toNumber()).should.be.equal(insertedId);

        const insertedObject = (await orderedList.get(insertedId));
        insertedObject[0].toNumber().should.be.equal(insertedId);
        insertedObject[1].toNumber().should.be.equal(headId);
        insertedObject[2].toNumber().should.be.equal(0);
        insertedObject[3].toNumber().should.be.equal(insertedRank);
        insertedObject[4].should.be.equal(insertedData);

        const headObject = (await orderedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(middleId);
        headObject[2].toNumber().should.be.equal(insertedId);
        headObject[3].toNumber().should.be.equal(headRank);
        headObject[4].should.be.equal(headData);

        const middleObject = (await orderedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(tailId);
        middleObject[2].toNumber().should.be.equal(headId);
        middleObject[3].toNumber().should.be.equal(middleRank);
        middleObject[4].should.be.equal(middleData);

        const tailObject = (await orderedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].toNumber().should.be.equal(middleId);
        tailObject[3].toNumber().should.be.equal(tailRank);
        tailObject[4].should.be.equal(tailData);
    });

    it('inserts before the tail.', async () => {
        const insertedId = (
            await orderedList.insertBefore(tailId, insertedRank, insertedData)
        ).logs[0].args.id.toNumber();
        ((await orderedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await orderedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(middleId);
        headObject[2].toNumber().should.be.equal(0);
        headObject[3].toNumber().should.be.equal(headRank);
        headObject[4].should.be.equal(headData);

        const middleObject = (await orderedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(insertedId);
        middleObject[2].toNumber().should.be.equal(headId);
        middleObject[3].toNumber().should.be.equal(middleRank);
        middleObject[4].should.be.equal(middleData);

        const insertedObject = (await orderedList.get(insertedId));
        insertedObject[0].toNumber().should.be.equal(insertedId);
        insertedObject[1].toNumber().should.be.equal(tailId);
        insertedObject[2].toNumber().should.be.equal(middleId);
        insertedObject[3].toNumber().should.be.equal(insertedRank);
        insertedObject[4].should.be.equal(insertedData);

        const tailObject = (await orderedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].toNumber().should.be.equal(insertedId);
        tailObject[3].toNumber().should.be.equal(tailRank);
        tailObject[4].should.be.equal(tailData);
    });

    it('inserts before the middle.', async () => {
        const insertedId = (
            await orderedList.insertBefore(middleId, insertedRank, insertedData)
        ).logs[0].args.id.toNumber();
        ((await orderedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await orderedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(insertedId);
        headObject[2].toNumber().should.be.equal(0);
        headObject[3].toNumber().should.be.equal(headRank);
        headObject[4].should.be.equal(headData);

        const insertedObject = (await orderedList.get(insertedId));
        insertedObject[0].toNumber().should.be.equal(insertedId);
        insertedObject[1].toNumber().should.be.equal(middleId);
        insertedObject[2].toNumber().should.be.equal(headId);
        insertedObject[3].toNumber().should.be.equal(insertedRank);
        insertedObject[4].should.be.equal(insertedData);

        const middleObject = (await orderedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(tailId);
        middleObject[2].toNumber().should.be.equal(insertedId);
        middleObject[3].toNumber().should.be.equal(middleRank);
        middleObject[4].should.be.equal(middleData);

        const tailObject = (await orderedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].toNumber().should.be.equal(middleId);
        tailObject[3].toNumber().should.be.equal(tailRank);
        tailObject[4].should.be.equal(tailData);
    });
});

/* contract('OrderedList - gas tests', (accounts) => {
    let orderedList: OrderedListInstance;
    const dummyData = '0x0000000000000000000000000000000000000001';

    beforeEach(async () => {
        orderedList = await OrderedList.new();
        for (let i = 0; i < 100; i++) {
            await orderedList.addHead(dummyData);
        }
    });

    it('Add Head.', async () => {
        await orderedList.addHead(dummyData);
    });

    it('Add Tail.', async () => {
        await orderedList.addTail(dummyData);
    });

    it('Insert After.', async () => {
        const tailId = await orderedList.tail();
        await orderedList.insertAfter(tailId, dummyData);
    });

    it('Insert Before.', async () => {
        const tailId = await orderedList.tail();
        await orderedList.insertBefore(tailId, dummyData);
    });

    it('Remove.', async () => {
        const tailId = await orderedList.tail();
        await orderedList.remove(tailId);
    });
}); */
