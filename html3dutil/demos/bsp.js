/* global AABBTree, H3DU, MeshBuffer, classifyPointToPlane3D, classifyPolygonToPlane3D, getIntersectionRayPlane, makeRay, triangleToPlane */
/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under Creative Commons Zero (CC0): http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

/**
 * A binary space partitioning (BSP) tree.
 * @param {Array<Polygon>} An array of polygons forming the BSP tree
 */
function BspTree(polygons) {
  "use strict";
  this.plane = null;
  this.frontTree = null;
  this.backTree = null;
  this.faces = null;
  this._buildNode(polygons);
}
/** @ignore */
BspTree._negatePlane = function(plane) {
  "use strict";
  return [-plane[0], -plane[1], -plane[2], plane[3], plane[4], plane[5]];
};

/** @constructor
 * @ignore */
BspTree._MiniBuilder = function() {
  "use strict";
  this.vertices = [];
  this.indices = [];
  this.addPoly = function(poly) {
    const index = this.vertices.length / 3;
    let i;
    for (i = 0; i < poly.vertices.length; i++) {
      const v = poly.vertices[i];
      // Push vertex positions, then vertex normals
      this.vertices.push(v[0], v[1], v[2],
        poly.plane[0], poly.plane[1], poly.plane[2]);
    }
    for(i = 0; i < poly.vertices.length - 2; i++) {
      this.indices.push(index,
        index + i + 1, index + i + 2);
    }
  };
  this.toMeshBuffer = function() {
    return MeshBuffer.fromPositionsNormals(
      this.vertices, this.indices);
  };
};

/**
 * Generates a mesh buffer containing the polygons
 * stored in this BSP tree.
 * @returns {MeshBuffer} Return value.
 */
BspTree.prototype.toMeshBuffer = function() {
  "use strict";
  const mesh = new BspTree._MiniBuilder();
  this._toMeshInternal(mesh);
  return mesh.toMeshBuffer();
};
/** @ignore */
BspTree.prototype._toMeshInternal = function(mesh) {
  "use strict";
  if(typeof this.faces !== "undefined" && this.faces !== null) {
    let polyIndex;
    for (polyIndex = 0; polyIndex < this.faces.length; polyIndex++) {
      const poly = this.faces[polyIndex];
      mesh.addPoly(poly);
    }
  }
  if(typeof this.frontTree !== "undefined" && this.frontTree !== null) {
    this.frontTree._toMeshInternal(mesh);
  }
  if(typeof this.backTree !== "undefined" && this.backTree !== null) {
    this.backTree._toMeshInternal(mesh);
  }
};
/** @ignore */
BspTree.prototype._getFacesInternal = function(polygons) {
  "use strict";
  if(typeof this.faces !== "undefined" && this.faces !== null) {
    let polygonIndex;
    for (polygonIndex = 0; polygonIndex < this.faces.length; polygonIndex++) {
      const polygon = this.faces[polygonIndex];
      polygons.push(polygon.copy());
    }
  }
  if(typeof this.frontTree !== "undefined" && this.frontTree !== null) {
    this.frontTree._getFacesInternal(polygons);
  }
  if(typeof this.backTree !== "undefined" && this.backTree !== null) {
    this.backTree._getFacesInternal(polygons);
  }
};
/**
 * Gets a copy of the polygons used in this BSP tree.
 * @returns {Array<Polygon>} An array of the polygons.
 */
BspTree.prototype.getPolygons = function() {
  "use strict";
  const p = [];
  this._getFacesInternal(p);
  return p;
};
/**
 * Flips the solid and empty space for this BSP tree.
 * @returns {BspTree} This object.
 */
BspTree.prototype.flip = function() {
  "use strict";
  if(this.plane) {
    this.plane = BspTree._negatePlane(this.plane);
  }
  if(typeof this.faces !== "undefined" && this.faces !== null) {
    let i;
    for (i = 0; i < this.faces.length; i++) {
      this.faces[i].reverseWinding();
    }
  }
  const ft = this.frontTree;
  const bt = this.backTree;
  if(typeof ft !== "undefined" && ft !== null) {
    ft.flip();
  }
  if(typeof bt !== "undefined" && bt !== null) {
    bt.flip();
  }
  this.frontTree = bt;
  this.backTree = ft;
  return this;
};
/**
 * Describes a convex polygon.
 * @param {<Array<Array<number>>} verts An array of three 3-element vectors
 * describing a triangle.
 * @constructor
 */
