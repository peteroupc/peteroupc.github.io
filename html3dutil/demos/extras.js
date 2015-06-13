/**
* Represents a collection of lines and curves that describe
* a 3-dimensional path.
* @class
*/
function GraphicsPath(){
 this.subpaths=[];
 this.moveX=0;
 this.moveY=0;
 this.moveZ=0;
 this.endX=0;
 this.endY=0;
 this.endZ=0;
}
/** @private */
GraphicsPath._Line=function(x0,y0,z0,x1,y1,z1){
 this.s0=x0;
 this.s1=y0;
 this.s2=z0;
 this.d0=x1-this.s0;
 this.d1=y1-this.s1;
 this.d2=z1-this.s2;
 this.evaluate=function(u){
  return [
   this.s0+this.d0*u,
   this.s1+this.d1*u,
   this.s2+this.d2*u
  ]
 }
}
/** @private */
GraphicsPath._SubPath=function(curves){
 this.curves=curves;
 this.evaluate=function(u){
  if(this.curves.length==0)return [0,0,0];
  var scaledU=u*this.curves.length;
  var floorU=Math.floor(u);
  if(floorU>=this.curves.length)floorU=this.curves.length;
  var newU=scaledU-floorU;
  return this.curves[floorU].evaluate(newU);
 }
}
/** @private */
GraphicsPath.prototype._flattenInternal=function(lines,curve,startU,startUPos,endU,endUPos,flatness,depth){
 var startPos=(startUPos==null) ? curve.evaluate(startU) : startUPos;
 var endPos=(endUPos==null) ? curve.evaluate(endU) : endUPos;
 var t1 = startPos[0] - endPos[0];
 var t2 = startPos[1] - endPos[1];
 var t3 = startPos[2] - endPos[2];
 var dist = Math.sqrt((((t1 * t1) + t2 * t2) + t3 * t3));
 if(dist<=flatness){
  lines.push(startPos.slice(0,3));
  lines.push(endPos.slice(0,3));
 } else if(depth>10){
  var midPos=curve.evaluate(startU+(endU-startU)*0.5);
  lines.push(startPos.slice(0,3));
  lines.push(midPos);
  lines.push(midPos.slice(0,3));
  lines.push(endPos.slice(0,3));
 } else {
  var halfU=startU+(endU-startU)*0.5;
  var halfPos=curve.evaluate(halfU);
  this._flattenInternal(lines,curve,startU,startPos,halfU,halfPos,flatness,depth+1);
  this._flattenInternal(lines,curve,halfU,halfPos,endU,endPos,flatness,depth+1);
 }
}
/**
 * Not documented yet.
 */
GraphicsPath.prototype.getSubpaths=function(){
 var subpaths=[];
 for(var i=0;i<this.subpaths.length;i++){
  if(this.subpaths[i].length>0){
   subpaths.push(new GraphicsPath._SubPath(this.subpaths[i]));
  }
 }
 return subpaths;
}
/**
 * Not documented yet.
 * @param {number} flatness Desired minimum length of flattened line
 * segments when flattening curved portions of the path.
 * This will be used to help limit the recursive flattening; it will
 * still only recurse up to its recursion depth (currently 10, but may
 * change).
 */
