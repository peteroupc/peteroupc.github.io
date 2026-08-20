/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under the Unlicense: https://unlicense.org/
*/

/** The <code>extras/meshes/pathtomesh.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/meshes/pathtomesh.js";
 * // -- or --
 * import * as CustomModuleName from "extras/meshes/pathtomesh.js";</pre>
 * @module extras/meshes/pathtomesh */

import {MathUtil, Meshes} from "../h3du_module.js";
import {GraphicsPath} from "../h3du_path.js";

/**
 * Decomposes this path into triangles and generates a mesh
 * buffer with those triangles. Each triangle's normal will point
 * toward the z-axis, and each triangle vertex's texture coordinates will
 * be the same as that vertex's position.
 * @param {number} [z] The z-coordinate of each triangle generated.
 * If null, undefined, or omitted, default is 0.
 * @param {number} [flatness] When curves and arcs
 * are decomposed to line segments, the
 * segments will be close to the true path of the curve by this
 * value, given in units. If null, undefined, or omitted, default is 1.
 * @returns {*} The resulting mesh buffer.
 * @function
 */
export const toMeshBuffer = function(three, path, z, flatness) {
  if(typeof z === "undefined" || z === null)z = 0;
  const tris = getTriangles(path, flatness);
  const vertices = [];
  let i;
  for (i = 0; i < tris.length; i++) {
    const tri = tris[i];
    // Position X, Y, Z; Normal NX, NY, NZ; texture U, V
    vertices.push(
      tri[0], tri[1], z, 0, 0, 1, tri[0], tri[1],
      tri[2], tri[3], z, 0, 0, 1, tri[2], tri[3],
      tri[4], tri[5], z, 0, 0, 1, tri[4], tri[5]);
  }
  return Meshes.fromPositionsNormalsUV(vertices);
};
/**
 * Generates a mesh buffer consisting of the approximate line segments that make up this graphics path.
 * @param {number} [z] The z-coordinate for each line segment. If null, undefined, or omitted, the default is 0.
 * @param {number} [flatness] When curves and arcs
 * are decomposed to line segments, the
 * segments will be close to the true path of the curve by this
 * value, given in units. If null, undefined, or omitted, default is 1.
 * @returns {*} The resulting mesh buffer.
 * @function
 */
export const toLineMeshBuffer = function(three, z, flatness) {
  if(typeof z === "undefined" || z === null)z = 0;
  const lines = getLines(path, flatness);
  const vertices = [];
  let i;
  for (i = 0; i < lines.length; i++) {
    const line = lines[i];
    vertices.push(line[0], line[1], z,
      line[2], line[3], z);
  }
  return Meshes.fromPositions(three,vertices)
};

function recalcNormals(buffer) {
  buffer.computeVectorNormals();
  return buffer;
}

/**
 * Generates a mesh buffer consisting of "walls" that follow this graphics path approximately, and, optionally, a base and top.
 * @param {number} zStart Starting z-coordinate of the mesh buffer's "walls".
 * @param {number} zEnd Ending z-coordinate of the mesh buffer's "walls".
 * @param {number} [flatness] When curves and arcs
 * are decomposed to line segments, the
 * segments will be close to the true path of the curve by this
 * value, given in units. If null, undefined, or omitted, default is 1.
 * @param {boolean} [closed] If true, the generated mesh buffer will include a base and top. If null, undefined, or omitted, the default is false.
 * @returns {*} The resulting mesh buffer.
 * @function
 */
export const toExtrudedMeshBuffer = function(three, zStart, zEnd, flatness, closed) {
  if((typeof zStart === "undefined" || zStart === null) || zEnd === null)throw new Error();
  const isclosed = typeof closed === "undefined" || closed === null ? false : closed;
  if(isclosed) {
    return three.BufferGeometryUtils.merge([
     toExtrudedMeshBuffer(three,path, zStart, zEnd, flatness, false),
     toMeshBuffer(three,path, zEnd, flatness),
     Meshes.reverseWinding(toMeshBuffer(three,path, zStart, flatness)).reverseNormals()],0)
  }
  const lines = this.getLines(flatness);
  const z1 = Math.min(zStart, zEnd);
  const z2 = Math.max(zStart, zEnd);
  const vertices = [];
  let i;
  for (i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dx = line[2] - line[0];
    const dy = line[3] - line[1];
    const dot = dx * dx + dy * dy;
    if(dot === 0)continue;
    vertices.push(line[0], line[1], z1,
      line[2], line[3], z1,
      line[0], line[1], z2,
      line[2], line[3], z1,
      line[2], line[3], z2,
      line[0], line[1], z2);
  }
  return recalcNormals(MeshBuffer.fromPositions(three,vertices));
};
