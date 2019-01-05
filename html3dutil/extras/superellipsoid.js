/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {H3DU} from "../h3du_min";

function sinpow(x, n) {
  "use strict";
  var r = Math.sin(x);
  return (r > 0 ? 1 : -1) * Math.pow(Math.abs(r), n);
};
function cospow(x, n) {
  "use strict";
  var r = Math.cos(x);
  return (r > 0 ? 1 : -1) * Math.pow(Math.abs(r), n);
};

export var Superellipsoid = function(xRadius, yRadius, zRadius, n, m) {
  "use strict";
  this.xRadius = xRadius;
  this.yRadius = yRadius;
  this.zRadius = zRadius;
 // exponent for the sines and cosines in U axis
  this.n = typeof n === "undefined" || n === null ? 1 : n;
 // exponent for the sines and cosines in V axis
  this.m = typeof m === "undefined" || m === null ? 1 : m;
  this.endPoints = function() {
    return [-Math.PI / 2, Math.PI / 2, -Math.PI, Math.PI];
  };
  this.evaluate = function(u, v) {
    var cosu = cospow(u, this.n);
    return [
      cospow(v, this.m) * cosu * this.xRadius,
      sinpow(v, this.m) * cosu * this.yRadius,
      sinpow(u, this.n) * this.zRadius
    ];
  };
};

export var Supertoroid = function(xRadius, yRadius, innerRadius, n, m) {
  "use strict";
  this.xRadius = xRadius;
  this.yRadius = yRadius;
  this.innerRadius = innerRadius;
 // exponent for the sines and cosines in U axis
  this.n = typeof n === "undefined" || n === null ? 1 : n;
 // exponent for the sines and cosines in V axis
  this.m = typeof m === "undefined" || m === null ? 1 : m;
  this.endPoints = function() {
    return [0, H3DU.Math.PiTimes2, 0, H3DU.Math.PiTimes2];
  };
  this.evaluate = function(u, v) {
    var cosu = cospow(u, this.n);
    return [
      cospow(v, this.m) * (cosu * this.innerRadius + this.xRadius),
      sinpow(v, this.m) * (cosu * this.innerRadius + this.yRadius),
      sinpow(u, this.n) * this.innerRadius
    ];
  };
};
