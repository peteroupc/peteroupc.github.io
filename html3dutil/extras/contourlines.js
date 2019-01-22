/** The <code>extras/contourlines.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/contourlines.js";
 * // -- or --
 * import * as CustomModuleName from "extras/contourlines.js";</pre>
 * @module extras/contourlines */

/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {MathUtil, MeshBuffer} from "../h3du_module.js";

/** @ignore */
function contourOne(p1, p2, u1, v1, u2, v2, level, lines) {
  const diff = p2 - p1;
  const offset = (level - p1) / diff;
  const u = u1 + (u2 - u1) * offset;
  const v = v1 + (v2 - v1) * offset;
  lines.push(u, v);
}

/** @ignore */
function contourVertex(p1, p2, p3, u1, v1, u2, v2, u3, v3, level, lines) {
  if(p1 === level && p2 === level) {
    if(p3 === level) {
      // All three vertices are on-level,
      // choose (u1, v1, u2, v2)
      lines.push(u1, v1, u2, v2);
      return;
    }
    lines.push(u1, v1, u2, v2);
    return;
  } else if(p3 === level && p2 === level) {
    lines.push(u2, v2, u3, v3);
    return;
  } else if(p1 === level && p3 === level) {
    lines.push(u1, v1, u3, v3);
    return;
  }
  // At this point, no more than one point
  // can be on-level
  let on = 0;
  let above = 0;
  let below = 0;
  let p1cmp = 0;
  let p2cmp = 0;
  let p3cmp = 0;
  if(p1 === level) {
    on++;
  } else if(p1 > level) {
    above++; p1cmp = 1;
  } else {
    below++; p1cmp = -1;
  }
  if(p2 === level) {
    on++;
  } else if(p2 > level) {
    above++; p2cmp = 1;
  } else {
    below++; p2cmp = -1;
  }
  if(p3 === level) {
    on++;
  } else if(p3 > level) {
    above++; p3cmp = 1;
  } else {
    below++; p3cmp = -1;
  }
  if(p1 === level && above === 1) {
    contourOne(p2, p3, u2, v2, u3, v3, level, lines);
    lines.push(u1, v1);
  } else if(p2 === level && above === 1) {
    contourOne(p1, p3, u1, v1, u3, v3, level, lines);
    lines.push(u2, v2);
  } else if(p3 === level && above === 1) {
    contourOne(p1, p2, u1, v1, u2, v2, level, lines);
    lines.push(u3, v3);
  } else if(on === 0 && above < 3 && below < 3) {
    if(p1cmp === p2cmp) {
      contourOne(p2, p3, u2, v2, u3, v3, level, lines);
      contourOne(p1, p3, u1, v1, u3, v3, level, lines);
    } else if(p2cmp === p3cmp) {
      contourOne(p1, p3, u1, v1, u3, v3, level, lines);
      contourOne(p1, p2, u1, v1, u2, v2, level, lines);
    } else if(p3cmp === p1cmp) {
      contourOne(p1, p2, u1, v1, u2, v2, level, lines);
      contourOne(p2, p3, u2, v2, u3, v3, level, lines);
    }
  }
}

