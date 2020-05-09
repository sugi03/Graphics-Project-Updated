import {ObjMesh} from './objmesh.js';

/**
 * Returns an ObjMesh object that is centered at the origin with given side length.
 * 
 * @param {Number} sideLength the length of a side of the cube
 * @returns {ObjMesh} the mesh
 */
export function makeCube( sideLength = 1.0 ) {
    const sl2 = sideLength / 2.0;

    const objData = {
        points: [
            [-sl2, -sl2, sl2], [sl2, -sl2, sl2], [sl2, sl2, sl2], [-sl2, sl2, sl2],
            [-sl2, -sl2, -sl2], [sl2, -sl2, -sl2], [sl2, sl2, -sl2], [-sl2, sl2, -sl2],
        ],
        normals: [
            [0, 0, 1], [1, 0, 0], [0, 0, -1], [-1, 0, 0], [0, 1, 0], [0, -1, 0]
        ],
        uvs: [
            [0, 0], [1, 0], [1, 1], [0, 1],
        ],

        verts: [
            // Front face
            {p: 0, n: 0, uv: 0}, {p: 1, n: 0, uv: 1}, {p: 2, n: 0, uv: 2}, 
            {p: 0, n: 0, uv: 0}, {p: 2, n: 0, uv: 2}, {p: 3, n: 0, uv: 3},
            // Right face
            {p: 1, n: 1, uv: 0}, {p: 5, n: 1, uv: 1}, {p: 6, n: 1, uv: 2}, 
            {p: 1, n: 1, uv: 0}, {p: 6, n: 1, uv: 2}, {p: 2, n: 1, uv: 3}, 
            // Back face
            {p: 5, n: 2, uv: 0}, {p: 4, n: 2, uv: 1}, {p: 7, n: 2, uv: 2}, 
            {p: 5, n: 2, uv: 0}, {p: 7, n: 2, uv: 2}, {p: 6, n: 2, uv: 3}, 
            // Left face
            {p: 4, n: 3, uv: 0}, {p: 0, n: 3, uv: 1}, {p: 3, n: 3, uv: 2}, 
            {p: 4, n: 3, uv: 0}, {p: 3, n: 3, uv: 2}, {p: 7, n: 3, uv: 3}, 
            // Top face
            {p: 3, n: 4, uv: 0}, {p: 2, n: 4, uv: 1}, {p: 6, n: 4, uv: 2}, 
            {p: 3, n: 4, uv: 0}, {p: 6, n: 4, uv: 2}, {p: 7, n: 4, uv: 3}, 
            // Bottom face
            {p: 4, n: 5, uv: 0}, {p: 5, n: 5, uv: 1}, {p: 1, n: 5, uv: 2}, 
            {p: 4, n: 5, uv: 0}, {p: 1, n: 5, uv: 2}, {p: 0, n: 5, uv: 3}, 
        ],
    };

    return new ObjMesh(objData);
}