/** The <code>extras/derivedcurves.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/derivedcurves.js";
 * // -- or --
 * import * as CustomModuleName from "extras/derivedcurves.js";</pre>
 * @module extras/derivedcurves */

/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {Curve, Surface} from "../h3du_module.js";

function _vecNormInPlaceAndScale(vec, scale) {
  let len = 0;
  let i;
  for (i = 0; i < vec.length; i++) {
    len += vec[i] * vec[i];
  }
  len = Math.sqrt(len);
  if(len !== 0) {
    const newscale = 1.0 / len * scale;
    let i;
    for (i = 0; i < vec.length; i++) {
      vec[i] *= newscale;
    }
  } else {
    let i;
    for (i = 0; i < vec.length; i++) {
      vec[i] *= scale;
    }
  }
  return vec;
}
function _vecAdd(v1, v2) {
  const ret = [];
  let i;
  for (i = 0; i < v1.length; i++) {
    ret[i] = v1[i] + v2[i];
  }
  return ret;
}
function _vecScale(v1, s) {
  const ret = [];
  let i;
  for (i = 0; i < v1.length; i++) {
    ret[i] = v1[i] * s;
  }
  return ret;
}
/**
 * TODO: Not documented yet.
 * @param {*} evaluator
 * @returns {*} Return value.
 */
export function curveInvolute(evaluator) {
  const neweval = evaluator;
  return {
    "evaluate":function(u) {
      const arclen = neweval.arcLength(u);
      const velocity = neweval.velocity(u);
      const position = neweval.evaluate(u);
      return _vecAdd(position,
        _vecNormInPlaceAndScale(velocity, -arclen));
    },
    "endPoints":function() {
      return neweval.endPoints();
    }
  };
}
/**
 * TODO: Not documented yet.
 * @param {*} evaluator
 * @returns {*} Return value.
 */
export function curveEvolute(evaluator) {
  const neweval = evaluator;
  return {
    "evaluate":function(u) {
      const position = neweval.evaluate(u);
      const velocity = neweval.velocity(u);
      const accel = neweval.accel(u);
      const denom = velocity[0] * accel[1] - accel[0] * velocity[1];
      const numpart = velocity[0] * velocity[0] + velocity[1] * velocity[1];
      return [
        position[0] - numpart * velocity[1] / denom,
        position[1] + numpart * velocity[0] / denom,
        0
      ];
    },
    "endPoints":function() {
      return neweval.endPoints();
    }
  };
}
/**
 * TODO: Not documented yet.
 * @param {*} evaluator
 * @param {*} ox
 * @param {*} oy
 * @returns {*} Return value.
 */
export function curveRadialCurve(evaluator, ox, oy) {
  const neweval = evaluator;
  return {
    "evaluate":function(u) {
      const velocity = neweval.velocity(u);
      const accel = neweval.accel(u);
      const denom = velocity[0] * accel[1] - accel[0] * velocity[1];
      const numpart = velocity[0] * velocity[0] + velocity[1] * velocity[1];
      return [
        ox - numpart * velocity[1] / denom,
        oy + numpart * velocity[0] / denom,
        0
      ];
    },
    "endPoints":function() {
      return neweval.endPoints();
    }
  };
}
/**
 * TODO: Not documented yet.
 * @param {*} evaluator
 * @param {*} ox
 * @param {*} oy
 * @returns {*} Return value.
 */
export function curveOrthotomic(evaluator, ox, oy) {
  const neweval = evaluator;
  return {
    "evaluate":function(u) {
      const position = neweval.evaluate(u);
      const dx = position[0] - ox;
      const dy = position[1] - oy;
      const velocity = neweval.velocity(u);
      const denom = velocity[0] * velocity[0] + velocity[1] * velocity[1];
      const rate = 2 * (velocity[0] * dy - velocity[1] * dx) / denom;
      return [ox - velocity[1] * rate, oy + velocity[0] * rate, 0];
    },
    "endPoints":function() {
      return neweval.endPoints();
    }
  };
}
/**
 * TODO: Not documented yet.
 * @param {*} evaluator
 * @param {*} ox
 * @param {*} oy
 * @returns {*} Return value.
 */
