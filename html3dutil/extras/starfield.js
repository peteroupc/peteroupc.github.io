/* global Float32Array */
/** The <code>extras/starfield.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/starfield.js";
 * // -- or --
 * import * as CustomModuleName from "extras/starfield.js";</pre>
 * @module extras/starfield */

/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under Creative Commons Zero (CC0): https://creativecommons.org/publicdomain/zero/1.0/
*/
import {MeshBuffer, Meshes, newFrames} from "../h3du_module.js";

const NUM_OF_STARS = 200;

/**
 * TODO: Not documented yet.
 * @param {*} range
 * @constructor
 */
export function StarField(range) {
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
  this.star = Meshes.createSphere(range / 1000).setColor("white").deindex();
  this.instances = MeshBuffer.fromPositions(
    new Float32Array(NUM_OF_STARS * 3));
  this.timer = {};
  this.range = range;
  this._initialPos = function() {
    let i;
    const vec = [0, 0, 0];
    const ba = this.instances.getAttribute("POSITION");
    const count = ba.count();
    for (i = 0; i < count; i++) {
      this._starPos(this.range, vec);
      ba.setVec(i, vec);
    }
  };
  this._move = function(frames) {
    let i;
    let vec = [0, 0, 0];
    const ba = this.instances.getAttribute("POSITION");
    const count = ba.count();
    for (i = 0; i < count; i++) {
      vec = ba.getVec(i, vec);
      if(vec[2] > this.range / 2) {
        // once the star is too close, move it elsewhere
        this._starPos(this.range, vec);
        vec[2] -= this.range;
        ba.setVec(i, vec);
      } else {
        vec[2] += this.range / 250 * frames;
        ba.setVec(i, vec);
      }
    }
  };
  this.update = function(time) {
    this._move(newFrames(this.timer, time));
  };
  this._initialPos();
}
