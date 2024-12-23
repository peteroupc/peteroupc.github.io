/* global H3DU */
/*
 Any copyright to this file is released to the Public Domain.
In case this is not possible, this work is also
licensed under the Unlicense: https://unlicense.org/

*/

/**
 * An interpolation timing function based on the path of a
 * cubic B&eacute;zier
 * curve with end points (0, 0) and (1, 1) and with two
 * configurable control points. The x-coordinates of the
 * curve indicate time, and the y-coordinates of the curve
 * indicate how far the interpolation has reached.
 * <p>To use this method, you must include the script "extras/interp.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/interp.js">&lt;/script></pre>
 * @param {number} a The Xcoordinate of the first configurable control
 * point of the curve. Should be within the range 0 through 1.
 * @param {number} b The Ycoordinate of the first configurable control
 * point of the curve. Should be within the range 0 through 1,
 * but may exceed this range.
 * @param {number} c The Xcoordinate of the second configurable control
 * point of the curve. Should be within the range 0 through 1.
 * @param {number} d The Ycoordinate of the second configurable control
 * point of the curve. Should be within the range 0 through 1,
 * but may exceed this range.
 * @param {number} t Number ranging from 0 through 1 that
 * indicates time.
 * @returns {number} Number ranging from 0 through 1 that indicates
 * how far the interpolation has reached. Returns 0 if <code>t</code>
 * is 0 or less, and 1 if <code>t</code> is 1 or greater.
 */
H3DU.Math.interpCubicBezier = function(a, b, c, d, t) {
  "use strict";
  if(t <= 0)return 0;
  if(t >= 1)return 1;
  // Find Bezier curve's T for given x-coordinate ("t" parameter passed to
  // this method) using Newton's method
  var tx = t;
  for(var i = 0; i < 10; i++) {
    var fx = tx * (3 * a * (tx * (tx - 2) + 1) - 3 * c * tx * (tx - 1) + tx * tx) - t;
    if(Math.abs(fx) < 1e-9)break;
    var dfx = 3 * (((3 * tx - 4) * tx + 1) * a + (-3 * tx + 2) * tx * c + tx * tx);
    tx -= fx / dfx;
  }
  // Get y-coordinate
  return tx * (3 * b * (tx * (tx - 2) + 1) - 3 * d * tx * (tx - 1) + tx * tx);
};
