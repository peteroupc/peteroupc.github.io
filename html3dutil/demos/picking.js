/* global H3DU */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
// Much of the JavaScript code here was adapted quite
// heavily by Peter O. from public-domain Java code
// in the HE_Mesh library. For example,
// AABBTree and much of the code was modified
// to support only triangular faces.

var EPSILON = 1e-9;

function getIntersectionRayBox(ray, box) {
  "use strict";
  var d = H3DU.MathUtil.vec3normalizeInPlace([ray[3], ray[4], ray[5]]); // direction: last 3 elements of ray
  var p = [ray[0], ray[1], ray[2]]; // origin: first 3 elements of ray
  var mn = 0.0;
  var mx = Number.POSITIVE_INFINITY;
  // X intersection
  if (Math.abs(d[0]) < EPSILON) {
    if (p[0] < box[0] || p[0] > box[3]) {
      return null;
    }
  } else {
    var recip = 1.0 / d[0];
    var t1 = (box[0] - p[0]) * recip;
    var t2 = (box[3] - p[0]) * recip;
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

/* exported polygonToPlane */
function polygonToPlane(polygon) {
  "use strict";
  if(polygon.length < 3) {
    return [0, 0, 0, 0, 0, 0];
  }
  var normal = H3DU.MathUtil.vec3cross(polygon[0], polygon[1]);
  var centroid = H3DU.MathUtil.vec3copy(polygon[0]);
  for(var i = 1; i < polygon.length; i++) {
    var nextIndex = i + 1 === polygon.length ? 0 : i + 1;
    H3DU.MathUtil.vec3addInPlace(normal,
      H3DU.MathUtil.vec3cross(polygon[i], polygon[nextIndex]));
    H3DU.MathUtil.vec3addInPlace(centroid, polygon[i]);
  }
  H3DU.MathUtil.vec3scaleInPlace(centroid, 1.0 / polygon.length);
  var plane = [
    normal[0], normal[1], normal[2],
    centroid[0], centroid[1], centroid[2]];
  return plane;
}

function triangleToPlane(face) {
  "use strict";
  var ac = H3DU.MathUtil.vec3sub(face[0], face[2]);
  var bc = H3DU.MathUtil.vec3sub(face[1], face[2]);
  // Find a normal of the triangle
  var planeNormal = H3DU.MathUtil.vec3normalizeInPlace(H3DU.MathUtil.vec3cross(ac, bc));
  // Find the triangle's centroid, which will lie on the plane
  var planeOrigin = [
    (face[0][0] + face[1][0] + face[2][0]) / 3.0,
    (face[0][1] + face[1][1] + face[2][1]) / 3.0,
    (face[0][2] + face[1][2] + face[2][2]) / 3.0
  ];
  var plane = [
    planeNormal[0], planeNormal[1], planeNormal[2],
    planeOrigin[0], planeOrigin[1], planeOrigin[2]];
  return plane;
}
function getClosestPointToTriangle3D(p, a, b, c) {
  "use strict";
  var ab = H3DU.MathUtil.vec3sub(b, a);
  var ac = H3DU.MathUtil.vec3sub(c, a);
  var ap = H3DU.MathUtil.vec3sub(p, a);
  var d1 = H3DU.MathUtil.vec3dot(ab, ap);
  var d2 = H3DU.MathUtil.vec3dot(ac, ap);
  if (d1 <= 0 && d2 <= 0) {
    return a;
  }
  var bp = H3DU.MathUtil.vec3sub(p, b);
  var d3 = H3DU.MathUtil.vec3dot(ab, bp);
  var d4 = H3DU.MathUtil.vec3dot(ac, bp);
  if (d3 >= 0 && d4 <= d3) {
    return b;
  }
  var vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) {
    var v = d1 / (d1 - d3);
    return H3DU.MathUtil.vec3add(a, H3DU.MathUtil.vec3scale(ab, v));
  }
  var cp = H3DU.MathUtil.vec3sub(p, c);
  var d5 = H3DU.MathUtil.vec3dot(ab, cp);
  var d6 = H3DU.MathUtil.vec3dot(ac, cp);
  if (d6 >= 0 && d5 <= d6) {
    return c;
  }
  var vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) {
    var w = d2 / (d2 - d6);
    return H3DU.MathUtil.vec3add(a, H3DU.MathUtil.vec3scale(ac, w));
  }
  var va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
    w = (d4 - d3) / (d4 - d3 + (d5 - d6));
    var tvec = H3DU.MathUtil.vec3sub(c, b);
    return H3DU.MathUtil.vec3add(b, H3DU.MathUtil.vec3scale(tvec, w));
  }
  var denom = 1.0 / (va + vb + vc);
  v = vb * denom;
  w = vc * denom;
  var abv = H3DU.MathUtil.vec3scale(ab, v);
  var acw = H3DU.MathUtil.vec3scale(ac, w);
  return H3DU.MathUtil.vec3add(a, H3DU.MathUtil.vec3add(abv, acw));
}

