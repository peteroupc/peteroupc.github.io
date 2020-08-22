/** The <code>extras/checkerboardshader.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/checkerboardshader.js";
 * // -- or --
 * import * as CustomModuleName from "extras/checkerboardshader.js";</pre>
 * @module extras/checkerboardshader */

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
 * <li>"blackColor" - TODO: Not documented yet.
 * <li>"whiteColor" - TODO: Not documented yet.
 * <li>"squaresPerRow" - TODO: Not documented yet.</ul>
 */
export const checkerboardShader = {
  "uniform":{
    "blackColor":[0, 0, 0],
    "whiteColor":[1, 1, 1],
    "squaresPerRow":8
  },
  "vertexShader":[
    "varying vec2 posVar;",
    "void main() {",
    " posVar=position.xy;",
    " gl_Position=vec4(position,1.0);",
    "}"].join("\n"),
  "fragmentShader":[
    "uniform vec3 blackColor;",
    "uniform vec3 whiteColor;",
    "varying vec2 posVar;",
    "uniform float squaresPerRow;",
    "void main() {",
    " vec2 pos=mod(posVar*squaresPerRow,4.0);",
    " float sgn=(pos.x>=2.0 ? 1.0 : -1.0)*(pos.y>=2.0 ? 1.0 : -1.0);",
    " float s=(sgn>0.0) ? 1.0 : 0.0;",
    " vec3 color=mix(blackColor,whiteColor,s);",
    " gl_FragColor=vec4(color,1.0);",
    "}"].join("\n")
};
