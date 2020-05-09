/**
 * ObjMesh is a class that contains data for a triangle mesh in a format that is 
 * similar to the Wavefront OBJ format.
 */
export class ObjMesh {

    /**
     * Constructor function for an ObjMesh
     * 
     * @param {Object} data an object containing the data for this ObjMesh.  It can have
     *     the following properties:  
     *            - points:  an array of points (each a 3-element array), required
     *            - normals: an array of normal vectors (each a 3-element array), optional
     *            - uvs:     an array of uv coordinates (each a 2-element array), optional
     *            - verts:   an array of objects that represent vertices.  Each consecutive group of 
     *                       three objects defines a triangle.  Each can have the following properties: p (the 
     *                       point index, required), n (the normal index, optional), and uv (the uv index, optional). 
     *                       Note, indices are 0-based in the ObjMesh object, but will be 1-based in the .obj file.
     *            - bbox:    a bounding box for the object (optional)
     */
    constructor( data ) {
        if( 'points' in data ) {
            this.points = data.points;
        } else {
            throw new Error("Missing points array in ObjMesh data."); 
        }

        if( 'normals' in data ) {
            this.normals = data.normals;
        } else {
            this.normals = null;
        }

        if( 'uvs' in data ) {
            this.uvs = data.uvs;
        } else {
            this.uvs = null;
        }

        if( 'bbox' in data ) {
            this.bbox = data.bbox;
        } else {
            this.bbox = null;
        }

        if( 'verts' in data ) {
            this.verts = data.verts;
        } else {
            throw new Error("Missing verts array in ObjMesh data");
        }
    }

    /**
     * @returns {boolean} whether or not this ObjMesh has normals
     */
    hasNormals() {
        return this.normals !== null;
    }

    /**
     * @returns {Number} the number of triangles in this mesh
     */
    triCount() {
        return this.verts.length / 3;
    }

    /**
     * @returns {number} the number of normal vectors in this mesh
     */
    normalCount() {
        if( this.normals === null ) return 0;
        return this.normals.length;
    }

    /**
     * @returns {number} the number of UVs in this mesh
     */
    uvCount() {
        if( this.uvs === null ) return 0;
        return this.uvs.length;
    }

}
