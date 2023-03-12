
export class Logger {
    private verbose = false;
    protected info(msg: string) {
        if (this.verbose) {
            console.info(msg);
        }
    }
}