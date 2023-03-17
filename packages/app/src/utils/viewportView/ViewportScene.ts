import * as THREE from "three";
import { Euler, Vector2, Vector3 } from "three";
import { FRAG_CODE_TEMPLATE, VERT_CODE_TEMPLATE } from "../../content/shaderTemplates";
import { detectMapDifference } from "../../hooks/useReactiveMap";
import { IDObj, LayerProgram, ObjMapUndef, Size, ViewportCamera } from "../../types";
import { CodeTemplate } from "../codeStrings";
import { getViewportRotation } from "./cameraMath";

function generateShaders(layerProgram: LayerProgram) {
    const fragCodeTemplate = new CodeTemplate(FRAG_CODE_TEMPLATE);
    const includedCodeTotal = layerProgram.includes
        .map(i => i.source)
        .join('\n');
    fragCodeTemplate.replace('%INCLUDES%', includedCodeTotal);
    fragCodeTemplate.replace('%MAIN_PROGRAM%', layerProgram.programCode);
    fragCodeTemplate.replace('%ROOT_FUNCTION_NAME%', layerProgram.rootFunction);

    const fragCode = fragCodeTemplate.getFinishedCode(/%.*%/);
    // console.log(logCodeWithLines(fragCode));

    return {
        vertCode: VERT_CODE_TEMPLATE,
        fragCode,
    };
}

interface UserProgramWrapper extends IDObj {
    hash: number;
    mesh: THREE.Mesh;
}

export default class ViewportScene {

    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;

    private fullScreenGeometry: THREE.BufferGeometry;
    private userPrograms: ObjMapUndef<UserProgramWrapper> = {};

    private isRendering = false;

    constructor(
        canvas: HTMLCanvasElement,
    ) {
        this.renderer = new THREE.WebGLRenderer({ canvas });
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera();
        this.fullScreenGeometry = new THREE.PlaneGeometry(1, 1);

        this.scene.add(
            new THREE.Mesh(
                new THREE.BoxGeometry(1, 1, 1),
                new THREE.MeshPhongMaterial({ color: 0xff0000 }),
            )
        )
        const light = new THREE.DirectionalLight();
        light.position.set(5, 10, 20);
        light.intensity = 2;
        this.scene.add(light);
    }

    public setSize({ w, h }: Size) {
        const cw = Math.ceil(w);
        const ch = Math.ceil(h);
        this.renderer.setSize(cw, ch);
    }

    public requestRender() {
        if (this.isRendering) return;
        this.isRendering = true;
        requestAnimationFrame(() => this.render());
    }
    private render() {
        this.isRendering = false;
        this.renderer.setClearColor(0xffffff);
        this.renderer.render(this.scene, this.camera);
    }

    public updateCamera(viewportCamera: ViewportCamera) {
        const targetDistance = viewportCamera.distance;
        const cameraNear = 0.01 * targetDistance;
        const cameraFar = 100 * targetDistance;
        const size = this.renderer.getSize(new Vector2());
        this.camera.near = cameraNear;
        this.camera.far = cameraFar;
        this.camera.aspect = size.x / size.y;
        this.camera.fov = viewportCamera.fov;
        this.camera.updateProjectionMatrix();

        const rotationQuat = getViewportRotation(viewportCamera);
        this.camera.setRotationFromQuaternion(rotationQuat);

        const cameraDir = this.camera.getWorldDirection(new Vector3());
        cameraDir.multiplyScalar(-viewportCamera.distance);
        const targetVector = new Vector3().fromArray(viewportCamera.target);
        this.camera.position.copy(cameraDir).add(targetVector);
    }

    private createUserProgramMesh(layerProgram: LayerProgram) {
        const shaders = generateShaders(layerProgram);
        const material = new THREE.ShaderMaterial({
            uniforms: {},
            vertexShader: shaders.vertCode,
            fragmentShader: shaders.fragCode,
        });
        const mesh = new THREE.Mesh(this.fullScreenGeometry, material);
        mesh.name = `LayerMesh:${layerProgram.id}`;

        const wrapper: UserProgramWrapper = {
            id: layerProgram.id,
            hash: layerProgram.hash,
            mesh,
        }
        return wrapper;
    }

    private createOrDestroyPrograms(layerPrograms: ObjMapUndef<LayerProgram>) {
        const difference = detectMapDifference<LayerProgram, UserProgramWrapper>({
            reference: layerPrograms,
            lastImage: this.userPrograms,
            hasChanged: (layerProg, meshWrapper) => layerProg.hash !== meshWrapper.hash,
            map: layerProgram => this.createUserProgramMesh(layerProgram),
        });

        // call destroy
        const toBeDeleted = [...difference.removeItems, ...difference.setItems]
            .map(prog => prog.id);
        for (const id of toBeDeleted) {
            const userMesh = this.userPrograms[id];
            if (userMesh != null) {
                this.scene.remove(userMesh.mesh);
                const material = userMesh.mesh.material as THREE.ShaderMaterial;
                material.dispose();
            }
        }
        for (const removeProgram of difference.removeItems) {
            delete this.userPrograms[removeProgram.id];
        }
        for (const setProgram of difference.setItems) {
            this.userPrograms[setProgram.id] = setProgram;
            this.scene.add(setProgram.mesh);
        }
    }

    private setVarTextureRow(rowIndex: number, row: number[]) {
        throw new Error(`Not implemented`);
        // if (row.length != LOOKUP_TEXTURE_WIDTH) {
        //     throw new Error(`Length wrong`);
        // }
        // const gl = this.gl;
        // const typedArr = new Float32Array(row);
        // this.varLookupTexture.bind(gl);
        // gl.texSubImage2D(
        //     gl.TEXTURE_2D,
        //     0, // level
        //     0, // x off
        //     rowIndex, // y off
        //     LOOKUP_TEXTURE_WIDTH, // width
        //     1, // height
        //     gl.RED,
        //     gl.FLOAT,
        //     typedArr,
        // );
    }

    public syncUserPrograms(layerPrograms: ObjMapUndef<LayerProgram>) {
        return;
        this.createOrDestroyPrograms(layerPrograms);

        // // textureVarRows
        // for (const layer of Object.values(layerPrograms) as LayerProgram[]) {
        //     this.setVarTextureRow(
        //         layer.textureVarRowIndex,
        //         layer.textureVarRow,
        //     );
        // }
    }
}