/** @ignore */
function conrec(func, levels, u1, u2, v1, v2, usize, vsize) {
  const array = [];
  const contours = [];
  const invvsize = 1.0 / vsize;
  const invusize = 1.0 / usize;
  const ustep = (u2 - u1) * invusize;
  const vstep = (v2 - v1) * invvsize;
  const halfustep = ustep * 0.5;
  const halfvstep = vstep * 0.5;
  if(levels.length === 0)return contours;
  let minLevel = Number.POSITIVE_INFINITY;
  let maxLevel = Number.NEGATIVE_INFINITY;
  let i;
  for (i = 0; i < levels.length; i++) {
    contours.push([]);
    minLevel = Math.min(minLevel, levels[i]);
    maxLevel = Math.max(maxLevel, levels[i]);
  }
  let v;
  for (v = 0; v <= vsize; v++) {
    const vv = v === vsize ? v2 : v1 + vstep * v;
    let u;
    for (u = 0; u <= usize; u++) {
      const uu = u === usize ? u2 : u1 + ustep * u;
      array.push(func(uu, vv));
    }
  }
  const usizep1 = usize + 1;

  for (v = 0; v < vsize; v++) {
    const row = v * usizep1;
    const nextrow = row + usizep1;
    const vval = v1 + vstep * v;
    const vnextval = v + 1 === vsize ? v2 : vval + vstep;
    const vc = vval + halfvstep;
    let currU = array[row];
    let currUNextRow = array[nextrow];
    let u;
    for (u = 0; u < usize; u++) {
      const uval = u1 + ustep * u;
      const unextval = u + 1 === usize ? u2 : uval + ustep;
      const p1 = currU;
      const p2 = array[row + u + 1];
      const p3 = currUNextRow;
      const p4 = array[nextrow + u + 1];
      currU = p2;
      currUNextRow = p4;
      const maxValue = Math.max(p1, p2, p3, p4);
      const minValue = Math.min(p1, p2, p3, p4);
      if(minValue > maxLevel || maxValue < minLevel) {
        continue;
      }
      const uc = uval + halfustep;
      const pc = (p1 + p2 + p3 + p4) * 0.25;
      let i;
      for (i = 0; i < levels.length; i++) {
        const level = levels[i];
        if(minValue <= level && maxValue >= level) {
          contourVertex(p1, p2, pc, uval, vval, unextval, vval, uc, vc, level, contours[i]);
          contourVertex(p2, p4, pc, unextval, vval, unextval, vnextval, uc, vc, level, contours[i]);
          contourVertex(p3, p4, pc, uval, vnextval, unextval, vnextval, uc, vc, level, contours[i]);
          contourVertex(p1, p3, pc, uval, vval, uval, vnextval, uc, vc, level, contours[i]);
        }
      }
    }
  }
  return contours;
}

/** @ignore */
function drawCurve(contours) {
  const vertices = [];
  let contourIndex;
  for (contourIndex = 0; contourIndex < contours.length; contourIndex++) {
    const contour = contours[contourIndex];
    let i;
    for (i = 0; i < contour.length; i += 4) {
      vertices.push(contour[i], contour[i + 1], 0);
      vertices.push(contour[i + 2], contour[i + 3], 0);
    }
  }
  return MeshBuffer.fromPositions(vertices)
    .setPrimitiveType(MeshBuffer.LINES)
    .setColor([0, 0, 0]);
}
/**
 * Generates contour lines for two-dimensional data.
 * @param {Function} func A function that takes two parameters--a U coordinate
 * and a V coordinate--and returns a number at that point.
 * @param {Array<number>} levels An array of values at which to draw contour lines.
 * For example, if levels is `[20, 25]`, this function will draw contour
 * lines along the values 20 and 25.
 * @param {number} u1 Starting U coordinate to sample.
 * @param {number} u2 Ending U coordinate to sample.
 * @param {number} v1 Starting V coordinate to sample.
 * @param {number} v2 Ending V coordinate to sample.
 * @param {number} usize The number of levels between grid points
 * along the U axis. This method will sample (usize+1)*(vsize+1)
 * grid points in total.
 * @param {number} vsize The number of levels between grid points
 * along the V axis.
 * @returns {MeshBuffer} A mesh buffer of line segments for the contour lines.
 * @example <caption>This example generates contour lines for a simple
 * function. This method samples the function at integer grid points.
 * </caption>
 * var mesh=contourLines((u,v)=>(Math.sin((u+v)/6)),
 * [0, 1, 2, 3],
 * 0,10,0,10,10,10);
 * @function
 */
export const contourLines = function(func, levels, u1, u2, v1, v2, usize, vsize) {
  const contours = conrec(func, levels, u1, u2, v1, v2, usize, vsize);
  return drawCurve(contours);
};

const EPSILON = 1e-9;
const AABBTree = {};

AABBTree.CROSSING = 0;
AABBTree.FRONT = 1;
AABBTree.BACK = 2;
AABBTree.ON = 3;

// NOTE: Planes are as defined in the source library, HE_Mesh,
// not as defined in MathUtil: a normal and a point on the plane (origin).
// In this JavaScript code,
// the first three elements of the plane array are the normal, and
// the next three are the origin.
function classifyPointToPlane3D(planeNormal, planeD, point) {
  // NOTE: HE_Mesh includes fast code and robust code for this
  // function, but only the fast code is used here
  // to keep this code simple
  const d = MathUtil.vec3dot(planeNormal, point) + planeD;
  if (Math.abs(d) < EPSILON) {
    return AABBTree.ON;
  }
  if (d > 0) {
    return AABBTree.FRONT;
  }
  return AABBTree.BACK;
}

