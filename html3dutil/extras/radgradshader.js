/** The <code>extras/radgradshader.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/radgradshader.js";
 * // -- or --
 * import * as CustomModuleName from "extras/radgradshader.js";</pre>
 * @module extras/radgradshader */

/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

/**
 * TODO: Not documented yet.
 */
export var radialGradientShader = {
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