// NOTE: Planes are as defined in the source library, HE_Mesh,
// not as defined in H3DU.Math
function getIntersectionRayPlane(ray, plane) {
  "use strict";
  var r1origin = ray.slice(0, 3);
  var r1direction = H3DU.MathUtil.vec3normalizeInPlace([ray[3], ray[4], ray[5]]);
  var ab = r1direction;
  var p1normal = plane.slice(0, 3);
  var p1origin = plane.slice(3, 6);
  var p1d = H3DU.MathUtil.vec3dot(p1normal, p1origin);
  var denom = H3DU.MathUtil.vec3dot(p1normal, ab);
  var t = p1d - H3DU.MathUtil.vec3dot(p1normal, r1origin);
  if(denom === 0) {
    // Ray's direction and plane's normal are orthogonal to each
    // other. Assume no intersection.
    return null;
  }
  t /= denom;
  if (t >= -EPSILON) {
    t = Math.max(0, t);
    var result = [
      r1origin[0] + r1direction[0] * t,
      r1origin[1] + r1direction[1] * t,
      r1origin[2] + r1direction[2] * t
    ];
    return result;
  }
  return null;
}
function getIntersectionRayTriangle(ray, face) {
  "use strict";
  var lpi = getIntersectionRayPlane(ray, triangleToPlane(face));
  if (typeof lpi !== "undefined" && lpi !== null) {
    var p1 = lpi;
    var tmp = getClosestPointToTriangle3D(p1,
      face[0], face[1], face[2]);
    var dist = H3DU.MathUtil.vec3dist(tmp, p1);
    if (Math.abs(dist) < EPSILON) {
      return lpi;
    }
  }
  return null;
}

