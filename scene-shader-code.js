export const SCENE_VERT_CODE=`#version 300 es
layout(location=0) in vec3 vPosition;
layout(location=1) in vec3 vNormal;
layout(location=2) in vec2 vUv;

uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProj;

//output variables
out vec2 fUv;
out vec3 fNormal;
out vec3 fPosition;

void main(){

    mat4 modelAndView = uView * uModel; //eye space

    fPosition = (modelAndView * vec4(vPosition, 1.0)).xyz; //Pass camera coordinates (x,y,z) to the fragment shader

    fUv = vUv; //Pass the uv's coordinates to the fragment shader
    
    fNormal = normalize(mat3(modelAndView) * vNormal); //Pass the normal
    
    gl_Position = uProj * vec4(fPosition, 1.0); //This is the position in clip coordinates
}`;

export const SCENE_FRAG_CODE=`#version 300 es
precision highp float;

//input variables
in vec2 fUv;
in vec3 fNormal;
in vec3 fPosition;

out vec4 fragColor;
uniform vec3 uColor;
uniform vec3 diffuseLight;
uniform vec3 lightPos;
uniform vec3 lightColor;

void main() {
    vec3 n = normalize(fNormal); //unit normal at the surface
    vec3 eyeSpace = normalize(fPosition);

    vec3 lightDirection = normalize(lightPos - eyeSpace); //distance of the light vector - eye space

    float nDotLight = max(dot(lightDirection, n), 0.0); //dot product of the light direction and surface normal

    vec3 diffuse = lightColor * uColor * nDotLight;

    fragColor = vec4(diffuse, 1.0);
}`;