/* global H3DU */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

/* exported getPoints */
function getPoints(curves, numPoints, offset) {
  "use strict";
  var points = [];
  for(var i = 0; i < numPoints; i++) {
    var t = i / (numPoints - 1) + offset;
    if(t >= 0.0 && t <= 1.0) {
      var ev = curves.evaluate(t);
      points.push([ev[0], ev[1]]);
    }
  }
  return points;
}

/* exported pathFloor */
function pathFloor(path, z, flatness) {
  "use strict";
  if(typeof z === "undefined" || z === null)z = 0;
  var tris = path.getTriangles(flatness);
  var mesh = new H3DU.Mesh().mode(H3DU.Mesh.TRIANGLES)
   .normal3(0, 0, 1);
  for(var i = 0; i < tris.length; i++) {
    var tri = tris[i];
    mesh.vertex3(tri[0], tri[1], z)
   .vertex3(tri[2], tri[3], z)
   .vertex3(tri[4], tri[5], z);
  }
  return mesh;
}

/* exported pointMarch */
function pointMarch(
  group, // shape group containing the marching points
  curves, // curves of the path
  t // value from 0 to 1 specifying the point in time of the animation
) {
  "use strict";
  var POINTCOUNT = 50;
  var adjust = t * (1.0 / (POINTCOUNT - 1));
  var pts = getPoints(curves, POINTCOUNT, adjust);
  for(var i = 0; i < pts.length; i++) {
    if(!group.getShape(i)) {
      continue;
    }
    group.getShape(i).setVisible(true).setPosition(pts[i][0], pts[i][1], 0);
  }
  for(var j = pts.length; j < POINTCOUNT; j++) {
    if(!group.getShape(j)) {
      continue;
    }
    group.getShape(j).setVisible(false);
  }
}

function NormalGenWrapper2(f) {
  "use strict";
  this.f = f;
  this.evaluate = function(u, v) {
    return this.f.evaluate(u, v);
  };
  this.gradient = function(u, v) {
    return H3DU.SurfaceEval.findGradient(this.f, u, v);
  };
  this.tangent = function(u, v) {
    return H3DU.SurfaceEval.findTangent(this.f, u, v);
  };
  this.bitangent = function(u, v) {
    return H3DU.SurfaceEval.findBitangent(this.f, u, v);
  };
  this.endpoints = function() {
    return H3DU.SurfaceEval.findEndPoints(this.f);
  };
}

/* exported makeTubeFromPath */
function makeTubeFromPath(path, flatness, thickness, pathSection) {
  "use strict";
  var mesh = new H3DU.Mesh();
  var curves = path.getCurves(flatness);
  var resolution = Math.ceil(curves.getLength() / flatness / 10);
  var curveSection = pathSection ? pathSection.getCurves(flatness) : null;
  new H3DU.SurfaceEval()
    .vertex(new NormalGenWrapper2(new H3DU.CurveTube(curves, thickness, curveSection)))
    .evalSurface(mesh, H3DU.Mesh.TRIANGLES, resolution,
      Math.ceil(2 * thickness / flatness));
  return mesh;
}
