/* global px, py, pz, qx, qy, qz, v, w */
/** The <code>extras/raypick.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/raypick.js";
 * // -- or --
 * import * as CustomModuleName from "extras/raypick.js";</pre>
 * @module extras/raypick */

/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {MathUtil, MeshBuffer} from "../h3du-module.js";

// Much of the JavaScript code here was adapted quite
// heavily by Peter O. from public-domain Java code
// in the HE_Mesh library. For example,
// AABBTree and much of the code was modified
// to support only triangular faces.

const EPSILON = 1e-9;

function getIntersectionRayBox(ray, box) {
  const d = MathUtil.vec3normalizeInPlace([ray[3], ray[4], ray[5]]); // direction: last 3 elements of ray
  const p = [ray[0], ray[1], ray[2]]; // origin: first 3 elements of ray
  let mn = 0.0;
  let mx = Number.POSITIVE_INFINITY;
  let recip;
  let t1;
  let t2;
  // X intersection
  if (Math.abs(d[0]) < EPSILON) {
    if (p[0] < box[0] || p[0] > box[3]) {
      return null;
    }
  } else {
    recip = 1.0 / d[0];
    t1 = (box[0] - p[0]) * recip;
    t2 = (box[3] - p[0]) * recip;
    mn = Math.max(mn, t1 > t2 ? t2 : t1);
    mx = Math.min(mx, t1 > t2 ? t1 : t2);
    if (mn > mx) {
      return null;
    }
  }
  // Y intersection
  if (Math.abs(d[1]) < EPSILON) {
    if (p[1] < box[1] || p[1] > box[4]) {
      return null;
    }
  } else {
    recip = 1.0 / d[1];
    t1 = (box[1] - p[1]) * recip;
    t2 = (box[4] - p[1]) * recip;
    mn = Math.max(mn, t1 > t2 ? t2 : t1);
    mx = Math.min(mx, t1 > t2 ? t1 : t2);
    if (mn > mx) {
      return null;
    }
  }
  // Z intersection
  if (Math.abs(d[2]) < EPSILON) {
    if (p[2] < box[2] || p[2] > box[5]) {
      return null;
    }
  } else {
    recip = 1.0 / d[2];
    t1 = (box[2] - p[2]) * recip;
    t2 = (box[5] - p[2]) * recip;
    mn = Math.max(mn, t1 > t2 ? t2 : t1);
    mx = Math.min(mx, t1 > t2 ? t1 : t2);
    if (mn > mx) {
      return null;
    }
  }
  return [
    ray[0] + ray[3] * mn,
    ray[1] + ray[4] * mn,
    ray[2] + ray[5] * mn
  ];
}
/*
function polygonToPlane(polygon) {
  if(polygon.length < 3) {
    return [0, 0, 0, 0, 0, 0];
  }
  var normal = MathUtil.vec3cross(polygon[0], polygon[1]);
  var centroid = MathUtil.vec3copy(polygon[0]);
  for(var i = 1; i < polygon.length; i++) {
    var nextIndex = i + 1 === polygon.length ? 0 : i + 1;
    MathUtil.vec3addInPlace(normal,
      MathUtil.vec3cross(polygon[i], polygon[nextIndex]));
    MathUtil.vec3addInPlace(centroid, polygon[i]);
  }
  MathUtil.vec3scaleInPlace(centroid, 1.0 / polygon.length);
  var plane = [
    normal[0], normal[1], normal[2],
    centroid[0], centroid[1], centroid[2]];
  return plane;
}*/

