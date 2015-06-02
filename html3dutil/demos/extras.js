/**
* Evaluator for a parametric surface in the form
* of a tube extruded from a parametric curve.
* @param {Object} func An object that must contain a function
* named "evaluate", which takes the following parameter:<ul>
* <li><code>u</code> - A curve coordinate, generally from 0 to 1.
* </ul>
* The evaluator function returns a 3-element array: the first
* element is the X coordinate of the curve's position, the second
* element is the Y coordinate, and the third is the Z coordinate.
* @param {number|undefined} thickness Radius of the
* extruded tube.  If this parameter is null or omitted, the default is 0.125.
* @param {Object|undefined} sweptCurve Object describing
* a curve to serve as the cross section of the extruded shape,
* corresponding to the V coordinate of the ExtrudedTube's
* "evaluate" method. If this parameter is null or omitted, uses a circular cross section <code>(sin(u),
* cos(u), 0)</code> in which the V coordinate ranges from 0 through
* 1.  The curve object must contain a function
* named "evaluate", which takes the following parameter:<ul>
* <li><code>u</code> - A curve coordinate, generally from 0 to 1.
* </ul>
* The evaluator function returns an array with at least 2 elements:
* the first element is the X coordinate of the curve's position and
* the second element is the Y coordinate.<p>
* The cross section will generally have a radius of 1 unit; bigger
* or smaller cross sections will affect the meaning of the "thickness"
* parameter.
*/
ExtrudedTube._EPSILON=0.000001
function ExtrudedTube(func, thickness, sweptCurve){
 this.thickness=thickness==null ? 0.125 : thickness;
 this.sweptCurve=sweptCurve;
 this.func=func;
 this.normals=[];
 this.bitangents=[];
 this.tangents=[];
 var res=50;
 var nextSample=null;
 for(var i=0;i<=res;i++){
  var t=i/res;
  var e0=(nextSample) ? nextSample : func.evaluate(t);
  var e01=func.evaluate(i==res ? t-ExtrudedTube._EPSILON : t+ExtrudedTube._EPSILON);
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
  this.tangents[i]=tangent;
 }
}
// TODO: Implement parallel transport:
// <http://www.cs.indiana.edu/pub/techreports/TR425.pdf>
ExtrudedTube.prototype._getBasisVectors=function(u,val){
 var b,n,t;
 if(u>=0&& u<=1){
  var index=u*(this.bitangents.length-1);
  if(Math.abs(index-Math.round(index))<ExtrudedTube._EPSILON){
   index=Math.round(index);
   b=this.bitangents[index];
   n=this.normals[index];
   t=this.tangents[index];
  } else {
   index=Math.floor(index);
   var e0=this.func.evaluate(u);
   var e01=this.func.evaluate(u+ExtrudedTube._EPSILON);
   var tangent=GLMath.vec3normInPlace(
    GLMath.vec3sub(e01,e0));
   var normal=GLMath.vec3normInPlace(
    GLMath.vec3cross(this.bitangents[index],tangent))
   var bitangent=GLMath.vec3normInPlace(
    GLMath.vec3cross(tangent,normal));
   b=bitangent;
   n=normal;
   t=tangent;
  }
 } else {
  var e0=this.func.evaluate(u);
  var e01=this.func.evaluate(u+ExtrudedTube._EPSILON);
  var tangent=GLMath.vec3normInPlace(
    GLMath.vec3sub(e01,e0));
  var normal=ExtrudedTube._normalFromTangent(tangent);
  var bitangent=GLMath.vec3normInPlace(
    GLMath.vec3cross(tangent,normal));
  b=bitangent;
  n=normal;
  t=tangent;
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
}
ExtrudedTube._normalFromTangent=function(tangent){
 var normal=GLMath.vec3normInPlace(
   GLMath.vec3cross(tangent,[0,0,1]));
 if(GLMath.vec3dot(normal,normal)<ExtrudedTube._EPSILON){
   normal=GLMath.vec3normInPlace(GLMath.vec3cross(tangent,[0,1,0]));
 }
 return normal;
}
ExtrudedTube.prototype.evaluate=function(u, v){
 var basisVectors=[];
 var sample=this.func.evaluate(u);
 this._getBasisVectors(u,basisVectors);
 var t1,t2,sx,sy,sz;
 if(this.sweptCurve){
  var vpos=this.sweptCurve.evaluate(v);
  t1 = vpos[0];
  t2 = vpos[1];
  var t3=vpos[2];
  sx = sample[0]+(basisVectors[0]*t2+basisVectors[3]*t1+basisVectors[6]*t3)*this.thickness;
  sy = sample[1]+(basisVectors[1]*t2+basisVectors[4]*t1+basisVectors[7]*t3)*this.thickness;
  sz = sample[2]+(basisVectors[2]*t2+basisVectors[5]*t1+basisVectors[8]*t3)*this.thickness;
 } else {
  var vt=GLMath.PiTimes2*v;
  t1 = Math.cos(vt);
  t2 = Math.sin(vt);
  sx = sample[0]+(basisVectors[0]*t2+basisVectors[3]*t1)*this.thickness;
  sy = sample[1]+(basisVectors[1]*t2+basisVectors[4]*t1)*this.thickness;
  sz = sample[2]+(basisVectors[2]*t2+basisVectors[5]*t1)*this.thickness;
 }
 return [sx,sy,sz];
}
