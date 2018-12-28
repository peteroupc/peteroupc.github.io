/* global H3DU */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

/**
 * Creates a piecewise curve made up of B-spline curves from the control points of a
 * cubic TCB spline (tension/continuity/bias spline, also known as Kochanek&ndash;Bartels spline).
 * (If tension, continuity, and bias are all 0, the result is a cubic Catmull&ndash;Rom spline
 * in uniform parameterization.)
 * <p>To use this method, you must include the script "extras/spline.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/spline.js">&lt;/script></pre>
 * @param {Array<Array<number>>} spline An array of control points,
 * each with the same number of values, that the curve will pass through.
 * Throws an error if there are fewer than two control points.
 * @param {number} [tension] A parameter that adjusts the length of the starting and ending
 * tangents of each curve segment. Ranges from -1 for double-length tangents to 1
 * for zero-length tangents. A value of 1 results in straight line segments. Default is 0.
 * @param {number} [continuity] A parameter that adjusts the direction of the starting and ending
 * tangents of each curve segment. Ranges from -1 to 1, where values closer to -1 or closer to 1
 * result in tangents that are closer to perpendicular.
 * A value of -1 results in straight line segments. Default is 0.
 * @param {number} [bias] A parameter that adjusts the influence of the starting and ending
 * tangents of each curve segment. The greater this number, the greater the
 * ending tangents influence the direction of the next curve segment in comparison to the starting tangents. Ranges from -1 to 1. Default is 0.
 * @param {number} [closed] If true, connects the last control point of the curve with the first.
 * Default is false.
 * @param {number} [rigidEnds] If true, the start and end of the piecewise curve
 * will, by default, more rigidly follow the direction to the next or previous control point, respectively.
 * This makes the curve compatible with GDI+ cardinal splines with 0
 * continuity, 0 bias, and tension equal to <code>-((T*2)-1)</code>, where
 * T is the GDI+ cardinal spline tension parameter. Default is false.
 * @returns {H3DU.PiecewiseCurve} A piecewise curve made up of cubic B-spline curves describing the
 * same path as the TCB spline.
 */
H3DU.PiecewiseCurve.fromTCBSpline = function(spline, tension, continuity, bias, closed, rigidEnds) {
  "use strict";
  var elements = spline[0].length;
  if(spline.length < 2)throw new Error();
  var tensionValue = typeof tension === "undefined" || tension === null ? 0 : tension;
  var continValue = typeof continuity === "undefined" || continuity === null ? 0 : continuity;
  var biasValue = typeof bias === "undefined" || bias === null ? 0 : bias;
  var closedValue = typeof closed === "undefined" || closed === null ? false : closed;
  var rigidEndsValue = typeof rigidEnds === "undefined" || rigidEnds === null ? false : rigidEnds;
  var third = 1 / 3;
  var ret = [];
  var lastVecIndex = spline.length - 1;
  var numSplines = closedValue ? lastVecIndex + 1 : lastVecIndex;
  for(var j = 0; j < numSplines; j++) {
    var retcurve = [[], [], [], []];
    var pt0 = j > lastVecIndex ? spline[0] : spline[j];
    var pt1, ptPrev, ptNext;
    if(closedValue) {
      if(j === 0) {
        ptPrev = spline[lastVecIndex];
        pt1 = spline[j + 1];
        ptNext = spline.length === 2 ? spline[0] : spline[j + 2];
      } else if(j === lastVecIndex - 1) {
        ptPrev = spline[j - 1];
        pt1 = spline[j + 1];
        ptNext = spline[0];
      } else if(j === lastVecIndex) {
        ptPrev = spline[j - 1];
        pt1 = spline[0];
        ptNext = spline[1];
      } else {
        ptPrev = spline[j - 1];
        pt1 = spline[j + 1];
        ptNext = spline[j + 2];
      }
    } else {
      pt1 = spline[j + 1];
      ptPrev = j === 0 ? null : spline[j - 1];
      ptNext = j >= lastVecIndex ? null : spline[j + 2];
    }
    var mc = 1 - continValue;
    var pc = 1 + continValue;
    var mb = 1 - biasValue;
    var pb = 1 + biasValue;
    var mt = 1 - tensionValue;
    for(var i = 0; i < elements; i++) {
      var p1 = pt0[i];
      var p4 = pt1[i];
      var diffCurr = pt1[i] - pt0[i];
      var diffPrev = typeof ptPrev === "undefined" || ptPrev === null ? 0 : pt0[i] - ptPrev[i];
      var diffNext = typeof ptNext === "undefined" || ptNext === null ? 0 : ptNext[i] - pt1[i];
      var tgStart = 0.5 * mt * pc * pb * diffPrev + 0.5 * mt * mc * mb * diffCurr;
      var tgEnd = 0.5 * mt * mc * pb * diffCurr + 0.5 * mt * pc * mb * diffNext;
      if(!rigidEndsValue) {
        if(typeof ptPrev === "undefined" || ptPrev === null)tgStart = 0;
        if(typeof ptNext === "undefined" || ptNext === null)tgEnd = 0;
      }
      var p2 = p1 + tgStart * third;
      var p3 = p4 - tgEnd * third;
      retcurve[0][i] = p1;
      retcurve[1][i] = p2;
      retcurve[2][i] = p3;
      retcurve[3][i] = p4;
    }
    ret.push(H3DU.BSplineCurve.clamped(retcurve, 3));
  }
  return new H3DU.PiecewiseCurve(ret);
};

