/*
Written by Peter O. in 2015.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://peteroupc.github.io/
*/
/* global H3DU */

////////////////////////////////////////////

function InputTracker(element){
 "use strict";
 this.leftButton=false;
 this.rightButton=false;
 this.middleButton=false;
 this.keys={};
 this.lastClient=[];
 this.clientX=null;
 this.clientY=null;
 this.element=element;
 this.mouseWheelCallback=null;
 var that=this;
 this.handlers=[];
 var addHandler=function(h,a,b,c){
  h.push([a,b,c]);
  a.addEventListener(b,c);
 };
 if(element){
 addHandler(this.handlers,window,"blur",function(){
  that.leftButton=false;
  that.rightButton=false;
  that.keys={};
 });
 addHandler(this.handlers,document,"keydown",function(e){
  that.keys[e.keyCode]=true;
 });
 addHandler(this.handlers,document,"keyup",function(e){
  delete that.keys[e.keyCode];
 });
 var mouseWheelFunc=function(tracker, e, click){
  var clientX=e.clientX-InputTracker._getPageX(e.target);
  var clientY=e.clientY-InputTracker._getPageY(e.target);
  var delta=0;
  if (e.wheelDelta){
    delta=e.wheelDelta;
  } else if (e.detail){
    delta=e.detail * -40;
  } else if (e.originalEvent && e.originalEvent.wheelDelta){
    delta=e.originalEvent.wheelDelta;
  }
  // delta of 120 represents 1 tick of the mouse wheel;
  // positive values mean moving the mouse wheel up,
  // negative values mean down
  if(tracker.mouseWheelCallback) {
   tracker.mouseWheelCallback({
"target":e.target,
     "delta":delta,
     "click":click,
     "x":clientX,
     "y":clientY
});
    e.preventDefault();
   }
 };
 var mouseEvent=function(tracker,e){
  if(e.button === 0){
   tracker.leftButton=e.isDown;
  }
  if(e.button === 1){
   tracker.middleButton=e.isDown;
  }
  if(e.button === 2){
   tracker.rightButton=e.isDown;
  }
  if(e.button === 0 && e.touch && !e.isDown){
   tracker.clientX=null;
   tracker.clientY=null;
   tracker.lastClient=[];
  } else {
   tracker.clientX=e.clientX-InputTracker._getPageX(e.target);
   tracker.clientY=e.clientY-InputTracker._getPageY(e.target);
   if(e.button!==-1){
    // update mouse position to current click position
    tracker.lastClient[0]=tracker.clientX;
    tracker.lastClient[1]=tracker.clientY;
   }
  }
 };
 addHandler(this.handlers,element,"mousedown",function(e){
  mouseEvent(that,{
"target":e.target,
"isDown":true,
"button":e.button,
    "clientX":e.clientX,
"clientY":e.clientY
});
 });
 addHandler(this.handlers,element,"touchstart",function(e){
  mouseEvent(that,{
"target":e.target,
"isDown":true,
"button":0,
    "clientX":e.touches[0].clientX,
"clientY":e.touches[0].clientY,
"touch":true
});
 });
 addHandler(this.handlers,element,"mouseup",function(e){
  mouseEvent(that,{
"target":e.target,
"isDown":false,
"button":e.button,
    "clientX":e.clientX,
"clientY":e.clientY
});
 });
 addHandler(this.handlers,element,"touchend",function(e){
  mouseEvent(that,{
"target":e.target,
"isDown":false,
"button":0,
    "clientX":e.changedTouches[0].clientX,
"clientY":e.changedTouches[0].clientY,
"touch":true
});
 });
 addHandler(this.handlers,element,"mousemove",function(e){
  mouseEvent(that,{
"target":e.target,
"isDown":false,
"button":-1,
    "clientX":e.clientX,
"clientY":e.clientY
});
 });
 addHandler(this.handlers,element,"touchmove",function(e){
  mouseEvent(that,{
"target":e.target,
"isDown":false,
"button":-1,
    "clientX":e.touches[0].clientX,
"clientY":e.touches[0].clientY,
"touch":true
});
 });
 var evt=("mousewheel" in element) ? "mousewheel" : "DOMMouseScroll";
 addHandler(this.handlers,element,evt,function(e,click){
  mouseWheelFunc(that,e,click);
 });
 }
}
/**
 * Not documented yet.
 * @memberof! InputTracker#
*/
InputTracker.prototype.dispose=function(){
 "use strict";
for(var i=0;i<this.handlers.length;i++){
  var h=this.handlers[i];
  h[0].removeEventListener(h[1],h[2]);
 }
 this.handlers=[];
 this.element=null;
 this.mouseWheelCallback=null;
 this.keys={};
 this.clientX=null;
 this.clientY=null;
 this.lastClient=[];
};

