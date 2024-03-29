import * as THREE from "three";
import { Matrix4, Vector2, Vector3, Vector4 } from "three";
import { FRAG_CODE_TEMPLATE, VERT_CODE_TEMPLATE } from "../../content/shaders/userShaderTemplates";
import { detectMapDifference } from "../../hooks/useReactiveMap";
import { LayerProgram, Obj, Size, ViewportPanelState } from "../../types";
import { CodeTemplate } from "../codeStrings";
import { degToRad } from "../math";
import { getViewportRotation } from "./cameraMath";
import { createCoordinateGrid } from "./coordinateGrid";

interface UserProgramWrapper {
    id: string;
    ref: LayerProgram;
    status: 'compiling' | 'ready' | 'destroyed';
    mesh: THREE.Mesh;
}

export default class ViewportScene {

    private renderer: THREE.WebGLRenderer;
    private scene: THREE.Scene;
    private camera: THREE.PerspectiveCamera;

    private fullScreenQuad: THREE.PlaneGeometry;
    private userPrograms: Obj<UserProgramWrapper> = {};

    private isRendering = false;

    private globalUniforms = {
        cameraWorld: { value: new Matrix4().identity() },
        marchParameters: { value: new Vector3(1e2, 1e2, 1e-2) },
        ambientColor: { value: new Vector3(0.03, 0.03, 0.07) },
        sunColor: { value: new Vector3(1, 0.9, 0.7) },
        sunGeometry: { value: new Vector4(0.312347, 0.15617376, 0.93704257, degToRad(3)) },
        varTexture: { value: null as (null | THREE.Texture) },
        cameraNear: { value: 0.1 },
        cameraFar: { value: 100 },
        cameraDirection: { value: new Vector3() },
        cameraDistance: { value: 1 },
        invScreenSize: { value: new Vector2() },
    };

    constructor(
        canvas: HTMLCanvasElement,
    ) {
        this.renderer = new THREE.WebGLRenderer({ canvas });

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera();

        this.fullScreenQuad = new THREE.PlaneGeometry(2, 2);

        this.scene.add(
            createCoordinateGrid(this.fullScreenQuad, this.globalUniforms)
        );
    }

    public setSize({ w, h }: Size) {
        const cw = Math.ceil(w);
        const ch = Math.ceil(h);
        this.renderer.setSize(cw, ch);
        this.globalUniforms.invScreenSize.value.set(1. / cw, 1. / ch);
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

    public updateViewportUniforms(panelState: ViewportPanelState) {
        // model
        const targetDistance = panelState.viewportCamera.distance;
        const cameraNear = 0.01 * targetDistance;
        const cameraFar = 100 * targetDistance;
        const size = this.renderer.getSize(new Vector2());
        this.camera.near = cameraNear;
        this.camera.far = cameraFar;
        this.globalUniforms.cameraNear.value = cameraNear;
        this.globalUniforms.cameraFar.value = cameraFar;
        this.camera.aspect = size.x / size.y;
        this.camera.fov = panelState.viewportCamera.fov;
        this.camera.updateProjectionMatrix();
        // rotation
        const rotationQuat = getViewportRotation(panelState.viewportCamera);
        this.camera.setRotationFromQuaternion(rotationQuat);
        // pos
        const cameraDir = this.camera.getWorldDirection(new Vector3());
        const targetVector = new Vector3().fromArray(panelState.viewportCamera.target);
        this.camera.position
            .copy(cameraDir)
            .multiplyScalar(-panelState.viewportCamera.distance)
            .add(targetVector);
        this.camera.updateMatrixWorld();

        this.globalUniforms.cameraDirection.value
            .copy(cameraDir);
        this.globalUniforms.cameraWorld.value
            .copy(this.camera.matrixWorld);
        this.globalUniforms.cameraDistance.value = panelState.viewportCamera.distance;

        const maxMarchDist = 1e1 * targetDistance;
        const maxMarchIter = panelState.maxIterations;
        const marchEpsilon = 1e-5 * targetDistance;
        this.globalUniforms.marchParameters.value.set(maxMarchDist, maxMarchIter, marchEpsilon);
    }

    private generateShaders(layerProgram: LayerProgram) {
        const fragCodeTemplate = new CodeTemplate(FRAG_CODE_TEMPLATE);
        fragCodeTemplate.replace('%MAIN_PROGRAM%', layerProgram.programCode);
        fragCodeTemplate.replace('%ROOT_FUNCTION_NAME%', layerProgram.entryFunctionName);

        const fragCode = fragCodeTemplate.getFinishedCode(/%.*%/);
        // console.log(logCodeWithLines(fragCode));

        return {
            vertCode: VERT_CODE_TEMPLATE,
            fragCode,
        };
    }

    private createUserProgramMesh(layerProgram: LayerProgram) {
        const shaders = this.generateShaders(layerProgram);
        const material = new THREE.ShaderMaterial({
            uniforms: this.globalUniforms,
            vertexShader: shaders.vertCode,
            fragmentShader: shaders.fragCode,
            glslVersion: THREE.GLSL3,
            transparent: true,
        });
        const mesh = new THREE.Mesh(this.fullScreenQuad, material);
        mesh.name = `LayerMesh:${layerProgram.id}`;
        mesh.frustumCulled = false;
        mesh.renderOrder = -1;

        const wrapper: UserProgramWrapper = {
            id: layerProgram.id,
            ref: layerProgram,
            status: 'compiling',
            mesh,
        }

        // @ts-ignore
        this.renderer.compileAsync(mesh, this.scene).then(() => {
            if (wrapper.status === 'compiling') {
                this.scene.add(mesh);
                this.requestRender();
                wrapper.status = 'ready';
                // console.log(`${layerProgram.id} ready`);
            } else {
                mesh.material.dispose();
                // console.log(`${layerProgram.id} disposed directly`);
            }
        });

        return wrapper;
    }

    public syncUserPrograms(layerPrograms: Obj<LayerProgram>) {
        const difference = detectMapDifference<LayerProgram, UserProgramWrapper>({
            reference: layerPrograms,
            lastImage: this.userPrograms,
            hasChanged: (layerProg, meshWrapper) => layerProg !== meshWrapper.ref,
            map: layerProgram => this.createUserProgramMesh(layerProgram),
        });

        // call destroy
        const toBeDeleted = [...difference.removeItems, ...difference.setItems]
            .map(prog => prog.id);
        for (const id of toBeDeleted) {
            const userMesh = this.userPrograms[id];
            if (userMesh != null) {
                if (userMesh.status === 'ready') {
                    this.scene.remove(userMesh.mesh);
                    const material = userMesh.mesh.material as THREE.ShaderMaterial;
                    material.dispose();
                    // console.log(`${userMesh.id} disposed after user`);
                }
                userMesh.status = 'destroyed'; // in case not compiled
            }
        }
        for (const removeProgram of difference.removeItems) {
            delete this.userPrograms[removeProgram.id];
        }

        for (const setProgram of difference.setItems) {
            this.userPrograms[setProgram.id] = setProgram;
        }
    }
}