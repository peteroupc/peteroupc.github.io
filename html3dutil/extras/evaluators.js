/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
/* global H3DU */

/**
 * A [surface evaluator object]{@link H3DU.SurfaceEval#vertex} for a surface of revolution, which results by revolving
 * an X/Y curve around an axis.
 * <p>This class is considered a supplementary class to the
 * Public Domain HTML 3D Library and is not considered part of that
 * library. <p>
 * To use this class, you must include the script "extras/evaluators.js"; the
 * class is not included in the "h3du_min.js" file which makes up
 * the HTML 3D Library. Example:<pre>
 * &lt;script type="text/javascript" src="extras/evaluators.js">&lt;/script></pre>
 * @class
 * @memberof H3DU
 * @param {Object} curve A [curve evaluator object]{@link H3DU.CurveEval#vertex} that describes a 2-dimensional curve to rotate about the axis of rotation, as
 * specified in the "axis" parameter. The curve's X coordinates
 * correspond to elevation, and its Y coordinates correspond to radius.<p>
 * If the curve function draws a curve that goes both above and below the axis of rotation, such
 * as a circle or ellipse, the V coordinates given in _minval_ and _maxval_ must
 * restrict the curve definition to no more than half of the curve.
 * @param {Number} minval Smallest V coordinate.
 * @param {Number} maxval Largest V coordinate. If _minval_ is greater than
 * _maxval_, both values will be swapped.
 * @param {Array<Number>} [axis] Axis of rotation, around which the curve
 * will be rotated to generate the surface of revolution. If null or omitted, the positive
 * Z axis (0, 0, 1) will be the axis of rotation. This parameter is a 3-element array describing
 * the X, Y, and Z coordinates, respectively, of a 3D point. The axis of rotation will
 * run in the direction from the origin to the point given in this parameter. This
 * parameter need not be a [unit vector]{@tutorial glmath}.
 */
H3DU.SurfaceOfRevolution = function(curve, minval, maxval, axis) {
  "use strict";
  this.curve = curve;
  this.minval = Math.min(minval, maxval);
  this.maxval = Math.max(minval, maxval);
  this._axis = axis;
  this._axisQuat = null;
  if(this._axis) {
    this._axisQuat = H3DU.Math.quatFromVectors([0, 0, 1], this._axis);
  }
};
/**
 * TODO: Not documented yet.
 * @returns {*} Return value.
 * @instance
 */
H3DU.SurfaceOfRevolution.prototype.endpoints = function() {
  "use strict";
  return [0, H3DU.Math.PiTimes2, this.minval, this.maxval];
};
/**
 * TODO: Not documented yet.
 * @param {*} u
 * @param {*} v
 * @returns {*} Return value.
 * @instance
 */
