/* global H3DU */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

function getIntersectingPoint(p1, p2, p3) {
  "use strict";
  var n1 = p1.slice(0, 3);
  var n2 = p2.slice(0, 3);
  var n3 = p3.slice(0, 3);
  var d = H3DU.MathUtil.vec3dot(n1, H3DU.MathUtil.vec3cross(n2, n3));
  if(Math.abs(d) >= 1e-9) {
    var n12 = H3DU.MathUtil.vec3cross(n1, n2);
    var n23 = H3DU.MathUtil.vec3cross(n2, n3);
    var n31 = H3DU.MathUtil.vec3cross(n3, n1);
    var p = H3DU.MathUtil.vec3scale(n23, -p1[3]);
    H3DU.MathUtil.vec3addInPlace(p, H3DU.MathUtil.vec3scale(n31, -p2[3]));
    H3DU.MathUtil.vec3addInPlace(p, H3DU.MathUtil.vec3scale(n12, -p3[3]));
    H3DU.MathUtil.vec3scaleInPlace(p, 1.0 / d);
    return p;
  }
  return null;
}

var getSignedDistanceToPlane = function(v, p) {
  "use strict";
  // NOTE: Fast, not robust
  return p[3] + H3DU.MathUtil.vec3dot([p[0], p[1], p[2]], v);
};

function getIntersectingPoints(planes) {
  "use strict";
  var ret = [];

  if(planes.length >= 3) {
    for(var i = 0; i < planes.length - 2; i++) {
      for(var j = i + 1; j < planes.length - 1; j++) {
        for(var k = j + 1; k < planes.length; k++) {
          var p = getIntersectingPoint(planes[i], planes[j], planes[k]);
          if(typeof p !== "undefined" && p !== null) {
            ret.push(p);
          }
        }
      }
    }
  }
  if(ret.length > 0) {
    for(i = 0; i < ret.length; i++) {
      var ri = ret[i];
      var culled = false;
      // Check whether the point is outside
      // any of the halfspaces; if so, cull it
      for(j = 0; !culled && j < planes.length; j++) {
        var d = getSignedDistanceToPlane(ri, planes[j]);
        if(d > 1e-6) {
          ret[i] = null;
          culled = true;
        }
      }
      // Check for duplicates (this is done second
      // since it's much more likely in practice that the point
      // will be culled by a halfspace than that there will
      // be duplicates)
      for(j = i + 1; !culled && j < ret.length; j++) {
        var rj = ret[j];
        if(rj !== null && rj[0] === ri[0] && rj[1] === ri[1] && rj[2] === ri[2]) {
          ret[i] = null;
          culled = true;
        }
      }
    }
    // Regenerate point array
    var newret = [];
    for(i = 0; i < ret.length; i++) {
      if(typeof ret[i] !== "undefined" && ret[i] !== null) {
        newret.push(ret[i]);
      }
    }
    ret = newret;
  }
  return ret;
}
/* exported randomConvexPoly */
function randomConvexPoly(avgsize, maxfaces) {
  "use strict";
  var planes = [];
  for(var i = 0; i < maxfaces; i++) {
    var n = H3DU.MathUtil.vec3normalize([Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1]);
    var ns = H3DU.MathUtil.vec3scale(n, avgsize);
    planes.push(H3DU.MathUtil.planeFromNormalAndPoint(n, ns));
  }
  var ints = getIntersectingPoints(planes);
  return H3DU.Meshes.createConvexHull(ints, true);
}
/* exported prismMesh */
function prismMesh(size, height, sides) {
  "use strict";
  var planes = [];
  var angleStep = H3DU.MathUtil.PiTimes2 / sides;
  var cosStep = Math.cos(angleStep);
  var sinStep = angleStep <= 3.141592653589793 ? Math.sqrt(1.0 - cosStep * cosStep) : -Math.sqrt(1.0 - cosStep * cosStep);
  var s = 0.0; // sin(0deg)
  var c = 1.0; // cos(0deg)
  for(var i = 0; i < sides; i++) {
    planes.push(H3DU.MathUtil.planeFromNormalAndPoint([c, s, 0], [c * size, s * size, 0]));
    var ts = cosStep * s + sinStep * c;
    var tc = cosStep * c - sinStep * s;
    s = ts;
    c = tc;
  }
  planes.push(H3DU.MathUtil.planeFromNormalAndPoint([0, 0, -1], [0, 0, -1 * height / 2]));
  planes.push(H3DU.MathUtil.planeFromNormalAndPoint([0, 0, 1], [0, 0, 1 * height / 2]));
  var ints = getIntersectingPoints(planes);
  return H3DU.Meshes.createConvexHull(ints, true);
}