/**
 * Not documented yet.
 * @param {*} func
 * @memberof! InputTracker#
*/
InputTracker.prototype.mousewheel=function(func){
 "use strict";
 this.mouseWheelCallback=func;
};

/** @private */
InputTracker._getPageX=function(o) {
 "use strict";
  var x=0;
  while(o!==null && typeof o!=="undefined") {
   if(typeof o.offsetLeft!=="undefined")
    x+=o.offsetLeft;
   o=o.offsetParent;
  }
 return x;
};
/** @private */
InputTracker._getPageY=function(o) {
 "use strict";
  var x=0;
  while(o!==null && typeof o!=="undefined") {
   if(typeof o.offsetTop!=="undefined")
    x+=o.offsetTop;
   o=o.offsetParent;
  }
  return x;
};
InputTracker.A=65;
InputTracker.ZERO=48;
InputTracker.RETURN=10;
InputTracker.ENTER=13;
InputTracker.TAB=9;
InputTracker.SHIFT=16;
InputTracker.CTRL=17;
InputTracker.ALT=18;
InputTracker.ESC=27;
InputTracker.SPACE=32;
InputTracker.PAGEUP=33;
InputTracker.PAGEDOWN=34;
InputTracker.END=35;
InputTracker.HOME=36;
InputTracker.LEFT=37;
InputTracker.UP=38;
InputTracker.RIGHT=39;
InputTracker.DOWN=40;
InputTracker.DELETE=46;
InputTracker.ADD=107;
InputTracker.SUBTRACT=109;
/**
 * Not documented yet.
 * @memberof! InputTracker#
*/
InputTracker.prototype.deltaXY=function(){
 "use strict";
var deltaX=0;
 var deltaY=0;
 if(this.clientX === null || this.clientY === null){
  return {
"x":0,
"y":0,
"cx":0,
"cy":0
};
 }
 deltaX=(this.lastClient.length === 0) ? 0 :
   this.clientX-this.lastClient[0];
 deltaY=(this.lastClient.length === 0) ? 0 :
   this.clientY-this.lastClient[1];
 this.lastClient[0]=this.clientX;
 this.lastClient[1]=this.clientY;
 return {
"x":deltaX,
"y":deltaY,
   "cx":this.clientX,
"cy":this.clientY
};
};

//////////////////////////////////////////////////////

/**
* A class for controlling the projection and
* view of a 3D scene, in the nature of an abstract "camera".
* <p>This class is considered a supplementary class to the
* Public Domain HTML 3D Library and is not considered part of that
* library. <p>
* To use this class, you must include the script "extras/camera.js"; the
 * class is not included in the "h3du_min.js" file which makes up
 * the HTML 3D Library.  Example:<pre>
 * &lt;script type="text/javascript" src="extras/camera.js">&lt;/script></pre>
* @class
* @alias Camera
* @param {*} scene A 3D scene to associate with this
* camera object.
* @param {*}  fov Vertical field of view, in degrees. Should be less
* than 180 degrees. (The smaller
* this number, the bigger close objects appear to be.)
* @param {*} near The distance from the camera to
* the near clipping plane. Objects closer than this distance won't be
* seen. This should be slightly greater than 0.
* @param {*}  far The distance from the camera to
* the far clipping plane. Objects beyond this distance will be too far
* to be seen.
* @param {*} [canvas] A canvas to associate with this
* camera object.
*/
function Camera(sub, fov, nearZ, farZ, canvas){
 "use strict";
 if(nearZ<=0)throw new Error("invalid nearZ");
 this.near=nearZ;
 this.persp=new Camera._Perspective(sub,fov,nearZ,farZ);
 this.rotation=H3DU.Math.quatIdentity();
 this.dolly=H3DU.Math.quatIdentity();
 this.position=[0,0,0];
 this.center=[0,0,0];
 this.scene=sub;
 this.trackballMode=true;
 this._updateView();
 if(!canvas)canvas=this.scene.getCanvas();
 this.input=new InputTracker(canvas);
 this.input.mousewheel(this._mousewheel.bind(this));
}

