export const SQUARE_VERT_CODE=`#version 300 es
layout(location=0) in vec3 vPosition;
layout(location=1) in vec3 vNormal;
layout(location=2) in vec2 vUv;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;

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

    gl_Position = uProjection * vec4(fPosition, 1.0);
}`;

export const SQUARE_FRAG_CODE=`#version 300 es
precision highp float;


// TODO: Part 1 - declare any input variables here
in vec2 fUv;
in vec3 fNormal;
in vec3 fPosition; 

uniform sampler2D square_texture;

out vec4 fragColor;

void main() 
{
    vec3 diffuseReflectance = texture(square_texture, fUv).rgb; 
    fragColor = vec4(diffuseReflectance, 1.0);
    //fragColor = vec4(to_sRGB(summed * exposure), 1.0);  

}`;