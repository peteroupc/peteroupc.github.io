/** The <code>extras/matrixstack.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/matrixstack.js";
 * // -- or --
 * import * as CustomModuleName from "extras/matrixstack.js";</pre>
 * @module extras/matrixstack */

/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

/**
 * This class implements a stack
 * of 4x4 transformation matrices.<p>
 * When the constructor is called, it will create a stack whose
 * only element is the identity matrix.
 * @constructor
 */
export var MatrixStack = function() {
  this.stack = [
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]
  ];
};
/**
 * Gets a copy of the matrix at the top of this stack.
 * @returns {Array<number>}.
 */
MatrixStack.prototype.get = function() {
  return this.stack[this.stack.length - 1].slice(0, 16);
};
/**
 * Modifies the matrix at the top of this stack by replacing it with the identity matrix.
 * @returns {MatrixStack} This object.
 */
MatrixStack.prototype.loadIdentity = function() {
  this.stack[this.stack.length - 1] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
  return this;
};
/**
 * Modifies the matrix at the top of this stack by replacing it with the given matrix.
 * @param {Array<number>} mat A matrix to replace the top of the stack with.
 * @returns {MatrixStack} This object.
 */
MatrixStack.prototype.loadMatrix = function(mat) {
  this.stack[this.stack.length - 1] = mat.slice(0, 16);
  return this;
};
/**
 * Modifies the matrix at the top of this stack by replacing it with the
 * transpose of the given matrix.
 * @param {Array<number>} mat A matrix whose transpose will
 * replace the top of the stack.
 * @returns {MatrixStack} This object.
 */
MatrixStack.prototype.loadTransposeMatrix = function(mat) {
  const m = mat.slice(0, 16);
  let tmp;
  tmp = m[1]; m[1] = m[4]; m[4] = tmp;
  tmp = m[2]; m[2] = m[8]; m[8] = tmp;
  tmp = m[3]; m[3] = m[12]; m[12] = tmp;
  tmp = m[6]; m[6] = m[9]; m[9] = tmp;
  tmp = m[7]; m[7] = m[13]; m[13] = tmp;
  tmp = m[11]; m[11] = m[14]; m[14] = tmp;
  this.stack[this.stack.length - 1] = m;
  return this;
};
/**
 * Modifies the matrix at the top of this stack by multiplying it by another matrix.
 * The matrices are multiplied such that the transformations
 * they describe happen in reverse order. For example, if the matrix
 * at the top of the stack describes a translation and the matrix
 * passed to this method describes a scaling, the multiplied matrix will describe
 * the effect of scaling then translation.
 * @param {Array<number>} mat A matrix to multiply the current one by.
 * @returns {MatrixStack} This object.
 */
MatrixStack.prototype.multMatrix = function(mat) {
  const curmat = this.stack[this.stack.length - 1];
  const dst = [];
  for(let i = 0; i < 16; i += 4) {
    for(let j = 0; j < 4; j++) {
      dst[i + j] =
        mat[i] * curmat[j] +
        mat[i + 1] * curmat[j + 4] +
        mat[i + 2] * curmat[j + 8] +
        mat[i + 3] * curmat[j + 12];
    }
  }
  this.stack[this.stack.length - 1] = dst;
  return this;
};
/**
 * Modifies the matrix at the top of this stack by multiplying it by a rotation transformation.
 * @param {number} angle The desired angle
 * to rotate in degrees. If the axis of rotation
 * points toward the viewer, the angle's value is increasing in
 * a counterclockwise direction.
 * @param {number} x X-component of the axis
 * of rotation.
 * @param {number} y Y-component of the axis
 * of rotation.
 * @param {number} z Z-component of the axis
 * of rotation.
 * @returns {MatrixStack} This object.
 */
