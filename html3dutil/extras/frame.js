/* global H3DU */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
/**
 * A class for finding the frame rate of an HTML rendering.
 * <p>This class is considered a supplementary class to the
 * Public Domain HTML 3D Library and is not considered part of that
 * library. <p>
 * To use this class, you must include the script "extras/frame.js"; the
 * class is not included in the "h3du_min.js" file which makes up
 * the HTML 3D Library. Example:<pre>
 * &lt;script type="text/javascript" src="extras/frame.js">&lt;/script></pre>
 * @class
 * @alias H3DU.FrameCounter
 */
H3DU.FrameCounter = function() {
  "use strict";
  this.fps = -1;
  this.lastFrame = -1;
  this.frameGaps = [];
  this.frameCount = 0;
};
/**
 * Updates the state for determining the frame count.
 * This method should be called once per frame.
 * @memberof! H3DU.FrameCounter#
 * @returns {Object} Return value.
 */
H3DU.FrameCounter.prototype.update = function() {
  "use strict";
  var now = "performance" in window ?
   window.performance.now() : new Date().getTime() * 1000;
  if(this.lastFrame >= 0) {
    var gap = now - this.lastFrame;
    if(this.frameGaps.length > 300)
      this.frameGaps.shift();
    if(gap > 5000) {
     // treat as a discontinuity, so discard all the
     // frame gaps recorded so far
      this.frameGaps = [];
    }
    this.frameGaps.push(gap);
  }
  this.lastFrame = now;
  this.frameCount++;
  if(this.frameGaps.length > 0 && this.frameCount >= 30) {
    this.frameCount = 0;
    var total = 0;
    for(var i = 0;i < this.frameGaps.length;i++) {
      total += this.frameGaps[i];
    }
    total /= 1.0 * this.frameGaps.length;
    this.fps = total <= 0 ? 60 : 1000.0 / total;
  }
};
/**
 * Gets the calculated frames per second, based
 * on how often the update method was called.
 * @memberof! H3DU.FrameCounter#
 * @returns {Object} Return value.
 */
H3DU.FrameCounter.prototype.getFPS = function() {
  "use strict";
  return this.fps;
};

/**
 * A class that displays a frame counter HTML element.
 * <p>This class is considered a supplementary class to the
 * Public Domain HTML 3D Library and is not considered part of that
 * library. <p>
 * To use this class, you must include the script "extras/frame.js"; the
 * class is not included in the "h3du_min.js" file which makes up
 * the HTML 3D Library. Example:<pre>
 * &lt;script type="text/javascript" src="extras/frame.js">&lt;/script></pre>
 * @class
 * @alias H3DU.FrameCounterDiv
 */
H3DU.FrameCounterDiv = function() {
  "use strict";
  this.div = H3DU.FrameCounterDiv._makeDiv();
  this.count = 0;
  this.fc = new H3DU.FrameCounter();
};
/** @private */
H3DU.FrameCounterDiv._makeDiv = function() {
  "use strict";
  var referenceElement = document.documentElement;
  var div = document.createElement("div");
  div.style.backgroundColor = "white";
  div.style.position = "absolute";
  div.style.zIndex = 10;
  div.style.left = referenceElement.offsetLeft + "px";
  div.style.top = referenceElement.offsetTop + "px";
  document.body.appendChild(div);
  return div;
};
/**
 * Updates the frame counter HTML element.
 * @memberof! H3DU.FrameCounterDiv#
 * @returns {Object} Return value.
 */
H3DU.FrameCounterDiv.prototype.update = function() {
  "use strict";
  this.fc.update();
  this.count += 1;
  if(this.count >= 20) {
    var fps = this.fc.getFPS();
    fps = Math.round(fps * 100);
    fps /= 100;
    if(fps >= 0) {
      this.div.innerHTML = fps + " fps";
      this.count = 0;
    }
  }
};

/**
 * This class used to manage an HTML element
 * that displayed the number of primitives drawn.
 * @deprecated Will be removed in the future.
 * @class
 * @alias PrimitiveCounter
 */
/* exported PrimitiveCounter */
var PrimitiveCounter = function() {
  "use strict";
  this.warned = false;
/**
 * This method used to update this object's state.
 * @deprecated Will be removed in the future.
 * @memberof! PrimitiveCounter
 * @alias update
 * @returns {Object} Return value.
 */
  this.update = function() {
    if(!this.warned)console.warn("PrimitiveCounter is deprecated");
    this.warned = true;
  };
};
/* exported FrameCounter */
/**
 * Alias for the {@link H3DU.FrameCounter} class.
 * @class
 * @alias FrameCounter
 * @deprecated Use {@link H3DU.FrameCounter} instead.
 */
var FrameCounter = H3DU.FrameCounter;
/* exported FrameCounterDiv */
/**
 * Alias for the {@link H3DU.FrameCounterDiv} class.
 * @class
 * @alias FrameCounterDiv
 * @deprecated Use {@link H3DU.FrameCounterDiv} instead.
 */
var FrameCounterDiv = H3DU.FrameCounterDiv;
