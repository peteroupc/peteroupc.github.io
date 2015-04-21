
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
Camera._vec3diff=function(a,b){
 return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
}
/**
* Moves the camera to the left or right, adjusting
* its angle, while maintaining its distance to the target
* position.
* @param {number} angleDegrees Angle, in degrees,
* to move the camera.  Positive angles mean left,
* negative angles mean right.
* @return {Camera} This object.
*/
Camera.prototype.moveAngleHorizontal=function(angleDegrees){
 if(angleDegrees!=0){
  this._angleHorizontal(-angleDegrees);
  this._resetPosition();
 }
 return this;
}
/** @private */
Camera.prototype._angleHorizontal=function(angleDegrees){
 var change=this.angleY;
 this.angleY+=(angleDegrees*GLMath.PiDividedBy180)%(Math.PI*2);
 if(this.angleY<0)this.angleY=(Math.PI*2+this.angleY);
 change=this.angleY-change;
 this.angleQuat=GLMath.quatMultiply(this.angleQuat,
   GLMath.quatFromAxisAngle(change*GLMath.Num180DividedByPi,0,1,0));
 GLMath.quatNormInPlace(this.angleQuat);
}
/** @private */
Camera.prototype._angleVertical=function(angleDegrees){
  var change=this.angleX;
  this.angleX+=(angleDegrees*GLMath.PiDividedBy180)%(Math.PI*2);
  if(this.angleX<0)this.angleX=(Math.PI*2+this.angleX);
 change=this.angleX-change;
 this.angleQuat=GLMath.quatMultiply(this.angleQuat,
   GLMath.quatFromAxisAngle(change*GLMath.Num180DividedByPi,1,0,0));
 GLMath.quatNormInPlace(this.angleQuat);
}

/**
* Moves the camera up or down, adjusting its angle, while
* maintaining its distance to the target position.
* @param {number} angleDegrees Angle, in degrees,
* to move the camera.  Positive angles mean down,
* negative angles mean up.
* @return {Camera} This object.
*/
Camera.prototype.moveAngleVertical=function(angleDegrees){
 if(angleDegrees!=0){
  this._angleVertical(-angleDegrees);
  this._resetPosition();
 }
 return this;
}

/**
* Turns the camera up or down, maintaining
* its current position.
* @param {number} angleDegrees Angle, in degrees,
* to move the camera.  Positive angles mean down,
* negative angles mean up.
* @return {Camera} This object.
*/
Camera.prototype.turnVertical=function(angleDegrees){
 if(angleDegrees!=0){
  var pos=this.getPosition();
  this._angleVertical(angleDegrees);
  this._resetTarget();
 }
 return this;
}
/** @private */
Camera.prototype._resetPosition=function(){
  var diff=Camera._vec3diff(this.target,this.position);
  var dist=GLMath.vec3length(diff);
  var newVector=GLMath.quatTransform(this.angleQuat,[0,0,-dist]);
  this.position[0]=this.target[0]-newVector[0];
  this.position[1]=this.target[1]-newVector[1];
  this.position[2]=this.target[2]-newVector[2];
  this._updateLookAt();
  this.setDistance(this.distance);
}
/** @private */
Camera.prototype._resetTarget=function(){
  var diff=Camera._vec3diff(this.target,this.position);
  var dist=GLMath.vec3length(diff);
  var newVector=GLMath.quatTransform(this.angleQuat,[0,0,-dist]);
  this.target[0]=this.position[0]+newVector[0];
  this.target[1]=this.position[1]+newVector[1];
  this.target[2]=this.position[2]+newVector[2];
  this._updateLookAt();
  this.setDistance(this.distance);
}

/**
* Turns the camera to the left or right, maintaining
* its current position.
* @param {number} angleDegrees Angle, in degrees,
* to move the camera.  Positive angles mean right,
* negative angles mean left.
* @return {Camera} This object.
*/
Camera.prototype.turnHorizontal=function(angleDegrees){
 if(angleDegrees!=0){
  var pos=this.getPosition();
  this._angleHorizontal(-angleDegrees);
  this._resetTarget();
 }
 return this;
}

