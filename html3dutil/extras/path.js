/*
Written by Peter O. in 2015.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://upokecenter.dreamhosters.com/articles/donate-now-2/
*/
/**
* Represents a two-dimensional path.
* <p>This class is considered a supplementary class to the
* Public Domain HTML 3D Library and is not considered part of that
* library. <p>
* To use this class, you must include the script "extras/path.js"; the
 * class is not included in the "glutil_min.js" file which makes up
 * the HTML 3D Library.  Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script></pre>
* @class
*/
function GraphicsPath(){
 this.segments=[]
 this.incomplete=false
 this.startPos=[0,0]
 this.endPos=[0,0]
}
GraphicsPath.CLOSE=0
GraphicsPath.LINE=1
GraphicsPath.QUAD=2
GraphicsPath.CUBIC=3
GraphicsPath.ARC=4
/**
* Returns whether the curve path is incomplete
* because of an error in parsing the curve string.
* This flag will be reset if a moveTo command,
* closePath command, or another path segment
* is added to the path.
* @return {boolean} Return value.*/
GraphicsPath.prototype.isIncomplete=function(){
 return this.incomplete
}
GraphicsPath._startPoint=function(a){
 if(a[0]==GraphicsPath.CLOSE){
  return [0,0]
 } else {
  return [a[1],a[2]]
 }
}
GraphicsPath._endPoint=function(a){
 if(a[0]==GraphicsPath.CLOSE){
  return [0,0]
 } else {
  return [a[a.length-2],a[a.length-1]]
 }
}
GraphicsPath._point=function(seg,t){
 if(seg[0]==GraphicsPath.CLOSE){
  return [0,0]
 } else if(seg[0]==GraphicsPath.LINE){
  return [
   seg[1]+(seg[3]-seg[1])*t,
   seg[2]+(seg[4]-seg[2])*t
  ]
 } else if(seg[0]==GraphicsPath.QUAD){
  var mt=1-t;
  var mtsq=mt*mt;
  var mt2=(mt+mt);
  var a,b;
  a=seg[1]*mtsq;
  b=seg[3]*mt2;
  var x=a+t*(b+t*seg[5]);
  a=seg[2]*mtsq;
  b=seg[4]*mt2
  var y=a+t*(b+t*seg[6]);
  return [x,y];
 } else if(seg[0]==GraphicsPath.CUBIC){
  var a=(seg[3]-seg[1])*3;
  var b=(seg[5]-seg[3])*3-a;
  var c=seg[7]-a-b-seg[1];
  var x=seg[1]+t*(a+t*(b+t*c));
  a=(seg[4]-seg[2])*3;
  b=(seg[6]-seg[4])*3-a;
  c=seg[8]-a-b-seg[2];
  var y=seg[2]+t*(a+t*(b+t*c));
  return [x,y];
 } else if(seg[0]==GraphicsPath.ARC){
  if(t==0)return [seg[1],seg[2]]
  if(t==1)return [seg[8],seg[9]]
  var rx=seg[3]
  var ry=seg[4]
  var cx=seg[10]
  var cy=seg[11]
  var theta=seg[12]
  var delta=(seg[13]-seg[12])
  var rot=seg[5]
  var angle=theta+delta*t
  var cr = Math.cos(rot);
  var sr = (rot>=0 && rot<6.283185307179586) ? (rot<=3.141592653589793 ? Math.sqrt(1.0-cr*cr) : -Math.sqrt(1.0-cr*cr)) : Math.sin(rot);
  var ca = Math.cos(angle);
  var sa = (angle>=0 && angle<6.283185307179586) ? (angle<=3.141592653589793 ? Math.sqrt(1.0-ca*ca) : -Math.sqrt(1.0-ca*ca)) : Math.sin(angle);
  return [
   cr*ca*rx-sr*sa*ry+cx,
   sr*ca*rx+cr*sa*ry+cy]
 } else {
  return [0,0]
 }
}

GraphicsPath._flattenCubic=function(a1,a2,a3,a4,a5,a6,a7,a8,t1,t2,list,flatness,mode,depth){
 if(depth==null)depth=0
 if(depth>=20 || Math.abs(a1-a3-a3+a5)+Math.abs(a3-a5-a5+a7)+
    Math.abs(a2-a4-a4+a6)+Math.abs(a4-a6-a6+a8)<=flatness){
  if(mode==0){
   list.push([a1,a2,a7,a8])
  } else {
   var dx=a7-a1
   var dy=a8-a2
   var length=Math.sqrt(dx*dx+dy*dy)
   list.push(t1,t2,length)
  }
 } else {
  var x1=(a1+a3)*0.5
  var x2=(a3+a5)*0.5
  var xc1=(x1+x2)*0.5
  var x3=(a5+a7)*0.5
  var xc2=(x2+x3)*0.5
  var xd=(xc1+xc2)*0.5
  var y1=(a2+a4)*0.5
  var y2=(a4+a6)*0.5
  var yc1=(y1+y2)*0.5
  var y3=(a6+a8)*0.5
  var yc2=(y2+y3)*0.5
  var yd=(yc1+yc2)*0.5
  var tmid=(t1+t2)*0.5
  GraphicsPath._flattenCubic(a1,a2,x1,y1,xc1,yc1,xd,yd,t1,tmid,list,flatness,mode,depth+1)
  GraphicsPath._flattenCubic(xd,yd,xc2,yc2,x3,y3,a7,a8,tmid,t2,list,flatness,mode,depth+1)
 }
}

