/** The <code>extras/moresurfaces.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/moresurfaces.js";
 * // -- or --
 * import * as CustomModuleName from "extras/moresurfaces.js";</pre>
 * @module extras/moresurfaces */

/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {MathUtil} from "../h3du_module.js";

/**
 * Surface evaluator object for the Klein surface, also known as the "Klein bottle".
 * @constructor
 */
export const KleinBottle = function() {
  this.endPoints = function() {
    return [0, 6.283185307179586, 0, 6.283185307179586];
  };
  this.evaluate = function(u, v) {
    let x;
    let z;
    const cosu = Math.cos(u);
    const sinu = u >= 0 && u < 6.283185307179586 ? u <= 3.141592653589793 ? Math.sqrt(1.0 - cosu * cosu) : -Math.sqrt(1.0 - cosu * cosu) : Math.sin(u);
    const cosv = Math.cos(v);
    const sinv = v >= 0 && v < 6.283185307179586 ? v <= 3.141592653589793 ? Math.sqrt(1.0 - cosv * cosv) : -Math.sqrt(1.0 - cosv * cosv) : Math.sin(v);
    if(u < Math.PI) {
      x = 3 * cosu * (1 + sinu) + 2 * (1 - cosu / 2) * cosu * cosv;
      z = -8 * sinu - 2 * (1 - cosu / 2) * sinu * cosv;
    } else {
      x = 3 * cosu * (1 + sinu) + 2 * (1 - cosu / 2) * (cosv * -1.0);
      z = -8 * sinu;
    }
    const y = -2 * (1 - cosu / 2) * sinv;
    return [x / 6, z / 6, y / 6];
  };
};
/**
 * TODO: Not documented yet.
 * @param {*} maj
 * @param {*} a
 * @param {*} b
 * @returns {*} Return value.
 * @function
 */
export const MoebiusLikeStrip = function(maj, a, b) {
  this.maj = typeof maj === "undefined" || maj === null ? 1.25 : maj;
  this.a = typeof a === "undefined" || a === null ? 0.125 : a;
  this.b = typeof b === "undefined" || b === null ? 0.5 : b;
  this.endPoints = function() {
    return [0, Math.PI, 0, 6.283185307179586];
  };
  this.evaluate = function(u, v) {
    let x;
    const cosu = Math.cos(u);
    const sinu = u >= 0 && u < 6.283185307179586 ? u <= 3.141592653589793 ? Math.sqrt(1.0 - cosu * cosu) : -Math.sqrt(1.0 - cosu * cosu) : Math.sin(u);
    const cosv = Math.cos(v);
    const sinv = v >= 0 && v < 6.283185307179586 ? v <= 3.141592653589793 ? Math.sqrt(1.0 - cosv * cosv) : -Math.sqrt(1.0 - cosv * cosv) : Math.sin(v);
    x = this.a * cosv * cosu - this.b * sinv * sinu;
    const z = this.a * cosv * sinu + this.b * sinv * cosu;
    // Find the sine and cosine of u + u
    const cosu2 = cosu * cosu - sinu * sinu;
    const sinu2 = sinu * cosu * 2;
    const y = (this.maj + x) * sinu2;
    x = (this.maj + x) * cosu2;
    return [x, z, y];
  };
};
/**
 * Surface evaluator object for a M&ouml;bius strip.
 * @param {number} radius
 * @param {number} width Width of the strip.
 * @constructor
 */
export const MoebiusStrip = function(radius, width) {
  this.radius = typeof radius === "undefined" || radius === null ? 1 : radius;
  this.width = typeof width === "undefined" || width === null ? 0.5 : width;
  this.endPoints = function() {
    return [-this.width, this.width, 0, MathUtil.PiTimes2];
  };
  this.evaluate = function(u, v) {
    const halfv = v / 2;
    const cosv2 = Math.cos(halfv);
    const sinv2 = halfv >= 0 && halfv < 6.283185307179586 ? halfv <= 3.141592653589793 ? Math.sqrt(1.0 - cosv2 * cosv2) : -Math.sqrt(1.0 - cosv2 * cosv2) : Math.sin(halfv);
    const cosv = cosv2 * cosv2 - sinv2 * sinv2;
    const sinv = 2 * sinv2 * cosv2;
    const tmp = u * cosv2 + this.radius;
    const x = cosv * tmp;
    const y = sinv * tmp;
    const z = sinv2 * u;
    return [x, y, z];
  };
};
