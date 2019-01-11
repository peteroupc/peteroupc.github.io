/* global H3DU, Surface */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

function _vecNormInPlaceAndScale(vec, scale) {
  var len = 0;
  for(var i = 0; i < vec.length; i++) {
    len += vec[i] * vec[i];
  }
  len = Math.sqrt(len);
  if(len !== 0) {
    var newscale = 1.0 / len * scale;
    for(i = 0; i < vec.length; i++) {
      vec[i] *= newscale;
    }
  } else {
    for(i = 0; i < vec.length; i++) {
      vec[i] *= scale;
    }
  }
  return vec;
}
function _vecAdd(v1, v2) {
  var ret = [];
  for(var i = 0; i < v1.length; i++) {
    ret[i] = v1[i] + v2[i];
  }
  return ret;
}
function _vecScale(v1, s) {
  var ret = [];
  for(var i = 0; i < v1.length; i++) {
    ret[i] = v1[i] * s;
  }
  return ret;
}

export function curveInvolute(evaluator) {
  var neweval = evaluator;
  return {
    "evaluate":function(u) {
      var arclen = neweval.arcLength(u);
      var velocity = neweval.velocity(u);
      var position = neweval.evaluate(u);
      return _vecAdd(position,
        _vecNormInPlaceAndScale(velocity, -arclen));
    },
    "endPoints":function() {
      return neweval.endPoints();
    }
  };
}
export function curveEvolute(evaluator) {
  var neweval = evaluator;
  return {
    "evaluate":function(u) {
      var position = neweval.evaluate(u);
      var velocity = neweval.velocity(u);
      var accel = neweval.accel(u);
      var denom = velocity[0] * accel[1] - accel[0] * velocity[1];
      var numpart = velocity[0] * velocity[0] + velocity[1] * velocity[1];
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
/* exported curveRadialCurve */
export function curveRadialCurve(evaluator, ox, oy) {
  var neweval = evaluator;
  return {
    "evaluate":function(u) {
      var velocity = neweval.velocity(u);
      var accel = neweval.accel(u);
      var denom = velocity[0] * accel[1] - accel[0] * velocity[1];
      var numpart = velocity[0] * velocity[0] + velocity[1] * velocity[1];
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
export function curveOrthotomic(evaluator, ox, oy) {
  var neweval = evaluator;
  return {
    "evaluate":function(u) {
      var position = neweval.evaluate(u);
      var dx = position[0] - ox;
      var dy = position[1] - oy;
      var velocity = neweval.velocity(u);
      var denom = velocity[0] * velocity[0] + velocity[1] * velocity[1];
      var rate = 2 * (velocity[0] * dy - velocity[1] * dx) / denom;
      return [ox - velocity[1] * rate, oy + velocity[0] * rate, 0];
    },
    "endPoints":function() {
      return neweval.endPoints();
    }
  };
}
/* exported curveCatacaustic */
export function curveCatacaustic(evaluator, ox, oy) {
  return curveEvolute(curveOrthotomic(evaluator, ox, oy));
}
/* exported curvePedalCurve */
export function curvePedalCurve(evaluator, ox, oy) {
  var neweval = evaluator;
  return {
    "evaluate":function(u) {
      var position = neweval.evaluate(u);
      var velocity = neweval.velocity(u);
      var velocityXSq = velocity[0] * velocity[0];
      var velocityYSq = velocity[1] * velocity[1];
      var tanXY = velocity[0] * velocity[1];
      var denom = velocityXSq + velocityYSq;
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

export function curveInverse(evaluator, ox, oy, radius) {
  var neweval = evaluator;
  return {
    "evaluate":function(u) {
      var position = neweval.evaluate(u);
      var dx = position[0] - ox;
      var dy = position[1] - oy;
      var rsq = radius * radius;
      var denom = dx * dx + dy * dy;
      return [ox + dx * rsq / denom, oy + dy * rsq / denom];
    },
    "endPoints":function() {
      return neweval.endPoints();
    }
  };
}

/* exported ruledSurface */
export function ruledSurface(directrix, director) {
  return new Surface({
    "evaluate":function(u, v) {
      var dx = directrix.evaluate(u);
      var dr = _vecScale(director.evaluate(u), v);
      return _vecAdd(dx, dr);
    },
    "endPoints":function() {
      var ep = directrix.endPoints();
      return [ep[0], ep[1], 0, 1];
    }
  });
}

export function spiralCurve(radius, phase) {
  return new H3DU.Curve({
    /** @ignore */
    "evaluate":function(u) {
      var uphase = u + phase;
      var cosu = Math.cos(uphase);
      var sinu = uphase >= 0 && uphase < 6.283185307179586 ? uphase <= 3.141592653589793 ? Math.sqrt(1.0 - cosu * cosu) : -Math.sqrt(1.0 - cosu * cosu) : Math.sin(uphase);
      var r = radius + u;
      return [cosu * r, sinu * r];
    },
    /** @ignore */
    "endPoints":function() {
      return [0, 6 * Math.PI];
    }
  });
}
