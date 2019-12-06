declare module 'ganache-time-traveler' {
    export const advanceTime: any;
    export const advanceBlock: any;
    export const advanceBlockAndSetTime: any;
    export const advanceTimeAndBlock: any;
    export const takeSnapshot: any;
    export const revertToSnapshot: any;
}