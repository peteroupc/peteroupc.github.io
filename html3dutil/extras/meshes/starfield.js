/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under the Unlicense: https://unlicense.org/
*/

/* global Float32Array */
/** The <code>extras/meshes/starfield.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/meshes/starfield.js";
 * // -- or --
 * import * as CustomModuleName from "extras/meshes/starfield.js";</pre>
 * @module extras/meshes/starfield */

import {MeshBuffer, Meshes, newFrames, toGLColor} from "../../h3du_module.js";

const NUM_OF_STARS = 200;

function setColorBuffer(three,buffergeom,r,g,b){
 var color=toGLColor(r,g,b)
 var ret=[]
 var pos=0
 for(var i=0;i<buffergeom.index.count;i++,pos+=3){
  ret[pos]=color[0]
  ret[pos+1]=color[1]
  ret[pos+2]=color[2]
 }
 buffergeom.setAttribute("color",
    new three["BufferAttribute"](new Float32Array(ret),3))
 return buffergeom
}

/**
 * TODO: Not documented yet.
 * @param {*} range
 * @constructor
 */
export function StarField(three, range) {
  if(!three || !three["BufferGeometry"])throw new Error()
  this._starPos = function(range, vec) {
    let x = 0,
      y = 0,
      z = 0;
    const centerZone = range / 20;
    // avoid stars too close to the center
    while(Math.abs(x) < centerZone) {
      x = Math.random() * range - range / 2;
    }
    // avoid stars too close to the center
    while(Math.abs(y) < centerZone) {
      y = Math.random() * range - range / 2;
    }
    z = Math.random() * range - range / 2;
    vec[0] = x;
    vec[1] = y;
    vec[2] = z;
  };
  // use a crude white sphere to represent a star
  this.star = setColorBuffer(three,Meshes.createSphere(three,range / 1000),"white");
  this.instances = Meshes.fromPositions(three,
    new Float32Array(NUM_OF_STARS * 3));
  this.timer = {};
  this.range = range;
  this._initialPos = function() {
    let i;
    const vec = [0, 0, 0];
    const ba = this.instances.getAttribute("position");
    const count = ba.count;
    for (i = 0; i < count; i++) {
      this._starPos(this.range, vec);
      ba.setXYZ(i, vec[0],vec[1],vec[2]);
    }
  };
  this._move = function(frames) {
    let i;
    let vec = [0, 0, 0];
    const ba = this.instances.getAttribute("position");
    const count = ba.count;
    for (i = 0; i < count; i++) {
      var z = ba.getZ(i);
      if(z > this.range / 2) {
        // once the star is too close, move it elsewhere
        this._starPos(this.range, vec);
        z -= this.range;
        ba.setZ(i,z);
      } else {
        z += this.range / 250 * frames;
        ba.setZ(i,z);
      }
    }
  };
  this.update = function(time) {
    this._move(newFrames(this.timer, time));
  };
  this._initialPos();
}
