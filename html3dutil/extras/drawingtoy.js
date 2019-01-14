/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {Curve, CurveBuilder, MathUtil, MeshBuffer, toGLColor} from "../h3du_module.js";
import {Epitrochoid, Hypotrochoid} from "./evaluators.js";

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
 * TODO: Not documented yet.
 * @returns {*} Return value.
 * @constructor
 */
export var DrawingToy = function() {
  this.color = [0, 0, 0];
  this.ce = new CurveBuilder();
};
/**
 * TODO: Not documented yet.
 * @param {*} color
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
  var radius = ringTeeth / 5;
  var rollerRadius = radius * wheelTeeth / ringTeeth;
  var firstHole = (rollerRadius - 2.3) / rollerRadius;
  var holeDist = 0.392 / rollerRadius;
  var relDistFromWheelCenter = firstHole - holeDist * (hole - 1);
  // console.log([firstHole,holeDist,relDistFromWheelCenter])
  phase = phase * 360 / ringTeeth;
  phase -= 90;
  phase = 360 - phase;
  var distFromCenter = relDistFromWheelCenter * rollerRadius;
  // console.log([rollerRadius,distFromCenter])
  var curve = new Epitrochoid(
    radius, rollerRadius, distFromCenter, phase);
  var factor = gcd(ringTeeth, wheelTeeth);
  var rt = ringTeeth / factor;
  var wt = wheelTeeth / factor;
  var trips = Math.min(rt, wt);
  if(typeof maxloops !== "undefined" && maxloops !== null)trips = Math.min(trips, maxloops);
  var extent = MathUtil.PiTimes2 * trips;
  curve = curve.changeEnds(0, extent);
  return curve;
};

/** @ignore
 * @private */
DrawingToy.prototype._drawingToyHypo = function(ringTeeth, wheelTeeth, hole,
  phase, offset, maxloops) {
  if(typeof phase === "undefined" || phase === null)phase = 0;
  var radius = ringTeeth / 5;
  var innerRadius = radius * wheelTeeth / ringTeeth;
  var firstHole = (innerRadius - 2.3) / innerRadius;
  var holeDist = 0.392 / innerRadius;
  var relDistFromWheelCenter = firstHole - holeDist * (hole - 1);
  var toothDist = radius * MathUtil.PiTimes2 / ringTeeth;
  toothDist *= 0.8; // magic number here
  // console.log(toothDist)
  // console.log([firstHole,holeDist,relDistFromWheelCenter])
  phase = phase * 360 / ringTeeth;
  phase -= 90;
  phase = 360 - phase;
  var distFromCenter = relDistFromWheelCenter * innerRadius;
  // console.log([innerRadius,distFromCenter])
  var curve = new Hypotrochoid(radius, innerRadius, distFromCenter, phase);
  var factor = gcd(ringTeeth, wheelTeeth);
  var rt = ringTeeth / factor;
  var wt = wheelTeeth / factor;
  var trips = Math.min(rt, wt);
  if(typeof maxloops !== "undefined" && maxloops !== null)trips = Math.min(trips, maxloops);
  var extent = MathUtil.PiTimes2 * trips;
  curve = curve.changeEnds(0, extent);
  if(typeof offset === "undefined" || offset === null)return curve;
  if(offset === 0)return curve;
  return new Curve({
    "evaluate":(u) => {
      var e = curve.evaluate(u);
      return [e[0] + offset * toothDist, e[1], e[2]];
    },
    "endPoints":() => curve.endPoints()
  });
};
/**
 * Adds line segments that approximate a curve drawn by rolling a wheel inside a fixed ring (a <i>hypotrochoid</i>).
 * @param {number} ringTeeth Number of teeth in the fixed ring.
 * @param {number} wheelTeeth Number of teeth in the rolling wheel.
 * @param {number} hole Integer, starting from 1, identifying the hole within the wheel in which the drawing pen is placed. The greater the number, the closer the hole is to the center of the wheel.
 * @param {number} [phase] Phase, in degrees, of the angle where the ring's and wheel's teeth are engaged. If null, undefined, or omitted, the default value is 0. TODO: Document this parameter more exactly.
 * @param {number} [offset] X coordinate of the center of the fixed ring. If null, undefined, or omitted, the default value is 0.
 * @returns {DrawingToy} This object.
 */
DrawingToy.prototype.hypo = function(ringTeeth, wheelTeeth, hole, phase, offset) {
  this.ce.constantAttribute(this.color, "COLOR");
  var curve = this._drawingToyHypo(ringTeeth, wheelTeeth, hole, phase, offset);
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
 * @param {number} [phase] Phase, in degrees, of the angle where the ring's and wheel's teeth are engaged. If null, undefined, or omitted, the default value is 0. TODO: Document this parameter more exactly.
 * @returns {DrawingToy} This object.
 */
DrawingToy.prototype.epi = function(ringTeeth, wheelTeeth, hole, phase) {
  this.ce.constantAttribute(this.color, "COLOR");
  var curve = this._drawingToyEpi(ringTeeth, wheelTeeth, hole, phase);
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
 * @param {number} phase Phase, in degrees, of the angle where the ring's and wheel's teeth are engaged. If null, undefined, or omitted, the default value is 0. TODO: Document this parameter more exactly.
 * @param {number} offset X coordinate of the center of the fixed ring.
 * @param {number} holeStep TODO: Not documented yet.
 * @param {number} offsetStep TODO: Not documented yet.
 * @param {number} count TODO: Not documented yet.
 * @returns {DrawingToy} This object.
 */
DrawingToy.prototype.continuousHypo = function(
  ringTeeth, wheelTeeth, hole, phase, offset, holeStep, offsetStep, count) {
  var h = hole;
  var o = offset;
  for(var i = 0; i < count; i++, h += holeStep, o += offsetStep) {
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
