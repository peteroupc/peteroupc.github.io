/* global Uint8Array */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {MathUtil, toGLColor} from "../h3du_module";
/**
 * Generates a 32x32 bitmap of a linear gradient in the horizontal direction. This function demonstrates generating a custom texture.
 * @param {Array<number>|number|string} color1 A [color vector or string]{@link toGLColor} identifying
 * the color at the left edge of the gradient.
 * @param {Array<number>|number|string} color2 A [color vector or string]{@link toGLColor} identifying
 * the color at the right edge of the gradient.
 * @returns {UInt8Array} An array with 32x32x4 bytes, arranged in 32 rows of 32 pixels
 * of 4 bytes each. For each pixel, the four bytes are color components
 * in the following order: red, green, blue, alpha.
 * @function
 */
export function horizontalGradient(color1, color2) {
  color1 = toGLColor(color1);
  color2 = toGLColor(color2);
  var arr = [];
  var size = 32;
  for(var i = 0; i < size; i++) {
    arr.push(
      MathUtil.vec4scaleInPlace(MathUtil.vec4lerp(color1, color2, i / (size - 1)), 255)
    );
  }
  var gradient = [];
  i = 0;
  for(var y = 0; y < size; y++) {
    for(var x = 0; x < size; x++, i += 4) {
      gradient[i] = Math.round(arr[x][0]);
      gradient[i + 1] = Math.round(arr[x][1]);
      gradient[i + 2] = Math.round(arr[x][2]);
      gradient[i + 3] = Math.round(arr[x][3]);
    }
  }
  return new Uint8Array(gradient);
}
/**
 * Generates a 32x32 bitmap of a radial gradient. This function demonstrates generating a custom texture.
 * @param {Array<number>|number|string} colorCenter A [color vector or string]{@link toGLColor} identifying
 * the color at the center of the gradient.
 * @param {Array<number>|number|string} colorEdges A [color vector or string]{@link toGLColor} identifying
 * the color at the edges of the gradient.
 * @returns {UInt8Array} An array with 32x32x4 bytes, arranged in 32 rows of 32 pixels
 * of 4 bytes each. For each pixel, the four bytes are color components
 * in the following order: red, green, blue, alpha.
 * @function
 */
export function radialGradient(colorCenter, colorEdges) {
  colorCenter = toGLColor(colorCenter);
  colorEdges = toGLColor(colorEdges);
  var gradient = [];
  var arr = [];
  var size = 32;
  for(var i = 0; i < 32; i++) {
    arr.push(
      MathUtil.vec4scaleInPlace(MathUtil.vec4lerp(colorCenter, colorEdges, i / 31), 255)
    );
  }
  i = 0;
  var radius = (size - 1) * 0.5;
  var recipradius = 1.0 / radius;
  for (var y = 0; y < size; y++) {
    for (var x = 0; x < size; x++, i += 4) {
      var yy = (y - radius) * recipradius;
      var xx = (x - radius) * recipradius;
      var a = arr[Math.min(31, Math.floor(31 * Math.sqrt(xx * xx + yy * yy)))];
      gradient[i] = Math.round(a[0]);
      gradient[i + 1] = Math.round(a[1]);
      gradient[i + 2] = Math.round(a[2]);
      gradient[i + 3] = Math.round(a[3]);
    }
  }
  return new Uint8Array(gradient);
}
