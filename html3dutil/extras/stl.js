/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {MeshBuffer} from "../h3du_module.js";

/**
 * Primitive mode for rendering a triangle fan. The first 3
 * vertices make up the first triangle, and each additional
 * triangle is made up of the first vertex of the first triangle,
 * the previous vertex, and 1 new vertex.
 * @constructor
 * @ignore
 */
var TriangleFan = function(indices) {
  this.indices = indices;
  this.start = -1;
  this.last = -1;
  this.reset = function() {
    this.start = -1;
    this.last = -1;
  };
  this.addIndex = function(index) {
    if(this.start < 0) {
      this.start = index;
    } else if(this.last < 0) {
      this.last = index;
    } else {
      this.indices.push(this.start);
      this.indices.push(this.last);
      this.indices.push(index);
      this.last = index;
    }
  };
};
  /** @ignore */
const INITIAL = 0;
/** @ignore */
const IN_SOLID = 1;
/** @ignore */
const IN_FACET = 2;
/** @ignore */
const IN_OUTER_LOOP = 3;
/** @ignore */
const AFTER_SOLID = 3;
/**
 * TODO: Not documented yet.
 * @param {*} str
 * @returns {*} Return value.
 * @function
 */
export var fromStlString = function(str) {
  var number = "(-?(?:\\d+\\.?\\d*|\\d*\\.\\d+)(?:[Ee][\\+\\-]?\\d+)?)";
  var facet = new RegExp("^\\s*facet\\s+normal\\s+" + number + "\\s+" + number +
   "\\s+" + number + "\\s*");
  var vertex = new RegExp("^\\s*vertex\\s+" + number + "\\s+" + number +
   "\\s+" + number + "\\s*");
  var solid = new RegExp("^\\s*solid(?=\\s+(.*)|$)");
  var outerloop = new RegExp("^\\s*outer\\s+loop\\s*");
  var endfacet = new RegExp("^\\s*endfacet\\s*");
  var endloop = new RegExp("^\\s*endloop\\s*");
  var endsolid = new RegExp("^\\s*endsolid(?=\\s+.*|$)");
  var lines = str.split(/\r?\n/);
  var state = INITIAL;
  var normal = [0, 0, 0];
  var vertices = [];
  var indices = [];
  var tfan = new TriangleFan(indices);
  for(var i = 0; i < lines.length; i++) {
    var line = lines[i];
    // skip empty lines
    if(line.length === 0 || (/^\s*$/).test(line))continue;
    var e = solid.exec(line);
    if(e && (state === INITIAL || state === AFTER_SOLID)) {
      // 'e[1]' holds the name of the solid
      state = IN_SOLID;
      continue;
    }
    e = facet.exec(line);
    if(e && state === IN_SOLID) {
      tfan.reset(); // Reset triangle fan state
      normal[0] = parseFloat(e[1]);
      normal[1] = parseFloat(e[2]);
      normal[2] = parseFloat(e[3]);
      state = IN_FACET;
      continue;
    }
    e = outerloop.exec(line);
    if(e && state === IN_FACET) {
      state = IN_OUTER_LOOP;
      continue;
    }
    e = vertex.exec(line);
    if(e && state === IN_OUTER_LOOP) {
      var index = vertices.length / 6;
      // Add position X,Y,Z, then normal X,Y,Z
      vertices.push(parseFloat(e[1]), parseFloat(e[2]), parseFloat(e[3]),
        normal[0], normal[1], normal[2]);
      tfan.addIndex(index);
      continue;
    }
    e = endloop.exec(line);
    if(e && state === IN_OUTER_LOOP) {
      state = IN_FACET;
      continue;
    }
    e = endfacet.exec(line);
    if(e && state === IN_FACET) {
      state = IN_SOLID;
      continue;
    }
    e = endsolid.exec(line);
    if(e && state === IN_SOLID) {
      state = AFTER_SOLID;
      continue;
    }
    console.error("unsupported line: " + line);
    return null;
  }
  return MeshBuffer.fromPositionsNormals(vertices, indices);
};
