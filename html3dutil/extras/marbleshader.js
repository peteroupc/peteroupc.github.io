/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
import {fragmentShaderLib} from "./fragmentshaderlib";
export var marbleShader = {
  "uniform":{"u_time":0},
  "vertexShader":[
    "varying vec2 posVar;",
    "void main() {",
    " posVar=position.xy;",
    " gl_Position=vec4(position,1.0);",
    "}"].join("\n"),
  "fragmentShader":[
    "varying vec2 posVar;",
    "uniform float u_time;",
    fragmentShaderLib(),
    "void main() {",
    " float n;",
    " n=fbmwarp(posVar+u_time*0.1,2.5,0.8,3.0,0.3);",
    " n=(n+1.0)*0.5;",
    " gl_FragColor=vec4(palette(vec3(1.0,0.8,0.6),vec3(0.5,0.65,0.75),n),1.0);",
    "}"].join("\n")
};