GraphicsPath.prototype.flatten=function(flatness){
 if(flatness<0)throw new Error("flatness is negative")
 var lines=[];
 for(var i=0;i<this.subpaths.length;i++){
  var subpath=this.subpaths[i];
  //console.log(subpath.length)
  for(var j=0;j<subpath.length;j++){
   var curve=subpath[j];
   if(curve.constructor==GraphicsPath._Line){
    lines.push(curve.evaluate(0))
    lines.push(curve.evaluate(1))
   } else {
    this._flattenInternal(lines,curve,0,null,1,null,flatness,0);
   }
  }
 }
 return lines;
}
/**
 * Sets the current end position and move-to position.
 * The Z-coordinate will be 0.
 * @param {number} x
 * @param {number} y
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.moveTo=function(x,y){
 return this.moveTo3D(x,y,0);
}
/**
 * Draws a line from the current end position to
 * the current move-to position.
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.closePath=function(){
 this.lineTo3D(this.moveX,this.moveY,this.moveZ);
 if(this.subpaths.length>0 &&
    this.subpaths[this.subpaths.length-1].length>0){
  this.subpaths.push([]);
 }
 return this;
}
/**
 * Sets the current end position and move-to position.
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.moveTo3D=function(x,y,z){
 this.moveX=this.endX=x;
 this.moveY=this.endY=y;
 this.moveZ=this.endZ=z;
 return this;
}
/**
 * Not documented yet.
 * @param {number} x
 * @param {number} y
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.lineTo=function(x,y){
 return this.addLine(this.endX,this.endY,x,y);
}
/**
 * Not documented yet.
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.lineTo3D=function(x,y,z){
 return this.addLine3D(this.endX,this.endY,this.endZ,x,y,z);
}
/**
 * Not documented yet.
 * @param {number} x
 * @param {number} y
 * @param {number} x2
 * @param {number} y2
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.quadraticCurveTo=function(x,y,x2,y2){
 return this.addQuadBezier(this.endX,this.endY,x,y,x2,y2);
}
/**
 * Not documented yet.
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} x2
 * @param {number} y2
 * @param {number} z2
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.quadraticCurveTo3D=function(x,y,z,x2,y2,z2){
 return this.addQuadBezier(this.endX,this.endY,this.endZ,x,y,z,x2,y2,z2);
}
/**
 * Not documented yet.
 * @param {number} x
 * @param {number} y
 * @param {number} x2
 * @param {number} y2
 * @param {number} x3
 * @param {number} y3
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.bezierCurveTo=function(x,y,x2,y2,x3,y3){
 return this.addCubicBezier(this.endX,this.endY,x,y,x2,y2,x3,y3);
}
/**
 * Not documented yet.
 * @param {number} x
 * @param {number} y
 * @param {number} z
 * @param {number} x2
 * @param {number} y2
 * @param {number} z2
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.bezierCurveTo3D=function(x,y,z,x2,y2,z2){
 return this.addCubicBezier(this.endX,this.endY,this.endZ,x,y,z,x2,y2,z2,
   x3,y3,z3);
}
/**
 * Not documented yet.
 * @param {*} curve
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.addCurve=function(curve){
 var start=curve.evaluate(0);
 var move=curve.evaluate(1);
 if(this.subpaths.length==0){
  this.subpaths[0]=[];
 } else if((start[0]!=this.endX || start[1]!=this.endY || start[2]!=this.endZ) &&
  this.subpaths[this.subpaths.length-1].length>0){
  this.subpaths.push([]);
 }
 this.subpaths[this.subpaths.length-1].push(curve);
 this.endX=move[0];
 this.endY=move[1];
 this.endZ=move[2];
 return this;
}
/**
 * Not documented yet.
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.addLine=function(x0,y0,x1,y1){
 return this.addLine3D(x0,y0,0,x1,y1,0);
}
/**
 * Not documented yet.
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.addQuadBezier=function(x0,y0,x1,y1,x2,y2){
 return this.addQuadBezier3D(x0,y0,0,x1,y1,0,x2,y2,0);
}
/**
 * Not documented yet.
 * @param {number} x0
 * @param {number} y0
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 * @param {number} x3
 * @param {number} y3
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.addCubicBezier=function(x0,y0,x1,y1,x2,y2,x3,y3){
 return this.addCubicBezier3D(x0,y0,0,x1,y1,0,x2,y2,0,x3,y3,0);
}
/**
 * Not documented yet.
 * @param {number} x0
 * @param {number} y0
 * @param {number} z0
 * @param {number} x1
 * @param {number} y1
 * @param {number} z1
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.addLine3D=function(x0,y0,z0,x1,y1,z1){
 if(this.subpaths.length==0){
  this.subpaths[0]=[];
 } else if((x0!=this.endX || y0!=this.endY || z0!=this.endZ) &&
  this.subpaths[this.subpaths.length-1].length>0){
  this.subpaths.push([]);
 }
 this.subpaths[this.subpaths.length-1].push(new GraphicsPath._Line(
  x0,y0,z0,
  x1,y1,z1
 ));
 this.endX=x1;
 this.endY=y1;
 this.endZ=z1;
 return this;
}
/**
 * Not documented yet.
 * @param {number} x0 X-coordinate of the start point
 * @param {number} y0 Y-coordinate of the start point.
 * @param {number} z0 Z-coordinate of the start point.
 * @param {number} x1
 * @param {number} y1
 * @param {number} z1
 * @param {number} x2
 * @param {number} y2
 * @param {number} z2
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.addQuadBezier3D=function(x0,y0,z0,x1,y1,z1,x2,y2,z2){
 if(this.subpaths.length==0){
  this.subpaths[0]=[];
 } else if((x0!=this.endX || y0!=this.endY || z0!=this.endZ) &&
  this.subpaths[this.subpaths.length-1].length>0){
  this.subpaths.push([]);
 }
 this.subpaths[this.subpaths.length-1].push(new BezierCurve([
  [x0,y0,z0],
  [x1,y1,z1],
  [x2,y2,z2],
 ]));
 this.endX=x2;
 this.endY=y2;
 this.endZ=z2;
 return this;
}
/**
 * Not documented yet.
 * @param {number} x0
 * @param {number} y0
 * @param {number} z0
 * @param {number} x1
 * @param {number} y1
 * @param {number} z1
 * @param {number} x2
 * @param {number} y2
 * @param {number} z2
 * @param {number} x3
 * @param {number} y3
 * @param {number} z3
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.addCubicBezier3D=function(x0,y0,z0,x1,y1,z1,x2,y2,z2,x3,y3,z3){
 if(this.subpaths.length==0){
  this.subpaths[0]=[];
 } else if((x0!=this.endX || y0!=this.endY || z0!=this.endZ) &&
  this.subpaths[this.subpaths.length-1].length>0){
  this.subpaths.push([]);
 }
 this.subpaths[this.subpaths.length-1].push(new BezierCurve([
  [x0,y0,z0],
  [x1,y1,z1],
  [x2,y2,z2],
  [x3,y3,z3],
 ]));
 this.endX=x3;
 this.endY=y3;
 this.endZ=z3;
 return this;
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
