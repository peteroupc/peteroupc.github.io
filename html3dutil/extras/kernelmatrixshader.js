/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

export var kernelMatrixShader = {
  "vertexShader":["varying vec2 uvCoord;",
    "void main() {",
    "uvCoord=uv;",
    "gl_Position=(projectionMatrix*modelViewMatrix)*vec4(position,1.0);",
    "}"
  ].join("\n"),
  "fragmentShader":[
    "varying vec2 uvCoord;",
    "uniform sampler2D sampler;",
    "uniform mat3 matrix;",
    "vec2 textureSize;",
    "void main() {",
    " vec2 pixel=1.0/textureSize;",
    " vec2 xy0=uvCoord-pixel;",
    " xy0=vec2(max(xy0.x,0.0),max(xy0.y,0.0));",
    " vec2 xy1=uvCoord;",
    " vec2 xy2=uvCoord+pixel;",
    " xy2=vec2(min(xy2.x,1.0),min(xy2.y,1.0));",
    " vec4 mainColor=texture2D(sampler,uvCoord);",
    // NOTE: Assumes row-major matrices; e.g. [0][0] means
    // index 0, and [0][1] means index 1
    " vec4 x0y0=texture2D(sampler,xy0)*matrix[0][0];",
    " vec4 x1y0=texture2D(sampler,vec2(xy1.x,xy0.y))*matrix[0][1];",
    " vec4 x2y0=texture2D(sampler,vec2(xy2.x,xy0.y))*matrix[0][2];",
    " vec4 x0y1=texture2D(sampler,vec2(xy0.x,xy1.y))*matrix[1][0];",
    " vec4 x1y1=mainColor*matrix[1][1];",
    " vec4 x2y1=texture2D(sampler,vec2(xy2.x,xy1.y))*matrix[1][2];",
    " vec4 x0y2=texture2D(sampler,vec2(xy0.x,xy2.y))*matrix[2][0];",
    " vec4 x1y2=texture2D(sampler,vec2(xy1.x,xy2.y))*matrix[2][1];",
    " vec4 x2y2=texture2D(sampler,xy2)*matrix[2][2];",
    " vec4 color=x0y0+x1y0+x2y0+x0y1+x1y1+x2y1+x0y2+x1y2+x2y2;",
    " gl_FragColor= vec4(color.rgb,mainColor.a);",
    "}"
  ].join("\n"),
  "uniform":{
    "sampler":null,
    "textureSize":[0, 0],
    "matrix":[0, 0, 0, 0, 1, 0, 0, 0, 0]
  }
};
/**
 * TODO: Not documented yet.
 * @param {*} kind
 * @returns {*} Return value.
 */
export var getKernelMatrix = function(kind) {
  if(kind === "blue") {
    return [1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9, 1 / 9];
  } else if(kind === "edge-detect") {
    return [0, 1, 0, 1, -4, 1, 0, 1, 0];
  }
};
/**
 * TODO: Not documented yet.
 * @param {*} matrix
 * @returns {*} Return value.
 */
export var normalizeKernelInPlace = function(matrix) {
  var weight = matrix[0] + matrix[1] + matrix[2] +
   matrix[3] + matrix[4] + matrix[5] + matrix[6] +
   matrix[7] + matrix[8];
  if(weight > 0) {
    for(var i = 0; i < 9; i++) {
      matrix[i] /= weight;
    }
  }
  return matrix;
};