GraphicsPath._flattenQuad=function(a1,a2,a3,a4,a5,a6,t1,t2,list,flatness,mode,depth){
 if(depth==null)depth=0
 if(depth>=20 || Math.abs(a1-a3-a3+a5)+Math.abs(a2-a4-a4+a6)<=flatness){
  if(mode==0){
   list.push([a1,a2,a5,a6])
  } else {
   var dx=a5-a1
   var dy=a6-a2
   var length=Math.sqrt(dx*dx+dy*dy)
   list.push(t1,t2,length)
  }
 } else {
  var x1=(a1+a3)*0.5
  var x2=(a3+a5)*0.5
  var xc=(x1+x2)*0.5
  var y1=(a2+a4)*0.5
  var y2=(a4+a6)*0.5
  var yc=(y1+y2)*0.5
  var tmid=(t1+t2)*0.5
  GraphicsPath._flattenQuad(a1,a2,x1,y1,xc,yc,t1,tmid,list,flatness,mode,depth+1)
  GraphicsPath._flattenQuad(xc,yc,x2,y2,a5,a6,tmid,t2,list,flatness,mode,depth+1)
 }
}

GraphicsPath._flattenArc=function(a,t1,t2,list,flatness,mode,depth){
 var rot=a[5]
 var crot=Math.cos(rot)
 var srot=Math.sin(rot)
 var ellipseInfo=[a[3],a[4],a[10],a[11],crot,srot]
 GraphicsPath._flattenArcInternal(ellipseInfo,a[1],a[2],a[8],a[9],a[12],a[13],t1,t2,list,flatness,mode,depth);
}

GraphicsPath._flattenArcInternal=function(ellipseInfo,x1,y1,x2,y2,theta1,theta2,t1,t2,list,flatness,mode,depth){
 if(depth==null)depth=0
 var thetaMid=(theta1+theta2)*0.5
 var tmid=(t1+t2)*0.5
 var ca = Math.cos(thetaMid);
 var sa = Math.sin(thetaMid);
 var xmid = ellipseInfo[4]*ca*ellipseInfo[0]-ellipseInfo[4]*sa*ellipseInfo[1]+ellipseInfo[2]
 var ymid = ellipseInfo[5]*ca*ellipseInfo[0]+ellipseInfo[5]*sa*ellipseInfo[1]+ellipseInfo[3]
 if(depth>=20 || Math.abs(x1-xmid-xmid+x2)+Math.abs(y1-ymid-ymid+y2)<=flatness){
  if(mode==0){
   list.push([x1,y1,xmid,ymid])
   list.push([xmid,ymid,x2,y2])
  } else {
   var dx=xmid-x1
   var dy=ymid-y1
   var length=Math.sqrt(dx*dx+dy*dy)
   list.push(t1,tmid,length)
   dx=x2-xmid
   dy=y2-ymid
   length=Math.sqrt(dx*dx+dy*dy)
   list.push(tmid,t2,length)
  }
 } else {
  GraphicsPath._flattenArcInternal(ellipseInfo,x1,y1,xmid,ymid,theta1,thetaMid,t1,tmid,list,flatness,mode,depth+1)
  GraphicsPath._flattenArcInternal(ellipseInfo,xmid,ymid,x2,y2,thetaMid,theta2,tmid,t2,list,flatness,mode,depth+1)
 }
}
/** @private */
GraphicsPath.prototype._start=function(){
 for(var i=0;i<this.segments.length;i++){
  var s=this.segments[i]
  if(s[0]!=GraphicsPath.CLOSE)return GraphicsPath._startPoint(s)
 }
 return [0,0]
}
/** @private */
GraphicsPath.prototype._end=function(){
 for(var i=this.segments.length-1;i>=0;i--){
  var s=this.segments[i]
  if(s[0]!=GraphicsPath.CLOSE)return GraphicsPath._endPoint(s)
 }
 return [0,0]
}
/**
 * Returns this path in the form of a string in SVG path format.
 * @return {string}
 */
