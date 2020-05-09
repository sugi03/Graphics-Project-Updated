/**
 * Represents a texture object in WebGL.
 */
export class Texture {

    /**
     * Constructs an (empty) texture object.  Don't call this function,
     * instead, use Texture.load.
     */
    constructor() {
        this.textureId = null;
        this.dimensions = null;
    }

    /**
     * Delete all WebGL memory associated with this texture.
     * 
     * @param {WebGL2RenderingContext} gl 
     */
    delete(gl) {
        if( this.textureId) {
            gl.deleteTexture(this.textureId);
            this.textureId = null;
        }
    }

    /**
     * Load an image into WebGL texture, and return a Promise that
     * will resolve into a Texture object.
     * 
     * @param {WebGL2RenderingContext} gl
     * @param {String} url path to image 
     * @returns {Promise<Texture>}
     */
    static load(gl, url) {
        return new Promise( (resolve, reject) => {
            const img = new Image();
            img.addEventListener('load', () => resolve(img) );
            img.addEventListener('error', () => {
                console.error("Unable to load texture: " + url);
                reject("Unable to load texture: " + url);
            });
            img.src = url;
        })
        .then( (image) => {
            // Create the texture object
            const texture = new Texture();
            texture.textureId = gl.createTexture();

            // Bind to the texture and set texture parameters
            gl.bindTexture(gl.TEXTURE_2D, texture.textureId);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_BASE_LEVEL, 0);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAX_LEVEL, 0);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

            // Create storage and load the texture
            gl.texStorage2D(gl.TEXTURE_2D, 1, gl.RGBA8, image.width, image.height);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, image.width, image.height, gl.RGBA, gl.UNSIGNED_BYTE, image);

            console.log( `Loaded texture: ${url} (${image.width} x ${image.height})` );
            texture.dimensions = [image.width, image.height];
            return texture;
        });
    }

    getDimensions() { return this.dimensions; }
}