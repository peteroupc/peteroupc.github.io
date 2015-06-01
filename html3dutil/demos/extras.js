/**
* Evaluator for a parametric surface in the form
* of a tube extruded from a parametric curve.
* @param {Object} func An object that must contain a function
* named "evaluate".  It takes the following parameter:<ul>
* <li><code>u</code> - A curve coordinate, generally from 0 to 1.
* </ul>
* The evaluator function returns a 3-element array: the first
* element is the X coordinate of the curve's position, the second
* element is the Y coordinate, and the third is the Z coordinate.
* @param {number|undefined} thickness Thickness of the
* extruded tube.  If null or omitted, the default is 0.125.
*/
function ExtrudedTube(func, thickness){
 this.thickness=thickness==null ? 0.125 : thickness;
 this.func=func;
 this.normals=[];
 this.bitangents=[];
 var res=50;
 var nextSample=null;
 for(var i=0;i<=res;i++){
  var t=i/res;
  var e0=(nextSample) ? nextSample : func.evaluate(t);
  var e01=func.evaluate(i==res ? t-0.0001 : t+0.0001);
  nextSample=(i==res) ? e0 : func.evaluate((i+1)/res);
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
   normal=ExtrudedTube._normalFromTangent(tangent);
  }
  var bitangent=GLMath.vec3normInPlace(
    GLMath.vec3cross(tangent,normal));
  this.normals[i]=normal;
  this.bitangents[i]=bitangent;
 }
}
// TODO: Implement parallel transport:
// <http://www.cs.indiana.edu/pub/techreports/TR425.pdf>
ExtrudedTube.prototype._getNormalAndBitangent=function(u,val){
 var b,n;
 if(u>=0&& u<=1){
  var index=u*(this.bitangents.length-1);
  if(Math.abs(index-Math.round(index))<0.0001){
   index=Math.round(index);
   b=this.bitangents[index];
   n=this.normals[index];
  } else {
   index=Math.floor(index);
   var e0=this.func.evaluate(u);
   var e01=this.func.evaluate(u+0.00001);
   var tangent=GLMath.vec3normInPlace(
    GLMath.vec3sub(e01,e0));
   var normal=GLMath.vec3normInPlace(
    GLMath.vec3cross(this.bitangents[index],tangent))
   var bitangent=GLMath.vec3normInPlace(
    GLMath.vec3cross(tangent,normal));
   b=bitangent;
   n=normal;
  }
 } else {
  var e0=this.func.evaluate(u);
  var e01=this.func.evaluate(u+0.00001);
  var tangent=GLMath.vec3normInPlace(
    GLMath.vec3sub(e01,e0));
  var normal=ExtrudedTube._normalFromTangent(tangent);
  var bitangent=GLMath.vec3normInPlace(
    GLMath.vec3cross(tangent,normal));
  b=bitangent;
  n=normal;
 }
 val[0]=n[0];
 val[1]=n[1];
 val[2]=n[2];
 val[3]=b[0];
 val[4]=b[1];
 val[5]=b[2];
}
ExtrudedTube._normalFromTangent=function(tangent){
 var normal=GLMath.vec3normInPlace(
   GLMath.vec3cross(tangent,[0,0,1]));
 if(GLMath.vec3dot(normal,normal)<0.001){
   normal=GLMath.vec3normInPlace(GLMath.vec3cross(tangent,[0,1,0]));
 }
 return normal;
}
ExtrudedTube.prototype.startDisk=function(u){
 var normBi=[];
 var sample=this.func.evaluate(u);
 this._getNormalAndBitangent(u,normBi);
 var vt=GLMath.PiTimes2*v;
 var t1 = Math.sin(vt);
 var t2 = Math.cos(vt);
 var sx = sample[0]+(normBi[0]*t1+normBi[3]*t2)*this.thickness;
 var sy = sample[1]+(normBi[1]*t1+normBi[4]*t2)*this.thickness;
 var sz = sample[2]+(normBi[2]*t1+normBi[5]*t2)*this.thickness;
 return [sx,sy,sz];
}

ExtrudedTube.prototype.evaluate=function(u, v){
 var normBi=[];
 var sample=this.func.evaluate(u);
 this._getNormalAndBitangent(u,normBi);
 var vt=GLMath.PiTimes2*v;
 var t1 = Math.sin(vt);
 var t2 = Math.cos(vt);
 var sx = sample[0]+(normBi[0]*t1+normBi[3]*t2)*this.thickness;
 var sy = sample[1]+(normBi[1]*t1+normBi[4]*t2)*this.thickness;
 var sz = sample[2]+(normBi[2]*t1+normBi[5]*t2)*this.thickness;
 return [sx,sy,sz];
}
