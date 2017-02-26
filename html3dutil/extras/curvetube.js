/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
/* global H3DU */
/** @private */
H3DU._FrenetFrames = function(func) {
  "use strict";
  this.func = func;
  this.normals = [];
  this.binormals = [];
  this.tangents = [];
  this.vectorsCache = [];
  this.vectorsCacheIndex = 0;
  var isClosed = false;
  var res = 50;
  var nextSample = null;
  var lastSample = func.evaluate(1.0);
  var totalLength = 0;
  var samples = [];
  var lengths = [];
  this.endpoints = H3DU._FrenetFrames.getEndPoints();
  if(H3DU._FrenetFrames._distSq(func.evaluate(0), lastSample) < H3DU._FrenetFrames._EPSILON) {
    isClosed = true;
  }
  for(var i = 0; i <= res; i++) {
    var t = this.endpoints[0] + (this.endpoints[1] - this.endpoints[0]) * (i / res);
    var e0 = nextSample ? nextSample : func.evaluate(t);
    if(isClosed && i > 0) {
      var len = Math.sqrt(H3DU._FrenetFrames._distSq(e0, samples[i - 1]));
      totalLength += len;
      lengths.push(len);
    }
    nextSample = i === res ? e0 : func.evaluate((i + 1) / res);
    samples.push(e0);
    var tangent = H3DU._FrenetFrames._getTangent(func, t, e0);
    var normal;
    if(i > 0) {
      normal = H3DU.Math.vec3normInPlace(
    H3DU.Math.vec3cross(this.binormals[i - 1], tangent));
      if(normal[0] === 0 && normal[1] === 0 && normal[2] === 0) {
        // Normal is calculated to be 0, indicating that the tangent
        // and previous binormal were parallel
        normal = H3DU._FrenetFrames.normalFromTangent(tangent);
      }
    } else {
      normal = H3DU._FrenetFrames.normalFromTangent(tangent);
    }
    var binormal = H3DU.Math.vec3normInPlace(
    H3DU.Math.vec3cross(tangent, normal));
    this.normals[i] = normal;
    this.binormals[i] = binormal;
    this.tangents[i] = tangent;
  }
  if(isClosed && totalLength > 0) {
  // Adjust angles of binormal and normal to prevent seams
    var quat = H3DU.Math.quatFromVectors(this.normals[res], this.normals[0]);
    var angle = H3DU.Math.quatToAxisAngle(quat)[3];
    var runningLength = 0;
  // Set basis vectors at ends to the same value
    this.normals[res] = this.normals[0];
    this.binormals[res] = this.binormals[0];
    this.tangents[res] = this.tangents[0];
    for(i = 0; i < res - 1; i++) {
      runningLength += lengths[i];
      var lenproportion = runningLength / totalLength;
      var newq = H3DU.Math.quatFromAxisAngle(angle * lenproportion, this.tangents[i + 1]);
   // Rotate normal and binormal about the tangent, to keep them orthogonal to
   // tangent and each other
      this.normals[i + 1] = H3DU.Math.quatTransform(newq, this.normals[i + 1]);
      this.binormals[i + 1] = H3DU.Math.quatTransform(newq, this.binormals[i + 1]);
    }
  }
};
/** @private */
H3DU._FrenetFrames.getEndPoints = function(func) {
  "use strict";
  if(typeof H3DU.CurveEval.findEndPoints !== "undefined" && H3DU.CurveEval.findEndPoints !== null) {
    return H3DU.CurveEval.findEndPoints();
  } else if(typeof func.endpoints !== "undefined" && func.endpoints !== null) {
    return func.endpoints();
  } else {
    return [0, 1];
  }
};
/** @private */
H3DU._FrenetFrames._getTangent = function(func, t, sampleAtPoint) {
  "use strict";
  var tangent;
  if(typeof H3DU.CurveEval.findTangent !== "undefined" && H3DU.CurveEval.findTangent !== null) {
    tangent = H3DU.CurveEval.findTangent(func, t);
  } else {
    var direction = t === 1 ? -1 : 1;
    var sampleAtNearbyPoint = func.evaluate(t + direction * H3DU._FrenetFrames._EPSILON);
    tangent = H3DU.Math.vec3normInPlace(
    H3DU.Math.vec3sub(sampleAtNearbyPoint, sampleAtPoint));
    if(tangent[0] === 0 && tangent[1] === 0 && tangent[2] === 0) {
      direction = -direction;
      sampleAtNearbyPoint = func.evaluate(t + direction * H3DU._FrenetFrames._EPSILON);
      tangent = H3DU.Math.vec3normInPlace(
            H3DU.Math.vec3sub(sampleAtNearbyPoint, sampleAtPoint));
    }
    if(direction < 0) {
      // Since we evaluated backward in this case, the tangent
      // will be backward; negate it here
      H3DU.Math.vec3scaleInPlace(tangent, -1);
    }
  }
  return H3DU.Math.vec3normInPlace(tangent);
};
/** @private */
H3DU._FrenetFrames.normalFromTangent = function(tangent) {
  "use strict";
  return H3DU.Math.vec3normInPlace(H3DU.Math.vec3perp(tangent));
};
/** @private */
H3DU._FrenetFrames._EPSILON = 0.000001;
/** @private */
H3DU._FrenetFrames.prototype.getSampleAndBasisVectors = function(u) {
  "use strict";
  var uNorm = (u - this.endpoints[0]) * 1.0 / (this.endpoints[1] - this.endpoints[0]);
  var sample = this.func.evaluate(u);
  var b, n, t;
  var val = [];
  var cache = false;
  var i, e0, normal, tangent, binormal;
  if(uNorm >= 0 && uNorm <= 1) {
    var index = uNorm * (this.binormals.length - 1);
    if(Math.abs(index - Math.round(index)) < H3DU._FrenetFrames._EPSILON) {
      index = Math.round(index);
      b = this.binormals[index];
      n = this.normals[index];
      t = this.tangents[index];
    } else {
      for(i = 0; i < this.vectorsCache.length; i += 2) {
        if(this.vectorsCache[i] === u) {
          // this.cacheHits = (this.cacheHits || 0) + 1;
          return this.vectorsCache[i + 1];
        }
      }
      // this.cacheMisses = (this.cacheMisses || 0) + 1;
      index = Math.floor(index);
      e0 = sample;
      tangent = H3DU._FrenetFrames._getTangent(this.func, u, e0);
      normal = H3DU.Math.vec3normInPlace(
     H3DU.Math.vec3cross(this.binormals[index], tangent));
      binormal = H3DU.Math.vec3normInPlace(
     H3DU.Math.vec3cross(tangent, normal));
      b = binormal;
      n = normal;
      t = tangent;
      cache = true;
    }
  } else {
    for(i = 0; i < this.vectorsCache.length; i += 2) {
      if(this.vectorsCache[i] === u) {
        // this.cacheHits = (this.cacheHits || 0) + 1;
        return this.vectorsCache[i + 1];
      }
    }
    // this.cacheMisses = (this.cacheMisses || 0) + 1;
    e0 = sample;
    tangent = H3DU._FrenetFrames._getTangent(this.func, u, e0);
    normal = H3DU._FrenetFrames.normalFromTangent(tangent);
    binormal = H3DU.Math.vec3normInPlace(
    H3DU.Math.vec3cross(tangent, normal));
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
/** @private */
H3DU._FrenetFrames._distSq = function(a, b) {
  "use strict";
  var dx = b[0] - a[0];
  var dy = b[1] - a[1];
  var dz = b[2] - a[2];
  return dx * dx + dy * dy + dz * dz;
};
/**
 * A [surface evaluator object]{@link H3DU.SurfaceEval#vertex} for a tube extruded from a parametric curve.
 * <p>This class is considered a supplementary class to the
 * Public Domain HTML 3D Library and is not considered part of that
 * library. <p>
 * To use this class, you must include the script "extras/curvetube.js"; the
 * class is not included in the "h3du_min.js" file which makes up
 * the HTML 3D Library. Example:<pre>
 * &lt;script type="text/javascript" src="extras/curvetube.js">&lt;/script></pre>
 * @class
 * @alias H3DU.CurveTube
 * @param {Object} func A [curve evaluator object]{@link H3DU.CurveEval#vertex} that describes the 3-dimensional curve to extrude
 * a tube from.
 * @param {Number} [thickness] Radius of the
 * extruded tube. If this parameter is null or omitted, the default is 0.125.
 * @param {Object} [sweptCurve] A [curve evaluator object]{@link H3DU.CurveEval#vertex} that
 * describes a two-dimensional curve to serve as
 * the cross section of the extruded shape. The curve need not be closed. If this parameter is null
 * or omitted, uses a
 * circular cross section in which the V coordinate ranges from 0 through
 * 1. The cross section will generally have a radius of 1 unit; bigger or smaller cross sections
 * will affect the meaning of the "thickness" parameter.
 */
H3DU.CurveTube = function(func, thickness, sweptCurve) {
  "use strict";
  this.thickness = typeof thickness === "undefined" || thickness === null ? 0.125 : thickness;
  this.sweptCurve = sweptCurve;
  this.func = func;
  this.tangentFinder = new H3DU._FrenetFrames(func);
};
/**
 * TODO: Not documented yet.
 * @returns {*} Return value.
 * @memberof! H3DU.CurveTube#
 */
H3DU.CurveTube.prototype.endpoints = function() {
  "use strict";
  var ep = H3DU._FrenetFrames.getEndPoints(this.func);
  if(typeof this.sweptCurve !== "undefined" && this.sweptCurve !== null) {
    var sp = H3DU._FrenetFrames.getEndPoints(this.sweptCurve);
    return [ep[0], ep[1], sp[0], sp[1]];
  } else {
    return [ep[0], ep[1], 0, H3DU.Math.PiTimes2];
  }
};
/**
 * Generates a point on the extruded tube from the given u and V coordinates.
 * @param {Number} u U coordinate. This will run the length of the curve.
 * @param {Number} v V coordinate. This will sweep around the extruded
 * tube.
 * @returns {Array<Number>} A 3-element array specifying a 3D point.
 * @memberof! H3DU.CurveTube#
 */
H3DU.CurveTube.prototype.evaluate = function(u, v) {
  "use strict";
  var basisVectors = this.tangentFinder.getSampleAndBasisVectors(u);
  var sampleX = basisVectors[9];
  var sampleY = basisVectors[10];
  var sampleZ = basisVectors[11];
  var t1, t2, sx, sy, sz;
  if(this.sweptCurve) {
    var vpos = this.sweptCurve.evaluate(v);
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
/* exported CurveTube */
/**
 * Alias for the {@link H3DU.CurveTube} class.
 * @class
 * @alias CurveTube
 * @deprecated Use {@link H3DU.CurveTube} instead.
 */
var CurveTube = H3DU.CurveTube;
