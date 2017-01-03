/*
Written by Peter O. in 2015.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://peteroupc.github.io/
*/
/* global H3DU */

// //////////////////////////////////////////

/**
* A class for tracking key press, mouse, touch, and mouse wheel
* events.
* <p>This class is considered a supplementary class to the
* Public Domain HTML 3D Library and is not considered part of that
* library. <p>
* To use this class, you must include the script "extras/camera.js"; the
 * class is not included in the "h3du_min.js" file which makes up
 * the HTML 3D Library.  Example:<pre>
 * &lt;script type="text/javascript" src="extras/camera.js">&lt;/script></pre>
 * @param {HTMLElement|HTMLDocument} element The HTML document
 * or element to track keyboard and mouse events for.
*  If null or omitted, uses the calling application's HTML document.
* @class
* @alias H3DU.InputTracker
*/
H3DU.InputTracker = function(element) {
  "use strict";
  this.leftButton = false;
  this.rightButton = false;
  this.middleButton = false;
  this.keys = [];
  this.lastClient = [];
  this.deltas = {
    "x":0,
    "y":0,
    "cx":0,
    "cy":0,
    "ticks":0
  };
  this.ticksDelta = 0;
  this.clientX = null;
  this.clientY = null;
  this.element = element || window.document;
  this.mouseWheelCallback = null;
  var that = this;
  this.handlers = [];
  var addHandler = function(h, a, b, c) {
    h.push([a, b, c]);
    a.addEventListener(b, c);
  };
  if(element) {
    addHandler(this.handlers, window, "blur", function() {
      that.leftButton = false;
      that.rightButton = false;
      that.keys = {};
      that.ticksDelta = 0;
    });
    addHandler(this.handlers, document, "keydown", function(e) {
      that.keys[e.keyCode] = true;
    });
    addHandler(this.handlers, document, "keyup", function(e) {
      delete that.keys[e.keyCode];
    });
    var mouseWheelFunc = function(tracker, e, click) {
      var clientX = e.clientX - H3DU.InputTracker._getPageX(e.target);
      var clientY = e.clientY - H3DU.InputTracker._getPageY(e.target);
      var delta = 0;
      if (e.wheelDelta) {
        delta = e.wheelDelta;
      } else if (e.detail) {
        delta = e.detail * -40;
      } else if (e.originalEvent && e.originalEvent.wheelDelta) {
        delta = e.originalEvent.wheelDelta;
      }
      tracker.ticksDelta += delta / 120.0;
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
    var mouseEvent = function(tracker, e) {
      if(e.button === 0) {
        tracker.leftButton = e.isDown;
      }
      if(e.button === 1) {
        tracker.middleButton = e.isDown;
      }
      if(e.button === 2) {
        tracker.rightButton = e.isDown;
      }
      if(e.button === 0 && e.touch && !e.isDown) {
        tracker.clientX = null;
        tracker.clientY = null;
        tracker.lastClient = [];
      } else {
        tracker.clientX = e.clientX - H3DU.InputTracker._getPageX(e.target);
        tracker.clientY = e.clientY - H3DU.InputTracker._getPageY(e.target);
        if(e.button !== -1) {
    // update mouse position to current click position
          tracker.lastClient[0] = tracker.clientX;
          tracker.lastClient[1] = tracker.clientY;
        }
      }
    };
    addHandler(this.handlers, element, "mousedown", function(e) {
      mouseEvent(that, {
        "target":e.target,
        "isDown":true,
        "button":e.button,
        "clientX":e.clientX,
        "clientY":e.clientY
      });
    });
    addHandler(this.handlers, element, "touchstart", function(e) {
      mouseEvent(that, {
        "target":e.target,
        "isDown":true,
        "button":0,
        "clientX":e.touches[0].clientX,
        "clientY":e.touches[0].clientY,
        "touch":true
      });
    });
    addHandler(this.handlers, element, "mouseup", function(e) {
      mouseEvent(that, {
        "target":e.target,
        "isDown":false,
        "button":e.button,
        "clientX":e.clientX,
        "clientY":e.clientY
      });
    });
    addHandler(this.handlers, element, "touchend", function(e) {
      mouseEvent(that, {
        "target":e.target,
        "isDown":false,
        "button":0,
        "clientX":e.changedTouches[0].clientX,
        "clientY":e.changedTouches[0].clientY,
        "touch":true
      });
    });
    addHandler(this.handlers, element, "mousemove", function(e) {
      mouseEvent(that, {
        "target":e.target,
        "isDown":false,
        "button":-1,
        "clientX":e.clientX,
        "clientY":e.clientY
      });
    });
    addHandler(this.handlers, element, "touchmove", function(e) {
      mouseEvent(that, {
        "target":e.target,
        "isDown":false,
        "button":-1,
        "clientX":e.touches[0].clientX,
        "clientY":e.touches[0].clientY,
        "touch":true
      });
    });
    var evt = "mousewheel" in element ? "mousewheel" : "DOMMouseScroll";
    addHandler(this.handlers, element, evt, function(e, click) {
      mouseWheelFunc(that, e, click);
    });
  }
};
/**
 * Disposes all resources used by this input tracker.
 * @memberof! H3DU.InputTracker#
 * @returns {Object} Return value.
*/
H3DU.InputTracker.prototype.dispose = function() {
  "use strict";
  for(var i = 0;i < this.handlers.length;i++) {
    var h = this.handlers[i];
    h[0].removeEventListener(h[1], h[2]);
  }
  this.handlers = [];
  this.element = null;
  this.mouseWheelCallback = null;
  this.keys = [];
  this.ticksDelta = 0;
  this.clientX = null;
  this.clientY = null;
  this.lastClient = [];
  this.deltas = {};
};

/**
* Gets whether a key is pressed, as detected by this
* input tracker.
* @returns {Number} key Key code of the key to check.
* @returns {Boolean} True if the key is currently pressed; otherwise, false.
 * @memberof! H3DU.InputTracker#
*/
H3DU.InputTracker.prototype.getKey = function(key) {
  "use strict";
  return this.keys[key];
};

/**
 * Sets a function to handle mouse wheel events.
 * @deprecated Will be removed in the future.  Use the
 * deltaTicks method to find out whether the user
 * has rotated the mouse wheel.
 * @param {Function} func A function.
 * @memberof! H3DU.InputTracker#
 * @returns {Object} Return value.
*/
H3DU.InputTracker.prototype.mousewheel = function(func) {
  "use strict";
  this.mouseWheelCallback = func;
};

/** @private */
H3DU.InputTracker._getPageX = function(o) {
  "use strict";
  var x = 0;
  while(o !== null && typeof o !== "undefined") {
    if(typeof o.offsetLeft !== "undefined")
      x += o.offsetLeft;
    o = o.offsetParent;
  }
  return x;
};
/** @private */
H3DU.InputTracker._getPageY = function(o) {
  "use strict";
  var x = 0;
  while(o !== null && typeof o !== "undefined") {
    if(typeof o.offsetTop !== "undefined")
      x += o.offsetTop;
    o = o.offsetParent;
  }
  return x;
};
/** Key code for the A key.  Add 1 through 25 to get
the keys for the other letters of the English alphabet.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.A = 65;
/** Key code for the 0 key.  Add 1 through 9 to get
the keys for the other basic digits 1 through 9.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.ZERO = 48;
/** Key code for the return key.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.RETURN = 10;
/** Key code for the enter key.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.ENTER = 13;
/** Key code for the tab key.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.TAB = 9;
/** Key code for the shift key.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.SHIFT = 16;
/** Key code for the return key.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.CTRL = 17;
/** Key code for the return key.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.ALT = 18;
/** Key code for the return key.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.ESC = 27;
/** Key code for the space bar.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.SPACE = 32;
/** Key code for the page up key.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.PAGEUP = 33;
/** Key code for the page down key.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.PAGEDOWN = 34;
/** Key code for the end key.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.END = 35;
/** Key code for the home key.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.HOME = 36;
/** Key code for the left arrow key.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.LEFT = 37;
/** Key code for the up arrow key.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.UP = 38;
/** Key code for the right arrow key.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.RIGHT = 39;
/** Key code for the down arrow key.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.DOWN = 40;
/** Key code for the delete key.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.DELETE = 46;
/** Key code for the plus key.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.ADD = 107;
/** Key code for the minus key.
@const
@default
@memberof! H3DU.InputTracker
*/
H3DU.InputTracker.SUBTRACT = 109;
/**
 * Returns the current mouse position, delta
 * mouse position, and delta mouse wheel
 * position (see the "update" method).
 * @returns {Object} An object containing the following keys:<ul>
 *<li><code>cx</code> - X-coordinate of the current mouse
 * position.
 *<li><code>cx</code> - Y-coordinate of the current mouse
 * position.
 *<li><code>x</code> - X component of the delta mouse position.
 *<li><code>y</code> - Y component of the delta mouse position.
* <li><code>ticks</code> - The delta mouse wheel position.
* </ul>
* If this object's update method wasn't called, all these values
* will be 0.
 * @memberof! H3DU.InputTracker#
*/
H3DU.InputTracker.prototype.deltaXY = function() {
  "use strict";
  return {
    "x":this.deltas.x,
    "y":this.deltas.y,
    "cx":this.deltas.cx,
    "cy":this.deltas.cy,
    "ticks":this.deltas.ticks
  };
};
/**
* Retrieves the current position of the mouse within
* the page's client area, as detected by the input
* tracker and calculates the "delta mouse position",
* or the difference between
* those values and the values they had the last
* time this method was called.  If this method wasn't
* called before for this tracker, the delta mouse position is
* (0, 0).  If the current position of the mouse is unknown,
* it's (0, 0) instead.<p>
* Also retrieves the "delta mouse wheel position", or the
* offset, in "ticks", from the mouse wheel position at the
* last time this method was called (or the time this tracker
* was created if it wasn't) to the current mouse wheel position.
 * @returns {H3DU.InputTracker} This object.
 * @memberof! H3DU.InputTracker#
*/
H3DU.InputTracker.prototype.update = function() {
  "use strict";
  var deltaX = 0;
  var deltaY = 0;
  if(typeof this.clientX === "undefined" || this.clientX === null) {
    this.deltas.x = 0;
    this.deltas.y = 0;
    this.deltas.cx = 0;
    this.deltas.cy = 0;
  } else if(typeof this.clientY === "undefined" || this.clientY === null) {
    this.deltas.x = 0;
    this.deltas.y = 0;
    this.deltas.cx = 0;
    this.deltas.cy = 0;
  } else {
    deltaX = this.lastClient.length === 0 ? 0 :
     this.clientX - this.lastClient[0];
    deltaY = this.lastClient.length === 0 ? 0 :
     this.clientY - this.lastClient[1];
    this.lastClient[0] = this.clientX;
    this.lastClient[1] = this.clientY;
    this.deltas.x = deltaX;
    this.deltas.y = deltaY;
    this.deltas.cx = this.clientX;
    this.deltas.cy = this.clientY;
  }
  this.deltas.ticks = this.ticksDelta;
  this.ticksDelta = 0;
  return this;
};

/* exported InputTracker */
/**
Alias for the  {@link H3DU.InputTracker} class.
@class
@alias InputTracker
 @deprecated Use {@link H3DU.InputTracker} instead.
*/
var InputTracker = H3DU.InputTracker;

// ////////////////////////////////////////////////////

/**
* A class for controlling the projection and
* view of a 3D scene, in the nature of an abstract "camera".
* This class uses the concept of a "camera's position", or where
* the camera is located in world space, as well
* as a "reference point", or the point in world space that the camera
* is looking at.
* <p>This class is considered a supplementary class to the
* Public Domain HTML 3D Library and is not considered part of that
* library. <p>
* To use this class, you must include the script "extras/camera.js"; the
 * class is not included in the "h3du_min.js" file which makes up
 * the HTML 3D Library.  Example:<pre>
 * &lt;script type="text/javascript" src="extras/camera.js">&lt;/script></pre>
* @class
* @alias H3DU.Camera
* @param {H3DU.Batch3D} batch A 3D scene to associate with this
* camera object.
* @param {Number} fov Vertical field of view, in degrees. Should be less
* than 180 degrees. (The smaller
* this number, the bigger close objects appear to be.) See {@link H3DU.Math.mat4perspective}.
* @param {Number} nearZ The distance from the camera to
* the near clipping plane. Objects closer than this distance won't be seen.
* See {@link H3DU.Math.mat4perspective}. This should be slightly greater than 0.
* @param {Number} farZ The distance from the camera to
* the far clipping plane. Objects beyond this distance will be too far
* to be seen. See {@link H3DU.Math.mat4perspective}.
* @param {HTMLCanvasElement} [canvas] A canvas to associate with this
* camera object. <i>This argument is deprecated.</i>
*/
H3DU.Camera = function(batch, fov, nearZ, farZ, canvas) {
  "use strict";
  if(nearZ <= 0)throw new Error("invalid nearZ");
  this.near = nearZ;
  this.center = [0, 0, 0];
  this.position = [0, 0, nearZ];
  this.up = [0, 1, 0];
  this.scene = batch;
  this.trackballMode = true;
  this.lat = 90;
  this.lon = 270;
  this._updateView();
  batch.perspectiveAspect(fov, nearZ, farZ);
 // NOTE: For compatibility only, may be removed in the future
  if(!canvas) {
    canvas = document.getElementsByTagName("canvas")[0] || document;
  }
 // NOTE: For compatibility only, may be removed in the future
  this.input = new H3DU.InputTracker(canvas);
};

/** @private */
H3DU.Camera.prototype._orbit = function(deltaMouseX, deltaMouseY, angleMultiplier) {
  "use strict";
  var x = deltaMouseX * angleMultiplier;
  var y = deltaMouseY * angleMultiplier;
  this.lat += y;
  if(this.lat < 0.001)this.lat = 0.001;
  if(this.lat > 179.999)this.lat = 179.999;
  this.lon += x;
  this.lon = this.lon >= 0 && this.lon < 360 ? this.lon : this.lon % 360 + (this.lon < 0 ? 360 : 0);
  var a = (this.lat - 90) * Math.PI / 180;
  var b = (this.lon - 180) * Math.PI / 180;
  var ca = Math.cos(a);
  var sa = a >= 0 && a < 6.283185307179586 ? a <= 3.141592653589793 ? Math.sqrt(1.0 - ca * ca) : -Math.sqrt(1.0 - ca * ca) : Math.sin(a);
  var cb = Math.cos(b);
  var sb = b >= 0 && b < 6.283185307179586 ? b <= 3.141592653589793 ? Math.sqrt(1.0 - cb * cb) : -Math.sqrt(1.0 - cb * cb) : Math.sin(b);
  var dist = this.getDistance();
  x = ca * cb * dist + this.center[0];
  var z = ca * sb * dist + this.center[1];
  y = sa * dist + this.center[2];
  this.setPosition(x, y, z);
};

/** @private */
H3DU.Camera.prototype._trackball = function(deltaMouseX, deltaMouseY, angleMultiplier) {
  "use strict";
  var x = deltaMouseX * angleMultiplier;
  var y = deltaMouseY * angleMultiplier;
  this.moveAngleHorizontal(x);
  this.moveAngleVertical(y);
};
/** @private */
H3DU.Camera.prototype._move = function(deltaMouseX, deltaMouseY, multiplier) {
  "use strict";
  var x = deltaMouseX * multiplier;
  var y = deltaMouseY * multiplier;
  this.moveHorizontal(x);
  this.moveVertical(y);
};
/** @private */
H3DU.Camera.prototype._updateView = function() {
  "use strict";
  var mat = H3DU.Math.mat4lookat(
     this.position, this.center, this.up);
  this.scene.setViewMatrix(mat);
  return this;
};
/** @private */
H3DU.Camera._velocity = function(toVec, fromVec) {
  "use strict";
  var velocity = H3DU.Math.vec3norm( H3DU.Math.vec3sub(toVec, fromVec));
  if(velocity[0] === 0 && velocity[1] === 0 && velocity[2] === 0) {
   // Both vectors are likely the same, so return a default vector
    return [0, 0, 1];
  }
  return velocity;
};
/**
 * Moves the camera a given distance from the reference
* point without changing its orientation.
 * @param {Number} dist Positive number giving the distance.
 * If this is less than the near plane distance, the distance will
* be equal to the near plane distance.  Does nothing if the
* distance is 0 or less.
* @returns {H3DU.Camera} This object.
 * @memberof! H3DU.Camera#
*/
H3DU.Camera.prototype.setDistance = function(dist) {
  "use strict";
  if(dist <= 0)return this;
 // don't move closer than the near plane
  dist = Math.max(this.near, dist);
  var velocity = H3DU.Camera._velocity(this.position, this.center);
  H3DU.Math.vec3scaleInPlace(velocity, dist);
  this.position = H3DU.Math.vec3add(this.center, velocity);
  this._updateView();
  return this;
};

/**
*  Finds the distance from the camera's position to the reference point.
* @returns {Number} Return value.
 * @memberof! H3DU.Camera#
*/
H3DU.Camera.prototype.getDistance = function() {
  "use strict";
  return H3DU.Math.vec3length(
    H3DU.Math.vec3sub(this.position, this.center));
};
/** @private */
H3DU.Camera._transformRel = function(quat, point, origin) {
  "use strict";
  var rotPoint = H3DU.Math.vec3sub(point, origin);
  var ret = H3DU.Math.quatTransform(quat, rotPoint);
  return H3DU.Math.vec3addInPlace(ret, origin);
};

/**
 * Moves the camera upward or downward so that it faces
* the same reference point at the same distance.
 * @param {Number} angleDegrees The angle to rotate the camera,
* in degrees. If the coordinate-system is right-handed, positive
values rotate the camera upward, and
negative values downward. If the coordinate-system is left-handed,
vice versa.
* @returns {H3DU.Camera} This object.
 * @memberof! H3DU.Camera#
*/
H3DU.Camera.prototype.moveAngleVertical = function(angleDegrees) {
  "use strict";
  if(angleDegrees !== 0) {
    var viewVector = H3DU.Camera._velocity(this.center, this.position);
    var orthoVector = H3DU.Math.vec3norm(H3DU.Math.vec3cross(viewVector, this.up));
    var quat = H3DU.Math.quatFromAxisAngle(-angleDegrees, orthoVector);
    this.position = H3DU.Camera._transformRel(quat, this.position, this.center);
    this.up = H3DU.Math.vec3normInPlace(H3DU.Camera._transformRel(quat, this.up, [0, 0, 0]));
    this._updateView();
  }
  return this;
};
/**
 * Moves the camera to the left or right so that it faces
* the same reference point at the same distance.
 * @param {Number} angleDegrees The angle to rotate the camera,
* in degrees. If the coordinate-system is right-handed, positive
values rotate the camera leftward, and
negative values rightward. If the coordinate-system is left-handed,
vice versa.
* @returns {H3DU.Camera} This object.
 * @memberof! H3DU.Camera#
*/
H3DU.Camera.prototype.moveAngleHorizontal = function(angleDegrees) {
  "use strict";
  if(angleDegrees !== 0) {
    var quat = H3DU.Math.quatFromAxisAngle(-angleDegrees, this.up);
    this.position = H3DU.Camera._transformRel(quat, this.position, this.center);
    this._updateView();
  }
  return this;
};
/**
 * Turns the camera to the left or right so that it faces
*  the same distance from a reference point.
 * @param {Number} angleDegrees The angle to rotate the camera,
* in degrees. If the coordinate-system is right-handed, positive
values rotate the camera rightward, and
negative values leftward. If the coordinate-system is left-handed,
vice versa.
* @returns {H3DU.Camera} This object.
 * @memberof! H3DU.Camera#
*/
H3DU.Camera.prototype.turnHorizontal = function(angleDegrees) {
  "use strict";
  if(angleDegrees !== 0) {
    var quat = H3DU.Math.quatFromAxisAngle(angleDegrees, this.up);
    this.center = H3DU.Camera._transformRel(quat, this.center, this.position);
    this._updateView();
  }
  return this;
};
/**
 * Turns the camera upward or downward so that it faces
*  the same distance from a reference point.
 * @param {Number} angleDegrees The angle to rotate the camera,
* in degrees. If the coordinate-system is right-handed, positive
values rotate the camera upward, and
negative values downward. If the coordinate-system is left-handed,
vice versa.
* @returns {H3DU.Camera} This object.
 * @memberof! H3DU.Camera#
*/
H3DU.Camera.prototype.turnVertical = function(angleDegrees) {
  "use strict";
  if(angleDegrees !== 0) {
    var viewVector = H3DU.Camera._velocity(this.center, this.position);
    var orthoVector = H3DU.Math.vec3norm(H3DU.Math.vec3cross(viewVector, this.up));
    var quat = H3DU.Math.quatFromAxisAngle(angleDegrees, orthoVector);
    this.center = H3DU.Camera._transformRel(quat, this.center, this.position);
    this.up = H3DU.Math.vec3normInPlace(H3DU.Camera._transformRel(quat, this.up, [0, 0, 0]));
    this._updateView();
  }
  return this;
};
/**
 * Sets the position of the camera.
 * @param {Number} cx The camera's new X-coordinate,
* or a 3-element vector containing the X, Y, and Z coordinates.
* In the latter case, "cy" and "cz" can be omitted.
 * @param {Number} [cy] The camera's new Y-coordinate.
 * @param {Number} [cz] The camera's new Z-coordinate.
* @returns {H3DU.Camera} This object.
 * @memberof! H3DU.Camera#
*/
H3DU.Camera.prototype.setPosition = function(cx, cy, cz) {
  "use strict";
  if(typeof cx === "number") {
    if(isNaN(cx) || isNaN(cy) || isNaN(cz))throw new Error();
    this.position[0] = cx;
    this.position[1] = cy;
    this.position[2] = cz;
    this._updateView();
    return this;
  } else {
    return this.setPosition(cx[0], cy[1], cz[2]);
  }
};

/**
 * Sets the position of the camera.
 * @param {Number} cx The camera's new X-coordinate.
 * @param {Number} cy The camera's new Y-coordinate.
 * @param {Number} cz The camera's new Z-coordinate.
* @returns {H3DU.Camera} This object.
* @method
* @deprecated Renamed to "setPosition".
 * @memberof! H3DU.Camera#
*/
H3DU.Camera.prototype.movePosition =  H3DU.Camera.prototype.setPosition;

/**
 * Gets the position of the camera.
 * @returns {Array<Number>} An array of three numbers giving
the X, Y, and Z coordinates of the camera's position, respectively.
 * @memberof! H3DU.Camera#
*/
H3DU.Camera.prototype.getPosition = function() {
  "use strict";
  return H3DU.Math.vec3copy(this.position);
};

/**
 * Moves the camera the given distance, but not too close
* to the reference point.
 * @param {Number} dist The distance to move.  Positive
* values mean forward, and negative distances mean back.
* @returns {H3DU.Camera} This object.
 * @memberof! H3DU.Camera#
*/
H3DU.Camera.prototype.moveClose = function(dist) {
  "use strict";
  return this.setDistance(this.getDistance() - dist);
};
/**
 * Moves the camera forward the given distance.
 * @param {Number} dist The distance to move.  Positive
* values mean forward, and negative distances mean back.
* @returns {H3DU.Camera} This object.
 * @memberof! H3DU.Camera#
*/
H3DU.Camera.prototype.moveForward = function(dist) {
  "use strict";
  if(dist !== 0) {
    var velocity = H3DU.Camera._velocity(this.center, this.position);
    H3DU.Math.vec3scaleInPlace(velocity, dist);
    H3DU.Math.vec3addInPlace(this.position, velocity);
    H3DU.Math.vec3addInPlace(this.center, velocity);
    this._updateView();
  }
  return this;
};
/**
 * Moves the camera horizontally relative to the camera's up vector.
 * @deprecated Use "moveHorizontal" instead.
 * @param {Number} dist Distance to move the camera.
* @returns {H3DU.Camera} This object.
 * @memberof! H3DU.Camera#
*/
H3DU.Camera.prototype.moveCenterHorizontal = function(dist) {
  "use strict";
  return this.moveHorizontal(dist);
};
/**
 * Moves the camera toward or away from the camera's up vector.
 * @deprecated Use "moveVertical" instead.
 * @param {Number} dist Distance to move the camera.
* @returns {H3DU.Camera} This object.
 * @memberof! H3DU.Camera#
*/
H3DU.Camera.prototype.moveCenterVertical = function(dist) {
  "use strict";
  return this.moveVertical(dist);
};
/**
 * Moves the camera horizontally relative to the camera's up vector.
 * @param {Number} dist Distance to move the camera.
* @returns {H3DU.Camera} This object.
 * @memberof! H3DU.Camera#
*/
H3DU.Camera.prototype.moveHorizontal = function(dist) {
  "use strict";
  if(dist !== 0) {
    var viewVector = H3DU.Camera._velocity(this.center, this.position);
    var orthoVector = H3DU.Math.vec3norm(H3DU.Math.vec3cross(viewVector, this.up));
    H3DU.Math.vec3scaleInPlace(orthoVector, dist);
    H3DU.Math.vec3addInPlace(this.position, orthoVector);
    H3DU.Math.vec3addInPlace(this.center, orthoVector);
    this._updateView();
  }
  return this;
};
/**
 * Moves the camera toward or away from the camera's up vector.
 * @param {Number} dist Distance to move the camera.
* @returns {H3DU.Camera} This object.
 * @memberof! H3DU.Camera#
*/
H3DU.Camera.prototype.moveVertical = function(dist) {
  "use strict";
  if(dist !== 0) {
    var viewVector = H3DU.Math.vec3norm(this.up);
    H3DU.Math.vec3scaleInPlace(viewVector, dist);
    H3DU.Math.vec3addInPlace(this.position, viewVector);
    H3DU.Math.vec3addInPlace(this.center, viewVector);
    this._updateView();
  }
  return this;
};
/**
 * Gets the 3-element vector that points from the reference
 * point to the camera's position.
 * @returns {Array<Number>} The return value as a unit
 * vector (a ["normalized" vector]{@link H3DU.Math.vec3norm} with a length of 1).
* Returns (0,0,0) if the reference point is the same as the camera's position.
 * @memberof! H3DU.Camera#
*/
H3DU.Camera.prototype.getVectorFromCenter = function() {
  "use strict";
  var posSub = H3DU.Math.vec3sub(this.position, this.center);
  return H3DU.Math.vec3normInPlace(posSub);
};
/**
 * Updates information about this camera based
 * on the state of an input tracker.
 * @param {H3DU.InputTracker} [input] An input tracker.  This
 * method should be called right after the tracker's
 * 'update' method was called. <i>Note that future versions
 * may require this parameter.</i>
 * @memberof! H3DU.Camera#
 * @returns {Object} Return value.
*/
H3DU.Camera.prototype.update = function(input) {
  "use strict";
  if(!input)input.update();
  return this._updateNew(input || this.input);
};
/** @private */
H3DU.Camera.prototype._updateNew = function(input) {
  "use strict";
  if(!input)return this;
  var delta = input.deltaXY();
  var deltaTicks = delta.ticks;
  if(input.leftButton) {
    if(this.trackballMode) {
      this._trackball(delta.x, delta.y, 0.3);
    } else {
      this._orbit(delta.x, delta.y, 0.3);
    }
  } else if(input.middleButton) {
    this._move(delta.x, delta.y, 0.3);
  }
  if(input.keys[H3DU.InputTracker.A + 22]) { // letter W
    this.setDistance(this.getDistance() + 0.2);
  }
  if(input.keys[H3DU.InputTracker.A + 18]) { // letter S
    this.setDistance(this.getDistance() - 0.2);
  }
  if(deltaTicks !== 0) {
   // mousewheel up (negative) means move forward,
   // mousewheel down (positive) means move back
    console.log(deltaTicks);
    this.setDistance(this.getDistance() - 0.6 * deltaTicks);
  }
  return this;
};
// /////////////////////////////////////////////////////////////

/* exported Camera */
/**
Alias for the  {@link H3DU.Camera} class.
@class
@alias InputTracker
 @deprecated Use {@link H3DU.Camera} instead.
*/
var Camera = H3DU.Camera;
