/*
* Experimental renderer using the HTML 2D Canvas.
*/
/* global GLMath, GLUtil, Mesh, Scene3D, Shape, ShapeGroup */
/*
// Rasterizer adapted by Peter O. from public domain code by
// castanyo@yahoo.es, in the file Raster.cpp.
*/
var __oldget3DContext=GLUtil.get3DContext;
var __use3D=false;
/**
 * Not documented yet.
 * @param {*} canvas
 */
GLUtil.get3DContext=function(canvas){
 "use strict";
if(__use3D){
  return __oldget3DContext(canvas);
 } else {
  return canvas.getContext("2d");
 }
};
/** @private */
Scene3D._Triangle=function(v0,v1,v2){
    "use strict";
this.v1=v0;
    this.v2=v1;
    this.v3=v2;
    this.t1=[0,1,0];
    this.t2=[1,0,0];
    this.t3=[0,0,1];
    // check if triangle is backfacing, if so, swap two vertices
    if ( ((this.v3[0]-this.v1[0])*(this.v2[1]-this.v1[1]) - (this.v3[1]-this.v1[1])*(this.v2[0]-this.v1[0])) < 0 ) {
      var hv=this.v1; this.v1=this.v2; this.v2=hv; // swap pos
      var ht=this.t1; this.t1=this.t2; this.t2=ht; // swap tex
    }
    this.valid=this.computeDeltas();
    if(this.valid){
     //console.log([this.v1[2],this.v2[2],this.v3[2]]+"")
     this.n1=Scene3D.vec2normInPlace([this.v2[1] - this.v1[1], this.v1[0] - this.v2[0]]);
     this.n2=Scene3D.vec2normInPlace([this.v3[1] - this.v2[1], this.v2[0] - this.v3[0]]);
     this.n3=Scene3D.vec2normInPlace([this.v1[1] - this.v3[1], this.v3[0] - this.v1[0]]);
    }
  };

  /// Compute texture space deltas.
  /// This method takes two edge vectors that form a basis, determines the
  /// coordinates of the canonic vectors in that basis, and computes the
  /// texture gradient that corresponds to those vectors.
  Scene3D._Triangle.prototype.computeDeltas=function(){
    "use strict";
var e0x=this.v3[0]-this.v1[0],
      e0y=this.v3[1]-this.v1[1];
    var e1x=this.v2[0]-this.v1[0],
      e1y=this.v2[1]-this.v1[1];
    var de0 = GLMath.vec3sub(this.t3,this.t1);
    var de1 = GLMath.vec3sub(this.t2,this.t1);
    var d=(e0y*e1x-e1y*e0x);
    if (Math.abs(d)<1e-6) {
      return false;
    }
    var denom=1.0/d;
    var lambda1 = -e1y * denom;
    var lambda2 = e0y * denom;
    var lambda3 = e1x * denom;
    var lambda4 = - e0x * denom;
    this.dx = [((de0[0] * lambda1) + de1[0] * lambda2), ((de0[1] * lambda1) + de1[1] * lambda2), ((de0[2] * lambda1) + de1[2] * lambda2)];
    this.dy = [((de0[0] * lambda3) + de1[0] * lambda4), ((de0[1] * lambda3) + de1[1] * lambda4), ((de0[2] * lambda3) + de1[2] * lambda4)];
    return true;
  };
/**
 * Not documented yet.
 * @param {*} vec
 */
Scene3D.vec2normInPlace=function(vec){
 "use strict";
var x=vec[0];
 var y=vec[1];
 var len=Math.sqrt(x*x+y*y);
 if(len!==0){
  len=1.0/len;
  vec[0]*=len;
  vec[1]*=len;
 }
 return vec;
};

