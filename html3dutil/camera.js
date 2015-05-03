/** @private */
function OldCamera(scene, fov, nearZ, farZ){
 this.target=[0,0,0]; // target position
 this.distance=Math.max(nearZ,10); // distance from the target in units
 this.position=[0,0,this.distance];
 this.angleQuat=GLMath.quatIdentity();
 this.angleX=0;
 this.angleY=0;
 this.scene=scene;
 this.fov=fov;
 this.near=nearZ;
 this.far=farZ;
 if(typeof InputTracker!="undefined"){
  this.input=new InputTracker(scene.getContext().canvas);
 }
 this.currentAspect=this.scene.getAspect();
 this.scene.setPerspective(this.fov,this.currentAspect,this.near,this.far);
 this._updateLookAt();
}
/** @private */
OldCamera._vec3diff=function(a,b){
 return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
}
/** @deprecated */
OldCamera.prototype.moveAngleHorizontal=function(angleDegrees){
 if(angleDegrees!=0){
  this._angleHorizontal(-angleDegrees);
  this._resetPosition();
 }
 return this;
}
/** @private */
OldCamera.prototype._angleHorizontal=function(angleDegrees){
 var change=((angleDegrees>=0 && angleDegrees<360) ? angleDegrees : ((angleDegrees%360)+(angleDegrees<0 ? 360 : 0)))*GLMath.PiDividedBy180;
 this.angleY+=change;
 this.angleY=((this.angleY>=0 && this.angleY<GLMath.PiTimes2) ? this.angleY : ((this.angleY%GLMath.PiTimes2)+(this.angleY<0 ? GLMath.PiTimes2 : 0)))
 this.angleQuat=GLMath.quatMultiply(this.angleQuat,
   GLMath.quatFromAxisAngle(change*GLMath.Num180DividedByPi,0,1,0));
 GLMath.quatNormInPlace(this.angleQuat);
}
/** @private */
OldCamera.prototype._angleVertical=function(angleDegrees){
 var change=((angleDegrees>=0 && angleDegrees<360) ? angleDegrees : ((angleDegrees%360)+(angleDegrees<0 ? 360 : 0)))*GLMath.PiDividedBy180;
 this.angleX+=change;
 this.angleX=((this.angleX>=0 && this.angleX<GLMath.PiTimes2) ? this.angleX : ((this.angleX%GLMath.PiTimes2)+(this.angleX<0 ? GLMath.PiTimes2 : 0)))
 this.angleQuat=GLMath.quatMultiply(this.angleQuat,
   GLMath.quatFromAxisAngle(change*GLMath.Num180DividedByPi,1,0,0));
 GLMath.quatNormInPlace(this.angleQuat);
}
/** @deprecated */
OldCamera.prototype.moveAngleVertical=function(angleDegrees){
 if(angleDegrees!=0){
  this._angleVertical(-angleDegrees);
  this._resetPosition();
 }
 return this;
}
OldCamera.prototype.turnVertical=function(angleDegrees){
 if(angleDegrees!=0){
  var pos=this.getPosition();
  this._angleVertical(angleDegrees);
  this._resetTarget();
 }
 return this;
}
/** @private */
OldCamera.prototype._resetPosition=function(){
  var diff=OldCamera._vec3diff(this.target,this.position);
  var dist=GLMath.vec3length(diff);
  var newVector=GLMath.quatTransform(this.angleQuat,[0,0,-dist]);
  this.position[0]=this.target[0]-newVector[0];
  this.position[1]=this.target[1]-newVector[1];
  this.position[2]=this.target[2]-newVector[2];
  this._updateLookAt();
  this.setDistance(this.distance);
}
/** @private */
OldCamera.prototype._resetTarget=function(){
  var diff=OldCamera._vec3diff(this.target,this.position);
  var dist=GLMath.vec3length(diff);
  var newVector=GLMath.quatTransform(this.angleQuat,[0,0,-dist]);
  this.target[0]=this.position[0]+newVector[0];
  this.target[1]=this.position[1]+newVector[1];
  this.target[2]=this.position[2]+newVector[2];
  this._updateLookAt();
  this.setDistance(this.distance);
}
OldCamera.prototype.turnHorizontal=function(angleDegrees){
 if(angleDegrees!=0){
  var pos=this.getPosition();
  this._angleHorizontal(-angleDegrees);
  this._resetTarget();
 }
 return this;
}