export function curveCatacaustic(evaluator, ox, oy) {
  return curveEvolute(curveOrthotomic(evaluator, ox, oy));
}
/**
 * TODO: Not documented yet.
 * @param {*} evaluator
 * @param {*} ox
 * @param {*} oy
 * @returns {*} Return value.
 */
export function curvePedalCurve(evaluator, ox, oy) {
  const neweval = evaluator;
  return {
    "evaluate":function(u) {
      const position = neweval.evaluate(u);
      const velocity = neweval.velocity(u);
      const velocityXSq = velocity[0] * velocity[0];
      const velocityYSq = velocity[1] * velocity[1];
      const tanXY = velocity[0] * velocity[1];
      const denom = velocityXSq + velocityYSq;
      return [
        (ox * velocityXSq + velocityYSq * position[0] + (oy - position[1]) * tanXY) / denom,
        (oy * velocityYSq + velocityXSq * position[1] + (ox - position[0]) * tanXY) / denom,
        0];
    },
    "endPoints":function() {
      return neweval.endPoints();
    }
  };
}
/**
 * TODO: Not documented yet.
 * @param {*} evaluator
 * @param {*} ox
 * @param {*} oy
 * @param {*} radius
 * @returns {*} Return value.
 */
export function curveInverse(evaluator, ox, oy, radius) {
  const neweval = evaluator;
  return {
    "evaluate":function(u) {
      const position = neweval.evaluate(u);
      const dx = position[0] - ox;
      const dy = position[1] - oy;
      const rsq = radius * radius;
      const denom = dx * dx + dy * dy;
      return [ox + dx * rsq / denom, oy + dy * rsq / denom];
    },
    "endPoints":function() {
      return neweval.endPoints();
    }
  };
}
/**
 * TODO: Not documented yet.
 * @param {*} directrix
 * @param {*} director
 * @returns {*} Return value.
 */
export function ruledSurface(directrix, director) {
  return new Surface({
    "evaluate":function(u, v) {
      const dx = directrix.evaluate(u);
      const dr = _vecScale(director.evaluate(u), v);
      return _vecAdd(dx, dr);
    },
    "endPoints":function() {
      const ep = directrix.endPoints();
      return [ep[0], ep[1], 0, 1];
    }
  });
}
/**
 * TODO: Not documented yet.
 * @param {*} func
 * @param {*} phase
 * @returns {*} Return value.
 */
export function polarCurve(func, phase) {
  const pfunc = func;
  const pphase = phase;
  return new Curve({
    "evaluate":function(u) {
      let uphase = u + pphase;
      if(uphase > 6.283185307179586) {
        uphase %= 6.283185307179586;
      }
      const cosu = Math.cos(uphase);
      const sinu = uphase >= 0 && uphase < 6.283185307179586 ? uphase <= 3.141592653589793 ? Math.sqrt(1.0 - cosu * cosu) : -Math.sqrt(1.0 - cosu * cosu) : Math.sin(uphase);
      const r = pfunc(uphase);
      return [cosu * r, sinu * r];
    },
    "endPoints":function() {
      return [0, 6.283185307179586];
    }
  });
}
/**
 * TODO: Not documented yet.
 * @param {*} radius
 * @param {*} phase
 * @returns {*} Return value.
 */
export function spiralCurve(radius, phase) {
  const pphase = phase;
  return new Curve({
    "evaluate":function(u) {
      const uphase = u + pphase;
      const cosu = Math.cos(uphase);
      const sinu = uphase >= 0 && uphase < 6.283185307179586 ? uphase <= 3.141592653589793 ? Math.sqrt(1.0 - cosu * cosu) : -Math.sqrt(1.0 - cosu * cosu) : Math.sin(uphase);
      const r = radius + u;
      return [cosu * r, sinu * r];
    },
    "endPoints":function() {
      return [0, 6 * Math.PI];
    }
  });
}