/** @private */
Camera._Perspective=function(scene, fov, nearZ, farZ){
 "use strict";
if(nearZ<=0)throw new Error("invalid nearZ");
 this.fov=fov;
 this.scene=scene;
 this.near=nearZ;
 this.far=farZ;
 if(this.scene instanceof H3DU.Scene3D){
   this.currentAspect=this.scene.getClientAspect();
   this.scene.setPerspective(this.fov,this.currentAspect,this.near,this.far);
 } else {
   this.scene.perspectiveAspect(this.fov,this.near,this.far);
 }
};
/** @private */
Camera._Perspective.prototype.update=function(){
 "use strict";
 if(this.scene instanceof H3DU.Scene3D){
  var aspect=this.scene.getClientAspect();
  if(aspect!==this.currentAspect){
   this.currentAspect=aspect;
   this.scene.setPerspective(this.fov,this.currentAspect,this.near,this.far);
  }
 } else {
   this.scene.perspectiveAspect(this.fov,this.near,this.far);
 }
};
/** @private */
Camera._normAsVec4=function(x,y,z) {
"use strict";

var len=x*x+y*y+z*z;
 if(len===1){
  return [x,y,z,1];
 } else {
  var n=H3DU.Math.vec3normInPlace([x,y,z]);
  return [n[0],n[1],n[2],1];
 }
};
/** @private */
Camera._quatRotateRelative=function(quat, angle, x, y, z) {
"use strict";
 // Rotate quaternion about a relative axis

var vec=Camera._normAsVec4(x,y,z);
 var q=H3DU.Math.quatRotate(quat,angle,vec);
 q=H3DU.Math.quatMultiply(H3DU.Math.quatFromAxisAngle(angle,vec),quat);
 H3DU.Math.vec4assign(quat,q);
};
/** @private */
Camera._quatRotateFixed=function(quat, angle, x, y, z) {
"use strict";
 // Rotate quaternion about a fixed axis

var vec=Camera._normAsVec4(x,y,z);
 var q=H3DU.Math.quatRotate(quat,angle,vec);
 q=H3DU.Math.quatMultiply(quat,H3DU.Math.quatFromAxisAngle(angle,vec));
 H3DU.Math.vec4assign(quat,q);
};
/** @private */
Camera._moveRelative=function(vec, quat, dist, x, y, z){
 "use strict";
var velocity=Camera._normAsVec4(x,y,z);
 H3DU.Math.vec3scaleInPlace(velocity,dist);
 vec[0]+=velocity[0]; vec[1]+=velocity[1]; vec[2]+=velocity[2];
};
/** @private */
Camera._moveTrans=function(vec,quat,dist,x,y,z){
 "use strict";
var velocity=Camera._normAsVec4(x,y,z);
 velocity=H3DU.Math.quatTransform(
   H3DU.Math.quatConjugate(quat),velocity);
 H3DU.Math.vec3scaleInPlace(velocity,dist);
 vec[0]+=velocity[0]; vec[1]+=velocity[1]; vec[2]+=velocity[2];
};
/**
 * Not documented yet.
 *//** @private */
Camera.prototype._distance=function(){
 "use strict";
var rel=H3DU.Math.vec3sub(this.position,this.center);
 return H3DU.Math.vec3length(rel);
};
/** @private */
Camera.prototype._getView=function(){
 "use strict";
var mat=H3DU.Math.quatToMat4(this.rotation);
 var mat2=H3DU.Math.mat4translated(-this.position[0],
  -this.position[1],-this.position[2]);
 mat=H3DU.Math.mat4multiply(mat2,mat);
 mat=H3DU.Math.mat4translate(mat,-this.center[0],
  -this.center[1],-this.center[2]);
 return mat;
};

