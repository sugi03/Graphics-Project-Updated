import {ObjMesh} from './objmesh.js';

let text = null;

/**
 * Loads the environment map.
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {String} dir directory containing the cube map images. 
 */

export function loadSkybox(gl, dir){
   return loadSkyMap(gl, dir);
 } 

/**
 * This function should build a cube that we can use for the skybox
 * The ObjMesh returned should be centered at the origin
 * @param {*} sideLength the sidelength of the cube should be one unless already assigned
 * @returns {ObjMesh} the mesh
 */
export function buildCube(sideLength = 1.0){
    const side = sideLength/2.0;
    
    const objData = {

        points: [
            [-side, -side, side], [side, -side, side], [side, side, side], [-side, side, side],
            [-side, -side, -side], [side, -side, -side], [side, side, -side], [-side, side, -side],
        ],
        normals: [
            [0, 0, 1], [1, 0, 0], [0, 0, -1], [-1, 0, 0], [0, 1, 0], [0, -1, 0]
        ],
        uvs: [
            [0, 0], [1, 0], [1, 1], [0, 1],
        ],

        //(input clockwise so that the faces are on the inside)
        verts: [
            // Front face
            {p: 0, n: 0, uv: 0}, {p: 3, n: 0, uv: 3}, {p: 2, n: 0, uv: 2}, 
            {p: 0, n: 0, uv: 0}, {p: 2, n: 0, uv: 2}, {p: 1, n: 0, uv: 1},
            //Back face
            {p: 4, n: 2, uv: 0}, {p: 6, n: 2, uv: 2}, {p: 7, n: 2, uv: 3},
            {p: 4, n: 2, uv: 0}, {p: 5, n: 2, uv: 1}, {p: 6, n: 2, uv: 2},
            //Top face
            {p: 3, n: 4, uv: 0}, {p: 7, n: 4, uv: 3}, {p: 6, n: 4, uv: 2},
            {p: 3, n: 4, uv: 0}, {p: 6, n: 4, uv: 2}, {p: 2, n: 4, uv: 1},
            //Bottom face
            {p: 0, n: 5, uv: 0}, {p: 5, n: 5, uv: 2}, {p: 4, n: 5, uv: 3},
            {p: 0, n: 5, uv: 0}, {p: 1, n: 5, uv: 1}, {p: 5, n: 5, uv: 2},
            //Right face
            {p: 1, n: 1, uv: 0}, {p: 2, n: 1, uv: 3}, {p: 6, n: 1, uv: 2},
            {p: 1, n: 1, uv: 0}, {p: 6, n: 1, uv: 2}, {p: 5, n: 1, uv: 1},
            //Left face
            {p: 4, n: 3, uv: 0}, {p: 7, n: 3, uv: 3}, {p: 3, n: 3, uv: 2},
            {p: 4, n: 3, uv : 0}, {p: 3, n: 3, uv: 2}, {p: 0, n: 3, uv: 1},
        ],

    };
    return new ObjMesh(objData);
}

/**
 * Loads the environment/sky map.
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {String} dir directory containing the cube map images. 
 */
function loadSkyMap(gl, dir){
      // Create an array with all of the face texture informtion
      const imageFiles = [
        'right.jpg', 'left.jpg',
        'top.jpg', 'bottom.jpg',
        'front.jpg', 'back.jpg',
    ].map( (name) => dir + "/" + name);

    if(imageFiles.length != 6) return null; //make sure we grabbed 6 images 

    const imagePromises = imageFiles.map( (url) => loadImage(url) );

    //Load all of the images asynchronously
    return Promise.all( imagePromises ).then( (image) => {
        // Create a texture id that and bind it to the cubemap
        const texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

        //store the width and height of the image object array
        const w = image[0].width;
        const h = image[0].height;

        gl.texStorage2D(gl.TEXTURE_CUBE_MAP, 1, gl.RGBA8, w, h);
        
        //Go through the image array and push an image given a specific position
        for(var i=0; i < 6; i++){
            gl.texSubImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, 0, 0, w, h, gl.RGBA,
                gl.UNSIGNED_BYTE, image[i]);
        }

        //Clamp the edges to the texture to the cubemap 
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR); //For up scaling
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST); //For down scaling
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); //Stretch the image by X position
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); //Stretch the image by Y position
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE); //Stretch the image by Z position
        
        return texture;
    });//end of Promise.all
}

//This is from PA5, I tried to reverse engineer my own version but could not find a way
/**
 * Loads an image and returns a promise that resolves to the Image object.
 * 
 * @param {String} url image path 
 * @returns {Promise<Image>}
 */
function loadImage(url) {
    return new Promise( (resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image) );
        image.addEventListener('error', () => {
            console.error("Unable to load texture: " + url);
            reject("Unable to load texture: " + url);
        });
        image.src = url; // tectures/ 
    });
}
