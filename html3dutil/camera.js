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
 this.oldpos=[null,null];
 this.fov=fov;
 this.near=nearZ;
 this.far=farZ;
 if(typeof InputTracker!="undefined"){
  this.input=new InputTracker(scene.getContext().canvas);
 }
 this.currentAspect=this.scene.getAspect();
 this.scene.setPerspective(this.fov,this.currentAspect,this.near,this.far);
 this._updateView();
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
Camera.prototype.setDistance=function(dist){
 this.distance=Math.max(this.near,dist);
 this.position=[0,0,this.distance]
 return this._updateView();
}

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

Camera.prototype.update=function(){
 var delta=this.input.deltaXY();
 if(this.input.leftButton){
  if(this.trackballMode){
   this._trackball(delta.x,delta.y,0.3);
  } else {
   this._orbit(delta.x,delta.y,0.3);
  }
 } else {
  this.oldpos=[delta.cx,delta.cy]
 }
 if(this.input.keys[InputTracker.DOWN]){
  this.setDistance(this.distance+0.2)
 }
 if(this.input.keys[InputTracker.UP]){
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
 this.keys={};
 this.lastClient=[];
 this.clientX=null;
 this.clientY=null;
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
 element.addEventListener("mousedown",function(e){
  if(e.button==0){
   thisObj.leftButton=true;
  }
  if(e.button==2){
   thisObj.rightButton=true;
  }
  thisObj.clientX=e.clientX-InputTracker._getPageX(e.target);
  thisObj.clientY=e.clientY-InputTracker._getPageY(e.target);
 })
 element.addEventListener("mouseup",function(e){
  if(e.button==0){
   thisObj.leftButton=false;
  }
  if(e.button==2){
   thisObj.rightButton=false;
  }
  thisObj.clientX=e.clientX-InputTracker._getPageX(e.target);
  thisObj.clientY=e.clientY-InputTracker._getPageY(e.target);
 })
 element.addEventListener("mousemove",function(e){
  thisObj.clientX=e.clientX-InputTracker._getPageX(e.target);
  thisObj.clientY=e.clientY-InputTracker._getPageY(e.target);
 })
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
