/** The <code>extras/radgradshader.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/radgradshader.js";
 * // -- or --
 * import * as CustomModuleName from "extras/radgradshader.js";</pre>
 * @module extras/radgradshader */

/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under Creative Commons Zero (CC0): http://creativecommons.org/publicdomain/zero/1.0/

*/

/**
 * GLSL shader code for a screen-space radial gradient.
 * It takes the following uniforms: "colorCenter" is a 4-element array
 * giving the red, green, blue, and alpha components, in that order,
 * of the color at the center; and "colorEdges" is those same components
 * of the color at the edges.
 */
export const radialGradientShader = {
  "uniform":{
    "colorCenter":[0, 0, 0, 1],
    "colorEdges":[1, 1, 1, 1]
  },
  "vertexShader":[
    "varying vec2 posVar;",
    "void main() {",
    " posVar=position.xy;",
    " gl_Position=vec4(position,1.0);",
    "}"].join("\n"),
  "fragmentShader":[
    "varying vec2 posVar;",
    "uniform vec4 colorCenter;",
    "uniform vec4 colorEdges;",
    "void main() {",
    " float c=length(posVar);",
    "c=(c>1.0) ? 1.0 : c;",
    "vec3 color=mix(colorCenter.rgb,colorEdges.rgb,c);",
    " gl_FragColor=vec4(color,1.0);",
    "}"].join("\n")
};