/**
 * Creates a piecewise curve made up of B-spline curves from the control points of a
 * Hermite spline. A Hermite spline is a collection of points that the curve will go through,
 * together with the velocity vectors (derivatives or instantaneous rates of change) at
 * those points.<p>
 * Hermite splines are useful for representing an approximate polynomial form
 * of a function or curve whose derivative is known; however, Hermite splines are not
 * guaranteed to preserve the increasing or decreasing nature of the function or curve.
 * <p>To use this method, you must include the script "extras/spline.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/spline.js">&lt;/script></pre>
 * @param {Array<Array<number>>} curve An array of control points,
 * each with the same number of values, that describe a Hermite spline.
 * Each pair of control points takes up two elements of the array and consists
 * of the coordinates of that point followed by the velocity vector (derivative) at that point.
 * The array must have an even number of control points and at least four control points.
 * @returns {H3DU.PiecewiseCurve} A piecewise curve made up of cubic B-spline curves describing the
 * same path as the Hermite spline.
 */
H3DU.PiecewiseCurve.fromHermiteSpline = function(spline) {
  "use strict";
  var elements = spline[0].length;
  if(spline.length < 4 || spline.length % 2 !== 0)throw new Error();
  var third = 1 / 3;
  var ret = [];
  for(var j = 0; j < spline.length - 2; j += 2) {
    var retcurve = [[], [], [], []];
    var pt0 = spline[j];
    var tg0 = spline[j + 1];
    var pt1 = spline[j + 2];
    var tg1 = spline[j + 3];
    for(var i = 0; i < elements; i++) {
      var p1 = pt0[i];
      var p4 = pt1[i];
      var p2 = p1 + tg0[i] * third;
      var p3 = p4 - tg1[i] * third;
      retcurve[0][i] = p1;
      retcurve[1][i] = p2;
      retcurve[2][i] = p3;
      retcurve[3][i] = p4;
    }
    ret.push(H3DU.BSplineCurve.clamped(retcurve, 3));
  }
  return new H3DU.PiecewiseCurve(ret);
};

/**
 * Creates a piecewise curve made up of B-spline curves from the control points of a
 * cubic Catmull&ndash;Rom spline. A Catmull&ndash;Rom spline is defined by
 * a collection of control points that the spline
 * will go through, and the shape of each curve segment is also determined by the positions
 * of neighboring points on the spline.
 * <p>To use this method, you must include the script "extras/spline.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/spline.js">&lt;/script></pre>
 * @param {Array<Array<number>>} spline An array of control points,
 * each with the same number of values, that the curve will pass through.
 * Throws an error if there are fewer than two control points.
 * @param {number} [param] A value that describes the curve's parameterization.
 * Ranges from 0 to 1. A value of 0 indicates a uniform parameterization, 0.5 indicates a
 * centripetal parameterization, and 1 indicates a chordal parameterization.
 * Default is 0.5.
 * @param {number} [closed] If true, connects the last control point of the curve with the first.
 * Default is false.
 * @returns {H3DU.PiecewiseCurve} A piecewise curve made up of cubic B-spline curves describing the same path as the Catmull&ndash;Rom spline.
 */