/**
 * Not documented yet.
 * @param {*} dist
 */
OldCamera.prototype.setDistance=function(dist){
 if(dist<0)throw new Error("invalid distance")
 if(dist<this.near)dist=this.near;
 var diff=OldCamera._vec3diff(this.target,this.position);
 var curdist=GLMath.vec3length(diff);
 var distdiff=curdist-diff;
 this.distance=dist;
 if(distdiff!=0){
  var factor=dist/curdist;
  this.position[0]=this.target[0]-diff[0]*factor;
  this.position[1]=this.target[1]-diff[1]*factor;
  this.position[2]=this.target[2]-diff[2]*factor;
  this._updateLookAt();
 }
 return this;
}
OldCamera.prototype.movePosition=function(cx, cy, cz){
 if(cx!=0 && cy!=0 && cz!=0){
  var pos=this.getPosition();
  this.target[0]+=(cx-pos[0]);
  this.target[1]+=(cy-pos[1]);
  this.target[2]+=(cz-pos[2]);
  this.position=[cx,cy,cz];
 }
 return this;
}
/** @private */
OldCamera.prototype.moveForward=function(dist){
 if(dist!=0){
  var diff=OldCamera._vec3diff(this.target,this.position);
  var realDist=GLMath.vec3length(diff);
  var factor=dist/realDist;
  this.position[0]+=diff[0]*factor;
  this.position[1]+=diff[1]*factor;
  this.position[2]+=diff[2]*factor;
  this.target[0]+=diff[0]*factor;
  this.target[1]+=diff[1]*factor;
  this.target[2]+=diff[2]*factor;
  this._updateLookAt();
 }
 return this;
}
/** @private */
OldCamera.prototype._updateLookAt=function(){
 this.scene.setLookAt(this.getPosition(),this.target,
   GLMath.quatTransform(this.angleQuat,[0,1,0]));
}
/** @private */
OldCamera.prototype.getPosition=function(){
  return this.position.slice(0,3);
}

/**
* A class for controlling the projection and
* view of a 3D scene, in the nature of an abstract "camera".
* @class
* @alias Camera
* @param {glutil.Scene} A 3D scene to associate with this
* camera object.
* @param {number}  fov Vertical field of view, in degrees. Should be less
* than 180 degrees. (The smaller
* this number, the bigger close objects appear to be.)
* @param {number} near The distance from the camera to
* the near clipping plane. Objects closer than this distance won't be
* seen. This should be slightly greater than 0.
* @param {number}  far The distance from the camera to
* the far clipping plane. Objects beyond this distance will be too far
* to be seen.
*/
function Camera(scene, fov, nearZ, farZ){
 this.distance=Math.max(nearZ,10); // distance from the target in units
 this.position=[0,0,this.distance];
 this.inverseQuat=GLMath.quatIdentity();
 this.scene=scene;
 this.angleX=0;
 this.angleY=0;
 this.trackballMode=true;
 this.fov=fov;
 this.near=nearZ;
 this.far=farZ;
 // for backward compatibility only; will be removed
 this.oldcam=new OldCamera(scene,fov,nearZ,farZ);
 // for backward compatibility only; will be removed
 this.oldcam.input=null;
 // for backward compatibility only; will be removed
 this.calledOldcam=false;
 if(typeof InputTracker!="undefined"){
  this.input=new InputTracker(scene.getContext().canvas);
 }
 this.currentAspect=this.scene.getAspect();
 this.scene.setPerspective(this.fov,this.currentAspect,this.near,this.far);
 this._updateView();
 this.input.mousewheel(this.mousewheel.bind(this));
}
/** @private */
Camera.prototype._updateView=function(){
 var look=GLMath.mat4identity();
 look=GLMath.mat4multiply(look,
   GLMath.quatToMat4(this.inverseQuat));
 look=GLMath.mat4translate(look,
   this.position[0],this.position[1],this.position[2]);
 this.scene.setViewMatrix(GLMath.mat4invert(look));
 return this;
}
/**
 * Not documented yet.
 * @param {*} dist
 */
