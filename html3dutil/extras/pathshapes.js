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
 * Adds a line segment to this path.
 * <p>To use this method, you must include the script "extras/pathshapes.js";
 * this is in addition to "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script>
 * &lt;script type="text/javascript" src="extras/pathshapes.js">&lt;/script></pre>
 * @param {Number} x0 X coordinate of the line segment's starting point.
 * The <code>moveTo</code> method will be called on the starting point.
 * @param {Number} y0 Y coordinate of the line segment's starting point.
 * @param {Number} x1 X coordinate of the line segment's ending point.
 * The <code>lineTo</code> method will be called on the ending point.
 * @param {Number} y1 X coordinate of the line segment's ending point.
 * @returns {H3DU.GraphicsPath} This object.
 * @instance
 */
H3DU.GraphicsPath.prototype.line = function(x0, y0, x1, y1) {
  "use strict";
  return this.moveTo(x0, y0).lineTo(x1, y1);
};
/**
 * Adds path segments to this path that form a polygon or a connected line segment strand.
 * <p>To use this method, you must include the script "extras/pathshapes.js";
 * this is in addition to "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script>
 * &lt;script type="text/javascript" src="extras/pathshapes.js">&lt;/script></pre>
 * @param {Array<Number>} pointCoords An array of numbers containing the X and Y coordinates
 * of each point in the sequence of line segments. Each pair of numbers gives the X and Y
 * coordinates, in that order, of one of the points in the sequence.
 * The number of elements in the array must be even. If two or more pairs of numbers are given, line
 * segments will connect each point given (except the last) to the next point given.
 * @param {Number} closed If "true", the sequence of points describes a closed polygon and a command
 * to close the path will be added to the path (even if only one pair of numbers is given in "pointCoords").
 * @returns {H3DU.GraphicsPath} This object. If "pointCoords" is empty, no path segments will be appended.
 * Throws an error if "pointCoords" has an odd length.
 * @instance
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
 * Adds path segments to this path that form an axis-aligned rounded rectangle.
 * <p>To use this method, you must include the script "extras/pathshapes.js";
 * this is in addition to "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script>
 * &lt;script type="text/javascript" src="extras/pathshapes.js">&lt;/script></pre>
 * @param {Number} x X coordinate of the rectangle's upper-left corner (assuming the
 * coordinate system's X axis points right and the Y axis down).
 * @param {Number} y Y coordinate of the rectangle's upper-left corner (assuming the
 * coordinate system's X axis points right and the Y axis down).
 * @param {Number} w Width of the rectangle.
 * @param {Number} h Height of the rectangle.
 * @param {Number} arccx Horizontal extent (from end to end) of the ellipse formed by each arc that makes
 * up the rectangle's corners.
 * Will be adjusted to be not less than 0 and not greater than "w".
 * @param {Number} arccy Vertical extent (from end to end) of the ellipse formed by each arc that makes
 * up the rectangle's corners.
 * Will be adjusted to be not less than 0 and not greater than "h".
 * @returns {H3DU.GraphicsPath} This object. If "w" or "h" is 0, no path segments will be appended.
 * @instance
 */
H3DU.GraphicsPath.prototype.roundRect = function(x, y, w, h, arccx, arccy) {
  "use strict";
  if(w < 0 || h < 0)return this;
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
  this.arcSvgTo(harccx, harccy, 0, false, true, px, py);
  py += h - arccy;
  this.lineTo(px, py);
  px -= harccx;
  py += harccy;
  this.arcSvgTo(harccx, harccy, 0, false, true, px, py);
  px -= w - arccx;
  this.lineTo(px, py);
  px -= harccx;
  py -= harccy;
  this.arcSvgTo(harccx, harccy, 0, false, true, px, py);
  py -= h - arccy;
  this.lineTo(px, py);
  px += harccx;
  py -= harccy;
  this.arcSvgTo(harccx, harccy, 0, false, true, px, py);
  this.closePath();
  return this;
};
/**
 * Adds path segments to this path that form an axis-aligned ellipse given its center
 * and dimensions.
 * <p>To use this method, you must include the script "extras/pathshapes.js";
 * this is in addition to "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script>
 * &lt;script type="text/javascript" src="extras/pathshapes.js">&lt;/script></pre>
 * @param {Number} cx X coordinate of the ellipse's center.
 * @param {Number} cy Y coordinate of the ellipse's center.
 * @param {Number} w Width of the ellipse's bounding box.
 * @param {Number} h Height of the ellipse's bounding box.
 * @returns {H3DU.GraphicsPath} This object. If "w" or "h" is 0, no path segments will be appended.
 * @instance
 */
