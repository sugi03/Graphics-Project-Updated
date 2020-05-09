import * as vec3 from './gl-matrix/vec3.js';
import * as vec2 from './gl-matrix/vec2.js';

/**
 * A WebGL renderable mesh based on an ObjMesh object.
 */
export class GLMesh {
    /**
     * Constructs a GLMesh from an ObjMesh.  
     * @param {WebGL2RenderingContext} gl the WebGL 2 render context 
     * @param {ObjMesh} mesh the ObjMesh to be rendered 
     */
    constructor(gl, mesh) {
        this.mesh = mesh;
        this.points = null;
        this.normals = null;
        this.uvs = null;
        this.indices = null;
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
        gl.drawElements( gl.TRIANGLES, this.indices.length, gl.UNSIGNED_INT, 0);
        gl.bindVertexArray(null);  // Un-bind the VAO
    }

    /**
     * Builds the internal buffers and VAO for this shape based on the provided mesh.
     * 
     * @param {WebGL2RenderingContext} gl the WebGL2 render context 
     * @param {ObjMesh} mesh the ObjMesh to use as source data 
     */
    build(gl, mesh) {
        if( this.vao !== null )
            this.deleteBuffers(gl);

        const vertHash = new Map();
        this.indices = new Uint32Array(mesh.verts.length);
        this.points = [];
        if( mesh.hasNormals() ) {
            this.normals = [];
        }
        if( mesh.uvs ) {
            this.uvs = [];
        }

        for (let i = 0; i < mesh.verts.length; i++) {
            let vert = mesh.verts[i];
            let vertKey = `${vert.p}:${'n' in vert ? vert.n : ''}:${'uv' in vert ? vert.uv : ''}`;

            let index = vertHash.get(vertKey);
            if( index === undefined ) {
                index = this.points.length / 3;
                this.points.push(mesh.points[vert.p][0], mesh.points[vert.p][1], mesh.points[vert.p][2]);
                if( 'n' in vert && this.normals ) {
                    this.normals.push(mesh.normals[vert.n][0], mesh.normals[vert.n][1], mesh.normals[vert.n][2]);
                }
                if( 'uv' in vert && this.uvs ) {
                    this.uvs.push(mesh.uvs[vert.uv][0], mesh.uvs[vert.uv][1]);
                }
                vertHash.set(vertKey, index);
            }
            this.indices[i] = index;
        }

        // Compute tangent vectors from UVs
        if( this.uvs ) this.computeTangents();

        // Convert to Float32Arrays
        this.points = Float32Array.from(this.points);
        if( this.normals ) {
            this.normals = Float32Array.from(this.normals);
        }
        if( this.uvs ) {
            this.uvs = Float32Array.from(this.uvs);
        }

        this.initVao(gl);
    }