/** @private */
Camera.prototype._updateView=function(){
 "use strict";
this.scene.setViewMatrix(this._getView());
 return this;
};
/**
 * Not documented yet.
 * @param {*} dist
 * @memberof! Camera#
*/
Camera.prototype.setDistance=function(dist) {
"use strict";
 // don't move closer than the near plane

dist=Math.max(this.near,dist);
 var currentDist=this._distance();
 var relDist=currentDist-dist;
 this.moveForward(relDist);
 return this;
};

/** @private */
Camera.prototype._orbit=function(deltaMouseX,deltaMouseY,angleMultiplier){
  "use strict";
var x=deltaMouseX*angleMultiplier;
  var y=deltaMouseY*angleMultiplier;
  var vec=H3DU.Math.quatTransform(
    H3DU.Math.quatConjugate(this.dolly),Camera._normAsVec4(0,0,1));
  var lat=Math.atan2(Math.sqrt(vec[2]*vec[2]+vec[0]*vec[0]),vec[1]);

  y=y*H3DU.Math.PiDividedBy180;
  lat-=y;
  var pi2=Math.PI-0.00001;
  if(lat<0.00001){
   y-=(0.00001-lat);
   lat=0.00001;
  } else if(lat>pi2){
   y+=lat-pi2;
   lat=pi2;
  }
  this.moveAngleVertical(y*H3DU.Math.Num180DividedByPi);
  this._moveAngleFixedHorizontal(x);
};