H3DU.GraphicsPath.prototype.ellipse = function(cx, cy, w, h) {
  "use strict";
  if(w < 0 || h < 0)return this;
  var hw = w * 0.5;
  var hh = h * 0.5;
  var px = cx + hw;
  return this.moveTo(px, cy)
   .arcSvgTo(hw, hh, 0, false, true, px - w, cy)
  .arcSvgTo(hw, hh, 0, false, true, px, cy)
  .closePath();
};
/**
 * Adds path segments to this path that form an axis-aligned ellipse, given the ellipse's corner point
 * and dimensions.
 * <p>To use this method, you must include the script "extras/pathshapes.js";
 * this is in addition to "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script>
 * &lt;script type="text/javascript" src="extras/pathshapes.js">&lt;/script></pre>
 * @param {Number} x X coordinate of the ellipse's bounding box's upper-left corner (assuming the
 * coordinate system's X axis points right and the Y axis down).
 * @param {Number} y Y coordinate of the ellipse's bounding box's upper-left corner (assuming the
 * coordinate system's X axis points right and the Y axis down).
 * @param {Number} w Width of the ellipse's bounding box.
 * @param {Number} h Height of the ellipse's bounding box.
 * @returns {H3DU.GraphicsPath} This object. If "w" or "h" is 0, no path segments will be appended.
 * @instance
 */
H3DU.GraphicsPath.prototype.ellipseForBox = function(x, y, w, h) {
  "use strict";
  return this.ellipse(x + w * 0.5, y + h * 0.5, w, h);
};
/**
 * Adds path segments to this path that form an arc running along an axis-aligned
 * ellipse, or a shape based on that arc and ellipse, given the ellipse's center
 * and dimensions, start angle, and sweep angle.
 * <p>To use this method, you must include the script "extras/pathshapes.js";
 * this is in addition to "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script>
 * &lt;script type="text/javascript" src="extras/pathshapes.js">&lt;/script></pre>
 * @param {Number} cx X coordinate of the ellipse's center.
 * @param {Number} cy Y coordinate of the ellipse's center.
 * @param {Number} w Width of the ellipse's bounding box.
 * @param {Number} h Height of the ellipse's bounding box.
 * @param {Number} start Starting angle of the arc, in degrees.
 * 0 means the positive X axis, 90 means the positive Y axis,
 * 180 means the negative X axis, and 270 means the negative Y axis.
 * @param {Number} sweep Length of the arc in degrees. Can be positive or negative. Can be greater than 360 or
 * less than -360, in which case the arc will wrap around the ellipse multiple times. Assuming
 * the coordinate system's X axis points right and the Y axis down, positive angles run
 * clockwise and negative angles counterclockwise.
 * @param {Number} type Type of arc to append to the path. If 0,
 * will append an unclosed arc. If 1, will append an elliptical segment to the path
 * (the arc and a line segment connecting its ends). If 2,
 * will append a "pie slice" to the path (the arc and two line segments connecting
 * each end of the arc to the ellipse's center).
 * @returns {H3DU.GraphicsPath} This object. If "w" or "h" is 0, no path segments will be appended.
 * @instance
 */
