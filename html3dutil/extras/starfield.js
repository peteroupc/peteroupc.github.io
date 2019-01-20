/** The <code>extras/starfield.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/starfield.js";
 * // -- or --
 * import * as CustomModuleName from "extras/starfield.js";</pre>
 * @module extras/starfield */

/* global setStarPos, timer */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
import {H3DU} from "../h3du_min";
/**
 * TODO: Not documented yet.
 * @param {*} range
 * @returns {*} Return value.
 */
export function StarField(range) {
  this._setStarPos = function(star, range) {
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
    return star.setPosition(x, y, z);
  };
  this.group = new H3DU.ShapeGroup();
  this.timer = {};
  this._move = function(frames) {
    let i;
    for (i = 0; i < this.group.shapeCount(); i++) {
      const pos = this.group.getShape(i).getMatrix();
      if(pos[14] > this.range / 2) {
        // once the star is too close, move it elsewhere
        setStarPos(this.group.getShape(i), this.range);
        this.group.getShape(i).getTransform().movePosition(0, 0,
          -this.range);
      } else {
        this.group.getShape(i).getTransform().movePosition(0, 0,
          this.range / 250 * frames);
      }
    }
  };
  this.update = function(time) {
    this._move(H3DU.newFrames(timer, time));
  };
  // use a crude white sphere to represent a star
  const star = new H3DU.Shape(
    H3DU.Meshes.createSphere(range / 1000, 4, 3)).setColor("white");
  let i;
  for (i = 0; i < 200; i++) {
    this.group.addShape(this._setStarPos(star.copy(), range));
  }
}
