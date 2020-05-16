import { ObjMesh } from './objmesh.js'; 
 
/**
* This function should create a square. 
*/
export function buildSquare()
{
    const side = 1.0 / 2.0;

    const objData = {
        points: [
            [-side, -side, 0], [side, -side, 0], [side, side, 0], [-side, side, 0],
        ],

        normals: [
            [0, 0, 1],
        ],

        uvs: [
            [0, 0], [1, 0], [1, 1], [0, 1],
        ],

        verts: [
            {p: 0, n: 0, uv: 0}, {p: 1, n: 0, uv: 1}, {p: 2, n: 0, uv: 2}, 
            {p: 0, n: 0, uv: 0}, {p: 2, n: 0, uv: 2}, {p: 3, n: 0, uv: 3},
        ],
    };
    return new ObjMesh(objData); 
}


/**
 * Load the Cloud Texture onto the square. 
 */
export function loadSquare(gl, url) 
{
    return new Promise( (resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img) );
    img.addEventListener('error', () => {
        console.error("Unable to load texture: " + url);
        reject("Unable to load texture: " + url);
    });
    img.src = url;
    }).then( (image) => {
    // Create the texture object
    const texture = gl.createTexture();

    // Bind to the texture and set texture parameters
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // Scales Up 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); // Scales Down 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    // Create storage and load the texture
    gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, image.width, image.height);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, image.width, image.height, gl.RGBA, gl.UNSIGNED_BYTE, image);

    console.log( `Loaded texture: ${url} (${image.width} x ${image.height})` );
    return texture;
});
}
