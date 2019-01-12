/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

export var colorMatrixShader = {
  "vertexShader":["varying vec2 uvCoord;",
    "void main() {",
    "uvCoord=uv;",
    "gl_Position=(projectionMatrix*modelViewMatrix)*vec4(position,1.0);",
    "}"
  ].join("\n"),
  "fragmentShader":[
    "varying vec2 uvCoord;",
    "uniform mat4 colorMatrix;",
    "uniform float t;", // ranges from 0 to 1
    "#define tolinear(c) pow(c, vec3(2.2))",
    "#define fromlinear(c) pow(c, vec3(0.45454545))",
    "uniform sampler2D sampler;",
    "void main() {",
    " vec4 tex=texture2D(sampler,uvCoord);",
    " vec3 texRgb=tolinear(tex.rgb);",
    " vec4 color=colorMatrix*vec4(texRgb,1.0);",
    " vec3 colorRgb=mix(texRgb,color.rgb/color.a,t);",
    " colorRgb=fromlinear(colorRgb);",
    " vec4 c=vec4(clamp(colorRgb,0.0,1.0),tex.a);",
    " gl_FragColor=c;",
    "}"
  ].join("\n"),
  "uniform":{
    "sampler":null,
    "t":1,
    "colorMatrix":[1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  }
};
/**
 * TODO: Not documented yet.
 * @param {*} kind
 * @returns {*} Return value.
 */
export var getColorMatrix = function(kind) {
  if(kind === "grayscale") {
    return [
      1 / 3, 1 / 3, 1 / 3, 0,
      1 / 3, 1 / 3, 1 / 3, 0,
      1 / 3, 1 / 3, 1 / 3, 0,
      0, 0, 0, 1
    ];
  } else if(kind === "boosted-red") {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0.3, 0, 0, 1
    ];
  } else if(kind === "boosted-blue") {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0.3, 1
    ];
  } else if(kind === "sepia") {
    return [0.207, 0.212, 0.16, 0,
      0.696, 0.712, 0.538, 0,
      0.07, 0.072, 0.054, 0,
      0, 0, 0, 1];
  } else if(kind === "sepia2") {
    return [0.299, 0.2841, 0.2452, 0,
      0.587, 0.5577, 0.4813, 0,
      0.114, 0.1083, 0.0935, 0,
      0, 0, 0, 1];
  } else if(kind === "invert") {
    return [-1, 0, 0, 0,
      0, -1, 0, 0,
      0, 0, -1, 0,
      1, 1, 1, 1];
  }
};
