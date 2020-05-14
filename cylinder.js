import { ObjMesh } from "./objmesh.js";

/**
 * Returns an ObjMesh that represents a cylinder that is centered along the
 * y axis.  The radius of the cylinder is 1.0, and the number of divisions 
 * is determined by the parameter divs.  The cylinder has a disk "cap" on 
 * each end.
 * 
 * See the assignment for details.
 * 
 * @param {Number} divs number of divisions around the cylinder 
 * @returns {ObjMesh} the mesh
 */
export function makeCylinder( divs ) {
    
    const objData = { points: [], normals: [], uvs: [], verts: []};
    
    const delta = Math.PI * 2.0 / divs;
    for( let i = 0; i < divs; i++ ) {
        const angle = i * delta;
        const c = Math.cos(angle);
        const s = Math.sin(angle);
        objData.points.push( [s, -1, c], [s, 1, c] );
        objData.uvs.push( [i / divs, 0], [i / divs, 0.5] );
        objData.normals.push( [s, 0, c] );
    }
    // Add one more UV for the seam
    objData.uvs.push( [1.0, 0], [1.0, 0.5] );

    // Add faces
    const np = divs * 2;
    for( let i = 0; i < divs; i++ ) {
        // Triangle 1
        objData.verts.push( 
            {p: 2*i                 , n: i         , uv: 2*i},
            {p: (2*(i + 1)) % np    , n: (i+1)%divs, uv: 2*(i+1)},
            {p: (2*(i + 1) + 1) % np, n: (i+1)%divs, uv: 2*(i+1)+1},
        );
        // Triangle 2
        objData.verts.push( 
            {p: 2*i               , n: i         , uv: 2*i},
            {p: (2*(i + 1) + 1)%np, n: (i+1)%divs, uv: 2*(i+1)+1},
            {p: (2*i + 1)         , n: i         , uv: 2*i+1},
        );
    }


    // Top 
    let centerIdx = objData.points.length;
    let topStartUv = objData.uvs.length;
    let nIndex = objData.normals.length;

    objData.points.push( [0, 1, 0] );
    objData.normals.push( [0, 1, 0] );
    
    // Add uvs for top
    for( let i = 0; i <= divs; i++ ) {
        const angle = i * delta;
        objData.uvs.push( [0.25 * Math.cos(angle) + 0.75, 0.25 * Math.sin(angle) + 0.75] );
    }
    objData.uvs.push( [0.75, 0.75] );
    let uvCenterIdx = objData.uvs.length - 1;

    for( let i = 0; i < divs; i++ ) {
        objData.verts.push( 
            {p: 2*i + 1           , n: nIndex, uv: topStartUv + i},
            {p: (2*(i+1) + 1) % np, n: nIndex, uv: topStartUv + i + 1},
            {p: centerIdx         , n: nIndex, uv: uvCenterIdx},
        );
    }

    // Bottom
    centerIdx = objData.points.length;
    topStartUv = objData.uvs.length;
    nIndex = objData.normals.length;

    objData.points.push( [0, -1, 0] );
    objData.normals.push( [0, -1, 0] );

    // Add uvs for bottom
    for( let i = 0; i <= divs; i++ ) {
        const angle = i * delta;
        objData.uvs.push( [0.25 * Math.cos(angle) + 0.25, 0.25 * Math.sin(angle) + 0.75] );
    }
    objData.uvs.push( [0.25, 0.75] );
    uvCenterIdx = objData.uvs.length - 1;

    for( let i = 0; i < divs; i++ ) {
        objData.verts.push( 
            {p: 2*i               , n: nIndex, uv: topStartUv + i},
            {p: centerIdx         , n: nIndex, uv: uvCenterIdx},
            {p: (2*(i + 1)) % np  , n: nIndex, uv: topStartUv + i + 1},
        );
    }

    return new ObjMesh(objData);
}