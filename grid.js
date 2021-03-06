/**
 * A constructor for an object that can be used to draw a reference grid.
 * The grid is drawn in the x-z plane, with the given size and divisions.
 * It can be drawn by calling the render function.
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {Number} size the length of each side of the grid 
 * @param {Number} divs the number of divisions of the grid in each dimension
 * @param {Float32Array or vec3} color the color to draw the grid.
 */
export class Grid {
    constructor( gl, size = 10, divs = 20, color = [0.3,0.3,0.3] ) {
        divs = Math.round(divs);
        if( divs <= 0 ) throw new Error("Invalid number of divisions: " + divs);
        if( divs % 2 != 0 ) divs += 1;  // Make it even
        this.color = color;

        var w2 = size / 2.0;
        var divSize = size / divs;
        var pos = [], norm = [];
        for( var i = 0; i <= divs; i++ ) {
            var x = divSize * i - w2;
            if( i === divs / 2 ) pos.push(x, 0.0, 0.0);
            else pos.push(x, 0.0, w2);
            norm.push(0, 1, 0);
            pos.push(x, 0.0, -w2);
            norm.push(0, 1, 0);
        }
        for( var i = 0; i <= divs; i++ ) {
            var z = divSize * i - w2;
            pos.push(-w2, 0.0, z);
            norm.push(0, 1, 0);
            if( i === divs / 2 ) pos.push(0.0, 0.0, z);
            else pos.push(w2, 0.0, z);
            norm.push(0, 1, 0);
        }

        // X - axis
        pos.push(0,0,0);
        norm.push(0,1,0);
        pos.push(w2,0,0);
        norm.push(0,1,0);

        // Z - axis
        pos.push(0,0,0);
        norm.push(0,1,0);
        pos.push(0,0,w2);
        norm.push(0,1,0);

        this.nVerts = pos.length / 3;
        this.buffers = [];

        // Position buffer
        this.buffers[0] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(pos), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null); // done with this buffer

        // Normal buffer
        this.buffers[1] = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
        gl.bufferData(gl.ARRAY_BUFFER, Float32Array.from(norm), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null); // done with this buffer

        // Setup VAO
        this.vao = gl.createVertexArray();
        gl.bindVertexArray(this.vao);

        // Set up the position pointer.  The position is bound to vertex attribute 0.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
        gl.vertexAttribPointer(0, 3, gl.FLOAT, gl.FALSE, 0, 0);
        gl.enableVertexAttribArray(0);

        // Set up the normal pointer.  The normal is bound to vertex attribute 1.
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[1]);
        gl.vertexAttribPointer(1, 3, gl.FLOAT, gl.FALSE, 0, 0);
        gl.enableVertexAttribArray(1);

        gl.bindVertexArray(null); // Done with this VAO
    }

    /**
     * Draws the grid.
     * @param {WebGL2RenderingContext} gl 
     * @param {Object} uni the location of all of the shader's uniform variables
     */
    render(gl, shader) {
        gl.uniform3fv(shader.uniform('uColor'), this.color);
        gl.bindVertexArray(this.vao);
        gl.drawArrays(gl.LINES, 0, this.nVerts - 4);
        
        // X axis
        gl.uniform3f(shader.uniform('uColor'), 1,0,0);
        gl.drawArrays(gl.LINES, this.nVerts - 4, 2);

        // Z axis
        gl.uniform3f(shader.uniform('uColor'), 0,0,1);
        gl.drawArrays(gl.LINES, this.nVerts - 2, 2);
        
        gl.bindVertexArray(null);
    }

    /**
     * Deletes all of the vertex data in WebGL memory for this object.  This invalidates the
     * vertex arrays, and the object can no longer be drawn.
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