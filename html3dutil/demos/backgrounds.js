/* global H3DU */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
/* exported SunburstBackground */
function SunburstBackground(black, white) {
  "use strict";
  var vertex = "precision mediump float;attribute vec3 position;varying vec2 posVar;" +
  "void main() {posVar=position.xy;gl_Position=vec4(position,1.0);}";
  var fragment = [
    "precision mediump float;",
    "uniform vec3 blackColor;",
    "uniform vec3 whiteColor;",
    "varying vec2 posVar;",
    "uniform float time;",
    "void main() {",
    " float angle=atan(posVar.y,posVar.x);",
    " angle/=6.283185307;",
    " angle=mod(angle+time*0.001,1.0); // Time range is [0,1000)",
    " angle=floor(angle*24.0);",
    " float s=(mod(angle,2.0)>=1.0) ? 1.0 : 0.0;",
    " vec3 color=mix(blackColor,whiteColor,s);",
    " gl_FragColor=vec4(color,1.0);",
    "}"].join("\n");
  this.shader = new H3DU.ShaderInfo(vertex, fragment);
  this.shader.setUniforms({
    "blackColor":H3DU.toGLColor(black).slice(0, 3),
    "whiteColor":H3DU.toGLColor(white).slice(0, 3),
    "time":0
  });
  this.batch = new H3DU.Batch3D().addShape(
  new H3DU.Shape(
     new H3DU.MeshBuffer()
    .setAttribute("POSITION", 0, [-1, 1, 0, -1, -1, 0, 1, 1, 0, 1, -1, 0], 0, 3)
    .setIndices([0, 1, 2, 2, 1, 3])).setShader(this.shader));
  this.getBatch = function() {
    return this.batch;
  };
  this.update = function(time) {
    this.shader.setUniforms({"time":time});
  };
}

/* exported StripesBackground */
function StripesBackground(black, white) {
  "use strict";
  var vertex = "precision mediump float;attribute vec3 position;varying vec2 posVar;" +
  "void main() {posVar=position.xy;gl_Position=vec4(position,1.0);}";
  var fragment = [
    "precision mediump float;",
    "uniform vec3 blackColor;",
    "uniform vec3 whiteColor;",
    "varying vec2 posVar;",
    "uniform float time;",
    "void main() {",
    " float s;",
    " s=mod((posVar.x+posVar.y+(time*0.001))*5.0,2.0);",
    " s=(s>=1.0) ? 0.0 : 1.0;",
    " vec3 color=mix(blackColor,whiteColor,s);",
    " gl_FragColor=vec4(color,1.0);",
    "}"].join("\n");
  this.shader = new H3DU.ShaderInfo(vertex, fragment);
  this.shader.setUniforms({
    "blackColor":H3DU.toGLColor(black).slice(0, 3),
    "whiteColor":H3DU.toGLColor(white).slice(0, 3),
    "time":0
  });
  this.batch = new H3DU.Batch3D().addShape(
  new H3DU.Shape(
     new H3DU.MeshBuffer()
    .setAttribute("POSITION", 0, [-1, 1, 0, -1, -1, 0, 1, 1, 0, 1, -1, 0], 0, 3)
    .setIndices([0, 1, 2, 2, 1, 3])).setShader(this.shader));
  this.getBatch = function() {
    return this.batch;
  };
  this.update = function(time) {
    this.shader.setUniforms({"time":time});
  };
}
