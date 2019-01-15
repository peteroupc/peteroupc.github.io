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
 * TODO: Not documented yet.
 * @param {*} color1
 * @param {*} color2
 * @returns {*}
 */
export function horizontalGradient(color1, color2) {
// Generates a linear gradient in the horizontal direction.
// This function demonstrates generating a custom texture.
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
 * TODO: Not documented yet.
 * @param {*} colorCenter
 * @param {*} colorEdges
 * @returns {*}
 */
export function radialGradient(colorCenter, colorEdges) {
// Generates a radial gradient
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
