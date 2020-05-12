import { Grid } from "./grid.js";
import { Camera } from "./camera.js"
import { Controls } from './controls.js';
import { RenderMeshBary } from "./rendermesh-bary.js";
import { makeCube } from './cube.js';
import { loadObjMesh } from './objloader.js';
import * as glMatrix from './gl-matrix/common.js';
import * as mat4 from "./gl-matrix/mat4.js";
import { buildCube } from './skybox.js';
import { loadSkybox } from './skybox.js';
import { loadSquare } from './square.js';
import { buildSquare } from './square.js'
import {GLMesh} from './glmesh.js';
import { transformMat4, floor } from './gl-matrix/vec3.js'

/**
 * Represents the entire scene.
 */
export class Scene 
{
    /**
     * Constructs a Scene object.
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {HTMLElement} canvas the canvas element 
     */
    constructor(gl, canvas) 
    {
        this.canvas = canvas;
        this.width = canvas.width;
        this.height = canvas.height;

        // Variables used to store the model, view and projection matrices.
        this.modelMatrix = mat4.create();
        this.viewMatrix = mat4.create();
        this.projMatrix = mat4.create();

        // Create the camera object and set to default position/orientation
        this.camera = new Camera();
        this.resetCamera();

        // The projection type 
        this.projType = "perspective";

        // The camera mode 
        this.mode = "mouse";

        // UI manager object
        this.controls = new Controls(this.canvas, this);
        
        // Create the meshes for the scene
        this.grid = new Grid(gl);   // The reference grid
        this.cube = new RenderMeshBary(gl, makeCube());

        //Load the skybox textures
        const dir = "textures/";
        loadSkybox(gl,dir).then((texture) => {this.text = texture});

        // Square Texture
        //const dir2 = "textures/smoke7.png";
        this.cloud_texture = null; 
        const dir2 = "textures/smoke7.png";
        loadSquare(gl, dir2).then((cloudTexture) => {this.cloud_texture = cloudTexture});

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); // Initialize Blend

        // Number of clouds to generate
        this.num = Math.random() * 10; 

       this.cloudArray = []; // Scaling
       this.cloudAngle = []; // Rotating
       this.cloudTranslation = []; // Translating

        // To get different size clouds 
        for (let i = 0; i < 100; i++)
        {
            let scaleNum = Math.random() * 2;
            this.cloudArray.push([scaleNum, scaleNum, 0]); 
        }
      //  console.log(this.cloudArray);
       
        // To rotate by different angles
        for (let i = 0; i < 100; i++)
        {  
            let angle = Math.PI / Math.random() * 2;
            while (angle == 0)
            {
                angle = Math.PI / Math.random() * 2;
            }
            this.cloudAngle.push(angle); 
        }
       // console.log(this.cloudAngle);

        // To translate the clouds
        for (let i = 0; i < 100; i++)
        {
            let translateNumX = Math.random() * 5;
            let translateNumY = Math.random() * 0.25;
            let translateNumZ = Math.random() * 1;
            this.cloudTranslation.push([translateNumX, translateNumY, translateNumZ]);
        }
       

        //////////////
        // PART ONE //
        //////////////

        // Load the cow from an OBJ file.  Caution: the fetch method is 
        // asynchronous, so the mesh will not be immediately available.  
        // Make sure to check for null before rendering.  Use this as an example
        // to load other OBJ files.

        // this.clouds = null;
        // fetch('data/clouds.obj')
        //     .then( (response) => {
        //         return response.text();
        //     })
        //     .then( (text) => {
        //         let objMesh = loadObjMesh(text);
        //         this.clouds = new RenderMeshBary(gl, objMesh);
        //     })

        // this.island = null;
        // fetch('data/Low+Poly+Island.obj')
        //     .then( (response) => {
        //         return response.text();
        //     })
        //     .then( (text) => {
        //         let objMesh = loadObjMesh(text);
        //         this.island = new RenderMeshBary(gl, objMesh);
        //     })


        ////////////////////
        // Create Cubemap //
        ////////////////////
        this.cubemap = new RenderMeshBary(gl, buildCube()); // Loading the skybox cube

