import { should } from 'chai';
import { LinkedListOOPInstance } from '../../../types/truffle-contracts';
import { LinkedListElementInstance } from '../../../types/truffle-contracts';
import { TestLinkedListOOPInstance } from '../../../types/truffle-contracts';

const LinkedListOOP = artifacts.require(
    './drafts/lists/LinkedListOOP.sol',
)  as Truffle.Contract<LinkedListOOPInstance>;
const LinkedListElement = artifacts.require(
    './drafts/lists/LinkedListElement.sol',
)  as Truffle.Contract<LinkedListElementInstance>;
const TestLinkedListOOP = artifacts.require(
    './drafts/lists/TestLinkedListOOP.sol',
)  as Truffle.Contract<TestLinkedListOOPInstance>;
should();


const emptyData = '0x0000000000000000000000000000000000000000';
const headData = '0x0000000000000000000000000000000000000001';
const middleData = '0x0000000000000000000000000000000000000002';
const tailData = '0x0000000000000000000000000000000000000003';

/** @test {LinkedListOOP} contract */
contract('LinkedListOOP - functionality', (accounts) => {

    let linkedList: LinkedListOOPInstance;

    beforeEach(async () => {
        linkedList = await LinkedListOOP.new();
    });

    /**
     * @test {LinkedListOOP#addHead}
     */
    it('Add an element at the head.', async () => {
        await linkedList.addHead(headData);
        const headElementAddress = await linkedList.head();
        const headElementContract = await LinkedListElement.at(headElementAddress);
        headData.should.be.equal(await headElementContract.data());
    });

    /**
     * @test {LinkedListOOP#addHead}
     */
    it('adds two elements from the head.', async () => {
        await linkedList.addHead(tailData);
        const tailElementAddress = await linkedList.head();
        const tailElementContract = await LinkedListElement.at(tailElementAddress);

        await linkedList.addHead(headData);
        const headElementAddress = await linkedList.head();
        const headElementContract = await LinkedListElement.at(headElementAddress);

        headData.should.be.equal(await headElementContract.data());
        tailElementAddress.should.be.equal(await headElementContract.next());
        tailData.should.be.equal(await tailElementContract.data());
    });

    /**
     * @test {LinkedListOOP#insertAfter}
     */
    it('inserts an element between two others.', async () => {
        await linkedList.addHead(tailData);
        const tailElementAddress = await linkedList.head();
        const tailElementContract = await LinkedListElement.at(tailElementAddress);

        await linkedList.addHead(headData);
        const headElementAddress = await linkedList.head();
        const headElementContract = await LinkedListElement.at(headElementAddress);

        await linkedList.insertAfter(headElementAddress, middleData);
        const middleElementAddress = await headElementContract.next();
        const middleElementContract = await LinkedListElement.at(middleElementAddress);

        middleElementAddress.should.be.equal(await headElementContract.next());
        middleData.should.be.equal(await middleElementContract.data());
        tailElementAddress.should.be.equal(await middleElementContract.next());
    });

    /**
     * @test {LinkedListOOP#removeAfter}
     */
    it('removes an element between two others.', async () => {
        await linkedList.addHead(tailData);
        const tailElementAddress = await linkedList.head();
        const tailElementContract = await LinkedListElement.at(tailElementAddress);

        await linkedList.addHead(middleData);

        await linkedList.addHead(headData);
        const headElementAddress = await linkedList.head();
        const headElementContract = await LinkedListElement.at(headElementAddress);

        await linkedList.removeAfter(headElementAddress);

        tailElementAddress.should.be.equal(await headElementContract.next());
    });
});

/** @test {LinkedListOOP} contract */
/* contract('LinkedListOOP - gas', (accounts) => {

    let linkedList: TestLinkedListOOPInstance;
    let targetElementContract: LinkedListElementInstance;
    const targetData = '0x0000000000000000000000000000000000000010';
    const dummyData = '0x0000000000000000000000000000000000000001';

    beforeEach(async () => {
        linkedList = await TestLinkedListOOP.new();
        await linkedList.addHead(targetData);
        const targetElementAddress = await linkedList.head();
        targetElementContract = await LinkedListElement.at(targetElementAddress);
        for (let i = 0; i < 99; i++) {
            await linkedList.addHead(dummyData);
        }
    });

    it('Loop over 100 elements searching.', async () => {
        await linkedList.findFirstWithGas(targetData);
        targetData.should.be.equal(await targetElementContract.data());
    });
}); */
