/** The <code>extras/warpshader.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/warpshader.js";
 * // -- or --
 * import * as CustomModuleName from "extras/warpshader.js";</pre>
 * @module extras/warpshader */

/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under Creative Commons Zero (CC0): http://creativecommons.org/publicdomain/zero/1.0/

*/

/**
 * GLSL shader code for TODO: Not documented yet.
 * The shader program takes the following uniforms:<ul>
 * <li>"sampler" - TODO: Not documented yet.</ul>
 */
export const warpShader = {
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
    " vec2 norm=uvCoord*2.0-1.0;",
    " float r=length(norm);",
    " vec2 unitnorm=(r==0.0) ? norm : (norm/r);",
    " r=sqrt(r);",
    " float x=((r*unitnorm.x)+1.0)*0.5;",
    " float y=((r*unitnorm.y)+1.0)*0.5;",
    " vec4 c=texture2D(sampler,vec2(x,y));",
    " gl_FragColor=c;",
    "}"
  ].join("\n"),
  "uniform":{"sampler":null}
};
