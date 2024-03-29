

export class Counter {

    private current = 0;
    
    constructor(
        private maxExcluded: number,
        private offset: number,
    ) { }

    increment() {
        return this.nextInts(1);
    }

    nextInts(count: number) {
        if (this.current + count < this.maxExcluded) {
            const temp = this.current;
            this.current += count;
            return temp + this.offset;
        }
        else {
            throw new Error(`Counter exceeded max value`);
        }
    }
}