/** The <code>extras/polyhedra.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/polyhedra.js";
 * // -- or --
 * import * as CustomModuleName from "extras/polyhedra.js";</pre>
 * @module extras/polyhedra */

/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
import {MathUtil, MeshBuffer} from "../h3du_module.js";
/**
 * Contains helper methods for generating the five platonic solids
 * and other polyhedra.<p>
 * @constructor
 */
export const Polyhedra = function() {
  // NOTE: empty because no instance properties
};
/**
 * Normalizes the distance from the origin to each vertex in the given
 * array to a fixed radius.
 * @param {Array<number>} vertices An array of vertices, where each
 * vertex's X, Y, and Z coordinates are stored as three elements of that array.
 * @param {number} radius Distance from the origin where each vertex
 * will be normalized to.
 * @returns {Object} Return value.
 */
Polyhedra.normDistances = function(vertices, radius) {
  // Normalize distances from the origin

  let i;
  for (i = 0; i < vertices.length; i += 3) {
    const vx = vertices[i];
    const vy = vertices[i + 1];
    const vz = vertices[i + 2];
    const norm = radius / Math.sqrt(vx * vx + vy * vy + vz * vz);
    vertices[i] *= norm;
    vertices[i + 1] *= norm;
    vertices[i + 2] *= norm;
  }
};
/**
 * Modifies the vertices and indices of a solid to
 * generate an approximation of a sphere.
 * @param {Array<Array<number>>} vi A two-element array. The first
 * element contains an array of the vertices that make up the solid (each
 * vertex's X, Y, and Z coordinates are stored as three elements of that array),
 * and the second element contains an array of vertex indices (multiplying
 * each element by 3 will get the index to the first coordinate of the corresponding
 * vertex in the first array).
 * @param {number} radius Maximum radius from the center of the solid to one of its vertices.
 * @param {number} level If 0 or less, generates the solid as is. If 1 or greater, subdivides each
 * triangle on the solid's surface into smaller triangles and makes them bulge out to
 * form an approximation of a sphere (the bigger the number, the smaller the triangles).
 * @returns {Array<Array<number>>} The "vi" parameter, which will likely be modified.
 */
Polyhedra.makeSphere = function(vi, radius, level) {
  const vertices = vi[0];
  const indices = vi[1];
  if(typeof level === "undefined" || level === null || level <= 0) {
    // Scale the vertices to the given radius
    let i;
    for (i = 0; i < vertices.length; i += 3) {
      vertices[i] *= radius;
      vertices[i + 1] *= radius;
      vertices[i + 2] *= radius;
    }
    return vi;
  }
  Polyhedra.normDistances(vertices, radius);
  // Subdivide the triangles into many smaller triangles
  let i;
  for (i = 0; i < level; i++) {
    const tris = indices.length;
    let j;
    for (j = 0; j < tris; j += 3) {
      const i1 = indices[j];
      const i2 = indices[j + 1];
      const i3 = indices[j + 2];
      // Subdivide the triangle into four triangles
      const i1t3 = i1 * 3;
      const i2t3 = i2 * 3;
      const i3t3 = i3 * 3;
      const t1 = [vertices[i1t3], vertices[i1t3 + 1], vertices[i1t3 + 2]];
      const t2 = [vertices[i2t3], vertices[i2t3 + 1], vertices[i2t3 + 2]];
      const t3 = [vertices[i3t3], vertices[i3t3 + 1], vertices[i3t3 + 2]];
      const t12 = MathUtil.vec3lerp(t1, t2, 0.5);
      const t23 = MathUtil.vec3lerp(t2, t3, 0.5);
      const t31 = MathUtil.vec3lerp(t3, t1, 0.5);
      const c = vertices.length / 3 | 0;
      const it12 = c;
      const it23 = c + 1;
      const it31 = c + 2;
      indices[j] = i1;
      indices[j + 1] = it12;
      indices[j + 2] = it31;
      indices.push(i2, it23, it12, i3, it31, it23, it12, it23, it31);
      vertices.push(t12[0], t12[1], t12[2], t23[0], t23[1], t23[2],
        t31[0], t31[1], t31[2]);
    }
    Polyhedra.normDistances(vertices, radius);
  }
  return vi;
};
/**
 * Convenience method for generating a flat-shaded
 * mesh using an array of vertices and indices.
 * @private
 * @param {Array<Array<number>>} vi A two-element array. The first
 * element contains an array of the vertices that make up the solid (each
 * vertex's X, Y, and Z coordinates are stored as three elements of that array),
 * and the second element contains an array of vertex indices (multiplying
 * each element by 3 will get the index to the first coordinate of the corresponding
 * vertex in the first array).
 * @returns {MeshBuffer} The generated mesh.
 */
