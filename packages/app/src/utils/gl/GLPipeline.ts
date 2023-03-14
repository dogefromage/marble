import GLProgram from "./GLProgram";

export abstract class GLPipeline {
    protected programs = new Map<string, GLProgram>();
    private isRendering = false;
    protected abstract renderWhenReady: boolean;
    private globalUniformData = new Map<string, number[]>();

    constructor(
        protected gl: WebGL2RenderingContext,
    ) {}

    protected addProgram(program: GLProgram) {
        this.programs.set(program.id, program);
        if (this.renderWhenReady) {
            program.onReady = () => this.requestRender();
        }
    }
    
    protected removeProgram(programId: string) {
        this.programs.delete(programId);
    }

    public requestRender() {
        if (this.isRendering) {
            return;
        }
        this.isRendering = true;
        requestAnimationFrame(() => this.render());
    }

    private render() {
        const { gl } = this;
        gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

        const ascendingPriority = 
            Array.from(this.programs.values())
            .sort((a, b) => a.renderIndex - b.renderIndex);
        for (const program of ascendingPriority) {
            if (program.state === 'ready') {
                program.load(this.globalUniformData);
                program.draw();
            }
        }
        this.isRendering = false;
    }

    public setGlobalUniformData(name: string, data: number[]) {
        this.globalUniformData.set(name, data);
    }
}
