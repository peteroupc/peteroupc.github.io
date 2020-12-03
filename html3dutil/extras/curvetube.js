/** The <code>extras/curvetube.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/curvetube.js";
 * // -- or --
 * import * as CustomModuleName from "extras/curvetube.js";</pre>
 * @module extras/curvetube */

/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under Creative Commons Zero (CC0): http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {Curve, MathUtil, Surface} from "../h3du_module";

/** @ignore
 * @constructor */
const _TBNFrames = function(func) {
  this.func = typeof Curve !== "undefined" && Curve !== null ? new Curve(func) : func;
  this.normals = [];
  this.binormals = [];
  this.tangents = [];
  this.vectorsCache = [];
  this.vectorsCacheIndex = 0;
  let isClosed = false;
  const res = 50; // NOTE: Many samples of TBN frames are needed for accuracy
  let totalLength = 0;
  let cosAngle;
  let sinAngle;
  let subAngle;
  const runningLengths = [0];
  this.endPoints = _TBNFrames.getEndPoints(func);
  const firstSample = this.func.evaluate(this.endPoints[0]);
  const lastSample = this.func.evaluate(this.endPoints[1]);
  if(_TBNFrames._distSq(firstSample, lastSample) < _TBNFrames._EPSILON) {
    isClosed = true;
  }
  this.isClosed = isClosed;
  let i;
  for (i = 0; i <= res; i++) {
    const t = this.endPoints[0] + (this.endPoints[1] - this.endPoints[0]) * (i / res);
    let e0;
    if(i === 0)e0 = firstSample;
    else if(i === res)e0 = lastSample;
    else e0 = this.func.evaluate(t);
    this.tangents[i] = _TBNFrames._getTangent(this.func, t, e0);
    if(this.isClosed && i > 0) {
      const len = MathUtil.vec3length(
        MathUtil.vec3sub(this.tangents[i], this.tangents[i - 1]));
      totalLength += len;
      runningLengths[i] = totalLength;
    }
  }
  for (i = 0; i <= res; i++) {
    if(i === 0) {
      this.normals[i] = _TBNFrames.normalFromTangent(this.tangents[0]);
    } else {
      const b = MathUtil.vec3cross(this.tangents[i - 1], this.tangents[i]);
      if(MathUtil.vec3length(b) < _TBNFrames._EPSILON) {
        this.normals[i] = this.normals[i - 1];
      } else {
        MathUtil.vec3normalizeInPlace(b);
        cosAngle = MathUtil.vec3dot(this.tangents[i - 1], this.tangents[i]);
        sinAngle = Math.abs(MathUtil.vec3length(
          MathUtil.vec3cross(this.tangents[i - 1], this.tangents[i])));
        this.normals[i] = _TBNFrames._rotateVector(
          this.normals[i - 1], b, sinAngle, cosAngle);
      }
    }
  }
  if(isClosed && totalLength > 0) {
  // Adjust angles of normals to prevent seams
    const quat = MathUtil.quatFromVectors(this.normals[res], this.normals[0]);
    let angle = MathUtil.quatToAxisAngle(quat)[3];
    angle *= MathUtil.ToRadians;
    // Set basis vectors at ends to the same value
    this.normals[res] = this.normals[0];
    this.tangents[res] = this.tangents[0];
    if(angle !== 0) {
      for(1; i <= res - 1; i++) {
        subAngle = angle * runningLengths[i] / totalLength;
        cosAngle = Math.cos(subAngle);
        sinAngle = subAngle >= 0 && subAngle < 6.283185307179586 ? subAngle <= 3.141592653589793 ? Math.sqrt(1.0 - cosAngle * cosAngle) : -Math.sqrt(1.0 - cosAngle * cosAngle) : Math.sin(subAngle);
        this.normals[i] = _TBNFrames._rotateVector(
          this.normals[i], this.tangents[i], sinAngle, cosAngle);
      }
    }
  }

  for (i = 0; i <= res; i++) {
    this.binormals[i] = MathUtil.vec3cross(this.tangents[i], this.normals[i]);
  }
};
/** @ignore */
_TBNFrames.getEndPoints = function(func) {
  if(typeof func.endPoints !== "undefined" && func.endPoints !== null) {
    return func.endPoints();
  } else {
    return [0, 1];
  }
};
/** @ignore */
_TBNFrames._getTangent = function(func, t, sampleAtPoint) {
  let tangent;
  if(typeof func.velocity !== "undefined" && func.velocity !== null) {
    tangent = func.velocity(t);
    if(tangent[0] !== 0 || tangent[1] !== 0 || tangent[2] !== 0) {
      return MathUtil.vec3normalizeInPlace(tangent);
    }
  }
  let direction = t === 1 ? -1 : 1;
  let sampleAtNearbyPoint = func.evaluate(t + direction * _TBNFrames._EPSILON);
  tangent = MathUtil.vec3normalizeInPlace(
    MathUtil.vec3sub(sampleAtNearbyPoint, sampleAtPoint));
  if(tangent[0] === 0 && tangent[1] === 0 && tangent[2] === 0) {
    direction = -direction;
    sampleAtNearbyPoint = func.evaluate(t + direction * _TBNFrames._EPSILON);
    tangent = MathUtil.vec3sub(sampleAtNearbyPoint, sampleAtPoint);
  }
  if(direction < 0) {
    // Since we evaluated backward in this case, the tangent
    // will be backward; negate it here
    MathUtil.vec3scaleInPlace(tangent, -1);
  }
  return MathUtil.vec3normalizeInPlace(tangent);
};
/** @ignore */
_TBNFrames._rotateVector = function(vec, reference, sinAngle, cosAngle) {
  const vx = vec[0];
  const vy = vec[1];
  const vz = vec[2];
  const bx = reference[0];
  const by = reference[1];
  const bz = reference[2];
  const mc = 1.0 - cosAngle;
  const x = vx * (cosAngle + bx * bx * mc) + vy * (-sinAngle * bz + bx * by * mc) + vz * (sinAngle * by + bx * bz * mc);
  const y = vx * (sinAngle * bz + bx * by * mc) + vy * (cosAngle + by * by * mc) + vz * (-sinAngle * bx + by * bz * mc);
  const z = vx * (-sinAngle * by + bx * bz * mc) + vy * (sinAngle * bx + by * bz * mc) + vz * (cosAngle + bz * bz * mc);
  return [x, y, z];
};

