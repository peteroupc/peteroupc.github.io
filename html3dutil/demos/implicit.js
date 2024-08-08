/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under the Unlicense: https://unlicense.org/
*/
/* global H3DU */
// TODO: Convert this code to use MeshBuffer instead of Mesh
// The following was adapted by Peter O. from public-domain
// source code by Cory Gene Bloyd.

/**
 * An evaluator for implicit surfaces.
 * @param {Object} func A <b>sampling object</b>. This object contains a single property,
 * "sample", which is a function that takes three parameters
 * specifying a 3-dimensional point:<ol>
 * <li>x - An X coordinate.
 * <li>y - A Y coordinate.
 * <li>z - A Z coordinate.</ol>
 * and returns a number. If the implicit surface function returns 0, that
 * means the point lies on the surface.
 * @example <caption>The following defines an implicit surface
 * function for a sphere.</caption>
 * var surface=new ImplicitSurface({"sample":function(x, y, z) {
 * "use strict";
 * return x*x+y*y+z*z-1;
 * }});
 * @returns {Object} Return value.
 */
function ImplicitSurface(func) {
  "use strict";
  if(typeof func !== "object")throw new Error();
  this.sampler = func;
}
// a2fVertexOffset lists the positions, relative to vertex0, of each of the 8 vertices of a cube
ImplicitSurface._a2fVertexOffset = [
  [0.0, 0.0, 0.0], [1.0, 0.0, 0.0], [1.0, 1.0, 0.0], [0.0, 1.0, 0.0],
  [0.0, 0.0, 1.0], [1.0, 0.0, 1.0], [1.0, 1.0, 1.0], [0.0, 1.0, 1.0]
];