function Polygon(verts) {
  "use strict";
  this.plane = null;
  this.vertices = [];
  if(verts) {
    if(verts.length !== 3)throw new Error();
    this.vertices = verts;
    this.plane = triangleToPlane(verts);
  }
  this.copy = function() {
    const p = new Polygon();
    p.plane = this.plane.slice(0, this.plane.length);
    p.vertices = this.vertices.slice(0, this.vertices.length);
    return p;
  };
  this.reverseWinding = function() {
    const half = this.vertices.length / 2 | 0;
    let right = this.vertices.length - 1;
    let i;
    for (i = 0; i < half; i++, right--) {
      const value = this.vertices[i];
      this.vertices[i] = this.vertices[right];
      this.vertices[right] = value;
    }
    this.plane = BspTree._negatePlane(this.plane);
  };
}
/** @ignore */
BspTree._classifyPolygons = function(polygons, plane) {
  "use strict";
  const frontFaces = [];
  const backFaces = [];
  const crossingFaces = [];
  const onFaces = [];
  let polyIndex;
  for (polyIndex = 0; polyIndex < polygons.length; polyIndex++) {
    const poly = polygons[polyIndex];
    switch (classifyPolygonToPlane3D(poly.vertices, plane)) {
    case AABBTree.FRONT:
      frontFaces.push(poly);
      break;
    case AABBTree.BACK:
      backFaces.push(poly);
      break;
    case AABBTree.ON:
      onFaces.push(poly);
      break;
    case AABBTree.CROSSING:
      crossingFaces.push(poly);
      break;
    default:
      break;
    }
  }
  return {
    "plane":plane,
    "frontFaces":frontFaces,
    "backFaces":backFaces,
    "crossingFaces":crossingFaces,
    "onFaces":onFaces
  };
};
/** @ignore */
BspTree._splitPolygon = function(poly, splitPlane, info) {
  "use strict";
  const front = new Polygon();
  const back = new Polygon();
  if(!poly.plane)throw new Error();
  front.plane = back.plane = poly.plane;
  let p1;
  let p2;
  let c1;
  let c2;
  p1 = poly.vertices[poly.vertices.length - 1];
  c1 = classifyPointToPlane3D(splitPlane, p1);
  let i;
  for (i = 0; i < poly.vertices.length; i++) {
    p2 = poly.vertices[i];
    c2 = classifyPointToPlane3D(splitPlane, p2);
    const cls = c1 << 4 | c2;
    if(cls === (AABBTree.BACK << 4 | AABBTree.FRONT) ||
    cls === (AABBTree.FRONT << 4 | AABBTree.BACK)) {
      const p = getIntersectionRayPlane(makeRay(p1, p2),
        splitPlane);
      front.vertices.push(p);
      back.vertices.push(p);
    }
    if (c2 !== AABBTree.FRONT) {
      back.vertices.push(p2);
    }
    if (c2 !== AABBTree.BACK) {
      front.vertices.push(p2);
    }
    p1 = p2;
    c1 = c2;
  }
  if(front.vertices.length < 3 || back.vertices.length < 3) {
    throw new Error();
  }
  info.frontFaces.push(front);
  info.backFaces.push(back);
};
/** @ignore */
BspTree._addAll = function(dst, src) {
  "use strict";
  let elemIndex;
  for (elemIndex = 0; elemIndex < src.length; elemIndex++) {
    const elem = src[elemIndex];
    dst.push(elem);
  }
};
/** @ignore */
BspTree._handleOnAndCrossing = function(info, plane) {
  "use strict";
  const splittingPlaneNormal = plane.slice(0, 3);
  let i;
  for (i = 0; i < info.onFaces.length; i++) {
    const polygon = info.onFaces[i];
    const polyNormal = polygon.plane.slice(0, 3);
    const dot = H3DU.MathUtil.vec3dot(splittingPlaneNormal, polyNormal);
    if (dot > 0) {
      info.frontFaces.push(polygon);
    } else {
      info.backFaces.push(polygon);
    }
  }
  for(i = 0; i < info.crossingFaces.length; i++) {
    BspTree._splitPolygon(info.crossingFaces[i], plane, info);
  }
};
/** @ignore */
BspTree.prototype._clipInternal = function(polygons) {
  "use strict";
  polygons = polygons || [];
  let ret = [];
  let info;
  if(this.plane) {
    info = BspTree._classifyPolygons(polygons, this.plane);
    BspTree._handleOnAndCrossing(info, this.plane);
    BspTree._addAll(ret, info.frontFaces);
  } else {
    return polygons.slice(0, polygons.length);
  }
  if(typeof this.frontTree !== "undefined" && this.frontTree !== null) {
    if(this.frontTree.plane) {
      ret = this.frontTree._clipInternal(ret);
    }
  }
  if(typeof this.backTree !== "undefined" && this.backTree !== null) {
    BspTree._addAll(ret, this.backTree._clipInternal(info.backFaces));
  }
  return ret;
};
/**
 * Clips the solid areas of another BSP tree out of this one.
 * @param {BspTree} node Another BSP tree.
 * @returns {BspTree} This object.
 */
