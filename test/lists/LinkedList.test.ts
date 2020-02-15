import { should } from 'chai';
import { LinkedListInstance } from '../../types/truffle-contracts';
import { TestLinkedListInstance } from '../../types/truffle-contracts';

const LinkedList = artifacts.require('LinkedList')  as Truffle.Contract<LinkedListInstance>;
const TestLinkedList = artifacts.require('TestLinkedList') as Truffle.Contract<TestLinkedListInstance>;
should();

const emptyData = '0x0000000000000000000000000000000000000000';
const headData = '0x0000000000000000000000000000000000000001';
const middleData = '0x0000000000000000000000000000000000000002';
const tailData = '0x0000000000000000000000000000000000000003';

/** @test {LinkedList} contract */
contract('LinkedList - add', (accounts) => {

    let linkedList: LinkedListInstance;

    beforeEach(async () => {
        linkedList = await LinkedList.new();
    });

    /**
     * Test the two contract methods
     * @test {LinkedList#set} and {LinkedList#get}
     */
    it('Constructor variables.', async () => {
        ((await linkedList.idCounter()).toNumber()).should.be.equal(1);
    });

    it('get on a non existing object returns (0,0,0).', async () => {
        const result = (await linkedList.get(0));
        result[0].toNumber().should.be.equal(0);
        result[1].toNumber().should.be.equal(0);
        result[2].should.be.equal(emptyData);
    });

    it('adds an object at the head - event emission.', async () => {
        const objectEvent = (
            await linkedList.addHead(headData)
        ).logs[0];
        objectEvent.args.id.toNumber().should.be.equal(1);
        objectEvent.args.data.should.be.equal(headData);
    });

    it('adds an object at the head - data storage.', async () => {
        const objectId = (
            await linkedList.addHead(headData)
        ).logs[0].args.id.toNumber();

        const result = (await linkedList.get(objectId));
        result[0].toNumber().should.be.equal(objectId);
        result[1].toNumber().should.be.equal(0);
        result[2].should.be.equal(headData);
    });

    it('adds two objects from the head.', async () => {
        const objectOneId = (
            await linkedList.addHead(headData)
        ).logs[0].args.id.toNumber();
        const objectTwoId = (
            await linkedList.addHead(middleData)
        ).logs[0].args.id.toNumber();

        const objectOne = (await linkedList.get(objectOneId));
        objectOne[0].toNumber().should.be.equal(objectOneId);
        objectOne[1].toNumber().should.be.equal(0);
        objectOne[2].should.be.equal(headData);

        const objectTwo = (await linkedList.get(objectTwoId));
        objectTwo[0].toNumber().should.be.equal(objectTwoId);
        objectTwo[1].toNumber().should.be.equal(objectOneId);
        objectTwo[2].should.be.equal(middleData);

        ((await linkedList.head()).toNumber()).should.be.equal(objectTwoId);
    });

    it('adds an object at the tail - event emission.', async () => {
        const objectEvent = (
            await linkedList.addTail(headData)
        ).logs[0];
        objectEvent.args.id.toNumber().should.be.equal(1);
        objectEvent.args.data.should.be.equal(headData);
    });

    it('adds an object at the tail - data storage.', async () => {
        const objectId = (
            await linkedList.addTail(headData)
        ).logs[0].args.id.toNumber();

        const result = (await linkedList.get(objectId));
        result[0].toNumber().should.be.equal(objectId);
        result[1].toNumber().should.be.equal(0);
        result[2].should.be.equal(headData);
    });

    it('adds two objects from the tail.', async () => {
        const objectOneId = (
            await linkedList.addTail(headData)
        ).logs[0].args.id.toNumber();
        const objectTwoId = (
            await linkedList.addTail(middleData)
        ).logs[0].args.id.toNumber();

        const objectOne = (await linkedList.get(objectOneId));
        objectOne[0].toNumber().should.be.equal(objectOneId);
        objectOne[1].toNumber().should.be.equal(objectTwoId);
        objectOne[2].should.be.equal(headData);

        const objectTwo = (await linkedList.get(objectTwoId));
        objectTwo[0].toNumber().should.be.equal(objectTwoId);
        objectTwo[1].toNumber().should.be.equal(0);
        objectTwo[2].should.be.equal(middleData);

        ((await linkedList.head()).toNumber()).should.be.equal(objectOneId);
    });
});

