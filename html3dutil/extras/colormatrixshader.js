/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

/**
 * GLSL shader data for a family of image processing filters, which modify colors based on a transformation matrix, a 4x4 matrix that is multiplied by the red/green/blue color to get a new color. The shader program takes three uniforms: "sampler", which
 * is the input texture, "t", a value from 0 to 1 indicating how strongly to
 * apply the color matrix, and "matrix", which is the 4x4 matrix just described.
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
 * Gets a specific kind of color matrix for the color
 * matrix shader.
 * @param {string} kind One of the following:<ul>
 * <li>"grayscale" - Filter that averages the red, green,
 * and blue components to result in black, white, or a
 * shade of gray.
 * <li>"boosted-red" - Filter that boosts the red component
 * of the input.
 * <li>"boosted-blue" - Filter that boosts the blue component
 * of the input.
 * <li>"sepia" or "sepia2" - One of two filters that adjust the colors of the
 * image to achieve a sepia coloring.
 * <li>"invert" - Filter that inverts the colors of the input so the effect looks like a film negative.
 * </ul>
 * @returns {Array<number>} 4x4 color matrix.
 * @function
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
