/* global v, ve */
/** The <code>extras/convex.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/convex.js";
 * // -- or --
 * import * as CustomModuleName from "extras/convex.js";</pre>
 * @module extras/convex */

/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under the Unlicense: https://unlicense.org/
*/

import {MathUtil, MeshBuffer} from "../h3du_module.js";

// Adapted by Peter O. from a public-domain
// C++ implementation found at https://github.com/akuukka/quickhull

function QuickHull() {
  this.epsilon = 0;
  this.epsilonSquared = 0;
  this.scale = 0;
  this.planar = false;
  this.planarPointCloudTemp = [];
  this.vertexData = [];
  this.mesh = [];
  this.extremeValues = [];
  this.newFaceIndices = [];
  this.newHalfEdgeIndices = [];
  this.disabledFacePointVectors = [];
  this.indexVectorPool = [];
}
/** @ignore */
QuickHull._HalfEdge = function(a, b, c, d) {
  this.endVertex = a;
  this.opp = b;
  this.face = c;
  this.next = d;
  this.disable = function() {
    this.endVertex = Number.POSITIVE_INFINITY;
  };
  this.isDisabled = function() {
    return this.endVertex === Number.POSITIVE_INFINITY;
  };
};
/** @ignore */
QuickHull._FaceData = function(fi, he) {
  this.faceIndex = fi;
  this.enteredFromHalfEdge = he; // If the face turns out not to be visible, this half edge will be marked as horizon edge
};
/** @ignore */
QuickHull._MeshFace = function(he) {
  this.he = he;
  this.P = [0, 0, 0, 0];
  this.mostDistantPointDist = 0;
  this.mostDistantPoint = 0;
  this.visibilityCheckedOnOrientation = 0;
  this.inFaceStack = 0;
  this.horizonEdgesOnCurrentIteration = 0;
  this.pointsOnPositiveSide = [];
  this.disable = function() {
    this.he = Number.POSITIVE_INFINITY;
  };
  this.isDisabled = function() {
    return this.he === Number.POSITIVE_INFINITY;
  };
};
/** @ignore */
QuickHull._HalfEdgeMesh = function(builderObject, vertexData ) {
  this.vertices = [];
  this.faces = [];
  this.halfEdges = [];
  const faceMapping = [];
  const halfEdgeMapping = [];
  const vertexMapping = [];
  let i = 0;
  let faceIndex;
  for (faceIndex = 0; faceIndex < builderObject.faces.length; faceIndex++) {
    const face = builderObject.faces[faceIndex];
    if (!face.isDisabled()) {
      this.faces.push({"halfEdgeIndex":face.he});
      faceMapping[i] = this.faces.length - 1;
      const heIndices = builderObject.getHalfEdgeIndicesOfFace(face);
      let heIndexIndex;
      for (heIndexIndex = 0; heIndexIndex < heIndices.length; heIndexIndex++) {
        const heIndex = heIndices[heIndexIndex];
        const vertexIndex = builderObject.halfEdges[heIndex].endVertex;
        if (vertexMapping.count(vertexIndex) === 0) {
          this.vertices.push(vertexData[vertexIndex]);
          vertexMapping[vertexIndex] = this.vertices.length - 1;
        }
      }
    }
    i++;
  }

  i = 0;
  let halfEdgeIndex;
  for (halfEdgeIndex = 0; halfEdgeIndex < builderObject.halfEdges.length; halfEdgeIndex++) {
    const halfEdge = builderObject.halfEdges[halfEdgeIndex];
    if (!halfEdge.isDisabled()) {
      this.halfEdges.push(new QuickHull._HalfEdge(halfEdge.endVertex, halfEdge.opp, halfEdge.face, halfEdge.next));
      halfEdgeMapping[i] = this.halfEdges.length - 1;
    }
    i++;
  }

  for (faceIndex = 0; faceIndex < this.faces.length; faceIndex++) {
    const cface = this.faces[faceIndex];
    if(!(halfEdgeMapping.count(cface.halfEdgeIndex) === 1)) {
      throw new Error();
    }
    cface.halfEdgeIndex = halfEdgeMapping[cface.halfEdgeIndex];
  }

  let heIndex;
  for (heIndex = 0; heIndex < this.halfEdges.length; heIndex++) {
    const he = this.halfEdges[heIndex];
    he.face = faceMapping[he.face];
    he.opp = halfEdgeMapping[he.opp];
    he.next = halfEdgeMapping[he.next];
    he.endVertex = vertexMapping[he.endVertex];
  }
};
/** @ignore */
QuickHull._MeshBuilder = function(a, b, c, d) {
  if(typeof a === "undefined" || a === null) {
    this.halfEdges = [];
    this.faces = [];
  } else {
    this.halfEdges = [
      new QuickHull._HalfEdge(b, 6, 0, 1),
      new QuickHull._HalfEdge(c, 9, 0, 2),
      new QuickHull._HalfEdge(a, 3, 0, 0),
      new QuickHull._HalfEdge(c, 2, 1, 4),
      new QuickHull._HalfEdge(d, 11, 1, 5),
      new QuickHull._HalfEdge(a, 7, 1, 3),
      new QuickHull._HalfEdge(a, 0, 2, 7),
      new QuickHull._HalfEdge(d, 5, 2, 8),
      new QuickHull._HalfEdge(b, 10, 2, 6),
      new QuickHull._HalfEdge(b, 1, 3, 10),
      new QuickHull._HalfEdge(d, 8, 3, 11),
      new QuickHull._HalfEdge(c, 4, 3, 9)
    ];
    this.faces = [
      new QuickHull._MeshFace(0),
      new QuickHull._MeshFace(3),
      new QuickHull._MeshFace(6),
      new QuickHull._MeshFace(9)
    ];
  }
  this.disabledHalfEdges = [];
  this.disabledFaces = [];
  this.getVertexIndicesOfFace = function(f) {
    let h = this.halfEdges[f.he];
    const ret = [h.endVertex, 0, 0];
    h = this.halfEdges[h.next];
    ret[1] = h.endVertex;
    h = this.halfEdges[h.next];
    ret[2] = h.endVertex;
    return ret;
  };
  this.addHalfEdge = function() {
    if(this.disabledHalfEdges.size > 0) {
      return this.disabledHalfEdges.pop();
    }
    this.halfEdges.push(new QuickHull._HalfEdge(Number.POSITIVE_INFINITY, 0, 0, 0));
    return this.halfEdges.length - 1;
  };
  this.addFace = function() {
    if(this.disabledFaces.size > 0) {
      const index = this.disabledFaces.pop();
      const f = this.faces[index];
      if(f.isDisabled()) {
        throw new Error();
      }
      if(!(f.pointsOnPositiveSide.length === 0)) {
        throw new Error();
      }
      f.mostDistantPointDist = 0;
      return index;
    }
    this.faces.push(new QuickHull._MeshFace(Number.POSITIVE_INFINITY));
    return this.faces.length - 1;
  };
  this.disableHalfEdge = function(index) {
    this.halfEdges[index].disable();
    this.disabledHalfEdges.push(index);
  };
  this.disableFace = function(index) {
    this.faces[index].disable();
    this.disabledFaces.push(index);
    return this.faces[index].pointsOnPositiveSide;
  };
  this.getVertexIndicesOfHalfEdge = function(he) {
    return [this.halfEdges[he.opp].endVertex, he.endVertex];
  };
  this.getHalfEdgeIndicesOfFace = function(f) {
    return [f.he, this.halfEdges[f.he].next,
      this.halfEdges[this.halfEdges[f.he].next].next];
  };
  this.toMeshVerticesIndices = function(points) {
    const faceProcessed = [];
    let i;
    for (i = 0; i < this.faces.size; i++) {
      faceProcessed[i] = false;
    }
    const faceStack = [];

    for (i = 0; i < this.faces.length; i++) {
      if(!this.faces[i].isDisabled()) {
        faceStack.push(i);
        break;
      }
    }
    const meshVertices = [];

    for (i = 0; i < points.length; i++) {
      const pt = points[i];
      meshVertices.push(pt[0], pt[1], pt[2]);
    }
    const meshIndices = [];
    while(faceStack.length > 0) {
      const top = faceStack.pop();
      if(this.faces[top].isDisabled()) {
        throw new Error();
      }
      if(faceProcessed[top]) {
        continue;
      } else {
        faceProcessed[top] = true;
        const halfEdges = this.getHalfEdgeIndicesOfFace(this.faces[top]);
        const vertices = this.getVertexIndicesOfFace(this.faces[top]);
        const adjacent = [
          this.halfEdges[this.halfEdges[halfEdges[0]].opp].face,
          this.halfEdges[this.halfEdges[halfEdges[1]].opp].face,
          this.halfEdges[this.halfEdges[halfEdges[2]].opp].face];
        let aIndex;
        for (aIndex = 0; aIndex < adjacent.length; aIndex++) {
          const a = adjacent[aIndex];
          if(!faceProcessed[a] && !this.faces[a].isDisabled()) {
            faceStack.push(a);
          }
        }
        meshIndices.push(vertices[0], vertices[1], vertices[2]);
      }
    }
    return [meshVertices, meshIndices];
  };
};
/** @ignore */
QuickHull.prototype.addPointToFace = function(f, pointIndex) {
  const D = QuickHull._getSignedDistanceToPlane(this.vertexData[ pointIndex ], f.P);
  const n = f.P.slice(0, 3);
  const sqrNLength = MathUtil.vec3dot(n, n);
  if (D > 0 && D * D > this.epsilonSquared * sqrNLength) {
    f.pointsOnPositiveSide.push(pointIndex);
    if (D > f.mostDistantPointDist) {
      f.mostDistantPointDist = D;
      f.mostDistantPoint = pointIndex;
    }
    return true;
  }
  return false;
};
/** @ignore */
QuickHull.prototype.buildMesh = function(pointCloud, epsilon) {
  if (pointCloud.length === 0) {
    this.mesh = new QuickHull._MeshBuilder();
    return;
  }
  this.vertexData = pointCloud;

  // Very first: find extreme values and use them to compute the scale of the point cloud.
  this.extremeValues = this.getExtremeValues();
  this.scale = this.getScale(this.extremeValues);

  // Epsilon we use depends on the scale
  this.epsilon = epsilon * this.scale;
  this.epsilonSquared = this.epsilon * this.epsilon;
  this.planar = false; // The planar case happens when all the points appear to lie on a two dimensional subspace of R^3.
  this.createConvexHalfEdgeMesh();
  if (this.planar) {
    const extraPointIndex = this.planarPointCloudTemp.length - 1;
    let heIndex;
    for (heIndex = 0; heIndex < this.mesh.halfEdges.length; heIndex++) {
      const he = this.mesh.halfEdges[heIndex];
      if (he.endVertex === extraPointIndex) {
        he.endVertex = 0;
      }
    }
    this.vertexData = pointCloud;
    this.planarPointCloudTemp.splice(0, this.planarPointCloudTemp.length);
  }
};
/** @ignore */
QuickHull.prototype.createConvexHalfEdgeMesh = function() {
  // Temporary variables used during iteration
  const visibleFaces = [];
  const horizonEdges = [];
  let halfEdges;
  const possiblyVisibleFaces = [];
  // Compute base tetrahedron
  this.mesh = this.getInitialTetrahedron();
  if(!(this.mesh.faces.length === 4)) {
    throw new Error();
  }

  // Init face stack with those faces that have points assigned to them
  const faceList = [];
  let i;
  for (i = 0; i < 4; i++) {
    const f = this.mesh.faces[i];
    if (f.pointsOnPositiveSide && f.pointsOnPositiveSide.length > 0) {
      faceList.push(i);
      f.inFaceStack = 1;
    }
  }

  // Process faces until the face list is empty.
  let iter = 0;
  while (faceList.length > 0) {
    iter++;
    const topFaceIndex = faceList[0];
    faceList.shift();
    const tf = this.mesh.faces[topFaceIndex];
    tf.inFaceStack = 0;
    if (tf.pointsOnPositiveSide.length === 0 || tf.isDisabled()) {
      continue;
    }

    // Pick the most distant point to this triangle plane as the point to which we extrude
    const activePoint = this.vertexData[tf.mostDistantPoint];
    const activePointIndex = tf.mostDistantPoint;
    // Find out the faces that have our active point on their positive side (these are
    // the "visible faces"). The face on top of the stack of course is one of them. At the same time,
    // we create a list of horizon edges.
    horizonEdges.splice(0, horizonEdges.length);
    possiblyVisibleFaces.splice(0, possiblyVisibleFaces.length);
    visibleFaces.splice(0, visibleFaces.length);
    possiblyVisibleFaces.push(new QuickHull._FaceData(topFaceIndex, Number.POSITIVE_INFINITY));
    while (possiblyVisibleFaces.length > 0) {
      const faceData = possiblyVisibleFaces.pop();
      const pvf = this.mesh.faces[faceData.faceIndex];
      if(pvf.isDisabled()) {
        throw new Error();
      }
      if (pvf.visibilityCheckedOnIteration === iter) {
        if (pvf.isVisibleFaceOnCurrentIteration) {
          continue;
        }
      } else {
        const P = pvf.P;
        pvf.visibilityCheckedOnIteration = iter;
        const d = QuickHull._getSignedDistanceToPlane(activePoint, P);
        if (d > 0) {
          pvf.isVisibleFaceOnCurrentIteration = 1;
          pvf.horizonEdgesOnCurrentIteration = 0;
          visibleFaces.push(faceData.faceIndex);
          const heindices = this.mesh.getHalfEdgeIndicesOfFace(pvf);
          let heIndexIndex;
          for (heIndexIndex = 0; heIndexIndex < heindices.length; heIndexIndex++) {
            const heIndex = heindices[heIndexIndex];
            if (this.mesh.halfEdges[heIndex].opp !== faceData.enteredFromHalfEdge) {
              possiblyVisibleFaces.push(new QuickHull._FaceData(this.mesh.halfEdges[
                this.mesh.halfEdges[heIndex].opp].face, heIndex));
            }
          }
          continue;
        }
        if(!(faceData.faceIndex !== topFaceIndex)) {
          throw new Error();
        }
      }

      // The face is not visible. Therefore, the halfedge we came from is part of the horizon edge.
      pvf.isVisibleFaceOnCurrentIteration = 0;
      horizonEdges.push(faceData.enteredFromHalfEdge);
      // Store which half edge is the horizon edge. The other half edges of the face will not be part of the final mesh so their data slots can by recycled.
      const halfEdges = this.mesh.getHalfEdgeIndicesOfFace(
        this.mesh.faces[this.mesh.halfEdges[faceData.enteredFromHalfEdge].face]);
      const ind = halfEdges[0] === faceData.enteredFromHalfEdge ? 0 :
        halfEdges[1] === faceData.enteredFromHalfEdge ? 1 : 2;
      this.mesh.faces[this.mesh.halfEdges[faceData.enteredFromHalfEdge].face]
        .horizonEdgesOnCurrentIteration |= 1 << ind;
    }
    const horizonEdgeCount = horizonEdges.length;
    // Order horizon edges so that they form a loop. This may fail due to numerical instability in which case we give up trying to solve horizon edge for this point and accept a minor degeneration in the convex hull.
    if (!this.reorderHorizonEdges(horizonEdges)) {
      console.log("Failed to solve horizon edge.");
      let acIndex;
      for (acIndex = 0; acIndex < tf.pointsOnPositiveSide.length; acIndex++) {
        const ac = tf.pointsOnPositiveSide[acIndex];
        if(ac === activePointIndex) {
          tf.pointsOnPositiveSide.splice(acIndex, 1);
          break;
        }
      }
      continue;
    }
    // Except for the horizon edges, all half edges of the visible faces can be marked as disabled. Their data slots will be reused.
    // The faces will be disabled as well, but we need to remember the points that were on the positive side of them - therefore
    // we save pointers to them.
    this.newFaceIndices.splice(0, this.newFaceIndices.length);
    this.newHalfEdgeIndices.splice(0, this.newHalfEdgeIndices.length);
    this.disabledFacePointVectors.splice(0, this.disabledFacePointVectors.length);
    let disableCounter = 0;
    let faceIndexIndex;
    let newFace;
    let newFaceIndex;
    for (faceIndexIndex = 0; faceIndexIndex < visibleFaces.length; faceIndexIndex++) {
      const faceIndex = visibleFaces[faceIndexIndex];
      const disabledFace = this.mesh.faces[faceIndex];
      halfEdges = this.mesh.getHalfEdgeIndicesOfFace(disabledFace);
      let j;
      for (j = 0; j < 3; j++) {
        if ((disabledFace.horizonEdgesOnCurrentIteration & 1 << j) === 0) {
          if (disableCounter < horizonEdgeCount * 2) {
            // Use on this iteration
            this.newHalfEdgeIndices.push(halfEdges[j]);
            disableCounter++;
          } else {
            // Mark for reuse on later iteration step
            this.mesh.disableHalfEdge(halfEdges[j]);
          }
        }
      }
      // Disable the face, but retain pointer to the points that were on the positive side of it. We need to assign those points
      // to the new faces we create shortly.
      const t = this.mesh.disableFace(faceIndex);
      if (t.length > 0) {
        this.disabledFacePointVectors.push(t);
      }
    }
    if (disableCounter < horizonEdgeCount * 2) {
      const newHalfEdgesNeeded = horizonEdgeCount * 2 - disableCounter;
      let i;
      for (i = 0; i < newHalfEdgesNeeded; i++) {
        this.newHalfEdgeIndices.push(this.mesh.addHalfEdge());
      }
    }
    // Create new faces using the edgeloop
    let i;
    for (i = 0; i < horizonEdgeCount; i++) {
      const AB = horizonEdges[i];
      const horizonEdgeVertexIndices = this.mesh.getVertexIndicesOfHalfEdge(this.mesh.halfEdges[AB]);

      const A = horizonEdgeVertexIndices[0];

      const B = horizonEdgeVertexIndices[1];
      const C = activePointIndex;
      const newFaceIndex = this.mesh.addFace();
      this.newFaceIndices.push(newFaceIndex);

      const CA = this.newHalfEdgeIndices[2 * i + 0];
      const BC = this.newHalfEdgeIndices[2 * i + 1];

      this.mesh.halfEdges[AB].next = BC;
      this.mesh.halfEdges[BC].next = CA;
      this.mesh.halfEdges[CA].next = AB;

      this.mesh.halfEdges[BC].face = newFaceIndex;
      this.mesh.halfEdges[CA].face = newFaceIndex;
      this.mesh.halfEdges[AB].face = newFaceIndex;

      this.mesh.halfEdges[CA].endVertex = A;
      this.mesh.halfEdges[BC].endVertex = C;

      newFace = this.mesh.faces[newFaceIndex];

      const planeNormal = QuickHull._getTriangleNormal(this.vertexData[A], this.vertexData[B], activePoint);
      newFace.P = MathUtil.planeFromNormalAndPoint(planeNormal, activePoint);
      newFace.he = AB;

      this.mesh.halfEdges[CA].opp = this.newHalfEdgeIndices[i > 0 ? i * 2 - 1 : 2 * horizonEdgeCount - 1];
      this.mesh.halfEdges[BC].opp = this.newHalfEdgeIndices[(i + 1) * 2 % (horizonEdgeCount * 2)];
    }
    // Assign points that were on the positive side of the disabled faces to the new faces.
    let disabledPointsIndex;
    for (disabledPointsIndex = 0; disabledPointsIndex < this.disabledFacePointVectors.length; disabledPointsIndex++) {
      const disabledPoints = this.disabledFacePointVectors[disabledPointsIndex];
      let pointIndex;
      for (pointIndex = 0; pointIndex < disabledPoints.length; pointIndex++) {
        const point = disabledPoints[pointIndex];
        if (point === activePointIndex) {
          continue;
        }
        let j;
        for (j = 0; j < horizonEdgeCount; j++) {
          if (this.addPointToFace(this.mesh.faces[this.newFaceIndices[j]], point)) {
            break;
          }
        }
      }
    }
    // Increase face stack size if needed
    let newFaceIndexIndex;
    for (newFaceIndexIndex = 0; newFaceIndexIndex < this.newFaceIndices.length; newFaceIndexIndex++) {
      newFaceIndex = this.newFaceIndices[newFaceIndexIndex];
      newFace = this.mesh.faces[newFaceIndex];
      if (newFace.pointsOnPositiveSide.length > 0) {
        if (!newFace.inFaceStack) {
          faceList.push(newFaceIndex);
          newFace.inFaceStack = 1;
        }
      }
    }
  }
};
/** @ignore */
QuickHull.prototype.getExtremeValues = function() {
  const outIndices = [0, 0, 0, 0, 0, 0];
  const extremeVals = [this.vertexData[0][0],
    this.vertexData[0][0],
    this.vertexData[0][1],
    this.vertexData[0][1],
    this.vertexData[0][2],
    this.vertexData[0][2]];
  const vCount = this.vertexData.length;
  let i;
  for (i = 1; i < vCount; i++) {
    const pos = this.vertexData[i];
    let j;
    let k;
    for (j = 0, k = 0; j < 6; j += 2, k++) {
      if (pos[k] > extremeVals[j]) {
        extremeVals[j] = pos[k];
        outIndices[j] = i;
      } else if (pos[k] < extremeVals[j + 1]) {
        extremeVals[j + 1] = pos[k];
        outIndices[j + 1] = i;
      }
    }
  }
  return outIndices;
};
/** @ignore */
QuickHull.prototype.reorderHorizonEdges = function(horizonEdges) {
  const horizonEdgeCount = horizonEdges.length;
  let i;
  for (i = 0; i < horizonEdgeCount - 1; i++) {
    const endVertex = this.mesh.halfEdges[ horizonEdges[i] ].endVertex;
    let foundNext = false;
    let j;
    for (j = i + 1; j < horizonEdgeCount; j++) {
      const beginVertex = this.mesh.halfEdges[ this.mesh.halfEdges[horizonEdges[j]].opp ].endVertex;
      if (beginVertex === endVertex) {
        const tmp = horizonEdges[j]; horizonEdges[j] = horizonEdges[i + 1]; horizonEdges[i + 1] = tmp;
        foundNext = true;
        break;
      }
    }
    if (!foundNext) {
      return false;
    }
  }
  if(!(this.mesh.halfEdges[ horizonEdges[horizonEdges.length - 1] ].endVertex ===
      this.mesh.halfEdges[ this.mesh.halfEdges[horizonEdges[0]].opp ].endVertex)) {
    throw new Error();
  }
  return true;
};
/** @ignore */
QuickHull.prototype.getScale = function(extremeValues) {
  let s = 0;
  let a;
  let i;
  let j;
  for (i = 0, j = 0; i < 6; i += 2, j++) {
    a = Math.abs(this.vertexData[extremeValues[i]][j]);
    s = Math.max(a, s);
    a = Math.abs(this.vertexData[extremeValues[i + 1]][j]);
    s = Math.max(a, s);
  }
  return s;
};
/** @ignore */
QuickHull._getTriangleNormal = function(a, b, c) {
  return MathUtil.vec3cross(MathUtil.vec3sub(a, c), MathUtil.vec3sub(b, c));
};
/** @ignore */
QuickHull._getSignedDistanceToPlane = function(v, p) {
  // NOTE: Fast, not robust
  return p[3] + MathUtil.vec3dot([p[0], p[1], p[2]], v);
};
/** @ignore */
QuickHull._isPointOnNonnegativeSide = function(n, p, q) {
  return QuickHull._getSignedDistanceToPlane(q,
    MathUtil.planeFromNormalAndPoint(n, p)) >= 0;
};
/** @ignore */
QuickHull.prototype.getInitialTetrahedron = function() {
  const vertexCount = this.vertexData.length;
  let N;
  let d;
  let tmp;
  // If we have at most 4 points, just return a degenerate tetrahedron
  if (vertexCount <= 4) {
    const v = [0, Math.min(1, vertexCount - 1), Math.min(2, vertexCount - 1), Math.min(3, vertexCount - 1)];
    const N = QuickHull._getTriangleNormal(this.vertexData[v[0]], this.vertexData[v[1]], this.vertexData[v[2]]);
    if (QuickHull._isPointOnNonnegativeSide(N, this.vertexData[v[0]], this.vertexData[v[3]])) {
      const tmp = v[1]; v[1] = v[0]; v[0] = tmp;
    }
    return new QuickHull._MeshBuilder(v[0], v[1], v[2], v[3]);
  }

  // Find two most distant extreme points
  let maxD = this.epsilonSquared;
  let selectedPoints = [0, 0];
  let i;
  let j;
  for (i = 0; i < 6; i++) {
    for (j = i + 1; j < 6; j++) {
      const v1 = this.vertexData[ this.extremeValues[i] ];
      const v2 = this.vertexData[ this.extremeValues[j] ];
      const vsub = MathUtil.vec3sub(v1, v2);
      const d = MathUtil.vec3dot(vsub, vsub); // Squared distance
      if (d > maxD) {
        maxD = d;
        selectedPoints = [this.extremeValues[i], this.extremeValues[j]];
      }
    }
  }
  if (maxD === this.epsilonSquared) {
    // A degenerate case: the point cloud seems to consists of a single point
    return new QuickHull._MeshBuilder(0, Math.min(1, vertexCount), Math.min(2, vertexCount), Math.min(3, vertexCount));
  }
  if(selectedPoints[0] === selectedPoints[1])throw new Error();
  // Find the most distant point to the line between the two chosen extreme points.
  const rayOrigin = this.vertexData[selectedPoints[0]];
  const rayDir = MathUtil.vec3sub(this.vertexData[selectedPoints[1]], this.vertexData[selectedPoints[0]]);
  maxD = this.epsilonSquared;
  let maxI = Number.POSITIVE_INFINITY;
  const vCount = this.vertexData.length;

  for (i = 0; i < vCount; i++) {
    const s = MathUtil.vec3sub(this.vertexData[i], rayOrigin);
    const t = MathUtil.vec3dot(s, rayDir);
    const distToRay = MathUtil.vec3dot(s, s) - t * t / MathUtil.vec3dot(rayDir, rayDir);
    if (distToRay > maxD) {
      maxD = distToRay;
      maxI = i;
    }
  }
  let veIndex;
  if (maxD === this.epsilonSquared) {
    // It appears that the point cloud belongs to a 1 dimensional subspace of R^3: convex hull
    // has no volume => return a thin triangle
    // Pick any point other than selectedPoints[0] and selectedPoints[1] as the third point of the triangle
    let thirdPoint = selectedPoints[0];
    for (veIndex = 0; veIndex < this.vertexData.length; veIndex++) {
      const ve = this.vertexData[veIndex];
      if(ve !== this.vertexData[selectedPoints[0]] && ve !== this.vertexData[selectedPoints[1]]) {
        thirdPoint = veIndex;
        break;
      }
    }
    let fourthPoint = selectedPoints[0];

    for (veIndex = 0; veIndex < this.vertexData.length; veIndex++) {
      // ve = this.vertexData[veIndex];
      if(ve !== this.vertexData[selectedPoints[0]] && ve !== this.vertexData[selectedPoints[1]] && ve !== this.vertexData[thirdPoint]) {
        fourthPoint = veIndex;
        break;
      }
    }
    return new QuickHull._MeshBuilder(selectedPoints[0], selectedPoints[1], thirdPoint, fourthPoint);
  }

  // These three points form the base triangle for our tetrahedron.
  if(!(selectedPoints[0] !== maxI && selectedPoints[1] !== maxI)) {
    throw new Error();
  }
  const baseTriangle = [selectedPoints[0], selectedPoints[1], maxI];
  const baseTriangleVertices = [
    this.vertexData[baseTriangle[0]], this.vertexData[baseTriangle[1]], this.vertexData[baseTriangle[2]]];

  // Next step is to find the 4th vertex of the tetrahedron. We naturally choose the point farthest away from the triangle plane.
  maxD = this.epsilon;
  maxI = 0;
  N = QuickHull._getTriangleNormal(baseTriangleVertices[0], baseTriangleVertices[1], baseTriangleVertices[2]);
  const trianglePlane = MathUtil.planeFromNormalAndPoint(N, baseTriangleVertices[0]);

  for (i = 0; i < vCount; i++) {
    d = Math.abs(QuickHull._getSignedDistanceToPlane(this.vertexData[i], trianglePlane));
    if (d > maxD) {
      maxD = d;
      maxI = i;
    }
  }
  if (maxD === this.epsilon) {
    // All the points seem to lie on a 2D subspace of R^3. How to handle this? Well, let's add one extra point to the point cloud so that the convex hull will have volume.
    this.planar = true;
    N = QuickHull._getTriangleNormal(baseTriangleVertices[1], baseTriangleVertices[2], baseTriangleVertices[0]);
    this.planarPointCloudTemp = this.vertexData.slice(0, this.vertexData.length);
    const extraPoint = MathUtil.vec3add(N, this.vertexData[0]);
    this.planarPointCloudTemp.push(extraPoint);
    maxI = this.planarPointCloudTemp.length - 1;
    this.vertexData = this.planarPointCloudTemp;
  }
  // Enforce CCW orientation (if user prefers clockwise orientation, swap two vertices in each triangle when final mesh is created)
  if (QuickHull._isPointOnNonnegativeSide(N, baseTriangleVertices[0], this.vertexData[maxI])) {
    tmp = baseTriangle[1]; baseTriangle[1] = baseTriangle[0]; baseTriangle[0] = tmp;
  }
  // Create a tetrahedron half edge mesh and compute planes defined by each triangle
  const mesh = new QuickHull._MeshBuilder(baseTriangle[0], baseTriangle[1], baseTriangle[2], maxI);
  let fIndex;
  for (fIndex = 0; fIndex < mesh.faces.length; fIndex++) {
    const f = mesh.faces[fIndex];
    // v = mesh.getVertexIndicesOfFace(f);
    const va = this.vertexData[v[0]];
    const vb = this.vertexData[v[1]];
    const vc = this.vertexData[v[2]];
    N = QuickHull._getTriangleNormal(va, vb, vc);
    f.P = MathUtil.planeFromNormalAndPoint(N, va);
  }

  // Finally we assign a face for each vertex outside the tetrahedron (vertices inside the tetrahedron have no role anymore)

  for (i = 0; i < vCount; i++) {
    let faceIndex;
    for (faceIndex = 0; faceIndex < mesh.faces.length; faceIndex++) {
      const face = mesh.faces[faceIndex];
      if (this.addPointToFace(face, i)) {
        break;
      }
    }
  }
  return mesh;
};

