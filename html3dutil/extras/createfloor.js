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
 * TODO: Not documented yet.
 * @param {*} xStart
 * @param {*} yStart
 * @param {*} width
 * @param {*} height
 * @param {*} tileSize
 * @param {*} z
 * @returns {*} Return value.
 * @function
 */
export var createFloor = function(xStart, yStart, width, height, tileSize, z) {
  // xStart, yStart - X and Y coordinates of the start of the floor
  // width, height - Width and height of the floor
  // tileSize - Size of each floor tile
  // z - Z coordinate where the floor will be placed (optional,
  // default 0)
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
