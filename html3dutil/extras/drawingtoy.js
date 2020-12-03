/** Generates curves similar to those possible using commercially available drawing toys containing gear-toothed rings and wheels.<p>
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/drawingtoy.js";
 * // -- or --
 * import * as CustomModuleName from "extras/drawingtoy.js";</pre>
 * @module extras/drawingtoy */

/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under Creative Commons Zero (CC0): http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {Curve, CurveBuilder, MathUtil, MeshBuffer, toGLColor} from "../h3du_module.js";
import {Roulette} from "./evaluators.js";

function gcd(u, v) {
  u = Math.abs(u);
  v = Math.abs(v);
  if (u === 0 || v === 0 || u === v) {
    return u === 0 ? v : u;
  }
  do {
    if (u > v) {
      u -= v;
    } else {
      v -= u;
    }
  } while (u !== v);
  return u;
}
/**
 * Generates curves similar to those possible using commercially available drawing toys containing gear-toothed rings and wheels. Curves generated currently assume that the radius of each ring and wheel is equal to its tooth count divided by 5.
 * @constructor
 */
export const DrawingToy = function() {
  this.color = [0, 0, 0];
  this.ce = new CurveBuilder();
};
/**
 * Sets the color to apply when drawing future curves with this object.
 * @param {Array<number>|number|string} color A [color vector or string]{@link toGLColor}
 * identifying the color to apply.
 * @returns {DrawingToy} This object.
 */
DrawingToy.prototype.setColor = function(color) {
  this.color = toGLColor(color).slice(0, 3);
  return this;
};
/** @ignore
 * @private */
DrawingToy.prototype._drawingToyEpi = function(ringTeeth, wheelTeeth, hole,
  phase, maxloops) {
  if(typeof phase === "undefined" || phase === null)phase = 0;
  const radius = ringTeeth / 5;
  const rollerRadius = radius * wheelTeeth / ringTeeth;
  const firstHole = (rollerRadius - 2.3) / rollerRadius;
  const holeDist = 0.392 / rollerRadius;
  const relDistFromWheelCenter = firstHole - holeDist * (hole - 1);
  // console.log([firstHole,holeDist,relDistFromWheelCenter])
  phase = phase * 360 / ringTeeth;
  phase -= 90;
  phase = 360 - phase;
  const distFromCenter = relDistFromWheelCenter * rollerRadius;
  // console.log([rollerRadius,distFromCenter])
  const curve = Roulette.epitrochoid(
    radius, rollerRadius, distFromCenter, phase);
  const endPoints = curve.endPoints();
  const factor = gcd(ringTeeth, wheelTeeth);
  const rt = ringTeeth / factor;
  const wt = wheelTeeth / factor;
  let trips = Math.min(rt, wt);
  if(typeof maxloops !== "undefined" && maxloops !== null)trips = Math.min(trips, maxloops);
  const extent = endPoints[1] * trips;
  return curve.changeEnds(0, extent);
};

/** @ignore
 * @private */
DrawingToy.prototype._drawingToyHypo = function(ringTeeth, wheelTeeth, hole,
  phase, offset, maxloops) {
  if(typeof phase === "undefined" || phase === null)phase = 0;
  const radius = ringTeeth / 5;
  const innerRadius = radius * wheelTeeth / ringTeeth;
  const firstHole = (innerRadius - 2.3) / innerRadius;
  const holeDist = 0.392 / innerRadius;
  const relDistFromWheelCenter = firstHole - holeDist * (hole - 1);
  let toothDist = radius * MathUtil.PiTimes2 / ringTeeth;
  toothDist *= 0.8; // magic number heres
  phase = phase * 360 / ringTeeth;
  phase -= 90;
  phase = 360 - phase;
  const distFromCenter = relDistFromWheelCenter * innerRadius;
  const curve = Roulette.hypotrochoid(radius, innerRadius, distFromCenter, phase);
  const endPoints = curve.endPoints(); // Gets the end points for one revolution
  const factor = gcd(ringTeeth, wheelTeeth);
  const rt = ringTeeth / factor;
  const wt = wheelTeeth / factor;
  let trips = Math.min(rt, wt);
  if(typeof maxloops !== "undefined" && maxloops !== null)trips = Math.min(trips, maxloops);
  const extent = endPoints[1] * trips;
  if(typeof offset === "undefined" || offset === null)offset = 0;
  return new Curve({
    "evaluate":(u) => {
      const e = curve.evaluate(u);
      return [e[0] + offset * toothDist, e[1], e[2]];
    },
    "endPoints":() => [0, extent]
  });
};
/**
 * Adds line segments that approximate a curve drawn by rolling a wheel inside a fixed ring (a <i>hypotrochoid</i>).
 * @param {number} ringTeeth Number of teeth in the fixed ring.
 * @param {number} wheelTeeth Number of teeth in the rolling wheel.
 * @param {number} hole Integer, starting from 1, identifying the hole within the wheel in which the drawing pen is placed. The greater the number, the closer the hole is to the center of the wheel.
 * @param {number} [phase] Phase, in degrees, of the angle where the ring's and wheel's teeth are engaged. This is the starting angle from the positive X axis toward the positive Y axis, in degrees. If null, undefined, or omitted, the default value is 0.
 * @param {number} [offset] X coordinate of the center of the fixed ring. If null, undefined, or omitted, the default value is 0.
 * @returns {DrawingToy} This object.
 */
