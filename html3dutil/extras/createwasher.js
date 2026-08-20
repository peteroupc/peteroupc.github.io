/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under the Unlicense: https://unlicense.org/
*/

/** The <code>extras/createwasher.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/createwasher.js";
 * // -- or --
 * import * as CustomModuleName from "extras/createwasher.js";</pre>
 * @module extras/createwasher */

import {MathUtil, Meshes} from "../h3du-module.js";

function matTo4D(three, mat) {
var r=new three["Matrix4"]()
r.set(mat[0],mat[4],mat[8],mat[12],
      mat[1],mat[5],mat[9],mat[13],
      mat[2],mat[6],mat[10],mat[14],
      mat[3],mat[7],mat[11],mat[15])
return r
}

/**
 * TODO: Not documented yet.
 * @param {*} inner
 * @param {*} outer
 * @param {*} height
 * @param {*} slices
 * @returns {*} Return value.
 * @function
 */
export const createWasher = function(three,inner, outer, height, slices) {
  const innerCylinder = Meshes.createCylinder(three,inner, inner, height, slices, 1, false, true);
  const outerCylinder = Meshes.createCylinder(three,outer, outer, height, slices, 1, false, false);
  const base = Meshes.reverseWinding(Meshes.createDisk(three,inner, outer, slices, 2, true));
  const top = Meshes.createDisk(three,inner, outer, slices, 2, false);
  // move the top disk to the top of the cylinder
  top["applyMatrix4"](matTo4D(MathUtil.mat4translated(0, 0, height)));
  // merge the base and the top
  return three["BufferGeometryUtils"]["mergeGeometries"]([innerCylinder,outerCylinder,base,top],false);
};
