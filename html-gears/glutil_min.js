/*
  Any copyright is dedicated to the Public Domain.
  http://creativecommons.org/publicdomain/zero/1.0/
*/
// Note by Peter O., 2015-03-09: This file was taken
// from https://github.com/ondras/promise/.
(function (root, factory) {
  if (typeof define === "function" && define["amd"]) {
    define([ "exports" ], factory);
  } else if (typeof exports === "object") {
    factory(exports);
  } else {
    factory(root);
  }
}(this, function (exports) {
  if (exports.Promise) { return; }

  /**
   * @class A promise - value to be resolved in the future.
   * Implements the "Promises/A+ 1.1" specification.
   * @alias Promise
   * @param {function} [resolver]
   */
  var Promise = function(resolver) {
    this._state = 0; /* 0 = pending, 1 = fulfilled, 2 = rejected */
    this._value = null; /* fulfillment / rejection value */
    this._timeout = null;

    this._cb = {
      fulfilled: [],
      rejected: []
    }

    this._thenPromises = []; /* promises returned by then() */

    if (resolver) { this._invokeResolver(resolver); }
  }

  Promise.resolve = function(value) {
    return new this(function(resolve, reject) {
      resolve(value);
    });
  }

  Promise.reject = function(reason) {
    return new this(function(resolve, reject) {
      reject(reason);
    });
  }

  /**
   * Wait for all these promises to complete. One failed => this fails too.
   */
  Promise.all = Promise.when = function(all) {
    return new this(function(resolve, reject) {
      var counter = 0;
      var results = [];

      all.forEach(function(promise, index) {
        counter++;
        promise.then(function(result) {
          results[index] = result;
          counter--;
          if (!counter) { resolve(results); }
        }, function(reason) {
          counter = 1/0;
          reject(reason);
        });
      });
    });
  }

  Promise.race = function(all) {
    return new this(function(resolve, reject) {
      all.forEach(function(promise) {
        promise.then(resolve, reject);
      });
    });
  }

  /**
   * @param {function} onFulfilled To be called once this promise gets fulfilled
   * @param {function} onRejected To be called once this promise gets rejected
   * @returns {Promise}
   */
  Promise.prototype.then = function(onFulfilled, onRejected) {
    this._cb.fulfilled.push(onFulfilled);
    this._cb.rejected.push(onRejected);

    var thenPromise = new Promise();

    this._thenPromises.push(thenPromise);

    if (this._state > 0) { this._schedule(); }

    /* 2.2.7. then must return a promise. */
    return thenPromise;
  }

  Promise.prototype.fulfill = function(value) {
    if (this._state != 0) { return this; }

    this._state = 1;
    this._value = value;

    if (this._thenPromises.length) { this._schedule(); }

    return this;
  }

  Promise.prototype.reject = function(value) {
    if (this._state != 0) { return this; }

    this._state = 2;
    this._value = value;

    if (this._thenPromises.length) { this._schedule(); }

    return this;
  }

  Promise.prototype.resolve = function(x) {
    /* 2.3.1. If promise and x refer to the same object, reject promise with a TypeError as the reason. */
    if (x == this) {
      this.reject(new TypeError("Promise resolved by its own instance"));
      return;
    }

    /* 2.3.2. If x is a promise, adopt its state */
    if (x instanceof this.constructor) {
      x.chain(this);
      return;
    }

    /* 2.3.3. Otherwise, if x is an object or function,  */
    if (x !== null && (typeof(x) == "object" || typeof(x) == "function")) {
      try {
        var then = x.then;
      } catch (e) {
        /* 2.3.3.2. If retrieving the property x.then results in a thrown exception e, reject promise with e as the reason. */
        this.reject(e);
        return;
      }

      if (typeof(then) == "function") {
        /* 2.3.3.3. If then is a function, call it */
        var called = false;
        var resolvePromise = function(y) {
          /* 2.3.3.3.1. If/when resolvePromise is called with a value y, run [[Resolve]](promise, y). */
          if (called) { return; }
          called = true;
          this.resolve(y);
        }
        var rejectPromise = function(r) {
          /* 2.3.3.3.2. If/when rejectPromise is called with a reason r, reject promise with r. */
          if (called) { return; }
          called = true;
          this.reject(r);
        }

        try {
          then.call(x, resolvePromise.bind(this), rejectPromise.bind(this));
        } catch (e) { /* 2.3.3.3.4. If calling then throws an exception e, */
          /* 2.3.3.3.4.1. If resolvePromise or rejectPromise have been called, ignore it. */
          if (called) { return; }
          /* 2.3.3.3.4.2. Otherwise, reject promise with e as the reason. */
          this.reject(e);
        }
      } else {
        /* 2.3.3.4 If then is not a function, fulfill promise with x. */
        this.fulfill(x);
      }
      return;
    }

    /* 2.3.4. If x is not an object or function, fulfill promise with x. */
    this.fulfill(x);
  }

  Promise.prototype.chain = function(promise) {
    var resolve = function(value) {
      promise.resolve(value);
    }
    var reject = function(value) {
      promise.reject(value);
    }
    return this.then(resolve, reject);
  }

  /**
   * @param {function} onRejected To be called once this promise gets rejected
   * @returns {Promise}
   */
  Promise.prototype["catch"] = function(onRejected) {
    return this.then(null, onRejected);
  }

  Promise.prototype._schedule = function() {
    if (this._timeout) { return; } /* resolution already scheduled */
    this._timeout = setTimeout(this._processQueue.bind(this), 0);
  }

  Promise.prototype._processQueue = function() {
    this._timeout = null;

    while (this._thenPromises.length) {
      var onFulfilled = this._cb.fulfilled.shift();
      var onRejected = this._cb.rejected.shift();
      this._executeCallback(this._state == 1 ? onFulfilled : onRejected);
    }
  }

  Promise.prototype._executeCallback = function(cb) {
    var thenPromise = this._thenPromises.shift();

    if (typeof(cb) != "function") {
      if (this._state == 1) {
        /* 2.2.7.3. If onFulfilled is not a function and promise1 is fulfilled, promise2 must be fulfilled with the same value. */
        thenPromise.fulfill(this._value);
      } else {
        /* 2.2.7.4. If onRejected is not a function and promise1 is rejected, promise2 must be rejected with the same reason. */
        thenPromise.reject(this._value);
      }
      return;
    }

    try {
      var x = cb(this._value);
      /* 2.2.7.1. If either onFulfilled or onRejected returns a value x, run the Promise Resolution Procedure [[Resolve]](promise2, x). */
      thenPromise.resolve(x);
    } catch (e) {
      /* 2.2.7.2. If either onFulfilled or onRejected throws an exception, promise2 must be rejected with the thrown exception as the reason. */
      thenPromise.reject(e);
    }
  }

  Promise.prototype._invokeResolver = function(resolver) {
    try {
      resolver(this.resolve.bind(this), this.reject.bind(this));
    } catch (e) {
      this.reject(e);
    }
  }

  // 2013-03-09 (Peter O.): modified to retain name
  // after minification
  exports["Promise"] = Promise;
}));
;
/*
Written by Peter O. in 2015.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://upokecenter.dreamhosters.com/articles/donate-now-2/
*/

/**
* A collection of math functions for working
* with vectors, matrices, quaternions, and other
* mathematical objects.<p>
* See the tutorial "{@tutorial glmath}" for more information.
* @module glmath
* @license CC0-1.0
*/
(function (g,f) {
 if (typeof define=="function" && define["amd"]) {
  define([ "exports" ], f);
 } else if (typeof exports=="object") {
  f(exports);
 } else {
  f(g);
 }
}(this, function (exports) {
 if (exports.GLMath) { return; }

/**
* A collection of math functions for working
* with vectors and matrices.<p>
* See the tutorial "{@tutorial glmath}" for more information.
* @class
* @alias glmath.GLMath
*/
var GLMath={
/**
 * Finds the cross product of two 3-element vectors (called A and B).
 * The following are properties of
 * the cross product:<ul>
 * <li>The cross product will be a vector that is perpendicular to both A and B.
<li>Switching the order of A and B results in a cross product
vector with the same length but opposite direction.
 * <li>Let there be a triangle formed by point A, point B, and the point (0,0,0) in that order.
Assume the X axis points to the right and the Y axis points up.
If the cross product of A and B has a positive Z component, the triangle's points are
oriented counterclockwise; otherwise, clockwise.  (If the Y axis points down, the reverse is
true.)
<li>If A and B are unit length vectors,
 * (via {@link glmath.GLMath.vec3norm}), the absolute value
 * of the sine of the shortest angle between them is equal to the length of their
 * cross product. <small>(More formally, the length of the cross
 * product equals |<b>a</b>| * |<b>b</b>| * |sin &theta;|;
 * where |<b>x</b>| is the length of vector <b>x</b>.)</small></ul>
 * The cross product (<b>c</b>) of vectors <b>a</b> and <b>b</b> is found as
 * follows:<pre>
 * <b>c</b>.x = <b>a</b>.y * <b>b</b>.z - <b>a</b>.z * <b>b</b>.y
 * <b>c</b>.y = <b>a</b>.z * <b>b</b>.x - <b>a</b>.x * <b>b</b>.z
 * <b>c</b>.z = <b>a</b>.x * <b>b</b>.y - <b>a</b>.y * <b>b</b>.x
 * </pre>
 * @param {Array<number>} a The first vector.
 * @param {Array<number>} b The second vector.
 * @return {Array<number>} A 3-element vector containing the cross product.
 * @example <caption>The following example uses the cross product to
 * calculate a triangle's normal vector.</caption>
 var a=triangle[0];
 var b=triangle[1];
 var c=triangle[2];
 // Find vector from C to A
 var da=GLMath.vec3sub(a,c);
 // Find vector from C to B
 var db=GLMath.vec3sub(b,c);
 // The triangle's normal is the cross product of da and db
 var normal=GLMath.vec3cross(da,db);
 */
vec3cross:function(a,b){
return [a[1]*b[2]-a[2]*b[1],
 a[2]*b[0]-a[0]*b[2],
 a[0]*b[1]-a[1]*b[0]];
},
/**
 * Finds the dot product of two 3-element vectors. It's the
 * sum of the products of their components (for example, <b>a</b>'s X times
 * <b>b</b>'s X).<p>
 * The dot product has the following properties:
 * <ul>
 * <li>If both vectors are unit length
 * (via {@link glmath.GLMath.vec3norm}), the cosine
 * of the shortest angle between them is equal to their dot product.
 * <small>(More formally, the dot
 * product equals |<b>a</b>| * |<b>b</b>| * cos &theta;
 * where |<b>x</b>| is the length of vector <b>x</b>.)</small>
 * However, the resulting angle (found using the <code>Math.acos</code>
 * function) will never be negative, so it can't
 * be used to determine if one vector is "ahead of" or "behind" another
 * vector.
 * <li>A dot product of 0 indicates that the two vectors
 * are <i>orthogonal</i> (perpendicular to each other).
 * <li>If the two vectors are the same, the return value indicates
 * the vector's length squared.  This is illustrated in the example.
 * </ul>
 * @param {Array<number>} a The first vector.
 * @param {Array<number>} b The second vector.
 * @return {number} A number representing the dot product.
 * @example <caption>The following shows a fast way to compare
 * a vector's length using the dot product.</caption>
 * // Check if the vector's length squares is less than 20 units squared
 * if(GLMath.vec3dot(vector, vector)<20*20){
 *  // The vector's length is shorter than 20 units
 * }
 */
vec3dot:function(a,b){
return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
},
/**
 * Adds two 3-element vectors and returns a new
 * vector with the result. Adding two vectors
 * is the same as adding each of their components.
 * @param {Array<number>} a The first 3-element vector.
 * @param {Array<number>} b The second 3-element vector.
 * @return {Array<number>} The resulting 3-element vector.
 */
vec3add:function(a,b){
return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];
},
/**
 * Subtracts the second vector from the first vector and returns a new
 * vector with the result. Subtracting two vectors
 * is the same as subtracting each of their components.
 * @param {Array<number>} a The first 3-element vector.
 * @param {Array<number>} b The second 3-element vector.
 * @return {Array<number>} The resulting 3-element vector.
 */
vec3sub:function(a,b){
return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
},
/**
 * Negates a 3-element vector and returns a new
 * vector with the result. Negating a vector
 * is the same as reversing the sign of each of its components.
 * @param {Array<number>} a A 3-element vector.
 * @return {Array<number>} The resulting 3-element vector.
 */
vec3negate:function(a){
return [-a[0],-a[1],-a[2]];
},
/**
 * Negates a 3-element vector in place.
Negating a vector
 * is the same as reversing the sign of each of its components.
 * @param {Array<number>} a A 3-element vector.
 * @return {Array<number>} The parameter "a".
 */
vec3negateInPlace:function(a){
a[0]=-a[0];
a[1]=-a[1];
a[2]=-a[2];
return a;
},
/**
 * Multiplies two vectors and returns a new
 * vector with the result. Multiplying two vectors
 * is the same as multiplying each of their components.
 * @param {Array<number>} a The first 3-element vector.
 * @param {Array<number>} b The second 3-element vector.
 * @return {Array<number>} The resulting 3-element vector.
 */
vec3mul:function(a,b){
return [a[0]*b[0],a[1]*b[1],a[2]*b[2]];
},
/**
 * Adds two 3-element vectors and stores
 * the result in the first vector. Adding two vectors
 * is the same as adding each of their components.
 * @param {Array<number>} a The first 3-element vector.
 * @param {Array<number>} b The second 3-element vector.
 * @return {Array<number>} The parameter "a"
 */
vec3addInPlace:function(a,b){
// Use variables in case a and b are the same
var b0=b[0];
var b1=b[1];
var b2=b[2];
a[0]+=b0;
a[1]+=b1;
a[2]+=b2;
return a;
},
/**
 * Subtracts the second vector from the first vector and stores
 * the result in the first vector. Subtracting two vectors
 * is the same as subtracting each of their components.
 * @param {Array<number>} a The first 3-element vector.
 * @param {Array<number>} b The second 3-element vector.
 * @return {Array<number>} The parameter "a"
 */
vec3subInPlace:function(a,b){
// Use variables in case a and b are the same
var b0=b[0];
var b1=b[1];
var b2=b[2];
a[0]-=b0;
a[1]-=b1;
a[2]-=b2;
return a;
},
/**
 * Multiplies two 3-element vectors and stores
 * the result in the first vector. Multiplying two vectors
 * is the same as multiplying each of their components.
 * @param {Array<number>} a The first 3-element vector.
 * @param {Array<number>} b The second 3-element vector.
 * @return {Array<number>} The parameter "a"
 */
vec3mulInPlace:function(a,b){
// Use variables in case a and b are the same
var b0=b[0];
var b1=b[1];
var b2=b[2];
a[0]*=b0;
a[1]*=b1;
a[2]*=b2;
return a;
},
/**
 * Multiplies each element of a 3-element vector by a factor
 * and stores the result in that vector.
 * @param {Array<number>} a A 3-element vector.
 * @param {number} scalar A factor to multiply.
 * @return {Array<number>} The parameter "a".
 */
vec3scaleInPlace:function(a,scalar){
a[0]*=scalar;
a[1]*=scalar;
a[2]*=scalar;
return a;
},

/**
 * Multiplies a 3-element vector by a factor
 * and returns a new vector with the result.
 * @param {Array<number>} a A 3-element vector.
 * @param {number} scalar A factor to multiply.
 * @return {Array<number>} The parameter "a".
 */
vec3scale:function(a,scalar){
 return GLMath.vec3scaleInPlace([a[0],a[1],a[2]],scalar);
},
/**
 * Does a linear interpolation between two 3-element vectors;
 * returns a new vector.
 * @param {Array<number>} v1 The first vector.
 * @param {Array<number>} v2 The second vector.
 * @param {number} factor A value from 0 through 1.  Closer to 0 means
 * closer to v1, and closer to 1 means closer to v2.
 * @return {Array<number>} The interpolated vector.
 */
vec3lerp:function(v1,v2,factor){
 return [
  v1[0]+(v2[0]-v1[0])*factor,
  v1[1]+(v2[1]-v1[1])*factor,
  v1[2]+(v2[2]-v1[2])*factor
 ];
},
/**
 * Finds the dot product of two 4-element vectors. It's the
 * sum of the products of their components (for example, <b>a</b>'s X times <b>b</b>'s X).
 * @param {Array<number>} a The first 4-element vector.
 * @param {Array<number>} b The second 4-element vector.
 */
vec4dot:function(a,b){
return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3];
},
/**
 * Multiplies each element of a 4-element vector by a factor
 * and stores the result in that vector.
 * @param {Array<number>} a A 4-element vector.
 * @param {number} scalar A factor to multiply.
 * @return {Array<number>} The parameter "a".
 */
vec4scaleInPlace:function(a,scalar){
a[0]*=scalar;
a[1]*=scalar;
a[2]*=scalar;
a[3]*=scalar;
return a;
},
/**
 * Does a linear interpolation between two 4-element vectors;
 * returns a new vector.
 * @param {Array<number>} v1 The first vector.
 * @param {Array<number>} v2 The second vector.
 * @param {number} factor A value from 0 through 1.  Closer to 0 means
 * closer to v1, and closer to 1 means closer to v2.
 * @return {Array<number>} The interpolated vector.
 */
vec4lerp:function(v1,v2,factor){
 return [
  v1[0]+(v2[0]-v1[0])*factor,
  v1[1]+(v2[1]-v1[1])*factor,
  v1[2]+(v2[2]-v1[2])*factor,
  v1[3]+(v2[3]-v1[3])*factor
 ];
},
/**
 * Converts a 3-element vector to its normalized version.
 * When a vector is normalized, the distance from the origin
 * to that vector becomes 1 (unless all its components are 0).
 * A vector is normalized by dividing each of its components
 * by its [length]{@link glmath.GLMath.vec3length}.
 * @param {Array<number>} vec A 3-element vector.
 * @return {Array<number>} The parameter "vec".
 */
vec3normInPlace:function(vec){
 var x=vec[0];
 var y=vec[1];
 var z=vec[2];
 len=Math.sqrt(x*x+y*y+z*z);
 if(len!=0){
  len=1.0/len;
  vec[0]*=len;
  vec[1]*=len;
  vec[2]*=len;
 }
 return vec;
},
/**
 * Converts a 4-element vector to its normalized version.
 * When a vector is normalized, the distance from the origin
 * to that vector becomes 1 (unless all its components are 0).
 * A vector is normalized by dividing each of its components
 * by its [length]{@link glmath.GLMath.vec4length}.
 * @param {Array<number>} vec A 4-element vector.
 * @return {Array<number>} The parameter "vec".
 */
vec4normInPlace:function(vec){
 var x=vec[0];
 var y=vec[1];
 var z=vec[2];
 var w=vec[3];
 len=Math.sqrt(x*x+y*y+z*z+w*w);
 if(len!=0){
  len=1.0/len;
  vec[0]*=len;
  vec[1]*=len;
  vec[2]*=len;
  vec[3]*=len;
 }
 return vec;
},
/**
 * Returns a normalized version of a 3-element vector.
 * When a vector is normalized, the distance from the origin
 * to that vector becomes 1 (unless all its components are 0).
 * A vector is normalized by dividing each of its components
 * by its [length]{@link glmath.GLMath.vec3length}.
 * @param {Array<number>} vec A 3-element vector.
 * @return {Array<number>} The resulting vector.
 */
vec3norm:function(vec){
 return GLMath.vec3normInPlace([vec[0],vec[1],vec[2]]);
},
/**
 * Returns a normalized version of a 4-element vector.
 * When a vector is normalized, the distance from the origin
 * to that vector becomes 1 (unless all its components are 0).
 * A vector is normalized by dividing each of its components
 * by its [length]{@link glmath.GLMath.vec4length}.
 * @param {Array<number>} vec A 4-element vector.
 * @return {Array<number>} The resulting vector.
 */
vec4norm:function(vec){
 return GLMath.vec4normInPlace([vec[0],vec[1],vec[2],vec[3]]);
},
/**
 * Returns the distance of this 3-element vector from the origin.
 * It's the same as the square root of the sum of the squares
 * of its components.
 * @param {Array<number>} a A 3-element vector.
 * @return {number} Return value. */
vec3length:function(a){
 var dx=a[0];
 var dy=a[1];
 var dz=a[2];
 return Math.sqrt(dx*dx+dy*dy+dz*dz);
},
/**
 * Returns the distance of this 4-element vector from the origin.
 * It's the same as the square root of the sum of the squares
 * of its components.
 * @param {Array<number>} a A 4-element vector.
 * @return {number} Return value. */
vec4length:function(a){
 var dx=a[0];
 var dy=a[1];
 var dz=a[2];
 var dw=a[3];
 return Math.sqrt(dx*dx+dy*dy+dz*dz+dw*dw);
},
/**
 * Returns the identity 3x3 matrix.
 * @return {Array<number>} Return value. */
mat3identity:function(){
 return [1,0,0,0,1,0,0,0,1];
},
/**
 * Returns the identity 4x4 matrix.
 * @return {Array<number>} Return value. */
mat4identity:function(){
 return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
},
/** Returns the identity quaternion of multiplication, (0, 0, 0, 1).
 @return {Array<number>} */
quatIdentity:function(){
 return [0,0,0,1];
},
/**
 * Returns a copy of a 4x4 matrix.
 * @param {Array<number>} mat A 4x4 matrix.
 * @return {Array<number>} Return value. */
mat4copy:function(mat){
 return mat.slice(0,16);
},
/**
 * Returns a copy of a 3-element vector.
 * @param {Array<number>} vec A 3-element vector.
 * @return {Array<number>} Return value. */
vec3copy:function(vec){
 return vec.slice(0,3);
},
/**
 * Returns a copy of a 4-element vector.
 * @param {Array<number>} vec A 4-element vector.
 * @return {Array<number>} Return value. */
vec4copy:function(vec){
 return vec.slice(0,4);
},
/**
 * Assigns the values of a 3-element vector into another
 * 3-element vector.
 * @param {Array<number>} dst The 3-element vector to
 * assign to.
 * @param {Array<number>} src The 3-element vector whose
 * values will be copied.
 * @return {Array<number>} The parameter "dst"
 */
vec3assign:function(dst,src){
 dst[0]=src[0];
 dst[1]=src[1];
 dst[2]=src[2];
 return dst;
},
/**
 * Assigns the values of a 4-element vector into another
 * 4-element vector.
 * @param {Array<number>} src The 3-element vector whose
 * values will be copied.
 * @return {Array<number>} The parameter "dst"
 */
vec4assign:function(dst,src){
 dst[0]=src[0];
 dst[1]=src[1];
 dst[2]=src[2];
 dst[3]=src[3];
 return dst;
},
/**
 * Returns whether a 4x4 matrix is the identity matrix.
 * @param {Array<number>} mat A 4x4 matrix.
 * @return {boolean} Return value. */
mat4isIdentity:function(mat){
return (
    mat[0]==1 && mat[1]==0 && mat[2]==0 && mat[3]==0 &&
    mat[4]==0 && mat[5]==1 && mat[6]==0 && mat[7]==0 &&
    mat[8]==0 && mat[9]==0 && mat[10]==1 && mat[11]==0 &&
    mat[12]==0 && mat[13]==0 && mat[14]==0 && mat[15]==1
 );
},
/**
 * Finds the inverse of a 4x4 matrix.
 * @param {Array<number>} m A 4x4 matrix.
 * @return {Array<number>} The resulting 4x4 matrix.
 * Returns the identity matrix if this matrix is not invertible.
 */
mat4invert:function(m){
var tvar0 = m[0]*m[10];
var tvar1 = m[0]*m[11];
var tvar2 = m[0]*m[5];
var tvar3 = m[0]*m[6];
var tvar4 = m[0]*m[7];
var tvar5 = m[0]*m[9];
var tvar6 = m[10]*m[12];
var tvar7 = m[10]*m[13];
var tvar8 = m[10]*m[15];
var tvar9 = m[11]*m[12];
var tvar10 = m[11]*m[13];
var tvar11 = m[11]*m[14];
var tvar12 = m[1]*m[10];
var tvar13 = m[1]*m[11];
var tvar14 = m[1]*m[4];
var tvar15 = m[1]*m[6];
var tvar16 = m[1]*m[7];
var tvar17 = m[1]*m[8];
var tvar18 = m[2]*m[11];
var tvar19 = m[2]*m[4];
var tvar20 = m[2]*m[5];
var tvar21 = m[2]*m[7];
var tvar22 = m[2]*m[8];
var tvar23 = m[2]*m[9];
var tvar24 = m[3]*m[10];
var tvar25 = m[3]*m[4];
var tvar26 = m[3]*m[5];
var tvar27 = m[3]*m[6];
var tvar28 = m[3]*m[8];
var tvar29 = m[3]*m[9];
var tvar30 = m[4]*m[10];
var tvar31 = m[4]*m[11];
var tvar32 = m[4]*m[9];
var tvar33 = m[5]*m[10];
var tvar34 = m[5]*m[11];
var tvar35 = m[5]*m[8];
var tvar36 = m[6]*m[11];
var tvar37 = m[6]*m[8];
var tvar38 = m[6]*m[9];
var tvar39 = m[7]*m[10];
var tvar40 = m[7]*m[8];
var tvar41 = m[7]*m[9];
var tvar42 = m[8]*m[13];
var tvar43 = m[8]*m[14];
var tvar44 = m[8]*m[15];
var tvar45 = m[9]*m[12];
var tvar46 = m[9]*m[14];
var tvar47 = m[9]*m[15];
var tvar48 = tvar14-tvar2;
var tvar49 = tvar15-tvar20;
var tvar50 = tvar16-tvar26;
var tvar51 = tvar19-tvar3;
var tvar52 = tvar2-tvar14;
var tvar53 = tvar20-tvar15;
var tvar54 = tvar21-tvar27;
var tvar55 = tvar25-tvar4;
var tvar56 = tvar26-tvar16;
var tvar57 = tvar27-tvar21;
var tvar58 = tvar3-tvar19;
var tvar59 = tvar4-tvar25;
var det = tvar45*tvar57 + tvar6*tvar50 + tvar9*tvar53 + tvar42*tvar54 + tvar7*tvar55 +
tvar10*tvar58 + tvar43*tvar56 + tvar46*tvar59 + tvar11*tvar48 + tvar44*tvar49 +
tvar47*tvar51 + tvar8*tvar52;
if(det==0)return GLMath.mat4identity();
det=1.0/det;
var r=[]
r[0] = m[6]*tvar10 - m[7]*tvar7 + tvar41*m[14] - m[5]*tvar11 - tvar38*m[15] + m[5]*tvar8;
r[1] = m[3]*tvar7 - m[2]*tvar10 - tvar29*m[14] + m[1]*tvar11 + tvar23*m[15] - m[1]*tvar8;
r[2] = m[13]*tvar54 + m[14]*tvar56 + m[15]*tvar49;
r[3] = m[9]*tvar57 + m[10]*tvar50 + m[11]*tvar53;
r[4] = m[7]*tvar6 - m[6]*tvar9 - tvar40*m[14] + m[4]*tvar11 + tvar37*m[15] - m[4]*tvar8;
r[5] = m[2]*tvar9 - m[3]*tvar6 + m[14]*(tvar28-tvar1) + m[15]*(tvar0-tvar22);
r[6] = m[12]*tvar57 + m[14]*tvar59 + m[15]*tvar51;
r[7] = m[8]*tvar54 + m[10]*tvar55 + m[11]*tvar58;
r[8] = m[5]*tvar9 - tvar41*m[12] + tvar40*m[13] - m[4]*tvar10 + m[15]*(tvar32-tvar35);
r[9] = tvar29*m[12] - m[1]*tvar9 + m[13]*(tvar1-tvar28) + m[15]*(tvar17-tvar5);
r[10] = m[12]*tvar50 + m[13]*tvar55 + m[15]*tvar52;
r[11] = m[8]*tvar56 + m[9]*tvar59 + m[11]*tvar48;
r[12] = tvar38*m[12] - m[5]*tvar6 - tvar37*m[13] + m[4]*tvar7 + m[14]*(tvar35-tvar32);
r[13] = m[1]*tvar6 - tvar23*m[12] + m[13]*(tvar22-tvar0) + m[14]*(tvar5-tvar17);
r[14] = m[12]*tvar53 + m[13]*tvar58 + m[14]*tvar48;
r[15] = m[8]*tvar49 + m[9]*tvar51 + m[10]*tvar52;
for(var i=0;i<16;i++){
 r[i]*=det;
}
return r;
},
/**
 * Inverts the rotation given in this quaternion without normalizing it;
 * returns a new quaternion.
 * @param {Array<number>} quat A quaternion, containing four elements.
 * @return {Array<number>} Return value. */
quatConjugate:function(quat){
 return [-quat[0],-quat[1],-quat[2],quat[3]];
},
/**
 * Inverts the rotation given in this quaternion;
 * returns a new quaternion.
 * @param {Array<number>} quat A quaternion, containing four elements.
 * @return {Array<number>} Return value. */
quatInvert:function(quat){
 var lsq=1.0/GLMath.quatDot(quat,quat);
 return GLMath.vec4scaleInPlace(
  GLMath.quatConjugate(quat),lsq)
},
/**
 * @deprecated This method incorrectly calculates a quaternion's
 * inverse; use quatInvert instead.  This method will be changed to
 * be equivalent to quatInvert in a future version.
 */
quatInverse:function(quat){
 return GLMath.quatNormInPlace(
   GLMath.quatConjugate(quat));
},
/**
* Returns whether this quaternion is the identity quaternion, (0, 0, 0, 1).
* @return {boolean} Return value.*/
quatIsIdentity:function(quat){
 return quat[0]==0 && quat[1]==0 && quat[2]==0 && quat[3]==1
},
/**
 * Generates a 4x4 matrix describing the rotation
 * described by this quaternion.
 * @param {Array<number>} quat A quaternion.
 * @return {Array<number>} Return value.
 */
quatToMat4:function(quat){
  var tx, ty, tz, xx, xy, xz, yy, yz, zz, wx, wy, wz;
  tx = 2.0 * quat[0];
  ty = 2.0 * quat[1];
  tz = 2.0 * quat[2];
  xx = tx * quat[0];
  xy = tx * quat[1];
  xz = tx * quat[2];
  yy = ty * quat[1];
  yz = tz * quat[1];
  zz = tz * quat[2];
  wx = tx * quat[3];
  wy = ty * quat[3];
  wz = tz * quat[3];
  return [
    1 - (yy + zz), xy + wz, xz - wy,0,
    xy - wz, 1 - (xx + zz), yz + wx,0,
    xz + wy, yz - wx, 1 - (xx + yy),0,
    0,0,0,1
  ]
},
/**
* Calculates the angle and axis of rotation for this
* quaternion. (The axis of rotation is a ray that starts at the
* origin (0,0,0) and points toward a 3D point.)
* @param {Array<number>} a A quaternion.  Must be normalized.
* @return  {Array<number>} A 4-element array giving the axis
 * of rotation as the first three elements, followed by the angle
 * in degrees as the fourth element. If the axis of rotation
 * points toward the viewer, a positive value means the angle runs in
 * a counterclockwise direction for right-handed coordinate systems and
 * in a clockwise direction for left-handed systems.
*/
quatToAxisAngle:function(a){
 var w=a[3];
 var d=1.0-(w*w);
 if(d>0){
  d=1/Math.sqrt(d);
  return [a[0]*d,a[1]*d,a[2]*d,
    Math.acos(w)*GLMath.Num360DividedByPi];
 } else {
  return [0,1,0,0]
 }
},
/**
 * Generates a quaternion describing a rotation between
 * two 3-element vectors.  The quaternion
 * will describe the rotation required to rotate
 * the ray described in the first vector toward the ray described
 * in the second vector.  The vectors need not be normalized.
 * @param {Array<number>} vec1 The first 3-element vector.
* @param {Array<number>} vec2 The second 3-element vector.
 * @return {Array<number>} The generated quaternion, which
 * will be normalized.
 */
quatFromVectors:function(vec1,vec2){
  var ret=GLMath.vec3cross(vec1,vec2);
  var vecLengths=Math.sqrt(GLMath.vec3dot(vec1,vec1))*
            Math.sqrt(GLMath.vec3dot(vec2,vec2));
  if(vecLengths==0)vecLengths=1; // degenerate case
  ret[3]=vecLengths+GLMath.vec3dot(vec1,vec2);
  return GLMath.quatNormInPlace(ret);
},
/**
 * Generates a quaternion from an angle and axis of rotation.
 (The axis of rotation is a ray that starts at the
* origin (0,0,0) and points toward a 3D point.)
 * @param {Array<number>|number} angle The desired angle
 * to rotate in degrees.  If "v", "vy", and "vz" are omitted, this can
 * instead be a 4-element array giving the axis
 * of rotation as the first three elements, followed by the angle
 * in degrees as the fourth element.
 * @param {Array<number>|number} v X-component of the point lying on the axis
 * of rotation.  If "vy" and "vz" are omitted, this can
 * instead be a 3-element array giving the axis
 * of rotation in x, y, and z, respectively.  If the axis of rotation
 * points toward the viewer, a positive value means the angle runs in
 * a counterclockwise direction for right-handed coordinate systems and
 * in a clockwise direction for left-handed systems.
 * @param {number} vy Y-component of the point lying on the axis
 * of rotation.
 * @param {number} vz Z-component of the point lying on the axis
 * of rotation.
 * @return {Array<number>} The generated quaternion.
 */
quatFromAxisAngle:function(angle,v,vy,vz){
var v0,v1,v2,ang;
if(typeof vy!="undefined" && typeof vz!="undefined"){
 v0=v;
 v1=vy;
 v2=vz;
 ang=((angle>=0 && angle<360) ? angle : ((angle%360)+(angle<0 ? 360 : 0)))*GLMath.PiDividedBy360;
} else if(typeof v=="undefined"){
 v0=angle[0];
 v1=angle[1];
 v2=angle[2];
 ang=angle[3];
 ang=((angle>=0 && angle<360) ? angle : ((angle%360)+(angle<0 ? 360 : 0)))*GLMath.PiDividedBy360;
} else {
 v0=v[0];
 v1=v[1];
 v2=v[2];
 ang=((angle>=0 && angle<360) ? angle : ((angle%360)+(angle<0 ? 360 : 0)))*GLMath.PiDividedBy360;
}
var cost = Math.cos(ang);
var sint = (ang>=0 && ang<6.283185307179586) ? (ang<=3.141592653589793 ? Math.sqrt(1.0-cost*cost) : -Math.sqrt(1.0-cost*cost)) : Math.sin(ang);
var vec=GLMath.vec3normInPlace([v0,v1,v2]);
var ret=[vec[0],vec[1],vec[2],cost];
ret[0]*=sint;
ret[1]*=sint;
ret[2]*=sint;
return ret;
},
/**
 * Generates a quaternion from pitch, yaw and roll angles.
 * In the parameters given below, when the axis of rotation
 * points toward the viewer, a positive value means the angle runs in
 * a counterclockwise direction for right-handed coordinate systems and
 * in a clockwise direction for left-handed systems.
  (The axis of rotation is a ray that starts at the
* origin (0,0,0) and points toward a 3D point.)
 * @param {number} pitchDegrees Rotation about the x-axis (upward or downward turn), in degrees.
*  This can instead be a 3-element
 * array giving the rotation about the x-axis, y-axis, and z-axis,
 * respectively.
 * @param {number} yawDegrees Rotation about the y-axis (left or right turn), in degrees.
 * May be null or omitted if "pitchDegrees" is an array.
 * @param {number} rollDegrees Rotation about the z-axis (swaying side by side), in degrees.
 * May be null or omitted if "pitchDegrees" is an array.
 * @param {number|null} mode Specifies the order in which the rotations will occur (in terms of their effect).
 * Is one of the GLMath constants such as GLMath.PitchYawRoll
 * and GLMath.RollYawPitch. If null or omitted, the rotation will be
 * described as the effect of a roll, then pitch, then yaw (each rotation around the original axes).
 * @return {Array<number>} The generated quaternion.
 */
quatFromTaitBryan:function(pitchDegrees,yawDegrees,rollDegrees, mode){
 var rollRad,pitchRad,yawRad;
 if(mode==null)mode=GLMath.RollPitchYaw;
 if(mode<0 || mode>=6)throw new Error("invalid mode");
 if(pitchDegrees.constructor==Array){
  rollRad=((pitchDegrees[2]>=0 && pitchDegrees[2]<360) ? pitchDegrees[2] : ((pitchDegrees[2]%360)+(pitchDegrees[2]<0 ? 360 : 0)))*GLMath.PiDividedBy360;
  pitchRad=((pitchDegrees[0]>=0 && pitchDegrees[0]<360) ? pitchDegrees[0] : ((pitchDegrees[0]%360)+(pitchDegrees[0]<0 ? 360 : 0)))*GLMath.PiDividedBy360;
  yawRad=((pitchDegrees[1]>=0 && pitchDegrees[1]<360) ? pitchDegrees[1] : ((pitchDegrees[1]%360)+(pitchDegrees[1]<0 ? 360 : 0)))*GLMath.PiDividedBy360;
 } else {
  rollRad=((rollDegrees>=0 && rollDegrees<360) ? rollDegrees : ((rollDegrees%360)+(rollDegrees<0 ? 360 : 0)))*GLMath.PiDividedBy360;
  pitchRad=((pitchDegrees>=0 && pitchDegrees<360) ? pitchDegrees : ((pitchDegrees%360)+(pitchDegrees<0 ? 360 : 0)))*GLMath.PiDividedBy360;
  yawRad=((yawDegrees>=0 && yawDegrees<360) ? yawDegrees : ((yawDegrees%360)+(yawDegrees<0 ? 360 : 0)))*GLMath.PiDividedBy360;
 }
  var py = Math.cos(pitchRad);
  var px = (pitchRad>=0 && pitchRad<6.283185307179586) ? (pitchRad<=3.141592653589793 ? Math.sqrt(1.0-py*py) : -Math.sqrt(1.0-py*py)) : Math.sin(pitchRad);
  var yy = Math.cos(yawRad);
  var yx = (yawRad>=0 && yawRad<6.283185307179586) ? (yawRad<=3.141592653589793 ? Math.sqrt(1.0-yy*yy) : -Math.sqrt(1.0-yy*yy)) : Math.sin(yawRad);
  var ry = Math.cos(rollRad);
  var rx = (rollRad>=0 && rollRad<6.283185307179586) ? (rollRad<=3.141592653589793 ? Math.sqrt(1.0-ry*ry) : -Math.sqrt(1.0-ry*ry)) : Math.sin(rollRad);
  var t8;
  if(mode==GLMath.PitchYawRoll || mode==GLMath.PitchRollYaw){
   var t7 = [rx*yx, ry * yx, rx * yy, ry * yy];
   if(mode==GLMath.PitchYawRoll)t7[0]=-t7[0];
   t8 = [t7[3] * px + t7[0] * py, t7[1] * py + t7[2] * px, t7[2] * py - t7[1] * px, t7[3] * py - t7[0] * px];
  } else if(mode==GLMath.YawPitchRoll || mode==GLMath.YawRollPitch){
   var t7 = [ry * px, rx * px, rx * py, ry * py];
   if(mode==GLMath.YawRollPitch)t7[1]=-t7[1];
   t8 = [t7[0] * yy - t7[2] * yx, t7[3] * yx + t7[1] * yy, t7[2] * yy + t7[0] * yx, t7[3] * yy - t7[1] * yx];
  } else {
   var t7 = [yy * px, yx * py, yx * px, yy * py];
   if(mode==GLMath.RollPitchYaw)t7[2]=-t7[2];
   t8 = [t7[0] * ry + t7[1] * rx, t7[1] * ry - t7[0] * rx, t7[3] * rx + t7[2] * ry, t7[3] * ry - t7[2] * rx];
  }
  return t8;
},
/**
 * Converts this quaternion to the same version of the rotation
 * in the form of pitch, yaw, and roll angles.
 * @param {Array<number>} a A quaternion.  Should be normalized.
 * @param {number|null} mode Specifies the order in which the rotations will occur
 * (in terms of their effect, not in terms of how they will be returned by this method).
 * Is one of the GLMath constants such as GLMath.PitchYawRoll
 * and GLMath.RollYawPitch. If null or omitted, the rotation will be
 * described as the effect of a roll, then pitch, then yaw (each rotation around the original axes).
 * @return {Array<number>} A 3-element array containing the
 * pitch, yaw, and roll angles, in that order, in degrees.  For each
 * angle, if the corresponding axis
 * points toward the viewer, a positive value means the angle runs in
 * a counterclockwise direction for right-handed coordinate systems and
 * in a clockwise direction for left-handed systems.
 */
quatToTaitBryan:function(a,mode){
  var c0=a[3];
  var c1,c2,c3;
  var e=1;
  if(mode==null)mode=GLMath.RollPitchYaw;
  if(mode<0 || mode>=6)throw new Error("invalid mode");
  if(mode==GLMath.RollPitchYaw){
   c1=a[1]; c2=a[0]; c3=a[2];
   e=-1;
  } else if(mode==GLMath.PitchYawRoll){
   c1=a[2]; c2=a[1]; c3=a[0];
   e=-1;
  } else if(mode==GLMath.PitchRollYaw){
   c1=a[1]; c2=a[2]; c3=a[0];
  } else if(mode==GLMath.YawPitchRoll){
   c1=a[2]; c2=a[0]; c3=a[1];
  } else if(mode==GLMath.YawRollPitch){
   c1=a[0]; c2=a[2]; c3=a[1];
   e=-1;
  } else {
   c1=a[0]; c2=a[1]; c3=a[2];
  }
 var sq1=c1*c1;
  var sq2=c2*c2;
  var sq3=c3*c3;
  var e1=Math.atan2(2*(c0*c1-e*c2*c3),1-(sq1+sq2)*2);
  var sine=2*(c0*c2+e*c1*c3);
  if(sine>1.0)sine=1.0; // for stability
  if(sine<-1.0)sine=-1.0; // for stability
  var e2=Math.asin(sine);
  var e3=Math.atan2(2*(c0*c3-e*c1*c2),1-(sq2+sq3)*2);
  e1*=GLMath.Num180DividedByPi
  e2*=GLMath.Num180DividedByPi
  e3*=GLMath.Num180DividedByPi
  // Singularity near the poles
  if(Math.abs(e2-90)<0.000001 ||
      Math.abs(e2+90)<0.000001){
    e3=0;
    e1=Math.atan2(c1,c0)*GLMath.Num180DividedByPi;
    if(isNaN(e1))e1=0;
  }
  // Return the pitch/yaw/roll angles in the standard order
  var angles=[];
  if(mode==GLMath.RollPitchYaw){
   angles[0]=e2; angles[1]=e1; angles[2]=e3;
  } else if(mode==GLMath.PitchYawRoll){
   angles[0]=e3; angles[1]=e2; angles[2]=e1;
  } else if(mode==GLMath.PitchRollYaw){
   angles[0]=e3; angles[1]=e1; angles[2]=e2;
  } else if(mode==GLMath.YawPitchRoll){
   angles[0]=e2; angles[1]=e3; angles[2]=e1;
  } else if(mode==GLMath.YawRollPitch){
   angles[0]=e1; angles[1]=e3; angles[2]=e2;
  } else {
   angles[0]=e1; angles[1]=e2; angles[2]=e3;
  }
  return angles;
},
/**
 * Does a spherical linear interpolation between two quaternions;
 * returns a new quaternion.
 * This method is useful for smoothly animating between the two
 * rotations they describe.
 * @param {Array<number>} q1 The first quaternion.  Should be normalized.
 * @param {Array<number>} q2 The second quaternion.  Should be normalized.
 * @param {number} factor A value from 0 through 1.  Closer to 0 means
 * closer to q1, and closer to 1 means closer to q2.
 * @return {Array<number>} The interpolated quaternion.
 */
quatSlerp:function(q1,q2,factor){
 var cosval=GLMath.quatDot(q1,q2);
 var qd=q2;
 if(cosval<0){
  qd=[-q2[0],-q2[1],-q2[2],-q2[3]];
  cosval=GLMath.quatDot(q1,qd);
 }
 var angle=0;
 if(cosval>-1){
  if(cosval<1){
   angle=Math.acos(cosval);
   if(angle==0)return qd.slice(0,4);
  }
  else return qd.slice(0,4);
 } else {
  angle=Math.PI;
 }
 var s=Math.sin(angle);
 var sinv=1.0/s;
 var c1=Math.sin((1.0-factor)*angle)*sinv;
 var c2=Math.sin(factor*angle)*sinv;
 return [
  q1[0]*c1+qd[0]*c2,
  q1[1]*c1+qd[1]*c2,
  q1[2]*c1+qd[2]*c2,
  q1[3]*c1+qd[3]*c2
 ];
},
/**
 * Multiplies a quaternion by a rotation transformation
 * described as an angle and axis of rotation.
 * The result is such that the angle-axis
 * rotation happens before the quaternion's rotation.<p>
 * This method is equivalent to the following:<pre>
 * return quatMultiply(quat,quatFromAxisAngle(angle,v,vy,vz));
 * </pre>
 * @param {Array<number>|number} angle The desired angle
 * to rotate in degrees.  If "v", "vy", and "vz" are omitted, this can
 * instead be a 4-element array giving the axis
 * of rotation as the first three elements, followed by the angle
 * in degrees as the fourth element. If the axis of rotation
 * points toward the viewer, a positive value means the angle runs in
 * a counterclockwise direction for right-handed coordinate systems and
 * in a clockwise direction for left-handed systems.
 * @param {Array<number>|number} v X-component of the point lying on the axis
 * of rotation.  If "vy" and "vz" are omitted, this can
 * instead be a 3-element array giving the axis
 * of rotation in x, y, and z, respectively.
 * @param {number} vy Y-component of the point lying on the axis
 * of rotation.
 * @param {number} vz Z-component of the point lying on the axis
 * of rotation.
 * @return {Array<number>} The resulting quaternion.
 */
quatRotate:function(quat,angle,v,vy,vz){
  return GLMath.quatMultiply(quat,
    GLMath.quatFromAxisAngle(angle,v,vy,vz));
},
/**
 * Transforms a 3- or 4-element vector using a quaternion's rotation.
 * @param {Array<number>} q A quaternion describing
 * the rotation.
 * @param {Array<number>} v A 3- or 4-element vector to
 * transform. The fourth element, if any, is ignored.
 * @return {Array<number>} A 4-element vector representing
* the transformed vector.
 */
quatTransform:function(q,v){
var v1 = GLMath.vec3cross( q, v );
v1[0] += v[0] * q[3];
v1[1] += v[1] * q[3];
v1[2] += v[2] * q[3];
var v2 = GLMath.vec3cross( v1, q );
var dot = q[0] * v[0] + q[1] * v[1] + q[2] * v[2];
return [
q[0] * dot + v1[0] * q[3] - v2[0],
q[1] * dot + v1[1] * q[3] - v2[1],
q[2] * dot + v1[2] * q[3] - v2[2],
1]
},
/**
 * Generates a quaternion from the rotation described in a 4x4 matrix.
 * The upper 3x3 portion of the matrix is used for this calculation.
 * The results are undefined if the matrix includes shearing.
 * @param {Array<number>} m A 4x4 matrix.
 * @return {Array<number>} The resulting quaternion.
 */
quatFromMat4:function(m){
var ret=[]
 var xy=m[1];
 var xz=m[2];
 var yx=m[4];
 var yz=m[6];
 var zx=m[8];
 var zy=m[9];
 var trace = m[0] + m[5] + m[10];
if (trace >= 0.0)
{
var s = Math.sqrt(trace + 1.0) * 0.5;
var t = 0.25/s;
ret[0] = (yz - zy) * t;
ret[1] = (zx - xz) * t;
ret[2] = (xy - yx) * t;
ret[3] = s;
}
else if((m[0] > m[5]) && (m[0] > m[10]))
{
// s=4*x
var s = Math.sqrt(1.0+m[0]-m[5]-m[10]) * 0.5;
var t = 0.25/s;
ret[0] = s;
ret[1] = (yx + xy) * t;
ret[2] = (xz + zx) * t;
ret[3] = (yz - zy) * t;
}
else if(m[5] > m[10])
{
// s=4*y
var s = Math.sqrt(1.0+m[5]-m[0]-m[10]) * 0.5;
var t = 0.25/s;
ret[0] = (yx + xy) * t;
ret[1] = s;
ret[2] = (zy + yz) * t;
ret[3] = (zx - xz) * t;
}
else
{
// s=4*z
var s = Math.sqrt(1.0+m[10]-m[0]-m[5]) * 0.5;
var t = 0.25/s;
ret[0] = (zx + xz) * t;
ret[1] = (zy + yz) * t;
ret[2] = s;
ret[3] = (xy - yx) * t;
}
return ret
},
/**
 * Returns the upper-left part of a 4x4 matrix as a new
 * 3x3 matrix.
 * @param {Array<number>} m4 A 4x4 matrix.
 * @return {Array<number>} The resulting 3x3 matrix.
 */
mat4toMat3:function(m4){
 return [
  m4[0],m4[1],m4[2],
  m4[4],m4[5],m4[6],
  m4[8],m4[9],m4[10]
 ]
},
/**
 * Returns the transpose of a 4x4 matrix.
 * @param {Array<number>} m4 A 4x4 matrix.
 * @return {Array<number>} The resulting 4x4 matrix.
 */
mat4transpose:function(m4){
 return mat4transposeInPlace(m4.slice(0,16));
},
/**
 * Transposes a 4x4 matrix in place without creating
 * a new matrix.
 * @param {Array<number>} mat A 4x4 matrix.
 * @return {Array<number>} The parameter "mat".
 */
mat4transposeInPlace:function(mat){
 var tmp=mat[1];mat[1]=mat[4];mat[4]=tmp;
 tmp=mat[2];mat[2]=mat[8];mat[8]=tmp;
 tmp=mat[3];mat[3]=mat[12];mat[12]=tmp;
 tmp=mat[6];mat[6]=mat[9];mat[9]=tmp;
 tmp=mat[7];mat[7]=mat[13];mat[13]=tmp;
 tmp=mat[11];mat[11]=mat[14];mat[14]=tmp;
 return mat;
},
/**
* Returns the transposed result of the inverted upper left corner of
* the given 4x4 matrix.<p>
* This is usually used to convert a world matrix to a matrix
* for transforming surface normals in order to keep them perpendicular
* to a surface transformed by the world matrix.
* @param {Array<number>} m4 A 4x4 matrix.
* @return {Array<number>} The resulting 3x3 matrix. If the matrix
* can't be inverted, returns the identity 3x3 matrix.
*/
mat4inverseTranspose3:function(m4){
if(m4[1]==0 && m4[2]==0 && m4[4]==0 &&
   m4[6]==0 && m4[8]==0 && m4[9]==0){
 if(m4[0]==1 && m4[5]==1 && m4[10]==1){
  // upper 3x3 is identity
  return [1,0,0,0,1,0,0,0,1];
 } else if(m4[0]*m4[5]*m4[10]!=0){
  // upper 3x3 is simple scaling
  return [1/m4[0],0,0,0,1/m4[5],0,0,0,1/m4[10]];
 } else {
  // upper 3x3 is uninvertable scaling
  return [1,0,0,0,1,0,0,0,1];
 }
}
var m=[m4[0],m4[1],m4[2],m4[4],m4[5],m4[6],
   m4[8],m4[9],m4[10]];
var det=m[0] * m[4] * m[8] +
m[3] * m[7] * m[2] +
m[6] * m[1] * m[5] -
m[6] * m[4] * m[2] -
m[3] * m[1] * m[8] -
m[0] * m[7] * m[5];
if(det==0) {
return [1,0,0,0,1,0,0,0,1];
}
det=1.0/det;
return [
 (-m[5] * m[7] + m[4] * m[8])*det,
 (m[5] * m[6] - m[3] * m[8])*det,
 (-m[4] * m[6] + m[3] * m[7])*det,
 (m[2] * m[7] - m[1] * m[8])*det,
 (-m[2] * m[6] + m[0] * m[8])*det,
 (m[1] * m[6] - m[0] * m[7])*det,
 (-m[2] * m[4] + m[1] * m[5])*det,
 (m[2] * m[3] - m[0] * m[5])*det,
 (-m[1] * m[3] + m[0] * m[4])*det]
},
/**
 * Multiplies a 4x4 matrix by a scaling transformation.
 * @param {Array<number>|number} v3 Scaling factor along the
 * X axis.  If "v3y" and "v3z" are omitted, this value can instead
 * be a 3-element array giving the scaling factors along the X, Y, and
 * Z axes.
 * @param {number} v3y Scaling factor along the Y axis.
 * @param {number} v3z Scaling factor along the Z axis.
 * @return {Array<number>} The resulting 4x4 matrix.
 */
mat4scale:function(mat,v3,v3y,v3z){
  var scaleX,scaleY,scaleZ;
  if(typeof v3y!="undefined" && typeof v3z!="undefined"){
      scaleX=v3;
      scaleY=v3y;
      scaleZ=v3z;
  } else {
      scaleX=v3[0];
      scaleY=v3[1];
      scaleZ=v3[2];
  }
 return [
  mat[0]*scaleX, mat[1]*scaleX, mat[2]*scaleX, mat[3]*scaleX,
  mat[4]*scaleY, mat[5]*scaleY, mat[6]*scaleY, mat[7]*scaleY,
  mat[8]*scaleZ, mat[9]*scaleZ, mat[10]*scaleZ, mat[11]*scaleZ,
  mat[12], mat[13], mat[14], mat[15]
 ];
},
/**
 * Returns a 4x4 matrix representing a scaling transformation.
 * @param {Array<number>|number} v3 Scaling factor along the
 * X axis.  If "v3y" and "v3z" are omitted, this value can instead
 * be a 3-element array giving the scaling factors along the X, Y, and
 * Z axes.
 * @param {number} v3y Scaling factor along the Y axis.
 * @param {number} v3z Scaling factor along the Z axis.
 * @return {Array<number>} The resulting 4x4 matrix.
 */
mat4scaled:function(v3,v3y,v3z){
  if(typeof v3y!="undefined" && typeof v3z!="undefined"){
   return [v3,0,0,0,0,v3y,0,0,0,0,v3z,0,0,0,0,1]
  } else {
   return [v3[0],0,0,0,0,v3[1],0,0,0,0,v3[2],0,0,0,0,1]
  }
},
/**
 * Transforms a 4-element vector with a 4x4 matrix and returns
 * the transformed vector.
 * @param {Array<number>} mat A 4x4 matrix.
 * @param {Array<number>|number} v X coordinate.
 * If "vy", "vz", and "vw" are omitted, this value can instead
 * be a 4-element array giving the X, Y, Z, and W coordinates.
 * @param {number} vy Y coordinate.
 * @param {number} vz Z coordinate.
 * @param {number} vw W coordinate.  To transform a 3D
 * point, set W to 1; to transform a 2D
 * point, set Z and W to 1.
 * @return {Array<number>} The transformed vector.
 */
mat4transform:function(mat,v,vy,vz,vw){
  var x,y,z,w;
  if(typeof vy!="undefined" && typeof vz!="undefined" &&
      typeof vw!="undefined"){
      x=v;
      y=vy;
      z=vz;
      w=vw;
  } else {
      x=v[0];
      y=v[1];
      z=v[2];
      w=v[3];
  }
return [x * mat[0] + y * mat[4] + z * mat[8] + w * mat[12],
            x * mat[1] + y * mat[5] + z * mat[9] + w * mat[13],
            x * mat[2] + y * mat[6] + z * mat[10] + w * mat[14],
            x * mat[3] + y * mat[7] + z * mat[11] + w * mat[15]];
},
/**
 * Transforms a 3-element vector with a 4x4 matrix and returns
 * the transformed vector.
 * @param {Array<number>} mat A 4x4 matrix.
 * @param {Array<number>|number} v X coordinate.
 * If "vy", "vz", and "vw" are omitted, this value can instead
 * be a 4-element array giving the X, Y, Z, and W coordinates.
 * @param {number} vy Y coordinate.
 * @param {number} vz Z coordinate.
 * @param {number} vw W coordinate.  To transform a 2D
 * point, set Z to 1.
 * @return {Array<number>} The transformed vector.
 */
mat4transformVec3:function(mat,v,vy,vz){
  var x,y,z;
  if(typeof vy!="undefined" && typeof vz!="undefined"){
      x=v;
      y=vy;
      z=vz;
  } else {
      x=v[0];
      y=v[1];
      z=v[2];
  }
return [x * mat[0] + y * mat[4] + z * mat[8] + mat[12],
            x * mat[1] + y * mat[5] + z * mat[9] + mat[13],
            x * mat[2] + y * mat[6] + z * mat[10] + mat[14],
            x * mat[3] + y * mat[7] + z * mat[11] + mat[15]];
},
/**
 * Transforms a 3-element vector with a 3x3 matrix and returns
 * the transformed vector.
 * @param {Array<number>} mat A 3x3 matrix.
 * @param {Array<number>|number} v X coordinate.
 * If "vy", and "vz" are omitted, this value can instead
 * be a 4-element array giving the X, Y, and Z coordinates.
 * @param {number} vy Y coordinate.
 * @param {number} vz Z coordinate.  To transform a 2D
 * point, set Z to 1.
 * @return {Array<number>} The transformed vector.
 */
mat3transform:function(mat,v,vy,vz){
  var x,y,z;
  if(typeof vy!="undefined" && typeof vz!="undefined"){
      x=v;
      y=vy;
      z=vz;
  } else {
      x=v[0];
      y=v[1];
      z=v[2];
  }
return [x * mat[0] + y * mat[3] + z * mat[6],
            x * mat[1] + y * mat[4] + z * mat[7],
            x * mat[2] + y * mat[5] + z * mat[8]];
},
/**
 * Returns a 4x4 matrix representing a translation.
 * @param {Array<number>|number} v3 Translation along the
 * X axis.  If "v3y" and "v3z" are omitted, this value can instead
 * be a 3-element array giving the translations along the X, Y, and
 * Z axes.
 * @param {number} v3y Translation along the Y axis.
 * @param {number} v3z Translation along the Z axis.
 * @return {Array<number>} The resulting 4x4 matrix.
 */
mat4translated:function(v3,v3y,v3z){
  var x,y,z;
  if(typeof v3y!="undefined" && typeof v3z!="undefined"){
      x=v3;
      y=v3y;
      z=v3z;
  } else {
      x=v3[0];
      y=v3[1];
      z=v3[2];
  }
  return [1,0,0,0,0,1,0,0,0,0,1,0,x,y,z,1]
},
/**
 * Multiplies a 4x4 matrix by a translation transformation.
 * @param {Array<number>} mat The matrix to multiply.
 * @param {Array<number>|number} v3 Translation along the
 * X axis.  If "v3y" and "v3z" are omitted, this value can instead
 * be a 3-element array giving the translations along the X, Y, and
 * Z axes.
 * @param {number} v3y Translation along the Y axis.
 * @param {number} v3z Translation along the Z axis.
 * @return {Array<number>} The resulting 4x4 matrix.
 */
mat4translate:function(mat,v3,v3y,v3z){
  var x,y,z;
  if(typeof v3y!="undefined" && typeof v3z!="undefined"){
      x=v3;
      y=v3y;
      z=v3z;
  } else {
      x=v3[0];
      y=v3[1];
      z=v3[2];
  }
  return [
  mat[0],mat[1],mat[2],mat[3],
  mat[4],mat[5],mat[6],mat[7],
  mat[8],mat[9],mat[10],mat[11],
  mat[0] * x + mat[4] * y + mat[8] * z + mat[12],
  mat[1] * x + mat[5] * y + mat[9] * z + mat[13],
  mat[2] * x + mat[6] * y + mat[10] * z + mat[14],
  mat[3] * x + mat[7] * y + mat[11] * z + mat[15]
  ]
},
/**
 * Returns a 4x4 matrix representing a perspective projection.<p>
 * This method assumes a right-handed coordinate system, such as
 * OpenGL's. To adjust the result of this method to a left-handed system,
 * such as in legacy Direct3D, reverse the sign of the 9th, 10th, 11th, and 12th
 * elements of the result (zero-based indices 8, 9, 10, and 11).
* @param {number}  fovY Y-axis field of view, in degrees. Should be less
* than 180 degrees.  (The smaller
* this number, the bigger close objects appear to be.  As a result, zooming out
* can be implemented by raising this value, and zooming in by lowering it.)
* @param {number}  aspectRatio The ratio of width to height of the viewport, usually
*  the scene's aspect ratio.
* @param {number} near The distance from the camera to
* the near clipping plane. Objects closer than this distance won't be
* seen.<p>This value should not be 0 or less, and should be set to the highest distance
* from the camera that the application can afford to clip out for being too
* close, for example, 0.5, 1, or higher.
* @param {number} far The distance from the camera to
* the far clipping plane. Objects beyond this distance will be too far
* to be seen.  This value should be greater than "near" and be set so that the ratio of "far" to "near"
* is as small as the application can accept.<p>
 * (Depth buffers often allow only 65536 possible values per pixel,
 * which are more spread out toward the far clipping plane than toward the
 * near plane due to the perspective projection.  The greater the ratio of "far" to
 * "near", the more the values spread out, and the more likely two objects close
 * to the far plane will have identical depth values.)
 * @return {Array<number>} The resulting 4x4 matrix.
 */
mat4perspective:function(fovY,aspectRatio,near,far){
 var fov=((fovY>=0 && fovY<360) ? fovY : ((fovY%360)+(fovY<0 ? 360 : 0)))*GLMath.PiDividedBy360;
 var f = 1/Math.tan(fov);
 var nmf = near-far;
 nmf=1/nmf;
 return [f/aspectRatio, 0, 0, 0, 0, f, 0, 0, 0, 0,
   nmf*(near+far), -1, 0, 0, nmf*near*far*2, 0]
},
/**
 * Returns a 4x4 matrix representing a camera view.<p>
 * This method assumes a right-handed coordinate system, such as
 * OpenGL's. To adjust the result of this method to a left-handed system,
 * such as in legacy Direct3D, reverse the sign of the 1st, 3rd, 5th, 7th, 9th, 11th,
 * 13th, and 15th elements of the result (zero-based indices 0, 2, 4, 6, 8,
 * 10, 12, and 14).
* @param {Array<number>} viewerPos A 3-element vector specifying
* the camera position in world space.
* @param {Array<number>} [lookingAt] A 3-element vector specifying
* the point in world space that the camera is looking at.  May be null or omitted,
* in which case the default is the coordinates (0,0,0).
* @param {Array<number>} [up] A 3-element vector specifying
* the direction from the center of the camera to its top. This parameter may
* be null or omitted, in which case the default is the vector (0, 1, 0),
* the vector that results when the camera is held upright.  This
* vector must not point in the same or opposite direction as
* the camera's view direction. (For best results, rotate the vector (0, 1, 0)
* so it points perpendicular to the camera's view direction.)
 * @return {Array<number>} The resulting 4x4 matrix.
 */
mat4lookat:function(viewerPos,lookingAt,up){
 if(!up)up=[0,1,0];
 if(!lookingAt)lookingAt=[0,0,0]
 var f=[lookingAt[0]-viewerPos[0],lookingAt[1]-viewerPos[1],lookingAt[2]-viewerPos[2]];
 var len=GLMath.vec3length(f);
 if(len<1e-6){
   return GLMath.mat4identity();
 }
 // normalize "f"
 len=1.0/len;
 f[0]*=len;
 f[1]*=len;
 f[2]*=len;
 up=GLMath.vec3norm(up);
 var s=GLMath.vec3cross(f,up);
 GLMath.vec3normInPlace(s);
 var u=GLMath.vec3cross(s,f);
 GLMath.vec3normInPlace(u);
 f[0]=-f[0];
 f[1]=-f[1];
 f[2]=-f[2];
 return [s[0],u[0],f[0],0,s[1],u[1],f[1],0,s[2],u[2],f[2],0,
    -GLMath.vec3dot(viewerPos,s),
    -GLMath.vec3dot(viewerPos,u),
    -GLMath.vec3dot(viewerPos,f),1];
},
/**
 * Returns a 4x4 matrix representing an orthographic projection.
 * In this projection, the left clipping plane is parallel to the right clipping
 * plane and the top to the bottom.<p>
 * This method assumes a right-handed coordinate system, such as
 * OpenGL's. To adjust the result of this method to a left-handed system,
 * such as in legacy Direct3D, reverse the sign of the 9th, 10th, 11th, and 12th
 * elements of the result (zero-based indices 8, 9, 10, and 11).
 * @param {number} l Leftmost coordinate of the 3D view.
 * @param {number} r Rightmost coordinate of the 3D view.
 * (Note that r can be greater than l or vice versa.)
 * @param {number} b Bottommost coordinate of the 3D view.
 * @param {number} t Topmost coordinate of the 3D view.
 * (Note that t can be greater than b or vice versa.)
 * @param {number} n Distance from the camera to the near clipping
 * plane.  A positive value means the plane is in front of the viewer.
 * @param {number} f Distance from the camera to the far clipping
 * plane.  A positive value means the plane is in front of the viewer.
 * (Note that n can be greater than f or vice versa.)  The absolute difference
 * between n and f should be as small as the application can accept.
 * @return {Array<number>} The resulting 4x4 matrix.
 */
mat4ortho:function(l,r,b,t,n,f){
 var width=1/(r-l);
 var height=1/(t-b);
 var depth=1/(f-n);
 return [2*width,0,0,0,0,2*height,0,0,0,0,-2*depth,0,
   -(l+r)*width,-(t+b)*height,-(n+f)*depth,1];
},

/**
 * Returns a 4x4 matrix representing a perspective projection,
 * given an X-axis field of view.</p>
 * This method assumes a right-handed coordinate system, such as
 * OpenGL's. To adjust the result of this method to a left-handed system,
 * such as in legacy Direct3D, reverse the sign of the 9th, 10th, 11th, and 12th
 * elements of the result (zero-based indices 8, 9, 10, and 11).
* @param {number}  fovX X-axis field of view, in degrees. Should be less
* than 180 degrees.  (The smaller
* this number, the bigger close objects appear to be. As a result, zooming out
* can be implemented by raising this value, and zooming in by lowering it.)
* @param {number}  aspectRatio The ratio of width to height of the viewport, usually
*  the scene's aspect ratio.
* @param {number} near The distance from the camera to
* the near clipping plane. Objects closer than this distance won't be
* seen.<p>This value should not be 0 or less, and should be set to the highest distance
* from the camera that the application can afford to clip out for being too
* close, for example, 0.5, 1, or higher.
* @param {number} far The distance from the camera to
* the far clipping plane. Objects beyond this distance will be too far
* to be seen.  This value should be greater than "near" and be set so that the ratio of "far" to "near"
* is as small as the application can accept.<p>
 * (Depth buffers often allow only 65536 possible values per pixel,
 * which are more spread out toward the far clipping plane than toward the
 * near plane due to the perspective projection.  The greater the ratio of "far" to
 * "near", the more the values spread out, and the more likely two objects close
 * to the far plane will have identical depth values.)
 * @return {Array<number>} The resulting 4x4 matrix.
 */
mat4perspectiveHorizontal:function(fovX,aspectRatio,near,far){
 var fov=((fovX>=0 && fovX<360) ? fovX : ((fovX%360)+(fovX<0 ? 360 : 0)))*GLMath.PiDividedBy360;
 var fovY=GLMath.Num360DividedByPi*Math.atan2(Math.tan(fov),aspectRatio);
 return GLMath.mat4perspective(fovY,aspectRatio,near,far);
},
/**
 * Returns a 4x4 matrix representing a 2D orthographic projection.<p>
 * This method assumes a right-handed coordinate system; see mat4ortho().<p>
 * This is the same as mat4ortho() with the near clipping plane
 * set to -1 and the far clipping plane set to 1.
 * @param {number} l Leftmost coordinate of the 2D view.
 * @param {number} r Rightmost coordinate of the 2D view.
 * (Note that r can be greater than l or vice versa.)
 * @param {number} b Bottommost coordinate of the 2D view.
 * @param {number} t Topmost coordinate of the 2D view.
 * (Note that t can be greater than b or vice versa.)
 * @return {Array<number>} The resulting 4x4 matrix.
 */
mat4ortho2d:function(l,r,b,t){
 return GLMath.mat4ortho2d(l,r,b,t,-1,1);
},
/**
 * Returns a 4x4 matrix representing a 2D orthographic projection,
 * retaining the view rectangle's aspect ratio.<p>
 * If the view rectangle's aspect ratio doesn't match the desired aspect
 * ratio, the view rectangle will be centered on the viewport
 * or otherwise moved and scaled so as to keep the entire view rectangle visible without stretching
 * or squishing it.<p>
 * This is the same as mat4orthoAspect() with the near clipping plane
 * set to -1 and the far clipping plane set to 1.<p>
 * This method assumes a right-handed coordinate system; see mat4ortho().<p>
 * @param {number} l Leftmost coordinate of the view rectangle.
 * @param {number} r Rightmost coordinate of the view rectangle.
 * (Note that r can be greater than l or vice versa.)
 * @param {number} b Bottommost coordinate of the view rectangle.
 * @param {number} t Topmost coordinate of the view rectangle.
 * (Note that t can be greater than b or vice versa.)
* @param {number}  aspect The ratio of width to height of the viewport, usually
*  the scene's aspect ratio.
* @return {Array<number>} The resulting 4x4 matrix.
 */
mat4ortho2dAspect:function(l,r,b,t,aspect){
 return GLMath.mat4orthoAspect(l,r,b,t,-1,1,aspect);
},
/**
 * Returns a 4x4 matrix representing an orthographic projection,
 * retaining the view rectangle's aspect ratio.<p>
 * If the view rectangle's aspect ratio doesn't match the desired aspect
 * ratio, the view rectangle will be centered on the viewport
 * or otherwise moved and scaled so as to keep the entire view rectangle visible without stretching
 * or squishing it.<p>
 * This is the same as mat4ortho() with the near clipping plane
 * set to -1 and the far clipping plane set to 1.<p>
 * This method assumes a right-handed coordinate system; see mat4ortho().
 * @param {number} l Leftmost coordinate of the view rectangle.
 * @param {number} r Rightmost coordinate of the view rectangle.
 * (Note that r can be greater than l or vice versa.)
 * @param {number} b Bottommost coordinate of the view rectangle.
 * @param {number} t Topmost coordinate of the view rectangle.
 * (Note that t can be greater than b or vice versa.)
 * @param {number} n Distance from the camera to the near clipping
 * plane.  A positive value means the plane is in front of the viewer.
 * @param {number} f Distance from the camera to the far clipping
 * plane.  A positive value means the plane is in front of the viewer.
 * (Note that n can be greater than f or vice versa.)  The absolute difference
 * between n and f should be as small as the application can accept.
* @param {number} aspect The ratio of width to height of the viewport, usually
*  the scene's aspect ratio.
* @return {Array<number>} The resulting 4x4 matrix.
 */
mat4orthoAspect:function(l,r,b,t,n,f,aspect){
 var xdist=Math.abs(r-l);
 var ydist=Math.abs(t-b);
 var boxAspect=xdist/ydist;
 aspect/=boxAspect;
 if(aspect<1){
  return GLMath.mat4ortho(l,r,b/aspect,t/aspect,n,f);
 } else {
  return GLMath.mat4ortho(l*aspect,r*aspect,b,t,n,f);
 }
},
/**
 * Returns a 4x4 matrix representing a perspective projection
 * in the form of a view frustum, or the limits in the camera's view.<p>
 * This method assumes a right-handed coordinate system, such as
 * OpenGL's. To adjust the result of this method to a left-handed system,
 * such as in legacy Direct3D, reverse the sign of the 9th, 10th, 11th, and 12th
 * elements of the result (zero-based indices 8, 9, 10, and 11).
 * @param {number} l X-coordinate of the point where the left
 * clipping plane meets the near clipping plane.
 * @param {number} r X-coordinate of the point where the right
 * clipping plane meets the near clipping plane.
 * @param {number} b Y-coordinate of the point where the bottom
 * clipping plane meets the near clipping plane.
 * @param {number} t Y-coordinate of the point where the top
 * clipping plane meets the near clipping plane.
* @param {number} near The distance from the camera to
* the near clipping plane. Objects closer than this distance won't be
* seen.<p>This value should not be 0 or less, and should be set to the highest distance
* from the camera that the application can afford to clip out for being too
* close, for example, 0.5, 1, or higher.
* @param {number} far The distance from the camera to
* the far clipping plane. Objects beyond this distance will be too far
* to be seen.  This value should be greater than "near" and be set so that the ratio of "far" to "near"
* is as small as the application can accept.<p>
 * (Depth buffers often allow only 65536 possible values per pixel,
 * which are more spread out toward the far clipping plane than toward the
 * near plane due to the perspective projection.  The greater the ratio of "far" to
 * "near", the more the values spread out, and the more likely two objects close
 * to the far plane will have identical depth values.)
 * @return {Array<number>} The resulting 4x4 matrix.
 */
mat4frustum:function(l,r,b,t,near,far){
 var dn=2*near;
 var onedx=1/(r-l);
 var onedy=1/(t-b);
 var onedz=1/(far-near);
return [
    dn*onedx,0,0,0,
    0,dn*onedy,0,0,
    (l+r)*onedx,(t+b)*onedy,-(far+near)*onedz,-1,
   0,0,-(dn*far)*onedz,0];
},
/**
 * Modifies a 4x4 matrix by multiplying it by a
 * scaling transformation.
 * @param {Array<number>} mat A 4x4 matrix.
 * @param {Array<number>|number} v3 Scale factor along the
 * X axis.  If "v3y" and "v3z" are omitted, this value can instead
 * be a 3-element array giving the scale factors along the X, Y, and
 * Z axes.
 * @param {number} v3y Scale factor along the Y axis.
 * @param {number} v3z Scale factor along the Z axis.
 * @return {Array<number>} The same parameter as "mat".
 */
mat4scaleInPlace:function(mat,v3,v3y,v3z){
  var x,y,z;
  if(typeof v3y!="undefined" && typeof v3z!="undefined"){
      x=v3;
      y=v3y;
      z=v3z;
  } else {
      x=v3[0];
      y=v3[1];
      z=v3[2];
  }
  mat[0]*=x;
  mat[1]*=x;
  mat[2]*=x;
  mat[3]*=x;
  mat[4]*=y;
  mat[5]*=y;
  mat[6]*=y;
  mat[7]*=y;
  mat[8]*=z;
  mat[9]*=z;
  mat[10]*=z;
  mat[11]*=z;
  return mat;
},
/**
 * Multiplies two 4x4 matrices.  A new matrix is returned.
 * The matrices are multiplied such that the transformations
 * they describe happen in reverse order. For example, if the first
 * matrix (input matrix) describes a translation and the second
 * matrix describes a scaling, the multiplied matrix will describe
 * the effect of scaling then translation.
 * @param {Array<number>} a The first matrix.
 * @param {Array<number>} b The second matrix.
 * @return {Array<number>} The resulting 4x4 matrix.
 */
mat4multiply:function(a,b){
  var dst=[];
 for(var i = 0; i < 16; i+= 4){
  for(var j = 0; j < 4; j++){
   dst[i+j] =
    b[i] * a[j] +
    b[i+1] * a[j+4] +
    b[i+2] * a[j+8] +
    b[i+3] * a[j+12];
    }
  }
  return dst;
},
/**
* Multiplies two quaternions, creating a composite rotation.
* The quaternions are multiplied such that the second quaternion's
* rotation happens before the first quaternion's rotation.<p>
* Multiplying two unit quaternions (each with a length of 1) will result
* in a unit quaternion.  However, for best results, you should
* normalize the quaternions every few multiplications (using
* quatNorm or quatNormInPlace), since successive
* multiplications can cause rounding errors.
 * @param {Array<number>} a The first quaternion.
 * @param {Array<number>} b The second quaternion.
 * @return {Array<number>} The resulting quaternion.
*/
quatMultiply:function(a,b){
 return [
 a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
 a[3] * b[1] + a[1] * b[3] + a[2] * b[0] - a[0] * b[2],
 a[3] * b[2] + a[2] * b[3] + a[0] * b[1] - a[1] * b[0],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]]
},
/**
 * Multiplies a 4x4 matrix by a rotation transformation,
 * and returns a new matrix.
 * @param {Array<number>} mat A 4x4 matrix to multiply.
 * @param {Array<number>|number} angle The desired angle
 * to rotate in degrees.  If "v", "vy", and "vz" are omitted, this can
 * instead be a 4-element array giving the axis
 * of rotation as the first three elements, followed by the angle
 * in degrees as the fourth element. If the axis of rotation
 * points toward the viewer, a positive value means the angle runs in
 * a counterclockwise direction for right-handed coordinate systems and
 * in a clockwise direction for left-handed systems.
 * @param {Array<number>|number} v X-component of the point lying on the axis
 * of rotation.  If "vy" and "vz" are omitted, this can
 * instead be a 3-element array giving the axis
 * of rotation in x, y, and z, respectively.
 * @param {number} vy Y-component of the point lying on the axis
 * of rotation.
 * @param {number} vz Z-component of the point lying on the axis
 * of rotation.
 * @return {Array<number>} The resulting 4x4 matrix.
 */
mat4rotate:function(mat,angle,v,vy,vz){
var v0,v1,v2,ang;
if(typeof vy!="undefined" && typeof vz!="undefined"){
 v0=v;
 v1=vy;
 v2=vz;
 ang=((angle>=0 && angle<360) ? angle : ((angle%360)+(angle<0 ? 360 : 0)))*GLMath.PiDividedBy180;
} else if(typeof v=="undefined"){
 v0=angle[0];
 v1=angle[1];
 v2=angle[2];
 ang=angle[3];
 ang=((ang>=0 && ang<360) ? ang : ((ang%360)+(ang<0 ? 360 : 0)))*GLMath.PiDividedBy180;
} else {
 v0=v[0];
 v1=v[1];
 v2=v[2];
 ang=((angle>=0 && angle<360) ? angle : ((angle%360)+(angle<0 ? 360 : 0)))*GLMath.PiDividedBy180;
}
var cost = Math.cos(ang);
var sint = (ang>=0 && ang<6.283185307179586) ? (ang<=3.141592653589793 ? Math.sqrt(1.0-cost*cost) : -Math.sqrt(1.0-cost*cost)) : Math.sin(ang);
if( 1 == v0 && 0 == v1 && 0 == v2 ) {
  return [mat[0], mat[1], mat[2], mat[3],
  cost*mat[4]+mat[8]*sint, cost*mat[5]+mat[9]*sint, cost*mat[6]+mat[10]*sint, cost*mat[7]+mat[11]*sint,
  cost*mat[8]-sint*mat[4], cost*mat[9]-sint*mat[5], cost*mat[10]-sint*mat[6], cost*mat[11]-sint*mat[7],
  mat[12], mat[13], mat[14], mat[15]]
} else if( 0 == v0 && 1 == v1 && 0 == v2 ) {
return [cost*mat[0]-sint*mat[8], cost*mat[1]-sint*mat[9], cost*mat[2]-sint*mat[10], cost*mat[3]-sint*mat[11],
  mat[4], mat[5], mat[6], mat[7],
  cost*mat[8]+mat[0]*sint, cost*mat[9]+mat[1]*sint, cost*mat[10]+mat[2]*sint, cost*mat[11]+mat[3]*sint,
  mat[12], mat[13], mat[14], mat[15]]
} else if( 0 == v0 && 0 == v1 && 1 == v2 ) {
 return [cost*mat[0]+mat[4]*sint, cost*mat[1]+mat[5]*sint, cost*mat[2]+mat[6]*sint, cost*mat[3]+mat[7]*sint,
  cost*mat[4]-sint*mat[0], cost*mat[5]-sint*mat[1], cost*mat[6]-sint*mat[2], cost*mat[7]-sint*mat[3],
  mat[8], mat[9], mat[10], mat[11], mat[12], mat[13], mat[14], mat[15]]
} else if(0==v0 && 0 == v1 && 0==v2){
 return mat.slice(0,16);
} else {
var iscale = 1.0 / Math.sqrt(v0*v0+v1*v1+v2*v2);
v0 *=iscale;
v1 *=iscale;
v2 *=iscale;
var x2 = v0 * v0;
var y2 = v1 * v1;
var z2 = v2 * v2;
var mcos = 1.0 - cost;
var xy = v0 * v1;
var xz = v0 * v2;
var yz = v1 * v2;
var xs = v0 * sint;
var ys = v1 * sint;
var zs = v2 * sint;
var v1 = mcos*x2;
var v10 = mcos*yz;
var v12 = mcos*z2;
var v3 = mcos*xy;
var v5 = mcos*xz;
var v7 = mcos*y2;
var v15 = cost+v1;
var v16 = v3+zs;
var v17 = v5-ys;
var v18 = cost+v7;
var v19 = v3-zs;
var v20 = v10+xs;
var v21 = cost+v12;
var v22 = v5+ys;
var v23 = v10-xs;
return [
mat[0]*v15+mat[4]*v16+mat[8]*v17, mat[1]*v15+mat[5]*v16+mat[9]*v17,
mat[10]*v17+mat[2]*v15+mat[6]*v16, mat[11]*v17+mat[3]*v15+mat[7]*v16,
mat[0]*v19+mat[4]*v18+mat[8]*v20, mat[1]*v19+mat[5]*v18+mat[9]*v20,
mat[10]*v20+mat[2]*v19+mat[6]*v18, mat[11]*v20+mat[3]*v19+mat[7]*v18,
mat[0]*v22+mat[4]*v23+mat[8]*v21, mat[1]*v22+mat[5]*v23+mat[9]*v21,
mat[10]*v21+mat[2]*v22+mat[6]*v23, mat[11]*v21+mat[3]*v22+mat[7]*v23,
mat[12], mat[13], mat[14], mat[15]];
}
},
/**
 * Returns a 4x4 matrix representing a rotation transformation.
 * @param {Array<number>|number} angle The desired angle
 * to rotate in degrees.  If "v", "vy", and "vz" are omitted, this can
 * instead be a 4-element array giving the axis
 * of rotation as the first three elements, followed by the angle
 * in degrees as the fourth element.  If the axis of rotation
 * points toward the viewer, a positive value means the angle runs in
 * a counterclockwise direction for right-handed coordinate systems and
 * in a clockwise direction for left-handed systems.
 * @param {Array<number>|number} v X-component of the point lying on the axis
 * of rotation.  If "vy" and "vz" are omitted, this can
 * instead be a 3-element array giving the axis
 * of rotation in x, y, and z, respectively.
 * @param {number} vy Y-component of the point lying on the axis
 * of rotation.
 * @param {number} vz Z-component of the point lying on the axis
 * of rotation.
 * @return {Array<number>} The resulting 4x4 matrix.
 */
mat4rotated:function(angle,v,vy,vz){
var v0,v1,v2,ang;
if(typeof vy!="undefined" && typeof vz!="undefined"){
 v0=v;
 v1=vy;
 v2=vz;
 ang=((angle>=0 && angle<360) ? angle : ((angle%360)+(angle<0 ? 360 : 0)))*GLMath.PiDividedBy180;
} else if(typeof v=="undefined"){
 v0=angle[0];
 v1=angle[1];
 v2=angle[2];
 ang=angle[3];
 ang=((ang>=0 && ang<360) ? ang : ((ang%360)+(ang<0 ? 360 : 0)))*GLMath.PiDividedBy180;
} else {
 v0=v[0];
 v1=v[1];
 v2=v[2];
 ang=((angle>=0 && angle<360) ? angle : ((angle%360)+(angle<0 ? 360 : 0)))*GLMath.PiDividedBy180;
}
var cost = Math.cos(ang);
var sint = (ang>=0 && ang<6.283185307179586) ? (ang<=3.141592653589793 ? Math.sqrt(1.0-cost*cost) : -Math.sqrt(1.0-cost*cost)) : Math.sin(ang);
if( 1 == v0 && 0 == v1 && 0 == v2 ) {
  return[1, 0, 0, 0, 0, cost, sint, 0, 0, -sint, cost, 0, 0, 0, 0, 1]
} else if( 0 == v0 && 1 == v1 && 0 == v2 ) {
return [cost, 0, -sint, 0, 0, 1, 0, 0, sint, 0, cost, 0, 0, 0, 0, 1]
} else if( 0 == v0 && 0 == v1 && 1 == v2 ) {
 return [cost, sint, 0, 0, -sint, cost, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
} else if(0==v0 && 0 == v1 && 0==v2){
 return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
} else {
var iscale = 1.0 / Math.sqrt(v0*v0+v1*v1+v2*v2);
v0 *=iscale;
v1 *=iscale;
v2 *=iscale;
var x2 = v0 * v0;
var y2 = v1 * v1;
var z2 = v2 * v2;
var xy = v0 * v1;
var xz = v0 * v2;
var yz = v1 * v2;
var xs = v0 * sint;
var ys = v1 * sint;
var zs = v2 * sint;
var mcos = 1.0 - cost;
var v0 = mcos*xy;
var v1 = mcos*xz;
var v2 = mcos*yz;
return [cost+mcos*x2, v0+zs, v1-ys, 0, v0-zs, cost+mcos*y2, v2+xs, 0, v1+ys,
  v2-xs, cost+mcos*z2, 0, 0, 0, 0, 1];
}
}
};

/**
* Normalizes this plane so that its normal is unit
* length (unless all the normal's components are 0).
* The plane's distance will be divided by the
* normal's length.
* @param {Array<number>} plane A four-element array
* defining the plane. The first three elements of the array
* are the X, Y, and Z components of the plane's normal vector, and
* the fourth element is the shortest distance from the plane
* to the origin, or if negative, from the origin to the plane,
* divided by the normal's length.
* @return {Array<number>} The parameter "plane".
*/
GLMath.planeNormInPlace=function(plane){
 var x=plane[0];
 var y=plane[1];
 var z=plane[2];
 var w=plane[3];
 len=Math.sqrt(x*x+y*y+z*z);
 if(len!=0){
  len=1.0/len;
  plane[0]*=len;
  plane[1]*=len;
  plane[2]*=len;
  plane[3]*=len;
 }
 return plane;
}
/**
* Normalizes this plane so that its normal is unit
* length (unless all the normal's components are 0).
* The plane's distance will be divided by the
* normal's length.  Returns a new plane.
* @param {Array<number>} plane A four-element array
* defining the plane. The first three elements of the array
* are the X, Y, and Z components of the plane's normal vector, and
* the fourth element is the shortest distance from the plane
* to the origin, or if negative, from the origin to the plane,
* divided by the normal's length.
* @return {Array<number>} A normalized version of
* the plane.
*/
GLMath.planeNorm=function(plane){
 return GLMath.planeNormInPlace(plane.slice(0,4));
}
/**
* Finds the six clipping planes of a view frustum defined
* by a 4x4 matrix. These six planes together form the
* shape of a "chopped-off" pyramid (or frustum).<p>
* In this model, the eye, or camera, is placed at the top
* of the pyramid, four planes are placed at the pyramid's
* sides, one plane (the far plane) forms its base, and a
* final plane (the near plane) is the pyramid's chopped
* off top.
* @param {Array<number>} matrix A 4x4 matrix.  This will
* usually be a projection-view matrix (projection matrix
* multiplied by view matrix).
* @return {Array<Array<number>} An array of six
* 4-element arrays representing the six clipping planes of the
* view frustum.  In order, they are the left, right, top,
* bottom, near, and far clipping planes.  All six planes
* will be normalized.
*/
GLMath.mat4toFrustumPlanes=function(matrix){
 var frustum=[[],[],[],[],[],[]]
 // Left clipping plane
 frustum[0]=GLMath.planeNormInPlace([
  matrix[3]  + matrix[0],
  matrix[7]  + matrix[4],
  matrix[11] + matrix[8],
  matrix[15] + matrix[12]
 ])
 // Right clipping plane
 frustum[1]=GLMath.planeNormInPlace([
  matrix[3]  - matrix[0],
  matrix[7]  - matrix[4],
  matrix[11] - matrix[8],
  matrix[15] - matrix[12]
 ])
 // Top clipping plane
 frustum[2]=GLMath.planeNormInPlace([
  matrix[3]  - matrix[1],
  matrix[7]  - matrix[5],
  matrix[11] - matrix[9],
  matrix[15] - matrix[13]
 ])
 // Bottom clipping plane
 frustum[3]=GLMath.planeNormInPlace([
  matrix[3]  + matrix[1],
  matrix[7]  + matrix[5],
  matrix[11] + matrix[9],
  matrix[15] + matrix[13]
 ])
 // Near clipping plane
 frustum[4]=GLMath.planeNormInPlace([
  matrix[3]  + matrix[2],
  matrix[7]  + matrix[6],
  matrix[11] + matrix[10],
  matrix[15] + matrix[14]
 ])
 // Far clipping plane
 frustum[5]=GLMath.planeNormInPlace([
  matrix[3]  - matrix[2],
  matrix[7]  - matrix[6],
  matrix[11] - matrix[10],
  matrix[15] - matrix[14]
 ])
 return frustum
}
/**
* Determines whether a sphere is at least
* partially inside a view frustum.
* @param {Array<Array<number>>} frustum An array of six
* 4-element arrays representing the six clipping planes of the
* view frustum.  In order, they are the left, right, top,
* bottom, near, and far clipping planes.
* @param {number} x X coordinate of the sphere's center
* in world space.
* @param {number} y Y coordinate of the sphere's center
* in world space.
* @param {number} z Z coordinate of the sphere's center
* in world space.
* @param {number} radius Radius of the sphere
* in world-space units.
* @return {boolean} <code>true</code> if the sphere
* is partially or totally
* inside the frustum; <code>false</code> otherwise.
*/
GLMath.frustumHasSphere=function(frustum, x, y, z, radius){
 if(radius<0)throw new Error("radius is negative");
 for(var i=0;i<6;i++){
  var plane=frustum[i];
  var dot=plane[3]+plane[0]*x+
     plane[1]*y+plane[2]*z;
  if(dot<-radius)return false;
 }
 return true;
}

/**
* Determines whether an axis-aligned bounding box
* is at least partially inside a view frustum.
* @param {Array<Array<number>>} frustum An array of six
* 4-element arrays representing the six clipping planes of the
* view frustum.  In order, they are the left, right, top,
* bottom, near, and far clipping planes.
* @param {Array<number>} box An axis-aligned bounding
* box in world space, which is an array of six values.
* The first three values are the smallest X, Y, and Z coordinates,
* and the last three values are the largest X, Y, and Z
* coordinates.
* @return {boolean} <code>true</code> if the box
* may be partially or totally
* inside the frustum; <code>false</code> if the box is
* definitely outside the frustum.
*/
GLMath.frustumHasBox=function(frustum, box){
 for(var i=0;i<6;i++){
  var plane=frustum[i];
  if( ((((plane[0] * box[0]) + plane[1] * box[1]) + plane[2] * box[2]) + plane[3])<=0.0 &&
      ((((plane[0] * box[3]) + plane[1] * box[4]) + plane[2] * box[5]) + plane[3])<=0.0 &&
      ((((plane[0] * box[0]) + plane[1] * box[4]) + plane[2] * box[2]) + plane[3])<=0.0 &&
      ((((plane[0] * box[0]) + plane[1] * box[4]) + plane[2] * box[5]) + plane[3])<=0.0 &&
      ((((plane[0] * box[0]) + plane[1] * box[1]) + plane[2] * box[5]) + plane[3])<=0.0 &&
      ((((plane[0] * box[3]) + plane[1] * box[4]) + plane[2] * box[2]) + plane[3])<=0.0 &&
      ((((plane[0] * box[3]) + plane[1] * box[1]) + plane[2] * box[2]) + plane[3])<=0.0 &&
      ((((plane[0] * box[3]) + plane[1] * box[1]) + plane[2] * box[5]) + plane[3])<=0.0){
    return false;
  }
 }
 return true;
}
/**
* Determines whether a point is
* outside or inside a view frustum.
* @param {Array<Array<number>>} frustum An array of six
* 4-element arrays representing the six clipping planes of the
* view frustum.  In order, they are the left, right, top,
* bottom, near, and far clipping planes.
* @param {number} x X coordinate of a point
* in world space.
* @param {number} y Y coordinate of a point
* in world space.
* @param {number} z Z coordinate of a point
* in world space.
* @return {boolean} true if the point is inside;
* otherwise false;
*/
GLMath.frustumHasPoint=function(frustum, x, y, z){
 for(var i=0;i<6;i++){
  var d=frustum[i][0]*x+frustum[i][1]*y+
     frustum[i][2]*z+frustum[i][3];
  if(d<=0)return false;
 }
 return true;
}
/**
* Finds the dot product of two quaternions.
* It's equal to the sum of the products of
* their components (for example, <b>a</b>'s X times <b>b</b>'s X).
 @function
 @param {Array<number>} a The first quaternion.
 @param {Array<number>} b The second quaternion.
 @return {number} */
GLMath.quatDot=GLMath.vec4dot;
/**
 * Converts a quaternion to its normalized version.
 * When a quaternion is normalized, the distance from the origin
 * to that quaternion becomes 1 (unless all its components are 0).
 * A quaternion is normalized by dividing each of its components
 * by its [length]{@link glmath.GLMath.quatLength}.
 * @function
 * @param {Array<number>} quat A quaternion.
 * @return {Array<number>} The parameter "quat".
 */
GLMath.quatNormInPlace=GLMath.vec4normInPlace;
/**
 * Converts a quaternion to its normalized version; returns a new quaternion.
 * When a quaternion is normalized, the distance from the origin
 * to that quaternion becomes 1 (unless all its components are 0).
 * A quaternion is normalized by dividing each of its components
 * by its [length]{@link glmath.GLMath.quatLength}.
 * @function
 * @param {Array<number>} quat A quaternion.
 * @return {Array<number>} The normalized quaternion.
 */
GLMath.quatNorm=GLMath.vec4norm;
/**
* Returns the distance of this quaternion from the origin.
* It's the same as the square root of the sum of the squares
* of its components.
* @function
 @param {Array<number>} quat The quaternion.
  @return {number} */
GLMath.quatLength=GLMath.vec4length;
/**
 * Multiplies each element of a quaternion by a factor
 * and stores the result in that quaternion.
 * @function
 * @param {Array<number>} a A quaternion.
 * @param {number} scalar A factor to multiply.
 * @return {Array<number>} The parameter "a".
 */
GLMath.quatScaleInPlace=GLMath.vec4scaleInPlace;
/**
 * Returns a copy of a quaternion.
* @function
 * @return {Array<number>} Return value. */
GLMath.quatCopy=GLMath.vec4copy;
/**
 Closest approximation to pi times 2, or a 360-degree turn in radians.
 @const
 @default
*/
GLMath.PiTimes2 = 6.283185307179586476925286766559;
/**
 Closest approximation to pi divided by 2, or a 90-degree turn in radians.
 @const
 @default
*/
GLMath.HalfPi = 1.5707963267948966192313216916398;
/**
 Closest approximation to pi divided by 180, or the number
 of radians in a degree. Multiply by this number to convert degrees to radians.
 @const
 @default
*/
GLMath.PiDividedBy180 = 0.01745329251994329576923690768489;
/**
 @private
@const */
GLMath.PiDividedBy360 = 0.00872664625997164788461845384244;
/**
 @private
@const */
GLMath.Num360DividedByPi = 114.59155902616464175359630962821;
/**
 Closest approximation to 180 divided by pi, or the number of
 degrees in a radian. Multiply by this number to convert radians to degrees.
 @const
 @default
*/
GLMath.Num180DividedByPi = 57.295779513082320876798154814105;
/**
* Indicates that a rotation occurs as a pitch, then yaw, then roll (each rotation around the original axes).
* @const
*/
GLMath.PitchYawRoll = 0;
/**
* Indicates that a rotation occurs as a pitch, then roll, then yaw (each rotation around the original axes).
* @const
*/
GLMath.PitchRollYaw = 1;
/**
* Indicates that a rotation occurs as a yaw, then pitch, then roll (each rotation around the original axes).
* @const
*/
GLMath.YawPitchRoll = 2;
/**
* Indicates that a rotation occurs as a yaw, then roll, then pitch (each rotation around the original axes).
* @const
*/
GLMath.YawRollPitch = 3;
/**
* Indicates that a rotation occurs as a roll, then pitch, then yaw (each rotation around the original axes).
* @const
*/
GLMath.RollPitchYaw = 4;
/**
* Indicates that a rotation occurs as a roll, then yaw, then pitch (each rotation around the original axes).
* @const
*/
GLMath.RollYawPitch = 5;
/** @deprecated Renamed to quatToTaitBryan.
 @function
*/
GLMath.quatToEuler=GLMath.quatToTaitBryan;
/** @deprecated Renamed to quatFromTaitBryan.
  @function
*/
GLMath.quatFromEuler=GLMath.quatFromTaitBryan;
 exports["GLMath"]=GLMath;
}));
;
/**
* Contains classes and methods for easing development
* of WebGL applications.
* @module glutil
* @license CC0-1.0
*/
(function (root, factory) {
  if (typeof define === "function" && define["amd"]) {
    define([ "exports" ], factory);
  } else if (typeof exports === "object") {
    factory(exports);
  } else {
    factory(root);
  }
}(this, function (exports) {
  if (exports.GLUtil) { return; }

/*
  Polyfills
*/
if(!window.requestAnimationFrame){
 window.requestAnimationFrame=window.mozRequestAnimationFrame ||
    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
 if(!window.requestAnimationFrame){
  window.requestAnimationFrame=function(func){
   window.setTimeout(function(){
    func(window.performance.now());
   },17);
  }
 }
}
if(!window.performance){
 window.performance={};
}
if(!window.performance.now){
 window.performance.now=function(){
   return (new Date().getTime()*1000)-window.performance._startTime;
 }
 window.performance._startTime=new Date().getTime()*1000;
}

/**
* Contains miscellaneous utility methods.
* @class
* @alias glutil.GLUtil
*/
var GLUtil={
/**
* This method will call the function once before returning,
* and queue requests to call that function once per frame,
* using <code>window.requestAnimationFrame</code>
* or a "polyfill" method.
* @param {Function} func The function to call.  The function
* takes one parameter, "time", which is the number of
* milliseconds since the page was loaded.
*/
"renderLoop":function(func){
  func(window.performance.now());
  var selfRefFunc=function(time){
   window.requestAnimationFrame(selfRefFunc);
   func(time);
  };
  window.requestAnimationFrame(selfRefFunc);
},
/**
* Creates an HTML canvas element, optionally appending
* it to an existing HTML element.
* @param {HTMLElement|null} parent If non-null, the parent
* element of the new HTML canvas element. The element will be
* appended as a child of this parent.
* @param {number|null} width Width of the new canvas
* element, or if null, the width a <code>canvas</code>
* element would ordinarily have
* under current CSS rules. The resulting width will be rounded up.
* This parameter can't be a negative number.
* @param {number|null} height Height of the new canvas
* element, or if null, the height a <code>canvas</code>
* element would ordinarily have
* under current CSS rules. The resulting height will be rounded up.
* This parameter can't be a negative number.
* @return {HTMLCanvasElement} The resulting canvas element.
*/
"createCanvasElement":function(parent, width, height){
 var canvas=document.createElement("canvas");
 if(parent){
  parent.appendChild(canvas);
 }
 if(width==null){
  canvas.width=Math.ceil(canvas.clientWidth)+"";
 } else if(width<0){
  throw new Error("width negative");
 } else {
  canvas.width=Math.ceil(width)+"";
 }
 if(height==null){
  canvas.height=Math.ceil(canvas.clientHeight)+"";
 } else if(height<0){
  throw new Error("height negative");
 } else {
  canvas.height=Math.ceil(height)+"";
 }
 return canvas;
},
/**
* Creates an HTML canvas element, optionally appending
* it to an existing HTML element.
* @deprecated Use {@link glutil.GLUtil.createCanvasElement} instead.
* @param {number|null} width Width of the new canvas
* element, or if null, the value <code>window.innerWidth</code>.
* The resulting width will be rounded up.
* This parameter can't be a negative number.
* @param {number|null} height Height of the new canvas
* element, or if null, the value <code>window.innerHeight</code>.
* The resulting height will be rounded up.
* This parameter can't be a negative number.
* @param {HTMLElement|null} parent If non-null, the parent
* element of the new HTML canvas element. The element will be
* appended as a child of this parent.
* @return {HTMLCanvasElement} The resulting canvas element.
*/
"createCanvas":function(width, height, parent){
 if(width==null)width=Math.ceil(window.innerWidth);
 if(height==null)height=Math.ceil(window.innerHeight);
 return GLUtil["createCanvasElement"](parent,width,height);
},
/**
* Creates a 3D rendering context from an HTML canvas element,
* falling back to a 2D context if that fails.
* @param {HTMLCanvasElement} canvasElement An HTML
* canvas element.
* @return {WebGLRenderingContext} A 3D or 2D rendering context, or null
* if an error occurred in creating the context. Returns null if "canvasElement"
* is null or not an HTML canvas element.
*/
"get3DOr2DContext":function(canvasElement){
  if(!canvasElement)return null;
  if(!canvasElement.getContext)return null;
  var context=null;
  var options={"antialias":true,"preserveDrawingBuffer":true};
  try { context=canvasElement.getContext("webgl", options);
  } catch(e) { context=null; }
  if(!context){
    try { context=canvasElement.getContext("experimental-webgl", options);
    } catch(e) { context=null; }
  }
  if(!context){
    try { context=canvasElement.getContext("moz-webgl", options);
    } catch(e) { context=null; }
  }
  if(!context){
    try { context=canvasElement.getContext("webkit-3d", options);
    } catch(e) { context=null; }
  }
  if(!context){
    try { context=canvasElement.getContext("2d", options);
    } catch(e) { context=null; }
  }
  if(GLUtil["is3DContext"](context)){
   context.getExtension("OES_element_index_uint");
  }
  return context;
},
/**
* Creates a 3D rendering context from an HTML canvas element.
* @param {HTMLCanvasElement} canvasElement An HTML
* canvas element.
* @param {function} err A function to call if an error occurs in creating
* the context.  The function takes one parameter consisting of a human-
* readable error message.  If "err" is null, window.alert() will be used instead.
* @return {WebGLRenderingContext} A 3D rendering context, or null
* if an error occurred in creating the context.  Returns null if "canvasElement"
* is null or not an HTML canvas element.
*/
"get3DContext":function(canvasElement,err){
  var c=GLUtil["get3DOr2DContext"](canvasElement);
  var errmsg=null;
  if(!c && window.WebGLShader){
    errmsg="Failed to initialize graphics support required by this page.";
  } else if(window.WebGLShader && !GLUtil["is3DContext"](c)){
    errmsg="This page requires WebGL, but it failed to start. Your computer might not support WebGL.";
  } else if(!c || !GLUtil["is3DContext"](c)){
    errmsg="This page requires a WebGL-supporting browser.";
  }
  if(errmsg){
   (err || window.alert)(errmsg);
   return null;
  }
  return c;
},
/**
* Returns whether the given object is a 3D rendering context.
* @return {boolean} Return value.*/
"is3DContext":function(context){
 return context && ("compileShader" in context);
},
/**
* Utility function that returns a promise that
 * resolves after the given list of promises finishes
 * its work.
 * @param {Array<Promise>} promises - an array containing promise objects
 *  @param {Function} [progressResolve] - a function called as each
 *   individual promise is resolved; optional
 *  @param {Function} [progressReject] - a function called as each
 *   individual promise is rejected; optional
 * @return {Promise} A promise that is never rejected and resolves when
* all of the promises are each resolved or rejected. The result
 * of the promise will be an object with
 * three keys:<ul>
 *  <li>"successes" - contains a list of results from the
 *  promises that succeeded, in the order in which those promises were listed.
 *  <li>"failures" - contains a list of results from the
 *  promises that failed, in the order in which those promises were listed.
 *  <li>"results" - contains a list of boolean values for each
 * promise, in the order in which the promises were listed.</ul>
 * True means success, and false means failure.
 */
"getPromiseResults":function(promises,
   progressResolve, progressReject){
 if(!promises || promises.length==0){
  return Promise.resolve({
    successes:[], failures:[], results:[]});
 }
 function promiseResolveFunc(pr,ret,index){
   return function(x){
    if(pr)pr(x);
    ret.successes[index]=x
    return true;
   }
 }
 function promiseRejectFunc(pr,ret,index){
   return function(x){
    if(pr)pr(x);
    ret.failures[index]=x
    return true;
   }
 }
 var ret={successes:[], failures:[], results:[]};
 var newPromises=[]
 for(var i=0;i<promises.length;i++){
  var index=i;
  newPromises.push(promises[i].then(
    promiseResolveFunc(progressResolve,ret,index),
    promiseRejectFunc(progressReject,ret,index)
  ));
 }
 return Promise.all(newPromises).then(function(results){
  // compact the successes and failures arrays
  for(var i=0;i<ret.successes.length;i++){
   if(typeof ret.successes[i]=="undefined"){
    ret.successes.splice(i,1);
    i-=1;
   }
  }
  for(var i=0;i<ret.failures.length;i++){
   if(typeof ret.failures[i]=="undefined"){
    ret.failures.splice(i,1);
    i-=1;
   }
  }
  ret.results=results;
  return Promise.resolve(ret)
 });
},
/**
* Loads a file from a URL asynchronously, using XMLHttpRequest.
* @param {string} url URL of the file to load.
* @param {string|null} responseType Expected data type of
* the file.  Can be "json", "xml", "text", or "arraybuffer".
* If null or omitted, the default is "text".
* @return {Promise} A promise that resolves when the data
* file is loaded successfully (the result will be an object with
* two properties: "url", the URL of the file, and "data", the
* file's text or data), as given below, and is rejected when an error occurs (the
* result may be an object with
* one property: "url", the URL of the file).  If the promise resolves,
* the parameter's "data" property will be:<ul>
* <li>For response type "xml", an XML document object.
* <li>For response type "arraybuffer", an ArrayBuffer object.
* <li>For response type "json", the JavaScript object decoded
* from JSON.
* <li>For any other type, a string of the file's text.</ul>
*/
"loadFileFromUrl":function(url,responseType){
 var urlstr=url;
 var respType=responseType||"text";
 return new Promise(function(resolve, reject){
   var xhr=new XMLHttpRequest();
   xhr.onreadystatechange=function(e){
    var t=e.target;
    if(t.readyState==4){
     if(t.status>=200 && t.status<300){
      if(respType=="xml")resp=t.responseXML
      else if(respType=="json")
        resp=("response" in t) ? t.response : JSON.parse(t.responseText)
      else if(respType=="arraybuffer")
        resp=t.response
      else resp=t.responseText+""
      resolve({"url": urlstr, "data": resp});
     } else {
      reject({"url": urlstr});
     }
    }
   };
   xhr.onerror=function(e){
    reject({"url": urlstr, "error": e});
   }
   xhr.open("get", url, true);
   xhr.responseType=respType
   xhr.send();
 });
}
};

/**
* Gets the position of a time value within an interval.
* This is useful for doing animation cycles lasting a certain number
* of seconds, such as rotating a shape in a 5-second cycle.
* This method may be called any number of times each frame.
* @param {object} timer An object that will hold two
* properties:<ul>
* <li>"time" - initial time value, in milliseconds.
* <li>"lastTime" - last known time value, in milliseconds.
* Will be set to the value given in "timeInMs" before returning.
* </ul>
* The object should be initialized using the idiom <code>{}</code>
* or <code>new Object()</code>.
* @param {number} timeInMs A time value, in milliseconds.
* This could be the parameter received in a
* <code>requestAnimationFrame()</code> callback method.
* </code>.
* @param {number} intervalInMs The length of the interval
* (animation cycle), in milliseconds.
* @return {number} A value in the range [0, 1), where closer
* to 0 means "timeInMs" lies
* closer to the start, and closer to 1 means closer
* to the end of the interval.  If an initial time wasn't set, returns 0.
* @example <caption>The following code sets an angle of
* rotation, in degrees, such that an object rotated with the
* angle does a 360-degree turn in 5 seconds (5000 milliseconds).
* The variable <code>time</code> is assumed to be a time
* value in milliseconds, such as the parameter of a
* <code>requestAnimationFrame()</code> callback method.
* </caption>
* var angle = 360 * GLUtil.getTimePosition(timer, time, 5000);
*/
GLUtil.getTimePosition=function(timer,timeInMs,intervalInMs){
 if(timer.time==null) {
  timer.time=timeInMs;
  timer.lastTime=timeInMs;
  return 0;
 } else {
  if(timer.lastTime==null)timer.lastTime=timeInMs;
  return (((timeInMs-timer.time)*1.0)%intervalInMs)/intervalInMs;
 }
};
/**
* Returns the number of frame-length intervals that occurred since
* the last known time, where a frame's length is 1/60 of a second.
* This method should be called only once each frame.
* @param {object} timer An object described
* in {@link glutil.GLUtil.newFrames}.
* @param {number} timeInMs A time value, in milliseconds.
* This could be the parameter received in a
* <code>requestAnimationFrame()</code> callback method.
* </code>.
* @return {number} The number of frame-length intervals relative to
* the last known time held in the parameter "timer".
* The number can include fractional frames.  If an
* initial time or last known time wasn't set, returns 0.
*/
GLUtil.newFrames=function(timer,timeInMs){
 if(timer.time==null) {
  timer.time=timeInMs;
  timer.lastTime=timeInMs;
  return 0;
 } else if(timer.lastTime==null){
  timer.lastTime=timeInMs;
  return 0;
 } else {
  var diff=(timeInMs-timer.lastTime);
  timer.lastTime=timeInMs;
  return diff*60.0/1000.0;
 }
};

(function(exports){

var hlsToRgb=function(hls) {
 "use strict";
var hueval=hls[0]*1.0;//[0-360)
 var lum=hls[1]*1.0;//[0-255]
 var sat=hls[2]*1.0;//[0-255]
 lum=(lum<0 ? 0 : (lum>255 ? 255 : lum));
 sat=(sat<0 ? 0 : (sat>255 ? 255 : sat));
 if(sat===0){
  return [lum,lum,lum];
 }
 var b=0;
 if (lum<=127.5){
  b=(lum*(255.0+sat))/255.0;
 } else {
  b=lum*sat;
  b=b/255.0;
  b=lum+sat-b;
 }
 var a=(lum*2)-b;
 var r,g,bl;
 if(hueval<0||hueval>=360)hueval=(((hueval%360)+360)%360);
 var hue=hueval+120;
 if(hue>=360)hue-=360;
 if (hue<60) r=(a+(b-a)*hue/60);
 else if (hue<180) r=b;
 else if (hue<240) r=(a+(b-a)*(240-hue)/60);
 else r=a;
 hue=hueval;
 if (hue<60) g=(a+(b-a)*hue/60);
 else if (hue<180) g=b;
 else if (hue<240) g=(a+(b-a)*(240-hue)/60);
 else g=a;
 hue=hueval-120;
 if(hue<0)hue+=360;
 if (hue<60) bl=(a+(b-a)*hue/60);
 else if (hue<180) bl=b;
 else if (hue<240) bl=(a+(b-a)*(240-hue)/60);
 else bl=a;
 return [(r<0 ? 0 : (r>255 ? 255 : r)),
   (g<0 ? 0 : (g>255 ? 255 : g)),
   (bl<0 ? 0 : (bl>255 ? 255 : bl))];
}
// Converts a representation of a color to its RGB form
// Returns a 4-item array containing the intensity of red,
// green, blue, and alpha (each from 0-255)
// Returns null if the color can't be converted
var colorToRgba=function(x){
 "use strict";
 function parsePercent(x){ var c; return ((c=parseFloat(x))<0 ? 0 : (c>100 ? 100 : c))*255/100; }
 function parseAlpha(x){ var c; return ((c=parseFloat(x))<0 ? 0 : (c>1 ? 1 : c))*255; }
 function parseByte(x){ var c; return ((c=parseInt(x,10))<0 ? 0 : (c>255 ? 255 : c)); }
 function parseHue(x){ var r1=parseFloat(e[1]);if(r1<0||r1>=360)r1=(((r1%360)+360)%360); return r1; }
var e=null;
 if(!x)return null;
 var b,c,r1,r2,r3,r4,rgb;
 if((e=(/^#([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})$/.exec(x)))!==null){
  return [parseInt(e[1],16),parseInt(e[2],16),parseInt(e[3],16),255];
 } else if((e=(/^rgb\(\s*([\+\-]?\d+(?:\.\d+)?%)\s*,\s*([\+\-]?\d+(?:\.\d+)?%)\s*,\s*([\+\-]?\d+(?:\.\d+)?%)\s*\)$/.exec(x)))!==null){
  return [parsePercent(e[1]),parsePercent(e[2]),parsePercent(e[3]),255];
 } else if((e=(/^rgb\(\s*([\+\-]?\d+)\s*,\s*([\+\-]?\d+)\s*,\s*([\+\-]?\d+)\s*\)$/.exec(x)))!==null){
  return [parseByte(e[1]),parseByte(e[2]),parseByte(e[3]),255];
 } else if((e=(/^rgba\(\s*([\+\-]?\d+(?:\.\d+)?%)\s*,\s*([\+\-]?\d+(?:\.\d+)?%)\s*,\s*([\+\-]?\d+(?:\.\d+)?%)\s*,\s*([\+\-]?\d+(?:\.\d+)?)\s*\)$/.exec(x)))!==null){
  return [parsePercent(e[1]),parsePercent(e[2]),parsePercent(e[3]),parseAlpha(e[4])];
 } else if((e=(/^rgba\(\s*([\+\-]?\d+)\s*,\s*([\+\-]?\d+)\s*,\s*([\+\-]?\d+)\s*,\s*([\+\-]?\d+(?:\.\d+)?)\s*\)$/.exec(x)))!==null){
  return [parseByte(e[1]),parseByte(e[2]),parseByte(e[3]),parseAlpha(e[4])];
 } else if((e=(/^#([A-Fa-f0-9]{1})([A-Fa-f0-9]{1})([A-Fa-f0-9]{1})$/.exec(x)))!==null){
  var a=parseInt(e[1],16); b=parseInt(e[2],16); c=parseInt(e[3],16);
  return [a+(a<<4),b+(b<<4),c+(c<<4),255];
 } else if((e=(/^hsl\(\s*([\+\-]?\d+(?:\.\d+)?)\s*,\s*([\+\-]?\d+(?:\.\d+)?)%\s*,\s*([\+\-]?\d+(?:\.\d+)?)%\s*\)$/.exec(x)))!==null){
  rgb=hlsToRgb([parseHue(e[1]),parsePercent(e[3]),parsePercent(e[2])]);
  return [rgb[0],rgb[1],rgb[2],255];
 } else if((e=(/^hsla\(\s*([\+\-]?\d+(?:\.\d+)?)\s*,\s*([\+\-]?\d+(?:\.\d+)?)%\s*,\s*([\+\-]?\d+(?:\.\d+)?)%\s*,\s*([\+\-]?\d+(?:\.\d+)?)\s*\)$/.exec(x)))!==null){
  rgb=hlsToRgb([parseHue(e[1]),parsePercent(e[3]),parsePercent(e[2])]);
  return [rgb[0],rgb[1],rgb[2],parseAlpha(e[4])];
 } else {
  setUpNamedColors();
  x=x.toLowerCase();
  if(x.indexOf("grey")>=0)x=x.replace("grey","gray");// support "grey" variants
  var ret=namedColors[x];
  if(typeof ret==="string")return colorToRgba(ret);
  if(x==="transparent")return [0,0,0,0];
  return null;
 }
}
/**
* Creates a 4-element array representing a color.  Each element
* can range from 0 to 1 and specifies the red, green, blue or alpha
* component, respectively.
* This method also converts HTML and CSS colors to 4-element RGB
* colors.  The following lists the kinds of colors accepted:
* <ul>
* <li>HTML colors with the syntax <code>#RRGGBB</code>, where
* RR is the hexadecimal form of the red component (00-FF), GG
* is the hexadecimal green component, and BB is the hexadecimal
* blue component.  Example: #88DFE0.
* <li>HTML colors with the syntax <code>#RGB</code>, where
* R is the hexadecimal form of the red component (0-F), G
* is the hexadecimal green component, and B is the hexadecimal
* blue component.  Example: #8DE.
* <li>CSS colors with the syntax <code>rgb(red, green, blue)</code> or
* <code>rgba(red, green, blue, alpha)</code> where
* <code>red</code>, <code>green</code>, and <code>blue</code>
* are the red, green, and blue components, respectively, either as a
* number (0-255) or as a percent, and <code>alpha</code> is
* a number from 0-1 specifying the alpha component.
* Examples: <code>rgb(255,0,0)</code>,
* <code>rgb(100%,50%,0%)</code>, <code>rgba(20,255,255,0.5)</code>.
* <li>CSS colors with the syntax <code>hsl(hue, sat, light)</code> or
* <code>hsla(hue, sat, light, alpha)</code> where
* <code>hue</code> is the hue component in degrees (0-360),
* <code>sat</code> and <code>light</code>
* are the saturation and lightness components, respectively, as percents,
* and <code>alpha</code> is
* a number from 0-1 specifying the alpha component.
* Examples: <code>rgb(255,0,0)</code>,
* <code>hsl(200,50%,50%)</code>, <code>hsla(20,80%,90%,0.5)</code>.
* <li>CSS colors such as <code>red</code>, <code>green</code>,
* <code>white</code>, <code>lemonchiffon</code>, <code>chocolate</code>,
* and so on, including the newly added <code>rebeccapurple</code>.
* <li>The value <code>transparent</code>, meaning transparent black.
* </ul>
* For more information:
* [Colors in HTML and How to Enter Them]{@link http://upokecenter.dreamhosters.com/articles/miscellaneous/how-to-enter-colors/}.
* @alias glutil.GLUtil.toGLColor
* @param {Array<number>|number|string} r Array of three or
* four color components; or the red color component (0-1); or a string
* specifying an [HTML or CSS color]{@link glutil.GLUtil.toGLColor}.  Returns (0,0,0,0) if this value is null.
* @param {number} g Green color component (0-1).
* May be null or omitted if a string or array is given as the "r" parameter.
* @param {number} b Blue color component (0-1).
* May be null or omitted if a string or array is given as the "r" parameter.
* @param {number} a Alpha color component (0-1).
* May be null or omitted if a string or array is given as the "r" parameter.
* @return the color as a 4-element array; if the color is
* invalid, returns [0,0,0,0] (transparent black).
*/
exports["toGLColor"]=function(r,g,b,a){
 if(r==null)return [0,0,0,0];
 if(typeof r=="string"){
   var rgba=colorToRgba(r) || [0,0,0,0];
   var mul=1.0/255;
   rgba[0]*=mul;
   rgba[1]*=mul;
   rgba[2]*=mul;
   rgba[3]*=mul;
   return rgba;
 }
 if(typeof r=="number" &&
     typeof g=="number" && typeof b=="number"){
   return [r,g,b,(typeof a!="number") ? 1.0 : a];
 } else if(r.constructor==Array){
   return [r[0]||0,r[1]||0,r[2]||0,
     (typeof r[3]!="number") ? 1.0 : r[3]];
 } else {
   return r || [0,0,0,0];
 }
}

var namedColors=null;
var setUpNamedColors=function(){
  "use strict";
if(!namedColors){
    var nc=("aliceblue,f0f8ff,antiquewhite,faebd7,aqua,00ffff,aquamarine,7fffd4,azure,f0ffff,beige,f5f5dc,bisque,ffe4c4,black,000000,blanchedalmond,ffebcd,blue,0000ff,"+
"blueviolet,8a2be2,brown,a52a2a,burlywood,deb887,cadetblue,5f9ea0,chartreuse,7fff00,chocolate,d2691e,coral,ff7f50,cornflowerblue,6495ed,cornsilk,fff8dc,"+
"crimson,dc143c,cyan,00ffff,darkblue,00008b,darkcyan,008b8b,darkgoldenrod,b8860b,darkgray,a9a9a9,darkgreen,006400,darkkhaki,bdb76b,darkmagenta,8b008b,"+
"darkolivegreen,556b2f,darkorange,ff8c00,darkorchid,9932cc,darkred,8b0000,darksalmon,e9967a,darkseagreen,8fbc8f,darkslateblue,483d8b,darkslategray,2f4f4f,"+
"darkturquoise,00ced1,darkviolet,9400d3,deeppink,ff1493,deepskyblue,00bfff,dimgray,696969,dodgerblue,1e90ff,firebrick,b22222,floralwhite,fffaf0,forestgreen,"+
"228b22,fuchsia,ff00ff,gainsboro,dcdcdc,ghostwhite,f8f8ff,gold,ffd700,goldenrod,daa520,gray,808080,green,008000,greenyellow,adff2f,honeydew,f0fff0,hotpink,"+
"ff69b4,indianred,cd5c5c,indigo,4b0082,ivory,fffff0,khaki,f0e68c,lavender,e6e6fa,lavenderblush,fff0f5,lawngreen,7cfc00,lemonchiffon,fffacd,lightblue,add8e6,"+
"lightcoral,f08080,lightcyan,e0ffff,lightgoldenrodyellow,fafad2,lightgray,d3d3d3,lightgreen,90ee90,lightpink,ffb6c1,lightsalmon,ffa07a,lightseagreen,20b2aa,"+
"lightskyblue,87cefa,lightslategray,778899,lightsteelblue,b0c4de,lightyellow,ffffe0,lime,00ff00,limegreen,32cd32,linen,faf0e6,magenta,ff00ff,maroon,800000,"+
"mediumaquamarine,66cdaa,mediumblue,0000cd,mediumorchid,ba55d3,mediumpurple,9370d8,mediumseagreen,3cb371,mediumslateblue,7b68ee,mediumspringgreen,"+
"00fa9a,mediumturquoise,48d1cc,mediumvioletred,c71585,midnightblue,191970,mintcream,f5fffa,mistyrose,ffe4e1,moccasin,ffe4b5,navajowhite,ffdead,navy,"+
"000080,oldlace,fdf5e6,olive,808000,olivedrab,6b8e23,orange,ffa500,orangered,ff4500,orchid,da70d6,palegoldenrod,eee8aa,palegreen,98fb98,paleturquoise,"+
"afeeee,palevioletred,d87093,papayawhip,ffefd5,peachpuff,ffdab9,peru,cd853f,pink,ffc0cb,plum,dda0dd,powderblue,b0e0e6,purple,800080,rebeccapurple,663399,red,ff0000,rosybrown,"+
"bc8f8f,royalblue,4169e1,saddlebrown,8b4513,salmon,fa8072,sandybrown,f4a460,seagreen,2e8b57,seashell,fff5ee,sienna,a0522d,silver,c0c0c0,skyblue,87ceeb,"+
"slateblue,6a5acd,slategray,708090,snow,fffafa,springgreen,00ff7f,steelblue,4682b4,tan,d2b48c,teal,008080,thistle,d8bfd8,tomato,ff6347,turquoise,40e0d0,violet,"+
"ee82ee,wheat,f5deb3,white,ffffff,whitesmoke,f5f5f5,yellow,ffff00,yellowgreen,9acd32").split(",");
    namedColors={};
    for(var i=0;i<nc.length;i+=2){
     namedColors[nc[i]]="#"+nc[i+1];
    }
  }
};
})(GLUtil);

/** @private */
GLUtil._toContext=function(context){
 return (context && context.getContext) ? context.getContext() : context;
}
/** @private */
GLUtil._isPowerOfTwo=function(a){
   if(Math.floor(a)!=a || a<=0)return false;
   while(a>1 && (a&1)==0){
    a>>=1;
   }
   return (a==1);
}
///////////////////////

/**
* Specifies parameters for light sources.
* @class
* @alias glutil.LightSource
*/
function LightSource(position, ambient, diffuse, specular) {
 this.ambient=ambient || [0,0,0,1.0]
 /**
 * Light position.  An array of four numbers.
* If the fourth element is 0, this is a directional light, shining an infinitely
* long light at the direction given by the first three elements (the X, Y, and Z
* coordinates respectively).  If the fourth element is 1, this is a point
* light located at the position, in world space, given by the first three elements (the X, Y, and Z
* coordinates respectively).
*/
 this.position=position ? [position[0],position[1],position[2],1.0] :
   [0, 0, 1, 0];
 /**
 * A 3-element vector giving the color of the light when it causes a diffuse
 * reflection, in the red, green,
 * and blue components respectively.  Each component ranges from 0 to 1.
 * A diffuse reflection is a reflection that scatters evenly, in every direction.
 * The default is (1,1,1), or white.
 */
 this.diffuse=diffuse||[1,1,1,1];
 /**
 * A 3-element vector giving the color of the light when it causes a specular
 * reflection, in the red, green,
 * and blue components respectively.  Each component ranges from 0 to 1.
 * A specular reflection is a reflection in the same angle as the light reaches
 * an object, like a mirror.  Specular reflections can cause shiny
 * highlights depending on the viewing angle.
 * The default is (1,1,1), or white.
 */
 this.specular=specular||[1,1,1];
};
/**
* Sets parameters for this material object.
* @param {object} params An object whose keys have
* the possibilities given below, and whose values are those
* allowed for each key.<ul>
* <li><code>position</code> - Light position.  An array of four numbers,
* where the first three numbers are the X, Y, and Z components and the fourth
* number is the W component.<ul>
* <li>If W is 0, then X, Y, and Z specify a 3-element vector giving the direction
* of the light; the light will shine everywhere in the given direction.
* <li>If W is 1, then X, Y, and Z specify the position of the light in world
* space; the light will shine brightest, and in every direction, at the given position.</ul>
* <li><code>ambient</code> - Not used in the default shader program.
* <li><code>diffuse</code> - Diffuse color.
* <li><code>specular</code> - Specular highlight color.
* </ul>
* If a value is null or undefined, it is ignored.
* @return {glutil.Material} This object.
*/
LightSource.prototype.setParams=function(params){
 if(params["ambient"]!=null){
  this.ambient=GLUtil["toGLColor"](params.ambient);
 }
 if(params["position"]!=null){
  var position=params["position"]
  this.position=[position[0],position[1],position[2],
    (position[3]==null) ? 0.0 : position[3]];
 }
 if(params["specular"]!=null){
  this.specular=GLUtil["toGLColor"](params.specular);
 }
 if(params["diffuse"]!=null){
  this.diffuse=GLUtil["toGLColor"](params.diffuse);
 }
 return this;
}

/**
* A collection of light sources.  It stores the scene's
* ambient color as well as data on one or more light sources.
* When constructed, the default lighting will have a default
* ambient color and one directional light source.
* @class
* @alias glutil.Lights
*/
function Lights(){
 this.lights=[new LightSource()];
 /**
 *  Ambient color for the scene.  This is the color of the light
 *  that shines on every part of every object equally and in
 *  every direction. In the absence of
 *  other lighting effects, all objects will be given this color.<p>
 *  <small>Ambient light is a simplified simulation of the
 * real-world effect of light bouncing back and forth between
 * many different objects in an area.  One example of this
 * phenomenon is sunlight reaching an indoor room without
 * directly hitting it, such that the sunlight reflects off the walls
 * and so illuminates most of the room pretty much uniformly.
 * Ambient lights simulate this phenomenon.</small>
 *  @default
 */
 this.sceneAmbient=[0.2,0.2,0.2];
}
/** Maximum number of lights supported
   by the default shader program.
   @const
   */
Lights.MAX_LIGHTS = 3;
/** @private */
Lights._createNewLight=function(index){
 var ret=new LightSource();
 if(index!=0){
  ret.diffuse=[0,0,0,0];
  ret.specular=[0,0,0];
 }
 return ret;
}
/**
 * Gets the number of lights defined in this object.
 * @return {number} Return value. */
Lights.prototype.getCount=function(){
 return this.lights.length;
}

/**
 * Gets information about the light source at the given index.
 * @param {number} index Zero-based index of the light to set.  The first
 * light has index 0, the second has index 1, and so on.
 * If the light doesn't exist at that index, it will be created.
 * @return {LightSource} The corresponding light source object.
 */
Lights.prototype.getLight=function(index){
 var oldLength=this.lights.length;
 if(!this.lights[index])this.lights[index]=Lights._createNewLight(index);
 if(this.lights.length-oldLength>=2){
  // Ensure existence of lights that come between the new
  // light and the last light
  for(var i=oldLength;i<this.lights.length;i++){
   if(!this.lights[i]){
    this.lights[i]=Lights._createNewLight(i);
   }
  }
 }
 return this.lights[index];
}
/**
 * Not documented yet.
 * @param {number} index Zero-based index of the light to set.  The first
 * light has index 0, the second has index 1, and so on.
 * If the light doesn't exist at that index, it will be created.
 * @param {object} params An object as described in {@link glutil.LightSource.setParams}.
 * @return {Lights} This object.
 */
Lights.prototype.setParams=function(index,params){
 this.getLight(index).setParams(params);
 return this;
}

/**
 * Sets a directional light.
 * @param {number} index Zero-based index of the light to set.  The first
 * light has index 0, the second has index 1, and so on.
 * If the light doesn't exist at that index, it will be created.
 * @param {Array<number>} direction A 3-element vector giving the direction of the light, along the X, Y, and Z
 * axes, respectively.
 * @return {Lights} This object.
 */
Lights.prototype.setDirectionalLight=function(index,direction){
 return this.setParams(index,{"position":[direction[0],direction[1],direction[2],0]});
}
/**
 * Sets a point light.
 * @param {number} index Zero-based index of the light to set.  The first
 * light has index 0, the second has index 1, and so on.
 * If the light doesn't exist at that index, it will be created.
 * @param {Array<number>} position A 3-element vector giving the X, Y, and Z
 * coordinates, respectively, of the light, in world coordinates.
 * @return {Lights} This object.
 */
Lights.prototype.setPointLight=function(index,position){
 return this.setParams(index,{"position":[position[0],position[1],position[2],1]});
}

/**
* Specifies parameters for geometry materials, which describe the appearance of a
* 3D object. This includes how an object reflects or absorbs light, as well
* as well as a texture image to apply on that object's surface.<p>
* The full structure is only used if the shader program supports lighting, as the
* default shader program does.  If [Scene3D.disableLighting()]{@link glutil.Scene3D#disableLighting} is called,
* disabling lighting calculations in the default shader, only the "diffuse" and "texture"
* properties of this object are used.
* @class
* @alias glutil.Material
* @param {Array<number>} ambient Ambient reflection.
* Can be an array of three numbers,
* ranging from 0 to 1 and giving the red, green, and blue components, respectively,
* or can be a string representing an [HTML or CSS color]{@link glutil.GLUtil.toGLColor}.
* May be null or omitted; default is (0.2, 0.2, 0.2).
* @param {Array<number>} diffuse Diffuse reflection.  A color with the same format
* as for "ambient". May be null or omitted; default is (0.8, 0.8, 0.8).
* @param {Array<number>} specular Specular highlight reflection.
* A color with the same format as for "ambient".
* May be null or omitted; default is (0,0,0), meaning no specular highlights.
* @param {Array<number>} shininess Specular highlight exponent of this material.
* Ranges from 0 through 128. May be null or omitted; default is 0.
* @param {Array<number>} emission Additive color emitted by an object.
* A color with the same format as for "ambient", except the array's numbers
* range from -1 to 1.
* May be null or omitted; default is (0,0,0).
*/
function Material(ambient, diffuse, specular,shininess,emission) {
 //console.log([ambient,diffuse,specular,shininess,emission]+"")
 if(ambient!=null)ambient=GLUtil["toGLColor"](ambient)
 if(diffuse!=null)diffuse=GLUtil["toGLColor"](diffuse)
 if(specular!=null)specular=GLUtil["toGLColor"](specular)
 if(emission!=null)emission=GLUtil["toGLColor"](emission)
 /** Specular highlight exponent of this material.
* The greater the number, the more concentrated the specular
* highlights are.  The lower the number, the more extended the highlights are.
* Ranges from 0 through 128.
*/
 this.shininess=(shininess==null) ? 0 : Math.min(Math.max(0,shininess),128);
 /** Ambient reflection of this material.<p>
 * Ambient reflection indicates how much an object reflects
 * ambient colors, those that color pixels the same way regardless
 * of direction or distance.
 * Because every part of an object will be shaded the same way by ambient
 * colors, an object with just ambient reflection will not look much like a 3D object.<p>
 * (Ambient reflection simulates the effect of light being reflected multiple times
 * from the same surface.)</p>
 * This value is a 3-element array giving the red, green, and blue
 * components of the ambient reflection; the final ambient color depends
 * on the ambient color of the scene.
 * (0,0,0) means no ambient reflection,
 * and (1,1,1) means total ambient reflection.<p>
 * Setting ambient and diffuse reflection to the same value usually defines an object's
 * color.<p>
 * In the default shader program, if a mesh defines its own colors, those
 * colors are used for ambient reflection rather than this property.
 */
 this.ambient=ambient ? ambient.slice(0,3) : [0.2,0.2,0.2];
 /**
 * Diffuse reflection of this material. Diffuse reflection is the color that a material
 * reflects equally in all directions. Because different parts of an object are shaded
 * differently depending
 * on how directly they face diffuse lights, diffuse reflection can contribute
 * much of the 3D effect of that object.<p>
 * This value is a 4-element array giving the red, green, blue, and
 * alpha components of the diffuse reflection; the final diffuse color depends
 * on the reflected colors of lights that shine on the material.
 * (0,0,0,1) means no diffuse reflection,
 * and (1,1,1,1) means total diffuse reflection.<p>
 * Setting ambient and diffuse reflection to the same value usually defines an object's
 * color.<p>
 * In the default shader program, if a mesh defines its own colors, those
 * colors are used for diffuse reflection rather than this property.<p>
 * This value can have an optional fourth element giving the alpha component
 * (0-1).  If this element is omitted, the default is 1.<p>
 */
 this.diffuse=diffuse ? diffuse.slice(0,diffuse.length) : [0.8,0.8,0.8,1.0];
 /** Specular highlight reflection of this material.
 * Specular reflection is a reflection in the same angle as
 * the light reaches the material, similar to a mirror.  As a result, depending
 * on the viewing angle, specular reflection can give off
 * shiny highlights on the material.<p>
 * This value is a 3-element array giving the red, green, and blue
 * components of the specular reflection; the final specular color depends
 * on the specular color of lights that shine on the material.
 * (0,0,0) means no specular reflection,
 * and (1,1,1) means total specular reflection.<p>
*/
 this.specular=specular ? specular.slice(0,3) : [0,0,0];
 /**
* Additive color emitted by objects with this material.
* Used for objects that glow on their own, among other things.
* Each part of the object will be affected by the additive color the
* same way regardless of lighting (this property won't be used in the
* default shader if [Scene3D.disableLighting()]{@link glutil.Scene3D#disableLighting}
* is called, disabling lighting calculations).<p>
* This value is a 3-element array giving the red, green, and blue
* components.
* For each of the three color components, positive values add to that component,
* while negative values subtract from it. (0,0,0) means no additive color.
 */
 this.emission=emission ? emission.slice(0,3) : [0,0,0];
/**
* Texture map for this material.
*/
 this.texture=null;
/**
* Specular map texture, where each pixel is an additional factor to multiply the specular color by, for
* each part of the object's surface (note that the material must have a specular color of other
* than the default
* black for this to have an effect).  See {@link glutil.Material#specular}.
*/
 this.specularMap=null;
 /**
 * Normal map (bump map) texture.  Normal maps are used either to add
 * a sense of roughness to an otherwise flat surface or to give an object a highly-detailed
 * appearance with fewer polygons.<p>
 * In a normal map texture, each pixel is a vector in which
 each component (which usually ranges from 0-255 in most image formats) is scaled to
 the range [-1, 1], where:
<ul>
<li>The pixel's red component is the vector's X component.
<li>The pixel's green component is the vector's Y component.
<li>The pixel's blue component is the vector's Z component.
<li>An unchanged normal vector will have the value (0, 0, 1), which is usually
the value (127, 127, 255) in most image formats.
<li>The vector is normalized so its length is about equal to1.
<li>The vector is expressed in tangent space, where the Z axis points outward
and away from the surface's edges.
</ul>
Each pixel indicates a tilt from the vector (0, 0, 1), or positive Z axis,
to the vector given in that pixel.  This tilt adjusts the normals used for the
purpose of calculating lighting effects at that part of the surface.
A strong tilt indicates strong relief detail at that point.
*<p>
* For normal mapping to work, an object's mesh must include normals,
* tangents, bitangents, and texture coordinates, though if a <code>Mesh</code>
* object only has normals and texture coordinates, the <code>recalcTangents()</code>
* method can calculate the tangents and bitangents appropriate for normal mapping.
*/
 this.normalMap=null;
}
/**
* Clones this object's parameters to a new Material
* object and returns that object. The material's texture
* maps, if any, won't be cloned, but rather, a reference
* to the same object will be used.
* @return {glutil.Material} A copy of this object.
*/
Material.prototype.copy=function(){
 return new Material(
  this.ambient.slice(0,this.ambient.length),
  this.diffuse.slice(0,this.diffuse.length),
  this.specular.slice(0,this.specular.length),
  this.shininess,
  this.emission.slice(0,this.emission.length)
 ).setParams({
   "texture":this.texture,
   "specularMap":this.specularMap,
   "normalMap":this.normalMap
 });
}
/**
* Sets parameters for this material object.
* @param {object} params An object whose keys have
* the possibilities given below, and whose values are those
* allowed for each key.<ul>
* <li><code>ambient</code> - Ambient reflection (see {@link glutil.Material} constructor).
* <li><code>diffuse</code> - Diffuse reflection (see {@link glutil.Material} constructor).
* <li><code>specular</code> - Specular reflection (see {@link glutil.Material} constructor).
* <li><code>shininess</code> - Specular reflection exponent (see {@link glutil.Material} constructor).
* <li><code>emission</code> - Additive color (see {@link glutil.Material} constructor).
* <li><code>texture</code> - {@link glutil.Texture} object, or a string with the URL of the texture
* to use.
* <li><code>specularMap</code> - {@link glutil.Texture} object, or a string with the URL, of a specular
* map texture (see {@link glutil.Material#specularMap}).
* <li><code>normalMap</code> - {@link glutil.Texture} object, or a string with the URL, of a normal
* map (bump map) texture (see {@link glutil.Material#normalMap}).
* </ul>
* If a value is null or undefined, it is ignored.
* @return {glutil.Material} This object.
*/
Material.prototype.setParams=function(params){
 if(params["ambient"]!=null){
  this.ambient=GLUtil["toGLColor"](params.ambient);
 }
 if(params["diffuse"]!=null){
  this.diffuse=GLUtil["toGLColor"](params.diffuse);
 }
 if(params["specular"]!=null){
  this.specular=GLUtil["toGLColor"](params.specular);
 }
 if(params["emission"]!=null){
  this.emission=GLUtil["toGLColor"](params.emission);
 }
 if(params["shininess"]!=null){
  this.shininess=params.shininess;
 }
 if(params["texture"]!=null){
   var param=params["texture"]
   if(typeof param=="string"){
    this.texture=new Texture(param)
   } else {
    this.texture=param
   }
 }
 if(params["specularMap"]!=null){
   var param=params["specularMap"]
   if(typeof param=="string"){
    this.specularMap=new Texture(param)
   } else {
    this.specularMap=param
   }
 }
 if(params["normalMap"]!=null){
   var param=params["normalMap"]
   if(typeof param=="string"){
    this.normalMap=new Texture(param)
   } else {
    this.normalMap=param
   }
 }
 return this;
}
/** Convenience method that returns a Material
 * object from an RGBA color.
* @param {Array<number>|number|string} r Array of three or
* four color components; or the red color component (0-1); or a string
* specifying an [HTML or CSS color]{@link glutil.GLUtil.toGLColor}.
* @param {number} g Green color component (0-1).
* May be null or omitted if a string or array is given as the "r" parameter.
* @param {number} b Blue color component (0-1).
* May be null or omitted if a string or array is given as the "r" parameter.
* @param {number} a Alpha color component (0-1).
* May be null or omitted if a string or array is given as the "r" parameter.
* @return {glutil.Material} The resulting material object.
 */
Material.fromColor=function(r,g,b,a){
 var color=GLUtil["toGLColor"](r,g,b,a);
 return new Material(color,color);
}

/** Convenience method that returns a Material
 * object from a texture to apply to a 3D object's surface.
* @param {glutil.Texture|string} texture {@link glutil.Texture} object, or a string with the
* URL of the texture data.  In the case of a string the texture will be loaded via
*  the JavaScript DOM's Image class.  However, this constructor
*  will not load that image yet.
* @return {glutil.Material} The resulting material object.
 */
Material.fromTexture=function(texture){
 return new Material().setParams({"texture":texture});
}

////////////////////

/**
*  Specifies a texture, which can serve as image data applied to
*  the surface of a shape, or even a 2-dimensional array of pixels
*  used for some other purpose, such as a depth map, a height map,
*  a bump map, a reflection map, and so on.<p>
* By default, texture coordinates go from (0,0) at the lower left corner
* to (1,1) at the upper right corner.
* @class
* @alias glutil.Texture
* @param {string} name URL of the texture data.  It will be loaded via
*  the JavaScript DOM's Image class.  However, this constructor
*  will not load that image yet.
*/
var Texture=function(name){
 this.image=null;
 this.loadStatus=0;
 this.loadedTexture=null;
 this.name=name;
 this.width=0;
 this.clamp=false;
 this.height=0;
}

/**
* Sets the wrapping behavior of texture coordinates that
* fall out of range when using this texture.  This setting
* will only have an effect on textures whose width and height
* are both powers of two.  For other textures, this setting
* is ignored and out-of-range texture coordinates are
* always clamped.
* @param {boolean} clamp If true, the image's texture
* coordinates will be clamped to the range [0, 1].  If false,
* the image's texture coordinates' fractional parts will
* be used as the coordinates (causing wraparound).
* The default is false.
* @return {glutil.Texture} This object.
*/
Texture.prototype.setClamp=function(clamp){
 this.clamp=clamp;
 return this;
}

/**
*  Loads a texture by its URL.
* @param {string} name URL of the texture data.  Images with a TGA
* extension that use the RGBA or grayscale format are supported.
* Images supported by the browser will be loaded via
* the JavaScript DOM's Image class.
* @param {Object} [textureCache] An object whose keys
* are the names of textures already loaded.  This will help avoid loading
* the same texture more than once.  This parameter is optional
* and may be omitted.
* @return {Promise} A promise that resolves when the texture
* is fully loaded.  If it resolves, the result will be a Texture object.
*/
Texture.loadTexture=function(name, textureCache){
 // Get cached texture
 if(textureCache && textureCache[name]){
   return Promise.resolve(textureCache[name]);
 }
 var texImage=new Texture(name);
 if(textureCache){
  textureCache[name]=texImage;
 }
 // Load new texture and cache it
 return texImage.loadImage().then(
  function(result){
   return result;
  },
  function(name){
    return Promise.reject(name.name);
  });
}

/**
*  Creates a texture from a byte array specifying the texture data.
* @param {Uint8Array} array A byte array containing the texture data,
* with the pixels arranged in left-to-right rows from top to bottom.
* Each pixel takes 4 bytes, where the bytes are the red, green, blue,
* and alpha components, in that order.
* @param {Uint8Array} width Width, in pixels, of the texture.
* @param {Uint8Array} height Height, in pixels, of the texture.
* @return {glutil.Texture} The new Texture object.
*/
Texture.fromUint8Array=function(array, width, height){
 if(width<0)throw new Error("width less than 0")
 if(height<0)throw new Error("height less than 0")
 if(array.length<width*height*4)throw new Error("array too short for texture")
 var texImage=new Texture("")
 texImage.image=array;
 texImage.width=Math.ceil(width);
 texImage.height=Math.ceil(height);
 texImage.loadStatus=2;
 return texImage;
}

/** @private */
Texture.loadTga=function(name){
 var tex=this;
 return GLUtil.loadFileFromUrl(name,"arraybuffer")
 .then(function(buf){
   var view=new DataView(buf.data);
   var id=view.getUint8(0);
   var cmaptype=view.getUint8(1);
   var imgtype=view.getUint8(2);
   if(imgtype!=2 && imgtype!=3){
    return Promise.reject(new Error("unsupported image type"));
   }
   var xorg=view.getUint16(8,true);
   var yorg=view.getUint16(10,true);
   if(xorg!=0 || yorg!=0){
    return Promise.reject(new Error("unsupported origins"));
   }
   var width=view.getUint16(12,true);
   var height=view.getUint16(14,true);
   if(width==0 || height==0){
    return Promise.reject(new Error("invalid width or height"));
   }
   var pixelsize=view.getUint8(16);
   var flags=view.getUint8(16);
   if((pixelsize!=32 || imgtype!=2) &&
        (pixelsize!=8 || imgtype!=3)){
    return Promise.reject(new Error("unsupported pixelsize"));
   }
   var size=width*height;
   var arr=new Uint8Array(size*4);
   var offset=18;
   var io=0;
   if(pixelsize==32 && imgtype==2){
    for(var i=0,io=0;i<size;i++,io+=4){
     arr[io+2]=view.getUint8(offset)
     arr[io+1]=view.getUint8(offset+1)
     arr[io]=view.getUint8(offset+2)
     arr[io+3]=view.getUint8(offset+3)
     offset+=4;
    }
   } else if(pixelsize==8 && imgtype==3){
    for(var i=0,io=0;i<size;i++,io+=4){
     var col=view.getUint8(offset);
     arr[io]=col
     arr[io+1]=col
     arr[io+2]=col
     arr[io+3]=0xFF
     offset++;
    }
   }
   return {"width":width,"height":height,"image":arr}
  })
}

/** @private */
Texture.prototype.loadImage=function(){
 if(this.image!==null){
  // already loaded
  return Promise.resolve(this);
 }
 var thisImage=this;
 var thisName=this.name;
 thisImage.loadStatus=1;
 if((/\.tga$/i).test(thisName)){
  return Texture.loadTga(thisName).then(function(e){
   thisImage.image=e.image;
   thisImage.width=e.width;
   thisImage.height=e.height;
   thisImage.loadStatus=2;
   return thisImage;
  },function(e){
   thisImage.loadStatus=-1;
   return Promise.reject({"name":thisName,"error":e});
  });
 }
 return new Promise(function(resolve,reject){
  var image=new Image();
  image.onload=function(e) {
   var target=e.target;
   thisImage.image=target;
   thisImage.width=target.width;
   thisImage.height=target.height;
   thisImage.loadStatus=2;
   resolve(thisImage);
  }
  image.onerror=function(e){
   thisImage.loadStatus=-1;
   reject({"name":thisName,"error":e});
  }
  image.src=thisName;
 });
}
/**
 * Disposes the texture data in this object.
 */
Texture.prototype.dispose=function(){
 if(this.loadedTexture!=null){
  this.loadedTexture.dispose();
  this.loadedTexture=null;
 }
}

////////////////////////////////////////

/**
 * A holder object representing a 3D scene.  This object includes
 * information on:<ul>
 *<li> A projection matrix, for setting the camera projection.</li>
 *<li> A view matrix, for setting the camera's view and position.</li>
 *<li> Lighting parameters.</li>
 *<li> Shapes to be drawn to the screen.</li>
 *<li> A texture cache.</li>
 *<li> A screen-clearing background color.</li>
 *</ul>
 * When a Scene3D object is created, it compiles and loads
 * a default shader program that enables lighting parameters,
 * and sets the projection and view matrices to identity.
 * The default lighting for the scene will have a default
* ambient color and one directional light source.
*  @class
* @alias glutil.Scene3D
 * @param {WebGLRenderingContext|object} canvasOrContext
 * A WebGL 3D context to associate with this scene, or an HTML
 * canvas element to create a WebGL context from, or an object, such as Scene3D, that
* implements a no-argument <code>getContext</code> method
* that returns a WebGL context.
 */
function Scene3D(canvasOrContext){
 var context=canvasOrContext;
 if(typeof canvasOrContext.getContext=="function"){
  // This might be a canvas, so create a WebGL context.
  if(HTMLCanvasElement && context.constructor==HTMLCanvasElement){
   context=GLUtil.get3DContext(canvasOrContext);
  } else {
   context=GLUtil._toContext(context);
  }
 }
 this.context=context;
 this.lightingEnabled=true;
 this.specularEnabled=true;
 /** An array of shapes that are part of the scene. */
 this.shapes=[];
 this._frontFace=Scene3D.CCW;
 this._cullFace=Scene3D.NONE;
 this.clearColor=[0,0,0,1];
 this.fboFilter=null;
 this.textureCache={};
 this._projectionMatrix=GLMath.mat4identity();
 this._viewMatrix=GLMath.mat4identity();
 this._invView=null;
 this.useDevicePixelRatio=false;
 this._pixelRatio=1;
 this.autoResize=true;
 this.lightSource=new Lights();
 this.width=Math.ceil(this.context.canvas.clientWidth*1.0);
 this.height=Math.ceil(this.context.canvas.clientHeight*1.0);
 this.context.canvas.width=this.width;
 this.context.canvas.height=this.height;
 this.program=null;
 this._is3d=GLUtil["is3DContext"](this.context);
 this._init3DContext();
}
/** @private */
Scene3D.prototype._init3DContext=function(){
 if(!this._is3d)return;
 this.program=new ShaderProgram(this.context,
   this._getDefines()+ShaderProgram.getDefaultVertex(),
   this._getDefines()+ShaderProgram.getDefaultFragment());
 this.context.viewport(0,0,this.width,this.height);
 this.context.enable(this.context.BLEND);
 this.context.blendFunc(this.context.SRC_ALPHA,this.context.ONE_MINUS_SRC_ALPHA);
 this.context.enable(this.context.DEPTH_TEST);
 this.context.depthFunc(this.context.LEQUAL);
 this.context.disable(this.context.CULL_FACE);
 this.context.clearDepth(1.0);
 this._setClearColor();
 this.context.clear(
    this.context.COLOR_BUFFER_BIT |
    this.context.DEPTH_BUFFER_BIT);
 this.useProgram(this.program);
}
/** Returns the WebGL context associated with this scene. */
Scene3D.prototype.getContext=function(){
 return this.context;
}
/** No face culling.
@const  */
Scene3D.NONE = 0;
/** Back side of a triangle.  By default, triangles with clockwise winding are back-facing.
@const */
Scene3D.BACK = 1;
/**
Front side of a triangle.  By default, triangles with counterclockwise winding are front-facing.
@const
*/
Scene3D.FRONT = 2;
/**
Back and front sides of a triangle.
@const
*/
Scene3D.FRONT_AND_BACK = 3;
/**
* Counterclockwise winding. A triangle has counterclockwise winding if
* its vertices are ordered such that the path from the first to second to third
* to first vertex, in window coordinates (X and Y only), runs counterclockwise.
* @const
*/
Scene3D.CCW = 0;
/**
* Clockwise winding, the opposite of counterclockwise winding.
* @const
*/
Scene3D.CW = 1;
/**
* Specifies which kinds of triangle faces are culled (not drawn)
* when rendering this scene.
* @param {number} value If this is {@link Scene3D.BACK},
* {@link Scene3D.FRONT}, or {@link Scene3D.FRONT_AND_BACK},
* enables face culling of the specified faces.  For any other value,
* disables face culling.  By default, face culling is disabled.
* @return {glutil.Scene3D} This object.
*/
Scene3D.prototype.cullFace=function(value){
 if(value==Scene3D.BACK ||
   value==Scene3D.FRONT ||
   value==Scene3D.FRONT_AND_BACK){
  this._cullFace=value;
 } else {
  this._cullFace=0;
 }
 return this;
}
/** @private */
Scene3D.prototype._setFace=function(){
 if(!this._is3d)return;
 if(this._cullFace==Scene3D.BACK){
  this.context.enable(this.context.CULL_FACE);
  this.context.cullFace(this.context.BACK);
 } else if(this._cullFace==Scene3D.FRONT){
  this.context.enable(this.context.CULL_FACE);
  this.context.cullFace(this.context.FRONT);
 } else if(this._cullFace==Scene3D.FRONT_AND_BACK){
  this.context.enable(this.context.CULL_FACE);
  this.context.cullFace(this.context.FRONT_AND_BACK);
 } else {
  this.context.disable(this.context.CULL_FACE);
 }
 if(this._frontFace==Scene3D.CW){
  this.context.frontFace(this.context.CW);
 } else {
  this.context.frontFace(this.context.CCW);
 }
 return this;
}
/**
* Specifies the winding of front faces.
* @param {number} value If this is {@link Scene3D.CW},
* clockwise triangles are front-facing.  For any other value,
* counterclockwise triangles are front-facing, which is the
* default behavior.  If using a left-handed coordinate system,
* set this value to {@link Scene3D.CW}.
* @return {glutil.Scene3D} This object.
*/
Scene3D.prototype.frontFace=function(value){
 if(value==Scene3D.CW){
  this._frontFace=value;
 } else {
  this._frontFace=0;
 }
 return this;
}
/**
* Sets whether to check whether to resize the canvas
* when the render() method is called.
* @param {boolean} value If true, will check whether to resize the canvas
* when the render() method is called. Default is true.
* @return {glutil.Scene3D} This object.
*/
Scene3D.prototype.setAutoResize=function(value){
 this.autoResize=!!value;
 return this;
}
/**
* Sets whether to use the device's pixel ratio (if supported by
* the browser) in addition to the canvas's size when setting
* the viewport's dimensions.<p>
* When this value changes, the Scene3D will automatically
* adjust the viewport.
* @param {boolean} value If true, use the device's pixel ratio
* when setting the viewport's dimensions.  Default is true.
* @return {glutil.Scene3D} This object.
  */
Scene3D.prototype.setUseDevicePixelRatio=function(value){
 var oldvalue=!!this.useDevicePixelRatio;
 this.useDevicePixelRatio=!!value;
 this._pixelRatio=(this.useDevicePixelRatio && window.devicePixelRatio) ?
   window.devicePixelRatio : 1;
 if(oldvalue!=this.useDevicePixelRatio){
  this.setDimensions(this.width,this.height);
 }
 return this;
}
 /**
  Gets the color used when clearing the screen each frame.
   @return {Array<number>} An array of four numbers, from 0 through
   1, specifying the red, green, blue, and alpha components of the color.
   */
Scene3D.prototype.getClearColor=function(){
 return this.clearColor.slice(0,4);
}
/** @private */
Scene3D.prototype._getDefines=function(){
 var ret="";
  // TODO: Don't enable normal mapping by default, but
  // compile normal map on demand
 if(this.lightingEnabled)
  ret+="#define SHADING\n#define NORMAL_MAP\n"
 if(this.specularEnabled)
  ret+="#define SPECULAR\n"
 return ret;
}
/** @private */
Scene3D.prototype._initProgramData=function(program){
 new LightsBinder(this.lightSource).bind(program);
 this._updateMatrix(program);
}
/**
* Changes the active shader program for this scene
* and prepares this object for the new program.
* @param {glutil.ShaderProgram} program The shader program to use.
* @return {glutil.Scene3D} This object.
*/
Scene3D.prototype.useProgram=function(program){
 if(!program)throw new Error("invalid program");
 program.use();
 this.program=program;
 this._initProgramData(this.program);
 return this;
}
/** @private */
Scene3D.prototype._getSpecularMapShader=function(){
 if(this.__specularMapShader){
  return this.__specularMapShader;
 }
 var defines=this._getDefines();
 defines+="#define SPECULAR_MAP\n";
 this.__specularMapShader=new ShaderProgram(this.context,
    defines+ShaderProgram.getDefaultVertex(),
    defines+ShaderProgram.getDefaultFragment());
 return this.__specularMapShader;
}

/** Changes the active shader program for this scene
* to a program that doesn't support lighting.
* @deprecated Use the <code>useProgram</code>
* method instead.
* @return {glutil.Scene3D} This object.
*/
Scene3D.prototype.disableLighting=function(){
 this.lightingEnabled=false;
 if(this._is3d){
  this.__specularMapShader=null;
  var program=new ShaderProgram(this.context,
    this._getDefines()+ShaderProgram.getDefaultVertex(),
    this._getDefines()+ShaderProgram.getDefaultFragment());
  return this.useProgram(program);
 } else {
  return this;
 }
}
/**
* Sets the viewport width and height for this scene.
* @param {number} width Width of the scene, in pixels.
*  Will be rounded up.
* @param {number} height Height of the scene, in pixels.
*  Will be rounded up.
* @return {number} Return value.*/
Scene3D.prototype.setDimensions=function(width, height){
 if(width<0 || height<0)throw new Error("width or height negative");
 this.width=Math.ceil(width);
 this.height=Math.ceil(height);
 this.context.canvas.width=this.width*this._pixelRatio;
 this.context.canvas.height=this.height*this._pixelRatio;
 this._setDimensions3D();
}
/** @private */
Scene3D.prototype._setDimensions3D=function(){
 if(this._is3d){
  this.context.viewport(0,0,this.width*this._pixelRatio,
   this.height*this._pixelRatio);
 }
 if(typeof this.fbo!="undefined" && this.fbo){
   this.fbo.dispose();
   this.fbo=this.createBuffer();
   if(this.fboQuad)this.fboQuad.setMaterial(this.fbo);
  }
}
/**
* Gets the viewport width for this scene.
* Note that if auto-resizing is enabled, this value may change
* after each call to the render() method.
* @return {number} Return value.*/
Scene3D.prototype.getWidth=function(){
 return this.width;
}
/**
* Gets the viewport height for this scene.
* Note that if auto-resizing is enabled, this value may change
* after each call to the render() method.
* @return {number} Return value.*/
Scene3D.prototype.getHeight=function(){
 return this.height;
}
/**
* Gets the ratio of width to height for this scene (getWidth()
* divided by getHeight()).
* Note that if auto-resizing is enabled, this value may change
* after each call to the render() method.
* @return {number} Return value.*/
Scene3D.prototype.getAspect=function(){
 return this.getWidth()/this.getHeight();
}
/** Gets the ratio of width to height for this scene,
* as actually displayed on the screen.
* @return {number} Return value.*/
Scene3D.prototype.getClientAspect=function(){
 var ch=this.context.canvas.clientHeight;
 if(ch<=0)return 1;
 return this.context.canvas.clientWidth/ch;
}
/**
 * Creates a frame buffer object associated with this scene.
 * @return {FrameBuffer} A buffer with the same size as this scene.
 */
Scene3D.prototype.createBuffer=function(){
 return new FrameBuffer(this.context,
   this.getWidth(),this.getHeight());
}
/**
 * Not documented yet.
 */
Scene3D.prototype.getProjectionMatrix=function(){
 return this._projectionMatrix.slice(0,16);
}
/**
 * Not documented yet.
 */
Scene3D.prototype.getViewMatrix=function(){
 return this._viewMatrix.slice(0,16);
}
/**
*  Sets this scene's projection matrix to a perspective projection.
 * <p>
 * For considerations when choosing the "near" and "far" parameters,
 * see {@link glmath.GLMath.mat4perspective}.
 * @param {number}  fov Y-axis field of view, in degrees. Should be less
* than 180 degrees. (The smaller
* this number, the bigger close objects appear to be. As a result, zooming out
* can be implemented by raising this value, and zooming in by lowering it.)
* @param {number}  aspect The ratio of width to height of the viewport, usually
*  the scene's aspect ratio (getAspect() or getClientAspect()).
* @param {number} near The distance from the camera to
* the near clipping plane. Objects closer than this distance won't be
* seen.
* @param {number}  far The distance from the camera to
* the far clipping plane. Objects beyond this distance will be too far
* to be seen.
* @return {glutil.Scene3D} This object.
* @example
* // Set the perspective projection.  Camera has a 45-degree field of view
* // and will see objects from 0.1 to 100 units away.
* scene.setPerspective(45,scene.getClientAspect(),0.1,100);
*/
Scene3D.prototype.setPerspective=function(fov, aspect, near, far){
 return this.setProjectionMatrix(GLMath.mat4perspective(fov,
   aspect,near,far));
}

/**
 * Sets this scene's projection matrix to an orthographic projection.
 * In this projection, the left clipping plane is parallel to the right clipping
 * plane and the top to the bottom.<p>
 * If the view rectangle's aspect ratio doesn't match the desired aspect
 * ratio, the view rectangle will be centered on the 3D scene's viewport
 * or otherwise moved and scaled so as to keep the entire view rectangle visible without stretching
 * or squishing it.
 * @param {number} left Leftmost coordinate of the view rectangle.
 * @param {number} right Rightmost coordinate of the view rectangle.
 * (Note that right can be greater than left or vice versa.)
 * @param {number} bottom Bottommost coordinate of the view rectangle.
 * @param {number} top Topmost coordinate of the view rectangle.
 * (Note that top can be greater than bottom or vice versa.)
 * @param {number} near Distance from the camera to the near clipping
 * plane.  A positive value means the plane is in front of the viewer.
 * @param {number} far Distance from the camera to the far clipping
 * plane.  A positive value means the plane is in front of the viewer.
 * (Note that near can be greater than far or vice versa.)  The absolute difference
 * between near and far should be as small as the application can accept.
 * @param {number} [aspect] Desired aspect ratio of the viewport (ratio
 * of width to height).  If null or omitted, uses this scene's aspect ratio instead.
 * @return {glutil.Scene3D} This object.
 */
Scene3D.prototype.setOrthoAspect=function(left, right, bottom, top, near, far, aspect){
 if(aspect==null)aspect=this.getAspect();
 if(aspect==0)aspect=1;
 return this.setProjectionMatrix(GLMath.mat4orthoAspect(
   left,right,bottom,top,near,far,aspect));
}
/**
 * Sets this scene's projection matrix to a 2D orthographic projection.
 * The near and far clipping planes will be set to -1 and 1, respectively.<p>
 * If the view rectangle's aspect ratio doesn't match the desired aspect
 * ratio, the view rectangle will be centered on the 3D scene's viewport
 * or otherwise moved and scaled so as to keep the entire view rectangle visible without stretching
 * or squishing it.
 * @param {number} left Leftmost coordinate of the view rectangle.
 * @param {number} right Rightmost coordinate of the view rectangle.
 * (Note that right can be greater than left or vice versa.)
 * @param {number} bottom Bottommost coordinate of the view rectangle.
 * @param {number} top Topmost coordinate of the view rectangle.
 * (Note that top can be greater than bottom or vice versa.)
 * @param {number} [aspect] Desired aspect ratio of the viewport (ratio
 * of width to height).  If null or omitted, uses this scene's aspect ratio instead.
 * @return {glutil.Scene3D} This object.
 */
Scene3D.prototype.setOrtho2DAspect=function(left, right, bottom, top, aspect){
 return this.setOrthoAspect(left, right, bottom, top, -1, 1, aspect);
}

/**
 * Sets this scene's projection matrix to a perspective projection that defines
 * the view frustum, or the limits in the camera's view.
 * <p>
 * For considerations when choosing the "near" and "far" parameters,
 * see {@link glmath.GLMath.mat4perspective}.
 * @param {number} left X-coordinate of the point where the left
 * clipping plane meets the near clipping plane.
 * @param {number} right X-coordinate of the point where the right
 * clipping plane meets the near clipping plane.
 * @param {number} bottom Y-coordinate of the point where the bottom
 * clipping plane meets the near clipping plane.
 * @param {number} top Y-coordinate of the point where the top
 * clipping plane meets the near clipping plane.
* @param {number} near The distance from the camera to
* the near clipping plane. Objects closer than this distance won't be
* seen.
* @param {number}  far The distance from the camera to
* the far clipping plane. Objects beyond this distance will be too far
* to be seen.
* @return {glutil.Scene3D} This object.
 */
Scene3D.prototype.setFrustum=function(left,right,bottom,top,near,far){
 return this.setProjectionMatrix(GLMath.mat4frustum(
   left, right, top, bottom, near, far));
}
/**
 * Sets this scene's projection matrix to an orthographic projection.
 * In this projection, the left clipping plane is parallel to the right clipping
 * plane and the top to the bottom.
 * @param {number} left Leftmost coordinate of the 3D view.
 * @param {number} right Rightmost coordinate of the 3D view.
 * (Note that right can be greater than left or vice versa.)
 * @param {number} bottom Bottommost coordinate of the 3D view.
 * @param {number} top Topmost coordinate of the 3D view.
 * (Note that top can be greater than bottom or vice versa.)
 * @param {number} near Distance from the camera to the near clipping
 * plane.  A positive value means the plane is in front of the viewer.
 * @param {number} far Distance from the camera to the far clipping
 * plane.  A positive value means the plane is in front of the viewer.
 * (Note that near can be greater than far or vice versa.)  The absolute difference
 * between near and far should be as small as the application can accept.
 * @return {glutil.Scene3D} This object.
 */
Scene3D.prototype.setOrtho=function(left,right,bottom,top,near,far){
 return this.setProjectionMatrix(GLMath.mat4ortho(
   left, right, bottom, top, near, far));
}
/**
 * Sets this scene's projection matrix to a 2D orthographic projection.
 * The near and far clipping planes will be set to -1 and 1, respectively.
 * @param {number} left Leftmost coordinate of the 2D view.
 * @param {number} right Rightmost coordinate of the 2D view.
 * (Note that right can be greater than left or vice versa.)
 * @param {number} bottom Bottommost coordinate of the 2D view.
 * @param {number} top Topmost coordinate of the 2D view.
 * (Note that top can be greater than bottom or vice versa.)
 * @return {glutil.Scene3D} This object.
 */
Scene3D.prototype.setOrtho2D=function(left,right,bottom,top){
 return this.setProjectionMatrix(GLMath.mat4ortho(
   left, right, bottom, top, -1, 1));
}
/** @private */
Scene3D.prototype._setClearColor=function(){
  if(this._is3d){
   this.context.clearColor(this.clearColor[0],this.clearColor[1],
     this.clearColor[2],this.clearColor[3]);
  }
  return this;
}

/**
* Sets the color used when clearing the screen each frame.
* This color is black by default.
* @param {Array<number>|number|string} r Array of three or
* four color components; or the red color component (0-1); or a string
* specifying an [HTML or CSS color]{@link glutil.GLUtil.toGLColor}.
* @param {number} g Green color component (0-1).
* May be null or omitted if a string or array is given as the "r" parameter.
* @param {number} b Blue color component (0-1).
* May be null or omitted if a string or array is given as the "r" parameter.
* @param {number} a Alpha color component (0-1).
* May be null or omitted if a string or array is given as the "r" parameter.
* @return {glutil.Scene3D} This object.
*/
Scene3D.prototype.setClearColor=function(r,g,b,a){
 this.clearColor=GLUtil["toGLColor"](r,g,b,a);
 return this._setClearColor();
}
/**
* Loads a texture from an image URL.
* @param {string} name URL of the image to load.
* @return {Promise} A promise that is resolved when
* the image is loaded successfully (the result will be a Texture
* object), and is rejected when an error occurs.
*/
Scene3D.prototype.loadTexture=function(name){
 return Texture.loadTexture(name, this.textureCache);
}
/**
* Loads a texture from an image URL and uploads it
* to a texture buffer object.
* @param {string|glutil.Texture} texture String giving the
* URL of the image to load, or
* a Texture object whose data may or may not be loaded.
* @return {Promise} A promise that is resolved when
* the image is loaded successfully and uploaded
* to a texture buffer (the result will be a Texture
* object), and is rejected when an error occurs.
*/
Scene3D.prototype.loadAndMapTexture=function(texture){
 var context=this.context;
 var tex=null;
 if(texture.constructor==Texture){
   tex=texture.loadImage();
 } else {
   tex=Texture.loadTexture(texture, this.textureCache)
 }
 return tex.then(function(textureInner){
    textureInner.loadedTexture=new LoadedTexture(textureInner,context);
    return textureInner;
  });
}
/**
* Loads one or more textures from an image URL and uploads each of them
* to a texture buffer object.
* @param {Array<string>} textureFiles A list of URLs of the image to load.
* @param {Function} [resolve] Called for each URL that is loaded successfully
* and uploaded to a texture buffer (the argument will be a Texture object.)
* @param {Function} [reject] Called for each URL for which an error
* occurs (the argument will be the data passed upon
* rejection).
* @return {Promise} A promise that is resolved when
* all the URLs in the textureFiles array are either resolved or rejected.
* The result will be an object with three properties:
* "successes", "failures", and "results".
* See {@link glutil.GLUtil.getPromiseResults}.
*/
Scene3D.prototype.loadAndMapTextures=function(textureFiles, resolve, reject){
 var promises=[];
 var context=this.context;
 for(var i=0;i<textureFiles.length;i++){
  var objf=textureFiles[i];
  promises.push(this.loadAndMapTexture(objf));
 }
 return GLUtil.getPromiseResults(promises, resolve, reject);
}
/** @private */
Scene3D.prototype._setIdentityMatrices=function(){
 this._projectionMatrix=GLMath.mat4identity();
 this._viewMatrix=GLMath.mat4identity();
 this._updateMatrix(this.program);
}
/** @private */
Scene3D.prototype._updateMatrix=function(program){
 var projView=GLMath.mat4multiply(this._projectionMatrix,this._viewMatrix);
 this._frustum=GLMath.mat4toFrustumPlanes(projView);
 if(program){
  var uniforms={
   "view":this._viewMatrix,
   "projection":this._projectionMatrix,
   "viewMatrix":this._viewMatrix,
   "projectionMatrix":this._projectionMatrix
  };
  if(program.get("viewInvW")!=null){
   var invView=GLMath.mat4invert(this._viewMatrix);
   uniforms["viewInvW"]=[invView[12],invView[13],invView[14],invView[15]];
  }
  program.setUniforms(uniforms);
 }
}
/**
 * Sets the projection matrix for this object.  The projection
 * matrix can also be set using the {@link glutil.Scene3D#setFrustum}, {@link glutil.Scene3D#setOrtho},
 * {@link glutil.Scene3D#setOrtho2D}, and {@link glutil.Scene3D#setPerspective} methods.
 * @param {Array<number>} matrix A 16-element matrix (4x4).
 * @return {glutil.Scene3D} This object.
 */
Scene3D.prototype.setProjectionMatrix=function(matrix){
 this._projectionMatrix=GLMath.mat4copy(matrix);
 this._updateMatrix(this.program);
 return this;
}
/**
*  Sets this scene's view matrix. The view matrix can also
* be set using the {@link glutil.Scene3D#setLookAt} method.
 * @param {Array<number>} matrix A 16-element matrix (4x4).
 * @return {glutil.Scene3D} This object.
*/
Scene3D.prototype.setViewMatrix=function(matrix){
 this._viewMatrix=GLMath.mat4copy(matrix);
 this._updateMatrix(this.program);
 return this;
}
/**
*  Sets this scene's view matrix to represent a camera view.
* This method takes a camera's position (<code>eye</code>), and the point the camera is viewing
* (<code>center</code>).
* @param {Array<number>} eye A 3-element vector specifying
* the camera position in world space.
* @param {Array<number>} [center] A 3-element vector specifying
* the point in world space that the camera is looking at. May be null or omitted,
* in which case the default is the coordinates (0,0,0).
* @param {Array<number>} [up] A 3-element vector specifying
* the direction from the center of the camera to its top. This parameter may
* be null or omitted, in which case the default is the vector (0, 1, 0),
* the vector that results when the camera is held upright.  This
* vector must not point in the same or opposite direction as
* the camera's view direction. (For best results, rotate the vector (0, 1, 0)
* so it points perpendicular to the camera's view direction.)
* @return {glutil.Scene3D} This object.
*/
Scene3D.prototype.setLookAt=function(eye, center, up){
 up = up || [0,1,0];
 center = center || [0,0,0];
 this._viewMatrix=GLMath.mat4lookat(eye, center, up);
 this._updateMatrix(this.program);
 return this;
}
/**
* Adds a 3D shape to this scene.  Its reference, not a copy,
* will be stored in the 3D scene's list of shapes.
* @param {glutil.Shape|glutil.ShapeGroup} shape A 3D shape.
* @return {glutil.Scene3D} This object.
*/
Scene3D.prototype.addShape=function(shape){
 this.shapes.push(shape);
 return this;
}
/**
 * Creates a vertex buffer from a geometric mesh and
 * returns a shape object.
 * @param {glutil.Mesh} mesh A geometric mesh object.  The shape
 * created will use the mesh in its current state and won't
 * track future changes.
 * @return {glutil.Shape} The generated shape object.
 */
Scene3D.prototype.makeShape=function(mesh){
 var buffer=new BufferedMesh(mesh,this.context);
 return new Shape(buffer);
}

/**
* Removes all instances of a 3D shape from this scene.
* @param {glutil.Shape|glutil.ShapeGroup} shape The 3D shape to remove.
* @return {glutil.Scene3D} This object.
*/
Scene3D.prototype.removeShape=function(shape){
 for(var i=0;i<this.shapes.length;i++){
   if(this.shapes[i]==shape){
     this.shapes.splice(i,1);
     i--;
   }
 }
 return this;
}
/**
 * Sets a light source in this scene to a directional light.
 * @param {number} index Zero-based index of the light to set.  The first
 * light has index 0, the second has index 1, and so on.  Will be created
 * if the light doesn't exist.
 * @param {Array<number>} position A 3-element vector giving the direction of the light, along the X, Y, and Z
 * axes, respectively.  May be null, in which case the default
 * is (0, 0, 1).
 * @param {Array<number>} diffuse A 3-element vector giving the diffuse color of the light, in the red, green,
 * and blue components respectively.  Each component ranges from 0 to 1.
 * May be null, in which case the default is (1, 1, 1).
 * @param {Array<number>} specular A 3-element vector giving the color of specular highlights caused by
 * the light, in the red, green,
 * and blue components respectively.  Each component ranges from 0 to 1.
 * May be null, in which case the default is (1, 1, 1).
* @return {glutil.Scene3D} This object.
 */
Scene3D.prototype.setDirectionalLight=function(index,position,diffuse,specular){
 this.lightSource.setDirectionalLight(index,position)
  .setParams(index,{"diffuse":diffuse,"specular":specular});
 new LightsBinder(this.lightSource).bind(this.program);
 return this;
}
/**
 * Sets parameters for a light in this scene.
 * @param {number} index Zero-based index of the light to set.  The first
 * light has index 0, the second has index 1, and so on.  Will be created
 * if the light doesn't exist.
 * @param {object} params An object as described in {@link glutil.LightSource.setParams}.
* @return {glutil.Scene3D} This object.
 */
Scene3D.prototype.setLightParams=function(index,params){
 this.lightSource.setParams(index,params);
 new LightsBinder(this.lightSource).bind(this.program);
 return this;
}
/**
 * Sets the color of the scene's ambient light.
* @param {Array<number>|number|string} r Array of three or
* four color components; or the red color component (0-1); or a string
* specifying an [HTML or CSS color]{@link glutil.GLUtil.toGLColor}.
* @param {number} g Green color component (0-1).
* May be null or omitted if a string or array is given as the "r" parameter.
* @param {number} b Blue color component (0-1).
* May be null or omitted if a string or array is given as the "r" parameter.
* @param {number} a Alpha color component (0-1).
* May be null or omitted if a string or array is given as the "r" parameter.
* @return {glutil.Scene3D} This object.
 */
Scene3D.prototype.setAmbient=function(r,g,b,a){
 this.lightSource.sceneAmbient=GLUtil["toGLColor"](r,g,b,a);
 this.lightSource.sceneAmbient=this.lightSource.sceneAmbient.slice(0,4)
 new LightsBinder(this.lightSource).bind(this.program);
 return this;
}

/**
 * Sets a light source in this scene to a point light
 * @param {number} index Zero-based index of the light to set.  The first
 * light has index 0, the second has index 1, and so on.
 * @param {Array<number>} position
 * @param {Array<number>} diffuse A 3-element vector giving the diffuse color of the light, in the red, green,
 * and blue components respectively.  Each component ranges from 0 to 1.
 * May be null, in which case the default is (1, 1, 1).
 * @param {Array<number>} specular A 3-element vector giving the color of specular highlights caused by
 * the light, in the red, green,
 * and blue components respectively.  Each component ranges from 0 to 1.
 * May be null, in which case the default is (1, 1, 1).
* @return {glutil.Scene3D} This object.
 */
Scene3D.prototype.setPointLight=function(index,position,diffuse,specular){
 this.lightSource.setPointLight(index,position)
   .setParams(index,{"diffuse":diffuse,"specular":specular});
 new LightsBinder(this.lightSource).bind(this.program);
 return this;
}
/** @private */
Scene3D._isIdentityExceptTranslate=function(mat){
return (
    mat[0]==1 && mat[1]==0 && mat[2]==0 && mat[3]==0 &&
    mat[4]==0 && mat[5]==1 && mat[6]==0 && mat[7]==0 &&
    mat[8]==0 && mat[9]==0 && mat[10]==1 && mat[11]==0 &&
    mat[15]==1
 );
};
/** @private */
Scene3D.prototype._setupMatrices=function(shape,program){
  var uniforms={};
  var currentMatrix=shape.getMatrix();
  var viewWorld;
  if(program.get("modelViewMatrix")!=null){
   if(Scene3D._isIdentityExceptTranslate(this._viewMatrix)){
    // view matrix is just a translation matrix, so that getting the model-view
    // matrix amounts to simply adding the view's position
    viewWorld=currentMatrix.slice(0,16);
    viewWorld[12]+=this._viewMatrix[12];
    viewWorld[13]+=this._viewMatrix[13];
    viewWorld[14]+=this._viewMatrix[14];
   } else {
    viewWorld=GLMath.mat4multiply(this._viewMatrix,
     currentMatrix);
   }
   uniforms["modelViewMatrix"]=viewWorld;
  }
  var invTrans=GLMath.mat4inverseTranspose3(currentMatrix);
  uniforms["world"]=currentMatrix;
  uniforms["modelMatrix"]=currentMatrix;
  uniforms["worldViewInvTrans3"]=invTrans;
  uniforms["normalMatrix"]=invTrans;
  program.setUniforms(uniforms);
}

/**
 *  Renders all shapes added to this scene.
 *  This is usually called in a render loop, such
 *  as {@link glutil.GLUtil.renderLoop}.<p>
 * This method may set the following uniforms if they exist in the
 * shader program:<ul>
 * <li><code>projection</code>, <code>projectionMatrix</code>: this scene's
 * projection matrix
 * <li><code>view</code>, <code>viewMatrix</code>: this scene's view
 * matrix
 * </ul>
 * @return {glutil.Scene3D} This object.
 */
Scene3D.prototype.render=function(){
  if(this.autoResize){
   var c=this.context.canvas;
   if(c.height!=Math.ceil(c.clientHeight)*this._pixelRatio ||
       c.width!=Math.ceil(c.clientWidth)*this._pixelRatio){
    // Resize the canvas if needed
    this.setDimensions(c.clientWidth,c.clientHeight);
   }
  }
  this._setFace();
  if(typeof this.fboFilter!="undefined" && this.fboFilter){
   // Render to the framebuffer, then to the main buffer via
   // a filter
   var oldProgram=this.program;
   var oldProj=this.getProjectionMatrix();
   var oldView=this.getViewMatrix();
   this.fbo.bind(this.program);
   this._renderInner();
   this.fbo.unbind();
   this.useProgram(this.fboFilter);
   this.context.clear(
    this.context.COLOR_BUFFER_BIT|this.context.DEPTH_BUFFER_BIT);
   this._setIdentityMatrices();
   // Do the rendering to main buffer
   this._renderShape(this.fboQuad,this.fboFilter);
   // Restore old matrices and program
   this.setProjectionMatrix(oldProj);
   this.setViewMatrix(oldView);
   this.useProgram(oldProgram);
   this.context.flush();
   return this;
  } else {
   // Render as usual
   this._renderInner();
   if(this._is3d)this.context.flush();
   return this;
 }
}

/** @private */
Scene3D.prototype._renderShape=function(shape,program){
 if(shape.constructor==ShapeGroup){
  for(var i=0;i<shape.shapes.length;i++){
   this._renderShape(shape.shapes[i],program);
  }
 } else {
   if(!shape.isCulled(this._frustum)){
    var prog=program;
    if(shape.material instanceof Material &&
       shape.material.specularMap){
      var p=this._getSpecularMapShader();
      this.useProgram(p);
      prog=p;
    }
    this._setupMatrices(shape,prog);
    Binders.getMaterialBinder(shape.material).bind(prog);
    shape.bufferedMesh.draw(prog);
    if(prog!=program){
      this.useProgram(program);
    }
  }
 }
}
/**
 * Uses a shader program to apply a texture filter after the
 * scene is rendered.  If a filter program is used, the scene will
 * create a frame buffer object, render its shapes to that frame
 * buffer, and then apply the filter program as it renders the
 * frame buffer to the canvas.
 * @param {ShaderProgram|string|null} filterProgram A shader
 * program that implements a texture filter.  The program
 * could be created using the {@link glutil.ShaderProgram.makeEffect} method.
 * This parameter can also be a string that could be a parameter
 * to the ShaderProgram.makeEffect() method.
 * If this value is null, texture filtering is disabled and shapes
 * are rendered to the canvas normally.
 * @return {glutil.Scene3D} This object.
 */
Scene3D.prototype.useFilter=function(filterProgram){
 if(filterProgram==null){
  this.fboFilter=null;
 } else {
  if(typeof filterProgram=="string"){
   // Assume the string is GLSL source code
   this.fboFilter=ShaderProgram.makeEffect(this.context,
    filterProgram);
  } else {
   this.fboFilter=filterProgram;
  }
  if(typeof this.fbo=="undefined" || !this.fbo){
   this.fbo=this.createBuffer();
  }
  if(typeof this.fboQuad=="undefined" || !this.fboQuad){
   var width=this.getWidth();
   var height=this.getHeight();
   // Create a mesh of a rectangle that will
   // fit the screen in the presence of identity projection
   // and view matrices
   var mesh=new Mesh(
     [-1,1,0,0,1,
      -1,-1,0,0,0,
      1,1,0,1,1,
      1,-1,0,1,0],
     [0,1,2,2,1,3],
     Mesh.TEXCOORDS_BIT);
   this.fboQuad=this.makeShape(mesh).setMaterial(this.fbo);
  }
 }
 return this;
}
/** @private */
Scene3D.prototype._renderInner=function(){
  this._updateMatrix(this.program);
  this.context.clear(
    this.context.COLOR_BUFFER_BIT |
    this.context.DEPTH_BUFFER_BIT);
  for(var i=0;i<this.shapes.length;i++){
   this._renderShape(this.shapes[i],this.program);
  }
  return this;
}

/**
* Represents a grouping of shapes.
* @class
* @alias glutil.ShapeGroup
*/
function ShapeGroup(){
 this.shapes=[];
 this.parent=null;
 this.transform=new Transform();
}
/**
* Adds a 3D shape to this shape group.  Its reference, not a copy,
* will be stored in the list of shapes.
* @param {glutil.Shape|glutil.ShapeGroup} shape A 3D shape.
* @return {glutil.ShapeGroup} This object.
*/
ShapeGroup.prototype.addShape=function(shape){
 shape.parent=this;
 this.shapes.push(shape);
 return this;
}
/**
 * Gets a reference to the transform used by this shape group object.
 * @return {glutil.Transform} Return value. */
ShapeGroup.prototype.getTransform=function(){
 return this.transform;
}
/**
 * Gets a copy of the transformation needed to transform
 * this shape group's coordinates to world coordinates.
 * @return {glutil.Transform} A 4x4 matrix.
 */
ShapeGroup.prototype.getMatrix=function(){
  var xform=this.getTransform();
  var thisIdentity=xform.isIdentity();
  if(this.parent!=null){
   var pmat=this.parent.getMatrix();
   if(thisIdentity){
    mat=GLMath.mat4multiply(pmat,xform.getMatrix());
   } else if(GLMath.mat4isIdentity(pmat)){
    mat=xform.getMatrix();
   } else {
    mat=pmat;
   }
  } else {
   mat=xform.getMatrix();
  }
  return mat;
}
/**
 * Sets the transform used by this shape group.  Child
 * shapes can set their own transforms, in which case, the
 * rendering process will multiply this shape group's transform
 * with the child shape's transform as it renders the child shape.
 * @param {glutil.Transform} transform
 */
ShapeGroup.prototype.setTransform=function(transform){
 this.transform=transform.copy();
 return this;
}

/**
 * Sets the material used by all shapes in this shape group.
 * @param {glutil.Material} material
 */
ShapeGroup.prototype.setMaterial=function(material){
 for(var i=0;i<this.shapes.length;i++){
  this.shapes[i].setMaterial(material);
 }
 return this;
}
/**
* Removes all instances of a 3D shape from this shape group
* @param {glutil.Shape|glutil.ShapeGroup} shape The 3D shape to remove.
* @return {glutil.ShapeGroup} This object.
*/
ShapeGroup.prototype.removeShape=function(shape){
 for(var i=0;i<this.shapes.length;i++){
   if(this.shapes[i]==shape){
     this.shapes.splice(i,1);
     i--;
   }
 }
 return this;
}
/**
 * Gets the number of vertices composed by this all shapes in this shape group.
 * @return {number} Return value. */
ShapeGroup.prototype.vertexCount=function(){
 var c=0;
 for(var i=0;i<this.shapes.length;i++){
  c+=this.shapes[i].vertexCount();
 }
 return c;
}
/**
 * Gets the number of primitives (triangles, lines,
* and points) composed by all shapes in this shape group.
 * @return {number} Return value. */
ShapeGroup.prototype.primitiveCount=function(){
 var c=0;
 for(var i=0;i<this.shapes.length;i++){
  c+=this.shapes[i].primitiveCount();
 }
 return c;
}
/**
 * Gets the number of vertices composed by
 * all shapes in this scene.
 * @return {number} Return value. */
Scene3D.prototype.vertexCount=function(){
 var c=0;
 for(var i=0;i<this.shapes.length;i++){
  c+=this.shapes[i].vertexCount();
 }
 return c;
}
/**
* Gets the number of primitives (triangles, lines,
* and points) composed by all shapes in this scene.
 * @return {number} Return value. */
Scene3D.prototype.primitiveCount=function(){
 var c=0;
 for(var i=0;i<this.shapes.length;i++){
  c+=this.shapes[i].primitiveCount();
 }
 return c;
}
/**
 * Sets the relative position of the shapes in this group
 * from their original position.
 * See {@link glutil.Transform#setPosition}
 * This method will modify this shape group's transform
 * rather than the transform for each shape in the group.
 * @param {number|Array<number>} x X coordinate
 * or a 3-element position array, as specified in {@link glutil.Transform#setScale}.
 * @param {number} y Y-coordinate.
 * @param {number} z Z-coordinate.
* @return {glutil.Scene3D} This object.
 */
ShapeGroup.prototype.setPosition=function(x,y,z){
 this.transform.setPosition(x,y,z)
 return this;
}
/**
 * Sets this shape group's orientation in the form of a [quaternion]{@tutorial glmath}.
 * See {@link glutil.Transform#setQuaternion}.
 * This method will modify this shape group's transform
 * rather than the transform for each shape in the group.
 * @param {Array<number>} quat A four-element array describing the rotation.
 * @return {glutil.Shape} This object.
 */
ShapeGroup.prototype.setQuaternion=function(quat){
 this.transform.setQuaternion(quat);
 return this;
}
/**
 * Sets the scale of this shape group relative to its original
 * size. See {@link glutil.Transform#setScale}
 * @param {number|Array<number>} x Scaling factor for this object's width,
 * or a 3-element scaling array, as specified in {@link glutil.Transform#setScale}.
 * @param {number} y Scaling factor for this object's height.
 * @param {number} z Scaling factor for this object's depth.
* @return {glutil.Scene3D} This object.
 */
ShapeGroup.prototype.setScale=function(x,y,z){
 this.transform.setScale(x,y,z);
 return this;
}
/**
* An object that associates a geometric mesh (the shape of the object) with
*  material data (which defines what is seen on the object's surface)
 * and a transformation matrix (which defines the object's position and size).
* See the "{@tutorial shapes}" tutorial.
 *  @class
* @alias glutil.Shape
* @param {BufferedMesh} mesh A mesh in the form of a vertex buffer object.
* For {@link glutil.Mesh} objects, use the {@link glutil.Scene3D#makeShape}
* method instead.
  */
function Shape(mesh){
  if(mesh==null)throw new Error("mesh is null");
  this.bufferedMesh=mesh;
  this.transform=new Transform();
  this.material=new Material();
  this.parent=null;
}
/**
 * Gets the number of vertices composed by
 * all shapes in this scene.
 * @return {number} Return value. */
Shape.prototype.vertexCount=function(){
 return (this.bufferedMesh) ? this.bufferedMesh.vertexCount() : 0;
}
/**
* Gets the number of primitives (triangles, lines,
* and points) composed by all shapes in this scene.
 * @return {number} Return value. */
Shape.prototype.primitiveCount=function(){
 return (this.bufferedMesh) ? this.bufferedMesh.primitiveCount() : 0;
}

/**
* Sets material parameters that give the shape a certain color.
* However, if the mesh defines its own colors, those colors will take
* precedence over the color given in this method.
* @param {Array<number>|number|string} r Array of three or
* four color components; or the red color component (0-1); or a string
* specifying an [HTML or CSS color]{@link glutil.GLUtil.toGLColor}.
* @param {number} g Green color component (0-1).
* May be null or omitted if a string or array is given as the "r" parameter.
* @param {number} b Blue color component (0-1).
* May be null or omitted if a string or array is given as the "r" parameter.
* @param {number} a Alpha color component (0-1).
* May be null or omitted if a string or array is given as the "r" parameter.
 * @return {glutil.Shape} This object.
*/
Shape.prototype.setColor=function(r,g,b,a){
 this.material=Material.fromColor(r,g,b,a);
 return this;
}
/**
 * Sets this shape's material to a texture with the given URL.
 * @param {string} name URL of the texture to use.
 * @return {glutil.Shape} This object.
 */
Shape.prototype.setTexture=function(name){
 this.material=Material.fromTexture(name);
 return this;
}
/**
* Sets this shape's material parameters.
* @param {Material} material
 * @return {glutil.Shape} This object.
*/
Shape.prototype.setMaterial=function(material){
 this.material=material;
 return this;
}
/**
* Makes a copy of this object.  The copied object
* will have its own version of the transform and
* material data, but any texture
* image data and vertex buffers will not be duplicated,
* but rather just references to them will be used.
* @return {glutil.Shape} A copy of this object.
*/
Shape.prototype.copy=function(){
 var ret=new Shape(this.bufferedMesh);
 ret.material=this.material.copy();
 ret.transform=this.getTransform().copy();
 return ret;
}
/**
 * Not documented yet.
 */
Shape.prototype.getTransform=function(){
 return this.transform;
}
/** @private */
Shape.prototype.isCulled=function(frustum){
 if(!this.bufferedMesh)return true;
 var bounds=this.bufferedMesh._getBounds();
 var matrix=this.getMatrix();
 if(!GLMath.mat4isIdentity(matrix)){
  var mn=GLMath.mat4transformVec3(matrix,bounds[0],bounds[1],bounds[2]);
  var mx=GLMath.mat4transformVec3(matrix,bounds[3],bounds[4],bounds[5]);
  bounds=[mn[0],mn[1],mn[2],mx[0],mx[1],mx[2]];
 }
 return !GLMath.frustumHasBox(frustum,bounds);
}
/**
 * Not documented yet.
 * @param {*} transform
 */
Shape.prototype.setTransform=function(transform){
 this.transform=transform.copy();
 return this;
}
/**
 * Sets the scale of this shape relative to its original
 * size. See {@link glutil.Transform#setScale}
 * @param {number|Array<number>} x Scaling factor for this object's width,
 * or a 3-element scaling array, as specified in {@link glutil.Transform#setScale}.
 * @param {number} y Scaling factor for this object's height.
 * @param {number} z Scaling factor for this object's depth.
* @return {glutil.Scene3D} This object.
 */
Shape.prototype.setScale=function(x,y,z){
  this.getTransform().setScale(x,y,z);
  return this;
}
/**
 * Sets the relative position of this shape from its original
 * position.  See {@link glutil.Transform#setPosition}
 * @param {number|Array<number>} x X coordinate
 * or a 3-element position array, as specified in {@link glutil.Transform#setScale}.
 * @param {number} y Y-coordinate.
 * @param {number} z Z-coordinate.
* @return {glutil.Scene3D} This object.
 */
Shape.prototype.setPosition=function(x,y,z){
  this.getTransform().setPosition(x,y,z);
  return this;
}
/**
 * Sets this object's orientation in the form of a [quaternion]{@tutorial glmath}.
 * See {@link glutil.Transform#setQuaternion}.
 * @param {Array<number>} quat A four-element array describing the rotation.
 * @return {glutil.Shape} This object.
 */
Shape.prototype.setQuaternion=function(quat){
  this.getTransform().setQuaternion(quat);
  return this;
}
/**
 * Gets the transformation matrix used by this shape.
   * See {@link glutil.Transform#getMatrix}.
 * @return {Array<number>} The current transformation matrix.
 */
Shape.prototype.getMatrix=function(){
  var xform=this.getTransform();
  var thisIdentity=xform.isIdentity();
  if(this.parent!=null){
   var pmat=this.parent.getMatrix();
   if(thisIdentity){
    mat=pmat;
   } else if(GLMath.mat4isIdentity(pmat)){
    mat=xform.getMatrix();
   } else {
    mat=GLMath.mat4multiply(pmat,xform.getMatrix());
   }
  } else {
   mat=xform.getMatrix();
  }
  return mat;
}
/////////////
// Deprecated methods
/** @deprecated Use Shape.getTransform().multQuaternion(...) instead. */
Shape.prototype.multQuaternion=function(x){
 this.getTransform().multQuaternion(x);
 return this;
}
/** @deprecated Use Shape.getTransform().multOrientation(...) instead. */
Shape.prototype.multRotation=function(a,b,c,d){
 this.getTransform().multRotation(a,b,c,d);
 return this;
}
/** @deprecated Use Shape.getTransform().setOrientation(...) instead. */
Shape.prototype.setRotation=function(a,b,c,d){
 this.getTransform().setOrientation(a,b,c,d);
 return this;
}

/////////////
exports["ShapeGroup"]=ShapeGroup;
exports["Lights"]=Lights;
exports["LightSource"]=LightSource;
exports["Texture"]=Texture;
exports["Material"]=Material;
exports["Shape"]=Shape;
exports["Scene3D"]=Scene3D;
exports["GLUtil"]=GLUtil;
}));
;
/*
Written by Peter O. in 2015.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://upokecenter.dreamhosters.com/articles/donate-now-2/
*/

/**
*  A class offering a convenient way to set a transformation
* from one coordinate system to another.
* @class
* @alias glutil.Transform
*/
function Transform(){
  /**
  * A three-element array giving the scaling for an object's width,
  * height, and depth, respectively.
  * For each component, 1 means no scaling.
  * The value given here is informational only and should not be modified directly.
  * Use the setScale method to set this value.
  * @default
  */
  this.scale=[1,1,1];
  /**
  * A three-element array giving the X, Y, and Z coordinates of the position
  * of an object relative to its original position.
  * The value given here is informational only and should not be modified directly.
  * Use the setPosition method to set this value.
  * @default
  */
  this.position=[0,0,0];
  /**
   * The rotation of an object in the form of a [quaternion]{@tutorial glmath}.
   * The value given here is informational only and should not be modified directly.
   * Use the setOrientation or setQuaternion method to set this value.
   */
  this.rotation=GLMath.quatIdentity();
  this.complexMatrix=false;
  this._matrixDirty=false;
  this._isIdentity=true;
  /** @private */
  this.matrix=GLMath.mat4identity();
}
/**
* Resets this shape to the untransformed state.
* @return {glutil.Shape} This object.
*/
Transform.prototype.reset=function(){
 this.matrix=GLMath.mat4identity();
 this.position=[0,0,0];
 this.scale=[1,1,1];
 this.rotation=GLMath.quatIdentity();
 this.complexMatrix=false;
 this._matrixDirty=false;
 this._isIdentity=true;
 return this;
}
/**
 * Sets this shape's transformation matrix. This method
 * will set the position, rotation, and scale properties
 * accordingly to the matrix given.
 * @param {Array<number>} value A 4x4 matrix.
 * This method will copy the value of this parameter.
 * @return {glutil.Transform} This object.
 */
Transform.prototype.setMatrix=function(value){
 this._matrixDirty=false;
 this.complexMatrix=true;
 this.matrix=value.slice(0,16);
 this.position=[this.matrix[12],this.matrix[13],this.matrix[14]];
 this.rotation=GLMath.quatFromMat4(this.matrix);
 this.rotation=GLMath.quatNormInPlace(this.rotation);
 this.scale=[this.matrix[0],this.matrix[5],this.matrix[10]];
 this._isIdentity=(
    value[0]==1 && value[1]==0 && value[2]==0 && value[3]==0 &&
    value[4]==0 && value[5]==1 && value[6]==0 && value[7]==0 &&
    value[8]==0 && value[9]==0 && value[10]==1 && value[11]==0 &&
    value[12]==0 && value[13]==0 && value[14]==0 && value[15]==1
 );
 return this;
}
/**
 * Returns whether this transform is the identity transform.
 * @return {boolean} Return value. */
Transform.prototype.isIdentity=function(){
 if(this._matrixDirty){
  if(this.complexMatrix){
   this.getMatrix();
  } else {
   return this.position[0]==0 && this.position[1]==0 &&
    this.position[2]==0 && this.scale[0]==1 &&
    this.scale[1]==1 && this.scale[2]==1 &&
    GLMath.quatIsIdentity(this.rotation);
  }
 }
 return this._isIdentity;
}
/**
* Resets this transform to the untransformed state.
* @return {glutil.Transform} This object.
*/
Transform.prototype.resetTransform=function(){
 this.matrix=GLMath.mat4identity();
 this.position=[0,0,0];
 this.scale=[1,1,1];
 this._isIdentity=true;
 this.rotation=GLMath.quatIdentity();
 this.complexMatrix=false;
 this._matrixDirty=false;
 return this;
}
/**
 * Sets the scale of an object relative to its original
 * size. Has no effect if a matrix was defined with {@link glutil.Transform#setMatrix}
 * and the transform wasn't reset yet with {@link glutil.Transform#resetTransform}.
 * @param {number|Array<number>} x Scaling factor for this object's width.
 *   If "y" and "z" are null or omitted, this is instead
 *  a 3-element array giving the scaling factors
 * for width, height, and depth, respectively, or a single number
 * giving the scaling factor for all three dimensions.
 * @param {number} y Scaling factor for this object's height.
 * @param {number} z Scaling factor for this object's depth.
* @return {glutil.Transform} This object.
 */
Transform.prototype.setScale=function(x,y,z){
  if(this.complexMatrix)return this;
  if(x!=null && y==null && z==null){
   if(typeof x!="number")
    this.scale=[x[0],x[1],x[2]];
   else
    this.scale=[x,x,x];
  } else {
   this.scale=[x,y,z];
  }
  this._isIdentity=(this._isIdentity &&
   this.scale[0]==1 &&
   this.scale[1]==1 &&
   this.scale[2]==1);
  this._matrixDirty=true;
  return this;
}
/**
 * Sets the relative position of an object from its original
 * position.  Has no effect if a matrix was defined with {@link glutil.Transform#setMatrix}
 * and the transform wasn't reset yet with {@link glutil.Transform#resetTransform}.
 * @param {Array<number>|number} x The X-coordinate.
 *   If "y" and "z" are null or omitted, this is instead
 *  a 3-element array giving the X, Y, and Z coordinates, or a single number
 * giving the coordinate for all three dimensions.
 * @param {number} y The Y-coordinate.
 * If "x" is an array, this parameter may be omitted.
 * @param {number} z The Z-coordinate.
 * If "x" is an array, this parameter may be omitted.
 * @return {glutil.Transform} This object.
 */
Transform.prototype.setPosition=function(x,y,z){
  if(this.complexMatrix)return this;
  if(x!=null && y==null && z==null){
   if(typeof x!="number")
    this.position=[x[0],x[1],x[2]];
   else
    this.position=[x,x,x];
  } else {
   this.position=[x,y,z];
  }
  this._isIdentity=(this._isIdentity &&
   this.position[0]==0 &&
   this.position[1]==0 &&
   this.position[2]==0);
  this._matrixDirty=true;
  return this;
}

/**
 * Moves the relative position of an object from its original
 * position.  Has no effect if a matrix was defined with {@link glutil.Transform#setMatrix}
 * and the transform wasn't reset yet with {@link glutil.Transform#resetTransform}.
 * @param {Array<number>|number} x Number to add to the X-coordinate,
 *   If "y" and "z" are null or omitted, this is instead
 *  a 3-element array giving the numbers to add to the X, Y, and Z coordinates, or a single number
 * to add to all three coordinates.
 * @param {number} y Number to add to the Y-coordinate.
 * If "x" is an array, this parameter may be omitted.
 * @param {number} z Number to add to the Z-coordinate.
 * If "x" is an array, this parameter may be omitted.
 * @return {glutil.Transform} This object.
 */
Transform.prototype.movePosition=function(x,y,z){
  if(this.complexMatrix)return this;
  if(x!=null && y==null && z==null){
   if(typeof x!="number"){
    this.position[0]+=x[0];
    this.position[1]+=x[1];
    this.position[2]+=x[2];
   } else {
    this.position[0]+=x;
    this.position[1]+=x;
    this.position[2]+=x;
   }
  } else {
    this.position[0]+=x;
    this.position[1]+=y;
    this.position[2]+=z;
  }
  this._isIdentity=(this._isIdentity &&
   this.position[0]==0 &&
   this.position[1]==0 &&
   this.position[2]==0);
  this._matrixDirty=true;
  return this;
}
/**
 * Sets this object's orientation in the form of a [quaternion]{@tutorial glmath} (a 4-element array
 * for describing 3D rotations). Has no effect if a matrix was defined with {@link glutil.Transform#setMatrix}
 * and the transform wasn't reset yet with {@link glutil.Transform#resetTransform}.
 * @param {Array<number>} quat A four-element array describing the rotation.
 * A quaternion is returned from the methods {@link glmath.GLMath.quatFromAxisAngle}
 * and {@link glmath.GLMath.quatFromTaitBryan}, among others.
 * @return {glutil.Transform} This object.
 * @example
 * // Set an object's orientation to 30 degrees about the X-axis
 * transform.setQuaternion(GLMath.quatFromAxisAngle(20,1,0,0));
 * // Set an object's orientation to identity (no rotation)
 * transform.setQuaternion(GLMath.quatIdentity());
 * // Set an object's orientation to 30 degree pitch multiplied
 * // by 40 degree roll
 * transform.setQuaternion(GLMath.quatFromTaitBryan(30,0,40));
 */
Transform.prototype.setQuaternion=function(quat){
  if(this.complexMatrix)return this;
  this.rotation=quat.slice(0,4);
  GLMath.quatNormInPlace(this.rotation);
  this._matrixDirty=true;
  return this;
}
/**
 * Sets this object's orientation in the form of an angle and an axis of
 * rotation. Has no effect if a matrix was defined with {@link glutil.Transform#setMatrix}
 * and the transform wasn't reset yet with {@link glutil.Transform#resetTransform}.
 * @param {Array<number>|number} angle The desired angle
 * to rotate in degrees.  If "v", "vy", and "vz" are omitted, this can
 * instead be a 4-element array giving the axis
 * of rotation as the first three elements, followed by the angle
 * in degrees as the fourth element.  If the axis of rotation
 * points toward the viewer, a positive value means the angle runs in
 * a counterclockwise direction for right-handed coordinate systems and
 * in a clockwise direction for left-handed systems.
 * @param {Array<number>|number} v X-component of the point lying on the axis
 * of rotation.  If "vy" and "vz" are omitted, this can
 * instead be a 3-element array giving the axis
 * of rotation in x, y, and z, respectively.
 * @param {number} vy Y-component of the point lying on the axis
 * of rotation.
 * @param {number} vz Z-component of the point lying on the axis
 * of rotation.
 * @return {glutil.Transform} This object.
 */
Transform.prototype.setOrientation=function(angle, v,vy,vz){
 return this.setQuaternion(GLMath.quatFromAxisAngle(angle,v,vy,vz));
}
/**
 * Combines an object's current rotation with another rotation
 * described by a [quaternion]{@tutorial glmath} (a 4-element array
 * for describing 3D rotations).  The combined rotation will have the
 * same effect as the new rotation followed by the existing rotation.
 *  Has no effect if a matrix was defined with {@link glutil.Transform#setMatrix}
 * and the transform wasn't reset yet with {@link glutil.Transform#resetTransform}.
 * @param {Array<number>} quat A four-element array describing the rotation.
 * A quaternion is returned from the methods {@link glmath.GLMath.quatFromAxisAngle}
 * or {@link glmath.GLMath.quatFromTaitBryan}.
 * @return {glutil.Transform} This object.
 * @example
 * // Combine an object's orientation with a rotation 20 degrees about the X-axis
 * transform.multQuaternion(GLMath.quatFromAxisAngle(20,1,0,0));
 * // Combine an object's orientation with identity (no rotation)
 * transform.multQuaternion(GLMath.quatIdentity());
 * // Combine an object's orientation with 30 degree pitch multiplied
 * // by 40 degree roll
 * transform.multQuaternion(GLMath.quatFromTaitBryan(30,0,40));
 */
Transform.prototype.multQuaternion=function(quat){
  if(this.complexMatrix)return this;
  this.rotation=GLMath.quatNormInPlace(
   GLMath.quatMultiply(this.rotation,quat));
  this._matrixDirty=true;
  return this;
}
/**
 * Combines an object's current rotation with another rotation
 * in the form of an angle and an axis of
 * rotation. The combined rotation will have the
 * same effect as the new rotation followed by the existing rotation.
 *  Has no effect if a matrix was defined with {@link glutil.Transform#setMatrix}
 * and the transform wasn't reset yet with {@link glutil.Transform#resetTransform}.
 * @param {Array<number>|number} angle The desired angle
 * to rotate in degrees. See {@link glutil.Transform#setOrientation}.
 * @param {Array<number>|number} v X-component of the point lying on the axis
 * of rotation.  If "vy" and "vz" are omitted, this can
 * instead be a 3-element array giving the axis
 * of rotation in x, y, and z, respectively.
 * @param {number} vy Y-component of the point lying on the axis
 * of rotation.
 * @param {number} vz Z-component of the point lying on the axis
 * of rotation.
 * @return {glutil.Transform} This object.
 */
Transform.prototype.multOrientation=function(angle, v,vy,vz){
 return this.multQuaternion(GLMath.quatFromAxisAngle(angle,v,vy,vz));
}
/**
 * Gets the transformation matrix used by an object.  It is a combination
 * of the scale, position, and rotation properties,
 * unless a matrix was defined with {@link glutil.Transform#setMatrix}
 * and the transform wasn't reset yet with {@link glutil.Transform#resetTransform}.
 * @return {Array<number>} Return value. */
Transform.prototype.getMatrix=function(){
  if(this._matrixDirty){
   this._matrixDirty=false;
   if(GLMath.quatIsIdentity(this.rotation)){
    this.matrix=[this.scale[0],0,0,0,0,
     this.scale[1],0,0,0,0,
     this.scale[2],0,
     this.position[0],
     this.position[1],
     this.position[2],1];
    this._isIdentity=(this.position[0]==0 && this.position[1]==0 &&
     this.position[2]==0 && this.scale[0]==1 &&
     this.scale[1]==1 && this.scale[2]==1);
   } else {
    // for best results, multiply in this order:
    // 1. translation
   this.matrix=[1,0,0,0,0,1,0,0,0,0,1,0,
    this.position[0],
    this.position[1],
    this.position[2],1];
    // 2. rotation
    this.matrix=GLMath.mat4multiply(this.matrix,
      GLMath.quatToMat4(this.rotation));
    // 3. scaling
    GLMath.mat4scaleInPlace(this.matrix,this.scale);
    var m=this.matrix;
    this._isIdentity=(
     m[0]==1 && m[1]==0 && m[2]==0 && m[3]==0 &&
     m[4]==0 && m[5]==1 && m[6]==0 && m[7]==0 &&
     m[8]==0 && m[9]==0 && m[10]==1 && m[11]==0 &&
     m[12]==0 && m[13]==0 && m[14]==0 && m[15]==1
    );
   }
  } else if(this._isIdentity){
   return GLMath.mat4identity();
  }
  return this.matrix.slice(0,16);
}

/**
* Makes a copy of this object.  The copied object
* will have its own version of the rotation, scale,
* position, and matrix data.
* @return {glutil.Transform} A copy of this object.
*/
Transform.prototype.copy=function(){
 var ret=new Transform();
 ret.scale=this.scale.slice(0,this.scale.length);
 ret.position=this.position.slice(0,this.scale.length);
 ret.complexMatrix=this.complexMatrix;
 ret._matrixDirty=this._matrixDirty;
 ret.matrix=this.matrix.slice(0,this.matrix.length);
 return ret;
}
;
/*
Written by Peter O. in 2015.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://upokecenter.dreamhosters.com/articles/donate-now-2/
*/

/**
* Specifies the triangles, lines, and points that make up a geometric shape.
* Each vertex, that is, each point, each end of a line, and each corner
* of a triangle, can also specify the following attributes:
* <ul>
* <li>A color, which is a set of 3 values each ranging from 0 to 1 (the red, green,
* and blue components, respectively.)
* <li>A normal vector, which is a set of 3 values.
* Normal values are required for lighting to work properly.
* <li>A tangent vector, which is a set of 3 values.
* <li>A bitangent vector, which is a set of 3 values.
* <li>Texture coordinates, which are a set of 2 values each ranging from 0 to
* 1, where (0, 0) is the lower right corner of the texture (by default), and (1, 1) is the upper
* right corner (by default).
* </ul>
* For bump mapping to work properly, a mesh needs to define
* normals, tangents, bitangents, and texture coordinates.<p>
* See the "{@tutorial shapes}" tutorial.
* @class
* @alias glutil.Mesh
* @param {Array<number>} [vertices] An array that contains data on each
* vertex of the mesh.
* Each vertex is made up of the same number of elements, as defined in
* format. If null or omitted, creates an initially empty mesh.
* May be null or omitted, in which case an empty vertex array is used.
* @param {Array<number>} [indices] An array of vertex indices.  Each trio of
* indices specifies a separate triangle, or each pair of indices specifies
* a line segment.
* If null or omitted, creates an initially empty mesh.
* @param {number} [format] A set of bit flags depending on the kind of data
* each vertex contains.  Each vertex contains 3 elements plus:<ul>
*  <li> 3 more elements if Mesh.NORMALS_BIT is set, plus
*  <li> 3 more elements if Mesh.COLORS_BIT is set, plus
*  <li> 2 more elements if Mesh.TEXCOORDS_BIT is set.</ul>
* If Mesh.LINES_BIT is set, each vertex index specifies a point of a line
* segment. If Mesh.POINTS_BIT is set, each vertex index specifies an
* individual point. Both bits can't be set.
* May be null or omitted, in which case "format" is set to 0.
*/
function Mesh(vertices,indices,format){
 if(vertices!=null){
  this.subMeshes=[
   new SubMesh(vertices,indices,format)
  ];
 } else {
  this.subMeshes=[];
 }
 this._elementsDefined=0;
 this.currentMode=-1;
 this.normal=[0,0,0];
 this.color=[0,0,0];
 this.tangent=[0,0,0];
 this.bitangent=[0,0,0];
 this.texCoord=[0,0];
}
/** @private */
Mesh._primitiveType=function(mode){
 if(mode==Mesh.LINES || mode==Mesh.LINE_STRIP)
  return Mesh.LINES;
 else if(mode==Mesh.POINTS)
  return Mesh.POINTS;
 else
  return Mesh.TRIANGLES;
}
/** @private */
Mesh._isCompatibleMode=function(oldMode,newMode){
 if(oldMode==newMode)return true;
 if(Mesh._primitiveType(oldMode)==Mesh._primitiveType(newMode))
   return true;
 return false;
}
/** @private */
Mesh._recalcNormalsStart=function(vertices,uniqueVertices,faces,stride,offset,flat){
  for(var i=0;i<vertices.length;i+=stride){
    vertices[i+offset]=0.0
    vertices[i+offset+1]=0.0
    vertices[i+offset+2]=0.0
    if(!flat){
     // If smooth shading is requested, find all vertices with
     // duplicate vertex positions
     var uv=[vertices[i],vertices[i+1],vertices[i+2]]
     if(uniqueVertices[uv])uniqueVertices[uv].push(i+offset);
     else uniqueVertices[uv]=[i+offset];
    }
  }
}
/** @private */
Mesh._recalcNormalsFinish=function(vertices,uniqueVertices,faces,stride,offset,flat){
 var len;
   if(!flat){
   // If smooth shading is requested, make sure
   // that every vertex with the same position has the
   // same normal
   for(var key in uniqueVertices){
    var v=uniqueVertices[key]
    if(v && v.constructor==Array && v.length>=2){
     var v0=v[0];
     // Add the normals of duplicate vertices
     // to the first vertex
     for(var i=1;i<v.length;i++){
      vertices[v0]+=vertices[v[i]]
      vertices[v0+1]+=vertices[v[i]+1]
      vertices[v0+2]+=vertices[v[i]+2]
     }
     // Propagate the first vertex's normal to the
     // other vertices
     for(var i=1;i<v.length;i++){
      vertices[v[i]]=vertices[v0]
      vertices[v[i]+1]=vertices[v0+1]
      vertices[v[i]+2]=vertices[v0+2]
     }
    }
   }
  }
  // Normalize each normal of the vertex
  for(var i=0;i<vertices.length;i+=stride){
    var x=vertices[i+offset];
    var y=vertices[i+offset+1];
    var z=vertices[i+offset+2];
    len=Math.sqrt(x*x+y*y+z*z);
    if(len){
      len=1.0/len;
      vertices[i+offset]=x*len;
      vertices[i+offset+1]=y*len;
      vertices[i+offset+2]=z*len;
    }
  }
}

/** @private */
Mesh._recalcNormals=function(vertices,faces,stride,offset,flat,inward){
  var normDir=(inward) ? -1 : 1;
  var uniqueVertices={};
  var len;
  Mesh._recalcNormalsStart(vertices,uniqueVertices,faces,stride,offset,flat);
  for(var i=0;i<faces.length;i+=3){
    var v1=faces[i]*stride
    var v2=faces[i+1]*stride
    var v3=faces[i+2]*stride
    var n1=[vertices[v1]-vertices[v3],vertices[v1+1]-vertices[v3+1],vertices[v1+2]-vertices[v3+2]]
    var n2=[vertices[v2]-vertices[v3],vertices[v2+1]-vertices[v3+1],vertices[v2+2]-vertices[v3+2]]
    // cross multiply n1 and n2
    var x=(n1[1]*n2[2]-n1[2]*n2[1])
    var y=(n1[2]*n2[0]-n1[0]*n2[2])
    var z=(n1[0]*n2[1]-n1[1]*n2[0])
    // normalize xyz vector
    len=Math.sqrt(x*x+y*y+z*z);
    if(len!=0){
      len=1.0/len;
      len*=normDir
      x*=len;
      y*=len;
      z*=len;
      // add normalized normal to each vertex of the face
      vertices[v1+offset]+=x
      vertices[v1+offset+1]+=y
      vertices[v1+offset+2]+=z
      vertices[v2+offset]+=x
      vertices[v2+offset+1]+=y
      vertices[v2+offset+2]+=z
      vertices[v3+offset]+=x
      vertices[v3+offset+1]+=y
      vertices[v3+offset+2]+=z
    }
  }
  Mesh._recalcNormalsFinish(vertices,uniqueVertices,faces,stride,offset,flat);
}

/** @private */
Mesh._recalcNormalsLines=function(vertices,faces,stride,offset,flat,inward){
  var normDir=(inward) ? 1 : -1;
  var uniqueVertices={};
  var len;
  Mesh._recalcNormalsStart(vertices,uniqueVertices,faces,stride,offset,flat);
  for(var i=0;i<faces.length;i+=2){
    var v1=faces[i]*stride
    var v2=faces[i+1]*stride
    var n1=[vertices[v2],vertices[v2+1],vertices[v2+2]]
    var n2=[vertices[v1],vertices[v1+1],vertices[v1+2]]
    // cross multiply n1 and n2
    var x=(n1[1]*n2[2]-n1[2]*n2[1])
    var y=(n1[2]*n2[0]-n1[0]*n2[2])
    var z=(n1[0]*n2[1]-n1[1]*n2[0])
    // normalize xyz vector
    len=Math.sqrt(x*x+y*y+z*z);
    if(len!=0){
      len=1.0/len;
      len*=normDir
      x*=len;
      y*=len;
      z*=len;
      // add normalized normal to each vertex of the face
      vertices[v1+offset]+=x
      vertices[v1+offset+1]+=y
      vertices[v1+offset+2]+=z
      vertices[v2+offset]+=x
      vertices[v2+offset+1]+=y
      vertices[v2+offset+2]+=z
    }
  }
  Mesh._recalcNormalsFinish(vertices,uniqueVertices,faces,stride,offset,flat);
}

/**
 * Changes the primitive mode for this mesh.
 * Future vertices will be drawn as primitives of the new type.
 * The primitive type can be set to the same mode, in which
 * case future vertices given will not build upon previous
 * vertices.<p>
 * Note that a Mesh object can contain primitives of different
 * types, such as triangles and lines.  For example, it's allowed
 * to have a mesh with triangles, then call this method, say,
 * with <code>Mesh.LINE_STRIP</code> to add line segments
 * to that mesh.
 * @param {number} m A primitive type.  One of the following:
 * Mesh.TRIANGLES, Mesh.LINES, Mesh.LINE_STRIP, Mesh.TRIANGLE_STRIP,
 * Mesh.TRIANGLE_FAN, Mesh.QUADS, Mesh.QUAD_STRIP.
 * @return {glutil.Mesh} This object.
 */
Mesh.prototype.mode=function(m){
 if(m<0)throw new Error("invalid mode");
 if(this.currentMode==-1 ||
   !Mesh._isCompatibleMode(this.currentMode,m)){
   var format=0;
   var primtype=Mesh._primitiveType(m);
   if(primtype==Mesh.LINES)
    format|=Mesh.LINES_BIT;
   else if(primtype==Mesh.POINTS)
    format|=Mesh.POINTS_BIT;
   this.subMeshes.push(new SubMesh([],[],format));
   this.currentMode=m;
 } else {
   this.subMeshes[this.subMeshes.length-1].newPrimitive();
   this.currentMode=m;
 }
 return this;
}
/**
 * Merges the vertices from another mesh into this one.
 * The vertices from the other mesh will be copied into this one,
 * and the other mesh's indices copied or adapted.
 * Also, resets the primitive
 * mode (see {@link glutil.Mesh#mode}) so that future vertices given
 * will not build upon previous vertices.
 * @param {glutil.Mesh} other A mesh to merge into this one. The mesh
 * given in this parameter will remain unchanged.
 * @return {glutil.Mesh} This object.
 * @example
 * // Use the following idiom to make a copy of a geometric mesh:
 * var copiedMesh = new Mesh().merge(meshToCopy);
 */
Mesh.prototype.merge=function(other){
 var lastMesh=this.subMeshes[this.subMeshes.length-1]
 var prim=lastMesh ? (lastMesh.attributeBits&Mesh.PRIMITIVES_BITS) : 0;
 for(var i=0;i<other.subMeshes.length;i++){
  var sm=other.subMeshes[i];
  if(sm.indices.length==0)continue;
  if(!lastMesh ||
     (sm.attributeBits&Mesh.PRIMITIVES_BITS)!=prim ||
     (lastMesh.vertices.length+sm.vertices.length)>65535*3 ||
     lastMesh.attributeBits!=sm.attributeBits){
   // Add new submesh because its primitive type
   // differs from the last submesh or the combined
   // submesh would be too long, or the attribute bits
   // don't match between this submesh and the last
   lastMesh=new SubMesh(
    sm.vertices.slice(0,sm.vertices.length),
    sm.indices.slice(0,sm.indices.length),
    sm.attributeBits);
   this.subMeshes.push(lastMesh);
   prim=(lastMesh.attributeBits&Mesh.PRIMITIVES_BITS);
  } else {
   // Add to existing submesh
   var oldVertexLength=lastMesh.vertexCount();
   var oldIndexLength=lastMesh.indices.length;
   lastMesh.vertices.push.apply(lastMesh.vertices,sm.vertices);
   lastMesh.indices.push.apply(lastMesh.indices,sm.indices);
   for(var i=oldIndexLength;i<lastMesh.indices.length;i++){
    lastMesh.indices[i]+=oldVertexLength;
   }
  }
 }
 // Reset the primitive
 lastMesh.newPrimitive();
 return this;
}

 /**
  * Sets the current normal for this mesh.  Future vertex positions
  * defined (with vertex3()) will have this normal.  The new current
  * normal will apply to future vertices even if the current mode
  * is TRIANGLE_FAN and some vertices were already given for
  * that mode.  The normal passed to this method will
  * not automatically be normalized to unit length.
  * @param {number} x X-coordinate of the normal.
  * @param {number} y Y-coordinate of the normal.
  * @param {number} z Z-coordinate of the normal.
  * @return {glutil.Mesh} This object.
  */
Mesh.prototype.normal3=function(x,y,z){
  this.normal[0]=x;
  this.normal[1]=y;
  this.normal[2]=z;
  this._elementsDefined|=Mesh.NORMALS_BIT;
  return this;
}

/**
  * Sets the current tangent vector for this mesh.  Future vertex positions
  * defined (with vertex3()) will have this normal.  The new current
  * tangent will apply to future vertices even if the current mode
  * is TRIANGLE_FAN and some vertices were already given for
  * that mode.  The tangent passed to this method will
  * not automatically be normalized to unit length.
  * @param {number} x X-coordinate of the tangent vector.
  * @param {number} y Y-coordinate of the tangent vector.
  * @param {number} z Z-coordinate of the tangent vector.
  * @return {glutil.Mesh} This object.
  */
Mesh.prototype.tangent3=function(x,y,z){
  this.tangent[0]=x;
  this.tangent[1]=y;
  this.tangent[2]=z;
  this._elementsDefined|=Mesh.TANGENTS_BIT;
  return this;
}

/**
  * Sets the current bitangent vector for this mesh.  Future vertex positions
  * defined (with vertex3()) will have this bitangent.  The new current
  * bitangent will apply to future vertices even if the current mode
  * is TRIANGLE_FAN and some vertices were already given for
  * that mode.  The bitangent passed to this method will
  * not automatically be normalized to unit length.
  * @param {number} x X-coordinate of the bitangent vector.
  * @param {number} y Y-coordinate of the bitangent vector.
  * @param {number} z Z-coordinate of the bitangent vector.
  * @return {glutil.Mesh} This object.
  */
Mesh.prototype.bitangent3=function(x,y,z){
  this.bitangent[0]=x;
  this.bitangent[1]=y;
  this.bitangent[2]=z;
  this._elementsDefined|=Mesh.BITANGENTS_BIT;
  return this;
}
 /**
  * Transforms the positions and normals of all the vertices currently
  * in this mesh, using a 4x4 matrix.  The matrix won't affect
  * vertices added afterwards.  Future vertices should not be
  * added after calling this method without calling mode() first.
  * @param {Array<number>} matrix A 4x4 matrix describing
  * the transformation.
  * @return {glutil.Mesh} This object.
  */
 Mesh.prototype.transform=function(matrix){
  for(var i=0;i<this.subMeshes.length;i++){
   this.subMeshes[i].transform(matrix);
  }
  return this;
 }
 /**
  * Sets the current color for this mesh.  Future vertex positions
  * defined (with vertex3()) will have this color. The new current
  * color will apply to future vertices even if the current mode
  * is TRIANGLE_FAN and some vertices were already given for
  * that mode.  Only the red, green, and blue components will be used.
  * @param {Array<number>|number|string} r Array of three or
  * four color components; or the red color component (0-1); or a string
  * specifying an [HTML or CSS color]{@link glutil.GLUtil.toGLColor}.
  * @param {number} g Green color component (0-1).
  * May be null or omitted if a string or array is given as the "r" parameter.
  * @param {number} b Blue color component (0-1).
  * May be null or omitted if a string or array is given as the "r" parameter.
  * @return {glutil.Mesh} This object.
  */
 Mesh.prototype.color3=function(r,g,b){
  if(typeof r=="string"){
   var c=GLUtil["toGLColor"](r);
   this.color[0]=c[0];
   this.color[1]=c[1];
   this.color[2]=c[2];
  } else if(typeof r=="number" && typeof g=="number" &&
   typeof b=="number"){
   this.color[0]=r;
   this.color[1]=g;
   this.color[2]=b;
  } else {
   this.color[0]=r[0];
   this.color[1]=r[1];
   this.color[2]=r[2];
  }
  this._elementsDefined|=Mesh.COLORS_BIT;
  return this;
 }
 /**
  * Sets the current texture coordinates for this mesh.  Future vertex positions
  * defined (with vertex3()) will have these texture coordinates.
  * The new current texture coordinates will apply to future vertices
  * even if the current mode
  * is TRIANGLE_FAN and some vertices were already given for
  * that mode.<p>
  Texture coordinates are a set of 2 values each ranging from 0 to
* 1, where (0, 0) is the lower right corner of the texture (by default), and (1, 1) is the upper
* right corner (by default).
  * @param {number} u X-coordinate of the texture, from 0-1.
  * @param {number} v Y-coordinate of the texture, from 0-1.
  * @return {glutil.Mesh} This object.
  */
 Mesh.prototype.texCoord2=function(u,v){
  this.texCoord[0]=u;
  this.texCoord[1]=v;
  this._elementsDefined|=Mesh.TEXCOORDS_BIT;
  return this;
 }
 /**
  * Adds a new vertex to this mesh.  If appropriate, adds an
  * additional face index according to this mesh's current mode.
  * The vertex will adopt this mesh's current normal, color,
  * and texture coordinates if they have been defined.
 * @param {Array<number>|number} x The X-coordinate.
 *   If "y" and "z" are null or omitted, this is instead
 *  a 3-element array giving the X, Y, and Z coordinates, or a single number
 * giving the coordinate for all three dimensions.
 * @param {number} y The Y-coordinate.
 * If "x" is an array, this parameter may be omitted.
 * @param {number} z The Z-coordinate.
 * If "x" is an array, this parameter may be omitted.
  * @return {glutil.Mesh} This object.
  */
 Mesh.prototype.vertex3=function(x,y,z){
  if(this.subMeshes.length==0){
   this.subMeshes.push(new SubMesh());
  }
  var lastSubmesh=this.subMeshes[this.subMeshes.length-1];
  if(x!=null && y==null && z==null){
   if(typeof x!="number")
    lastSubmesh.vertex3(x[0],x[1],x[2],this);
   else
    lastSubmesh.vertex3(x,x,x,this);
  } else {
   lastSubmesh.vertex3(x,y,z,this);
  }
  return this;
 }
 /**
  * Adds a new vertex to this mesh.  The Z-coordinate will
  * be treated as 0.
 * @param {Array<number>|number} x The X-coordinate.
 * If "y" is null or omitted, this is instead
 * a 3-element array giving the X, Y, and Z coordinates, or a single number
 * giving the coordinate for all three dimensions.
 * @param {number} y The Y-coordinate.
 * If "x" is an array, this parameter may be omitted.
  * @return {glutil.Mesh} This object.
  */
 Mesh.prototype.vertex2=function(x,y){
  if(x!=null && y==null && z==null){
   if(typeof x!="number")
    return this.vertex3(x[0],x[1],0.0);
   else
    return this.vertex3(x,x,0.0);
  } else {
   return this.vertex3(x,y,0.0);
  }
 }
 /**
  * Sets all the vertices in this mesh to the given color.
  * This method doesn't change this mesh's current color.
  * @param {number} r Red component of the color (0-1).
  * Can also be a string
  * specifying an [HTML or CSS color]{@link glutil.GLUtil.toGLColor}.
  * @param {number} g Green component of the color (0-1).
  * May be null or omitted if a string is given as the "r" parameter.
  * @param {number} b Blue component of the color (0-1).
  * May be null or omitted if a string is given as the "r" parameter.
  * @return {glutil.Mesh} This object.
  */
Mesh.prototype.setColor3=function(r,g,b){
  var rr=r;
  var gg=g;
  var bb=b;
  if(typeof r=="string"){
   var c=GLUtil["toGLColor"](r);
   rr=c[0];
   gg=c[1];
   bb=c[2];
  }
  for(var i=0;i<this.subMeshes.length;i++){
    this.subMeshes[i].setColor3(rr,gg,bb);
  }
  return this;
}
 /**
  * Recalculates the tangent vectors for triangles
  * in this mesh.  Tangent vectors are required for
  * normal mapping (bump mapping) to work.
  * This method only affects those parts of the mesh
  * that define normals and texture coordinates.
  * @return {glutil.Mesh} This object.
  */
 Mesh.prototype.recalcTangents=function(){
  for(var i=0;i<this.subMeshes.length;i++){
   if(this.subMeshes[i].primitiveType()==Mesh.TRIANGLES){
    this.subMeshes[i].recalcTangents();
   }
  }
  return this;
 }

/**
  * Recalculates the normal vectors for triangles
  * in this mesh.  For this to properly affect shading, each triangle in
  * the mesh must have its vertices defined in
  * counterclockwise order.  Each normal calculated will
  * be normalized to unit length (unless the normal is (0,0,0)).
  * @param {boolean} flat If true, each triangle in the mesh
  * will have the same normal, which usually leads to a flat
  * appearance.  If false, each unique vertex in the mesh
  * will have its own normal, which usually leads to a smooth
  * appearance.
  * @param {boolean} inward If true, the generated normals
  * will point inward; otherwise, outward.
  * @return {glutil.Mesh} This object.
  */
 Mesh.prototype.recalcNormals=function(flat,inward){
  for(var i=0;i<this.subMeshes.length;i++){
   // TODO: Eliminate normal generation for lines
   // in the next version
   if(this.subMeshes[i].primitiveType()!=Mesh.POINTS){
    this.subMeshes[i].recalcNormals(flat,inward);
   }
  }
  return this;
 }
/**
 * Modifies this mesh by normalizing the normals it defines
 * to unit length.
 * @return {glutil.Mesh} This object.
 */
Mesh.prototype.normalizeNormals=function(){
  for(var i=0;i<this.subMeshes.length;i++){
   var stride=this.subMeshes[i].getStride();
   var vertices=this.subMeshes[i].vertices;
   var normalOffset=Mesh._normalOffset(
     this.subMeshes[i].attributeBits);
   if(normalOffset<0)continue;
   for(var i=0;i<vertices.length;i+=stride){
    var x=vertices[i+normalOffset];
    var y=vertices[i+normalOffset+1];
    var z=vertices[i+normalOffset+2];
    var len=Math.sqrt(x*x+y*y+z*z);
    if(len!=0){
      len=1.0/len;
      vertices[i+normalOffset]*=len;
      vertices[i+normalOffset+1]*=len;
      vertices[i+normalOffset+2]*=len;
    }
   }
  }
  return this;
 }
/**
 * Converts this mesh to a new mesh with triangles converted
 * to line segments.  The new mesh will reuse the vertices
 * contained in this one without copying the vertices.  Parts
 * of the mesh consisting of points or line segments will remain
 * unchanged.
 * @return {glutil.Mesh} A new mesh with triangles converted
 * to lines.
 */
Mesh.prototype.toWireFrame=function(){
  var mesh=new Mesh();
  for(var i=0;i<this.subMeshes.length;i++){
   mesh.subMeshes.push(this.subMeshes[i].toWireFrame());
  }
  return mesh;
}
/**
 * Sets the X, Y, and Z coordinates of the vertex with the
 * given index.  Has no effect if the index is less than 0 or
 * equals the number of vertices in this mesh or greater.
 * @param {number} index Zero-based index of
 * the vertex to set.
  * The index ranges from 0 to less than
 * the number of vertices in the mesh, not the
 * number of vertex indices.
* @param {number|Array<number>} x X coordinate of the vertex position.
 * Can also be a 3-element array giving
 * the X, Y, and Z coordinates, respectively, of the vertex
 * position.
 * @param {number} y Y coordinate of the vertex position.
 * May be null or omitted if "x" is an array.
 * @param {number} z Z coordinate of the vertex position.
 * May be null or omitted if "x" is an array.
 * @return {glutil.Mesh} This object.
 */
Mesh.prototype.setVertex=function(index,x,y,z){
  if(index<0)return this;
  if(typeof y=="undefined" && typeof z=="undefined"){
   y=x[1];
   z=x[2];
   x=x[0];
  }
  var count=0;
  for(var i=0;i<this.subMeshes.length;i++){
   var subMesh=this.subMeshes[i];
   var c=subMesh.vertexCount();
   var newcount=count+c;
   if(index<newcount){
    var idx=index-count;
    idx*=subMesh.getStride();
    subMesh.vertices[idx]=x;
    subMesh.vertices[idx+1]=y;
    subMesh.vertices[idx+2]=z;
    break;
   }
   count=newcount;
  }
  return this;
}
/**
 * Sets the normal associated with the vertex with the
 * given index.  Has no effect if the index is less than 0 or
 * equals the number of vertices in this mesh or greater.
 * @param {number} index Zero-based index of
 * the vertex to set.
 * The index ranges from 0 to less than
 * the number of vertices in the mesh, not the
 * number of vertex indices.
 * @param {number|Array<number>} x X coordinate of the vertex normal.
 * Can also be a 3-element array giving
 * the X, Y, and Z coordinates, respectively, of the vertex
 * normal.
 * @param {number} y Y coordinate of the vertex normal.
 * May be null or omitted if "x" is an array.
 * @param {number} z Z coordinate of the vertex normal.
 * May be null or omitted if "x" is an array.
 * @return {glutil.Mesh} This object.
 */
Mesh.prototype.setVertexNormal=function(index,x,y,z){
  if(index<0)return this;
  var count=0;
  if(typeof y=="undefined" && typeof z=="undefined"){
   y=x[1];
   z=x[2];
   x=x[0];
  }
  for(var i=0;i<this.subMeshes.length;i++){
   var subMesh=this.subMeshes[i];
   var c=subMesh.vertexCount();
   var newcount=count+c;
   if(index<newcount){
    var idx=index-count;
    subMesh._rebuildVertices(Mesh.NORMALS_BIT);
    idx*=subMesh.getStride();
    idx+=Mesh._normalOffset(subMesh.attributeBits);
    subMesh.vertices[idx]=x;
    subMesh.vertices[idx+1]=y;
    subMesh.vertices[idx+2]=z;
    break;
   }
   count=newcount;
  }
  return this;
}
/**
 * Gets the position of the vertex with the given
 * index in this mesh.
 * @param {number} index Zero-based index of
 * the vertex to get.
 * The index ranges from 0 to less than
 * the number of vertices in the mesh, not the
 * number of vertex indices.
 * @return {Array<number>} A 3-element array giving
 * the X, Y, and Z coordinates, respectively, of the vertex
 * position, or null if the index is less than 0 or
 * equals the number of vertices in this mesh or greater.
 */
Mesh.prototype.getVertex=function(index){
  if(index<0)return null;
  var count=0;
  for(var i=0;i<this.subMeshes.length;i++){
   var subMesh=this.subMeshes[i];
   var c=subMesh.vertexCount();
   var newcount=count+c;
   if(index<newcount){
    var idx=index-count;
    idx*=subMesh.getStride();
    return subMesh.vertices.slice(idx,idx+3);
   }
   count=newcount;
  }
  return null;
}
/**
 * Gets the normal of the vertex with the given
 * index in this mesh.
 * @param {number} index Zero-based index of
 * the vertex normal to get.
 * The index ranges from 0 to less than
 * the number of vertices in the mesh, not the
 * number of vertex indices.
 * @return {Array<number>} A 3-element array giving
 * the X, Y, and Z coordinates, respectively, of the vertex
 * normal, or null if the index is less than 0 or
 * equals the number of vertices in this mesh or greater.
 * Returns (0,0,0) if the given vertex exists but doesn't define
 * a normal.
 */
Mesh.prototype.getVertexNormal=function(index){
  var count=0;
  for(var i=0;i<this.subMeshes.length;i++){
   var subMesh=this.subMeshes[i];
   var c=subMesh.vertexCount();
   var newcount=count+c;
   if(index<newcount){
    if((subMesh.attributeBits&Mesh.NORMALS_BIT)!=0){
     var idx=index-count;
     idx*=subMesh.getStride();
     idx+=Mesh._normalOffset(subMesh.attributeBits);
     return subMesh.vertices.slice(idx,idx+3);
    } else {
     return [0,0,0];
    }
   }
   count=newcount;
  }
  return null;
}
/**
 * Gets the number of vertices included in this mesh.
 * @return {number} Return value. */
Mesh.prototype.vertexCount=function(){
  var count=0;
  for(var i=0;i<this.subMeshes.length;i++){
   count+=this.subMeshes[i].vertexCount();
  }
  return count;
}
/**
 * Gets the number of primitives (triangles, lines,
* and points) composed by all shapes in this mesh.
 * @return {number} Return value. */
Mesh.prototype.primitiveCount=function(){
  var count=0;
  for(var i=0;i<this.subMeshes.length;i++){
   count+=this.subMeshes[i].primitiveCount();
  }
  return count;
}

/** @private */
function SubMesh(vertices,faces,format){
 this.vertices=vertices||[];
 this.indices=faces||[];
 this.startIndex=0;
 var prim=(format&Mesh.PRIMITIVES_BITS);
 if(prim!=0 && prim!=Mesh.LINES_BIT && prim!=Mesh.POINTS_BIT){
  throw new Error("invalid format");
 }
 this.attributeBits=(format==null) ? 0 : format;
 this.vertexCount=function(){
  return this.vertices.length/this.getStride();
 }
 this.getStride=function(){
  return Mesh._getStride(this.attributeBits);
 }
 this.newPrimitive=function(m){
  this.startIndex=this.vertices.length;
  return this;
 }
 this.primitiveType=function(){
  var primitive=Mesh.TRIANGLES;
  if((this.attributeBits&Mesh.LINES_BIT)!=0)primitive=Mesh.LINES;
  if((this.attributeBits&Mesh.POINTS_BIT)!=0)primitive=Mesh.POINTS;
  return primitive;
 }
 /** @private */
 this._rebuildVertices=function(newAttributes){
  var oldBits=this.attributeBits;
  var newBits=oldBits|(newAttributes&Mesh.ATTRIBUTES_BITS);
  if(newBits==oldBits)return;
  var currentStride=this.getStride();
  // Rebuild the list of vertices if a new kind of
  // attribute is added to the mesh
  var newVertices=[];
  var newStride=3;
  if((newBits&Mesh.COLORS_BIT)!=0)
   newStride+=3;
  if((newBits&Mesh.NORMALS_BIT)!=0)
   newStride+=3;
  if((newBits&Mesh.TEXCOORDS_BIT)!=0)
   newStride+=2;
  if((newBits&Mesh.TANGENTS_BIT)!=0)
   newStride+=3;
  if((newBits&Mesh.BITANGENTS_BIT)!=0)
   newStride+=3;
  for(var i=0;i<this.vertices.length;i+=currentStride){
   var vx=this.vertices[i];
   var vy=this.vertices[i+1];
   var vz=this.vertices[i+2];
   var s=i+3;
   newVertices.push(vx,vy,vz);
   if((newBits&Mesh.NORMALS_BIT)!=0){
    if((oldBits&Mesh.NORMALS_BIT)!=0){
     var x=this.vertices[s];
     var y=this.vertices[s+1];
     var z=this.vertices[s+2];
     s+=3;
     newVertices.push(x,y,z);
    } else {
     newVertices.push(0,0,0);
    }
   }
   if((newBits&Mesh.COLORS_BIT)!=0){
    if((oldBits&Mesh.COLORS_BIT)!=0){
     var r=this.vertices[s];
     var g=this.vertices[s+1];
     var b=this.vertices[s+2];
     s+=3;
     newVertices.push(r,g,b);
    } else {
     newVertices.push(0,0,0);
    }
   }
   if((newBits&Mesh.TEXCOORDS_BIT)!=0){
    if((oldBits&Mesh.TEXCOORDS_BIT)!=0){
     var u=this.vertices[s];
     var v=this.vertices[s+1];
     s+=2;
     newVertices.push(u,v);
    } else {
     newVertices.push(0,0);
    }
   }
   if((newBits&Mesh.TANGENTS_BIT)!=0){
    if((oldBits&Mesh.TANGENTS_BIT)!=0){
     var x=this.vertices[s];
     var y=this.vertices[s+1];
     var z=this.vertices[s+2];
     s+=3;
     newVertices.push(x,y,z);
    } else {
     newVertices.push(0,0,0);
    }
   }
   if((newBits&Mesh.BITANGENTS_BIT)!=0){
    if((oldBits&Mesh.BITANGENTS_BIT)!=0){
     var x=this.vertices[s];
     var y=this.vertices[s+1];
     var z=this.vertices[s+2];
     s+=3;
     newVertices.push(x,y,z);
    } else {
     newVertices.push(0,0,0);
    }
   }
  }
  this.vertices=newVertices;
  this.attributeBits=newBits;
 }
 this._setTriangle=function(vertexStartIndex,stride,i1,i2,i3){
   var v1=i1*stride;
   var v2=i2*stride;
   var v3=i3*stride;
   var triCount=0;
   var tribits=0;
   var v=this.vertices;
   for(var i=vertexStartIndex-stride;
     i>=0 && triCount<16 && tribits!=7;
     i-=stride,triCount++){
     var found=7;
     for(var j=0;j<stride && found!=0;j++){
        if((found&1)!=0 && v[v1+j]!=v[i+j]){
         found&=~1;
        }
        if((found&2)!=0 && v[v2+j]!=v[i+j]){
         found&=~2;
        }
        if((found&4)!=0 && v[v3+j]!=v[i+j]){
         found&=~4;
        }
     }
     if((found&1)!=0){ i1=i/stride; v1=i1*stride; tribits|=1; break; }
     if((found&2)!=0){ i2=i/stride; v2=i2*stride; tribits|=2; break; }
     if((found&4)!=0){ i3=i/stride; v3=i3*stride; tribits|=4; break; }
   }
   if(
    !(v[v1]==v[v2] && v[v1+1]==v[v2+1] && v[v1+2]==v[v2+2]) &&
    !(v[v1]==v[v3] && v[v1+1]==v[v3+1] && v[v1+2]==v[v3+2]) &&
    !(v[v2]==v[v3] && v[v2+1]==v[v3+1] && v[v2+2]==v[v3+2])){
    // avoid identical vertex positions
    this.indices.push(i1,i2,i3);
   }
 }
 this.vertex3=function(x,y,z,state){
  var currentMode=state.currentMode;
  if(currentMode==-1)throw new Error("mode() not called");
  this._rebuildVertices(state._elementsDefined);
   var vertexStartIndex=this.vertices.length;
  this.vertices.push(x,y,z);
  if((this.attributeBits&Mesh.NORMALS_BIT)!=0){
   this.vertices.push(state.normal[0],state.normal[1],state.normal[2]);
  }
  if((this.attributeBits&Mesh.COLORS_BIT)!=0){
   this.vertices.push(state.color[0],state.color[1],state.color[2]);
  }
  if((this.attributeBits&Mesh.TEXCOORDS_BIT)!=0){
   this.vertices.push(state.texCoord[0],state.texCoord[1]);
  }
  if((this.attributeBits&Mesh.TANGENTS_BIT)!=0){
   this.vertices.push(state.tangent[0],state.tangent[1],state.tangent[2]);
  }
  if((this.attributeBits&Mesh.BITANGENTS_BIT)!=0){
   this.vertices.push(state.bitangent[0],state.bitangent[1],state.bitangent[2]);
  }
  var stride=this.getStride();
  if(currentMode==Mesh.QUAD_STRIP &&
     (this.vertices.length-this.startIndex)>=stride*4 &&
     (this.vertices.length-this.startIndex)%(stride*2)==0){
   var index=(this.vertices.length/stride)-4;
   this._setTriangle(vertexStartIndex,stride,index,index+1,index+2);
   this._setTriangle(vertexStartIndex,stride,index+2,index+1,index+3);
  } else if(currentMode==Mesh.QUADS &&
     (this.vertices.length-this.startIndex)%(stride*4)==0){
   var index=(this.vertices.length/stride)-4;
   this._setTriangle(vertexStartIndex,stride,index,index+1,index+2);
   this._setTriangle(vertexStartIndex,stride,index,index+2,index+3);
  } else if(currentMode==Mesh.TRIANGLES &&
     (this.vertices.length-this.startIndex)%(stride*3)==0){
   var index=(this.vertices.length/stride)-3;
   this._setTriangle(vertexStartIndex,stride,index,index+1,index+2);
  } else if(currentMode==Mesh.LINES &&
     (this.vertices.length-this.startIndex)%(stride*2)==0){
   var index=(this.vertices.length/stride)-2;
   this.indices.push(index,index+1);
  } else if(currentMode==Mesh.TRIANGLE_FAN &&
     (this.vertices.length-this.startIndex)>=(stride*3)){
   var index=(this.vertices.length/stride)-2;
   var firstIndex=(this.startIndex/stride);
   this._setTriangle(vertexStartIndex,stride,firstIndex,index,index+1);
  } else if(currentMode==Mesh.LINE_STRIP &&
     (this.vertices.length-this.startIndex)>=(stride*2)){
   var index=(this.vertices.length/stride)-2;
   this.indices.push(index,index+1);
  } else if(currentMode==Mesh.POINTS){
   var index=(this.vertices.length/stride)-1;
   this.indices.push(index);
  } else if(currentMode==Mesh.TRIANGLE_STRIP &&
     (this.vertices.length-this.startIndex)>=(stride*3)){
   var index=(this.vertices.length/stride)-3;
   var firstIndex=(this.startIndex/stride);
   if(((index-firstIndex)&1)==0){
     this._setTriangle(vertexStartIndex,stride,index,index+1,index+2);
   } else {
     this._setTriangle(vertexStartIndex,stride,index+1,index,index+2);
   }
  }
  return this;
 }
}

/** @private */
SubMesh.prototype.makeRedundant=function(){
  var existingIndices=[];
  var stride=this.getStride();
  var originalIndicesLength=this.indices.length;
  for(var i=0;i<originalIndicesLength;i++){
    var index=this.indices[i];
    if(existingIndices[index]){
     // Index already exists, so duplicate
     var offset=index*stride;
     var newIndex=this.vertices.length/stride;
     for(var j=0;j<stride;j++){
      this.vertices.push(this.vertices[offset+j]);
     }
     this.indices[i]=newIndex;
    }
    existingIndices[index]=true;
  }
  return this;
}
/**
 * @private */
SubMesh.prototype.primitiveCount=function(){
  if((this.attributeBits&Mesh.LINES_BIT)!=0)
   return Math.floor(this.indices.length/2);
  if((this.attributeBits&Mesh.POINTS_BIT)!=0)
   return this.indices.length;
  return Math.floor(this.indices.length/3);
}
/** @private */
SubMesh.prototype.toWireFrame=function(){
  if((this.attributeBits&Mesh.PRIMITIVES_BITS)!=0){
   // Not a triangle mesh
   return this;
  }
  // Adds a line only if it doesn't exist
  function addLine(lineIndices,existingLines,f1,f2){
   // Ensure ordering of the indices
   if(f1<f2){
    var tmp=f1;f1=f2;f2=tmp;
   }
   var e=existingLines[f1];
   if(e){
    if(e.indexOf(f2)<0){
     e.push(f2);
     lineIndices.push(f1,f2);
    }
   } else {
    existingLines[f1]=[f2];
    lineIndices.push(f1,f2);
   }
  }
  var lineIndices=[];
  var existingLines={};
  for(var i=0;i<this.indices.length;i+=3){
    var f1=this.indices[i];
    var f2=this.indices[i+1];
    var f3=this.indices[i+2];
    addLine(lineIndices,existingLines,f1,f2);
    addLine(lineIndices,existingLines,f2,f3);
    addLine(lineIndices,existingLines,f3,f1);
  }
  return new SubMesh(this.vertices, lineIndices,
    this.attributeBits|Mesh.LINES_BIT);
}

/** @private */
SubMesh._isIdentityInUpperLeft=function(m){
 return (m[0]==1 && m[1]==0 && m[2]==0 &&
    m[4]==0 && m[5]==1 && m[6]==0 &&
    m[8]==0 && m[9]==0 && m[10]==1) ? true : false;
}
/** @private */
SubMesh.prototype.transform=function(matrix){
  var stride=this.getStride();
  var v=this.vertices;
  var isNonTranslation=!SubMesh._isIdentityInUpperLeft(matrix);
  var normalOffset=Mesh._normalOffset(this.attributeBits);
  var matrixForNormals=null;
  if(normalOffset>=0 && isNonTranslation){
   matrixForNormals=GLMath.mat4inverseTranspose3(matrix);
  }
  for(var i=0;i<v.length;i+=stride){
    var xform=GLMath.mat4transform(matrix,
      v[i],v[i+1],v[i+2],1.0);
    v[i]=xform[0];
    v[i+1]=xform[1];
    v[i+2]=xform[2];
    if(normalOffset>=0 && isNonTranslation){
     // Transform and normalize the normals
     // (using a modified matrix) to ensure
     // they point in the correct direction
     xform=GLMath.mat3transform(matrixForNormals,
      v[i+normalOffset],v[i+normalOffset+1],v[i+normalOffset+2]);
     GLMath.vec3normInPlace(xform);
     v[i+normalOffset]=xform[0];
     v[i+normalOffset+1]=xform[1];
     v[i+normalOffset+2]=xform[2];
    }
  }
  // TODO: Planned for 2.0.  Once implemented,
  // Mesh#transform will say:  "Also, resets the primitive
  // mode (see {@link glutil.Mesh#mode}) so that future vertices given
  // will not build upon previous vertices."
  //this.newPrimitive();
  return this;
}

/**
* Reverses the winding order of the triangles in this mesh
* by swapping the second and third vertex indices of each one.
* @return {glutil.Mesh} This object.
* @example <caption>
* The following code generates a mesh that survives face culling,
* since the same triangles occur on each side of the mesh, but
* with different winding orders.  This is useful when enabling
* back-face culling and drawing open geometric shapes such as
* those generated by Meshes.createCylinder or Meshes.createDisk.
* Due to the z-fighting effect, drawing this kind of mesh is
* recommended only if face culling is enabled.</caption>
* var frontBackMesh = originalMesh.merge(
*  new Mesh().merge(originalMesh).reverseWinding()
* );
*/
Mesh.prototype.reverseWinding=function(){
  for(var i=0;i<this.subMeshes.length;i++){
   this.subMeshes[i].reverseWinding();
  }
  return this;
}
/**
 * Enumerates the primitives (lines, triangles, and points) included
 * in this mesh.
 * @param {Function} func A function that will be called
 * for each primitive in the mesh.  The function takes a single
 * parameter, consisting of an array of one, two, or three vertex
 * objects.  A point will have one vertex, a line two vertices and
 * a triangle three.  Each vertex object may have these properties:<ul>
 * <li>"position": A 3-element array of the vertex's position.
 * Always present.
 * <li>"normal": A 3-element array of the vertex's normal.
 * May be absent.
 * <li>"color": An at least 3-element array of the vertex's color.
 * Each component generally ranges from 0 to 1. May be absent.
 * <li>"uv": A 2-element array of the vertex's texture coordinates
 * (the first element is U, the second is V).
 * Each component generally ranges from 0 to 1. May be absent.
 * </ul>
 * @return {glutil.Mesh} This object.
 */
Mesh.prototype.enumPrimitives=function(func){
 for(var i=0;i<this.subMeshes.length;i++){
  var sm=this.subMeshes[i];
  var prim=sm.primitiveType();
  var normals=Mesh._normalOffset(sm.attributeBits);
  var colors=Mesh._colorOffset(sm.attributeBits);
  var texcoords=Mesh._texCoordOffset(sm.attributeBits);
  var stride=sm.getStride();
  var v=sm.vertices;
  var primSize=3;
  if(prim==Mesh.LINES)primSize=2;
  if(prim==Mesh.POINTS)primSize=1;
  for(var j=0;j<sm.indices.length;j+=primSize){
   var p=[];
   for(var k=0;k<primSize;k++){
    var vi=sm.indices[j+k]*stride;
    var info={};
    info.position=[v[vi],v[vi+1],v[vi+2]];
    if(normals>=0)
     info.normal=[v[vi+normals],v[vi+normals+1],v[vi+normals+2]]
    if(colors>=0)
     info.color=[v[vi+colors],v[vi+colors+1],v[vi+colors+2]]
    if(texcoords>=0)
     info.uv=[v[vi+texcoords],v[vi+texcoords+1]]
    p.push(info)
   }
   func(p)
  }
 }
 return this;
}

/**
* Finds the tightest
* bounding box that holds all vertices in the mesh.
* @returns An array of six numbers describing the tightest
* axis-aligned bounding box
* that fits all vertices in the mesh. The first three numbers
* are the smallest-valued X, Y, and Z coordinates, and the
* last three are the largest-valued X, Y, and Z coordinates.
* If the mesh is empty, returns the array [Inf, Inf, Inf, -Inf,
* -Inf, -Inf].
*/
Mesh.prototype.getBoundingBox=function(){
 var empty=true;
 var inf=Number.POSITIVE_INFINITY;
 var ret=[inf,inf,inf,-inf,-inf,-inf];
 for(var i=0;i<this.subMeshes.length;i++){
  var sm=this.subMeshes[i];
  var stride=sm.getStride();
  var v=sm.vertices;
  for(var j=0;j<sm.indices.length;j++){
    var vi=sm.indices[j]*stride;
    if(empty){
     empty=false;
     ret[0]=ret[3]=v[vi];
     ret[1]=ret[4]=v[vi+1];
     ret[2]=ret[5]=v[vi+2];
    } else {
     ret[0]=Math.min(ret[0],v[vi]);
     ret[3]=Math.max(ret[3],v[vi]);
     ret[1]=Math.min(ret[1],v[vi+1]);
     ret[4]=Math.max(ret[4],v[vi+1]);
     ret[2]=Math.min(ret[2],v[vi+2]);
     ret[5]=Math.max(ret[5],v[vi+2]);
    }
  }
 }
 return ret;
}

Mesh._findTangentAndBitangent=function(vertices,v1,v2,v3,uvOffset){
  var t1 = vertices[v2] - vertices[v1];
  var t2 = vertices[v2+1] - vertices[v1+1];
  var t3 = vertices[v2+2] - vertices[v1+2];
  var t4 = vertices[v3] - vertices[v1];
  var t5 = vertices[v3+1] - vertices[v1+1];
  var t6 = vertices[v3+2] - vertices[v1+2];
  var t7 = vertices[v2+uvOffset] - vertices[v1+uvOffset];
  var t8 = vertices[v2+uvOffset+1] - vertices[v1+uvOffset+1];
  var t9 = vertices[v3+uvOffset] - vertices[v1+uvOffset];
  var t10 = vertices[v3+uvOffset+1] - vertices[v1+uvOffset+1];
  var t11 = ((((t7 * t10) - t8 * t9)));
  if(t11==0){
   return [0,0,0,0,0,0];
  }
  t11=1.0/t11;
  var t12 = -t8;
  var t13 = -t9;
  var t14 = (((t10 * t1) + t12 * t4)) * t11;
  var t15 = (((t10 * t2) + t12 * t5)) * t11;
  var t16 = (((t10 * t3) + t12 * t6)) * t11;
  var t17 = (((t13 * t1) + t7 * t4)) * t11;
  var t18 = (((t13 * t2) + t7 * t5)) * t11;
  var t19 = (((t13 * t3) + t7 * t6)) * t11;
  return [t14,t15,t16,t17,t18,t19];
}

Mesh._recalcTangentsInternal=function(vertices,indices,stride,
  uvOffset,normalOffset,tangentOffset){
 // NOTE: no need to specify bitangent offset, since tangent
 // and bitangent will always be contiguous (this method will
 // always be called after the recalcTangents method ensures
 // that both fields are present)
 var vi=[0,0,0];
 for(var i=0;i<indices.length;i+=3){
  vi[0]=indices[i]*stride;
  vi[1]=indices[i+1]*stride;
  vi[2]=indices[i+2]*stride;
  var ret=Mesh._findTangentAndBitangent(vertices,vi[0],vi[1],vi[2],uvOffset);
  // NOTE: It would be more mathematically correct to use the inverse
  // of the matrix
  //     [ Ax Bx Nx ]
  //     [ Ay By Ny ]
  //     [ Az Bz Nz ]
  // (where A and B are the tangent and bitangent and returned
  // in _findTangentAndBitangent) as the tangent space
  // transformation, that is, include three
  // different vectors (tangent, bitangent, and modified normal).
  // Instead we use the matrix
  //    [ AAx AAy AAz ]
  //    [ BBx BBy BBz ]
  //    [ Nx  Ny  Nz ]
  // (where AA and BB are the orthonormalized versions of the tangent
  // and bitangent) as the tangent space transform, in order to avoid
  // the need to also specify a transformed normal due to matrix inversion.
  for(var j=0;j<3;j++){
   var m=ret;
   var vicur=vi[j];
   var norm0=vertices[vicur+normalOffset];
   var norm1=vertices[vicur+normalOffset+1];
   var norm2=vertices[vicur+normalOffset+2];
   var t20 = (((m[0] * norm0) + m[1] * norm1) + m[2] * norm2);
   var tangent = GLMath.vec3normInPlace([
    (m[0] - t20 * norm0),
    (m[1] - t20 * norm1),
    (m[2] - t20 * norm2)]);
   var t22 = (((m[3] * norm0) + m[4] * norm1) + m[5] * norm2);
   var t23 = (((m[3] * tangent[0]) + m[4] * tangent[1]) + m[5] * tangent[2]);
   var bitangent = GLMath.vec3normInPlace([
    ((m[3] - t22 * norm0) - t23 * tangent[0]),
    ((m[4] - t22 * norm1) - t23 * tangent[1]),
    ((m[5] - t22 * norm2) - t23 * tangent[2])]);
   vertices[vicur+tangentOffset]=tangent[0];
   vertices[vicur+tangentOffset+1]=tangent[1];
   vertices[vicur+tangentOffset+2]=tangent[2];
   vertices[vicur+tangentOffset+3]=bitangent[0];
   vertices[vicur+tangentOffset+4]=bitangent[1];
   vertices[vicur+tangentOffset+5]=bitangent[2];
  }
 }
}
/** @private */
SubMesh.prototype.recalcTangents=function(){
  var tangentBits=Mesh.TANGENTS_BIT|Mesh.BITANGENTS_BIT;
  var haveOtherAttributes=((this.attributeBits&(Mesh.ATTRIBUTES_BITS&~tangentBits))!=0);
  var uvOffset=Mesh._texCoordOffset(this.attributeBits);
  var normalOffset=Mesh._normalOffset(this.attributeBits);
  if(uvOffset<0 || normalOffset<0){
   // can't generate tangents and bitangents
   // without normals or texture coordinates.
   return this;
  }
  this._rebuildVertices(tangentBits);
  if(haveOtherAttributes){
    this.makeRedundant();
  }
  if(this.primitiveType()==Mesh.TRIANGLES){
   var tangentOffset=Mesh._tangentOffset(this.attributeBits);
   Mesh._recalcTangentsInternal(this.vertices,this.indices,
     this.getStride(),uvOffset,normalOffset,tangentOffset);
   }
  return this;
};
/**
* Modifies this mesh by reversing the sign of normals it defines.
* @return {glutil.Mesh} This object.
* @example <caption>
* The following code generates a two-sided mesh, where
* the normals on each side face in the opposite direction.
* This is only useful when drawing open geometric shapes such as
* those generated by Meshes.createCylinder or Meshes.createDisk.
* Due to the z-fighting effect, drawing a two-sided mesh is
* recommended only if face culling is enabled.</caption>
* var twoSidedMesh = originalMesh.merge(
*  new Mesh().merge(originalMesh).reverseWinding().reverseNormals()
* );
*/
Mesh.prototype.reverseNormals=function(){
  for(var i=0;i<this.subMeshes.length;i++){
   var stride=this.subMeshes[i].getStride();
   var vertices=this.subMeshes[i].vertices;
   var normalOffset=Mesh._normalOffset(
     this.subMeshes[i].attributeBits);
   if(normalOffset<0)continue;
   for(var i=0;i<vertices.length;i+=stride){
    var x=vertices[i+normalOffset];
    var y=vertices[i+normalOffset+1];
    var z=vertices[i+normalOffset+2];
    vertices[i+normalOffset]=-x;
    vertices[i+normalOffset+1]=-y;
    vertices[i+normalOffset+2]=-z;
   }
  }
  return this;
}

/** @private */
SubMesh.prototype.reverseWinding=function(){
  if((this.attributeBits&Mesh.PRIMITIVES_BITS)!=0){
   // Not a triangle mesh
   return this;
  }
  for(var i=0;i<this.indices.length;i+=3){
    var f2=this.indices[i+1];
    var f3=this.indices[i+2];
    this.indices[i+2]=f2;
    this.indices[i+1]=f3;
  }
  return this;
}

/** @private */
SubMesh.prototype.recalcNormals=function(flat,inward){
  var haveOtherAttributes=((this.attributeBits&(Mesh.ATTRIBUTES_BITS&~Mesh.NORMALS_BIT))!=0);
  this._rebuildVertices(Mesh.NORMALS_BIT);
  // No need to duplicate vertices if there are no other attributes
  // besides normals and smooth shading is requested; the
  // recalculation will reinitialize normals to 0 and
  // add the calculated normals to vertices as they are implicated
  if(haveOtherAttributes || flat){
    this.makeRedundant();
  }
  if(this.primitiveType()==Mesh.LINES){
   Mesh._recalcNormalsLines(this.vertices,this.indices,
     this.getStride(),3,flat,inward);
  } else {
   Mesh._recalcNormals(this.vertices,this.indices,
     this.getStride(),3,flat,inward);
  }
  return this;
};
/** @private */
SubMesh.prototype.setColor3=function(r,g,b){
  this._rebuildVertices(Mesh.COLORS_BIT);
  var stride=this.getStride();
  var colorOffset=Mesh._colorOffset(this.attributeBits);
  for(var i=colorOffset;i<this.vertices.length;i+=stride){
    this.vertices[i]=r;
    this.vertices[i+1]=g;
    this.vertices[i+2]=b;
  }
  return this;
};
/** @private */
Mesh._getStride=function(format){
  var s=[3,6,6,9,5,8,8,11][format&(Mesh.NORMALS_BIT|Mesh.COLORS_BIT|Mesh.TEXCOORDS_BIT)];
  if((format&Mesh.TANGENTS_BIT)!=0)s+=3
  if((format&Mesh.BITANGENTS_BIT)!=0)s+=3
  return s
 }
/** @private */
Mesh._normalOffset=function(format){
  return [-1,3,-1,3,-1,3,-1,3][format&(Mesh.NORMALS_BIT|Mesh.COLORS_BIT|Mesh.TEXCOORDS_BIT)];
 }
/** @private */
Mesh._tangentOffset=function(format){
  var x=3;
  if((format&Mesh.TANGENTS_BIT)==0)return -1;
  if((format&Mesh.NORMALS_BIT)!=0)x+=3
  if((format&Mesh.COLORS_BIT)!=0)x+=3
  if((format&Mesh.TEXCOORDS_BIT)!=0)x+=2
  return x;
 }
/** @private */
Mesh._bitangentOffset=function(format){
  var x=3;
  if((format&Mesh.BITANGENTS_BIT)==0)return -1;
  if((format&Mesh.NORMALS_BIT)!=0)x+=3
  if((format&Mesh.COLORS_BIT)!=0)x+=3
  if((format&Mesh.TEXCOORDS_BIT)!=0)x+=2
  if((format&Mesh.TANGENTS_BIT)!=0)x+=3
  return x;
 }
/** @private */
Mesh._colorOffset=function(format){
  return [-1,-1,3,6,-1,-1,3,6][format&(Mesh.NORMALS_BIT|Mesh.COLORS_BIT|Mesh.TEXCOORDS_BIT)];
 }
/** @private */
Mesh._texCoordOffset=function(format){
  return [-1,-1,-1,-1,3,6,6,9][format&(Mesh.NORMALS_BIT|Mesh.COLORS_BIT|Mesh.TEXCOORDS_BIT)];
}
/**
 @private */
Mesh.ATTRIBUTES_BITS = 255;
/**
 @private */
Mesh.PRIMITIVES_BITS = 768;
/** The mesh contains normals for each vertex.
 @const
 @default
*/
Mesh.NORMALS_BIT = 1;
/** The mesh contains colors for each vertex.
 @const
 @default
*/
Mesh.COLORS_BIT = 2;
/** The mesh contains texture coordinates for each vertex.
 @const
 @default
*/
Mesh.TEXCOORDS_BIT = 4;
/**
 The mesh contains tangent vectors for each vertex.
 @const
 @default
*/
Mesh.TANGENTS_BIT = 8;
/**
 The mesh contains bitangent vectors for each vertex.
 @const
 @default
*/
Mesh.BITANGENTS_BIT = 16;
/** The mesh consists of lines (2 vertices per line) instead
of triangles (3 vertices per line).
 @const
 @default
*/
Mesh.LINES_BIT = 256;
/** The mesh consists of points (1 vertex per line).
 @const
 @default
*/
Mesh.POINTS_BIT = 512;
/**
Primitive mode for rendering triangles, made up
of 3 vertices each.
 @const
 @default
*/
Mesh.TRIANGLES = 4;
/**
Primitive mode for rendering a strip of quadrilaterals (quads).
The first 4 vertices make up the first quad, and each additional
quad is made up of the last 2 vertices of the previous quad and
2 new vertices. Each quad is broken into two triangles: the first
triangle consists of the first, second, and third vertices, in that order,
and the second triangle consists of the third, second, and fourth
vertices, in that order.
 @const
 @default
*/
Mesh.QUAD_STRIP = 8;
/**
Primitive mode for rendering quadrilaterals, made up
of 4 vertices each.  Each quadrilateral is broken into two triangles: the first
triangle consists of the first, second, and third vertices, in that order,
and the second triangle consists of the first, third, and fourth
vertices, in that order.
 @const
 @default
 */
Mesh.QUADS = 7;
/**
Primitive mode for rendering line segments, made up
of 2 vertices each.
 @const
*/
Mesh.LINES = 1;
/**
Primitive mode for rendering a triangle fan.  The first 3
vertices make up the first triangle, and each additional
triangle is made up of the first vertex of the first triangle,
the previous vertex, and 1 new vertex.
 @const
 @default
*/
Mesh.TRIANGLE_FAN = 6;
/**
Primitive mode for rendering a triangle strip.  The first 3
vertices make up the first triangle, and each additional
triangle is made up of the last 2 vertices and 1
new vertex.  For the second triangle in the strip, and
every other triangle after that, the first and second
vertices are swapped when generating that triangle.
 @const
 @default
*/
Mesh.TRIANGLE_STRIP = 5;
/**
Primitive mode for rendering connected line segments.
The first 2 vertices make up the first line, and each additional
line is made up of the last vertex and 1 new vertex.
 @const
 @default
*/
Mesh.LINE_STRIP = 3;
/**
Primitive mode for rendering points, made up
of 1 vertex each.
 @const
 @default
*/
Mesh.POINTS = 0;

this["Mesh"]=Mesh;
;
/*
Written by Peter O. in 2015.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://upokecenter.dreamhosters.com/articles/donate-now-2/
*/
(function(global){
/**
 * A parametric evaluator for B&eacute;zier curves.<p>
 * A B&eacute;zier curve is defined by a series of control points, where
 * the first and last control points define the endpoints of the curve, and
 * the remaining control points define the curve's shape, though they don't
 * necessarily cross the curve.
 * @class
 * @alias BezierCurve
 * @param {Array<Array<number>>} controlPoints An array of control points.  Each
 * control point is an array with the same length as the other control points.
 * It is assumed that:<ul>
 * <li>The length of this parameter minus 1 represents the degree of the B&eacute;zier
 * curve.  For example, a degree-3 (cubic) curve
 * contains 4 control points.  A degree of 1 results in a straight line segment.
 * <li>The first control point's length represents the size of all the control
 * points.
 * </ul>
 * @param {number} [u1] Starting point for the purpose of interpolation; it will correspond to 0.
 * May be omitted; default is 0.
 * @param {number} [u2] Ending point for the purpose of interpolation; it will correspond to 1.
 * May be omitted; default is 1.
 */
var BezierCurve=function(cp, u1, u2){
 if(typeof u1=="undefined" && typeof u2=="undefined"){
  this.uoffset=0;
  this.umul=1;
 } else if(u1==u2){
  throw new Error("u1 and u2 can't be equal")
 } else {
  this.uoffset=u1;
  this.umul=1.0/(u2-u1);
 }
 this.evaluator=BSplineCurve.clamped(cp,cp.length-1);
};
/**
 * Evaluates the curve function based on a point
 * in a B&eacute;zier curve.
 * @param {number} u Point on the curve to evaluate (generally within the range
 * given in the constructor).
 * @return {Array<number>} An array of the result of
 * the evaluation.  Its length will be equal to the
 * length of a control point, as specified in the constructor.
* @example
* // Generate 11 points forming the B&eacute;zier curve.
* // Assumes the curve was created with u1=0 and u2=1 (the default).
* var points=[];
* for(var i=0;i<=10;i++){
*  points.push(curve.evaluate(i/10.0));
* }
 */
BezierCurve.prototype.evaluate=function(u){
 return this.evaluator.evaluate((u-this.uoffset)*this.umul);
}
/**
 * A parametric evaluator for B&eacute;zier surfaces.<p>
 * A B&eacute;zier surface is defined by a series of control points, where
 * the control points on each corner define the endpoints of the surface, and
 * the remaining control points define the surface's shape, though they don't
 * necessarily cross the surface.
 * @class
 * @alias BezierSurface
 * @param {Array<Array<number>>} controlPoints An array of control point
 * arrays, which in turn contain a number of control points.  Each
 * control point is an array with the same length as the other control points.
 * It is assumed that:<ul>
 * <li>The length of this parameter minus 1 represents the degree of the B&eacute;zier
 * surface along the V axis.  For example, a degree-3 (cubic) surface along the V axis
 * contains 4 control points, one in each control point array.  A degree of 1 on
 * both the U and V axes results in a flat surface.
 * <li>The length of the first control point array minus 1 represents the degree of the B&eacute;zier
 * surface along the U axis.
 * <li>The first control point's length represents the size of all the control
 * points.
 * </ul>
 * @param {number} [u1] Starting point for the purpose of interpolation along the
 * U-axis; it will correspond to 0.
 * May be omitted; default is 0.
 * @param {number} [u2] Ending point for the purpose of interpolation along the
 * U-axis; it will correspond to 1.
 * May be omitted; default is 1.
 * @param {number} [v1] Starting point for the purpose of interpolation along the
 * V-axis; it will correspond to 0.
 * May be omitted; default is 0.
 * @param {number} [v2] Ending point for the purpose of interpolation along the
 * V-axis; it will correspond to 1.
 * May be omitted; default is 1.
 */
var BezierSurface=function(cp, u1, u2, v1, v2){
 if(typeof u1=="undefined" && typeof u2=="undefined" &&
    typeof v1=="undefined" && typeof v2=="undefined"){
  this.uoffset=0;
  this.umul=1;
  this.voffset=0;
  this.vmul=1;
 } else if(u1==u2){
  throw new Error("u1 and u2 can't be equal")
 } else if(v1==v2){
  throw new Error("v1 and v2 can't be equal")
 } else {
  this.uoffset=u1;
  this.umul=1.0/(u2-u1);
  this.voffset=v1;
  this.vmul=1.0/(v2-v1);
 }
 this.evaluator=BSplineSurface.clamped(cp,cp[0].length-1,cp.length-1);
}
/**
 * Evaluates the surface function based on a point
 * in a B&eacute;zier surface.
 * @param {number} u U-coordinate of the surface to evaluate (generally within the range
 * given in the constructor).
 * @param {number} v V-coordinate of the surface to evaluate.
 * @return {Array<number>} An array of the result of
 * the evaluation.  Its length will be equal to the
 * length of a control point, as specified in the constructor.
 */
 BezierSurface.prototype.evaluate=function(u,v, output){
 return this.evaluator.evaluate((u-this.uoffset)*this.umul,
   (v-this.voffset)*this.vmul);
}

/**
* A parametric evaluator for B-spline (basis spline) curves.
* @class
* @alias BSplineCurve
 * @param {Array<Array<number>>} controlPoints An array of control points.  Each
 * control point is an array with the same length as the other control points.
 * It is assumed that the first control point's length represents the size of all the control
 * points.
* @param {Array<number>} knots Knot vector of the curve.
* Its size must be at least 2 plus the number of control
* points and not more than twice the number of control points.<p>
* The length of this parameter minus 1, minus the number
* of control points, represents the degree of the B-spline
* curve.  For example, a degree-3 (cubic) B-spline curve contains 4 more
* knots than the number of control points.  A degree of 1
* results in straight line segments.<p>
* The knot vector must be a nondecreasing sequence and
* the first knot must not equal the last.<p>
* If the difference between one knot and the next isn't the same,
* the curve is considered a <i>non-uniform</i>
* B-spline curve.<p>
* If there are N times 2 knots with the first N knots equal to 0 and the rest
* equal to 1, where N is the number of control points,
* the control points describe a <i>B&eacute;zier</i> curve, in which the
* first and last control points match the curve's end points.<p>
* @param {boolean} [bits] Bits for defining input
* and controlling output.  Zero or more of BSplineCurve.WEIGHTED_BIT,
* BSplineCurve.HOMOGENEOUS_BIT,
* and BSplineCurve.DIVIDE_BIT. If null or omitted, no bits are set.
*/
var BSplineCurve=function(controlPoints, knots, bits){
 if(controlPoints.length<=0)throw new Error();
 if(!knots)throw new Error();
 this.bits=bits||0;
 var order=knots.length-controlPoints.length;
 if(order<2 || order>controlPoints.length)
  throw new Error();
 BSplineCurve._checkKnots(knots);
 this.cplen=controlPoints[0].length;
 var cplenNeeded=1;
 if((this.bits&(BSplineCurve.WEIGHTED_BIT|BSplineCurve.DIVIDE_BIT))!=0){
  cplenNeeded=2;
 }
 if((this.bits&(BSplineCurve.WEIGHTED_BIT))!=0){
  this.cplen--;
 }
 if(this.cplen<cplenNeeded)throw new Error();
 this.knots=knots;
 this.buffer=[];
 this.controlPoints=controlPoints;
}

/**
* Indicates whether the last coordinate of each control point is a
* weight.  If some of the weights differ, the curve is
* considered a <i>rational</i> B-spline curve.
* If this bit is set, the length of each control point must be at least 2,
* and points returned by the curve's <code>evaluate</code>
* method will be in homogeneous coordinates.
* @const
* @default
*/
BSplineCurve.WEIGHTED_BIT = 1;
/**
* Indicates to divide each other coordinate of the returned point
* by the last coordinate of the point and omit the last
* coordinate.  This is used with WEIGHTED_BIT to convert
* homogeneous coordinates to conventional coordinates.
* If this bit is set, the length of each control point must be at least 2.
* @const
* @default
*/
BSplineCurve.DIVIDE_BIT = 2;
/**
* Indicates that each other coordinate of each control point
* was premultiplied by the last coordinate of the point, that is,
* each control point is in homogeneous coordinates.
* Only used with WEIGHTED_BIT.
* @const
* @default
*/
BSplineCurve.HOMOGENEOUS_BIT = 4;
/**
* Combination of WEIGHTED_BIT and DIVIDE_BIT.
* @const
*/
BSplineCurve.WEIGHTED_DIVIDE_BITS = 3;

BSplineCurve._checkKnots=function(knots){
 for(var i=1;i<knots.length;i++){
  if(knots[i]<knots[i-1])
   throw new Error();
 }
 if(knots[0]==knots[knots.length-1])throw new Error();
}
BSplineCurve._getFactors=function(kn,t,order,numPoints,buffer){
 var c=1;
 for(var i=0;i<numPoints;i++){
   buffer[i]=0;
 }
 if(t==kn[0]){
  buffer[0]=1;
 } else if(t==kn[kn.length-1]){
  buffer[numPoints-1]=1;
 } else {
  var k=-1;
  for(var i=0;i<=kn.length;i++){
    if(kn[i]<=t && t<kn[i+1]){
      k=i;
      break;
    }
  }
  if(k<0)return;
  var tmp=[];
  var c=k-1;
  tmp[k]=1;
  for(var kk=2;kk<=order;kk++,c--){
   for(var i=c;i<=k;i++){
    var ret=0,divisor=0;
    var prv=(i<=c) ? 0 : tmp[i];
    var nxt=(i>=k) ? 0 : tmp[i+1];
    if(prv!=0){
     divisor=kn[i+kk-1]-kn[i]
     ret+=divisor==0 ? 0 : prv*(t-kn[i])/divisor;
    }
    if(nxt!=0){
     var ikk=kn[i+kk];
     divisor=ikk-kn[i+1]
     ret+=divisor==0 ? 0 : nxt*(ikk-t)/divisor;
    }
    buffer[i]=ret;
   }
   if(kk<order){
    for(var i=c;i<=k;i++){
     tmp[i]=buffer[i];
    }
   }
  }
 }
}

/**
 * Evaluates the curve function based on a point
 * in a B-spline curve.
 * @param {number} u Point on the curve to evaluate (from 0 through 1).
 * @return {Array<number>} An array of the result of
 * the evaluation.  Its length will be equal to the
 * length of a control point (minus 1 if DIVIDE_BIT is set), as specified in the constructor.
* @example
* // Generate 11 points forming the B-spline curve.
* var points=[];
* for(var i=0;i<=10;i++){
*  points.push(curve.evaluate(i/10.0));
* }
 */
BSplineCurve.prototype.evaluate=function(u){
  var numPoints=this.controlPoints.length;
  var order=this.knots.length-numPoints;
  var oldu=u
  u=this.knots[order-1]+u*(this.knots[numPoints]-
    this.knots[order-1]);
  BSplineCurve._getFactors(this.knots, u, order, numPoints,
     this.buffer);
  if((this.bits&BSplineCurve.WEIGHTED_BIT)!=0){
  // this is a weighted NURBS
  var ret=[];
  var weight=0;
  for(var j=0;j<numPoints;j++){
   weight+=this.buffer[j]*this.controlPoints[j][this.cplen];
  }
  var homogen=(this.bits&BSplineCurve.HOMOGENEOUS_BIT)!=0;
  for(var i=0;i<this.cplen+1;i++){
   var point=0;
   for(var j=0;j<numPoints;j++){
    var w=this.buffer[j];
    if(!homogen)w*=this.controlPoints[j][this.cplen];
    point+=this.controlPoints[j][i]*w;
   }
   ret[i]=point/weight;
  }
  if((this.bits&BSplineCurve.DIVIDE_BIT)!=0){
   for(var i=0;i<this.cplen;i++){
    ret[i]/=ret[this.cplen];
   }
   ret=ret.slice(0,this.cplen);
  }
  return ret;
 } else {
  var ret=[];
  for(var i=0;i<this.cplen;i++){
   var point=0;
   for(var j=0;j<numPoints;j++){
    point+=this.controlPoints[j][i]*this.buffer[j];
   }
   ret[i]=point;
  }
  if((this.bits&BSplineCurve.DIVIDE_BIT)!=0){
   for(var i=0;i<this.cplen-1;i++){
    ret[i]/=ret[this.cplen-1];
   }
   ret=ret.slice(0,this.cplen-1);
  }
  return ret;
 }
}

/**
* A parametric evaluator for B-spline (basis spline) surfaces.
* @class
* @alias BSplineSurface
 * @param {Array<Array<number>>} controlPoints An array of control point
 * arrays, which in turn contain a number of control points.  Each
 * control point is an array with the same length as the other control points.
 * It is assumed that:<ul>
 * <li>The length of this parameter is the number of control points in each row of
 * the V axis.
 * <li>The length of the first control point array is the number of control points in
* each column of the U axis.
 * <li>The first control point's length represents the size of all the control
 * points.
 * </ul>
* @param {Array<number>} knotsU Knot vector of the curve, along the U-axis.
* For more information, see {@link glutil.BSplineCurve}.
* @param {Array<number>} knotsV Knot vector of the curve, along the V-axis.
* @param {boolean} [bits] Bits for defining input
* and controlling output.  Zero or more of BSplineCurve.WEIGHTED_BIT,
* BSplineCurve.HOMOGENEOUS_BIT,
* and BSplineCurve.DIVIDE_BIT.  If null or omitted, no bits are set.
*/
var BSplineSurface=function(controlPoints, knotsU, knotsV, bits){
 var vcplen=controlPoints.length;
 if(vcplen<=0)throw new Error();
 var ucplen=controlPoints[0].length;
 if(ucplen<=0)throw new Error();
 var cplen=controlPoints[0][0].length;
 var cplenNeeded=1;
 this.bits=bits||0;
 if((this.bits&(BSplineCurve.WEIGHTED_BIT|BSplineCurve.DIVIDE_BIT))!=0){
  cplenNeeded=2;
 }
 if((this.bits&(BSplineCurve.WEIGHTED_BIT|BSplineCurve.HOMOGENEOUS_BIT))!=0){
  cplen--;
 }
 if(cplen<cplenNeeded)throw new Error();
 if(!knotsU || !knotsV)throw new Error();
 this.orderU=knotsU.length-ucplen;
 this.orderV=knotsV.length-vcplen;
 this.vcplen=vcplen;
 this.ucplen=ucplen;
 this.cplen=cplen;
 if(this.orderU<2 || this.orderU>ucplen)throw new Error();
 if(this.orderV<2 || this.orderV>vcplen)throw new Error();
 BSplineCurve._checkKnots(knotsU);
 BSplineCurve._checkKnots(knotsV);
 this.knotsU=knotsU;
 this.knotsV=knotsV;
 this.bufferU=[];
 this.bufferV=[];
 this.controlPoints=controlPoints;
}
/**
* Creates a B-spline curve with uniform knots, except that
* the curve will start and end at the first and last control points.
* @param {Array<Array<number>>} controlPoints Array of
* control points as specified in the {@link glutil.BSplineCurve} constructor.
* @param {number} [degree] Degree of the B-Spline
* curve.  For example, 3 means a degree-3 (cubic) curve.
* If null or omitted, the default is 3.
* @param {number} [bits] Bits as specified in the {@link glutil.BSplineCurve} constructor.
* @return {BSplineCurve} Return value.*/
BSplineCurve.clamped=function(controlPoints,degree,bits){
 return new BSplineCurve(controlPoints,
   BSplineCurve.clampedKnots(controlPoints.length,degree),bits)
}
/**
* Creates a B-spline curve with uniform knots.
* @param {Array<Array<number>>} controlPoints Array of
* control points as specified in the {@link glutil.BSplineCurve} constructor.
* @param {number} [degree] Degree of the B-Spline
* curve.  For example, 3 means a degree-3 (cubic) curve.
* If null or omitted, the default is 3.
* @param {number} [bits] Bits as specified in the {@link glutil.BSplineCurve} constructor.
* @return {BSplineCurve} Return value.*/
BSplineCurve.uniform=function(controlPoints,degree,bits){
 return new BSplineCurve(controlPoints,
   BSplineCurve.uniformKnots(controlPoints.length,degree),bits)
}
/**
* Creates a B-spline surface with uniform knots, except that
* the surface's edges lie on the edges of the control point array.
* @param {Array<Array<Array<number>>>} controlPoints Array of
* control point arrays as specified in the {@link glutil.BSplineSurface} constructor.
* @param {number} [degreeU] Degree of the B-Spline
* surface along the U-axis.  For example, 3 means a degree-3 (cubic) curve.
* If null or omitted, the default is 3.
* @param {number} [degreeV] Degree of the B-Spline
* surface along the V-axis
* If null or omitted, the default is 3.
* @param {number} [bits] Bits as specified in the {@link glutil.BSplineSurface} constructor.
* @return {BSplineSurface} Return value.*/
BSplineSurface.clamped=function(controlPoints,degreeU,degreeV,bits){
 return new BSplineSurface(controlPoints,
   BSplineCurve.clampedKnots(controlPoints[0].length,degreeU),
   BSplineCurve.clampedKnots(controlPoints.length,degreeV),bits)
}
/**
* Creates a B-spline surface with uniform knots.
* @param {Array<Array<Array<number>>>} controlPoints Array of
* control point arrays as specified in the {@link glutil.BSplineSurface} constructor.
* @param {number} [degreeU] Degree of the B-Spline
* surface along the U-axis.  For example, 3 means a degree-3 (cubic) curve.
* If null or omitted, the default is 3.
* @param {number} [degreeV] Degree of the B-Spline
* surface along the V-axis
* If null or omitted, the default is 3.
* @param {number} [bits] Bits as specified in the {@link glutil.BSplineSurface} constructor.
* @return {BSplineSurface} Return value.*/
BSplineSurface.uniform=function(controlPoints,degreeU,degreeV,bits){
 return new BSplineSurface(controlPoints,
   BSplineCurve.uniformKnots(controlPoints[0].length,degreeU),
   BSplineCurve.uniformKnots(controlPoints.length,degreeV),bits)
}
/**
* Not documented yet.
*/
BSplineCurve.uniformKnots=function(controlPoints,degree){
  if(typeof controlPoints=="object")
   controlPoints=controlPoints.length;
  if(degree==null)degree=3
  if(controlPoints<degree+1)
   throw new Error("too few control points for degree "+degree+" curve")
  var order=degree+1;
  var ret=[]
  for(var i=0;i<controlPoints+order;i++){
   ret.push(i)
  }
  return ret;
}
/**
* Not documented yet.
*/
BSplineCurve.clampedKnots=function(controlPoints,degree){
  if(typeof controlPoints=="object")
   controlPoints=controlPoints.length;
  if(degree==null)degree=3
  if(controlPoints<degree+1)
   throw new Error("too few control points for degree "+degree+" curve")
  var order=degree+1;
  var extras=controlPoints-order;
  var ret=[];
  for(var i=0;i<order;i++){
   ret.push(0)
  }
  for(var i=0;i<extras;i++){
   ret.push(i+1);
  }
  for(var i=0;i<order;i++){
   ret.push(extras+1);
  }
  return ret;
}

/**
 * Evaluates the surface function based on a point
 * in a B-spline surface.
 * @param {number} u U-coordinate of the surface to evaluate (from 0 through 1).
 * @param {number} v V-coordinate of the surface to evaluate.
 * @return {Array<number>} An array of the result of
 * the evaluation.  Its length will be equal to the
 * length of a control point (minus 1 if if DIVIDE_BIT is set), as specified in the constructor.
 */
BSplineSurface.prototype.evaluate=function(u,v){
  u=this.knotsU[this.orderU-1]+u*(this.knotsU[this.ucplen]-
    this.knotsU[this.orderU-1]);
  v=this.knotsV[this.orderV-1]+v*(this.knotsV[this.vcplen]-
    this.knotsV[this.orderV-1]);
  var bu=this.bufferU;
  var bv=this.bufferV;
  if(this.orderU==this.orderV){
   BSplineCurve._getFactors(this.knotsU, u, this.orderU, this.ucplen,
     this.bufferU);
   BSplineCurve._getFactors(this.knotsV, v, this.orderV, this.vcplen,
     this.bufferV);
  } else {
   BSplineCurve._getFactors(this.knotsU, u, this.orderU, this.ucplen,
     this.bufferU);
   BSplineCurve._getFactors(this.knotsV, v, this.orderV, this.vcplen,
     this.bufferV);
  }
 var output=[];
  if((this.bits&BSplineCurve.WEIGHTED_BIT)!=0){
  // this is a weighted NURBS
  var weight=0;
  var homogen=(this.bits&BSplineCurve.HOMOGENEOUS_BIT)!=0;
  for(var tt=0;tt<this.ucplen;tt++){
    for(var uu=0;uu<this.vcplen;uu++){
     var w=bu[tt]*bv[uu]*this.controlPoints[uu][tt][this.cplen];
     weight+=w;
    }
  }
  for(var i=0;i<this.cplen+1;i++){
   var value=0;
   var weight=0;
   for(var tt=0;tt<this.ucplen;tt++){
    for(var uu=0;uu<this.vcplen;uu++){
     var w=bu[tt]*bv[uu];
     if(!homogen)w*=this.controlPoints[uu][tt][this.cplen];
     value+=this.controlPoints[uu][tt][i]*w;
    }
   }
   output[i]=(weight==0) ? value : value/weight;
  }
  if((this.bits&BSplineCurve.DIVIDE_BIT)!=0){
   for(var i=0;i<this.cplen;i++){
    output[i]/=output[this.cplen];
   }
   output=output.slice(0,this.cplen)
  }
  return output;
 } else {
  for(var i=0;i<this.cplen;i++){
   var value=0;
   for(var tt=0;tt<this.ucplen;tt++){
    for(var uu=0;uu<this.vcplen;uu++){
     value+=this.controlPoints[uu][tt][i]*bu[tt]*bv[uu];
    }
   }
   output[i]=value;
  }
  if((this.bits&BSplineCurve.DIVIDE_BIT)!=0){
   for(var i=0;i<this.cplen-1;i++){
    output[i]/=output[this.cplen-1];
   }
   output=output.slice(0,this.cplen-1)
  }
  return output;
 }
}

/**
* An evaluator of parametric curve functions for generating
* vertex positions, normals, colors, and texture coordinates
* of a curve.<p>
* A parametric curve is a curve whose points are based on a
* parametric curve function.  A curve function takes a number
* (U) and returns a point (in 1, 2, 3 or more dimensions, but
* usually 2 or 3) that lies on the curve.  For example, in 3
* dimensions, a curve function has the following form:<p>
* <b>F</b>(u) = [ x(u), y(u), z(u) ]<p>
* where x(u) returns an X coordinate, y(u) a Y coordinate,
* and z(u) returns a Z coordinate.<p>
* For more information, see the {@tutorial surfaces} tutorial.
* @class
* @alias CurveEval
*/
var CurveEval=function(){
 this.colorCurve=null;
 this.normalCurve=null;
 this.texCoordCurve=null;
 this.vertexCurve=null;
}

/**
* Specifies a parametric curve function for generating vertex positions.
* @param {object} evaluator An object that must contain a function
* named "evaluate".  It takes the following parameter:<ul>
* <li><code>u</code> - A curve coordinate, generally from 0 to 1.
* </ul>
* The evaluator function returns an array of the result of the evaluation.
* @return {CurveEval} This object.
* @example <caption>The following function sets a circle as the curve
* to use for generating vertex positions.</caption>
* // "u" can range from 0 to 2*Math.PI
* curveEval.vertex({"evaluate":function(u){
*  return [Math.cos(u),Math.sin(u),0]
* }});
*/
CurveEval.prototype.vertex=function(evaluator){
 this.vertexCurve=evaluator;
 return this;
}
/**
* Specifies a parametric curve function for generating normals.
* @param {object} evaluator An object that must contain a function
* named "evaluate", giving 3 values as a result.  See {@link CurveEval#vertex}.
* </ul>
* @return {CurveEval} This object.
*/
CurveEval.prototype.normal=function(evaluator){
 this.normalCurve=evaluator;
 return this;
}
/**
* Specifies a parametric curve function for generating color values.
* @param {object} evaluator An object that must contain a function
* named "evaluate", giving 3 values as a result.  See {@link CurveEval#vertex}.
* </ul>
* @return {CurveEval} This object.
*/
CurveEval.prototype.color=function(evaluator){
 this.colorCurve=evaluator;
 return this;
}
/**
* Specifies a parametric curve function for generating texture coordinates.
* @param {object} evaluator An object that must contain a function
* named "evaluate", giving 2 values as a result.  See {@link CurveEval#vertex}.
* </ul>
* @return {CurveEval} This object.
*/
CurveEval.prototype.texCoord=function(evaluator){
 this.texCoordCurve=evaluator;
 return this;
}
/**
 * Specifies a B&eacute;zier curve used for generating vertex positions.
 * @deprecated Use the <code>vertex()</code> method instead with a
 * BezierCurve object.
 * @param {Array<Array<number>>} controlPoints Control points as specified in {@link BezierCurve},
 * where each point is a 3-element array giving the x, y, and z coordinates of a vertex
 * position.
 * @param {number} [u1] Starting point; see {@link BezierCurve}.
 * @param {number} [u2] Ending point; see {@link BezierCurve}.
 * @return {CurveEval} This object.
 */
CurveEval.prototype.vertexBezier=function(controlPoints,u1,u2){
 this.vertexCurve=new BezierCurve(controlPoints,u1,u2);
 if(controlPoints[0].length!=3)
   throw new Error("unsupported vertex length")
 return this;
}
/**
 * Specifies a B&eacute;zier curve used for generating normals.
 * @deprecated Use the <code>normal()</code> method instead with a
 * BezierCurve object.
 * @param {Array<Array<number>>} controlPoints Control points as specified in {@link BezierCurve},
 * where each point is a 3-element array giving the x, y, and z coordinates of a normal.
 * @param {number} [u1] Starting point; see {@link BezierCurve}.
 * @param {number} [u2] Ending point; see {@link BezierCurve}.
 * @return {CurveEval} This object.
*/
CurveEval.prototype.normalBezier=function(controlPoints,u1,u2){
 this.normalCurve=new BezierCurve(controlPoints,u1,u2);
 if(controlPoints[0].length!=3)
   throw new Error("invalid normal length")
 return this;
}
/**
 * Specifies a B&eacute;zier curve used for generating texture coordinates.
 * @deprecated Use the <code>texCoord()</code> method instead with a
 * BezierCurve object.
 * @param {Array<Array<number>>} controlPoints Control points as specified in {@link BezierCurve},
 * where each point is a 1- or 2-element array giving the u and v texture coordinates.
 * @param {number} [u1] Starting point; see {@link BezierCurve}.
 * @param {number} [u2] Ending point; see {@link BezierCurve}.
 * @return {CurveEval} This object.
 */
CurveEval.prototype.texCoordBezier=function(controlPoints,u1,u2){
 this.texCoordCurve=new BezierCurve(controlPoints,u1,u2);
 if(controlPoints[0].length!=1 && this.texCoordCurve.k!=2)
   throw new Error("unsupported texcoord length")
 return this;
}
/**
 * Specifies a B&eacute;zier curve used for generating color values.
 * @deprecated Use the <code>colorBezier()</code> method instead with a
 * BezierCurve object.
 * @param {Array<Array<number>>} controlPoints Control points as specified in {@link BezierCurve},
 * where each point is a 3-element array giving the red, green, and blue
 * values of a color.
 * @param {number} [u1] Starting point; see {@link BezierCurve}.
 * @param {number} [u2] Ending point; see {@link BezierCurve}.
 * @return {CurveEval} This object.
 */
CurveEval.prototype.colorBezier=function(controlPoints,u1,u2){
 this.colorCurve=new BezierCurve(controlPoints,u1,u2);
 if(controlPoints[0].length!=3)
   throw new Error("unsupported color length")
 return this;
}
/**
 * Generates vertex positions and attributes based on a point
 * in a parametric curve.
 * @param {glutil.Mesh} mesh Mesh where vertex positions and attributes
 * will be generated.  When this method returns, the current color, normal,
 * and texture coordinates will be the same as they were before the method
 * started.
 * @param {number} u Point of the curve to evaluate (for
 * B&eacute;zier curves, generally within the range
 * given in the <code>vectorBezier</code>, <code>normalBezier</code>,
 * <code>colorBezier</code>, and <code>texCoordBezier</code> methods).
 * @return {CurveEval} This object.
 */
CurveEval.prototype.evalOne=function(mesh,u){
 var color=null;
 var normal=null;
 var texcoord=null;
 if(this.colorCurve){
  color=this.colorCurve.evaluate(u);
 }
 if(this.texCoordCurve){
  texcoord=this.texCoordCurve.evaluate(u);
  if(texcoord.length==1)texcoord.push(0);
 }
 if(this.normalCurve){
  normal=this.normalCurve.evaluate(u);
 }
 if(this.vertexCurve){
  var oldColor=(color) ? mesh.color.slice(0,3) : null;
  var oldNormal=(normal) ? mesh.normal.slice(0,3) : null;
  var oldTexCoord=(texcoord) ? mesh.texCoord.slice(0,2) : null;
  if(color)mesh.color3(color[0],color[1],color[2]);
  if(normal)mesh.normal3(normal[0],normal[1],normal[2]);
  if(texcoord)mesh.texCoord2(texcoord[0],texcoord[1]);
  var vertex=this.vertexCurve.evaluate(u);
  if(vertex.length==2)
   mesh.vertex3(vertex[0],vertex[1],0.0);
  else
   mesh.vertex3(vertex[0],vertex[1],vertex[2]);
  if(oldColor)mesh.color3(oldColor[0],oldColor[1],oldColor[2]);
  if(oldNormal)mesh.normal3(oldNormal[0],oldNormal[1],oldNormal[2]);
  if(oldTexCoord)mesh.texCoord2(oldTexCoord[0],oldTexCoord[1]);
 }
 return this;
}
/**
 * Generates vertices and attribute values that follow a parametric curve
 * function.
 * @param {glutil.Mesh} mesh A geometric mesh where the vertices will be
 * generated.
 * @param {number} [mode] If this value is Mesh.LINES, or is null
* or omitted, generates
 * a series of lines defining the curve. If this value is Mesh.POINTS,
 * generates a series of points along the curve.  For any other value,
 * this method has no effect.
 * @param {number} [n] Number of subdivisions of the curve to be drawn.
 * May be omitted; default is 24.
 * @param {number} [u1] Starting point of the curve (within the range
 * given in the <code>vector</code>, <code>normal</code>,
 * <code>color</code>, and <code>texCoord</code> methods).
 *May be omitted; default is 0.
 * @param {number} [u2] Ending point of the curve (within the range
 * given in the <code>vector</code>, normal</code>,
 * <code>color</code>, and <code>texCoord</code> methods).
 *May be omitted; default is 1.
 * @return {CurveEval} This object.
 */
CurveEval.prototype.evalCurve=function(mesh,mode,n,u1,u2){
 if(typeof n=="undefined")n=24;
 if(n<=0)throw new Error("invalid n")
 if(typeof u1=="undefined" && typeof u2=="undefined"){
  u1=0.0;
  u2=1.0;
 }
 if(mode==null)mode=Mesh.LINES;
 if(mode==Mesh.POINTS)
  mesh.mode(Mesh.POINTS)
 else if(mode==Mesh.LINES)
  mesh.mode(Mesh.LINE_STRIP)
 else return this;
 var uv=(u2-u1)/n;
 for(var i=0; i<=n; i++){
  this.evalOne(mesh, u1+i*uv);
 }
 return this;
}
/**
* An evaluator of parametric functions for generating
* vertex positions, normals, colors, and texture coordinates
* of a surface.<p>
* A parametric surface is a surface whose points are based on a
* parametric surface function.  A surface function takes two numbers
* (U and V) and returns a point (in 1, 2, 3 or more dimensions, but
* usually 2 or 3) that lies on the surface.  For example, in 3
* dimensions, a surface function has the following form:<p>
* <b>F</b>(u, v) = [ x(u, v), y(u, v), z(u, v) ]<p>
* where x(u, v) returns an X coordinate, y(u, v) a Y coordinate,
* and z(u, v) returns a Z coordinate.<p>
* For more information, see the {@tutorial surfaces} tutorial.
* @class
* See the {@tutorial surfaces} tutorial for more information.
* @class
* @alias glutil.SurfaceEval
*/
var SurfaceEval=function(){
 this.colorSurface=null;
 this.normalSurface=null;
 this.texCoordSurface=null;
 this.vertexSurface=null;
 this.autoNormal=false;
}
/**
 * Sets whether this object will automatically generate
 * normals rather than use the parametric evaluator
 * specified for normal generation, if any.
 * By default, normals won't be generated automatically.
 * @param {boolean} value Either true or false.  True means normals
 * will automatically be generated; false means they won't.
 * @return {SurfaceEval} This object.
 */
SurfaceEval.prototype.setAutoNormal=function(value){
 this.autoNormal=!!value;
 return this;
}
/**
* Specifies a parametric surface function for generating vertex positions.
* @param {object} evaluator An object that must contain a function
* named "evaluate".  It takes the following parameters in this order:<ul>
* <li><code>u</code> - Horizontal-axis coordinate, generally from 0 to 1.
* <li><code>v</code> - Vertical-axis coordinate, generally from 0 to 1.
* </ul>
* The evaluator function returns an array of the result of the evaluation.
* @return {SurfaceEval} This object.
*/
SurfaceEval.prototype.vertex=function(evaluator){
 this.vertexSurface=evaluator;
 return this;
}
/**
* Specifies a parametric surface function for generating normals.
* <p>
* To generate normals for a function for a regular surface (usually
* a continuous, unbroken surface such as a sphere, disk, or open
* cylinder), find the <a href="http://en.wikipedia.org/wiki/Partial_derivative">partial derivative</a> of
* the function used for vertex calculation (we'll call it <b>F</b>) with
* respect to u, then find the partial derivative of <b>F</b> with respect to
* v, then take their <a href="http://en.wikipedia.org/wiki/Cross_product">cross
* product</a>, then normalize the result to unit length.
* In mathematical notation, this looks like:
* <b>c</b> = &#x2202;<b>F</b>/&#x2202<i>u</i> &times;
* &#x2202;<b>F</b>/&#x2202<i>v</i>; <b>n</b> = <b>c</b> / |<b>c</b>|.<p>
* If autonormal is enabled (see setAutoNormal()), SurfaceEval uses an approximation to this approach,
* as the SurfaceEval class doesn't know the implementation of the method used
* for vertex calculation.<p>
* (Note: &#x2202;<b>F</b>/&#x2202<i>u</i> is also called the <i>bitangent</i>
* or <i>binormal vector</i>, and &#x2202;<b>F</b>/&#x2202<i>v</i> is also
* called the <i>tangent vector</i>.)
* @param {object} evaluator An object that must contain a function
* named "evaluate", giving 3 values as a result.  See {@link SurfaceEval#vertex}.
* </ul>
* @return {SurfaceEval} This object.
* @example <caption>The following example sets the normal generation
* function for a parametric surface.  To illustrate how the method is derived
* from the vector calculation method, that method is also given below.  To
* derive the normal calculation, first look at the vector function:<p>
* <b>F</b>(u, v) = (cos(u), sin(u), sin(u)*cos(v))<p>
* Then, find the partial derivatives with respect to u and v:<p>
* &#x2202;<b>F</b>/&#x2202;<i>u</i> = (-sin(u), cos(u), cos(u)*cos(v))<br>
* &#x2202;<b>F</b>/&#x2202;<i>v</i> = (0, 0, -sin(v)*sin(u))<p>
* Next, take their cross product:<p>
* <b>c</b>(u, v) = (-sin(v)*cos(u)*sin(u), -sin(v)*sin(u)*sin(u), 0)<br><p>
* And finally, normalize the result:<p>
* <b>n</b>(u, v) = <b>c</b>(u, v)/|<b>c</b>(u, v)|<p>
*</caption>
* surfaceEval.vertex({"evaluate":function(u,v){
*  return [Math.cos(u),Math.sin(u),Math.sin(u)*Math.cos(v)];
* }})
* .normal({"evaluate":function(u,v){
*  return GLMath.vec3normInPlace([
*   Math.cos(u)*-Math.sin(v)*Math.sin(u),
*   Math.sin(u)*-Math.sin(v)*Math.sin(u),
*   0]);
* }})
*/
SurfaceEval.prototype.normal=function(evaluator){
 this.normalSurface=evaluator;
 return this;
}
/**
* Specifies a parametric surface function for generating color values.
* @param {object} evaluator An object that must contain a function
* named "evaluate", giving 3 values as a result.  See {@link SurfaceEval#vertex}.
* </ul>
* @return {SurfaceEval} This object.
*/
SurfaceEval.prototype.color=function(evaluator){
 this.colorSurface=evaluator;
 return this;
}
/**
* Specifies a parametric surface function for generating texture coordinates.
* @param {object} evaluator An object that must contain a function
* named "evaluate", giving 2 values as a result.  See {@link SurfaceEval#vertex}.
* </ul>
* @return {SurfaceEval} This object.
* @example <caption>The following example sets the surface
* function to a linear evaluator. Thus, coordinates passed to the
* evalOne and evalSurface methods will be interpolated as direct
* texture coordinates.</caption>
* surface.texCoord({"evaluate":function(u,v){ return [u,v] }});
*/
SurfaceEval.prototype.texCoord=function(evaluator){
 this.texCoordSurface=evaluator;
 return this;
}
/**
 * Specifies a B&eacute;zier surface used for generating vertex positions.
 * @deprecated Use the <code>vertex()</code> method instead with a
 * BezierCurve object.
 * @param {Array<Array<number>>} controlPoints Control points as specified in {@link BezierSurface},
 * where each point is a 3-element array giving the x, y, and z coordinates of a vertex
 * position.
 * @param {number} [u1] Starting point along the U axis; see {@link BezierSurface}.
 * @param {number} [u2] Ending point along the U axis; see {@link BezierSurface}.
 * @param {number} [v1] Starting point along the V axis; see {@link BezierSurface}.
 * @param {number} [v2] Ending point along the V axis; see {@link BezierSurface}.
 * @return {SurfaceEval} This object.
 */
SurfaceEval.prototype.vertexBezier=function(controlPoints,u1,u2,v1,v2){
 this.vertexSurface=new BezierSurface(controlPoints,u1,u2,v1,v2);
 if(controlPoints[0][0].length!=3)
   throw new Error("unsupported vertex length")
 return this;
}
/**
 * Specifies a B&eacute;zier surface used for generating normals.
 * @deprecated Use the <code>normal()</code> method instead with a
 * BezierCurve object.
 * @param {Array<Array<number>>} controlPoints Control points as specified in {@link BezierSurface},
 * where each point is a 3-element array giving the x, y, and z coordinates of a normal.
 * @param {number} [u1] Starting point along the U axis; see {@link BezierSurface}.
 * @param {number} [u2] Ending point along the U axis; see {@link BezierSurface}.
 * @param {number} [v1] Starting point along the V axis; see {@link BezierSurface}.
 * @param {number} [v2] Ending point along the V axis; see {@link BezierSurface}.
 * @return {SurfaceEval} This object.
*/
SurfaceEval.prototype.normalBezier=function(controlPoints,u1,u2,v1,v2){
 this.normalSurface=new BezierSurface(controlPoints,u1,u2,v1,v2);
 if(controlPoints[0][0].length!=3)
   throw new Error("invalid normal length")
 return this;
}
/**
 * Specifies a B&eacute;zier surface used for generating texture coordinates.
 * @deprecated Use the <code>texCoord()</code> method instead with a
 * BezierCurve object.
 * @param {Array<Array<number>>} controlPoints Control points as specified in {@link BezierSurface},
 * where each point is a 1- or 2-element array giving the u and v texture coordinates.
 * @param {number} [u1] Starting point along the U axis; see {@link BezierSurface}.
 * @param {number} [u2] Ending point along the U axis; see {@link BezierSurface}.
 * @param {number} [v1] Starting point along the V axis; see {@link BezierSurface}.
 * @param {number} [v2] Ending point along the V axis; see {@link BezierSurface}.
 * @return {SurfaceEval} This object.
 */
SurfaceEval.prototype.texCoordBezier=function(controlPoints,u1,u2,v1,v2){
 this.texCoordSurface=new BezierSurface(controlPoints,u1,u2,v1,v2);
 if(controlPoints[0][0].length!=1 && controlPoints[0][0].length!=2)
   throw new Error("unsupported texcoord length")
 return this;
}
/**
 * Specifies a B&eacute;zier surface used for generating color values.
 * @deprecated Use the <code>color()</code> method instead with a
 * BezierCurve object.
 * @param {Array<Array<number>>} controlPoints Control points as specified in {@link BezierSurface},
 * where each point is a 3-element array giving the red, green, and blue
 * values of a color.
 * @param {number} [u1] Starting point along the U axis; see {@link BezierSurface}.
 * @param {number} [u2] Ending point along the U axis; see {@link BezierSurface}.
 * @param {number} [v1] Starting point along the V axis; see {@link BezierSurface}.
 * @param {number} [v2] Ending point along the V axis; see {@link BezierSurface}.
 * @return {SurfaceEval} This object.
 */
SurfaceEval.prototype.colorBezier=function(controlPoints,u1,u2,v1,v2){
 this.colorSurface=new BezierSurface(controlPoints,u1,u2,v1,v2);
 if(controlPoints[0][0].length!=3)
   throw new Error("unsupported color length")
 return this;
}

/**
 * Generates vertex positions and attributes based on a point
 * in a parametric surface.
 * @param {glutil.Mesh} mesh Mesh where vertex positions and attributes
 * will be generated.  When this method returns, the current color, normal,
 * and texture coordinates will be the same as they were before the method
 * started.
 * @param {number} u U-coordinate of the curve to evaluate (for
 * B&eacute;zier surfaces, generally within the range
 * given in the <code>vectorBezier</code>, <code>normalBezier</code>,
 * <code>colorBezier</code>, and <code>texCoordBezier</code> methods).
 * @param {number} v V-coordinate of the curve to evaluate.
 * @return {SurfaceEval} This object.
 */
SurfaceEval.prototype.evalOne=function(mesh,u,v){
 var values=[];
 this._saveValues(mesh,values,0);
 this._record(u,v,values,_OLD_VALUES_SIZE);
 this._playBack(mesh,values,_OLD_VALUES_SIZE);
 this._restoreValues(mesh,values,0);
 return this;
}
/** @private
 @const
*/
var _OLD_VALUES_SIZE = 8;
/** @private
 @const
*/
var _RECORDED_VALUES_SIZE = 11;
/** @private */
SurfaceEval.prototype._recordAndPlayBack=function(mesh,u,v,buffer,index){
 this._record(u,v,buffer,index);
 this._playBack(mesh,buffer,index);
}
/** @private */
SurfaceEval.prototype._saveValues=function(mesh,buffer,index){
 if(this.colorSurface){
  buffer[index+3]=mesh.color[0];
  buffer[index+4]=mesh.color[1];
  buffer[index+5]=mesh.color[2];
 }
 if(this.normalSurface || this.autoNormal){
  buffer[index+0]=mesh.normal[0];
  buffer[index+1]=mesh.normal[1];
  buffer[index+2]=mesh.normal[2];
 }
 if(this.texCoordSurface){
  buffer[index+6]=mesh.texCoord[0];
  buffer[index+7]=mesh.texCoord[1];
 }
}
/** @private */
SurfaceEval.prototype._restoreValues=function(mesh,buffer,index){
 if(this.colorSurface){
  mesh.color3(buffer[index+3],buffer[index+4],buffer[index+5]);
 }
 if(this.normalSurface || this.autoNormal){
  mesh.normal3(buffer[index+0],buffer[index+1],buffer[index+2]);
 }
 if(this.texCoordSurface){
  mesh.texCoord2(buffer[index+6],buffer[index+7]);
 }
}
/** @private */
SurfaceEval.prototype._record=function(u,v,buffer,index){
 var normal=null;
 if(this.colorSurface){
  var color=this.colorSurface.evaluate(u,v);
  buffer[index+6]=color[0];
  buffer[index+7]=color[1];
  buffer[index+8]=color[2];
 }
 if(this.texCoordSurface){
  var texcoord=this.texCoordSurface.evaluate(u,v);
  buffer[index+9]=texcoord[0];
  buffer[index+10]=(texcoord.length<=1) ? 0 : texcoord[1];
 }
 if(this.normalSurface && !this.autoNormal){
  var normal=this.normalSurface.evaluate(u,v);
  buffer[index+3]=normal[0];
  buffer[index+4]=normal[1];
  buffer[index+5]=normal[2];
 }
 if(this.vertexSurface){
  var vertex=this.vertexSurface.evaluate(u,v);
  buffer[index]=vertex[0];
  buffer[index+1]=vertex[1];
  buffer[index+2]=vertex[2];
  if(this.autoNormal){
   var du=0.00001
   var dv=0.00001
   // Find the partial derivatives of u and v
   var vu=this.vertexSurface.evaluate(u+du,v);
   if(vu[0]==0 && vu[1]==0 && vu[2]==0){
    // too abrupt, try the other direction
    du=-du;
    vu=this.vertexSurface.evaluate(u+du,v);
   }
   var vuz=vu[2];
   var vv=this.vertexSurface.evaluate(u,v+dv);
   if(vv[0]==0 && vv[1]==0 && vv[2]==0){
    // too abrupt, try the other direction
    dv=-dv;
    vv=this.vertexSurface.evaluate(u,v+dv);
   }
   GLMath.vec3subInPlace(vv,vertex);
   GLMath.vec3subInPlace(vu,vertex);
   // Divide by the deltas of u and v
   GLMath.vec3scaleInPlace(vu,1.0/du);
   GLMath.vec3scaleInPlace(vv,1.0/dv);
   GLMath.vec3normInPlace(vu);
   GLMath.vec3normInPlace(vv);
   if(GLMath.vec3length(vu)==0){
    // partial derivative of u is degenerate
    //console.log([vu,vv,u,v]+" u degen")
    vu=vv;
   } else if(GLMath.vec3length(vv)!=0){
    vu=GLMath.vec3cross(vu,vv);
    GLMath.vec3normInPlace(vu);
   } else {
    // partial derivative of v is degenerate
    //console.log([vu,vv,u,v]+" v degen")
    if(vu[2]==vertex[2]){
      // the close evaluation returns the same
      // z as this evaluation
      vu=[0,0,1];
    }
   }
   buffer[index+3]=vu[0];
   buffer[index+4]=vu[1];
   buffer[index+5]=vu[2];
  }
 }
}
/** @private */
SurfaceEval.prototype._playBack=function(mesh,buffer,index){
 if(this.vertexSurface){
  if(this.colorSurface){
   mesh.color3(buffer[index+6],buffer[index+7],buffer[index+8]);
  }
  if(this.normalSurface || this.autoNormal){
   mesh.normal3(buffer[index+3],buffer[index+4],buffer[index+5]);
  }
  if(this.texCoordSurface){
   mesh.texCoord2(buffer[index+9],buffer[index+10]);
  }
  mesh.vertex3(buffer[index+0],buffer[index+1],buffer[index+2]);
 }
}

/**
 * Generates the vertex positions and attributes of a parametric
 * surface.
 * @param {glutil.Mesh} mesh Mesh where vertex positions and attributes
 * will be generated.  When this method returns, the current color, normal,
 * and texture coordinates will be the same as they were before the method
 * started.
 * @param {number} [mode] If this value is Mesh.TRIANGLES, or is null
 * or omitted, generates a series of triangles defining the surface.  If
 * this value is Mesh.LINES, generates
 * a series of lines defining the curve. If this value is Mesh.POINTS,
 * generates a series of points along the curve.  For any other value,
 * this method has no effect.
 * @param {number} [un] Number of subdivisions along the U-axis.
 * Default is 24.
 * @param {number} [vn] Number of subdivisions along the V-axis.
 * Default is 24.
 * @param {number} [u1] Starting U-coordinate of the surface to evaluate.
 * Default is 0.
 * @param {number} [u2] Ending U-coordinate of the surface to evaluate.
 * Default is 1.
 * @param {number} [v1] Starting U-coordinate of the surface to evaluate.
 * Default is 0.
 * @param {number} [v2] Ending U-coordinate of the surface to evaluate.
 * Default is 1.
 * @return {SurfaceEval} This object.
 */
SurfaceEval.prototype.evalSurface=function(mesh,mode,un,vn,u1,u2,v1,v2){
 if(typeof un=="undefined")un=24;
 if(typeof vn=="undefined")vn=24;
 if(un<=0)throw new Error("invalid un")
 if(vn<=0)throw new Error("invalid vn")
 if(mode==null)mode=Mesh.TRIANGLES;
 if(typeof v1=="undefined" && typeof v2=="undefined"){
  v1=0.0;
  v2=1.0;
 }
 if(typeof u1=="undefined" && typeof u2=="undefined"){
  u1=0.0;
  u2=1.0;
 }
 var du=(u2-u1)/un;
 var dv=(v2-v1)/vn;
 if(mode==Mesh.TRIANGLES){
  var oldValues=[];
  var previousValues=[];
  this._saveValues(mesh,oldValues,0);
  for(var i=0;i<vn;i++){
   mesh.mode(Mesh.TRIANGLE_STRIP);
   for(var j=0,prevIndex=0;j<=un;
      j++,prevIndex+=_RECORDED_VALUES_SIZE){
    var jx=j*du+u1;
    if(i==0){
     this._recordAndPlayBack(mesh,jx,i*dv+v1,oldValues,_OLD_VALUES_SIZE);
    } else {
     this._playBack(mesh,previousValues,prevIndex);
    }
    if(i==vn-1){
     this._recordAndPlayBack(mesh,jx,(i+1)*dv+v1,oldValues,_OLD_VALUES_SIZE);
    } else {
     this._recordAndPlayBack(mesh,jx,(i+1)*dv+v1,previousValues,prevIndex);
    }
   }
  }
  this._restoreValues(mesh,oldValues,0);
 } else if(mode==Mesh.POINTS){
  mesh.mode(Mesh.POINTS);
  for(var i=0;i<=vn;i++){
   for(var j=0;j<=un;j++){
    var jx=j*du+u1;
    this.evalOne(mesh,jx,i*dv+v1);
   }
  }
 } else if(mode==Mesh.LINES){
  for(var i=0;i<=vn;i++){
   mesh.mode(Mesh.LINE_STRIP);
   for(var j=0;j<=un;j++){
    var jx=j*du+u1;
    this.evalOne(mesh,jx,i*dv+v1);
   }
  }
  for(var i=0;i<=un;i++){
   mesh.mode(Mesh.LINE_STRIP);
   for(var j=0;j<=vn;j++){
    this.evalOne(mesh,i*du+u1,j*dv+v1);
   }
  }
 }
 return this;
}
global.SurfaceEval=SurfaceEval;
global.CurveEval=CurveEval;
global.BezierCurve=BezierCurve;
global.BezierSurface=BezierSurface;
global.BSplineCurve=BSplineCurve;
global.BSplineSurface=BSplineSurface;
})(this);
;
/*
Written by Peter O. in 2015.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://upokecenter.dreamhosters.com/articles/donate-now-2/
*/

/**
* Contains methods that create meshes
* of common geometric shapes.
* @class
* @alias glutil.Meshes
*/
if(typeof Meshes=="undefined"){
 Meshes={};
}

/**
* Creates a mesh of a box (rectangular prism), which
* will be centered at the origin.
* See the "{@tutorial shapes}" tutorial.
* @param {number} xSize Width of the box.
* @param {number} ySize Height of the box.
* @param {number} xSize Depth of the box.
* @param {boolean} inward If true, the normals generated by this
* method will point inward; otherwise, outward.  Should normally be false
* unless the box will be viewed from the inside.
* @return {Mesh} The generated mesh.
*/
Meshes.createBox=function(xSize,ySize,zSize,inward){
 // Position X, Y, Z, normal NX, NY, NZ, texture U, V
 xSize*=0.5;
 ySize*=0.5;
 zSize*=0.5;
 var vertices=[
-xSize,-ySize,zSize,-1.0,0.0,0.0,1.0,0.0,
-xSize,ySize,zSize,-1.0,0.0,0.0,1.0,1.0,
-xSize,ySize,-zSize,-1.0,0.0,0.0,0.0,1.0,
-xSize,-ySize,-zSize,-1.0,0.0,0.0,0.0,0.0,
xSize,-ySize,-zSize,1.0,0.0,0.0,1.0,0.0,
xSize,ySize,-zSize,1.0,0.0,0.0,1.0,1.0,
xSize,ySize,zSize,1.0,0.0,0.0,0.0,1.0,
xSize,-ySize,zSize,1.0,0.0,0.0,0.0,0.0,
xSize,-ySize,-zSize,0.0,-1.0,0.0,1.0,0.0,
xSize,-ySize,zSize,0.0,-1.0,0.0,1.0,1.0,
-xSize,-ySize,zSize,0.0,-1.0,0.0,0.0,1.0,
-xSize,-ySize,-zSize,0.0,-1.0,0.0,0.0,0.0,
xSize,ySize,zSize,0.0,1.0,0.0,1.0,0.0,
xSize,ySize,-zSize,0.0,1.0,0.0,1.0,1.0,
-xSize,ySize,-zSize,0.0,1.0,0.0,0.0,1.0,
-xSize,ySize,zSize,0.0,1.0,0.0,0.0,0.0,
-xSize,-ySize,-zSize,0.0,0.0,-1.0,1.0,0.0,
-xSize,ySize,-zSize,0.0,0.0,-1.0,1.0,1.0,
xSize,ySize,-zSize,0.0,0.0,-1.0,0.0,1.0,
xSize,-ySize,-zSize,0.0,0.0,-1.0,0.0,0.0,
xSize,-ySize,zSize,0.0,0.0,1.0,1.0,0.0,
xSize,ySize,zSize,0.0,0.0,1.0,1.0,1.0,
-xSize,ySize,zSize,0.0,0.0,1.0,0.0,1.0,
-xSize,-ySize,zSize,0.0,0.0,1.0,0.0,0.0]
 if(inward){
  for(var i=0;i<vertices.length;i+=8){
   vertices[i+3]=-vertices[i+3]
   vertices[i+4]=-vertices[i+4]
   vertices[i+5]=-vertices[i+5]
  }
 }
 var faces=[0,1,2,0,2,3,4,5,6,4,6,7,8,9,10,8,10,11,12,
 13,14,12,14,15,16,17,18,16,18,19,20,21,22,20,22,23]
 return new Mesh(vertices,faces,Mesh.NORMALS_BIT | Mesh.TEXCOORDS_BIT);
}

/**
* Creates a mesh of a cylinder.  The cylinder's base will
* be centered at the origin and its height will run along the
* positive z-axis.  The base and top themselves will not be
* included in the mesh.
* See the "{@tutorial shapes}" tutorial.
* @param {number} baseRad Radius of the base of the cylinder. If 0,
* this function will create an approximation to a downward pointing cone.
* @param {number} topRad Radius of the top of the cylinder. If 0,
* this function will create an approximation to an upward pointing cone.
* @param {number} height Height of the cylinder.
* @param {number} slices Number of lengthwise "slices" the cylinder consists
* of, each slice going through the center of the cylinder.  This function will
* create a triangular prism if "slices" is 3
* and both radiuses are the same; a triangular pyramid if "slices" is
* 3 and either radius is zero; a rectangular prism if "slices" is 4
* and both radiuses are the same; and a rectangular pyramid if "slices"
* is 4 and either radius is zero. Must be 3 or greater.
* May be null or omitted, in which case the default is 32.
* @param {number} stacks Number of vertical stacks the cylinder consists of.
* May be null or omitted, in which case the default is 1.
* @param {boolean} flat If true, will generate normals such that the
* cylinder will be flat shaded; otherwise, will generate normals such that the
* cylinder will be smooth shaded.
* @param {boolean} inside If true, the normals generated by this
* method will point inward; otherwise, outward.  Should normally be false
* unless the cylinder will be viewed from the inside.
* @return {Mesh} The generated mesh.
*/
Meshes.createCylinder=function(baseRad, topRad, height, slices, stacks, flat, inside){
 var mesh=new Mesh();
 if(slices==null)slices=32;
 if(stacks==null)stacks=1;
 if(slices<=2)throw new Error("too few slices");
 if(stacks<1)throw new Error("too few stacks");
 if(height<0)throw new Error("negative height")
 if((baseRad<=0 && topRad<=0) || height==0){
  // both baseRad and topRad are zero or negative,
  // or height is zero
  return mesh;
 }
 var normDir=(inside) ? -1 : 1;
 var sc=[0,1]; // sin(0), cos(0)
 var tc=[0];
 var twopi=GLMath.PiTimes2;
 for(var i=1;i<slices;i++){
  var t=i*1.0/slices;
  var angle=twopi*t;
  var cangle = Math.cos(angle);
  var sangle = (angle>=0 && angle<6.283185307179586) ? (angle<=3.141592653589793 ? Math.sqrt(1.0-cangle*cangle) : -Math.sqrt(1.0-cangle*cangle)) : Math.sin(angle);
  sc.push(sangle,cangle);
  tc.push(t);
 }
 sc.push(0,1);
 tc.push(1);
 var slicesTimes2=slices*2;
 if(height>0){
  var lastZ=0;
  var lastRad=baseRad;
  var slopeAngle=0,sinSlopeNorm,cosSlopeNorm;
  if(baseRad==topRad){
   sinSlopeNorm=0;
   cosSlopeNorm=normDir;
  } else {
   slopeAngle=Math.atan2(baseRad-topRad,height);
   cosSlopeNorm = Math.cos(slopeAngle);
   sinSlopeNorm = (slopeAngle>=0 && slopeAngle<6.283185307179586) ? (slopeAngle<=3.141592653589793 ? Math.sqrt(1.0-cosSlopeNorm*cosSlopeNorm) : -Math.sqrt(1.0-cosSlopeNorm*cosSlopeNorm)) : Math.sin(slopeAngle);
   sinSlopeNorm*=normDir;
   cosSlopeNorm*=normDir;
  }
  for(var i=0;i<stacks;i++){
   var zStart=lastZ;
   var zEnd=(i+1)/stacks;
   var zStartHeight=height*zStart;
   var zEndHeight=height*zEnd;
   var radiusStart=lastRad;
   var radiusEnd=baseRad+(topRad-baseRad)*zEnd;
   lastZ=zEnd;
   lastRad=radiusEnd;
   mesh.mode(Mesh.TRIANGLE_STRIP);
   mesh.texCoord2(1,zStart);
   mesh.normal3(0,cosSlopeNorm,sinSlopeNorm);
   mesh.vertex3(0,radiusStart,zStartHeight);
   mesh.texCoord2(1,zEnd);
   mesh.normal3(0,cosSlopeNorm,sinSlopeNorm);
   mesh.vertex3(0,radiusEnd,zEndHeight);
   for(var k=2,j=1;k<=slicesTimes2;k+=2,j++){
    var tx=tc[j];
    var x,y;
    x=sc[k];
    y=sc[k+1];
     mesh.texCoord2(1-tx,zStart);
     mesh.normal3(x*cosSlopeNorm,y*cosSlopeNorm,sinSlopeNorm);
     mesh.vertex3(x*radiusStart,y*radiusStart,zStartHeight);
     mesh.texCoord2(1-tx,zEnd);
     mesh.normal3(x*cosSlopeNorm,y*cosSlopeNorm,sinSlopeNorm);
     mesh.vertex3(x*radiusEnd,y*radiusEnd,zEndHeight);
   }
  }
 }
 return flat ? mesh.recalcNormals(flat,inside) : mesh;
}

/**
* Creates a mesh of a closed cylinder.  The cylinder's base will
* be centered at the origin and its height will run along the
* positive z-axis.  The base and top will be included in the mesh if
* their radius is greater than 0.
* See the "{@tutorial shapes}" tutorial.
* @param {number} baseRad Radius of the base of the cylinder.
* See {@link glutil.Meshes.createCylinder}.
* @param {number} topRad Radius of the top of the cylinder.
* See {@link glutil.Meshes.createCylinder}.
* @param {number} height Height of the cylinder.
* @param {number} slices    Number of lengthwise "slices" the cylinder consists
* of. See {@link glutil.Meshes.createCylinder}.
* @param {number} stacks Number of vertical stacks the cylinder consists of.
* May be null or omitted, in which case the default is 1.
* @param {boolean} flat If true, will generate normals such that the
* cylinder will be flat shaded; otherwise, will generate normals such that the
* cylinder will be smooth shaded.
* @param {boolean} inside If true, the normals generated by this
* method will point inward; otherwise, outward.  Should normally be false
* unless the cylinder will be viewed from the inside.
* @return {Mesh} The generated mesh.
*/
Meshes.createClosedCylinder=function(baseRad,topRad,height,slices,stacks,flat, inside){
 var cylinder=Meshes.createCylinder(baseRad,topRad,height,slices,stacks,flat, inside);
 var base=Meshes.createDisk(0,baseRad,slices,2,!inside).reverseWinding();
 var top=Meshes.createDisk(0,topRad,slices,2,inside);
 // move the top disk to the top of the cylinder
 top.transform(GLMath.mat4translated(0,0,height));
 // merge the base and the top
 return cylinder.merge(base).merge(top);
}

/**
* Creates a mesh of a 2D disk.
* Assuming the Y axis points up, the X axis right,
* and the Z axis toward the viewer, the first vertex in the outer edge
* of the 2D disk will be at the 12 o'clock position.
* See the "{@tutorial shapes}" tutorial.
* @param {number} inner Radius of the hole in the middle of the
* disk.  If 0, no hole is created and the method will generate a regular
* polygon with n sides, where n is the value of "slices".  For example,
* if "inner" is 0 and "slices" is 3, the result will be an equilateral triangle;
* a square for 4 "slices", a regular pentagon for 5 "slices", and so on.
* @param {number} outer Outer radius of the disk.
* @param {number} slices Number of slices going around the disk.
* May be null or omitted; default is 16.
* @param {number} loops Number of concentric rings the disk makes up.
* May be null or omitted; default is 1.
* @param {boolean} inward If true, the normals generated by this
* method will point in the opposite direction of the positive z-axis; otherwise,
* in the same direction of the positive z-axis.  Default is false.
* @return The generated mesh.
*/
Meshes.createDisk=function(inner, outer, slices, loops, inward){
 return Meshes.createPartialDisk(inner,outer,slices,loops,0,360,inward);
}

/**
* Creates a mesh of a 2D disk or an arc of a 2D disk.
* See the "{@tutorial shapes}" tutorial.
* @param {number} inner Radius of the hole where the middle of the
* complete disk would be.  If 0, no hole is created.
* @param {number} outer Outer radius of the disk.
* @param {number} slices Number of slices going around the partial disk.
* May be null or omitted; default is 32.
* @param {number} loops Number of concentric rings the partial disk makes up.
* May be null or omitted; default is 1.
* @param {number} start Starting angle of the partial disk, in degrees.
* May be null or omitted; default is 0.
* 0 degrees is at the positive y-axis,
* and 90 degrees at the positive x-axis.
* @param {number} sweep Arc length of the partial disk, in degrees.
* May be null or omitted; default is 360. May be negative.
* @param {boolean} inward If true, the normals generated by this
* method will point in the opposite direction of the positive z-axis; otherwise,
* in the same direction of the positive z-axis.  Default is false.
* @return The generated mesh.
*/
Meshes.createPartialDisk=function(inner, outer, slices, loops, start, sweep, inward){
 var mesh=new Mesh();
 if(slices==null)slices=32;
 if(loops==null)loops=1;
 if(start==null)start=0;
 if(sweep==null)sweep=360;
 if(slices<=2)throw new Error("too few slices");
 if(loops<1)throw new Error("too few loops");
 if(inner>outer)throw new Error("inner greater than outer");
 if(inner<0)inner=0;
 if(outer<0)outer=0;
 if(outer==0 || sweep==0)return mesh;
 var fullCircle=(sweep==360 && start==0);
 var sweepDir=sweep<0 ? -1 : 1;
 if(sweep<0)sweep=-sweep;
 sweep%=360;
 if(sweep==0)sweep=360;
 var sc=[];
 var tc=[];
 var twopi=GLMath.PiTimes2;
 var arcLength=(sweep==360) ? twopi : sweep*GLMath.PiDividedBy180;
 start=start*GLMath.PiDividedBy180;
 if(sweepDir<0){
  arcLength=-arcLength;
 }
 for(var i=0;i<=slices;i++){
  var t=i*1.0/slices;
  var angle=(t==1 && arcLength==twopi) ? start : start+arcLength*t;
  angle=(angle<0) ? twopi-(-angle)%twopi : angle%twopi;
  var cangle = Math.cos(angle);
  var sangle = (angle>=0 && angle<6.283185307179586) ? (angle<=3.141592653589793 ? Math.sqrt(1.0-cangle*cangle) : -Math.sqrt(1.0-cangle*cangle)) : Math.sin(angle);
  sc.push(sangle,cangle);
  tc.push(t);
 }
 if(fullCircle){
  sc[0]=0;
  sc[1]=1;
  sc[sc.length-1]=1;
  sc[sc.length-2]=0;
  tc[0]=0;
  tc[tc.length-1]=1;
 }
 var slicesTimes2=slices*2;
 var height=outer-inner;
  var lastZ=0;
  var lastRad=inner;
  if(inward){
   mesh.normal3(0,0,-1);
  } else {
   mesh.normal3(0,0,1);
  }
  for(var i=0;i<loops;i++){
   var zStart=lastZ;
   var zEnd=(i+1)/loops;
   var radiusStart=lastRad;
   var radiusEnd=inner+height*zEnd;
   var rso=radiusStart/outer;
   var reo=radiusEnd/outer;
   lastZ=zEnd;
   lastRad=radiusEnd;
   var triangleFanBase=(i==0 && inner==0);
   mesh.mode((triangleFanBase) ?
     Mesh.TRIANGLE_FAN : Mesh.TRIANGLE_STRIP);
   if(triangleFanBase){
    var jStart=slicesTimes2/2;
    for(var k=slicesTimes2,j=jStart;k>=0;k-=2,j--){
     var tx=tc[j];
     var x,y;
     x=sc[k];
     y=sc[k+1];
     if(k==slicesTimes2){
      mesh.texCoord2((1+(x*rso))*0.5,(1+(y*rso))*0.5);
      mesh.vertex3(x*radiusStart,y*radiusStart,0);
     }
     mesh.texCoord2((1+(x*reo))*0.5,(1+(y*reo))*0.5);
     mesh.vertex3(x*radiusEnd,y*radiusEnd,0);
    }
   } else {
    for(var k=0,j=0;k<=slicesTimes2;k+=2,j++){
     var tx=tc[j];
     var x,y;
     x=sc[k];
     y=sc[k+1];
     mesh.texCoord2((1+(x*reo))*0.5,(1+(y*reo))*0.5);
     mesh.vertex3(x*radiusEnd,y*radiusEnd,0);
     mesh.texCoord2((1+(x*rso))*0.5,(1+(y*rso))*0.5);
     mesh.vertex3(x*radiusStart,y*radiusStart,0);
    }
   }
  }
  return mesh;
}

/**
* Creates a mesh of a torus (donut), centered at the origin.
* See the "{@tutorial shapes}" tutorial.
* @param {number} inner Inner radius (thickness) of the torus.
* @param {number} outer Outer radius of the torus (distance from the
* center to the innermost part of the torus).
* @param {number} lengthwise Number of lengthwise subdivisions.
* May be null or omitted; default is 16.
* @param {number} crosswise Number of crosswise subdivisions.
* May be null or omitted; default is 16.
* @param {boolean} flat If true, will generate normals such that the
* torus will be flat shaded; otherwise, will generate normals such that it
* will be smooth shaded.
* @param {boolean} inward If true, the normals generated by this
* method will point inward; otherwise, outward.  Default is false.
* @return {Mesh} The generated mesh.
*/
Meshes.createTorus=function(inner, outer, lengthwise, crosswise,flat,inward){
 var mesh=new Mesh();
 if(crosswise==null)crosswise=16;
 if(lengthwise==null)lengthwise=16;
 if(crosswise<3)throw new Error("crosswise is less than 3")
 if(lengthwise<3)throw new Error("lengthwise is less than 3")
 if(inner<0||outer<0)throw new Error("inner or outer is less than 0")
 if(outer==0)return mesh;
 if(inner==0)return mesh;
 var tubeRadius=inner;
 var circleRad=outer;
 var twopi=GLMath.PiTimes2;
 var sci=[];
 var scj=[];
 for(var i = 0; i < crosswise; i++){
  var u = i*twopi/crosswise;
  var cangle = Math.cos(u);
  var sangle = (u>=0 && u<6.283185307179586) ? (u<=3.141592653589793 ? Math.sqrt(1.0-cangle*cangle) : -Math.sqrt(1.0-cangle*cangle)) : Math.sin(u);
  sci.push(sangle,cangle);
 }
 sci.push(sci[0]);
 sci.push(sci[1]);
 for(var i = 0; i < lengthwise; i++){
  var u = i*twopi/lengthwise;
  var cangle = Math.cos(u);
  var sangle = (u>=0 && u<6.283185307179586) ? (u<=3.141592653589793 ? Math.sqrt(1.0-cangle*cangle) : -Math.sqrt(1.0-cangle*cangle)) : Math.sin(u);
  scj.push(sangle,cangle);
 }
 scj.push(scj[0]);
 scj.push(scj[1]);
 for(var j = 0; j < lengthwise; j++){
  var v0 = (j)/lengthwise;
  var v1 = (j+1.0)/lengthwise;
  var sinr0=scj[j*2];
  var cosr0=scj[j*2+1];
  var sinr1=scj[j*2+2];
  var cosr1=scj[j*2+3];
  mesh.mode(Mesh.TRIANGLE_STRIP);
  for(var i = 0; i <= crosswise; i++){
   var u = i/crosswise;
   var sint=sci[i*2];
   var cost=sci[i*2+1];
   var x = (cost * (circleRad + cosr1 * tubeRadius));
   var y = (sint * (circleRad + cosr1 * tubeRadius));
   var z = (sinr1 * tubeRadius);
   var nx = (cosr1 * cost);
   var ny = (cosr1 * sint);
   var nz = (sinr1);
   mesh.normal3(nx, ny, nz);
   mesh.texCoord2(u, v1);
   mesh.vertex3(x, y, z);
   x = (cost * (circleRad + cosr0 * tubeRadius));
   y = (sint * (circleRad + cosr0 * tubeRadius));
   z = (sinr0 * tubeRadius);
   nx = (cosr0 * cost);
   ny = (cosr0 * sint);
   nz = (sinr0);
   mesh.normal3(nx, ny, nz);
   mesh.texCoord2(u, v0);
   mesh.vertex3(x, y, z);
  }
 }
 return flat ? mesh.recalcNormals(flat, inward) : mesh;
}

/**
* Creates a mesh of a 2D rectangle, centered at the origin.
* See the "{@tutorial shapes}" tutorial.
* @param {number} width Width of the rectangle.
* May be null or omitted; default is 1.
* @param {number} height Height of the rectangle.
* May be null or omitted; default is 1.
* @param {number} widthDiv Number of horizontal subdivisions.
* May be null or omitted; default is 1.
* @param {number} heightDiv Number of vertical subdivisions.
* May be null or omitted; default is 1.
* @param {boolean} inward If true, the normals generated by this
* method will point in the opposite direction of the positive z-axis; otherwise,
* in the same direction of the positive z-axis.  Default is false.
* @return {Mesh} The generated mesh.
*/
Meshes.createPlane=function(width, height, widthDiv, heightDiv,inward){
 var mesh=new Mesh();
 if(width==null)width=1;
 if(height==null)height=1;
 if(widthDiv==null)widthDiv=1;
 if(heightDiv==null)heightDiv=1;
 if(width<0||height<0)throw new Error("width or height is less than 0")
 if(heightDiv<=0 || widthDiv<=0)
  throw new Error("widthDiv or heightDiv is 0 or less")
 if(width==0 || height==0)return mesh;
 var xStart=-width*0.5;
 var yStart=-height*0.5;
  if(inward){
   mesh.normal3(0,0,-1);
  } else {
   mesh.normal3(0,0,1);
  }
 for(var i=0;i<heightDiv;i++){
  mesh.mode(Mesh.TRIANGLE_STRIP);
  var iStart=i/heightDiv;
  var iNext=(i+1)/heightDiv;
  var y=yStart+height*iStart;
  var yNext=yStart+height*iNext;
  mesh.texCoord2(0,iNext);
  mesh.vertex3(xStart,yNext,0);
  mesh.texCoord2(0,iStart);
  mesh.vertex3(xStart,y,0);
  for(var j=0;j<widthDiv;j++){
   var jx=(j+1)/widthDiv;
   var x=xStart+width*jx;
   mesh.texCoord2(jx,iNext);
   mesh.vertex3(x,yNext,0);
   mesh.texCoord2(jx,iStart);
   mesh.vertex3(x,y,0);
  }
 }
 return mesh;
}
/**
* Creates a mesh of a sphere, centered at the origin.
* See the "{@tutorial shapes}" tutorial.
* @param {number} radius Radius of the sphere.
* May be null or omitted, in which case the default is 1.
* @param {number} slices Number of vertical sections the sphere consists
* of.  This function will create an octahedron if "slices" is 4 and "stacks" is 2.
* Must be 3 or greater. May be null or omitted, in which case the default is 16.
* @param {number} stacks Number of horizontal sections the sphere consists of.
* May be null or omitted, in which case the default is 16.
* @param {boolean} flat If true, will generate normals such that the
* sphere will be flat shaded; otherwise, will generate normals such that the
* sphere will be smooth shaded.
* @param {boolean} inside If true, the normals generated by this
* method will point inward; otherwise, outward.  Should normally be false
* unless the sphere will be viewed from the inside.
* @return {Mesh} The generated mesh.
*/
Meshes.createSphere=function(radius, slices, stacks, flat, inside){
 return Meshes._createCapsule(radius,0,slices,stacks,1,flat,inside);
}

/**
* Creates a mesh of a capsule, centered at the origin.
* The length of the capsule will run along the z-axis. (If the capsule
* has a high length and a very low radius, it will resemble a 3D line
* with rounded corners.)
* See the "{@tutorial shapes}" tutorial.
* @param {number} radius Radius of each spherical
* end of the capsule.
* May be null or omitted, in which case the default is 1.
* @param {number} length Length of the middle section.
* May be null or omitted, in which case the default is 1.
* If this value is 0, an approximation to a sphere will be generated.
* @param {number} slices Number of vertical sections the capsule consists
* of.  This function will create an octahedron if "slices" is 4 and "stacks" is 2.
* Must be 3 or greater. May be null or omitted, in which case the default is 16.
* @param {number} stacks Number of horizontal sections
* each spherical half consists of.
* May be null or omitted, in which case the default is 8.
* @param {number} middleStacks Number of vertical sections
* the middle of the capsule consists of.
* May be null or omitted, in which case the default is 1.
* @param {boolean} flat If true, will generate normals such that the
* capsule will be flat shaded; otherwise, will generate normals such that the
* capsule will be smooth shaded.
* @param {boolean} inside If true, the normals generated by this
* method will point inward; otherwise, outward.  Should normally be false
* unless the capsule will be viewed from the inside.
* @return {Mesh} The generated mesh.
*/
Meshes.createCapsule=function(radius, length, slices, stacks, middleStacks, flat, inside){
 if(stacks==null)stacks=8;
 if(stacks<1)throw new Error("too few stacks");
 return Meshes._createCapsule(radius,length,slices,stacks*2,middleStacks,flat,inside);
}
Meshes._createCapsule=function(radius, length, slices, stacks, middleStacks, flat, inside){
 var mesh=new Mesh();
 if(slices==null)slices=16;
 if(stacks==null)stacks=16;
 if(middleStacks==null)middleStacks=1;
 if(radius==null)radius=1;
 if(length==null)length=1;
 if(stacks<2)throw new Error("too few stacks");
 if(slices<=2)throw new Error("too few slices");
 if(middleStacks<1 && length>0)throw new Error("too few middle stacks");
 if(length<0)throw new Error("negative length")
 if(radius<0)throw new Error("negative radius")
 if(radius==0){
  // radius is zero
  return mesh;
 }
 var halfLength=length*0.5;
 var halfStacks=stacks/2;
 var normDir=(inside) ? -1 : 1;
 var sc=[0,1]; // sin(0), cos(0)
 var scStack=[];
 var texc=[];
 var tc=[0];
 var twopi=GLMath.PiTimes2;
 var pidiv2=GLMath.HalfPi;
 for(var i=1;i<slices;i++){
  var t=i*1.0/slices;
  var angle=twopi*t;
  var cangle = Math.cos(angle);
  var sangle = (angle>=0 && angle<6.283185307179586) ? (angle<=3.141592653589793 ? Math.sqrt(1.0-cangle*cangle) : -Math.sqrt(1.0-cangle*cangle)) : Math.sin(angle);
  sc.push(sangle,cangle);
  tc.push(t);
 }
 sc.push(0,1);
 tc.push(1);
 var sphereRatio=(radius*2);
 sphereRatio/=sphereRatio+length;
 var zEnd=[]
 for(var i=1;i<stacks;i++){
   var origt=i*1.0/stacks;
   var angle=Math.PI*origt;
   var s=Math.sin(angle);
   scStack.push(s);
   zEnd.push(-Math.cos(angle));
   var tex=origt;
   texc.push(tex);
 }
 scStack.push(0); // south pole
 texc.push(1); // south pole
 zEnd.push(1); // south pole
 var slicesTimes2=slices*2;
  var lastZeCen=-1;
  var lastRad=0;
  var lastRadNorm=0;
  var lastTex=0;
  function normAndVertex(m,normDir,x,y,z,offset){
   m.normal3(x*normDir,y*normDir,z*normDir)
   m.vertex3(x,y,z+offset);
  }
  for(var i=0;i<stacks;i++){
   var zsCen=lastZeCen;
   var zeCen=zEnd[i];
   var texStart=lastTex;
   var texEnd=texc[i];
   var zStartHeight=radius*zsCen;
   var zEndHeight=radius*zeCen;
   var offset=(i<halfStacks) ? -halfLength : halfLength;
   var zStartNorm=normDir*zsCen;
   var zEndNorm=normDir*zeCen;
   var radiusStart=lastRad;
   var radiusStartNorm=lastRadNorm;
   var radiusEnd=radius*scStack[i];
   var radiusEndNorm=normDir*scStack[i];
   var txs=texStart;
   var txe=texEnd;
   if(length>0){
    txs=(i<halfStacks) ? texStart*sphereRatio :
     (1.0-(1.0-texStart)*sphereRatio)
    txe=(i<halfStacks) ? texEnd*sphereRatio :
     (1.0-(1.0-texEnd)*sphereRatio)
   }
   lastZeCen=zeCen;
   lastTex=texEnd;
   lastRadNorm=radiusEndNorm;
   lastRad=radiusEnd;
   if((i==stacks-1 || i==0)){
    mesh.mode(Mesh.TRIANGLES);
   } else {
    mesh.mode(Mesh.TRIANGLE_STRIP);
    mesh.texCoord2(1,txs);
    normAndVertex(mesh,normDir,0,radiusStart,zStartHeight,offset);
    mesh.texCoord2(1,txe);
    normAndVertex(mesh,normDir,0,radiusEnd,zEndHeight,offset);
   }
   var lastTx=0;
   var lastX=0;
   var lastY=1;
   for(var k=2,j=1;k<=slicesTimes2;k+=2,j++){
    var tx=tc[j];
    var x,y;
    if(i==stacks-1){
     var txMiddle=lastTx+(tx-lastTx)*0.5;
     mesh.texCoord2(1-lastTx,txs);
     normAndVertex(mesh,normDir,lastX*radiusStart,lastY*radiusStart,zStartHeight,offset);
     // point at south pole
     mesh.texCoord2(1-txMiddle,txe);
     normAndVertex(mesh,normDir,0,radiusEnd,zEndHeight,offset);
     x=sc[k];
     y=sc[k+1];
     mesh.texCoord2(1-tx,txs);
     normAndVertex(mesh,normDir,x*radiusStart,y*radiusStart,zStartHeight,offset);
     lastX=x;
     lastY=y;
     lastTx=tx;
    } else if(i==0){
     var txMiddle=lastTx+(tx-lastTx)*0.5;
     // point at north pole
     mesh.texCoord2(1-txMiddle,txs);
     normAndVertex(mesh,normDir,0,radiusStart,zStartHeight,offset);
     mesh.texCoord2(1-lastTx,txe);
     normAndVertex(mesh,normDir,lastX*radiusEnd,lastY*radiusEnd,zEndHeight,offset);
     x=sc[k];
     y=sc[k+1];
     mesh.texCoord2(1-tx,txe);
     normAndVertex(mesh,normDir,x*radiusEnd,y*radiusEnd,zEndHeight,offset);
     lastX=x;
     lastY=y;
     lastTx=tx;
    } else {
     x=sc[k];
     y=sc[k+1];
     mesh.texCoord2(1-tx,txs);
     normAndVertex(mesh,normDir,x*radiusStart,y*radiusStart,zStartHeight,offset);
     mesh.texCoord2(1-tx,txe);
     normAndVertex(mesh,normDir,x*radiusEnd,y*radiusEnd,zEndHeight,offset);
    }
   }
   if(i+1==halfStacks && length>0){
    var sr2=sphereRatio*0.5;
    var hl=halfLength*2;
    var endr2=1.0-sr2;
    var he=1.0-sphereRatio;
    for(var m=0;m<middleStacks;m++){
     var s=-halfLength+(m==0 ? 0 : (hl*m/middleStacks));
     var e=(m==middleStacks-1) ? halfLength : (-halfLength+hl*(m+1)/middleStacks);
     var txs=sr2+(m==0 ? 0 : (he*m/middleStacks));
     var txe=(m==middleStacks-1) ? endr2 : (sr2+he*(m+1)/middleStacks);
     mesh.mode(Mesh.TRIANGLE_STRIP);
     mesh.texCoord2(1,txs);
     normAndVertex(mesh,normDir,0,radiusEnd,zEndHeight,s);
     mesh.texCoord2(1,txe);
     normAndVertex(mesh,normDir,0,radiusEnd,zEndHeight,e);
     for(var k=2,j=1;k<=slicesTimes2;k+=2,j++){
      var tx=tc[j];
      var x,y;
      x=sc[k];
      y=sc[k+1];
      mesh.texCoord2(1-tx,txs);
      normAndVertex(mesh,normDir,x*radiusEnd,y*radiusEnd,zEndHeight,s);
      mesh.texCoord2(1-tx,txe);
      normAndVertex(mesh,normDir,x*radiusEnd,y*radiusEnd,zEndHeight,e);
     }
    }
   }
  }
 return flat ? mesh.recalcNormals(flat,inside) : mesh.normalizeNormals();
}

this["Meshes"]=Meshes;
;
/**
* Represents an off-screen frame buffer.<p>
* When FrameBuffer's
* constructor is called, it will create a texture buffer with the given
* width and height and a depth buffer with the same dimensions,
* and will bind both to the frame buffer.  The frame buffer currently
* bound to the WebGL context will remain unchanged.
* @class
* @alias glutil.FrameBuffer
* @param {WebGLRenderingContext|object} context
* WebGL context to associate with this buffer, or an object, such as Scene3D, that
* implements a no-argument <code>getContext</code> method
* that returns a WebGL context.
* @param {number} width Width, in pixels, of the frame buffer.
* Fractional values are rounded up.
* @param {number} height Height, in pixels, of the frame buffer.
* Fractional values are rounded up.
*/
function FrameBuffer(context, width, height){
 if(width<0 || height<0)throw new Error("width or height negative");
 this.context=context;
 // give the framebuffer its own texture unit, since the
 // shader program may bind samplers to other texture
 // units, such as texture unit 0
 this.textureUnit=1;
 this.buffer=context.createFramebuffer();
 // create color texture
 this.colorTexture = context.createTexture();
 this.width=Math.ceil(width);
 this.height=Math.ceil(height);
 this.context.activeTexture(this.context.TEXTURE0+this.textureUnit);
 this.context.bindTexture(this.context.TEXTURE_2D, this.colorTexture);
 // In WebGL, texture coordinates start at the upper left corner rather than
 // the lower left as in OpenGL and OpenGL ES, so we use this method call
 // to reestablish the lower left corner.
 this.context.pixelStorei(this.context.UNPACK_FLIP_Y_WEBGL, 1);
 this.context.texImage2D(this.context.TEXTURE_2D, 0,
   this.context.RGBA, this.width, this.height, 0,
   this.context.RGBA, this.context.UNSIGNED_BYTE, null);
 // set essential parameters now to eliminate warnings (will
 // be set again as the texture is bound)
  this.context.texParameteri(this.context.TEXTURE_2D,
   this.context.TEXTURE_MAG_FILTER, this.context.NEAREST);
 this.context.texParameteri(this.context.TEXTURE_2D,
  this.context.TEXTURE_MIN_FILTER, this.context.NEAREST);
 this.context.texParameteri(this.context.TEXTURE_2D,
  this.context.TEXTURE_WRAP_S, this.context.CLAMP_TO_EDGE);
 this.context.texParameteri(this.context.TEXTURE_2D,
  this.context.TEXTURE_WRAP_T, this.context.CLAMP_TO_EDGE);
 // create depth renderbuffer
 this.depthbuffer=this.context.createRenderbuffer();
 var oldBuffer=this.context.getParameter(
   context.FRAMEBUFFER_BINDING);
 this.context.bindFramebuffer(
   context.FRAMEBUFFER,this.buffer);
 this.context.bindRenderbuffer(
   context.RENDERBUFFER,this.depthbuffer);
 this.context.renderbufferStorage(
   context.RENDERBUFFER,context.DEPTH_COMPONENT16,
   this.width,this.height);
 this.context.bindFramebuffer(
   context.FRAMEBUFFER,oldBuffer);
}
/**
 * Gets the WebGL context associated with this frame buffer.
 * @return {WebGLRenderingContext}
 */
FrameBuffer.prototype.getContext=function(){
 return this.context;
}
/**
 * Not documented yet.
 * @param {glutil.ShaderProgram} program
 */
FrameBuffer.prototype.bind=function(program){
  if(program.getContext()!=this.context){
   throw new Error("can't bind buffer: context mismatch");
  }
 this.context.activeTexture(this.context.TEXTURE0+this.textureUnit);
 this.context.bindFramebuffer(
    this.context.FRAMEBUFFER,this.buffer);
 this.context.framebufferTexture2D(
   this.context.FRAMEBUFFER,this.context.COLOR_ATTACHMENT0,
   this.context.TEXTURE_2D,this.colorTexture,0);
 this.context.framebufferRenderbuffer(
   this.context.FRAMEBUFFER,this.context.DEPTH_ATTACHMENT,
   this.context.RENDERBUFFER,this.depthbuffer);
}
/**
 * Unbinds this frame buffer from its associated WebGL this.context.
 */
FrameBuffer.prototype.unbind=function(){
 this.context.framebufferTexture2D(
   this.context.FRAMEBUFFER,this.context.COLOR_ATTACHMENT0,
   this.context.TEXTURE_2D,null,0);
 this.context.framebufferRenderbuffer(
   this.context.FRAMEBUFFER,this.context.DEPTH_ATTACHMENT,
   this.context.RENDERBUFFER,null);
 this.context.bindFramebuffer(
    this.context.FRAMEBUFFER,null);
}
/**
 * Disposes all resources from this frame buffer object.
 */
FrameBuffer.prototype.dispose=function(){
 if(this.buffer!=null)
  this.context.deleteFramebuffer(this.buffer);
 if(this.depthbuffer!=null)
  this.context.deleteRenderbuffer(this.depthbuffer);
 if(this.colorTexture!=null)
  this.context.deleteTexture(this.colorTexture);
 this.buffer=null;
 this.depthbuffer=null;
 this.colorTexture=null;
}
;
/*
Written by Peter O. in 2015.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://upokecenter.dreamhosters.com/articles/donate-now-2/
*/

/**
* A geometric mesh in the form of vertex buffer objects.
* @class
* @alias glutil.BufferedMesh
* @param {glutil.Mesh} mesh A geometric mesh object.
* @param {WebGLRenderingContext|object} context A WebGL context to
*  create vertex buffers from, or an object, such as Scene3D, that
* implements a no-argument <code>getContext</code> method
* that returns a WebGL context. (Note that this constructor uses
*  a WebGL context rather than a shader program because
*  vertex buffer objects are not specific to shader programs.)
*/
function BufferedMesh(mesh, context){
 this.subMeshes=[];
 this.context=GLUtil._toContext(context);
 this._bounds=mesh.getBoundingBox();
 for(var i=0;i<mesh.subMeshes.length;i++){
  var sm=mesh.subMeshes[i];
  // skip empty submeshes
  if(sm.indices.length==0)continue;
  this.subMeshes.push(new BufferedSubMesh(
    sm,this.context));
 }
}
/** @private */
BufferedMesh.prototype._getBounds=function(){
 return this._bounds;
}
/**
 * Returns the WebGL context associated with this object.
 * @return {WebGLRenderingContext}
 */
BufferedMesh.prototype.getContext=function(){
 return this.context;
}
/** @private */
BufferedMesh.prototype.getFormat=function(){
 var format=0;
 for(var i=0;i<this.subMeshes.length;i++){
  var sm=this.subMeshes[i];
  format|=sm.format;
 }
 return format;
}

/**
* Binds the buffers in this object to attributes according
* to their data format, and draws the elements in this mesh
* according to the data in its vertex buffers.
* @param {glutil.ShaderProgram} program A shader program object to get
* the IDs from for attributes named "position", "normal",
* "colorAttr", and "uv", and the "useColorAttr" uniform.
*/
BufferedMesh.prototype.draw=function(program){
 for(var i=0;i<this.subMeshes.length;i++){
  this.subMeshes[i].draw(program);
 }
}
/**
* Deletes the vertex and index buffers associated with this object.
*/
BufferedMesh.prototype.dispose=function(){
 for(var i=0;i<this.subMeshes.length;i++){
  this.subMeshes[i].dispose();
 }
 this.subMeshes=[];
}
/** @private */
function BufferedSubMesh(mesh, context){
 var vertbuffer=context.createBuffer();
 var facebuffer=context.createBuffer();
 context.bindBuffer(context.ARRAY_BUFFER, vertbuffer);
 context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, facebuffer);
 context.bufferData(context.ARRAY_BUFFER,
   new Float32Array(mesh.vertices), context.STATIC_DRAW);
 var type=context.UNSIGNED_SHORT;
 if(mesh.vertices.length>=65536 || mesh.indices.length>=65536){
  type=context.UNSIGNED_INT;
  context.bufferData(context.ELEMENT_ARRAY_BUFFER,
    new Uint32Array(mesh.indices), context.STATIC_DRAW);
 } else if(mesh.vertices.length<=256 && mesh.indices.length<=256){
  type=context.UNSIGNED_BYTE;
  context.bufferData(context.ELEMENT_ARRAY_BUFFER,
    new Uint8Array(mesh.indices), context.STATIC_DRAW);
 } else {
  context.bufferData(context.ELEMENT_ARRAY_BUFFER,
    new Uint16Array(mesh.indices), context.STATIC_DRAW);
 }
  this.verts=vertbuffer;
  this.faces=facebuffer;
  this.numVertices=mesh.vertices.length/mesh.getStride();
  this.facesLength=mesh.indices.length;
  this.type=type;
  this.format=mesh.attributeBits;
  this.context=context;
}
/**
 * @private */
BufferedSubMesh.prototype.dispose=function(){
 if(this.verts!=null)
  this.context.deleteBuffer(this.verts);
 if(this.faces!=null)
  this.context.deleteBuffer(this.faces);
 this.verts=null;
 this.faces=null;
}

/**
 * @private */
BufferedSubMesh.prototype.draw=function(program){
  // Binding phase
  function _vertexAttrib(context, attrib, size, type, stride, offset){
    if(attrib!==null){
      context.enableVertexAttribArray(attrib);
      context.vertexAttribPointer(attrib,size,type,false,stride,offset);
    }
  }
  var context=program.getContext();
  if(this.verts==null || this.faces==null){
   throw new Error("mesh buffer disposed");
  }
  if(context!=this.context){
   throw new Error("can't bind mesh: context mismatch");
  }
  context.bindBuffer(context.ARRAY_BUFFER, this.verts);
  context.bindBuffer(context.ELEMENT_ARRAY_BUFFER, this.faces);
  var format=this.format;
  var stride=Mesh._getStride(format);
  var attr=program.get("position");
  _vertexAttrib(context,
    attr, 3, context.FLOAT, stride*4, 0);
  var offset=Mesh._normalOffset(format);
  if(offset>=0){
   attr=program.get("normal");
   _vertexAttrib(context,
    attr, 3,
    context.FLOAT, stride*4, offset*4);
  } else {
   attr=program.get("normal");
   if(attr!==null)context.disableVertexAttribArray(attr);
  }
  offset=Mesh._colorOffset(format);
  if(offset>=0){
   program.setUniforms({"useColorAttr":1.0});
   attr=program.get("colorAttr");
   _vertexAttrib(context,
    attr, 3,
    context.FLOAT, stride*4, offset*4);
  } else {
   program.setUniforms({"useColorAttr":0.0});
   attr=program.get("colorAttr");
   if(attr!==null)context.disableVertexAttribArray(attr);
  }
  offset=Mesh._texCoordOffset(format);
  if(offset>=0){
   attr=program.get("uv");
   _vertexAttrib(context,
     attr, 2,
    context.FLOAT, stride*4, offset*4);
  } else {
   attr=program.get("uv");
   if(attr!==null)context.disableVertexAttribArray(attr);
  }
  offset=Mesh._tangentOffset(format);
  if(offset>=0){
   attr=program.get("tangent");
   _vertexAttrib(context,
     attr, 3,
    context.FLOAT, stride*4, offset*4);
  } else {
   attr=program.get("tangent");
   if(attr!==null)context.disableVertexAttribArray(attr);
  }
  offset=Mesh._bitangentOffset(format);
  if(offset>=0){
   attr=program.get("bitangent");
   _vertexAttrib(context,
     attr, 3,
    context.FLOAT, stride*4, offset*4);
  } else {
   attr=program.get("bitangent");
   if(attr!==null)context.disableVertexAttribArray(attr);
  }
  // Drawing phase
  var context=program.getContext();
  if(this.verts==null || this.faces==null){
   throw new Error("mesh buffer disposed");
  }
  if(context!=this.context){
   throw new Error("can't bind mesh: context mismatch");
  }
  var primitive=context.TRIANGLES;
  if((this.format&Mesh.LINES_BIT)!=0)primitive=context.LINES;
  if((this.format&Mesh.POINTS_BIT)!=0)primitive=context.POINTS;
  context.drawElements(primitive,
    this.facesLength,
    this.type, 0);
}
/**
 * @private */
BufferedSubMesh.prototype.primitiveCount=function(){
  if((this.format&Mesh.LINES_BIT)!=0)
   return Math.floor(this.facesLength/2);
  if((this.format&Mesh.POINTS_BIT)!=0)
   return this.facesLength;
  return Math.floor(this.facesLength/3);
}
/**
 * Not documented yet.
 */
BufferedMesh.prototype.vertexCount=function(){
 var ret=0;
 for(var i=0;i<this.subMeshes.length;i++){
  ret+=this.subMeshes[i].numVertices;
 }
 return ret;
}
/**
 * Gets the number of primitives (triangles, lines,
* and points) composed by all shapes in this mesh.
* @return {number}
*/
BufferedMesh.prototype.primitiveCount=function(){
 var ret=0;
 for(var i=0;i<this.subMeshes.length;i++){
  ret+=this.subMeshes[i].primitiveCount();
 }
 return ret;
}
;
/*
Written by Peter O. in 2015.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://upokecenter.dreamhosters.com/articles/donate-now-2/
*/

/**
* Represents a WebGL shader program.  A shader program in
* WebGL consists of a vertex shader (which processes vertices),
* and a fragment shader (which processes pixels).  Shader programs
* are specially designed for running on a graphics processing unit,
* or GPU.<p>
* When the ShaderProgram constructor is called, it will compile
* and link a shader program from the source text passed to it, but
* it won't use that program until the use() method is called.  If the
* program is compiled and linked successfully, the constructor
* will also gather a list of the program's attributes (vertex-specific variables
* in vertex buffer objects) and uniforms (variables not specific to a vertex).<p>
* If compiling or linking the shader program fails, a diagnostic
* log is output to the JavaScript console.
* @class
* @alias glutil.ShaderProgram
* @param {WebGLRenderingContext|object} context A WebGL context associated with the
* compiled shader program, or an object, such as Scene3D, that
* implements a no-argument <code>getContext</code> method
* that returns a WebGL context.
* @param {String} [vertexShader] Source text of a vertex shader, in OpenGL
* ES Shading Language (GLSL).  If null, a default
* vertex shader is used instead.
* @param {String} [fragmentShader] Source text of a fragment shader in GLSL.
* If null, a default fragment shader is used instead.
*/
function ShaderProgram(context, vertexShader, fragmentShader){
 context= (context.getContext) ? context.getContext() : context;
 if(vertexShader==null){
  vertexShader=ShaderProgram.getDefaultVertex();
 }
 if(fragmentShader==null){
  fragmentShader=ShaderProgram.getDefaultFragment();
 }
 var prog=ShaderProgram._compileShaders(context,vertexShader,fragmentShader);
 this.program=prog;
 this.attributes={};
 this.context=context;
 this.actives={};
 this.uniformValues={};
 this.uniformTypes={};
 this.savedUniforms={};
 if(prog!=null){
  this.attributes=[];
  var name=null;
  var ret={}
  var count= context.getProgramParameter(prog, context.ACTIVE_ATTRIBUTES);
  for (var i = 0; i < count; ++i) {
   var attributeInfo=context.getActiveAttrib(prog, i);
   if(attributeInfo!==null){
    name=attributeInfo.name;
    var attr=context.getAttribLocation(prog, name);
    if(attr>=0){
     this.attributes.push(attr);
     ret[name]=attr;
    }
   }
  }
  count = context.getProgramParameter(prog, context.ACTIVE_UNIFORMS);
  for (var i = 0; i < count; ++i) {
   var uniformInfo=context.getActiveUniform(prog, i);
   if(uniformInfo!==null){
    name = uniformInfo.name;
    ret[name] = context.getUniformLocation(prog, name);
    this.uniformTypes[name] = uniformInfo.type;
   }
  }
  this.actives=ret;
 }
}
/** Disposes resources from this shader program.
*/
ShaderProgram.prototype.dispose=function(){
 if(this.program){
  this.context.deleteProgram(this.program);
 }
 this.context=null;
 this.program=null;
 this.actives={};
 this.attributes={};
 this.uniformTypes={};
}
/** Gets the WebGL context associated with this shader program.
* @return {WebGLRenderingContext} Return value.*/
ShaderProgram.prototype.getContext=function(){
 return this.context;
}
/**
* Gets the location of the given uniform or attribute's name in this program.
* (Although the location may change each time the shader program
* is linked, that normally only happens upon construction
* in the case of ShaderProgram.)
* @param {string} name The name of an attribute or uniform defined in either the
* vertex or fragment shader of this shader program.  If the uniform or attribute
* is an array, each element in the array is named as in these examples:
* "unif[0]", "unif[1]".   If it's a struct, each member in the struct is named as in these examples:
* "unif.member1", "unif.member2".  If it's an array of struct, each
* member is named as in these examples: "unif[0].member1",
* "unif[0].member2".
* @return {number|WebGLUniformLocation|null} The location of the uniform or attribute
* name, or null if it doesn't exist.
*/
ShaderProgram.prototype.get=function(name){
 var ret=this.actives[name];
 return (ret==null) ? null : ret;
}
/**
* Gets the value of the given uniform in this program. This method
* may be called at any time, even if this program is not currently the
* active program in the WebGL context.
* @param {string} name The name of a uniform defined in either the
* vertex or fragment shader of this shader program.  See get().
* @return {*} The uniform's value, or null if it doesn't exist or if
* an attribute is named, not a uniform.
*/
ShaderProgram.prototype.getUniform=function(name){
 var loc=(typeof name=="string") ? this.get(name) : name;
 // If "loc" is a number that means it's an attribute, not a uniform;
 // we expect WebGLUniformLocation
 if(loc==null || typeof loc=="number")return null;
 // using a cache since context.getUniform can be slow with
 // repeated calls
 var uv=this.uniformValues[name];
 if(uv==null){
  return this.context.getUniform(this.program,loc);
 } else {
  return (uv instanceof Array) ? uv.slice(0,uv.length) : uv;
 }
}
/**
* Makes this program the active program for the WebGL context.
* This method also sets uniforms that couldn't be applied by the
* setUniforms() method because the context used a different
* program.<p>
* Changing the context's active program doesn't reset the uniform
* variables associated with the previous program.
* @return {glutil.ShaderProgram} This object.
*/
ShaderProgram.prototype.use=function(){
 this.context.useProgram(this.program);
 this.setUniforms(this.savedUniforms);
 this.savedUniforms={};
 return this;
}
/** @private */
ShaderProgram.prototype._log=function(i,v){
 //console.log("setting "+i+": "+v);
}
/** @private */
ShaderProgram.prototype._saveIfNotCurrent=function(v,i,isCurrentProgram){
     this._log(i,v);
     if(isCurrentProgram==null){
       isCurrentProgram=this.context.getParameter(
         this.context.CURRENT_PROGRAM)==this.program;
      }
      if(!isCurrentProgram){
       // Save this uniform to write later
       this.savedUniforms[i]=(typeof v=="number") ? v : v.slice(0,v.length);
       this.uniformValues[i]=null;
      }
      return isCurrentProgram;
}
/** @private */
ShaderProgram.prototype._setUniform=function(uniforms,i,isCurrentProgram){
  var isCurrentProgram=null;
      var v=uniforms[i];
      var uniform=this.get(i);
      if(uniform===null)return isCurrentProgram;
      var uv=this.uniformValues[i];
      if(typeof v=="number"){
       var newUv=false;
       if(uv==null){
        this.uniformValues[i]=uv=v;
        newUv=true;
       } else if(uv!=v){
        uv=v;
        this.uniformValues[i]=v;
        newUv=true;
       }
       if(newUv){
         if(this.uniformTypes[i]==this.context.FLOAT){
          if(!(isCurrentProgram=this._saveIfNotCurrent(uv,i,isCurrentProgram)))
           return isCurrentProgram;
         this.context.uniform1f(uniform, uv);
        } else {
         if(!(isCurrentProgram=this._saveIfNotCurrent(uv,i,isCurrentProgram)))
          return isCurrentProgram;
         this.context.uniform1i(uniform, uv);
        }
       }
      }
      else if(v.length==3){
       if(!uv){
        this.uniformValues[i]=uv=v.slice(0,v.length)
         if(!(isCurrentProgram=this._saveIfNotCurrent(uv,i,isCurrentProgram)))
          return isCurrentProgram;
        this.context.uniform3fv(uniform, uv);
       } else if(uv[0]!=v[0] || uv[1]!=v[1] || uv[2]!=v[2]){
        uv[0]=v[0]; uv[1]=v[1]; uv[2]=v[2];
         if(!(isCurrentProgram=this._saveIfNotCurrent(uv,i,isCurrentProgram)))
          return isCurrentProgram;
        this.context.uniform3fv(uniform, uv);
       }
      } else if(v.length==2){
       if(!uv){
        this.uniformValues[i]=uv=v.slice(0,v.length)
         if(!(isCurrentProgram=this._saveIfNotCurrent(uv,i,isCurrentProgram)))
          return isCurrentProgram;
        this.context.uniform2fv(uniform, uv);
       } else if(uv[0]!=v[0] || uv[1]!=v[1]){
        uv[0]=v[0]; uv[1]=v[1];
         if(!(isCurrentProgram=this._saveIfNotCurrent(uv,i,isCurrentProgram)))
          return isCurrentProgram;
        this.context.uniform2fv(uniform, uv);
       }
      } else if(v.length==4){
       if(!uv){
        this.uniformValues[i]=uv=v.slice(0,v.length)
         if(!(isCurrentProgram=this._saveIfNotCurrent(uv,i,isCurrentProgram)))
          return isCurrentProgram;
        this.context.uniform4fv(uniform, uv);
       } else if(uv[0]!=v[0] || uv[1]!=v[1] || uv[2]!=v[2] || uv[3]!=v[3]){
        uv[0]=v[0]; uv[1]=v[1]; uv[2]=v[2]; uv[3]=v[3];
         if(!(isCurrentProgram=this._saveIfNotCurrent(uv,i,isCurrentProgram)))
          return isCurrentProgram;
        this.context.uniform4fv(uniform, uv);
       }
      } else if(v.length==16){
       if(!uv){
        this.uniformValues[i]=uv=v.slice(0,v.length)
        if(!(isCurrentProgram=this._saveIfNotCurrent(uv,i,isCurrentProgram)))
          return isCurrentProgram;
        this.context.uniformMatrix4fv(uniform,false,uv);
       } else if(ShaderProgram._copyIfDifferent(v,uv,16)){
          if(!(isCurrentProgram=this._saveIfNotCurrent(uv,i,isCurrentProgram)))
          return isCurrentProgram;
        this.context.uniformMatrix4fv(uniform,false,uv);
       }
      } else if(v.length==9){
       if(!uv){
        this.uniformValues[i]=uv=v.slice(0,v.length)
         if(!(isCurrentProgram=this._saveIfNotCurrent(uv,i,isCurrentProgram)))
          return isCurrentProgram;
        this.context.uniformMatrix3fv(uniform,false,uv);
       } else if(ShaderProgram._copyIfDifferent(v,uv,9)){
         if(!(isCurrentProgram=this._saveIfNotCurrent(uv,i,isCurrentProgram)))
          return isCurrentProgram;
        this.context.uniformMatrix3fv(uniform,false,uv);
       }
      }
      return isCurrentProgram;
}
/**
* Sets uniform variables for this program.  Uniform variables
* are called uniform because they uniformly apply to all vertices
* in a primitive, and are not different per vertex.<p>
* This method may be called at any time, even if this program is not currently the
* active program in the WebGL context.  In that case, this method will instead
* save the uniforms to write them later the next time this program
* becomes the currently active program (via the use() method).<p>
* Once the uniform is written to the program, it will be retained even
* after a different program becomes the active program. (It will only
* be reset if this program is re-linked, which won't normally happen
* in the case of the ShaderProgram class.)
* @param {Object} uniforms A hash of key/value pairs.  Each key is
* the name of a uniform (see {@link glutil.ShaderProgram#get}
* for more information), and each
* value is the value to set
* to that uniform.  Uniform values that are 3- or 4-element
* vectors must be 3 or 4 elements long, respectively.  Uniforms
* that are 4x4 matrices must be 16 elements long.  Keys to
* uniforms that don't exist in this program are ignored.  See also
* the "name" parameter of the {@link glutil.ShaderProgram#get}
* method for more information on
* uniform names.
* @return {glutil.ShaderProgram} This object.
*/
ShaderProgram.prototype.setUniforms=function(uniforms){
  var isCurrentProgram=null;
  if(typeof Object.keys!=="undefined"){
    var keys=Object.keys(uniforms);for(var ki=0;ki<keys.length;ki++){var i=keys[ki];
     isCurrentProgram=this._setUniform(uniforms,i,isCurrentProgram);
    }
  } else {
    for(var i in uniforms){
     isCurrentProgram=this._setUniform(uniforms,i,isCurrentProgram);
    }
  }
  return this;
}
ShaderProgram._copyIfDifferent=function(src,dst,len){
 for(var i=0;i<len;i++){
  if(src[i]!=dst[i]){
   // Arrays are different
   dst[i]=src[i];
   for(var j=i+1;j<len;j++){
    dst[j]=src[j];
   }
   return true;
  }
 }
 return false;
}
/** @private */
ShaderProgram._compileShaders=function(context, vertexShader, fragmentShader){
  function compileShader(context, kind, text){
    var shader=context.createShader(kind);
    context.shaderSource(shader, text);
    context.compileShader(shader);
    if (!context.getShaderParameter(shader, context.COMPILE_STATUS)) {
      var lines=text.split("\n")
      // add line numbers
      for(var i=0;i<lines.length;i++){
       lines[i]="/* "+(i+1)+" */   "+lines[i]
      }
      console.log(lines.join("\n"));
      console.log((kind==context.VERTEX_SHADER ? "vertex: " : "fragment: ")+
        context.getShaderInfoLog(shader));
      return null;
    }
   return shader;
  }
  var vs=(!vertexShader || vertexShader.length==0) ? null :
    compileShader(context,context.VERTEX_SHADER,vertexShader);
  var fs=(!fragmentShader || fragmentShader.length==0) ? null :
    compileShader(context,context.FRAGMENT_SHADER,fragmentShader);
  var program = null;
  if(vs!==null && fs!==null){
   program = context.createProgram();
   context.attachShader(program, vs);
   context.attachShader(program, fs);
    context.linkProgram(program);
   if (!context.getProgramParameter(program, context.LINK_STATUS)) {
    console.log("link: "+context.getProgramInfoLog(program));
    context.deleteProgram(program);
    program=null;
   }
   context.detachShader(program, vs);
   context.detachShader(program, fs);
  }
  if(vs!==null)context.deleteShader(vs);
  if(fs!==null)context.deleteShader(fs);
  return program;
};
/** @private */
ShaderProgram.fragmentShaderHeader=function(){
return "" +
"#ifdef GL_ES\n" +
"#ifndef GL_FRAGMENT_PRECISION_HIGH\n" +
"precision mediump float;\n" +
"#else\n" +
"precision highp float;\n" +
"#endif\n" +
"#endif\n";
}
/**
* Generates source code for a fragment shader for applying
* a raster effect to a texture.
* @param {string} functionCode See ShaderProgram.makeEffect().
* @return {string} The source text of the resulting fragment shader.
*/
ShaderProgram.makeEffectFragment=function(functionCode){
var shader=ShaderProgram.fragmentShaderHeader();
shader+=""+
"uniform sampler2D sampler;\n" + // texture sampler
"uniform vec2 textureSize;\n" + // texture size
"varying vec2 uvVar;\n"+
"varying vec3 colorAttrVar;\n";
shader+=functionCode;
shader+="\n\nvoid main(){\n" +
" // normalize coordinates to 0..1\n" +
" vec2 uv=gl_FragCoord.xy/textureSize.xy;\n" +
" gl_FragColor=textureEffect(sampler,uv,textureSize);\n" +
"}";
return shader;
}
/**
* Generates a shader program for applying
* a raster effect to a texture.
* @param {WebGLRenderingContext|object} context A WebGL context associated with the
* compiled shader program, or an object, such as Scene3D, that
* implements a no-argument <code>getContext</code> method
* that returns a WebGL context.
* @param {string} functionCode A string giving shader code
* in OpenGL ES Shading Language (GLSL) that must contain
* a function with the following signature:
* <pre>
* vec4 textureEffect(sampler2D sampler, vec2 uvCoord, vec2 textureSize)
* </pre>
* where <code>sampler</code> is the texture sampler, <code>uvCoord</code>
* is the texture coordinates ranging from 0 to 1 in each component,
* <code>textureSize</code> is the dimensions of the texture in pixels,
* and the return value is the new color at the given texture coordinates.  Besides
* this requirement, the shader code is also free to define additional uniforms,
* constants, functions, and so on (but not another "main" function).
* @return {glutil.ShaderProgram} The resulting shader program.
*/
ShaderProgram.makeEffect=function(context,functionCode){
 return new ShaderProgram(context,
   ShaderProgram.getBasicVertex(),
   ShaderProgram.makeEffectFragment(functionCode));
}
/**
* Generates a shader program that inverts the colors of a texture.
* @param {WebGLRenderingContext|object} context A WebGL context associated with the
* compiled shader program, or an object, such as Scene3D, that
* implements a no-argument <code>getContext</code> method
* that returns a WebGL context.
* @return {glutil.ShaderProgram} The resulting shader program.
*/
ShaderProgram.getInvertEffect=function(context){
return ShaderProgram.makeEffect(context,
[
"vec4 textureEffect(sampler2D sampler, vec2 uvCoord, vec2 textureSize){",
" vec4 color=texture2D(sampler,uvCoord);",
" vec4 ret; ret.xyz=vec3(1.0,1.0,1.0)-color.xyz; ret.w=color.w; return ret;",
"}"].join("\n"));
}
/**
* Generates a shader program that generates a two-color texture showing
* the source texture's edges.
* @param {WebGLRenderingContext|object} context A WebGL context associated with the
* compiled shader program, or an object, such as Scene3D, that
* implements a no-argument <code>getContext</code> method
* that returns a WebGL context.
* @return {glutil.ShaderProgram} The resulting shader program.
*/
ShaderProgram.getEdgeDetectEffect=function(context){
// Adapted by Peter O. from David C. Bishop's EdgeDetect.frag,
// in the public domain
return ShaderProgram.makeEffect(context,
["float luma(vec3 color) {",
" return 0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b;",
"}",
"const vec4 edge_color=vec4(0.,0,0,1);",
"const vec4 back_color=vec4(1.,1,1,1);",
"vec4 textureEffect(sampler2D sampler, vec2 uvCoord, vec2 textureSize){",
"float dx = 1.0 / float(textureSize.x);",
"float dy = 1.0 / float(textureSize.y);",
"float s00 = luma(texture2D(sampler, uvCoord + vec2(-dx,dy)).rgb);",
"float s10 = luma(texture2D(sampler, uvCoord + vec2(-dx,0.0)).rgb);",
"float s20 = luma(texture2D(sampler, uvCoord + vec2(-dx,-dy)).rgb);",
"float s01 = luma(texture2D(sampler, uvCoord + vec2(0.0,dy)).rgb);",
"float s21 = luma(texture2D(sampler, uvCoord + vec2(0.0,-dy)).rgb);",
"float s02 = luma(texture2D(sampler, uvCoord + vec2(dx, dy)).rgb);",
"float s12 = luma(texture2D(sampler, uvCoord + vec2(dx, 0.0)).rgb);",
"float s22 = luma(texture2D(sampler, uvCoord + vec2(dx, -dy)).rgb);",
"float sx = s00 + 2.0 * s10 + s20 - (s02 + 2.0 * s12 + s22);",
"float sy = s00 + 2.0 * s01 + s02 - (s20 + 2.0 * s21 + s22);",
"float dist = sx * sx + sy * sy;",
"if(dist > 0.4) {",
"return edge_color;",
"} else {",
"return back_color;",
"}}"
].join("\n"));
}

/** @private */
ShaderProgram.getBasicVertex=function(){
var shader=""+
"attribute vec3 position;\n" +
"attribute vec3 uv;\n" +
"attribute vec3 colorAttr;\n" +
"varying vec2 uvVar;\n"+
"varying vec3 colorAttrVar;\n" +
"void main(){\n"+
"vec4 positionVec4;\n"+
"positionVec4.w=1.0;\n"+
"positionVec4.xyz=position;\n" +
"gl_PointSize=1.0;\n" +
"uvVar=uv;\n" +
"colorAttrVar=colorAttr;\n" +
"gl_Position=positionVec4;\n" +
"}\n";
}
/**
* Gets the text of the default vertex shader.  Putting "#define SHADING\n"
* at the start of the return value enables the lighting model.
* @return {string} The resulting shader text.
*/
ShaderProgram.getDefaultVertex=function(){
var shader=[
"attribute vec3 position;",
"attribute vec3 normal;",
"attribute vec2 uv;",
"attribute vec3 colorAttr;",
"attribute vec3 tangent;",
"attribute vec3 bitangent;",
"uniform mat4 modelViewMatrix;",
"uniform mat4 projection;",
"varying vec2 uvVar;",
"varying vec3 colorAttrVar;",
"#ifdef SHADING",
"uniform mat4 world;",
"uniform mat3 worldViewInvTrans3; /* internal */",
"varying vec4 worldPositionVar;",
"#ifdef NORMAL_MAP",
"uniform float useNormalMap;",
"varying mat3 tbnMatrixVar;",
"#endif",
"varying vec3 transformedNormalVar;",
"#endif",
"void main(){",
"vec4 positionVec4;",
"positionVec4.w=1.0;",
"positionVec4.xyz=position;",
"gl_PointSize=1.0;",
"gl_Position=(projection*modelViewMatrix)*positionVec4;",
"colorAttrVar=colorAttr;",
"uvVar=uv;",
"#ifdef SHADING",
"transformedNormalVar=normalize(worldViewInvTrans3*normal);",
"#ifdef NORMAL_MAP",
"if(useNormalMap==0.0){",
"tbnMatrixVar=mat3(1.,0.,0.,0.,1.,0.,0.,0.,1.);",
"} else {",
"tbnMatrixVar=mat3(normalize(vec3(world*vec4(tangent,0.0))),",
"   normalize(bitangent),transformedNormalVar);",
"}",
"#endif",
"worldPositionVar=world*positionVec4;",
"#endif",
"}"].join("\n")
return shader;
};

/**
* Gets the text of the default fragment shader.  Putting "#define SHADING\n"
* at the start of the return value enables the lighting model.
* Putting "#define SPECULAR\n"
* at the start of the return value enables specular highlights (as long
* as SHADING is also enabled).
* @return {string} The resulting shader text.
*/
ShaderProgram.getDefaultFragment=function(){
var shader=ShaderProgram.fragmentShaderHeader() +
 // if shading is disabled, this is solid color instead of material diffuse
 "uniform vec4 md;\n" +
"#ifdef SHADING\n" +
"struct light {\n" +
// NOTE: These struct members must be aligned to
// vec4 size; otherwise, Chrome may have issues retaining
// the value of lights[i].specular, causing flickering
" vec4 position; /* source light direction */\n" +
" vec4 diffuse; /* source light diffuse color */\n" +
"#ifdef SPECULAR\n" +
" vec4 specular; /* source light specular color */\n" +
"#endif\n" +
"};\n" +
"const int MAX_LIGHTS = "+Lights.MAX_LIGHTS+"; /* internal */\n" +
"uniform vec3 sceneAmbient;\n" +
"uniform light lights[MAX_LIGHTS];\n" +
"uniform vec3 ma;\n" +
"uniform vec3 me;\n" +
"#ifdef SPECULAR\n" +
"uniform vec3 ms;\n" +
"uniform float mshin;\n" +
"uniform vec4 viewInvW;\n" +
"#ifdef SPECULAR_MAP\n" +
"uniform float useSpecularMap;\n" +
"uniform sampler2D specularMap;\n" +
"#endif\n" +
"#ifdef NORMAL_MAP\n" +
"uniform float useNormalMap;" +
"uniform sampler2D normalMap;\n" +
"#endif\n" +
"#endif\n" +
"#endif\n" +
"uniform sampler2D sampler;\n" +
"uniform vec2 textureSize;\n" + // texture size (all zeros if textures not used)
"uniform float useColorAttr;\n" + // use color attribute if 1
"varying vec2 uvVar;\n"+
"varying vec3 colorAttrVar;\n" +
"#ifdef SHADING\n" +
"varying vec4 worldPositionVar;\n" +
"varying vec3 transformedNormalVar;\n"+
"#ifdef NORMAL_MAP\n"+
"varying mat3 tbnMatrixVar;\n" +
"#endif\n"+
"vec4 calcLightPower(light lt, vec4 vertexPosition){\n" +
" vec3 sdir;\n" +
" float attenuation;\n" +
" if(lt.position.w == 0.0){ /* directional light */\n" +
"  sdir=normalize((lt.position).xyz);\n" +
"  attenuation=1.0;\n" +
" } else { /* point light */\n" +
"  vec3 vertexToLight=(lt.position-vertexPosition).xyz;\n" +
"  float dist=length(vertexToLight);\n" +
"  if(dist==0.0){\n" +
"   sdir=vertexToLight;\n" +
"   attenuation=1.0;\n" +
"  } else {\n" +
"   sdir=vertexToLight/dist; /* normalizes vertexToLight */\n" +
"   attenuation=(1.0/dist);\n" +
"  }\n" +
" }\n" +
" return vec4(sdir,attenuation);\n" +
"}\n" +
"#endif\n" +
"void main(){\n" +
" vec4 tmp;\n"+
" vec3 normal;\n"+
" float useTexture=sign(textureSize.x+textureSize.y);\n"+
" tmp.w=1.0;\n"+
" tmp.xyz=colorAttrVar;\n"+
" vec4 baseColor=mix(mix(\n"+
"   md, /*when textures are not used*/\n" +
"   texture2D(sampler,uvVar), /*when textures are used*/\n"+
"   useTexture), tmp, useColorAttr);\n"+
"#ifdef SHADING\n" +
"#ifdef NORMAL_MAP\n" +
"normal = mix(transformedNormalVar,"+
" normalize(tbnMatrixVar*(2.0*texture2D(normalMap,uvVar).rgb - vec3(1.0))),"+
" useNormalMap);\n" +
"#else\n" +
"normal = transformedNormalVar;\n" +
"#endif\n" +
"#define SET_LIGHTPOWER(i) "+
" lightPower[i]=calcLightPower(lights[i],worldPositionVar)\n" +
"#define ADD_DIFFUSE(i) "+
" lightedColor+=vec3(lights[i].diffuse)*max(lightCosines[i],0.0)*lightPower[i].w*materialDiffuse;\n" +
"vec4 lightPower["+Lights.MAX_LIGHTS+"];\n" +
"float lightCosines["+Lights.MAX_LIGHTS+"];\n";
shader+=""+
"if(baseColor.a==0.0)discard;\n" +
"vec3 materialAmbient=mix(ma,baseColor.rgb,sign(useColorAttr+useTexture)); /* ambient*/\n" +
"vec3 lightedColor=sceneAmbient*materialAmbient; /* ambient*/\n" +
" // diffuse\n"+
" vec3 materialDiffuse=baseColor.rgb;\n";
for(var i=0;i<Lights.MAX_LIGHTS;i++){
 shader+="SET_LIGHTPOWER("+i+");\n";
 shader+="lightCosines["+i+"]=dot(normal,lightPower["+i+"].xyz);\n";
}
for(var i=0;i<Lights.MAX_LIGHTS;i++){
 shader+="ADD_DIFFUSE("+i+");\n";
}
shader+="#ifdef SPECULAR\n" +
"bool spectmp;\n" +
"#ifdef SPECULAR_MAP\n" +
"vec3 materialSpecular=ms*mix(vec3(1.,1.,1.),texture2D(specularMap,uvVar).rgb,useSpecularMap);\n"+
"#else\n" +
"vec3 materialSpecular=ms;\n"+
"#endif\n" +
"// specular reflection\n" +
"if(materialSpecular.x!=0. || materialSpecular.y!=0. || materialSpecular.z!=0.){\n" +
"vec3 viewDirection=normalize((viewInvW-worldPositionVar).xyz);\n" +
"float specular=0.0;\n";
for(var i=0;i<Lights.MAX_LIGHTS;i++){
shader+="  spectmp = lightCosines["+i+"] >= 0.0;\n" +
"  if (spectmp) {\n" +
"  vec3 lightSpecular=vec3(lights["+i+"].specular);\n"+
"    specular=dot (-lightPower["+i+"].xyz - (2.0 * dot (normal, -lightPower["+i+"].xyz)*\n"+
" transformedNormalVar), viewDirection);\n" +
"    specular=max(specular,0.0);\n" +
"    specular=pow(specular,mshin);\n"+
"    lightedColor+=materialSpecular*specular*lightPower["+i+"].w*lightSpecular;\n" +
"  }\n";
}
shader+="}\n";
shader+="#endif\n";
shader+=" // emission\n"+
" lightedColor+=me;\n" +
" baseColor=vec4(lightedColor,baseColor.a);\n" +
"#endif\n" +
" gl_FragColor=baseColor;\n" +
"}";
return shader;
};
;
/*
Written by Peter O. in 2015.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://upokecenter.dreamhosters.com/articles/donate-now-2/
*/

/**
* Contains classes that implement methods
* binding certain HTML 3D Library objects
* to WebGL contexts and programs.
*/

///////////////////////

/** @private */
function MaterialBinder(mshade){
 this.mshade=mshade;
 this.textureSize=[0,0];
}
/** @private */
MaterialBinder.prototype.bind=function(program){
 if(!this.mshade)return this;
 var uniforms={
  "textureSize":this.textureSize,
  "useSpecularMap":0,
  "useNormalMap":0
 }
 program.setUniforms(uniforms);
 uniforms={
  "mshin":this.mshade.shininess,
  "ma":this.mshade.ambient.length==3 ? this.mshade.ambient :
     [this.mshade.ambient[0], this.mshade.ambient[1], this.mshade.ambient[2]],
  "md":this.mshade.diffuse.length==4 ? this.mshade.diffuse :
    [this.mshade.diffuse[0], this.mshade.diffuse[1], this.mshade.diffuse[2],
       this.mshade.diffuse.length<4 ? 1.0 : this.mshade.diffuse[3]],
  "ms":this.mshade.specular.length==3 ? this.mshade.specular :
     [this.mshade.specular[0],this.mshade.specular[1],this.mshade.specular[2]],
  "me":this.mshade.emission.length==3 ? this.mshade.emission :
     [this.mshade.emission[0],this.mshade.emission[1],this.mshade.emission[2]]
 };
 if(this.mshade.texture){
  new TextureBinder(this.mshade.texture).bind(program,0);
 }
 if(this.mshade.specularMap){
  new TextureBinder(this.mshade.specularMap).bind(program,1);
 }
 if(this.mshade.normalMap){
  new TextureBinder(this.mshade.normalMap).bind(program,2);
 }
 program.setUniforms(uniforms);
 return this;
}

//////////////////////////

/** @private */
function LoadedTexture(textureImage, context){
  context=GLUtil._toContext(context);
  this.context=context;
  this.loadedTexture=context.createTexture();
  context.activeTexture(context.TEXTURE0);
  // In WebGL, texture coordinates start at the upper left corner rather than
  // the lower left as in OpenGL and OpenGL ES, so we use this method call
  // to reestablish the lower left corner.
  context.pixelStorei(context.UNPACK_FLIP_Y_WEBGL, 1);
  context.bindTexture(context.TEXTURE_2D, this.loadedTexture);
  if("src" in textureImage.image){
    context.texImage2D(context.TEXTURE_2D, 0,
      context.RGBA, context.RGBA, context.UNSIGNED_BYTE,
      textureImage.image);
  } else {
   context.texImage2D(context.TEXTURE_2D, 0,
     context.RGBA, textureImage.width, textureImage.height, 0,
     context.RGBA, context.UNSIGNED_BYTE, textureImage.image);
  }
  // generate mipmaps for power-of-two textures
  if(GLUtil._isPowerOfTwo(textureImage.width) &&
      GLUtil._isPowerOfTwo(textureImage.height)){
    context.generateMipmap(context.TEXTURE_2D);
  } else {
    context.texParameteri(context.TEXTURE_2D,
        context.TEXTURE_MIN_FILTER, context.LINEAR);
    context.texParameteri(context.TEXTURE_2D,
        context.TEXTURE_WRAP_S, context.CLAMP_TO_EDGE);
    context.texParameteri(context.TEXTURE_2D,
        context.TEXTURE_WRAP_T, context.CLAMP_TO_EDGE);
  }
}
/** @private */
LoadedTexture.prototype.dispose=function(){
 if(this.loadedTexture){
  this.context.deleteTexture(this.loadedTexture);
 }
}

/////////////////////////////////

function FrameBufferMaterialBinder(fb){
 this.fb=fb;
}
/** @private */
FrameBufferMaterialBinder.prototype.bind=function(program){
      var uniforms={};
      uniforms["sampler"]=this.fb.textureUnit;
      uniforms["textureSize"]=[this.fb.width,this.fb.height];
      program.setUniforms(uniforms);
      var ctx=program.getContext()
      ctx.activeTexture(ctx.TEXTURE0+this.fb.textureUnit);
      ctx.bindTexture(ctx.TEXTURE_2D,
        this.fb.colorTexture);
      if(this.fb.colorTexture){
       ctx.texParameteri(ctx.TEXTURE_2D,
        ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
       ctx.texParameteri(ctx.TEXTURE_2D,
        ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
      ctx.texParameteri(ctx.TEXTURE_2D,
       ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
      ctx.texParameteri(ctx.TEXTURE_2D,
       ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
     }
}

/////////////////////////////////

function TextureBinder(tex){
 this.texture=tex;
}
/** @private */
TextureBinder.prototype.bind=function(program,textureUnit){
 if(textureUnit==null)textureUnit=0;
 var texture=this.texture;
 var context=program.getContext();
 if(texture.image!==null && texture.loadedTexture===null){
      // load the image as a texture
      texture.loadedTexture=new LoadedTexture(texture,context);
 } else if(texture.image===null && texture.loadedTexture===null &&
   texture.loadStatus==0){
      var thisObj=this;
      var prog=program;
      texture.loadImage().then(function(e){
        // try again loading the image
        thisObj.bind(prog);
      });
      return;
 }
 if (texture.loadedTexture!==null) {
      var uniforms={};
      if(texture.anisotropic==null){
       // Try to load anisotropic filtering extension
       texture.anisotropic=context.getExtension("EXT_texture_filter_anisotropic") ||
         context.getExtension("WEBKIT_EXT_texture_filter_anisotropic") ||
         context.getExtension("MOZ_EXT_texture_filter_anisotropic");
       if(texture.anisotropic==null){
        texture.anisotropic={};
        texture.maxAnisotropy=1;
       } else {
        texture.maxAnisotropy=context.getParameter(
          texture.anisotropic.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
       }
      }
      if(textureUnit==0){
       uniforms["sampler"]=textureUnit;
       uniforms["textureSize"]=[texture.width,texture.height];
      }
      if(textureUnit==1){
       uniforms["specularMap"]=textureUnit;
       uniforms["useSpecularMap"]=1;
      }
      if(textureUnit==2){
       uniforms["normalMap"]=textureUnit;
       uniforms["useNormalMap"]=1;
      }
      program.setUniforms(uniforms);
      context.activeTexture(context.TEXTURE0+textureUnit);
      context.bindTexture(context.TEXTURE_2D,
        texture.loadedTexture.loadedTexture);
      // Set texture parameters
      if(typeof texture.anisotropic.TEXTURE_MAX_ANISOTROPY_EXT!="undefined"){
       // Set anisotropy if anisotropic filtering is supported
       context.texParameteri(context.TEXTURE_2D,
        texture.anisotropic.TEXTURE_MAX_ANISOTROPY_EXT,
        texture.maxAnisotropy);
      }
      // set magnification
      context.texParameteri(context.TEXTURE_2D,
       context.TEXTURE_MAG_FILTER, context.LINEAR);
      var wrapMode=context.CLAMP_TO_EDGE;
      if(GLUtil._isPowerOfTwo(texture.width) &&
          GLUtil._isPowerOfTwo(texture.height)){
       // Enable mipmaps if texture's dimensions are powers of two
       if(!texture.clamp)wrapMode=context.REPEAT;
       context.texParameteri(context.TEXTURE_2D,
         context.TEXTURE_MIN_FILTER, context.LINEAR_MIPMAP_LINEAR);
      } else {
       context.texParameteri(context.TEXTURE_2D,
        context.TEXTURE_MIN_FILTER, context.LINEAR);
      }
      context.texParameteri(context.TEXTURE_2D,
        context.TEXTURE_WRAP_S, wrapMode);
      context.texParameteri(context.TEXTURE_2D,
        context.TEXTURE_WRAP_T, wrapMode);
    }
}

//////////////////////////

function LightsBinder(lights){
 this.lights=lights;
}
/** @private */
LightsBinder.prototype.bind=function(program){
 var lightsObject=this.lights;
 if(!lightsObject)return this;
 if(!program)return this;
 var uniforms={};
 uniforms["sceneAmbient"]=lightsObject.sceneAmbient.slice(0,3);
 for(var i=0;i<lightsObject.lights.length;i++){
  var lt=lightsObject.lights[i]
  uniforms["lights["+i+"].diffuse"]=[lt.diffuse[0],lt.diffuse[1],lt.diffuse[2],
    lt.diffuse.length>3 ? lt.diffuse[3] : 1];
  uniforms["lights["+i+"].specular"]=[lt.specular[0],lt.specular[1],lt.specular[2],
    lt.specular.length>3 ? lt.specular[3] : 1];
  uniforms["lights["+i+"].position"]=lightsObject.lights[i].position;
 }
 // Set empty values for undefined lights up to MAX_LIGHTS
 for(var i=lightsObject.lights.length;i<Lights.MAX_LIGHTS;i++){
  uniforms["lights["+i+"].diffuse"]=[0,0,0,1];
  uniforms["lights["+i+"].specular"]=[0,0,0,1];
  uniforms["lights["+i+"].position"]=[0,0,0,0];
 }
 program.setUniforms(uniforms);
 return this;
}

///////////////////////

var Binders={};
Binders.getMaterialBinder=function(material){
 if(material){
 if(material instanceof Material){
  return new MaterialBinder(material);
 }
 if(material instanceof Texture){
  console.warn("Setting shape materials directly to textures is deprecated.");
  return new TextureBinder(material);
 }
 if(material instanceof FrameBuffer){
  return new FrameBufferMaterialBinder(material);
 }
 }
 // Return an empty binding object
 return {
/** @private */
bind:function(program){}};
}
;
;
