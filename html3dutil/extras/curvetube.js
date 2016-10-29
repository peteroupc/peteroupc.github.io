/*
Written by Peter O. in 2015.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://peteroupc.github.io/
*/
/* global H3DU._FrenetFrames, H3DU.Math */
H3DU._FrenetFrames = function(func){
 "use strict";
 this.func=func;
 this.normals=[];
 this.binormals=[];
 this.tangents=[];
 this.vectorsCache=[];
 this.vectorsCacheIndex=0;
 var isClosed=false;
 var res=50;
 var nextSample=null;
 var firstSample=null;
 var lastSample=func.evaluate(1.0);
 var totalLength=0;
 var samples=[];
 var lengths=[];
 if(H3DU._FrenetFrames._distSq(func.evaluate(0),lastSample) < H3DU._FrenetFrames._EPSILON){
  isClosed=true;
 }
 for(var i=0;i<=res;i++){
  var t=i/res;
  var e0=(nextSample) ? nextSample : func.evaluate(t);
  var e01=func.evaluate(i===res ? t-H3DU._FrenetFrames._EPSILON : t+H3DU._FrenetFrames._EPSILON);
  if(isClosed && i>0){
   var len=Math.sqrt(H3DU._FrenetFrames._distSq(e0,samples[i-1]));
   totalLength+=len;
   lengths.push(len);
  }
  nextSample=(i===res) ? e0 : func.evaluate((i+1)/res);
  samples.push(e0);
  if(i===0)firstSample=e0;
  var tangent=H3DU.Math.vec3normInPlace(
    H3DU.Math.vec3sub(e01,e0));
  if(t===1){
   H3DU.Math.vec3scaleInPlace(tangent,-1);
  }
  var normal;
  if(i>0){
   normal=H3DU.Math.vec3normInPlace(
    H3DU.Math.vec3cross(this.binormals[i-1],tangent));
  } else {
   normal=H3DU._FrenetFrames.normalFromTangent(tangent);
  }
  var binormal=H3DU.Math.vec3normInPlace(
    H3DU.Math.vec3cross(tangent,normal));
  this.normals[i]=normal;
  this.binormals[i]=binormal;
  this.tangents[i]=tangent;
 }
 if(isClosed && totalLength>0){
  // Adjust angles of binormal and normal to prevent seams
  var quat=H3DU.Math.quatFromVectors(this.normals[res],this.normals[0]);
  var angle=H3DU.Math.quatToAxisAngle(quat)[3];
  var runningLength=0;
  // Set basis vectors at ends to the same value
  this.normals[res]=this.normals[0];
  this.binormals[res]=this.binormals[0];
  this.tangents[res]=this.tangents[0];
  for(i=0;i<res-1;i++){
   runningLength+=lengths[i];
   var lenproportion=runningLength/totalLength;
   var newq=H3DU.Math.quatFromAxisAngle(angle*lenproportion,this.tangents[i+1]);
   // Rotate normal and binormal about the tangent, to keep them orthogonal to
   // tangent and each other
   this.normals[i+1]=H3DU.Math.quatTransform(newq,this.normals[i+1]);
   this.binormals[i+1]=H3DU.Math.quatTransform(newq,this.binormals[i+1]);
  }
 }
}
/**
 * Not documented yet.
 * @param {*} tangent
 */
H3DU._FrenetFrames.normalFromTangent=function(tangent){
 "use strict";
var absx=Math.abs(tangent[0]);
 var absy=Math.abs(tangent[1]);
 var absz=Math.abs(tangent[2]);
 var mx=Math.max(absx,absy,absz);
 var normal=[0,0,0];
 if(mx===absx){
  normal[0]=tangent[1];
  normal[1]=-tangent[0];
  normal[2]=0;
 } else if(mx===absy){
  normal[0]=0;
  normal[1]=tangent[2];
  normal[2]=-tangent[1];
 } else {
  normal[0]=-tangent[2];
  normal[1]=0;
  normal[2]=tangent[0];
 }
 return H3DU.Math.vec3normInPlace(normal);
};
H3DU._FrenetFrames._EPSILON=0.000001;
/**
 * Not documented yet.
 * @param {*} u
 */
