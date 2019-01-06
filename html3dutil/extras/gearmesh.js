/* global MeshBuffer */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
// Adapted by Peter O. from gears.c (3D Gears), a public domain program
// written by Brian Paul.

import {H3DU} from "../h3du_min";

function QuadStrips() {
  this.vertices = [];
  this.indices = [];
  this.nx = 0;
  this.ny = 0;
  this.nz = 0;
  this.primitiveIndex = 0;
  this.primitiveData = [];
  this.normal3 = function(x, y, z) {
    this.nx = x;
    this.ny = y;
    this.nz = z;
  };
  this.newStrip = function() {
    this.primitiveIndex = 0;
  };
  this.quad = function(quad) {
    this.newStrip();
    for(var i = 0; i < 12; i++) {
      this.vertex3(quad[i * 3], quad[i * 3 + 1], quad[i * 3 + 2]);
    }
  };
  this.vertex3 = function(x, y, z) {
    var vertexIndex = this.vertices.length / 6;
    this.vertices.push(x, y, z, this.nx, this.ny, this.nz);
    this.primitiveData[this.primitiveIndex] = vertexIndex;
    this.primitiveIndex++;
    if(this.primitiveIndex >= 4) {
      this.indices.push(this.primitiveData[0],
    this.primitiveData[1], this.primitiveData[2]);
      this.indices.push(this.primitiveData[2],
    this.primitiveData[1], this.primitiveData[3]);
      this.primitiveData[0] = this.primitiveData[2];
      this.primitiveData[1] = this.primitiveData[3];
      this.primitiveIndex -= 2;
    }
  };
  this.toMeshBuffer = function() {
    return MeshBuffer.fromPositionsNormals(
   this.vertices, this.indices);
  };
}

