import { GeometryS, GNodeT, ObjMap, ProgramInclude, SceneProgram } from "../../types";

export default class SceneCompiler 
{
    private templates: ObjMap<GNodeT> = {};
    private includes: ObjMap<ProgramInclude> = {};
    // private compiledProgram: SceneProgram | null = null;

    public setTemplates(templates: ObjMap<GNodeT>) {
        this.templates = templates;
    }

    public setIncludes(includes: ObjMap<ProgramInclude>) {
        this.includes = includes;
    }

    public compileGeometries(geometries: ObjMap<GeometryS>): SceneProgram {
        
    }

    // public getCompiledProgram() {
    //     return this.compiledProgram;
    // }
}