/**
 * Generates the convex hull of a set of 3-dimensional points, that is, the smallest convex set
 * that contains all the points given.
 * @param {Array<number>} points An array of 3-element vectors each identifying
 * a 3-dimensional point.
 * @param {boolean} [flat] If true, will generate normals such that the
 * figure will be flat shaded; otherwise, will generate normals such that the
 * figure will be smooth shaded.
 * @param {boolean} [inside] If true, the normals generated by this
 * method will point inward; otherwise, outward. Should normally be false
 * unless the figure will be viewed from the inside.
 * @returns {MeshBuffer} The generated convex hull.
 * @function
 */
export const createConvexHull = function(points, flat, inside) {
  const bm = new QuickHull();
  bm.buildMesh(points, 1e-8);
  const mvi = bm.mesh.toMeshVerticesIndices(points);
  return new MeshBuffer()
    .setAttribute("POSITION", mvi[0], 3)
    .setIndices(mvi[1]).recalcNormals(flat, inside);
};
function getIntersectingPoint(p1, p2, p3) {
  const n1 = p1.slice(0, 3);
  const n2 = p2.slice(0, 3);
  const n3 = p3.slice(0, 3);
  const d = MathUtil.vec3dot(n1, MathUtil.vec3cross(n2, n3));
  if(Math.abs(d) >= 1e-9) {
    const n12 = MathUtil.vec3cross(n1, n2);
    const n23 = MathUtil.vec3cross(n2, n3);
    const n31 = MathUtil.vec3cross(n3, n1);
    const p = MathUtil.vec3scale(n23, -p1[3]);
    MathUtil.vec3addInPlace(p, MathUtil.vec3scale(n31, -p2[3]));
    MathUtil.vec3addInPlace(p, MathUtil.vec3scale(n12, -p3[3]));
    MathUtil.vec3scaleInPlace(p, 1.0 / d);
    return p;
  }
  return null;
}

