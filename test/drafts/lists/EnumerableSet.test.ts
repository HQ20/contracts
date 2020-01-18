const { balance, BN, constants, ether, expectEvent, expectRevert, send } = require('@openzeppelin/test-helpers');

import { should } from 'chai';
import { EnumerableSetMockInstance } from '../../../types/truffle-contracts';

const EnumerableSet = artifacts
    .require('./drafts/lists/mocks/EnumerableSetMock.sol') as Truffle.Contract<EnumerableSetMockInstance>;
should();

const empty = '0x0000000000000000000000000000000000000000';
const head = '0x0000000000000000000000000000000000000001';
const middle = '0x0000000000000000000000000000000000000002';
const tail = '0x0000000000000000000000000000000000000003';

/** @test {EnumerableSet} contract */
contract('EnumerableSet', (accounts) => {

    let enumerableSet: EnumerableSetMockInstance;

    beforeEach(async () => {
        enumerableSet = await EnumerableSet.new();
    });

    /* it('set an address as Head.', async () => {
        const event = (
            await enumerableSet.testSetHead(head)
        ).logs[0];

        event.event.should.be.equal('NewHead');
        event.args.item.should.be.equal(head);
        (await enumerableSet.testHead()).should.be.equal(head);
    });

    it('set an address as Tail.', async () => {
        const event = (
            await enumerableSet.testSetTail(tail)
        ).logs[0];

        event.event.should.be.equal('NewTail');
        event.args.item.should.be.equal(tail);
        (await enumerableSet.testTail()).should.be.equal(tail);
    });

    it('appends an item.', async () => {
        await enumerableSet.testInsert(empty, head, empty);
        await enumerableSet.testInsert(head, tail, empty);

        (await enumerableSet.testContains(head)).should.be.true;
        (await enumerableSet.testContains(tail)).should.be.true;
        (await enumerableSet.testPrev(head)).should.be.equal(empty);
        (await enumerableSet.testNext(head)).should.be.equal(tail);
        (await enumerableSet.testPrev(tail)).should.be.equal(head);
        (await enumerableSet.testNext(tail)).should.be.equal(empty);
        (await enumerableSet.testHead()).should.be.equal(head);
        (await enumerableSet.testTail()).should.be.equal(tail);
    });

    it('prepends an item.', async () => {
        await enumerableSet.testInsert(empty, tail, empty);
        await enumerableSet.testInsert(empty, head, tail);

        (await enumerableSet.testContains(head)).should.be.true;
        (await enumerableSet.testContains(tail)).should.be.true;
        (await enumerableSet.testPrev(head)).should.be.equal(empty);
        (await enumerableSet.testNext(head)).should.be.equal(tail);
        (await enumerableSet.testPrev(tail)).should.be.equal(head);
        (await enumerableSet.testNext(tail)).should.be.equal(empty);
        (await enumerableSet.testHead()).should.be.equal(head);
        (await enumerableSet.testTail()).should.be.equal(tail);
    }); */

    it('can\'t append the empty address.', async () => {
        await expectRevert(
            enumerableSet.testAppend(empty),
            'EnumerableSet: Cannot insert the empty address',
        );
    });

    it('appends the first item.', async () => {
        await enumerableSet.testAppend(head);

        (await enumerableSet.testContains(head)).should.be.true;
        (await enumerableSet.testNext(head)).should.be.equal(empty);
        (await enumerableSet.testPrev(head)).should.be.equal(empty);
        (await enumerableSet.testHead()).should.be.equal(head);
        (await enumerableSet.testTail()).should.be.equal(head);
    });

    it('can\'t append an existing item.', async () => {
        await enumerableSet.testAppend(head);
        await expectRevert(
            enumerableSet.testAppend(head),
            'EnumerableSet: Cannot insert an existing item',
        );
    });

    it('append and prepend.', async () => {
        await enumerableSet.testAppend(middle);
        await enumerableSet.testPrepend(head);
        await enumerableSet.testAppend(tail);

        (await enumerableSet.testContains(head)).should.be.true;
        (await enumerableSet.testContains(middle)).should.be.true;
        (await enumerableSet.testContains(tail)).should.be.true;
        (await enumerableSet.testPrev(head)).should.be.equal(empty);
        (await enumerableSet.testNext(head)).should.be.equal(middle);
        (await enumerableSet.testPrev(middle)).should.be.equal(head);
        (await enumerableSet.testNext(middle)).should.be.equal(tail);
        (await enumerableSet.testPrev(tail)).should.be.equal(middle);
        (await enumerableSet.testNext(tail)).should.be.equal(empty);
        (await enumerableSet.testHead()).should.be.equal(head);
        (await enumerableSet.testTail()).should.be.equal(tail);
    });

    it('contains can return false.', async () => {
        await enumerableSet.testAppend(head);
        (await enumerableSet.testContains(tail)).should.be.false;
    });

    it('can\'t remove the empty address.', async () => {
        await expectRevert(
            enumerableSet.testRemove(empty),
            'EnumerableSet: Cannot remove the empty address',
        );
    });

    it('can\'t remove a non existing item.', async () => {
        await expectRevert(
            enumerableSet.testRemove(head),
            'EnumerableSet: Cannot remove a non existing item',
        );
    });

    it('removes the only item.', async () => {
        await enumerableSet.testAppend(head);
        await enumerableSet.testRemove(head);

        (await enumerableSet.testContains(head)).should.be.false;
        (await enumerableSet.testNext(head)).should.be.equal(empty);
        (await enumerableSet.testPrev(head)).should.be.equal(empty);
        (await enumerableSet.testHead()).should.be.equal(empty);
        (await enumerableSet.testTail()).should.be.equal(empty);
    });

    it('removes the tail.', async () => {
        await enumerableSet.testAppend(head);
        await enumerableSet.testAppend(tail);
        await enumerableSet.testRemove(tail);

        (await enumerableSet.testContains(head)).should.be.true;
        (await enumerableSet.testContains(tail)).should.be.false;
        (await enumerableSet.testNext(head)).should.be.equal(empty);
        (await enumerableSet.testPrev(head)).should.be.equal(empty);
        (await enumerableSet.testHead()).should.be.equal(head);
        (await enumerableSet.testTail()).should.be.equal(head);
    });

    it('removes the head.', async () => {
        await enumerableSet.testAppend(head);
        await enumerableSet.testAppend(tail);
        await enumerableSet.testRemove(head);

        (await enumerableSet.testContains(head)).should.be.false;
        (await enumerableSet.testContains(tail)).should.be.true;
        (await enumerableSet.testNext(tail)).should.be.equal(empty);
        (await enumerableSet.testPrev(tail)).should.be.equal(empty);
        (await enumerableSet.testHead()).should.be.equal(tail);
        (await enumerableSet.testTail()).should.be.equal(tail);
    });

    it('removes the middle.', async () => {
        await enumerableSet.testAppend(head);
        await enumerableSet.testAppend(middle);
        await enumerableSet.testAppend(tail);
        await enumerableSet.testRemove(middle);

        (await enumerableSet.testContains(head)).should.be.true;
        (await enumerableSet.testContains(middle)).should.be.false;
        (await enumerableSet.testContains(tail)).should.be.true;
        (await enumerableSet.testPrev(head)).should.be.equal(empty);
        (await enumerableSet.testNext(head)).should.be.equal(tail);
        (await enumerableSet.testPrev(tail)).should.be.equal(head);
        (await enumerableSet.testNext(tail)).should.be.equal(empty);
        (await enumerableSet.testHead()).should.be.equal(head);
        (await enumerableSet.testTail()).should.be.equal(tail);
    });

    it('length.', async () => {
        (await enumerableSet.testLength()).toNumber().should.be.equal(0);
        await enumerableSet.testAppend(head);
        (await enumerableSet.testLength()).toNumber().should.be.equal(1);
        await enumerableSet.testAppend(tail);
        (await enumerableSet.testLength()).toNumber().should.be.equal(2);
        await enumerableSet.testRemove(head);
        (await enumerableSet.testLength()).toNumber().should.be.equal(1);
        await enumerableSet.testRemove(tail);
        (await enumerableSet.testLength()).toNumber().should.be.equal(0);
    });

    it('Retrieve an empty array', async () => {
        (await enumerableSet.testEnumerate()).length.should.equal(0);
    });

    it('Retrieve an array of values', async () => {
        await enumerableSet.testAppend(head);
        await enumerableSet.testAppend(middle);
        await enumerableSet.testAppend(tail);
        const result = (await enumerableSet.testEnumerate());
        result.length.should.equal(3);
        result[0].should.equal(head);
        result[1].should.equal(middle);
        result[2].should.equal(tail);
    });
});