/** @ignore */
_TBNFrames.normalFromTangent = function(tangent) {
  return MathUtil.vec3normalizeInPlace(MathUtil.vec3perp(tangent));
};
/** @ignore */
_TBNFrames._EPSILON = 0.000001;
/** @ignore */
_TBNFrames.prototype.getSampleAndBasisVectors = function(u) {
  const uNorm = (u - this.endPoints[0]) * 1.0 / (this.endPoints[1] - this.endPoints[0]);
  let sample;
  let b;
  let n;
  let t;
  const val = [];
  let cache = false;
  let i;
  let e0;
  let normal;
  let tangent;
  let binormal;
  if(uNorm >= 0 && uNorm <= 1) {
    let index = uNorm * (this.binormals.length - 1);
    if(Math.abs(index - Math.round(index)) < _TBNFrames._EPSILON) {
      index = Math.round(index);
      b = this.binormals[index];
      n = this.normals[index];
      t = this.tangents[index];
      sample = this.func.evaluate(u);
    } else {
      for(i = 0; i < this.vectorsCache.length; i += 2) {
        if(this.vectorsCache[i] === u) {
          return this.vectorsCache[i + 1];
        }
      }
      sample = this.func.evaluate(u);
      index = Math.floor(index);
      e0 = sample;
      tangent = _TBNFrames._getTangent(this.func, u, e0);
      normal = MathUtil.vec3normalizeInPlace(
        MathUtil.vec3cross(this.binormals[index], tangent));
      binormal = MathUtil.vec3normalizeInPlace(
        MathUtil.vec3cross(tangent, normal));
      b = binormal;
      n = normal;
      t = tangent;
      cache = true;
    }
  } else {
    for(i = 0; i < this.vectorsCache.length; i += 2) {
      if(this.vectorsCache[i] === u) {
        return this.vectorsCache[i + 1];
      }
    }
    if(this.isClosed) {
      let un = uNorm - Math.floor(uNorm);
      if(un < 0)un = 1.0 + un;
      return this.getSampleAndBasisVectors(
        this.endPoints[0] + (this.endPoints[1] - this.endPoints[0]) * un);
    }
    sample = this.func.evaluate(u);
    e0 = sample;
    tangent = _TBNFrames._getTangent(this.func, u, e0);

    normal = _TBNFrames.normalFromTangent(tangent);
    binormal = MathUtil.vec3normalizeInPlace(
      MathUtil.vec3cross(tangent, normal));
    b = binormal;
    n = normal;
    t = tangent;
    cache = true;
  }
  val[0] = n[0];
  val[1] = n[1];
  val[2] = n[2];
  val[3] = b[0];
  val[4] = b[1];
  val[5] = b[2];
  val[6] = t[0];
  val[7] = t[1];
  val[8] = t[2];
  val[9] = sample[0];
  val[10] = sample[1];
  val[11] = sample[2];
  if(cache) {
    if(this.vectorsCacheIndex >= 400)this.vectorsCacheIndex = 0;
    this.vectorsCache[this.vectorsCacheIndex++] = u;
    this.vectorsCache[this.vectorsCacheIndex++] = val;
  }
  return val;
};
/** @ignore */
_TBNFrames._distSq = function(a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dz = b[2] - a[2];
  return dx * dx + dy * dy + dz * dz;
};

