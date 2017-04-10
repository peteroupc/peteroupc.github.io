/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
/* global H3DU */
/* exported createWasher */
function createWasher(inner, outer, height, slices) {
  "use strict";
  var innerCylinder = H3DU.Meshes.createCylinder(inner, inner, height, slices, 1, false, true);
  var outerCylinder = H3DU.Meshes.createCylinder(outer, outer, height, slices, 1, false, false);
  var base = H3DU.Meshes.createDisk(inner, outer, slices, 2, true).reverseWinding();
  var top = H3DU.Meshes.createDisk(inner, outer, slices, 2, false);
      // move the top disk to the top of the cylinder
  top.transform(H3DU.Math.mat4translated(0, 0, height));
      // merge the base and the top
  return innerCylinder.merge(outerCylinder).merge(base).merge(top);
}

function Animator(shape) {
  "use strict";
  this.shape = shape;
  this.positionAnim = [];
  this.visibleAnim = [];
}
/** @ignore */
Animator._compact = function(arr) {
  "use strict";
  var fillOffset = 0;

  for(var i = 0; i < arr.length; i++) {
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
  for(var i = 0; i < this.list.length; i++) {
    if(this.list[i].shape === shape)return this.list[i];
  }
  var anim = new Animator(shape);
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
  for(var i = 0; i < this.list.length; i++) {
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
  var a;
  var posChanged = false;
  var visChanged = false;
  for(var i = 0; i < this.positionAnim.length; i++) {
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
      var t = (time - a[2]) / (a[3] - a[2]);
      t = t * t * (3 - 2 * t); // smoothstep
      this.shape.setPosition(H3DU.Math.vec3lerp(a[0], a[1], t));
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

/* exported makeFloor */
function makeFloor(xStart, yStart, width, height, tileSize, z) {
  "use strict";
  if(typeof z === "undefined" || z === null)z = 0.0;
  var mesh = new H3DU.Mesh();
  var tilesX = Math.ceil(width / tileSize);
  var tilesY = Math.ceil(height / tileSize);
  var lastY = (height - tilesY * tileSize) / tileSize;
  var lastX = (width - tilesX * tileSize) / tileSize;
  if(lastY <= 0)lastY = 1.0;
  if(lastX <= 0)lastX = 1.0;
  mesh.normal3(0, 0, 1);
  for(var y = 0; y < tilesY; y++) {
    var endY = y === tilesY - 1 ? 1.0 - lastY : 0.0;
    var endPosY = y === tilesY - 1 ? yStart + height : yStart + (y + 1) * tileSize;
    for(var x = 0; x < tilesX; x++) {
      var endX = x === tilesX - 1 ? lastX : 1.0;
      var endPosX = x === tilesX - 1 ? xStart + width : xStart + (x + 1) * tileSize;
      mesh.mode(H3DU.Mesh.TRIANGLE_STRIP)
     .texCoord2(0, 1).vertex3(xStart + x * tileSize, yStart + y * tileSize, z)
     .texCoord2(0, endY).vertex3(xStart + x * tileSize, endPosY, z)
     .texCoord2(endX, 1).vertex3(endPosX, yStart + y * tileSize, z)
     .texCoord2(endX, endY).vertex3(endPosX, endPosY, z);
    }
  }
  return new H3DU.MeshBuffer(mesh);
}

/* exported rotateVec */
function rotateVec(vec, angle) {
  "use strict";
  return H3DU.Math.mat4projectVec3(
   H3DU.Math.mat4rotated(angle, 0, 0, 1), vec);
}