H3DU.SurfaceOfRevolution.prototype.evaluate = function(u, v) {
  "use strict";
  var curvepos = this.curve.evaluate(v);
  var cosu = Math.cos(u);
  var sinu = u >= 0 && u < 6.283185307179586 ? u <= 3.141592653589793 ? Math.sqrt(1.0 - cosu * cosu) : -Math.sqrt(1.0 - cosu * cosu) : Math.sin(u);
  var cp1 = curvepos[1];
  var cp0 = curvepos[0];
  var x = cp1 * cosu;
  var y = cp1 * sinu;
  var z = cp0;
  var ret = [x, y, z];
  if(this._axisQuat) {
    H3DU.SurfaceOfRevolution._quatTransformInPlace(this._axisQuat, ret);
  }
  return ret;
};
/** @ignore */
H3DU.SurfaceOfRevolution._quatTransformInPlace = function(q, v) {
  "use strict";
  var t1 = q[1] * v[2] - q[2] * v[1] + v[0] * q[3];
  var t2 = q[2] * v[0] - q[0] * v[2] + v[1] * q[3];
  var t3 = q[0] * v[1] - q[1] * v[0] + v[2] * q[3];
  var t4 = q[0] * v[0] + q[1] * v[1] + q[2] * v[2];
  v[0] = t1 * q[3] - (t2 * q[2] - t3 * q[1]) + q[0] * t4;
  v[1] = t2 * q[3] - (t3 * q[0] - t1 * q[2]) + q[1] * t4;
  v[2] = t3 * q[3] - (t1 * q[1] - t2 * q[0]) + q[2] * t4;
};
/**
 * Creates a [surface evaluator object]{@link H3DU.SurfaceEval#vertex} for a surface of revolution
 * whose curve is the graph of a single-variable function.
 * The resulting surface will have a circular cross section
 * along its length.
 * Examples of surfaces generated by this technique are
 * cones, frustums, cylinders, spheres, and spheroids (the
 * bases of these surfaces won't be generated).
 * @param {Function} func Function whose graph will be
 * rotated about the axis of rotation, as
 * specified in the "axis" parameter. The function takes a number
 * as a single parameter and returns a number. The return
 * value is effectively the radius of each part of the surface
 * from beginning to end.
 * @param {Number} minval Smallest parameter of the function.
 * This is a number of units from the origin along the axis of rotation.
 * @param {Number} maxval Largest parameter of the function.
 * This is a number of units from the origin along the axis of rotation.
 * If _minval_ is greater than _maxval_, both values will be swapped.
 * @param {Array<Number>} [axis] Axis of rotation, around which the
 * function graph will be rotated to generate the surface of revolution.
 * If null or omitted, the positive Z axis (0, 0, 1) will be the axis of rotation.
 * This parameter is a 3-element array describing
 * the X, Y, and Z coordinates, respectively, of a 3D point. The axis of rotation will
 * run in the direction from the origin to the point given in this parameter. This
 * parameter need not be a [unit vector]{@tutorial glmath}.
 * @returns {H3DU.SurfaceOfRevolution} Return value.
 * @example <caption>The following creates an evaluator for a cone
 * which starts at the origin and runs 10 units along the Z axis.</caption>
 * var surf=H3DU.SurfaceOfRevolution.fromFunction(
 * function(x) {
 * "use strict"; return x/2; }, // use a constantly increasing function
 * 0, 10);
 * @example <caption>This is an evaluator for the same cone, but
 * shifted 3 units back.</caption>
 * var surf=H3DU.SurfaceOfRevolution.fromFunction(
 * function(x) {
 * "use strict"; x+=3; return x/2; },
 * -3,7);
 * @example <caption>The following creates an evaluator for a cylinder
 * which runs from 5 to 10 units, and with a radius of 2 units.</caption>
 * var surf=H3DU.SurfaceOfRevolution.fromFunction(
 * function(x) {
 * "use strict"; return 2; }, // use a constant radius
 * 5, 10);
 */
H3DU.SurfaceOfRevolution.fromFunction = function(func, minval, maxval, axis) {
  "use strict";
  return new H3DU.SurfaceOfRevolution({
    "evaluate":function(u) {
      return [u, func(u), 0];
    }
  }, minval, maxval, axis);
};
/**
 * A [surface evaluator object]{@link H3DU.SurfaceEval#vertex} for a torus, a special case of a surface of revolution.
 * @param {Number} outerRadius Radius from the center to the innermost
 * part of the torus.
 * @param {Number} innerRadius Radius from the inner edge to the innermost
 * part of the torus.
 * @param {Object} [curve] A [curve evaluator object]{@link H3DU.CurveEval#vertex} that
 * describes a 2-dimensional curve to serve as
 * the cross section of the torus. The curve need not be closed; in fact, certain special surfaces can result
 * by leaving the ends open.
 * If null or omitted, uses a circular cross section.
 * @param {Array<Number>} [axis] Axis of rotation, which the torus
 * will pass through.
 * If null or omitted, the positive Z axis (0, 0, 1) will be the axis of rotation.
 * This parameter is a 3-element array describing
 * the X, Y, and Z coordinates, respectively, of a 3D point. The axis of rotation will
 * run in the direction from the origin to the point given in this parameter. This
 * parameter need not be a [unit vector]{@tutorial glmath}.
 * @returns {H3DU.SurfaceOfRevolution} Return value.
 */
H3DU.SurfaceOfRevolution.torus = function(outerRadius, innerRadius, curve, axis) {
  "use strict";
  if(!curve)curve = {
    "evaluate":function(u) {
      var cosu = Math.cos(u);
      var sinu = u >= 0 && u < 6.283185307179586 ? u <= 3.141592653589793 ? Math.sqrt(1.0 - cosu * cosu) : -Math.sqrt(1.0 - cosu * cosu) : Math.sin(u);
      return [cosu, sinu];
    },
    "tangent":function(u) {
      var cosu = Math.cos(u);
      var sinu = u >= 0 && u < 6.283185307179586 ? u <= 3.141592653589793 ? Math.sqrt(1.0 - cosu * cosu) : -Math.sqrt(1.0 - cosu * cosu) : Math.sin(u);
      return [-sinu, cosu];
    }
  };
  return new H3DU.SurfaceOfRevolution({
    "evaluate":function(u) {
      var curvept = curve.evaluate(u);
      var x = innerRadius * curvept[1];
      var y = outerRadius + innerRadius * curvept[0];
      return [x, y, 0];
    },
    "endpoints":function() {
      return [0, H3DU.Math.PiTimes2];
    }
  }, 0, H3DU.Math.PiTimes2, axis);
};

