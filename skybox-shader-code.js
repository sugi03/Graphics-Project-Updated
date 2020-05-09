export const VERT_CODE=`#version 300 es
layout(location=0) in vec3 vPosition;
layout(location=1) in vec3 vNormal;
layout(location=2) in vec2 vUv;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProj;

//output variables
out vec3 fPosition;

void main() {
    // TODO: Part 2 - compute gl_Position, as well as any output variables for
    //       the fragment shader.

    mat4 modelAndView = uModel; //eye space

    //Pass camera coordinates (x,y,z) to the fragment shader
    fPosition = (modelAndView * vec4(vPosition, 1.0)).xyz;

    //This is the position in clip coordinates
    gl_Position = uProj * uView * vec4(fPosition, 1.0);
}`;

export const FRAG_CODE=`#version 300 es
precision highp float;

//input variables
in vec3 fPosition;

uniform samplerCube cube_texture;

out vec4 fragColor;

void main() {
    // TODO: Apply a vector of the uv's
    vec3 vertex = normalize(fPosition); //unit on the face of the cubemap 
    
    fragColor = texture(cube_texture, vertex);  //apply the texture(cube_texture) to the face direction
}`;