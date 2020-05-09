import {ObjMesh} from './objmesh.js';
import {Aabb} from './aabb.js';

/**
 * Loads data from an obj file, and returns an ObjMesh object.
 * 
 * @param {String} text the contents of the obj file.
 * @returns {ObjMesh} the ObjMesh
 */
export function loadObjMesh(text) {
    const lines = text.split(/\r?\n/);

    // The mesh data
    const objData = { points: [], normals: [], uvs: [], verts: [], bbox: new Aabb() };

    for(let lineNum = 0; lineNum < lines.length; lineNum++) {
        let line = lines[lineNum];

        // Remove comments
        let commentLoc = line.indexOf("#");
        if( commentLoc >= 0 ) {
            line = line.substr(0, commentLoc);
        }
        line = line.trim();

        if( line.length > 0 ) {
            let parts = line.split(/\s+/);
            let command = parts[0];
            parts.shift();

            if (command === "v") {
                let x = parseFloat(parts[0]), y = parseFloat(parts[1]), z = parseFloat(parts[2]);
                objData.bbox.add(x,y,z);
                objData.points.push([x, y, z]);
            } else if (command ===  "vn") {
                objData.normals.push( [parseFloat(parts[0]), parseFloat(parts[1]), parseFloat(parts[2])] );
            } else if (command === "vt") {
                objData.uvs.push( [parseFloat(parts[0]), parseFloat(parts[1])] );
            } else if (command === "f") {
                let startVert = parseVertex(parts[0], objData);
                for (let i = 2; i < parts.length; i++) {  // Triangulate
                    objData.verts.push(startVert);
                    let v1 = parseVertex(parts[i-1], objData);
                    objData.verts.push(v1);
                    let v2 = parseVertex(parts[i], objData);
                    objData.verts.push(v2);
                }
            }
        }
    }

    // The ObjMesh
    if( objData.normals.length === 0 ) delete objData.normals;
    if( objData.uvs.length === 0 ) delete objData.uvs;
    const mesh = new ObjMesh(objData);
    return mesh;
}

/**
 * (Private function) Parses a face vertex string.
 * 
 * @param {String} str the face vertex string
 * @param {Number} nPts the number of points read so far
 * @returns {Object} contains the indices of the position, normal, and
 *       texture coordinate as properties pIdx, nIdx and tcIdx.
 */
function parseVertex(str, mesh) {
    const vertParts = str.split(/\//);
    const result = {};
    
    let pIdx = parseInt(vertParts[0]);
    if( pIdx < 0 ) pIdx = mesh.points.length + pIdx;
    else pIdx = pIdx - 1;
    result.p = pIdx;
    
    if( vertParts.length > 1 ) {
        if(vertParts[1].length > 0 ) {
            let tcIdx = parseInt(vertParts[1]);
            if(tcIdx < 0 ) tcIdx = mesh.uvs.length + tcIdx;
            else tcIdx = tcIdx - 1;
            result.uv = tcIdx;
        }
    }
    if( vertParts.length === 3 ) {
        let nIdx = parseInt(vertParts[2]);
        if( nIdx < 0 ) nIdx = mesh.normals.length + nIdx;
        else nIdx = nIdx - 1;
        result.n = nIdx;
    }

    return result;
}