BspTree.prototype.clip = function(node) {
  "use strict";
  this.faces = node._clipInternal(this.faces);
  if(typeof this.frontTree !== "undefined" && this.frontTree !== null) {
    this.frontTree.clip(node);
  }
  if(typeof this.backTree !== "undefined" && this.backTree !== null) {
    this.backTree.clip(node);
  }
  return this;
};
/**
 * Generates a BSP tree from a mesh buffer.
 * @param {MeshBuffer} mesh A mesh buffer.
 * @returns {BspTree} The resulting BSP tree.
 */
BspTree.fromMeshBuffer = function(mesh) {
  "use strict";
  if(mesh.primitiveType() === H3DU.Mesh.TRIANGLES) {
    const polys = mesh.getPositions();
    const polygons = [];
    let polyIndex;
    for (polyIndex = 0; polyIndex < polys.length; polyIndex++) {
      const poly = polys[polyIndex];
      polygons.push(new Polygon(poly));
    }
    return new BspTree(polygons);
  } else {
    return new BspTree([]);
  }
};
/**
 * Creates a copy of this BSP tree.
 * @returns {BspTree} A copy of this object.
 */
BspTree.prototype.copy = function() {
  "use strict";
  return new BspTree(this.getPolygons());
};
/** @ignore */
BspTree.prototype._clipflip2 = function(other) {
  "use strict";
  let i;
  for (i = 0; i < 2; i++) {
    this.clip(other).flip();
  }
  return this;
};
/**
 * Generates a BSP tree that consists of the solid areas of
 * this tree or the given tree or both.
 * @param {BspTree} other The second BSP tree.
 * @returns {BspTree} The resulting tree.
 */
BspTree.prototype.union = function(other) {
  "use strict";
  const otherBsp = other.copy();
  const thisBsp = this.copy().clip(otherBsp);
  return new BspTree(
    thisBsp.getPolygons().concat(
      otherBsp._clipflip2(thisBsp).getPolygons()));
};
/**
 * Generates a BSP tree that consists of the solid areas of
 * this tree that are not common to the given tree.
 * @param {BspTree} other The second BSP tree.
 * @returns {BspTree} The resulting tree.
 */
BspTree.prototype.difference = function(other) {
  "use strict";
  const otherBsp = other.copy();
  const thisBsp = this.copy().flip().clip(otherBsp);
  return new BspTree(
    thisBsp.getPolygons().concat(
      otherBsp._clipflip2(thisBsp).getPolygons())).flip();
};
/**
 * Generates a BSP tree that consists of the solid areas common
 * to both this tree and the given tree.
 * @param {BspTree} other The second BSP tree.
 * @returns {BspTree} The resulting tree.
 */
BspTree.prototype.intersection = function(other) {
  "use strict";
  const thisBsp = this.copy().flip();
  const otherBsp = other.copy().clip(thisBsp).flip();
  return new BspTree(
    thisBsp.clip(otherBsp).getPolygons().concat(
      otherBsp.getPolygons())).flip();
};
/**
 * Generates a BSP tree that consists of the solid areas of
 * this tree or the given tree but not both.
 * @param {BspTree} other The second BSP tree.
 * @returns {BspTree} The resulting tree.
 */
BspTree.prototype.xor = function(other) {
  "use strict";
  return this.union(other).difference(this.intersection(other));
};
/** @ignore */
BspTree.prototype._buildNode = function(polygons) {
  "use strict";
  if(polygons.length === 0) {
    this.faces = [];
    this.plane = [0, 0, 0];
    return this;
  }
  if(polygons.length === 1) {
    this.faces = polygons;
    this.plane = polygons[0].plane;
    if(typeof polygons[0].plane === "undefined" || polygons[0].plane === null)throw new Error();
    return this;
  }
  let info = null;
  let best = -1;
  let p1Index;
  for (p1Index = 0; p1Index < polygons.length; p1Index++) {
    const p1 = polygons[p1Index];
    const r = BspTree._classifyPolygons(polygons, p1.plane);
    // See <https://groups.google.com/d/msg/comp.graphics.algorithms/XRtRJvWLDLA/cEJCV9AlimcJ>,
    // by Tim Sweeney
    const score = Math.abs(r.frontFaces.length - r.backFaces.length) * 20 +
      r.crossingFaces.length * 80;
    if (best === -1 || score < best) {
      best = score;
      info = r;
    }
  }
  const splittingPlane = info.plane;
  let i;
  for (i = 0; i < info.crossingFaces.length; i++) {
    BspTree._splitPolygon(info.crossingFaces[i], splittingPlane, info);
  }
  if(info.onFaces.length > 0) {
    if(!this.faces) {
      this.faces = [];
    }
    this.plane = splittingPlane;
    BspTree._addAll(this.faces, info.onFaces);
  }
  if (info.frontFaces.length > 0) {
    this.frontTree = new BspTree(info.frontFaces);
  }
  if(info.backFaces.length > 0) {
    this.backTree = new BspTree(info.backFaces);
  }
  return this;
};
