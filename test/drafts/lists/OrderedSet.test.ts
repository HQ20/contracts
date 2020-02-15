// tslint:disable-next-line:no-var-requires
const { expectRevert } = require('@openzeppelin/test-helpers');

import { should } from 'chai';
import { OrderedSetMockInstance } from '../../../types/truffle-contracts';

const OrderedSet = artifacts
    .require('./drafts/lists/mocks/OrderedSetMock.sol') as Truffle.Contract<OrderedSetMockInstance>;
should();

const empty = '0x0000000000000000000000000000000000000000';
const head = '0x0000000000000000000000000000000000000001';
const middle = '0x0000000000000000000000000000000000000002';
const tail = '0x0000000000000000000000000000000000000003';

/** @test {OrderedSet} contract */
contract('OrderedSet', (accounts) => {

    let orderedSet: OrderedSetMockInstance;

    beforeEach(async () => {
        orderedSet = await OrderedSet.new();
    });

    /* it('set an address as Head.', async () => {
        const event = (
            await orderedSet.testSetHead(head)
        ).logs[0];

        event.event.should.be.equal('NewHead');
        event.args.item.should.be.equal(head);
        (await orderedSet.testHead()).should.be.equal(head);
    });

    it('set an address as Tail.', async () => {
        const event = (
            await orderedSet.testSetTail(tail)
        ).logs[0];

        event.event.should.be.equal('NewTail');
        event.args.item.should.be.equal(tail);
        (await orderedSet.testTail()).should.be.equal(tail);
    });

    it('appends an item.', async () => {
        await orderedSet.testInsert(empty, head, empty);
        await orderedSet.testInsert(head, tail, empty);

        (await orderedSet.testContains(head)).should.be.true;
        (await orderedSet.testContains(tail)).should.be.true;
        (await orderedSet.testPrev(head)).should.be.equal(empty);
        (await orderedSet.testNext(head)).should.be.equal(tail);
        (await orderedSet.testPrev(tail)).should.be.equal(head);
        (await orderedSet.testNext(tail)).should.be.equal(empty);
        (await orderedSet.testHead()).should.be.equal(head);
        (await orderedSet.testTail()).should.be.equal(tail);
    });

    it('prepends an item.', async () => {
        await orderedSet.testInsert(empty, tail, empty);
        await orderedSet.testInsert(empty, head, tail);

        (await orderedSet.testContains(head)).should.be.true;
        (await orderedSet.testContains(tail)).should.be.true;
        (await orderedSet.testPrev(head)).should.be.equal(empty);
        (await orderedSet.testNext(head)).should.be.equal(tail);
        (await orderedSet.testPrev(tail)).should.be.equal(head);
        (await orderedSet.testNext(tail)).should.be.equal(empty);
        (await orderedSet.testHead()).should.be.equal(head);
        (await orderedSet.testTail()).should.be.equal(tail);
    }); */

    it('can\'t append the empty address.', async () => {
        await expectRevert(
            orderedSet.testAppend(empty),
            'OrderedSet: Cannot insert the empty address',
        );
    });

    it('appends the first item.', async () => {
        await orderedSet.testAppend(head);

        (await orderedSet.testContains(head)).should.be.true;
        (await orderedSet.testNext(head)).should.be.equal(empty);
        (await orderedSet.testPrev(head)).should.be.equal(empty);
        (await orderedSet.testHead()).should.be.equal(head);
        (await orderedSet.testTail()).should.be.equal(head);
    });

    it('can\'t append an existing item.', async () => {
        await orderedSet.testAppend(head);
        await expectRevert(
            orderedSet.testAppend(head),
            'OrderedSet: Cannot insert an existing item',
        );
    });

    it('append and prepend.', async () => {
        await orderedSet.testAppend(middle);
        await orderedSet.testPrepend(head);
        await orderedSet.testAppend(tail);

        (await orderedSet.testContains(head)).should.be.true;
        (await orderedSet.testContains(middle)).should.be.true;
        (await orderedSet.testContains(tail)).should.be.true;
        (await orderedSet.testPrev(head)).should.be.equal(empty);
        (await orderedSet.testNext(head)).should.be.equal(middle);
        (await orderedSet.testPrev(middle)).should.be.equal(head);
        (await orderedSet.testNext(middle)).should.be.equal(tail);
        (await orderedSet.testPrev(tail)).should.be.equal(middle);
        (await orderedSet.testNext(tail)).should.be.equal(empty);
        (await orderedSet.testHead()).should.be.equal(head);
        (await orderedSet.testTail()).should.be.equal(tail);
    });

    it('contains can return false.', async () => {
        await orderedSet.testAppend(head);
        (await orderedSet.testContains(tail)).should.be.false;
    });

    it('can\'t remove the empty address.', async () => {
        await expectRevert(
            orderedSet.testRemove(empty),
            'OrderedSet: Cannot remove the empty address',
        );
    });

    it('can\'t remove a non existing item.', async () => {
        await expectRevert(
            orderedSet.testRemove(head),
            'OrderedSet: Cannot remove a non existing item',
        );
    });

    it('removes the only item.', async () => {
        await orderedSet.testAppend(head);
        await orderedSet.testRemove(head);

        (await orderedSet.testContains(head)).should.be.false;
        (await orderedSet.testNext(head)).should.be.equal(empty);
        (await orderedSet.testPrev(head)).should.be.equal(empty);
        (await orderedSet.testHead()).should.be.equal(empty);
        (await orderedSet.testTail()).should.be.equal(empty);
    });

    it('removes the tail.', async () => {
        await orderedSet.testAppend(head);
        await orderedSet.testAppend(tail);
        await orderedSet.testRemove(tail);

        (await orderedSet.testContains(head)).should.be.true;
        (await orderedSet.testContains(tail)).should.be.false;
        (await orderedSet.testNext(head)).should.be.equal(empty);
        (await orderedSet.testPrev(head)).should.be.equal(empty);
        (await orderedSet.testHead()).should.be.equal(head);
        (await orderedSet.testTail()).should.be.equal(head);
    });

    it('removes the head.', async () => {
        await orderedSet.testAppend(head);
        await orderedSet.testAppend(tail);
        await orderedSet.testRemove(head);

        (await orderedSet.testContains(head)).should.be.false;
        (await orderedSet.testContains(tail)).should.be.true;
        (await orderedSet.testNext(tail)).should.be.equal(empty);
        (await orderedSet.testPrev(tail)).should.be.equal(empty);
        (await orderedSet.testHead()).should.be.equal(tail);
        (await orderedSet.testTail()).should.be.equal(tail);
    });

    it('removes the middle.', async () => {
        await orderedSet.testAppend(head);
        await orderedSet.testAppend(middle);
        await orderedSet.testAppend(tail);
        await orderedSet.testRemove(middle);

        (await orderedSet.testContains(head)).should.be.true;
        (await orderedSet.testContains(middle)).should.be.false;
        (await orderedSet.testContains(tail)).should.be.true;
        (await orderedSet.testPrev(head)).should.be.equal(empty);
        (await orderedSet.testNext(head)).should.be.equal(tail);
        (await orderedSet.testPrev(tail)).should.be.equal(head);
        (await orderedSet.testNext(tail)).should.be.equal(empty);
        (await orderedSet.testHead()).should.be.equal(head);
        (await orderedSet.testTail()).should.be.equal(tail);
    });

    it('length.', async () => {
        (await orderedSet.testLength()).toNumber().should.be.equal(0);
        await orderedSet.testAppend(head);
        (await orderedSet.testLength()).toNumber().should.be.equal(1);
        await orderedSet.testAppend(tail);
        (await orderedSet.testLength()).toNumber().should.be.equal(2);
        await orderedSet.testRemove(head);
        (await orderedSet.testLength()).toNumber().should.be.equal(1);
        await orderedSet.testRemove(tail);
        (await orderedSet.testLength()).toNumber().should.be.equal(0);
    });

    it('Retrieve an empty array', async () => {
        (await orderedSet.testEnumerate()).length.should.equal(0);
    });

    it('Retrieve an array of values', async () => {
        await orderedSet.testAppend(head);
        await orderedSet.testAppend(middle);
        await orderedSet.testAppend(tail);
        const result = (await orderedSet.testEnumerate());
        result.length.should.equal(3);
        result[0].should.equal(head);
        result[1].should.equal(middle);
        result[2].should.equal(tail);
    });
});