Polyhedra.makeMesh = function(vi) {
  // Create the mesh and generate normals
  // for a flat-shaded appearance

  return new MeshBuffer()
    .setAttribute("POSITION", vi[0], 3)
    .setIndices(vi[1])
    .recalcNormals(true);
};
/**
 * Generates a mesh of a regular octahedron or a sphere based on that solid.
 * @param {number} radius Maximum radius from the center of the solid to one of its vertices.
 * @param {number} level If 0 or less, generates the solid as is. If 1 or greater, subdivides each
 * triangle on the solid's surface into smaller triangles and makes them bulge out to
 * form an approximation of a sphere (the bigger the number, the smaller the triangles).
 * @returns {MeshBuffer} The generated solid.
 */
Polyhedra.octahedron = function(radius, level) {
  const vi = Polyhedra.octahedronFaces();
  Polyhedra.makeSphere(vi, radius, level);
  return Polyhedra.makeMesh(vi);
};
/**
 * Generates a mesh of a regular hexahedron (cube) or a sphere based on that solid.
 * @param {number} radius Maximum radius from the center of the solid to one of its vertices.
 * @param {number} level If 0 or less, generates the solid as is. If 1 or greater, subdivides each
 * triangle on the solid's surface into smaller triangles and makes them bulge out to
 * form an approximation of a sphere (the bigger the number, the smaller the triangles).
 * @returns {MeshBuffer} The generated solid.
 */
Polyhedra.hexahedron = function(radius, level) {
  const vi = Polyhedra.hexahedronFaces();
  Polyhedra.makeSphere(vi, radius, level);
  return Polyhedra.makeMesh(vi);
};
/**
 * Generates a mesh of a regular icosahedron or a sphere based on that solid.
 * @param {number} radius Maximum radius from the center of the solid to one of its vertices.
 * @param {number} level If 0 or less, generates the solid as is. If 1 or greater, subdivides each
 * triangle on the solid's surface into smaller triangles and makes them bulge out to
 * form an approximation of a sphere (the bigger the number, the smaller the triangles).
 * @returns {MeshBuffer} The generated solid.
 */
Polyhedra.icosahedron = function(radius, level) {
  const vi = Polyhedra.icosahedronFaces();
  Polyhedra.makeSphere(vi, radius, level);
  return Polyhedra.makeMesh(vi);
};
/**
 * Generates a mesh of a regular dodecahedron or a sphere based on that solid.
 * @param {number} radius Maximum radius from the center of the solid to one of its vertices.
 * @param {number} level If 0 or less, generates the solid as is. If 1 or greater, subdivides each
 * triangle on the solid's surface into smaller triangles and makes them bulge out to
 * form an approximation of a sphere (the bigger the number, the smaller the triangles).
 * @returns {MeshBuffer} The generated solid.
 */
Polyhedra.dodecahedron = function(radius, level) {
  const vi = Polyhedra.dodecahedronFaces();
  Polyhedra.makeSphere(vi, radius, level);
  return Polyhedra.makeMesh(vi);
};
/**
 * Generates a mesh of a regular tetrahedron or a sphere based on that solid.
 * @param {number} radius Maximum radius from the center of the solid to one of its vertices.
 * @param {number} level If 0 or less, generates the solid as is. If 1 or greater, subdivides each
 * triangle on the solid's surface into smaller triangles and makes them bulge out to
 * form an approximation of a sphere (the bigger the number, the smaller the triangles).
 * @returns {MeshBuffer} The generated solid.
 */