/**
* Gets the current position of the camera.
* @return {Camera} A 3-element array giving
* the X, Y, and Z coordinates, respectively, of
* the camera's position.
*/
Camera.prototype.getPosition=function(){
  return this.position.slice(0,3);
}
/**
 * Not documented yet.
 * @param {*} dist
 */
Camera.prototype.setDistance=function(dist){
 if(dist<0)throw new Error("invalid distance")
 if(dist<this.near)dist=this.near;
 var diff=Camera._vec3diff(this.target,this.position);
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

/**
* Moves the camera's position to the given
* X, Y, and Z coordinates, and adjusts the target's
* position to maintain the current distance and
* orientation.
* @param {number} X coordinate.
* @param {number} Y coordinate.
* @param {number} Z coordinate.
* @return {Camera} This object.
*/
Camera.prototype.movePosition=function(cx, cy, cz){
 if(cx!=0 && cy!=0 && cz!=0){
  var pos=this.getPosition();
  this.target[0]+=(cx-pos[0]);
  this.target[1]+=(cy-pos[1]);
  this.target[2]+=(cz-pos[2]);
  this.position=[cx,cy,cz];
 }
 return this;
}

/**
* Moves the camera closer or farther to the target
* position.  The camera won't move closer than the distance
* to the near clipping plane.
* @param {number} distance Distance, in world
* space units, to move the camera.  Positive values
* mean closer, negative angles mean farther.
* @return {Camera} This object.
*/
Camera.prototype.moveClose=function(dist){
 if(dist!=0){
  var diff=Camera._vec3diff(this.target,this.position);
  var realDist=GLMath.vec3length(diff);
  var newDist=realDist-dist;
  if(newDist<this.near){
   newDist=this.near; // too close
  }
  this.distance=newDist;
  var factor=newDist/realDist;
  this.position[0]=this.target[0]-diff[0]*factor;
  this.position[1]=this.target[1]-diff[1]*factor;
  this.position[2]=this.target[2]-diff[2]*factor;
  this._updateLookAt();
 }
 return this;
}

/**
* Moves the target and the camera either forward or back,
* maintaining the distance between the camera and the target.
* @param {number} distance Distance, in world
* space units, to move the target and camera, either forward
* or back.  Positive values
* cause the camera to move forward, negative angles
* cause it to move back.
* @return {Camera} This object.
*/
Camera.prototype.moveForward=function(dist){
 if(dist!=0){
  var diff=Camera._vec3diff(this.target,this.position);
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
Camera.prototype._updateLookAt=function(){
 this.scene.setLookAt(this.getPosition(),this.target,
   GLMath.quatTransform(this.angleQuat,[0,1,0]));
}
/**
 * Not documented yet.
* @return {Camera} This object.
 */
Camera.prototype.update=function(){
 var delta=this.input.deltaXY();
 if(this.input.leftButton){
  this.moveAngleHorizontal(0.5*delta.x)
  this.moveAngleVertical(0.5*delta.y)
 }
 if(this.input.keys[InputTracker.DOWN]){
  this.moveForward(-0.2)
 }
 if(this.input.keys[InputTracker.UP]){
  this.moveForward(0.2)
 }
 if(this.input.keys[InputTracker.LEFT]){
  this.turnHorizontal(-0.5)
 }
 if(this.input.keys[InputTracker.RIGHT]){
  this.turnHorizontal(0.5)
 }
 var aspect=this.scene.getAspect();
 if(aspect!=this.currentAspect){
  this.currentAspect=aspect;
  this.scene.setPerspective(this.fov,this.currentAspect,this.near,this.far);
 }
 this._updateLookAt();
 return this;
}
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
  return {"x":0,"y":0};
 }
 var deltaX=(this.lastClient.length==0) ? 0 :
   this.clientX-this.lastClient[0];
 var deltaY=(this.lastClient.length==0) ? 0 :
   this.clientY-this.lastClient[1];
 this.lastClient[0]=this.clientX;
 this.lastClient[1]=this.clientY;
 return {"x":deltaX,"y":deltaY};
}
