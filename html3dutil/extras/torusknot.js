/** The <code>extras/torusknot.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/torusknot.js";
 * // -- or --
 * import * as CustomModuleName from "extras/torusknot.js";</pre>
 * @module extras/torusknot */

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
 * A curve evaluator object for a torus knot or torus-knot-like curve.
 * Uses the formula given in "Decorative Knot Patterns"
 * by L. D. Taylor, 2011.
 * @param {number} revolutions Integer greater than 0. Labeled 'p' by Taylor.
 * @param {Array<number>} r Array of integers and/or non-integers.
 * @param {Array<number>} q Array of integers. Lowest 'q' is the number of equal "parts"
 * of the torus knot.
 * @param {number} s1 Integer or non-integer parameter.
 * @param {number} m1 Integer parameter.
 * @constructor
 */
export var TorusKnot = function(revolutions, r, q, s1, m1) {
  this.revolutions = revolutions;
  this.q = q;
  this.r = r;
  this.s1 = s1;
  if(typeof this.s1 === "undefined" || this.s1 === null) {
    this.s1 = this.r[0];
  }
  // NOTE: Integer.
  this.m1 = m1;
  if(typeof this.m1 === "undefined" || this.m1 === null) {
    this.m1 = this.q[0];
  }
  this.evaluate = function(u) {
    const ret = [0, 0, 0];
    let c = 1.0;
    let rsum = 0;
    for(let i = 0; i < this.r.length; i++) {
      c += this.r[i] * Math.cos(this.q[i] * u);
      rsum += this.r[i];
    }
    const radius = 20 / (1.0 + rsum);
    ret[0] = Math.cos(this.revolutions * u) * c * radius;
    ret[1] = Math.sin(this.revolutions * u) * c * radius;
    ret[2] = this.s1 * Math.sin(this.m1 * u);
    return ret;
  };
  this.endPoints = function() {
    return [0, MathUtil.PiTimes2];
  };
};
/**
 * Generates a torus knot with simple parameters.
 * @param {number} p Integer greater than 0 giving the number of revolutions.
 * @param {number} q Integer greater than 0 giving the number of loop crossings.
 * @param {*} r1
 * @returns {TorusKnot} The resulting torus knot evaluator.
 */
TorusKnot.simple = function(p, q, r1) {
  // p. 1 of Taylor
  if(typeof r1 === "undefined" || r1 === null)r1 = 0.2;
  return new TorusKnot(p, [r1], [q], r1, q);
};
/**
 * TODO: Not documented yet.
 * @param {number} p Integer greater than 0 giving the number of revolutions.
 * @param {number} q Integer greater than 0 giving the number of loop crossings.
 * @param {*} r1
 * @param {*} s1
 * @returns {TorusKnot} The resulting torus knot evaluator.
 */
TorusKnot.interlaced = function(p, q, r1, s1) {
  // Suggested by p. 2 of Taylor
  if(typeof r1 === "undefined" || r1 === null)r1 = 0.2;
  if(typeof s1 === "undefined" || s1 === null)s1 = 0.2;
  return new TorusKnot(p, [r1], [q], r1, (p - 1) * q);
};
