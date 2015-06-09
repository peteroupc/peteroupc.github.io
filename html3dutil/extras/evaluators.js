/*
Written by Peter O. in 2015.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://upokecenter.dreamhosters.com/articles/donate-now-2/
*/
/**
* Parametric evaluator for a surface of revolution, which results by revolving
* an X/Y curve around an axis.
* <p>This class is considered a supplementary class to the
* Public Domain HTML 3D Library and is not considered part of that
* library. <p>
* To use this class, you must include the script "extras/evaluators.js"; the
 * class is not included in the "glutil_min.js" file which makes up
 * the HTML 3D Library.  Example:<pre>
 * &lt;script type="text/javascript" src="extras/evaluators.js">&lt;/script></pre>
* @class
* @alias SurfaceOfRevolution
* @param {Function} curve Curve to rotate about the Z-axis.
* The curve function must contain a function
* named "evaluate", which takes the following parameter:<ul>
* <li><code>u</code> - A curve coordinate, generally from 0 to 1.
* </ul>
* The evaluator function returns an array of at least 2 elements: the first
* element is the X coordinate of the curve's position, and the second
* element is the Y coordinate.<p>
* If the curve function draws a curve that goes around the Z-axis, such
* as a circle or ellipse, the V-coordinates given in _minval_ and _maxval_ must
* restrict the curve definition to half of the curve.
* @param {number} minval Smallest V-coordinate.
* @param {number} maxval Largest V-coordinate.   If _minval_ is greater than
* _maxval_, both values will be swapped.
*/
var SurfaceOfRevolution=function(curve,minval,maxval){
 this.curve=curve
 this.minval=Math.min(minval,maxval);
 this.maxval=Math.min(minval,maxval);
 this.evaluate=function(u,v){
  v=minval+(maxval-minval)*v;
  var curvepos=this.curve.evaluate(v);
  u=(Math.PI*2)*u;
  var cosu = Math.cos(u);
  var sinu = (u>=0 && u<6.283185307179586) ? (u<=3.141592653589793 ? Math.sqrt(1.0-cosu*cosu) : -Math.sqrt(1.0-cosu*cosu)) : Math.sin(u);
  var cp1=curvepos[1];
  var cp0=curvepos[0];
  var x=cp1*cosu
  var y=cp1*sinu
  var z=cp0;
  return [x,y,z];
 }
}
/**
* Creates a parametric evaluator for a surface of revolution
* whose curve is the graph of a single-variable function.
* @param {Function} func Function whose graph will be
* rotated about the Z-axis.  The function takes a number
* as a single parameter and returns a number.
* @param {number} minval Smallest parameter of the function.
* @param {number} maxval Largest parameter of the function.  If _minval_ is greater than
* _maxval_, both values will be swapped.
* @return {SurfaceOfRevolution}
*/
SurfaceOfRevolution.fromFunction=function(func,minval,maxval){
  return new SurfaceOfRevolution({
    "evaluate":function(u){
      return [u,func(u),0];
    }},minval,maxval);
}
/**
* Parametric evaluator for a torus, a special case of a surface of revolution.
* @param {number} outerRadius Radius from the center to the innermost
* part of the torus.
* @param {number} innerRadius Radius from the inner edge to the innermost
* part of the torus.
* @param {Function|undefined} curve Object describing
* a curve to serve as the cross section of the torus.
* The curve need not be closed; in fact, certain special surfaces can result
* by leaving the ends open.
* The curve function must contain a function
* named "evaluate", which takes the following parameter:<ul>
* <li><code>u</code> - A curve coordinate, generally from 0 to 1.
* </ul>
* The evaluator function returns an array of at least 2 elements: the first
* element is the X coordinate of the curve's position, and the second
* element is the Y coordinate.  If null or omitted, uses a circular cross section.
* @return {SurfaceOfRevolution}
*/
SurfaceOfRevolution.torus=function(outerRadius,innerRadius,curve){
  if(!curve)curve={
    "evaluate":function(u){
      u*=GLMath.PiTimes2;
      return [Math.sin(u),Math.cos(v)]
    }
  }
  return new SurfaceOfRevolution({
    "evaluate":function(u){
      var curvept=curve.evaluate(u)
      var x=innerRadius*curvept[1];
      var y=outerRadius+innerRadius*curvept[0];
      return [x,y,0];
    }},0,Math.PI);
}

