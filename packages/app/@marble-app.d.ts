
declare module '*.template.glsl' {
    import { SourceTemplate } from "@marble/vite-plugin-glsl-templates";
    const templates: SourceTemplate[];
    export default templates;
}