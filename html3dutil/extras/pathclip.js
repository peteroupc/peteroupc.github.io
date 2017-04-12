/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
(function(globalContext) {
  "use strict";

// //////////////////////////////////////////////////////////////////////////////////////////////
// Data structures
// //////////////////////////////////////////////////////////////////////////////////////////////

/** @ignore */
  var LinkedListNode = function(item) {
    this.data = item;
    this.prev = null;
    this.next = null;
  };

/** @ignore */
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

  var GraphicsPath = {};
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

  if(globalContext.H3DU.GraphicsPath) {
/** @lends H3DU.GraphicsPath */
    GraphicsPath = globalContext.H3DU.GraphicsPath;
/**
 * Computes the combination of this path's shape with another
 * path's shape. The following points apply to this method:<ul>
 * <li>This method treats unclosed subpaths as implicitly closed
 * by connecting their endPoints with their start points.
 * <li>Currently, the algorithm supports only polygons made up
 * of line segments, so curves and arcs are converted to line
 * segments before applying the operation.
 * <li>Each polygon can be concave or have self-intersections
 * or holes. Subpaths that are holes have the opposite winding
 * order (clockwise or counterclockwise) from the subpath
 * that contains them.
 * <li>To use this method, you must include the script "extras/pathclip.js";
 * this is in addition to "extras/path.js". Example:<pre>
 * &lt;script type="text/javascript" src="extras/path.js">&lt;/script>
 * &lt;script type="text/javascript" src="extras/pathclip.js">&lt;/script></pre>
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

  }

}(this));
