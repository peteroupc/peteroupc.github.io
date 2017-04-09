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

/* exported makeTubeFromPath */
function makeTubeFromPath(path, flatness, thickness, pathSection) {
  "use strict";
  var curves = path.getCurves();
  var resolution = Math.ceil(curves.getLength() / flatness / 10);
  var curveSection = pathSection ? pathSection.getCurves() : null;
  return new H3DU.SurfaceBuilder()
    .positionNormal(new H3DU.CurveTube(curves, thickness, curveSection))
    .evalSurface( H3DU.Mesh.TRIANGLES, resolution,
      Math.ceil(2 * thickness / flatness)).toMeshBuffer();
}

function starPolygon(x, y, radius, points, jump, phaseInDegrees) {
  "use strict";
  var coords = [];
  var connected = [];
  var retval = [];
  if(points < 2)return retval;
  if(jump < 1)throw new Error();
  for(var i = 0; i < points; i++) {
    connected[i] = false;
  }
  var phase = (typeof phaseInDegrees === "undefined" || phaseInDegrees === null ? 0 : phaseInDegrees) * H3DU.Math.ToRadians;
  var angleStep = H3DU.Math.PiTimes2 / points;
  var cosStep = Math.cos(angleStep);
  var sinStep = angleStep <= 3.141592653589793 ? Math.sqrt(1.0 - cosStep * cosStep) : -Math.sqrt(1.0 - cosStep * cosStep);
  var c = Math.cos(phase);
  var s = phase >= 0 && phase < 6.283185307179586 ? phase <= 3.141592653589793 ? Math.sqrt(1.0 - c * c) : -Math.sqrt(1.0 - c * c) : Math.sin(phase);
  for(i = 0; i < points; i++) {
    coords.push([x + c * radius, y + s * radius]);
    var ts = cosStep * s + sinStep * c;
    var tc = cosStep * c - sinStep * s;
    s = ts;
    c = tc;
  }
  for (;;) {
    var firstPoint = -1;
    for(i = 0; i < points; i++) {
      if(!connected[i]) {
        firstPoint = i;
        break;
      }
    }
    if(firstPoint < 0)break;
    var pt = firstPoint;
    var lastPoint = -1;
    while(!connected[pt]) {
      connected[pt] = true;
      if(lastPoint >= 0) {
        retval.push(coords[lastPoint]);
        retval.push(coords[pt]);
      }
      lastPoint = pt;
      pt += jump;
      pt %= points;
    }
    if(lastPoint) {
      retval.push(coords[lastPoint]);
      retval.push(coords[firstPoint]);
    }
  }
  return retval;
}

/* exported starPolygonMesh */
function starPolygonMesh(mesh, x, y, radius, points, skip) {
  "use strict";
  var sp = starPolygon(x, y, radius, points, skip);
  mesh.mode(H3DU.Mesh.LINES);
  for(var i = 0; i < sp.length; i += 2) {
    mesh.vertex3(sp[i][0], sp[i][1], 0);
    mesh.vertex3(sp[i + 1][0], sp[i + 1][1], 0);
  }
}
