/** The <code>extras/vignetteshader.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/vignetteshader.js";
 * // -- or --
 * import * as CustomModuleName from "extras/vignetteshader.js";</pre>
 * @module extras/vignetteshader */

/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under Creative Commons Zero (CC0): https://creativecommons.org/publicdomain/zero/1.0/
*/

/**
 * GLSL shader code for TODO: Not documented yet.
 * The shader program takes the following uniforms:<ul>
 * <li>"radius" - TODO: Not documented yet.
 * <li>"softness" - TODO: Not documented yet.
 * <li>"opacity" - TODO: Not documented yet.</ul>
 */
export const vignetteShader = {
  "vertexShader":["varying vec2 uvCoord;",
    "void main() {",
    "uvCoord=uv;",
    "gl_Position=(projectionMatrix*modelViewMatrix)*vec4(position,1.0);",
    "}"
  ].join("\n"),
  "fragmentShader":[
    "varying vec2 uvCoord;",
    "uniform sampler2D sampler;",
    "uniform float radius;",
    "uniform float softness;",
    "uniform float opacity;",
    "#define tolinear(c) pow(c, vec3(2.2))",
    "#define fromlinear(c) pow(c, vec3(0.45454545))",
    "void main() {",
    " vec4 tex=texture2D(sampler,uvCoord);",
    " tex.rgb=tolinear(tex.rgb);",
    " float vignette=smoothstep(radius,radius-softness,length(uvCoord-vec2(0.5)));",
    " vec3 color=mix(tex.rgb,tex.rgb*vignette,opacity);",
    " tex.rgb=fromlinear(color);",
    " gl_FragColor=tex;",
    "}"
  ].join("\n"),
  "uniform":{
    "radius":0.75,
    "softness":0.45,
    "opacity":0.5
  }
};