function triangleToPlane(face) {
  const ac = MathUtil.vec3sub(face[0], face[2]);
  const bc = MathUtil.vec3sub(face[1], face[2]);
  // Find a normal of the triangle
  const planeNormal = MathUtil.vec3normalizeInPlace(MathUtil.vec3cross(ac, bc));
  // Find the triangle's centroid, which will lie on the plane
  const planeOrigin = [
    (face[0][0] + face[1][0] + face[2][0]) / 3.0,
    (face[0][1] + face[1][1] + face[2][1]) / 3.0,
    (face[0][2] + face[1][2] + face[2][2]) / 3.0
  ];
  const plane = [
    planeNormal[0], planeNormal[1], planeNormal[2],
    planeOrigin[0], planeOrigin[1], planeOrigin[2]];
  return plane;
}
function getClosestPointToTriangle3D(p, a, b, c) {
  const ab = MathUtil.vec3sub(b, a);
  const ac = MathUtil.vec3sub(c, a);
  const ap = MathUtil.vec3sub(p, a);
  const d1 = MathUtil.vec3dot(ab, ap);
  const d2 = MathUtil.vec3dot(ac, ap);
  if (d1 <= 0 && d2 <= 0) {
    return a;
  }
  const bp = MathUtil.vec3sub(p, b);
  const d3 = MathUtil.vec3dot(ab, bp);
  const d4 = MathUtil.vec3dot(ac, bp);
  if (d3 >= 0 && d4 <= d3) {
    return b;
  }
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) {
    const v = d1 / (d1 - d3);
    return MathUtil.vec3add(a, MathUtil.vec3scale(ab, v));
  }
  const cp = MathUtil.vec3sub(p, c);
  const d5 = MathUtil.vec3dot(ab, cp);
  const d6 = MathUtil.vec3dot(ac, cp);
  if (d6 >= 0 && d5 <= d6) {
    return c;
  }
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) {
    const w = d2 / (d2 - d6);
    return MathUtil.vec3add(a, MathUtil.vec3scale(ac, w));
  }
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
    // w = (d4 - d3) / (d4 - d3 + (d5 - d6));
    const tvec = MathUtil.vec3sub(c, b);
    return MathUtil.vec3add(b, MathUtil.vec3scale(tvec, w));
  }
  // const denom = 1.0 / (va + vb + vc);
  // v = vb * denom;
  // w = vc * denom;
  const abv = MathUtil.vec3scale(ab, v);
  const acw = MathUtil.vec3scale(ac, w);
  return MathUtil.vec3add(a, MathUtil.vec3add(abv, acw));
}

// NOTE: Planes are as defined in the source library, HE_Mesh,
// not as defined in Math
function getIntersectionRayPlane(ray, plane) {
  const r1origin = ray.slice(0, 3);
  const r1direction = MathUtil.vec3normalizeInPlace([ray[3], ray[4], ray[5]]);
  const ab = r1direction;
  const p1normal = plane.slice(0, 3);
  const p1origin = plane.slice(3, 6);
  const p1d = MathUtil.vec3dot(p1normal, p1origin);
  const denom = MathUtil.vec3dot(p1normal, ab);
  let t = p1d - MathUtil.vec3dot(p1normal, r1origin);
  if(denom === 0) {
    // Ray's direction and plane's normal are orthogonal to each
    // other. Assume no intersection.
    return null;
  }
  t /= denom;
  if (t >= -EPSILON) {
    t = Math.max(0, t);
    const result = [
      r1origin[0] + r1direction[0] * t,
      r1origin[1] + r1direction[1] * t,
      r1origin[2] + r1direction[2] * t
    ];
    return result;
  }
  return null;
}
function getIntersectionRayTriangle(ray, face) {
  const lpi = getIntersectionRayPlane(ray, triangleToPlane(face));
  if (typeof lpi !== "undefined" && lpi !== null) {
    const p1 = lpi;
    const tmp = getClosestPointToTriangle3D(p1,
      face[0], face[1], face[2]);
    const dist = MathUtil.vec3dist(tmp, p1);
    if (Math.abs(dist) < EPSILON) {
      return lpi;
    }
  }
  return null;
}