function facesBounds(faces) {
  "use strict";
  var inf = Number.POSITIVE_INFINITY;
  var ret = [inf, inf, inf, -inf, -inf, -inf];
  for(var i = 0; i < faces.length; i++) {
    var face = faces[i];
    if(!face) {
      throw new Error();
    }
    for(var j = 0; j < 3; j++) {
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

var AABBTree = function(meshBuffer, maxFaces) {
  "use strict";
  this.maxLevel = Math.ceil(Math.log(meshBuffer.primitiveCount()) *
    AABBTree.INV_LOG_3);
  this.root = null;
  this.maxFaces = Math.max(1, maxFaces);
  if(meshBuffer.primitiveType() === H3DU.Mesh.TRIANGLES) {
    this._buildTree(meshBuffer);
  }
};
AABBTree.INV_LOG_3 = 0.9102392266268373;
AABBTree.CROSSING = 0;
AABBTree.FRONT = 1;
AABBTree.BACK = 2;
AABBTree.ON = 3;
// NOTE: Planes are as defined in the source library, HE_Mesh,
// not as defined in H3DU.Math: a normal and a point on the plane (origin).
// In this JavaScript code,
// the first three elements of the array are the normal, and
// the next three are the origin.
function classifyPointToPlane3D(plane, point) {
  "use strict";
  // NOTE: HE_Mesh includes fast code and robust code for this
  // function, but only the fast code is used here
  // to keep this code simple
  var planeNormal = plane.slice(0, 3);
  var planeOrigin = plane.slice(3, 6);
  var planeD = H3DU.MathUtil.vec3dot(planeNormal, planeOrigin);
  var d = H3DU.MathUtil.vec3dot(planeNormal, point) - planeD;
  if (Math.abs(d) < EPSILON) {
    return AABBTree.ON;
  }
  if (d > 0) {
    return AABBTree.FRONT;
  }
  return AABBTree.BACK;
}

// NOTE: Planes are as defined in the source library, HE_Mesh,
// not as defined in H3DU.Math
function classifyPolygonToPlane3D(polygon, plane) {
  "use strict";
  var numInFront = 0;
  var numBehind = 0;
  for (var i = 0; i < polygon.length; i++) {
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
  "use strict";
  var result = [];
  var queue = [];
  queue.push(tree.root);
  var current;
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
var AABBNode = function() {
  "use strict";
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
  "use strict";
  this.root = new AABBNode();
  var faces = mesh.getPositions();
  this._buildNode(this.root, faces, 0);
};
/** @ignore */
AABBTree.prototype._buildNode = function(node, faces, level) {
  "use strict";
  node.level = level;
  node.aabb = facesBounds(faces);
  if (level === this.maxLevel || faces.length <= this.maxFaces) {
    for(var i = 0; i < faces.length; i++) {
      node.faces.push(faces[i]);
    }
    node.isLeaf = true;
  } else {
    var pos = [];
    var neg = [];
    var mid = [];
    var plane;
    var levelMod3 = level % 3;
    if (levelMod3 === 0) {
      plane = [0, 0, 1, 0, 0, 0];
    } else if (levelMod3 === 1) {
      plane = [0, 1, 0, 0, 0, 0];
    } else {
      plane = [1, 0, 0, 0, 0, 0];
    }
    var origin = H3DU.MathUtil.boxCenter(node.aabb);
    plane[3] = origin[0];
    plane[4] = origin[1];
    plane[5] = origin[2];
    node.separator = plane;
    for(i = 0; i < faces.length; i++) {
      var face = faces[i];
      var cptp = classifyPolygonToPlane3D(
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
  "use strict";
  var p2 = null;
  var p2face = null;
  var candidates = [];
  var nodes = getIntersectionRayTree(ray, new AABBTree(mesh, 10));
  for(var nIndex = 0; nIndex < nodes.length; nIndex++) {
    var n = nodes[nIndex];
    var faces = n.faces;
    for(var fIndex = 0; fIndex < faces.length; fIndex++) {
      var f = faces[fIndex];
      candidates.push(f);
    }
  }
  var d21,
    d2min1 = Number.POSITIVE_INFINITY;
  var rayOrigin = ray.slice(0, 3);
  for(var faceIndex = 0; faceIndex < candidates.length; faceIndex++) {
    var face = candidates[faceIndex];
    var sect = getIntersectionRayTriangle(ray, face);
    if (typeof sect !== "undefined" && sect !== null) {
      var p1 = rayOrigin;
      var px = sect[0];
      var py = sect[1];
      var pz = sect[2];
      var qx = p1[0];
      var qy = p1[1];
      var qz = p1[2];
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
  var p = p2;
  if (typeof p === "undefined" || p === null) {
    return null;
  }
  var trial;
  var closest = null;
  var d2 = 0;
  var d2min = Number.MAX_VALUE;
  for(var i = 0; i < 3; i++) {
    trial = p2face[i];
    p1 = p;
    px = trial[0];
    py = trial[1];
    pz = trial[2];
    qx = p1[0];
    qy = p1[1];
    qz = p1[2];
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
  "use strict";
  var dist = H3DU.MathUtil.vec3sub(focusPt, startPt);
  return [startPt[0], startPt[1], startPt[2], dist[0], dist[1], dist[2]];
}

/* exported raypick */
/**
 * @param x Same meaning as X coordinate of first parameter of
 * H3DU.MathUtil.vec3fromWindowPoint.
 * @param y Same meaning as Y coordinate of first parameter of
 * H3DU.MathUtil.vec3fromWindowPoint.
 * @param projView Same meaning as second parameter of
 * H3DU.MathUtil.vec3fromWindowPoint.
 * @param viewport Same meaning as third parameter of
 * H3DU.MathUtil.vec3fromWindowPoint.
 * @param objects Shape objects from which this method
 * will choose one.
 */
function raypick(x, y, projView, viewport, objects) {
  "use strict";
  var near = H3DU.MathUtil.vec3fromWindowPoint([x, y, 0], projView, viewport);
  var far = H3DU.MathUtil.vec3fromWindowPoint([x, y, 1], projView, viewport);
  var ray = makeRay(near, far); // Near and far will be in world coordinates
  var bestDist = Number.POSITIVE_INFINITY;
  var ret = {"index":-1};
  for(var i = 0; i < objects.length; i++) {
    var shape = objects[i];
    // Gets the world coordinates of a box that bounds the shape
    var bounds = shape.getBounds();
    if(H3DU.MathUtil.boxIsEmpty(bounds)) {
      continue;
    }
    // Check intersection of the ray with the shape's bounding box,
    // which is relatively fast
    if(getIntersectionRayBox(ray, bounds)) {
      var worldMatrix = shape.getMatrix();
      var mvp = H3DU.MathUtil.mat4multiply(projView, worldMatrix);
      near = H3DU.MathUtil.vec3fromWindowPoint([x, y, 0], mvp, viewport);
      far = H3DU.MathUtil.vec3fromWindowPoint([x, y, 1], mvp, viewport);
      ray = makeRay(near, far); // Near and far will be in local coordinates
      var finePick = pickPoint(shape.getMeshBuffer(), ray);
      if(finePick) {
        // Fine pick point will be in local coordinates; convert
        // to world coordinates to check distance from the near plane
        var world = H3DU.MathUtil.mat4projectVec3(finePick.point, worldMatrix);
        var dist = H3DU.MathUtil.vec3dist(near, world);
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
}
