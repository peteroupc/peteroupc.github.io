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
 * Surface evaluator object for the Klein surface, also known as the "Klein bottle".
 * @constructor
 */
export var KleinBottle = function() {
  this.endPoints = function() {
    return [0, 6.283185307179586, 0, 6.283185307179586];
  };
  this.evaluate = function(u, v) {
    var x, y, z;
    var cosu = Math.cos(u);
    var sinu = u >= 0 && u < 6.283185307179586 ? u <= 3.141592653589793 ? Math.sqrt(1.0 - cosu * cosu) : -Math.sqrt(1.0 - cosu * cosu) : Math.sin(u);
    var cosv = Math.cos(v);
    var sinv = v >= 0 && v < 6.283185307179586 ? v <= 3.141592653589793 ? Math.sqrt(1.0 - cosv * cosv) : -Math.sqrt(1.0 - cosv * cosv) : Math.sin(v);
    if(u < Math.PI) {
      x = 3 * cosu * (1 + sinu) + 2 * (1 - cosu / 2) * cosu * cosv;
      z = -8 * sinu - 2 * (1 - cosu / 2) * sinu * cosv;
    } else {
      x = 3 * cosu * (1 + sinu) + 2 * (1 - cosu / 2) * (cosv * -1.0);
      z = -8 * sinu;
    }
    y = -2 * (1 - cosu / 2) * sinv;
    return [x / 6, z / 6, y / 6];
  };
};
/**
 * TODO: Not documented yet.
 * @param {*} maj
 * @param {*} a
 * @param {*} b
 * @returns {*} Return value.
 * @function
 */
export var MoebiusLikeStrip = function(maj, a, b) {
  this.maj = typeof maj === "undefined" || maj === null ? 1.25 : maj;
  this.a = typeof a === "undefined" || a === null ? 0.125 : a;
  this.b = typeof b === "undefined" || b === null ? 0.5 : b;
  this.endPoints = function() {
    return [0, Math.PI, 0, 6.283185307179586];
  };
  this.evaluate = function(u, v) {
    var x, y, z;
    var cosu = Math.cos(u);
    var sinu = u >= 0 && u < 6.283185307179586 ? u <= 3.141592653589793 ? Math.sqrt(1.0 - cosu * cosu) : -Math.sqrt(1.0 - cosu * cosu) : Math.sin(u);
    var cosv = Math.cos(v);
    var sinv = v >= 0 && v < 6.283185307179586 ? v <= 3.141592653589793 ? Math.sqrt(1.0 - cosv * cosv) : -Math.sqrt(1.0 - cosv * cosv) : Math.sin(v);
    x = this.a * cosv * cosu - this.b * sinv * sinu;
    z = this.a * cosv * sinu + this.b * sinv * cosu;
    // Find the sine and cosine of u + u
    var cosu2 = cosu * cosu - sinu * sinu;
    var sinu2 = sinu * cosu * 2;
    y = (this.maj + x) * sinu2;
    x = (this.maj + x) * cosu2;
    return [x, z, y];
  };
};
/**
 * Surface evaluator object for a M&ouml;bius strip.
 * @param {number} radius
 * @param {number} width Width of the strip.
 * @constructor
 */
export var MoebiusStrip = function(radius, width) {
  this.radius = typeof radius === "undefined" || radius === null ? 1 : radius;
  this.width = typeof width === "undefined" || width === null ? 0.5 : width;
  this.endPoints = function() {
    return [-this.width, this.width, 0, H3DU.MathUtil.PiTimes2];
  };
  this.evaluate = function(u, v) {
    var x, y, z;
    var halfv = v / 2;
    var cosv2 = Math.cos(halfv);
    var sinv2 = halfv >= 0 && halfv < 6.283185307179586 ? halfv <= 3.141592653589793 ? Math.sqrt(1.0 - cosv2 * cosv2) : -Math.sqrt(1.0 - cosv2 * cosv2) : Math.sin(halfv);
    var cosv = cosv2 * cosv2 - sinv2 * sinv2;
    var sinv = 2 * sinv2 * cosv2;
    var tmp = u * cosv2 + this.radius;
    x = cosv * tmp;
    y = sinv * tmp;
    z = sinv2 * u;
    return [x, y, z];
  };
};