Scene3D._Triangle.prototype.draw=function(width, height, data, depth, color, colorOffset){
    // 28.4 fixed-point coordinates
    "use strict";
    var offset;
    var Y1 = Math.round(16.0 * this.v1[1])|0;
    var Y2 = Math.round(16.0 * this.v2[1])|0;
    var Y3 = Math.round(16.0 * this.v3[1])|0;

    var X1 = Math.round(16.0 * this.v1[0])|0;
    var X2 = Math.round(16.0 * this.v2[0])|0;
    var X3 = Math.round(16.0 * this.v3[0])|0;

    // Deltas
    var DX12 = X1 - X2;
    var DX23 = X2 - X3;
    var DX31 = X3 - X1;

    var DY12 = Y1 - Y2;
    var DY23 = Y2 - Y3;
    var DY31 = Y3 - Y1;

    // Fixed-point deltas
    var FDX12 = DX12 << 4;
    var FDX23 = DX23 << 4;
    var FDX31 = DX31 << 4;

    var FDY12 = DY12 << 4;
    var FDY23 = DY23 << 4;
    var FDY31 = DY31 << 4;

    var frustumX0 =  0;
    var frustumY0 =  0;
    var frustumX1 =  width << 4;
    var frustumY1 =  height << 4;

    // Bounding rectangle
    var minx = (Math.max(Math.min(X1, X2, X3), frustumX0) + 0xF) >> 4;
    var miny = (Math.max(Math.min(Y1, Y2, Y3), frustumY0) + 0xF) >> 4;
    var maxx = (Math.min(Math.max(X1, X2, X3), frustumX1) + 0xF) >> 4;
    var maxy = (Math.min(Math.max(Y1, Y2, Y3), frustumY1) + 0xF) >> 4;
    // Block size, standard 8x8 (must be power of two)
    var q = 8;

    // Start in corner of 8x8 block
    minx &= ~7;
    miny &= ~7;
    var tex=new Float32Array([0,0,0]);
    var texRow=new Float32Array([0,0,0]);

    // Half-edge constants
    var C1 = DY12 * X1 - DX12 * Y1;
    var C2 = DY23 * X2 - DX23 * Y2;
    var C3 = DY31 * X3 - DX31 * Y3;

    // Correct for fill convention
    if(DY12 < 0 || (DY12 === 0 && DX12 > 0)) C1++;
    if(DY23 < 0 || (DY23 === 0 && DX23 > 0)) C2++;
    if(DY31 < 0 || (DY31 === 0 && DX31 > 0)) C3++;
          var ix,iy,xq;

    // Loop through blocks
    for(var y = miny; y < maxy; y += q)
    {
      for(var x = minx; x < maxx; x += q)
      {
        // Corners of block
        var x0 = x << 4;
        var x1 = (x + q - 1) << 4;
        var y0 = y << 4;
        var y1 = (y + q - 1) << 4;

        // Evaluate half-space functions
        var a00 = C1 + DX12 * y0 - DY12 * x0 > 0;
        var a10 = C1 + DX12 * y0 - DY12 * x1 > 0;
        var a01 = C1 + DX12 * y1 - DY12 * x0 > 0;
        var a11 = C1 + DX12 * y1 - DY12 * x1 > 0;
        var a = (a00 << 0) | (a10 << 1) | (a01 << 2) | (a11 << 3);
        if(a===0)continue;
        var b00 = C2 + DX23 * y0 - DY23 * x0 > 0;
        var b10 = C2 + DX23 * y0 - DY23 * x1 > 0;
        var b01 = C2 + DX23 * y1 - DY23 * x0 > 0;
        var b11 = C2 + DX23 * y1 - DY23 * x1 > 0;
        var b = (b00 << 0) | (b10 << 1) | (b01 << 2) | (b11 << 3);

        var c00 = C3 + DX31 * y0 - DY31 * x0 > 0;
        var c10 = C3 + DX31 * y0 - DY31 * x1 > 0;
        var c01 = C3 + DX31 * y1 - DY31 * x0 > 0;
        var c11 = C3 + DX31 * y1 - DY31 * x1 > 0;
        var c = (c00 << 0) | (c10 << 1) | (c01 << 2) | (c11 << 3);

        // Skip block when outside an edge
        if(b === 0x0 || c=== 0x0) continue;

        // Accept whole block when totally covered
        if(a === 0xF && b=== 0xF && c === 0xF)
        {
          texRow[0]=this.t1[0]+this.dy[0]*(y-this.v1[1])+this.dx[0]*(x-this.v1[0]);
          texRow[1]=this.t1[1]+this.dy[1]*(y-this.v1[1])+this.dx[1]*(x-this.v1[0]);
          texRow[2]=this.t1[2]+this.dy[2]*(y-this.v1[1])+this.dx[2]*(x-this.v1[0]);
           xq=Math.min(x+q,width);
          for(iy = y; iy < y + q; iy++)
          {
            tex[0]=texRow[0]; tex[1]=texRow[1]; tex[2]=texRow[2];
            for(ix = x; ix < xq; ix++)
            {
                   offset=(iy*width+ix)<<2;
                   this.pixel(offset,tex,width, height, data, depth, color, colorOffset);
              tex[0]+=this.dx[0]; tex[1]+=this.dx[1]; tex[2]+=this.dx[2];
            }
            texRow[0]+=this.dy[0]; texRow[1]+=this.dy[1]; texRow[2]+=this.dy[2];
          }
        }
        else // Partially covered block
        {
          var CY1 = C1 + DX12 * y0 - DY12 * x0;
          var CY2 = C2 + DX23 * y0 - DY23 * x0;
          var CY3 = C3 + DX31 * y0 - DY31 * x0;
          texRow[0]=this.t1[0]+this.dy[0]*(y-this.v1[1])+this.dx[0]*(x-this.v1[0]);
          texRow[1]=this.t1[1]+this.dy[1]*(y-this.v1[1])+this.dx[1]*(x-this.v1[0]);
          texRow[2]=this.t1[2]+this.dy[2]*(y-this.v1[1])+this.dx[2]*(x-this.v1[0]);
          xq=Math.min(x+q,width);
          for(iy = y; iy < y + q; iy++)
          {
            var CX1 = CY1;
            var CX2 = CY2;
            var CX3 = CY3;
            tex[0]=texRow[0]; tex[1]=texRow[1]; tex[2]=texRow[2];
            for(ix = x; ix < xq; ix++)
            {
              if(CX1 > 0 && CX2 > 0 && CX3 > 0)
              {
                   offset=(iy*width+ix)<<2;
                   this.pixel(offset,tex,width, height, data, depth, color, colorOffset);
              }
              CX1 -= FDY12;
              CX2 -= FDY23;
              CX3 -= FDY31;
              tex[0]+=this.dx[0]; tex[1]+=this.dx[1]; tex[2]+=this.dx[2];
            }
            CY1 += FDX12;
            CY2 += FDX23;
            CY3 += FDX31;
            texRow[0]+=this.dy[0]; texRow[1]+=this.dy[1]; texRow[2]+=this.dy[2];
          }
        }
      }
    }
  };

