/* global _normAngleRadians, _simpsonRec */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
/* exported simpsonRec */
function simpsonRec(func, mn, mx, dir, depth, f1value, f3value, f5value) {
  "use strict";
  var bm = (mx - mn) * 0.25;
  var f1 = typeof f1value === "undefined" || f1value === null ? func(mn) : f1value;
  var f2 = func(mn + bm);
  var f3 = typeof f3value === "undefined" || f3value === null ? func(mn + bm * 2) : f3value;
  var f4 = func(mx - bm);
  var f5 = typeof f5value === "undefined" || f5value === null ? func(mx) : f5value;
  var simpWhole = bm * 2 / 3 * (f1 + 4 * f3 + f5) * dir;
  var simpHalves = bm / 3 * (f1 + 4 * f2 + f3) * dir +
    bm / 3 * (f3 + 4 * f4 + f5) * dir;
  if(Math.abs(simpWhole - simpHalves) < 1e-6) {
    return simpHalves + (simpHalves - simpWhole) / 15;
  } else if(depth < 10) {
    return simpHalves + (simpHalves - simpWhole) / 15;
  } else {
    return _simpsonRec(func, mn, mn + bm * 2, dir, depth + 1, f1, f2, f3) +
         _simpsonRec(func, mn + bm * 2, mx, dir, depth + 1, f3, f4, f5);
  }
}
/** @ignore */
function _numIntegrate(func, xmin, xmax) {
  "use strict";
/*
* Estimates the integral of a function. The integral
* is like the area between the function's graph and the X axis,
* where areas above the X axis add to the integral, and areas
* below the X axis subtract from it.
* @private
* @param {Function} func A function that takes one number
* and returns a number. For best results,
* the function should be continuous (informally, this means
* its graph between <code>xmin</code> and
* <code>xmax</code> can be drawn without lifting the pen).
* @param {number} xmin Smallest input to the function,
* or the lower limit to integration.
* @param {number} xmax Largest input to the function,
* or the upper limit to integration. If xmax is less than xmin,
* this results in a negative integral.
* @returns The approximate integral of _func_ between
* _xmin_ and _xmax_.
*/
  if(xmax === xmin)return 0;
  var mn = Math.min(xmin, xmax);
  var mx = Math.max(xmin, xmax);
  var dir = xmax >= xmin ? 1 : -1;
  return _simpsonRec(func, mn, mx, dir, 0, null, null, null);
}

  /** @ignore */
/* exported normAngleRadians */
function normAngleRadians(angle) {
  "use strict";
  var twopi = Math.PI * 2;
  var normAngle = angle;
  if(normAngle >= 0) {
    normAngle = normAngle < twopi ? normAngle : normAngle % twopi;
  } else {
    normAngle %= twopi;
    normAngle += twopi;
  }
  return normAngle;
}

/** @ignore */
function _ellipseSemiLength(xRadius, yRadius) {
  "use strict";
  var a = Math.min(xRadius, yRadius);
  var b = Math.max(xRadius, yRadius);
          // use James Ivory's 1798 algorithm to calculate
    // the half-length of an ellipse
  var c = a / b;
  var e = (1 - c) / (1 + c);
  var esq = e * e;
  var eseries = esq;
  var series = 1 + 0.25 * eseries;
  eseries *= esq;
  series += eseries * 0.015625;
  eseries *= esq;
  series += eseries * 0.00390625;
  eseries *= esq;
  series += eseries * 0.00152587890625;
  eseries *= esq;
  series += eseries * 0.0007476806640625;
  eseries *= esq;
  series += eseries * 0.00042057037353515625;
    // The series keeps going, but we stop here
  return b * (Math.PI / (1 + e)) * series;
}
/** @ignore */
function _ellipticE(phi, m) {
  "use strict";
  if(phi === 0)return 0;
  if(phi <= Math.PI * 0.25) {
    var ellipticIntegrand = function(x) {
      var xsq = x * x;
      return Math.sqrt((1 - xsq * m) / (1 - xsq));
    };
    return _numIntegrate(ellipticIntegrand, 0, Math.sin(phi));
  } else if(phi <= Math.PI * 0.5) {
    ellipticIntegrand = function(x) {
      var s = Math.sin(x);
      return Math.sqrt(1 - m * s * s);
    };
    return _numIntegrate(ellipticIntegrand, 0, phi);
  } else {
    var halfpi = Math.PI * 0.5;
    var u = Math.floor(phi / halfpi);
    phi -= u * halfpi;
    return _ellipticE(halfpi, m) * u +
      _ellipticE(phi, m);
  }
}
/* exported ellipticArcLength */
function ellipticArcLength(xRadius, yRadius, startAngle, endAngle) {
  "use strict";
  if(startAngle === endAngle || xRadius <= 0 || yRadius <= 0)return 0;
  if(xRadius === yRadius) {
  // for circular arc length this is extremely simple
    return Math.abs((endAngle - startAngle) * xRadius);
  } else if(Math.abs(endAngle - startAngle) >= Math.PI * 2) {
      // Length of a full ellipse (NOTE: This function assumes
      // arc lengths of 360 degrees or less)
    return _ellipseSemiLength(xRadius, yRadius) * 2;
  } else if(Math.abs(endAngle - startAngle) === Math.PI) {
      // Length of a half ellipse
    return _ellipseSemiLength(xRadius, yRadius);
  }
  var mn = Math.min(xRadius, yRadius);
  var mx = Math.max(xRadius, yRadius);
  var eccSq = 1 - mn * mn / (mx * mx);
  var sa = _normAngleRadians(startAngle);
  var ea = _normAngleRadians(endAngle);
  var saLength = mx * _ellipticE(sa, eccSq);
  var eaLength = mx * _ellipticE(ea, eccSq);
  if(startAngle < endAngle && sa < ea ||
         startAngle > endAngle && sa > ea) {
    return Math.abs(eaLength - saLength);
  } else if(startAngle < endAngle) {
      // startAngle -- seam -- endAngle
    var tlen = mx * 4 * _ellipticE(Math.PI * 0.5, eccSq);
    return tlen - saLength + eaLength;
  } else {
  // endAngle -- seam -- startAngle
    tlen = mx * 4 * _ellipticE(Math.PI * 0.5, eccSq);
    return tlen - eaLength + saLength;
  }
}
