/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under Creative Commons Zero (CC0): http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
/* global H3DU */

function Animator(shape) {
  "use strict";
  this.shape = shape;
  this.positionAnim = [];
  this.visibleAnim = [];
}
/** @ignore */
Animator._compact = function(arr) {
  "use strict";
  let fillOffset = 0;

  let i;
  for (i = 0; i < arr.length; i++) {
    if(fillOffset !== i && arr[i] !== null) {
      arr[fillOffset] = arr[i];
      fillOffset++;
    } else if(typeof arr[i] !== "undefined" && arr[i] !== null) {
      fillOffset++;
    }
  }
  arr.splice(fillOffset, arr.length - fillOffset);
};

function Animators() {
  "use strict";
  this.list = [];
  this.curTime = 0;
}
/** @ignore */
Animators.prototype._ensure = function(shape) {
  "use strict";
  let i;
  for (i = 0; i < this.list.length; i++) {
    if(this.list[i].shape === shape)return this.list[i];
  }
  const anim = new Animator(shape);
  this.list.push(anim);
  return anim;
};
/** @ignore */
Animators.prototype.startAt = function(time) {
  "use strict";
  this.curTime = time;
  return this;
};
/** @ignore */
Animators.prototype.thenShow = function(shape) {
  "use strict";
  this._ensure(shape).setVisibleAt(true, this.curTime);
  return this;
};
/** @ignore */
Animators.prototype.thenShowAndMove = function(shape, x, y, z, x2, y2, z2, dur) {
  "use strict";
  return this.thenShow(shape).thenMove(shape, x, y, z, x2, y2, z2, dur);
};
/** @ignore */
Animators.prototype.thenMove = function(shape, x, y, z, x2, y2, z2, dur) {
  "use strict";
  this._ensure(shape).moveTo(x, y, z, x2, y2, z2, this.curTime, dur);
  this.curTime += dur;
  return this;
};
/** @ignore */
Animators.prototype.thenPause = function(time) {
  "use strict";
  this.curTime += time;
  return this;
};
/** @ignore */
Animators.prototype.update = function(time) {
  "use strict";
  let i;
  for (i = 0; i < this.list.length; i++) {
    this.list[i].update(time);
  }
};
/** @ignore */
Animator.prototype.showAndMoveTo = function(
  x, y, z, x2, y2, z2, startInMs, durationInMs) {
  "use strict";
  return this.setVisibleAt(true, startInMs)
    .moveTo(x, y, z, x2, y2, z2, startInMs, durationInMs);
};
/** @ignore */
Animator.prototype.moveTo = function(
  x, y, z, x2, y2, z2, startInMs, durationInMs) {
  "use strict";
  this.positionAnim.push([
    [x, y, z], [x2, y2, z2], startInMs, startInMs + durationInMs]);
  return this;
};
/** @ignore */
Animator.prototype.setVisibleAt = function(vis, timeInMs) {
  "use strict";
  this.visibleAnim.push([!!vis, timeInMs]);
  return this;
};
/** @ignore */
Animator.prototype.update = function(time) {
  "use strict";
  let a;
  let posChanged = false;
  let visChanged = false;
  let i;
  for (i = 0; i < this.positionAnim.length; i++) {
    a = this.positionAnim[i];
    if(!a)continue;
    if(time < a[2])continue; // hasn't begun yet
    if(time >= a[3]) {
      // finished
      this.shape.setPosition(a[1]);
      this.positionAnim[i] = null;
      posChanged = true;
    } else {
      // in progress
      let t = (time - a[2]) / (a[3] - a[2]);
      t = t * t * (3 - 2 * t); // smoothstep
      this.shape.setPosition(H3DU.MathUtil.vec3lerp(a[0], a[1], t));
    }
  }
  for(i = 0; i < this.visibleAnim.length; i++) {
    a = this.visibleAnim[i];
    if(!a)continue;
    if(time >= a[1]) {
      this.shape.setVisible(a[0]);
      this.visibleAnim[i] = null;
      visChanged = true;
    }
  }
  if(posChanged)Animator._compact(this.positionAnim);
  if(visChanged)Animator._compact(this.visibleAnim);
};

/**
 * Finds the intersection point of three planes.
 * @private
 * @param {Array<number>} p1 A four-element array
 * defining the first plane. The first three elements of the array
 * are the X, Y, and Z components of the plane's normal vector, and
 * the fourth element is the shortest distance from the plane
 * to the origin, or if negative, from the origin to the plane,
 * divided by the normal's length.
 * @param {Array<number>} p2 A four-element array
 * defining the second plane.
 * @param {Array<number>} p3 A four-element array
 * defining the third plane.
 * @returns {Array<number>} The intersection point, or
 * null if all three planes meet at a line or any two planes
 * are parallel.
 */