export function createGear(innerRadius, outerRadius, width, teeth, toothDepth) {
  var i;
  var r0, r1, r2;
  var angle, da;
  var u, v, len;
  var cosAngle, sinAngle;
  r0 = innerRadius;
  r1 = outerRadius - toothDepth / 2.0;
  r2 = outerRadius + toothDepth / 2.0;
  da = 2.0 * Math.PI / teeth / 4.0;
  var mesh = new QuadStrips();
  mesh.normal3( 0.0, 0.0, 1.0 );
/* draw front face */
  mesh.newStrip();
  var angleStep = H3DU.Math.PiTimes2 / teeth;
  var cosStep = Math.cos(angleStep);
  var sinStep = angleStep >= 0 && angleStep < 6.283185307179586 ? angleStep <= 3.141592653589793 ? Math.sqrt(1.0 - cosStep * cosStep) : -Math.sqrt(1.0 - cosStep * cosStep) : Math.sin(angleStep);
  sinAngle = 0.0; // sin(0.0deg)
  cosAngle = 1.0; // cos(0.0deg)
  for(i = 0; i <= teeth; i++) {
    angle = i * 2.0 * Math.PI / teeth;
    mesh.vertex3( r0 * cosAngle, r0 * sinAngle, width * 0.5 );
    mesh.vertex3( r1 * cosAngle, r1 * sinAngle, width * 0.5 );
    mesh.vertex3( r0 * cosAngle, r0 * sinAngle, width * 0.5 );
    mesh.vertex3( r1 * Math.cos(angle + 3 * da), r1 * Math.sin(angle + 3 * da), width * 0.5 );
    var ts = cosStep * sinAngle + sinStep * cosAngle;
    var tc = cosStep * cosAngle - sinStep * sinAngle;
    sinAngle = ts;
    cosAngle = tc;

  }

/* draw front sides of teeth */
  da = 2.0 * Math.PI / teeth / 4.0;
  angleStep = H3DU.Math.PiTimes2 / teeth;
  cosStep = Math.cos(angleStep);
  sinStep = angleStep >= 0 && angleStep < 6.283185307179586 ? angleStep <= 3.141592653589793 ? Math.sqrt(1.0 - cosStep * cosStep) : -Math.sqrt(1.0 - cosStep * cosStep) : Math.sin(angleStep);
  sinAngle = 0.0; // sin(0.0deg)
  cosAngle = 1.0; // cos(0.0deg)
  for(i = 0; i < teeth; i++) {
    angle = i * 2.0 * Math.PI / teeth;
    mesh.quad([r1 * cosAngle, r1 * sinAngle, width * 0.5,
      r2 * Math.cos(angle + da), r2 * Math.sin(angle + da), width * 0.5,
      r2 * Math.cos(angle + 2 * da), r2 * Math.sin(angle + 2 * da), width * 0.5,
      r1 * Math.cos(angle + 3 * da), r1 * Math.sin(angle + 3 * da), width * 0.5]);
    ts = cosStep * sinAngle + sinStep * cosAngle;
    tc = cosStep * cosAngle - sinStep * sinAngle;
    sinAngle = ts;
    cosAngle = tc;

  }

  mesh.normal3( 0.0, 0.0, -1.0 );
/* draw back face */
  mesh.newStrip();
  for (i = 0; i <= teeth; i++) {
    angle = i * 2.0 * Math.PI / teeth;
    cosAngle = Math.cos(angle);
    sinAngle = angle >= 0 && angle < 6.283185307179586 ? angle <= 3.141592653589793 ? Math.sqrt(1.0 - cosAngle * cosAngle) : -Math.sqrt(1.0 - cosAngle * cosAngle) : Math.sin(angle);
    mesh.vertex3( r1 * cosAngle, r1 * sinAngle, -width * 0.5 );
    mesh.vertex3( r0 * cosAngle, r0 * sinAngle, -width * 0.5 );
    mesh.vertex3( r1 * Math.cos(angle + 3 * da), r1 * Math.sin(angle + 3 * da), -width * 0.5 );
    mesh.vertex3( r0 * cosAngle, r0 * sinAngle, -width * 0.5 );
  }

/* draw back sides of teeth */
  da = 2.0 * Math.PI / teeth / 4.0;
  for (i = 0; i < teeth; i++) {
    angle = i * 2.0 * Math.PI / teeth;
    cosAngle = Math.cos(angle);
    sinAngle = angle >= 0 && angle < 6.283185307179586 ? angle <= 3.141592653589793 ? Math.sqrt(1.0 - cosAngle * cosAngle) : -Math.sqrt(1.0 - cosAngle * cosAngle) : Math.sin(angle);
    mesh.quad([r1 * Math.cos(angle + 3 * da), r1 * Math.sin(angle + 3 * da), -width * 0.5,
      r2 * Math.cos(angle + 2 * da), r2 * Math.sin(angle + 2 * da), -width * 0.5,
      r2 * Math.cos(angle + da), r2 * Math.sin(angle + da), -width * 0.5,
      r1 * cosAngle, r1 * sinAngle, -width * 0.5] );
  }

/* draw outward faces of teeth */
  mesh.newStrip();
  for (i = 0; i < teeth; i++) {
    angle = i * 2.0 * Math.PI / teeth;
    cosAngle = Math.cos(angle);
    sinAngle = angle >= 0 && angle < 6.283185307179586 ? angle <= 3.141592653589793 ? Math.sqrt(1.0 - cosAngle * cosAngle) : -Math.sqrt(1.0 - cosAngle * cosAngle) : Math.sin(angle);
    mesh.vertex3( r1 * cosAngle, r1 * sinAngle, width * 0.5 );
    mesh.vertex3( r1 * cosAngle, r1 * sinAngle, -width * 0.5 );
    u = r2 * Math.cos(angle + da) - r1 * cosAngle;
    v = r2 * Math.sin(angle + da) - r1 * sinAngle;
    len = Math.sqrt( u * u + v * v );
    u /= len;
    v /= len;
    mesh.normal3( v, -u, 0.0 );
    mesh.vertex3( r2 * Math.cos(angle + da), r2 * Math.sin(angle + da), width * 0.5 );
    mesh.vertex3( r2 * Math.cos(angle + da), r2 * Math.sin(angle + da), -width * 0.5 );
    mesh.normal3( Math.cos(angle), Math.sin(angle), 0.0 );
    mesh.vertex3( r2 * Math.cos(angle + 2 * da), r2 * Math.sin(angle + 2 * da), width * 0.5 );
    mesh.vertex3( r2 * Math.cos(angle + 2 * da), r2 * Math.sin(angle + 2 * da), -width * 0.5 );
    u = r1 * Math.cos(angle + 3 * da) - r2 * Math.cos(angle + 2 * da);
    v = r1 * Math.sin(angle + 3 * da) - r2 * Math.sin(angle + 2 * da);
    mesh.normal3( v, -u, 0.0 );
    mesh.vertex3( r1 * Math.cos(angle + 3 * da), r1 * Math.sin(angle + 3 * da), width * 0.5 );
    mesh.vertex3( r1 * Math.cos(angle + 3 * da), r1 * Math.sin(angle + 3 * da), -width * 0.5 );
    mesh.normal3( Math.cos(angle), Math.sin(angle), 0.0 );
  }
  mesh.vertex3( r1 * Math.cos(0), r1 * Math.sin(0), width * 0.5 );
  mesh.vertex3( r1 * Math.cos(0), r1 * Math.sin(0), -width * 0.5 );

/* draw inside radius cylinder */
  mesh.newStrip();
  for (i = 0; i <= teeth; i++) {
    angle = i * 2.0 * Math.PI / teeth;
    cosAngle = Math.cos(angle);
    sinAngle = angle >= 0 && angle < 6.283185307179586 ? angle <= 3.141592653589793 ? Math.sqrt(1.0 - cosAngle * cosAngle) : -Math.sqrt(1.0 - cosAngle * cosAngle) : Math.sin(angle);
    mesh.normal3( -cosAngle, -sinAngle, 0.0 );
    mesh.vertex3( r0 * cosAngle, r0 * sinAngle, -width * 0.5 );
    mesh.vertex3( r0 * cosAngle, r0 * sinAngle, width * 0.5 );
  }
  return mesh.toMeshBuffer();
}
