/** The <code>extras/horgradshader.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/horgradshader.js";
 * // -- or --
 * import * as CustomModuleName from "extras/horgradshader.js";</pre>
 * @module extras/horgradshader */

/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under Creative Commons Zero (CC0): https://creativecommons.org/publicdomain/zero/1.0/
*/

/**
 * GLSL shader code for a screen-space horizontal gradient.
 * It takes the following uniforms: "color1" is a 4-element array
 * giving the red, green, blue, and alpha components, in that order,
 * of the left-hand color; and "color2" is those same components
 * of the right-hand color.
 */
export const horGradientShader = {
  "uniform":{
    "color1":[0, 0, 0, 1],
    "color2":[1, 1, 1, 1]
  },
  "vertexShader":[
    "varying vec2 posVar;",
    "void main() {",
    " posVar=position.xy;",
    " gl_Position=vec4(position,1.0);",
    "}"].join("\n"),
  "fragmentShader":[
    "varying vec2 posVar;",
    "uniform vec4 color1;",
    "uniform vec4 color2;",
    "void main() {",
    " float c=(posVar.x+1.0)*0.5;",
    " vec3 color=mix(color1.rgb,color2.rgb,c);",
    " gl_FragColor=vec4(color,1.0);",
    "}"].join("\n")
};
