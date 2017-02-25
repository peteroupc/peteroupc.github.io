/* global H3DU, curve, spline */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

/**
 * Creates an array of B&eacute;zier curves from the control points of a Hermite spline.
 * @param {Array<Array<Number>>} curve An array of control points,
 * each with the same number of values, that describe a Hermite spline.
 * Each pair of control points takes up two elements of the array and consists
 * of the coordinates of that point followed by the tangent vector (derivative) at that point.
 * The array must have an even number of control points and at least four control points.
 * @param {Number} [u1] Starting point for the purpose of interpolation; it will correspond to 0.
 * May be omitted; default is 0.
 * @param {Number} [u2] Ending point for the purpose of interpolation; it will correspond to 1.
 * May be omitted; default is 1.
 * @returns {H3DU.BezierCurve} A array of cubic B&eacute;zier curves describing the
 * same path as the Hermite spline.
 * @memberof! H3DU.BezierCurve
 */
H3DU.BezierCurve.fromHermiteSpline = function(spline, u1, u2) {
  "use strict";
  var elements = curve[0].length;
  if(spline.length < 4 || spline.length % 2 !== 0)throw new Error();
  var third = 1 / 3;
  var ret = [];
  for(var j = 0; j < spline.length - 2; j += 2) {
    var retcurve = [[], [], [], []];
    var pt0 = curve[j];
    var tg0 = curve[j + 1];
    var pt1 = curve[j + 2];
    var tg1 = curve[j + 3];
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
    ret.push(new H3DU.BezierCurve(retcurve, u1, u2));
  }
  return ret;
};

/**
 * Creates an array of B&eacute;zier curves from the control points of a cardinal spline.
 * @param {Array<Array<Number>>} curve An array of control points,
 * each with the same number of values, that describe a cardinal spline.
 * Each point, except the first and the last, will be tangent to the line that connects the
 * points adjacent to it. The spline starts at the second control point and ends
 * at the next-to-last control point. The array must have at least four control points.
 * @param {Number} [tension] A tension parameter ranging from 0 to 1. Closer to 1
 * means closer to a straight line. If null or omitted, this value is 0.5 (indicating what
 * is commonly called a <i>Catmull-Rom spline</i>).
 * @param {Number} [u1] Starting point for the purpose of interpolation; it will correspond to 0.
 * May be omitted; default is 0.
 * @param {Number} [u2] Ending point for the purpose of interpolation; it will correspond to 1.
 * May be omitted; default is 1.
 * @returns {H3DU.BezierCurve} A array of cubic B&eacute;zier curves describing the
 * same path as the cardinal spline.
 * @memberof! H3DU.BezierCurve
 */
H3DU.BezierCurve.fromCardinalSpline = function(curve, tension, u1, u2) {
  "use strict";
  if(typeof tension === "undefined" || tension === null)tension = 0.5;
  var tensionDiv3 = tension / 3.0;
  var elements = curve[0].length;
  if(spline.length < 4)throw new Error();
  var ret = [];
  for(var j = 0; j < spline.length - 1; j += 1) {
    var retcurve = [[], [], [], []];
    var pt0 = curve[j];
    var pt1 = curve[j + 1];
    var pt2 = curve[j + 2];
    var pt3 = curve[j + 3];
    for(var i = 0; i < elements; i++) {
      var p1 = pt1[i];
      var p4 = pt2[i];
      var p2 = p1 - pt0[i] * tensionDiv3 + pt2[i] * tensionDiv3;
      var p3 = p4 - pt3[i] * tensionDiv3 + pt1[i] * tensionDiv3;
      retcurve[0][i] = p1;
      retcurve[1][i] = p2;
      retcurve[2][i] = p3;
      retcurve[3][i] = p4;
    }
    ret.push(new H3DU.BezierCurve(retcurve, u1, u2));
  }
  return ret;
};
