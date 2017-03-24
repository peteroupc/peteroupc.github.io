/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
/* global H3DU */
/** @ignore */
H3DU._TBNFrames = function(func) {
  "use strict";
  this.func = typeof H3DU.Curve !== "undefined" && H3DU.Curve !== null ? new H3DU.Curve(func) : func;
  this.normals = [];
  this.binormals = [];
  this.tangents = [];
  this.vectorsCache = [];
  this.vectorsCacheIndex = 0;
  var isClosed = false;
  var res = 50; // NOTE: Many samples of TBN frames are needed for accuracy
  var totalLength = 0;

  var runningLengths = [0];
  this.endPoints = H3DU._TBNFrames.getEndPoints(func);
  var firstSample = this.func.evaluate(this.endPoints[0]);
  var lastSample = this.func.evaluate(this.endPoints[1]);
  if(H3DU._TBNFrames._distSq(firstSample, lastSample) < H3DU._TBNFrames._EPSILON) {
    isClosed = true;
  }
  this.isClosed = isClosed;
  for(var i = 0; i <= res; i++) {
    var t = this.endPoints[0] + (this.endPoints[1] - this.endPoints[0]) * (i / res);
    var e0;
    if(i === 0)e0 = firstSample;
    else if(i === res)e0 = lastSample;
    else e0 = this.func.evaluate(t);
    this.tangents[i] = H3DU._TBNFrames._getTangent(this.func, t, e0);
    if(this.isClosed && i > 0) {
      var len = H3DU.Math.vec3length(
        H3DU.Math.vec3sub(this.tangents[i], this.tangents[i - 1]));
      totalLength += len;
      runningLengths[i] = totalLength;
    }
  }
  for(i = 0; i <= res; i++) {
    if(i === 0) {
      this.normals[i] = H3DU._TBNFrames.normalFromTangent(this.tangents[0]);
    } else {
      var b = H3DU.Math.vec3cross(this.tangents[i - 1], this.tangents[i]);
      if(H3DU.Math.vec3length(b) < H3DU._TBNFrames._EPSILON) {
        this.normals[i] = this.normals[i - 1];
      } else {
        H3DU.Math.vec3normalizeInPlace(b);
        var cosAngle = H3DU.Math.vec3dot(this.tangents[i - 1], this.tangents[i]);
        var sinAngle = Math.abs(H3DU.Math.vec3length(
         H3DU.Math.vec3cross(this.tangents[i - 1], this.tangents[i])));
        this.normals[i] = H3DU._TBNFrames._rotateVector(
        this.normals[i - 1], b, sinAngle, cosAngle);
      }
    }
  }
  if(isClosed && totalLength > 0) {
  // Adjust angles of normals to prevent seams
    var quat = H3DU.Math.quatFromVectors(this.normals[res], this.normals[0]);
    var angle = H3DU.Math.quatToAxisAngle(quat)[3];
    angle *= H3DU.Math.ToRadians;

  // Set basis vectors at ends to the same value
    this.normals[res] = this.normals[0];
    this.tangents[res] = this.tangents[0];
    if(angle !== 0) {
      for(i = 1; i <= res - 1; i++) {
        var subAngle = angle * runningLengths[i] / totalLength;
        cosAngle = Math.cos(subAngle);
        sinAngle = (subAngle>=0 && subAngle<6.283185307179586) ? (subAngle<=3.141592653589793 ? Math.sqrt(1.0-cosAngle*cosAngle) : -Math.sqrt(1.0-cosAngle*cosAngle)) : Math.sin(subAngle);
        this.normals[i] = H3DU._TBNFrames._rotateVector(
           this.normals[i], this.tangents[i], sinAngle, cosAngle);
      }
    }
  }
  for(i = 0; i <= res; i++) {
    this.binormals[i] = H3DU.Math.vec3cross(this.tangents[i], this.normals[i]);
  }
};
/** @ignore */
H3DU._TBNFrames.getEndPoints = function(func) {
  "use strict";
  if(typeof func.endPoints !== "undefined" && func.endPoints !== null) {
    return func.endPoints();
  } else {
    return [0, 1];
  }
};
/** @ignore */
H3DU._TBNFrames._getTangent = function(func, t, sampleAtPoint) {
  "use strict";
  var tangent;
  if(typeof func.velocity !== "undefined" && func.velocity !== null) {
    tangent = func.velocity(t);
    if(tangent[0] !== 0 || tangent[1] !== 0 || tangent[2] !== 0) {
      return H3DU.Math.vec3normalizeInPlace(tangent);
    }
  }
  var direction = t === 1 ? -1 : 1;
  var sampleAtNearbyPoint = func.evaluate(t + direction * H3DU._TBNFrames._EPSILON);
  tangent = H3DU.Math.vec3normalizeInPlace(
       H3DU.Math.vec3sub(sampleAtNearbyPoint, sampleAtPoint));
  if(tangent[0] === 0 && tangent[1] === 0 && tangent[2] === 0) {
    direction = -direction;
    sampleAtNearbyPoint = func.evaluate(t + direction * H3DU._TBNFrames._EPSILON);
    tangent = H3DU.Math.vec3sub(sampleAtNearbyPoint, sampleAtPoint);
  }
  if(direction < 0) {
      // Since we evaluated backward in this case, the tangent
      // will be backward; negate it here
    H3DU.Math.vec3scaleInPlace(tangent, -1);
  }
  return H3DU.Math.vec3normalizeInPlace(tangent);
};
/** @ignore */
H3DU._TBNFrames._rotateVector = function(vec, reference, sinAngle, cosAngle) {
  "use strict";
  var vx = vec[0];
  var vy = vec[1];
  var vz = vec[2];
  var bx = reference[0];
  var by = reference[1];
  var bz = reference[2];
  var mc = 1.0 - cosAngle;
  var x = vx * (cosAngle + bx * bx * mc) + vy * (-sinAngle * bz + bx * by * mc) + vz * (sinAngle * by + bx * bz * mc);
  var y = vx * (sinAngle * bz + bx * by * mc) + vy * (cosAngle + by * by * mc) + vz * (-sinAngle * bx + by * bz * mc);
  var z = vx * (-sinAngle * by + bx * bz * mc) + vy * (sinAngle * bx + by * bz * mc) + vz * (cosAngle + bz * bz * mc);
  return [x, y, z];
};