H3DU.GraphicsPath.prototype.arcShape = function(x, y, w, h, start, sweep, type) {
  "use strict";
  if(w < 0 || h < 0)return this;
  var pidiv180 = Math.PI / 180;
  var e = start + sweep;
  var hw = w * 0.5;
  var hh = h * 0.5;
  var eRad = (e >= 0 && e < 360 ? e : e % 360 + (e < 0 ? 360 : 0)) * pidiv180;
  var startRad = (start >= 0 && start < 360 ? start : start % 360 + (start < 0 ? 360 : 0)) * pidiv180;
  var cosEnd = Math.cos(eRad);
  var sinEnd = eRad <= 3.141592653589793 ? Math.sqrt(1.0 - cosEnd * cosEnd) : -Math.sqrt(1.0 - cosEnd * cosEnd);
  var cosStart = Math.cos(startRad);
  var sinStart = startRad <= 3.141592653589793 ? Math.sqrt(1.0 - cosStart * cosStart) : -Math.sqrt(1.0 - cosStart * cosStart);
  this.moveTo(x + cosStart * hw, y + sinStart * hh);
  var angleInit, angleStep, cw;
  if(sweep > 0) {
    angleInit = start + 180;
    angleStep = 180;
    cw = true;
  } else {
    angleInit = start - 180;
    angleStep = -180;
    cw = false;
  }
  for(var a = angleInit; cw ? a < e : a > e; a += angleStep) {
    var angleRad = (a >= 0 && a < 360 ? a : a % 360 + (a < 0 ? 360 : 0)) * pidiv180;
    var cosAng = Math.cos(angleRad);
    var sinAng = angleRad <= 3.141592653589793 ? Math.sqrt(1.0 - cosAng * cosAng) : -Math.sqrt(1.0 - cosAng * cosAng);
    this.arcSvgTo(hw, hh, 0, false, cw, x + cosAng * hw, y + sinAng * hh);
  }
  this.arcSvgTo(hw, hh, 0, false, cw, x + cosEnd * hw, y + sinEnd * hh);
  if(type === 2) {
    this.lineTo(x, y).closePath();
  } else if(type === 1) {
    this.closePath();
  }
  return this;
};
/**
 * Adds path segments to this path that form an arc running along an axis-aligned
 * ellipse, or a shape based on that arc and ellipse, given the ellipse's corner point
 * and dimensions, start angle, and sweep angle.
 * <p>To use this method, you must include the script "extras/pathshapes.js";
 * this is in addition to "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script>
 * &lt;script type="text/javascript" src="extras/pathshapes.js">&lt;/script></pre>
 * @param {Number} x X coordinate of the ellipse's bounding box's upper-left corner (assuming the
 * coordinate system's X axis points right and the Y axis down).
 * @param {Number} y Y coordinate of the ellipse's bounding box's upper-left corner (assuming the
 * coordinate system's X axis points right and the Y axis down).
 * @param {Number} w Width of the ellipse's bounding box.
 * @param {Number} h Height of the ellipse's bounding box.
 * @param {Number} start Starting angle of the arc, in degrees.
 * 0 means the positive X axis, 90 means the positive Y axis,
 * 180 means the negative X axis, and 270 means the negative Y axis.
 * @param {Number} sweep Length of the arc in degrees. Can be greater than 360 or
 * less than -360, in which case the arc will wrap around the ellipse multiple times. Assuming
 * the coordinate system's X axis points right and the Y axis down, positive angles run
 * clockwise and negative angles counterclockwise.
 * @param {Number} type Type of arc to append to the path. If 0,
 * will append an unclosed arc. If 1, will append an elliptical segment to the path
 * (the arc and a line segment connecting its ends). If 2,
 * will append a "pie slice" to the path (the arc and two line segments connecting
 * each end of the arc to the ellipse's center).
 * @returns {H3DU.GraphicsPath} This object. If "w" or "h" is 0, no path segments will be appended.
 * @instance
 */
H3DU.GraphicsPath.prototype.arcShapeForBox = function(x, y, w, h, start, sweep, type) {
  "use strict";
  return this.arcShape(x + w * 0.5, y + h * 0.5, w, h, start, sweep, type);
};
/**
 * Adds path segments to this path in the form of an arrow shape.
 * <p>To use this method, you must include the script "extras/pathshapes.js";
 * this is in addition to "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script>
 * &lt;script type="text/javascript" src="extras/pathshapes.js">&lt;/script></pre>
 * @param {Number} x0 X coordinate of the arrow's tail, at its very end.
 * @param {Number} y0 Y coordinate of the arrow's tail, at its very end.
 * @param {Number} x1 X coordinate of the arrow's tip.
 * @param {Number} y1 Y coordinate of the arrow's tip.
 * @param {Number} headWidth Width of the arrowhead's base from side to side.
 * @param {Number} headLength Length of the arrowhead from its tip to its base.
 * @param {Number} tailWidth Width of the arrow's tail from side to side
 * @returns {H3DU.GraphicsPath} This object. Nothing will be added to the path if the distance
 * from (x0, y0) and (x1, y1) is 0 or extremely close to 0.
 * @instance
 */
H3DU.GraphicsPath.prototype.arrow = function(x0, y0, x1, y1, headWidth, headLength, tailWidth) {
  "use strict";
  var dx = x1 - x0;
  var dy = y1 - y0;
  var arrowLen = Math.sqrt(dx * dx + dy * dy);
  if(arrowLen === 0)return this;
  var halfTailWidth = tailWidth * 0.5;
  var halfHeadWidth = headWidth * 0.5;
  var invArrowLen = 1.0 / arrowLen;
  var cosRot = dx * invArrowLen;
  var sinRot = dy * invArrowLen;
  headLength = Math.min(headLength, arrowLen);
  var shaftLength = arrowLen - headLength;
  var x, y;
  this.moveTo(x0, y0);
  x = halfTailWidth * sinRot + x0;
  y = -halfTailWidth * cosRot + y0;
  this.lineTo(x, y);
  x = shaftLength * cosRot + halfTailWidth * sinRot + x0;
  y = shaftLength * sinRot - halfTailWidth * cosRot + y0;
  this.lineTo(x, y);
  x = shaftLength * cosRot + halfHeadWidth * sinRot + x0;
  y = shaftLength * sinRot - halfHeadWidth * cosRot + y0;
  this.lineTo(x, y).lineTo(x1, y1);
  x = shaftLength * cosRot - halfHeadWidth * sinRot + x0;
  y = shaftLength * sinRot + halfHeadWidth * cosRot + y0;
  this.lineTo(x, y);
  x = shaftLength * cosRot - halfTailWidth * sinRot + x0;
  y = shaftLength * sinRot + halfTailWidth * cosRot + y0;
  this.lineTo(x, y);
  x = -halfTailWidth * sinRot + x0;
  y = halfTailWidth * cosRot + y0;
  this.lineTo(x, y);
  this.closePath();
  return this;
};
/**
 * Adds path segments to this path that form a regular polygon.
 * <p>To use this method, you must include the script "extras/pathshapes.js";
 * this is in addition to "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script>
 * &lt;script type="text/javascript" src="extras/pathshapes.js">&lt;/script></pre>
 * @param {Number} cx X coordinate of the center of the polygon.
 * @param {Number} cy Y coordinate of the center of the polygon.
 * @param {Number} sides Number of sides the polygon has. Nothing will be added to the path if this
 * value is 2 or less.
 * @param {Number} radius Radius from the center to each vertex of the polygon.
 * @param {Number} phaseInDegrees Starting angle of the first vertex of the polygon, in degrees.
 * 0 means the positive X axis, 90 means the positive Y axis,
 * 180 means the negative X axis, and 270 means the negative Y axis.
 * @returns {H3DU.GraphicsPath} This object.
 * @instance
 */
