/* global H3DU */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
  (function(H3DU) {
    "use strict";
    function binco(n, i) {
      // A robust form of the binomial coefficient that
      // returns NaN if the result would exceed MAX_SAFE_INTEGER.
      // Except in certain trivial cases, also returns NaN
      // if either argument exceeds MAX_SAFE_INTEGER.
      if(i === 0 || i === n) {
        return 1;
      } else if(isNaN(n) || isNaN(i) || n > 9007199254740991 ||
         i > 9007199254740991) {
        return 0.0 / 0.0;
      } else if(i === 1) {
        return n;
      } else if(i > n || n < 0 || i < 0) {
        return 0;
      } else if(n - 1 === i) {
        return n;
      } else if(n < binco._fact.length) {
        return binco._fact[n] / (binco._fact[i] * binco._fact[n - i]);
      } else if(n / 2 < i && n - i !== i) {
        return binco(n, n - i);
      } else {
        var bc = binco(n - 1, i - 1);
        if(isNaN(bc))return bc;
        if(bc % i === 0) {
          var ret = bc / i * n;
          if(ret <= 9007199254740991)return ret;
        } else {
          var tret = bc * n;
          if(tret <= 9007199254740991)return tret / i;
        }
        var bc2 = binco(n - 1, i);
        bc2 += bc;
        if(bc2 <= 9007199254740991)return bc2;
        return 0.0 / 0.0;
      }
    }
    binco._fact = [1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880,
      3628800, 39916800, 479001600, 6227020800, 87178291200,
      1307674368000, 20922789888000, 355687428096000,
      6402373705728000];
    function evaluatePolys(matrix, rows, cols, points, elementsPerValue, t) {
      var ret = [];
      for(var i = 0; i < elementsPerValue; i++) {
        ret[i] = 0;
      }
      for(i = 0; i < rows; i++) {
        var index = cols * i + (cols - 1);
        var ct = 1.0;
        var point = points[i];
        for(var j = 0; j < cols; j++) {
          var c = matrix[index];
          if(c !== 0) {
            var cell = c * ct;
            for(var k = 0; k < elementsPerValue; k++) {
              ret[k] += cell * point[k];
            }
          }
          ct *= t;
          index--;
        }
      }
      return ret;
    }

    function getCoefficients(matrix, rows, cols, t) {
      var ret = [];
      for(var i = 0; i < rows; i++) {
        var index = cols * i + (cols - 1);
        var ct = 1.0;
        var coeff = 0;
        for(var j = 0; j < cols; j++) {
          coeff += matrix[index] * ct;
          ct *= t;
          index--;
        }
        ret.push(coeff);
      }
      return ret;
    }

    function combineCoeffs(coeffsU, coeffsV, cp, elementsPerValue) {
      var ret = [];
      for(var i = 0; i < elementsPerValue; i++) {
        ret[i] = 0;
      }
      for(i = 0; i < coeffsV.length; i++) {
        var ci = coeffsV[i];
        var pointsU = cp[i];
        for(var j = 0; j < coeffsU.length; j++) {
          var cell = ci * coeffsU[j];
          var point = pointsU[j];
          for(var k = 0; k < elementsPerValue; k++) {
            ret[k] += cell * point[k];
          }
        }
      }
      return ret;
    }

    function makeDerivativeMatrix(matrix, rows, cols) {
      var deriv = [];
      var derivIndex = 0;
  // NOTE: The derivative matrix will contain one
  // fewer column, since the degree of each polynomial
  // (row) will be reduced by 1
      for(var i = 0; i < rows; i++) {
        var index = cols * i;
        var power = cols - 1;
        for(var j = 0; j < cols - 1; j++) {
          deriv[derivIndex] = matrix[index] * power;
          derivIndex++;
          power--;
          index++;
        }
      }
      return deriv;
    }

    /** @ignore */
    H3DU.PolynomialCurve = function(cp, u1, u2) {
      if(typeof u1 === "undefined" && typeof u2 === "undefined") {
        this.uoffset = 0;
        this.umul = 1;
        this.u2 = 1;
      } else if(u1 === u2) {
        throw new Error("u1 and u2 can't be equal");
      } else {
        this.uoffset = u1;
        this.umul = 1.0 / (u2 - u1);
        this.u2 = u2;
      }
      if(!cp || cp.length < 1)throw new Error();
      this.degree = cp.length - 1;
      this.matrix = null;
      this.derivMatrix = null;
      this.cp = cp;
      this.elements = cp[0].length;
    };
    H3DU.PolynomialCurve.prototype = Object.create(H3DU.Curve.prototype);
    Object.assign(H3DU.PolynomialCurve.prototype, {"constructor": H3DU.PolynomialCurve});
/** @ignore */
    H3DU.PolynomialCurve.prototype.setBasis = function(basis, degree) {
      this.matrix = basis;
      this.degree = degree;
      this.derivMatrix = makeDerivativeMatrix(this.matrix, degree + 1, degree + 1);
    };
/** @ignore */
    H3DU.PolynomialCurve.prototype.evaluate = function(u) {
      var t = (u - this.uoffset) * this.umul;
      if(this.degree === 0) {
      // Constant
        return this.cp[0].slice(0, this.cp[0].length);
      }
      return evaluatePolys(this.matrix, this.degree + 1, this.degree + 1,
       this.cp, this.elements, t);
    };
/** @ignore */
    H3DU.PolynomialCurve.prototype.tangent = function(u) {
      var t = (u - this.uoffset) * this.umul;
      if(this.degree === 0) {
        var ret = [];
        for(var i = 0; i < this.cp[0].length; i++) {
          ret.push(0);
        }
        return ret;
      }
      return evaluatePolys(this.derivMatrix, this.degree + 1, this.degree,
       this.cp, this.elements, t);
    };
/** @ignore */
    H3DU.PolynomialCurve.makeBezierMatrix = function(degree) {
     // Generates a matrix where each row
     // is a Bernstein polynomial of the given degree.
      if(degree > 36) {
        // Degrees higher than 36 not supported,
        // since that would result in matrix entries
        // exceeding MAX_SAFE_INTEGER
        throw new Error("Degree " + degree + " not supported");
      }
      var mat = [];
      var negation = (degree & 1) === 0 ? 1 : -1;
      for(var i = 0; i <= degree; i++) {
        var minor = degree - i;
        var neg = negation;
        for(var j = 0; j <= degree; j++) {
          if(j > minor) {
            mat.push(0);
          } else {
            var binom = binco(minor, j);
            mat.push(binom * neg);
            neg = -neg;
          }
        }
        negation = -negation;
      }
      for(i = 1; i < degree; i++) {
        binom = binco(degree, i);
        var index = (degree + 1) * i;
        for(j = 0; j < degree; j++) {
          mat[index] *= binom;
          index++;
        }
      }
      return mat;
    };
/** @ignore */
    H3DU.PolynomialSurface = function(cp, u1, u2, v1, v2) {
      if(typeof u1 === "undefined" && typeof u2 === "undefined" &&
    typeof v1 === "undefined" && typeof v2 === "undefined") {
        this.uoffset = 0;
        this.umul = 1;
        this.voffset = 0;
        this.vmul = 1;
        this.u2 = 1;
        this.v2 = 1;
      } else if(u1 === u2) {
        throw new Error("u1 and u2 can't be equal");
      } else if(v1 === v2) {
        throw new Error("v1 and v2 can't be equal");
      } else {
        this.uoffset = u1;
        this.umul = 1.0 / (u2 - u1);
        this.voffset = v1;
        this.vmul = 1.0 / (v2 - v1);
        this.u2 = u2;
        this.v2 = v2;
      }
      this.degreeU = cp[0].length - 1;
      this.degreeV = cp.length - 1;
      this.matrixU = null;
      this.derivMatrixU = null;
      this.cp = cp;
      this.elements = cp[0][0].length;
    };

/** @ignore */
    H3DU.PolynomialSurface.prototype.endPoints = function() {
      return [this.uoffset, this.u2];
    };
/** @ignore */
    H3DU.PolynomialSurface.prototype.setBasis = function(basisU, basisV, degreeU, degreeV) {
      if(this.cp.length - 1 < degreeV)throw new Error();
      if(this.cp[0].length - 1 < degreeU)throw new Error();
      this.degreeU = degreeU;
      this.degreeV = degreeV;
      this.matrixU = basisU;
      this.derivMatrixU = makeDerivativeMatrix(this.matrixU, this.degreeU + 1, this.degreeU + 1);
      if(this.degreeU === this.degreeV) {
        this.matrixV = this.matrixU;
        this.derivMatrixV = this.derivMatrixU;
      } else {
        this.matrixV = basisV;
        this.derivMatrixV = makeDerivativeMatrix(this.matrixV, this.degreeV + 1, this.degreeV + 1);
      }
    };
/** @ignore */
    H3DU.PolynomialSurface.prototype.evaluate = function(u, v) {
      var tu = (u - this.uoffset) * this.umul;
      var tv = (v - this.voffset) * this.vmul;
      if(this.degreeU === 0 && this.degreeV === 0) {
      // Constant
        return this.cp[0][0].slice(0, this.cp[0][0].length);
      }
      var coeffsU = getCoefficients(this.matrixU, this.degreeU + 1, this.degreeU + 1, tu);
      var coeffsV = getCoefficients(this.matrixV, this.degreeV + 1, this.degreeV + 1, tv);
      var ret = combineCoeffs(coeffsU, coeffsV, this.cp, this.elements);
      return ret;
    };
/** @ignore */
    H3DU.PolynomialSurface.prototype.bitangent = function(u, v) {
      var tu = (u - this.uoffset) * this.umul;
      var tv = (v - this.voffset) * this.vmul;
      if(this.degreeU === 0 && this.degreeV === 0) {
        var ret = [];
        for(var i = 0; i < this.cp[0][0].length; i++) {
          ret.push(0);
        }
        return ret;
      }
      var coeffsU = getCoefficients(this.matrixU, this.degreeU + 1, this.degreeU + 1, tu);
      var coeffsV = getCoefficients(this.derivMatrixV, this.degreeV + 1, this.degreeV, tv);
      ret = combineCoeffs(coeffsU, coeffsV, this.cp, this.elements);
      return ret;
    };
/** @ignore */
    H3DU.PolynomialSurface.prototype.tangent = function(u, v) {
      var tu = (u - this.uoffset) * this.umul;
      var tv = (v - this.voffset) * this.vmul;
      if(this.degreeU === 0 && this.degreeV === 0) {
        var ret = [];
        for(var i = 0; i < this.cp[0][0].length; i++) {
          ret.push(0);
        }
        return ret;
      }
      var coeffsU = getCoefficients(this.derivMatrixU, this.degreeU + 1, this.degreeU, tu);
      var coeffsV = getCoefficients(this.matrixV, this.degreeV + 1, this.degreeV + 1, tv);
      ret = combineCoeffs(coeffsU, coeffsV, this.cp, this.elements);
      return ret;
    };
/** @ignore */
    H3DU.PolynomialSurface.prototype.endPoints = function() {
      return [this.uoffset, this.u2, this.voffset, this.v2];
    };
  }(H3DU));