/* exported SurfaceOfRevolution */
/**
 * Alias for the {@link H3DU.SurfaceOfRevolution} class.
 * @class
 * @alias SurfaceOfRevolution
 * @deprecated Use {@link H3DU.SurfaceOfRevolution} instead.
 */
var SurfaceOfRevolution = H3DU.SurfaceOfRevolution;

/**
 * A [curve evaluator object]{@link H3DU.CurveEval#vertex} for a curve drawn by a circle that rolls along the inside
 * of another circle, whose position is fixed with a center of (0,0).
 * <p>This class is considered a supplementary class to the
 * Public Domain HTML 3D Library and is not considered part of that
 * library. <p>
 * To use this class, you must include the script "extras/evaluators.js"; the
 * class is not included in the "h3du_min.js" file which makes up
 * the HTML 3D Library. Example:<pre>
 * &lt;script type="text/javascript" src="extras/evaluators.js">&lt;/script></pre>
 * @class
 * @param {Number} outerRadius Radius of the circle whose position
 * is fixed.
 * @param {Number} innerRadius Radius of the rolling circle.
 * A hypocycloid results when outerRadius=innerRadius.
 * @param {Number} distFromInnerCenter Distance from the center of the
 * rolling circle to the drawing pen.. A prolate hypotrochoid results when
 * distFromInnerCenter is greater than innerRadius.
 */
H3DU.Hypotrochoid = function(outerRadius, innerRadius, distFromInnerCenter) {
  "use strict";
  this.outer = outerRadius;
  this.inner = innerRadius;
  this.distFromInner = distFromInnerCenter;
 /**
  * Generates a point on the curve from the given U coordinate.
  * @function
  * @param {Number} u U coordinate.
  * @returns {Array<Number>} A 3-element array specifying a 3D point.
  * Only the X and Y coordinates will be other than 0.
  */
  this.evaluate = function(u) {
    var oi = this.outer - this.inner;
    var term = oi * u / this.inner;
    var cosu = Math.cos(u),
      sinu = u >= 0 && u < 6.283185307179586 ? u <= 3.141592653589793 ? Math.sqrt(1.0 - cosu * cosu) : -Math.sqrt(1.0 - cosu * cosu) : Math.sin(u);
    var cost = Math.cos(term),
      sint = term >= 0 && term < 6.283185307179586 ? term <= 3.141592653589793 ? Math.sqrt(1.0 - cost * cost) : -Math.sqrt(1.0 - cost * cost) : Math.sin(term);
    return [
      oi * cosu + this.distFromInner * cost,
      oi * sinu - this.distFromInner * sint,
      0
    ];
  };
  this.endpoints = function() {
    return [0, H3DU.Math.PiTimes2];
  };
 /**
  * Creates a modified version of this curve so that it
  * fits the given radius.
  * @function
  * @param {Number} radius Desired radius of the curve.
  * @returns {H3DU.Hypotrochoid} Return value.
  */
  this.scaleTo = function(radius) {
    var oi = this.outer - this.inner;
    var mx = Math.abs(Math.max(
   -oi - this.distFromInner,
   -oi + this.distFromInner,
   oi - this.distFromInner,
   oi + this.distFromInner));
    var ratio = radius / mx;
    return new H3DU.Hypotrochoid(
   this.outer * ratio,
   this.inner * ratio,
   this.distFromInner * ratio);
  };
};

/**
 * A [curve evaluator object]{@link H3DU.CurveEval#vertex} for a curve drawn by a circle that rolls along the X axis.
 * <p>This class is considered a supplementary class to the
 * Public Domain HTML 3D Library and is not considered part of that
 * library. <p>
 * To use this class, you must include the script "extras/evaluators.js"; the
 * class is not included in the "h3du_min.js" file which makes up
 * the HTML 3D Library. Example:<pre>
 * &lt;script type="text/javascript" src="extras/evaluators.js">&lt;/script></pre>
 * @class
 * @param {Number} radius Radius of the rolling circle.
 * @param {Number} distFromCenter Distance from the center of the
 * rolling circle to the drawing pen.
 */