H3DU.GraphicsPath.prototype.regularPolygon = function(cx, cy, sides, radius, phaseInDegrees) {
  "use strict";
  if(sides <= 2)return this;
  var phase = phaseInDegrees || 0;
  phase = phase >= 0 && phase < 360 ? phase : phase % 360 +
       (phase < 0 ? 360 : 0);
  phase *= H3DU.Math.ToRadians;
  var angleStep = H3DU.Math.PiTimes2 / sides;
  var cosStep = Math.cos(angleStep);
  var sinStep = angleStep <= 3.141592653589793 ? Math.sqrt(1.0 - cosStep * cosStep) : -Math.sqrt(1.0 - cosStep * cosStep);
  var c = Math.cos(phase);
  var s = phase <= 3.141592653589793 ? Math.sqrt(1.0 - c * c) : -Math.sqrt(1.0 - c * c);
  for(var i = 0; i < sides; i++) {
    var x = cx + c * radius;
    var y = cy + s * radius;
    if(i === 0) {
      this.moveTo(x, y);
    } else {
      this.lineTo(x, y);
    }
    var ts = cosStep * s + sinStep * c;
    var tc = cosStep * c - sinStep * s;
    s = ts;
    c = tc;
  }
  return this.closePath();
};
/**
 * Adds path segments to this path that form a regular N-pointed star.
 * <p>To use this method, you must include the script "extras/pathshapes.js";
 * this is in addition to "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script>
 * &lt;script type="text/javascript" src="extras/pathshapes.js">&lt;/script></pre>
 * @param {Number} cx X coordinate of the center of the star.
 * @param {Number} cy Y coordinate of the center of the star.
 * @param {Number} points Number of points the star has. Nothing will be added to the path if this
 * value is 0 or less.
 * @param {Number} radiusOut Radius from the center to each outer vertex of the star.
 * @param {Number} radiusIn Radius from the center to each inner vertex of the star.
 * @param {Number} phaseInDegrees Starting angle of the first vertex of the polygon, in degrees.
 * 0 means the positive X axis, 90 means the positive Y axis,
 * 180 means the negative X axis, and 270 means the negative Y axis.
 * @returns {H3DU.GraphicsPath} This object.
 * @instance
 */
H3DU.GraphicsPath.prototype.regularStar = function(cx, cy, points, radiusOut, radiusIn, phaseInDegrees) {
  "use strict";
  if(points <= 0)return this;
  var phase = phaseInDegrees || 0;
  phase = phase >= 0 && phase < 360 ? phase : phase % 360 +
       (phase < 0 ? 360 : 0);
  phase *= H3DU.Math.ToRadians;
  var sides = points * 2;
  var angleStep = H3DU.Math.PiTimes2 / sides;
  var cosStep = Math.cos(angleStep);
  var sinStep = angleStep <= 3.141592653589793 ? Math.sqrt(1.0 - cosStep * cosStep) : -Math.sqrt(1.0 - cosStep * cosStep);
  var c = Math.cos(phase);
  var s = phase <= 3.141592653589793 ? Math.sqrt(1.0 - c * c) : -Math.sqrt(1.0 - c * c);
  for(var i = 0; i < sides; i++) {
    var radius = (i & 1) === 0 ? radiusOut : radiusIn;
    var x = cx + c * radius;
    var y = cy + s * radius;
    if(i === 0) {
      this.moveTo(x, y);
    } else {
      this.lineTo(x, y);
    }
    var ts = cosStep * s + sinStep * c;
    var tc = cosStep * c - sinStep * s;
    s = ts;
    c = tc;
  }
  return this.closePath();
};