function intersect(p1,p2,p3x,p3y,p4x,p4y){
 "use strict";
 var x13, x21, x43, y13, y21, y43,den,num1,num2;
y43=(p4y-p3y);
 x43=(p4x-p3x);
 y13=(p1[1]-p3y);
 x13=(p1[0]-p3x);
 x21=(p2[0]-p1[0]);
 y21=(p2[1]-p1[1]);
 den=y43*x21-x43*y21;
 num1=x43*y13-y43*x13;
 num2=x21*y13-y21*x13;
 if(den!==0.0){
  den=1.0/den;
  num1*=den;
  num2*=den;
  var ret=(num1>=0.0 && num1<=1.0 && num2>=0.0 && num2<=1.0);
  //if(ret)console.log([p1[0],p1[1],p1[2],"|",p2[0],p2[1],p2[2],"|",p3x,p3y,p4x,p4y])
  return ret;
 }
 return false;
}

function intersectBox(p1,p2,width,height){
 "use strict";
return intersect(p1,p2,0,0,width,0) ||
  intersect(p1,p2,0,0,0,height) ||
  intersect(p1,p2,width,0,width,height) ||
  intersect(p1,p2,0,height,width,height);
}

function isTriangleOutside(p1,p2,p3,width,height){
 "use strict";
var maxx=Math.max(p1[0],p2[0],p3[0]);
 var maxy=Math.max(p1[1],p2[1],p3[1]);
 var minx=Math.min(p1[0],p2[0],p3[0]);
 var miny=Math.min(p1[1],p2[1],p3[1]);
 if((minx>width && maxx>width) ||
     (minx<0 && maxx<0) ||
     (miny>height && maxy>height) ||
     (miny<0 && maxy<0)){
  // All points are off the rectangle on one side
  return true;
 }
 if(minx>=0 && miny>=0 && maxx<=width && maxy<=height){
  // The entire triangle fits in the rectangle
  return false;
 }
 // Now there are only these cases:
 // 1. The triangle covers the entire box.  This will be the case
 // if all four corners of the box are in the triangle.
 // 2. Some but not all corners of the box are in the triangle,
 // so it's not outside the box.
 // 3. The triangle doesn't intersect the box's sides, so it's
 // outside the box.
 // 4. The triangle intersects the box's sides, so it's not outside
 // the box.
 //--- Point in triangle test
 var t3 = p1[1] - height;
 var t4 = p2[1] - height;
 var t5 = p3[1] - height;
 var t7 = p1[0] - width;
 var t8 = p2[0] - width;
 var t9 = p3[0] - width;
 if ((((((p1[0] * p2[1]) - p1[1] * p2[0])) >= 0.0 && (((p2[0] * p3[1]) -
      p2[1] * p3[0])) >= 0.0) && (((p3[0] * p1[1]) - p3[1] * p1[0])) >= 0.0))
    return false;
 if(((((p1[0] * t4) - t3 * p2[0])) >= 0.0 && (((p2[0] * t5) - t4 * p3[0])) >= 0.0) &&
    (((p3[0] * t3) - t5 * p1[0])) >= 0.0)
    return false;
 if(((((t7 * p2[1]) - p1[1] * t8)) >= 0.0 && (((t8 * p3[1]) - p2[1] * t9)) >= 0.0) &&
     (((t9 * p1[1]) - p3[1] * t7)) >= 0.0)
    return false;
 if(((((t7 * t4) - t3 * t8)) >= 0.0 && (((t8 * t5) - t4 * t9)) >= 0.0) &&
    (((t9 * t3) - t5 * t7)) >= 0.0)
    return false;
 var ret=!intersectBox(p1,p2,width,height) &&
    !intersectBox(p2,p3,width,height) &&
    !intersectBox(p3,p1,width,height);
 return ret;
}