GraphicsPath.prototype.toString=function(){
 var oldpos=null
 var ret=""
 for(var i=0;i<this.segments.length;i++){
  var a=this.segments[i]
  if(a[0]==GraphicsPath.CLOSE){
   ret+="Z"
  } else {
   var start=GraphicsPath._startPoint(a)
   if(!oldpos || oldpos[0]!=start[0] || oldpos[1]!=start[1]){
    ret+="M"+start[0]+","+start[1]
   }
   if(a[0]==GraphicsPath.LINE){
    ret+="L"+a[3]+","+a[4]
   }
   if(a[0]==GraphicsPath.QUAD){
    ret+="Q"+a[3]+","+a[4]+","+a[5]+","+a[6]
   }
   if(a[0]==GraphicsPath.CUBIC){
    ret+="C"+a[3]+","+a[4]+","+a[5]+","+a[6]+","+a[7]+","+a[8]
   }
   if(a[0]==GraphicsPath.ARC){
    ret+="A"+a[3]+","+a[4]+","+(a[5]*180/Math.PI)+","+
      (a[6] ? "1" : "0")+(a[7] ? "1" : "0")+a[8]+","+a[9]
   }
  }
 }
 return ret
}
GraphicsPath._length=function(a,flatness){
 if(a[0]==GraphicsPath.LINE){
  var dx=a[3]-a[1]
  var dy=a[4]-a[2]
  return Math.sqrt(dx*dx+dy*dy)
 } else if(a[0]==GraphicsPath.QUAD){
   var flat=[]
   var len=0
   GraphicsPath._flattenQuad(a[1],a[2],a[3],a[4],
     a[5],a[6],0.0,1.0,flat,flatness*2,1)
   for(var j=0;j<flat.length;j+=3){
    len+=flat[j+2]
   }
   return len
  } else if(a[0]==GraphicsPath.CUBIC){
   var flat=[]
   var len=0
   GraphicsPath._flattenCubic(a[1],a[2],a[3],a[4],
     a[5],a[6],a[7],a[8],0.0,1.0,flat,flatness*4,1)
   for(var j=0;j<flat.length;j+=3){
    len+=flat[j+2]
   }
   return len
 } else if(a[0]==GraphicsPath.ARC){
  var rx=a[3]
  var ry=a[4]
  var theta=a[12]
  var theta2=a[13]
  return GraphicsPath._ellipticArcLength(rx,ry,theta,theta2)
 } else {
  return 0
 }
}

/**
 * Finds the approximate length of this path.
* @param {number} [flatness] When quadratic and cubic
* curves are decomposed to
* line segments for the purpose of calculating their length, the
* segments will generally be close to the true path of the curve by
* up to this value, given in units.  If null or omitted, default is 1.
 * @return {number} Approximate length of this path
 * in units.
 */
