/*
* Experimental renderer using the HTML 2D Canvas.
*/

/*
// Rasterizer adapted by Peter O. from public domain code by
// castanyo@yahoo.es, in the file Raster.cpp.
*/
GLUtil.get3DContext=function(canvas){
 return canvas.getContext("2d");
}
Scene3D._Triangle=function(v0,v1,v2){
    this.v1=v0
    this.v2=v1
    this.v3=v2
    this.t1=[1,0,0];
    this.t2=[0,1,0];
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
  }

	/// Compute texture space deltas.
	/// This method takes two edge vectors that form a basis, determines the
	/// coordinates of the canonic vectors in that basis, and computes the
	/// texture gradient that corresponds to those vectors.
	Scene3D._Triangle.prototype.computeDeltas=function(){
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
	}
Scene3D.vec2normInPlace=function(vec){
 var x=vec[0];
 var y=vec[1];
 len=Math.sqrt(x*x+y*y);
 if(len!=0){
  len=1.0/len;
  vec[0]*=len;
  vec[1]*=len;
 }
 return vec;
}

Scene3D._Triangle.prototype.pixel=function(offset, tex, width, height, data, depth, color, colorOffset){
    var t0=Math.max(0,tex[0]);
    var t1=Math.max(0,tex[1]);
    var t2=Math.max(0,tex[2]);
    var d=(t0*this.v1[2]+t1*this.v2[2]+t2*this.v3[2]);
    var dep=Math.floor(d*32767.0)|0;
    if(dep<=depth[offset>>2] && dep>=-32768){
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
}

Scene3D._Triangle.prototype.draw=function(width, height, data, depth, color, colorOffset){
		// 28.4 fixed-point coordinates
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
		if(DY12 < 0 || (DY12 == 0 && DX12 > 0)) C1++;
		if(DY23 < 0 || (DY23 == 0 && DX23 > 0)) C2++;
		if(DY31 < 0 || (DY31 == 0 && DX31 > 0)) C3++;

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
        if(a==0)continue;
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
				if(b == 0x0 || c == 0x0) continue;

				// Accept whole block when totally covered
				if(a == 0xF && b == 0xF && c == 0xF)
				{
					texRow[0]=this.t1[0]+this.dy[0]*(y-this.v1[1])+this.dx[0]*(x-this.v1[0]);
          texRow[1]=this.t1[1]+this.dy[1]*(y-this.v1[1])+this.dx[1]*(x-this.v1[0]);
          texRow[2]=this.t1[2]+this.dy[2]*(y-this.v1[1])+this.dx[2]*(x-this.v1[0]);
           var xq=Math.min(x+q,width);
					for(var iy = y; iy < y + q; iy++)
					{
						tex[0]=texRow[0]; tex[1]=texRow[1]; tex[2]=texRow[2];
						for(var ix = x; ix < xq; ix++)
						{
                   var offset=(iy*width+ix)<<2;
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
          var xq=Math.min(x+q,width);
					for(var iy = y; iy < y + q; iy++)
					{
						var CX1 = CY1;
						var CX2 = CY2;
						var CX3 = CY3;
						tex[0]=texRow[0]; tex[1]=texRow[1]; tex[2]=texRow[2];
						for(var ix = x; ix < xq; ix++)
						{
							if(CX1 > 0 && CX2 > 0 && CX3 > 0)
							{
                   var offset=(iy*width+ix)<<2;
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
  }

/** @private */
// Based on public domain code by David Oberhollenzer
// (https://github.com/AgentD/swrast)
Scene3D.prototype._getTriangle=function(A, B, C) {
    var A, B, C;
    /* clipping */
    if( A[1]>this.height && B[1]>this.height && C[1]>this.height ){
        return null;
    }
    if( A[0]>this.width && B[0]>this.width && C[0]>this.width){
        return null;
    }
    if( A[1]<0 && B[1]<0 && C[1]<0 )
        return null;
    if( A[0]<0 && B[0]<0 && C[0]<0 )
        return null;
    var area = ((C[0] - A[0]) * (C[1] - B[1]) - (C[1] - A[1]) * (C[0] - B[0]));
    var culled=area==0 || (this._cullFace!=Scene3D.NONE &&
        ((area<0 && this._cullFace!=this._frontFace) ||
        (area>0 && this._cullFace==this._frontFace)));
    if(culled){
        return null;
    }
    var tri=new Scene3D._Triangle(A,B,C)
    return (tri.valid) ? tri : null;
}

Scene3D.prototype.makeShape=function(mesh){
 var buffer=mesh;
 return new Shape(buffer);
}
/** @private */
Scene3D.prototype._renderInner=function(){
  var data={}
  data.projview=GLMath.mat4multiply(
   this._projectionMatrix,this._viewMatrix)
  var cc=[
   Math.floor(this.clearColor[0]*255),
   Math.floor(this.clearColor[1]*255),
   Math.floor(this.clearColor[2]*255),
   Math.floor(this.clearColor[3]*255)];
  if(Uint8Array)cc=new Uint8Array(cc);
  if(!this.imgdata || this.imgdataWidth!=this.width || this.imgdataHeight!=this.height){
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
      this._depth=[]
  }
  size=this.width*this.height;
    for(var i=0;i<size;i++){
      this._depth[i]=32767;
    }
  for(var i=0;i<this.shapes.length;i++){
   this._renderShape(this.shapes[i],data);
  }
  this.context.putImageData(data.imgdata,0,0);
  return this;
}
Scene3D._drawPoint=function(data,depth,x,y,z,width,height,rgb){
if(x<0 || x>=width || y<0 || y>=height)return;
      var dep=Math.floor(z*32767.0)|0;
      var offset=y*width+x;
      if(dep<=depth[offset] && dep>=-32768){
       depth[offset]=dep;
       offset<<=2;
       data[offset]=rgb[0];
       data[offset+1]=rgb[1];
       data[offset+2]=rgb[2];
       data[offset+3]=0xFF;
      }
}
Scene3D._drawPoint2=function(data,depth,x,y,z,width,height,rgb){
if(x<0 || x>=width || y<0 || y>=height)return;
      var dep=z>>8;
      var offset=y*width+x;
      if(dep<=depth[offset] && dep>=-32768){
       depth[offset]=dep;
       offset<<=2;
       data[offset]=rgb[0]>>8;
       data[offset+1]=rgb[1]>>8;
       data[offset+2]=rgb[2]>>8;
       data[offset+3]=0xFF;
      }
}
Scene3D._drawLine=function(data,depth,x,y,z,x2,y2,z2,width,height,rgb,rgb2){
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
var depth1=(Math.floor(z*32767.0)|0)<<8;
var depth2=(Math.floor(z2*32767.0)|0)<<8;
var interprgb=[rgb[0]<<8,rgb[1]<<8,rgb[2]<<8];
var dydy=dy+dy;
var dxdx=dx+dx;
if(dy>dx){
      var e = dxdx - dy;
      var ddepth=(dy==0 || depth2-depth1) ? 0 : (depth2-depth1)/dy|0;
      var sr=(dy==0 || rgb2[0]==rgb[0]) ? 0 : ((rgb2[0]-rgb[0])<<8)/dy|0;
      var sg=(dy==0 || rgb2[1]==rgb[1]) ? 0 : ((rgb2[1]-rgb[1])<<8)/dy|0;
      var sb=(dy==0 || rgb2[2]==rgb[2]) ? 0 : ((rgb2[2]-rgb[2])<<8)/dy|0;
      for(var i = 0; i < dy; i++){
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
      var e = dydy - dx;
      var ddepth=(dx==0 || depth2-depth1) ? 0 : (depth2-depth1)/dx|0;
      var sr=(dx==0 || rgb2[0]==rgb[0]) ? 0 : ((rgb2[0]-rgb[0])<<8)/dx|0;
      var sg=(dx==0 || rgb2[1]==rgb[1]) ? 0 : ((rgb2[1]-rgb[1])<<8)/dx|0;
      var sb=(dx==0 || rgb2[2]==rgb[2]) ? 0 : ((rgb2[2]-rgb[2])<<8)/dx|0;
      for(var i = 0; i < dx; i++){
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
}

/** @private */
Scene3D._perspectiveTransform=function(mat,pt){
 var x=pt[0];
 var y=pt[1];
 var z=pt[2];
 pt[0]=x * mat[0] + y * mat[4] + z * mat[8] + mat[12];
 pt[1]=x * mat[1] + y * mat[5] + z * mat[9] + mat[13];
 pt[2]=x * mat[2] + y * mat[6] + z * mat[10] + mat[14];
 var w=x * mat[3] + y * mat[7] + z * mat[11] + mat[15];
 if(w!=1){
  w=1.0/w;
  pt[0]*=w;
  pt[1]*=w;
  pt[2]*=w;
 }
}
/** @private */
Scene3D.prototype._renderShape=function(shape,data){
 if(shape.constructor==ShapeGroup){
  for(var i=0;i<shape.shapes.length;i++){
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
   var colorValue=null;
   for(var i=0;i<mesh.subMeshes.length;i++){
    var subMesh=mesh.subMeshes[i];
    var colorOffset=Mesh.colorOffset(subMesh.attributeBits);
    var stride=subMesh.getStride();
    var prim=subMesh.primitiveType();
    if(colorOffset<0 && shape.material && shape.material.diffuse && !colorValue){
     colorValue=[
      Math.floor(shape.material.diffuse[0]*255.0),
      Math.floor(shape.material.diffuse[1]*255.0),
      Math.floor(shape.material.diffuse[2]*255.0)];
    }
    if(prim==Mesh.TRIANGLES){
     var v=subMesh.vertices
     if(this._cullFace==Scene3D.FRONT_AND_BACK)continue;
     for(var i=0;i<subMesh.indices.length;i+=3){
      var index1=subMesh.indices[i]*stride;
      var index2=subMesh.indices[i+1]*stride;
      var index3=subMesh.indices[i+2]*stride;
      for(var j=0;j<stride;j++){
       v1[j]=v[index1+j];
       v2[j]=v[index2+j];
       v3[j]=v[index3+j];
      }
      Scene3D._perspectiveTransform(mvpMatrix,v1);
      Scene3D._perspectiveTransform(mvpMatrix,v2);
      Scene3D._perspectiveTransform(mvpMatrix,v3);
      v1[0]=v1[0]*w2+w2;
      v1[1]=v1[1]*-h2+h2;
      v2[0]=v2[0]*w2+w2;
      v2[1]=v2[1]*-h2+h2;
      v3[0]=v3[0]*w2+w2;
      v3[1]=v3[1]*-h2+h2;
      var tri=this._getTriangle(v1,v2,v3);
      if(tri){
       if(colorOffset>=0){
        for(var j=colorOffset;j<colorOffset+3;j++){
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
    } else if(prim==Mesh.LINES){
     var v=subMesh.vertices
     for(var i=0;i<subMesh.indices.length;i+=2){
      var index1=subMesh.indices[i]*stride;
      var index2=subMesh.indices[i+1]*stride;
      for(var j=0;j<stride;j++){
       v1[j]=v[index1+j];
       v2[j]=v[index2+j];
      }
      Scene3D._perspectiveTransform(mvpMatrix,v1);
      Scene3D._perspectiveTransform(mvpMatrix,v2);
      v1[0]=v1[0]*w2+w2;
      v1[1]=v1[1]*-h2+h2;
      v2[0]=v2[0]*w2+w2;
      v2[1]=v2[1]*-h2+h2;
      var x=Math.round(v1[0])|0;
      var y=Math.round(v1[1])|0;
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

    } else if(prim==Mesh.POINTS){
     var v=subMesh.vertices
     for(var i=0;i<subMesh.indices.length;i++){
      var index1=subMesh.indices[i]*stride;
      for(var j=0;j<stride;j++){
       v1[j]=v[index1+j];
      }
      Scene3D._perspectiveTransform(mvpMatrix,v1);
      v1[0]=v1[0]*w2+w2;
      v1[1]=v1[1]*-h2+h2;
      var x=Math.round(v1[0])|0;
      var y=Math.round(v1[1])|0;
       if(colorOffset>=0){
        if(i<20)console.log(v1[colorOffset])
       Scene3D._drawPoint(data.imgdata.data,this._depth,
         x,y,v1[2],this.width,this.height,[
          Math.floor(v1[colorOffset]*255)|0,
          Math.floor(v1[colorOffset+1]*255)|0,
          Math.floor(v1[colorOffset+2]*255)|0
         ]);
        } else {
       Scene3D._drawPoint(data.imgdata.data,this._depth,
         x,y,v1[2],this.width,this.height,colorValue);
        }
     }
    }
   }
 }
}