/** @private */
Scene3D.prototype._getTriangle=function(p1,p2,p3) {
    "use strict";
if(isTriangleOutside(p1,p2,p3,this.width,this.height)){
        return null;
    }
    if(p1[2]>5 || p2[2]>5 || p3[2]>5){
     // HACK: pathological depth
     return null;
    }
    if(p1[2]<-5 || p2[2]<-5 || p3[2]<-5){
     // HACK: pathological depth
     return null;
    }
    if(p1[2]<-1 && p2[2]<-1 && p3[2]<-1)return null;
    if(p1[2]>1 && p2[2]>1 && p3[2]>1)return null;
    var area = (p1[0]*p2[1]-p2[0]*p1[1])+(p2[0]*p3[1]-p3[0]*p2[1]);
    if(this._frontFace===Scene3D.CCW)area=-area;
    var front=(area>0) ? Scene3D.FRONT : Scene3D.BACK;
    var culled=area===0 || (this._cullFace!==Scene3D.NONE &&
        ((area<0 && front!==this._frontFace) ||
        (area>0 && front===this._frontFace)));
    if(culled){
        return null;
    }
    var tri=new Scene3D._Triangle(p1,p2,p3);
    return (tri.valid) ? tri : null;
};
Scene3D._MIN_DEPTH = 0;
Scene3D._DEPTH_RESOLUTION = 65536;