GraphicsPath.prototype.pathLength=function(flatness){
 if(this.segments.length==0)return 0;
 var totalLength=0
 if(flatness==null)flatness=1.0
 for(var i=0;i<this.segments.length;i++){
  var s=this.segments[i]
  var len=GraphicsPath._length(s,flatness)
  totalLength+=len
 }
 return totalLength;
}
/**
* Gets an array of line segments approximating
* the path.
* @param {number} [flatness] When curves and arc
* segments are decomposed to line segments, the
* segments will be close to the true path of the curve by this
* value, given in units.  If null or omitted, default is 1.
* @return {Array<Array<number>>} Array of line segments.
* Each line segment is an array of four numbers: the X and
* Y coordinates of the start point, respectively, then the X and
* Y coordinates of the end point, respectively.
*/
GraphicsPath.prototype.getLines=function(flatness){
 var ret=[]
 if(flatness==null)flatness=1.0
 for(var i=0;i<this.segments.length;i++){
  var s=this.segments[i]
  var len=0
  if(s[0]==GraphicsPath.QUAD){
   GraphicsPath._flattenQuad(s[1],s[2],s[3],s[4],
     s[5],s[6],0.0,1.0,ret,flatness*2,0)
  } else if(s[0]==GraphicsPath.CUBIC){
   GraphicsPath._flattenCubic(s[1],s[2],s[3],s[4],
     s[5],s[6],s[7],s[8],0.0,1.0,ret,flatness*4,0)
  } else if(s[0]==GraphicsPath.ARC){
   GraphicsPath._flattenArc(s,0.0,1.0,ret,flatness*4,0)
  } else if(s[0]!=GraphicsPath.CLOSE){
   ret.push([s[1],s[2],s[3],s[4]])
  }
 }
 return ret
}
/**
* Gets an array of points evenly spaced across the length
* of the path.
* @param {number} numPoints Number of points to return.
* @param {number} [flatness] When curves and arcs
* are decomposed to line segments for the purpose of
* calculating their length, the
* segments will be close to the true path of the curve by this
* value, given in units.  If null or omitted, default is 1.
* @return {Array<Array<number>>} Array of points lying on
* the path and evenly spaced across the length of the path,
* starting and ending with the path's endpoints.  Returns
* an empty array if <i>numPoints</i> is less than 1.  Returns
* an array consisting of the start point if <i>numPoints</i>
* is 1.
*/
GraphicsPath.prototype.getPoints=function(numPoints,flatness){
 if(numPoints<1)return []
 if(numPoints==1){
  return [this._start()]
 }
 if(numPoints==2){
  return [this._start(),this._end()]
 }
 if(flatness==null)flatness=1.0
 var steps=numPoints-1
 var lengths=[]
 var flattenedCurves=[]
 var curFlat=0
 var totalLength=0
 var curLength=0
 for(var i=0;i<this.segments.length;i++){
  var s=this.segments[i]
  var len=0
  if(s[0]==GraphicsPath.QUAD){
   var flat=[]
   GraphicsPath._flattenQuad(s[1],s[2],s[3],s[4],
     s[5],s[6],0.0,1.0,flat,flatness*2,1)
   for(var j=0;j<flat.length;j+=3){
    len+=flat[j+2]
   }
   flattenedCurves.push(flat)
  } else if(s[0]==GraphicsPath.CUBIC){
   var flat=[]
   GraphicsPath._flattenCubic(s[1],s[2],s[3],s[4],
     s[5],s[6],s[7],s[8],0.0,1.0,flat,flatness*4,1)
   for(var j=0;j<flat.length;j+=3){
    len+=flat[j+2]
   }
   flattenedCurves.push(flat)
  } else if(s[0]==GraphicsPath.ARC){
   var flat=[]
   GraphicsPath._flattenArc(s,0.0,1.0,flat,flatness*4,1)
   for(var j=0;j<flat.length;j+=3){
    len+=flat[j+2]
   }
   flattenedCurves.push(flat)
  } else {
   len=GraphicsPath._length(s,0)
  }
  lengths.push(len)
  totalLength+=len
 }
 var stepLength=totalLength/(numPoints-1);
 var nextStep=stepLength
 var count=1
 var ret=[this._start()]
 for(var i=0;i<this.segments.length;i++){
  var s=this.segments[i]
  var segLength=lengths[i]
  if(s[0]==GraphicsPath.QUAD || s[0]==GraphicsPath.CUBIC ||
     s[0]==GraphicsPath.ARC){
   var flatCurve=flattenedCurves[curFlat]
   if(segLength>0){
    for(var j=0;j<flatCurve.length;j+=3){
     var flatSegLength=flatCurve[j+2]
     if(flatSegLength>0){
      var endLen=curLength+flatSegLength;
      while(endLen>=nextStep && count<numPoints-1){
       var t=(flatSegLength-(endLen-nextStep))/flatSegLength
       t=flatCurve[j]+(flatCurve[j+1]-flatCurve[j])*t;
       ret.push(GraphicsPath._point(s,t));
       count++
       nextStep+=stepLength
       if(count>=numPoints-1)
        break;
      }
     }
     curLength+=flatSegLength
    }
   }
   curFlat++;
  } else if(s[0]==GraphicsPath.LINE && segLength>0){
   var endLen=curLength+segLength;
   while(endLen>=nextStep && count<numPoints-1){
    var t=(segLength-(endLen-nextStep))/segLength
    ret.push(GraphicsPath._point(s,t));
    count++
    nextStep+=stepLength
    if(count>=numPoints-1)
     break;
   }
   curLength+=segLength
  }
 }
 while(ret.length<numPoints-1){
  ret.push(ret[ret.length-1])
 }
 ret.push(this._end())
 return ret
}
/**
 * Makes this path closed.  Adds a line segment to the
 * path's start position, if necessary.
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.closePath=function(){
 if(this.startPos[0]!=this.endPos[0] ||
   this.startPos[1]!=this.endPos[1]){
  this.lineTo(this.startPos[0],this.startPos[1])
 }
 if(this.segments.length>0){
  this.segments.push([GraphicsPath.CLOSE])
 }
 this.incomplete=false
 return this;
}
/**
 * Moves the current start position and end position.
 * @param {*} x
 * @param {*} y
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.moveTo=function(x,y){
 this.startPos[0]=x
 this.startPos[1]=y
 this.endPos[0]=x
 this.endPos[1]=y
 this.incomplete=false
 return this
}
/**
 * Adds a line segment to the path, starting
 * at the path's end position, then
 * sets the end position to the end of the segment.
 * @param {*} x X-coordinate of the end of the line segment.
 * @param {*} y Y-coordinate of the end of the line segment.
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.lineTo=function(x,y){
 this.segments.push([GraphicsPath.LINE,
  this.endPos[0],this.endPos[1],x,y])
 this.endPos[0]=x
 this.endPos[1]=y
 this.incomplete=false
 return this
}
/**
 * Not documented yet.
 * @param {*} x
 * @param {*} y
 * @param {*} x2
 * @param {*} y2
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.quadTo=function(x,y,x2,y2){
 this.segments.push([GraphicsPath.QUAD,
  this.endPos[0],this.endPos[1],x,y,x2,y2])
 this.endPos[0]=x2
 this.endPos[1]=y2
 this.incomplete=false
 return this
}
/**
 * Not documented yet.
 * @param {*} x
 * @param {*} y
 * @param {*} x2
 * @param {*} y2
 * @param {*} x3
 * @param {*} y3
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.cubicTo=function(x,y,x2,y2,x3,y3){
 this.segments.push([GraphicsPath.CUBIC,
  this.endPos[0],this.endPos[1],x,y,x2,y2,x3,y3])
 this.endPos[0]=x3
 this.endPos[1]=y3
 this.incomplete=false
 return this
}
/**
* Estimates the integral of a function.  The integral
* is the area between the function's graph and the X-axis,
* where areas above the X axis add to the integral, and areas
* below the X axis subtract from it.
* @private
* @param {Function} func A function that takes one number
* and returns a number.  For best results,
* the function should be continuous (informally, this means
* its graph between <code>xmin</code> and
* <code>xmax</code> can be drawn without lifting the pen).
* @param {Number} xmin Smallest input to the function,
* or the lower limit to integration.
* @param {Number} xmax Largest input to the function,
* or the upper limit to integration.  If xmax is less than xmin,
* this results in a negative integral.
* @param {Number} [maxIter] Maximum iterations.
* If null or undefined, will iterate indefinitely.
* @returns The approximate integral of _func_ between
* _xmin_ and _xmax_.
*/
GraphicsPath._numIntegrate=function(func, xmin, xmax, maxIter){
 var oldVal=0;
 var first=true;
 var res=8;
 var integral=0;
 var step=(xmax-xmin)/res;
 var firstx=func(xmin);
 // 9-point Newton-Cotes integration
 var coeff=[989,5888,-928,10496,-4540,10496,-928,5888,989];
 var chunk=step*0.0002821869488536155 // =step*4/14175
 var steps=coeff.length-1
 var count=0
 while(true){
  var curVal=0;
  oldx=firstx;
  for(var i=0;i<res;i+=steps){
   var s=0;
   var last=0;
   for(var j=0;j<coeff.length;j++){
    var f=(j==0) ? oldx : func(xmin+step*(i+j));
    last=f;
    s+=f*coeff[j];
   }
   curVal+=chunk*s;
   oldx=last;
  }
  if(!first && curVal==oldVal){
   return curVal;
  } else {
   oldVal=curVal;
   res*=2
   step*=0.5;
   chunk*=0.5;
   first=false;
  }
  if(maxIter!=null){
   count+=1
   if(count>=maxIter)return curVal
  }
 }
}
GraphicsPath._ellipticArcLength=function(xRadius,yRadius,startAngle,endAngle){
 if(startAngle==endAngle || xRadius<=0 || yRadius<=0)return 0
 if(xRadius==yRadius){
  // for circular arc length this is extremely simple
  return Math.abs((endAngle-startAngle)*xRadius);
 }
 var mn=Math.min(xRadius,yRadius)
 var mx=Math.max(xRadius,yRadius)
 var eccSq=1-(mn*mn)/(mx*mx)
 var ellipticIntegrand=function(x){
  var s=Math.sin(x)
  return Math.sqrt(1-s*s*eccSq);
 }
 return Math.abs(mx*GraphicsPath._numIntegrate(
   ellipticIntegrand,startAngle,endAngle,7))
}
GraphicsPath._vecangle=function(a,b,c,d){
 var dot=a*c+b*d
 var denom=Math.sqrt(a*a+b*b)*Math.sqrt(c*c+d*d)
 dot/=denom
 var sgn=a*d-b*c
 var ret=Math.acos(dot)
 if(sgn<0)ret=-ret
 return ret
}
GraphicsPath._arcToCenterParam=function(a){
 var x1=a[1]
 var y1=a[2]
 var x2=a[8]
 var y2=a[9]
 var rx=a[3]
 var ry=a[4]
 var rot=a[5]
 var xmid=(x1-x2)*0.5
 var ymid=(y1-y2)*0.5
 var xpmid=(x1+x2)*0.5
 var ypmid=(y1+y2)*0.5
 var crot = Math.cos(rot);
 var srot = (rot>=0 && rot<6.283185307179586) ? (rot<=3.141592653589793 ? Math.sqrt(1.0-crot*crot) : -Math.sqrt(1.0-crot*crot)) : Math.sin(rot);
 var x1p=crot*xmid+srot*ymid
 var y1p=crot*ymid-srot*xmid
 var rxsq=rx*rx
 var rysq=ry*ry
 var x1psq=x1p*x1p
 var y1psq=y1p*y1p
 var rx_xy=rxsq*y1psq+rysq*x1psq
 var cxsqrt=Math.sqrt((rxsq*rysq-rx_xy)/rx_xy)
 var cxp=(rx*y1p)*cxsqrt/ry
 var cyp=(ry*x1p)*cxsqrt/rx
 if(a[6]==a[7]){
  cxp=-cxp
 } else {
  cyp=-cyp
 }
 var cx=crot*cxp-srot*cyp+xpmid
 var cy=srot*cxp+crot*cyp+ypmid
 var vecx=(x1p-cxp)/rx
 var vecy=(y1p-cyp)/ry
 var nvecx=(-x1p-cxp)/rx
 var nvecy=(-y1p-cyp)/ry
 var cosTheta1=vecx/Math.sqrt(vecx*vecx+vecy*vecy)
 var theta1=Math.acos(cosTheta1)
 if(vecy<0)theta1=-theta1
 var delta=GraphicsPath._vecangle(vecx,vecy,nvecx,nvecy)
 delta=(delta<0) ? GLMath.PiTimes2+delta : delta;
 if(!a[7] && delta>0){
  delta-=GLMath.PiTimes2
 } else if(a[7] && delta<0){
  delta+=GLMath.PiTimes2
 }
 delta+=theta1
 return [cx,cy,theta1,delta]
}
/**
 * Not documented yet.
 * @param {*} rx
 * @param {*} ry
 * @param {*} rot Rotation of the ellipse in degrees.
 * @param {*} largeArc
 * @param {*} sweep
 * @param {*} x2
 * @param {*} y2
 * @return {GraphicsPath} This object.
 */