function getIntersectionCoordCoordPlane(a, b, planeNormal, planeD) {
  const ab = MathUtil.vec3sub(b, a);
  let t = (-planeD - MathUtil.vec3dot(planeNormal, a)) /
    MathUtil.vec3dot(planeNormal, ab);
  if(t >= -EPSILON && t <= 1.0 + EPSILON) {
    if(t < EPSILON)t = 0;
    if(t > 1.0 - EPSILON)t = 1;
    return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1]),
      a[2] + t * (b[2] - a[2])];
  }
  return null;
}

// NOTE: Assumes polygon is convex. Adapted
// by Peter O. from public-domain Java code
// in the HE_Mesh library.
/** @private
 * @ignore */
function getIntersectionPolygonPlane(poly, planeNormal, planeD, result) {
  let splitVerts = null;
  let a = poly[poly.length - 1];
  let aSide = classifyPointToPlane3D(planeNormal, planeD, a);
  let b;
  let bSide;
  let n;
  for (n = 0; n < poly.length; n++) {
    let inter;
    b = poly[n];
    bSide = classifyPointToPlane3D(planeNormal, planeD, b);
    if (bSide === AABBTree.FRONT) {
      if (aSide === AABBTree.BACK) {
        inter = getIntersectionCoordCoordPlane(b, a, planeNormal, planeD);
        if(!splitVerts)splitVerts = [];
        splitVerts.push(inter);
      }
    } else if (bSide === AABBTree.BACK) {
      if (aSide === AABBTree.FRONT) {
        inter = getIntersectionCoordCoordPlane(a, b, planeNormal, planeD);
        if(!splitVerts)splitVerts = [];
        splitVerts.push(inter);
      }
    }
    if (aSide === AABBTree.ON) {
      if(!splitVerts)splitVerts = [];
      splitVerts.push(a);
    }
    a = b;
    aSide = bSide;
  }
  if(splitVerts && splitVerts.length > 0) {
    let i;
    for (i = 0; i < splitVerts.length; i += 2) {
      if (i + 1 < splitVerts.length && splitVerts[i + 1] !== null) {
        result.push(splitVerts[i][0], splitVerts[i][1],
          splitVerts[i][2], splitVerts[i + 1][0],
          splitVerts[i + 1][1], splitVerts[i + 1][2]);
      }
    }
  }
}
/**
 * Generates a mesh buffer of
 * contour lines along the surface of a 3-dimensional triangle mesh.
 * @param {MeshBuffer} mesh A triangle mesh.  It must contain a "POSITION" buffer
 * attribute with three elements per value. If the number of vertices in the mesh is not divisible by
 * 3, any excess vertices at the end are ignored.
 * @param {Array<Array<number>>} planes An array of 4-element arrays that serve as contour
 * planes. The contour lines will be drawn at the intersection of the contour
 * planes and the surface of the mesh. Each 4-element array describes a plane
 * (A, B, C, D), in that order, whose points satisfy the equation <code>Ax + By + Cz + D = 0</code>, where (x, y, z) is a point lying on the plane.
 * @returns {MeshBuffer} A mesh buffer containing the generated contour lines.
 * Returns null if the input mesh's primitive type isn't triangles, or if
 * the input mesh doesn't contain a "POSITION" buffer attribute with
 * three elements per value.
 */
export function contourLines3D(mesh, planes) {
  if(mesh.primitiveType() !== MeshBuffer.TRIANGLES)return null;
  const p = mesh.getAttribute("POSITION");
  if(!p || p.countPerValue !== 3)return null;
  const planeArray = [];
  let i;
  for (i = 0; i < planes.length; i++) {
    const pl = planes[i];
    planeArray.push([[pl[0], pl[1], pl[2]], pl[3]]);
  }
  const positions = [];
  let count = mesh.vertexCount();
  if(count % 3 !== 0)count -= count % 3;
  const v1 = [0, 0, 0];
  const v2 = [0, 0, 0];
  const v3 = [0, 0, 0];
  const polygon = [v1, v2, v3];
  for (i = 0; i < count; i += 3) {
    p.getVec(mesh.getIndex(i), v1);
    p.getVec(mesh.getIndex(i + 1), v2);
    p.getVec(mesh.getIndex(i + 2), v3);
    let j;
    for (j = 0; j < planeArray.length; j++) {
      const plane = planeArray[j];
      getIntersectionPolygonPlane(polygon, plane[0], plane[1], positions);
    }
  }
  return MeshBuffer.fromPositions(positions)
    .setPrimitiveType(MeshBuffer.LINES);
}
