/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

export var skySphereShader = {
  "vertexShader":["varying vec4 positionVar;",
    "void main() {",
    "positionVar=worldMatrix*vec4(position,1.0);",
    "gl_Position=(projectionMatrix*modelViewMatrix)*vec4(position,1.0);",
    "}"
  ].join("\n"),
  "fragmentShader":["#define ONE_DIV_PI 0.318309886",
    "#define ONE_DIV_TWOPI 0.159154943",
    "#define PI 3.141592654",
    "varying vec4 positionVar;",
    "uniform sampler2D texture;",
    "void main() {",
    " vec3 pos=normalize(positionVar.xyz);",
    " pos.x=-pos.x;",
    " gl_FragColor=texture2D(texture,vec2(",
    "  (atan(pos.x,pos.z)+PI)*ONE_DIV_TWOPI, acos(clamp(-pos.y,-1.0,1.0))*ONE_DIV_PI ));",
    "}"
  ].join("\n"),
  "uniform":{"texture":@param {boolean|@param {boolean|null}
};
export var skySphereCubeMapShader = {
  "vertexShader":["varying vec4 positionVar;",
    "void main() {",
    "positionVar=worldMatrix*vec4(position,1.0);",
    "gl_Position=(projectionMatrix*modelViewMatrix)*vec4(position,1.0);",
    "}"
  ].join("\n"),
  "fragmentShader":["varying vec4 positionVar;",
    "uniform samplerCube texture;",
    "void main() {",
    " vec3 pos=normalize(positionVar.xyz);",
    " pos.x=-pos.x;",
    " gl_FragColor=textureCube(texture,pos);",
    "}"
  ].join("\n"),
  "uniform":{"texture":@param {boolean|@param {boolean|null}
};