Camera.prototype.setDistance=function(dist){
 // don't move closer than the near plane
 if(this.calledOldcam){
  this.oldcam.setDistance(dist);
  return this;
 } else {
  this.distance=Math.max(this.near,dist);
  this.position=[0,0,this.distance]
  return this._updateView();
 }
}
/** @private */
Camera.prototype._orbit=function(deltaMouseX,deltaMouseY,angleMultiplier){
  var x=deltaMouseX
  var y=deltaMouseY
  this.angleX+=x*angleMultiplier;
  this.angleY+=y*angleMultiplier;
  this.angleX=((this.angleX>=0 && this.angleX<360) ? this.angleX :
     ((this.angleX%360)+(this.angleX<0 ? 360 : 0)));
  if(this.angleY>=89.99999)this.angleY=89.99999;
  if(this.angleY<=-89.99999)this.angleY=-89.99999;
  this.inverseQuat=GLMath.quatFromTaitBryan(
   this.angleY,this.angleX,0,GLMath.RollYawPitch);
  this.inverseQuat=GLMath.quatInverse(this.inverseQuat);
}
/** @private */
Camera.prototype._trackball=function(deltaMouseX,deltaMouseY,angleMultiplier){
  var x=deltaMouseX
  var y=deltaMouseY
  var n=x*x+y*y;
  if(n>0.0){
   n=Math.sqrt(n);
   var a=GLMath.vec3scaleInPlace([y,x,0],1.0/n);
   var rot=GLMath.quatFromAxisAngle(
     -n*angleMultiplier,a[0],a[1],a[2]);
   this.inverseQuat=GLMath.quatMultiply(this.inverseQuat,rot);
   GLMath.quatNormInPlace(this.inverseQuat);
  }
}
/** @deprecated */
Camera.prototype.moveAngleVertical=function(angleDegrees){
 this.calledOldcam=true;
 this.oldcam.moveAngleVertical(angleDegrees)
 this.position=this.oldcam.getPosition();
 return this;
}
/** @deprecated */
Camera.prototype.moveAngleHorizontal=function(angleDegrees){
 this.calledOldcam=true;
 this.oldcam.moveAngleHorizontal(angleDegrees)
 this.position=this.oldcam.getPosition();
 return this;
}
/** @deprecated */
Camera.prototype.turnVertical=function(angleDegrees){
 this.calledOldcam=true;
 this.oldcam.turnVertical(angleDegrees)
 this.position=this.oldcam.getPosition();
 return this;
}
/** @deprecated */
Camera.prototype.turnHorizontal=function(angleDegrees){
 this.calledOldcam=true;
 this.oldcam.turnHorizontal(angleDegrees)
 this.position=this.oldcam.getPosition();
 return this;
}
/** @deprecated */
Camera.prototype.movePosition=function(cx,cy,cz){
 this.calledOldcam=true;
 this.oldcam.movePosition(cx,cy,cz)
 this.position=this.oldcam.getPosition();
 return this;
}
Camera.prototype.moveClose=function(dist){
 return this.setDistance(this.distance-dist);
}
/** @deprecated */
Camera.prototype.moveForward=function(dist){
 this.calledOldcam=true;
 this.oldcam.moveForward(dist)
 this.position=this.oldcam.getPosition();
 return this;
}
/**
 * Not documented yet.
 * @param {*} e
 */
Camera.prototype.getPosition=function(){
  return this.position.slice(0,3);
}
/** @private */
Camera.prototype.mousewheel=function(e){
 var ticks=e.delta/120.0;
 // mousewheel up (negative) means move forward,
 // mousewheel down (positive) means move back
 this.setDistance(this.distance-0.6*ticks)
}
/**
 * Not documented yet.
 */
