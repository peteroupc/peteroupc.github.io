function _FrenetFrames(func){
 function distSq(a,b){
  var dx=b[0]-a[0];
  var dy=b[1]-a[1];
  var dz=b[2]-a[2];
  return dx*dx+dy*dy+dz*dz;
 }
 this.func=func;
 this.normals=[];
 this.bitangents=[];
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
 if(distSq(func.evaluate(0),lastSample) < _FrenetFrames._EPSILON){
  isClosed=true;
 }
 for(var i=0;i<=res;i++){
  var t=i/res;
  var e0=(nextSample) ? nextSample : func.evaluate(t);
  var e01=func.evaluate(i==res ? t-_FrenetFrames._EPSILON : t+_FrenetFrames._EPSILON);
  if(isClosed && i>0){
   var len=Math.sqrt(distSq(e0,samples[i-1]))
   totalLength+=len;
   lengths.push(len);
  }
  nextSample=(i==res) ? e0 : func.evaluate((i+1)/res);
  samples.push(e0);
  if(i==0)firstSample=e0;
  var tangent=GLMath.vec3normInPlace(
    GLMath.vec3sub(e01,e0));
  if(t==1){
   GLMath.vec3scaleInPlace(tangent,-1);
  }
  var normal;
  if(i>0){
   normal=GLMath.vec3normInPlace(
    GLMath.vec3cross(this.bitangents[i-1],tangent));
  } else {
   normal=_FrenetFrames.normalFromTangent(tangent);
  }
  var bitangent=GLMath.vec3normInPlace(
    GLMath.vec3cross(tangent,normal));
  this.normals[i]=normal;
  this.bitangents[i]=bitangent;
  this.tangents[i]=tangent;
 }
 if(isClosed && totalLength>0){
  // Adjust angles of bitangent and normal to prevent seams
  var quat=GLMath.quatFromVectors(this.normals[res],this.normals[0]);
  var angle=GLMath.quatToAxisAngle(quat)[3];
  var runningLength=0;
  // Set basis vectors at ends to the same value
  this.normals[res]=this.normals[0];
  this.bitangents[res]=this.bitangents[0];
  this.tangents[res]=this.tangents[0];
  for(var i=0;i<res-1;i++){
   runningLength+=lengths[i];
   var lenproportion=runningLength/totalLength;
   var newq=GLMath.quatFromAxisAngle(angle*lenproportion,this.tangents[i+1]);
   // Rotate normal and bitangent about the tangent, to keep them orthogonal to
   // tangent and each other
   this.normals[i+1]=GLMath.quatTransform(newq,this.normals[i+1]);
   this.bitangents[i+1]=GLMath.quatTransform(newq,this.bitangents[i+1]);
  }
 }
}
_FrenetFrames.normalFromTangent=function(tangent){
 var normal=GLMath.vec3normInPlace(
   GLMath.vec3cross(tangent,[0,0,1]));
 // if normal's length is close is 0, try another normal
 if(GLMath.vec3dot(normal,normal)<_FrenetFrames._EPSILON){
   normal=GLMath.vec3normInPlace(GLMath.vec3cross(tangent,[0,1,0]));
 }
 return normal;
}
_FrenetFrames._EPSILON=0.000001
_FrenetFrames.prototype.getSampleAndBasisVectors=function(u){
 var sample=this.func.evaluate(u);
 var b,n,t;
 var val=[];
 var cache=false;
 if(u>=0 && u<=1){
  var index=u*(this.bitangents.length-1);
  if(Math.abs(index-Math.round(index))<_FrenetFrames._EPSILON){
   index=Math.round(index);
   b=this.bitangents[index];
   n=this.normals[index];
   t=this.tangents[index];
  } else {
   for(var i=0;i<this.vectorsCache.length;i+=2){
    if(this.vectorsCache[i]==u){
     this.cacheHits=(this.cacheHits||0)+1
     return this.vectorsCache[i+1];
    }
   }
   this.cacheMisses=(this.cacheMisses||0)+1
   index=Math.floor(index);
   var e0=sample;
   var e01=this.func.evaluate(u+_FrenetFrames._EPSILON);
   var tangent=GLMath.vec3normInPlace(
    GLMath.vec3sub(e01,e0));
   var normal=GLMath.vec3normInPlace(
     GLMath.vec3cross(this.bitangents[index],tangent));
   var bitangent=GLMath.vec3normInPlace(
     GLMath.vec3cross(tangent,normal));
   b=bitangent;
   n=normal;
   t=tangent;
   cache=true;
  }
 } else {
   for(var i=0;i<this.vectorsCache.length;i+=2){
    if(this.vectorsCache[i]==u){
     this.cacheHits=(this.cacheHits||0)+1
     return this.vectorsCache[i+1];
    }
   }
   this.cacheMisses=(this.cacheMisses||0)+1
  var e0=sample;
  var e01=this.func.evaluate(u+_FrenetFrames._EPSILON);
  var tangent=GLMath.vec3normInPlace(
    GLMath.vec3sub(e01,e0));
  var normal=_FrenetFrames.normalFromTangent(tangent);
  var bitangent=GLMath.vec3normInPlace(
    GLMath.vec3cross(tangent,normal));
  b=bitangent;
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
}

/**
* Evaluator for a parametric surface in the form
* of a tube extruded from a parametric curve.
* @class
* @alias glutil.ExtrudedTube
* @param {Object} func An object that must contain a function
* named "evaluate", which takes the following parameter:<ul>
* <li><code>u</code> - A curve coordinate, generally from 0 to 1.
* </ul>
* The evaluator function returns a 3-element array: the first
* element is the X coordinate of the curve's position, the second
* element is the Y coordinate, and the third is the Z coordinate.
* @param {number} [thickness] Radius of the
* extruded tube.  If this parameter is null or omitted, the default is 0.125.
* @param {Object} [sweptCurve] Object describing
* a curve to serve as the cross section of the extruded shape,
* corresponding to the V coordinate of the ExtrudedTube's
* "evaluate" method. If this parameter is null or omitted, uses a circular cross section <code>(sin(u),
* cos(u), 0)</code> in which the V coordinate ranges from 0 through
* 1.  The curve object must contain a function
* named "evaluate", with the same meaning as for the "func" parameter.<p>
* The cross section will generally have a radius of 1 unit; bigger
* or smaller cross sections will affect the meaning of the "thickness"
* parameter.
*/
function ExtrudedTube(func, thickness, sweptCurve){
 this.thickness=thickness==null ? 0.125 : thickness;
 this.sweptCurve=sweptCurve;
 this.func=func;
 this.tangentFinder=new _FrenetFrames(func);
}

/**
* Generates a point on the extruded tube from the given u and v coordinates.
* @param {number} u U coordinate.  This will run the length of the curve.
* @param {number} v V coordinate.  This will sweep around the extruded
* tube.
* @return {Array<number>} A 3-element array specifying a 3D point.
*/
ExtrudedTube.prototype.evaluate=function(u, v){
 var basisVectors=this.tangentFinder.getSampleAndBasisVectors(u);
 var sampleX=basisVectors[9];
 var sampleY=basisVectors[10];
 var sampleZ=basisVectors[11];
 var t1,t2,sx,sy,sz;
 if(this.sweptCurve){
  var vpos=this.sweptCurve.evaluate(v);
  t1 = vpos[0];
  t2 = vpos[1];
  var t3=vpos[2];
  sx = sampleX+(basisVectors[0]*t2+basisVectors[3]*t1+basisVectors[6]*t3)*this.thickness;
  sy = sampleY+(basisVectors[1]*t2+basisVectors[4]*t1+basisVectors[7]*t3)*this.thickness;
  sz = sampleZ+(basisVectors[2]*t2+basisVectors[5]*t1+basisVectors[8]*t3)*this.thickness;
 } else {
  var vt=GLMath.PiTimes2*v;
  t1 = Math.cos(vt);
  t2 = (vt>=0 && vt<6.283185307179586) ? (vt<=3.141592653589793 ? Math.sqrt(1.0-t1*t1) : -Math.sqrt(1.0-t1*t1)) : Math.sin(vt);
  sx = sampleX+(basisVectors[0]*t2+basisVectors[3]*t1)*this.thickness;
  sy = sampleY+(basisVectors[1]*t2+basisVectors[4]*t1)*this.thickness;
  sz = sampleZ+(basisVectors[2]*t2+basisVectors[5]*t1)*this.thickness;
 }
 return [sx,sy,sz];
}

/**
* Represents a knot in the form of the Fourier series<p>
* <b>F</b>(u) = &Sigma;<sub>i=1, n</sub> <b>a</b> cos(<i>iu</i>) +  <b>b</b> sin(<i>iu</i>).<p>
* @param {Array<Array<number>>} a
* @param {Array<Array<number>>} b
*/
function FourierKnot(a,b){
 this.a=a; // Cosine coefficients
 this.b=b; // Sine coefficients
 this.idx=0;
 if(this.a.length!=this.b.length){
  throw new Error("a and b must be the same length");
 }
 this.evaluate=function(u){
  u*=GLMath.PiTimes2;
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
 }
}