function facesBounds(faces) {
  const inf = Number.POSITIVE_INFINITY;
  const ret = [inf, inf, inf, -inf, -inf, -inf];
  let i;
  for (i = 0; i < faces.length; i++) {
    const face = faces[i];
    if(!face) {
      throw new Error();
    }
    let j;
    for (j = 0; j < 3; j++) {
      ret[0] = Math.min(ret[0], face[j][0]);
      ret[3] = Math.max(ret[3], face[j][0]);
      ret[1] = Math.min(ret[1], face[j][1]);
      ret[4] = Math.max(ret[4], face[j][1]);
      ret[2] = Math.min(ret[2], face[j][2]);
      ret[5] = Math.max(ret[5], face[j][2]);
    }
  }
  return ret;
}

const AABBTree = function(meshBuffer, maxFaces) {
  this.maxLevel = Math.ceil(Math.log(meshBuffer.primitiveCount()) *
    AABBTree.INV_LOG_3);
  this.root = null;
  this.maxFaces = Math.max(1, maxFaces);
  if(meshBuffer.primitiveType() === MeshBuffer.TRIANGLES) {
    this._buildTree(meshBuffer);
  }
};
AABBTree.INV_LOG_3 = 0.9102392266268373;
AABBTree.CROSSING = 0;
AABBTree.FRONT = 1;
AABBTree.BACK = 2;
AABBTree.ON = 3;
// NOTE: Planes are as defined in the source library, HE_Mesh,
// not as defined in MathUtil: a normal and a point on the plane (origin).
// In this JavaScript code,
// the first three elements of the plane array are the normal, and
// the next three are the origin.
function classifyPointToPlane3D(plane, point) {
  // NOTE: HE_Mesh includes fast code and robust code for this
  // function, but only the fast code is used here
  // to keep this code simple
  const planeNormal = plane.slice(0, 3);
  const planeOrigin = plane.slice(3, 6);
  const planeD = MathUtil.vec3dot(planeNormal, planeOrigin);
  const d = MathUtil.vec3dot(planeNormal, point) - planeD;
  if (Math.abs(d) < EPSILON) {
    return AABBTree.ON;
  }
  if (d > 0) {
    return AABBTree.FRONT;
  }
  return AABBTree.BACK;
}

// NOTE: Planes are as defined in the source library, HE_Mesh,
// not as defined in Math
function classifyPolygonToPlane3D(polygon, plane) {
  let numInFront = 0;
  let numBehind = 0;
  let i;
  for (i = 0; i < polygon.length; i++) {
    switch (classifyPointToPlane3D(plane, polygon[i])) {
    case AABBTree.FRONT:
      numInFront++;
      break;
    case AABBTree.BACK:
      numBehind++;
      break;
    default:
    }
    if (numBehind !== 0 && numInFront !== 0) {
      return AABBTree.CROSSING;
    }
  }
  if (numInFront !== 0) {
    return AABBTree.FRONT;
  }
  if (numBehind !== 0) {
    return AABBTree.BACK;
  }
  return AABBTree.ON;
}

