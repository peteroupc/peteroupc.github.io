/** The <code>extras/camera.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/camera.js";
 * // -- or --
 * import * as CustomModuleName from "extras/camera.js";</pre>
 * @module extras/camera */

/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {MathUtil} from "../h3du_module.js";
/**
 * A class for tracking key press, mouse, touch, and mouse wheel
 * events.
 * <p>This class is considered a supplementary class to the
 * Public Domain HTML 3D Library and is not considered part of that
 * library. <p>
 * @param {HTMLElement|HTMLDocument} element The HTML document
 * or element to track keyboard and mouse events for.
 * If null, undefined, or omitted, uses the calling application's HTML document.
 * @constructor
 */
export var InputTracker = function(element) {
  /** True if the left mouse button was detected as being down.
   * @type {boolean}
   * @readonly */
  this.leftButton = false;
  /** True if the right mouse button was detected as being down.
   * @type {boolean}
   * @readonly */
  this.rightButton = false;
  /** True if the middle mouse button was detected as being down.
   * @type {boolean}
   * @readonly */
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
  const that = this;
  this.handlers = [];
  const addHandler = function(h, a, b, c) {
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
    const mouseWheelFunc = function(tracker, e, click) {
      const clientX = e.clientX - InputTracker._getPageX(e.target);
      const clientY = e.clientY - InputTracker._getPageY(e.target);
      let delta = 0;
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
    const mouseEvent = function(tracker, e) {
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
        tracker.clientX = e.clientX - InputTracker._getPageX(e.target);
        tracker.clientY = e.clientY - InputTracker._getPageY(e.target);
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
    const evt = "mousewheel" in element ? "mousewheel" : "DOMMouseScroll";
    addHandler(this.handlers, element, evt, function(e, click) {
      mouseWheelFunc(that, e, click);
    });
  }
};
/**
 * Disposes all resources used by this input tracker.
 * @returns {Object} Return value.
 */
InputTracker.prototype.dispose = function() {
  for(let i = 0; i < this.handlers.length; i++) {
    const h = this.handlers[i];
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
 * @returns {number} key Key code of the key to check.
 * @returns {boolean} True if the key is currently pressed; otherwise, false.
 */
InputTracker.prototype.getKey = function(key) {
  return this.keys[key];
};

/**
 * Sets a function to handle mouse wheel events.
 * @deprecated Will be removed in the future. Use the
 * mousePos method to find out whether the user
 * has rotated the mouse wheel.
 * @param {Function} func A function.
 * @returns {Object} Return value.
 */
InputTracker.prototype.mousewheel = function(func) {
  this.mouseWheelCallback = func;
};

/** @ignore */
InputTracker._getPageX = function(o) {
  let x = 0;
  while(typeof o !== "undefined" && o !== null) {
    if(typeof o.offsetLeft !== "undefined")
      x += o.offsetLeft;
    o = o.offsetParent;
  }
  return x;
};
/** @ignore */
InputTracker._getPageY = function(o) {
  let x = 0;
  while(typeof o !== "undefined" && o !== null) {
    if(typeof o.offsetTop !== "undefined")
      x += o.offsetTop;
    o = o.offsetParent;
  }
  return x;
};
/** Key code for the A key. Add 1 through 25 to get
 * the keys for the other letters of the English alphabet.
 * @const
 * @default
 */
InputTracker.A = 65;
/** Key code for the 0 key. Add 1 through 9 to get
 * the keys for the other basic digits 1 through 9.
 * @const
 * @default
 */
InputTracker.ZERO = 48;
/** Key code for the return key.
 * @const
 * @default
 */
InputTracker.RETURN = 10;
/** Key code for the enter key.
 * @const
 * @default
 */
InputTracker.ENTER = 13;
/** Key code for the tab key.
 * @const
 * @default
 */
InputTracker.TAB = 9;
/** Key code for the shift key.
 * @const
 * @default
 */
InputTracker.SHIFT = 16;
/** Key code for the return key.
 * @const
 * @default
 */
InputTracker.CTRL = 17;
/** Key code for the return key.
 * @const
 * @default
 */
InputTracker.ALT = 18;
/** Key code for the return key.
 * @const
 * @default
 */
InputTracker.ESC = 27;
/** Key code for the space bar.
 * @const
 * @default
 */
InputTracker.SPACE = 32;
/** Key code for the page up key.
 * @const
 * @default
 */
InputTracker.PAGEUP = 33;
/** Key code for the page down key.
 * @const
 * @default
 */
InputTracker.PAGEDOWN = 34;
/** Key code for the end key.
 * @const
 * @default
 */
InputTracker.END = 35;
/** Key code for the home key.
 * @const
 * @default
 */
InputTracker.HOME = 36;
/** Key code for the left arrow key.
 * @const
 * @default
 */
InputTracker.LEFT = 37;
/** Key code for the up arrow key.
 * @const
 * @default
 */
InputTracker.UP = 38;
/** Key code for the right arrow key.
 * @const
 * @default
 */
InputTracker.RIGHT = 39;
/** Key code for the down arrow key.
 * @const
 * @default
 */
InputTracker.DOWN = 40;
/** Key code for the delete key.
 * @const
 * @default
 */
InputTracker.DELETE = 46;
/** Key code for the plus key.
 * @const
 * @default
 */
InputTracker.ADD = 107;
/** Key code for the minus key.
 * @const
 * @default
 */
InputTracker.SUBTRACT = 109;
/**
 * Returns the current mouse position, delta
 * mouse position, and delta mouse wheel
 * position (see the "update" method).
 * @returns {Object} An object containing the following keys:<ul>
 * <li><code>cx</code> - X coordinate of the current mouse
 * position.
 * <li><code>cx</code> - Y coordinate of the current mouse
 * position.
 * <li><code>x</code> - X component of the delta mouse position.
 * <li><code>y</code> - Y component of the delta mouse position.
 * <li><code>ticks</code> - The delta mouse wheel position.
 * </ul>
 * If this object's update method wasn't called, all these values
 * will be 0.
 */
InputTracker.prototype.mousePos = function() {
  return {
    "x":this.deltas.x,
    "y":this.deltas.y,
    "cx":this.deltas.cx,
    "cy":this.deltas.cy,
    "ticks":this.deltas.ticks
  };
};
/**
 * An alias for {@link InputTracker#mousePos}.
 * @deprecated
 * @returns {Object} An object described in the "mousePos" method.
 */
InputTracker.prototype.deltaXY = InputTracker.prototype.mousePos;
/**
 * Retrieves the current position of the mouse within
 * the page's client area, as detected by the input
 * tracker and calculates the "delta mouse position",
 * or the difference between
 * those values and the values they had the last
 * time this method was called. If this method wasn't
 * called before for this tracker, the delta mouse position is
 * (0, 0). If the current position of the mouse is unknown,
 * it's (0, 0) instead.<p>
 * Also retrieves the "delta mouse wheel position", or the
 * offset, in "ticks", from the mouse wheel position at the
 * last time this method was called (or the time this tracker
 * was created if it wasn't) to the current mouse wheel position.
 * @returns {InputTracker} This object.
 */
InputTracker.prototype.update = function() {
  let deltaX = 0;
  let deltaY = 0;
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
 * Alias for the {@link InputTracker} class.
 * @constructor
 * @alias InputTracker
 * @deprecated Use {@link InputTracker} instead.
 */

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
 * the HTML 3D Library. Example:<pre>
 * &lt;script type="text/javascript" src="extras/camera.js">&lt;/script></pre>
 * @constructor
 * @memberof H3DU
 * @param {number} fov Vertical field of view, in degrees. Should be less
 * than 180 degrees. (The smaller
 * this number, the bigger close objects appear to be.) See {@link MathUtil.mat4perspective}.
 * @param {number} nearZ The distance from the camera to
 * the near clipping plane. Objects closer than this distance won't be seen.
 * See {@link MathUtil.mat4perspective}. This should be slightly greater than 0.
 * @param {number} farZ The distance from the camera to
 * the far clipping plane. Objects beyond this distance will be too far
 * to be seen. See {@link MathUtil.mat4perspective}.
 */
export var Camera = function(fov, nearZ) {
  if(nearZ <= 0)throw new Error("invalid nearZ");
  this.near = nearZ;
  this.center = [0, 0, 0];
  this.position = [0, 0, nearZ];
  this.up = [0, 1, 0];
  this.trackballMode = true;
  this.lat = 90;
  this.lon = 270;
  this._updateView();
  this.perspectiveParams = {};
};

/** @ignore */
Camera.prototype._orbit = function(deltaMouseX, deltaMouseY, angleMultiplier) {
  let x = deltaMouseX * angleMultiplier;
  let y = deltaMouseY * angleMultiplier;
  this.lat += y;
  if(this.lat < 0.001)this.lat = 0.001;
  if(this.lat > 179.999)this.lat = 179.999;
  this.lon += x;
  this.lon = this.lon >= 0 && this.lon < 360 ? this.lon : this.lon % 360 + (this.lon < 0 ? 360 : 0);
  const a = (this.lat - 90) * Math.PI / 180;
  const b = (this.lon - 180) * Math.PI / 180;
  const ca = Math.cos(a);
  const sa = a >= 0 && a < 6.283185307179586 ? a <= 3.141592653589793 ? Math.sqrt(1.0 - ca * ca) : -Math.sqrt(1.0 - ca * ca) : Math.sin(a);
  const cb = Math.cos(b);
  const sb = b >= 0 && b < 6.283185307179586 ? b <= 3.141592653589793 ? Math.sqrt(1.0 - cb * cb) : -Math.sqrt(1.0 - cb * cb) : Math.sin(b);
  const dist = this.getDistance();
  x = ca * cb * dist + this.center[0];
  const z = ca * sb * dist + this.center[1];
  y = sa * dist + this.center[2];
  this.setPosition(x, y, z);
};

/** @ignore */
Camera.prototype._trackball = function(deltaMouseX, deltaMouseY, angleMultiplier) {
  const x = deltaMouseX * angleMultiplier;
  const y = deltaMouseY * angleMultiplier;
  this.moveAngleHorizontal(x);
  this.moveAngleVertical(y);
};
/** @ignore */
Camera.prototype._move = function(deltaMouseX, deltaMouseY, multiplier) {
  const x = deltaMouseX * multiplier;
  const y = deltaMouseY * multiplier;
  this.moveHorizontal(x);
  this.moveVertical(y);
};
/** @ignore */
Camera.prototype._updateView = function() {
  // var mat = MathUtil.mat4lookat(
  // this.position, this.center, this.up);
  // this.scene.setViewMatrix(mat);
  return this;
};
/** @ignore */
Camera._velocity = function(toVec, fromVec) {
  const velocity = MathUtil.vec3normalize( MathUtil.vec3sub(toVec, fromVec));
  if(velocity[0] === 0 && velocity[1] === 0 && velocity[2] === 0) {
    // Both vectors are likely the same, so return a default vector
    return [0, 0, 1];
  }
  return velocity;
};
/**
 * Moves the camera a given distance from the reference
 * point without changing its orientation.
 * @param {number} dist Positive number giving the distance.
 * If this is less than the near plane distance, the distance will
 * be equal to the near plane distance. Does nothing if the
 * distance is 0 or less.
 * @returns {Camera} This object.
 */
Camera.prototype.setDistance = function(dist) {
  if(dist <= 0)return this;
  // don't move closer than the near plane
  dist = Math.max(this.near, dist);
  const velocity = Camera._velocity(this.position, this.center);
  MathUtil.vec3scaleInPlace(velocity, dist);
  this.position = MathUtil.vec3add(this.center, velocity);
  this._updateView();
  return this;
};

/**
 * Finds the distance from the camera's position to the reference point.
 * @returns {number} Return value.
 */
Camera.prototype.getDistance = function() {
  return MathUtil.vec3length(
    MathUtil.vec3sub(this.position, this.center));
};
/** @ignore */
Camera._transformRel = function(quat, point, origin) {
  const rotPoint = MathUtil.vec3sub(point, origin);
  const ret = MathUtil.quatTransform(quat, rotPoint);
  return MathUtil.vec3addInPlace(ret, origin);
};

/**
 * Moves the camera upward or downward so that it faces
 * the same reference point at the same distance.
 * @param {number} angleDegrees The angle to rotate the camera,
 * in degrees. If the coordinate-system is right-handed, positive
 * values rotate the camera upward, and
 * negative values downward. If the coordinate-system is left-handed,
 * vice versa.
 * @returns {Camera} This object.
 */
Camera.prototype.moveAngleVertical = function(angleDegrees) {
  if(angleDegrees !== 0) {
    const viewVector = Camera._velocity(this.center, this.position);
    const orthoVector = MathUtil.vec3normalize(MathUtil.vec3cross(viewVector, this.up));
    const quat = MathUtil.quatFromAxisAngle(-angleDegrees, orthoVector);
    this.position = Camera._transformRel(quat, this.position, this.center);
    this.up = MathUtil.vec3normalizeInPlace(Camera._transformRel(quat, this.up, [0, 0, 0]));
    this._updateView();
  }
  return this;
};

/**
 * Moves the camera to the left or right so that it faces
 * the same reference point at the same distance.
 * @param {number} angleDegrees The angle to rotate the camera,
 * in degrees. If the coordinate-system is right-handed, positive
 * values rotate the camera leftward, and
 * negative values rightward. If the coordinate-system is left-handed,
 * vice versa.
 * @returns {Camera} This object.
 */
Camera.prototype.moveAngleHorizontal = function(angleDegrees) {
  if(angleDegrees !== 0) {
    const quat = MathUtil.quatFromAxisAngle(-angleDegrees, this.up);
    this.position = Camera._transformRel(quat, this.position, this.center);
    this._updateView();
  }
  return this;
};

/**
 * Turns the camera to the left or right so that it faces
 * the same distance from a reference point.
 * @param {number} angleDegrees The angle to rotate the camera,
 * in degrees. If the coordinate-system is right-handed, positive
 * values rotate the camera rightward, and
 * negative values leftward. If the coordinate-system is left-handed,
 * vice versa.
 * @returns {Camera} This object.
 */
Camera.prototype.turnAngleHorizontal = function(angleDegrees) {
  if(angleDegrees !== 0) {
    const quat = MathUtil.quatFromAxisAngle(angleDegrees, this.up);
    this.center = Camera._transformRel(quat, this.center, this.position);
    this._updateView();
  }
  return this;
};
/**
 * Turns the camera upward or downward so that it faces
 * the same distance from a reference point.
 * @param {number} angleDegrees The angle to rotate the camera,
 * in degrees. If the coordinate-system is right-handed, positive
 * values rotate the camera upward, and
 * negative values downward. If the coordinate-system is left-handed,
 * vice versa.
 * @returns {Camera} This object.
 */
Camera.prototype.turnAngleVertical = function(angleDegrees) {
  if(angleDegrees !== 0) {
    const viewVector = Camera._velocity(this.center, this.position);
    const orthoVector = MathUtil.vec3normalize(MathUtil.vec3cross(viewVector, this.up));
    const quat = MathUtil.quatFromAxisAngle(angleDegrees, orthoVector);
    this.center = Camera._transformRel(quat, this.center, this.position);
    this.up = MathUtil.vec3normalizeInPlace(Camera._transformRel(quat, this.up, [0, 0, 0]));
    this._updateView();
  }
  return this;
};
/**
 * Sets the position of the camera.
 * @param {number} cx The camera's new X coordinate,
 * or a 3-element vector containing the X, Y, and Z coordinates.
 * In the latter case, "cy" and "cz" can be omitted.
 * @param {number} [cy] The camera's new Y coordinate.
 * @param {number} [cz] The camera's new Z coordinate.
 * @returns {Camera} This object.
 */
Camera.prototype.setPosition = function(cx, cy, cz) {
  if(typeof cx === "number") {
    if(isNaN(cx) || isNaN(cy) || isNaN(cz))throw new Error();
    this.position[0] = cx;
    this.position[1] = cy;
    this.position[2] = cz;
    this._updateView();
    return this;
  } else {
    return this.setPosition(cx[0], cx[1], cx[2]);
  }
};

/**
 * Gets the position of the camera.
 * @returns {Array<number>} An array of three numbers giving
 * the X, Y, and Z coordinates of the camera's position, respectively.
 */
Camera.prototype.getPosition = function() {
  return MathUtil.vec3copy(this.position);
};

/**
 * Moves the camera the given distance, but not too close
 * to the reference point.
 * @param {number} dist The distance to move. Positive
 * values mean forward, and negative distances mean back.
 * @returns {Camera} This object.
 */
Camera.prototype.moveClose = function(dist) {
  return this.setDistance(this.getDistance() - dist);
};
/**
 * Moves the camera forward the given distance.
 * @param {number} dist The distance to move. Positive
 * values mean forward, and negative distances mean back.
 * @returns {Camera} This object.
 */
Camera.prototype.moveForward = function(dist) {
  if(dist !== 0) {
    const velocity = Camera._velocity(this.center, this.position);
    MathUtil.vec3scaleInPlace(velocity, dist);
    MathUtil.vec3addInPlace(this.position, velocity);
    MathUtil.vec3addInPlace(this.center, velocity);
    this._updateView();
  }
  return this;
};

/**
 * Moves the camera horizontally relative to the camera's up vector.
 * @param {number} dist Distance to move the camera.
 * @returns {Camera} This object.
 */
Camera.prototype.moveHorizontal = function(dist) {
  if(dist !== 0) {
    const viewVector = Camera._velocity(this.center, this.position);
    const orthoVector = MathUtil.vec3normalize(MathUtil.vec3cross(viewVector, this.up));
    MathUtil.vec3scaleInPlace(orthoVector, dist);
    MathUtil.vec3addInPlace(this.position, orthoVector);
    MathUtil.vec3addInPlace(this.center, orthoVector);
    this._updateView();
  }
  return this;
};
/**
 * Moves the camera toward or away from the camera's up vector.
 * @param {number} dist Distance to move the camera.
 * @returns {Camera} This object.
 */
Camera.prototype.moveVertical = function(dist) {
  if(dist !== 0) {
    const viewVector = MathUtil.vec3normalize(this.up);
    MathUtil.vec3scaleInPlace(viewVector, dist);
    MathUtil.vec3addInPlace(this.position, viewVector);
    MathUtil.vec3addInPlace(this.center, viewVector);
    this._updateView();
  }
  return this;
};
/**
 * Gets the 3-element vector that points from the reference
 * point to the camera's position.
 * @returns {Array<number>} The return value as a unit
 * vector (a ["normalized" vector]{@link MathUtil.vec3normalize} with a length of 1).
 * Returns (0,0,0) if the reference point is the same as the camera's position.
 */
Camera.prototype.getVectorFromCenter = function() {
  const posSub = MathUtil.vec3sub(this.position, this.center);
  return MathUtil.vec3normalizeInPlace(posSub);
};
/**
 * Updates information about this camera based
 * on the state of an input tracker.
 * @param {InputTracker} [input] An input tracker. This
 * method should be called right after the tracker's
 * 'update' method was called. <i>Note that future versions
 * may require this parameter.</i>
 * @returns {Object} Return value.
 */
Camera.prototype.update = function(input) {
  if(!input) {
    this.input.update();
  }
  return this._updateNew(input || this.input);
};
/** @ignore */
Camera.prototype._updateNew = function(input) {
  if(!input)return this;
  const delta = input.deltaXY();
  const deltaTicks = delta.ticks;
  if(input.leftButton) {
    if(this.trackballMode) {
      this._trackball(delta.x, delta.y, 0.3);
    } else {
      this._orbit(delta.x, delta.y, 0.3);
    }
  } else if(input.middleButton) {
    this._move(delta.x, delta.y, 0.3);
  }
  if(input.keys[InputTracker.A + 22]) { // letter W
    this.setDistance(this.getDistance() + 0.2);
  }
  if(input.keys[InputTracker.A + 18]) { // letter S
    this.setDistance(this.getDistance() - 0.2);
  }
  if(deltaTicks !== 0) {
    // mousewheel up (negative) means move forward,
    // mousewheel down (positive) means move back
    // console.log(deltaTicks);
    this.setDistance(this.getDistance() - 0.6 * deltaTicks);
  }
  return this;
};
