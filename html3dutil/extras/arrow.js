/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {H3DU} from "../h3du_min";

// Generate a composite mesh representing an arrow
H3DU.Meshes.createArrow = function(shaftLength, pointerLength, shaftRadius, pointerRadius) {
  var slices = 32;
 // generate the four parts of the arrow
  var shaft = H3DU.Meshes.createCylinder(shaftRadius, shaftRadius,
   shaftLength, slices);
  var pointer = H3DU.Meshes.createCylinder(pointerRadius, 0, pointerLength, slices);
  var base = H3DU.Meshes.createDisk(0, shaftRadius, slices, 1, true);
  var pointerBase = H3DU.Meshes.createDisk(shaftRadius, pointerRadius, slices, 1, true);
 // move the pointer base to the top of the shaft
  pointerBase.transform(H3DU.Math.mat4translated(0, 0, shaftLength));
 // move the pointer to the top of the shaft
  pointer.transform(H3DU.Math.mat4translated(0, 0, shaftLength));
 // merge the four parts of the arrow
  return shaft.merge(base).merge(pointer).merge(pointerBase);
};
/**
 * TODO: Not documented yet.
 * @param {*} shaftLength
 * @param {*} pointerLength
 * @param {*} shaftRadius
 * @param {*} pointerRadius
 * @param {*} shaftColor
 * @param {*} pointerColor
 * @returns {*} Return value.
 */
H3DU.Meshes.createMultiColoredArrow = function(shaftLength, pointerLength, shaftRadius, pointerRadius, shaftColor, pointerColor) {
  var slices = 32;
 // generate the four parts of the arrow
  var shaft = H3DU.Meshes.createCylinder(shaftRadius, shaftRadius,
   shaftLength, slices);
  var pointer = H3DU.Meshes.createCylinder(pointerRadius, 0, pointerLength, slices);
  var base = H3DU.Meshes.createDisk(0, shaftRadius, slices, 1, true);
  var pointerBase = H3DU.Meshes.createDisk(shaftRadius, pointerRadius, slices, 1, true);
  shaft.setColor(shaftColor);
  pointer.setColor(pointerColor);
  base.setColor(shaftColor);
  pointerBase.setColor(pointerColor);
 // move the pointer base to the top of the shaft
  pointerBase.transform(H3DU.Math.mat4translated(0, 0, shaftLength));
 // move the pointer to the top of the shaft
  pointer.transform(H3DU.Math.mat4translated(0, 0, shaftLength));
 // merge the four parts of the arrow
  return shaft.merge(base).merge(pointer).merge(pointerBase);
};