contract('LinkedList - find', (accounts) => {

    let linkedList: LinkedListInstance;
    let headId: number;
    let middleId: number;
    let tailId: number;

    beforeEach(async () => {
        linkedList = await LinkedList.new();
        tailId = (
            await linkedList.addHead(tailData)
        ).logs[0].args.id.toNumber();
        middleId = (
            await linkedList.addHead(middleData)
        ).logs[0].args.id.toNumber();
        headId = (
            await linkedList.addHead(headData)
        ).logs[0].args.id.toNumber();
    });

    it('finds an id for given data.', async () => {
        let resultId = (await linkedList.findIdForData(headData));
        resultId.toNumber().should.be.equal(headId);
        resultId = (await linkedList.findIdForData(middleData));
        resultId.toNumber().should.be.equal(middleId);
        resultId = (await linkedList.findIdForData(tailData));
        resultId.toNumber().should.be.equal(tailId);
    });

    it('finds the tail id.', async () => {
        (await linkedList.findTailId()).toNumber().should.be.equal(tailId);
    });
});

/** @test {LinkedList} contract */
contract('LinkedList - remove', (accounts) => {

    let linkedList: LinkedListInstance;
    let headId: number;
    let middleId: number;
    let tailId: number;

    beforeEach(async () => {
        linkedList = await LinkedList.new();
        tailId = (
            await linkedList.addHead(tailData)
        ).logs[0].args.id.toNumber();
        middleId = (
            await linkedList.addHead(middleData)
        ).logs[0].args.id.toNumber();
        headId = (
            await linkedList.addHead(headData)
        ).logs[0].args.id.toNumber();

    });

    it('removes the head.', async () => {
        const removedId = (
            await linkedList.remove(headId)
        ).logs[1].args.id.toNumber();
        removedId.should.be.equal(headId);
        ((await linkedList.head()).toNumber()).should.be.equal(middleId);

        const middleObject = (await linkedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(tailId);
        middleObject[2].should.be.equal(middleData);

        const tailObject = (await linkedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].should.be.equal(tailData);
    });

    it('removes the tail.', async () => {
        const removedId = (
            await linkedList.remove(tailId)
        ).logs[1].args.id.toNumber();
        removedId.should.be.equal(tailId);
        ((await linkedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await linkedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(middleId);
        headObject[2].should.be.equal(headData);

        const middleObject = (await linkedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(0);
        middleObject[2].should.be.equal(middleData);
    });

    it('removes the middle.', async () => {
        const removedId = (
            await linkedList.remove(middleId)
        ).logs[1].args.id.toNumber();
        removedId.should.be.equal(middleId);
        ((await linkedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await linkedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(tailId);
        headObject[2].should.be.equal(headData);

        const tailObject = (await linkedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].should.be.equal(tailData);
    });

    it('removes all.', async () => {
        (await linkedList.remove(headId)).logs[1].args.id.toNumber();
        ((await linkedList.head()).toNumber()).should.be.equal(middleId);

        (await linkedList.remove(tailId)).logs[1].args.id.toNumber();
        ((await linkedList.head()).toNumber()).should.be.equal(middleId);

        (await linkedList.remove(middleId)).logs[1].args.id.toNumber();
        ((await linkedList.head()).toNumber()).should.be.equal(0);
    });
});

/** @test {LinkedList} contract */
contract('LinkedList - insert', (accounts) => {

    const insertedData = '0x0000000000000000000000000000000000000004';

    let linkedList: LinkedListInstance;
    let headId: number;
    let middleId: number;
    let tailId: number;

    beforeEach(async () => {
        linkedList = await LinkedList.new();
        tailId = (
            await linkedList.addHead(tailData)
        ).logs[0].args.id.toNumber();
        middleId = (
            await linkedList.addHead(middleData)
        ).logs[0].args.id.toNumber();
        headId = (
            await linkedList.addHead(headData)
        ).logs[0].args.id.toNumber();
    });

    it('inserts after the head.', async () => {
        const insertedId = (
            await linkedList.insertAfter(headId, insertedData)
        ).logs[0].args.id.toNumber();
        ((await linkedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await linkedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(insertedId);
        headObject[2].should.be.equal(headData);

        const insertedObject = (await linkedList.get(insertedId));
        insertedObject[0].toNumber().should.be.equal(insertedId);
        insertedObject[1].toNumber().should.be.equal(middleId);
        insertedObject[2].should.be.equal(insertedData);

        const middleObject = (await linkedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(tailId);
        middleObject[2].should.be.equal(middleData);

        const tailObject = (await linkedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].should.be.equal(tailData);
    });

    it('inserts after the tail.', async () => {
        const insertedId = (
            await linkedList.insertAfter(tailId, insertedData)
        ).logs[0].args.id.toNumber();
        ((await linkedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await linkedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(middleId);
        headObject[2].should.be.equal(headData);

        const middleObject = (await linkedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(tailId);
        middleObject[2].should.be.equal(middleData);

        const tailObject = (await linkedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(insertedId);
        tailObject[2].should.be.equal(tailData);

        const insertedObject = (await linkedList.get(insertedId));
        insertedObject[0].toNumber().should.be.equal(insertedId);
        insertedObject[1].toNumber().should.be.equal(0);
        insertedObject[2].should.be.equal(insertedData);
    });

    it('inserts after the middle.', async () => {
        const insertedId = (
            await linkedList.insertAfter(middleId, insertedData)
        ).logs[0].args.id.toNumber();
        ((await linkedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await linkedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(middleId);
        headObject[2].should.be.equal(headData);

        const middleObject = (await linkedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(insertedId);
        middleObject[2].should.be.equal(middleData);

        const insertedObject = (await linkedList.get(insertedId));
        insertedObject[0].toNumber().should.be.equal(insertedId);
        insertedObject[1].toNumber().should.be.equal(tailId);
        insertedObject[2].should.be.equal(insertedData);

        const tailObject = (await linkedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].should.be.equal(tailData);
    });

    it('inserts before the head.', async () => {
        const insertedId = (
            await linkedList.insertBefore(headId, insertedData)
        ).logs[0].args.id.toNumber();
        ((await linkedList.head()).toNumber()).should.be.equal(insertedId);

        const insertedObject = (await linkedList.get(insertedId));
        insertedObject[0].toNumber().should.be.equal(insertedId);
        insertedObject[1].toNumber().should.be.equal(headId);
        insertedObject[2].should.be.equal(insertedData);

        const headObject = (await linkedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(middleId);
        headObject[2].should.be.equal(headData);

        const middleObject = (await linkedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(tailId);
        middleObject[2].should.be.equal(middleData);

        const tailObject = (await linkedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].should.be.equal(tailData);
    });

    it('inserts before the tail.', async () => {
        const insertedId = (
            await linkedList.insertBefore(tailId, insertedData)
        ).logs[0].args.id.toNumber();
        ((await linkedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await linkedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(middleId);
        headObject[2].should.be.equal(headData);

        const middleObject = (await linkedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(insertedId);
        middleObject[2].should.be.equal(middleData);

        const insertedObject = (await linkedList.get(insertedId));
        insertedObject[0].toNumber().should.be.equal(insertedId);
        insertedObject[1].toNumber().should.be.equal(tailId);
        insertedObject[2].should.be.equal(insertedData);

        const tailObject = (await linkedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].should.be.equal(tailData);
    });

    it('inserts before the middle.', async () => {
        const insertedId = (
            await linkedList.insertBefore(middleId, insertedData)
        ).logs[0].args.id.toNumber();
        ((await linkedList.head()).toNumber()).should.be.equal(headId);

        const headObject = (await linkedList.get(headId));
        headObject[0].toNumber().should.be.equal(headId);
        headObject[1].toNumber().should.be.equal(insertedId);
        headObject[2].should.be.equal(headData);

        const insertedObject = (await linkedList.get(insertedId));
        insertedObject[0].toNumber().should.be.equal(insertedId);
        insertedObject[1].toNumber().should.be.equal(middleId);
        insertedObject[2].should.be.equal(insertedData);

        const middleObject = (await linkedList.get(middleId));
        middleObject[0].toNumber().should.be.equal(middleId);
        middleObject[1].toNumber().should.be.equal(tailId);
        middleObject[2].should.be.equal(middleData);

        const tailObject = (await linkedList.get(tailId));
        tailObject[0].toNumber().should.be.equal(tailId);
        tailObject[1].toNumber().should.be.equal(0);
        tailObject[2].should.be.equal(tailData);
    });
});

/* contract('LinkedList - gas tests', (accounts) => {
    let linkedList: TestLinkedListInstance;
    const dummyData = '0x0000000000000000000000000000000000000001';

    beforeEach(async () => {
        linkedList = await TestLinkedList.new();
        for (let i = 0; i < 100; i++) {
            await linkedList.addHead(dummyData);
        }
    });

    it('Find Tail as a transaction.', async () => {
        await linkedList.findTailIdWithGas();
    });

    it('Add Head.', async () => {
        await linkedList.addHead(dummyData);
    });

    it('Add Tail.', async () => {
        await linkedList.addTail(dummyData);
    });

    it('Insert After.', async () => {
        const tailId = await linkedList.findTailId();
        await linkedList.insertAfter(tailId, dummyData);
    });

    it('Insert Before.', async () => {
        const tailId = await linkedList.findTailId();
        await linkedList.insertBefore(tailId, dummyData);
    });

    it('Remove.', async () => {
        const tailId = await linkedList.findTailId();
        await linkedList.remove(tailId);
    });
}); */