    /**
     * Computes tangent vectors based on the UV coordinates.
     * 
     * From an algorithm described in: _Foundations of Game Engine Development Volume 2: Rendering_ by Eric Lengyel.
     *   http://foundationsofgameenginedev.com/FGED2-sample.pdf
     */
    computeTangents() {
        this.tang = new Float32Array(this.points.length);
        this.bitang = new Float32Array(this.points.length);

        const fromArray = (idx, arr) => {
            return vec3.fromValues( 
                arr[ idx * 3 + 0 ],
                arr[ idx * 3 + 1 ],
                arr[ idx * 3 + 2 ],
            );
        };
        const getUv = (idx) => {
            return vec2.fromValues(
                this.uvs[idx * 2 + 0],
                this.uvs[idx * 2 + 1]
            );
        };
        const addTo = (idx, arr, value) => {
            arr[idx*3 + 0] += value[0];
            arr[idx*3 + 1] += value[1];
            arr[idx*3 + 2] += value[2];
        };
        const setVec = (idx, arr, value) => {
            arr[idx*3+0] = value[0];
            arr[idx*3+1] = value[1];
            arr[idx*3+2] = value[2];
        };

        for( let i = 0; i < this.indices.length; i += 3 ) {
            const p0 = fromArray( this.indices[i], this.points );
            const p1 = fromArray( this.indices[i+1], this.points );
            const p2 = fromArray( this.indices[i+2], this.points );
            const uv0 = getUv( this.indices[i] );
            const uv1 = getUv( this.indices[i+1] );
            const uv2 = getUv( this.indices[i+2] );

            const e1 = vec3.sub(vec3.create(), p1, p0);
            const e2 = vec3.sub(vec3.create(), p2, p0);
            const x1 = uv1[0] - uv0[0], x2 = uv2[0] - uv0[0];
            const y1 = uv1[1] - uv0[1], y2 = uv2[1] - uv0[1];
            const r = 1.0 / (x1 * y2 - x2 * y1);
            const t = vec3.sub(vec3.create(), 
                vec3.scale(vec3.create(), e1, y2),
                vec3.scale(vec3.create(), e2, y1));
            vec3.scale( t, t, r );
            const b = vec3.sub( vec3.create(), 
                vec3.scale(vec3.create(), e2, x1),
                vec3.scale(vec3.create(), e1, x2));
            vec3.scale( b, b, r );

            addTo(this.indices[i], this.tang, t);
            addTo(this.indices[i+1], this.tang, t);
            addTo(this.indices[i+2], this.tang, t);
            addTo(this.indices[i], this.bitang, b);
            addTo(this.indices[i+1], this.bitang, b);
            addTo(this.indices[i+2], this.bitang, b);
        }

        // Normalize and orthogonalize
        for( let i = 0; i < this.tang.length / 3; i ++ ) {
            const t = fromArray(i, this.tang);
            const b = fromArray(i, this.bitang);
            const n = fromArray(i, this.normals);

            vec3.sub( t, t, vec3.scale(vec3.create(), n, vec3.dot(t, n) ) );
            vec3.normalize(t, t);
            vec3.sub(b, b, vec3.scale(vec3.create(), n, vec3.dot(b, n)));
            vec3.sub(b, b, vec3.scale(vec3.create(), t, vec3.dot(b, t)));
            vec3.normalize(b, b);
            
            setVec(i, this.tang, t);
            setVec(i, this.bitang, b);
        }
    }

    /**
     * Build the vertex buffers and VAO
     * 
     * @param {WebGL2RenderingContext} gl 
     */
    initVao(gl) {
        // Check whether or not the buffers have already been initialized, if so, delete them
        if( this.vao !== null ) this.deleteBuffers(gl);

        // Index buffer
        this.buffers[0] = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers[0]);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indices, gl.STATIC_DRAW);

        // Position buffer
        this.buffers[1] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
        gl.bufferData(gl.ARRAY_BUFFER, this.points, gl.STATIC_DRAW);

        // Normal buffer
        this.buffers[2] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[2]);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.STATIC_DRAW);

        // Texture coord buffer
        if( this.uvs ) {
            this.buffers[3] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[3]);
            gl.bufferData(gl.ARRAY_BUFFER, this.uvs, gl.STATIC_DRAW);

            // Tangent buffer
            this.buffers[4] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[4]);
            gl.bufferData(gl.ARRAY_BUFFER, this.tang, gl.STATIC_DRAW);

            // Tangent2 buffer
            this.buffers[5] = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[5]);
            gl.bufferData(gl.ARRAY_BUFFER, this.bitang, gl.STATIC_DRAW);
        }

        // Setup VAO
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // Set up the element buffer.  The buffer bound to GL_ELEMENT_ARRAY_BUFFER
        // is used by glDrawElements to pull index data (the indices used to access
        // data in the other buffers).
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers[0]);

        // Set up the position pointer.  The position is bound to vertex attribute 0.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, 0);
        gl.enableVertexAttribArray(0);

        // Set up the normal pointer.  The normal is bound to vertex attribute 1.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[2]);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, gl.FALSE, 0, 0);
        gl.enableVertexAttribArray(1);

        // Set up the texture coordinate pointer.  This is bound to vertex attribute 2.
        if( this.uvs ) {
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[3]);
            gl.vertexAttribPointer(2, 2, gl.FLOAT, gl.FALSE, 0, 0);
            gl.enableVertexAttribArray(2);

            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[4]);
            gl.vertexAttribPointer(3, 3, gl.FLOAT, gl.FALSE, 0, 0);
            gl.enableVertexAttribArray(3);
            
            gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[5]);
            gl.vertexAttribPointer(4, 3, gl.FLOAT, gl.FALSE, 0, 0);
            gl.enableVertexAttribArray(4);
        }

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