MatrixStack.prototype.rotate = function(angle, x, y, z) {
  const ang = angle * Math.PI / 180;
  let v0 = x;
  let v1 = y;
  let v2 = z;
  const cost = Math.cos(ang);
  const sint = ang >= 0 && ang < 6.283185307179586 ? ang <= 3.141592653589793 ? Math.sqrt(1.0 - cost * cost) : -Math.sqrt(1.0 - cost * cost) : Math.sin(ang);
  if( v0 === 1 && v1 === 0 && v2 === 0 ) {
    return this.multMatrix([1, 0, 0, 0, 0, cost, sint, 0, 0, -sint, cost, 0, 0, 0, 0, 1]);
  } else if( v0 === 0 && v1 === 1 && v2 === 0 ) {
    return this.multMatrix([cost, 0, -sint, 0, 0, 1, 0, 0, sint, 0, cost, 0, 0, 0, 0, 1]);
  } else if( v0 === 0 && v1 === 0 && v2 === 1 ) {
    return this.multMatrix([cost, sint, 0, 0, -sint, cost, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  } else if(v0 === 0 && v1 === 0 && v2 === 0) {
    return this;
  } else {
    const iscale = 1.0 / Math.sqrt(v0 * v0 + v1 * v1 + v2 * v2);
    v0 *= iscale;
    v1 *= iscale;
    v2 *= iscale;
    const x2 = v0 * v0;
    const y2 = v1 * v1;
    const z2 = v2 * v2;
    const xy = v0 * v1;
    const xz = v0 * v2;
    const yz = v1 * v2;
    const xs = v0 * sint;
    const ys = v1 * sint;
    const zs = v2 * sint;
    const mcos = 1.0 - cost;
    v0 = mcos * xy;
    v1 = mcos * xz;
    v2 = mcos * yz;
    return this.multMatrix([cost + mcos * x2, v0 + zs, v1 - ys, 0, v0 - zs, cost + mcos * y2, v2 + xs, 0, v1 + ys,
      v2 - xs, cost + mcos * z2, 0, 0, 0, 0, 1]);
  }
};
/**
 * Modifies the matrix at the top of this stack by multiplying it by a
 * translation transformation.
 * @param {number} x Translation along the X axis.
 * @param {number} y Translation along the Y axis.
 * @param {number} z Translation along the Z axis.
 * @returns {MatrixStack} This object.
 */
MatrixStack.prototype.translate = function(x, y, z) {
  const mat = this.stack[this.stack.length - 1];
  this.stack[this.stack.length - 1] = [
    mat[0], mat[1], mat[2], mat[3],
    mat[4], mat[5], mat[6], mat[7],
    mat[8], mat[9], mat[10], mat[11],
    mat[0] * x + mat[4] * y + mat[8] * z + mat[12],
    mat[1] * x + mat[5] * y + mat[9] * z + mat[13],
    mat[2] * x + mat[6] * y + mat[10] * z + mat[14],
    mat[3] * x + mat[7] * y + mat[11] * z + mat[15]
  ];
  return this;
};
/**
 * Modifies the matrix at the top of this stack by multiplying it by a
 * scaling transformation.
 * @param {number} x Scale factor along the X axis.
 * @param {number} y Scale factor along the Y axis.
 * @param {number} z Scale factor along the Z axis.
 * @returns {MatrixStack} This object.
 */
MatrixStack.prototype.scale = function(x, y, z) {
  const mat = this.stack[this.stack.length - 1];
  mat[0] *= x;
  mat[1] *= x;
  mat[2] *= x;
  mat[3] *= x;
  mat[4] *= y;
  mat[5] *= y;
  mat[6] *= y;
  mat[7] *= y;
  mat[8] *= z;
  mat[9] *= z;
  mat[10] *= z;
  mat[11] *= z;
  return this;
};
/**
 * Makes a copy of the matrix at the top of this stack
 * and puts the copy on top of the stack.
 * @returns {MatrixStack} This object.
 */
MatrixStack.prototype.pushMatrix = function() {
  this.stack.push(this.stack[this.stack.length - 1].slice(0, 16));
  return this;
};
/**
 * Removes the matrix at the top of this stack, making
 * the matrix beneath it the new top matrix. Has no
 * effect if the stack has only one matrix.
 * @returns {MatrixStack} This object.
 */
MatrixStack.prototype.popMatrix = function() {
  if(this.stack.length > 1) {
    this.stack.pop();
  }
  return this;
};
/**
 * Modifies the matrix at the top of this stack by multiplying it by
 * an orthographic projection.
 * In this projection, the left clipping plane is parallel to the right clipping
 * plane and the top to the bottom.<p>
 * This method is designed for enabling a [right-handed coordinate system]{@tutorial glmath}.
 * @param {number} l Leftmost coordinate of the 3D view.
 * @param {number} r Rightmost coordinate of the 3D view.
 * (Note that r can be greater than l or vice versa.)
 * @param {number} b Bottommost coordinate of the 3D view.
 * @param {number} t Topmost coordinate of the 3D view.
 * (Note that t can be greater than b or vice versa.)
 * @param {number} n Distance from the camera to the near clipping
 * plane. A positive value means the plane is in front of the viewer.
 * @param {number} f Distance from the camera to the far clipping
 * plane. A positive value means the plane is in front of the viewer.
 * @returns {MatrixStack} This object.
 */
MatrixStack.prototype.ortho = function(l, r, b, t, n, f) {
  let m = this.stack[this.stack.length - 1];
  const invrl = 1.0 / (r - l);
  const invtb = 1.0 / (t - b);
  const invfn = 1.0 / (f - n);
  const v0 = 2 * invrl;
  const v1 = 2 * invtb;
  const v2 = -2 * invfn;
  const v12 = -(f + n) * invfn;
  const v13 = -(l + r) * invrl;
  const v14 = -(b + t) * invtb;
  m = this.stack[this.stack.length - 1];
  this.stack[this.stack.length - 1] = [
    m[0] * v0, m[1] * v0, m[2] * v0, m[3] * v0,
    m[4] * v1, m[5] * v1, m[6] * v1, m[7] * v1,
    m[8] * v2, m[9] * v2, m[10] * v2, m[11] * v2,
    m[0] * v13 + m[12] + m[4] * v14 + m[8] * v12,
    m[13] + m[1] * v13 + m[5] * v14 + m[9] * v12,
    m[10] * v12 + m[14] + m[2] * v13 + m[6] * v14,
    m[11] * v12 + m[15] + m[3] * v13 + m[7] * v14];
  return this;
};
/**
 * Modifies the matrix at the top of this stack by multiplying it by
 * a frustum matrix.
 * This method is designed for enabling a [right-handed coordinate system]{@tutorial glmath}.
 * @param {number} l X coordinate of the point where the left
 * clipping plane meets the near clipping plane.
 * @param {number} r X coordinate of the point where the right
 * clipping plane meets the near clipping plane.
 * @param {number} b Y coordinate of the point where the bottom
 * clipping plane meets the near clipping plane.
 * @param {number} t Y coordinate of the point where the top
 * clipping plane meets the near clipping plane.
 * @param {number} n The distance from the camera to
 * the near clipping plane. Objects closer than this distance won't be
 * seen. This should be slightly greater than 0.
 * @param {number} f The distance from the camera to
 * the far clipping plane. Objects beyond this distance will be too far
 * to be seen.
 * @returns {MatrixStack} This object.
 */
MatrixStack.prototype.frustum = function(l, r, b, t, n, f) {
  let m = this.stack[this.stack.length - 1];
  const invrl = 1.0 / (r - l);
  const invtb = 1.0 / (t - b);
  const invfn = 1.0 / (f - n);
  const v1 = 2 * n;
  const v11 = invrl * v1;
  const v12 = invtb * v1;
  const v13 = -(f + n) * invfn;
  const v14 = invrl * (l + r);
  const v15 = invtb * (b + t);
  const v16 = -f * invfn * v1;
  m = this.stack[this.stack.length - 1];
  this.stack[this.stack.length - 1] = [
    m[0] * v11, m[1] * v11, m[2] * v11, m[3] * v11,
    m[4] * v12, m[5] * v12, m[6] * v12, m[7] * v12,
    m[0] * v14 + m[4] * v15 + m[8] * v13 - m[12],
    m[1] * v14 + m[5] * v15 + m[9] * v13 - m[13],
    m[10] * v13 + m[2] * v14 + m[6] * v15 - m[14],
    m[11] * v13 + m[3] * v14 + m[7] * v15 - m[15],
    m[8] * v16, m[9] * v16, m[10] * v16, m[11] * v16];
  return this;
};
/**
 * Modifies the matrix at the top of this stack by multiplying it by
 * a matrix representing a camera view.
 * This method is designed for enabling a [right-handed coordinate system]{@tutorial glmath}.
 * @param {number} ex X coordinate of the camera position in world space.
 * @param {number} ey Y coordinate of the camera position.
 * @param {number} ez Z coordinate of the camera position.
 * @param {number} cx X coordinate of the position in world space that
 * the camera is looking at.
 * @param {number} cy Y coordinate of the position looked at.
 * @param {number} cz Z coordinate of the position looked at.
 * @param {number} ux X coordinate of the up direction vector.
 * This vector must not point in the same or opposite direction as
 * the camera's view direction.
 * @param {number} uy Y coordinate of the up vector.
 * @param {number} uz Z coordinate of the up vector.
 * @returns {MatrixStack} This object.
 */
MatrixStack.prototype.lookAt = function(ex, ey, ez, cx, cy, cz, ux, uy, uz) {
  const viewerPos = [ex, ey, ez];
  const lookingAt = [cx, cy, cz];
  const up = [ux, uy, uz];
  let u;
  let s;
  let f;
  const t5 = [lookingAt[0] - viewerPos[0], lookingAt[1] - viewerPos[1], lookingAt[2] - viewerPos[2]];
  f = t5;
  const t6 = Math.sqrt(t5[0] * t5[0] + t5[1] * t5[1] + t5[2] * t5[2]);
  if (t6 !== 0.0) {
    const t7 = 1.0 / t6;
    f[0] = t5[0] * t7;
    f[1] = t5[1] * t7;
    f[2] = t5[2] * t7;
  } else {
    return this;
  }
  const t8 = Math.sqrt(up[0] * up[0] + up[1] * up[1] + up[2] * up[2]);
  if (t8 !== 0.0) {
    const t9 = 1.0 / t8;
    up[0] *= t9;
    up[1] *= t9;
    up[2] *= t9;
  }
  const t10 = [f[1] * up[2] - f[2] * up[1], f[2] * up[0] - f[0] * up[2], f[0] * up[1] - f[1] * up[0]];
  s = t10;
  const t11 = Math.sqrt(t10[0] * t10[0] + t10[1] * t10[1] + t10[2] * t10[2]);
  if (t11 !== 0.0) {
    const t12 = 1.0 / t11;
    s[0] = t10[0] * t12;
    s[1] = t10[1] * t12;
    s[2] = t10[2] * t12;
  }
  const t13 = [s[1] * f[2] - s[2] * f[1], s[2] * f[0] - s[0] * f[2], s[0] * f[1] - s[1] * f[0]];
  u = t13;
  const t14 = Math.sqrt(t13[0] * t13[0] + t13[1] * t13[1] + t13[2] * t13[2]);
  if (t14 !== 0.0) {
    const t15 = 1.0 / t14;
    u[0] = t13[0] * t15;
    u[1] = t13[1] * t15;
    u[2] = t13[2] * t15;
  }
  f[0] = -f[0];
  f[1] = -f[1];
  f[2] = -f[2];
  const t16 = [];
  t16[0] = s[0];
  t16[1] = u[0];
  t16[2] = f[0];
  t16[3] = 0.0;
  t16[4] = s[1];
  t16[5] = u[1];
  t16[6] = f[1];
  t16[7] = 0.0;
  t16[8] = s[2];
  t16[9] = u[2];
  t16[10] = f[2];
  t16[11] = 0.0;
  t16[12] = -(viewerPos[0] * s[0] + viewerPos[1] * s[1] + viewerPos[2] * s[2]);
  t16[13] = -(viewerPos[0] * u[0] + viewerPos[1] * u[1] + viewerPos[2] * u[2]);
  t16[14] = -(viewerPos[0] * f[0] + viewerPos[1] * f[1] + viewerPos[2] * f[2]);
  t16[15] = 1.0;
  return this.multMatrix(t16);
};
/**
 * Modifies the matrix at the top of this stack by multiplying it by
 * a 2D orthographic projection.
 * This method is designed for enabling a [right-handed coordinate system]{@tutorial glmath}.
 * @param {number} l Leftmost coordinate of the 2D view.
 * @param {number} r Rightmost coordinate of the 2D view.
 * (Note that r can be greater than l or vice versa.)
 * @param {number} b Bottommost coordinate of the 2D view.
 * @param {number} t Topmost coordinate of the 2D view.
 * (Note that t can be greater than b or vice versa.)
 * @returns {MatrixStack} This object.
 */
MatrixStack.prototype.ortho2d = function(l, r, b, t) {
  const invrl = 1.0 / (r - l);
  const invtb = 1.0 / (t - b);
  const v0 = 2.0 * invrl;
  const v1 = 2.0 * invtb;
  const v8 = -(b + t) * invtb;
  const v9 = -(l + r) * invrl;
  const m = this.stack[this.stack.length - 1];
  this.stack[this.stack.length - 1] = [
    m[0] * v0, m[1] * v0, m[2] * v0, m[3] * v0,
    m[4] * v1, m[5] * v1, m[6] * v1, m[7] * v1,
    -m[8], -m[9], -m[10], -m[11],
    m[0] * v9 + m[12] + m[4] * v8,
    m[13] + m[1] * v9 + m[5] * v8,
    m[14] + m[2] * v9 + m[6] * v8,
    m[15] + m[3] * v9 + m[7] * v8];
  return this;
};
/**
 * Modifies the matrix at the top of this stack by multiplying it by
 * a matrix that defines a perspective projection.<p>
 * This method is designed for enabling a [right-handed coordinate system]{@tutorial glmath}.
 * @param {number} fov Vertical field of view, in degrees. Should be less
 * than 180 degrees. (The smaller
 * this number, the bigger close objects appear to be. As a result,
 * zoom can be implemented by multiplying field of view by an
 * additional factor.)
 * @param {number} aspect The ratio of width to height of the viewport, usually
 * the scene's aspect ratio.
 * @param {number} n The distance from the camera to
 * the near clipping plane. Objects closer than this distance won't be
 * seen. This should be slightly greater than 0.
 * @param {number} f The distance from the camera to
 * the far clipping plane. Objects beyond this distance will be too far
 * to be seen.
 * @returns {MatrixStack} This object.
 */
MatrixStack.prototype.perspective = function(fov, aspect, n, f) {
  const ftan = 1 / Math.tan(fov * Math.PI / 360);
  const v0 = ftan / aspect;
  const invnf = 1.0 / (n - f);
  const v2 = f + n;

  const v3 = 2 * f * invnf * n;
  const v4 = invnf * v2;
  const m = this.stack[this.stack.length - 1];
  this.stack[this.stack.length - 1] = [
    m[0] * v0, m[1] * v0, m[2] * v0, m[3] * v0,
    ftan * m[4], ftan * m[5], ftan * m[6], ftan * m[7],
    m[8] * v4 - m[12], m[9] * v4 - m[13],
    m[10] * v4 - m[14], m[11] * v4 - m[15],
    m[8] * v3, m[9] * v3, m[10] * v3, m[11] * v3];
  return this;
};
/**
 * Modifies the matrix at the top of this stack by multiplying it by
 * a matrix that transforms the view to a portion of the viewport.
 * @param {number} wx X coordinate of the center of the desired viewport portion.
 * @param {number} wy Y coordinate of the center of the desired viewport portion.
 * @param {number} ww Width of the desired viewport portion.
 * @param {number} wh Height of the desired viewport portion.
 * @param {Array<number>} vp A 4-element array giving the X and Y coordinates
 * of the lower left corner followed by the width and height
 * of a rectangle indicating the current viewport.
 * @returns {MatrixStack} This object.
 */
MatrixStack.prototype.pickMatrix = function(wx, wy, ww, wh, vp) {
  const invww = 1.0 / ww;
  const invwh = 1.0 / wh;
  const t5 = -(wx - vp[0]) * 2.0 * invww;
  const t6 = -(wy - vp[1]) * 2.0 * invwh;
  const t7 = vp[2] * invww * 2.0;
  const t8 = -(vp[3] * invwh) * 2.0;
  const mat = this.stack[this.stack.length - 1];
  const t9 = t7 * mat[0];
  const t10 = t7 * mat[1];
  const t11 = t7 * mat[2];
  const t12 = t7 * mat[3];
  const t13 = t8 * mat[4];
  const t14 = t8 * mat[5];
  const t15 = t8 * mat[6];
  const t16 = t8 * mat[7];
  this.stack[this.stack.length - 1] = [
    0.5 * t9,
    0.5 * t10,
    0.5 * t11,
    0.5 * t12,
    -0.5 * t13,
    -0.5 * t14,
    -0.5 * t15,
    -0.5 * t16,
    mat[8], mat[9], mat[10], mat[11],
    0.5 * t9 + -0.5 * t13 + (
      t5 * mat[0] +
    t6 * mat[4] +
   mat[12]),
    0.5 * t10 + -0.5 * t14 + (t5 * mat[1] +
    t6 * mat[5] +
   mat[13]),
    0.5 * t11 + -0.5 * t15 + (
      t5 * mat[2] +
    t6 * mat[6] +
   mat[14]),
    0.5 * t12 + -0.5 * t16 + (
      t5 * mat[3] +
    t6 * mat[7] +
   mat[15])];
  return this;
};