H3DU._FrenetFrames.prototype.getSampleAndBasisVectors=function(u){
 "use strict";
 var sample=this.func.evaluate(u);
 var b,n,t;
 var val=[];
 var cache=false;
 var i,e0,e01,normal,tangent,binormal;
 if(u>=0 && u<=1){
  var index=u*(this.binormals.length-1);
  if(Math.abs(index-Math.round(index))<H3DU._FrenetFrames._EPSILON){
   index=Math.round(index);
   b=this.binormals[index];
   n=this.normals[index];
   t=this.tangents[index];
  } else {
   for(i=0;i<this.vectorsCache.length;i+=2){
    if(this.vectorsCache[i]===u){
     this.cacheHits=(this.cacheHits||0)+1;
     return this.vectorsCache[i+1];
    }
   }
   this.cacheMisses=(this.cacheMisses||0)+1;
   index=Math.floor(index);
   e0=sample;
   e01=this.func.evaluate(u+H3DU._FrenetFrames._EPSILON);
   tangent=H3DU.Math.vec3normInPlace(
    H3DU.Math.vec3sub(e01,e0));
   normal=H3DU.Math.vec3normInPlace(
     H3DU.Math.vec3cross(this.binormals[index],tangent));
   binormal=H3DU.Math.vec3normInPlace(
     H3DU.Math.vec3cross(tangent,normal));
   b=binormal;
   n=normal;
   t=tangent;
   cache=true;
  }
 } else {
   for(i=0;i<this.vectorsCache.length;i+=2){
    if(this.vectorsCache[i]===u){
     this.cacheHits=(this.cacheHits||0)+1;
     return this.vectorsCache[i+1];
    }
   }
   this.cacheMisses=(this.cacheMisses||0)+1;
  e0=sample;
  e01=this.func.evaluate(u+H3DU._FrenetFrames._EPSILON);
  tangent=H3DU.Math.vec3normInPlace(
    H3DU.Math.vec3sub(e01,e0));
  normal=H3DU._FrenetFrames.normalFromTangent(tangent);
  binormal=H3DU.Math.vec3normInPlace(
    H3DU.Math.vec3cross(tangent,normal));
  b=binormal;
  n=normal;
  t=tangent;
  cache=true;
 }
 val[0]=n[0];
 val[1]=n[1];
 val[2]=n[2];
 val[3]=b[0];
 val[4]=b[1];
 val[5]=b[2];
 val[6]=t[0];
 val[7]=t[1];
 val[8]=t[2];
 val[9]=sample[0];
 val[10]=sample[1];
 val[11]=sample[2];
 if(cache){
  if(this.vectorsCacheIndex>=400)this.vectorsCacheIndex=0;
  this.vectorsCache[this.vectorsCacheIndex++]=u;
  this.vectorsCache[this.vectorsCacheIndex++]=val;
 }
 return val;
};
/** @private */
H3DU._FrenetFrames._distSq=function(a,b){
  "use strict";
var dx=b[0]-a[0];
  var dy=b[1]-a[1];
  var dz=b[2]-a[2];
  return dx*dx+dy*dy+dz*dz;
 };
/**
* Evaluator for a parametric surface in the form
* of a tube extruded from a parametric curve.
* <p>This class is considered a supplementary class to the
* Public Domain HTML 3D Library and is not considered part of that
* library. <p>
* To use this class, you must include the script "extras/curvetube.js"; the
 * class is not included in the "h3du_min.js" file which makes up
 * the HTML 3D Library.  Example:<pre>
 * &lt;script type="text/javascript" src="extras/curvetube.js">&lt;/script></pre>
* @class
* @alias CurveTube
* @param {Object} func An object that must contain a function
* named "evaluate", which takes the following parameter:<ul>
* <li><code>u</code> - A curve coordinate, generally from 0 to 1.
* </ul>
* The evaluator function returns a 3-element array: the first
* element is the X coordinate of the curve's position, the second
* element is the Y coordinate, and the third is the Z coordinate.
* @param {Number} [thickness] Radius of the
* extruded tube.  If this parameter is null or omitted, the default is 0.125.
* @param {Object} [sweptCurve] Object describing
* a two-dimensional curve to serve as the cross section of the extruded shape,
* corresponding to the V coordinate of the CurveTube's
* "evaluate" method.
* If this parameter is null or omitted, uses a circular cross section
* in which the V coordinate ranges from 0 through
* 1.  The curve object must contain a function
* named "evaluate", with the same meaning as for the "func" parameter,
* except the third element, if any, of the return value is ignored.<p>
* The curve need not be closed.<p>
* The cross section will generally have a radius of 1 unit; bigger
* or smaller cross sections will affect the meaning of the "thickness"
* parameter.
*/
H3DU.CurveTube=function(func, thickness, sweptCurve){
 "use strict";
this.thickness=(thickness===null || typeof thickness==="undefined") ? 0.125 : thickness;
 this.sweptCurve=sweptCurve;
 this.func=func;
 this.tangentFinder=new H3DU._FrenetFrames(func);
}

/**
* Generates a point on the extruded tube from the given u and v coordinates.
* @param {Number} u U coordinate.  This will run the length of the curve.
* @param {Number} v V coordinate.  This will sweep around the extruded
* tube.
* @returns {Array<Number>} A 3-element array specifying a 3D point.
*/
H3DU.CurveTube.prototype.evaluate=function(u, v){
 "use strict";
var basisVectors=this.tangentFinder.getSampleAndBasisVectors(u);
 var sampleX=basisVectors[9];
 var sampleY=basisVectors[10];
 var sampleZ=basisVectors[11];
 var t1,t2,sx,sy,sz;
 if(this.sweptCurve){
  var vpos=this.sweptCurve.evaluate(v);
  t1 = vpos[0];
  t2 = vpos[1];
  sx = sampleX+(-basisVectors[0]*t1+basisVectors[3]*t2)*this.thickness;
  sy = sampleY+(-basisVectors[1]*t1+basisVectors[4]*t2)*this.thickness;
  sz = sampleZ+(-basisVectors[2]*t1+basisVectors[5]*t2)*this.thickness;
 } else {
  var vt=H3DU.Math.PiTimes2*v;
  t1 = Math.cos(vt);
  t2 = (vt>=0 && vt<6.283185307179586) ? (vt<=3.141592653589793 ? Math.sqrt(1.0-t1*t1) : -Math.sqrt(1.0-t1*t1)) : Math.sin(vt);
  sx = sampleX+(-basisVectors[0]*t1+basisVectors[3]*t2)*this.thickness;
  sy = sampleY+(-basisVectors[1]*t1+basisVectors[4]*t2)*this.thickness;
  sz = sampleZ+(-basisVectors[2]*t1+basisVectors[5]*t2)*this.thickness;
 }
 return [sx,sy,sz];
};
/** @alias CurveTube
 @deprecated Use H3DU.CurveTube instead. */
var CurveTube=H3DU.CurveTube;