/**
* Parametric evaluator for a
* curve drawn by a circle that rolls along the inside
* of another circle, whose position is fixed.
* <p>This class is considered a supplementary class to the
* Public Domain HTML 3D Library and is not considered part of that
* library. <p>
* To use this class, you must include the script "extras/evaluators.js"; the
 * class is not included in the "glutil_min.js" file which makes up
 * the HTML 3D Library.  Example:<pre>
 * &lt;script type="text/javascript" src="extras/evaluators.js">&lt;/script></pre>
* @class
* @param {number} outerRadius Radius of the circle whose position
* is fixed.
* @param {number} innerRadius Radius of the rolling circle.
* A hypocycloid results when outerRadius=innerRadius.
* @param {number} distFromInnerCenter Distance from the center of the
* rolling circle to the drawing pen.
*/
function Hypotrochoid(outerRadius, innerRadius, distFromInnerCenter){
 this.outer=outerRadius;
 this.inner=innerRadius;
 this.distFromInner=distFromInnerCenter;
 /**
* Generates a point on the curve from the given u coordinate.
* @function
* @param {number} v V coordinate.  This will sweep around the extruded
* tube.
* @return {Array<number>} A 3-element array specifying a 3D point.
* Only the X and Y coordinates will be other than 0.
*/
 this.evaluate=function(u){
  u=u*GLMath.PiTimes2;
  var oi=(this.outer-this.inner)
  var term=oi*u/this.inner;
  // NOTE: prolate hypotrochoid if distFromInner>innerRadius
  var cosu = Math.cos(u),
    sinu = (u>=0 && u<6.283185307179586) ? (u<=3.141592653589793 ? Math.sqrt(1.0-cosu*cosu) : -Math.sqrt(1.0-cosu*cosu)) : Math.sin(u);
  var cost = Math.cos(term),
    sint = (term>=0 && term<6.283185307179586) ? (term<=3.141592653589793 ? Math.sqrt(1.0-cost*cost) : -Math.sqrt(1.0-cost*cost)) : Math.sin(term);
  return [
   oi*cosu+this.distFromInner*cost,
   oi*sinu-this.distFromInner*sint,
   0
  ]
 }
 /**
 * Creates a modified version of this curve so that it
 * fits the given radius.
 * @function
 * @param {number} Desired radius of the curve.
 * @return {Hypotrochoid}
 */
 this.scaleTo=function(radius){
  var oi=(this.outer-this.inner)
  var mx=Math.abs(Math.max(
   -oi-this.distFromInner,
   -oi+this.distFromInner,
   oi-this.distFromInner,
   oi+this.distFromInner));
  var ratio=radius/mx;
  return new Hypotrochoid(
   this.outer*ratio,
   this.inner*ratio,
   this.distFromInner*ratio);
 }
}

/**
* Parametric evaluator for a
* curve drawn by a circle that rolls along the X-axis.
* <p>This class is considered a supplementary class to the
* Public Domain HTML 3D Library and is not considered part of that
* library. <p>
* To use this class, you must include the script "extras/evaluators.js"; the
 * class is not included in the "glutil_min.js" file which makes up
 * the HTML 3D Library.  Example:<pre>
 * &lt;script type="text/javascript" src="extras/evaluators.js">&lt;/script></pre>
* @class
* @param {number} radius Radius of the rolling circle.
* @param {number} distFromCenter Distance from the center of the
* rolling circle to the drawing pen.
*/
function Trochoid(radius, distFromCenter){
 this.inner=radius;
 this.distFromCenter=distFromCenter;
 /**
* Generates a point on the curve from the given u coordinate.
* @function
* @param {number} v V coordinate.  This will sweep around the extruded
* tube.
* @return {Array<number>} A 3-element array specifying a 3D point.
* Only the X and Y coordinates will be other than 0.
*/
 this.evaluate=function(u){
  u=u*GLMath.PiTimes2;
  var cosu = Math.cos(u);
  var sinu = (u>=0 && u<6.283185307179586) ? (u<=3.141592653589793 ? Math.sqrt(1.0-cosu*cosu) : -Math.sqrt(1.0-cosu*cosu)) : Math.sin(u);
  return [
   this.inner*u-this.distFromCenter*sinu,
   this.inner    -this.distFromCenter*cosu,
   0
  ]
 }
}

/**
* Parametric evaluator for a
* curve drawn by a circle that rolls along the outside
* of another circle, whose position is fixed.
* <p>This class is considered a supplementary class to the
* Public Domain HTML 3D Library and is not considered part of that
* library. <p>
* To use this class, you must include the script "extras/evaluators.js"; the
 * class is not included in the "glutil_min.js" file which makes up
 * the HTML 3D Library.  Example:<pre>
 * &lt;script type="text/javascript" src="extras/evaluators.js">&lt;/script></pre>
* @class
* @param {number} outerRadius Radius of the circle whose position
* is fixed.
* @param {number} innerRadius Radius of the rolling circle.
* An epicycloid results when outerRadius=innerRadius.
* @param {number} distFromInnerCenter Distance from the center of the
* rolling circle to the drawing pen.
*/
function Epitrochoid(outerRadius, innerRadius, distFromInnerCenter){
 this.outer=outerRadius;
 this.inner=innerRadius;
 this.distFromInner=distFromInnerCenter;
 /**
* Generates a point on the curve from the given u coordinate.
* @function
* @param {number} v V coordinate.  This will sweep around the extruded
* tube.
* @return {Array<number>} A 3-element array specifying a 3D point.
* Only the X and Y coordinates will be other than 0.
*/
 this.evaluate=function(u){
  u=u*GLMath.PiTimes2;
  var oi=(this.outer+this.inner)
  var term=oi*u/this.inner;
  var cosu = Math.cos(u),sinu = (u>=0 && u<6.283185307179586) ? (u<=3.141592653589793 ? Math.sqrt(1.0-cosu*cosu) : -Math.sqrt(1.0-cosu*cosu)) : Math.sin(u);
  var cost = Math.cos(term),sint = (term>=0 && term<6.283185307179586) ? (term<=3.141592653589793 ? Math.sqrt(1.0-cost*cost) : -Math.sqrt(1.0-cost*cost)) : Math.sin(term);
  // NOTE: prolate epitrochoid if distFromInner>innerRadius
  return [
   oi*cosu-this.distFromInner*cost,
   oi*sinu-this.distFromInner*sint,
   0
  ]
 }
 /**
 * Creates a modified version of this curve so that it
 * fits the given radius.
 * @function
 * @param {number} Desired radius of the curve.
 * @return {Epitrochoid}
 */
 this.scaleTo=function(radius){
  var oi=(this.outer+this.inner)
  var mx=Math.abs(Math.max(
   -oi-this.distFromInner,
   -oi+this.distFromInner,
   oi-this.distFromInner,
   oi+this.distFromInner));
  var ratio=radius/mx;
  return new Epitrochoid(
   this.outer*ratio,
   this.inner*ratio,
   this.distFromInner*ratio);
 }
}
