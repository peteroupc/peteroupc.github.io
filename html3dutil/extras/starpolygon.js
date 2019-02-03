/** The <code>extras/starpolygon.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/starpolygon.js";
 * // -- or --
 * import * as CustomModuleName from "extras/starpolygon.js";</pre>
 * @module extras/starpolygon */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {MathUtil} from "../h3du_module.js";
/**
 * Generates a star polygon <code>{points/jump}</code>.
 * @param {number} x X coordinate of the star polygon's center.
 * @param {number} y Y coordinate of the star polygon's center.
 * @param {number} radius Radius of the star polygon; that is, the distance from the center to each of its points.
 * @param {number} points Number of points in the star polygon. Must be an integer 2 or greater.
 * @param {number} jump Number of points in the underlying polygon to skip when connecting points with straight line segments to generate the star polygon. Must be an integer 1 or greater.
 * @param {number} [phaseInDegrees] Angle, in degrees, of the first point in the star polygon. If null, undefined, or omitted, the default is 0.
 * @returns {Array<Array<number>>} Array of points (two-element arrays) making up the star polygon. The first number of each point is the X coordinate, and the second the Y coordinate.
 */
export function starPolygon(x, y, radius, points, jump, phaseInDegrees) {
  const coords = [];
  const connected = [];
  const retval = [];
  if(points < 2)return retval;
  if(jump < 1)throw new Error();
  let i;
  for (i = 0; i < points; i++) {
    connected[i] = false;
  }
  const phase = (typeof phaseInDegrees === "undefined" || phaseInDegrees === null ? 0 : phaseInDegrees) * MathUtil.ToRadians;
  const angleStep = MathUtil.PiTimes2 / points;
  const cosStep = Math.cos(angleStep);
  const sinStep = angleStep <= 3.141592653589793 ? Math.sqrt(1.0 - cosStep * cosStep) : -Math.sqrt(1.0 - cosStep * cosStep);
  let c = Math.cos(phase);
  let s = phase >= 0 && phase < 6.283185307179586 ? phase <= 3.141592653589793 ? Math.sqrt(1.0 - c * c) : -Math.sqrt(1.0 - c * c) : Math.sin(phase);
  for(i = 0; i < points; i++) {
    coords.push([x + c * radius, y + s * radius]);
    const ts = cosStep * s + sinStep * c;
    const tc = cosStep * c - sinStep * s;
    s = ts;
    c = tc;
  }
  for (;;) {
    let firstPoint = -1;
    for(i = 0; i < points; i++) {
      if(!connected[i]) {
        firstPoint = i;
        break;
      }
    }
    if(firstPoint < 0)break;
    let pt = firstPoint;
    let lastPoint = -1;
    while(!connected[pt]) {
      connected[pt] = true;
      if(lastPoint >= 0) {
        retval.push(coords[lastPoint]);
        retval.push(coords[pt]);
      }
      lastPoint = pt;
      pt += jump;
      pt %= points;
    }
    if(lastPoint) {
      retval.push(coords[lastPoint]);
      retval.push(coords[firstPoint]);
    }
  }
  return retval;
}
