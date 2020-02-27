import { should } from 'chai';
import { RankedListMockInstance } from '../../../types/truffle-contracts';

const RankedList = artifacts.require('RankedListMock') as Truffle.Contract<RankedListMockInstance>;
should();

const emptyData = '0x0000000000000000000000000000000000000000';
const headData = '0x0000000000000000000000000000000000000001';
const middleData = '0x0000000000000000000000000000000000000002';
const tailData = '0x0000000000000000000000000000000000000003';

const headRank = 30;
const middleRank = 20;
const tailRank = 10;

/** @test {RankedList} contract */
contract('RankedList - add', (accounts) => {

    let rankedList: RankedListMockInstance;

    beforeEach(async () => {
        rankedList = await RankedList.new();
    });

    /**
     * @test {RankedList#new} and {RankedList#idCounter}
     */
    it('Constructor variables.', async () => {
        (await rankedList.idCounter()).toNumber().should.be.equal(1);
    });

    /**
     * @test {RankedList#get}
     */
    it('get on a non existing object returns (0,0,0,0,0).', async () => {
        const result = (await rankedList.get(0));
        assertEqualObjects(result, [0, 0, 0, 0, emptyData]);
    });

    /**
     * @test {RankedList#addHead}
     */
    it('adds an object at the head - event emission.', async () => {
        const transaction = (
            await rankedList.addHead(headRank, headData)
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
     * @test {RankedList#addHead}
     */
    it('adds an object at the head - data storage.', async () => {
        const objectId = (
            await rankedList.addHead(headRank, headData)
        ).logs[0].args.id.toNumber();

        const result = (await rankedList.get(objectId));
        assertEqualObjects(result, [objectId, 0, 0, headRank, headData]);
    });

    /**
     * @test {RankedList#addHead}
     */
    it('adds two objects from the head.', async () => {
        const objectOneId = (
            await rankedList.addHead(middleRank, middleData)
        ).logs[0].args.id.toNumber();
        const objectTwoId = (
            await rankedList.addHead(headRank, headData)
        ).logs[0].args.id.toNumber();

        const objectOne = (await rankedList.get(objectOneId));
        assertEqualObjects(objectOne, [objectOneId, 0, objectTwoId, middleRank, middleData]);

        const objectTwo = (await rankedList.get(objectTwoId));
        assertEqualObjects(objectTwo, [objectTwoId, objectOneId, 0, headRank, headData]);

        ((await rankedList.head()).toNumber()).should.be.equal(objectTwoId);
    });

    /**
     * @test {RankedList#addTail}
     */
    it('adds an object at the tail - event emission.', async () => {
        const objectEvent = (
            await rankedList.addTail(headRank, headData)
        ).logs[0];
        objectEvent.args.id.toNumber().should.be.equal(1);
        objectEvent.args.rank.toNumber().should.be.equal(headRank);
        objectEvent.args.data.should.be.equal(headData);
    });

    /**
     * @test {RankedList#addTail}
     */
    it('adds an object at the tail - data storage.', async () => {
        const objectId = (
            await rankedList.addTail(headRank, headData)
        ).logs[0].args.id.toNumber();

        const result = (await rankedList.get(objectId));
        assertEqualObjects(result, [objectId, 0, 0, headRank, headData]);
    });

    /**
     * @test {RankedList#addTail}
     */
    it('adds two objects from the tail.', async () => {
        const objectOneId = (
            await rankedList.addTail(middleRank, middleData)
        ).logs[0].args.id.toNumber();
        const objectTwoId = (
            await rankedList.addTail(headRank, headData)
        ).logs[0].args.id.toNumber();

        const objectOne = (await rankedList.get(objectOneId));
        assertEqualObjects(objectOne, [objectOneId, objectTwoId, 0, middleRank, middleData]);

        const objectTwo = (await rankedList.get(objectTwoId));
        assertEqualObjects(objectTwo, [objectTwoId, 0, objectOneId, headRank, headData]);

        ((await rankedList.head()).toNumber()).should.be.equal(objectOneId);
    });
});

/** @test {rankedList} contract */
contract('RankedList - remove', (accounts) => {

    let rankedList: RankedListMockInstance;
    let headId: number;
    let middleId: number;
    let tailId: number;

    beforeEach(async () => {
        rankedList = await RankedList.new();
        tailId = (
            await rankedList.addHead(tailRank, tailData)
        ).logs[0].args.id.toNumber();
        middleId = (
            await rankedList.addHead(middleRank, middleData)
        ).logs[0].args.id.toNumber();
        headId = (
            await rankedList.addHead(headRank, headData)
        ).logs[0].args.id.toNumber();

    });

    /**
     * @test {RankedList#remove}
     */
    it('removes the head.', async () => {
        const removedId = (
            await rankedList.remove(headId)
        ).logs[1].args.id.toNumber();
        ((await rankedList.head()).toNumber()).should.be.equal(middleId);

        const middleObject = (await rankedList.get(middleId));
        assertEqualObjects(middleObject, [middleId, tailId, 0, middleRank, middleData]);

        const tailObject = (await rankedList.get(tailId));
        assertEqualObjects(tailObject, [tailId, 0, middleId, tailRank, tailData]);
    });

    /**
     * @test {RankedList#remove}
     */
    it('removes the tail.', async () => {
        const removedId = (
            await rankedList.remove(tailId)
        ).logs[1].args.id.toNumber();
        ((await rankedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await rankedList.get(headId));
        assertEqualObjects(headObject, [headId, middleId, 0, headRank, headData]);

        const middleObject = (await rankedList.get(middleId));
        assertEqualObjects(middleObject, [middleId, 0, headId, middleRank, middleData]);
    });

    /**
     * @test {RankedList#remove}
     */
    it('removes the middle.', async () => {
        const removedId = (
            await rankedList.remove(middleId)
        ).logs[1].args.id.toNumber();
        ((await rankedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await rankedList.get(headId));
        assertEqualObjects(headObject, [headId, tailId, 0, headRank, headData]);

        const tailObject = (await rankedList.get(tailId));
        assertEqualObjects(tailObject, [tailId, 0, headId, tailRank, tailData]);
    });

    /**
     * @test {RankedList#remove}
     */
    it('removes all.', async () => {
        (await rankedList.remove(headId)).logs[1].args.id.toNumber();
        ((await rankedList.head()).toNumber()).should.be.equal(middleId);

        (await rankedList.remove(tailId)).logs[1].args.id.toNumber();
        ((await rankedList.head()).toNumber()).should.be.equal(middleId);
        ((await rankedList.tail()).toNumber()).should.be.equal(middleId);

        (await rankedList.remove(middleId)).logs[1].args.id.toNumber();
        ((await rankedList.head()).toNumber()).should.be.equal(0);
        ((await rankedList.tail()).toNumber()).should.be.equal(0);
    });
});

/** @test {rankedList} contract */
contract('RankedList - insert', (accounts) => {

    const insertedData = '0x0000000000000000000000000000000000000004';
    const insertedRank = 4;

    let rankedList: RankedListMockInstance;
    let headId: number;
    let middleId: number;
    let tailId: number;

    beforeEach(async () => {
        rankedList = await RankedList.new();
        tailId = (
            await rankedList.addHead(tailRank, tailData)
        ).logs[0].args.id.toNumber();
        middleId = (
            await rankedList.addHead(middleRank, middleData)
        ).logs[0].args.id.toNumber();
        headId = (
            await rankedList.addHead(headRank, headData)
        ).logs[0].args.id.toNumber();

    });

    it('inserts after the head.', async () => {
        const insertedId = (
            await rankedList.insertAfter(headId, insertedRank, insertedData)
        ).logs[0].args.id.toNumber();
        ((await rankedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await rankedList.get(headId));
        assertEqualObjects(headObject, [headId, insertedId, 0, headRank, headData]);

        const insertedObject = (await rankedList.get(insertedId));
        assertEqualObjects(insertedObject, [insertedId, middleId, headId, insertedRank, insertedData]);

        const middleObject = (await rankedList.get(middleId));
        assertEqualObjects(middleObject, [middleId, tailId, insertedId, middleRank, middleData]);

        const tailObject = (await rankedList.get(tailId));
        assertEqualObjects(tailObject, [tailId, 0, middleId, tailRank, tailData]);
    });

    it('inserts after the tail.', async () => {
        const insertedId = (
            await rankedList.insertAfter(tailId, insertedRank, insertedData)
        ).logs[0].args.id.toNumber();
        ((await rankedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await rankedList.get(headId));
        assertEqualObjects(headObject, [headId, middleId, 0, headRank, headData]);

        const middleObject = (await rankedList.get(middleId));
        assertEqualObjects(middleObject, [middleId, tailId, headId, middleRank, middleData]);

        const tailObject = (await rankedList.get(tailId));
        assertEqualObjects(tailObject, [tailId, insertedId, middleId, tailRank, tailData]);

        const insertedObject = (await rankedList.get(insertedId));
        assertEqualObjects(insertedObject, [insertedId, 0, tailId, insertedRank, insertedData]);
    });

    it('inserts after the middle.', async () => {
        const insertedId = (
            await rankedList.insertAfter(middleId, insertedRank, insertedData)
        ).logs[0].args.id.toNumber();
        ((await rankedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await rankedList.get(headId));
        assertEqualObjects(headObject, [headId, middleId, 0, headRank, headData]);

        const middleObject = (await rankedList.get(middleId));
        assertEqualObjects(middleObject, [middleId, insertedId, headId, middleRank, middleData]);

        const insertedObject = (await rankedList.get(insertedId));
        assertEqualObjects(insertedObject, [insertedId, tailId, middleId, insertedRank, insertedData]);

        const tailObject = (await rankedList.get(tailId));
        assertEqualObjects(tailObject, [tailId, 0, insertedId, tailRank, tailData]);
    });

    it('inserts before the head.', async () => {
        const insertedId = (
            await rankedList.insertBefore(headId, insertedRank, insertedData)
        ).logs[0].args.id.toNumber();
        ((await rankedList.head()).toNumber()).should.be.equal(insertedId);

        const insertedObject = (await rankedList.get(insertedId));
        assertEqualObjects(insertedObject, [insertedId, headId, 0, insertedRank, insertedData]);

        const headObject = (await rankedList.get(headId));
        assertEqualObjects(headObject, [headId, middleId, insertedId, headRank, headData]);

        const middleObject = (await rankedList.get(middleId));
        assertEqualObjects(middleObject, [middleId, tailId, headId, middleRank, middleData]);

        const tailObject = (await rankedList.get(tailId));
        assertEqualObjects(tailObject, [tailId, 0, middleId, tailRank, tailData]);
    });

    it('inserts before the tail.', async () => {
        const insertedId = (
            await rankedList.insertBefore(tailId, insertedRank, insertedData)
        ).logs[0].args.id.toNumber();
        ((await rankedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await rankedList.get(headId));
        assertEqualObjects(headObject, [headId, middleId, 0, headRank, headData]);

        const middleObject = (await rankedList.get(middleId));
        assertEqualObjects(middleObject, [middleId, insertedId, headId, middleRank, middleData]);

        const insertedObject = (await rankedList.get(insertedId));
        assertEqualObjects(insertedObject, [insertedId, tailId, middleId, insertedRank, insertedData]);

        const tailObject = (await rankedList.get(tailId));
        assertEqualObjects(tailObject, [tailId, 0, insertedId, tailRank, tailData]);
    });

    it('inserts before the middle.', async () => {
        const insertedId = (
            await rankedList.insertBefore(middleId, insertedRank, insertedData)
        ).logs[0].args.id.toNumber();
        ((await rankedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await rankedList.get(headId));
        assertEqualObjects(headObject, [headId, insertedId, 0, headRank, headData]);

        const insertedObject = (await rankedList.get(insertedId));
        assertEqualObjects(insertedObject, [insertedId, middleId, headId, insertedRank, insertedData]);

        const middleObject = (await rankedList.get(middleId));
        assertEqualObjects(middleObject, [middleId, tailId, insertedId, middleRank, middleData]);

        const tailObject = (await rankedList.get(tailId));
        assertEqualObjects(tailObject, [tailId, 0, middleId, tailRank, tailData]);
    });
});

contract('RankedList - find and insert', (accounts) => {

    let rankedList: RankedListMockInstance;
    let headId: number;
    let middleId: number;
    let tailId: number;

    const insertedData = '0x0000000000000000000000000000000000000004';

    beforeEach(async () => {
        rankedList = await RankedList.new();
        tailId = (
            await rankedList.addHead(tailRank, tailData)
        ).logs[0].args.id.toNumber();
        middleId = (
            await rankedList.addHead(middleRank, middleData)
        ).logs[0].args.id.toNumber();
        headId = (
            await rankedList.addHead(headRank, headData)
        ).logs[0].args.id.toNumber();
    });

    it('finds the id for the first object with equal or lower rank.', async () => {
        let resultId = (await rankedList.findRank(headRank));
        resultId.toNumber().should.be.equal(headId);
        resultId = (await rankedList.findRank(middleRank));
        resultId.toNumber().should.be.equal(middleId);
        resultId = (await rankedList.findRank(tailRank));
        resultId.toNumber().should.be.equal(tailId);
        resultId = (await rankedList.findRank(tailRank - 1));
        resultId.toNumber().should.be.equal(0);
    });

    it('inserts before the tail.', async () => {
        const insertedId = (
            await rankedList.insert(5, insertedData)
        ).logs[0].args.id.toNumber();

        const headObject = (await rankedList.get(headId));
        assertEqualObjects(headObject, [headId, middleId, 0, headRank, headData]);

        const middleObject = (await rankedList.get(middleId));
        assertEqualObjects(middleObject, [middleId, tailId, headId, middleRank, middleData]);

        const tailObject = (await rankedList.get(tailId));
        assertEqualObjects(tailObject, [tailId, insertedId, middleId, tailRank, tailData]);

        const insertedObject = (await rankedList.get(insertedId));
        assertEqualObjects(insertedObject, [insertedId, 0, tailId, 5, insertedData]);
    });

    it('inserts in the middle.', async () => {
        const insertedId = (
            await rankedList.insert(25, insertedData)
        ).logs[0].args.id.toNumber();

        const headObject = (await rankedList.get(headId));
        assertEqualObjects(headObject, [headId, insertedId, 0, headRank, headData]);

        const insertedObject = (await rankedList.get(insertedId));
        assertEqualObjects(insertedObject, [insertedId, middleId, headId, 25, insertedData]);

        const middleObject = (await rankedList.get(middleId));
        assertEqualObjects(middleObject, [middleId, tailId, insertedId, middleRank, middleData]);

        const tailObject = (await rankedList.get(tailId));
        assertEqualObjects(tailObject, [tailId, 0, middleId, tailRank, tailData]);
    });

    it('inserts after the head.', async () => {
        const insertedId = (
            await rankedList.insert(35, insertedData)
        ).logs[0].args.id.toNumber();

        const insertedObject = (await rankedList.get(insertedId));
        assertEqualObjects(insertedObject, [insertedId, headId, 0, 35, insertedData]);

        const headObject = (await rankedList.get(headId));
        assertEqualObjects(headObject, [headId, middleId, insertedId, headRank, headData]);

        const middleObject = (await rankedList.get(middleId));
        assertEqualObjects(middleObject, [middleId, tailId, headId, middleRank, middleData]);

        const tailObject = (await rankedList.get(tailId));
        assertEqualObjects(tailObject, [tailId, 0, middleId, tailRank, tailData]);
    });
});

/* contract('RankedList - gas tests', (accounts) => {
    let rankedList: RankedListInstance;
    const dummyData = '0x0000000000000000000000000000000000000001';

    beforeEach(async () => {
        rankedList = await RankedList.new();
        for (let i = 0; i < 100; i++) {
            await rankedList.addHead(dummyData);
        }
    });

    it('Add Head.', async () => {
        await rankedList.addHead(dummyData);
    });

    it('Add Tail.', async () => {
        await rankedList.addTail(dummyData);
    });

    it('Insert After.', async () => {
        const tailId = await rankedList.tail();
        await rankedList.insertAfter(tailId, dummyData);
    });

    it('Insert Before.', async () => {
        const tailId = await rankedList.tail();
        await rankedList.insertBefore(tailId, dummyData);
    });

    it('Remove.', async () => {
        const tailId = await rankedList.tail();
        await rankedList.remove(tailId);
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
