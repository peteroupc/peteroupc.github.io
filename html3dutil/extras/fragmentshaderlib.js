/** The <code>extras/fragmentshaderlib.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/fragmentshaderlib.js";
 * // -- or --
 * import * as CustomModuleName from "extras/fragmentshaderlib.js";</pre>
 * @module extras/fragmentshaderlib */
/** The <code>extras/fragmentshaderlib.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/fragmentshaderlib.js";
 * // -- or --;
 * import * as CustomModuleName from "extras/fragmentshaderlib.js";
 * @module extras/fragmentshaderlib */

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
 * @returns {*} Return value.
 * @function
 */
export var fragmentShaderLib = function() {
  return ["",
    "// NOTE: The online Book of Shaders, chapter 10, has",
    "// a very good explanation on how this function works.",
    "// The following was inspired by that chapter.",
    "float rand(float seed) {",
    " float sinParameter=dot(vec2(seed),vec2(50.987,33.123));",
    " return fract(12345.43*sin(sinParameter));",
    "}",
    "float rand(vec2 seed) {",
    " float sinParameter=dot(seed,vec2(50.987,33.123));",
    " return fract(12345.43*sin(sinParameter));",
    "}",
    "float rand(vec3 seed) {",
    " float sinParameter=dot(seed,vec3(50.987,33.123,98.234));",
    " return fract(12345.43*sin(sinParameter));",
    "}",
    "float signedrand(float seed) { return rand(seed)*2.0-1.0; }",
    "float signedrand(vec2 seed) { return rand(seed)*2.0-1.0; }",
    "float signedrand(vec3 seed) { return rand(seed)*2.0-1.0; }",
    "",
    "float signedrandsmooth(float seed) {",
    " return signedrand(seed)*0.5+",
    "     signedrand(seed-0.75)*0.25+",
    "     signedrand(seed+0.75)*0.25;",
    "}",
    "float signedrandsmooth(vec2 seed) {",
    " return signedrand(seed)*0.5+",
    "     signedrand(seed-0.75)*0.25+",
    "     signedrand(seed+0.75)*0.25;",
    "}",
    "float signedrandsmooth(vec3 seed) {",
    " return signedrand(seed)*0.5+",
    "     signedrand(seed-0.75)*0.25+",
    "     signedrand(seed+0.75)*0.25;",
    "}",
    "float smootherstep(float a, float b, float f) {",
    " return a+((10.0+f*(f*6.0-15.0))*f*f*f)*(b-a);",
    "}",
    "vec2 smootherstep(float a, float b, vec2 f) {",
    " return a+((10.0+f*(f*6.0-15.0))*f*f*f)*(b-a);",
    "}",
    "vec3 smootherstep(float a, float b, vec3 f) {",
    " return a+((10.0+f*(f*6.0-15.0))*f*f*f)*(b-a);",
    "}",
    "float noise(float seed) {",
    " float f=smootherstep(0.0,1.0,fract(seed));",
    " float fl=floor(seed);",
    " float r1=signedrandsmooth(fl);",
    " float r2=signedrandsmooth(fl+1.0);",
    " return mix(r1,r2,f);",
    "}",
    "float noise(vec2 seed) {",
    " vec2 f=smootherstep(0.0,1.0,fract(seed));",
    " vec2 zo=vec2(0.0,1.0);",
    " vec2 fl=floor(seed);",
    " float r1=signedrandsmooth(fl+zo.xx);",
    " float r2=signedrandsmooth(fl+zo.xy);",
    " float r3=signedrandsmooth(fl+zo.yx);",
    " float r4=signedrandsmooth(fl+zo.yy);",
    " return mix(mix(r1,r3,f.x),mix(r2,r4,f.x),f.y);",
    "}",
    "float noise(vec3 seed) {",
    " vec3 f=smootherstep(0.0,1.0,fract(seed));",
    " vec2 zo=vec2(0.0,1.0);",
    " vec3 fl=floor(seed);",
    " float r1=signedrandsmooth(fl+zo.xxx);",
    " float r2=signedrandsmooth(fl+zo.xxy);",
    " float r3=signedrandsmooth(fl+zo.xyx);",
    " float r4=signedrandsmooth(fl+zo.xyy);",
    " float r5=signedrandsmooth(fl+zo.yxx);",
    " float r6=signedrandsmooth(fl+zo.yxy);",
    " float r7=signedrandsmooth(fl+zo.yyx);",
    " float r8=signedrandsmooth(fl+zo.yyy);",
    " float m1=mix(mix(r1,r3,f.y),mix(r2,r4,f.y),f.z);",
    " float m2=mix(mix(r5,r7,f.y),mix(r6,r8,f.y),f.z);",
    " return mix(m1,m2,f.x);",
    "}",
    "float fbm(vec2 x, float freq, float amp, float lac, float gain) {",
    // Unrolled to avoid compilation failures.
    // 6 "octaves", or iterations.
    "   float ret=noise(x*freq)*amp;",
    "   amp*=gain;",
    "   freq*=lac;",
    "    ret+=noise(x*freq)*amp;",
    "   amp*=gain;",
    "   freq*=lac;",
    "   ret+=noise(x*freq)*amp;",
    "   amp*=gain;",
    "   freq*=lac;",
    "   ret+=noise(x*freq)*amp;",
    "   amp*=gain;",
    "   freq*=lac;",
    "   ret+=noise(x*freq)*amp;",
    "   amp*=gain;",
    "   freq*=lac;",
    "   ret+=noise(x*freq)*amp;",
    " return ret;",
    "}",
    "float fbm(vec3 x, float freq, float amp, float lac, float gain) {",
    // Unrolled to avoid compilation failures.
    // 6 "octaves", or iterations.
    "   float ret=noise(x*freq)*amp;",
    "   amp*=gain;",
    "   freq*=lac;",
    "    ret+=noise(x*freq)*amp;",
    "   amp*=gain;",
    "   freq*=lac;",
    "   ret+=noise(x*freq)*amp;",
    "   amp*=gain;",
    "   freq*=lac;",
    "   ret+=noise(x*freq)*amp;",
    "   amp*=gain;",
    "   freq*=lac;",
    "   ret+=noise(x*freq)*amp;",
    "   amp*=gain;",
    "   freq*=lac;",
    "   ret+=noise(x*freq)*amp;",
    " return ret;",
    "}",
    // "octaves" 6, freq 1.0, amp 1.0, lac 2.0, gain 0.5
    "float fbm(vec3 x) {",
    "   return noise(x) +",
    "     noise(x*2.0)*0.5 +",
    "     noise(x*4.0)*0.25 +",
    "     noise(x*8.0)*0.125 +",
    "     noise(x*16.0)*0.0625 +",
    "    noise(x*32.0)*0.03125;",
    "}",
    "float fbm(vec2 x) {",
    "   return noise(x) +",
    "     noise(x*2.0)*0.5 +",
    "     noise(x*4.0)*0.25 +",
    "     noise(x*8.0)*0.125 +",
    "     noise(x*16.0)*0.0625 +",
    "    noise(x*32.0)*0.03125;",
    "}",
    "vec3 palette(vec3 offset, vec3 scale, vec3 c, vec3 d, float t) {",
    " // See <http://www.iquilezles.org/www/articles/palettes/palettes.htm>",
    "  return cos((c*t+d)*6.283185307)*scale+offset;",
    "}",
    "vec3 palette(vec3 c, vec3 d, float t) {",
    "  return cos((c*t+d)*6.283185307)*0.5+0.5;",
    "}",
    "float fbmwarp(vec2 x, float freq, float amp, float lac, float gain) {",
    " // See 'Domain Warping' in The Book of Shaders, chapter 13",
    " float ret=fbm(x,freq,amp,lac,gain);",
    " ret=fbm(ret+x,freq,amp,lac,gain);",
    " ret=fbm(ret+x,freq,amp,lac,gain);",
    " return ret;",
    "}",
    ""].join("\n");
};
