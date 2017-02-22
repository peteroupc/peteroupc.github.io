/* global H3DU */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
/* exported createSkysphere */
function createSkysphere(size, texture) {
  "use strict";
  var fragment = "";
  if(texture instanceof H3DU.CubeMap) {
    fragment = ["precision mediump float;",
      "varying vec4 positionVar;",
      "uniform samplerCube texture;",
      "void main() {",
      " vec3 pos=normalize(positionVar.xyz);",
      " pos.x=-pos.x;",
      " gl_FragColor=textureCube(texture,pos);",
      "}"
    ].join("\n");
  } else {
    fragment = ["precision mediump float;",
      "#define ONE_DIV_PI 0.318309886",
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
    ].join("\n");
  }
  var shader = new H3DU.ShaderInfo(
 ["attribute vec3 position;",
   "uniform mat4 projection;",
   "uniform mat4 worldMatrix;",
   "uniform mat4 modelViewMatrix;",
   "varying vec4 positionVar;",
   "void main() {",
   "positionVar=worldMatrix*vec4(position,1.0);",
   "gl_Position=(projection*modelViewMatrix)*vec4(position,1.0);",
   "}"
 ].join("\n"), fragment
);
  shader.setUniformSemantic("worldMatrix", H3DU.Semantic.MODEL);
  return new H3DU.Shape(H3DU.Meshes.createSphere(size))
  .setTexture(texture)
  .setShader(shader);
}