H3DU.PiecewiseCurve.fromCatmullRomSpline = function(spline, param, closed) {
  "use strict";
  var elements = spline[0].length;
  if(spline.length < 2)throw new Error();
  var paramValue = typeof param === "undefined" || param === null ? 0.5 : param;
  var closedValue = typeof closed === "undefined" || closed === null ? false : closed;
  var ret = [];
  var lastVecIndex = spline.length - 1;
  var numSplines = closedValue ? lastVecIndex + 1 : lastVecIndex;
  for(var j = 0; j < numSplines; j++) {
    var retcurve = [[], [], [], []];
    var pt0 = j === 0 ? spline[0] : spline[j - 1];
    var pt1 = spline[j];
    var pt2 = spline[j + 1];
    var pt3 = j + 2 > lastVecIndex ? spline[lastVecIndex] : spline[j + 2];
    if(!closedValue && j + 2 > lastVecIndex) {
      var newpt = [];
      for(var i = 0; i < elements; i++) {
        newpt[i] = pt0[i] + (pt1[i] - pt2[i]);
      }
      pt3 = newpt;
    }
    if(!closedValue && j === 0) {
      newpt = [];
      for(i = 0; i < elements; i++) {
        newpt[i] = pt3[i] + (pt2[i] - pt1[i]);
      }
      pt0 = newpt;
    }
    if(closedValue) {
      if(j === 0) {
        pt0 = spline[lastVecIndex];
        pt3 = spline.length === 2 ? spline[0] : spline[j + 2];
      } else if(j === lastVecIndex - 1) {
        pt3 = spline[0];
      } else if(j === lastVecIndex) {
        pt2 = spline[0];
        pt3 = spline[1];
      }
    }
    var p1len = 0;
    var p2len = 0;
    var p3len = 0;
    for(i = 0; i < elements; i++) {
      var dx = pt0[i] - pt1[i];
      p1len += dx * dx;
      dx = pt1[i] - pt2[i];
      p2len += dx * dx;
      dx = pt2[i] - pt3[i];
      p3len += dx * dx;
    }
    p1len = Math.sqrt(p1len);
    p2len = Math.sqrt(p2len);
    p3len = Math.sqrt(p3len);
    for(i = 0; i < elements; i++) {
      var p1 = pt0[i];
      var p2 = pt1[i];
      var p3 = pt2[i];
      var p4 = pt3[i];
      var t1 = 1;
      var t2 = 1;
      var t3 = 1;
      if(paramValue !== 0) {
        t1 = Math.pow(p1len, paramValue);
        t2 = Math.pow(p2len, paramValue);
        t3 = Math.pow(p3len, paramValue);
      }
      var den = 3 * t1 * (t1 + t2);
      var np2 = p2;
      var np3 = p3;
      den = 3 * t1 * (t1 + t2);
      if(den !== 0) {
        np2 = (t1 * t1 * p3 - t2 * t2 * p1 + p2 * (2 * t1 * t1 + 3 * t1 * t2 + t2 * t2)) / den;
      }
      den = 3 * t3 * (t3 + t2);
      if(den !== 0) {
        np3 = (t3 * t3 * p2 - t2 * t2 * p4 + p3 * (2 * t3 * t3 + 3 * t3 * t2 + t2 * t2)) / den;
      }
      retcurve[0][i] = p2;
      retcurve[1][i] = np2;
      retcurve[2][i] = np3;
      retcurve[3][i] = p3;
    }
    ret.push(H3DU.BSplineCurve.clamped(retcurve, 3));
  }
  return new H3DU.PiecewiseCurve(ret);
};
