/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
/* global define, exports */
(function (g, f) {
  "use strict";
  if (typeof define === "function" && define.amd) {
    define(["exports"], f);
  } else if (typeof exports === "object") {
    f(exports);
  } else {
    f(g);
  }
}(this, function (exports) {
  "use strict";
  if (exports.H3DU && exports.H3DU.GraphicsPath) {
    return;
  }

  var LinkedListNode = function(item) {
    this.data = item;
    this.prev = null;
    this.next = null;
  };

  var LinkedList = function() {
    this.root = null;
    this._last = null;
    this.size = function() {
      var k = this.root;
      var ret = 0;
      while(k) {
        ret++;
        k = k.next;
      }
      return ret;
    };
    this.first = function() {
      return this.root;
    };
    this.last = function() {
      return this._last;
    };
    this.front = function() {
      return this.root ? this.root.data : null;
    };
    this.back = function() {
      return this._last ? this._last.data : null;
    };
    this.clear = function() {
      this.root = this._last = null;
    };
    this.spliceToBegin = function(list) {
      if(list.root) {
        this.root.prev = list._last;
        list._last.next = this.root;
        this.root = list.root;
        list.clear();
      }
    };
    this.spliceToEnd = function(list) {
      if(list.root) {
        this._last.next = list.root;
        list.root.prev = this._last;
        this._last = list._last;
        list.clear();
      }
    };
    this.spliceOneToEnd = function(list, listNode) {
      list.erase(listNode);
      return this.push(listNode.data);
    };
    this.erase = function(node) {
      if(!node)return this;
      if(node === this.root) {
        this.root = node.next;
      }
      if(node === this._last) {
        this._last = node.prev;
      }
      if(node.prev)
        node.prev.next = node.next;
      if(node.next)
        node.next.prev = node.prev;
      return this;
    };
    this.insertAfter = function(item, node) {
      var newNode = new LinkedListNode(item);
      if(node === this._last)
        this._last = newNode;
      var oldNext = node.next;
      node.next = newNode;
      newNode.prev = node;
      newNode.next = oldNext;
      if(oldNext) {
        oldNext.prev = newNode;
      }
      return newNode;
    };
    this.push = function(item) {
      if(!this.root) {
        this.root = this._last = new LinkedListNode(item);
      } else {
        var node = new LinkedListNode(item);
        this._last.next = node;
        node.prev = this._last;
        this._last = node;
      }
      return this;
    };
    this.reverse = function() {
      var s = this.root;
      var e = this._last;
      if(!s)return;
      var oldlast = e;
      var oldroot = s;
      while(s) {
        var n = s.next;
        var p = s.prev;
        s.prev = n;
        s.next = p;
        s = n;
      }
      this.root = oldlast;
      this._last = oldroot;
      return this;
    };
    this.unshift = function(item) {
      if(!this.root) {
        this.root = this._last = new LinkedListNode(item);
      } else {
        var node = new LinkedListNode(item);
        this.root.prev = node;
        node.next = this.root;
        this.root = node;
      }
      return this;
    };
    this.pop = function() {
      if(this._last) {
        if(this._last.prev)
          this._last.prev.next = null;
        this._last = this._last.prev;
      }
      return this;
    };
    this.shift = function() {
      if(this.root) {
        if(this.root.next)
          this.root.next.prev = null;
        this.root = this.root.next;
      }
      return this;
    };
  };

  // --------------------------------------------------

  /**
   * Represents a two-dimensional path.
   * <p>This class is considered a supplementary class to the
   * Public Domain HTML 3D Library and is not considered part of that
   * library. <p>
   * To use this class, you must include the script "extras/path.js"; the
   * class is not included in the "h3du_min.js" file which makes up
   * the HTML 3D Library. Example:<pre>
   * &lt;script type="text/javascript" src="extras/path.js">&lt;/script></pre>
   * Some methods may be defined in other scripts, in which case the
   * script to be included this way will be mentioned.
   * @memberof H3DU
   * @alias H3DU.GraphicsPath
   * @class
   */
  function GraphicsPath() {
    this.segments = [];
    this.incomplete = false;
    this.startPos = [0, 0];
    this.endPos = [0, 0];
  }
/** @ignore */
  var Triangulate = {};
  GraphicsPath.CLOSE = 0;
  GraphicsPath.LINE = 1;
  GraphicsPath.QUAD = 2;
  GraphicsPath.CUBIC = 3;
  GraphicsPath.ARC = 4;
/**
 * Returns whether the curve path is incomplete
 * because of an error in parsing the curve string.
 * This flag will be reset if a moveTo command,
 * closePath command, or another path segment
 * is added to the path.
 * @returns {Boolean} Return value.
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.isIncomplete = function() {
    return this.incomplete;
  };
/** @ignore */
  GraphicsPath._startPoint = function(a) {
    if(a[0] === GraphicsPath.CLOSE) {
      return [0, 0];
    } else {
      return [a[1], a[2]];
    }
  };
/** @ignore */
  GraphicsPath._endPoint = function(a) {
    if(a[0] === GraphicsPath.CLOSE) {
      return [0, 0];
    } else if(a[0] === GraphicsPath.ARC) {
      return [a[8], a[9]];
    } else {
      return [a[a.length - 2], a[a.length - 1]];
    }
  };
/** @ignore */
  GraphicsPath._point = function(seg, t) {
    var a, b, x, y;
    if(seg[0] === GraphicsPath.CLOSE) {
      return [0, 0];
    } else if(seg[0] === GraphicsPath.LINE) {
      return [
        seg[1] + (seg[3] - seg[1]) * t,
        seg[2] + (seg[4] - seg[2]) * t
      ];
    } else if(seg[0] === GraphicsPath.QUAD) {
      var mt = 1 - t;
      var mtsq = mt * mt;
      var mt2 = mt + mt;
      a = seg[1] * mtsq;
      b = seg[3] * mt2;
      x = a + t * (b + t * seg[5]);
      a = seg[2] * mtsq;
      b = seg[4] * mt2;
      y = a + t * (b + t * seg[6]);
      return [x, y];
    } else if(seg[0] === GraphicsPath.CUBIC) {
      a = (seg[3] - seg[1]) * 3;
      b = (seg[5] - seg[3]) * 3 - a;
      var c = seg[7] - a - b - seg[1];
      x = seg[1] + t * (a + t * (b + t * c));
      a = (seg[4] - seg[2]) * 3;
      b = (seg[6] - seg[4]) * 3 - a;
      c = seg[8] - a - b - seg[2];
      y = seg[2] + t * (a + t * (b + t * c));
      return [x, y];
    } else if(seg[0] === GraphicsPath.ARC) {
      if(t === 0)return [seg[1], seg[2]];
      if(t === 1)return [seg[8], seg[9]];
      var rx = seg[3];
      var ry = seg[4];
      var cx = seg[10];
      var cy = seg[11];
      var theta = seg[12];
      var delta = seg[13] - seg[12];
      var rot = seg[5];
      var angle = theta + delta * t;
      var cr = Math.cos(rot);
      var sr = rot >= 0 && rot < 6.283185307179586 ? rot <= 3.141592653589793 ? Math.sqrt(1.0 - cr * cr) : -Math.sqrt(1.0 - cr * cr) : Math.sin(rot);
      var ca = Math.cos(angle);
      var sa = angle >= 0 && angle < 6.283185307179586 ? angle <= 3.141592653589793 ? Math.sqrt(1.0 - ca * ca) : -Math.sqrt(1.0 - ca * ca) : Math.sin(angle);
      return [
        cr * ca * rx - sr * sa * ry + cx,
        sr * ca * rx + cr * sa * ry + cy];
    } else {
      return [0, 0];
    }
  };
/** @ignore */
  GraphicsPath._normalize = function(v2) {
    var len = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1]);
    if(len !== 0) {
      var ilen = 1.0 / len;
      v2[0] *= ilen;
      v2[1] *= ilen;
    }
    return v2;
  };

  /** @ignore */
  GraphicsPath._tangent = function(seg, t) {
    var a, b, x, y;
    if(seg[0] === GraphicsPath.LINE) {
      return GraphicsPath._normalize([
        seg[3] - seg[1],
        seg[4] - seg[2]
      ]);
    } else if(seg[0] === GraphicsPath.QUAD) {
      var tm1 = t - 1;
      return GraphicsPath._normalize([
        2 * (seg[1] * tm1 - seg[3] * tm1 - seg[3] * t + seg[5] * t),
        2 * (seg[2] * tm1 - seg[4] * tm1 - seg[4] * t + seg[6] * t)
      ]);
    } else if(seg[0] === GraphicsPath.CUBIC) {
      tm1 = t - 1;
      var tm1sq = tm1 * tm1;
      var c = seg[5] - seg[7];
      b = 2 * seg[5] * tm1 - 2 * seg[3] * tm1;
      a = seg[1] * tm1sq - seg[3] * tm1sq;
      x = 3 * (a + t * (b + t * c));
      c = seg[6] - seg[8];
      b = 2 * seg[6] * tm1 - 2 * seg[4] * tm1;
      a = seg[2] * tm1sq - seg[4] * tm1sq;
      y = 3 * (a + t * (b + t * c));
      return GraphicsPath._normalize([x, y]);
    } else if(seg[0] === GraphicsPath.ARC) {
      var rx = seg[3];
      var ry = seg[4];
      var theta = seg[12];
      var delta = seg[13] - seg[12];
      var rot = seg[5];
      var angle = theta + delta * t;
      var cr = Math.cos(rot);
      var sr = rot >= 0 && rot < 6.283185307179586 ? rot <= 3.141592653589793 ? Math.sqrt(1.0 - cr * cr) : -Math.sqrt(1.0 - cr * cr) : Math.sin(rot);
      var ca = Math.cos(angle);
      var sa = angle >= 0 && angle < 6.283185307179586 ? angle <= 3.141592653589793 ? Math.sqrt(1.0 - ca * ca) : -Math.sqrt(1.0 - ca * ca) : Math.sin(angle);
      var caDeriv = -sa * delta;
      var saDeriv = ca * delta;
      return GraphicsPath._normalize([
        cr * caDeriv * rx - sr * saDeriv * ry,
        sr * caDeriv * rx + cr * saDeriv * ry]);
    } else {
      return [0, 0];
    }
  };

/** @ignore */
  GraphicsPath._subdivide2 = function(a1, a2, a3, a4, a5, a6, a7, a8, t1, t2, tcut, list, flatness, mode, depth) {
    var x1 = a1 + (a3 - a1) * tcut;
    var x2 = a3 + (a5 - a3) * tcut;
    var xc1 = x1 + (x2 - x1) * tcut;
    var x3 = a5 + (a7 - a5) * tcut;
    var xc2 = x2 + (x3 - x2) * tcut;
    var xd = xc1 + (xc2 - xc1) * tcut;
    var y1 = a2 + (a4 - a2) * tcut;
    var y2 = a4 + (a6 - a4) * tcut;
    var yc1 = y1 + (y2 - y1) * tcut;
    var y3 = a6 + (a8 - a6) * tcut;
    var yc2 = y2 + (y3 - y2) * tcut;
    var yd = yc1 + (yc2 - yc1) * tcut;
    var tmid = t1 + (t2 - t1) * tcut;
    GraphicsPath._flattenCubic(a1, a2, x1, y1, xc1, yc1, xd, yd, t1, tmid, list, flatness, mode, depth + 1);
    GraphicsPath._flattenCubic(xd, yd, xc2, yc2, x3, y3, a7, a8, tmid, t2, list, flatness, mode, depth + 1);
  };
/** @ignore */
  GraphicsPath._subdivide3 = function(a1, a2, a3, a4, a5, a6, a7, a8, t1, t2, tcut, tcut2, list, flatness, mode, depth) {
    var x1 = a1 + (a3 - a1) * tcut;
    var x2 = a3 + (a5 - a3) * tcut;
    var xc1 = x1 + (x2 - x1) * tcut;
    var x3 = a5 + (a7 - a5) * tcut;
    var xc2 = x2 + (x3 - x2) * tcut;
    var xd = xc1 + (xc2 - xc1) * tcut;
    var y1 = a2 + (a4 - a2) * tcut;
    var y2 = a4 + (a6 - a4) * tcut;
    var yc1 = y1 + (y2 - y1) * tcut;
    var y3 = a6 + (a8 - a6) * tcut;
    var yc2 = y2 + (y3 - y2) * tcut;
    var yd = yc1 + (yc2 - yc1) * tcut;
    var tmid = t1 + (t2 - t1) * tcut;
    var tcutx = (tcut2 - tmid) / (t2 - tmid);
    GraphicsPath._flattenCubic(a1, a2, x1, y1, xc1, yc1, xd, yd, t1, tmid, list, flatness, mode, depth + 1);
    GraphicsPath._subdivide2(xd, yd, xc2, yc2, x3, y3, a7, a8, tmid, t2, tcutx, list, flatness, mode, depth + 1);
  };
/** @ignore */
  GraphicsPath._flattenCubic = function(a1, a2, a3, a4, a5, a6, a7, a8, t1, t2, list, flatness, mode, depth) {
    if(typeof depth === "undefined" || depth === null)depth = 0;
 /* if(depth<1) {
  // subdivide the curve at the inflection points
  var ax=a1-3*a3+3*a5-a7
  var ay=a2-3*a4+3*a6-a8
  var tx=(ax === 0) ? -1 : (a1-2*a3+a5)/ax
  var ty=(ay === 0) ? -1 : (a2-2*a4+a6)/ay
  if(tx>=1)tx=-1
  if(ty>=1)ty=-1
  if(tx>0 && ty>0) {
   var tmin=Math.min(tx,ty)
   var tmax=Math.max(tx,ty)
   GraphicsPath._subdivide3(a1,a2,a3,a4,a5,a6,a7,a8,t1,t2,tmin,tmax,list,flatness,mode,depth)
   return
  } else if(tx>0) {
   GraphicsPath._subdivide2(a1,a2,a3,a4,a5,a6,a7,a8,t1,t2,tx,list,flatness,mode,depth)
   return
  } else if(ty>0) {
   GraphicsPath._subdivide2(a1,a2,a3,a4,a5,a6,a7,a8,t1,t2,ty,list,flatness,mode,depth)
   return
  }
 }*/
    if(depth >= 20 || Math.abs(a1 - a3 - a3 + a5) + Math.abs(a3 - a5 - a5 + a7) +
    Math.abs(a2 - a4 - a4 + a6) + Math.abs(a4 - a6 - a6 + a8) <= flatness) {
      if(mode === 0) {
        list.push([a1, a2, a7, a8]);
      } else {
        var dx = a7 - a1;
        var dy = a8 - a2;
        var length = Math.sqrt(dx * dx + dy * dy);
        list.push(t1, t2, length);
      }
    } else {
      GraphicsPath._subdivide2(a1, a2, a3, a4, a5, a6, a7, a8, t1, t2, 0.5, list, flatness, mode, depth);
    }
  };
/** @ignore */
  GraphicsPath._flattenQuad = function(a1, a2, a3, a4, a5, a6, t1, t2, list, flatness, mode, depth) {
    if(typeof depth === "undefined" || depth === null)depth = 0;
    if(depth >= 20 || Math.abs(a1 - a3 - a3 + a5) + Math.abs(a2 - a4 - a4 + a6) <= flatness) {
      if(mode === 0) {
        list.push([a1, a2, a5, a6]);
      } else {
        var dx = a5 - a1;
        var dy = a6 - a2;
        var length = Math.sqrt(dx * dx + dy * dy);
        list.push(t1, t2, length);
      }
    } else {
      var x1 = (a1 + a3) * 0.5;
      var x2 = (a3 + a5) * 0.5;
      var xc = (x1 + x2) * 0.5;
      var y1 = (a2 + a4) * 0.5;
      var y2 = (a4 + a6) * 0.5;
      var yc = (y1 + y2) * 0.5;
      var tmid = (t1 + t2) * 0.5;
      GraphicsPath._flattenQuad(a1, a2, x1, y1, xc, yc, t1, tmid, list, flatness, mode, depth + 1);
      GraphicsPath._flattenQuad(xc, yc, x2, y2, a5, a6, tmid, t2, list, flatness, mode, depth + 1);
    }
  };
/** @ignore */
  GraphicsPath._flattenArc = function(a, t1, t2, list, flatness, mode, depth) {
    var rot = a[5];
    var crot = Math.cos(rot);
    var srot = rot >= 0 && rot < 6.283185307179586 ? rot <= 3.141592653589793 ? Math.sqrt(1.0 - crot * crot) : -Math.sqrt(1.0 - crot * crot) : Math.sin(rot);
    var ellipseInfo = [a[3], a[4], a[10], a[11], crot, srot];
    GraphicsPath._flattenArcInternal(ellipseInfo, a[1], a[2], a[8], a[9], a[12], a[13], t1, t2, list, flatness, mode, depth);
  };
/** @ignore */
  GraphicsPath._flattenArcInternal = function(ellipseInfo, x1, y1, x2, y2, theta1, theta2, t1, t2, list, flatness, mode, depth) {
    if(typeof depth === "undefined" || depth === null)depth = 0;
    var thetaMid = (theta1 + theta2) * 0.5;
    var tmid = (t1 + t2) * 0.5;
    var ca = Math.cos(thetaMid);
    var sa = thetaMid >= 0 && thetaMid < 6.283185307179586 ? thetaMid <= 3.141592653589793 ? Math.sqrt(1.0 - ca * ca) : -Math.sqrt(1.0 - ca * ca) : Math.sin(thetaMid);
    var xmid = ellipseInfo[4] * ca * ellipseInfo[0] - ellipseInfo[5] * sa * ellipseInfo[1] + ellipseInfo[2];
    var ymid = ellipseInfo[5] * ca * ellipseInfo[0] + ellipseInfo[4] * sa * ellipseInfo[1] + ellipseInfo[3];
    if(depth >= 20 || Math.abs(x1 - xmid - xmid + x2) + Math.abs(y1 - ymid - ymid + y2) <= flatness) {
      if(mode === 0) {
        list.push([x1, y1, xmid, ymid]);
        list.push([xmid, ymid, x2, y2]);
      } else {
        var dx = xmid - x1;
        var dy = ymid - y1;
        var length = Math.sqrt(dx * dx + dy * dy);
        list.push(t1, tmid, length);
        dx = x2 - xmid;
        dy = y2 - ymid;
        length = Math.sqrt(dx * dx + dy * dy);
        list.push(tmid, t2, length);
      }
    } else {
      GraphicsPath._flattenArcInternal(ellipseInfo, x1, y1, xmid, ymid, theta1, thetaMid, t1, tmid, list, flatness, mode, depth + 1);
      GraphicsPath._flattenArcInternal(ellipseInfo, xmid, ymid, x2, y2, thetaMid, theta2, tmid, t2, list, flatness, mode, depth + 1);
    }
  };
/** @ignore */
  GraphicsPath.prototype._start = function() {
    for(var i = 0; i < this.segments.length; i++) {
      var s = this.segments[i];
      if(s[0] !== GraphicsPath.CLOSE)return GraphicsPath._startPoint(s);
    }
    return [0, 0];
  };
/** @ignore */
  GraphicsPath.prototype._end = function() {
    for(var i = this.segments.length - 1; i >= 0; i--) {
      var s = this.segments[i];
      if(s[0] !== GraphicsPath.CLOSE)return GraphicsPath._endPoint(s);
    }
    return [0, 0];
  };

/**
 * Merges the path segments in another path onto this one.
 * @param {H3DU.GraphicsPath} path Another graphics path.
 * Can be null.
 * @returns {H3DU.GraphicsPath} This object.
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.merge = function(path) {
    var oldpos = null;
    if(!path)return this;
    var segsLength = path.segments.length;
    for(var i = 0; i < segsLength; i++) {
      var a = path.segments[i];
      if(a[0] === GraphicsPath.CLOSE) {
        this.closePath();
      } else {
        var start = GraphicsPath._startPoint(a);
        if(!oldpos || oldpos[0] !== start[0] || oldpos[1] !== start[1]) {
          this.moveTo(start[0], start[1]);
        }
        oldpos = GraphicsPath._endPoint(a);
        if(a[0] === GraphicsPath.LINE) {
          this.lineTo(a[3], a[4]);
        }
        if(a[0] === GraphicsPath.QUAD) {
          this.quadraticCurveTo(a[3], a[4], a[5], a[6]);
        }
        if(a[0] === GraphicsPath.CUBIC) {
          this.bezierCurveTo(a[3], a[4], a[5], a[6], a[7], a[8]);
        }
        if(a[0] === GraphicsPath.ARC) {
          var delta = a[13] - a[12];
          var largeArc = Math.abs(delta) > Math.PI;
          this.arcSvgTo(a[3], a[4], a[5] * GraphicsPath._toDegrees,
                largeArc, delta > 0, a[8], a[9]);
        }
      }
    }
    return this;
  };

/**
 * Returns this path in the form of a string in SVG path format.
 * See {@link H3DU.GraphicsPath.fromString}.
 * @returns {String} A string describing the path in the SVG path
 * format.
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.toString = function() {
    var oldpos = null;
    var ret = "";

    for(var i = 0; i < this.segments.length; i++) {
      var a = this.segments[i];
      if(a[0] === GraphicsPath.CLOSE) {
        ret += "Z";
      } else {
        var start = GraphicsPath._startPoint(a);
        if(!oldpos || oldpos[0] !== start[0] || oldpos[1] !== start[1]) {
          ret += "M" + start[0] + "," + start[1];
        }
        oldpos = GraphicsPath._endPoint(a);
        if(a[0] === GraphicsPath.LINE) {
          ret += "L" + a[3] + "," + a[4];
        }
        if(a[0] === GraphicsPath.QUAD) {
          ret += "Q" + a[3] + "," + a[4] + "," + a[5] + "," + a[6];
        }
        if(a[0] === GraphicsPath.CUBIC) {
          ret += "C" + a[3] + "," + a[4] + "," + a[5] + "," + a[6] + "," + a[7] + "," + a[8];
        }
        if(a[0] === GraphicsPath.ARC) {
          var delta = a[13] - a[12];
          var largeArc = Math.abs(delta) > Math.PI;
          ret += "A" + a[3] + "," + a[4] + "," + a[5] * 180 / Math.PI + "," +
      (largeArc ? "1" : "0") + (delta > 0 ? "1" : "0") + a[8] + "," + a[9];
        }
      }
    }
    return ret;
  };
   /** @ignore */
  GraphicsPath._quadCurveLength = function(x1, y1, x2, y2, x3, y3) {
    var integrand = function(t) {
      // Length of derivative of quadratic Bezier vector function
      var tm1 = t - 1;
      var x = x1 * tm1 - x2 * tm1 - x2 * t + x3 * t;
      var y = y1 * tm1 - y2 * tm1 - y2 * t + y3 * t;
      return Math.sqrt(4 * x * x + 4 * y * y); // (2*x,2*y) is derivative
    };
    return GraphicsPath._numIntegrate(integrand, 0, 1);
  };
/** @ignore */
  GraphicsPath._cubicCurveLength = function(x1, y1, x2, y2, x3, y3, x4, y4) {
    var integrand = function(t) {
      // Length of derivative of cubic Bezier vector function
      var tm1 = t - 1;
      var tm1sq = tm1 * tm1;
      var c = x3 - x4;
      var b = 2 * x3 * tm1 - 2 * x2 * tm1;
      var a = x1 * tm1sq - x2 * tm1sq;
      var x = a + t * (b + t * c);
      c = y3 - y4;
      b = 2 * y3 * tm1 - 2 * y2 * tm1;
      a = y1 * tm1sq - y2 * tm1sq;
      var y = a + t * (b + t * c);
      return Math.sqrt(9 * x * x + 9 * y * y); // (3*x,3*y) is derivative
    };
    return GraphicsPath._numIntegrate(integrand, 0, 1);
  };
/** @ignore */
  GraphicsPath._length = function(a) {
    if(a[0] === GraphicsPath.LINE) {
      var dx = a[3] - a[1];
      var dy = a[4] - a[2];
      return Math.sqrt(dx * dx + dy * dy);
    } else if(a[0] === GraphicsPath.QUAD) {
      return GraphicsPath._quadCurveLength(a[1], a[2], a[3], a[4],
     a[5], a[6]);
    } else if(a[0] === GraphicsPath.CUBIC) {
      return GraphicsPath._cubicCurveLength(a[1], a[2], a[3], a[4],
     a[5], a[6], a[7], a[8]);
    } else if(a[0] === GraphicsPath.ARC) {
      var rx = a[3];
      var ry = a[4];
      var theta = a[12];
      var theta2 = a[13];
      return GraphicsPath._ellipticArcLength(rx, ry, theta, theta2);
    } else {
      return 0;
    }
  };

/**
 * Finds the approximate length of this path.
 * @param {Number} [flatness] No longer used by this method.
 * @returns {Number} Approximate length of this path
 * in units.
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.pathLength = function() {
    if(this.segments.length === 0)return 0;
    var totalLength = 0;
    for(var i = 0; i < this.segments.length; i++) {
      var s = this.segments[i];
      var len = GraphicsPath._length(s);
      totalLength += len;
    }
    return totalLength;
  };
/**
 * Gets an array of line segments approximating
 * the path.
 * @param {Number} [flatness] When curves and arcs
 * are decomposed to line segments, the
 * segments will be close to the true path of the curve by this
 * value, given in units. If null or omitted, default is 1.
 * @returns {Array<Array<Number>>} Array of line segments.
 * Each line segment is an array of four numbers: the X and
 * Y coordinates of the start point, respectively, then the X and
 * Y coordinates of the end point, respectively.
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.getLines = function(flatness) {
    var ret = [];
    if(typeof flatness === "undefined" || flatness === null)flatness = 1.0;
    for(var i = 0; i < this.segments.length; i++) {
      var s = this.segments[i];
      if(s[0] === GraphicsPath.QUAD) {
        GraphicsPath._flattenQuad(s[1], s[2], s[3], s[4],
     s[5], s[6], 0.0, 1.0, ret, flatness * 2, 0);
      } else if(s[0] === GraphicsPath.CUBIC) {
        GraphicsPath._flattenCubic(s[1], s[2], s[3], s[4],
     s[5], s[6], s[7], s[8], 0.0, 1.0, ret, flatness * 2, 0);
      } else if(s[0] === GraphicsPath.ARC) {
        GraphicsPath._flattenArc(s, 0.0, 1.0, ret, flatness * 2, 0);
      } else if(s[0] !== GraphicsPath.CLOSE) {
        ret.push([s[1], s[2], s[3], s[4]]);
      }
    }
    return ret;
  };
/**
 * Creates a path in which curves and arcs are decomposed
 * to line segments.
 * @param {Number} [flatness] When curves and arcs
 * are decomposed to line segments, the
 * segments will be close to the true path of the curve by this
 * value, given in units. If null or omitted, default is 1.
 * @returns {H3DU.GraphicsPath} A path consisting only of line
 * segments and close commands.
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.toLinePath = function(flatness) {
    var ret = [];
    var path = new GraphicsPath();
    var last = null;
    if(typeof flatness === "undefined" || flatness === null)flatness = 1.0;
    for(var i = 0; i < this.segments.length; i++) {
      var s = this.segments[i];
      if(s[0] === GraphicsPath.CLOSE) {
        path.closePath();

 // oldpos = null;
        continue;
      }
      var j;
      var endpt = GraphicsPath._endPoint(s);
      var startpt = GraphicsPath._startPoint(s);
      if(!last || last[0] !== startpt[0] || last[1] !== startpt[1]) {
        path.moveTo(startpt[0], startpt[1]);
      }
      last = endpt;
      ret.splice(0, ret.length);
      if(s[0] === GraphicsPath.QUAD) {
        GraphicsPath._flattenQuad(s[1], s[2], s[3], s[4],
     s[5], s[6], 0.0, 1.0, ret, flatness * 2, 0);
        for(j = 0; j < ret.length; j++) {
          path.lineTo(ret[j][2], ret[j][3]);
        }
      } else if(s[0] === GraphicsPath.CUBIC) {
        GraphicsPath._flattenCubic(s[1], s[2], s[3], s[4],
     s[5], s[6], s[7], s[8], 0.0, 1.0, ret, flatness * 2, 0);
        for(j = 0; j < ret.length; j++) {
          path.lineTo(ret[j][2], ret[j][3]);
        }
      } else if(s[0] === GraphicsPath.ARC) {
        GraphicsPath._flattenArc(s, 0.0, 1.0, ret, flatness * 2, 0);
        for(j = 0; j < ret.length; j++) {
          path.lineTo(ret[j][2], ret[j][3]);
        }
      } else if(s[0] !== GraphicsPath.CLOSE) {
        path.lineTo(s[3], s[4]);
      } else {
        path.closePath();
      }
    }
    return path;
  };

  /**
   * Creates a path in which arcs are decomposed
   * to cubic B&eacute;zier curves (which will approximate those arcs).
   * @returns {H3DU.GraphicsPath} A path consisting only of line
   * segments, B&eacute;zier curves, and close commands.
   * @instance
   * @memberof! H3DU.GraphicsPath#
   */
  GraphicsPath.prototype.toCurvePath = function() {
    var path = new GraphicsPath();
    var last = null;
    for(var i = 0; i < this.segments.length; i++) {
      var s = this.segments[i];
      if(s[0] === GraphicsPath.CLOSE) {
        path.closePath();
        continue;
      }
      var j;
      var endpt = GraphicsPath._endPoint(s);
      var startpt = GraphicsPath._startPoint(s);
      if(!last || last[0] !== startpt[0] || last[1] !== startpt[1]) {
        path.moveTo(startpt[0], startpt[1]);
      }
      last = endpt;
      if(s[0] === GraphicsPath.QUAD) {
        path.quadraticCurveTo(s[3], s[4],
     s[5], s[6]);
      } else if(s[0] === GraphicsPath.CUBIC) {
        path.bezierCurveTo(s[3], s[4],
     s[5], s[6], s[7], s[8]);
      } else if(s[0] === GraphicsPath.ARC) {
        var curves = GraphicsPath._arcToBezierCurves(s[10], s[11], s[3], s[4], s[5], s[12], s[13]);
        for(j = 0; j < curves.length; j++) {
          path.bezierCurveTo(curves[j][2], curves[j][3], curves[j][4],
    curves[j][5], curves[j][6], curves[j][7]);
        }
      } else if(s[0] === GraphicsPath.LINE) {
        path.lineTo(s[3], s[4]);
      }
    }
    return path;
  };

  /** @ignore */
  GraphicsPath._accBounds = function(ret, s, t) {
    if(t >= 0 && t <= 1) {
      var pt = GraphicsPath._point(s, t);
      ret[0] = Math.min(pt[0], ret[0]);
      ret[1] = Math.min(pt[1], ret[1]);
      ret[2] = Math.max(pt[0], ret[2]);
      ret[3] = Math.max(pt[1], ret[3]);
    }
  };
  /** @ignore */
  GraphicsPath._accBoundsPoint = function(ret, x, y) {
    ret[0] = Math.min(x, ret[0]);
    ret[1] = Math.min(y, ret[1]);
    ret[2] = Math.max(x, ret[2]);
    ret[3] = Math.max(y, ret[3]);
  };
/** @ignore */
  GraphicsPath._accBoundsArc = function(ret, rx, ry, cphi, sphi, cx, cy, angle) {
    var ca = Math.cos(angle);
    var sa = angle >= 0 && angle < 6.283185307179586 ? angle <= 3.141592653589793 ? Math.sqrt(1.0 - ca * ca) : -Math.sqrt(1.0 - ca * ca) : Math.sin(angle);
    var px = cphi * ca * rx - sphi * sa * ry + cx;
    var py = sphi * ca * rx + cphi * sa * ry + cy;
    ret[0] = Math.min(px, ret[0]);
    ret[1] = Math.min(py, ret[1]);
    ret[2] = Math.max(px, ret[2]);
    ret[3] = Math.max(py, ret[3]);
  };
/** @ignore */
  GraphicsPath._normAngleRadians = function(angle) {
    var twopi = Math.PI * 2;
    var normAngle = angle;
    if(normAngle >= 0) {
      normAngle = normAngle < twopi ? normAngle : normAngle % twopi;
    } else {
      normAngle %= twopi;
      normAngle += twopi;
    }
    return normAngle;
  };
/** @ignore */
  GraphicsPath._angleInRange = function(angle, startAngle, endAngle) {
    var twopi = Math.PI * 2;
    var diff = endAngle - startAngle;
    if(Math.abs(diff) >= twopi)return true;
    var normAngle = GraphicsPath._normAngleRadians(angle);
    var normStart = GraphicsPath._normAngleRadians(startAngle);
    var normEnd = GraphicsPath._normAngleRadians(endAngle);
    if(startAngle === endAngle) {
      return normAngle === normStart;
    } else if(startAngle < endAngle) {
      if(normStart < normEnd) {
        return normAngle >= normStart && normAngle <= normEnd;
      } else {
        return normAngle >= normStart || normAngle <= normEnd;
      }
    } else if(normEnd < normStart) {
      return normAngle >= normEnd && normAngle <= normStart;
    } else {
      return normAngle >= normEnd || normAngle <= normStart;
    }
  };
/**
 * Calculates an axis-aligned bounding box that tightly
 * fits this graphics path.
 * @returns {Array<Number>} An array of four numbers
 * describing the bounding box. The first two are
 * the lowest X and Y coordinates, and the last two are
 * the highest X and Y coordinates. If the path is empty,
 * returns the array (Infinity, Infinity, -Infinity, -Infinity).
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.getBounds = function() {
    var inf = Number.POSITIVE_INFINITY;
    var ret = [inf, inf, -inf, inf];
    var first = true;
    for(var i = 0; i < this.segments.length; i++) {
      var s = this.segments[i];
      var ax, ay;
      if(s[0] === GraphicsPath.CLOSE)continue;
      var endpt = GraphicsPath._endPoint(s);
      var x1 = s[1],
        y1 = s[2],
        x2 = endpt[0],
        y2 = endpt[1];
      if(first) {
        ret[0] = Math.min(x1, x2);
        ret[1] = Math.min(y1, y2);
        ret[2] = Math.max(x1, x2);
        ret[3] = Math.max(y1, y2);
      } else {
        ret[0] = Math.min(x1, x2, ret[0]);
        ret[1] = Math.min(y1, y2, ret[1]);
        ret[2] = Math.max(x1, x2, ret[2]);
        ret[3] = Math.max(y1, y2, ret[3]);
      }
      first = false;
      if(s[0] === GraphicsPath.QUAD) {
        x2 = s[5];
        y2 = s[6];
        ax = x1 - 2 * s[3] + x2;
        ay = y1 - 2 * s[4] + y2;
        if(ax !== 0) {
          GraphicsPath._accBounds(ret, s, (x1 - s[3]) / ax);
        }
        if(ay !== 0) {
          GraphicsPath._accBounds(ret, s, (y1 - s[4]) / ay);
        }
      } else if(s[0] === GraphicsPath.CUBIC) {
        x2 = s[7];
        y2 = s[8];
        var denomX = x1 - 3 * s[3] + 3 * s[5] - x2;
        var denomY = y1 - 3 * s[4] + 3 * s[6] - y2;
        if(denomX !== 0 || denomY !== 0) {
          ax = x1 - 2 * s[3] + s[5];
          ay = y1 - 2 * s[4] + s[6];
          var bx = s[3] * s[3] + s[5] * s[5] - s[5] * (x1 + s[3]) + x2 * (x1 - s[3]);
          var by = s[4] * s[4] + s[6] * s[6] - s[6] * (y1 + s[4]) + y2 * (y1 - s[4]);
          if(bx >= 0 && denomX !== 0) {
            bx = Math.sqrt(bx);
            GraphicsPath._accBounds(ret, s, (ax - bx) / denomX);
            GraphicsPath._accBounds(ret, s, (ax + bx) / denomX);
          }
          if(by >= 0 && denomY !== 0) {
            by = Math.sqrt(by);
            GraphicsPath._accBounds(ret, s, (ay - by) / denomY);
            GraphicsPath._accBounds(ret, s, (ay + by) / denomY);
          }
        }
      } else if(s[0] === GraphicsPath.ARC) {
        var rx = s[3];
        var ry = s[4];
        var cx = s[10];
        var cy = s[11];
        var theta = s[12];
        var delta = s[13];
        var rot = s[5]; // Rotation in radians
        var cosp, sinp;
        if(Math.abs(delta - theta) >= Math.PI * 2) {
    // This arc goes around the entire ellipse, giving
    // it a much simpler formula for the bounding box
          var distx, disty;
          if(rx === ry) {
       // The arc forms a circle
            distx = rx;
            disty = ry;
          } else {
            cosp = Math.cos(rot);
            sinp = rot >= 0 && rot < 6.283185307179586 ? rot <= 3.141592653589793 ? Math.sqrt(1.0 - cosp * cosp) : -Math.sqrt(1.0 - cosp * cosp) : Math.sin(rot);
            ax = cosp * rx;
            ay = sinp * rx;
            bx = -sinp * ry;
            by = cosp * ry;
            distx = Math.sqrt(ax * ax + bx * bx);
            disty = Math.sqrt(ay * ay + by * by);
          }
          GraphicsPath._accBoundsPoint(ret, cx + distx, cy + disty);
          GraphicsPath._accBoundsPoint(ret, cx + distx, cy - disty);
          GraphicsPath._accBoundsPoint(ret, cx - distx, cy + disty);
          GraphicsPath._accBoundsPoint(ret, cx - distx, cy - disty);
        } else {
          cosp = Math.cos(rot);
          sinp = rot >= 0 && rot < 6.283185307179586 ? rot <= 3.141592653589793 ? Math.sqrt(1.0 - cosp * cosp) : -Math.sqrt(1.0 - cosp * cosp) : Math.sin(rot);
          var angles = [];
          var angle;
          if(cosp !== 0 && sinp !== 0) {
            angle = Math.atan2(-ry * sinp / cosp, rx);
            angles.push(angle, angle + Math.PI);
            angle = Math.atan2(ry * cosp / sinp, rx);
            angles.push(angle, angle + Math.PI);
          } else {
            angles.push(0, Math.PI, Math.PI * 0.5, Math.PI * 1.5);
          }
          for(var k = 0; k < angles.length; k++) {
            if(GraphicsPath._angleInRange(angles[k], theta, delta)) {
              GraphicsPath._accBoundsArc(ret, rx, ry, cosp, sinp, cx, cy, angles[k]);
            }
          }
        }
      }
    }
    return ret;
  };

/**
 * Returns a path that reverses the course of this path.
 * @returns {H3DU.GraphicsPath} A GraphicsPath
 * object with its path segments reversed.
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.reverse = function() {
    var lastptx = 0;
    var lastpty = 0;

    var lastClosed = false;

    var pathStartX = 0;
    var pathStartY = 0;
    var ret = new GraphicsPath();
    for(var i = this.segments.length - 1; i >= 0; i--) {
      var s = this.segments[i];
      var startpt = GraphicsPath._startPoint(s);
      var endpt = GraphicsPath._endPoint(s);
      if(s[0] !== GraphicsPath.CLOSE) {
        if(i === this.segments.length - 1) {
          ret.moveTo(endpt[0], endpt[1]);
        } else if(lastptx !== endpt[0] || lastpty !== endpt[1]) {
          if(lastClosed) {
            ret.closePath();
          }
          lastClosed = false;
          ret.moveTo(endpt[0], endpt[1]);
        }
        lastptx = startpt[0];
        lastpty = startpt[1];
      }
      if(s[0] === GraphicsPath.CLOSE) {
        if(lastClosed) {
          ret.closePath();
        }
        lastClosed = true;
        var havePathStart = false;
        for(var j = i - 1; j >= 0; j--) {
          if(this.segments[j][0] === GraphicsPath.CLOSE) {
            break;
          }
          startpt = GraphicsPath._startPoint(this.segments[j]);
          endpt = GraphicsPath._endPoint(this.segments[j]);
          if(havePathStart) {
            if(pathStartX !== endpt[0] || pathStartY !== endpt[1]) {
              break;
            }
          }
          pathStartX = startpt[0];
          pathStartY = startpt[1];
          havePathStart = true;
        }
        if(havePathStart) {
          ret.moveTo(pathStartX, pathStartY);
          endpt = GraphicsPath._endPoint(this.segments[i - 1]);
          if(pathStartX !== endpt[0] || pathStartY !== endpt[1]) {
            ret.lineTo(endpt[0], endpt[1]);
          }
          lastptx = endpt[0];
          lastpty = endpt[1];
        }
      } else if(s[0] === GraphicsPath.QUAD) {
        ret.quadraticCurveTo(s[3], s[4], s[1], s[2]);
      } else if(s[0] === GraphicsPath.CUBIC) {
        ret.bezierCurveTo(s[5], s[6], s[3], s[4], s[1], s[2]);
      } else if(s[0] === GraphicsPath.ARC) {
        var delta = s[13] - s[12];
        var reversedSweep = delta < 0;
        var largeArc = Math.abs(delta) > Math.PI;
        ret.arcSvgTo(s[3], s[4], s[5] * GraphicsPath._toDegrees,
        largeArc, reversedSweep, s[1], s[2]);
      } else if(s[0] === GraphicsPath.LINE) {
        ret.lineTo(s[1], s[2]);
      }
    }
    if(lastClosed)
      ret.closePath();
    return ret;
  };
/** @ignore */
  GraphicsPath._pushXY = function(curPath, x, y, nodegen) {
    if(!nodegen) {
      curPath.push(x, y);
    } else if(curPath.length === 0) {
      curPath.push(x, y);
    } else if(curPath[curPath.length - 1] !== y || curPath[curPath.length - 2] !== x) {
      curPath.push(x, y);
    }
  };

/** @ignore */
  GraphicsPath.prototype._getSubpaths = function(flatness, nodegen) {
    var tmp = [];
    var subpaths = [];
    var j;
    if(typeof flatness === "undefined" || flatness === null)flatness = 1.0;
    var lastptx = 0;
    var lastpty = 0;
    var first = true;
    var curPath = null;
    for(var i = 0; i < this.segments.length; i++) {
      var s = this.segments[i];
      var startpt = GraphicsPath._startPoint(s);
      var endpt = GraphicsPath._endPoint(s);
      tmp.splice(0, tmp.length);
      if(s[0] !== GraphicsPath.CLOSE) {
        if(first || lastptx !== startpt[0] || lastpty !== startpt[1]) {
          curPath = startpt;
          subpaths.push(curPath);
          first = false;
        }
        lastptx = endpt[0];
        lastpty = endpt[1];
      }
      if(s[0] === GraphicsPath.QUAD) {
        GraphicsPath._flattenQuad(s[1], s[2], s[3], s[4],
     s[5], s[6], 0.0, 1.0, tmp, flatness * 2, 0);
        for(j = 0; j < tmp.length; j++) {
          GraphicsPath._pushXY(curPath, tmp[j][2], tmp[j][3], nodegen);
        }
      } else if(s[0] === GraphicsPath.CUBIC) {
        GraphicsPath._flattenCubic(s[1], s[2], s[3], s[4],
     s[5], s[6], s[7], s[8], 0.0, 1.0, tmp, flatness * 2, 0);
        for(j = 0; j < tmp.length; j++) {
          GraphicsPath._pushXY(curPath, tmp[j][2], tmp[j][3], nodegen);
        }
      } else if(s[0] === GraphicsPath.ARC) {
        GraphicsPath._flattenArc(s, 0.0, 1.0, tmp, flatness * 2, 0);
        for(j = 0; j < tmp.length; j++) {
          GraphicsPath._pushXY(curPath, tmp[j][2], tmp[j][3], nodegen);
        }
      } else if(s[0] !== GraphicsPath.CLOSE) {
        GraphicsPath._pushXY(curPath, s[3], s[4], nodegen);
      }
    }
    return subpaths;
  };
/** @ignore */
  GraphicsPath._CurveList = function(curves) {
    this.curves = curves;
    this.cumulativeLengths = [];
    var totalLength = 0;
    for(var i = 0; i < this.curves.length; i++) {
      this.cumulativeLengths.push(totalLength);
      totalLength += this.curves[i].totalLength;
    }
    this.cumulativeLengths.push(totalLength);
    this.totalLength = totalLength;
  };
  GraphicsPath._CurveList.prototype.getCurves = function() {
    return this.curves;
  };
  GraphicsPath._CurveList.prototype.getLength = function() {
    return this.totalLength;
  };
  GraphicsPath._CurveList.prototype.evaluate = function(u) {
    if(this.curves.length === 0)return [0, 0, 0];
    if(this.curves.length === 1)return this.curves[0].evaluate(u);
    if(u < 0)u = 0;
    if(u > 1)u = 1;
    var partialLen = u * this.totalLength;
    var left = 0;
    var right = this.curves.length;
    while(left <= right) {
      var mid = (left + right) / 2 | 0;
      var seg = this.curves[mid];
      var segstart = this.cumulativeLengths[mid];
      var segend = segstart + seg.totalLength;
      if(partialLen >= segstart && partialLen < segend ||
     partialLen === segend && mid + 1 === this.curves.length) {
        var t = (partialLen - segstart) / seg.totalLength;
        return seg.evaluate(t);
      } else if(partialLen < segstart) {
   // curve is behind
        right = mid - 1;
      } else {
   // curve is ahead
        left = mid + 1;
      }
    }
    return null;
  };
/** @ignore */
  GraphicsPath._Curve = function(segments) {
    this.segments = segments;
    var totalLength = 0;
    var isClosed = false;
    for(var i = 0; i < this.segments.length; i++) {
      totalLength += this.segments[i][1];
    }
    if(this.segments.length > 0) {
      var startpt = GraphicsPath._startPoint(this.segments[0][3]);
      var endpt = GraphicsPath._endPoint(this.segments[this.segments.length - 1][3]);
      isClosed = startpt[0] === endpt[0] && startpt[1] === endpt[1];
    }
    this._isClosed = isClosed;
    this.totalLength = totalLength;
  };
  GraphicsPath._Curve.prototype.getLength = function() {
    return this.totalLength;
  };
  GraphicsPath._Curve.prototype.evaluate = function(u) {
    return this._evaluateEx(u, 0);
  };
  GraphicsPath._Curve.prototype.tangent = function(u) {
    return this._evaluateEx(u, 1);
  };
  GraphicsPath._Curve.prototype._evaluateEx = function(u, kind) {
    if(this._isClosed) {
      if(u < 0)u += Math.ceil(u);
      else if(u > 1)u -= Math.floor(u);
    } else if(u < 0)u = 0;
    else if(u > 1)u = 1;
    if(this.segments.length === 0)return [0, 0, 0];
    var partialLen = u * this.totalLength;
    var left = 0;
    var right = this.segments.length;
    while(left <= right) {
      var mid = (left + right) / 2 | 0;
      var seg = this.segments[mid];
      var segstart = seg[2];
      var segend = segstart + seg[1];
      if(partialLen >= segstart && partialLen < segend ||
     partialLen === segend && mid + 1 === this.segments.length) {
        var seginfo = seg[3];
        var t = u === 1 ? 1.0 : (partialLen - segstart) / seg[1];
        if(seg[0] === GraphicsPath.LINE) {
          var x = seginfo[1] + (seginfo[3] - seginfo[1]) * t;
          var y = seginfo[2] + (seginfo[4] - seginfo[2]) * t;
          if(kind === 0) {
            x = seginfo[1] + (seginfo[3] - seginfo[1]) * t;
            y = seginfo[2] + (seginfo[4] - seginfo[2]) * t;
            return [x, y, 0];
          } else {
            return GraphicsPath._normalize([
              seginfo[3] - seginfo[1],
              seginfo[4] - seginfo[2]
            ]);
          }
        } else {
          var cumulativeLengths = seg[5];
          var segParts = seg[4];
          var segPartialLen = partialLen - segstart;
          var segLeft = 0;
          var lastCumuLength = cumulativeLengths[cumulativeLengths.length - 1];
          segPartialLen = Math.max(0, segPartialLen);
          segPartialLen = Math.min(lastCumuLength, segPartialLen);
          var segRight = cumulativeLengths.length - 1;
          while(segLeft <= segRight) {
            var segMid = (segLeft + segRight) / 2 | 0;
            var partStart = cumulativeLengths[segMid];
            var partIndex = segMid * 3;
            var partLength = segParts[partIndex + 2];
            var partEnd = partStart + partLength;
            if(segPartialLen >= partStart && segPartialLen <= partEnd) {
              var tStart = segParts[partIndex];
              var tEnd = segParts[partIndex + 1];
              var partT = u === 1 ? 1.0 : tStart + (segPartialLen - partStart) / partLength * (tEnd - tStart);
              var point = kind === 0 ?
        GraphicsPath._point(seginfo, partT) :
        GraphicsPath._tangent(seginfo, partT);
              point[2] = 0;
              return point;
            } else if(segPartialLen < partStart) {
              segRight = segMid - 1;
            } else {
              segLeft = segMid + 1;
            }
          }
          throw new Error("not implemented yet");
        }
      } else if(partialLen < segstart) {
   // segment is behind
        right = mid - 1;
      } else {
   // segment is ahead
        left = mid + 1;
      }
    }
    return null;
  };
/**
 * Does a linear interpolation between two graphics paths.
 * @param {H3DU.GraphicsPath} other The second graphics path.
 * @param {Number} t An interpolation factor, generally ranging from 0 through 1.
 * Closer to 0 means closer to this path, and closer to 1 means closer
 * to "other". If the input paths contain arc
 * segments that differ in the large arc and sweep flags, the flags from
 * the first path's arc are used if "t" is less than 0.5; and the flags from
 * the second path's arc are used otherwise.<p>For a nonlinear
 * interpolation, define a function that takes a value that usually ranges from 0 through 1
 * and generally returns
 * A value that usually ranges from 0 through 1, and pass the result of that function to this method.
 * See the documentation for {@link H3DU.Math.vec3lerp}
 * for examples of interpolation functions.
 * @returns {H3DU.GraphicsPath} The interpolated path.
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.interpolate = function(other, t) {
    if(!other || other.segments.length !== this.segments.length) {
  // console.log(other.segments.length)
  // console.log(this.segments.length)
      return null;
    }
    var tmpThis = [];
    var tmpOther = [];
    var tmp = [];
    var j;
    var ret = new GraphicsPath();
    var oldpos;
    for(var i = 0; i < this.segments.length; i++) {
      var segThis = this.segments[i];
      var segOther = other.segments[i];
      var domove = false;
      if(segThis[0] !== GraphicsPath.CLOSE) {
        var start = GraphicsPath._startPoint(segThis);
        if(!oldpos || oldpos[0] !== start[0] || oldpos[1] !== start[1]) {
          domove = true;
        }
        oldpos = GraphicsPath._endPoint(segThis);
      }
      if(segThis[0] === GraphicsPath.QUAD) {
        tmpThis[0] = GraphicsPath.CUBIC;
        tmpThis[1] = segThis[1];
        tmpThis[2] = segThis[2];
        var tx = 2 * segThis[3];
        var ty = 2 * segThis[4];
        tmpThis[3] = (segThis[1] + tx) / 3;
        tmpThis[4] = (segThis[2] + ty) / 3;
        tmpThis[5] = (segThis[5] + tx) / 3;
        tmpThis[6] = (segThis[6] + ty) / 3;
        tmpThis[7] = segThis[5];
        tmpThis[8] = segThis[6];
        segThis = tmpThis;
      }
      if(segOther[0] === GraphicsPath.QUAD) {
        tmpOther[0] = GraphicsPath.CUBIC;
        tmpOther[1] = segOther[1];
        tmpOther[2] = segOther[2];
        tx = 2 * segOther[3];
        ty = 2 * segOther[4];
        tmpOther[3] = (segOther[1] + tx) / 3;
        tmpOther[4] = (segOther[2] + ty) / 3;
        tmpOther[5] = (segOther[5] + tx) / 3;
        tmpOther[6] = (segOther[6] + ty) / 3;
        tmpOther[7] = segOther[5];
        tmpOther[8] = segOther[6];
        segOther = tmpOther;
      }
      if(segThis[0] !== segOther[0]) {
        return null;
      }
      switch(segThis[0]) {
      case GraphicsPath.CLOSE:
        ret.closePath();
        oldpos = null;
        break;
      case GraphicsPath.LINE:
      case GraphicsPath.QUAD:
      case GraphicsPath.CUBIC:
        for(j = 1; j < segThis.length; j++) {
          tmp[j] = segThis[j] + (segOther[j] - segThis[j]) * t;
        }
        if(domove)ret.moveTo(tmp[1], tmp[2]);
        if(segThis[0] === GraphicsPath.LINE)
          ret.lineTo(tmp[3], tmp[4]);
        else if(segThis[0] === GraphicsPath.QUAD)
          ret.quadraticCurveTo(tmp[3], tmp[4], tmp[5], tmp[6]);
        else if(segThis[0] === GraphicsPath.CUBIC)
          ret.bezierCurveTo(tmp[3], tmp[4], tmp[5], tmp[6], tmp[7], tmp[8]);
        break;
      case GraphicsPath.ARC:{
        var deltaThis = segThis[13] - segThis[12];
        var largeArcThis = Math.abs(deltaThis) > Math.PI;
        var deltaOther = segOther[13] - segOther[12];
        var largeArcOther = Math.abs(deltaOther) > Math.PI;

        var largeArc = t < 0.5 ? largeArcThis : largeArcOther;
        var sweep = t < 0.5 ? deltaThis > 0 : deltaOther > 0;
        var sx = segThis[1] + (segOther[1] - segThis[1]) * t;
        var sy = segThis[2] + (segOther[2] - segThis[2]) * t;
        var rx = segThis[3] + (segOther[3] - segThis[3]) * t;
        var ry = segThis[4] + (segOther[4] - segThis[4]) * t;
        var rot = segThis[5] + (segOther[5] - segThis[5]) * t;
        var ex = segThis[8] + (segOther[8] - segThis[8]) * t;
        var ey = segThis[9] + (segOther[9] - segThis[9]) * t;
        if(domove)ret.moveTo(sx, sy);
        ret.arcSvgTo(rx, ry, rot * GraphicsPath._toDegrees,
         largeArc, sweep, ex, ey);
        break;
      }
      default:
        console.log("unknown kind");
        return null;
      }
    }
    return ret;
  };

/**
 * Gets an object for the curves described by this path.
 * The resulting object can be used to retrieve the points
 * that lie on the path or as a parameter for one of
 * the {@link H3DU.CurveEval} methods, in the
 * {@link CurveTube} class, or any other class that
 * accepts parametric curves.<p>
 * The return value doesn't track changes to the path.
 * @param {Number} [flatness] When curves and arcs
 * are decomposed to line segments for the purpose of
 * calculating their length, the
 * segments will be close to the true path of the curve by this
 * value, given in units. If null or omitted, default is 1. This
 * is only used to make the arc-length parameterization more
 * accurate if the path contains curves or arcs.
 * @returns {Object} An object that implements
 * the following methods:<ul>
 * <li><code>getCurves()</code> - Returns a list of curves described
 * by this path. The list will contain one object for each disconnected
 * portion of the path. For example, if the path contains one polygon, the list will contain
 * one curve object. And if the path is empty, the list will be empty too.
 * <p>Each object will have the following methods:<ul>
 * <li><code>getLength()</code> - Returns the approximate total length of the curve,
 * in units.
 * <li><code>evaluate(u)</code> - Takes one parameter, "u", which
 * ranges from 0 to 1, depending on how far the point is from the start or
 * the end of the path (similar to arc-length parameterization).
 * The function returns a 3-element array containing
 * the X, Y, and Z coordinates of the point lying on the curve at the given
 * "u" position (however, the z will always be 0 since paths can currently
 * only be 2-dimensional).
 * <li><code>tangent(u)</code> - Takes one parameter, "u", with the same meaning
 * as for the <code>evaluate</code> method, and returns a 3-element array containing the
 * the X, Y, and Z components of the
 * tangent vector (which will generally be a [unit vector]{@tutorial glmath}) at the given point on the curve
 * (the z will always be 0 since paths can currently
 * only be 2-dimensional).
 * </ul>
 * <li><code>getLength()</code> - Returns the approximate total length of the path,
 * in units.
 * <li><code>tangent(u)</code> - Has the same effect as the <code>tangent</code>
 * method for each curve, but applies to the path as a whole.
 * <li><code>evaluate(u)</code> - Has the same effect as the <code>evaluate</code>
 * method for each curve, but applies to the path as a whole.
 * Note that calling this <code>evaluate</code> method is only
 * recommended when drawing the path as a set of points, not lines, since
 * the path may contain several disconnected parts.
 * </ul>
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.getCurves = function(flatness) {
    // TODO: "tangent" method should probably not normalize to unit vector
    var subpaths = [];
    var curves = [];
    if(typeof flatness === "undefined" || flatness === null)flatness = 1.0;
    var lastptx = 0;
    var lastpty = 0;
    var first = true;
    var curPath = null;
    var curLength = 0;
    for(var i = 0; i < this.segments.length; i++) {
      var s = this.segments[i];
      var len = 0;
      var startpt = GraphicsPath._startPoint(s);
      var endpt = GraphicsPath._endPoint(s);
      if(s[0] !== GraphicsPath.CLOSE) {
        if(first || lastptx !== startpt[0] || lastpty !== startpt[1]) {
          curPath = [];
          curLength = 0;
          subpaths.push(curPath);
          first = false;
        }
        lastptx = endpt[0];
        lastpty = endpt[1];
      }
      if(s[0] === GraphicsPath.QUAD ||
      s[0] === GraphicsPath.CUBIC ||
      s[0] === GraphicsPath.ARC) {
        var pieces = [];
        var cumulativeLengths = [];
        len = 0;
        if(s[0] === GraphicsPath.QUAD) {
          GraphicsPath._flattenQuad(s[1], s[2], s[3], s[4],
      s[5], s[6], 0.0, 1.0, pieces, flatness * 2, 1);
        } else if(s[0] === GraphicsPath.CUBIC) {
          GraphicsPath._flattenCubic(s[1], s[2], s[3], s[4],
      s[5], s[6], s[7], s[8], 0.0, 1.0, pieces, flatness * 2, 1);
        } else if(s[0] === GraphicsPath.ARC) {
          GraphicsPath._flattenArc(s, 0.0, 1.0, pieces, flatness * 2, 1);
        }
        for(var j = 0; j < pieces.length; j += 3) {
          cumulativeLengths.push(len);
          len += pieces[j + 2];
        }
        cumulativeLengths.push(len);
        curPath.push([s[0], len, curLength, s.slice(0), pieces, cumulativeLengths]);
        curLength += len;
      } else if(s[0] === GraphicsPath.LINE) {
        var dx = s[3] - s[1];
        var dy = s[4] - s[2];
        len = Math.sqrt(dx * dx + dy * dy);
        curPath.push([s[0], len, curLength, s.slice(0)]);
        curLength += len;
      }
    }
    for(i = 0; i < subpaths.length; i++) {
      curves.push(new GraphicsPath._Curve(subpaths[i]));
    }
    return new GraphicsPath._CurveList(curves);
  };

/**
 * Gets an array of points evenly spaced across the length
 * of the path.
 * @param {Number} numPoints Number of points to return.
 * @param {Number} [flatness] When curves and arcs
 * are decomposed to line segments for the purpose of
 * calculating their length, the
 * segments will be close to the true path of the curve by this
 * value, given in units. If null or omitted, default is 1.
 * @returns {Array<Array<Number>>} Array of points lying on
 * the path and evenly spaced across the length of the path,
 * starting and ending with the path's endpoints. Returns
 * an empty array if <i>numPoints</i> is less than 1. Returns
 * an array consisting of the start point if <i>numPoints</i>
 * is 1.
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.getPoints = function(numPoints, flatness) {
    if(numPoints < 1)return [];
    if(numPoints === 1) {
      return [this._start()];
    }
    if(numPoints === 2) {
      return [this._start(), this._end()];
    }
    var curves = this.getCurves(flatness);
    var points = [];
    for(var i = 0; i < numPoints; i++) {
      var t = i / (numPoints - 1);
      var ev = curves.evaluate(t);
      points.push([ev[0], ev[1]]);
    }
    return points;
  };
/**
 * Makes this path closed. Adds a line segment to the
 * path's start position, if necessary.
 * @returns {H3DU.GraphicsPath} This object.
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.closePath = function() {
    if(this.startPos[0] !== this.endPos[0] ||
   this.startPos[1] !== this.endPos[1]) {
      this.lineTo(this.startPos[0], this.startPos[1]);
    }
    if(this.segments.length > 0) {
      this.segments.push([GraphicsPath.CLOSE]);
    }
    this.incomplete = false;
    return this;
  };

/**
 * Moves the current start position and end position to the given position.
 * @param {Number} x X coordinate of the position.
 * @param {Number} y Y coordinate of the position.
 * @returns {H3DU.GraphicsPath} This object.
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.moveTo = function(x, y) {
    this.startPos[0] = x;
    this.startPos[1] = y;
    this.endPos[0] = x;
    this.endPos[1] = y;
    this.incomplete = false;
    return this;
  };
/**
 * Adds a line segment to the path, starting
 * at the path's end position, then
 * sets the end position to the end of the segment.
 * @param {Number} x X coordinate of the end of the line segment.
 * @param {Number} y Y coordinate of the end of the line segment.
 * @returns {H3DU.GraphicsPath} This object.
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.lineTo = function(x, y) {
    this.segments.push([GraphicsPath.LINE,
      this.endPos[0], this.endPos[1], x, y]);
    this.endPos[0] = x;
    this.endPos[1] = y;
    this.incomplete = false;
    return this;
  };
/**
 * Gets the current point stored in this path.
 * @returns {Array<Number>} A two-element array giving the X and Y coordinates of the current point.
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.getCurrentPoint = function() {
    return [this.endPos[0], this.endPos[1]];
  };

/** @ignore */
  GraphicsPath._areCollinear = function(x0, y0, x1, y1, x2, y2) {
    var t1 = x1 - x0;
    var t2 = y1 - y0;
    var t3 = [x2 - x0, y2 - y0];
    var denom = t1 * t1 + t2 * t2;
    if(denom === 0) {
      return true; // first two points are the same
    }
    var t4 = (t1 * t3[0] + t2 * t3[1]) / denom;
    var t5 = [x0 + t4 * t1, y0 + t4 * t2];
    var t6 = [x2 - t5[0], y2 - t5[1]];
    return t6[0] * t6[0] + t6[1] * t6[1] === 0;
  };
/**
 * Adds path segments in the form of a circular arc to this path,
 * using the parameterization specified in the "arcTo" method of the
 * HTML Canvas 2D Context.
 * @param {Number} x1 X coordinate of a point that, along with the
 * current end point, forms a tangent line. The point where the
 * circle touches this tangent line is the start point of the arc, and if the
 * point isn't the same as the current end point, this method adds
 * a line segment connecting the two points. (Note that the start point
 * of the arc is not necessarily the same as (x1, y1) or the current end point.)
 * @param {Number} y1 Y coordinate of the point described under "x1".
 * @param {Number} x2 X coordinate of a point that, along with the
 * point (x1, y1), forms a tangent line. The point where the
 * circle touches this tangent line is the end point of the arc. (Note that the
 * end point of the arc is not necessarily the same as (x1, y1) or (x2, y2).)
 * When this method returns, the current end point will be set to the end
 * point of the arc.
 * @param {Number} y2 Y coordinate of the point described under "x2".
 * @param {Number} radius Radius of the circle the arc forms a part of.
 * @returns {H3DU.GraphicsPath} This object.
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.arcTo = function(x1, y1, x2, y2, radius) {
    if(radius < 0) {
      throw new Error("IndexSizeError");
    }
    var x0 = this.endPos[0];
    var y0 = this.endPos[1];
    if(radius === 0 || x0 === x1 && y0 === y1 || x1 === x2 && y1 === y2 ||
   GraphicsPath._areCollinear(x0, y0, x1, y1, x2, y2)) {
      return this.lineTo(x1, y1);
    }
    var t1 = [x0 - x1, y0 - y1];
    var t2 = 1.0 / Math.sqrt(t1[0] * t1[0] + t1[1] * t1[1]);
    var t3 = [t1[0] * t2, t1[1] * t2]; // tangent vector from p1 to p0
    var t4 = [x2 - x1, y2 - y1];
    var t5 = 1.0 / Math.sqrt(t4[0] * t4[0] + t4[1] * t4[1]);
    var t6 = [t4[0] * t5, t4[1] * t5]; // tangent vector from p2 to p1
    var cross = t3[0] * t6[1] - t3[1] * t6[0];
    var t7 = (1.0 + (t3[0] * t6[0] + t3[1] * t6[1])) * radius / Math.abs(cross);
    var t8 = [t3[0] * t7, t3[1] * t7];
    var t10 = [t6[0] * t7, t6[1] * t7];
    var startTangent = [x1 + t8[0], y1 + t8[1]];
    var endTangent = [x1 + t10[0], y1 + t10[1]];
    this.lineTo(startTangent[0], startTangent[1]);
    var sweep = cross < 0;
    return this.arcSvgTo(radius, radius, 0, false, sweep, endTangent[0], endTangent[1]);
  };
/**
 * Adds path segments in the form of a circular arc to this path,
 * using the parameterization specified in the "arc" method of the
 * HTML Canvas 2D Context.
 * @param {Number} x X coordinate of the center of the circle that the arc forms a part of.
 * @param {Number} y Y coordinate of the circle's center.
 * @param {Number} radius Radius of the circle.
 * @param {Number} startAngle Starting angle of the arc, in radians.
 * 0 means the positive X axis, &pi;/2 means the positive Y axis,
 * &pi; means the negative X axis, and &pi;*1.5 means the negative Y axis.
 * @param {Number} endAngle Ending angle of the arc, in radians.
 * @param {Boolean} ccw Whether the arc runs counterclockwise
 * (assuming the X axis points right and the Y axis points
 * down under the coordinate system).
 * @returns {H3DU.GraphicsPath} This object.
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.arc = function(x, y, radius, startAngle, endAngle, ccw) {
    return this._arcInternal(x, y, radius, startAngle, endAngle, ccw, true);
  };
/** @ignore */
  GraphicsPath.prototype._arcInternal = function(x, y, radius, startAngle, endAngle, ccw, drawLine) {
    if(radius < 0) {
      throw new Error("IndexSizeError");
    }
    var normStart = GraphicsPath._normAngleRadians(startAngle);
    var normEnd = GraphicsPath._normAngleRadians(endAngle);
    var twopi = Math.PI * 2;
    var cosStart = Math.cos(normStart);
    var sinStart = normStart <= 3.141592653589793 ? Math.sqrt(1.0 - cosStart * cosStart) : -Math.sqrt(1.0 - cosStart * cosStart);
    var cosEnd = Math.cos(normEnd);
    var sinEnd = normEnd <= 3.141592653589793 ? Math.sqrt(1.0 - cosEnd * cosEnd) : -Math.sqrt(1.0 - cosEnd * cosEnd);
    var startX = x + radius * cosStart;
    var startY = y + radius * sinStart;
    var endX = x + radius * cosEnd;
    var endY = y + radius * sinEnd;
    if(drawLine) {
      this.lineTo(startX, startY);
    }
    if(startX === endX && startY === endY || radius === 0) {
      return this.lineTo(endX, endY);
    }
    if(!ccw && endAngle - startAngle >= twopi ||
   ccw && startAngle - endAngle >= twopi) {
      return this
     ._arcInternal(x, y, radius, startAngle, startAngle + Math.PI, ccw, false)
           ._arcInternal(x, y, radius, startAngle + Math.PI, startAngle + Math.PI * 2, ccw, false)
           ._arcInternal(x, y, radius, normStart, normEnd, ccw, false);
    } else {
      var delta = endAngle - startAngle;
      if(delta >= twopi || delta < 0) {
        var d = delta % twopi;
        if(d === 0 && delta !== 0) {
          return this
     ._arcInternal(x, y, radius, startAngle, startAngle + Math.PI, ccw, false)
           ._arcInternal(x, y, radius, startAngle + Math.PI, startAngle + Math.PI * 2, ccw, false)
           ._arcInternal(x, y, radius, normStart, normEnd, ccw, false);
        }
        delta = d;
      }
      var largeArc = Math.abs(delta) > Math.PI ^ ccw ^ startAngle > endAngle;
      var sweep = delta > 0 ^ ccw ^ startAngle > endAngle;
      return this.lineTo(startX, startY)
      .arcSvgTo(radius, radius, 0, largeArc, sweep, endX, endY);
    }
  };

/**
 * Adds a quadratic B&eacute;zier curve to this path starting
 * at this path's current position.
 * @param {Number} x X coordinate of the curve's control point.
 * @param {Number} y Y coordinate of the curve's control point.
 * @param {Number} x2 X coordinate of the curve's end point.
 * @param {Number} y2 Y coordinate of the curve's end point.
 * @returns {H3DU.GraphicsPath} This object.
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.quadraticCurveTo = function(x, y, x2, y2) {
    this.segments.push([GraphicsPath.QUAD,
      this.endPos[0], this.endPos[1], x, y, x2, y2]);
    this.endPos[0] = x2;
    this.endPos[1] = y2;
    this.incomplete = false;
    return this;
  };
/**
 * Adds a cubic B&eacute;zier curve to this path starting
 * at this path's current position.
 * @param {Number} x X coordinate of the curve's first control point.
 * @param {Number} y X coordinate of the curve's first control point.
 * @param {Number} x2 Y coordinate of the curve's second control point.
 * @param {Number} y2 Y coordinate of the curve's second control point.
 * @param {Number} x3 X coordinate of the curve's end point.
 * @param {Number} y3 Y coordinate of the curve's end point.
 * @returns {H3DU.GraphicsPath} This object.
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.bezierCurveTo = function(x, y, x2, y2, x3, y3) {
    this.segments.push([GraphicsPath.CUBIC,
      this.endPos[0], this.endPos[1], x, y, x2, y2, x3, y3]);
    this.endPos[0] = x3;
    this.endPos[1] = y3;
    this.incomplete = false;
    return this;
  };

  GraphicsPath._legendreGauss24 = [
    0.12793819534675216, 0.06405689286260563,
    0.1258374563468283, 0.1911188674736163,
    0.12167047292780339, 0.3150426796961634,
    0.1155056680537256, 0.4337935076260451,
    0.10744427011596563, 0.5454214713888396,
    0.09761865210411388, 0.6480936519369755,
    0.08619016153195327, 0.7401241915785544,
    0.0733464814110803, 0.820001985973903,
    0.05929858491543678, 0.8864155270044011,
    0.04427743881741981, 0.9382745520027328,
    0.028531388628933663, 0.9747285559713095,
    0.0123412297999872, 0.9951872199970213
  ];
/** @ignore */
  GraphicsPath._numIntegrate = function(func, xmin, xmax) {
/*
* Estimates the integral of a function. The integral
* is like the area between the function's graph and the X axis,
* where areas above the X axis add to the integral, and areas
* below the X axis subtract from it.
* @private
* @param {Function} func A function that takes one number
* and returns a number. For best results,
* the function should be continuous (informally, this means
* its graph between <code>xmin</code> and
* <code>xmax</code> can be drawn without lifting the pen).
* @param {Number} xmin Smallest input to the function,
* or the lower limit to integration.
* @param {Number} xmax Largest input to the function,
* or the upper limit to integration. If xmax is less than xmin,
* this results in a negative integral.
* @returns The approximate integral of _func_ between
* _xmin_ and _xmax_.
*/
    if(xmax === xmin)return 0;
    if(xmax < xmin) {
      return -GraphicsPath._numIntegrate(func, xmax, xmin);
    }
    var bm = (xmax - xmin) * 0.5;
    var bp = (xmax + xmin) * 0.5;
    var ret = 0;
    var lg = GraphicsPath._legendreGauss24;
    for(var i = 0; i < lg.length; i += 2) {
      var weight = lg[i];
      var abscissa = lg[i + 1];
      ret += weight * func(bm * abscissa + bp);
      ret += weight * func(-bm * abscissa + bp);
    }
    return ret * bm;
  };
/** @ignore */
  GraphicsPath._ellipticArcLength = function(xRadius, yRadius, startAngle, endAngle) {
    if(startAngle === endAngle || xRadius <= 0 || yRadius <= 0)return 0;
    if(xRadius === yRadius) {
  // for circular arc length this is extremely simple
      return Math.abs((endAngle - startAngle) * xRadius);
    }
    var mn = Math.min(xRadius, yRadius);
    var mx = Math.max(xRadius, yRadius);
    var eccSq = 1 - mn * mn / (mx * mx);
    var ellipticIntegrand = function(x) {
      var s = Math.sin(x);
      return Math.sqrt(1 - s * s * eccSq);
    };
    return Math.abs(mx * GraphicsPath._numIntegrate(
   ellipticIntegrand, startAngle, endAngle));
  };
/** @ignore */
  GraphicsPath._vecangle = function(a, b, c, d) {
    var dot = a * c + b * d;
    var denom = Math.sqrt(a * a + b * b) * Math.sqrt(c * c + d * d);
    dot /= denom;
    var sgn = a * d - b * c;
 // avoid NaN when dot is just slightly out of range
 // for acos
    if(dot < -1)dot = -1;
    else if(dot > 1)dot = 1;
    var ret = Math.acos(dot);
    if(sgn < 0)ret = -ret;
    return ret;
  };
/** @ignore */
  GraphicsPath._arcSvgToCenterParam = function(a) {
    var x1 = a[1];
    var y1 = a[2];
    var x2 = a[8];
    var y2 = a[9];
    var rx = a[3];
    var ry = a[4];
    var rot = a[5]; // rotation in radians
    var xmid = (x1 - x2) * 0.5;
    var ymid = (y1 - y2) * 0.5;
    var xpmid = (x1 + x2) * 0.5;
    var ypmid = (y1 + y2) * 0.5;
    var crot = Math.cos(rot);
    var srot = rot >= 0 && rot < 6.283185307179586 ? rot <= 3.141592653589793 ? Math.sqrt(1.0 - crot * crot) : -Math.sqrt(1.0 - crot * crot) : Math.sin(rot);
    var x1p = crot * xmid + srot * ymid;
    var y1p = crot * ymid - srot * xmid;
    var rxsq = rx * rx;
    var rysq = ry * ry;
    var x1psq = x1p * x1p;
    var y1psq = y1p * y1p;
    var rxXy = rxsq * y1psq + rysq * x1psq;
    var cxsqrt = Math.sqrt(Math.max(0, (rxsq * rysq - rxXy) / rxXy));
    var cxp = rx * y1p * cxsqrt / ry;
    var cyp = ry * x1p * cxsqrt / rx;
    if(a[6] === a[7]) {
      cxp = -cxp;
    } else {
      cyp = -cyp;
    }
    var cx = crot * cxp - srot * cyp + xpmid;
    var cy = srot * cxp + crot * cyp + ypmid;
    var vecx = (x1p - cxp) / rx;
    var vecy = (y1p - cyp) / ry;
    var nvecx = (-x1p - cxp) / rx;
    var nvecy = (-y1p - cyp) / ry;
    var cosTheta1 = vecx / Math.sqrt(vecx * vecx + vecy * vecy);
 // avoid NaN when cosTheta1 is just slightly out of range
 // for acos
    if(cosTheta1 < -1)cosTheta1 = -1;
    else if(cosTheta1 > 1)cosTheta1 = 1;
    var theta1 = Math.acos(cosTheta1);
    if(vecy < 0)theta1 = -theta1;
    var delta = GraphicsPath._vecangle(vecx, vecy, nvecx, nvecy);
    delta = delta < 0 ? Math.PI * 2 + delta : delta;
    if(!a[7] && delta > 0) {
      delta -= Math.PI * 2;
    } else if(a[7] && delta < 0) {
      delta += Math.PI * 2;
    }
    delta += theta1;
    return [cx, cy, theta1, delta];
  };
  GraphicsPath._toRadians = Math.PI / 180;
  GraphicsPath._toDegrees = 180.0 / Math.PI;
/** @ignore */
  GraphicsPath._arcToBezierCurves = function(cx, cy, rx, ry, rot, angle1, angle2) {
    var crot = Math.cos(rot);
    var srot = rot >= 0 && rot < 6.283185307179586 ? rot <= 3.141592653589793 ? Math.sqrt(1.0 - crot * crot) : -Math.sqrt(1.0 - crot * crot) : Math.sin(rot);
    var arcsize = Math.abs(angle2 - angle1);
    var arcs = 16;
    if(arcsize < Math.PI / 8)arcs = 2;
    else if(arcsize < Math.PI / 4)arcs = 4;
    else if(arcsize < Math.PI / 2)arcs = 6;
    else if(arcsize < Math.PI)arcs = 10;
    var third = 1 / 3;
    var step = (angle2 - angle1) / arcs;
    var ret = [];
    var t5 = Math.tan(step * 0.5);
    var t7 = Math.sin(step) * third * (Math.sqrt(3.0 * t5 * t5 + 4.0) - 1.0);
    step = Math.PI * 2.0 / arcs;
    var cosStep = Math.cos(step);
    var sinStep = step >= 0 && step < 6.283185307179586 ? step <= 3.141592653589793 ? Math.sqrt(1.0 - cosStep * cosStep) : -Math.sqrt(1.0 - cosStep * cosStep) : Math.sin(step);
    var t2 = Math.cos(angle1);
    var t1 = angle1 >= 0 && angle1 < 6.283185307179586 ? angle1 <= 3.141592653589793 ? Math.sqrt(1.0 - t2 * t2) : -Math.sqrt(1.0 - t2 * t2) : Math.sin(angle1);
    for(var i = 0; i < arcs; i++) {
      var ts = cosStep * t1 + sinStep * t2;
      var tc = cosStep * t2 - sinStep * t1;
      var t3 = ts;
      var t4 = tc;
      var t8 = [cx + rx * crot * t2 - ry * srot * t1, cy + rx * srot * t2 + ry * crot * t1];
      var t9 = [cx + rx * crot * t4 - ry * srot * t3, cy + rx * srot * t4 + ry * crot * t3];
      var t10 = [-rx * crot * t1 - ry * srot * t2, -rx * srot * t1 + ry * crot * t2];
      var t11 = [-rx * crot * t3 - ry * srot * t4, -rx * srot * t3 + ry * crot * t4];
      var t12 = [t8[0] + t10[0] * t7, t8[1] + t10[1] * t7];
      var t13 = [t9[0] - t11[0] * t7, t9[1] - t11[1] * t7];
      ret.push([t8[0], t8[1], t12[0], t12[1], t13[0], t13[1], t9[0], t9[1]]);
      t2 = tc;
      t1 = ts;
    }
    return ret;
  };

/**
 * Adds path segments in the form of an elliptical arc to this path,
 * using the parameterization used by the SVG specification.
 * @param {Number} rx X axis radius of the ellipse that the arc will
 * be formed from.
 * @param {Number} ry Y axis radius of the ellipse that the arc will
 * be formed from.
 * @param {Number} rot Rotation of the ellipse in degrees (clockwise
 * assuming the X axis points right and the Y axis points
 * down under the coordinate system).
 * @param {Boolean} largeArc In general, there are four possible solutions
 * for arcs given the start and end points, rotation, and x- and y-radii. If true,
 * chooses an arc solution with the larger arc length; if false, smaller.
 * @param {Boolean} sweep If true, the arc solution chosen will run
 * clockwise (assuming the X axis points right and the Y axis points
 * down under the coordinate system); if false, counterclockwise.
 * @param {Number} x2 X coordinate of the arc's end point.
 * @param {Number} y2 Y coordinate of the arc's end point.
 * @returns {H3DU.GraphicsPath} This object.
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.arcSvgTo = function(rx, ry, rot, largeArc, sweep, x2, y2) {
    if(rx === 0 || ry === 0) {
      return this.lineTo(x2, y2);
    }
    var x1 = this.endPos[0];
    var y1 = this.endPos[1];
    if(x1 === x2 && y1 === y2) {
      return this;
    }
    rot = rot >= 0 && rot < 360 ? rot : rot % 360 +
       (rot < 0 ? 360 : 0);
    rot *= GraphicsPath._toRadians;
    rx = Math.abs(rx);
    ry = Math.abs(ry);
    var xmid = (x1 - x2) * 0.5;
    var ymid = (y1 - y2) * 0.5;
    var crot = Math.cos(rot);
    var srot = rot >= 0 && rot < 6.283185307179586 ? rot <= 3.141592653589793 ? Math.sqrt(1.0 - crot * crot) : -Math.sqrt(1.0 - crot * crot) : Math.sin(rot);
    var x1p = crot * xmid + srot * ymid;
    var y1p = crot * ymid - srot * xmid;
    var lam = x1p * x1p / (rx * rx) + y1p * y1p / (ry * ry);
    if(lam > 1) {
      lam = Math.sqrt(lam);
      rx *= lam;
      ry *= lam;
    }
    var arc = [GraphicsPath.ARC,
      x1, y1, rx, ry, rot, !!largeArc, !!sweep, x2, y2];
    var cp = GraphicsPath._arcSvgToCenterParam(arc);
    arc[6] = null; // unused
    arc[7] = null; // unused
    arc[10] = cp[0];
    arc[11] = cp[1];
    arc[12] = cp[2];
    arc[13] = cp[3];
    this.segments.push(arc);
    this.endPos[0] = x2;
    this.endPos[1] = y2;
    this.incomplete = false;
    return this;
  };
/** @ignore */
  GraphicsPath._nextAfterWs = function(str, index) {
    while(index[0] < str.length) {
      var c = str.charCodeAt(index[0]);
      index[0]++;
      if(c === 0x20 || c === 0x0d || c === 0x09 || c === 0x0a)
        continue;
      return c;
    }
    return -1;
  };
/** @ignore */
  GraphicsPath._nextAfterSepReq = function(str, index) {
    var comma = false;
    var havesep = false;
    while(index[0] < str.length) {
      var c = str.charCodeAt(index[0]);
      index[0]++;
      if(c === 0x20 || c === 0x0d || c === 0x09 || c === 0x0a) {
        havesep = true;
        continue;
      }
      if(!comma && c === 0x2c) {
        havesep = true;
        comma = true;
        continue;
      }
      return !havesep ? -1 : c;
    }
    return -1;
  };
/** @ignore */
  GraphicsPath._nextAfterSep = function(str, index) {
    var comma = false;
    while(index[0] < str.length) {
      var c = str.charCodeAt(index[0]);
      index[0]++;
      if(c === 0x20 || c === 0x0d || c === 0x09 || c === 0x0a)
        continue;
      if(!comma && c === 0x2c) {
        comma = true;
        continue;
      }
      return c;
    }
    return -1;
  };
/** @ignore */
  GraphicsPath._peekNextNumber = function(str, index) {
    var oldindex = index[0];
    var ret = GraphicsPath._nextNumber(str, index, true) !== null;
    index[0] = oldindex;
    return ret;
  };
/** @ignore */
  GraphicsPath._nextNumber = function(str, index, afterSep) {
    var oldindex = index[0];
    var c = afterSep ?
   GraphicsPath._nextAfterSep(str, index) :
   GraphicsPath._nextAfterWs(str, index);
    var startIndex = index[0] - 1;
    var dot = false;
    var digit = false;
    var exponent = false;
    var ret;
    if(c === 0x2e)dot = true;
    else if(c >= 0x30 && c <= 0x39)digit = true;
    else if(c !== 0x2d && c !== 0x2b) { // plus or minus
      index[0] = oldindex;
      return null;
    }
    while(index[0] < str.length) {
      c = str.charCodeAt(index[0]);
      index[0]++;
      if(c === 0x2e) { // dot
        if(dot) {
          index[0] = oldindex;
          return null;
        }
        dot = true;
      } else if(c >= 0x30 && c <= 0x39) {
        digit = true;
      } else if(c === 0x45 || c === 0x65) {
        if(!digit) {
          index[0] = oldindex;
          return null;
        }
        exponent = true;
        break;
      } else {
        if(!digit) {
          index[0] = oldindex;
          return null;
        }
        index[0]--;
   // console.log(str.substr(startIndex,index[0]-startIndex))
        ret = parseFloat(str.substr(startIndex, index[0] - startIndex));
        if(Number.isNaN(ret)) {
          index[0] = ret;
          return null;
        }
        if(ret === Number.POSITIVE_INFINITY || ret === Number.NEGATIVE_INFINITY)
          return 0;
        return ret;
      }
    }
    if(exponent) {
      c = str.charCodeAt(index[0]);
      if(c < 0) {
        index[0] = oldindex;
        return null;
      }
      index[0]++;
      digit = false;
      if(c >= 0x30 && c <= 0x39)digit = true;
      else if(c !== 0x2d && c !== 0x2b) {
        index[0] = oldindex;
        return null;
      }
      while(index[0] < str.length) {
        c = str.charCodeAt(index[0]);
        index[0]++;
        if(c >= 0x30 && c <= 0x39) {
          digit = true;
        } else {
          if(!digit) {
            index[0] = oldindex;
            return null;
          }
          index[0]--;
          ret = parseFloat(str.substr(startIndex, index[0] - startIndex));
    // console.log([str.substr(startIndex,index[0]-startIndex),ret])
          if(Number.isNaN(ret)) {
            index[0] = oldindex;
            return null;
          }
          if(ret === Number.POSITIVE_INFINITY || ret === Number.NEGATIVE_INFINITY)
            return 0;
          return ret;
        }
      }
      if(!digit) {
        index[0] = oldindex;
        return null;
      }
    } else if(!digit) {
      index[0] = oldindex;
      return null;
    }
    ret = parseFloat(str.substr(startIndex, str.length - startIndex));
 // console.log([str.substr(startIndex,str.length-startIndex),ret])
    if(Number.isNaN(ret)) {
      index[0] = oldindex;
      return null;
    }
    if(ret === Number.POSITIVE_INFINITY || ret === Number.NEGATIVE_INFINITY)
      return 0;
    return ret;
  };

/**
 * Returns a modified version of this path that is transformed
 * according to the given affine transformation (a transformation
 * that keeps straight lines straight and parallel lines parallel).
 * @param {Array<Number>} trans An array of six numbers
 * describing a 2-dimensional affine transformation. For each
 * point in the current path, its new X coordinate is `trans[0] * X +
 * trans[2] * Y + trans[4]`, and its new Y coordinate is `trans[1] * X +
 * trans[3] * Y + trans[5]`.
 * @returns {H3DU.GraphicsPath} The transformed version of this path.
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.transform = function(trans) {
    var ret = new GraphicsPath();
    var a = trans[0];
    var b = trans[1];
    var c = trans[2];
    var d = trans[3];
    var e = trans[4];
    var f = trans[5];
    var x, y, i, j;
    var tmp = [0];
    var oldpos = null;
    for(i = 0; i < this.segments.length; i++) {
      var s = this.segments[i];
      var domove = false;
      if(s[0] !== GraphicsPath.CLOSE) {
        var start = GraphicsPath._startPoint(s);
        if(!oldpos || oldpos[0] !== start[0] || oldpos[1] !== start[1]) {
          domove = true;
        }
        oldpos = GraphicsPath._endPoint(s);
      }
      switch(s[0]) {
      case GraphicsPath.CLOSE:
        ret.closePath();
        oldpos = null;
        break;
      case GraphicsPath.LINE:
      case GraphicsPath.QUAD:
      case GraphicsPath.CUBIC:
        for(j = 1; j < s.length; j += 2) {
          tmp[j] = a * s[j] + c * s[j + 1] + e;
          tmp[j + 1] = b * s[j] + d * s[j + 1] + f;
        }
        if(domove)
          ret.moveTo(tmp[1], tmp[2]);
        if(s[0] === GraphicsPath.LINE)
          ret.lineTo(tmp[3], tmp[4]);
        else if(s[0] === GraphicsPath.QUAD)
          ret.quadraticCurveTo(tmp[3], tmp[4], tmp[5], tmp[6]);
        else if(s[0] === GraphicsPath.CUBIC)
          ret.bezierCurveTo(tmp[3], tmp[4], tmp[5], tmp[6], tmp[7], tmp[8]);
        break;
      case GraphicsPath.ARC: {
        if(a === 1 && b === 0 && c === 0 && d === 1) {
          // just a translation
          var delta = s[13] - s[12];
          var largeArc = Math.abs(delta) > Math.PI;
          if(domove)ret.moveTo(s[1] + e, s[2] + f);
          ret.arcSvgTo(s[3], s[4], s[5] * GraphicsPath._toDegrees,
         largeArc, delta > 0, s[8] + e, s[9] + f);
          break;
        }
        if(b === 0 && c === 0 && s[5] === 0) {
    // any scale and ellipse rotation 0
          delta = s[13] - s[12];
          largeArc = Math.abs(delta) > Math.PI;
          if(domove)ret.moveTo(a * s[1] + e, d * s[2] + f);
          ret.arcSvgTo(a * s[3], d * s[4], 0,
         largeArc, delta > 0, a * s[8] + e, d * s[9] + f);
          break;
        }
        var curves = GraphicsPath._arcToBezierCurves(s[10], s[11], s[3], s[4], s[5], s[12], s[13]);
        curves[0][0] = s[1];
        curves[0][1] = s[2];
        curves[curves.length - 1][6] = s[8];
        curves[curves.length - 1][7] = s[9];
        for(j = 0; j < curves.length; j++) {
          var cs = curves[j];
          for(var k = 0; k < 8; k += 2) {
            x = a * cs[k] + c * cs[k + 1] + e;
            y = b * cs[k] + d * cs[k + 1] + f;
            cs[k] = x;
            cs[k + 1] = y;
          }
          if(domove && j === 0)ret.moveTo(cs[0], cs[1]);
          ret.bezierCurveTo(cs[2], cs[3], cs[4], cs[5], cs[6], cs[7]);
        }
        break;
      }
      default:
        break;
      }
    }
    return ret;
  };

  /**
   * Adds path segments to this path that form an axis-aligned rectangle.
   * @param {Number} x X coordinate of the rectangle's upper-left corner (assuming the
   * coordinate system's X axis points right and the Y axis down).
   * @param {Number} y Y coordinate of the rectangle's upper-left corner (assuming the
   * coordinate system's X axis points right and the Y axis down).
   * @param {Number} w Width of the rectangle.
   * @param {Number} h Height of the rectangle.
   * @returns {H3DU.GraphicsPath} This object. If "w" or "h" is 0, no path segments will be appended.
   * @instance
   * @memberof! H3DU.GraphicsPath#
   */
  GraphicsPath.prototype.rect = function(x, y, w, h) {
    if(w < 0 || h < 0)return this;
    return this.moveTo(x, y)
  .lineTo(x + w, y)
  .lineTo(x + w, y + h)
  .lineTo(x, y + h)
  .closePath();
  };

/**
 * Creates a graphics path from a string whose format follows
 * the SVG specification.
 * @param {String} str A string, in the SVG path format, representing
 * a two-dimensional path. An SVG path consists of a number of
 * path segments, starting with a single letter, as follows:
 * <ul>
 * <li>M/m (x y) - Moves the current position to (x, y). Further
 * XY pairs specify line segments.
 * <li>L/l (x y) - Specifies line segments to the given XY points.
 * <li>H/h (x) - Specifies horizontal line segments to the given X points.
 * <li>V/v (y) - Specifies vertical line segments to the given Y points.
 * <li>Q/q (cx cx x y) - Specifies quadratic B&eacute;zier curves
 * (see quadraticCurveTo).
 * <li>T/t (x y) - Specifies quadratic curves tangent to the previous
 * quadratic curve.
 * <li>C/c (c1x c1y c2x c2y x y) - Specifies cubic B&eacute;zier curves
 * (see bezierCurveTo).
 * <li>S/s (c2x c2y x y) - Specifies cubic curves tangent to the previous
 * cubic curve.
 * <li>A/a (rx ry rot largeArc sweep x y) - Specifies arcs (see arcSvgTo).
 * "largeArc" and "sweep" are flags, "0" for false and "1" for true.
 * "rot" is in degrees.
 * <li>Z/z - Closes the current path; similar to adding a line segment
 * to the first XY point given in the last M/m command.
 * </ul>
 * Lower-case letters mean any X and Y coordinates are relative
 * to the current position of the path. Each group of parameters
 * can be repeated in the same path segment. Each parameter after
 * the starting letter is separated by whitespace and/or a single comma,
 * and the starting letter can be separated by whitespace.
 * This separation can be left out as long as doing so doesn't
 * introduce ambiguity. All commands set the current point
 * to the end of the path segment (including Z/z, which adds a line
 * segment if needed).
 * @returns {H3DU.GraphicsPath} The resulting path. If an error
 * occurs while parsing the path, the path's "isIncomplete() method
 * will return <code>true</code>.
 * @example <caption>The following example creates a graphics path
 * from an SVG string describing a polyline.</caption>
 * var path=H3DU.GraphicsPath.fromString("M10,20L40,30,24,32,55,22")
 * @memberof! H3DU.GraphicsPath
 */
  GraphicsPath.fromString = function(str) {
    var index = [0];
    var started = false;
    var ret = new GraphicsPath();
    var failed = false;
    var endx, endy;
    var sep, curx, cury, x, y, curpt, x2, y2, xcp, ycp;
    while(!failed && index[0] < str.length) {
  // console.log("////"+[index,str.substr(index[0],30)])
      var c = GraphicsPath._nextAfterWs(str, index);
      if(!started && c !== 0x4d && c !== 0x6d) {
   // not a move-to command when path
   // started
        failed = true; break;
      }
  // NOTE: Doesn't implement SVG2 meaning of Z
  // command yet because it's not yet fully specified
      switch(c) {
      case 0x5a:case 0x7a:{ // 'Z', 'z'
        ret.closePath();
        break;
      }
      case 0x4d:case 0x6d:{ // 'M', 'm'
        sep = false;
        for (;;) {
          curx = c === 0x6d ? ret.endPos[0] : 0;
          cury = c === 0x6d ? ret.endPos[1] : 0;
          x = GraphicsPath._nextNumber(str, index, sep);
          if(typeof x === "undefined" || x === null) {
            if(!sep)failed = true; break;
          }
          y = GraphicsPath._nextNumber(str, index, true);
          if(typeof y === "undefined" || y === null) {
            failed = true; break;
          }
     // console.log([x,y])
          if(sep)ret.lineTo(curx + x, cury + y);
          else ret.moveTo(curx + x, cury + y);
          sep = true;
        }
        started = true;
        break;
      }
      case 0x4c:case 0x6c:{ // 'L', 'l'
        sep = false;
        for (;;) {
          curx = c === 0x6c ? ret.endPos[0] : 0;
          cury = c === 0x6c ? ret.endPos[1] : 0;
          x = GraphicsPath._nextNumber(str, index, sep);
          if(typeof x === "undefined" || x === null) {
            if(!sep)failed = true; break;
          }
          y = GraphicsPath._nextNumber(str, index, true);
          if(typeof y === "undefined" || y === null) {
            failed = true; break;
          }
          ret.lineTo(curx + x, cury + y);
          sep = true;
        }
        break;
      }
      case 0x48:case 0x68:{ // 'H', 'h'
        sep = false;
        for (;;) {
          curpt = c === 0x68 ? ret.endPos[0] : 0;
          x = GraphicsPath._nextNumber(str, index, sep);
          if(typeof x === "undefined" || x === null) {
            if(!sep)failed = true; break;
          }
          ret.lineTo(curpt + x, ret.endPos[1]);
          sep = true;
        }
        break;
      }
      case 0x56:case 0x76:{ // 'V', 'v'
        sep = false;
        for (;;) {
          curpt = c === 0x76 ? ret.endPos[1] : 0;
          x = GraphicsPath._nextNumber(str, index, sep);
          if(typeof x === "undefined" || x === null) {
            if(!sep)failed = true; break;
          }
          ret.lineTo(ret.endPos[0], curpt + x);
          sep = true;
        }
        break;
      }
      case 0x43:case 0x63:{ // 'C', 'c'
        sep = false;
        for (;;) {
          curx = c === 0x63 ? ret.endPos[0] : 0;
          cury = c === 0x63 ? ret.endPos[1] : 0;
          x = GraphicsPath._nextNumber(str, index, sep);
          if(typeof x === "undefined" || x === null) {
            if(!sep)failed = true; break;
          }
          y = GraphicsPath._nextNumber(str, index, true);
          if(typeof y === "undefined" || y === null) {
            failed = true; break;
          }
          x2 = GraphicsPath._nextNumber(str, index, true);
          if(typeof x2 === "undefined" || x2 === null) {
            failed = true; break;
          }
          y2 = GraphicsPath._nextNumber(str, index, true);
          if(typeof y2 === "undefined" || y2 === null) {
            failed = true; break;
          }
          var x3 = GraphicsPath._nextNumber(str, index, true);
          if(typeof x3 === "undefined" || x3 === null) {
            failed = true; break;
          }
          var y3 = GraphicsPath._nextNumber(str, index, true);
          if(typeof y3 === "undefined" || y3 === null) {
            failed = true; break;
          }
          ret.bezierCurveTo(curx + x, cury + y, curx + x2, cury + y2,
       curx + x3, cury + y3);
          sep = true;
        }
        break;
      }
      case 0x51:case 0x71:{ // 'Q', 'q'
        sep = false;
        for (;;) {
          curx = c === 0x71 ? ret.endPos[0] : 0;
          cury = c === 0x71 ? ret.endPos[1] : 0;
          x = GraphicsPath._nextNumber(str, index, sep);
          if(typeof x === "undefined" || x === null) {
            if(!sep)failed = true; break;
          }
          y = GraphicsPath._nextNumber(str, index, true);
          if(typeof y === "undefined" || y === null) {
            failed = true; break;
          }
          x2 = GraphicsPath._nextNumber(str, index, true);
          if(typeof x2 === "undefined" || x2 === null) {
            failed = true; break;
          }
          y2 = GraphicsPath._nextNumber(str, index, true);
          if(typeof y2 === "undefined" || y2 === null) {
            failed = true; break;
          }
          ret.quadraticCurveTo(curx + x, cury + y, curx + x2, cury + y2);
          sep = true;
        }
        break;
      }
      case 0x41:case 0x61:{ // 'A', 'a'
        sep = false;
        for (;;) {
          curx = c === 0x61 ? ret.endPos[0] : 0;
          cury = c === 0x61 ? ret.endPos[1] : 0;
          x = GraphicsPath._nextNumber(str, index, sep);
          if(typeof x === "undefined" || x === null) {
            if(!sep)failed = true; break;
          }
          y = GraphicsPath._nextNumber(str, index, true);
          if(typeof y === "undefined" || y === null) {
            failed = true; break;
          }
          var rot = GraphicsPath._nextNumber(str, index, true);
          if(typeof rot === "undefined" || rot === null) {
            failed = true; break;
          }
          var largeArc = GraphicsPath._nextAfterSepReq(str, index);
          var sweep = GraphicsPath._nextAfterSep(str, index);
          if(largeArc === -1 || sweep === -1) {
            failed = true; break;
          }
          x2 = GraphicsPath._nextNumber(str, index, true);
          if(typeof x2 === "undefined" || x2 === null) {
            failed = true; break;
          }
          y2 = GraphicsPath._nextNumber(str, index, true);
          if(typeof y2 === "undefined" || y2 === null) {
            failed = true; break;
          }
          ret.arcSvgTo(x + curx, y + cury, rot, largeArc !== 0x30,
       sweep !== 0x30, x2 + curx, y2 + cury);
          sep = true;
        }
        break;
      }
      case 0x53:case 0x73:{ // 'S', 's'
        sep = false;
        for (;;) {
          curx = c === 0x73 ? ret.endPos[0] : 0;
          cury = c === 0x73 ? ret.endPos[1] : 0;
          x = GraphicsPath._nextNumber(str, index, sep);
          if(typeof x === "undefined" || x === null) {
            if(!sep)failed = true; break;
          }
          y = GraphicsPath._nextNumber(str, index, true);
          if(typeof y === "undefined" || y === null) {
            failed = true; break;
          }
          x2 = GraphicsPath._nextNumber(str, index, true);
          if(typeof x2 === "undefined" || x2 === null) {
            failed = true; break;
          }
          y2 = GraphicsPath._nextNumber(str, index, true);
          if(typeof y2 === "undefined" || y2 === null) {
            failed = true; break;
          }
          xcp = ret.endPos[0]; // control point to use if previous segment is not a cubic
          ycp = ret.endPos[1];
          endx = ret.endPos[0];
          endy = ret.endPos[1];
    // NOTE: If previous segment is not a cubic, first control
    // point is same as current point.
          if(ret.segments.length > 0 &&
        ret.segments[ret.segments.length - 1][0] === GraphicsPath.CUBIC) {
            xcp = ret.segments[ret.segments.length - 1][5];
            ycp = ret.segments[ret.segments.length - 1][6];
          }
          ret.bezierCurveTo(2 * endx - xcp, 2 * endy - ycp, x + curx, y + cury, x2 + curx, y2 + cury);
          sep = true;
        }
        break;
      }
      case 0x54:case 0x74:{ // 'T', 't'
        sep = false;
        for (;;) {
          curx = c === 0x74 ? ret.endPos[0] : 0;
          cury = c === 0x74 ? ret.endPos[1] : 0;
          x = GraphicsPath._nextNumber(str, index, sep);
          if(typeof x === "undefined" || x === null) {
            if(!sep)failed = true; break;
          }
          y = GraphicsPath._nextNumber(str, index, true);
          if(typeof y === "undefined" || y === null) {
            failed = true; break;
          }
          xcp = ret.endPos[0]; // control point to use if previous segment is not a quad
          ycp = ret.endPos[1];
          endx = ret.endPos[0];
          endy = ret.endPos[1];
    // NOTE: If previous segment is not a quad, first control
    // point is same as current point.
          if(ret.segments.length > 0 &&
        ret.segments[ret.segments.length - 1][0] === GraphicsPath.QUAD) {
            xcp = ret.segments[ret.segments.length - 1][3];
            ycp = ret.segments[ret.segments.length - 1][4];
          }
          ret.quadraticCurveTo(2 * endx - xcp, 2 * endy - ycp, x + curx, y + cury);
          sep = true;
        }
        break;
      }
      default:
        ret.incomplete = true;
        return ret;
      }
    }
    if(failed)ret.incomplete = true;
    return ret;
  };

  Triangulate._CONVEX = 1;
  Triangulate._EAR = 2;
  Triangulate._REFLEX = 3;
/** @ignore */
  Triangulate._pointInTri = function(i1, i2, i3, p) {
    if(p[0] === i1[0] && p[1] === i1[1])return false;
    if(p[0] === i2[0] && p[1] === i2[1])return false;
    if(p[0] === i3[0] && p[1] === i3[1])return false;
    var t3 = i2[0] - i3[0];
    var t4 = i2[1] - i3[1];
    var t5 = i2[0] - i1[0];
    var t6 = i2[1] - i1[1];
    var t7 = t5 * t3 + t6 * t4;
    var t8 = t5 * t5 + t6 * t6 - t7 * t7 / (
    t3 * t3 + t4 * t4);
    if (Math.sqrt(Math.abs(t8)) > 1e-9) {
      var t9 = i3[0] - i1[0];
      var t10 = i3[1] - i1[1];
      var t11 = i2[0] - i1[0];
      var t12 = i2[1] - i1[1];
      var t13 = p[0] - i1[0];
      var t14 = p[1] - i1[1];
      var t15 = t9 * t9 + t10 * t10;
      var t16 = t9 * t11 + t10 * t12;
      var t17 = t9 * t13 + t10 * t14;
      var t18 = t11 * t11 + t12 * t12;
      var t19 = t11 * t13 + t12 * t14;
      var t20 = 1.0 / (t15 * t18 - t16 * t16);
      var t21 = (t18 * t17 - t16 * t19) * t20;
      var t22 = (t15 * t19 - t16 * t17) * t20;
      return t21 > 1e-9 && t22 > 1e-9 &&
     t21 + t22 < 1.0 - 1e-9;
    } else {
      return false;
    }
  };
  /** @ignore */
  Triangulate._vertClass = function(v, ori, vertices) {
    var curori = Triangulate._triOrient(v.prev.data, v.data, v.next.data);
    if(curori === 0 || curori === ori) {
  // This is a convex vertex, find out whether this
  // is an ear
      for (var i = 0; i < vertices.length; i++) {
        var vert = vertices[i];
        if(v.prev === vert || v === vert || v.next === vert)continue;
        var ptintri = Triangulate._pointInTri(v.prev.data, v.data, v.next.data, vert.data);
        if(ptintri) {
          return Triangulate._CONVEX;
        }
      }
      return Triangulate._EAR;
    } else {
      return Triangulate._REFLEX;
    }
  };
/** @ignore */
  Triangulate._triOrient = function(v1, v2, v3) {
    var ori = v1[0] * v2[1] - v1[1] * v2[0];
    ori += v2[0] * v3[1] - v2[1] * v3[0];
    ori += v3[0] * v1[1] - v3[1] * v1[0];
    return ori === 0 ? 0 : ori < 0 ? -1 : 1;
  };
/** @ignore */
  Triangulate._triangleMidAngle = function(v1, v2, v3) {
    var dx1 = v2[0] - v1[0];
    var dy1 = v2[1] - v1[1];
    var len = dx1 * dx1 + dy1 * dy1;
    if(len !== 0) {
      dx1 /= len;
      dy1 /= len;
    }
    var dx2 = v3[0] - v1[0];
    var dy2 = v3[1] - v1[1];
    len = dx2 * dx2 + dy2 * dy2;
    if(len !== 0) {
      dx2 /= len;
      dy2 /= len;
    }
    var dot = dx1 * dx2 + dy1 * dy2;
    if(dot < -1)dot = -1;
    if(dot > 1)dot = 1;
    return Math.acos(dot);
  };

/** @ignore */
  Triangulate._Contour = function(vertices) {
    this.vertexList = new LinkedList();
    var vertLength = vertices.length;
 // For convenience, eliminate the last
 // vertex if it matches the first vertex
    if(vertLength >= 4 &&
    vertices[0] === vertices[vertLength - 2] &&
    vertices[1] === vertices[vertLength - 1]) {
      vertLength -= 2;
    }
    var lastX = -1;
    var lastY = -1;
    var maxXNode = null;
    var maxX = -1;
    var inf = Number.POSITIVE_INFINITY;
    var bounds = [inf, inf, -inf, -inf];
    var firstVertex = true;
    this.vertexCount = 0;
    var i;
    for(i = 0; i < vertLength; i += 2) {
      var x = vertices[i];
      var y = vertices[i + 1];
      if(i > 0 && x === lastX && y === lastY) {
   // skip consecutive duplicate points
        continue;
      }
      lastX = x;
      lastY = y;
      this.vertexList.push([x, y]);
      if(!maxXNode || x > maxX) {
        maxX = x;
        maxXNode = this.vertexList.last();
      }
      if(firstVertex) {
        bounds[0] = bounds[2] = x;
        bounds[1] = bounds[3] = y;
        firstVertex = false;
      } else {
        bounds[0] = Math.min(bounds[0], x);
        bounds[1] = Math.min(bounds[1], y);
        bounds[2] = Math.max(bounds[2], x);
        bounds[3] = Math.max(bounds[3], y);
      }
      this.vertexCount++;
    }
    this.maxXNode = maxXNode;
    this.bounds = bounds;
 // Find the prevailing winding of the polygon
    var ori = 0;
    var vert = this.vertexList.first();
    var firstVert = vert.data;
    while(vert) {
      var vn = vert.next ? vert.next.data : firstVert;
      ori += vert.data[0] * vn[1] - vert.data[1] * vn[0];
      vert = vert.next;
    }
    this.winding = ori === 0 ? 0 : ori < 0 ? -1 : 1;
  };
  Triangulate._Contour.prototype.findVisiblePoint = function(x, y) {
    var vert = this.vertexList.first();
    if(typeof vert === "undefined" || vert === null)return null;
    var bounds = this.bounds;
    if(x < bounds[0] || y < bounds[1] || x > bounds[2] || y > bounds[2])return null;
    var lastVert = this.vertexList.last();
    var firstVert = vert;
    var closeVertices = [];
    while(vert) {
      var vn = vert.next ? vert.next : firstVert;
      var x1 = vert.data[0];
      var x2 = vn.data[0];
      var y1 = vert.data[1];
      var y2 = vn.data[1];
      var xmin = Math.min(x1, x2);
      var xmax = Math.max(x1, x2);
      var ymin = Math.min(y1, y2);
      var ymax = Math.max(y1, y2);
      if(x1 === x && y1 === y) {
        return vert;
      } else if(x2 === x && y2 === y) {
        return vn;
      }
      if(x <= xmax && y >= ymin && y <= ymax) {
        if(y1 === y2) {
     // parallel to the ray
          closeVertices.push([
            xmin, xmin === vert.data[0] ? vert : vn, true]);
        } else {
          var dx = x2 - x1;
          var t = (y - y1) / (y2 - y1);
          var xi = x + dx * t;
          if(xi >= x) {
            if(xi === x1) {
              closeVertices.push([xi, vert, true]);
            } else if(xi === x2) {
              closeVertices.push([xi, vn, true]);
            } else {
              closeVertices.push([xi, vert, false]);
            }
          }
        }
      }
      vert = vert.next;
    }
    if(closeVertices.length === 0) {
   // no visible vertices
      return null;
    } else if(closeVertices.length > 1) {
   // sort by X coordinate
      closeVertices = closeVertices.sort(function(a, b) {
        if(a[0] === b[0])return 0;
        return a[0] < b[0] ? -1 : 1;
      });
    }
    if(closeVertices[0][2]) {
   // closest vertex is already a vertex of
   // the contour
      return closeVertices[0][1];
    }
    vert = closeVertices[0][1];
    var nextVert = vert.next ? vert.next : firstVert;
    var triangle1 = [x, y];
    var triangle2 = [closeVertices[0][0], y];
    var iterVert = firstVert;

    var innerReflexes = [];
    while(iterVert) {
      if(iterVert !== nextVert) {
        var iterPrev = iterVert.prev ? iterVert.prev : lastVert;
        var iterNext = iterVert.next ? iterVert.next : firstVert;
        var orient = Triangulate._triOrient(iterPrev.data, iterVert.data, iterNext.data);
        if(orient !== 0 && orient !== this.vertexList.winding) {
      // This is a reflex vertex
          var pointIn = Triangulate._pointInTri(
       triangle1, triangle2, nextVert.data, iterVert.data);
          if(pointIn) {
       // The reflex vertex is in the triangle
            var t1 = iterVert.data[0] - triangle1[0];
            var t2 = iterVert.data[1] - triangle1[1];
            var distance = Math.sqrt(t1 * t1 + t2 * t2);
            var angle = t1 / distance;
            if(angle < -1)angle = -1;
            if(angle > 1)angle = 1;
            innerReflexes.push([Math.acos(angle), distance, iterVert]);
          }
        }
      }
      iterVert = iterVert.next;
    }
    if(innerReflexes.length === 0) {
   // vertex after the intersected vertex is visible
      return nextVert;
    }
  // sort by angle, then by distance
    if(innerReflexes.length > 1) {
      innerReflexes = innerReflexes.sort(function(a, b) {
        if(a[0] === b[0]) {
          if(a[1] === b[1])return 0;
          return a[1] < b[1] ? -1 : 1;
        }
        return a[0] < b[0] ? -1 : 1;
      });
    }
    return innerReflexes[0][2];
  };

/**
 * Converts the subpaths in this path to triangles.
 * Treats each subpath as a polygon even if it isn't closed.
 * Each subpath should not contain self-intersections or
 * duplicate vertices, except duplicate vertices that appear
 * consecutively or at the start and end.<p>
 * The path can contain holes. In this case, subpaths
 * whose winding order (counterclockwise or clockwise)
 * differs from the first subpath's winding order can be holes.
 * @param {Number} [flatness] When curves and arcs
 * are decomposed to line segments, the
 * segments will be close to the true path of the curve by this
 * value, given in units. If null or omitted, default is 1.
 * @returns {Array<Array<Number>>} Array of six-element
 * arrays each describing a single triangle. For each six-element
 * array, the first two, next two, and last two numbers each
 * describe a vertex position of that triangle (X and Y coordinates
 * in that order).
 * @instance
 * @memberof! H3DU.GraphicsPath#
 */
  GraphicsPath.prototype.getTriangles = function(flatness) {
    if(typeof flatness === "undefined" || flatness === null)flatness = 1.0;
    // NOTE: _getSubpaths doesn't add degenerate line segments
    var subpaths = this._getSubpaths(flatness, true);
    var contours1 = [];
    var contours2 = [];
    var firstOrient = 0;
    var tris = [];
    var i, j;
    for(i = 0; i < subpaths.length; i++) {
      var contour = new Triangulate._Contour(subpaths[i]);
  // NOTE: Ignores contours with winding 0
  // (empty, zero area, sometimes self-intersecting)
      if(contour.winding > 0) {
        if(firstOrient === 0)firstOrient = 1;
        contours1.push(contour);
      } else if(contour.winding < 0) {
        if(firstOrient === 0)firstOrient = -1;
        contours2.push(contour);
      }
    }
    if(contours2.length === 0 || contours1.length === 0) {
  // All the contours have the same winding order
      var c = contours2.length === 0 ? contours1 : contours2;
      for(i = 0; i < c.length; i++) {
        Triangulate._triangulate(c[i], tris);
      }
    } else {
      var c1 = firstOrient > 0 ? contours1 : contours2;
      var c2 = firstOrient > 0 ? contours2 : contours1;
      for(i = 0; i < c2.length; i++) {
        if(!c2[i])continue;
        for(j = 0; j < c1.length; j++) {
          if(!c1[j])continue;
          var maxPoint = c2[i].maxXNode;
    // Find out if the contour is inside another contour,
    // and if so, connect its vertices to that contour
          var vp = c1[j].findVisiblePoint(
      maxPoint.data[0], maxPoint.data[1]);
          if(vp) {
            c1[j].vertexCount += Triangulate._connectContours(
       c2[i].vertexList, c1[j].vertexList, maxPoint, vp);
            c2[i] = null;
            break;
          }
        }
      }
      for(i = 0; i < c1.length; i++) {
        Triangulate._triangulate(c1[i], tris);
      }
      for(i = 0; i < c2.length; i++) {
        Triangulate._triangulate(c2[i], tris);
      }
    }
    return tris;
  };
/** @ignore */
  Triangulate._connectContours = function(src, dst, maxPoint, dstNode) {
    var vpnode = dstNode;
    var c2node = maxPoint;
    var count = 0;
    while(c2node) {
      vpnode = dst.insertAfter(c2node.data, vpnode);
      c2node = c2node.next;
      count++;
    }
    c2node = src.first();
    while(c2node !== maxPoint && (typeof c2node !== "undefined" && c2node !== null)) {
      vpnode = dst.insertAfter(c2node.data, vpnode);
      c2node = c2node.next;
      count++;
    }
    vpnode = dst.insertAfter(maxPoint.data, vpnode);
    dst.insertAfter(dstNode.data, vpnode);
    count += 2;
    return count;
  };
/** @ignore */
  Triangulate._triangulate = function(contour, tris) {
    var t1, tri;
    if(!contour || contour.vertexCount < 3 || contour.winding === 0) {
  // too few vertices, or the winding
  // suggests a zero area or even a certain
  // self-intersecting polygon
      return;
    } else if(contour.vertexCount === 3) {
  // just one triangle
      t1 = contour.vertexList.first();
      tri = [];
      while(t1) {
        tri.push(t1.data[0], t1.data[1]);
        t1 = t1.next;
      }
      tris.push(tri);
      return;
    }
 // Make the vertex list circular
    var first = contour.vertexList.first();
    var last = contour.vertexList.last();
    if(!last)throw new Error();
    var vert;
    var vertices = [];
    vert = first;
    for (;;) {
      vertices.push(vert);
      if(vert === last)break;
      vert = vert.next;
    }
    first.prev = last;
    last.next = first;

    while(contour.vertexCount > 3) {
      vert = contour.vertexList.first();
      var minAngleEar = null;
      var firstMinAngle = false;
      var angle = Math.PI;
      for(var i = 0; i < contour.vertexCount; i++) {
        var vertexClass = Triangulate._vertClass(vert,
          contour.winding, vertices);
        if(vertexClass === Triangulate._EAR) {
          if(typeof minAngleEar === "undefined" || minAngleEar === null) {
            minAngleEar = vert;
            firstMinAngle = true;
          } else {
            if(firstMinAngle) {
              angle = Triangulate._triangleMidAngle(minAngleEar.prev.data,
        minAngleEar.data, minAngleEar.next.data);
              firstMinAngle = false;
            }
            var thisAngle = Triangulate._triangleMidAngle(vert.prev.data, vert.data, vert.next.data);
            if(thisAngle < angle) {
              minAngleEar = vert;
              angle = thisAngle;
            }
          }
        }
        vert = vert.next;
      }
      if(!minAngleEar) {
        minAngleEar = contour.vertexList.first();
      }
      tri = [minAngleEar.prev.data[0], minAngleEar.prev.data[1],
        minAngleEar.data[0], minAngleEar.data[1],
        minAngleEar.next.data[0], minAngleEar.next.data[1]];
      tris.push(tri);
      contour.vertexList.erase(minAngleEar);
      contour.vertexCount--;
    }
    t1 = contour.vertexList.first();
    tri = [];
    first = t1;
 // At this point, there will be only three
 // vertices left
    while(t1) {
      tri.push(t1.data[0], t1.data[1]);
      t1 = t1.next;
      if(t1 === first)break;
    }
    tris.push(tri);
  };
  if(typeof exports.H3DU !== "undefined" && exports.H3DU !== null) {
    exports.H3DU.GraphicsPath = GraphicsPath;
  }
/* exported GraphicsPath */
/**
 * Alias for the {@link H3DU.GraphicsPath} class.
 * @class
 * @alias GraphicsPath
 * @deprecated Use {@link H3DU.GraphicsPath} instead.
 */
  exports.GraphicsPath = GraphicsPath;
}));