H3DU.MathUtil.planeIntersection = function(p1, p2, p3) {
  "use strict";
  const c23 = H3DU.MathUtil.vec3cross(p2, p3);
  const d = H3DU.MathUtil.vec3dot(p1, c23);
  if(d === 0) {
  // no intersection point
    return null;
  }
  const c12 = H3DU.MathUtil.vec3cross(p1, p2);
  const c31 = H3DU.MathUtil.vec3cross(p3, p1);
  H3DU.MathUtil.vec3scaleInPlace(c23, -p1[3]);
  H3DU.MathUtil.vec3scaleInPlace(c31, -p2[3]);
  H3DU.MathUtil.vec3scaleInPlace(c12, -p3[3]);
  c23[0] += c31[0]; c23[1] += c31[1]; c23[2] += c31[2];
  c23[0] += c12[0]; c23[1] += c12[1]; c23[2] += c12[2];
  H3DU.MathUtil.vec3scaleInPlace(c23, 1.0 / d);
  return c23;
};

/**
 * Finds the coordinates of the corners
 * of a view frustum's near clipping plane.
 * @private
 * @param {Array<Array<number>>} An array of six
 * 4-element arrays representing the six clipping planes of the
 * view frustum. In order, they are the left, right, top,
 * bottom, near, and far clipping planes.
 * @returns {Array<number>} A 4-element array
 * containing the 3-element points for the top-left,
 * bottom-left, top-right, and bottom-right corners,
 * respectively, of the near clipping plane.
 */
H3DU.MathUtil.frustumNearPlane = function(frustum) {
  "use strict";
  const topLeft = H3DU.MathUtil.planeIntersection(
    frustum[4], frustum[0], frustum[2]);
  const bottomLeft = H3DU.MathUtil.planeIntersection(
    frustum[4], frustum[0], frustum[3]);
  const topRight = H3DU.MathUtil.planeIntersection(
    frustum[4], frustum[1], frustum[2]);
  const bottomRight = H3DU.MathUtil.planeIntersection(
    frustum[4], frustum[1], frustum[3]);
  return [topLeft, bottomLeft, topRight, bottomRight];
};
/**
 * Finds the coordinates of the corners
 * of a view frustum's far clipping plane.
 * @private
 * @param {Array<Array<number>>} An array of six
 * 4-element arrays representing the six clipping planes of the
 * view frustum. In order, they are the left, right, top,
 * bottom, near, and far clipping planes.
 * @returns {Array<number>} A 4-element array
 * containing the 3-element points for the top-left,
 * bottom-left, top-right, and bottom-right corners,
 * respectively, of the near clipping plane.
 */
H3DU.MathUtil.frustumFarPlane = function(frustum) {
  "use strict";
  const topLeft = H3DU.MathUtil.planeIntersection(
    frustum[5], frustum[0], frustum[2]);
  const bottomLeft = H3DU.MathUtil.planeIntersection(
    frustum[5], frustum[0], frustum[3]);
  const topRight = H3DU.MathUtil.planeIntersection(
    frustum[5], frustum[1], frustum[2]);
  const bottomRight = H3DU.MathUtil.planeIntersection(
    frustum[5], frustum[1], frustum[3]);
  return [topLeft, bottomLeft, topRight, bottomRight];
};

/* exported perspectiveFrustum */
function perspectiveFrustum(fov, aspect, near, far, cameraPos, lookingAt) {
  "use strict";
  const proj = H3DU.MathUtil.mat4perspective(fov, aspect, near, far);
  const view = H3DU.MathUtil.mat4lookat(cameraPos, lookingAt);
  const projview = H3DU.MathUtil.mat4multiply(proj, view);
  const frustum = H3DU.MathUtil.mat4toFrustumPlanes(projview);
  return frustum;
}

function meshAddLine(mesh, point1, point2, thickness) {
  "use strict";
  const vector = H3DU.MathUtil.vec3sub(point1, point2);
  const dist = H3DU.MathUtil.vec3length(vector);
  const normVector = H3DU.MathUtil.vec3norm(vector);
  const midPoint = H3DU.MathUtil.vec3lerp(point1, point2, 0.5);
  let line = H3DU.Meshes.createCapsule(thickness / 2, dist, 6, 4);
  const matrix = H3DU.MathUtil.quatToMat4(H3DU.MathUtil.quatFromVectors([0, 0, 1], normVector));
  matrix[12] = midPoint[0];
  matrix[13] = midPoint[1];
  matrix[14] = midPoint[2];
  line = line.transform(matrix);
  return mesh.merge(line);
}
function meshAddLineStrip(mesh, strip, thickness) {
  "use strict";
  let i;
  for (i = 0; i < strip.length - 1; i++) {
    mesh = meshAddLine(mesh, strip[i], strip[i + 1], thickness);
  }
  return mesh;
}
/* exported frustumMesh */
function frustumMesh(frustum) {
  "use strict";
  const mesh = new H3DU.MeshBuffer();
  const nearRect = H3DU.MathUtil.frustumNearPlane(frustum);
  const farRect = H3DU.MathUtil.frustumFarPlane(frustum);
  const thickness = 0.01;
  meshAddLine(mesh, nearRect[0], farRect[0], thickness);
  meshAddLine(mesh, nearRect[1], farRect[1], thickness);
  meshAddLine(mesh, nearRect[2], farRect[2], thickness);
  meshAddLine(mesh, nearRect[3], farRect[3], thickness);
  meshAddLineStrip(mesh, [nearRect[0], nearRect[1],
    nearRect[3], nearRect[2], nearRect[0]], thickness);
  meshAddLineStrip(mesh, [farRect[0], farRect[1],
    farRect[3], farRect[2], farRect[0]], thickness);
  return mesh;
}