Polyhedra.tetrahedron = function(radius, level) {
  const vi = Polyhedra.tetrahedronFaces();
  Polyhedra.makeSphere(vi, radius, level);
  return Polyhedra.makeMesh(vi);
};
/**
 * Gets the vertices of a regular octahedron with radius 1.
 * @returns {Array<Array<number>>} A two-element array. The first
 * element contains an array of the vertices that make up the solid (each
 * vertex's X, Y, and Z coordinates are stored as three elements of that array),
 * and the second element contains an array of vertex indices (multiplying
 * each element by 3 will get the index to the first coordinate of the corresponding
 * vertex in the first array).
 */
Polyhedra.octahedronFaces = function() {
  const r = 0.7071067811865476;
  const vertices = [
    -r, 0, r, r, 0, r,
    0, 1, 0, r, 0, -r,
    -r, 0, -r, 0, -1, 0
  ];
  const faces = [
    0, 1, 2,
    1, 3, 2,
    3, 4, 2,
    4, 0, 2,
    0, 4, 5,
    4, 3, 5,
    3, 1, 5,
    1, 0, 5
  ];
  return [vertices, faces];
};
/**
 * Gets the vertices of a tetrahedron with radius 1.
 * @returns {Array<Array<number>>} A two-element array. The first
 * element contains an array of the vertices that make up the solid (each
 * vertex's X, Y, and Z coordinates are stored as three elements of that array),
 * and the second element contains an array of vertex indices (multiplying
 * each element by 3 will get the index to the first coordinate of the corresponding
 * vertex in the first array).
 */
Polyhedra.tetrahedronFaces = function() {
  const vertices = [-0.7745966693186049, -0.4472135954331687, 0.4472135954331687, 0.7745966693186049, -0.4472135954331687, 0.4472135954331687, 0.0, 1.0, 0.0, 0.0, -0.4472135954999579, -0.8944271909999159];
  const faces = [0, 1, 2, 1, 3, 2, 3, 0, 2, 0, 3, 1];
  return [vertices, faces];
};
/**
 * Gets the vertices of a regular icosahedron with maximum radius 1.
 * @returns {Array<Array<number>>} A two-element array. The first
 * element contains an array of the vertices that make up the solid (each
 * vertex's X, Y, and Z coordinates are stored as three elements of that array),
 * and the second element contains an array of vertex indices (multiplying
 * each element by 3 will get the index to the first coordinate of the corresponding
 * vertex in the first array).
 */
Polyhedra.icosahedronFaces = function() {
  const vertices = [0.0, 0.8506508083520401, 0.5257311121191336, 0.5257311121191336, 0.0, 0.8506508083520401, -0.5257311121191336, 0.0, 0.8506508083520401, 0.0, -0.8506508083520401, 0.5257311121191336, -0.8506508083520401, 0.5257311121191336, 0.0, -0.8506508083520401, -0.5257311121191336, 0.0, -0.5257311121191336, 0.0, -0.8506508083520401, 0.0, -0.8506508083520401, -0.5257311121191336, 0.0, 0.8506508083520401, -0.5257311121191336, 0.5257311121191336, 0.0, -0.8506508083520401, 0.8506508083520401, 0.5257311121191336, 0.0, 0.8506508083520401, -0.5257311121191336, 0.0];
  const faces = [
    8, 4, 0, 6, 4, 8, 8, 9, 6,
    9, 8, 10, 0, 10, 8, 10, 0, 1,
    2, 1, 0, 0, 4, 2, 5, 2, 4,
    4, 6, 5, 1, 3, 11,
    11, 10, 1, 10, 11, 9,
    2, 5, 3, 3, 1, 2, 3, 7, 11,
    7, 9, 11, 9, 7, 6,
    5, 6, 7, 7, 3, 5
  ];
  return [vertices, faces];
};
/**
 * Gets the vertices of a hexahedron (cube) with maximum radius 1.
 * @returns {Array<Array<number>>} A two-element array. The first
 * element contains an array of the vertices that make up the solid (each
 * vertex's X, Y, and Z coordinates are stored as three elements of that array),
 * and the second element contains an array of vertex indices (multiplying
 * each element by 3 will get the index to the first coordinate of the corresponding
 * vertex in the first array).
 */