ImplicitSurface._a2fEdgeDirection = [
  [1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [-1.0, 0.0, 0.0], [0.0, -1.0, 0.0],
  [1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [-1.0, 0.0, 0.0], [0.0, -1.0, 0.0],
  [0.0, 0.0, 1.0], [0.0, 0.0, 1.0], [0.0, 0.0, 1.0], [0.0, 0.0, 1.0]
];

// a2iEdgeConnection lists the index of the endpoint vertices for each of the 12 edges of the cube
ImplicitSurface._a2iEdgeConnection =
[
  [0, 1], [1, 2], [2, 3], [3, 0],
  [4, 5], [5, 6], [6, 7], [7, 4],
  [0, 4], [1, 5], [2, 6], [3, 7]
];

/** @ignore */
ImplicitSurface.prototype._getNormal = function(rfNormal, fX, fY, fZ) {
  "use strict";
  const ff = this.sampler.sample(fX, fY, fZ);
  rfNormal[0] = this.sampler.sample(fX + 0.001, fY, fZ) - ff;
  rfNormal[1] = this.sampler.sample(fX, fY + 0.001, fZ) - ff;
  rfNormal[2] = this.sampler.sample(fX, fY, fZ + 0.001) - ff;
  H3DU.MathUtil.vec3normalizeInPlace(rfNormal);
};
/** @ignore */
ImplicitSurface._fGetOffset = function(a, b, desired) {
  "use strict";
  const delta = b - a;
  return delta === 0 ? 0.5 : (desired - a) / delta;
};

ImplicitSurface._TARGET_VALUE = 0;
// For any edge, if one vertex is inside of the surface and the other is outside of the surface
// then the edge intersects the surface
// For each of the 8 vertices of the cube can be two possible states : either inside or outside of the surface
// For any cube the are 2^8=256 possible sets of vertex states
// This table lists the edges intersected by the surface for all 256 possible vertex states
// There are 12 edges. For each entry in the table, if edge #n is intersected, then bit #n is set to 1

ImplicitSurface._aiCubeEdgeFlags = [
  0x000, 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c, 0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
  0x190, 0x099, 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c, 0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
  0x230, 0x339, 0x033, 0x13a, 0x636, 0x73f, 0x435, 0x53c, 0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
  0x3a0, 0x2a9, 0x1a3, 0x0aa, 0x7a6, 0x6af, 0x5a5, 0x4ac, 0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
  0x460, 0x569, 0x663, 0x76a, 0x066, 0x16f, 0x265, 0x36c, 0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
  0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0x0ff, 0x3f5, 0x2fc, 0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
  0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x055, 0x15c, 0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
  0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0x0cc, 0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
  0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc, 0x0cc, 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
  0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c, 0x15c, 0x055, 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
  0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc, 0x2fc, 0x3f5, 0x0ff, 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
  0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c, 0x36c, 0x265, 0x16f, 0x066, 0x76a, 0x663, 0x569, 0x460,
  0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac, 0x4ac, 0x5a5, 0x6af, 0x7a6, 0x0aa, 0x1a3, 0x2a9, 0x3a0,
  0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c, 0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x033, 0x339, 0x230,
  0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c, 0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x099, 0x190,
  0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c, 0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x000
];

// For each of the possible vertex states listed in aiCubeEdgeFlags there is a specific triangulation
// of the edge intersection points. a2iTriangleConnectionTable lists all of them in the form of
// 0-5 edge triples with the list terminated by the invalid value -1.
// For example: a2iTriangleConnectionTable[3] list the 2 triangles formed when corner[0]
// and corner[1] are inside of the surface, but the rest of the cube is not.
// NOTE: This is the public domain table from Geoffrey Heller.
ImplicitSurface._a2iTriangleConnectionTable = [
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [8, 3, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [9, 0, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [8, 3, 1, 8, 1, 9, -1, -1, -1, -1, -1, -1, -1],
  [10, 1, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [8, 3, 0, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1],
  [9, 0, 2, 9, 2, 10, -1, -1, -1, -1, -1, -1, -1],
  [3, 2, 8, 2, 10, 8, 8, 10, 9, -1, -1, -1, -1],
  [11, 2, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [11, 2, 0, 11, 0, 8, -1, -1, -1, -1, -1, -1, -1],
  [11, 2, 3, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1],
  [2, 1, 11, 1, 9, 11, 11, 9, 8, -1, -1, -1, -1],
  [10, 1, 3, 10, 3, 11, -1, -1, -1, -1, -1, -1, -1],
  [1, 0, 10, 0, 8, 10, 10, 8, 11, -1, -1, -1, -1],
  [0, 3, 9, 3, 11, 9, 9, 11, 10, -1, -1, -1, -1],
  [8, 10, 9, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1],
  [8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [3, 0, 4, 3, 4, 7, -1, -1, -1, -1, -1, -1, -1],
  [1, 9, 0, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1],
  [9, 4, 1, 4, 7, 1, 1, 7, 3, -1, -1, -1, -1],
  [10, 1, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1],
  [2, 10, 1, 0, 4, 7, 0, 7, 3, -1, -1, -1, -1],
  [4, 7, 8, 0, 2, 10, 0, 10, 9, -1, -1, -1, -1],
  [2, 7, 3, 2, 9, 7, 7, 9, 4, 2, 10, 9, -1],
  [2, 3, 11, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1],
  [7, 11, 4, 11, 2, 4, 4, 2, 0, -1, -1, -1, -1],
  [3, 11, 2, 4, 7, 8, 9, 0, 1, -1, -1, -1, -1],
  [2, 7, 11, 2, 1, 7, 1, 4, 7, 1, 9, 4, -1],
  [8, 4, 7, 11, 10, 1, 11, 1, 3, -1, -1, -1, -1],
  [11, 4, 7, 1, 4, 11, 1, 11, 10, 1, 0, 4, -1],
  [3, 8, 0, 7, 11, 4, 11, 9, 4, 11, 10, 9, -1],
  [7, 11, 4, 4, 11, 9, 11, 10, 9, -1, -1, -1, -1],
  [9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [3, 0, 8, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1],
  [5, 4, 0, 5, 0, 1, -1, -1, -1, -1, -1, -1, -1],
  [4, 8, 5, 8, 3, 5, 5, 3, 1, -1, -1, -1, -1],
  [2, 10, 1, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1],
  [0, 8, 3, 5, 4, 9, 10, 1, 2, -1, -1, -1, -1],
  [10, 5, 2, 5, 4, 2, 2, 4, 0, -1, -1, -1, -1],
  [3, 4, 8, 3, 2, 4, 2, 5, 4, 2, 10, 5, -1],
  [11, 2, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1],
  [9, 5, 4, 8, 11, 2, 8, 2, 0, -1, -1, -1, -1],
  [3, 11, 2, 1, 5, 4, 1, 4, 0, -1, -1, -1, -1],
  [8, 5, 4, 2, 5, 8, 2, 8, 11, 2, 1, 5, -1],
  [5, 4, 9, 1, 3, 11, 1, 11, 10, -1, -1, -1, -1],
  [0, 9, 1, 4, 8, 5, 8, 10, 5, 8, 11, 10, -1],
  [3, 4, 0, 3, 10, 4, 4, 10, 5, 3, 11, 10, -1],
  [4, 8, 5, 5, 8, 10, 8, 11, 10, -1, -1, -1, -1],
  [9, 5, 7, 9, 7, 8, -1, -1, -1, -1, -1, -1, -1],
  [0, 9, 3, 9, 5, 3, 3, 5, 7, -1, -1, -1, -1],
  [8, 0, 7, 0, 1, 7, 7, 1, 5, -1, -1, -1, -1],
  [1, 7, 3, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1],
  [1, 2, 10, 5, 7, 8, 5, 8, 9, -1, -1, -1, -1],
  [9, 1, 0, 10, 5, 2, 5, 3, 2, 5, 7, 3, -1],
  [5, 2, 10, 8, 2, 5, 8, 5, 7, 8, 0, 2, -1],
  [10, 5, 2, 2, 5, 3, 5, 7, 3, -1, -1, -1, -1],
  [11, 2, 3, 8, 9, 5, 8, 5, 7, -1, -1, -1, -1],
  [9, 2, 0, 9, 7, 2, 2, 7, 11, 9, 5, 7, -1],
  [0, 3, 8, 2, 1, 11, 1, 7, 11, 1, 5, 7, -1],
  [2, 1, 11, 11, 1, 7, 1, 5, 7, -1, -1, -1, -1],
  [3, 9, 1, 3, 8, 9, 7, 11, 10, 7, 10, 5, -1],
  [9, 1, 0, 10, 7, 11, 10, 5, 7, -1, -1, -1, -1],
  [3, 8, 0, 7, 10, 5, 7, 11, 10, -1, -1, -1, -1],
  [11, 5, 7, 11, 10, 5, -1, -1, -1, -1, -1, -1, -1],
  [10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [8, 3, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1],
  [0, 1, 9, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1],
  [10, 6, 5, 9, 8, 3, 9, 3, 1, -1, -1, -1, -1],
  [1, 2, 6, 1, 6, 5, -1, -1, -1, -1, -1, -1, -1],
  [0, 8, 3, 2, 6, 5, 2, 5, 1, -1, -1, -1, -1],
  [5, 9, 6, 9, 0, 6, 6, 0, 2, -1, -1, -1, -1],
  [9, 6, 5, 3, 6, 9, 3, 9, 8, 3, 2, 6, -1],
  [3, 11, 2, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1],
  [6, 5, 10, 2, 0, 8, 2, 8, 11, -1, -1, -1, -1],
  [1, 9, 0, 6, 5, 10, 11, 2, 3, -1, -1, -1, -1],
  [1, 10, 2, 5, 9, 6, 9, 11, 6, 9, 8, 11, -1],
  [11, 6, 3, 6, 5, 3, 3, 5, 1, -1, -1, -1, -1],
  [0, 5, 1, 0, 11, 5, 5, 11, 6, 0, 8, 11, -1],
  [0, 5, 9, 0, 3, 5, 3, 6, 5, 3, 11, 6, -1],
  [5, 9, 6, 6, 9, 11, 9, 8, 11, -1, -1, -1, -1],
  [10, 6, 5, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1],
  [5, 10, 6, 7, 3, 0, 7, 0, 4, -1, -1, -1, -1],
  [5, 10, 6, 0, 1, 9, 8, 4, 7, -1, -1, -1, -1],
  [4, 5, 9, 6, 7, 10, 7, 1, 10, 7, 3, 1, -1],
  [7, 8, 4, 5, 1, 2, 5, 2, 6, -1, -1, -1, -1],
  [4, 1, 0, 4, 5, 1, 6, 7, 3, 6, 3, 2, -1],
  [9, 4, 5, 8, 0, 7, 0, 6, 7, 0, 2, 6, -1],
  [4, 5, 9, 6, 3, 2, 6, 7, 3, -1, -1, -1, -1],
  [7, 8, 4, 2, 3, 11, 10, 6, 5, -1, -1, -1, -1],
  [11, 6, 7, 10, 2, 5, 2, 4, 5, 2, 0, 4, -1],
  [11, 6, 7, 8, 0, 3, 1, 10, 2, 9, 4, 5, -1],
  [6, 7, 11, 1, 10, 2, 9, 4, 5, -1, -1, -1, -1],
  [6, 7, 11, 4, 5, 8, 5, 3, 8, 5, 1, 3, -1],
  [6, 7, 11, 4, 1, 0, 4, 5, 1, -1, -1, -1, -1],
  [4, 5, 9, 3, 8, 0, 11, 6, 7, -1, -1, -1, -1],
  [9, 4, 5, 7, 11, 6, -1, -1, -1, -1, -1, -1, -1],
  [10, 6, 4, 10, 4, 9, -1, -1, -1, -1, -1, -1, -1],
  [8, 3, 0, 9, 10, 6, 9, 6, 4, -1, -1, -1, -1],
  [1, 10, 0, 10, 6, 0, 0, 6, 4, -1, -1, -1, -1],
  [8, 6, 4, 8, 1, 6, 6, 1, 10, 8, 3, 1, -1],
  [9, 1, 4, 1, 2, 4, 4, 2, 6, -1, -1, -1, -1],
  [1, 0, 9, 3, 2, 8, 2, 4, 8, 2, 6, 4, -1],
  [2, 4, 0, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1],
  [3, 2, 8, 8, 2, 4, 2, 6, 4, -1, -1, -1, -1],
  [2, 3, 11, 6, 4, 9, 6, 9, 10, -1, -1, -1, -1],
  [0, 10, 2, 0, 9, 10, 4, 8, 11, 4, 11, 6, -1],
  [10, 2, 1, 11, 6, 3, 6, 0, 3, 6, 4, 0, -1],
  [10, 2, 1, 11, 4, 8, 11, 6, 4, -1, -1, -1, -1],
  [1, 4, 9, 11, 4, 1, 11, 1, 3, 11, 6, 4, -1],
  [0, 9, 1, 4, 11, 6, 4, 8, 11, -1, -1, -1, -1],
  [11, 6, 3, 3, 6, 0, 6, 4, 0, -1, -1, -1, -1],
  [8, 6, 4, 8, 11, 6, -1, -1, -1, -1, -1, -1, -1],
  [6, 7, 10, 7, 8, 10, 10, 8, 9, -1, -1, -1, -1],
  [9, 3, 0, 6, 3, 9, 6, 9, 10, 6, 7, 3, -1],
  [6, 1, 10, 6, 7, 1, 7, 0, 1, 7, 8, 0, -1],
  [6, 7, 10, 10, 7, 1, 7, 3, 1, -1, -1, -1, -1],
  [7, 2, 6, 7, 9, 2, 2, 9, 1, 7, 8, 9, -1],
  [1, 0, 9, 3, 6, 7, 3, 2, 6, -1, -1, -1, -1],
  [8, 0, 7, 7, 0, 6, 0, 2, 6, -1, -1, -1, -1],
  [2, 7, 3, 2, 6, 7, -1, -1, -1, -1, -1, -1, -1],
  [7, 11, 6, 3, 8, 2, 8, 10, 2, 8, 9, 10, -1],
  [11, 6, 7, 10, 0, 9, 10, 2, 0, -1, -1, -1, -1],
  [2, 1, 10, 7, 11, 6, 8, 0, 3, -1, -1, -1, -1],
  [1, 10, 2, 6, 7, 11, -1, -1, -1, -1, -1, -1, -1],
  [7, 11, 6, 3, 9, 1, 3, 8, 9, -1, -1, -1, -1],
  [9, 1, 0, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1],
  [0, 3, 8, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1],
  [11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [0, 8, 3, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1],
  [9, 0, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1],
  [7, 6, 11, 3, 1, 9, 3, 9, 8, -1, -1, -1, -1],
  [1, 2, 10, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1],
  [2, 10, 1, 7, 6, 11, 8, 3, 0, -1, -1, -1, -1],
  [11, 7, 6, 10, 9, 0, 10, 0, 2, -1, -1, -1, -1],
  [7, 6, 11, 3, 2, 8, 8, 2, 10, 8, 10, 9, -1],
  [2, 3, 7, 2, 7, 6, -1, -1, -1, -1, -1, -1, -1],
  [8, 7, 0, 7, 6, 0, 0, 6, 2, -1, -1, -1, -1],
  [1, 9, 0, 3, 7, 6, 3, 6, 2, -1, -1, -1, -1],
  [7, 6, 2, 7, 2, 9, 2, 1, 9, 7, 9, 8, -1],
  [6, 10, 7, 10, 1, 7, 7, 1, 3, -1, -1, -1, -1],
  [6, 10, 1, 6, 1, 7, 7, 1, 0, 7, 0, 8, -1],
  [9, 0, 3, 6, 9, 3, 6, 10, 9, 6, 3, 7, -1],
  [6, 10, 7, 7, 10, 8, 10, 9, 8, -1, -1, -1, -1],
  [8, 4, 6, 8, 6, 11, -1, -1, -1, -1, -1, -1, -1],
  [11, 3, 6, 3, 0, 6, 6, 0, 4, -1, -1, -1, -1],
  [0, 1, 9, 4, 6, 11, 4, 11, 8, -1, -1, -1, -1],
  [1, 9, 4, 11, 1, 4, 11, 3, 1, 11, 4, 6, -1],
  [10, 1, 2, 11, 8, 4, 11, 4, 6, -1, -1, -1, -1],
  [10, 1, 2, 11, 3, 6, 6, 3, 0, 6, 0, 4, -1],
  [0, 2, 10, 0, 10, 9, 4, 11, 8, 4, 6, 11, -1],
  [2, 11, 3, 6, 9, 4, 6, 10, 9, -1, -1, -1, -1],
  [3, 8, 2, 8, 4, 2, 2, 4, 6, -1, -1, -1, -1],
  [2, 0, 4, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1],
  [1, 9, 0, 3, 8, 2, 2, 8, 4, 2, 4, 6, -1],
  [9, 4, 1, 1, 4, 2, 4, 6, 2, -1, -1, -1, -1],
  [8, 4, 6, 8, 6, 1, 6, 10, 1, 8, 1, 3, -1],
  [1, 0, 10, 10, 0, 6, 0, 4, 6, -1, -1, -1, -1],
  [8, 0, 3, 9, 6, 10, 9, 4, 6, -1, -1, -1, -1],
  [10, 4, 6, 10, 9, 4, -1, -1, -1, -1, -1, -1, -1],
  [9, 5, 4, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1],
  [4, 9, 5, 3, 0, 8, 11, 7, 6, -1, -1, -1, -1],
  [6, 11, 7, 4, 0, 1, 4, 1, 5, -1, -1, -1, -1],
  [6, 11, 7, 4, 8, 5, 5, 8, 3, 5, 3, 1, -1],
  [6, 11, 7, 1, 2, 10, 9, 5, 4, -1, -1, -1, -1],
  [11, 7, 6, 8, 3, 0, 1, 2, 10, 9, 5, 4, -1],
  [11, 7, 6, 10, 5, 2, 2, 5, 4, 2, 4, 0, -1],
  [7, 4, 8, 2, 11, 3, 10, 5, 6, -1, -1, -1, -1],
  [4, 9, 5, 6, 2, 3, 6, 3, 7, -1, -1, -1, -1],
  [9, 5, 4, 8, 7, 0, 0, 7, 6, 0, 6, 2, -1],
  [4, 0, 1, 4, 1, 5, 6, 3, 7, 6, 2, 3, -1],
  [7, 4, 8, 5, 2, 1, 5, 6, 2, -1, -1, -1, -1],
  [4, 9, 5, 6, 10, 7, 7, 10, 1, 7, 1, 3, -1],
  [5, 6, 10, 0, 9, 1, 8, 7, 4, -1, -1, -1, -1],
  [5, 6, 10, 7, 0, 3, 7, 4, 0, -1, -1, -1, -1],
  [10, 5, 6, 4, 8, 7, -1, -1, -1, -1, -1, -1, -1],
  [5, 6, 9, 6, 11, 9, 9, 11, 8, -1, -1, -1, -1],
  [0, 9, 5, 0, 5, 3, 3, 5, 6, 3, 6, 11, -1],
  [0, 1, 5, 0, 5, 11, 5, 6, 11, 0, 11, 8, -1],
  [11, 3, 6, 6, 3, 5, 3, 1, 5, -1, -1, -1, -1],
  [1, 2, 10, 5, 6, 9, 9, 6, 11, 9, 11, 8, -1],
  [1, 0, 9, 6, 10, 5, 11, 3, 2, -1, -1, -1, -1],
  [6, 10, 5, 2, 8, 0, 2, 11, 8, -1, -1, -1, -1],
  [3, 2, 11, 10, 5, 6, -1, -1, -1, -1, -1, -1, -1],
  [9, 5, 6, 3, 9, 6, 3, 8, 9, 3, 6, 2, -1],
  [5, 6, 9, 9, 6, 0, 6, 2, 0, -1, -1, -1, -1],
  [0, 3, 8, 2, 5, 6, 2, 1, 5, -1, -1, -1, -1],
  [1, 6, 2, 1, 5, 6, -1, -1, -1, -1, -1, -1, -1],
  [10, 5, 6, 9, 3, 8, 9, 1, 3, -1, -1, -1, -1],
  [0, 9, 1, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1],
  [8, 0, 3, 10, 5, 6, -1, -1, -1, -1, -1, -1, -1],
  [10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [11, 7, 5, 11, 5, 10, -1, -1, -1, -1, -1, -1, -1],
  [3, 0, 8, 7, 5, 10, 7, 10, 11, -1, -1, -1, -1],
  [9, 0, 1, 10, 11, 7, 10, 7, 5, -1, -1, -1, -1],
  [3, 1, 9, 3, 9, 8, 7, 10, 11, 7, 5, 10, -1],
  [2, 11, 1, 11, 7, 1, 1, 7, 5, -1, -1, -1, -1],
  [0, 8, 3, 2, 11, 1, 1, 11, 7, 1, 7, 5, -1],
  [9, 0, 2, 9, 2, 7, 2, 11, 7, 9, 7, 5, -1],
  [11, 3, 2, 8, 5, 9, 8, 7, 5, -1, -1, -1, -1],
  [10, 2, 5, 2, 3, 5, 5, 3, 7, -1, -1, -1, -1],
  [5, 10, 2, 8, 5, 2, 8, 7, 5, 8, 2, 0, -1],
  [9, 0, 1, 10, 2, 5, 5, 2, 3, 5, 3, 7, -1],
  [1, 10, 2, 5, 8, 7, 5, 9, 8, -1, -1, -1, -1],
  [1, 3, 7, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1],
  [8, 7, 0, 0, 7, 1, 7, 5, 1, -1, -1, -1, -1],
  [0, 3, 9, 9, 3, 5, 3, 7, 5, -1, -1, -1, -1],
  [9, 7, 5, 9, 8, 7, -1, -1, -1, -1, -1, -1, -1],
  [4, 5, 8, 5, 10, 8, 8, 10, 11, -1, -1, -1, -1],
  [3, 0, 4, 3, 4, 10, 4, 5, 10, 3, 10, 11, -1],
  [0, 1, 9, 4, 5, 8, 8, 5, 10, 8, 10, 11, -1],
  [5, 9, 4, 1, 11, 3, 1, 10, 11, -1, -1, -1, -1],
  [8, 4, 5, 2, 8, 5, 2, 11, 8, 2, 5, 1, -1],
  [3, 2, 11, 1, 4, 5, 1, 0, 4, -1, -1, -1, -1],
  [9, 4, 5, 8, 2, 11, 8, 0, 2, -1, -1, -1, -1],
  [11, 3, 2, 9, 4, 5, -1, -1, -1, -1, -1, -1, -1],
  [3, 8, 4, 3, 4, 2, 2, 4, 5, 2, 5, 10, -1],
  [10, 2, 5, 5, 2, 4, 2, 0, 4, -1, -1, -1, -1],
  [0, 3, 8, 5, 9, 4, 10, 2, 1, -1, -1, -1, -1],
  [2, 1, 10, 9, 4, 5, -1, -1, -1, -1, -1, -1, -1],
  [4, 5, 8, 8, 5, 3, 5, 1, 3, -1, -1, -1, -1],
  [5, 0, 4, 5, 1, 0, -1, -1, -1, -1, -1, -1, -1],
  [3, 8, 0, 4, 5, 9, -1, -1, -1, -1, -1, -1, -1],
  [9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [7, 4, 11, 4, 9, 11, 11, 9, 10, -1, -1, -1, -1],
  [3, 0, 8, 7, 4, 11, 11, 4, 9, 11, 9, 10, -1],
  [11, 7, 4, 1, 11, 4, 1, 10, 11, 1, 4, 0, -1],
  [8, 7, 4, 11, 1, 10, 11, 3, 1, -1, -1, -1, -1],
  [2, 11, 7, 2, 7, 1, 1, 7, 4, 1, 4, 9, -1],
  [3, 2, 11, 4, 8, 7, 9, 1, 0, -1, -1, -1, -1],
  [7, 4, 11, 11, 4, 2, 4, 0, 2, -1, -1, -1, -1],
  [2, 11, 3, 7, 4, 8, -1, -1, -1, -1, -1, -1, -1],
  [2, 3, 7, 2, 7, 9, 7, 4, 9, 2, 9, 10, -1],
  [4, 8, 7, 0, 10, 2, 0, 9, 10, -1, -1, -1, -1],
  [2, 1, 10, 0, 7, 4, 0, 3, 7, -1, -1, -1, -1],
  [10, 2, 1, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1],
  [9, 1, 4, 4, 1, 7, 1, 3, 7, -1, -1, -1, -1],
  [1, 0, 9, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1],
  [3, 4, 0, 3, 7, 4, -1, -1, -1, -1, -1, -1, -1],
  [8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [8, 9, 10, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1],
  [0, 9, 3, 3, 9, 11, 9, 10, 11, -1, -1, -1, -1],
  [1, 10, 0, 0, 10, 8, 10, 11, 8, -1, -1, -1, -1],
  [10, 3, 1, 10, 11, 3, -1, -1, -1, -1, -1, -1, -1],
  [2, 11, 1, 1, 11, 9, 11, 8, 9, -1, -1, -1, -1],
  [11, 3, 2, 0, 9, 1, -1, -1, -1, -1, -1, -1, -1],
  [11, 0, 2, 11, 8, 0, -1, -1, -1, -1, -1, -1, -1],
  [11, 3, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [3, 8, 2, 2, 8, 10, 8, 9, 10, -1, -1, -1, -1],
  [9, 2, 0, 9, 10, 2, -1, -1, -1, -1, -1, -1, -1],
  [8, 0, 3, 1, 10, 2, -1, -1, -1, -1, -1, -1, -1],
  [10, 2, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [8, 1, 3, 8, 9, 1, -1, -1, -1, -1, -1, -1, -1],
  [9, 1, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [8, 0, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1],
  [-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1]
];
/** @ignore */
ImplicitSurface.prototype._isOnSurface = function(fX, fY, fZ, fScaleX, fScaleY, fScaleZ) {
  "use strict";
  let mx = 0;
  let mn = 0;
  let value = this.sampler.sample(fX, fY, fZ);
  mx = mn = value;
  value = this.sampler.sample(fX + fScaleX, fY, fZ);
  mn = Math.min(mn, value);
  mx = Math.max(mx, value);
  if(mn <= 0 && mx >= 0)return true;
  value = this.sampler.sample(fX, fY + fScaleY, fZ);
  mn = Math.min(mn, value);
  mx = Math.max(mx, value);
  if(mn <= 0 && mx >= 0)return true;
  value = this.sampler.sample(fX, fY, fZ + fScaleZ);
  mn = Math.min(mn, value);
  mx = Math.max(mx, value);
  if(mn <= 0 && mx >= 0)return true;
  value = this.sampler.sample(fX + fScaleX, fY + fScaleY, fZ);
  mn = Math.min(mn, value);
  mx = Math.max(mx, value);
  if(mn <= 0 && mx >= 0)return true;
  value = this.sampler.sample(fX, fY + fScaleY, fZ + fScaleZ);
  mn = Math.min(mn, value);
  mx = Math.max(mx, value);
  if(mn <= 0 && mx >= 0)return true;
  value = this.sampler.sample(fX + fScaleX, fY, fZ + fScaleZ);
  mn = Math.min(mn, value);
  mx = Math.max(mx, value);
  if(mn <= 0 && mx >= 0)return true;
  value = this.sampler.sample(fX + fScaleX, fY + fScaleY, fZ + fScaleZ);
  mn = Math.min(mn, value);
  mx = Math.max(mx, value);
  return mn <= 0 && mx >= 0;
};
/** @ignore */
ImplicitSurface.prototype._vMarchCube1 = function(mesh, fX, fY, fZ, fScaleX, fScaleY, fScaleZ, tmpobj) {
  "use strict";
  let iCorner;
  let iVertex;
  let iVertexTest;
  let iEdge;
  let iTriangle;
  let iFlagIndex;
  let fOffset;

  let mx = 0;
  let mn = 0;
  // Make a local copy of the cube's corner positions;
  // make a local copy of the cube's corner values
  for(iVertex = 0; iVertex < 8; iVertex++) {
    const x = fX + ImplicitSurface._a2fVertexOffset[iVertex][0] * fScaleX;

    const y = fY + ImplicitSurface._a2fVertexOffset[iVertex][1] * fScaleY;

    const z = fZ + ImplicitSurface._a2fVertexOffset[iVertex][2] * fScaleZ;

    const value = this.sampler.sample(x, y, z);
    mx = iVertex === 0 ? value : Math.max(mx, value);
    mn = iVertex === 0 ? value : Math.min(mn, value);
    tmpobj.afCubeValue[iVertex] = value;
  }
  if(mn > 0 || mx < 0)return;
  // Find which vertices are inside of the surface and which are outside
  iFlagIndex = 0;
  for(iVertexTest = 0; iVertexTest < 8; iVertexTest++) {
    if(tmpobj.afCubeValue[iVertexTest] <= ImplicitSurface._TARGET_VALUE)
      iFlagIndex |= 1 << iVertexTest;
  }

  // Find which edges are intersected by the surface

  const iEdgeFlags = ImplicitSurface._aiCubeEdgeFlags[iFlagIndex];

  // If the cube is entirely inside or outside of the surface, then there will be no intersections
  if(iEdgeFlags === 0)return;
  // Find the point of intersection of the surface with each edge
  // Then find the normal to the surface at those points
  for(iEdge = 0; iEdge < 12; iEdge++) {
    // if there is an intersection on this edge
    if(iEdgeFlags & 1 << iEdge) {
      fOffset = ImplicitSurface._fGetOffset(
        tmpobj.afCubeValue[ ImplicitSurface._a2iEdgeConnection[iEdge][0] ],
        tmpobj.afCubeValue[ ImplicitSurface._a2iEdgeConnection[iEdge][1] ],
        ImplicitSurface._TARGET_VALUE);

      tmpobj.asEdgeVertex[iEdge][0] = fX + (ImplicitSurface._a2fVertexOffset[ ImplicitSurface._a2iEdgeConnection[iEdge][0] ][0] +
                  fOffset * ImplicitSurface._a2fEdgeDirection[iEdge][0]) * fScaleX;
      tmpobj.asEdgeVertex[iEdge][1] = fY + (ImplicitSurface._a2fVertexOffset[ ImplicitSurface._a2iEdgeConnection[iEdge][0] ][1] +
                  fOffset * ImplicitSurface._a2fEdgeDirection[iEdge][1]) * fScaleY;
      tmpobj.asEdgeVertex[iEdge][2] = fZ + (ImplicitSurface._a2fVertexOffset[ ImplicitSurface._a2iEdgeConnection[iEdge][0] ][2] +
                  fOffset * ImplicitSurface._a2fEdgeDirection[iEdge][2]) * fScaleZ;

      this._getNormal(tmpobj.asEdgeNorm[iEdge],
        tmpobj.asEdgeVertex[iEdge][0],
        tmpobj.asEdgeVertex[iEdge][1],
        tmpobj.asEdgeVertex[iEdge][2]);
    }
  }

  // Draw the triangles that were found. There can be up to five per cube
  for(iTriangle = 0; iTriangle < 5; iTriangle++) {
    if(ImplicitSurface._a2iTriangleConnectionTable[iFlagIndex][3 * iTriangle] < 0)
      break;

    for(iCorner = 0; iCorner < 3; iCorner++) {
      iVertex = ImplicitSurface._a2iTriangleConnectionTable[iFlagIndex][3 * iTriangle + iCorner];
      mesh.normal3(tmpobj.asEdgeNorm[iVertex][0], tmpobj.asEdgeNorm[iVertex][1], tmpobj.asEdgeNorm[iVertex][2]);
      mesh.vertex3(tmpobj.asEdgeVertex[iVertex][0], tmpobj.asEdgeVertex[iVertex][1], tmpobj.asEdgeVertex[iVertex][2]);
    }
  }
};

/**
 * Finds a tight bounding box within the given three-dimensional
 * area that encloses this implicit surface.
 * @param {number} xsize Number of grid points along the X axis. Must be 2 or greater.
 * @param {number} ysize Number of grid points along the Y axis. Must be 2 or greater.
 * @param {number} zsize Number of grid points along the Z axis. Must be 2 or greater.
 * @param {number} xmin Smallest value along the X axis.
 * @param {number} xmax Greatest value along the X axis.
 * @param {number} ymin Smallest value along the Y axis.
 * @param {number} ymax Greatest value along the Y axis.
 * @param {number} zmin Smallest value along the Z axis.
 * @param {number} zmax Greatest value along the Z axis.
 * @returns {Array<number>} An array of six numbers describing a tight
 * axis-aligned bounding box
 * that fits this implicit surface within the given area. The first three numbers
 * are the smallest-valued X, Y, and Z coordinates, and the
 * last three are the largest-valued X, Y, and Z coordinates.
 * If no part of the boundary of the surface lies within the given
 * area, returns the array [Inf, Inf, Inf, -Inf,
 * -Inf, -Inf].
 */
ImplicitSurface.prototype.findBox = function(xsize, ysize, zsize, xmin, xmax, ymin, ymax, zmin, zmax) {
  "use strict";
  const xstep = (xmax - xmin) / xsize;
  const ystep = (ymax - ymin) / ysize;
  const zstep = (zmax - zmin) / zsize;
  const inf = Number.POSITIVE_INFINITY;
  const bounds = [inf, inf, inf, -inf, -inf, -inf];
  let first = true;
  let x;
  let y;
  let z;
  let iX;
  let iY;
  let iZ;
  for(iX = 0, x = xmin; iX < xsize; iX += 1, x += xstep) {
    for(iY = 0, y = ymin; iY < ysize; iY += 1, y += ystep) {
      for(iZ = 0, z = zmin; iZ < zsize; iZ += 1, z += zstep) {
        if(this._isOnSurface(x, y, z, xstep, ystep, zstep)) {
          if(first) {
            first = false;
            bounds[0] = x;
            bounds[1] = x + xstep;
            bounds[2] = y;
            bounds[3] = y + ystep;
            bounds[4] = z;
            bounds[5] = z + zstep;
          } else {
            bounds[0] = Math.min(bounds[0], x);
            bounds[1] = Math.max(bounds[1], x + xstep);
            bounds[2] = Math.min(bounds[2], y);
            bounds[3] = Math.max(bounds[3], y + ystep);
            bounds[4] = Math.min(bounds[4], z);
            bounds[5] = Math.max(bounds[5], z + zstep);
          }
        }
      }
    }
  }
  return bounds;
};
/**
 * Evaluates the grid points of the given three-dimensional area and adds to the
 * given mesh those points that are on or close to the boundary of this
 * implicit surface
 * within the given area.
 * @param {Mesh} mesh Mesh to store the points in.
 * @param {number} xsize Number of grid points along the X axis. Must be 2 or greater.
 * @param {number} ysize Number of grid points along the Y axis. Must be 2 or greater.
 * @param {number} zsize Number of grid points along the Z axis. Must be 2 or greater.
 * @param {number} xmin Smallest value along the X axis.
 * @param {number} xmax Greatest value along the X axis.
 * @param {number} ymin Smallest value along the Y axis.
 * @param {number} ymax Greatest value along the Y axis.
 * @param {number} zmin Smallest value along the Z axis.
 * @param {number} zmax Greatest value along the Z axis.
 * @returns {ImplicitSurface} This object.
 */
ImplicitSurface.prototype.evalSurfacePoints = function(mesh, xsize, ysize, zsize, xmin, xmax, ymin, ymax, zmin, zmax) {
  "use strict";
  if(xsize < 2 || ysize < 2 || zsize < 2)throw new Error();
  mesh.mode(H3DU.MeshBuffer.POINTS);

  const xstep = (xmax - xmin) / (xsize - 1);
  const ystep = (ymax - ymin) / (ysize - 1);
  const zstep = (zmax - zmin) / (zsize - 1);
  let x;
  let y;
  let z;
  let iX;
  let iY;
  let iZ;
  for(iX = 0, x = xmin; iX < xsize; iX += 1, x += xstep) {
    for(iY = 0, y = ymin; iY < ysize; iY += 1, y += ystep) {
      for(iZ = 0, z = zmin; iZ < zsize; iZ += 1, z += zstep) {
        if(this._isOnSurface(x, y, z, xstep, ystep, zstep)) {
          mesh.vertex3(x + xstep / 2, y + ystep / 2, z + zstep / 2);
        }
      }
    }
  }
  return this;
};
/**
 * Evaluates the grid points of the given three-dimensional area and adds to the
 * given mesh the triangles and normals that make up the boundary of
 * this implicit surface within the given area.
 * @param {Mesh} mesh Mesh to store the points in.
 * @param {number} xsize Number of grid points along the X axis. Must be 2 or greater.
 * @param {number} ysize Number of grid points along the Y axis. Must be 2 or greater.
 * @param {number} zsize Number of grid points along the Z axis. Must be 2 or greater.
 * @param {number} xmin Smallest value along the X axis.
 * @param {number} xmax Greatest value along the X axis.
 * @param {number} ymin Smallest value along the Y axis.
 * @param {number} ymax Greatest value along the Y axis.
 * @param {number} zmin Smallest value along the Z axis.
 * @param {number} zmax Greatest value along the Z axis.
 * @returns {ImplicitSurface} This object.
 */
ImplicitSurface.prototype.evalSurface = function(mesh, xsize, ysize, zsize, xmin, xmax, ymin, ymax, zmin, zmax) {
  "use strict";
  mesh.mode(H3DU.Mesh.TRIANGLES);
  const tmpobj = {
    "asCubePosition":[[], [], [], [], [], [], [], []],
    "afCubeValue":[],
    "asTetrahedronPosition":[[], [], [], []],
    "afTetrahedronValue":[],
    "asEdgeVertex":[[], [], [], [], [], [], [], [], [], [], [], []],
    "asEdgeNorm":[[], [], [], [], [], [], [], [], [], [], [], []]
  };
  const xstep = (xmax - xmin) / xsize;
  const ystep = (ymax - ymin) / ysize;
  const zstep = (zmax - zmin) / zsize;
  if(xstep !== 0 && ystep !== 0 && zstep !== 0) {
    let x;
    let y;
    let z;
    let iX;
    let iY;
    let iZ;
    for(iX = 0, x = xmin; iX < xsize; iX += 1, x += xstep) {
      for(iY = 0, y = ymin; iY < ysize; iY += 1, y += ystep) {
        for(iZ = 0, z = zmin; iZ < zsize; iZ += 1, z += zstep) {
          this._vMarchCube1(mesh, x, y, z, xstep, ystep, zstep, tmpobj);
        }
      }
    }
  }
  return this;
};
/**
 * Returns a sampling object for the union of
 * one surface and another.
 * @param {Object} a A sampling object (see ImplicitSurface constructor) that defines an implicit surface.
 * @param {Object} b A sampling object that defines another implicit surface.
 * @returns {Object} A sampling object that defines surface "a" together with surface "b"
 */
ImplicitSurface.union = function(a, b) {
  "use strict";
  return {
    "sample":function(x, y, z) {
      return Math.min(a.sample(x, y, z), b.sample(x, y, z));
    }
  };
};
/**
 * Returns a sampling object for the intersection of
 * one surface and another.
 * @param {Object} a A sampling object (see ImplicitSurface constructor) that defines an implicit surface.
 * @param {Object} b A sampling object that defines another implicit surface.
 * @returns {Object} A sampling object that defines surface "a" intersected with surface "b"
 */
ImplicitSurface.intersection = function(a, b) {
  "use strict";
  return {
    "sample":function(x, y, z) {
      return Math.max(a.sample(x, y, z), b.sample(x, y, z));
    }
  };
};
/**
 * Returns a sampling object for the difference between
 * one surface and another.
 * @param {Object} a A sampling object (see ImplicitSurface constructor) that defines an implicit surface.
 * @param {Object} b A sampling object that defines the surface
 * to subtract from the first surface.
 * @returns {Object} A sampling object that defines surface "a" with surface "b" subtracted from it.
 */
ImplicitSurface.difference = function(a, b) {
  "use strict";
  return {
    "sample":function(x, y, z) {
      return Math.max(a.sample(x, y, z), -b.sample(x, y, z));
    }
  };
};
