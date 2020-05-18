import * as ShaderCode from './shader_code.js';
import { ShaderProgram } from './shader.js';
import { Scene } from './scene.js';
import { SCENE_VERT_CODE, SCENE_FRAG_CODE } from './scene-shader-code.js';
import { VERT_CODE, FRAG_CODE } from './skybox-shader-code.js';
import { SQUARE_VERT_CODE, SQUARE_FRAG_CODE } from './square-shader-code.js';
import { MERCURY_VERT_CODE, MERCURY_FRAG_CODE } from './mercury-shader-code.js';
import { VENUS_VERT_CODE, VENUS_FRAG_CODE } from './venus-shader-code.js';
import { EARTH_VERT_CODE, EARTH_FRAG_CODE } from './earth-shader-code.js';
import { MARS_VERT_CODE, MARS_FRAG_CODE } from './mars-shader-code.js';
import { JUPITER_VERT_CODE, JUPITER_FRAG_CODE } from './jupiter-shader-code.js';
import { SATURN_VERT_CODE, SATURN_FRAG_CODE } from './saturn-shader-code.js';
import { URANUS_VERT_CODE, URANUS_FRAG_CODE } from './uranus-shader-code.js';
import { NEPTUNE_VERT_CODE, NEPTUNE_FRAG_CODE } from './neptune-shader-code.js';


import * as glMatrix from './gl-matrix/common.js';

let gl = null;           // The WebGL context object
let canvas = null;       // The canvas element
let flatShader = null;   // The shader program for the grid
let scene = null;        // The scene

let skyShader = null;    // The shader program for the skybox
let sceneShader = null; 
let squareShader = null; // The shader program for the square
let mercuryShader = null; // The shader program for Mercury
let venusShader = null; // The shader program for Venus
let earthShader = null; // The shader program for Earth
let marsShader = null; // The shader program for Mars
let jupiterShader = null; // The shader program for Jupiter
let saturnShader = null; // The shader program for Saturn
let uranusShader = null; // The shader program for Uranus
let neptuneShader = null; // The shader program for Neptune

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

    // Compile/Link the Mercury Shader Program
    mercuryShader = ShaderProgram.compile(gl, MERCURY_VERT_CODE, MERCURY_FRAG_CODE);

    // Compile/Link the Venus Shader Program
    venusShader = ShaderProgram.compile(gl, VENUS_VERT_CODE, VENUS_FRAG_CODE);

    // Compile/Link the Earth Shader Program
    earthShader = ShaderProgram.compile(gl, EARTH_VERT_CODE, EARTH_FRAG_CODE);

    // Compile/Link the Mars Shader Program
    marsShader = ShaderProgram.compile(gl, MARS_VERT_CODE, MARS_FRAG_CODE);

    // Compile/Link the Jupiter Shader Program
    jupiterShader = ShaderProgram.compile(gl, JUPITER_VERT_CODE, JUPITER_FRAG_CODE);

    // Compile/Link the Saturn Shader Program
    saturnShader = ShaderProgram.compile(gl, SATURN_VERT_CODE, SATURN_FRAG_CODE);

    // Compile/Link the Uranus Shader Program
    uranusShader = ShaderProgram.compile(gl, URANUS_VERT_CODE, URANUS_FRAG_CODE);

    // Compile/Link the Neptune Shader Program
    neptuneShader = ShaderProgram.compile(gl, NEPTUNE_VERT_CODE, NEPTUNE_FRAG_CODE);
    
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
    scene.render(t, gl, flatShader, skyShader, sceneShader, squareShader, mercuryShader, venusShader, earthShader, marsShader, jupiterShader, saturnShader, uranusShader, neptuneShader);
}