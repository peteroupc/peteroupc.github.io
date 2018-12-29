/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
/* global H3DU, define, exports, flatness, tri */
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

  /** @ignore */
  function LineCurve(x1, y1, x2, y2) {
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
  }
  LineCurve.prototype = Object.create(H3DU.Curve.prototype);
  LineCurve.prototype.constructor = LineCurve;
  /** @ignore */
  LineCurve.prototype.evaluate = function(u) {
    return [
      this.x1 + (this.x2 - this.x1) * u,
      this.y1 + (this.y2 - this.y1) * u, 0
    ];
  };
  /** @ignore */
  LineCurve.prototype.velocity = function() {
    return [
      this.x2 - this.x1,
      this.y2 - this.y1, 0
    ];
  };
  /** @ignore */
  LineCurve.prototype.arcLength = function(u) {
    var x = this.x1 + (this.x2 - this.x1) * u;
    var y = this.y1 + (this.y2 - this.y1) * u;
    var dx = x - this.x1;
    var dy = y - this.y1;
    var ret = Math.sqrt(dx * dx + dy * dy);
    if(u < 0)ret = -ret;
    return ret;
  };

  /** @ignore */
  function ArcCurve(x1, y1, x2, y2, rx, ry, rot, cx, cy, theta, delta) {
    this.x1 = x1;
    this.x2 = x2;
    this.y1 = y1;
    this.y2 = y2;
    this.rx = rx;
    this.ry = ry;
    var cr = Math.cos(rot);
    var sr = rot >= 0 && rot < 6.283185307179586 ? rot <= 3.141592653589793 ? Math.sqrt(1.0 - cr * cr) : -Math.sqrt(1.0 - cr * cr) : Math.sin(rot);
    this.cr = cr;
    this.sr = sr;
    this.cx = cx;
    this.cy = cy;
    this.theta = theta;
    this.delta = delta;
  }
  ArcCurve.prototype = Object.create(H3DU.Curve.prototype);
  ArcCurve.prototype.constructor = ArcCurve;
  /** @ignore */
  ArcCurve.prototype.evaluate = function(t) {
    if(t === 0)return [this.x1, this.y1, 0];
    if(t === 1)return [this.x2, this.y2, 0];
    var angle = this.theta + this.delta * t;
    var ca = Math.cos(angle);
    var sa = angle >= 0 && angle < 6.283185307179586 ? angle <= 3.141592653589793 ? Math.sqrt(1.0 - ca * ca) : -Math.sqrt(1.0 - ca * ca) : Math.sin(angle);
    return [
      this.cr * ca * this.rx - this.sr * sa * this.rx + this.cx,
      this.sr * ca * this.rx + this.cr * sa * this.ry + this.cy, 0];
  };
  /** @ignore */
  ArcCurve.prototype.velocity = function(t) {
    var angle = this.theta + this.delta * t;
    var ca = Math.cos(angle);
    var sa = angle >= 0 && angle < 6.283185307179586 ? angle <= 3.141592653589793 ? Math.sqrt(1.0 - ca * ca) : -Math.sqrt(1.0 - ca * ca) : Math.sin(angle);
    var caDeriv = -sa * this.delta;
    var saDeriv = ca * this.delta;
    return [
      this.cr * caDeriv * this.rx - this.sr * saDeriv * this.rx,
      this.sr * caDeriv * this.rx + this.cr * saDeriv * this.ry, 0];
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
   * @constructor
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
   * @returns {boolean} Return value.
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
  GraphicsPath._segToCurve = function(seg, t) {
    if(seg[0] === GraphicsPath.LINE) {
      return new LineCurve(seg[1], seg[2], seg[3], seg[4]);
    } else if(seg[0] === GraphicsPath.QUAD) {
      return H3DU.BSplineCurve.fromBezierCurve([
        [seg[1], seg[2], 0], [seg[3], seg[4], 0], [seg[5], seg[6], 0]]);
    } else if(seg[0] === GraphicsPath.CUBIC) {
      return H3DU.BSplineCurve.fromBezierCurve([
        [seg[1], seg[2], 0], [seg[3], seg[4], 0], [seg[5], seg[6], 0], [seg[7], seg[8], 0]]);
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
      return new ArcCurve(seg[1], seg[2], seg[8], seg[9], rx, ry, rot, cx, cy, theta, delta);
    } else {
      throw new Error();
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
   * @returns {string} A string describing the path in the SVG path
   * format.
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
  /**
   * Finds the approximate length of this path.
   * @param {number} [flatness] No longer used by this method.
   * @returns {number} Approximate length of this path
   * in units.
   * @memberof! H3DU.GraphicsPath#
   */
  GraphicsPath.prototype.pathLength = function(flatness) {
    if(this.segments.length === 0)return 0;
    if(typeof flatness !== "undefined" && flatness !== null) {
      console.warn("Unused parameter flatness is defined");
    }
    return this.getCurves().getLength();
  };
  /**
   * Gets an array of line segments approximating
   * the path.
   * @param {number} [flatness] When curves and arcs
   * are decomposed to line segments, the
   * segments will be close to the true path of the curve by this
   * value, given in units. If null, undefined, or omitted, default is 1.
   * @returns {Array<Array<number>>} Array of line segments.
   * Each line segment is an array of four numbers: the X and
   * Y coordinates of the start point, respectively, then the X and
   * Y coordinates of the end point, respectively.
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
   * @param {number} [flatness] When curves and arcs
   * are decomposed to line segments, the
   * segments will be close to the true path of the curve by this
   * value, given in units. If null, undefined, or omitted, default is 1.
   * @returns {H3DU.GraphicsPath} A path consisting only of line
   * segments and close commands.
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
   * @returns {Array<number>} An array of four numbers
   * describing the bounding box. The first two are
   * the lowest X and Y coordinates, and the last two are
   * the highest X and Y coordinates. If the path is empty,
   * returns the array (Infinity, Infinity, -Infinity, -Infinity).
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
        } else if(delta !== theta) { // NOTE: Endpoints were already included in case delta==theta
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
    H3DU.Curve.apply(this,
      [new H3DU.PiecewiseCurve(curves).toArcLengthParam().fitRange(0, 1)]);
    this.curves = curves;
  };
  GraphicsPath._CurveList.prototype = Object.create(H3DU.Curve.prototype);
  GraphicsPath._CurveList.prototype.constructor = GraphicsPath._CurveList;
  GraphicsPath._CurveList.prototype.getCurves = function() {
    return this.curves;
  };
  /**
   * Does a linear interpolation between two graphics paths.
   * @param {H3DU.GraphicsPath} other The second graphics path.
   * @param {number} t An interpolation factor, generally ranging from 0 through 1.
   * Closer to 0 means closer to this path, and closer to 1 means closer
   * to "other". If the input paths contain arc
   * segments that differ in the large arc and sweep flags, the flags from
   * the first path's arc are used if "t" is less than 0.5; and the flags from
   * the second path's arc are used otherwise.<p>For a nonlinear
   * interpolation, define a function that takes a value that usually ranges from 0 through 1
   * and generally returns a value that usually ranges from 0 through 1,
   * and pass the result of that function to this method.
   * See the documentation for {@link H3DU.Math.vec3lerp}
   * for examples of interpolation functions.
   * @returns {H3DU.GraphicsPath} The interpolated path.
   * @memberof! H3DU.GraphicsPath#
   */
  GraphicsPath.prototype.interpolate = function(other, t) {
    if(!other || other.segments.length !== this.segments.length) {
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
  /** @ignore */
  GraphicsPath._addSegment = function(a, c) {
    if(a.length > 0 && c instanceof LineCurve) {
      if(c.x1 === c.x2 && c.y1 === c.y2) {
        // Degenerate line segment, don't add
        return;
      }
    }
    a.push(c);
  };

  /**
   * Gets a [curve evaluator object]{@link H3DU.Curve} for
   * the curves described by this path. The return value doesn't track changes to the path.
   * @param {number} [flatness] This parameter is no longer used.
   * @returns {Object} A [curve evaluator object]{@link H3DU.Curve} that implements
   * the following additional method:<ul>
   * <li><code>getCurves()</code> - Returns a list of [curve evaluator objects]{@link H3DU.Curve}
   * described by this path. The list will contain one curve evaluator object for each disconnected
   * portion of the path. For example, if the path contains one polygon, the list will contain
   * one curve object. And if the path is empty, the list will be empty too. Each curve
   * takes U coordinates that range from 0 to 1, depending on how far the point is from the start or
   * the end of the path (similar to arc-length parameterization). Each curve
   * returns a 3-element array containing
   * the X, Y, and Z coordinates of the point lying on the curve at the given
   * "u" position (however, the z will always be 0 since paths can currently
   * only be 2-dimensional).
   * </ul>
   * @memberof! H3DU.GraphicsPath#
   */
  GraphicsPath.prototype.getCurves = function(flatness) {
    // NOTE: Uses a "tangent" method, not "velocity", because
    // that method's return values are generally unit vectors.
    var subpaths = [];
    var curves = [];
    if(typeof flatness !== "undefined" && flatness !== null) {
      console.warn("Unused parameter flatness is defined");
    }
    var lastptx = 0;
    var lastpty = 0;
    var startptx = 0;
    var startpty = 0;
    var first = true;
    var curPath = null;
    for(var i = 0; i < this.segments.length; i++) {
      var s = this.segments[i];
      var startpt = GraphicsPath._startPoint(s);
      var endpt = GraphicsPath._endPoint(s);
      if(s[0] !== GraphicsPath.CLOSE) {
        if(first || lastptx !== startpt[0] || lastpty !== startpt[1]) {
          curPath = [];
          subpaths.push(curPath);
          startptx = startpt[0];
          startpty = startpt[1];
          first = false;
        }
        lastptx = endpt[0];
        lastpty = endpt[1];
        GraphicsPath._addSegment(curPath, GraphicsPath._segToCurve(s));
      } else {
        GraphicsPath._addSegment(curPath,
          new LineCurve(lastptx, lastpty, startptx, startpty));
        lastptx = startptx;
        lastpty = startpty;
      }
    }
    for(i = 0; i < subpaths.length; i++) {
      curves.push(new H3DU.PiecewiseCurve(subpaths[i]).toArcLengthParam().fitRange(0, 1));
    }
    return new GraphicsPath._CurveList(curves);
  };

  /**
   * Gets an array of points evenly spaced across the length
   * of the path.
   * @param {number} numPoints Number of points to return.
   * @param {number} [flatness] This parameter is no longer used.
   * @returns {Array<Array<number>>} Array of points lying on
   * the path and evenly spaced across the length of the path,
   * starting and ending with the path's endPoints. Returns
   * an empty array if <i>numPoints</i> is less than 1. Returns
   * an array consisting of the start point if <i>numPoints</i>
   * is 1.
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
   * Gets an array of points evenly spaced across the length
   * of the path. The positions will be in the form of objects with
   * two properties: x and y retrieve the X or Y coordinate of each position, respectively.
   * @param {number} numPoints Number of points to return.
   * @returns {Array<Array<number>>} Array of points lying on
   * the path and evenly spaced across the length of the path,
   * starting and ending with the path's endPoints. Returns
   * an empty array if <i>numPoints</i> is less than 1. Returns
   * an array consisting of the start point if <i>numPoints</i>
   * is 1.
   * @memberof! H3DU.GraphicsPath#
   * @example The following example initializes a three.js BufferGeometry with the points retrieved by this method. This example requires the three.js library.
   * var points=path.getPointsAsObjects(50)
   * var buffer=new THREE.BufferGeometry()
   * .setFromPoints(points);
   */
  GraphicsPath.prototype.getPointsAsObjects = function(numPoints) {
    if(numPoints < 1)return [];
    if(numPoints === 1) {
      var pt = this._start();
      return [{
        "x":pt[0],
        "y":pt[1]
      }];
    }
    if(numPoints === 2) {
      var pt1 = this._start();
      var pt2 = this._end();
      return [{
        "x":pt1[0],
        "y":pt1[1]
      },
      {
        "x":pt2[0],
        "y":pt2[1]
      }];
    }
    var curves = this.getCurves(flatness);
    var points = [];
    for(var i = 0; i < numPoints; i++) {
      var t = i / (numPoints - 1);
      var ev = curves.evaluate(t);
      points.push({
        "x":ev[0],
        "y":ev[1]
      });
    }
    return points;
  };
  /**
   * Makes this path closed. Adds a line segment to the
   * path's start position, if necessary.
   * @returns {H3DU.GraphicsPath} This object.
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
   * @param {number} x X coordinate of the position.
   * @param {number} y Y coordinate of the position.
   * @returns {H3DU.GraphicsPath} This object.
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
   * @param {number} x X coordinate of the end of the line segment.
   * @param {number} y Y coordinate of the end of the line segment.
   * @returns {H3DU.GraphicsPath} This object.
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
   * @returns {Array<number>} A two-element array giving the X and Y coordinates of the current point.
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
   * @param {number} x1 X coordinate of a point that, along with the
   * current end point, forms a tangent line. The point where the
   * circle touches this tangent line is the start point of the arc, and if the
   * point isn't the same as the current end point, this method adds
   * a line segment connecting the two points. (Note that the start point
   * of the arc is not necessarily the same as (x1, y1) or the current end point.)
   * @param {number} y1 Y coordinate of the point described under "x1".
   * @param {number} x2 X coordinate of a point that, along with the
   * point (x1, y1), forms a tangent line. The point where the
   * circle touches this tangent line is the end point of the arc. (Note that the
   * end point of the arc is not necessarily the same as (x1, y1) or (x2, y2).)
   * When this method returns, the current end point will be set to the end
   * point of the arc.
   * @param {number} y2 Y coordinate of the point described under "x2".
   * @param {number} radius Radius of the circle the arc forms a part of.
   * @returns {H3DU.GraphicsPath} This object.
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
   * @param {number} x X coordinate of the center of the circle that the arc forms a part of.
   * @param {number} y Y coordinate of the circle's center.
   * @param {number} radius Radius of the circle.
   * @param {number} startAngle Starting angle of the arc, in radians.
   * 0 means the positive X axis, &pi;/2 means the positive Y axis,
   * &pi; means the negative X axis, and &pi;*1.5 means the negative Y axis.
   * @param {number} endAngle Ending angle of the arc, in radians.
   * @param {Boolean} ccw Whether the arc runs counterclockwise
   * (assuming the X axis points right and the Y axis points
   * down under the coordinate system).
   * @returns {H3DU.GraphicsPath} This object.
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
   * at this path's current position. The current position will be
   * the curve's first control point.
   * @param {number} x X coordinate of the curve's second control point.
   * @param {number} y Y coordinate of the curve's second control point.
   * @param {number} x2 X coordinate of the curve's end point (third control point).
   * @param {number} y2 Y coordinate of the curve's end point (third control point).
   * @returns {H3DU.GraphicsPath} This object.
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
   * at this path's current position. The current position will be
   * the curve's first control point.
   * @param {number} x X coordinate of the curve's second control point.
   * @param {number} y X coordinate of the curve's second control point.
   * @param {number} x2 Y coordinate of the curve's third control point.
   * @param {number} y2 Y coordinate of the curve's third control point.
   * @param {number} x3 X coordinate of the curve's end point (fourth control point).
   * @param {number} y3 Y coordinate of the curve's end point (fourth control point).
   * @returns {H3DU.GraphicsPath} This object.
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
   * @param {number} rx X axis radius of the ellipse that the arc will
   * be formed from.
   * @param {number} ry Y axis radius of the ellipse that the arc will
   * be formed from.
   * @param {number} rot Rotation of the ellipse in degrees (clockwise
   * assuming the X axis points right and the Y axis points
   * down under the coordinate system).
   * @param {Boolean} largeArc In general, there are four possible solutions
   * for arcs given the start and end points, rotation, and x- and y-radii. If true,
   * chooses an arc solution with the larger arc length; if false, smaller.
   * @param {Boolean} sweep If true, the arc solution chosen will run
   * clockwise (assuming the X axis points right and the Y axis points
   * down under the coordinate system); if false, counterclockwise.
   * @param {number} x2 X coordinate of the arc's end point.
   * @param {number} y2 Y coordinate of the arc's end point.
   * @returns {H3DU.GraphicsPath} This object.
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
   * @param {Array<number>} trans An array of six numbers
   * describing a 2-dimensional affine transformation. For each
   * point in the current path, its new X coordinate is `trans[0] * X +
   * trans[2] * Y + trans[4]`, and its new Y coordinate is `trans[1] * X +
   * trans[3] * Y + trans[5]`.
   * @returns {H3DU.GraphicsPath} The transformed version of this path.
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
   * @param {number} x X coordinate of the rectangle's upper-left corner (assuming the
   * coordinate system's X axis points right and the Y axis down).
   * @param {number} y Y coordinate of the rectangle's upper-left corner (assuming the
   * coordinate system's X axis points right and the Y axis down).
   * @param {number} w Width of the rectangle.
   * @param {number} h Height of the rectangle.
   * @returns {H3DU.GraphicsPath} This object. If "w" or "h" is 0, no path segments will be appended.
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
 * Adds a line segment to this path.
 * <p>To use this method, you must include the script "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script></pre>
 * @param {number} x0 X coordinate of the line segment's starting point.
 * The <code>moveTo</code> method will be called on the starting point.
 * @param {number} y0 Y coordinate of the line segment's starting point.
 * @param {number} x1 X coordinate of the line segment's ending point.
 * The <code>lineTo</code> method will be called on the ending point.
 * @param {number} y1 X coordinate of the line segment's ending point.
 * @returns {H3DU.GraphicsPath} This object.
 */
  GraphicsPath.prototype.line = function(x0, y0, x1, y1) {
    return this.moveTo(x0, y0).lineTo(x1, y1);
  };
/**
 * Adds path segments to this path that form a polygon or a connected line segment strand.
 * <p>To use this method, you must include the script "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script></pre>
 * @param {Array<number>} pointCoords An array of numbers containing the X and Y coordinates
 * of each point in the sequence of line segments. Each pair of numbers gives the X and Y
 * coordinates, in that order, of one of the points in the sequence.
 * The number of elements in the array must be even. If two or more pairs of numbers are given, line
 * segments will connect each point given (except the last) to the next point given.
 * @param {number} closed If "true", the sequence of points describes a closed polygon and a command
 * to close the path will be added to the path (even if only one pair of numbers is given in "pointCoords").
 * @returns {H3DU.GraphicsPath} This object. If "pointCoords" is empty, no path segments will be appended.
 * Throws an error if "pointCoords" has an odd length.
 */
  GraphicsPath.prototype.polyline = function(pointCoords, closed) {
    var closedValue = typeof closed !== "undefined" && closed !== null ? closed : false;
    if(pointCoords.length === 0)return this;
    if(pointCoords.length % 2 !== 0)throw new Error();
    this.moveTo(pointCoords[0], pointCoords[1]);
    for(var i = 2; i < pointCoords.length; i += 2) {
      this.lineTo(pointCoords[i], pointCoords[i + 1]);
    }
    if(closedValue)this.closePath();
    return this;
  };

/**
 * Adds path segments to this path that form an axis-aligned rounded rectangle.
 * <p>To use this method, you must include the script "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script></pre>
 * @param {number} x X coordinate of the rectangle's upper-left corner (assuming the
 * coordinate system's X axis points right and the Y axis down).
 * @param {number} y Y coordinate of the rectangle's upper-left corner (assuming the
 * coordinate system's X axis points right and the Y axis down).
 * @param {number} w Width of the rectangle.
 * @param {number} h Height of the rectangle.
 * @param {number} arccx Horizontal extent (from end to end) of the ellipse formed by each arc that makes
 * up the rectangle's corners.
 * Will be adjusted to be not less than 0 and not greater than "w".
 * @param {number} arccy Vertical extent (from end to end) of the ellipse formed by each arc that makes
 * up the rectangle's corners.
 * Will be adjusted to be not less than 0 and not greater than "h".
 * @returns {H3DU.GraphicsPath} This object. If "w" or "h" is 0, no path segments will be appended.
 */
  GraphicsPath.prototype.roundRect = function(x, y, w, h, arccx, arccy) {
    if(w < 0 || h < 0)return this;
    var px, py;
    arccx = Math.min(w, Math.max(0, arccx));
    arccy = Math.min(h, Math.max(0, arccy));
    var harccx = arccx * 0.5;
    var harccy = arccy * 0.5;
    px = x + harccx;
    py = y;
    this.moveTo(px, py);
    px += w - arccx;
    this.lineTo(px, py);
    px += harccx;
    py += harccy;
    this.arcSvgTo(harccx, harccy, 0, false, true, px, py);
    py += h - arccy;
    this.lineTo(px, py);
    px -= harccx;
    py += harccy;
    this.arcSvgTo(harccx, harccy, 0, false, true, px, py);
    px -= w - arccx;
    this.lineTo(px, py);
    px -= harccx;
    py -= harccy;
    this.arcSvgTo(harccx, harccy, 0, false, true, px, py);
    py -= h - arccy;
    this.lineTo(px, py);
    px += harccx;
    py -= harccy;
    this.arcSvgTo(harccx, harccy, 0, false, true, px, py);
    this.closePath();
    return this;
  };

/**
 * Adds path segments to this path that form an axis-aligned rectangle with beveled corners.
 * <p>To use this method, you must include the script "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script></pre>
 * @param {number} x X coordinate of the rectangle's upper-left corner (assuming the
 * coordinate system's X axis points right and the Y axis down).
 * @param {number} y Y coordinate of the rectangle's upper-left corner (assuming the
 * coordinate system's X axis points right and the Y axis down).
 * @param {number} w Width of the rectangle.
 * @param {number} h Height of the rectangle.
 * @param {number} arccx Horizontal extent (from end to end) of the rectangle's corners.
 * Will be adjusted to be not less than 0 and not greater than "w".
 * @param {number} arccy Vertical extent (from end to end) of the rectangle's corners.
 * Will be adjusted to be not less than 0 and not greater than "h".
 * @returns {H3DU.GraphicsPath} This object. If "w" or "h" is 0, no path segments will be appended.
 */
  GraphicsPath.prototype.bevelRect = function(x, y, w, h, arccx, arccy) {
    if(w < 0 || h < 0)return this;
    var px, py;
    arccx = Math.min(w, Math.max(0, arccx));
    arccy = Math.min(h, Math.max(0, arccy));
    var harccx = arccx * 0.5;
    var harccy = arccy * 0.5;
    px = x + harccx;
    py = y;
    this.moveTo(px, py);
    px += w - arccx;
    this.lineTo(px, py);
    px += harccx;
    py += harccy;
    this.lineTo(px, py);
    py += h - arccy;
    this.lineTo(px, py);
    px -= harccx;
    py += harccy;
    this.lineTo(px, py);
    px -= w - arccx;
    this.lineTo(px, py);
    px -= harccx;
    py -= harccy;
    this.lineTo(px, py);
    py -= h - arccy;
    this.lineTo(px, py);
    px += harccx;
    py -= harccy;
    this.lineTo(px, py);
    this.closePath();
    return this;
  };
/**
 * Adds path segments to this path that form an axis-aligned ellipse given its center
 * and dimensions.
 * <p>To use this method, you must include the script "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script></pre>
 * @param {number} cx X coordinate of the ellipse's center.
 * @param {number} cy Y coordinate of the ellipse's center.
 * @param {number} w Width of the ellipse's bounding box.
 * @param {number} h Height of the ellipse's bounding box.
 * @returns {H3DU.GraphicsPath} This object. If "w" or "h" is 0, no path segments will be appended.
 */
  GraphicsPath.prototype.ellipse = function(cx, cy, w, h) {
    if(w < 0 || h < 0)return this;
    var hw = w * 0.5;
    var hh = h * 0.5;
    var px = cx + hw;
    return this.moveTo(px, cy)
    .arcSvgTo(hw, hh, 0, false, true, px - w, cy)
    .arcSvgTo(hw, hh, 0, false, true, px, cy)
    .closePath();
  };
/**
 * Adds path segments to this path that form an axis-aligned ellipse, given the ellipse's corner point
 * and dimensions.
 * <p>To use this method, you must include the script "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script></pre>
 * @param {number} x X coordinate of the ellipse's bounding box's upper-left corner (assuming the
 * coordinate system's X axis points right and the Y axis down).
 * @param {number} y Y coordinate of the ellipse's bounding box's upper-left corner (assuming the
 * coordinate system's X axis points right and the Y axis down).
 * @param {number} w Width of the ellipse's bounding box.
 * @param {number} h Height of the ellipse's bounding box.
 * @returns {H3DU.GraphicsPath} This object. If "w" or "h" is 0, no path segments will be appended.
 */
  GraphicsPath.prototype.ellipseForBox = function(x, y, w, h) {
    return this.ellipse(x + w * 0.5, y + h * 0.5, w, h);
  };
/**
 * Adds path segments to this path that form an arc running along an axis-aligned
 * ellipse, or a shape based on that arc and ellipse, given the ellipse's center
 * and dimensions, start angle, and sweep angle.
 * <p>To use this method, you must include the script "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script></pre>
 * @param {number} cx X coordinate of the ellipse's center.
 * @param {number} cy Y coordinate of the ellipse's center.
 * @param {number} w Width of the ellipse's bounding box.
 * @param {number} h Height of the ellipse's bounding box.
 * @param {number} start Starting angle of the arc, in degrees.
 * 0 means the positive X axis, 90 means the positive Y axis,
 * 180 means the negative X axis, and 270 means the negative Y axis.
 * @param {number} sweep Length of the arc in degrees. Can be positive or negative. Can be greater than 360 or
 * less than -360, in which case the arc will wrap around the ellipse multiple times. Assuming
 * the coordinate system's X axis points right and the Y axis down, positive angles run
 * clockwise and negative angles counterclockwise.
 * @param {number} type Type of arc to append to the path. If 0,
 * will append an unclosed arc. If 1, will append an elliptical segment to the path
 * (the arc and a line segment connecting its ends). If 2,
 * will append a "pie slice" to the path (the arc and two line segments connecting
 * each end of the arc to the ellipse's center).
 * @returns {H3DU.GraphicsPath} This object. If "w" or "h" is 0, no path segments will be appended.
 */
  GraphicsPath.prototype.arcShape = function(x, y, w, h, start, sweep, type) {
    if(w < 0 || h < 0)return this;
    var pidiv180 = Math.PI / 180;
    var e = start + sweep;
    var hw = w * 0.5;
    var hh = h * 0.5;
    var eRad = (e >= 0 && e < 360 ? e : e % 360 + (e < 0 ? 360 : 0)) * pidiv180;
    var startRad = (start >= 0 && start < 360 ? start : start % 360 + (start < 0 ? 360 : 0)) * pidiv180;
    var cosEnd = Math.cos(eRad);
    var sinEnd = eRad <= 3.141592653589793 ? Math.sqrt(1.0 - cosEnd * cosEnd) : -Math.sqrt(1.0 - cosEnd * cosEnd);
    var cosStart = Math.cos(startRad);
    var sinStart = startRad <= 3.141592653589793 ? Math.sqrt(1.0 - cosStart * cosStart) : -Math.sqrt(1.0 - cosStart * cosStart);
    this.moveTo(x + cosStart * hw, y + sinStart * hh);
    var angleInit, angleStep, cw;
    if(sweep > 0) {
      angleInit = start + 180;
      angleStep = 180;
      cw = true;
    } else {
      angleInit = start - 180;
      angleStep = -180;
      cw = false;
    }
    for(var a = angleInit; cw ? a < e : a > e; a += angleStep) {
      var angleRad = (a >= 0 && a < 360 ? a : a % 360 + (a < 0 ? 360 : 0)) * pidiv180;
      var cosAng = Math.cos(angleRad);
      var sinAng = angleRad <= 3.141592653589793 ? Math.sqrt(1.0 - cosAng * cosAng) : -Math.sqrt(1.0 - cosAng * cosAng);
      this.arcSvgTo(hw, hh, 0, false, cw, x + cosAng * hw, y + sinAng * hh);
    }
    this.arcSvgTo(hw, hh, 0, false, cw, x + cosEnd * hw, y + sinEnd * hh);
    if(type === 2) {
      this.lineTo(x, y).closePath();
    } else if(type === 1) {
      this.closePath();
    }
    return this;
  };
/**
 * Adds path segments to this path that form an arc running along an axis-aligned
 * ellipse, or a shape based on that arc and ellipse, given the ellipse's corner point
 * and dimensions, start angle, and sweep angle.
 * <p>To use this method, you must include the script "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script></pre>
 * @param {number} x X coordinate of the ellipse's bounding box's upper-left corner (assuming the
 * coordinate system's X axis points right and the Y axis down).
 * @param {number} y Y coordinate of the ellipse's bounding box's upper-left corner (assuming the
 * coordinate system's X axis points right and the Y axis down).
 * @param {number} w Width of the ellipse's bounding box.
 * @param {number} h Height of the ellipse's bounding box.
 * @param {number} start Starting angle of the arc, in degrees.
 * 0 means the positive X axis, 90 means the positive Y axis,
 * 180 means the negative X axis, and 270 means the negative Y axis.
 * @param {number} sweep Length of the arc in degrees. Can be greater than 360 or
 * less than -360, in which case the arc will wrap around the ellipse multiple times. Assuming
 * the coordinate system's X axis points right and the Y axis down, positive angles run
 * clockwise and negative angles counterclockwise.
 * @param {number} type Type of arc to append to the path. If 0,
 * will append an unclosed arc. If 1, will append an elliptical segment to the path
 * (the arc and a line segment connecting its ends). If 2,
 * will append a "pie slice" to the path (the arc and two line segments connecting
 * each end of the arc to the ellipse's center).
 * @returns {H3DU.GraphicsPath} This object. If "w" or "h" is 0, no path segments will be appended.
 */
  GraphicsPath.prototype.arcShapeForBox = function(x, y, w, h, start, sweep, type) {
    return this.arcShape(x + w * 0.5, y + h * 0.5, w, h, start, sweep, type);
  };
/**
 * Adds path segments to this path in the form of an arrow shape.
 * <p>To use this method, you must include the script "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script></pre>
 * @param {number} x0 X coordinate of the arrow's tail, at its very end.
 * @param {number} y0 Y coordinate of the arrow's tail, at its very end.
 * @param {number} x1 X coordinate of the arrow's tip.
 * @param {number} y1 Y coordinate of the arrow's tip.
 * @param {number} headWidth Width of the arrowhead's base from side to side.
 * @param {number} headLength Length of the arrowhead from its tip to its base.
 * @param {number} tailWidth Width of the arrow's tail from side to side
 * @returns {H3DU.GraphicsPath} This object. Nothing will be added to the path if the distance
 * from (x0, y0) and (x1, y1) is 0 or extremely close to 0.
 */
  GraphicsPath.prototype.arrow = function(x0, y0, x1, y1, headWidth, headLength, tailWidth) {
    var dx = x1 - x0;
    var dy = y1 - y0;
    var arrowLen = Math.sqrt(dx * dx + dy * dy);
    if(arrowLen === 0)return this;
    var halfTailWidth = tailWidth * 0.5;
    var halfHeadWidth = headWidth * 0.5;
    var invArrowLen = 1.0 / arrowLen;
    var cosRot = dx * invArrowLen;
    var sinRot = dy * invArrowLen;
    headLength = Math.min(headLength, arrowLen);
    var shaftLength = arrowLen - headLength;
    var x, y;
    this.moveTo(x0, y0);
    x = halfTailWidth * sinRot + x0;
    y = -halfTailWidth * cosRot + y0;
    this.lineTo(x, y);
    x = shaftLength * cosRot + halfTailWidth * sinRot + x0;
    y = shaftLength * sinRot - halfTailWidth * cosRot + y0;
    this.lineTo(x, y);
    x = shaftLength * cosRot + halfHeadWidth * sinRot + x0;
    y = shaftLength * sinRot - halfHeadWidth * cosRot + y0;
    this.lineTo(x, y).lineTo(x1, y1);
    x = shaftLength * cosRot - halfHeadWidth * sinRot + x0;
    y = shaftLength * sinRot + halfHeadWidth * cosRot + y0;
    this.lineTo(x, y);
    x = shaftLength * cosRot - halfTailWidth * sinRot + x0;
    y = shaftLength * sinRot + halfTailWidth * cosRot + y0;
    this.lineTo(x, y);
    x = -halfTailWidth * sinRot + x0;
    y = halfTailWidth * cosRot + y0;
    this.lineTo(x, y);
    this.closePath();
    return this;
  };
/**
 * Adds path segments to this path that form a regular polygon.
 * <p>To use this method, you must include the script "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script></pre>
 * @param {number} cx X coordinate of the center of the polygon.
 * @param {number} cy Y coordinate of the center of the polygon.
 * @param {number} sides Number of sides the polygon has. Nothing will be added to the path if this
 * value is 2 or less.
 * @param {number} radius Radius from the center to each vertex of the polygon.
 * @param {number} phaseInDegrees Starting angle of the first vertex of the polygon, in degrees.
 * 0 means the positive X axis, 90 means the positive Y axis,
 * 180 means the negative X axis, and 270 means the negative Y axis.
 * @returns {H3DU.GraphicsPath} This object.
 */
  GraphicsPath.prototype.regularPolygon = function(cx, cy, sides, radius, phaseInDegrees) {
    if(sides <= 2)return this;
    var phase = phaseInDegrees || 0;
    phase = phase >= 0 && phase < 360 ? phase : phase % 360 +
       (phase < 0 ? 360 : 0);
    phase *= H3DU.Math.ToRadians;
    var angleStep = H3DU.Math.PiTimes2 / sides;
    var cosStep = Math.cos(angleStep);
    var sinStep = angleStep <= 3.141592653589793 ? Math.sqrt(1.0 - cosStep * cosStep) : -Math.sqrt(1.0 - cosStep * cosStep);
    var c = Math.cos(phase);
    var s = phase <= 3.141592653589793 ? Math.sqrt(1.0 - c * c) : -Math.sqrt(1.0 - c * c);
    for(var i = 0; i < sides; i++) {
      var x = cx + c * radius;
      var y = cy + s * radius;
      if(i === 0) {
        this.moveTo(x, y);
      } else {
        this.lineTo(x, y);
      }
      var ts = cosStep * s + sinStep * c;
      var tc = cosStep * c - sinStep * s;
      s = ts;
      c = tc;
    }
    return this.closePath();
  };
/**
 * Adds path segments to this path that form a regular N-pointed star.
 * <p>To use this method, you must include the script "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script></pre>
 * @param {number} cx X coordinate of the center of the star.
 * @param {number} cy Y coordinate of the center of the star.
 * @param {number} points Number of points the star has. Nothing will be added to the path if this
 * value is 0 or less.
 * @param {number} radiusOut Radius from the center to each outer vertex of the star.
 * @param {number} radiusIn Radius from the center to each inner vertex of the star.
 * @param {number} phaseInDegrees Starting angle of the first vertex of the polygon, in degrees.
 * 0 means the positive X axis, 90 means the positive Y axis,
 * 180 means the negative X axis, and 270 means the negative Y axis.
 * @returns {H3DU.GraphicsPath} This object.
 */
  GraphicsPath.prototype.regularStar = function(cx, cy, points, radiusOut, radiusIn, phaseInDegrees) {
    if(points <= 0)return this;
    var phase = phaseInDegrees || 0;
    phase = phase >= 0 && phase < 360 ? phase : phase % 360 +
       (phase < 0 ? 360 : 0);
    phase *= H3DU.Math.ToRadians;
    var sides = points * 2;
    var angleStep = H3DU.Math.PiTimes2 / sides;
    var cosStep = Math.cos(angleStep);
    var sinStep = angleStep <= 3.141592653589793 ? Math.sqrt(1.0 - cosStep * cosStep) : -Math.sqrt(1.0 - cosStep * cosStep);
    var c = Math.cos(phase);
    var s = phase <= 3.141592653589793 ? Math.sqrt(1.0 - c * c) : -Math.sqrt(1.0 - c * c);
    for(var i = 0; i < sides; i++) {
      var radius = (i & 1) === 0 ? radiusOut : radiusIn;
      var x = cx + c * radius;
      var y = cy + s * radius;
      if(i === 0) {
        this.moveTo(x, y);
      } else {
        this.lineTo(x, y);
      }
      var ts = cosStep * s + sinStep * c;
      var tc = cosStep * c - sinStep * s;
      s = ts;
      c = tc;
    }
    return this.closePath();
  };
  /**
   * Creates a graphics path from a string whose format follows
   * the SVG specification.
   * @param {string} str A string, in the SVG path format, representing
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
          // second control point to use if previous segment is not a cubic
          xcp = ret.endPos[0];
          ycp = ret.endPos[1];
          endx = ret.endPos[0];
          endy = ret.endPos[1];
          // NOTE: If previous segment is not a cubic, second control
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

  var EPSILON = 1.1102230246251565e-16;
  var ORIENT_ERROR_BOUND_2D = (3.0 + 16.0 * EPSILON) * EPSILON;

  // orient2D and dependent functions were
  // Adapted by Peter O. from the HE_Mesh library
  // written by Frederik Vanhoutte.

  function cmpDoubleDouble(a, b) {
    if(a[0] < b[0])return -1;
    if(a[0] > b[0])return 1;
    if(a[1] < b[1])return -1;
    if(a[1] > b[1])return 1;
    return 0;
  }
  function addDoubleDouble(a, b) {
    var hi = a[0];
    var lo = a[1];
    var yhi = b[0];
    var ylo = b[1];
    if(isNaN(hi))return a;
    if(isNaN(yhi))return b;
    var H, h, T, t, S, s, e, f;
    S = hi + yhi;
    T = lo + ylo;
    e = S - hi;
    f = T - lo;
    s = S - e;
    t = T - f;
    s = yhi - e + (hi - s);
    t = ylo - f + (lo - t);
    e = s + T;
    H = S + e;
    h = e + (S - H);
    e = t + h;
    var zhi = H + e;
    var zlo = e + (H - zhi);
    return [zhi, zlo];
  }
  function subDoubleDouble(a, b) {
    if(isNaN(b[0]))return b;
    return addDoubleDouble(a, [-b[0], -b[1]]);
  }

  function mulDoubleDouble(a, b) {
    var hi = a[0];
    var lo = a[1];
    var yhi = b[0];
    var ylo = b[1];
    if(isNaN(hi))return a;
    if(isNaN(yhi))return b;
    var hx, tx, hy, ty, C, c;
    C = 134217729.0 * hi;
    hx = C - hi;
    c = 134217729.0 * yhi;
    hx = C - hx;
    tx = hi - hx;
    hy = c - yhi;
    C = hi * yhi;
    hy = c - hy;
    ty = yhi - hy;
    c = hx * hy - C + hx * ty + tx * hy + tx * ty +
    (hi * ylo + lo * yhi);
    var zhi = C + c;
    hx = C - zhi;
    return [zhi, c + hx];
  }

  function orient2D(pa, pb, pc) {
    var detleft, detright, det;
    var detsum, errbound;
    var ax, ay, bx, by, cx, cy;
    var acx, bcx, acy, bcy;
    var detleft1, det1;
    detleft = (pa[0] - pc[0]) * (pb[1] - pc[1]);
    detright = (pa[1] - pc[1]) * (pb[0] - pc[0]);
    det = detleft - detright;
    if (detleft > 0.0) {
      if (detright <= 0.0) {
        return det < 0 ? -1 : det === 0 ? 0 : 1;
      } else {
        detsum = detleft + detright;
      }
    } else if (detleft < 0.0) {
      if (detright >= 0.0) {
        return det < 0 ? -1 : det === 0 ? 0 : 1;
      } else {
        detsum = -detleft - detright;
      }
    } else {
      return det < 0 ? -1 : det === 0 ? 0 : 1;
    }
    errbound = ORIENT_ERROR_BOUND_2D * detsum;
    if (det >= errbound || -det >= errbound) {
      return det < 0 ? -1 : det === 0 ? 0 : 1;
    }
    det1 = [0.0, 0];
    ax = [pa[0], 0];
    ay = [pa[1], 0];
    bx = [pb[0], 0];
    by = [pb[1], 0];
    cx = [pc[0], 0];
    cy = [pc[1], 0];
    acx = subDoubleDouble(ax, cx);
    bcx = subDoubleDouble(bx, cx);
    acy = subDoubleDouble(ay, cy);
    bcy = subDoubleDouble(by, cy);
    detleft1 = mulDoubleDouble(acx, bcy);
    var detright1 = mulDoubleDouble(acy, bcx);
    det1 = subDoubleDouble(detleft1, detright1);
    return cmpDoubleDouble(det1, [0, 0]);
  }

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
      var p1 = orient2D(i2, i3, p);
      var p2 = orient2D(i2, i3, i1);
      var b = p1 === 0 || p2 === 0 || p1 === p2;
      p1 = orient2D(i1, i3, p);
      p2 = orient2D(i1, i3, i2);
      b = b && (p1 === 0 || p2 === 0 || p1 === p2);
      p1 = orient2D(i1, i2, p);
      p2 = orient2D(i1, i2, i3);
      return b && (p1 === 0 || p2 === 0 || p1 === p2);
    } else {
      return false;
    }
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
        var orient = orient2D(iterPrev.data, iterVert.data, iterNext.data);
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

  // decomposePolygon and dependent functions were
  // Adapted by Peter O. from the HE_Mesh library
  // written by Frederik Vanhoutte.

  function getLineIntersectionInto2D(a1, a2, b1, b2, p) {
    var s1 = [a1[0] - a2[0], a1[1] - a2[1]];
    var s2 = [b1[0] - b2[0], b1[1] - b2[1]];
    var det = s1[0] * s2[1] - s1[1] * s2[0];
    if (Math.abs(det) <= 1e-9) {
      return false;
    } else {
      det = 1.0 / det;
      var t2 = det * (a1[0] * s1[1] - a1[1] * s1[0] - (b1[0] * s1[1] - b1[1] * s1[0]));
      p[0] = b1[0] * (1.0 - t2) + b2[0] * t2;
      p[1] = b1[1] * (1.0 - t2) + b2[1] * t2;
      return true;
    }
  }

  function getSegmentIntersection2D(ap1, ap2, bp1, bp2) {
    var A = [ap2[0] - ap1[0], ap2[1] - ap1[1], 0];
    var B = [bp2[0] - bp1[0], bp2[1] - bp1[1], 0];
    var BxA = B[0] * A[1] - B[1] * A[0];
    if (Math.abs(BxA) <= 1e-9) {
      return null;
    }
    var v1 = [ap1[0] - bp1[0], ap1[1] - bp1[1], 0];
    var ambxA = v1[0] * A[1] - v1[1] * A[0];
    if (Math.abs(ambxA) <= 1e-9) {
      return null;
    }
    var tb = ambxA / BxA;
    if (tb < 0.0 || tb > 1.0) {
      return null;
    }
    var ip = [B[0] * tb, B[1] * tb, 0];
    ip[0] += bp1[0];
    ip[1] += bp1[1];
    var ta = [ip[0] - ap1[0], ip[1] - ap1[1], 0];
    ta = (ta[0] * A[0] + ta[1] * A[1]) / (A[0] * A[0] + A[1] * A[1]);
    if (ta < 0.0 || ta > 1.0 || isNaN(ta)) {
      return null;
    }
    return ip;
  }

  function addSublist(dst, src, i1, i2) {
    for(var i = i1; i < i2; i++) {
      dst.push(src[i]);
    }
  }

  function isVisible(pointlist, i, j) {
    var n = pointlist.length;
    var iVertex, jVertex;
    iVertex = pointlist[i];
    jVertex = pointlist[j];
    var iVertexPrev, iVertexNext, jVertexPrev, jVertexNext;
    iVertexPrev = pointlist[i === 0 ? n - 1 : i - 1];
    iVertexNext = pointlist[i + 1 === n ? 0 : i + 1];
    jVertexPrev = pointlist[j === 0 ? n - 1 : j - 1];
    jVertexNext = pointlist[j + 1 === n ? 0 : j + 1];
    if (orient2D(iVertex, iVertexNext, iVertexPrev) < 0) {
      if (orient2D(jVertex, iVertex, iVertexPrev) >= 0 &&
          orient2D(jVertex, iVertex, iVertexNext) <= 0) {
        return false;
      }
    } else if (orient2D(jVertex, iVertex, iVertexNext) <= 0 ||
          orient2D(jVertex, iVertex, iVertexPrev) >= 0) {
      return false;
    }
    if (orient2D(jVertex, jVertexNext, jVertexPrev) < 0) {
      if (orient2D(iVertex, jVertex, jVertexPrev) >= 0 &&
          orient2D(iVertex, jVertex, jVertexNext) <= 0) {
        return false;
      }
    } else if (orient2D(iVertex, jVertex, jVertexNext) <= 0 ||
          orient2D(iVertex, jVertex, jVertexPrev) >= 0) {
      return false;
    }
    for (var k = 0; k < n; k++) {
      var knext = k + 1 === n ? 0 : k + 1;
      if (k === i || k === j || knext === i || knext === j) {
        continue;
      }
      var kVertex = pointlist[k];
      var kVertexNext = pointlist[knext];
      var intsec = getSegmentIntersection2D(iVertex, jVertex, kVertex, kVertexNext);
      if (typeof intsec !== "undefined" && intsec !== null) {
        return false;
      }
    }
    return true;
  }

  function decomposePolygon(pointlist, accumulator) {
    var n = pointlist.length;
    if (pointlist.length < 3) {
      return;
    }
    var upperIntersection = [0, 0, 0];
    var lowerIntersection = [0, 0, 0];
    var upperDistance = Number.POSITIVE_INFINITY;
    var lowerDistance = Number.POSITIVE_INFINITY;
    var closestDistance = Number.POSITIVE_INFINITY;
    var upperIndex = 0;
    var lowerIndex = 0;
    var closestIndex = 0;
    var lower = [];
    var upper = [];
    for (var i = 0; i < n; i++) {
      var iVertex = pointlist[i];
      var iVertexPrev = pointlist[i === 0 ? n - 1 : i - 1];
      var iVertexNext = pointlist[i + 1 === n ? 0 : i + 1];
      if (orient2D(iVertex, iVertexNext, iVertexPrev) < 0) {
        for (var j = 0; j < n; j++) {
          var jVertex = pointlist[j];
          var jVertexPrev = pointlist[j === 0 ? n - 1 : j - 1];
          var jVertexNext = pointlist[j + 1 === n ? 0 : j + 1];
          var intersection = [0, 0, 0];
          if (orient2D(jVertex, iVertexPrev, iVertex) > 0 &&
              orient2D(jVertexPrev, iVertexPrev, iVertex) <= 0) {
            if (getLineIntersectionInto2D(iVertexPrev, iVertex, jVertex, jVertexPrev, intersection)) {
              if (orient2D(intersection, iVertexNext, iVertex) < 0) {
                var px = iVertex[0];
                var py = iVertex[1];
                var qx = intersection[0];
                var qy = intersection[1];
                var dist = (qx - px) * (qx - px) + (qy - py) * (qy - py);
                if (dist < lowerDistance) {
                  lowerDistance = dist;
                  lowerIntersection[0] = intersection[0];
                  lowerIntersection[1] = intersection[1];
                  lowerIndex = j;
                }
              }
            }
          }
          if (orient2D(jVertexNext, iVertexNext, iVertex) > 0 &&
              orient2D(jVertex, iVertexNext, iVertex) <= 0) {
            if (getLineIntersectionInto2D(iVertexNext, iVertex, jVertex, jVertexNext,
              intersection)) {
              if (orient2D(intersection, iVertexPrev, iVertex) > 0) {
                px = iVertex[0];
                py = iVertex[1];
                qx = intersection[0];
                qy = intersection[1];
                dist = (qx - px) * (qx - px) + (qy - py) * (qy - py);
                if (dist < upperDistance) {
                  upperDistance = dist;
                  upperIntersection[0] = intersection[0];
                  upperIntersection[1] = intersection[1];
                  upperIndex = j;
                }
              }
            }
          }
        }
        if (lowerIndex === (upperIndex + 1) % n) {
          var midpoint = [
            upperIntersection[0] + (lowerIntersection[0] - upperIntersection[0]) * 0.5,
            upperIntersection[1] + (lowerIntersection[1] - upperIntersection[1]) * 0.5
          ];
          if (i < upperIndex) {
            addSublist(lower, pointlist, i, upperIndex + 1);
            lower.push(midpoint);
            upper.push(midpoint);
            if (lowerIndex !== 0) {
              addSublist(upper, pointlist, lowerIndex, n);
            }
            addSublist(upper, pointlist, 0, i + 1);
          } else {
            if (i !== 0) {
              addSublist(lower, pointlist, i, n);
            }
            addSublist(lower, pointlist, 0, upperIndex + 1);
            lower.push(midpoint);
            upper.push(midpoint);
            addSublist(upper, pointlist, lowerIndex, i + 1);
          }
        } else {
          if (lowerIndex > upperIndex) {
            upperIndex += n;
          }
          closestIndex = lowerIndex;
          for (j = lowerIndex; j <= upperIndex; j++) {
            var jmod = j % n;
            var q = pointlist[jmod];
            if (q === iVertex || q === iVertexPrev || q === iVertexNext) {
              continue;
            }
            if (isVisible(pointlist, i, jmod)) {
              px = iVertex[0];
              py = iVertex[1];
              qx = q[0];
              qy = q[1];
              dist = (qx - px) * (qx - px) + (qy - py) * (qy - py);
              if (dist < closestDistance) {
                closestDistance = dist;
                closestIndex = jmod;
              }
            }
          }
          if (i < closestIndex) {
            addSublist(lower, pointlist, i, closestIndex + 1);
            if (closestIndex !== 0) {
              addSublist(upper, pointlist, closestIndex, n);
            }
            addSublist(upper, pointlist, 0, i + 1);
          } else {
            if (i !== 0) {
              addSublist(lower, pointlist, i, n);
            }
            addSublist(lower, pointlist, 0, closestIndex + 1);
            addSublist(upper, pointlist, closestIndex, i + 1);
          }
        }
        var dp1 = lower.length < upper.length ? lower : upper;
        var dp2 = lower.length < upper.length ? upper : lower;
        decomposePolygon(dp1, accumulator);
        decomposePolygon(dp2, accumulator);
        return;
      }
    }
    accumulator.push(pointlist);
  }

  function decomposeTriangles(points, tris) {
    var polys = [];
    decomposePolygon(points, polys);
    for(var i = 0; i < polys.length; i++) {
      var poly = polys[i];
      for(var j = 0; j < poly.length - 2; j++) {
        tris.push([
          poly[0][0], poly[0][1],
          poly[j + 1][0], poly[j + 1][1],
          poly[j + 2][0], poly[j + 2][1]]);
      }
    }
  }

  /**
   * Converts the subpaths in this path to triangles.
   * Treats each subpath as a polygon even if it isn't closed.
   * Each subpath should not contain self-intersections or
   * duplicate vertices, except duplicate vertices that appear
   * consecutively or at the start and end.<p>
   * The path can contain holes. In this case, subpaths
   * whose winding order (counterclockwise or clockwise)
   * differs from the first subpath's winding order can be holes.
   * @param {number} [flatness] When curves and arcs
   * are decomposed to line segments, the
   * segments will be close to the true path of the curve by this
   * value, given in units. If null, undefined, or omitted, default is 1.
   * @returns {Array<Array<number>>} Array of six-element
   * arrays each describing a single triangle. For each six-element
   * array, the first two, next two, and last two numbers each
   * describe a vertex position of that triangle (X and Y coordinates
   * in that order).
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
/**
 * TODO: Not documented yet.
 * @param {*} z
 * @param {*} flatness
 * @returns {*} Return value.
 */
  GraphicsPath.prototype.toMeshBuffer = function(z, flatness) {
    if(typeof z === "undefined" || z === null)z = 0;
    var tris = this.getTriangles(flatness);
    var vertices = [];
    for(var i = 0; i < tris.length; i++) {
    // Position X, Y, Z; Normal NX, NY, NZ
      vertices.push(
      tri[0], tri[1], z, 0, 0, 1,
      tri[2], tri[3], z, 0, 0, 1,
      tri[4], tri[5], z, 0, 0, 1);
    }
    return H3DU.MeshBuffer.fromPositionsNormals(vertices);
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
    var first = contour.vertexList.first();
    // var last = contour.vertexList.last();
    var vertices = [];
    var vert = first;
    while(vert) {
      vertices.push([vert.data[0], vert.data[1]]);
      vert = vert.next;
    }
    decomposeTriangles(vertices, tris);
  };

  // //////////////////////////////////////////////////////////////////////////////////////////////
  // Data structures
  // //////////////////////////////////////////////////////////////////////////////////////////////

  /** @ignore */
  LinkedListNode = function(item) {
    this.data = item;
    this.prev = null;
    this.next = null;
  };

  /** @ignore */
  LinkedList = function() {
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

  /** @ignore */
  var PriorityQueue = function(comparer) {
    // Based on Doug Lea's public domain Heap class in Java
    this.comparer = comparer;
    this.nodes = [];
    this._size = 0;
    this.size = function() {
      return this._size;
    };
    this._compare = function(a, b) {
      if(this.comparer) {
        return this.comparer(a, b);
      } else {
        if(a === b)return 0;
        return a < b ? -1 : 1;
      }
    };
    this.push = function(item) {
      var x = this._size;
      while(x > 0) {
        var p = (x - 1) / 2 | 0;
        // NOTE: comparer > 0, not comparer < 0, as
        // in Doug Lea's implementation
        if(this.comparer(item, this.nodes[p]) > 0) {
          this.nodes[x] = this.nodes[p];
          x = p;
        } else break;
      }
      this.nodes[x] = item;
      this._size += 1;
      return this;
    };
    // NOTE: Pops out the greatest element, not
    // the least, as in Doug Lea's implementation
    this.pop = function() {
      var data = null;
      if(this._size > 0) {
        var k = 0;
        data = this.nodes[k];
        this._size--;
        var x = this.nodes[this._size];
        for (;;) {
          var left = 1 + 2 * k;
          var right = 2 * (k + 1);
          if(left < this._size) {
            var child = right >= this._size ||
        this.comparer(this.nodes[left], this.nodes[right]) > 0 ? left : right;
            if(this.comparer(x, this.nodes[child]) < 0) {
              this.nodes[k] = this.nodes[child];
              k = child;
            } else break;
          } else break;
        }
        this.nodes[k] = x;
      }
      return data;
    };
  };
  // Mostly based on Julienne Walker's
  // public domain C implementation
  var RedBlackTreeNode = function(data) {
    this.left = null;
    this.right = null;
    this.red = true;
    this.p = null;
    this.data = data;
    this.link = function(dir) {
      return dir ? this.right : this.left;
    };
    this.copy = function() {
      var c = new RedBlackTreeNode(this.data);
      c.left = this.left;
      c.right = this.right;
      c.red = this.red;
      c.p = this.p;
      c.data = this.data;
      return c;
    };
    this.setLink = function(dir, child) {
      if(dir) {
        this.right = child;
      } else {
        this.left = child;
      }
      if(typeof child !== "undefined" && child !== null) {
        child.p = this;
      }
    };
    this.prev = function() {
      if(typeof this.left !== "undefined" && this.left !== null) {
        var r = this.left;
        while(typeof r.right !== "undefined" && r.right !== null)r = r.right;
        return r;
      } else {
        var p = this.p;
        var that = this;
        var tmp = that;
        while(typeof p !== "undefined" && p !== null && tmp === p.left) {
          tmp = p;
          p = p.p;
        }
        return p;
      }
    };
    this.next = function() {
      if(typeof this.right !== "undefined" && this.right !== null) {
        var r = this.right;
        while(typeof r.left !== "undefined" && r.left !== null)r = r.left;
        return r;
      } else {
        var p = this.p;
        var that = this;
        var tmp = that;
        while(typeof p !== "undefined" && p !== null && tmp === p.right) {
          tmp = p;
          p = p.p;
        }
        return p;
      }
    };
  };
  var RedBlackTree = function(comparer) {
    if(!comparer) {
      this.comparer = RedBlackTree._defaultCompare;
    } else {
      this.comparer = comparer;
    }
    this.root = null;
    this._size = 0;
    this.size = function() {
      return this._size;
    };
  };
  /** @ignore */
  RedBlackTree._defaultCompare = function(a, b) {
    if(a === b)return 0;
    return a < b ? -1 : 1;
  };
  /** @ignore */
  RedBlackTree.prototype.first = function() {
    var r = this.root;
    if(typeof r === "undefined" || r === null)return null;
    while(typeof r.left !== "undefined" && r.left !== null)r = r.left;
    return r;
  };
  /** @ignore */
  RedBlackTree.prototype.last = function() {
    var r = this.root;
    if(typeof r === "undefined" || r === null)return null;
    while(typeof r.right !== "undefined" && r.right !== null)r = r.right;
    return r;
  };
  /** @ignore */
  RedBlackTree.prototype.find = function(data) {
    var it = this.root;
    while(typeof it !== "undefined" && it !== null) {
      var cmp = this.cmp(it.data, data);
      if(cmp === 0)break;
      it = cmp < 0 ? it.right : it.left;
    }
    return typeof it === "undefined" || it === null ? null : it.data;
  };
  /** @ignore */
  RedBlackTree._red = function(node) {
    return typeof node !== "undefined" && node !== null && node.red === 1;
  };
  /** @ignore */
  RedBlackTree._single = function(root, dir) {
    var save = root.link(!dir);
    root.setLink(!dir, save.link(dir));
    save.setLink(dir, root);
    root.red = true;
    save.red = false;
    return save;
  };
  /** @ignore */
  RedBlackTree._double = function(root, dir) {
    root.setLink(!dir, RedBlackTree._single( root.link(!dir), !dir ));
    return RedBlackTree._single( root, dir );
  };
  /** @ignore */
  RedBlackTree.prototype.erase = function(data) {
    if(typeof this.root !== "undefined" && this.root !== null) {
      var head = new RedBlackTreeNode(null); /* False tree root */
      var q, p, g; /* Helpers */
      var f = null; /* Found item */
      var dir = true;

      /* Set up our helpers */
      q = head;
      g = p = null;
      q.setLink(true, this.root);

      /*
      Search and push a red node down
      to fix red violations as we go
    */
      while( q.link(dir) !== null ) {
        var last = dir;

        /* Move the helpers down */
        g = p;
        p = q;
        q = q.link(dir);
        var cmp = this.comparer( q.data, data );
        dir = cmp < 0;
        /*
        Save the node with matching data and keep
        going; we'll do removal tasks at the end
      */
        if( cmp === 0 )
          f = q;
        /* Push the red node down with rotations and color flips */
        if( !RedBlackTree._red( q ) && !RedBlackTree._red( q.link(dir) ) ) {
          if( RedBlackTree._red( q.link(!dir) ) )
            p.setLink(last, p = RedBlackTree._single( q, dir ));
          else if( !RedBlackTree._red( q.link(!dir) ) ) {
            var s = p.link(!last);
            if( typeof s !== "undefined" && s !== null ) {
              if( !RedBlackTree._red( s.link(!last) ) && !RedBlackTree._red( s.link(last) ) ) {
              /* Color flip */
                p.red = false;
                s.red = true;
                q.red = true;
              } else {
                var dir2 = g.right === p;

                if( RedBlackTree._red( s.link(last) ) )
                  g.setLink(dir2, RedBlackTree._double( p, last ));
                else if( RedBlackTree._red( s.link(!last) ) )
                  g.setLink(dir2, RedBlackTree._single( p, last ));
                /* Ensure correct coloring */
                q.red = g.link(dir2).red = false;
                g.link(dir2).left.red = true;
                g.link(dir2).right.red = true;
              }
            }
          }
        }
      }

      /* Replace and remove the saved node */
      if( typeof f !== "undefined" && f !== null ) {
        f.data = q.data;
        p.setLink(p.right === q, q.link(typeof q.left === "undefined" || q.left === null));
      }

      /* Update the root(it may be different) */
      this.root = head.right;

      /* Make the root black for simplified logic */
      if(typeof this.root !== "undefined" && this.root !== null) {
        this.root.p = null;
        this.root.red = false;
      }
      --this._size;
    }
  };
  /** @ignore */
  RedBlackTree.prototype.insert = function(data) {
    if(!data)throw new Error();
    var retval = null;
    if (typeof this.root === "undefined" || this.root === null) {
    /*
      We have an empty tree; attach the
      new node directly to the root
    */
      this.root = new RedBlackTreeNode(data);
      retval = this.root;
    } else {
      var head = new RedBlackTreeNode(null); /* False tree root */
      var g, t; /* Grandparent & parent */
      var p, q; /* Iterator & parent */
      var dir = false,
        last = false;

      /* Set up our helpers */
      t = head;
      g = p = null;
      q = this.root;
      t.setLink(true, q);

      /* Search down the tree for a place to insert */
      for (;;) {
        if ( typeof q === "undefined" || q === null ) {
        /* Insert a new node at the first null link */
          p.setLink(dir, q = new RedBlackTreeNode(data));
        } else if ( RedBlackTree._red( q.left ) && RedBlackTree._red( q.right ) ) {
        /* Simple red violation: color flip */
          q.red = true;
          q.left.red = false;
          q.right.red = false;
        }

        if ( RedBlackTree._red( q ) && RedBlackTree._red( p ) ) {
        /* Hard red violation: rotations necessary */
          var dir2 = t.right === g;
          if ( q === p.link(last) )
            t.setLink(dir2, RedBlackTree._single( g, !last ));
          else
            t.setLink(dir2, RedBlackTree._double( g, !last ));
        }
        /*
        Stop working if we inserted a node. This
        check also disallows duplicates in the tree
      */
        var cmp = this.comparer( q.data, data );
        if ( cmp === 0 ) {
          retval = q;
          break;
        }
        last = dir;
        dir = cmp < 0;

        /* Move the helpers down */
        if ( typeof g !== "undefined" && g !== null )
          t = g;

        g = p;
        p = q;
        q = q.link(dir);
      }

      /* Update the root (it may be different) */
      this.root = head.right;
      if(typeof this.root !== "undefined" && this.root !== null)
        this.root.p = null;
    }

    /* Make the root black for simplified logic */
    this.root.red = false;
    ++this._size;
    return retval;
  };

  // NOTE: Much of the Polygon, Connector, and Clipper classes
  // was adapted for JavaScript by Peter O. from the public domain
  // C++ code by Francisco Martinez and others.
  var Polygon = function(path, flatness) {
    this.subpaths = [];
    this.contours = [];
    if(typeof path !== "undefined" && path !== null) {
      // Ignore degenerate line segments
      this.subpaths = path._getSubpaths(flatness, true);
      for(var i = 0; i < this.subpaths.length; i++) {
        this.contours[i] = new Polygon._Contour(this.subpaths[i]);
      }
    }
    this.path = path;
    this.getBounds = function() {
      return this.path.getBounds();
    };
    this.ncontours = function() {
      return this.subpaths.length;
    };
    this.contour = function(i) {
      return this.contours[i];
    };
    this.push = function(c) {
      this.contours.push(c);
    };
    this.toPath = function() {
      var p = new GraphicsPath();
      for(var i = 0; i < this.contours.length; i++) {
        var c = this.contours[i];
        var cv = c.vertices;
        for(var j = 0; j < cv.length; j += 2) {
          if(j === 0) {
            p.moveTo(cv[j], cv[j + 1]);
          } else {
            p.lineTo(cv[j], cv[j + 1]);
          }
        }
        p.closePath();
      }
      return p;
    };
  };
  /** @ignore */
  Polygon._Contour = function(subpath) {
    this.vertices = subpath;
    this.nvertices = function() {
      return this.vertices.length / 2;
    };
    this.segment = function(i) {
      if(i === this.nvertices() - 1) {
        return [[this.vertices[i * 2], this.vertices[i * 2 + 1]], [this.vertices[0], this.vertices[1]]];
      } else {
        return [[this.vertices[i * 2], this.vertices[i * 2 + 1]], [this.vertices[i * 2 + 2], this.vertices[i * 2 + 3]]];
      }
    };
  };

  var Clipper = function(s, c) {
    this.eq = new PriorityQueue(Clipper.sweepEventCompNum);
    this.eventHolder = [];
    this.subject = s;
    this.clipping = c;
    this.nint = 0;
  };

  function Connector() {
    this.openPolygons = new LinkedList();
    this.closedPolygons = new LinkedList();
    this.clear = function() {
      this.openPolygons.clear();
      this.closedPolygons.clear();
    };
    this.size = function() {
      return this.closedPolygons.size();
    };
  }
  /** @ignore */
  Polygon.PointChain = function() {
    this.l = new LinkedList();
    this._closed = false;
    this.closed = function() {
      return this._closed;
    };
    this.clear = function() {
      this.l.clear();
    };
    this.first = function() {
      return this.l.first();
    };
    this.size = function() {
      return this.l.length;
    };
    this.init = function(s) {
      this.l.push(s[0]).push(s[1]);
    };
    this.linkSegment = function(s) {
      if(Clipper._ptEq(s[0], this.l.front())) {
        if(Clipper._ptEq(s[1], this.l.back()))
          this._closed = true;
        else
          this.l.unshift(s[1]);
        return true;
      }
      if(Clipper._ptEq(s[1], this.l.back())) {
        if(Clipper._ptEq(s[0], this.l.front()))
          this._closed = true;
        else
          this.l.push(s[0]);
        return true;
      }
      if(Clipper._ptEq(s[1], this.l.front())) {
        if(Clipper._ptEq(s[0], this.l.back()))
          this._closed = true;
        else
          this.l.unshift(s[0]);
        return true;
      }
      if(Clipper._ptEq(s[0], this.l.back())) {
        if(Clipper._ptEq(s[1], this.l.front()))
          this._closed = true;
        else
          this.l.push(s[1]);
        return true;
      }
      return false;
    };
  };

  Polygon.PointChain.prototype.linkPointChain = function(chain) {
    if(Clipper._ptEq(chain.l.front(), this.l.back())) {
      chain.l.shift();
      this.l.spliceToEnd(chain.l);
      return true;
    }
    if(Clipper._ptEq(chain.l.back(), this.l.front())) {
      this.l.shift();
      this.l.spliceToBegin(chain.l);
      return true;
    }
    if(Clipper._ptEq(chain.l.front(), this.l.front())) {
      this.l.shift();
      chain.l.reverse();
      this.l.spliceToBegin(chain.l);
      return true;
    }
    if(Clipper._ptEq(chain.l.back(), this.l.back())) {
      this.l.pop();
      chain.l.reverse();
      this.l.spliceToEnd(chain.l);
      return true;
    }
    return false;
  };
  /** @ignore */
  Connector.prototype.add = function(s) {
    var j = this.openPolygons.first();
    while(j) {
      if(j.data.linkSegment(s)) {
        if(j.data.closed())
          this.closedPolygons.spliceOneToEnd(this.openPolygons, j);
        else {
          var k = j.next;
          while(k) {
            if(j.data.linkPointChain(k.data)) {
              this.openPolygons.erase(k);
              break;
            }
            k = k.next;
          }
        }
        return;
      }
      j = j.next;
    }
    // The segment cannot be connected with any open polygon
    var chain = new Polygon.PointChain();
    chain.init(s);
    this.openPolygons.push(chain);
  };
  /** @ignore */
  Connector.prototype.toPolygon = function() {
    var polygon = new Polygon(null);
    var j = this.closedPolygons.first();
    while(j) {
      var contour = new Polygon._Contour([]);
      var k = j.data.first();
      while(k) {
        contour.vertices.push(k.data[0], k.data[1]);
        k = k.next;
      }
      polygon.contours.push(contour);
      j = j.next;
    }
    return polygon;
  };

  Clipper.NORMAL = 0;
  Clipper.SUBJECT = 0;
  Clipper.CLIPPING = 1;
  Clipper.INTERSECTION = 0;
  Clipper.UNION = 1;
  Clipper.DIFFERENCE = 2;
  Clipper.XOR = 3;
  Clipper.NON_CONTRIBUTING = 1;
  Clipper.SAME_TRANSITION = 2;
  Clipper.DIFFERENT_TRANSITION = 3;
  /** @ignore */
  Clipper.SweepEvent = function(pp, b, apl, o, t) {
    this.p = pp;
    this.id = -1;
    this.left = b;
    this.pl = apl;
    this.other = o;
    this.type = typeof t === "undefined" || t === null ? Clipper.NORMAL : t;
    this.poss = null;
    this.inOut = false;
    this.inside = false;
    this.segment = function() {
      return [this.p, this.other.p];
    };
    this.below = function(x) {
      return this.left ?
        Clipper.signedArea(this.p, this.other.p, x) > 0 :
        Clipper.signedArea(this.other.p, this.p, x) > 0;
    };
    this.above = function(x) {
      return !this.below(x);
    };
  };
  /*
  Clipper.SweepEvent.prototype.toString = function() {
    return Clipper._print(this);
  };*/
  /** @ignore */
  Clipper.signedArea = function(a, b, c) {
    var xa = a[0] - c[0];
    var ya = a[1] - c[1];
    var xb = b[0] - c[0];
    var yb = b[1] - c[1];
    return 0.5 * (xa * yb - xb * ya);
  };
  /** @ignore */
  Clipper._ptEq = function(a, b) {
    return a[0] === b[0] && a[1] === b[1];
  };
  // Compare two sweep events
  // Return true means that e1 is placed at the event queue after e2, i.e,, e1 is processed by the algorithm after e2
  Clipper.sweepEventComp = function(e1, e2) {
    if(e1.p[0] > e2.p[0]) // Different X coordinate
      return true;
    if(e2.p[0] > e1.p[0]) // Different X coordinate
      return false;
    if(!Clipper._ptEq(e1.p, e2.p)) // Different points, but same X coordinate. The event with lower Y coordinate is processed first
      return e1.p[1] > e2.p[1];
    if(e1.left !== e2.left) // Same point, but one is a left endpoint and the other a right endpoint. The right endpoint is processed first
      return e1.left;
    // Same point, both events are left endPoints or both are right endPoints. The event associate to the bottom segment is processed first
    return e1.above(e2.other.p);
  };
  /** @ignore */
  Clipper.sweepEventCompNum = function(e1, e2) {
    if(e1 === e2)return 0;
    return Clipper.sweepEventComp(e1, e2) ? -1 : 1;
  };
  // e1 and a2 are the left events of line segments(e1.p, e1.other.p) and(e2.p, e2.other.p)
  Clipper.segmentComp = function(e1, e2) {
    if(e1 === e2)
      return false;
    if(Clipper.signedArea(e1.p, e1.other.p, e2.p) !== 0 || Clipper.signedArea(e1.p, e1.other.p, e2.other.p) !== 0) {
    // Segments are not collinear
    // if they share their left endpoint use the right endpoint to sort
      if(Clipper._ptEq(e1.p, e2.p))
        return e1.below(e2.other.p);

      // Different points
      if(Clipper.sweepEventComp(e1, e2)) // has the line segment associated to e1 been inserted into S after the line segment associated to e2 ?
        return e2.above(e1.p);
      // The line segment associated to e2 has been inserted into S after the line segment associated to e1
      return e1.below(e2.p);
    }
    // Segments are collinear. Just a consistent criterion is used
    if(Clipper._ptEq(e1.p, e2.p)) {
      // console.log("collinear segments")
      return e1.id < e2.id;
    }
    return Clipper.sweepEventComp(e1, e2);
  };
  /** @ignore */
  Clipper.segmentCompNum = function(e1, e2) {
    if(e1 === e2)return 0;
    return Clipper.segmentComp(e1, e2) ? -1 : 1;
  };
  /** @ignore */
  Clipper.prototype.storeSweepEvent = function(e) {
    e.id = this.eventHolder.length;
    this.eventHolder.push(e);
    return e;
  };
  /*
  Clipper._print = function(e) {
    if(!e)return "null";
    var namesEventTypes = [
      " (NORMAL) ", " (NON_CONTRIBUTING) ", " (SAME_TRANSITION) ", " (DIFFERENT_TRANSITION) "];
    return "Point: (" + e.p + ") Other point: (" + e.other.p + ")" + (e.left ? " (Left) " : " (Right) ") +
         (e.inside ? " (Inside) " : " (Outside) ") +  (e.inOut ? " (In-Out) " : " (Out-In) ") + "Type: " +
         namesEventTypes[e.type] + " Polygon: " + (e.pl === Clipper.SUBJECT ? " (SUBJECT)" : " (CLIPPING)");
  };*/
  /** @ignore */
  Clipper.prototype.compute = function(op) {
  // Test 1 for trivial result case
    if(this.subject.ncontours() * this.clipping.ncontours() === 0) { // At least one of the polygons is empty
      if(op === Clipper.DIFFERENCE)
        return this.subject;
      if(op === Clipper.UNION)
        return this.subject.ncontours() === 0 ? this.clipping : this.subject;
      return new Polygon();
    }
    var i, j;
    var result = new Polygon();
    // Test 2 for trivial result case
    var subjBounds = this.subject.getBounds();
    var clipBounds = this.clipping.getBounds();
    var minsubj = [subjBounds[0], subjBounds[1]];
    var maxsubj = [subjBounds[2], subjBounds[3]];
    var minclip = [clipBounds[0], clipBounds[1]];
    var maxclip = [clipBounds[2], clipBounds[3]];
    if(minsubj[0] > maxclip[0] || minclip[0] > maxsubj[0] ||
     minsubj[1] > maxclip[1] || minclip[1] > maxsubj[1]) {
    // the bounding boxes do not overlap
      if(op === Clipper.DIFFERENCE)
        return this.subject;
      if(op === Clipper.UNION) {
        result = this.subject;
        for(i = 0; i < this.clipping.ncontours(); i++)
          result.push(this.clipping.contour(i));
      }
      return result;
    }
    // Boolean operation is not trivial
    // Insert all the endPoints associated to the line segments into the event queue
    for(i = 0; i < this.subject.ncontours(); i++)
      for(j = 0; j < this.subject.contour(i).nvertices(); j++)
        this.processSegment(this.subject.contour(i).segment(j), Clipper.SUBJECT);
    for(i = 0; i < this.clipping.ncontours(); i++)
      for(j = 0; j < this.clipping.contour(i).nvertices(); j++)
        this.processSegment(this.clipping.contour(i).segment(j), Clipper.CLIPPING);
    var S = new RedBlackTree(Clipper.segmentCompNum);
    var it, sli, prev, next;
    var connector = new Connector(); // to connect the edge solutions
    var e;
    var minMaxx = Math.min(maxsubj[0], maxclip[0]); // for optimization 1
    while(this.eq.size() > 0) {
      e = this.eq.pop();
      // console.log("Process event:  "+e.toString())
      // optimization 1
      if(op === Clipper.INTERSECTION && e.p[0] > minMaxx ||
       op === Clipper.DIFFERENCE && e.p[0] > maxsubj[0]) {
        return connector.toPolygon(result);
      }
      if(op === Clipper.UNION && e.p[0] > minMaxx) {
      // add all the non-processed line segments to the result
        if(!e.left)
          connector.add(e.segment());
        while(this.eq.size() > 0) {
          e = this.eq.pop();
          if(!e.left)
            connector.add(e.segment());
        }
        return connector.toPolygon(result);
      }
      // end of optimization 1

      if(e.left) { // the line segment must be inserted into S
        it = S.insert(e);
        e.poss = it;
        if(!it)throw new Error();
        next = prev = it;
        if(next && !next.data)throw new Error();
        if(prev !== S.first())
          prev = prev.prev();
        else
          prev = null;
        // Compute the inside and inOut flags
        if(typeof prev === "undefined" || prev === null) { // there is not a previous line segment in S?
          // console.log("prev is end")
          e.inside = e.inOut = false;
        } else if(prev.data.type !== Clipper.NORMAL) {
          if(prev === S.first()) { // e overlaps with prev
            e.inside = true; // it is not relevant to set true or false
            e.inOut = false;
          } else { // the previous two line segments in S are overlapping line segments
            sli = prev;
            sli = sli.prev();
            if(prev.data.pl === e.pl) {
              e.inOut = !prev.data.inOut;
              e.inside = !sli.data.inOut;
            } else {
              e.inOut = !sli.data.inOut;
              e.inside = !prev.data.inOut;
            }
          }
        } else if(e.pl === prev.data.pl) { // previous line segment in S belongs to the same polygon that "e" belongs to
          e.inside = prev.data.inside;
          e.inOut = !prev.data.inOut;
        } else {                          // previous line segment in S belongs to a different polygon that "e" belongs to
          e.inside = !prev.data.inOut;
          e.inOut = prev.data.inside;
        }
        /*
      console.log("Status line after insertion:")
      var bgn=S.first()
      while(bgn) {
       console.log(" "+bgn.data.toString())
       bgn=bgn.next()
      }*/
        // Process a possible intersection between "e" and its next neighbor in S
        next = next.next();
        if(typeof next !== "undefined" && next !== null)
          this.possibleIntersection(e, next.data);

        // Process a possible intersection between "e" and its previous neighbor in S
        if(typeof prev !== "undefined" && prev !== null)
          this.possibleIntersection(prev.data, e);
      } else { // the line segment must be removed from S
      // console.log([e.other.p,e.other.id])
        next = prev = sli = e.other.poss;
        // Get the next and previous line segments to "e" in S
        next = next.next();
        if(prev !== S.first())
          prev = prev.prev();
        else
          prev = null;
        // Check if the line segment belongs to the Boolean operation
        switch(e.type) {
        default:throw new Error();
        case Clipper.NORMAL:
          switch(op) {
          default:throw new Error();
          case Clipper.INTERSECTION:
            if(e.other.inside)
              connector.add(e.segment());
            break;
          case Clipper.UNION:
            if(!e.other.inside)
              connector.add(e.segment());
            break;
          case Clipper.DIFFERENCE:
            if(e.pl === Clipper.SUBJECT && !e.other.inside ||
                e.pl === Clipper.CLIPPING && e.other.inside)
              connector.add(e.segment());
            break;
          case Clipper.XOR:
            connector.add(e.segment());
            break;
          }
          break;
        case Clipper.SAME_TRANSITION:
          if(op === Clipper.INTERSECTION || op === Clipper.UNION)
            connector.add(e.segment());
          break;
        case Clipper.DIFFERENT_TRANSITION:
          if(op === Clipper.DIFFERENCE)
            connector.add(e.segment());
          break;
        }
        // delete line segment associated to e from S and check for intersection between the neighbors of "e" in S
        S.erase(sli.data);
        if(typeof next !== "undefined" && next !== null && (typeof prev !== "undefined" && prev !== null)) {
          this.possibleIntersection(prev.data, next.data);
        }
      }
    /*
    console.log("Status line after processing intersections:")
      var bgn=S.first()
      while(bgn) {
       console.log(" "+bgn.data.toString())
       bgn=bgn.next()
      }
      console.log(" ")*/
    }
    return connector.toPolygon(result);
  };
  /** @ignore */
  Clipper.prototype.processSegment = function(s, pl) {
    if(Clipper._ptEq(s[0], s[1])) // if the two edge endPoints are equal the segment is discarded
      return;                 // in the future this can be done as preprocessing to avoid "polygons" with less than 3 edges
    var e1 = this.storeSweepEvent(new Clipper.SweepEvent(s[0], true, pl, null));
    var e2 = this.storeSweepEvent(new Clipper.SweepEvent(s[1], true, pl, e1));
    e1.other = e2;
    if(e1.p[0] < e2.p[0]) {
      e2.left = false;
    } else if(e1.p[0] > e2.p[0]) {
      e1.left = false;
    } else if(e1.p[1] < e2.p[1]) { // the line segment is vertical. The bottom endpoint is the left endpoint
      e2.left = false;
    } else {
      e1.left = false;
    }
    this.eq.push(e1);
    this.eq.push(e2);
  };
  /** @ignore */
  Clipper.findIntersection = function(a, b, e, f) {
    var ret = Clipper._findIntersectionInternal(a[0][0], a[0][1], a[1][0], a[1][1],
      b[0][0], b[0][1], b[1][0], b[1][1]);
    if(ret.length > 0) {
      e[0] = ret[0][0];
      e[1] = ret[0][1];
    }
    if(ret.length > 1) {
      f[0] = ret[1][0];
      f[1] = ret[1][1];
    }
    return ret.length;
  };
  /** @ignore */
  Clipper._findIntersectionInternal = function(a1x, a1y, a2x, a2y, b1x, b1y, b2x, b2y) {
    var dpdeltad0;
    var t2 = a2x - a1x;
    var t3 = a2y - a1y;
    var t4 = b2x - b1x;
    var t5 = b2y - b1y;
    var t6 = t2 * t2 + t3 * t3;
    var t7 = t4 * t4 + t5 * t5;
    var ret = [];
    var smin, smax;
    if (t6 === 0.0) {
      if (t7 === 0.0) {
        if (a1x === b1x && a1y === b1y) {
          ret.push([a1x, a1y]);
        }
      } else {
        var t9 = ((a1x - b1x) * t4 + (a1y - b1y) * t5) / t7;
        if (t9 >= 0.0 && t9 <= 1.0) {
          var t10 = [b1x + t4 * t9, b1y + t5 * t9];
          var t11 = a1x - t10[0];
          var t12 = a1y - t10[1];
          var t13 = Math.sqrt(t11 * t11 + t12 * t12);
          if (t13 <= 1e-09) {
            ret.push([a1x, a1y]);
          }
        }
      }
      return ret;
    } else if (t7 === 0.0) {
      var t15 = ((b1x - a1x) * t2 + (b1y - a1y) * t3) / t6;
      if (t15 >= 0.0 && t15 <= 1.0) {
        var t16 = [a1x + t2 * t15, a1y + t3 * t15];
        var t17 = b1x - t16[0];
        var t18 = b1y - t16[1];
        var t19 = Math.sqrt(t17 * t17 + t18 * t18);
        if (t19 <= 1e-09) {
          ret.push([b1x, b1y]);
        }
      }
      return ret;
    }
    var t21 = t2 * t5 - t4 * t3;
    var t22 = b1x - a1x;
    var t23 = b1y - a1y;
    var t24 = t22 * t5 - t4 * t23;
    dpdeltad0 = t22 * t3 - t2 * t23;
    if (t21 === 0.0) {
      if (t24 === 0.0 && dpdeltad0 === 0) {
        var s1 = (t2 * (b1x - a1x) + t3 * (b1y - a1y)) / (t2 * t2 + t3 * t3);
        var s2 = (t2 * (b2x - a1x) + t3 * (b2y - a1y)) / (t2 * t2 + t3 * t3);
        if(s1 <= 0 && s2 >= 1 || s1 >= 1 && s2 <= 0) {
          // first line contains second line
          return [[a1x, a1y], [a2x, a2y]];
        } else if(s1 < 0 && s2 < 0 || s1 > 1 && s2 > 1) {
          // lines don't overlap
          return [];
        } else if(s1 <= 0 && s2 <= 0) {
          // meets at the first point of first line
          return [[a1x, a1y]];
        } else if(s1 >= 1 && s2 >= 1) {
          // meets at the second point of first line
          return [[a2x, a2y]];
        } else if(s1 < 0 || s2 < 0) {
          smax = Math.max(s1, s2);
          return [[a1x, a1y], [
            a1x + t2 * smax, a1y + t3 * smax
          ]];
        } else if(s1 > 1 || s2 > 1) {
          smin = Math.min(s1, s2);
          return [[
            a1x + t2 * smin, a1y + t3 * smin
          ], [a2x, a2y]];
        } else {
          smin = Math.min(s1, s2);
          smax = Math.max(s1, s2);
          return [[
            a1x + t2 * smin, a1y + t3 * smin
          ], [
            a1x + t2 * smax, a1y + t3 * smax
          ]];
        }
      } else {
        // console.log("parallel")
      }
    } else {
      var t29 = t24 / t21;
      var t30 = dpdeltad0 / t21;
      if (t29 >= 0.0 && t29 <= 1.0 && t30 >= 0.0 && t30 <= 1.0) {
        var t31 = [a1x + t2 * t29, a1y + t3 * t29];
        ret.push(t31);
      }
    }
    return ret;
  };

  /** @ignore */
  Clipper.prototype.possibleIntersection = function(e1, e2) {
    // if((e1.pl == e2.pl) ) // you can uncomment these two lines if(self-intersecting polygons are not allowed
    // return false;

    var ip1 = [];
    var ip2 = []; // intersection points
    var nintersections;
    // console.log(JSON.stringify(["possibleIntersections",e1.segment(), e2.segment()]))
    if(!(nintersections = Clipper.findIntersection(e1.segment(), e2.segment(), ip1, ip2)))
      return;
    // console.log([ip1,ip2])
    if(nintersections === 1 && (Clipper._ptEq(e1.p, e2.p) || Clipper._ptEq(e1.other.p, e2.other.p)))
      return; // the line segments intersect at an endpoint of both line segments

    if(nintersections === 2 && e1.pl === e2.pl)
      return; // the line segments overlap, but they belong to the same polygon

    // The line segments associated to e1 and e2 intersect
    // nint += nintersections;

    if(nintersections === 1) {
      if(!Clipper._ptEq(e1.p, ip1) && !Clipper._ptEq(e1.other.p, ip1))  // if(ip1 is not an endpoint of the line segment associated to e1 then divide "e1"
        this._divideSegment(e1, ip1);
      if(!Clipper._ptEq(e2.p, ip1) && !Clipper._ptEq(e2.other.p, ip1))  // if(ip1 is not an endpoint of the line segment associated to e2 then divide "e2"
        this._divideSegment(e2, ip1);
      return;
    }

    // The line segments overlap
    var sortedEvents = [];
    if(Clipper._ptEq(e1.p, e2.p)) {
      sortedEvents.push(null);
    } else if(Clipper.sweepEventComp(e1, e2)) {
      sortedEvents.push(e2);
      sortedEvents.push(e1);
    } else {
      sortedEvents.push(e1);
      sortedEvents.push(e2);
    }
    if(Clipper._ptEq(e1.other.p, e2.other.p)) {
      sortedEvents.push(null);
    } else if(Clipper.sweepEventComp(e1.other, e2.other)) {
      sortedEvents.push(e2.other);
      sortedEvents.push(e1.other);
    } else {
      sortedEvents.push(e1.other);
      sortedEvents.push(e2.other);
    }

    if(sortedEvents.length === 2) { // are both line segments equal?
      e1.type = e1.other.type = Clipper.NON_CONTRIBUTING;
      e2.type = e2.other.type = e1.inOut === e2.inOut ? Clipper.SAME_TRANSITION : Clipper.DIFFERENT_TRANSITION;
      return;
    }
    if(sortedEvents.length === 3) { // the line segments share an endpoint
      sortedEvents[1].type = sortedEvents[1].other.type = Clipper.NON_CONTRIBUTING;
      if(sortedEvents[0]) // is the right endpoint the shared point?
        sortedEvents[0].other.type = e1.inOut === e2.inOut ? Clipper.SAME_TRANSITION : Clipper.DIFFERENT_TRANSITION;
      else // the shared point is the left endpoint
        sortedEvents[2].other.type = e1.inOut === e2.inOut ? Clipper.SAME_TRANSITION : Clipper.DIFFERENT_TRANSITION;
      this._divideSegment(sortedEvents[0] ? sortedEvents[0] : sortedEvents[2].other, sortedEvents[1].p);
      return;
    }
    if(sortedEvents[0] !== sortedEvents[3].other) { // no line segment includes totally the other one
      sortedEvents[1].type = Clipper.NON_CONTRIBUTING;
      sortedEvents[2].type = e1.inOut === e2.inOut ? Clipper.SAME_TRANSITION : Clipper.DIFFERENT_TRANSITION;
      this._divideSegment(sortedEvents[0], sortedEvents[1].p);
      this._divideSegment(sortedEvents[1], sortedEvents[2].p);
      return;
    }
    // one line segment includes the other one
    sortedEvents[1].type = sortedEvents[1].other.type = Clipper.NON_CONTRIBUTING;
    this._divideSegment(sortedEvents[0], sortedEvents[1].p);
    sortedEvents[3].other.type = e1.inOut === e2.inOut ? Clipper.SAME_TRANSITION : Clipper.DIFFERENT_TRANSITION;
    this._divideSegment(sortedEvents[3].other, sortedEvents[2].p);
  };
  /** @ignore */
  Clipper.prototype._divideSegment = function(e, p) {
  // "Right event" of the "left line segment" resulting from dividing e(the line segment associated to e)
    var r = this.storeSweepEvent(new Clipper.SweepEvent(p, false, e.pl, e, e.type));
    // "Left event" of the "right line segment" resulting from dividing e(the line segment associated to e)
    var l = this.storeSweepEvent(new Clipper.SweepEvent(p, true, e.pl, e.other, e.other.type));
    if(Clipper.sweepEventComp(l, e.other)) { // avoid a rounding error. The left event would be processed after the right event
    // console.log("Oops")
      e.other.left = true;
      l.left = false;
    }
    if(Clipper.sweepEventComp(e, r)) { // avoid a rounding error. The left event would be processed after the right event
    // console.log("Oops2")
    }
    e.other.other = l;
    e.other = r;
    this.eq.push(l);
    this.eq.push(r);
  };

    /**
     * Computes the combination of this path's shape with another
     * path's shape. The following points apply to this method:<ul>
     * <li>This method treats unclosed subpaths as implicitly closed
     * by connecting their end points with their start points.
     * <li>Currently, the algorithm supports only polygons made up
     * of line segments, so curves and arcs are converted to line
     * segments before applying the operation.
     * <li>Each polygon can be concave or have self-intersections
     * or holes. Subpaths that are holes have the opposite winding
     * order (clockwise or counterclockwise) from the subpath
     * that contains them.
     * <li>To use this method, you must include the script
     * "extras/path.js". Example:<pre>
     * &lt;script type="text/javascript" src="extras/path.js">&lt;/script></pre>
     * </ul>
     * @param {H3DU.GraphicsPath} path A path to combine with this one.
     * @param {number} [flatness] When curves and arcs
     * are decomposed to line segments, the
     * segments will be close to the true path of the curve by this
     * value, given in units. If null, undefined, or omitted, default is 1.
     * @returns {H3DU.GraphicsPath} The union of the two paths.
     * @memberof! H3DU.GraphicsPath#
     */
  GraphicsPath.prototype.union = function(path, flatness) {
    if(typeof path === "undefined" || path === null)return this;
    var polygon1 = new Polygon(this, flatness);
    var polygon2 = new Polygon(path, flatness);
    var retval = new Clipper(polygon1, polygon2).compute(Clipper.UNION);
    return retval.toPath();
  };
    /**
     * Computes the difference between this path's shape and another
     * path's shape. The points given in the {@link H3DU.GraphicsPath#union} method
     * apply to this method.
     * @param {H3DU.GraphicsPath} path A path to combine with this one.
     * @param {number} [flatness] When curves and arcs
     * are decomposed to line segments, the
     * segments will be close to the true path of the curve by this
     * value, given in units. If null, undefined, or omitted, default is 1.
     * @returns {H3DU.GraphicsPath} The difference between this path
     * and the other path.
     * @memberof! H3DU.GraphicsPath#
     */
  GraphicsPath.prototype.difference = function(path, flatness) {
    if(typeof path === "undefined" || path === null)return this;
    var polygon1 = new Polygon(this, flatness);
    var polygon2 = new Polygon(path, flatness);
    var retval = new Clipper(polygon1, polygon2).compute(Clipper.DIFFERENCE);
    return retval.toPath();
  };
    /**
     * Computes the intersection, or the area common to both this path's shape
     * and another path's shape. The points given in the {@link H3DU.GraphicsPath#union} method
     * apply to this method.
     * @param {H3DU.GraphicsPath} path A path to combine with this one.
     * @param {number} [flatness] When curves and arcs
     * are decomposed to line segments, the
     * segments will be close to the true path of the curve by this
     * value, given in units. If null, undefined, or omitted, default is 1.
     * @returns {H3DU.GraphicsPath} A path whose shape is contained in
     * both paths.
     * @memberof! H3DU.GraphicsPath#
     */
  GraphicsPath.prototype.intersection = function(path, flatness) {
    if(typeof path === "undefined" || path === null)return this;
    var polygon1 = new Polygon(this, flatness);
    var polygon2 = new Polygon(path, flatness);
    var retval = new Clipper(polygon1, polygon2).compute(Clipper.INTERSECTION);
    return retval.toPath();
  };
    /**
     * Computes the shape contained in either this path or another path,
     * but not both. The points given in the {@link H3DU.GraphicsPath#union} method
     * apply to this method.
     * @param {H3DU.GraphicsPath} path A path to combine with this one.
     * @param {number} [flatness] When curves and arcs
     * are decomposed to line segments, the
     * segments will be close to the true path of the curve by this
     * value, given in units. If null, undefined, or omitted, default is 1.
     * @returns {H3DU.GraphicsPath} A path whose shape is contained in
     * only one of the two paths.
     * @memberof! H3DU.GraphicsPath#
     */
  GraphicsPath.prototype.xor = function(path, flatness) {
    if(typeof path === "undefined" || path === null)return this;
    var polygon1 = new Polygon(this, flatness);
    var polygon2 = new Polygon(path, flatness);
    var retval = new Clipper(polygon1, polygon2).compute(Clipper.XOR);
    return retval.toPath();
  };

  if(typeof exports.H3DU !== "undefined" && exports.H3DU !== null) {
    exports.H3DU.GraphicsPath = GraphicsPath;
  }
  /* exported GraphicsPath */
  /**
   * Alias for the {@link H3DU.GraphicsPath} class.
   * @constructor
   * @alias GraphicsPath
   * @deprecated Use {@link H3DU.GraphicsPath} instead.
   */
  exports.GraphicsPath = GraphicsPath;
}));
