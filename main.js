import * as ShaderCode from './shader_code.js';
import { ShaderProgram } from './shader.js';
import { Scene } from './scene.js';
import { SCENE_VERT_CODE, SCENE_FRAG_CODE } from './scene-shader-code.js';
import { VERT_CODE, FRAG_CODE } from './skybox-shader-code.js';
import { SQUARE_VERT_CODE, SQUARE_FRAG_CODE } from './square-shader-code.js';

import * as glMatrix from './gl-matrix/common.js';

let gl = null;           // The WebGL context object
let canvas = null;       // The canvas element
let flatShader = null;   // The shader program for the grid
//let wireShader = null;   // The shader program for the
let scene = null;        // The scene

let skyShader = null;    // The shader program for the skybox
let sceneShader = null; 
let squareShader = null; // The shader program for the square

window.addEventListener("load", main);

function main() {
    glMatrix.setMatrixArrayType(Array);

    // Initialize the WebGL context
    canvas = document.getElementById('draw-canvas');
    gl = canvas.getContext("webgl2");

    // Setup WebGL
    gl.clearColor(0.5, 0.5, 0.5, 1.0);
    gl.enable(gl.DEPTH_TEST);

    // Compile/link shader programs
    flatShader = ShaderProgram.compile(gl, ShaderCode.FLAT_VERT, ShaderCode.FLAT_FRAG);

    // Compile/link the skybox shader program
    // Applies the skybox texture onto whatever object uses that shader
    // Only has the skybox picture 
    skyShader = ShaderProgram.compile(gl, VERT_CODE, FRAG_CODE);

    // Compile/link the scene shader program 
    // Has a point light and will have shadows 
    // Choose whatever color we want for the object still 
    sceneShader = ShaderProgram.compile(gl, SCENE_VERT_CODE, SCENE_FRAG_CODE);

    // Compile/Link the Square Shader Program
    squareShader = ShaderProgram.compile(gl, SQUARE_VERT_CODE, SQUARE_FRAG_CODE);
    
    window.addEventListener('resize', resize);
    scene = new Scene(gl, canvas);
    
    resize();
    startAnimation();
}

/**
 * Called when the window is resized.
 */
function resize() {
    const el = document.getElementById('draw-container');
    const w = el.clientWidth, h = el.clientHeight;
    canvas.width = w;
    canvas.height = h;
    scene.resize(gl, w, h);
}

/**
 * This starts our animation "loop".  It might look a bit like a recursive
 * loop, but that's not quite what's happening.  It uses the function:
 * window.requestAnimationFrame to schedule a call to the frameFunction.
 * The frameFunction draws the scene by calling draw, and then requests 
 * another call to frameFunction.  This function should only be called once
 * to start the animation.
 */
function startAnimation( ) {
    const frameFunction = (time) => {
        draw(time);
        window.requestAnimationFrame(frameFunction);
    };
    window.requestAnimationFrame(frameFunction);
}

/**
 * Draws the scene.  This function should not be called directly.
 * @param {Number} t animation time in milliseconds
 */
function draw(t) {
    // Clear
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Draw the scene
    scene.render(t, gl, flatShader, skyShader, sceneShader, squareShader);
}