Scene3D._Triangle.prototype.pixel=function(offset, tex, width, height, data, depth, color, colorOffset){
    "use strict";
var t0=Math.max(0,tex[0]);
    var t1=Math.max(0,tex[1]);
    var t2=Math.max(0,tex[2]);
    var d=(t0*this.v1[2]+t1*this.v2[2]+t2*this.v3[2]);
    var dep=Math.floor(d*Scene3D._DEPTH_RESOLUTION)|0;
    if(dep<=depth[offset>>2] && dep>=Scene3D._MIN_DEPTH){
       depth[offset>>2]=dep;
       if(color){
        data[offset]=color[0];
        data[offset+1]=color[1];
        data[offset+2]=color[2];
       } else {
        data[offset]=((t0*this.v1[colorOffset]+t1*this.v2[colorOffset]+t2*this.v3[colorOffset]))|0;
        data[offset+1]=((t0*this.v1[colorOffset+1]+t1*this.v2[colorOffset+1]+t2*this.v3[colorOffset+1]))|0;
        data[offset+2]=((t0*this.v1[colorOffset+2]+t1*this.v2[colorOffset+2]+t2*this.v3[colorOffset+2]))|0;
       }
       data[offset+3]=255;
      }
};
/** @private */
Scene3D._drawPoint=function(data,depth,x,y,z,width,height,rgb){
"use strict";
if(x<0 || x>=width || y<0 || y>=height)return;
      var dep=Math.floor(z*Scene3D._DEPTH_RESOLUTION)|0;
      var offset=y*width+x;
      if(dep<=depth[offset] && dep>=Scene3D._MIN_DEPTH){
       depth[offset]=dep;
       offset<<=2;
       data[offset]=rgb[0];
       data[offset+1]=rgb[1];
       data[offset+2]=rgb[2];
       data[offset+3]=0xFF;
      }
};
/** @private */
Scene3D._drawPoint2=function(data,depth,x,y,z,width,height,rgb){
"use strict";
if(x<0 || x>=width || y<0 || y>=height)return;
      var dep=z>>8;
      var offset=y*width+x;
      if(dep<=depth[offset] && dep>=Scene3D._MIN_DEPTH){
       depth[offset]=dep;
       offset<<=2;
       data[offset]=rgb[0]>>8;
       data[offset+1]=rgb[1]>>8;
       data[offset+2]=rgb[2]>>8;
       data[offset+3]=0xFF;
      }
};
/** @private */
Scene3D._drawLine=function(data,depth,x,y,z,x2,y2,z2,width,height,rgb,rgb2){
"use strict";
if((x<0 && x2<0) ||
   (x>=width && x2>=width) ||
   (y<0 && y2<0) ||
   (y>=height && y2>=height) ||
   (z<-1 && z2<-1) ||
   (z>1 && z2>1))return;
var dx=x2-x;
var dy=y2-y;
var sx=1,sy=1;
if(dx<0){
 sx=-1;
 dx=-dx;
}
if(dy<0){
 sy=-1;
 dy=-dy;
}
var depth1=(Math.floor(z*Scene3D._DEPTH_RESOLUTION)|0)<<8;
var depth2=(Math.floor(z2*Scene3D._DEPTH_RESOLUTION)|0)<<8;
var interprgb=[rgb[0]<<8,rgb[1]<<8,rgb[2]<<8];
var dydy=dy+dy;
var dxdx=dx+dx;
var e,ddepth,sr,sg,sb,i;
if(dy>dx){
      e = dxdx - dy;
      ddepth=(dy===0 || depth2-depth1) ? 0 : ((depth2-depth1)/dy)|0;
      sr=(dy===0 || rgb2[0]===rgb[0]) ? 0 : (((rgb2[0]-rgb[0])<<8)/dy)|0;
      sg=(dy===0 || rgb2[1]===rgb[1]) ? 0 : (((rgb2[1]-rgb[1])<<8)/dy)|0;
      sb=(dy===0 || rgb2[2]===rgb[2]) ? 0 : (((rgb2[2]-rgb[2])<<8)/dy)|0;
      for(i = 0; i < dy; i++){
            Scene3D._drawPoint2(data,depth,x,y,depth1,width,height,interprgb);
            while(e >= 0){
                  x += sx;
                  e -= dydy;
            }
            y += sy;
            e += dxdx;
            depth1+=ddepth;
            interprgb[0]+=sr;
            interprgb[1]+=sg;
            interprgb[2]+=sb;
      }
} else {
      e = dydy - dx;
      ddepth=(dx === 0 || depth2-depth1) ? 0 : ((depth2-depth1)/dx)|0;
      sr=(dx === 0 || rgb2[0]===rgb[0]) ? 0 : (((rgb2[0]-rgb[0])<<8)/dx)|0;
      sg=(dx === 0 || rgb2[1]===rgb[1]) ? 0 : (((rgb2[1]-rgb[1])<<8)/dx)|0;
      sb=(dx === 0 || rgb2[2]===rgb[2]) ? 0 : (((rgb2[2]-rgb[2])<<8)/dx)|0;
      for(i = 0; i < dx; i++){
            Scene3D._drawPoint2(data,depth,x,y,depth1,width,height,interprgb);
            while(e >= 0)
            {
                  y += sy;
                  e -= dxdx;
            }
            x += sx;
            e += dydy;
            depth1+=ddepth;
            interprgb[0]+=sr;
            interprgb[1]+=sg;
            interprgb[2]+=sb;
      }
}
Scene3D._drawPoint(data,depth,x2,y2,z2,width,height,rgb2);
};

