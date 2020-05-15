import { Grid } from "./grid.js";
import { Camera } from "./camera.js"
import { Controls } from './controls.js';
import { RenderMeshBary } from "./rendermesh-bary.js";
import { makeCube } from './cube.js';
import { loadObjMesh } from './objloader.js';
import * as glMatrix from './gl-matrix/common.js';
import * as mat4 from "./gl-matrix/mat4.js";
import * as vec3 from "./gl-matrix/vec3.js";
import { buildCube } from './skybox.js';
import { loadSkybox } from './skybox.js';
import { loadSquare } from './square.js';
import { buildSquare } from './square.js'


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


        ///////////////////
        // Create Skybox //
        //////////////////s

        //Load the skybox textures
        const dir = "textures/";
        loadSkybox(gl,dir).then((texture) => {this.text = texture});

        // Create the skybox object
        this.cubemap = new RenderMeshBary(gl, buildCube());

        ////////////////////////////
        // Create cloud particles //
        ///////////////////////////

        // Square Texture
        const dir2 = "textures/cloud_4.png";
        loadSquare(gl, dir2).then((cloudTexture) => {this.cloud_texture = cloudTexture});

        //initialize blending
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
     
        this.cloudScale = []; // Scaling
        this.cloudTranslation = []; // Translating

        //the random number should be between 30 and -30
        let max = 75; //max = the maximum random number
        let min = -75; //mint = the minimum random number 
 
         // To get different size clouds 
         for (let i = 0; i < 100; i++)
         {
            let scaleNum = Math. random() * (max - min) + min;
            this.cloudScale.push([scaleNum, scaleNum, 0]); 
         }
    
         // To translate the clouds
         for (let i = 0; i < 100; i++)
         {
             let translateNumX = Math.random() * (max - min) + min;
             let translateNumY = 0;
             let translateNumZ = Math.random() * (max - min) + min;
             this.cloudTranslation.push([translateNumX, translateNumY, translateNumZ]);
         }
 
         // Create the Squares
         this.squareArray = [];
         for (let i = 0; i < 100; i++)
         {
             this.square = new RenderMeshBary(gl, buildSquare());
             this.squareArray.push(this.square);
         }

        ///////////////////////////
        // Load in scene objects //
        //////////////////////////

        // Caution: the fetch method is 
        // asynchronous, so the mesh will not be immediately available.  
        // Make sure to check for null before rendering.  Use this as an example
        // to load other OBJ files.

        this.moon = null;
        fetch('data/moon.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.moon = new RenderMeshBary(gl, objMesh);
            })

        this.turbine = null;
        fetch('data/turbine+island.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.turbine = new RenderMeshBary(gl, objMesh);
            })

        ////////////////////
        // Loading cranes //
        ////////////////////
        this.craneScale = []; // Scaling
        this.craneTranslation = []; // Translating

        //the random number should be between 30 and -30
        max = 75; //max = the maximum random number
        min = -75; //mint = the minimum random number 

        let scaleMax = 10;
        let scaleMin = 1;
 
        // To get different size clouds 
        for (let i = 0; i < 50; i++)
        {
            let scaleNum = Math. random() * (scaleMax - scaleMin) + scaleMin;
            this.craneScale.push([scaleNum, scaleNum, 0]); 
        }
    
        // To translate the clouds
        for (let i = 0; i < 50; i++)
        {
            let translateNumX = Math.random() * (max - min) + min;
            let translateNumY = Math.random() * (max - min) + min;
            let translateNumZ = Math.random() * (max - min) + min;
            this.craneTranslation.push([translateNumX, translateNumY, translateNumZ]);
        }

        // Create the Squares
        this.craneArray = [];
        //for (let i = 0; i < 50; i++)
        //{
            this.crane = null;
            fetch('data/crane.obj')
                .then( (response) => {
                    return response.text();
                })
                .then( (text) => {
                    let objMesh = loadObjMesh(text);
                    this.crane = new RenderMeshBary(gl, objMesh);
                })
           // this.craneArray.push(this.crane);
        //}
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

        // Draw the skybox with the skyShader
        skyShader.use(gl);
        this.setMatrices(gl, skyShader);
        this.drawSkybox(gl, skyShader);

        // Draw the cloud particles with the squareShader
        squareShader.use(gl);
        this.setMatrices(gl, squareShader);
        this.drawSquare(gl, squareShader);
        
        // Draw the imported obj with the sceneShader
        sceneShader.use(gl);//enabling shader

        //set the uniform variables for the scene lights 
        const lightPos = gl.getUniformLocation(sceneShader.programId, 'lightPos');
        gl.uniform3f( lightPos, 5.0, 10.0, 10.0);

        const lightColor = gl.getUniformLocation(sceneShader.programId, 'lightColor');
        gl.uniform3f( lightColor, 1.0, 1.0, 1.0);

        this.setMatrices(gl, sceneShader);
        this.drawScene(gl, sceneShader);
        
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
        
            // Set the uniform to texture channel 1
            gl.uniform1i(shader.uniform('square_texture'), 1);

            // Generate clouds! 
            for (let i = 0; i < 100; i++)
            {
                mat4.identity(this.modelMatrix);

                //Look at pdf 13, slide 11
                let middlePoint = this.cloudTranslation[i];
                let cameraPoint = this.camera.eye;
                let upDirection = [0, 1, 0]; //pointing in the positive y direction
                let w = [0, 0, 0];
                let u = [0, 0, 0];
                let v = [0, 0, 0];
                
                //w = camera point - middle of the square   
                w = vec3.subtract(w, cameraPoint, middlePoint);           
                vec3.normalize(w, w); //normalize w 

                // u = up x w 
                vec3.cross(u, upDirection, w);
                vec3.normalize(u,u);

                // v = w x u 
                vec3.cross(v, w, u);
                vec3.normalize(v, v);

                let rotationMatrix = [
                    u[0], u[1], u[2], 0,
                    v[0], v[1], v[2], 0,
                    w[0], w[1], w[2], 0,
                    0, 0, 0, 1
                  ];

                mat4.translate(this.modelMatrix, this.modelMatrix, this.cloudTranslation[i]);
                mat4.multiply(this.modelMatrix, this.modelMatrix, rotationMatrix);
                mat4.scale(this.modelMatrix, this.modelMatrix, this.cloudScale[i]);

                gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
                
                // Draw the Square
                this.squareArray[i].render(gl, shader);
    
                // Reset the model matrix to the identity
                mat4.identity(this.modelMatrix);
              }

            gl.disable(gl.BLEND);
            gl.depthMask(true);
        }
    }

    //ask for camera coordinates and rotate to the camera face using this.camera

    /**
     * Draw the skybox and applies the texture
     * 
     * @param {WebGL2RenderingContext} gl
     * @param {ShaderProgram} shader the shader program
     */
    drawSkybox(gl, shader){
        if(this.text !== null){
            let sky_view = this.camera.translatelessCameraMatrix();//import this

            // Bind the texture in texture channel 0
           gl.activeTexture(gl.TEXTURE0);
           gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.text);//cubemap instead

           // Set the uniform to texture channel zero
           gl.uniform1i(shader.uniform('cube_texture'), 0);

           //Set up the cube transformation
           mat4.identity(this.modelMatrix);
           mat4.scale(this.modelMatrix, this.modelMatrix, [175, 175, 175]);
           // Set the model matrix in the shader
           gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
           gl.uniformMatrix4fv(shader.uniform('uView'), false, sky_view);
           // Draw the cube
           this.cubemap.render(gl, shader);
       
           // Reset the model matrix to the identity
           mat4.identity(this.modelMatrix);
       }
    }
    
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
        
        if(this.moon !== null){
            // Set up the moon's transformation
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [30, 30, 0.25]);
            mat4.scale(this.modelMatrix, this.modelMatrix, [4.5, 4.5, 4.5]);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 0.72, 0.86, 1.0);
            // Draw the cow
            this.moon.render(gl, shader);
        }
        
        if(this.turbine !== null){
            // Set up the moon's transformation
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [1, 1, 1]);
            mat4.scale(this.modelMatrix, this.modelMatrix, [0.5, 0.5, 0.5]);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 1.0, 0.89, 0.75);
            // Draw the cow
            this.turbine.render(gl, shader);
        }

        /*
        if(this.crane !== null){
            for (let i = 0; i < 50; i++){
                mat4.identity(this.modelMatrix);
                mat4.translate(this.modelMatrix, this.modelMatrix, this.craneTranslation[i]);
                mat4.scale(this.modelMatrix, this.modelMatrix, this.craneScale[i]);
                // Set the model matrix in the shader
                gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
                // Set the color in the shader
                gl.uniform3f( shader.uniform('uColor'), 1.0, 0.0, 0.0);
                
                // Draw the Square
                this.craneArray[i].render(gl, shader);
            }
        }
        */
        
        if(this.crane !== null){
            // Set up the red's transformation
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [2, 1, 1]);
            mat4.rotateY(this.modelMatrix, this.modelMatrix, 45);
            //mat4.scale(this.modelMatrix, this.modelMatrix, [2, 2, 2]);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 1.0, 0.0, 0.0);
            // Draw the cow
            this.crane.render(gl, shader);

            // Set up the blue's transformation
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [12, 10, 3]);
            mat4.rotateY(this.modelMatrix, this.modelMatrix, 60);
            mat4.scale(this.modelMatrix, this.modelMatrix, [2, 2, 2]);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 0.0, 0.0, 1.0);
            // Draw the cow
            this.crane.render(gl, shader);
        }
        

        // Reset the model matrix to the identity
        mat4.identity(this.modelMatrix);       
    }
    
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
                this.camera.track(.08, 0);
                this.camera.getViewMatrix(this.viewMatrix);
            }
            
            // Key Q (UP)
            if (this.controls.keyDown("KeyQ"))
            { 
                this.camera.track(0, .08);
                this.camera.getViewMatrix(this.viewMatrix);

            }

            // Key A (LEFT)
            if (this.controls.keyDown("KeyA"))
            {
                this.camera.track(-.08, 0);
                this.camera.getViewMatrix(this.viewMatrix);
            }

            // Key E (DOWN)
            if (this.controls.keyDown("KeyE"))
            {
                this.camera.track(0, -.08);
                this.camera.getViewMatrix(this.viewMatrix);
            }

            // Key S (Zoom In)
            if (this.controls.keyDown("KeyS"))
            {
                this.camera.dolly(.08);
                this.camera.getViewMatrix(this.viewMatrix);
            }

            // Key W (Zoom Out)
            if (this.controls.keyDown("KeyW"))
            {
                this.camera.dolly(-.08); 
                this.camera.getViewMatrix(this.viewMatrix);
            }
        }
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

    /**
     * Sets this.projMatrix to the appropriate projection matrix.
     */
    setProjectionMatrix() 
    {
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
     * is pressed.  This should apply either a "orbit" motion to the camera
     * or a "turn" motion depending on this.mode.
     * 
     * @param {Number} deltaX change in the mouse's x coordinate
     * @param {Number} deltaY change in the mouse's y coordinate
     */
    leftDrag( deltaX, deltaY ) { 
        // TODO: Part 2
        // Implement this method.
        if(this.mode === "fly"){
            this.camera.turn(deltaX * 0.001 , deltaY * 0.001);
            this.camera.getViewMatrix(this.viewMatrix);
        }

        if(this.mode === "mouse"){
            this.camera.orbit(deltaX * 0.001, deltaY * 0.001);
            this.camera.getViewMatrix(this.viewMatrix);
        }
    }

   /**
     * Called when the mouse wheel is turned.
     * 
     * @param {Number} delta change amount
     */
    mouseWheel(delta) {

        if(this.mode === "mouse"){
            this.camera.dolly(delta * 0.005);
            this.camera.getViewMatrix(this.viewMatrix);
           // gl.uniformMatrix4fv(shader.uniform('uView'), false, this.viewMatrix);
        }
    }

    /**
     * Resets the camera to a default position and orientation.  This is 
     * called when the user clicks the "Reset Camera" button.
     */
    resetCamera() 
    {
        // Set the camera's default position/orientation
        this.camera.orient([0,30,75], [0,0,0], [0,1,0]); // Modifies the camera
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