H3DU.Trochoid = function(radius, distFromCenter) {
  "use strict";
  this.inner = radius;
  this.distFromCenter = distFromCenter;
 /**
  * Generates a point on the curve from the given U coordinate.
  * @function
  * @param {Number} u U coordinate.
  * @returns {Array<Number>} A 3-element array specifying a 3D point.
  * Only the X and Y coordinates will be other than 0.
  */
  this.evaluate = function(u) {
    var cosu = Math.cos(u);
    var sinu = u >= 0 && u < 6.283185307179586 ? u <= 3.141592653589793 ? Math.sqrt(1.0 - cosu * cosu) : -Math.sqrt(1.0 - cosu * cosu) : Math.sin(u);
    return [
      this.inner * u - this.distFromCenter * sinu,
      this.inner - this.distFromCenter * cosu,
      0
    ];
  };
  this.endpoints = function() {
    return [0, H3DU.Math.PiTimes2];
  };
  this.tangent = function(u) {
    var cosu = Math.cos(u);
    var sinu = u >= 0 && u < 6.283185307179586 ? u <= 3.141592653589793 ? Math.sqrt(1.0 - cosu * cosu) : -Math.sqrt(1.0 - cosu * cosu) : Math.sin(u);
    return [this.inner - this.distFromCenter * cosu,
      this.distFromCenter * sinu, 0];
  };
};

/**
 * A [curve evaluator object]{@link H3DU.CurveEval#vertex} for a curve drawn by a circle that rolls along the outside
 * of another circle, whose position is fixed, with a center of (0,0).
 * <p>This class is considered a supplementary class to the
 * Public Domain HTML 3D Library and is not considered part of that
 * library. <p>
 * To use this class, you must include the script "extras/evaluators.js"; the
 * class is not included in the "h3du_min.js" file which makes up
 * the HTML 3D Library. Example:<pre>
 * &lt;script type="text/javascript" src="extras/evaluators.js">&lt;/script></pre>
 * @class
 * @param {Number} outerRadius Radius of the circle whose position
 * is fixed.
 * @param {Number} innerRadius Radius of the rolling circle.
 * An epicycloid results when outerRadius=innerRadius.
 * @param {Number} distFromInnerCenter Distance from the center of the
 * rolling circle to the drawing pen. A prolate epitrochoid results when
 * distFromInnerCenter is greater than innerRadius.
 */
H3DU.Epitrochoid = function(outerRadius, innerRadius, distFromInnerCenter) {
  "use strict";
  this.outer = outerRadius;
  this.inner = innerRadius;
  this.distFromInner = distFromInnerCenter;
 /**
  * Generates a point on the curve from the given U coordinate.
  * @function
  * @param {Number} u U coordinate.
  * @returns {Array<Number>} A 3-element array specifying a 3D point.
  * Only the X and Y coordinates will be other than 0.
  */
  this.evaluate = function(u) {
    var oi = this.outer + this.inner;
    var term = oi * u / this.inner;
    var cosu = Math.cos(u),
      sinu = u >= 0 && u < 6.283185307179586 ? u <= 3.141592653589793 ? Math.sqrt(1.0 - cosu * cosu) : -Math.sqrt(1.0 - cosu * cosu) : Math.sin(u);
    var cost = Math.cos(term),
      sint = term >= 0 && term < 6.283185307179586 ? term <= 3.141592653589793 ? Math.sqrt(1.0 - cost * cost) : -Math.sqrt(1.0 - cost * cost) : Math.sin(term);
    return [
      oi * cosu - this.distFromInner * cost,
      oi * sinu - this.distFromInner * sint,
      0
    ];
  };
  this.endpoints = function() {
    return [0, H3DU.Math.PiTimes2];
  };
 /**
  * Creates a modified version of this curve so that it
  * fits the given radius.
  * @function
  * @param {Number} radius Desired radius of the curve.
  * @returns {H3DU.Epitrochoid} Return value.
  */
  this.scaleTo = function(radius) {
    var oi = this.outer + this.inner;
    var mx = Math.abs(Math.max(
   -oi - this.distFromInner,
   -oi + this.distFromInner,
   oi - this.distFromInner,
   oi + this.distFromInner));
    var ratio = radius / mx;
    return new H3DU.Epitrochoid(
   this.outer * ratio,
   this.inner * ratio,
   this.distFromInner * ratio);
  };
};

/* exported Hypotrochoid */
/**
 * Alias for the {@link H3DU.Hypotrochoid} class.
 * @class
 * @alias Hypotrochoid
 * @deprecated Use {@link H3DU.Hypotrochoid} instead.
 */
var Hypotrochoid = H3DU.Hypotrochoid;

/* exported Trochoid */
/**
 * Alias for the {@link H3DU.Trochoid} class.
 * @class
 * @alias Trochoid
 * @deprecated Use {@link H3DU.Trochoid} instead.
 */
var Trochoid = H3DU.Trochoid;

/* exported Epitrochoid */
/**
 * Alias for the {@link H3DU.Epitrochoid} class.
 * @class
 * @alias Epitrochoid
 * @deprecated Use {@link H3DU.Epitrochoid} instead.
 */
var Epitrochoid = H3DU.Epitrochoid;