/** @private */
Scene3D._perspectiveTransform=function(mat,pt){
 "use strict";
var x=pt[0];
 var y=pt[1];
 var z=pt[2];
 pt[0]=x * mat[0] + y * mat[4] + z * mat[8] + mat[12];
 pt[1]=x * mat[1] + y * mat[5] + z * mat[9] + mat[13];
 pt[2]=x * mat[2] + y * mat[6] + z * mat[10] + mat[14];
 var w=x * mat[3] + y * mat[7] + z * mat[11] + mat[15];
 if(w!==1){
  w=1.0/w;
  pt[0]*=w;
  pt[1]*=w;
  pt[2]*=w;
 }
};
/** @private */
Scene3D._transformAndClipPoint=function(mat,pt){
 "use strict";
var x=pt[0];
 var y=pt[1];
 var z=pt[2];
 pt[0]=x * mat[0] + y * mat[4] + z * mat[8] + mat[12];
 pt[1]=x * mat[1] + y * mat[5] + z * mat[9] + mat[13];
 pt[2]=x * mat[2] + y * mat[6] + z * mat[10] + mat[14];
 var w=x * mat[3] + y * mat[7] + z * mat[11] + mat[15];
 if(pt[2]<-w || pt[2]>w){
   return false;
 }
 if(w!==1){
  w=1.0/w;
  pt[0]*=w;
  pt[1]*=w;
  pt[2]*=w;
 }
 return true;
};
/** @private */
Scene3D._transformAndClipLine=function(mat,pt,pt2,size){
 "use strict";
var x=pt[0];
 var y=pt[1];
 var z=pt[2];
 var x1=x * mat[0] + y * mat[4] + z * mat[8] + mat[12];
 var y1=x * mat[1] + y * mat[5] + z * mat[9] + mat[13];
 var z1=x * mat[2] + y * mat[6] + z * mat[10] + mat[14];
 var w1=x * mat[3] + y * mat[7] + z * mat[11] + mat[15];
 x=pt2[0];
 y=pt2[1];
 z=pt2[2];
 var x2=x * mat[0] + y * mat[4] + z * mat[8] + mat[12];
 var y2=x * mat[1] + y * mat[5] + z * mat[9] + mat[13];
 var z2=x * mat[2] + y * mat[6] + z * mat[10] + mat[14];
 var w2=x * mat[3] + y * mat[7] + z * mat[11] + mat[15];
 if(Math.abs(w1)<1e-9)return false;
 if(Math.abs(w2)<1e-9)return false;
 if(Math.abs(x1)<1e-9)x1=0;
 if(Math.abs(y1)<1e-9)y1=0;
 if(Math.abs(z1)<1e-9)z1=0;
 if(Math.abs(x2)<1e-9)x2=0;
 if(Math.abs(y2)<1e-9)y2=0;
 if(Math.abs(z2)<1e-9)z2=0;
 if(w1!==1){
  w1=1.0/w1;
  x1*=w1;
  y1*=w1;
  z1*=w1;
 }
 if(w2!==1){
  w2=1.0/w2;
  x2*=w2;
  y2*=w2;
  z2*=w2;
 }
 if((z1<-1 && z2<-1) || (z2>1 && z2>1)){
   // both vertices lie outside the same clipping
   // plane
   return false;
 }
 if(z1<-1 || z2<-1 || z1>1 || z2>1){
   // line needs to be clipped because either
   // or both vertices lie outside the clipping
   // planes
   var linediv=1.0/(z2-z1);
   var near1=(-1-z1)*linediv;
   var near2=(-1-z2)*linediv;
   var far1=(1-z1)*linediv;
   var far2=(1-z2)*linediv;
   var startT=0;
   if(near1>0 && near1<=1)startT=near1;
   if(far1>0 && far1<=1)startT=far1;
   var endT=1;
   if(near2>=0 && near2<1)endT=near2;
   if(far2>=0 && far2<1)endT=far2;
   pt[0]=x1+(x2-x1)*startT;
   pt[1]=y1+(y2-y1)*startT;
   pt[2]=z1+(z2-z1)*startT;
   pt2[0]=x1+(x2-x1)*endT;
   pt2[1]=y1+(y2-y1)*endT;
   pt2[2]=z1+(z2-z1)*endT;
   for(var i=3;i<size;i++){
    x1=pt[i];
    x2=pt2[i];
    pt[i]=x1+(x2-x1)*startT;
    pt2[i]=x1+(x2-x1)*endT;
   }
 } else {
  pt[0]=x1;
  pt[1]=y1;
  pt[2]=z1;
  pt2[0]=x2;
  pt2[1]=y2;
  pt2[2]=z2;
 }
 return true;
};

