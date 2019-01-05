/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

export var checkerboardShader={
uniform:{"blackColor":[0,0,0],
"whiteColor":[1,1,1],
"squaresPerRow":8},
vertexShader:[
"varying vec2 posVar;",
"void main() {",
" posVar=position.xy;",
" gl_Position=vec4(position,1.0);",
"}"].join("\n"),
fragmentShader:[
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
"}"].join("\n")}
