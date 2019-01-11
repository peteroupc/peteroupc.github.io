/* global H3DU, poly */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {GraphicsPath, MathUtil} from "../h3du_module.js";

function normalDist(lastNorm) {
  var ret;
  if(!isNaN(lastNorm)) {
    ret = lastNorm[0];
    lastNorm[0] = Number.NaN;
  } else {
    var x, y, s, t;
    do {
      x = Math.random();
    } while(x === 0);
    y = Math.random();
    s = Math.sqrt(-2 * Math.log(x));
    t = Math.PI * 2 * y;
    var cc = Math.cos(t);
    ss = (t>=0 && t<6.283185307179586) ? (t<=3.141592653589793 ? Math.sqrt(1.0-cc*cc) : -Math.sqrt(1.0-cc*cc)) : Math.sin(t);
    lastNorm[0] = s * ss;
    ret = s * cc;
  }
  return ret;
}

function segsIntersect(a1, a2, b1, b2) {
  var c1 = (a1[0] - b2[0]) * (a2[1] - b2[1]) - (a1[1] - b2[1]) * (a2[0] - b2[0]);
  var c2 = (a1[0] - b1[0]) * (a2[1] - b1[1]) - (a1[1] - b1[1]) * (a2[0] - b1[0]);
  if (!(Math.abs(c1) < 1e-9) && !(Math.abs(c2) < 1e-9) && c1 * c2 < 0) {
    var c3 = (b1[0] - a1[0]) * (b2[1] - a1[1]) - (b1[1] - a1[1]) * (b2[0] - a1[0]);
    var c4 = c3 + c2 - c1;
    return c3 * c4 < 0;
  }
  return false;
}
// Inspired by http://stackoverflow.com/questions/8997099
GraphicsPath.prototype.randomPolygon = function(cx, cy, avgRadius, sides, irregular, spiky) {
  var irregularValue = typeof irregular === "undefined" || irregular === null ? 0 : irregular;
  var spikyValue = typeof spiky === "undefined" || spiky === null ? 0 : spiky;
  var step = MathUtil.PiTimes2 / sides;
  var avg2 = avgRadius * 2;
  var failed = false;
  do {
    var theta = Math.random() * MathUtil.PiTimes2;
    var deltas = [];
    var points = [];
    var k = 0;
    var lastNorm = [Number.NaN];
    for(var i = 0; i < sides; i++) {
      var d = step - irregularValue + Math.random() *
       (step + irregularValue - (step - irregularValue));
      k += d / H3DU.MathUtil.PiTimes2;
      deltas.push(d);
    }
    if(k === 0)k = 0.01;
    for(i = 0; i < sides; i++) {
      var r = normalDist(lastNorm) * spikyValue + avgRadius;
      if(r < 0)r = avg2 / 100.0;
      if(r > avg2)r = avg2;
      var c = Math.cos(theta);
      s = (theta>=0 && theta<6.283185307179586) ? (theta<=3.141592653589793 ? Math.sqrt(1.0-c*c) : -Math.sqrt(1.0-c*c)) : Math.sin(theta);
      points.push([c * r + cx, s * r + cy]);
      theta += deltas[i] / k;
    }
    failed = false;
    if(points.length > 2) {
  // Check for self-intersections
      var selfint = false;
      for(var j = 0; !selfint && j < points.length; j++) {
        var a1 = points[j];
        var a2 = j === points.length - 1 ? points[0] : points[j + 1];
        for(k = j + 1; !selfint && k < points.length; k++) {
          var b1 = points[k];
          var b2 = k === points.length - 1 ? points[0] : points[k + 1];
          selfint |= segsIntersect(a1, a2, b1, b2);
        }
      }
      failed |= selfint;
    }
  } while(failed);
  for(i = 0; i < poly.length; i++) {
    if(i === 0)this.moveTo(poly[i][0], poly[i][1]);
    else this.lineTo(poly[i][0], poly[i][1]);
  }
  return this.closePath();
};
