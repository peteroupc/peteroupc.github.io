/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

export var horGradientShader = {
  "uniform":{
    "color1":[0, 0, 0,1],
    "color2":[1, 1, 1,1]
  },
  "vertexShader":[
    "varying vec2 posVar;",
    "void main() {",
    " posVar=position.xy;",
    " gl_Position=vec4(position,1.0);",
    "}"].join("\n"),
  "fragmentShader":[
    "varying vec2 posVar;",
    "uniform vec4 color1;"
    "uniform vec4 color2;",
    "void main() {",
    " float c=(posVar.x+1.0)*0.5;",
    " vec3 color=mix(color1.rgb,color2.rgb,c);",
    " gl_FragColor=vec4(color,1.0);",
    "}"].join("\n")
};
