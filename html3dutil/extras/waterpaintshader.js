/** The <code>extras/waterpaintshader.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/waterpaintshader.js";
 * // -- or --
 * import * as CustomModuleName from "extras/waterpaintshader.js";</pre>
 * @module extras/waterpaintshader */
/** The <code>extras/waterpaintshader.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/waterpaintshader.js";
 * // -- or --;
 * import * as CustomModuleName from "extras/waterpaintshader.js";
 * @module extras/waterpaintshader */

/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
// Adapted from Themaister's Waterpaint shader
/**
 * TODO: Not documented yet.
 */
export var waterpaintShader = {
  "vertexShader":["varying vec2 uvCoord;",
    "void main() {",
    "uvCoord=uv;",
    "gl_Position=(projectionMatrix*modelViewMatrix)*vec4(position,1.0);",
    "}"
  ].join("\n"),
  "fragmentShader":[
    "varying vec2 uvCoord;",
    "uniform sampler2D sampler;",
    "vec2 textureSize;",

    "vec4 compress(vec4 in_color, float threshold, float ratio)",
    "{",
    "  vec4 diff = in_color - vec4(threshold);",
    "  diff = clamp(diff, vec4(0.0), vec4(100.0));",
    "  return in_color - (diff * (1.0 - 1.0/ratio));",
    "}",
    "void main() {",
    " vec2 pixel=1.0/textureSize;",
    " vec2 xy0=uvCoord-pixel;",
    " xy0=vec2(max(xy0.x,0.0),max(xy0.y,0.0));",
    " vec2 xy1=uvCoord;",
    " vec2 xy2=uvCoord+pixel;",
    " xy2=vec2(min(xy2.x,1.0),min(xy2.y,1.0));",
    " vec4 mainColor=texture2D(sampler,uvCoord);",
    " vec4 c00=texture2D(sampler,xy0);",
    " vec4 c10=texture2D(sampler,vec2(xy1.x,xy0.y));",
    " vec4 c20=texture2D(sampler,vec2(xy2.x,xy0.y));",
    " vec4 c01=texture2D(sampler,vec2(xy0.x,xy1.y));",
    " vec4 c11=mainColor;",
    " vec4 c21=texture2D(sampler,vec2(xy2.x,xy1.y));",
    " vec4 c02=texture2D(sampler,vec2(xy0.x,xy2.y));",
    " vec4 c12=texture2D(sampler,vec2(xy1.x,xy2.y));",
    " vec4 c22=texture2D(sampler,xy2);",
    "  vec2 texsize = textureSize;",
    "  vec4 first = mix(c00, c20, fract(uvCoord.x * texsize.x + 0.5));",
    "  vec4 second = mix(c02, c22, fract(uvCoord.x * texsize.x + 0.5));",
    "  vec4 mid_horiz = mix(c01, c21, fract(uvCoord.x * texsize.x + 0.5));",
    "  vec4 mid_vert = mix(c10, c12, fract(uvCoord.y * texsize.y + 0.5));",
    "  vec4 res = mix(first, second, fract(uvCoord.y * texsize.y + 0.5));",
    "  vec4 final = 0.26 * (res + mid_horiz + mid_vert) + 3.5 * abs(res - mix(mid_horiz, mid_vert, 0.5));",
    "  final = compress(final, 0.8, 5.0);",
    "  final.a = mainColor.a;",
    " gl_FragColor= final;",
    "}"
  ].join("\n"),
  "uniform":{
    "sampler":null,
    "textureSize":[0, 0]
  }
};
