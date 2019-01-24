/** The <code>extras/superellipsoid.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/superellipsoid.js";
 * // -- or --
 * import * as CustomModuleName from "extras/superellipsoid.js";</pre>
 * @module extras/superellipsoid */

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
 * @private
 * @constructor
 */

/* exported Toroidal */
/* exported Toroidal */
/* exported Toroidal */
/* exported Toroidal */
/* exported Toroidal */
/* exported Toroidal */
/* exported Toroidal */
/* exported Toroidal */
/* exported Toroidal */
/* exported Toroidal */
/* exported Toroidal */
function Toroidal(theta, phi) {
  this.theta = theta;
  this.phi = phi;
  this.endPoints = () => [0, Math.PI * 2, -Math.PI / 2, Math.PI / 2];
  this.evaluate = function(u, v) {
    const c = Math.cos(u);
    const s = Math.sin(u);
    const th = this.theta.radius(u);
    const ph = this.phi.evaluate(v);
    return [c * (th + ph[0]), s * (th + ph[0]), ph[1]];
  };
}
/**
 * @private
 * @constructor
 */

function Spherical(theta, phi, rx, ry, rz) {
  this.theta = theta;
  this.phi = phi;
  this.rx = typeof rx === "undefined" || rx === null ? 1 : rx;
  this.ry = typeof ry === "undefined" || ry === null ? 1 : ry;
  this.rz = typeof rz === "undefined" || rz === null ? 1 : rz;
  this.endPoints = () => [-Math.PI, Math.PI, -Math.PI / 2, Math.PI / 2];
  this.evaluate = function(u, v) {
    const th = this.theta.evaluate(u);
    const ph = this.phi.evaluate(v);
    return [this.rx * th[0] * ph[0],
      this.ry * th[1] * ph[0],
      this.rz * ph[1]];
  };
}
/**
 * TODO: Not documented yet.
 * @param {*} m TODO: Not documented yet.
 * @param {*} n1 TODO: Not documented yet.
 * @param {*} n2 TODO: Not documented yet.
 * @param {*} n3 TODO: Not documented yet.
 * @param {*} a TODO: Not documented yet.
 * @param {*} b TODO: Not documented yet.
 * @param {*} rx TODO: Not documented yet.
 * @param {*} ry TODO: Not documented yet.
 * @param {*} phase TODO: Not documented yet.
 * @returns {*} TODO: Not documented yet.
 */
export function Supershape(m, n1, n2, n3, a, b, rx, ry, phase) {
  this.m = m;
  this.n1 = n1;
  this.n2 = n2;
  this.n3 = n3;
  this.a = a;
  this.b = b;
  this.phase = phase;
  this.rx = typeof rx === "undefined" || rx === null ? 1 : rx;
  this.ry = typeof ry === "undefined" || ry === null ? 1 : ry;
  // Supershape based on Johan Gielis formulas
  this.radius = function(u) {
    u += this.phase;
    const angle = u * this.m / 4;
    const co = Math.cos(angle);
    const si = Math.sin(angle);
    const c = Math.pow(Math.abs(co / this.a), this.n2);
    const s = Math.pow(Math.abs(si / this.b), this.n3);
    return Math.pow(c + s, -1 / this.n1);
  };
  this.evaluate = function(u) {
    const r = this.radius(u);
    return [r * this.rx * Math.cos(u), r * this.ry * Math.sin(u), 0];
  };
  this.endPoints = () => [0, Math.PI * 2];
}
/**
 * TODO: Not documented yet.
 * @param {*} m TODO: Not documented yet.
 * @param {*} n1 TODO: Not documented yet.
 * @param {*} n2 TODO: Not documented yet.
 * @param {*} n3 TODO: Not documented yet.
 * @param {*} a TODO: Not documented yet.
 * @param {*} b TODO: Not documented yet.
 * @param {*} rx TODO: Not documented yet.
 * @param {*} ry TODO: Not documented yet.
 * @param {*} phase TODO: Not documented yet.
 * @returns {*} TODO: Not documented yet.
 */
