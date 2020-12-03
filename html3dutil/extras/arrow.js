/** The <code>extras/arrow.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/arrow.js";
 * // -- or --
 * import * as CustomModuleName from "extras/arrow.js";</pre>
 * @module extras/arrow */

/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under Creative Commons Zero (CC0): http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {MathUtil, Meshes} from "../h3du_module.js";

// Generate a composite mesh representing an arrow
export const createArrow = function(shaftLength, pointerLength, shaftRadius, pointerRadius) {
  const slices = 32;
  // generate the four parts of the arrow
  const shaft = Meshes.createCylinder(shaftRadius, shaftRadius,
    shaftLength, slices);
  const pointer = Meshes.createCylinder(pointerRadius, 0, pointerLength, slices);
  const base = Meshes.createDisk(0, shaftRadius, slices, 1, true);
  const pointerBase = Meshes.createDisk(shaftRadius, pointerRadius, slices, 1, true);
  // move the pointer base to the top of the shaft
  pointerBase.transform(MathUtil.mat4translated(0, 0, shaftLength));
  // move the pointer to the top of the shaft
  pointer.transform(MathUtil.mat4translated(0, 0, shaftLength));
  // merge the four parts of the arrow
  return shaft.merge(base).merge(pointer).merge(pointerBase);
};
/**
 * TODO: Not documented yet.
 * @param {number} shaftLength
 * @param {number} pointerLength
 * @param {number} shaftRadius
 * @param {number} pointerRadius
 * @param {Array<number>|number|string} shaftColor A [color vector or string]{@link toGLColor} specifying the color of the shaft.
 * @param {Array<number>|number|string} pointerColor A [color vector or string]{@link toGLColor} specifying the color of the pointer.
 * @returns {MeshBuffer} A mesh buffer of the resulting shape.
 * @function
 */
export const createMultiColoredArrow = function(shaftLength, pointerLength, shaftRadius, pointerRadius, shaftColor, pointerColor) {
  const slices = 32;
  // generate the four parts of the arrow
  const shaft = Meshes.createCylinder(shaftRadius, shaftRadius,
    shaftLength, slices);
  const pointer = Meshes.createCylinder(pointerRadius, 0, pointerLength, slices);
  const base = Meshes.createDisk(0, shaftRadius, slices, 1, true);
  const pointerBase = Meshes.createDisk(shaftRadius, pointerRadius, slices, 1, true);
  shaft.setColor(shaftColor);
  pointer.setColor(pointerColor);
  base.setColor(shaftColor);
  pointerBase.setColor(pointerColor);
  // move the pointer base to the top of the shaft
  pointerBase.transform(MathUtil.mat4translated(0, 0, shaftLength));
  // move the pointer to the top of the shaft
  pointer.transform(MathUtil.mat4translated(0, 0, shaftLength));
  // merge the four parts of the arrow
  return shaft.merge(base).merge(pointer).merge(pointerBase);
};
