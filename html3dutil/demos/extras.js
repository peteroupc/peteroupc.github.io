/* global H3DU */
/**
* Represents a knot in the form of the Fourier series<p>
* <b>F</b>(u) = &Sigma;<sub>i=1, n</sub> <b>a</b> cos(<i>iu</i>) +  <b>b</b> sin(<i>iu</i>).<p>
* @param {Array<Array<Number>>} a
* @param {Array<Array<Number>>} b
*/
/* exported FourierKnot */
function FourierKnot(a,b){
 "use strict";
this.a=a; // Cosine coefficients
 this.b=b; // Sine coefficients
 this.idx=0;
 if(this.a.length!==this.b.length){
  throw new Error("a and b must be the same length");
 }
 this.evaluate=function(u){
  u*=H3DU.Math.PiTimes2;
  var ret=[0,0,0];
  for(var i=0;i<this.a.length;i++){
   var iu=(i+1)*u;
   var c = Math.cos(iu);
   var s = (iu>=0 && iu<6.283185307179586) ? (iu<=3.141592653589793 ? Math.sqrt(1.0-c*c) : -Math.sqrt(1.0-c*c)) : Math.sin(iu);
   var ai=this.a[i];
   var bi=this.b[i];
   ret[0]+=c*ai[0]+s*bi[0];
   ret[1]+=c*ai[1]+s*bi[1];
   ret[2]+=c*ai[2]+s*bi[2];
  }
  return ret;
 };
}
