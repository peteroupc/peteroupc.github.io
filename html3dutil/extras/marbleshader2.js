/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
import {fragmentShaderLib} from "./fragmentshaderlib";
export var marbleShader2 = {
  "uniform":{
    "darkColor":[0, 0, 0],
    "lightColor":[1, 1, 1]
  },
  "vertexShader":[
    "varying vec2 posVar;",
    "void main() {",
    " posVar=position.xy;",
    " gl_Position=vec4(position,1.0);",
    "}"].join("\n"),
  "fragmentShader":[
    "varying vec2 posVar;",
    "uniform vec3 darkColor;",
    "uniform vec3 lightColor;",
    fragmentShaderLib(),
    "void main() {",
    " float n;",
    " n=sin(posVar.x*20.0-",
    "    posVar.y*60.0+",
    "    fbm(posVar,1.0,1.0,2.0,0.5)*25.0",
    "    );",
    " n=(n+1.0)*0.5;",
    " vec3 color=mix(darkColor,lightColor,n);",
    " gl_FragColor=vec4(color,1.0);"].join("\n")
};