GraphicsPath.prototype.arcTo=function(rx,ry,rot,largeArc,sweep,x2,y2){
 if(rx==0 || ry==0){
  return this.lineTo(x2,y2);
 }
 rot*=Math.PI/180;
 rx=Math.abs(rx);
 ry=Math.abs(ry);
 var x1=this.endPos[0]
 var y1=this.endPos[1]
 var xmid=(x1-x2)*0.5
 var ymid=(y1-y2)*0.5
 var crot = Math.cos(rot);
 var srot = (rot>=0 && rot<6.283185307179586) ? (rot<=3.141592653589793 ? Math.sqrt(1.0-crot*crot) : -Math.sqrt(1.0-crot*crot)) : Math.sin(rot);
 var x1p=crot*xmid+srot*ymid
 var y1p=crot*ymid-srot*xmid
 var lam=(x1p*x1p)/(rx*rx)+(y1p*y1p)/(ry*ry);
 if(lam>1){
  lam=Math.sqrt(lam)
  rx*=lam
  ry*=lam
 }
 var arc=[GraphicsPath.ARC,
  x1,y1,rx,ry,rot,!!largeArc,!!sweep,x2,y2]
 var cp=GraphicsPath._arcToCenterParam(arc)
 arc[10]=cp[0]
 arc[11]=cp[1]
 arc[12]=cp[2]
 arc[13]=cp[3]
 this.segments.push(arc)
 this.endPos[0]=x2
 this.endPos[1]=y2
 this.incomplete=false
 return this
}
GraphicsPath._nextAfterWs=function(str,index){
 while(index[0]<str.length){
  var c=str.charCodeAt(index[0])
  index[0]++
  if(c==0x20 || c==0x0d || c==0x09 || c==0x0a || c==0x0c)
   continue;
  return c
 }
 return -1
}
GraphicsPath._nextAfterSepReq=function(str,index){
 var comma=false
 var havesep=false
 while(index[0]<str.length){
  var c=str.charCodeAt(index[0])
  index[0]++
  if(c==0x20 || c==0x0d || c==0x09 || c==0x0a || c==0x0c){
   havesep=true
   continue;
  }
  if(!comma && c==0x2c){
   havesep=true
   comma=true
   continue;
  }
  return (!havesep) ? -1 : c
 }
 return -1
}
GraphicsPath._nextAfterSep=function(str,index){
 var comma=false
 while(index[0]<str.length){
  var c=str.charCodeAt(index[0])
  index[0]++
  if(c==0x20 || c==0x0d || c==0x09 || c==0x0a || c==0x0c)
   continue;
  if(!comma && c==0x2c){
   comma=true
   continue;
  }
  return c
 }
 return -1
}
GraphicsPath._peekNextNumber=function(str,index){
 var oldindex=index[0]
 var ret=GraphicsPath._nextNumber(str,index,true)!=null
 index[0]=oldindex
 return ret
}
GraphicsPath._notFinite=function(n){
 return isNaN(n) || n==Number.POSITIVE_INFINITY ||
   n==Number.NEGATIVE_INFINITY
}
GraphicsPath._nextNumber=function(str,index,afterSep){
 var oldindex=index[0]
 var c=(afterSep) ?
   GraphicsPath._nextAfterSep(str,index) :
   GraphicsPath._nextAfterWs(str,index)
 var startIndex=index[0]-1
 var dot=false
 var digit=false
 var exponent=false
 var ret;
 if(c==0x2e)dot=true
 else if(c>=0x30 && c<=0x39)digit=true
 else if(c!=0x2d && c!=0x2b){
    index[0]=oldindex
    return null
   }
 while(index[0]<str.length){
  var c=str.charCodeAt(index[0])
  index[0]++
  if(c==0x2e){
   if(dot){
    index[0]=oldindex
    return null
   }
   dot=true
  } else if(c>=0x30 && c<=0x39){
   digit=true
  } else if(c==0x45 || c==0x65){
   if(!digit){
    index[0]=oldindex
    return null
   }
   exponent=true
   break
  } else {
   if(!digit){
    index[0]=oldindex
    return null
   }
   index[0]--
   ret=parseFloat(str.substr(startIndex,index[0]-startIndex))
   if(GraphicsPath._notFinite(ret)){
    index[0]=oldindex
    return null
   }
   return ret
  }
 }
 if(exponent){
  var c=str.charCodeAt(index[0])
  if(c<0){
    index[0]=oldindex
    return null
   }
  index[0]++
  digit=false
  if(c>=0x30 && c<=0x39)digit=true
  else if(c!=0x2d && c!=0x2b){
    index[0]=oldindex
    return null
   }
  while(index[0]<str.length){
   var c=str.charCodeAt(index[0])
   index[0]++
   if(c>=0x30 && c<=0x39){
    digit=true
   } else {
    if(!digit){
    index[0]=oldindex
    return null
    }
    index[0]--
    ret=parseFloat(str.substr(startIndex,index[0]-startIndex))
    if(GraphicsPath._notFinite(ret)){
     index[0]=oldindex
     return null
    }
    return ret
   }
  }
  if(!digit){
    index[0]=oldindex
    return null
  }
 } else {
  if(!digit){
    index[0]=oldindex
    return null
  }
 }
 ret=parseFloat(str.substr(startIndex,str.length-startIndex))
 if(GraphicsPath._notFinite(ret)){
  index[0]=oldindex
  return null
 }
 return ret
}
/**
*
* @param {string} A string, in the SVG path format, representing
* a two-dimensional path.
* @return {GraphicsPath}
*/
GraphicsPath.fromString=function(str){
 var index=[0]
 var started=false
 var ret=new GraphicsPath()
 var failed=false;
 while(!failed && index[0]<str.length){
  var c=GraphicsPath._nextAfterWs(str,index)
  if(!started && c!=0x4d && c!=0x6d){
   // not a move-to command when path
   // started
    failed=true;break;
  }
  // NOTE: Doesn't implement SVG2 meaning of Z
  // command yet because it's not yet fully specified
  switch(c){
   case 0x5a:case 0x7a:{ // 'Z', 'z'
    ret.closePath()
    break;
   }
   case 0x4d:case 0x6d:{ // 'M', 'm'
    var sep=false
    while(true){
     var curx=(c==0x6d) ? ret.endPos[0] : 0
     var cury=(c==0x6d) ? ret.endPos[1] : 0
     var x=GraphicsPath._nextNumber(str,index,sep)
     if(x==null){ if(!sep)failed=true;break; }
     var y=GraphicsPath._nextNumber(str,index,true)
     if(y==null){ failed=true;break; }
     if(sep)ret.lineTo(curx+x,cury+y)
     else ret.moveTo(curx+x,cury+y);
     sep=true;
    }
    started=true
    break;
   }
   case 0x4c:case 0x6c:{ // 'L', 'l'
    var sep=false
    while(true){
     var curx=(c==0x6c) ? ret.endPos[0] : 0
     var cury=(c==0x6c) ? ret.endPos[1] : 0
     var x=GraphicsPath._nextNumber(str,index,sep)
     if(x==null){ if(!sep)failed=true;break; }
     var y=GraphicsPath._nextNumber(str,index,true)
     if(y==null){ failed=true;break; }
     ret.lineTo(curx+x,cury+y);
     sep=true;
    }
    break;
   }
   case 0x48:case 0x68:{ // 'H', 'h'
    var sep=false
    while(true){
     var curpt=(c==0x68) ? ret.endPos[0] : 0
     var x=GraphicsPath._nextNumber(str,index,sep)
     if(x==null){ if(!sep)failed=true;break; }
     ret.lineTo(curpt+x,ret.endPos[1]);
     sep=true;
    }
    break;
   }
   case 0x56:case 0x76:{ // 'V', 'v'
    var sep=false
    while(true){
     var curpt=(c==0x76) ? ret.endPos[1] : 0
     var x=GraphicsPath._nextNumber(str,index,sep)
     if(x==null){ if(!sep)failed=true;break; }
     ret.lineTo(ret.endPos[0],curpt+x);
     sep=true;
    }
    break;
   }
   case 0x43:case 0x63:{ // 'C', 'c'
    var sep=false
    while(true){
     var curx=(c==0x63) ? ret.endPos[0] : 0
     var cury=(c==0x63) ? ret.endPos[1] : 0
     var x=GraphicsPath._nextNumber(str,index,sep)
     if(x==null){ if(!sep)failed=true;break; }
     var y=GraphicsPath._nextNumber(str,index,true)
     if(y==null){ failed=true;break; }
     var x2=GraphicsPath._nextNumber(str,index,true)
     if(x2==null){ failed=true;break; }
     var y2=GraphicsPath._nextNumber(str,index,true)
     if(y2==null){ failed=true;break; }
     var x3=GraphicsPath._nextNumber(str,index,true)
     if(x3==null){ failed=true;break; }
     var y3=GraphicsPath._nextNumber(str,index,true)
     if(y3==null){ failed=true;break; }
     ret.cubicTo(curx+x,cury+y,curx+x2,cury+y2,
       curx+x3,cury+y3);
     sep=true;
    }
    break;
   }
   case 0x51:case 0x71:{ // 'Q', 'q'
    var sep=false
    while(true){
     var curx=(c==0x71) ? ret.endPos[0] : 0
     var cury=(c==0x71) ? ret.endPos[1] : 0
     var x=GraphicsPath._nextNumber(str,index,sep)
     if(x==null){ if(!sep)failed=true;break; }
     var y=GraphicsPath._nextNumber(str,index,true)
     if(y==null){ failed=true;break; }
     var x2=GraphicsPath._nextNumber(str,index,true)
     if(x2==null){ failed=true;break; }
     var y2=GraphicsPath._nextNumber(str,index,true)
     if(y2==null){ failed=true;break; }
     ret.quadTo(curx+x,cury+y,curx+x2,cury+y2);
     sep=true;
    }
    break;
   }
   case 0x41:case 0x61:{ // 'A', 'a'
    var sep=false
    while(true){
     var curx=(c==0x61) ? ret.endPos[0] : 0
     var cury=(c==0x61) ? ret.endPos[1] : 0
     var x=GraphicsPath._nextNumber(str,index,sep)
     if(x==null){ if(!sep)failed=true;break; }
     var y=GraphicsPath._nextNumber(str,index,true)
     if(y==null){ failed=true;break; }
     var rot=GraphicsPath._nextNumber(str,index,true)
     if(rot==null){ failed=true;break; }
     var largeArc=GraphicsPath._nextAfterSepReq(str,index)
     var sweep=GraphicsPath._nextAfterSep(str,index)
     if(largeArc==-1 || sweep==-1){ failed=true;break; }
     var x2=GraphicsPath._nextNumber(str,index,true)
     if(x2==null){ failed=true;break; }
     var y2=GraphicsPath._nextNumber(str,index,true)
     if(y2==null){ failed=true;break; }
     ret.arcTo(x+curx,y+cury,rot,largeArc!=0x30,
       sweep!=0x30,x2+curx,y2+cury);
     sep=true;
    }
    break;
   }
   case 0x53:case 0x73:{ // 'S', 's'
    var sep=false
    while(true){
     var curx=(c==0x73) ? ret.endPos[0] : 0
     var cury=(c==0x73) ? ret.endPos[1] : 0
     var x=GraphicsPath._nextNumber(str,index,sep)
     if(x==null){ if(!sep)failed=true;break; }
     var y=GraphicsPath._nextNumber(str,index,true)
     if(y==null){ failed=true;break; }
     var x2=GraphicsPath._nextNumber(str,index,true)
     if(x2==null){ failed=true;break; }
     var y2=GraphicsPath._nextNumber(str,index,true)
     if(y2==null){ failed=true;break; }
     var xcp=curx
     var ycp=cury
     if(ret.segments.length>0 &&
        ret.segments[ret.segments.length-1][0]==GraphicsPath.CUBIC){
        xcp=ret.segments[ret.segments.length-1][5]
        ycp=ret.segments[ret.segments.length-1][6]
     }
     ret.cubicTo(2*curx-xcp,2*cury-ycp,x+curx,y+cury,x2+curx,y2+cury);
     sep=true;
    }
    break;
   }
   case 0x54:case 0x74:{ // 'T', 't'
    var sep=false
    while(true){
     var curx=(c==0x74) ? ret.endPos[0] : 0
     var cury=(c==0x74) ? ret.endPos[1] : 0
     var x=GraphicsPath._nextNumber(str,index,sep)
     if(x==null){ if(!sep)failed=true;break; }
     var y=GraphicsPath._nextNumber(str,index,true)
     if(y==null){ failed=true;break; }
     var xcp=curx
     var ycp=cury
     if(ret.segments.length>0 &&
        ret.segments[ret.segments.length-1][0]==GraphicsPath.QUAD){
        xcp=ret.segments[ret.segments.length-1][3]
        ycp=ret.segments[ret.segments.length-1][4]
     }
     x+=curx
     y+=cury
     ret.quadTo(2*curx-xcp,2*cury-ycp,x+curx,y+cury);
     sep=true;
    }
    break;
   }
   default:
    ret.incomplete=true;
    return ret
  }
 }
 if(failed)ret.incomplete=true
 return ret
}
