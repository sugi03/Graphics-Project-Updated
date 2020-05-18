export const URANUS_VERT_CODE=`#version 300 es
layout(location=0) in vec3 vPosition;
layout(location=1) in vec3 vNormal;
layout(location=2) in vec2 vUv;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProj;

// TODO: Part 1 - declare any output variables here
out vec2 fUv;
out vec3 fNormal;
out vec3 fPosition;
void main() 
{
    mat4 mv = uView * uModel;
    fPosition = (mv * vec4(vPosition, 1.0)).xyz;
    
    fNormal = normalize( mat3(mv) * vNormal );
    fUv = vUv;
    gl_Position = uProj * vec4(fPosition, 1.0);
}`;

export const URANUS_FRAG_CODE=`#version 300 es
precision highp float;
in vec2 fUv;
in vec3 fNormal;
in vec3 fPosition; 

uniform sampler2D uranus_texture;

out vec4 fragColor;

void main() 
{
    vec3 planetTexture = texture(uranus_texture, fUv).rgb;

    fragColor = vec4(planetTexture, 1.0); 
}`;