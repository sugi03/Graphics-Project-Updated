
/**
 * A WebGL renderable mesh based on an ObjMesh object.  This "flattens" the triangle data
 * and adds barycentric coordinates so that it can be rendered with wireframe.  This version
 * is not memory efficient because of the need to flatten the data.
 */
export class RenderMeshBary {

    /**
     * Constructs a RenderMeshBary from an ObjMesh.  
     * @param {WebGL2RenderingContext} gl the WebGL 2 render context 
     * @param {ObjMesh} mesh the ObjMesh to be rendered 
     */
    constructor(gl, mesh) {
        this.mesh = mesh;
        this.points = null;
        this.normals = null;
        this.barys = null;
        this.uvs = null;
        this.nVerts = 0;
        this.vao = null;
        this.buffers = [];

        this.build(gl, mesh);
    }

    /**
     * Render this shape.
     * 
     * @param {WebGL2RenderingContext} gl the WebGL2 render context
     * @param {ShaderProgram} shader the active ShaderProgram (currently not used)
     */
    render(gl, shader) {
        // If the buffers haven't been initialized, do nothing
        if( this.vao === null ) return;

        // Bind to the VAO and draw the triangles
        gl.bindVertexArray(this.vao);
        gl.drawArrays( gl.TRIANGLES, 0, this.nVerts);
        gl.bindVertexArray(null);  // Un-bind the VAO
    }

    /**
     * Builds the internal buffers and VAO for this shape based on the provided mesh.
     * 
     * @param {WebGL2RenderingContext} gl the WebGL2 render context 
     * @param {ObjMesh} mesh the ObjMesh to use as source data 
     */
    build(gl, mesh) {
        if( this.vao !== null ) {
            this.deleteBuffers(gl);
        }

        this.nVerts = mesh.verts.length;
        this.points = [];
        this.barys = [];
        if( mesh.hasNormals() ) {
            this.normals = [];
        }
        if( mesh.uvs ) {
            this.uvs = [];
        }

        // Flatten the triangles, and add barycentric coordinates
        for (let i = 0; i < mesh.verts.length; i+=3) {
            for( let tri = 0; tri < 3; tri++ ) {
                let vert = mesh.verts[i+tri];

                this.points.push(mesh.points[vert.p][0], mesh.points[vert.p][1], mesh.points[vert.p][2]);
                
                // Push the barycentric coordinate
                if( tri === 0 ) this.barys.push(0,0);
                else if(tri === 1) this.barys.push(1,0);
                else this.barys.push(0,1);

                if( ("n" in vert) && this.normals ) {
                    this.normals.push(mesh.normals[vert.n][0], mesh.normals[vert.n][1], mesh.normals[vert.n][2]);
                }
                if( ("uv" in vert) && this.uvs ) {
                    this.uvs.push(mesh.uvs[vert.uv][0], mesh.uvs[vert.uv][1]);
                }
            }
        }

        // Convert to Float32Arrays
        this.points = Float32Array.from(this.points);
        this.barys = Float32Array.from(this.barys);
        if( this.normals ) {
            this.normals = Float32Array.from(this.normals);
        }
        if( this.uvs ) {
            this.uvs = Float32Array.from(this.uvs);
        }

        this.initVao(gl);
    }

    initVao(gl) {
        // Build vertex buffers and VAO

        // Position buffer
        this.buffers[0] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
        gl.bufferData(gl.ARRAY_BUFFER, this.points, gl.STATIC_DRAW);

        // Normal buffer
        if( this.normals ) {
            this.buffers[1] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
            gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);
        }

        // Texture coord buffer
        if( this.uvs ) {
            this.buffers[2] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[2]);
            gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);
        }

        // Barycentric coordinate buffer 
        this.buffers[3] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[3]);
        gl.bufferData(gl.ARRAY_BUFFER, this.barys, gl.STATIC_DRAW);

        // Setup VAO
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // Set up the position pointer.  The position is bound to vertex attribute 0.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, 0);
        gl.enableVertexAttribArray(0);

        if( this.normals ) {
            // Set up the normal pointer.  The normal is bound to vertex attribute 1.
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
            gl.vertexAttribPointer(1, 3, gl.FLOAT, gl.FALSE, 0, 0);
            gl.enableVertexAttribArray(1);
        }

        // Set up the texture coordinate pointer.  This is bound to vertex attribute 2.
        if( this.uvs ) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[2]);
            gl.vertexAttribPointer(2, 2, gl.FLOAT, gl.FALSE, 0, 0);
            gl.enableVertexAttribArray(2);
        }

        // The barycentric coordinate pointer.  Attribute 3.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[3]);
        gl.vertexAttribPointer(3, 2, gl.FLOAT, gl.FALSE, 0, 0);
        gl.enableVertexAttribArray(3);

        gl.bindVertexArray(null); // Done with this VAO
    }

    /**
     * Deletes all of the vertex data in WebGL memory for this object.  This invalidates the
     * vertex arrays, and the object can no longer be drawn.
     * 
     * @param {WebGL2RenderingContext} gl 
     */
    deleteBuffers(gl) {
        // Delete all buffers
        this.buffers.forEach( (buf) => gl.deleteBuffer(buf) );
        this.buffers = [];

        // Delete the VAO
        if( this.vao ) {
            gl.deleteVertexArray(this.vao);
            this.vao = null;
        }
    }
}