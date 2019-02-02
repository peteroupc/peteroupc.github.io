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
 * TODO: Not documented yet.
 * @param {*} x TODO: Not documented yet.
 * @param {*} y TODO: Not documented yet.
 * @param {*} radius TODO: Not documented yet.
 * @param {*} points TODO: Not documented yet.
 * @param {*} jump TODO: Not documented yet.
 * @param {*} phaseInDegrees TODO: Not documented yet.
 * @returns {*} TODO: Not documented yet.
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