Supershape.supershape3D = function(m, n1, n2, n3, a, b, rx, ry, phase) {
  const p1 = new Supershape(m, n1, n2, n3, a, b, 1, 1, phase);
  const p2 = new Supershape(m, n1, n2, n3, a, b, 1, 1, phase);
  return new Spherical(p1, p2, rx, ry, 1);
};
/**
 * TODO: Not documented yet.
 * @param {*} n1 TODO: Not documented yet.
 * @param {*} n2 TODO: Not documented yet.
 * @param {*} rx TODO: Not documented yet.
 * @param {*} ry TODO: Not documented yet.
 * @param {*} rz TODO: Not documented yet.
 * @param {*} phase TODO: Not documented yet.
 * @returns {*} TODO: Not documented yet.
 */
Supershape.superellipsoid = function(n1, n2, rx, ry, rz) {
  // Supershape version using Paul Bourke's meanings for parameters
  const p1 = Supershape.superellipse(n2, 1, 1);
  const p2 = Supershape.superellipse(n1, 1, 1);
  return new Spherical(p1, p2, rx, ry, rz);
};
const cpow = (u, n) => (Math.cos(u) < 0 ? -1 : 1) *
   Math.pow(Math.abs(Math.cos(u)), n);
const spow = (u, n) => (Math.sin(u) < 0 ? -1 : 1) *
   Math.pow(Math.abs(Math.sin(u)), n);
/**
 * TODO: Not documented yet.
 * @param {*} n TODO: Not documented yet.
 * @param {*} rx TODO: Not documented yet.
 * @param {*} ry TODO: Not documented yet.
 * @returns {*} TODO: Not documented yet.
 */
Supershape.superellipse = function(n, rx, ry) {
// Supershape version using Paul Bourke's meanings for parameters
  return new Supershape(4, 2 / n, 2 / n, 2 / n, 1, 1, rx, ry, 0);
};
/**
 * TODO: Not documented yet.
 * @param {*} n TODO: Not documented yet.
 * @param {*} rx TODO: Not documented yet.
 * @param {*} ry TODO: Not documented yet.
 * @returns {*} TODO: Not documented yet.
 */
Supershape.superellipse2 = function(n, rx, ry) {
// Using Paul Bourke's parameterization
  return {
    "evaluate":(u) => [rx * cpow(u, n), ry * spow(u, n), 0],
    "endPoints":() => [0, Math.PI * 2]
  };
};
/**
 * TODO: Not documented yet.
 * @param {*} n1 TODO: Not documented yet.
 * @param {*} n2 TODO: Not documented yet.
 * @param {*} rx TODO: Not documented yet.
 * @param {*} ry TODO: Not documented yet.
 * @param {*} rz TODO: Not documented yet.
 * @returns {*} TODO: Not documented yet.
 */
Supershape.superellipsoid2 = function(n1, n2, rx, ry, rz) {
// Using Paul Bourke's parameterization
  return {
    "evaluate":(u, v) => [rx * cpow(u, n2) * cpow(v, n1),
      ry * spow(u, n2) * cpow(v, n1), rz * spow(v, n1)],
    "endPoints":() => [-Math.PI, Math.PI, -Math.PI / 2, Math.PI / 2]
  };
};
/**
 * TODO: Not documented yet.
 * @param {*} n TODO: Not documented yet.
 * @param {*} rx TODO: Not documented yet.
 * @returns {*} TODO: Not documented yet.
 */
Supershape.supercircle = function(n, rx) {
  return Supershape.superellipse(n, rx, rx);
};
/**
 * TODO: Not documented yet.
 * @param {*} sides TODO: Not documented yet.
 * @param {*} rounding TODO: Not documented yet.
 * @param {*} rx TODO: Not documented yet.
 * @param {*} ry TODO: Not documented yet.
 * @returns {*} TODO: Not documented yet.
 */
Supershape.roundedPolygon = function(sides, rounding, rx, ry) {
  // rounding = (0,1]
  const n = 1 / rounding + 1.0;
  return new Supershape(sides, n, n, n, 1, 1, rx, ry, 0);
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
export const Supertoroid = function(xRadius, yRadius, innerRadius) {
  this.xRadius = xRadius;
  this.yRadius = yRadius;
  this.innerRadius = innerRadius;
  this.endPoints = function() {
    return [0, MathUtil.PiTimes2, 0, MathUtil.PiTimes2];
  };
  this.evaluate = function(u, v) {
    const cosu = cpow(u, this.n);
    return [
      cpow(v, this.m) * (cosu * this.innerRadius + this.xRadius),
      spow(v, this.m) * (cosu * this.innerRadius + this.yRadius),
      spow(u, this.n) * this.innerRadius
    ];
  };
};
