/** The <code>extras/pixelateshader.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/pixelateshader.js";
 * // -- or --
 * import * as CustomModuleName from "extras/pixelateshader.js";</pre>
 * @module extras/pixelateshader */

/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under
 Creative Commons Zero: http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

/**
 * GLSL shader code for TODO: Not documented yet.
 * The shader program takes the following uniforms:<ul>
 * <li>"sampler" - TODO: Not documented yet.
 * <li>"coarseness" - TODO: Not documented yet.
 * <li>"textureSize" - TODO: Not documented yet.</ul>
 */
export const pixelateShader = {
  "vertexShader":["varying vec2 uvCoord;",
    "void main() {",
    "uvCoord=uv;",
    "gl_Position=(projectionMatrix*modelViewMatrix)*vec4(position,1.0);",
    "}"
  ].join("\n"),
  "fragmentShader":[
    "varying vec2 uvCoord;",
    "uniform float coarseness;", // coarseness in pixels; 1 means normal
    "uniform sampler2D sampler;",
    "void main() {",
    " float g=max(coarseness,1.0);",
    " float gridSizeX=textureSize.x/g;",
    " float gridSizeY=textureSize.y/g;",
    " float uv0=floor(uvCoord.x*gridSizeX)/gridSizeX;",
    " float uv1=floor(uvCoord.y*gridSizeY)/gridSizeY;",
    " vec4 c=texture2D(sampler,vec2(uv0,uv1));",
    " gl_FragColor=c;",
    "}"
  ].join("\n"),
  "uniform":{
    "sampler":null,
    "coarseness":4,
    "textureSize":[256, 256]
  }
};
