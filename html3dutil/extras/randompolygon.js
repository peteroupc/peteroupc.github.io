/** Contains a method to generate a simple polygon at random.<p>
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/randompolygon.js";
 * // -- or --
 * import * as CustomModuleName from "extras/randompolygon.js";</pre>
 * @module extras/randompolygon */

/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under Creative Commons Zero (CC0): http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {GraphicsPath, MathUtil} from "../h3du_module.js";

function normalDist(lastNorm) {
  let ret;
  if(!isNaN(lastNorm)) {
    ret = lastNorm[0];
    lastNorm[0] = Number.NaN;
  } else {
    let x;
    do {
      x = Math.random();
    } while(x === 0);
    const y = Math.random();
    const s = Math.sqrt(-2 * Math.log(x));
    const t = Math.PI * 2 * y;
    const cc = Math.cos(t);
    const ss = t >= 0 && t < 6.283185307179586 ? t <= 3.141592653589793 ? Math.sqrt(1.0 - cc * cc) : -Math.sqrt(1.0 - cc * cc) : Math.sin(t);
    lastNorm[0] = s * ss;
    ret = s * cc;
  }
  return ret;
}

function segsIntersect(a1, a2, b1, b2) {
  const c1 = (a1[0] - b2[0]) * (a2[1] - b2[1]) - (a1[1] - b2[1]) * (a2[0] - b2[0]);
  const c2 = (a1[0] - b1[0]) * (a2[1] - b1[1]) - (a1[1] - b1[1]) * (a2[0] - b1[0]);
  if (!(Math.abs(c1) < 1e-9) && !(Math.abs(c2) < 1e-9) && c1 * c2 < 0) {
    const c3 = (b1[0] - a1[0]) * (b2[1] - a1[1]) - (b1[1] - a1[1]) * (b2[0] - a1[0]);
    const c4 = c3 + c2 - c1;
    return c3 * c4 < 0;
  }
  return false;
}
/**
 * Generates a simple polygon at random.
 * Inspired by [a _Stack Overflow_ question](http://stackoverflow.com/questions/8997099).
 * @param {number} cx X coordinate of the polygon's approximate center.
 * @param {number} cy Y coordinate of the polygon's approximate center.
 * @param {number} avgRadius Average distance of the polygon's vertices from the center.
 * @param {number} sides Number of sides in the polygon.
 * @param {number} [irregular] Degree to which the angular distance from one vertex
 * to the next is uneven. If 0, the vertices will be evenly spaced in terms
 * of angular distance. Usually no more than half pi. If null, undefined, or omitted, the default is 0.
 * @param {number} [spiky] Degree of variation among distances of the polygon's vertices
 * from the center, in terms of a standard deviation from the average. If null, undefined, or omitted, the default is 0.
 * @returns {GraphicsPath} The randomly generated polygon.
 * @function
 */
export const randomPolygon = function(cx, cy, avgRadius, sides, irregular, spiky) {
  const irregularValue = typeof irregular === "undefined" || irregular === null ? 0 : irregular;
  const spikyValue = typeof spiky === "undefined" || spiky === null ? 0 : spiky;
  const step = MathUtil.PiTimes2 / sides;
  const avg2 = avgRadius * 2;
  let failed = false;
  do {
    let theta = Math.random() * MathUtil.PiTimes2;
    const deltas = [];
    const points = [];
    let k = 0;
    const lastNorm = [Number.NaN];
    let i;
    for (i = 0; i < sides; i++) {
      const d = step - irregularValue + Math.random() *
       (step + irregularValue - (step - irregularValue));
      k += d / MathUtil.PiTimes2;
      deltas.push(d);
    }
    if(k === 0)k = 0.01;

    for (i = 0; i < sides; i++) {
      let r = normalDist(lastNorm) * spikyValue + avgRadius;
      if(r < 0)r = avg2 / 100.0;
      if(r > avg2)r = avg2;
      const c = Math.cos(theta);
      const s = theta >= 0 && theta < 6.283185307179586 ? theta <= 3.141592653589793 ? Math.sqrt(1.0 - c * c) : -Math.sqrt(1.0 - c * c) : Math.sin(theta);
      const newpoint = [c * r + cx, s * r + cy];
      if(points.length > 0 &&
newpoint[0] === points[points.length - 1][0] &&
 newpoint[1] === points[points.length - 1][1]) {
        i--; continue;
      }
      points.push();
      theta += deltas[i] / k;
    }
    failed = false;
    if(points.length > 2) {
      // Check for self-intersections
      let selfint = false;
      let j;
      for (j = 0; !selfint && j < points.length; j++) {
        const a1 = points[j];
        const a2 = j === points.length - 1 ? points[0] : points[j + 1];
        for(k = j + 1; !selfint && k < points.length; k++) {
          const b1 = points[k];
          const b2 = k === points.length - 1 ? points[0] : points[k + 1];
          selfint |= segsIntersect(a1, a2, b1, b2);
        }
      }
      failed |= selfint;
    }
  } while(failed);
  const poly = new GraphicsPath();
  let i;
  for (i = 0; i < poly.length; i++) {
    if(i === 0)this.moveTo(poly[i][0], poly[i][1]);
    else this.lineTo(poly[i][0], poly[i][1]);
  }
  return this.closePath();
};
