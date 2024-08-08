/** The <code>extras/skysphereshader.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/skysphereshader.js";
 * // -- or --
 * import * as CustomModuleName from "extras/skysphereshader.js";</pre>
 * @module extras/skysphereshader */

/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under the Unlicense: https://unlicense.org/
*/

/**
 * GLSL shader code for TODO: Not documented yet.
 * The shader program takes the following uniforms:<ul>
 * <li>"texture" - TODO: Not documented yet.</ul>
 */
export const skySphereShader = {
  "vertexShader":["varying vec4 positionVar;",
    "void main() {",
    "positionVar=worldMatrix*vec4(position,1.0);",
    "gl_Position=(projectionMatrix*modelViewMatrix)*vec4(position,1.0);",
    "}"
  ].join("\n"),
  "fragmentShader":["#define ONE_DIV_PI 0.318309886",
    "#define ONE_DIV_TWOPI 0.159154943",
    "#define PI 3.141592654",
    "varying vec4 positionVar;",
    "uniform sampler2D texture;",
    "void main() {",
    " vec3 pos=normalize(positionVar.xyz);",
    " pos.x=-pos.x;",
    " gl_FragColor=texture2D(texture,vec2(",
    "  (atan(pos.x,pos.z)+PI)*ONE_DIV_TWOPI, acos(clamp(-pos.y,-1.0,1.0))*ONE_DIV_PI ));",
    "}"
  ].join("\n"),
  "uniform":{"texture":null}
};
/**
 * GLSL shader code for TODO: Not documented yet.
 * The shader program takes the following uniforms:<ul>
 * <li>"texture" - TODO: Not documented yet.</ul>
 */
export const skySphereCubeMapShader = {
  "vertexShader":["varying vec4 positionVar;",
    "void main() {",
    "positionVar=worldMatrix*vec4(position,1.0);",
    "gl_Position=(projectionMatrix*modelViewMatrix)*vec4(position,1.0);",
    "}"
  ].join("\n"),
  "fragmentShader":["varying vec4 positionVar;",
    "uniform samplerCube texture;",
    "void main() {",
    " vec3 pos=normalize(positionVar.xyz);",
    " pos.x=-pos.x;",
    " gl_FragColor=textureCube(texture,pos);",
    "}"
  ].join("\n"),
  "uniform":{"texture":null}
};
