/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {MathUtil} from "../h3du_module.js";

function sinpow(x, n) {
  var r = Math.sin(x);
  return (r > 0 ? 1 : -1) * Math.pow(Math.abs(r), n);
}
function cospow(x, n) {
  var r = Math.cos(x);
  return (r > 0 ? 1 : -1) * Math.pow(Math.abs(r), n);
}
/**
 * TODO: Not documented yet.
 * @param {number} xRadius
 * @param {number} yRadius
 * @param {number} zRadius
 * @param {number} n Exponent for the sines and cosines in the U axis.
 * @param {number} m Exponent for the sines and cosines in the V axis.
 * @constructor
 */
export var Superellipsoid = function(xRadius, yRadius, zRadius, n, m) {
  this.xRadius = xRadius;
  this.yRadius = yRadius;
  this.zRadius = zRadius;
  this.n = typeof n === "undefined" || n === null ? 1 : n;
  this.m = typeof m === "undefined" || m === null ? 1 : m;
  this.endPoints = function() {
    return [-Math.PI / 2, Math.PI / 2, -Math.PI, Math.PI];
  };
  this.evaluate = function(u, v) {
    var cosu = cospow(u, this.n);
    return [
      cospow(v, this.m) * cosu * this.xRadius,
      sinpow(v, this.m) * cosu * this.yRadius,
      sinpow(u, this.n) * this.zRadius
    ];
  };
};
/**
 * TODO: Not documented yet.
 * @param {number} xRadius
 * @param {number} yRadius
 * @param {number} innerRadius
 * @param {number} n Exponent for the sines and cosines in the U axis.
 * @param {number} m Exponent for the sines and cosines in the V axis.
 * @constructor
 */
export var Supertoroid = function(xRadius, yRadius, innerRadius) {
  this.xRadius = xRadius;
  this.yRadius = yRadius;
  this.innerRadius = innerRadius;
  this.endPoints = function() {
    return [0, MathUtil.PiTimes2, 0, MathUtil.PiTimes2];
  };
  this.evaluate = function(u, v) {
    var cosu = cospow(u, this.n);
    return [
      cospow(v, this.m) * (cosu * this.innerRadius + this.xRadius),
      sinpow(v, this.m) * (cosu * this.innerRadius + this.yRadius),
      sinpow(u, this.n) * this.innerRadius
    ];
  };
};