Polyhedra.hexahedronFaces = function() {
  const faces = [8, 0, 1, 8, 1, 2, 8, 2, 3, 8, 3, 0, 9, 3, 2, 9, 2, 6, 9, 6, 7, 9, 7, 3, 10, 7, 6, 10, 6, 5, 10, 5, 4, 10, 4, 7, 11, 4, 5, 11, 5, 1, 11, 1, 0, 11, 0, 4, 12, 5, 6, 12, 6, 2, 12, 2, 1, 12, 1, 5, 13, 7, 4, 13, 4, 0, 13, 0, 3, 13, 3, 7];
  const vertices = [-0.5773502691896258, 0.5773502691896258, -0.5773502691896258, 0.5773502691896258, 0.5773502691896258, -0.5773502691896258, 0.5773502691896258, -0.5773502691896258, -0.5773502691896258, -0.5773502691896258, -0.5773502691896258, -0.5773502691896258, -0.5773502691896258, 0.5773502691896258, 0.5773502691896258, 0.5773502691896258, 0.5773502691896258, 0.5773502691896258, 0.5773502691896258, -0.5773502691896258, 0.5773502691896258, -0.5773502691896258, -0.5773502691896258, 0.5773502691896258, 0.0, 0.0, -0.5773502691896258, 0.0, -0.5773502691896258, 0.0, 0.0, 0.0, 0.5773502691896258, 0.0, 0.5773502691896258, 0.0, 0.5773502691896258, 0.0, 0.0, -0.5773502691896258, 0.0, 0.0];
  return [vertices, faces];
};
/**
 * Gets a more compact representation of the vertices of a hexahedron
 * (cube) with maximum radius 1.
 * @returns {Array<Array<number>>} A two-element array. The first
 * element contains an array of the vertices that make up the solid (each
 * vertex's X, Y, and Z coordinates are stored as three elements of that array),
 * and the second element contains an array of vertex indices (multiplying
 * each element by 3 will get the index to the first coordinate of the corresponding
 * vertex in the first array).
 */
Polyhedra.hexahedronFacesCompact = function() {
// Alternate indexing of a hexahedron's faces

  const v = Polyhedra.hexahedronFaces();
  v[0] = v[0].slice(0, 24);
  v[1] = [0, 1, 2, 0, 2, 3, 3, 2, 6, 3, 6, 7, 7, 6, 5, 7, 5, 4, 4, 5, 1, 4, 1, 0, 5, 6, 2, 5, 2, 1, 7, 4, 0, 7, 0, 3];
  return v;
};
/**
 * Gets the vertices of a dodecahedron with maximum radius 1.
 * @returns {Array<Array<number>>} A two-element array. The first
 * element contains an array of the vertices that make up the solid (each
 * vertex's X, Y, and Z coordinates are stored as three elements of that array),
 * and the second element contains an array of vertex indices (multiplying
 * each element by 3 will get the index to the first coordinate of the corresponding
 * vertex in the first array).
 */
