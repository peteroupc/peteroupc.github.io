/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under the Unlicense: https://unlicense.org/
*/

/** The <code>extras/pathutil.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/pathutil.js";
 * // -- or --
 * import * as CustomModuleName from "extras/pathutil.js";</pre>
 * @module extras/pathutil */

/* global H3DU */

/* exported makeTubeFromPath */
function makeTubeFromPath(three, path, flatness, thickness, pathSection) {
  "use strict";
  const curves = path.getCurves();
  const resolution = Math.ceil(curves.getLength() / flatness / 10);
  const curveSection = pathSection ? pathSection.getCurves() : null;
  return new H3DU.SurfaceBuilder()
    .positionNormal(new H3DU.CurveTube(curves, thickness, curveSection))
    .evalSurface( H3DU.Mesh.TRIANGLES, resolution,
      Math.ceil(2 * thickness / flatness)).toMeshBuffer(three);
}