/**
 * A [surface evaluator object]{@link Surface} for a tube extruded from a parametric curve.
 * <p>This class is considered a supplementary class to the
 * Public Domain HTML 3D Library and is not considered part of that
 * library.
 * @param {Object} func A [curve evaluator object]{@link Curve} that describes the 3-dimensional curve to extrude
 * a tube from. For best results, the curve should be continuous and smooth.
 * @param {number} [thickness] Radius of the
 * extruded tube. If this parameter is null, undefined, or omitted, the default is 0.125.
 * @param {Object} [sweptCurve] A [curve evaluator object]{@link Curve} that
 * describes a two-dimensional curve to serve as
 * the cross section of the extruded shape. The curve need not be closed. If this parameter is null, undefined, or omitted, uses a
 * circular cross section in which the V coordinate ranges from 0 through
 * 1. The cross section will generally have a radius of 1 unit; bigger or smaller cross sections
 * will affect the meaning of the "thickness" parameter.
 * @constructor
 */
export const CurveTube = function(func, thickness, sweptCurve) {
  this.thickness = typeof thickness === "undefined" || thickness === null ? 0.125 : thickness;
  this.sweptCurve = sweptCurve;
  this.func = func;
  this.tangentFinder = new _TBNFrames(func);
};
CurveTube.prototype = Object.create(Surface.prototype);
CurveTube.prototype.constructor = CurveTube;
/**
 * Returns the starting and ending U and V coordinates of this surface.
 * @returns A four-element array. The first and second
 * elements are the starting and ending U coordinates, respectively, of the surface, and the third
 * and fourth elements are its starting and ending V coordinates.
 * The starting and ending U coordinates will be the extruded curve's end points (or <code>[0, 1]</code>
 * if it doesn't implement an <code>endPoints</code> method).
 * The starting and ending V coordinates are <code>[0, &pi;]</code> by default, but if a cross
 * section curve is defined, those V coordinates will be that curve's end points (or <code>[0, 1]</code>
 * if it doesn't implement an <code>endPoints</code> method).
 */
CurveTube.prototype.endPoints = function() {
  const ep = _TBNFrames.getEndPoints(this.func);
  if(typeof this.sweptCurve !== "undefined" && this.sweptCurve !== null) {
    const sp = _TBNFrames.getEndPoints(this.sweptCurve);
    return [ep[0], ep[1], sp[0], sp[1]];
  } else {
    return [ep[0], ep[1], 0, MathUtil.PiTimes2];
  }
};
/**
 * Generates a point on the extruded tube from the given u and V coordinates.
 * @param {number} u U coordinate. This will run the length of the curve.
 * @param {number} v V coordinate. This will sweep around the extruded
 * tube.
 * @returns {Array<number>} A 3-element array specifying a 3D point.
 */
CurveTube.prototype.evaluate = function(u, v) {
  const basisVectors = this.tangentFinder.getSampleAndBasisVectors(u);
  const sampleX = basisVectors[9];
  const sampleY = basisVectors[10];
  const sampleZ = basisVectors[11];
  let t1;
  let t2;
  let sx;
  let sy;
  let sz;
  if(this.sweptCurve) {
    const vpos = this.sweptCurve.evaluate(v);
    t1 = vpos[0];
    t2 = vpos[1];
    sx = sampleX + (-basisVectors[0] * t1 + basisVectors[3] * t2) * this.thickness;
    sy = sampleY + (-basisVectors[1] * t1 + basisVectors[4] * t2) * this.thickness;
    sz = sampleZ + (-basisVectors[2] * t1 + basisVectors[5] * t2) * this.thickness;
  } else {
    t1 = Math.cos(v);
    t2 = v >= 0 && v < 6.283185307179586 ? v <= 3.141592653589793 ? Math.sqrt(1.0 - t1 * t1) : -Math.sqrt(1.0 - t1 * t1) : Math.sin(v);
    sx = sampleX + (-basisVectors[0] * t1 + basisVectors[3] * t2) * this.thickness;
    sy = sampleY + (-basisVectors[1] * t1 + basisVectors[4] * t2) * this.thickness;
    sz = sampleZ + (-basisVectors[2] * t1 + basisVectors[5] * t2) * this.thickness;
  }
  return [sx, sy, sz];
};
