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
import { loadPlanetTexture } from './loadPlanetTexture.js'


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

        // Load in the cloud texture
        const dir2 = "textures/cloud_4.png";
        loadSquare(gl, dir2).then((cloudTexture) => {this.cloud_texture = cloudTexture});

        //initialize blending needed to make the cloud png transparent
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
     
        //These arrays will hold the random numbers generated to create a new placement/scaling of clouds every time the program is loaded
        this.cloudScale = []; // Scaling
        this.cloudTranslation = []; // Translating

        //the random number should be between 30 and -30
        let max = 75; //max = the maximum random number
        let min = -75; //mint = the minimum random number 
 
         // For loop to get different size clouds 
         for (let i = 0; i < 100; i++)
         {
            let scaleNum = Math. random() * (max - min) + min;
            this.cloudScale.push([scaleNum, scaleNum, 0]); 
         }
    
         // For loop to translate the clouds
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

          //////////////////////////////
        // Load in Planet Textures //
        ////////////////////////////
        // MERCURY 
        const mercury_dir = "textures/mercury.jpg";
        loadPlanetTexture(gl, mercury_dir).then((texture) => {this.mercuryTexture = texture});

        // VENUS
        const venus_dir = "textures/venus.jpg";
        loadPlanetTexture(gl, venus_dir).then((texture) => {this.venusTexture = texture});

        // EARTH
        const earth_dir = "textures/earth.jpg";
        loadPlanetTexture(gl, earth_dir).then((texture) => {this.earthTexture = texture});

        // MARS
        const mars_dir = "textures/mars.jpg";
        loadPlanetTexture(gl, mars_dir).then((texture) => {this.marsTexture = texture});

        // JUPITER
        const jupiter_dir = "textures/jupiter.jpg";
        loadPlanetTexture(gl, jupiter_dir).then((texture) => {this.jupiterTexture = texture});

        // SATURN
        const saturn_dir = "textures/saturn.jpg";
        loadPlanetTexture(gl, saturn_dir).then((texture) => {this.saturnTexture = texture});

        // URANUS
        const uranus_dir = "textures/uranus.jpg";
        loadPlanetTexture(gl, uranus_dir).then((texture) => {this.uranusTexture = texture});

        // NEPTUNE
        const neptune_dir = "textures/neptune.jpg";
        loadPlanetTexture(gl, neptune_dir).then((texture) => {this.neptuneTexture = texture});

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
        
        this.crane = null;
        fetch('data/crane.obj')
            .then( (response) => {
                return response.text();
            })
            .then( (text) => {
                let objMesh = loadObjMesh(text);
                this.crane = new RenderMeshBary(gl, objMesh);
            })

            this.plane = null;
            fetch('data/Plane.obj')
                .then( (response) => {
                    return response.text();
                })
                .then( (text) => {
                    let objMesh = loadObjMesh(text);
                    this.plane = new RenderMeshBary(gl, objMesh);
                })
    
            this.planet = null;
            fetch('data/sphere.obj')
                .then( (response) => {
                    return response.text();
                })
                .then( (text) => {
                    let objMesh = loadObjMesh(text);
                    this.planet = new RenderMeshBary(gl, objMesh);
                })
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
     * @param {ShaderProgram} skyShader the shader to use when drawing the Skybox/cube map
     * @param {ShaderProgram} sceneShader the shader to use when drawing the scene, it will apply light and the object color
     * @param {ShaderProgram} squareShader the shader to use when drawing the cloud particles 
     * @param {ShaderProgram} flatShader the shader to use when drawing the Grid used to orient from the origin for the most part
     */
    render(time, gl, flatShader, skyShader, sceneShader, squareShader, planetShader) 
    {
        this.pollKeys();

        /*
        // Draw the grid using flatShader
        flatShader.use(gl);
        this.setMatrices(gl, flatShader);
        this.grid.render(gl, flatShader);
        */

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
        
        // Draw the solar system with the planetShader
        planetShader.use(gl);
        this.setMatrices(gl, planetShader);
        this.drawPlanet(gl, planetShader);
    } 

    /**
     * Draw the squares needed for the particles and applies the cloud texture
     * 
     * @param {WebGL2RenderingContext} gl
     * @param {ShaderProgram} shader the shader program
     */
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
           mat4.scale(this.modelMatrix, this.modelMatrix, [200, 200, 200]);
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
     * Draws Neptune and applies its corresponding texture.
     * @param {WebGL2RenderingContext} gl 
     * @param {ShaderProgram} shader 
     */
    drawPlanet(gl, shader)
    {
        if (this.planet !== null)
        {
            if (this.neptuneTexture !== null){
                // Bind the texture in texture channel 0
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.neptuneTexture);
                // Set the uniform to texture channel 0
                gl.uniform1i(shader.uniform('planet_texture'), 0);
                // Set up Mercury's transformation
                mat4.identity(this.modelMatrix);
                mat4.translate(this.modelMatrix, this.modelMatrix, [24, 50, 33]);
                mat4.scale(this.modelMatrix, this.modelMatrix, [3, 3, 3]);
                // Set the model matrix in the shader
                gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
                // Draw the planet
                this.planet.render(gl, shader)
            }

            if(this.uranusTexture !== null){
                // Bind the texture in texture channel 0
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.uranusTexture);
                // Set the uniform to texture channel 0
                gl.uniform1i(shader.uniform('planet_texture'), 0);
                // Set up Uranus's transformation
                mat4.identity(this.modelMatrix);
                mat4.translate(this.modelMatrix, this.modelMatrix, [18, 50, 25]);
                mat4.scale(this.modelMatrix, this.modelMatrix, [4, 4, 4]);
                // Set the model matrix in the shader
                gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
                // Draw the planet
                this.planet.render(gl, shader);
            }

            if(this.saturnTexture !== null){
                 // Bind the texture in texture channel 0
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.saturnTexture);
                // Set the uniform to texture channel 0
                gl.uniform1i(shader.uniform('planet_texture'), 0);
                // Set up Mercury's transformation
                mat4.identity(this.modelMatrix);
                mat4.translate(this.modelMatrix, this.modelMatrix, [9, 49, 14]);
                mat4.scale(this.modelMatrix, this.modelMatrix, [6, 6, 6]);
                // Set the model matrix in the shader
                gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
                // Draw the planet
                this.planet.render(gl, shader);
            }

            if(this.jupiterTexture !== null){
                 // Bind the texture in texture channel 0
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.jupiterTexture);
                // Set the uniform to texture channel 0
                gl.uniform1i(shader.uniform('planet_texture'), 0);
                // Set up Mercury's transformation
                mat4.identity(this.modelMatrix);
                mat4.translate(this.modelMatrix, this.modelMatrix, [-5, 49, 0]);
                mat4.rotateY(this.modelMatrix, this.modelMatrix, Math.PI / 0.8);
                mat4.scale(this.modelMatrix, this.modelMatrix, [8, 8, 8]);
                // Set the model matrix in the shader
                gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
                // Draw the planet
                this.planet.render(gl, shader);
            }

            if(this.marsTexture !== null){
                // Bind the texture in texture channel 0
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.marsTexture);
                // Set the uniform to texture channel 0
                gl.uniform1i(shader.uniform('planet_texture'), 0);
                // Set up Mercury's transformation
                mat4.identity(this.modelMatrix);
                mat4.translate(this.modelMatrix, this.modelMatrix, [-20, 50, -10]);
                mat4.rotateY(this.modelMatrix, this.modelMatrix, Math.PI / 0.8);
                mat4.scale(this.modelMatrix, this.modelMatrix, [3, 3, 3]);
                // Set the model matrix in the shader
                gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
                // Draw the planet
                this.planet.render(gl, shader);
            }

            if(this.earthTexture !== null){
                 // Bind the texture in texture channel 0
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.earthTexture);
                // Set the uniform to texture channel 0
                gl.uniform1i(shader.uniform('planet_texture'), 0);
                // Set up Mercury's transformation
                mat4.identity(this.modelMatrix);
                mat4.translate(this.modelMatrix, this.modelMatrix, [-33, 50, -21]);
                mat4.rotateY(this.modelMatrix, this.modelMatrix, Math.PI / 0.8);
                mat4.scale(this.modelMatrix, this.modelMatrix, [5, 5, 5]);
                // Set the model matrix in the shader
                gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
                // Draw the planet
                this.planet.render(gl, shader);
            }

            if(this.venusTexture !== null){
                // Bind the texture in texture channel 0
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.venusTexture);
                // Set the uniform to texture channel 0
                gl.uniform1i(shader.uniform('planet_texture'), 0);
                // Set up Mercury's transformation
                mat4.identity(this.modelMatrix);
                mat4.translate(this.modelMatrix, this.modelMatrix, [-50, 50, -35]);
                mat4.rotateY(this.modelMatrix, this.modelMatrix, Math.PI / 0.8);
                mat4.scale(this.modelMatrix, this.modelMatrix, [5, 5, 5]);
                // Set the model matrix in the shader
                gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
                // Draw the planet
                this.planet.render(gl, shader);
            }

            if(this.mercuryTexture !== null){
                // Bind the texture in texture channel 0
                gl.activeTexture(gl.TEXTURE0);
                gl.bindTexture(gl.TEXTURE_2D, this.mercuryTexture);
                // Set the uniform to texture channel 0
                gl.uniform1i(shader.uniform('planet_texture'), 0);
                // Set up Mercury's transformation
                mat4.identity(this.modelMatrix);
                mat4.translate(this.modelMatrix, this.modelMatrix, [-60, 50, -40]);
                mat4.scale(this.modelMatrix, this.modelMatrix, [2, 2, 2]);
                // Set the model matrix in the shader
                gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
                // Draw the planet
                this.planet.render(gl, shader);
            }
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
        if (this.plane !== null){
            // Set up the plane's transformation
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-15, 55, -7]);
            mat4.rotateY(this.modelMatrix, this.modelMatrix, Math.PI / 0.6);
            mat4.rotateZ(this.modelMatrix, this.modelMatrix, Math.PI / 0.60);
            mat4.scale(this.modelMatrix, this.modelMatrix, [0.01, 0.01, 0.01]);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 1.0, 1.0, 1.0);
            // Draw the plane
            this.plane.render(gl, shader);
        }

        if(this.turbine !== null){
            // Set up the turbine's transformation
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [1, 1, 1]);
            mat4.scale(this.modelMatrix, this.modelMatrix, [0.5, 0.5, 0.5]);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 1.0, 0.89, 0.75);
            // Draw the turbine
            this.turbine.render(gl, shader);
        }
        
        if(this.crane !== null){
            /////////
            // RED //
            /////////
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [3, 1, 2]);
            mat4.rotateY(this.modelMatrix, this.modelMatrix, 45);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 1.0, 0.0, 0.0);
            // Draw the crane
            this.crane.render(gl, shader);

            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [5, 10, -25]);
            mat4.rotateY(this.modelMatrix, this.modelMatrix, 20);
            mat4.rotateX(this.modelMatrix, this.modelMatrix, 75);
            mat4.scale(this.modelMatrix, this.modelMatrix, [2, 2, 2]);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 1.0, 0.0, 0.0);
            // Draw the crane
            this.crane.render(gl, shader);

            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-20, 10, -50]);
            mat4.rotateY(this.modelMatrix, this.modelMatrix, 60);
            mat4.rotateX(this.modelMatrix, this.modelMatrix, 75);
            mat4.scale(this.modelMatrix, this.modelMatrix, [.5, .5, .5]);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 1.0, 0.0, 0.0);
            // Draw the crane
            this.crane.render(gl, shader);

            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [30, 10, 50]);
            mat4.rotateY(this.modelMatrix, this.modelMatrix, 60);
            mat4.scale(this.modelMatrix, this.modelMatrix, [1.5, 1.5, 1.5]);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 1.0, 0.0, 0.0);
            // Draw the crane
            this.crane.render(gl, shader);

            
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-60, -3, -45]);
            mat4.rotateY(this.modelMatrix, this.modelMatrix, 60);
            mat4.rotateX(this.modelMatrix, this.modelMatrix, 25);
            mat4.scale(this.modelMatrix, this.modelMatrix, [1.5, 1.5, 1.5]);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 1.0, 0.0, 0.0);
            // Draw the crane
            this.crane.render(gl, shader);
            

            //////////
            // BLUE //
            //////////
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [0, 1, 4]);
            mat4.rotateY(this.modelMatrix, this.modelMatrix, 60);
            mat4.scale(this.modelMatrix, this.modelMatrix, [0.6, 0.6, 0.6]);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 0.0, 0.0, 1.0);
            // Draw the crane
            this.crane.render(gl, shader);


            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [12, 10, 3]);
            mat4.rotateY(this.modelMatrix, this.modelMatrix, 40);
            mat4.scale(this.modelMatrix, this.modelMatrix, [2, 2, 2]);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 0.0, 0.0, 1.0);
            // Draw the crane
            this.crane.render(gl, shader);

            
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-20, 0, 20]);
            mat4.rotateY(this.modelMatrix, this.modelMatrix, 45);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 0.0, 0.0, 1.0);
            // Draw the crane
            this.crane.render(gl, shader);

            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [0, 5, 50]);
            mat4.rotateZ(this.modelMatrix, this.modelMatrix, 45);
            mat4.scale(this.modelMatrix, this.modelMatrix, [0.5, 0.5, 0.5]);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 0.0, 0.0, 1.0);
            // Draw the crane
            this.crane.render(gl, shader);

            ////////////
            // YELLOW //
            ////////////
            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-2, 1, 1]);
            mat4.rotateY(this.modelMatrix, this.modelMatrix, 90);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 1.0, 0.67, 0.0);
            // Draw the crane
            this.crane.render(gl, shader);

            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-15, 15, 4]);
            mat4.rotateY(this.modelMatrix, this.modelMatrix, 100);
            mat4.rotateX(this.modelMatrix, this.modelMatrix, 75);
            mat4.scale(this.modelMatrix, this.modelMatrix, [1.5, 1.5, 1.5]);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 1.0, 0.67, 0.0);
            // Draw the crane
            this.crane.render(gl, shader);

            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [40, 5, -60]);
            mat4.rotateY(this.modelMatrix, this.modelMatrix, 90);
            mat4.rotateX(this.modelMatrix, this.modelMatrix, 50);
            mat4.scale(this.modelMatrix, this.modelMatrix, [1.25, 1.25, 1.25]);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 1.0, 0.67, 0.0);
            // Draw the crane
            this.crane.render(gl, shader);

            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [25, 8, 30]);
            mat4.rotateZ(this.modelMatrix, this.modelMatrix, 45);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 1.0, 0.67, 0.0);
            // Draw the crane
            this.crane.render(gl, shader);

            mat4.identity(this.modelMatrix);
            mat4.translate(this.modelMatrix, this.modelMatrix, [-30, 10, 50]);
            mat4.rotateY(this.modelMatrix, this.modelMatrix, 60);
            mat4.scale(this.modelMatrix, this.modelMatrix, [1.5, 1.5, 1.5]);
            // Set the model matrix in the shader
            gl.uniformMatrix4fv(shader.uniform('uModel'), false, this.modelMatrix);
            // Set the color in the shader
            gl.uniform3f( shader.uniform('uColor'), 1.0, 0.67, 0.0);
            // Draw the crane
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

        else 
        {
            // Key D (RIGHT)
            if (this.controls.keyDown("KeyD"))
            {
                this.camera.track(.2, 0);
                this.camera.getViewMatrix(this.viewMatrix);
            }
            
            // Key Q (UP)
            if (this.controls.keyDown("KeyQ"))
            { 
                this.camera.track(0, .2);
                this.camera.getViewMatrix(this.viewMatrix);

            }

            // Key A (LEFT)
            if (this.controls.keyDown("KeyA"))
            {
                this.camera.track(-.2, 0);
                this.camera.getViewMatrix(this.viewMatrix);
            }

            // Key E (DOWN)
            if (this.controls.keyDown("KeyE"))
            {
                this.camera.track(0, -.2);
                this.camera.getViewMatrix(this.viewMatrix);
            }

            // Key S (Zoom In)
            if (this.controls.keyDown("KeyS"))
            {
                this.camera.dolly(.2);
                this.camera.getViewMatrix(this.viewMatrix);
            }

            // Key W (Zoom Out)
            if (this.controls.keyDown("KeyW"))
            {
                this.camera.dolly(-.2); 
                this.camera.getViewMatrix(this.viewMatrix);
            }
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
        if(this.mode === "fly"){
            this.camera.turn(deltaX * 0.001 , deltaY * 0.001);
            this.camera.getViewMatrix(this.viewMatrix);
        }

        if(this.mode === "mouse"){
            this.camera.orbit(deltaX * 0.001, deltaY * 0.001);
            this.camera.getViewMatrix(this.viewMatrix);
        }
    }

    ///////////
    // ZOOM //
    //////////
   /**
     * Called when the mouse wheel is turned to zoom in and out of the scene
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

    /**
     * Resets the camera to a default position and orientation.  This is 
     * called when the user clicks the "Reset Camera" button.
     */
    resetCamera() 
    {
        // Set the camera's default position/orientation
        this.camera.orient([0,30,80], [0,0,0], [0,1,0]); // Modifies the camera
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