const getSignedDistanceToPlane = function(v, p) {
  // NOTE: Fast, not robust
  return p[3] + MathUtil.vec3dot([p[0], p[1], p[2]], v);
};

function getIntersectingPoints(planes) {
  let ret = [];

  if(planes.length >= 3) {
    let i;
    for (i = 0; i < planes.length - 2; i++) {
      let j;
      for (j = i + 1; j < planes.length - 1; j++) {
        let k;
        for (k = j + 1; k < planes.length; k++) {
          const p = getIntersectingPoint(planes[i], planes[j], planes[k]);
          if(typeof p !== "undefined" && p !== null) {
            ret.push(p);
          }
        }
      }
    }
  }
  if(ret.length > 0) {
    let i;
    for (i = 0; i < ret.length; i++) {
      const ri = ret[i];
      let culled = false;
      let j;
      // Check whether the point is outside
      // any of the halfspaces; if so, cull it
      for(j = 0; !culled && j < planes.length; j++) {
        const d = getSignedDistanceToPlane(ri, planes[j]);
        if(d > 1e-6) {
          ret[i] = null;
          culled = true;
        }
      }
      // Check for duplicates (this is done second
      // since it's much more likely in practice that the point
      // will be culled by a halfspace than that there will
      // be duplicates)
      for(j = i + 1; !culled && j < ret.length; j++) {
        const rj = ret[j];
        if(rj !== null && rj[0] === ri[0] && rj[1] === ri[1] && rj[2] === ri[2]) {
          ret[i] = null;
          culled = true;
        }
      }
    }
    // Regenerate point array
    const newret = [];

    for (i = 0; i < ret.length; i++) {
      if(typeof ret[i] !== "undefined" && ret[i] !== null) {
        newret.push(ret[i]);
      }
    }
    ret = newret;
  }
  return ret;
}
/**
 * Generates a mesh buffer of a convex polyhedron at random.
 * @param {number} avgsize Average size of the polyhedron generated.
 * @param {number} maxfaces Maximum number of faces for the convex polyhedron.
 * @returns {MeshBuffer} The resulting polyhedron.
 * @function
 */
