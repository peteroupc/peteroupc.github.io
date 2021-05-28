/** The <code>extras/mirrorshader.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/mirrorshader.js";
 * // -- or --
 * import * as CustomModuleName from "extras/mirrorshader.js";</pre>
 * @module extras/mirrorshader */

/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under Creative Commons Zero (CC0): https://creativecommons.org/publicdomain/zero/1.0/
*/

/**
 * GLSL shader code for TODO: Not documented yet.
 * The shader program takes the following uniforms:<ul>
 * <li>"time" - TODO: Not documented yet.</ul>
 */
export const mirrorShader = {
  "vertexShader":["varying vec2 uvCoord;",
    "void main() {",
    "uvCoord=uv;",
    "gl_Position=(projectionMatrix*modelViewMatrix)*vec4(position,1.0);",
    "}"
  ].join("\n"),
  "fragmentShader":[
    "varying vec2 uvCoord;",
    "uniform sampler2D sampler;",
    "void main() {",
    " vec4 c=texture2D(sampler,vec2(1.0-uvCoord.x,uvCoord.y));",
    " gl_FragColor=c;",
    "}"
  ].join("\n"),
  "uniform":{"time":0}
};
