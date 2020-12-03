/* global H3DU */
/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under Creative Commons Zero (CC0): http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

/* exported makeTubeFromPath */
function makeTubeFromPath(path, flatness, thickness, pathSection) {
  "use strict";
  const curves = path.getCurves();
  const resolution = Math.ceil(curves.getLength() / flatness / 10);
  const curveSection = pathSection ? pathSection.getCurves() : null;
  return new H3DU.SurfaceBuilder()
    .positionNormal(new H3DU.CurveTube(curves, thickness, curveSection))
    .evalSurface( H3DU.Mesh.TRIANGLES, resolution,
      Math.ceil(2 * thickness / flatness)).toMeshBuffer();
}

/* exported starPolygon */