function getIntersectionRayTree(ray, tree) {
  const result = [];
  const queue = [];
  queue.push(tree.root);
  let current;
  while (queue.length > 0) {
    current = queue.pop();
    if (getIntersectionRayBox(ray, current.aabb)) {
      if (current.isLeaf) {
        result.push(current);
      } else {
        if (typeof current.positive !== "undefined" && current.positive !== null) {
          queue.push(current.positive);
        }
        if (typeof current.negative !== "undefined" && current.negative !== null) {
          queue.push(current.negative);
        }
        if (typeof current.mid !== "undefined" && current.mid !== null) {
          queue.push(current.mid);
        }
      }
    }
  }
  return result;
}
const AABBNode = function() {
  this.level = -1;
  this.faces = [];
  this.aabb = null;
  this.positive = null;
  this.negative = null;
  this.mid = null;
  this.separator = null;
  this.isLeaf = false;
};
/** @ignore */
AABBTree.prototype._buildTree = function(mesh) {
  this.root = new AABBNode();
  const faces = mesh.getPositions();
  this._buildNode(this.root, faces, 0);
};
/** @ignore */
AABBTree.prototype._buildNode = function(node, faces, level) {
  node.level = level;
  node.aabb = facesBounds(faces);
  if (level === this.maxLevel || faces.length <= this.maxFaces) {
    let i;
    for (i = 0; i < faces.length; i++) {
      node.faces.push(faces[i]);
    }
    node.isLeaf = true;
  } else {
    const pos = [];
    const neg = [];
    const mid = [];
    let plane;
    const levelMod3 = level % 3;
    if (levelMod3 === 0) {
      plane = [0, 0, 1, 0, 0, 0];
    } else if (levelMod3 === 1) {
      plane = [0, 1, 0, 0, 0, 0];
    } else {
      plane = [1, 0, 0, 0, 0, 0];
    }
    const origin = MathUtil.boxCenter(node.aabb);
    plane[3] = origin[0];
    plane[4] = origin[1];
    plane[5] = origin[2];
    node.separator = plane;
    let i;
    for (i = 0; i < faces.length; i++) {
      const face = faces[i];
      const cptp = classifyPolygonToPlane3D(
        face, node.separator);
      if (cptp === AABBTree.CROSSING) {
        mid.push(face);
      } else if (cptp === AABBTree.BACK) {
        neg.push(face);
      } else {
        pos.push(face);
      }
    }
    node.isLeaf = true;
    if (mid.length > 0) {
      node.mid = new AABBNode();
      this._buildNode(node.mid, mid, level + 1);
      node.isLeaf = false;
    }
    if (neg.length > 0) {
      node.negative = new AABBNode();
      this._buildNode(node.negative, neg, level + 1);
      node.isLeaf = false;
    }
    if (pos.length > 0) {
      node.positive = new AABBNode();
      this._buildNode(node.positive, pos, level + 1);
      node.isLeaf = false;
    }
  }
};

function pickPoint(mesh, ray) {
  let p2 = null;
  let p2face = null;
  const candidates = [];
  const nodes = getIntersectionRayTree(ray, new AABBTree(mesh, 10));
  let nIndex;
  for (nIndex = 0; nIndex < nodes.length; nIndex++) {
    const n = nodes[nIndex];
    const faces = n.faces;
    let fIndex;
    for (fIndex = 0; fIndex < faces.length; fIndex++) {
      const f = faces[fIndex];
      candidates.push(f);
    }
  }
  let d21;
  let d2min1 = Number.POSITIVE_INFINITY;
  const rayOrigin = ray.slice(0, 3);
  let faceIndex;
  for (faceIndex = 0; faceIndex < candidates.length; faceIndex++) {
    const face = candidates[faceIndex];
    const sect = getIntersectionRayTriangle(ray, face);
    if (typeof sect !== "undefined" && sect !== null) {
      const p1 = rayOrigin;
      const px = sect[0];
      const py = sect[1];
      const pz = sect[2];
      const qx = p1[0];
      const qy = p1[1];
      const qz = p1[2];
      d21 = (qx - px) * (qx - px) + (qy - py) * (qy - py) + (qz - pz) * (qz - pz);
      if (d21 < d2min1) {
        p2 = sect;
        p2face = face;
        d2min1 = d21;
      }
    }
  }
  // p2 now contains the point on the face
  // that was picked
  const p = p2;
  if (typeof p === "undefined" || p === null) {
    return null;
  }
  let trial;
  let closest = null;
  let d2 = 0;
  let d2min = Number.MAX_VALUE;
  let i;
  for (i = 0; i < 3; i++) {
    trial = p2face[i];
    // p1 = p;
    // px = trial[0];
    // py = trial[1];
    // pz = trial[2];
    // qx = p1[0];
    // qy = p1[1];
    // qz = p1[2];
    d2 = (qx - px) * (qx - px) + (qy - py) * (qy - py) + (qz - pz) * (qz - pz);
    if (d2 < d2min) {
      d2min = d2;
      closest = trial;
    }
  }
  // We now have the closest vertex
  return {
    "point":p2,
    "vertex":closest
  };
}

