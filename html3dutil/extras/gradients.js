/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under the Unlicense: https://unlicense.org/
*/

/** The <code>extras/gradients.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/gradients.js";
 * // -- or --
 * import * as CustomModuleName from "extras/gradients.js";</pre>
 * @module extras/gradients */

/* global Uint8Array */

import {MathUtil, toGLColor} from "../h3du_module";
/**
 * Generates a 32 &times; 32 pixel image of a linear gradient in the horizontal direction. This function demonstrates generating a custom texture.
 * @param {Array<number>|number|string} color1 A [color vector or string]{@link toGLColor} identifying
 * the color at the left edge of the gradient.
 * @param {Array<number>|number|string} color2 A [color vector or string]{@link toGLColor} identifying
 * the color at the right edge of the gradient.
 * @returns {UInt8Array} An array with 32 &times; 32 &times; 4 bytes, arranged in 32 rows of 32 pixels
 * of 4 bytes each. For each pixel, the four bytes are color components
 * in the following order: red, green, blue, alpha.
 * @function
 */
export function horizontalGradient(color1, color2) {
  color1 = toGLColor(color1);
  color2 = toGLColor(color2);
  const arr = [];
  const size = 32;
  let i;
  for (i = 0; i < size; i++) {
    arr.push(
      MathUtil.vec4scaleInPlace(MathUtil.vec4lerp(color1, color2, i / (size - 1)), 255)
    );
  }
  const gradient = [];
  let y;
  i = 0;
  for (y = 0; y < size; y++) {
    let x;
    for (x = 0; x < size; x++, i += 4) {
      gradient[i] = Math.round(arr[x][0]);
      gradient[i + 1] = Math.round(arr[x][1]);
      gradient[i + 2] = Math.round(arr[x][2]);
      gradient[i + 3] = Math.round(arr[x][3]);
    }
  }
  return new Uint8Array(gradient);
}
/**
 * Generates a 32 &times; 32 pixel image of a radial gradient. This function demonstrates generating a custom texture.
 * @param {Array<number>|number|string} colorCenter A [color vector or string]{@link toGLColor} identifying
 * the color at the center of the gradient.
 * @param {Array<number>|number|string} colorEdges A [color vector or string]{@link toGLColor} identifying
 * the color at the edges of the gradient.
 * @returns {UInt8Array} An array with 32 &times; 32 &times; 4 bytes, arranged in 32 rows of 32 pixels
 * of 4 bytes each. For each pixel, the four bytes are color components
 * in the following order: red, green, blue, alpha.
 * @function
 */
export function radialGradient(colorCenter, colorEdges) {
  colorCenter = toGLColor(colorCenter);
  colorEdges = toGLColor(colorEdges);
  const gradient = [];
  const arr = [];
  const size = 32;
  let i;
  for (i = 0; i < 32; i++) {
    arr.push(
      MathUtil.vec4scaleInPlace(MathUtil.vec4lerp(colorCenter, colorEdges, i / 31), 255)
    );
  }
  const radius = (size - 1) * 0.5;
  const recipradius = 1.0 / radius;
  let y;
  i = 0;
  for (y = 0; y < size; y++) {
    let x;
    for (x = 0; x < size; x++, i += 4) {
      const yy = (y - radius) * recipradius;
      const xx = (x - radius) * recipradius;
      const a = arr[Math.min(31, Math.floor(31 * Math.sqrt(xx * xx + yy * yy)))];
      gradient[i] = Math.round(a[0]);
      gradient[i + 1] = Math.round(a[1]);
      gradient[i + 2] = Math.round(a[2]);
      gradient[i + 3] = Math.round(a[3]);
    }
  }
  return new Uint8Array(gradient);
}

/**
 * Loads an image from data in TGA format.
 * @param {UInt8Array} data Image data in TGA format
 * @returns {UInt8Array} An array with 32 &times; 32 &times; 4 bytes, arranged in 32 rows of 32 pixels
 * of 4 bytes each. For each pixel, the four bytes are color components
 * in the following order: red, green, blue, alpha.
 * @function
 */
export const loadTga = function(data) {
  const view = new DataView(data);
  // NOTE: id is byte 0; cmaptype is byte 1
  const imgtype = view.getUint8(2);
  if(imgtype !== 2 && imgtype !== 3) {
    throw new Error("unsupported image type");
  }
  const xorg = view.getUint16(8, true);
  const yorg = view.getUint16(10, true);
  if(xorg !== 0 || yorg !== 0) {
    throw new Error("unsupported origins");
  }
  const width = view.getUint16(12, true);
  const height = view.getUint16(14, true);
  if(width === 0 || height === 0) {
    throw new Error("invalid width or height");
  }
  const pixelsize = view.getUint8(16);
  if(!(pixelsize === 32 && imgtype === 2) &&
      !(pixelsize === 24 && imgtype === 2) &&
      !(pixelsize === 8 && imgtype === 3)) {
    throw new Error("unsupported pixelsize");
  }
  const size = width * height;
  if(size > data.length) {
    throw new Error("size too big");
  }
  let i;
  const arr = new Uint8Array(size * 4);
  let offset = 18;
  let io = 0;
  if(pixelsize === 32 && imgtype === 2) {
    for(i = 0, io = 0; i < size; i++, io += 4) {
      arr[io + 2] = view.getUint8(offset);
      arr[io + 1] = view.getUint8(offset + 1);
      arr[io] = view.getUint8(offset + 2);
      arr[io + 3] = view.getUint8(offset + 3);
      offset += 4;
    }
  } else if(pixelsize === 24 && imgtype === 2) {
    for(i = 0, io = 0; i < size; i++, io += 4) {
      arr[io + 2] = view.getUint8(offset);
      arr[io + 1] = view.getUint8(offset + 1);
      arr[io] = view.getUint8(offset + 2);
      arr[io + 3] = 0xFF;
      offset += 3;
    }
  } else if(pixelsize === 8 && imgtype === 3) {
    for(i = 0, io = 0; i < size; i++, io += 4) {
      const col = view.getUint8(offset);
      arr[io] = col;
      arr[io + 1] = col;
      arr[io + 2] = col;
      arr[io + 3] = 0xFF;
      offset++;
    }
  }
  return {
    "width":width,
    "height":height,
    "image":arr
  };
};
