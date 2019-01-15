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
export var vignetteShader = {
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
