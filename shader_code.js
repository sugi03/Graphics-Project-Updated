export const FLAT_VERT = `#version 300 es
layout(location=0) in vec4 vPosition;
layout(location=1) in vec3 vNormal;
layout(location=2) in vec2 vUv;

out vec2 fUv;

uniform mat4 uModel;  // Object to world
uniform mat4 uView;   // World to camera
uniform mat4 uProj;   // Projection matrix

void main() {
    fUv = vUv;

    // Convert position to clip coordinates
    gl_Position = uProj * uView * uModel * vPosition;
}`;

export const FLAT_FRAG = `#version 300 es
precision mediump float;

out vec4 fragColor;
uniform vec3 uColor;

in vec2 fUv;

void main() {
    vec4 color = vec4(uColor,1);
    if( gl_FrontFacing ) fragColor = color;
    else fragColor = vec4(1,0,0,1);
}`;

export const FLAT_WIRE_VERT = `#version 300 es
layout(location=0) in vec4 vPosition;
layout(location=1) in vec3 vNormal;
layout(location=2) in vec2 vUv;
layout(location=3) in vec2 vBary;

out vec2 fBary;
out vec2 fUv;

uniform mat4 uModel;  // Object to world
uniform mat4 uView;   // World to camera
uniform mat4 uProj;   // Projection matrix

void main() {
    // Convert position to clip coordinates
    gl_Position = uProj * uView * uModel * vPosition;
    fUv = vUv;
    fBary = vBary;
}`;

export const FLAT_WIRE_FRAG = `#version 300 es
precision highp float;

in vec2 fBary;

out vec4 fragColor;
uniform vec3 uColor;
uniform vec3 uEdgeColor;

in vec2 fUv;

// This algorithm is from:  https://github.com/rreusser/glsl-solid-wireframe

float gridFactor (vec2 vBC, float width) {
    vec3 bary = vec3(vBC.x, vBC.y, 1.0 - vBC.x - vBC.y);
    vec3 d = fwidth(bary);
    vec3 a3 = smoothstep(d * (width - 0.5), d * (width + 0.5), bary);
    return min(min(a3.x, a3.y), a3.z);
}
  
void main() {
    vec3 color = vec3(1,0,0);
    if( gl_FrontFacing ) {
        color = uColor;
    }
    float gf = gridFactor(fBary, 0.75);
    fragColor = vec4( mix(uEdgeColor, color, gf), 1);
}`;
