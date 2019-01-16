/** The <code>extras/fourierknot.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/fourierknot.js";
 * // -- or --
 * import * as CustomModuleName from "extras/fourierknot.js";</pre>
 * @module extras/fourierknot */

/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

/**
 * A curve evaluator object that calculates a knot in the form of the Fourier series<p>
 * <b>F</b>(u) = &Sigma;<sub>i=1, n</sub> <b>a</b> cos(<i>iu</i>) + <b>b</b> sin(<i>iu</i>).<p>
 * @param {Array<Array<number>>} a The cosine coefficients.
 * @param {Array<Array<number>>} b The sine coefficients.
 * @function
 */
export var FourierKnot = function(a, b) {
  this.a = a; // Cosine coefficients
  this.b = b; // Sine coefficients
  this.idx = 0;
  if(this.a.length !== this.b.length) {
    throw new Error("a and b must be the same length");
  }
  this.endPoints = function() {
    return [0, 6.283185307179586];
  };
  this.evaluate = function(u) {
    var ret = [0, 0, 0];
    var cosStep = Math.cos(u);
    var sinStep = u >= 0 && u < 6.283185307179586 ? u <= 3.141592653589793 ? Math.sqrt(1.0 - cosStep * cosStep) : -Math.sqrt(1.0 - cosStep * cosStep) : Math.sin(u);
    var c = sinStep;
    var s = cosStep;
    for(var i = 0; i < this.a.length; i++) {
      var ai = this.a[i];
      var bi = this.b[i];
      ret[0] += c * ai[0] + s * bi[0];
      ret[1] += c * ai[1] + s * bi[1];
      ret[2] += c * ai[2] + s * bi[2];
      var ts = cosStep * c + sinStep * s;
      var tc = cosStep * s - sinStep * c;
      c = ts;
      s = tc;
    }
    return ret;
  };
};