export const randomConvexPolyhedron = function(avgsize, maxfaces) {
  const planes = [];
  let i;
  for (i = 0; i < maxfaces; i++) {
    const n = MathUtil.vec3normalize([Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1]);
    const ns = MathUtil.vec3scale(n, avgsize);
    planes.push(MathUtil.planeFromNormalAndPoint(n, ns));
  }
  const ints = getIntersectingPoints(planes);
  return createConvexHull(ints, true);
};

function getPlaneEquations(planepoints) {
  const ret = [];
  let i;
  for (i = 0; i < planepoints.length; i++) {
    const pp = planepoints[i];
    const p31 = MathUtil.vec3sub(pp[2], pp[0]);
    const p21 = MathUtil.vec3sub(pp[1], pp[0]);
    const plane = MathUtil.vec3normalize(
      MathUtil.vec3cross(p31, p21));
    plane[3] = -MathUtil.vec3dot(pp[0], plane);
    ret.push(plane);
  }
  return ret;
}

/**
 * Generates a convex hull of the half-space representation
 * of several planes. Each plane is defined by the triangle it lies on.
 * @param {Array<Array<number>>} planepoints An array of
 * planes. Each plane is defined by three points that form a triangle
 * that lies on the plane. The triangle's normal vector will point outward,
 * meaning all points on the side pointed to by the normal vector
 * will be "outside" the plane, and other points will be "inside" the plane.
 * @returns {MeshBuffer} The generated convex hull.
 * @function
 */
export const planePointsToConvexHull = function(planepoints) {
  const planes = getPlaneEquations(planepoints);
  const ints = getIntersectingPoints(planes);
  return createConvexHull(ints);
};
