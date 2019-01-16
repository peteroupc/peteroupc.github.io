/** The <code>extras/createfloor.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/createfloor.js";
 * // -- or --
 * import * as CustomModuleName from "extras/createfloor.js";</pre>
 * @module extras/createfloor */
/** The <code>extras/createfloor.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/createfloor.js";
 * // -- or --;
 * import * as CustomModuleName from "extras/createfloor.js";
 * @module extras/createfloor */

/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {MeshBuffer} from "../h3du-module.js";
/**
 * Generates a mesh buffer of a tiled floor. Texture coordinates
 * of each tile will range from [0,1] across the width and height
 * of that tile. Thus, any texture used to render the mesh buffer should
 * entirely be of a square tile.
 * @param {number} xStart X coordinate of the start of the floor.
 * @param {number} yStart Y coordinate of the start of the floor.
 * @param {number} width Total width of the floor.
 * @param {number} height Total height of the floor.
 * @param {number} tileSize Width and height of each floor tile.
 * @param {number} [z] Z coordinate where the floor will be placed. If null, undefined, or omitted, the default is 0.
 * @returns {MeshBuffer} The resulting mesh buffer.
 * @function
 */
export var createFloor = function(xStart, yStart, width, height, tileSize, z) {
  if(typeof z === "undefined" || z === null)z = 0.0;
  var vertices = [];
  var indices = [];
  var index = 0;
  var tilesX = Math.ceil(width / tileSize);
  var tilesY = Math.ceil(height / tileSize);
  var lastY = (height - tilesY * tileSize) / tileSize;
  var lastX = (width - tilesX * tileSize) / tileSize;
  if(lastY <= 0)lastY = 1.0;
  if(lastX <= 0)lastX = 1.0;
  for(var y = 0; y < tilesY; y++) {
    var endY = y === tilesY - 1 ? 1.0 - lastY : 0.0;
    var endPosY = y === tilesY - 1 ? yStart + height : yStart + (y + 1) * tileSize;
    for(var x = 0; x < tilesX; x++) {
      var endX = x === tilesX - 1 ? lastX : 1.0;
      var endPosX = x === tilesX - 1 ? xStart + width : xStart + (x + 1) * tileSize;
      vertices.push(
        xStart + x * tileSize, yStart + y * tileSize, z, 0, 0, 1, 0, 1,
        xStart + x * tileSize, endPosY, z, 0, 0, 1, 0, endY,
        endPosX, yStart + y * tileSize, z, 0, 0, 1, endX, 1,
        endPosX, endPosY, z, 0, 0, 1, endX, endY);
      indices.push(index, index + 1, index + 2, index + 2, index + 1, index + 3);
      index += 4;
    }
  }
  return MeshBuffer.fromPositionsNormalsUV(vertices, indices);
};
