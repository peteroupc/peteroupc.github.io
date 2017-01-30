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
 * TODO: Not documented yet.
 * @param {Number} x0
 * @param {Number} y0
 * @param {Number} x1
 * @param {Number} y1
 * @returns {H3DU.GraphicsPath} This object.
 * @memberof! GraphicsPath#
 */
H3DU.GraphicsPath.prototype.line = function(x0, y0, x1, y1) {
  "use strict";
  return this.moveTo(x0, y0).lineTo(x1, y1);
};
/**
 * TODO: Not documented yet.
 * @param {Number} polygon
 * @param {Number} pointCoords
 * @param {Number} closed
 * @returns {H3DU.GraphicsPath} This object.
 * @memberof! GraphicsPath#
 */
H3DU.GraphicsPath.prototype.polygon = function(polygon, pointCoords, closed) {
  "use strict";
  if(pointCoords.length === 0)return this;
  if(pointCoords.length % 2 !== 0)throw new Error();
  this.moveTo(pointCoords[0], pointCoords[1]);
  for(var i = 2; i < pointCoords.length; i += 2) {
    this.lineTo(pointCoords[i], pointCoords[i + 1]);
  }
  if(closed)this.closePath();
  return this;
};
/**
 * TODO: Not documented yet.
 * @param {Number} x
 * @param {Number} y
 * @param {Number} w
 * @param {Number} h
 * @returns {Number} Return value.
* @memberof! H3DU.GraphicsPath#
 */
H3DU.GraphicsPath.prototype.rect = function(x, y, w, h) {
  "use strict";
  return this.moveTo(x, y)
  .lineTo(x + w, y)
  .lineTo(x + w, y + h)
  .lineTo(x, y + h)
  .closePath();
};

/**
 * TODO: Not documented yet.
 * @param {Number} x
 * @param {Number} y
 * @param {Number} w
 * @param {Number} h
 * @param {Number} arccx
 * @param {Number} arccy
 * @returns {H3DU.GraphicsPath} This object.
 * @memberof! GraphicsPath#
 */
H3DU.GraphicsPath.prototype.roundRect = function(x, y, w, h, arccx, arccy) {
  "use strict";
  var px, py;
  arccx = Math.min(w, Math.max(0, arccx));
  arccy = Math.min(h, Math.max(0, arccy));
  var harccx = arccx * 0.5;
  var harccy = arccy * 0.5;
  px = x + harccx;
  py = y;
  this.moveTo(px, py);
  px += w - arccx;
  this.lineTo(px, py);
  px += harccx;
  py += harccy;
  this.arcSvgTo(harccx, harccy, 0, false, false, px, py);
  py += h - arccy;
  this.lineTo(px, py);
  px -= harccx;
  py += harccy;
  this.arcSvgTo(harccx, harccy, 0, false, false, px, py);
  px -= w - arccx;
  this.lineTo(px, py);
  px -= harccx;
  py -= harccy;
  this.arcSvgTo(harccx, harccy, 0, false, false, px, py);
  py -= h - arccy;
  this.lineTo(px, py);
  px += harccx;
  py -= harccy;
  this.arcSvgTo(harccx, harccy, 0, false, false, px, py);
  this.closePath();
  return this;
};
/**
 * TODO: Not documented yet.
 * @param {Number} x
 * @param {Number} y
 * @param {Number} w
 * @param {Number} h
 * @returns {H3DU.GraphicsPath} This object.
 * @memberof! GraphicsPath#
 */
H3DU.GraphicsPath.prototype.ellipse = function(x, y, w, h) {
  "use strict";
  var hw = w * 0.5;
  var hh = h * 0.5;
  var px = x + hw;
  return this.moveTo(px, y)
   .arcSvgTo(hw, hh, 0, false, false, px - w, y)
  .arcSvgTo(hw, hh, 0, false, false, px, y)
  .closePath();
};
/**
 * TODO: Not documented yet.
 * @param {Number} x
 * @param {Number} y
 * @param {Number} w
 * @param {Number} h
 * @param {Number} start
 * @param {Number} sweep
 * @param {Number} type
 * @returns {H3DU.GraphicsPath} This object.
 * @memberof! GraphicPath#
 */
H3DU.GraphicPath.prototype.arcShape = function(x, y, w, h, start, sweep, type) {
  "use strict";
  var e = start + sweep;
  var hw = w * 0.5;
  var hh = h * 0.5;
  var pidiv180 = Math.PI / 180;
  var eRad = (e >= 0 && e < 360 ? e : e % 360 + (e < 0 ? 360 : 0)) * pidiv180;
  var startRad = (start >= 0 && start < 360 ? start : start % 360 + (start < 0 ? 360 : 0)) * pidiv180;
  var cosEnd = Math.cos(eRad);
  var sinEnd = (eRad>=0 && eRad<6.283185307179586) ? (eRad<=3.141592653589793 ? Math.sqrt(1.0-cosEnd*cosEnd) : -Math.sqrt(1.0-cosEnd*cosEnd)) : Math.sin(eRad);
  var cosStart = Math.cos(startRad);
  var sinStart = (startRad>=0 && startRad<6.283185307179586) ? (startRad<=3.141592653589793 ? Math.sqrt(1.0-cosStart*cosStart) : -Math.sqrt(1.0-cosStart*cosStart)) : Math.sin(startRad);
  this.moveTo(x + cosStart * hw, y + sinStart * hh);
  var angleInit, angleStep, cw;
  if(sweep > 0) {
    angleInit = start + 180;
    angleStep = 180;
    cw = false;
  } else {
    angleInit = start - 180;
    angleStep = -180;
    cw = true;
  }
  for(var a = angleInit; cw ? a > e : a < e; a += angleStep) {
    var angleRad = (a >= 0 && a < 360 ? a : a % 360 + (a < 0 ? 360 : 0)) * pidiv180;
    var cosAng = Math.cos(angleRad);
    var sinAng = (angleRad>=0 && angleRad<6.283185307179586) ? (angleRad<=3.141592653589793 ? Math.sqrt(1.0-cosAng*cosAng) : -Math.sqrt(1.0-cosAng*cosAng)) : Math.sin(angleRad);
    this.arcSvgTo(hw, hh, 0, false, cw, x + cosAng * hw, y + sinAng * hh);
  }
  this.arcSvgTo(hw, hh, 0, false, cw, x + cosEnd * hw, y + sinEnd * hh);
  if(type === 1) {
    this.lineTo(x, y).closePath();
  } else if(type === 2) {
    this.closePath();
  }
  return this;
};
