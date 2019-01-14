/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {MathUtil, Meshes} from "../h3du-module.js";
/**
 * TODO: Not documented yet.
 * @param {*} inner
 * @param {*} outer
 * @param {*} height
 * @param {*} slices
 * @returns {*} Return value.
 * @function
 */
export var createWasher = function(inner, outer, height, slices) {
  var innerCylinder = Meshes.createCylinder(inner, inner, height, slices, 1, false, true);
  var outerCylinder = Meshes.createCylinder(outer, outer, height, slices, 1, false, false);
  var base = Meshes.createDisk(inner, outer, slices, 2, true).reverseWinding();
  var top = Meshes.createDisk(inner, outer, slices, 2, false);
  // move the top disk to the top of the cylinder
  top.transform(MathUtil.mat4translated(0, 0, height));
  // merge the base and the top
  return innerCylinder.merge(outerCylinder).merge(base).merge(top);
};
