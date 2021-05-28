/** The <code>extras/marbleshader.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/marbleshader.js";
 * // -- or --
 * import * as CustomModuleName from "extras/marbleshader.js";</pre>
 * @module extras/marbleshader */

/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under Creative Commons Zero (CC0): http://creativecommons.org/publicdomain/zero/1.0/

*/
import {fragmentShaderLib} from "./fragmentshaderlib";
/**
 * GLSL shader code for TODO: Not documented yet.
 * The shader program takes the following uniforms:<ul>
 * <li>"u_time" - TODO: Not documented yet.</ul>
 */
export const marbleShader = {
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