Polyhedra.dodecahedronFaces = function() {
  const faces = [20, 16, 12, 20, 12, 8, 20, 8, 4, 20, 4, 0, 20, 0, 16, 21, 2, 1, 21, 1, 0, 21, 0, 4, 21, 4, 5, 21, 5, 2, 22, 6, 5, 22, 5, 4, 22, 4, 8, 22, 8, 9, 22, 9, 6, 23, 9, 10, 23, 10, 11, 23, 11, 7, 23, 7, 6, 23, 6, 9, 24, 13, 14, 24, 14, 15, 24, 15, 11, 24, 11, 10, 24, 10, 13, 25, 17, 18, 25, 18, 19, 25, 19, 15, 25, 15, 14, 25, 14, 17, 26, 3, 7, 26, 7, 11, 26, 11, 15, 26, 15, 19, 26, 19, 3, 27, 10, 9, 27, 9, 8, 27, 8, 12, 27, 12, 13, 27, 13, 10, 28, 14, 13, 28, 13, 12, 28, 12, 16, 28, 16, 17, 28, 17, 14, 29, 18, 17, 29, 17, 16, 29, 16, 0, 29, 0, 1, 29, 1, 18, 30, 1, 2, 30, 2, 3, 30, 3, 19, 30, 19, 18, 30, 18, 1, 31, 5, 6, 31, 6, 7, 31, 7, 3, 31, 3, 2, 31, 2, 5];
  const vertices = [0.5773502691896258, 0.5773502691896258, 0.5773502691896258, 0.0, 0.35682208977309005, 0.9341723589627156, -0.5773502691896258, 0.5773502691896258, 0.5773502691896258, -0.9341723589627156, 0.0, 0.35682208977309005, 0.35682208977309005, 0.9341723589627156, 0.0, -0.35682208977309005, 0.9341723589627156, 0.0, -0.5773502691896258, 0.5773502691896258, -0.5773502691896258, -0.9341723589627156, 0.0, -0.35682208977309005, 0.5773502691896258, 0.5773502691896258, -0.5773502691896258, 0.0, 0.35682208977309005, -0.9341723589627156, 0.0, -0.35682208977309005, -0.9341723589627156, -0.5773502691896258, -0.5773502691896258, -0.5773502691896258, 0.9341723589627156, 0.0, -0.35682208977309005, 0.5773502691896258, -0.5773502691896258, -0.5773502691896258, 0.35682208977309005, -0.9341723589627156, 0.0, -0.35682208977309005, -0.9341723589627156, 0.0, 0.9341723589627156, 0.0, 0.35682208977309005, 0.5773502691896258, -0.5773502691896258, 0.5773502691896258, 0.0, -0.35682208977309005, 0.9341723589627156, -0.5773502691896258, -0.5773502691896258, 0.5773502691896258, 0.6759734692155546, 0.41777457946839347, 0.0, 0.0, 0.6759734692155546, 0.41777457946839347, 0.0, 0.6759734692155546, -0.41777457946839347, -0.41777457946839347, 0.0, -0.6759734692155546, 0.0, -0.6759734692155546, -0.41777457946839347, 0.0, -0.6759734692155546, 0.41777457946839347, -0.6759734692155546, -0.41777457946839347, 0.0, 0.41777457946839347, 0.0, -0.6759734692155546, 0.6759734692155546, -0.41777457946839347, 0.0, 0.41777457946839347, 0.0, 0.6759734692155546, -0.41777457946839347, 0.0, 0.6759734692155546, -0.6759734692155546, 0.41777457946839347, 0.0];
  return [vertices, faces];
};
/**
 * Gets a more compact representation of the vertices of a dodecahedron
 * with maximum radius 1.
 * @returns {Array<Array<number>>} A two-element array. The first
 * element contains an array of the vertices that make up the solid (each
 * vertex's X, Y, and Z coordinates are stored as three elements of that array),
 * and the second element contains an array of vertex indices (multiplying
 * each element by 3 will get the index to the first coordinate of the corresponding
 * vertex in the first array).
 */
Polyhedra.dodecahedronFacesCompact = function() {
// Alternate indexing of a dodecahedron's faces

  const df = Polyhedra.dodecahedronFaces();
  df[0] = df[0].slice(0, 60);
  df[1] = [16, 12, 8, 16, 8, 4, 16, 4, 0, 2, 1, 0, 2, 0, 4, 2, 4, 5, 6, 5, 4, 6, 4, 8, 6, 8, 9, 9, 10, 11, 9, 11, 7, 9, 7, 6, 13, 14, 15, 13, 15, 11, 13, 11, 10, 17, 18, 19, 17, 19, 15, 17, 15, 14, 3, 7, 11, 3, 11, 15, 3, 15, 19, 10, 9, 8, 10, 8, 12, 10, 12, 13, 14, 13, 12, 14, 12, 16, 14, 16, 17, 18, 17, 16, 18, 16, 0, 18, 0, 1, 1, 2, 3, 1, 3, 19, 1, 19, 18, 5, 6, 7, 5, 7, 3, 5, 3, 2];
  return df;
};
