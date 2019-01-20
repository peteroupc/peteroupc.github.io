/* global H3DU */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

/* exported makeTubeFromPath */
function makeTubeFromPath(path, flatness, thickness, pathSection) {
  "use strict";
  let curves = path.getCurves();
  let resolution = Math.ceil(curves.getLength() / flatness / 10);
  let curveSection = pathSection ? pathSection.getCurves() : null;
  return new H3DU.SurfaceBuilder()
    .positionNormal(new H3DU.CurveTube(curves, thickness, curveSection))
    .evalSurface( H3DU.Mesh.TRIANGLES, resolution,
      Math.ceil(2 * thickness / flatness)).toMeshBuffer();
}

/* exported starPolygon */
function starPolygon(x, y, radius, points, jump, phaseInDegrees) {
  "use strict";
  let coords = [];
  let connected = [];
  let retval = [];
  if(points < 2)return retval;
  if(jump < 1)throw new Error();
  for(var i = 0; i < points; i++) {
    connected[i] = false;
  }
  let phase = (typeof phaseInDegrees === "undefined" || phaseInDegrees === null ? 0 : phaseInDegrees) * H3DU.MathUtil.ToRadians;
  let angleStep = H3DU.MathUtil.PiTimes2 / points;
  let cosStep = Math.cos(angleStep);
  let sinStep = angleStep <= 3.141592653589793 ? Math.sqrt(1.0 - cosStep * cosStep) : -Math.sqrt(1.0 - cosStep * cosStep);
  let c = Math.cos(phase);
  let s = phase >= 0 && phase < 6.283185307179586 ? phase <= 3.141592653589793 ? Math.sqrt(1.0 - c * c) : -Math.sqrt(1.0 - c * c) : Math.sin(phase);
  for(i = 0; i < points; i++) {
    coords.push([x + c * radius, y + s * radius]);
    let ts = cosStep * s + sinStep * c;
    let tc = cosStep * c - sinStep * s;
    s = ts;
    c = tc;
  }
  for (;;) {
    let firstPoint = -1;
    for(i = 0; i < points; i++) {
      if(!connected[i]) {
        firstPoint = i;
        break;
      }
    }
    if(firstPoint < 0)break;
    let pt = firstPoint;
    let lastPoint = -1;
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