        // Create the Squares
        this.squareArray = [];
        for (let i = 0; i < 100; i++)
        {
            this.square = new RenderMeshBary(gl, buildSquare());
            this.squareArray.push(this.square);
        }
  
        
    } 

    /**
     * A convenience method to set all three matrices in the shader program.
     * Don't call this if you only need to set one or two matrices, instead,
     * just set it "manually" by calling gl.uniformMatrix4fv.
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {ShaderProgram} shader the shader 
     */
    setMatrices(gl, shader) 
    {
        gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        gl.uniformMatrix4fv(shader.uniform('uView'), false, this.viewMatrix);
        gl.uniformMatrix4fv(shader.uniform('uProj'), false, this.projMatrix);
    }

    cloudScale()
    {  
        // To get different size clouds 
        let scaleNum = Math.random() * 2;
        this.cloudArray = [scaleNum, scaleNum, 0]; 
       // mat4.scale(this.modelMatrix, this.modelMatrix, this.cloudArray);
    }

    cloudRotate()
    {
        // To rotate by different angles
        let angle = Math.PI / Math.random() * 2;
        while (angle == 0)
        {
            angle = Math.PI / Math.random() * 2;
        }
        this.cloudAngle.push(angle); 
       // mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.cloudAngle);
    }

    cloudTranslate()
    { 
        // To translate the clouds
        let translateNumX = Math.random() * -1;
        let translateNumY = Math.random() * 0.25;
        let translateNumZ = Math.random() * 2;
        this.cloudTranslation = [translateNumX, translateNumY, translateNumZ];
       // mat4.translate(this.modelMatrix, this.modelMatrix, this.cloudTranslation);
    }

    drawSquare(gl, shader) 
    {
        if (this.cloud_texture !== null)
        {  
            gl.depthMask(false);
            gl.enable(gl.BLEND);

            // Bind the texture in texture channel 1
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.cloud_texture);
        
            // // Set the uniform to texture channel zero
            gl.uniform1i(shader.uniform('square_texture'), 1);
            mat4.identity(this.modelMatrix);

            // Generate clouds! 
            for (let i = 0; i < 100; i++)
            {
               // mat4.identity(this.modelMatrix);
                // this.cloudScale();
                // this.cloudRotate();
                // this.cloudTranslate();
               // mat4.identity(this.modelMatrix);
                mat4.scale(this.modelMatrix, this.modelMatrix, this.cloudArray[i]);
                mat4.rotateZ(this.modelMatrix, this.modelMatrix, this.cloudAngle[i]);
                //mat4.rotateZ(this.modelMatrix, this.modelMatrix, Math.PI / 0.5);
                mat4.translate(this.modelMatrix, this.modelMatrix, this.cloudTranslation[i]);

                gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
                
                // Draw the Square
                this.squareArray[i].render(gl, shader);
    
                // Reset the model matrix to the identity
                mat4.identity(this.modelMatrix);

                // // New Scale 
                // let scaleNum = Math.random() * 2;
                // this.cloudArray = [scaleNum, scaleNum, 0]; 

                // // To rotate by different angles
                // let angle = Math.PI / Math.random() * 2;
                // while (angle == 0)
                // {
                //     angle = Math.PI / Math.random() * 2;
                // }
                // this.cloudAngle = angle; 

                // // To translate the clouds
                // let translateNumX = Math.random() * -1;
                // let translateNumY = Math.random() * 0.25;
                // let translateNumZ = Math.random() * 2;

                // this.cloudArray = [translateNumX, translateNumY, translateNumZ];
            }
           
            // Generate clouds! 
        
          
            // mat4.scale(this.modelMatrix, this.modelMatrix, [3.0, 3.0, 3.0]);
            // mat4.rotateZ(this.modelMatrix, this.modelMatrix, Math.PI / 0.5);
            // mat4.translate(this.modelMatrix, this.modelMatrix, [1.0, 0, 2.0]);

            // gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
                
            // // Draw the Square
            // this.squareArray[1].render(gl, shader);
    
            // // Reset the model matrix to the identity
             mat4.identity(this.modelMatrix);


            
            gl.disable(gl.BLEND);
            gl.depthMask(true);
        }
    }

    /**
     * Draw the skybox and applies the texture
     * 
     * @param {WebGL2RenderingContext} gl
     * @param {ShaderProgram} shader the shader program
     */
    drawSkybox(gl, shader)
    {
        if(this.text !== null)
        {
            // Bind the texture in texture channel 0
           gl.activeTexture(gl.TEXTURE0);
           gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.text); // Cubemap instead

           // Set the uniform to texture channel zero
           gl.uniform1i(shader.uniform('cube_texture'), 0);

           //Set up the cube transformation
           mat4.identity(this.modelMatrix);
           mat4.scale(this.modelMatrix, this.modelMatrix, [50, 50, 50]);
           // Set the model matrix in the shader
           gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
           // Draw the cube
           this.cubemap.render(gl, shader);
       
           // Reset the model matrix to the identity
           mat4.identity(this.modelMatrix);
       }
    }

    /**
     * Draw the Scene.  This method will be called repeatedly as often as possible.
     * 
     * @param {Number} time time in milliseconds
     * @param {WebGL2RenderingContext} gl 
     * @param {ShaderProgram} wireShader the shader to use when drawing meshes 
     * @param {ShaderProgram} flatShader the shader to use when drawing the Grid
     */
    render(time, gl, flatShader, skyShader, sceneShader, squareShader) 
    {
        this.pollKeys();

        // Draw the grid using flatShader
        flatShader.use(gl);
        this.setMatrices(gl, flatShader);
        this.grid.render(gl, flatShader);

        // Sky Shader
        skyShader.use(gl);
        this.setMatrices(gl, skyShader);
        this.drawSkybox(gl, skyShader);

        // Square Shader
        squareShader.use(gl); // Enables the shader in the pipeline 
        this.setMatrices(gl, squareShader);
        this.drawSquare(gl, squareShader);

        // this.setMatrices(gl, squareShader);
        // this.drawSquare(gl, squareShader);
     
        // Scene Shader
        sceneShader.use(gl);
        const diffuseLight = gl.getUniformLocation(sceneShader.programId, 'diffuseLight');
        gl.uniform3f( diffuseLight, 0.2,0.2,0.2);
   
        let position = [5.0, 10.0, 1.0];
 
        position = transformMat4(position, position, this.viewMatrix);
 
        const lightPos = gl.getUniformLocation(sceneShader.programId, 'lightPos');
        gl.uniform3f( lightPos, position[0], position[1], position[2]);
   
        const lightColor = gl.getUniformLocation(sceneShader.programId, 'lightColor');
        gl.uniform3f( lightColor, 0.1,0.6,0.8);
        this.setMatrices(gl, sceneShader);
        this.drawScene(gl, sceneShader);

    }   

    //////////////
    // PART TWO //  --> Need A, D, E, Q, S, W
    //////////////
    /**
     * Checks to see which keys are currently pressed, and updates the camera
     * based on the results.
     */
    pollKeys() 
    {
        // Only do this in "fly" mode.
        if( this.mode !== "fly" ) return;

        // TODO: Part 2
        // Use this.controls.keyDown() to determine which keys are pressed, and 
        // move the camera based on the results.
        // See: https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/code
        // for details on key codes.
        else 
        {
            // Key D (RIGHT)
            if (this.controls.keyDown("KeyD"))
            {
                this.camera.track(.05, 0);
                this.camera.getViewMatrix(this.viewMatrix);
            }
            
            // Key Q (UP)
            if (this.controls.keyDown("KeyQ"))
            { 
                this.camera.track(0, .05);
                this.camera.getViewMatrix(this.viewMatrix);

            }

            // Key A (LEFT)
            if (this.controls.keyDown("KeyA"))
            {
                this.camera.track(-.05, 0);
                this.camera.getViewMatrix(this.viewMatrix);
            }

            // Key E (DOWN)
            if (this.controls.keyDown("KeyE"))
            {
                this.camera.track(0, -.05);
                this.camera.getViewMatrix(this.viewMatrix);
            }

            // Key S (Zoom In)
            if (this.controls.keyDown("KeyS"))
            {
                this.camera.dolly(.05);
                this.camera.getViewMatrix(this.viewMatrix);
            }

            // Key W (Zoom Out)
            if (this.controls.keyDown("KeyW"))
            {
                this.camera.dolly(-.05); 
                this.camera.getViewMatrix(this.viewMatrix);
            }
        }
    }

    
    
    //////////////
    // PART ONE //
    //////////////
    /**
     * Draw the objects in the scene.
     * 
     * @param {WebGL2RenderingContext} gl
     * @param {ShaderProgram} shader the shader program
     */
    drawScene(gl, shader) 
    {
        // TODO: Part 1
        // The code below draws an example scene consisting of just one box and 
        // a cow.  This is intended as an example only.  Replace with a scene of
        // your own design!  If you want to use other meshes, load them in the constructor
        // above.  See the constructor for an example of how to load an OBJ file.

    //     if(this.text !== null){

    //          // Bind the texture in texture channel 0
    //         gl.activeTexture(gl.TEXTURE0);
    //         gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.text);//cubemap instead

    //         // Set the uniform to texture channel zero
    //         gl.uniform1i(shader.uniform('cube_texture'), 0);

    //         //Set up the cube transformation
    //         mat4.identity(this.modelMatrix);
    //         mat4.scale(this.modelMatrix, this.modelMatrix, [50, 50, 50]);
    //         // Set the model matrix in the shader
    //         gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
    //         // Draw the cube
    //         this.cubemap.render(gl, shader);
    //     }

        // Reset the model matrix to the identity
        mat4.identity(this.modelMatrix);
       

        
        // if(this.clouds !== null) {
        //     // Set up the cow's transformation
        //     mat4.identity(this.modelMatrix);
        //     //mat4.translate(this.modelMatrix, this.modelMatrix, [0.0, 10.00, 0.0]);
        //     //mat4.scale(this.modelMatrix, this.modelMatrix, [2.0, 2.0, 2.0]);
        //     // Set the model matrix in the shader
        //     gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        //     // Set the color in the shader
        //     gl.uniform3f( shader.uniform('uColor'), 1.0, 1.0, 1.0);
        //     // Draw the cow
        //     this.clouds.render(gl, shader);
        // }

        // if(this.island !== null) {
        //     // Set up the cow's transformation
        //     mat4.identity(this.modelMatrix);
        //     mat4.translate(this.modelMatrix, this.modelMatrix, [-0.5, 1.05, 0.25]);
        //     mat4.scale(this.modelMatrix, this.modelMatrix, [0.2, 0.2, 0.2]);
        //     // Set the model matrix in the shader
        //     gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
        //     // Set the color in the shader
        //     gl.uniform3f( shader.uniform('uColor'), 1.0, 1.0, 1.0);
        //     // Draw the cow
        //     this.island.render(gl, shader);
        // }

       
    }

    /**
     * Called when the canvas is resized.
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {Number} width the width of the canvas in pixels 
     * @param {Number} height the height of the canvas in pixels 
     */
    resize(gl, width, height) 
    {
        this.width = width;
        this.height = height;
        this.setProjectionMatrix();

        // Sets the viewport transformation
        gl.viewport(0, 0, width, height);
    }

    ////////////////
    // PART THREE //
    ////////////////
    /**
     * Sets this.projMatrix to the appropriate projection matrix.
     */
    setProjectionMatrix() 
    {
        // TODO: Part 3
        // Set the projection matrix to the appropriate matrix based on this.projType.  
        // Currently, uses a perspective projection only.

        const aspect = this.width / this.height;
        if (this.projType === 'perspective')
        {
            mat4.perspective(this.projMatrix, glMatrix.toRadian(45.0), aspect, 0.5, 1000.0);
        }
    }

    //////////
    // TURN //
    //////////
    /**
     * This method is called when the mouse moves while the left mouse button
     * is pressed. This should apply either a "orbit" motion to the camera
     * or a "turn" motion depending on this.mode.
     * 
     * @param {Number} deltaX change in the mouse's x coordinate
     * @param {Number} deltaY change in the mouse's y coordinate
     */
    leftDrag( deltaX, deltaY ) 
    { 
        // TODO: Part 2
        // Implement this method.

        deltaX = deltaX * .001;
        deltaY = deltaY * .001;

        // Mouse Mode = TURN 
        if (this.mode === 'mouse')
        {
            this.camera.turn(deltaX, deltaY);
            this.camera.getViewMatrix(this.viewMatrix);
        }
    }

    /**
     * Resets the camera to a default position and orientation.  This is 
     * called when the user clicks the "Reset Camera" button.
     */
    resetCamera() 
    {
        // Set the camera's default position/orientation
        this.camera.orient([0,1,20], [0,0,0], [0,1,0]); // Modifies the camera
        // Retrieve the new view matrix
        this.camera.getViewMatrix(this.viewMatrix); // New view matrix 
    }

    /**
     * Set the view volume type.  This is called when the perspective/orthographic radio button
     * is changed.
     * 
     * @param {String} type projection type.  Either "perspective" or "orthographic" 
     */
    setViewVolume( type ) 
    {
        this.projType = type;
        this.setProjectionMatrix();
    }

    /**
     * Called when the camera mode is changed.
     * 
     * @param {String} type the camera mode: either "fly" or "mouse" 
     */
    setMode(type) 
    {
        this.mode = type;
    }
}