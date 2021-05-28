/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under Creative Commons Zero (CC0): http://creativecommons.org/publicdomain/zero/1.0/

*/
/* exported simpsonRec */
function simpsonRec(func, mn, mx, dir, depth, f1value, f3value, f5value) {
  "use strict";
  const bm = (mx - mn) * 0.25;
  const f1 = typeof f1value === "undefined" || f1value === null ? func(mn) : f1value;
  const f2 = func(mn + bm);
  const f3 = typeof f3value === "undefined" || f3value === null ? func(mn + bm * 2) : f3value;
  const f4 = func(mx - bm);
  const f5 = typeof f5value === "undefined" || f5value === null ? func(mx) : f5value;
  const simpWhole = bm * 2 / 3 * (f1 + 4 * f3 + f5) * dir;
  const simpHalves = bm / 3 * (f1 + 4 * f2 + f3) * dir +
    bm / 3 * (f3 + 4 * f4 + f5) * dir;
  if(Math.abs(simpWhole - simpHalves) < 1e-6) {
    return simpHalves + (simpHalves - simpWhole) / 15;
  } else if(depth < 10) {
    return simpHalves + (simpHalves - simpWhole) / 15;
  } else {
    return simpsonRec(func, mn, mn + bm * 2, dir, depth + 1, f1, f2, f3) +
         simpsonRec(func, mn + bm * 2, mx, dir, depth + 1, f3, f4, f5);
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
  const mn = Math.min(xmin, xmax);
  const mx = Math.max(xmin, xmax);
  const dir = xmax >= xmin ? 1 : -1;
  return simpsonRec(func, mn, mx, dir, 0, null, null, null);
}

/** @ignore */
function normAngleRadians(angle) {
  "use strict";
  const twopi = Math.PI * 2;
  let normAngle = angle;
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
  const a = Math.min(xRadius, yRadius);
  const b = Math.max(xRadius, yRadius);
  // use James Ivory's 1798 algorithm to calculate
  // the half-length of an ellipse
  const c = a / b;
  const e = (1 - c) / (1 + c);
  const esq = e * e;
  let eseries = esq;
  let series = 1 + 0.25 * eseries;
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
  let ellipticIntegrand;
  if(phi <= Math.PI * 0.25) {
    ellipticIntegrand = function(x) {
      const xsq = x * x;
      return Math.sqrt((1 - xsq * m) / (1 - xsq));
    };
    return _numIntegrate(ellipticIntegrand, 0, Math.sin(phi));
  } else if(phi <= Math.PI * 0.5) {
    ellipticIntegrand = function(x) {
      const s = Math.sin(x);
      return Math.sqrt(1 - m * s * s);
    };
    return _numIntegrate(ellipticIntegrand, 0, phi);
  } else {
    const halfpi = Math.PI * 0.5;
    const u = Math.floor(phi / halfpi);
    phi -= u * halfpi;
    return _ellipticE(halfpi, m) * u +
      _ellipticE(phi, m);
  }
}
/* exported ellipticArcLength */
function ellipticArcLength(xRadius, yRadius, startAngle, endAngle) {
  "use strict";
  if(startAngle === endAngle || xRadius <= 0 || yRadius <= 0)return 0;
  if(Math.abs(endAngle - startAngle) >= Math.PI * 2) {
    // Length of a full ellipse (NOTE: This function assumes
    // arc lengths of 360 degrees or less)
    if(xRadius === yRadius) {
      return Math.PI * 2 * xRadius;
    } else {
      return _ellipseSemiLength(xRadius, yRadius) * 2;
    }
  } else if(xRadius === yRadius) {
  // for circular arc length this is extremely simple
    return Math.abs((endAngle - startAngle) * xRadius);
  } else if(Math.abs(endAngle - startAngle) === Math.PI) {
    // Length of a half ellipse
    return _ellipseSemiLength(xRadius, yRadius);
  }
  const mn = Math.min(xRadius, yRadius);
  const mx = Math.max(xRadius, yRadius);
  const eccSq = 1 - mn * mn / (mx * mx);
  const sa = normAngleRadians(startAngle);
  const ea = normAngleRadians(endAngle);
  const saLength = mx * _ellipticE(sa, eccSq);
  const eaLength = mx * _ellipticE(ea, eccSq);
  let fullEllipseLength;
  if(startAngle < endAngle && sa < ea ||
         startAngle > endAngle && sa > ea) {
    return Math.abs(eaLength - saLength);
  } else if(startAngle < endAngle) {
    // startAngle -- seam -- endAngle
    fullEllipseLength = _ellipseSemiLength(xRadius, yRadius) * 2;
    return fullEllipseLength - saLength + eaLength;
  } else {
  // endAngle -- seam -- startAngle
    fullEllipseLength = _ellipseSemiLength(xRadius, yRadius) * 2;
    return fullEllipseLength - eaLength + saLength;
  }
}