DrawingToy.prototype.hypo = function(ringTeeth, wheelTeeth, hole, phase, offset) {
  this.ce.constantAttribute(this.color, "COLOR");
  const curve = this._drawingToyHypo(ringTeeth, wheelTeeth, hole, phase, offset);
  this.ce.position(curve).evalCurve(
    MeshBuffer.LINES,
    Math.max(400, Math.floor(curve.getLength() / 4)));
  return this;
};
/**
 * Adds line segments that approximate a curve drawn by rolling a wheel outside a fixed ring (an <i>epitrochoid</i>).
 * @param {number} ringTeeth Number of teeth in the fixed ring.
 * @param {number} wheelTeeth Number of teeth in the rolling wheel.
 * @param {number} hole Integer, starting from 1, identifying the hole within the wheel in which the drawing pen is placed. The greater the number, the closer the hole is to the center of the wheel.
 * @param {number} [phase] Phase, in degrees, of the angle where the ring's and wheel's teeth are engaged. This is the starting angle from the positive X axis toward the positive Y axis, in degrees. If null, undefined, or omitted, the default value is 0.
 * @returns {DrawingToy} This object.
 */
DrawingToy.prototype.epi = function(ringTeeth, wheelTeeth, hole, phase) {
  this.ce.constantAttribute(this.color, "COLOR");
  const curve = this._drawingToyEpi(ringTeeth, wheelTeeth, hole, phase);
  this.ce.position(curve).evalCurve(
    MeshBuffer.LINES,
    Math.max(400, Math.floor(curve.getLength() / 4)));
  return this;
};
/**
 * Adds line segments that approximate one or more curves drawn by rolling a wheel inside a fixed ring (<i>hypotrochoids</i>), where each additional curve may be drawn from a different hole position, a different ring position, or both.
 * @param {number} ringTeeth Number of teeth in the fixed ring.
 * @param {number} wheelTeeth Number of teeth in the rolling wheel.
 * @param {number} hole Integer, starting from 1, identifying the hole within the wheel in which the drawing pen is placed. The greater the number, the closer the hole is to the center of the wheel.
 * @param {number} [phase] Phase, in degrees, of the angle where the ring's and wheel's teeth are engaged. This is the starting angle from the positive X axis toward the positive Y axis, in degrees. If null, undefined, or omitted, the default value is 0.
 * @param {number} offset X coordinate of the center of the fixed ring.
 * @param {number} holeStep Change in the hole number with each additional curve. Any integer, whether positive, negative, or 0.
 * @param {number} offsetStep Change in the X coordinate with each additional curve. Any number, whether positive, negative, or 0.
 * @param {number} count Number of curves to draw.
 * @returns {DrawingToy} This object.
 */
DrawingToy.prototype.continuousHypo = function(
  ringTeeth, wheelTeeth, hole, phase, offset, holeStep, offsetStep, count) {
  let h = hole;
  let o = offset;
  let i;
  for (i = 0; i < count; i++, h += holeStep, o += offsetStep) {
    this.hypo(ringTeeth, wheelTeeth, h, phase, o);
  }
  return this;
};
/**
 * TODO: Not documented yet.
 * @returns {*} Return value.
 */
DrawingToy.prototype.toMeshBuffer = function() {
  return this.ce.toMeshBuffer();
};
