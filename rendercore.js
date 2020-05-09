import * as mat4 from './gl-matrix/mat4.js';
import * as vec3 from './gl-matrix/vec3.js';
import * as glMatrix from './gl-matrix/common.js';

import {ShaderProgram} from './shader.js';
import {loadObjMesh} from './objloader.js';
import {GLMesh} from './glmesh.js';
import {PerspectiveCamera} from './perspective-camera.js';
import {OrbitControls} from './orbit-controls.js';

/**
 * Manages core rendering functions common to all exercises.
 */
export class RenderCore {

    /**
     * Constructs a RenderCore with the given shader.
     * 
     * @param {String} vertCode vertex shader code 
     * @param {String} fragCode fragment shader code
     */
    constructor(vertCode, fragCode) {
        this.world = {
            shader: null,
            mesh: null,
            camLightPos: [0,1,50],     // Camera attached light position (camera coords.)
            camLightColor: [1, 1, 1],   // Color of camera attached light
            worldLightPos: [-50, 0, 0],    // World space light position (world coords.)
            worldLightColor: [0,0,0],      // Color of world space light
        };
        this.vertCode = vertCode;
        this.fragCode = fragCode;

        this.modelMatrix = mat4.create();
        this.canvas = document.getElementById('draw-canvas');
        this.gl = this.canvas.getContext("webgl2");
        if(this.gl === null ) {
            alert("Unable to initialize a WebGL2 context.");
            return;
        }
        this.projectionMatrix = mat4.create();
        this.viewMatrix = mat4.create();

        window.addEventListener('resize', (e) => this.resize() );
        this.canvas.addEventListener('repaint', (e) => this.repaint() );

        this.camera = new PerspectiveCamera(1.0);
        this.camera.orient([0,2.25,5.5], [0,0,0], [0,1,0]);
        this.orbitControl = new OrbitControls(this.camera, this.canvas);
        this.initGL();
    }

    /**
     * Loads a mesh 
     * @param {String} meshUrl path to OBJ file 
     * @returns {Promise<GLMesh>} promise that resolves to a GLMesh  
     */
    loadMesh(meshUrl) {
        return fetch(meshUrl).then( (resp) => {
            return resp.text();
        })
        .then( (text) => {
            const mesh = loadObjMesh(text);
            mesh.center();
            this.world.mesh = new GLMesh(this.gl, mesh);
            return this.world.mesh;
        });
    }

    /**
     * Initialization: compile shaders, initialize uniform variables, etc.
     */
    initGL() {
        const gl = this.gl;

        // Set the background color
        gl.clearColor(0.5, 0.5, 0.5, 1.0);
        
        gl.enable(gl.DEPTH_TEST);

        this.world.shader = ShaderProgram.compile(gl, this.vertCode, this.fragCode);
        this.world.shader.use(gl);

        const shader = this.world.shader;
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        gl.uniform3fv(shader.uniform('lightColors[0]'), this.world.camLightColor);
        let loc = gl.getUniformLocation(shader.programId, 'lightColors[1]');
        gl.uniform3fv(loc, this.world.worldLightColor);
        gl.uniform3fv(shader.uniform('lightPositions[0]'), this.world.camLightPos); // Camera fixed
    }

    /**
     * Called when window is resized.
     */
    resize() {
        const el = document.getElementById('view-container');
        const w = el.clientWidth;
        const h = el.clientHeight;
        
        this.canvas.width = w;
        this.canvas.height = h;

        this.gl.viewport(0, 0, w, h);
        this.camera.setFrustum(glMatrix.toRadian(46.0), w / h, 0.7, 1000.0);

        this.repaint();
    }

    /**
     * Draw the scene.
     */
    render() {
        const gl = this.gl;
        const shader = this.world.shader;
        
        // Clear the color and depth buffers
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        shader.use(gl);
        this.camera.getViewMatrix(this.viewMatrix);
        this.camera.projectionMatrix(this.projectionMatrix);
        gl.uniformMatrix4fv(shader.uniform('uProjection'), false, this.projectionMatrix);
        gl.uniformMatrix4fv(shader.uniform('uView'), false, this.viewMatrix);

        const lightPos = vec3.transformMat4(vec3.create(), this.world.worldLightPos, this.viewMatrix);
        gl.uniform3fv(gl.getUniformLocation(shader.programId, 'lightPositions[1]'), lightPos);

        this.world.mesh.render(gl, shader);
    }

    /**
     * Redraw by requesting another animation frame.
     */
    repaint() {
        window.requestAnimationFrame( () => this.render() );
    }
}