/** @ignore */
H3DU._TBNFrames.normalFromTangent = function(tangent) {
  "use strict";
  return H3DU.Math.vec3normalizeInPlace(H3DU.Math.vec3perp(tangent));
};
/** @ignore */
H3DU._TBNFrames._EPSILON = 0.000001;
/** @ignore */
H3DU._TBNFrames.prototype.getSampleAndBasisVectors = function(u) {
  "use strict";
  var uNorm = (u - this.endPoints[0]) * 1.0 / (this.endPoints[1] - this.endPoints[0]);
  var sample;
  var b, n, t;
  var val = [];
  var cache = false;
  var i, e0, normal, tangent, binormal;
  if(uNorm >= 0 && uNorm <= 1) {
    var index = uNorm * (this.binormals.length - 1);
    if(Math.abs(index - Math.round(index)) < H3DU._TBNFrames._EPSILON) {
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
      tangent = H3DU._TBNFrames._getTangent(this.func, u, e0);
      normal = H3DU.Math.vec3normalizeInPlace(
       H3DU.Math.vec3cross(this.binormals[index], tangent));
      binormal = H3DU.Math.vec3normalizeInPlace(
       H3DU.Math.vec3cross(tangent, normal));
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
      var un = uNorm - Math.floor(uNorm);
      if(un < 0)un = 1.0 + un;
      return this.getSampleAndBasisVectors(
         this.endPoints[0] + (this.endPoints[1] - this.endPoints[0]) * un);
    }
    sample = this.func.evaluate(u);
    e0 = sample;
    tangent = H3DU._TBNFrames._getTangent(this.func, u, e0);
    normal = H3DU._TBNFrames.normalFromTangent(tangent);
    binormal = H3DU.Math.vec3normalizeInPlace(
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
/** @ignore */
H3DU._TBNFrames._distSq = function(a, b) {
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
 * @constructor
 * @memberof H3DU
 * @param {Object} func A [curve evaluator object]{@link H3DU.Curve} that describes the 3-dimensional curve to extrude
 * a tube from. For best results, the curve should be continuous and smooth.
 * @param {number} [thickness] Radius of the
 * extruded tube. If this parameter is null or omitted, the default is 0.125.
 * @param {Object} [sweptCurve] A [curve evaluator object]{@link H3DU.Curve} that
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
  this.tangentFinder = new H3DU._TBNFrames(func);
};
H3DU.CurveTube.prototype = Object.create(H3DU.Surface.prototype);
H3DU.CurveTube.prototype.constructor = H3DU.CurveTube;
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
H3DU.CurveTube.prototype.endPoints = function() {
  "use strict";
  var ep = H3DU._TBNFrames.getEndPoints(this.func);
  if(typeof this.sweptCurve !== "undefined" && this.sweptCurve !== null) {
    var sp = H3DU._TBNFrames.getEndPoints(this.sweptCurve);
    return [ep[0], ep[1], sp[0], sp[1]];
  } else {
    return [ep[0], ep[1], 0, H3DU.Math.PiTimes2];
  }
};
/**
 * Generates a point on the extruded tube from the given u and V coordinates.
 * @param {number} u U coordinate. This will run the length of the curve.
 * @param {number} v V coordinate. This will sweep around the extruded
 * tube.
 * @returns {Array<number>} A 3-element array specifying a 3D point.
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
 * @constructor
 * @alias CurveTube
 * @deprecated Use {@link H3DU.CurveTube} instead.
 */
var CurveTube = H3DU.CurveTube;
