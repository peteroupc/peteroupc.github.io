/* global H3DU, quadBatch */
/*
 Any copyright to this file is released to the Public Domain.
In case this is not possible, this work is also
licensed under Creative Commons Zero (CC0):
http://creativecommons.org/publicdomain/zero/1.0/

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
  this.batch = quadBatch(this.shader);
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
  this.batch = quadBatch(this.shader);
  this.getBatch = function() {
    return this.batch;
  };
  this.update = function(time) {
    this.shader.setUniforms({"time":time});
  };
}
