/*
Written by Peter O. in 2015.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://upokecenter.dreamhosters.com/articles/donate-now-2/
*/
(function(window){
var CanvasBackground=function(color){
  "use strict";
  color=color||"#ff0000";
  this.width=1000;
  this.height=1000;
  var canvas=$("<canvas>")["attr"]("width",this.width+"")["attr"](
    "height",this.height+"")["css"]({
          "width":"100%",
          "height":"100%",
          "left":"0px",
          "zIndex":-1,
          "top":"0px",
         "position":"fixed"});
  $("body").append(canvas);
  this.use3d=true;
  this.count=0;
  var canvasElement=canvas.get(0);
  this.context=GLUtil.get3DOr2DContext(canvasElement);
  this.use3d=GLUtil.is3DContext(this.context);
  this.shapes=[]
  this["setColor"](color);
}
CanvasBackground.varyColor=function(n){
 var newHue=(n[0]-7.5)+CanvasBackground.rand(15);
 if(newHue>=360)newHue=360-newHue;
 else if(newHue<0)newHue=360+newHue;
 var oldLum=n[1];
 var newLum=oldLum;
 if(newLum<=15){
  newLum=CanvasBackground.rand(30);
 } else if(newLum>255-15){
  newLum=(255-15)+CanvasBackground.rand(30);
 } else {
  newLum=(newLum-15)+CanvasBackground.rand(30);
 }
 var oldSat=n[2];
 var newSat=oldSat;
 if(newSat<=15){
  newSat=CanvasBackground.rand(30);
 } else if(newSat>255-15){
  newSat=(255-15)+CanvasBackground.rand(30);
 } else {
  newSat=(newSat)+CanvasBackground.rand(30);
 }
 if(oldSat>0 && newLum>0 && newLum<255){
  // Avoid all-gray color variations if original color
  // is not grayscale
  if(newLum<=25)
   newLum=25;
  if(newLum>=242)
   newLum=242;
  if(oldSat<=25)
   oldSat=25;
 }
 return [newHue,newLum,newSat]
};
CanvasBackground.rand=function(n){
"use strict";
 return (Math.random()*n)|0;
};
CanvasBackground.rgb2hls=function(rgb){
  var r=rgb[0];
  var g=rgb[1];
  var b=rgb[2];
  var vmax=r;
  if (g > vmax) vmax=g;
  if (b > vmax) vmax=b;
  var vmin=r;
  if (g<vmin) vmin=g;
  if (b<vmin) vmin=b;
  var vadd=(vmax+vmin);
  var lt=vadd/2.0;
  if (vmax===vmin){
   return [0,(lt<0 ? 0 : (lt>255 ? 255 : lt)),0];
  }
  var vd=(vmax-vmin);
   var divisor=(lt<=127.5)?vadd:510-vadd;
   var s=((vd*255)/divisor);
  var h=0;
   var hvd=vd/2;
   if (r === vmax){
    h=(((vmax-b)*60)+hvd)/vd;
    h-=(((vmax-g)*60)+hvd)/vd;
   } else if (b === vmax){
    h=240+(((vmax-g)*60)+hvd)/vd ;
    h-=(((vmax-r)*60)+hvd)/vd ;
   } else {
    h=120+(((vmax-r)*60)+hvd)/vd;
    h-=(((vmax-b)*60)+hvd)/vd;
   }
   if(h<0||h>=360)h=(((h%360)+360)%360);
  return [h,(lt<0 ? 0 : (lt>255 ? 255 : lt)),(s<0 ? 0 : (s>255 ? 255 : s))];
 };
CanvasBackground.hls2rgb=function(hls) {
"use strict";
 var hueval=hls[0]*1.0;//[0-360)
 var lum=hls[1]*1.0;//[0-255]
 var sat=hls[2]*1.0;//[0-255]
 lum=(lum<0 ? 0 : (lum>255 ? 255 : lum));
 sat=(sat<0 ? 0 : (sat>255 ? 255 : sat));
 if(sat===0){
  return [lum,lum,lum];
 }
 var b=0;
 if (lum<=127.5){
  b=(lum*(255.0+sat))/255.0;
 } else {
  b=lum*sat;
  b=b/255.0;
  b=lum+sat-b;
 }
 var a=(lum*2)-b;
 var r,g,bl;
 if(hueval<0||hueval>=360)hueval=(((hueval%360)+360)%360);
 var hue=hueval+120;
 if(hue>=360)hue-=360;
 if (hue<60) r=(a+(b-a)*hue/60);
 else if (hue<180) r=b;
 else if (hue<240) r=(a+(b-a)*(240-hue)/60);
 else r=a;
 hue=hueval;
 if (hue<60) g=(a+(b-a)*hue/60);
 else if (hue<180) g=b;
 else if (hue<240) g=(a+(b-a)*(240-hue)/60);
 else g=a;
 hue=hueval-120;
 if(hue<0)hue+=360;
 if (hue<60) bl=(a+(b-a)*hue/60);
 else if (hue<180) bl=b;
 else if (hue<240) bl=(a+(b-a)*(240-hue)/60);
 else bl=a;
 return [(r<0 ? 0 : (r>255 ? 255 : r)),
 (g<0 ? 0 : (g>255 ? 255 : g)),
 (bl<0 ? 0 : (bl>255 ? 255 : bl))];
};
CanvasBackground.component2hex=function(n){
 var str="0"+(n|0).toString(16);
 return str.substring(str.length-2,str.length);
};
CanvasBackground.hls2hex=function(n){
 n=CanvasBackground.hls2rgb(n);
 return "#"+CanvasBackground.component2hex(n[0])+
 CanvasBackground.component2hex(n[1])+
 CanvasBackground.component2hex(n[2]);
};
CanvasBackground.prototype.start=function(){
 GLUtil.renderLoop(this.animate.bind(this));
}
CanvasBackground.prototype["setColor"]=function(color){
 var rgb=GLUtil["toGLColor"](color)
 if(!rgb)throw new Error("invalid color parameter");
 this.color=[rgb[0]*255,rgb[1]*255,rgb[2]*255];
 this.hls=this.constructor.rgb2hls(this.color);
 this.drawBack();
}

CanvasBackground.prototype.drawBack=function(){
 document.body.style.backgroundColor=this.constructor.hls2hex(this.hls);
 if(this.use3d){
  var rgb=this.constructor.hls2rgb(this.hls);
  this.scene=new Scene3D(this.context)
    .setDirectionalLight(0, [0,0,-1])
    .setClearColor(rgb[0]/255.0,rgb[1]/255.0,rgb[2]/255.0, 1.0);
  this.cubeMesh=this.scene.makeShape(Meshes.createBox(2,2,2));
  this.sphereMesh=this.scene.makeShape(Meshes.createSphere());
  this.torusMesh=this.scene.makeShape(Meshes.createTorus(0.5,1));
  this.cylinderMesh=this.scene.makeShape(Meshes.createClosedCylinder(1,1,2));
 } else {
  this.context.fillStyle=this.constructor.hls2hex(this.hls);
  this.context.fillRect(0,0,this.width,this.height);
 }
}
CanvasBackground.prototype.animate=function(){
 this.count++;
  if(this.count>=4){
   this.count=0;
   this.drawOne();
  }
  if(this.use3d){
   this.scene.render();
  }
}
CanvasBackground.prototype.drawOne=function(){
 var newhls=this.constructor.varyColor(this.hls);
 if(this.use3d){
  if(this.shapes.length>300){
   // Delete the oldest shape generated
   this.scene.shapes.shift();
  }
  var x=(this.constructor.rand(2000)/1000.0)-1.0;
  var y=(this.constructor.rand(2000)/1000.0)-1.0;
  var z=(this.constructor.rand(60))/60.0;
  var mesh=[this.cubeMesh,this.sphereMesh,
    this.torusMesh,this.cylinderMesh][this.constructor.rand(4)];
  var radius=(16+this.constructor.rand(100))/1000.0;
  var rgb=this.constructor.hls2rgb(newhls);
  rgb[0]/=255
  rgb[1]/=255
  rgb[2]/=255
   var angle=this.constructor.rand(160);
   var vector=GLMath.quatFromEuler(
     (this.constructor.rand(360)),
     (this.constructor.rand(360)),
     (this.constructor.rand(360)));
   var shape=mesh.copy()
    .setScale(radius,radius,radius)
    .setQuaternion(vector)
    .setPosition(x,y,z)
    .setColor(rgb);
   this.scene.addShape(shape);
 } else {
  var rect=[this.constructor.rand(this.width+30)-30,
    this.constructor.rand(this.height+30)-30,
    32+this.constructor.rand(200),
    32+this.constructor.rand(200)];
  this.context.fillStyle=this.constructor.hls2hex(newhls);
  this.context.fillRect(rect[0],rect[1],rect[2],rect[3]);
 }
};
CanvasBackground["colorBackground"]=function(color){
$(document).ready(function(){
 var canvas=new CanvasBackground(color);
 canvas.start();
});
};
window["CanvasBackground"]=CanvasBackground;
})(this);