Camera.prototype.update=function(){
 var delta=this.input.deltaXY();
 if(this.input.leftButton){
  if(this.trackballMode){
   this._trackball(delta.x,delta.y,0.3);
  } else {
   this._orbit(delta.x,delta.y,0.3);
  }
 } else if(this.input.middleButton){
  this.setDistance(this.distance+0.2*delta.y)
 }
 if(this.input.keys[InputTracker.W]){
  this.setDistance(this.distance+0.2)
 }
 if(this.input.keys[InputTracker.S]){
  this.setDistance(this.distance-0.2)
 }
 var aspect=this.scene.getAspect();
 if(aspect!=this.currentAspect){
  this.currentAspect=aspect;
  this.scene.setPerspective(this.fov,this.currentAspect,this.near,this.far);
 }
 return this._updateView();
}
///////////////////////////////////////////////////////////////

function InputTracker(element){
 this.leftButton=false;
 this.rightButton=false;
 this.middleButton=false;
 this.keys={};
 this.lastClient=[];
 this.clientX=null;
 this.clientY=null;
 this.element=element;
 var thisObj=this;
 window.addEventListener("blur",function(e){
  thisObj.leftButton=false;
  thisObj.rightButton=false;
  thisObj.keys={};
 })
 document.addEventListener("keydown",function(e){
  thisObj.keys[e.keyCode]=true;
 })
 document.addEventListener("keyup",function(e){
  delete thisObj.keys[e.keyCode];
 })
 var mouseEvent=function(thisObj,e){
  if(e.button==0){
   thisObj.leftButton=e.isDown;
  }
  if(e.button==1){
   thisObj.middleButton=e.isDown;
  }
  if(e.button==2){
   thisObj.rightButton=e.isDown;
  }
  thisObj.clientX=e.clientX-InputTracker._getPageX(e.target);
  thisObj.clientY=e.clientY-InputTracker._getPageY(e.target);
 }
 element.addEventListener("mousedown",function(e){
  mouseEvent(thisObj,{"target":e.target,"isDown":true,"button":e.button,
    "clientX":e.clientX,"clientY":e.clientY});
 })
 element.addEventListener("touchstart",function(e){
  mouseEvent(thisObj,{"target":e.target,"isDown":true,"button":0});
 })
 element.addEventListener("mouseup",function(e){
  mouseEvent(thisObj,{"target":e.target,"isDown":false,"button":e.button,
    "clientX":e.clientX,"clientY":e.clientY});
 })
 element.addEventListener("touchend",function(e){
  mouseEvent(thisObj,{"target":e.target,"isDown":false,"button":0});
 })
 element.addEventListener("mousemove",function(e){
  mouseEvent(thisObj,{"target":e.target,"isDown":false,"button":-1,
    "clientX":e.clientX,"clientY":e.clientY});
 })
 element.addEventListener("touchmove",function(e){
  mouseEvent(thisObj,{"target":e.target,"isDown":false,"button":-1});
 })
};
/**
 * Not documented yet.
 * @param {*} func
 */
InputTracker.prototype.mousewheel=function(func){
 var cb=function(e, click){
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
  func({"target":e.target,
     "delta":delta,
     "click":click,
     "x":clientX,
     "y":clientY});
   e.preventDefault();
 }
 if("onmousewheel" in this.element){
  this.element.addEventListener("mousewheel",cb);
 } else {
  this.element.addEventListener("DOMMouseScroll",cb);
 }
}

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
}
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
}
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
 */
InputTracker.prototype.deltaXY=function(){
 var deltaX=0;
 var deltaY=0;
 if(this.clientX==null || this.clientY==null){
  return {"x":0,"y":0,"cx":0,"cy":0};
 }
 var deltaX=(this.lastClient.length==0) ? 0 :
   this.clientX-this.lastClient[0];
 var deltaY=(this.lastClient.length==0) ? 0 :
   this.clientY-this.lastClient[1];
 this.lastClient[0]=this.clientX;
 this.lastClient[1]=this.clientY;
 return {"x":deltaX,"y":deltaY,
   "cx":this.clientX,"cy":this.clientY};
}
