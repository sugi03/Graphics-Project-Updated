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