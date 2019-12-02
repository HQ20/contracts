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
        assertEqualObjects(result, [0, 0, 0, 0, emptyData]);
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
        assertEqualObjects(result, [objectId, 0, 0, headRank, headData]);
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
        assertEqualObjects(objectOne, [objectOneId, 0, objectTwoId, middleRank, middleData]);

        const objectTwo = (await orderedList.get(objectTwoId));
        assertEqualObjects(objectTwo, [objectTwoId, objectOneId, 0, headRank, headData]);

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
        assertEqualObjects(result, [objectId, 0, 0, headRank, headData]);
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
        assertEqualObjects(objectOne, [objectOneId, objectTwoId, 0, middleRank, middleData]);

        const objectTwo = (await orderedList.get(objectTwoId));
        assertEqualObjects(objectTwo, [objectTwoId, 0, objectOneId, headRank, headData]);

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
        assertEqualObjects(middleObject, [middleId, tailId, 0, middleRank, middleData]);

        const tailObject = (await orderedList.get(tailId));
        assertEqualObjects(tailObject, [tailId, 0, middleId, tailRank, tailData]);
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
        assertEqualObjects(headObject, [headId, middleId, 0, headRank, headData]);

        const middleObject = (await orderedList.get(middleId));
        assertEqualObjects(middleObject, [middleId, 0, headId, middleRank, middleData]);
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
        assertEqualObjects(headObject, [headId, tailId, 0, headRank, headData]);

        const tailObject = (await orderedList.get(tailId));
        assertEqualObjects(tailObject, [tailId, 0, headId, tailRank, tailData]);
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
        assertEqualObjects(headObject, [headId, insertedId, 0, headRank, headData]);

        const insertedObject = (await orderedList.get(insertedId));
        assertEqualObjects(insertedObject, [insertedId, middleId, headId, insertedRank, insertedData]);

        const middleObject = (await orderedList.get(middleId));
        assertEqualObjects(middleObject, [middleId, tailId, insertedId, middleRank, middleData]);

        const tailObject = (await orderedList.get(tailId));
        assertEqualObjects(tailObject, [tailId, 0, middleId, tailRank, tailData]);
    });

    it('inserts after the tail.', async () => {
        const insertedId = (
            await orderedList.insertAfter(tailId, insertedRank, insertedData)
        ).logs[0].args.id.toNumber();
        ((await orderedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await orderedList.get(headId));
        assertEqualObjects(headObject, [headId, middleId, 0, headRank, headData]);

        const middleObject = (await orderedList.get(middleId));
        assertEqualObjects(middleObject, [middleId, tailId, headId, middleRank, middleData]);

        const tailObject = (await orderedList.get(tailId));
        assertEqualObjects(tailObject, [tailId, insertedId, middleId, tailRank, tailData]);

        const insertedObject = (await orderedList.get(insertedId));
        assertEqualObjects(insertedObject, [insertedId, 0, tailId, insertedRank, insertedData]);
    });

    it('inserts after the middle.', async () => {
        const insertedId = (
            await orderedList.insertAfter(middleId, insertedRank, insertedData)
        ).logs[0].args.id.toNumber();
        ((await orderedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await orderedList.get(headId));
        assertEqualObjects(headObject, [headId, middleId, 0, headRank, headData]);

        const middleObject = (await orderedList.get(middleId));
        assertEqualObjects(middleObject, [middleId, insertedId, headId, middleRank, middleData]);

        const insertedObject = (await orderedList.get(insertedId));
        assertEqualObjects(insertedObject, [insertedId, tailId, middleId, insertedRank, insertedData]);

        const tailObject = (await orderedList.get(tailId));
        assertEqualObjects(tailObject, [tailId, 0, insertedId, tailRank, tailData]);
    });

    it('inserts before the head.', async () => {
        const insertedId = (
            await orderedList.insertBefore(headId, insertedRank, insertedData)
        ).logs[0].args.id.toNumber();
        ((await orderedList.head()).toNumber()).should.be.equal(insertedId);

        const insertedObject = (await orderedList.get(insertedId));
        assertEqualObjects(insertedObject, [insertedId, headId, 0, insertedRank, insertedData]);

        const headObject = (await orderedList.get(headId));
        assertEqualObjects(headObject, [headId, middleId, insertedId, headRank, headData]);

        const middleObject = (await orderedList.get(middleId));
        assertEqualObjects(middleObject, [middleId, tailId, headId, middleRank, middleData]);

        const tailObject = (await orderedList.get(tailId));
        assertEqualObjects(tailObject, [tailId, 0, middleId, tailRank, tailData]);
    });

    it('inserts before the tail.', async () => {
        const insertedId = (
            await orderedList.insertBefore(tailId, insertedRank, insertedData)
        ).logs[0].args.id.toNumber();
        ((await orderedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await orderedList.get(headId));
        assertEqualObjects(headObject, [headId, middleId, 0, headRank, headData]);

        const middleObject = (await orderedList.get(middleId));
        assertEqualObjects(middleObject, [middleId, insertedId, headId, middleRank, middleData]);

        const insertedObject = (await orderedList.get(insertedId));
        assertEqualObjects(insertedObject, [insertedId, tailId, middleId, insertedRank, insertedData]);

        const tailObject = (await orderedList.get(tailId));
        assertEqualObjects(tailObject, [tailId, 0, insertedId, tailRank, tailData]);
    });

    it('inserts before the middle.', async () => {
        const insertedId = (
            await orderedList.insertBefore(middleId, insertedRank, insertedData)
        ).logs[0].args.id.toNumber();
        ((await orderedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await orderedList.get(headId));
        assertEqualObjects(headObject, [headId, insertedId, 0, headRank, headData]);

        const insertedObject = (await orderedList.get(insertedId));
        assertEqualObjects(insertedObject, [insertedId, middleId, headId, insertedRank, insertedData]);

        const middleObject = (await orderedList.get(middleId));
        assertEqualObjects(middleObject, [middleId, tailId, insertedId, middleRank, middleData]);

        const tailObject = (await orderedList.get(tailId));
        assertEqualObjects(tailObject, [tailId, 0, middleId, tailRank, tailData]);
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

function assertEqualObjects(
    object1: [any, any, any, any, any],
    object2: [any, any, any, any, any],
) {
    object1[0].toNumber().should.be.equal(object2[0]);
    object1[1].toNumber().should.be.equal(object2[1]);
    object1[2].toNumber().should.be.equal(object2[2]);
    object1[3].toNumber().should.be.equal(object2[3]);
    object1[4].should.be.equal(object2[4]);
}
