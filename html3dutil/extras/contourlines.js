/* global Meshes */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

import {H3DU} from "../h3du_min";

/** @ignore */
function contourOne(p1, p2, u1, v1, u2, v2, level, lines) {
  var diff = p2 - p1;
  var offset = (level - p1) / diff;
  var u = u1 + (u2 - u1) * offset;
  var v = v1 + (v2 - v1) * offset;
  lines.push(u, v);
}

/** @ignore */
function contourVertex(p1, p2, p3, u1, v1, u2, v2, u3, v3, level, lines) {
  if(p1 === level && p2 === level) {
    if(p3 === level) {
      // All three vertices are on-level,
      // choose (u1, v1, u2, v2)
      lines.push(u1, v1, u2, v2);
      return;
    }
    lines.push(u1, v1, u2, v2);
    return;
  } else if(p3 === level && p2 === level) {
    lines.push(u2, v2, u3, v3);
    return;
  } else if(p1 === level && p3 === level) {
    lines.push(u1, v1, u3, v3);
    return;
  }
  // At this point, no more than one point
  // can be on-level
  var on = 0;
  var above = 0;
  var below = 0;
  var p1cmp = 0;
  var p2cmp = 0;
  var p3cmp = 0;
  if(p1 === level) {
    on++;
  } else if(p1 > level) {
    above++; p1cmp = 1;
  } else {
    below++; p1cmp = -1;
  }
  if(p2 === level) {
    on++;
  } else if(p2 > level) {
    above++; p2cmp = 1;
  } else {
    below++; p2cmp = -1;
  }
  if(p3 === level) {
    on++;
  } else if(p3 > level) {
    above++; p3cmp = 1;
  } else {
    below++; p3cmp = -1;
  }
  if(p1 === level && above === 1) {
    contourOne(p2, p3, u2, v2, u3, v3, level, lines);
    lines.push(u1, v1);
  } else if(p2 === level && above === 1) {
    contourOne(p1, p3, u1, v1, u3, v3, level, lines);
    lines.push(u2, v2);
  } else if(p3 === level && above === 1) {
    contourOne(p1, p2, u1, v1, u2, v2, level, lines);
    lines.push(u3, v3);
  } else if(on === 0 && above < 3 && below < 3) {
    if(p1cmp === p2cmp) {
      contourOne(p2, p3, u2, v2, u3, v3, level, lines);
      contourOne(p1, p3, u1, v1, u3, v3, level, lines);
    } else if(p2cmp === p3cmp) {
      contourOne(p1, p3, u1, v1, u3, v3, level, lines);
      contourOne(p1, p2, u1, v1, u2, v2, level, lines);
    } else if(p3cmp === p1cmp) {
      contourOne(p1, p2, u1, v1, u2, v2, level, lines);
      contourOne(p2, p3, u2, v2, u3, v3, level, lines);
    }
  }
}

/** @ignore */
function conrec(func, levels, u1, u2, v1, v2, usize, vsize) {
  var array = [];
  var contours = [];
  var invvsize = 1.0 / vsize;
  var invusize = 1.0 / usize;
  var ustep = (u2 - u1) * invusize;
  var vstep = (v2 - v1) * invvsize;
  var halfustep = ustep * 0.5;
  var halfvstep = vstep * 0.5;
  if(levels.length === 0)return contours;
  var minLevel = Number.POSITIVE_INFINITY;
  var maxLevel = Number.NEGATIVE_INFINITY;
  for(var i = 0; i < levels.length; i++) {
    contours.push([]);
    minLevel = Math.min(minLevel, levels[i]);
    maxLevel = Math.max(maxLevel, levels[i]);
  }
  for(var v = 0; v <= vsize; v++) {
    var vv = v === vsize ? v2 : v1 + vstep * v;
    for(var u = 0; u <= usize; u++) {
      var uu = u === usize ? u2 : u1 + ustep * u;
      array.push(func(uu, vv));
    }
  }
  var usizep1 = usize + 1;
  for(v = 0; v < vsize; v++) {
    var row = v * usizep1;
    var nextrow = row + usizep1;
    var vval = v1 + vstep * v;
    var vnextval = v + 1 === vsize ? v2 : vval + vstep;
    var vc = vval + halfvstep;
    var currU = array[row];
    var currUNextRow = array[nextrow];
    for(u = 0; u < usize; u++) {
      var uval = u1 + ustep * u;
      var unextval = u + 1 === usize ? u2 : uval + ustep;
      var p1 = currU;
      var p2 = array[row + u + 1];
      var p3 = currUNextRow;
      var p4 = array[nextrow + u + 1];
      currU = p2;
      currUNextRow = p4;
      var maxValue = Math.max(p1, p2, p3, p4);
      var minValue = Math.min(p1, p2, p3, p4);
      if(minValue > maxLevel || maxValue < minLevel) {
        continue;
      }
      var uc = uval + halfustep;
      var pc = (p1 + p2 + p3 + p4) * 0.25;
      for(i = 0; i < levels.length; i++) {
        var level = levels[i];
        if(minValue <= level && maxValue >= level) {
          contourVertex(p1, p2, pc, uval, vval, unextval, vval, uc, vc, level, contours[i]);
          contourVertex(p2, p4, pc, unextval, vval, unextval, vnextval, uc, vc, level, contours[i]);
          contourVertex(p3, p4, pc, uval, vnextval, unextval, vnextval, uc, vc, level, contours[i]);
          contourVertex(p1, p3, pc, uval, vval, uval, vnextval, uc, vc, level, contours[i]);
        }
      }
    }
  }
  return contours;
}

/** @ignore */
function drawCurve(contours) {
  var vertices = [];
  for(var contourIndex = 0; contourIndex < contours.length; contourIndex++) {
    var contour = contours[contourIndex];
    for(var i = 0; i < contour.length; i += 4) {
      vertices.push(contour[i], contour[i + 1], 0);
      vertices.push(contour[i + 2], contour[i + 3], 0);
    }
  }
  return H3DU.MeshBuffer.fromPositions(vertices)
    .setPrimitiveType(H3DU.MeshBuffer.LINES)
    .setColor([0, 0, 0]);
}
/**
 * TODO: Not documented yet.
 * @param {*} func
 * @param {*} levels
 * @param {*} u1
 * @param {*} u2
 * @param {*} v1
 * @param {*} v2
 * @param {*} usize
 * @param {*} vsize
 * @returns {*}
 */
Meshes.prototype.contourLines = function(func, levels, u1, u2, v1, v2, usize, vsize) {
  var contours = conrec(func, levels, u1, u2, v1, v2, usize, vsize);
  return drawCurve(contours);
};