/** @private */
Camera.prototype._trackball=function(deltaMouseX,deltaMouseY,angleMultiplier){
  "use strict";
var x=deltaMouseX*angleMultiplier;
  var y=deltaMouseY*angleMultiplier;
  this.moveAngleHorizontal(x);
  this.moveAngleVertical(y);
};
/** @private */
Camera.prototype._move=function(deltaMouseX,deltaMouseY,multiplier){
  "use strict";
var x=deltaMouseX*multiplier;
  var y=deltaMouseY*multiplier;
  this.moveCenterHorizontal(x);
  this.moveCenterVertical(y);
};
/** @private */
Camera.prototype._moveAngleFixedHorizontal=function(angleDegrees){
 "use strict";
if(angleDegrees!==0){
  Camera._quatRotateFixed(this.dolly,angleDegrees,0,1,0);
  Camera._quatRotateFixed(this.rotation,angleDegrees,0,1,0);
  this._updateView();
 }
 return this;
};
/** @private */
Camera.prototype._moveAngleFixedVertical=function(angleDegrees){
 "use strict";
if(angleDegrees!==0){
  Camera._quatRotateFixed(this.dolly,angleDegrees,1,0,0);
  Camera._quatRotateFixed(this.rotation,angleDegrees,1,0,0);
  this._updateView();
 }
 return this;
};
/**
 * Not documented yet.
 * @param {*} angleDegrees
 * @memberof! Camera#
*/
Camera.prototype.moveAngleVertical=function(angleDegrees){
 "use strict";
if(angleDegrees!==0){
  Camera._quatRotateRelative(this.dolly,angleDegrees,1,0,0);
  Camera._quatRotateRelative(this.rotation,angleDegrees,1,0,0);
  this._updateView();
 }
 return this;
};
/**
 * Not documented yet.
 * @param {*} angleDegrees
 * @memberof! Camera#
*/
Camera.prototype.moveAngleHorizontal=function(angleDegrees){
 "use strict";
if(angleDegrees!==0){
  Camera._quatRotateRelative(this.dolly,angleDegrees,0,1,0);
  Camera._quatRotateRelative(this.rotation,angleDegrees,0,1,0);
  this._updateView();
 }
 return this;
};
/**
 * Not documented yet.
 * @param {*} angleDegrees
 * @memberof! Camera#
*/
Camera.prototype.turnVertical=function(angleDegrees){
 "use strict";
if(angleDegrees!==0){
  var curDist=this._distance();
  Camera._quatRotateRelative(this.dolly,angleDegrees,1,0,0);
  Camera._quatRotateRelative(this.rotation,angleDegrees,1,0,0);
  this.position[0]=this.center[0]; this.position[1]=this.center[1]; this.position[2]=this.center[2];
  this.moveForward(-curDist);
 }
 return this;
};
/** @deprecated * @memberof! Camera#
*/
Camera.prototype.turnHorizontal=function(angleDegrees){
 "use strict";
if(angleDegrees!==0){
  var curDist=this._distance();
  Camera._quatRotateRelative(this.dolly,angleDegrees,0,1,0);
  Camera._quatRotateRelative(this.rotation,angleDegrees,0,1,0);
  this.position[0]=this.center[0]; this.position[1]=this.center[1]; this.position[2]=this.center[2];
  this.moveForward(-curDist);
 }
 return this;
};
/**
 * Not documented yet.
 * @param {*} cx
 * @param {*} cy
 * @param {*} cz
 * @memberof! Camera#
*/
Camera.prototype.movePosition=function(cx,cy,cz){
 "use strict";
this.position[0]=cx;
 this.position[1]=cy;
 this.position[2]=cz;
 this._updateView();
 return this;
};
/**
 * Not documented yet.
 * @param {*} dist
 * @memberof! Camera#
*/
Camera.prototype.moveClose=function(dist){
 "use strict";
return this.setDistance(this._distance()-dist);
};
/**
 * Not documented yet.
 * @param {*} dist
 * @memberof! Camera#
*/
Camera.prototype.moveForward=function(dist){
 "use strict";
if(dist!==0){
  Camera._moveRelative(this.position,this.dolly,dist,0,0,-1);
  this._updateView();
 }
 return this;
};
/**
 * Not documented yet.
 * @param {*} dist
 * @memberof! Camera#
*/
Camera.prototype.moveCenterHorizontal=function(dist){
 "use strict";
if(dist!==0){
  Camera._moveTrans(this.center,this.dolly,dist,-1,0,0);
  this._updateView();
 }
 return this;
};
/**
 * Not documented yet.
 * @param {*} dist
 * @memberof! Camera#
*/
Camera.prototype.moveCenterVertical=function(dist){
 "use strict";
if(dist!==0){
  Camera._moveTrans(this.center,this.dolly,dist,0,1,0);
  this._updateView();
 }
 return this;
};
/**
 * Not documented yet.
 * @param {*} dist
 * @memberof! Camera#
*/
Camera.prototype.moveHorizontal=function(dist){
 "use strict";
if(dist!==0){
  Camera._moveTrans(this.position,this.dolly,dist,-1,0,0);
  this._updateView();
 }
 return this;
};
/**
 * Not documented yet.
 * @param {*} dist
 * @memberof! Camera#
*/
Camera.prototype.moveVertical=function(dist){
 "use strict";
if(dist!==0){
  Camera._moveTrans(this.position,this.dolly,dist,0,1,0);
  this._updateView();
 }
 return this;
};
/**
 * Not documented yet.
 * @param {*} e
 * @memberof! Camera#
*/
Camera.prototype.getPosition=function(){
  "use strict";
  // var view=this._getView();
  var pos=H3DU.Math.quatTransform(
    H3DU.Math.quatConjugate(this.rotation),
    [this.position[0],this.position[1],this.position[2],1]);
  pos[0]-=this.center[0]; pos[1]-=this.center[1]; pos[2]-=this.center[2];
  return pos;
};
/**
 * Not documented yet.
 * @memberof! Camera#
*/
Camera.prototype.getVectorFromCenter=function(){
  "use strict";
return H3DU.Math.vec3normInPlace(this.getPosition());
};

/** @private */
Camera.prototype._mousewheel=function(e){
 "use strict";
var ticks=e.delta/120.0;
 // mousewheel up (negative) means move forward,
 // mousewheel down (positive) means move back
 this.setDistance(this._distance()-0.6*ticks);
};

/**
 * Not documented yet.
 * @memberof! Camera#
*/
Camera.prototype.update=function(){
 "use strict";
var delta=this.input.deltaXY();
 if(this.input.leftButton){
  if(this.trackballMode){
   this._trackball(delta.x,delta.y,0.3);
  } else {
   this._orbit(delta.x,delta.y,0.3);
  }
 } else if(this.input.middleButton){
   this._move(delta.x,delta.y,0.3);
 }
 if(this.input.keys[InputTracker.A+22]){ // letter W
  this.setDistance(this._distance()+0.2);
 }
 if(this.input.keys[InputTracker.A+18]){ // letter S
  this.setDistance(this._distance()-0.2);
 }
 this.persp.update();
 return this;
};
///////////////////////////////////////////////////////////////