function makeRay(startPt, focusPt) {
  const dist = MathUtil.vec3sub(focusPt, startPt);
  return [startPt[0], startPt[1], startPt[2], dist[0], dist[1], dist[2]];
}

/* exported raypick */
/**
 * Finds the three-dimensional shape object and world-space coordinates
 * corresponding to the given two-dimensional (X and Y) coordinates.
 * @param x Two-dimensional X coordinate in window space (usually lying within the viewport rectangle). See also the first parameter of
 * MathUtil.vec3fromWindowPoint.
 * @param y Two-dimensional Y coordinate in window space (usually lying within the viewport rectangle). See also the first parameter of
 * MathUtil.vec3fromWindowPoint.
 * @param projView Same meaning as second parameter of
 * MathUtil.vec3fromWindowPoint. For example, to convert
 * to world space coordinates, pass a projection matrix (projection matrix multiplied by the view matrix, in that order) to this parameter.
 * @param viewport Same meaning as third parameter of
 * MathUtil.vec3fromWindowPoint.
 * @param objects Shape objects from which this method
 * will choose one.
 * @returns An object with the following properties:<ul>
 * <li><code>index</code> - Index, starting from 0, into the objects array
 * of the shape object that was picked. Is -1 if no object was picked
 * (and the "local" and "world" properties will be absent).
 * <li><code>local</code> - 3-element array giving the X, Y, and
 * Z coordinates of the picked point in object (model) space.
 * <li><code>world</code> - 3-element array giving the X, Y, and
 * Z coordinates of the picked point in world space.</ul>
 * @example <caption>The following example shows how a hypothetical scene graph could implement picking objects based on the position of the mouse cursor.</caption>
 * var mousePos = scene.getMousePosInPixels();
 * var viewport = [0, 0, scene.getWidth(), scene.getHeight()];
 * var projview = scene.getProjectionViewMatrix();
 * var o = raypick(mousePos.cx, mousePos.cy, projview, viewport, objects);
 * if(o.index >= 0) {
 * pickedShape = objects[o.index];
 * } else {
 * pickedShape = null;
 * }
 * @function
 */
export const raypick = function(x, y, projView, viewport, objects) {
  let near = MathUtil.vec3fromWindowPoint([x, y, 0], projView, viewport);
  let far = MathUtil.vec3fromWindowPoint([x, y, 1], projView, viewport);
  let ray = makeRay(near, far); // Near and far will be in world coordinates
  let bestDist = Number.POSITIVE_INFINITY;
  let ret = {"index":-1};
  let i;
  for (i = 0; i < objects.length; i++) {
    const shape = objects[i];
    // Gets the world coordinates of a box that bounds the shape
    const bounds = shape.getBounds();
    if(MathUtil.boxIsEmpty(bounds)) {
      continue;
    }
    // Check intersection of the ray with the shape's bounding box,
    // which is relatively fast
    if(getIntersectionRayBox(ray, bounds)) {
      const worldMatrix = shape.getMatrix();
      const mvp = MathUtil.mat4multiply(projView, worldMatrix);
      near = MathUtil.vec3fromWindowPoint([x, y, 0], mvp, viewport);
      far = MathUtil.vec3fromWindowPoint([x, y, 1], mvp, viewport);
      ray = makeRay(near, far); // Near and far will be in local coordinates
      const finePick = pickPoint(shape.getMeshBuffer(), ray);
      if(finePick) {
        // Fine pick point will be in local coordinates; convert
        // to world coordinates to check distance from the near plane
        const world = MathUtil.mat4projectVec3(finePick.point, worldMatrix);
        const dist = MathUtil.vec3dist(near, world);
        if(ret.index === -1 || dist < bestDist) {
          // Choose this point if it's the first or closest intersecting point
          // to the near plane
          bestDist = dist;
          ret = {
            "index":i,
            "local":finePick.point,
            "world":world
          };
        }
      }
    }
  }
  return ret;
};
