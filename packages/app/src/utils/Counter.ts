

export class Counter
{
    private current = 0;

    constructor(
        private max: number
    ) {}

    nextInts(count: number)
    {
        if (this.current + count < this.max)
        {
            const temp = this.current;
            this.current += count;
            return temp;
        }
        else
        {
            throw new Error(`Counter exceeded max value`);
        }
    }
}