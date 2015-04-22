/**
* A class for controlling the projection and
* view of a 3D scene, in the nature of an abstract "camera".
* @class
* @alias Camera
* @param {glutil.Scene} A 3D scene to associate with this
* camera object.
* @param {number}  fov Vertical field of view, in degrees. Should be less
* than 180 degrees. (The smaller
* this number, the bigger close objects appear to be.  As a result,
* zoom can be implemented by multiplying field of view by an
* additional factor.)
* @param {number} near The distance from the camera to
* the near clipping plane. Objects closer than this distance won't be
* seen. This should be slightly greater than 0.
* @param {number}  far The distance from the camera to
* the far clipping plane. Objects beyond this distance will be too far
* to be seen.
*/
function Camera(scene, fov, nearZ, farZ){
 if(nearZ<=0)throw new Error("invalid nearZ")
 this.target=[0,0,0]; // target position
 var distance=Math.max(nearZ,10); // distance from the target in units
 this.position=[0,0,distance];
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
 this.scene.setLookAt(this.position,this.target);
}
Camera._vec3diff=function(a,b){
 return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
}

Camera._quatRotateY=function(quat, angleDegrees){
 var halfRad=angleDegrees*Math.PI/360;
 var t1 = Math.sin(halfRad);
 var t2 = Math.cos(halfRad);
 var t3 = [((quat[0] * t2) - quat[2] * t1), ((quat[3] * t1) + quat[1] * t2), ((quat[2] * t2) + quat[0] * t1), ((quat[3] * t2) - quat[1] * t1)];
 return GLMath.quatNormInPlace(t3);
}
Camera._quatRotateX=function(quat, angleDegrees){
 var halfRad=angleDegrees*Math.PI/360;
 var t1 = Math.sin(halfRad);
 var t2 = Math.cos(halfRad);
 var t3 = [((quat[3] * t1) + quat[0] * t2), ((quat[1] * t2) + quat[2] * t1), ((quat[2] * t2) - quat[1] * t1), ((quat[3] * t2) - quat[0] * t1)];
 return GLMath.quatNormInPlace(t3);
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
  this._angleHorizontal(angleDegrees);
  this._resetPosition();
 }
 return this;
}

Camera.prototype._angleHorizontal=function(angleDegrees){
 this.angleY+=(angleDegrees*GLMath.PiDividedBy180)%(Math.PI*2);
 if(this.angleY<0)this.angleY=(Math.PI*2+this.angleY);
 this.angleQuat=GLMath.quatFromEuler(
   this.angleX*GLMath.Num180DividedByPi,
   this.angleY*GLMath.Num180DividedByPi,
   0,
   GLMath.PitchYawRoll);
}

Camera.prototype._angleVertical=function(angleDegrees){
  var oldangle=this.angleX;
  this.angleX+=(angleDegrees*GLMath.PiDividedBy180)%(Math.PI*2);
  if(this.angleX<0)this.angleX=(Math.PI*2+this.angleX);
  var angleEnd1=Math.PI/2-0.001;
  var angleEnd2=Math.PI*3/2+0.001;
  // Don't turn to 90 degrees above or to 90 degrees below
  if(this.angleX>angleEnd1 && this.angleX<angleEnd2){
   if(oldangle>0 && oldangle<=angleEnd1)
    this.angleX=angleEnd1;
   else
    this.angleX=angleEnd2;
  }
  this.angleQuat=GLMath.quatFromEuler(
   this.angleX*GLMath.Num180DividedByPi,
   this.angleY*GLMath.Num180DividedByPi,
   0,
   GLMath.PitchYawRoll);
}

/**
* Moves the camera up or down, adjusting its angle, while
* maintaining its distance to the target position.
* The camera won't turn to 90 degrees above or beyond,
* or to 90 degrees below or beyond.
* @param {number} angleDegrees Angle, in degrees,
* to move the camera.  Positive angles mean down,
* negative angles mean up.
* @return {Camera} This object.
*/
Camera.prototype.moveAngleVertical=function(angleDegrees){
 if(angleDegrees!=0){
  this._angleVertical(angleDegrees);
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
Camera.prototype._resetPosition=function(){
  var diff=Camera._vec3diff(this.target,this.position);
  var dist=GLMath.vec3length(diff);
  var newVector=GLMath.quatTransform(this.angleQuat,[0,0,-dist]);
  this.position[0]=this.target[0]-newVector[0];
  this.position[1]=this.target[1]-newVector[1];
  this.position[2]=this.target[2]-newVector[2];
  this.scene.setLookAt(this.position,this.target);
}
Camera.prototype._resetTarget=function(){
  var diff=Camera._vec3diff(this.target,this.position);
  var dist=GLMath.vec3length(diff);
  var newVector=GLMath.quatTransform(this.angleQuat,[0,0,-dist]);
  this.target[0]=this.position[0]+newVector[0];
  this.target[1]=this.position[1]+newVector[1];
  this.target[2]=this.position[2]+newVector[2];
  this.scene.setLookAt(this.position,this.target);
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
  var factor=newDist/realDist;
  this.position[0]=this.target[0]-diff[0]*factor;
  this.position[1]=this.target[0]-diff[1]*factor;
  this.position[2]=this.target[0]-diff[2]*factor;
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
Camera.prototype._updateLookAt=function(){
 this.scene.setLookAt(this.getPosition(),this.target);
}

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
}
