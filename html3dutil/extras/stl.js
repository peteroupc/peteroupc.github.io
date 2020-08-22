/** The <code>extras/stl.js</code> module.
 * To import all symbols in this module, either of the following can be used:
 * <pre>
 * import * from "extras/stl.js";
 * // -- or --
 * import * as CustomModuleName from "extras/stl.js";</pre>
 * @module extras/stl */

/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under
 Creative Commons Zero: http://creativecommons.org/publicdomain/zero/1.0/
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
const TriangleFan = function(indices) {
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
export const fromStlString = function(str) {
  const number = "(-?(?:\\d+\\.?\\d*|\\d*\\.\\d+)(?:[Ee][\\+\\-]?\\d+)?)";
  const facet = new RegExp("^\\s*facet\\s+normal\\s+" + number + "\\s+" + number +
   "\\s+" + number + "\\s*");
  const vertex = new RegExp("^\\s*vertex\\s+" + number + "\\s+" + number +
   "\\s+" + number + "\\s*");
  const solid = new RegExp("^\\s*solid(?=\\s+(.*)|$)");
  const outerloop = new RegExp("^\\s*outer\\s+loop\\s*");
  const endfacet = new RegExp("^\\s*endfacet\\s*");
  const endloop = new RegExp("^\\s*endloop\\s*");
  const endsolid = new RegExp("^\\s*endsolid(?=\\s+.*|$)");
  const lines = str.split(/\r?\n/);
  let state = INITIAL;
  const normal = [0, 0, 0];
  const vertices = [];
  const indices = [];
  const tfan = new TriangleFan(indices);
  let i;
  for (i = 0; i < lines.length; i++) {
    const line = lines[i];
    // skip empty lines
    if(line.length === 0 || (/^\s*$/).test(line))continue;
    let e = solid.exec(line);
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
      const index = vertices.length / 6;
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