/** @private */
Scene3D.prototype._renderInner=function(){
  "use strict";
var data={};
  data.projview=GLMath.mat4multiply(
   this._projectionMatrix,this._viewMatrix);
  var cc=[
   Math.floor(this.clearColor[0]*255),
   Math.floor(this.clearColor[1]*255),
   Math.floor(this.clearColor[2]*255),
   Math.floor(this.clearColor[3]*255)];
  if(Uint8Array)cc=new Uint8Array(cc);
  if(!this.imgdata || this.imgdataWidth!==this.width || this.imgdataHeight!==this.height){
   this.imgdata = this.context.getImageData(0, 0, this.width, this.height);
   this.imgdataWidth=this.width;
   this.imgdataHeight=this.height;
  }
  var size=this.width*this.height*4;
  var idata=this.imgdata.data;
  for(var i=0;i<size;i+=4){
   idata[i]=cc[0];
   idata[i+1]=cc[1];
   idata[i+2]=cc[2];
   idata[i+3]=cc[3];
  }
  data.imgdata=this.imgdata;
  if(!this._depth){
      this._depth=[];
  }
  size=this.width*this.height;
    for(i=0;i<size;i++){
      this._depth[i]=Scene3D._DEPTH_RESOLUTION-1;
    }
  for(i=0;i<this.shapes.length;i++){
   this._renderShape(this.shapes[i],data);
  }
  this.context.putImageData(data.imgdata,0,0);
  return this;
};
/** @private */
Scene3D.prototype._renderShape=function(shape,data){
 "use strict";
 var i,index1,index2,j,x,y;
if(shape.constructor===ShapeGroup){
  for(i=0;i<shape.shapes.length;i++){
   this._renderShape(shape.shapes[i],data);
  }
 } else {
   var currentMatrix=shape.getMatrix();
   var w2=this.width/2;
   var h2=this.height/2;
   var mvpMatrix=GLMath.mat4multiply(data.projview,currentMatrix);
   var mesh=shape.bufferedMesh;
   var v1=[];
   var v2=[];
   var v3=[];
   var v;
   var colorValueBuffer=[0,0,0];
   for(i=0;i<mesh.subMeshes.length;i++){
    var subMesh=mesh.subMeshes[i];
    var colorOffset=Mesh._colorOffset(subMesh.attributeBits);
    var colorValue=null;
    var stride=subMesh.getStride();
    var prim=subMesh.primitiveType();
    if(colorOffset<0 && shape.material && shape.material.diffuse){
     colorValue=colorValueBuffer;
     colorValueBuffer[0]=Math.floor(shape.material.diffuse[0]*255.0);
     colorValueBuffer[1]=Math.floor(shape.material.diffuse[1]*255.0);
     colorValueBuffer[2]=Math.floor(shape.material.diffuse[2]*255.0);
    }
    if(prim===Mesh.TRIANGLES){
     v=subMesh.vertices;
     if(this._cullFace===Scene3D.FRONT_AND_BACK)continue;
     for(i=0;i<subMesh.indices.length;i+=3){
      index1=subMesh.indices[i]*stride;
      index2=subMesh.indices[i+1]*stride;
      var index3=subMesh.indices[i+2]*stride;
      for(j=0;j<stride;j++){
       v1[j]=v[index1+j];
       v2[j]=v[index2+j];
       v3[j]=v[index3+j];
      }
      Scene3D._perspectiveTransform(mvpMatrix,v1);
      Scene3D._perspectiveTransform(mvpMatrix,v2);
      Scene3D._perspectiveTransform(mvpMatrix,v3);
      v1[0]=v1[0]*w2+w2;
      v1[1]=v1[1]*-h2+h2;
      v1[2]=v1[2]*0.5+0.5;
      v2[0]=v2[0]*w2+w2;
      v2[1]=v2[1]*-h2+h2;
      v2[2]=v2[2]*0.5+0.5;
      v3[0]=v3[0]*w2+w2;
      v3[1]=v3[1]*-h2+h2;
      v3[2]=v3[2]*0.5+0.5;
      var tri=this._getTriangle(v1,v2,v3);
      if(tri){
       if(colorOffset>=0){
        for(j=colorOffset;j<colorOffset+3;j++){
         v1[j]*=255.0;
         v2[j]*=255.0;
         v3[j]*=255.0;
        }
        tri.draw(this.width, this.height, data.imgdata.data, this._depth,null,colorOffset);
       } else {
        tri.draw(this.width, this.height, data.imgdata.data, this._depth,colorValue);
       }
      }
     }
    } else if(prim===Mesh.LINES){
     v=subMesh.vertices;
     for(i=0;i<subMesh.indices.length;i+=2){
      index1=subMesh.indices[i]*stride;
      index2=subMesh.indices[i+1]*stride;
      for(j=0;j<stride;j++){
       v1[j]=v[index1+j];
       v2[j]=v[index2+j];
      }
      if(Scene3D._transformAndClipLine(mvpMatrix,v1,v2,stride)){
       v1[0]=v1[0]*w2+w2;
       v1[1]=v1[1]*-h2+h2;
       v1[2]=v1[2]*0.5+0.5;
       v2[0]=v2[0]*w2+w2;
       v2[1]=v2[1]*-h2+h2;
       v2[2]=v2[2]*0.5+0.5;
       x=Math.round(v1[0])|0;
       y=Math.round(v1[1])|0;
       var x2=Math.round(v2[0])|0;
       var y2=Math.round(v2[1])|0;
       if(colorOffset>=0){
        Scene3D._drawLine(data.imgdata.data,this._depth,
         x,y,v1[2],x2,y2,v2[2],this.width,this.height,[
          Math.floor(v1[colorOffset]*255)|0,
          Math.floor(v1[colorOffset+1]*255)|0,
          Math.floor(v1[colorOffset+2]*255)|0
         ],[
          Math.floor(v2[colorOffset]*255)|0,
          Math.floor(v2[colorOffset+1]*255)|0,
          Math.floor(v2[colorOffset+2]*255)|0
         ]);
        } else {
       Scene3D._drawLine(data.imgdata.data,this._depth,
         x,y,v1[2],x2,y2,v2[2],
         this.width,this.height,colorValue,colorValue);
        }
       }
     }
    } else if(prim===Mesh.POINTS){
     v=subMesh.vertices;
     for(i=0;i<subMesh.indices.length;i++){
      index1=subMesh.indices[i]*stride;
      for(j=0;j<stride;j++){
       v1[j]=v[index1+j];
      }
      if(Scene3D._transformAndClipPoint(mvpMatrix,v1)){
       v1[0]=v1[0]*w2+w2;
       v1[1]=v1[1]*-h2+h2;
       v1[2]=v1[2]*0.5+0.5;
       x=Math.round(v1[0])|0;
       y=Math.round(v1[1])|0;
        if(colorOffset>=0){
         colorValue=colorValueBuffer;
         colorValue[0]=Math.floor(v1[colorOffset]*255)|0;
         colorValue[1]=Math.floor(v1[colorOffset+1]*255)|0;
         colorValue[2]=Math.floor(v1[colorOffset+2]*255)|0;
        }
        Scene3D._drawPoint(data.imgdata.data,this._depth,
          x,y,v1[2],this.width,this.height,colorValue);
       }
     }
    }
   }
 }
};
