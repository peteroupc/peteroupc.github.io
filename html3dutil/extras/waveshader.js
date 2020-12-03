/** The <code>extras/waveshader.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/waveshader.js";
 * // -- or --
 * import * as CustomModuleName from "extras/waveshader.js";</pre>
 * @module extras/waveshader */

/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under Creative Commons Zero (CC0): http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

/**
 * GLSL shader code for TODO: Not documented yet.
 * The shader program takes the following uniforms:<ul>
 * <li>"time" - TODO: Not documented yet.</ul>
 */
export const waveShader = {
  "vertexShader":["varying vec2 uvCoord;",
    "void main() {",
    "uvCoord=uv;",
    "gl_Position=(projectionMatrix*modelViewMatrix)*vec4(position,1.0);",
    "}"
  ].join("\n"),
  "fragmentShader":[
    "varying vec2 uvCoord;",
    "uniform float time;", // coarseness in pixels; 1 means normal
    "uniform sampler2D sampler;",
    "void main() {",
    " float t=float(time)*0.01;",
    " t=t+uvCoord.y;",
    " float offset=interp(fract(t*8.0));",
    " float x=clamp(uvCoord.x+offset*0.02,0.0,1.0);",
    " vec4 c=texture2D(sampler,vec2(x,uvCoord.y));",
    " gl_FragColor=c;",
    "}"
  ].join("\n"),
  "uniform":{"time":0}
};
