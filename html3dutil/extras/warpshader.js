/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

export var warpShader = {
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
  "uniform":{"sampler":@param {boolean|null}
};
