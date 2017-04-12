/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
/* global DataView, H3DU, Promise, console */

/**
 * Represents a bitmap font, which supports drawing two-dimensional
 * text. This class supports
 * traditional bitmap fonts and signed distance field fonts.<p>
 * Bitmap fonts consist of a font definition file and one
 * or more textures containing the shape of each font glyph. The glyphs
 * are packed so that the glyphs don't overlap each other.<p>
 * In a signed distance field font, each pixel's alpha value depends on the
 * distance from that location to the edge of the glyph. A pixel alpha less
 * than 0.5 (127 in most image formats) means the pixel is outside the
 * glyph, greater than 0.5 means the pixel is inside the glyph, and 0 (for
 * outside the glyph) and 1 (for inside the glyph) means the pixel is
 * outside a buffer zone formed by the glyph's outline. Each glyph is usually
 * given extra space to accommodate the signed distance field information.<p>
 * The font definition file formats supported are text (".fnt"),
 * JSON (".json"), binary (".fnt" or ".bin"), and XML (".xml").
 * The text and binary file formats are specified at
 * <a href="http://www.angelcode.com/products/bmfont/doc/file_format.html">this
 * page</a>. The XML format is very similar to the text file format.
 * The JSON format is described at
 * <a href="https://github.com/Jam3/load-bmfont/blob/master/json-spec.md">this
 * page</a>.
 * <p>
 * See <a href="https://github.com/mattdesl/text-modules#bitmap-text">this page</a>
 * for a list of bitmap font generation tools. (No one tool is recommended over any
 * other, and the mention of this link is not an endorsement or sponsorship
 * of any particular tool.)<p>
 * NOTE: The constructor should not be called directly by applications.
 * Use the {@link H3DU.TextFont.load} method to get an H3DU.TextFont object. This
 * constructor's parameters are undocumented and are subject to change.
 * <p>This class is considered a supplementary class to the
 * Public Domain HTML 3D Library and is not considered part of that
 * library. <p>
 * To use this class, you must include the script "extras/text.js"; the
 * class is not included in the "h3du_min.js" file which makes up
 * the HTML 3D Library. Example:<pre>
 * &lt;script type="text/javascript" src="extras/text.js">&lt;/script></pre>
 * @constructor
 * @memberof H3DU
 */
H3DU.TextFont = function() {
  "use strict";
  var fontinfo = arguments[0];
  var chars = arguments[1];
  var pages = arguments[2];
  var kernings = arguments[3];
  var common = arguments[4];
  var fileUrl = arguments[5];
  this.info = fontinfo;
  this.common = common;
  if(this.info) {
    this.info.padding = H3DU.TextFont._toArray(this.info.padding, 4);
    this.info.spacing = H3DU.TextFont._toArray(this.info.spacing, 2);
  }
  this.fileUrl = fileUrl;
  this.chars = chars;
  this.pages = pages;
  this.kern = [];
  for(var i = 0; i < kernings.length; i++) {
    var k = kernings[i];
    if(!this.kern[k.first])this.kern[k.first] = [];
    this.kern[k.first][k.second] = k;
  }
};
/** @ignore */
H3DU.TextFont._toArray = function(str, minLength) {
  "use strict";
  var spl;
  var i;
  if(typeof str === "string") {
    spl = str.split(",");
    for(i = 0; i < spl.length; i++) {
      spl[i] = parseInt(spl[i], 10);
    }
  } else if(typeof str !== "undefined" && str !== null &&
   str.constructor === Array && str.length >= minLength) {
    return str;
  } else {
    spl = [];
  }
  for(i = spl.length; i < minLength; i++) {
    spl.push(0);
  }
  return spl;
};

/**
 * Calculates the width and height of a text string when
 * drawn using this font.
 * @param {string} str The text string to measure. Line breaks
 * ("\n", "\r", "\r\n") are recognized by this method.
 * @param {Object} params An object described in {@link H3DU.TextFont#makeTextMeshes}.
 * @returns {Array<number>} An array of two numbers;
 * the first is the width of the string, and the second is the
 * height of the string (taking into account line feed characters,
 * U+000A, that break lines).
 */
H3DU.TextFont.prototype.measure = function(str, params) {
  "use strict";
  var height = typeof params.lineHeight !== "undefined" && params.lineHeight !== null ? params.lineHeight :
   this.common.lineHeight;
  if(height < 0)throw new Error();
  var width = typeof params.width !== "undefined" && params.width !== null ? params.width : -1;
  var scale = height / this.common.lineHeight;
  var linebreaks = this._findLineBreaks(str, scale, width);
  var size = 0;
  var yPos = 0;
  for(var i = 0; i < linebreaks.length; i += 3) {
    size = Math.max(size, linebreaks[i + 2]);
    yPos += height;
  }
  return [size, yPos];
};
/** @ignore */
H3DU.TextFont.prototype._measureWord = function(
  str, startIndex, endIndex, lastChar, scale, info) {
  "use strict";
  var xPos = 0;
  var xSize = 0;
  for(var i = startIndex; i < endIndex; i++) {
    var c = str.charCodeAt(i);
    if(c >= 0xd800 && c < 0xdc00 && i + 1 < endIndex) {
      c = 0x10000 + (c - 0xd800 << 10) + (str.charCodeAt(i + 1) -
          0xdc00);
      i++;
    } else if(c >= 0xd800 && c < 0xe000) {
      c = 0xfffd;
    }
    if(c === 0x0d || c === 0x0a) {
   // don't measure line break characters; mandatory line
   // breaks should have been classified as such already
      lastChar = c;
      continue;
    }
    var ch = this.chars[c] || this.chars[0] || null;
    if(ch) {
      xSize = Math.max(xSize, xPos + ch.width * scale);
      if(lastChar !== -1) {
        if(this.kern[lastChar] && this.kern[lastChar][c]) {
          xPos += this.kern[lastChar][c].amount * scale;
        }
      }
      xPos += ch.xadvance * scale;
    }
    lastChar = c;
  }
  info[0] = xPos; // x-advance of the word
  info[1] = xSize; // width of the word
  info[2] = lastChar; // last character of the word
};
/** @ignore */
H3DU.TextFont.prototype._findLineBreaks = function(str, scale, maxWidth) {
  "use strict";
  if(str.length === 0) {
    return [];
  }
  var xPos;
  var breaks = [];
  var classes = [];
  var linePositions = [];
  var currentClass = -1;
 // Find the runs of non-whitespace/whitespace in the text
  for(var i = 0; i < str.length; i++) {
    var c = str.charCodeAt(i);
    if(c >= 0xd800 && c < 0xdc00 && i + 1 < str.length) {
      c = 0x10000 + (c - 0xd800 << 10) + (str.charCodeAt(i + 1) -
          0xdc00);
      i++;
    } else if(c >= 0xd800 && c < 0xe000) {
      c = 0xfffd;
    }
    if(c === 0x0d || c === 0x0a) {
      classes.push(2); // line break
      breaks.push(i);
      if(c === 0x0d && i + 1 < str.length && str.charCodeAt(i + 1) === 0x0a) {
        i++;
      }
      currentClass = -1;
      continue;
    } else if(c === 0x0c || c === 0x09 || c === 0x20) {
   // non-linebreak whitespace
      if(currentClass !== 1) {
        classes.push(1); // whitespace
        breaks.push(i);
      }
      currentClass = 1;
      xPos = 0;
    } else {
   // non-whitespace
      if(currentClass !== 0) {
        classes.push(0); // non-whitespace
        breaks.push(i);
      }
      currentClass = 0;
    }
  }
  breaks.push(str.length);
  var wordInfo = [];
  var lastChar = -1;
  xPos = 0;
  var xSize = 0;
  var lineStart = 0;
  var possibleLineEnd = 0;
  for(i = 0; i < classes.length; i++) {
    if(classes[i] === 2) {
    // mandatory line break
      linePositions.push(lineStart, breaks[i], xSize);
      xPos = 0;
      xSize = 0;
      lineStart = breaks[i + 1];
      possibleLineEnd = lineStart;
    } else {
      this._measureWord(str, breaks[i],
     breaks[i + 1], lastChar, scale, wordInfo);
      var size = xPos + wordInfo[1];
      lastChar = wordInfo[2];
      if(maxWidth >= 0 && size > maxWidth) {
        linePositions.push(lineStart, possibleLineEnd, xSize);
        if(classes[i] === 1) {
      // Spaces that overshoot the max width;
      // don't include the spaces
          xPos = 0;
          xSize = 0;
          lineStart = breaks[i + 1];
          possibleLineEnd = lineStart;
        } else {
          xPos = wordInfo[0];
          xSize = Math.max(0, wordInfo[1]);
          lineStart = breaks[i];
          possibleLineEnd = breaks[i + 1];
        }
      } else {
        if(classes[i] === 0) {
          possibleLineEnd = breaks[i + 1];
          xSize = Math.max(0, xPos + wordInfo[1]);
        }
        xPos += wordInfo[0];
      }
    }
  }
  if(lineStart !== str.length) {
    linePositions.push(lineStart, possibleLineEnd, xSize);
  }
  return linePositions;
};

/**
 * Creates a group of shapes containing the primitives needed to
 * draw text in the given position, size, and color.
 * For the text to show upright, the coordinate system should have the
 * X axis pointing right and the Y axis pointing down (for example, an
 * orthographic projection where the left and top coordinates are less
 * than the right and bottom coordinates, respectively).
 * @param {string} str The text to draw.  Line breaks ("\n", "\r", "\r\n") are recognized
 * by this method.
 * @param {Object} params An object described in {@link H3DU.TextFont#makeTextMeshes}.
 * Can also contain the following keys:<ul>
 * <li><code>color</code> - A [color vector or string]{@link H3DU.toGLColor} giving
 * the color to draw the text with.
 * If this value is given, the bitmap font is assumed to be a signed distance field
 * font.
 * <li><code>msdf</code> - Treat the bitmap font as a multichannel signed distance field
 * font.
 * <li><code>texture</code> - An array of textures ({@link H3DU.Texture}) to use with this font,
 * or a single {@link H3DU.Texture} if only one texture page is used.
 * If null, undefined, or omitted, uses the default filenames for texture pages defined in this font.
 * </ul>
 * @returns {H3DU.ShapeGroup} The generated group of shapes.
 */
H3DU.TextFont.prototype.textShape = function(str, params) {
  "use strict";
  var group = new H3DU.ShapeGroup();
  var msdf = typeof params.msdf !== "undefined" && params.msdf !== null ? params.msdf : false;
  var color = typeof params.color !== "undefined" && params.color !== null ? params.color : null;
  var textures = typeof params.textures !== "undefined" && params.textures !== null ?
   params.textures : null;
  if(textures && textures instanceof H3DU.Texture) {
    textures = [textures];
  }
  var shader = null;
  var hasColor = typeof color !== "undefined" && color !== null;
  if(hasColor) {
    shader = new H3DU.ShaderInfo(null, H3DU.TextFont._textShader(msdf));
  } else {
    shader = new H3DU.ShaderInfo(null, H3DU.TextFont._textureShader());
  }
  color = hasColor ? color : [0, 0, 0, 1.0];
  var meshesForPage = this.makeTextMeshes(str, params);
  for(var i = 0; i < meshesForPage.length; i++) {
    var mfp = meshesForPage[i];
    if(!mfp)continue;
    var sh = new H3DU.Shape(mfp);
    var texmap = textures ? textures[i] : this.pages[i];
    var material = new H3DU.Material().setParams({
      "texture":texmap,
      "diffuse":color,
      "shader": shader
    });
    sh.setMaterial(material);
    group.addShape(sh);
  }
  return group;
};
/** @ignore */
H3DU.TextFont.prototype._makeTextMeshesInner = function(str, startPos, endPos, xPos, yPos, params, extra, meshesForPage) {
  "use strict";
  var lastChar = -1;
  for(var i = startPos; i < endPos; i++) {
    var c = str.charCodeAt(i);
    if(c >= 0xd800 && c < 0xdc00 && i + 1 < endPos) {
      c = 0x10000 + (c - 0xd800 << 10) + (str.charCodeAt(i + 1) -
          0xdc00);
      i++;
    } else if(c >= 0xd800 && c < 0xe000) {
      c = 0xfffd;
    }
    if(c === 0x0a || c === 0x0d) {
   // NOTE: Should not occur at this point
      lastChar = c;
      continue;
    }
    var ch = this.chars[c] || this.chars[0] || null;
    if(ch) {
      var sx = ch.x * extra.recipPageWidth;
      var sy = ch.y * extra.recipPageHeight;
      var sx2 = (ch.x + ch.width) * extra.recipPageWidth;
      var sy2 = (ch.y + ch.height) * extra.recipPageHeight;
      var xo = ch.xoffset * extra.scale;
      var yo = ch.yoffset * extra.scale;
      var vx = xPos + xo;
      var vy = yPos + yo;
      var vx2 = vx + ch.width * extra.scale;
      var vy2 = vy + ch.height * extra.scale;
      if(ch.width > 0 && ch.height > 0) {
        var chMesh = meshesForPage[ch.page];
        if(!chMesh) {
          chMesh = new H3DU.Mesh();
          meshesForPage[ch.page] = chMesh;
        }
        chMesh.mode(H3DU.Mesh.TRIANGLE_STRIP)
     .texCoord2(sx, 1 - sy)
     .vertex2(vx, vy)
     .texCoord2(sx, 1 - sy2)
     .vertex2(vx, vy2)
     .texCoord2(sx2, 1 - sy)
     .vertex2(vx2, vy)
     .texCoord2(sx2, 1 - sy2)
     .vertex2(vx2, vy2);
      }
      if(lastChar !== -1) {
        if(this.kern[lastChar] && this.kern[lastChar][c]) {
          xPos += this.kern[lastChar][c].amount * extra.scale;
        }
      }
      xPos += ch.xadvance * extra.scale;
    }
    lastChar = c;
  }
};

/**
 * Creates an array of meshes containing the primitives
 * needed to draw text with this font.
 * @param {string} str The text to draw. Line breaks ("\n", "\r", "\r\n") are recognized
 * by this method.
 * @param {Object} params An object whose keys have
 * the possibilities given below, and whose values are those
 * allowed for each key.<ul>
 * <li><code>x</code> - X coordinate of the top left corner of the text.
 * If null, undefined, or omitted, uses 0.
 * For the text to show upright, the coordinate system should have the
 * X axis pointing right and the Y axis pointing down (for example, an
 * orthographic projection where the left and top coordinates are less
 * than the right and bottom coordinates, respectively).
 * <li><code>y</code> - Y coordinate of the top left corner of the text.
 * If null, undefined, or omitted, uses 0.
 * <li><code>lineHeight</code> - Height of each line of the text in units.
 * If null, undefined, or omitted, uses the line height given in the font.
 * <li><code>width</code> - Maximum width of each line. Lines
 * that exceed this width will be wrapped.
 * <li><code>align</code> - Horizontal text alignment.  Can be "left",
 * "center", or "right" (all strings).
 * </ul>
 * @returns {Array<H3DU.MeshBuffer>} An array of meshes representing the text.
 * There is one mesh for each texture page of the font. If none of the
 * text uses a given page, the corresponding mesh will be null.
 */
H3DU.TextFont.prototype.makeTextMeshes = function(str, params) {
  "use strict";
  var meshesForPage = [];
  var xPos = typeof params.x !== "undefined" && params.x !== null ? params.x : 0;
  var yPos = typeof params.y !== "undefined" && params.y !== null ? params.y : 0;
  var height = typeof params.lineHeight !== "undefined" && params.lineHeight !== null ? params.lineHeight :
   this.common.lineHeight;
  if(height < 0)throw new Error();
  var width = typeof params.width !== "undefined" && params.width !== null ? params.width : -1;
  var align = typeof params.align !== "undefined" && params.align !== null ? params.align : 0;
  if(align === "right")align = 2;
  else if(align === "center")align = 1;
  else align = 0;
  var extra = {
    "recipPageWidth":1.0 / this.common.scaleW,
    "recipPageHeight":1.0 / this.common.scaleH,
    "scale":height / this.common.lineHeight
  };
  meshesForPage = [];
  for(var i = 0; i < this.pages.length; i++) {
    meshesForPage[i] = null;
  }
  var linebreaks = this._findLineBreaks(str, extra.scale, width);
  if(linebreaks.length === 0) {
    return meshesForPage;
  }
  if(width < 0) {
  // Calculate max width if no explicit width was given
    for(i = 0; i < linebreaks.length; i += 3) {
      width = i === 0 ? linebreaks[i + 2] : Math.max(width, linebreaks[i + 2]);
    }
  }
  for(i = 0; i < linebreaks.length; i += 3) {
    var x = xPos;
    if(align === 1)x += (width - linebreaks[i + 2]) * 0.5;
    else if(align === 2)x = x + width - linebreaks[i + 2];
    this._makeTextMeshesInner(str, linebreaks[i],
    linebreaks[i + 1], x, yPos, params, extra, meshesForPage);
    yPos += height;
  }
  for(i = 0; i < meshesForPage.length; i++) {
    meshesForPage[i] = new H3DU.MeshBuffer(meshesForPage[i]);
  }
  return meshesForPage;
};
/** @ignore */
H3DU.TextFont._resolvePath = function(path, name) {
 // Relatively dumb for a relative path
 // resolver, but sufficient for H3DU.TextFont's purposes
  "use strict";
  var ret = path;
  var lastSlash = ret.lastIndexOf("/");
  if(lastSlash >= 0) {
    ret = ret.substr(0, lastSlash + 1) + name.replace(/\\/g, "/");
  } else {
    ret = name.replace(/\\/g, "/");
  }
  return ret;
};
/** @ignore */
H3DU.TextFont._elementToObject = function(element) {
  "use strict";
  var attrs = element.getAttributeNames();
  var x = {};
  for(var i = 0; i < attrs.length; i++) {
    var n = attrs[i];
    if(n === "face" || n === "charset" || n === "file" || n === "padding" ||
     n === "spacing") {
      x[n] = element.getAttribute(n);
    } else {
      x[n] = parseInt(element.getAttribute(n), 10);
      if(isNaN(x[n]))x[n] = 0;
    }
  }
  return x;
};
/** @ignore */
H3DU.TextFont._loadJsonFontInner = function(data) {
  "use strict";
  var xchars = [];
  var xpages = [];
  var xkernings = [];
  var json = data.data;
  if(!json.pages || !json.chars || !json.info ||
   !json.common) {
    return null;
  }
  for(var i = 0; i < json.chars.length; i++) {
    xchars[json.chars[i].id] = json.chars[i];
  }
  for(i = 0; i < json.pages.length; i++) {
    var p = json.pages[i];
    xpages[i] = H3DU.TextFont._resolvePath(data.url, p);
  }
  if(json.kernings) {
    xkernings = json.kernings;
  }
  return new H3DU.TextFont(json.info, xchars, xpages, xkernings,
   json.common, data.url);
};
/** @ignore */
H3DU.TextFont._loadXmlFontInner = function(data) {
  "use strict";
  var doc = data.data;
  var commons = doc.getElementsByTagName("common");
  if(commons.length === 0)return null;
  var infos = doc.getElementsByTagName("info");
  if(infos.length === 0)return null;
  var pages = doc.getElementsByTagName("page");
  if(pages.length === 0)return null;
  var chars = doc.getElementsByTagName("char");
  var kernings = doc.getElementsByTagName("kerning");
  var xchars = [];
  var xpages = [];
  var xkernings = [];
  var p;
  var xcommons = H3DU.TextFont._elementToObject(commons[0]);
  var xinfos = H3DU.TextFont._elementToObject(infos[0]);
  for(var i = 0; i < pages.length; i++) {
    p = H3DU.TextFont._elementToObject(pages[i]);
    xpages[p.id] = H3DU.TextFont._resolvePath(data.url, p.file);
  }
  for(i = 0; i < chars.length; i++) {
    p = H3DU.TextFont._elementToObject(chars[i]);
    xchars[p.id] = p;
  }
  for(i = 0; i < kernings.length; i++) {
    p = H3DU.TextFont._elementToObject(kernings[i]);
    xkernings.push(p);
  }
  return new H3DU.TextFont(xinfos, xchars, xpages, xkernings, xcommons, data.url);
};
/** @ignore */
H3DU.TextFont._decodeUtf8 = function(data, offset, endOffset) {
  "use strict";
  var ret = [];
  var cp, bytesSeen;
  var bytesNeeded = 0;
  var lower = 0x80;
  var upper = 0xbf;
  if(offset > endOffset)throw new Error();
  for (;;) {
    if (offset >= endOffset) {
      if (bytesNeeded !== 0) {
        return null;
      }
      return ret.join("");
    }
    var b = data.getUint8(offset++);
    if (bytesNeeded === 0) {
      if ((b & 0x7f) === b) {
        ret.push(String.fromCharCode(b));
        continue;
      } else if (b >= 0xc2 && b <= 0xdf) {
        bytesNeeded = 1;
        cp = b - 0xc0 << 6;
      } else if (b >= 0xe0 && b <= 0xef) {
        lower = b === 0xe0 ? 0xa0 : 0x80;
        upper = b === 0xed ? 0x9f : 0xbf;
        bytesNeeded = 2;
        cp = b - 0xe0 << 12;
      } else if (b >= 0xf0 && b <= 0xf4) {
        lower = b === 0xf0 ? 0x90 : 0x80;
        upper = b === 0xf4 ? 0x8f : 0xbf;
        bytesNeeded = 3;
        cp = b - 0xf0 << 18;
      } else {
        return null;
      }
      continue;
    }
    if (b < lower || b > upper) {
      return null;
    } else {
      lower = 0x80;
      upper = 0xbf;
      ++bytesSeen;
      cp += b - 0x80 << 6 * (bytesNeeded - bytesSeen);
      if (bytesSeen !== bytesNeeded) {
        continue;
      }
      var cpRet = cp;
      cp = 0;
      bytesSeen = 0;
      bytesNeeded = 0;
      if(cpRet >= 0x10000) {
        ret.push(String.fromCharCode((cpRet - 0x10000 >> 10) + 0xd800));
        ret.push(String.fromCharCode((cpRet - 0x10000 & 0x3ff) + 0xdc00));
      } else {
        ret.push(String.fromCharCode(cpRet));
      }
    }
  }
};
/** @ignore */
H3DU.TextFont._loadBinaryFontInner = function(data) {
  "use strict";
  var view = new DataView(data.data);
  var offset = 4;
  if(view.getUint8(0) !== 66 ||
  view.getUint8(1) !== 77 ||
  view.getUint8(2) !== 70 ||
  view.getUint8(3) !== 3) {
    throw new Error();
  }
  var info = {};
  var chars = [];
  var pages = [];
  var kernings = [];
  var commons = {};
  var havetype = [false, false, false, false, false, false];
  function utf8stringsize(view, startIndex, endIndex) {
    for(var i = startIndex; i < endIndex; i++) {
      if(view.getUint8(i) === 0) {
        return i - startIndex;
      }
    }
    return -1;
  }
  function utf8string(view, startIndex, endIndex) {
    for(var i = startIndex; i < endIndex; i++) {
      if(view.getUint8(i) === 0) {
        return H3DU.TextFont._decodeUtf8(view, startIndex, i);
      }
    }
    return null;
  }
  while (offset < view.byteLength) {
    var type = view.getUint8(offset);
    var size = view.getUint32(offset + 1, true);
    if(typeof type === "undefined" || type === null || type < 1 || type > 5) {
      return null;
    }
    if(havetype[type]) {
      return null;
    }
    var newOffset = offset + 5 + size;
    havetype[type] = true;
    offset += 5;
    var ch;
    switch(type) {
    default:
     // unexpected type; ignore
      break;
    case 1:
      if(size < 14) {
        return null;
      }
      info.fontSize = view.getInt16(offset, true);
      info.bitField = view.getUint8(offset + 2);
      var cs = view.getUint8(offset + 3);
    // return null if charset is unsupported
      if(cs !== 0) {
        return null;
      }
      info.charSet = ""; // ignore charSet field, not used
      info.stretchH = view.getUint16(offset + 4, true);
      info.aa = view.getUint8(offset + 6);
      info.padding = [
        view.getUint8(offset + 7),
        view.getUint8(offset + 8),
        view.getUint8(offset + 9),
        view.getUint8(offset + 10)];
      info.spacing = [
        view.getUint8(offset + 11),
        view.getUint8(offset + 12)];
      info.outline = view.getUint8(offset + 13);
      info.fontName = utf8string(view, offset + 14, offset + size);
      if(typeof info.fontName === "undefined" || info.fontName === null) {
        return null;
      }
      break;
    case 2:
      commons.lineHeight = view.getUint16(offset, true);
      commons.base = view.getUint16(offset + 2, true);
      commons.scaleW = view.getUint16(offset + 4, true);
      commons.scaleH = view.getUint16(offset + 6, true);
      commons.pages = view.getUint16(offset + 8, true);
      commons.bitField = view.getUint8(offset + 10);
      commons.alphaChnl = view.getUint8(offset + 11);
      commons.redChnl = view.getUint8(offset + 12);
      commons.greenChnl = view.getUint8(offset + 13);
      commons.blueChnl = view.getUint8(offset + 14);
      break;
    case 3:
      var ss = utf8stringsize(view, offset, offset + size);
      if(ss < 0) {
        return null;
      }
      for(var x = 0; x < size; x += ss + 1) {
        var name = utf8string(view, offset, offset + ss + 1);
        if(typeof name === "undefined" || name === null) {
          return null;
        }
        pages.push(H3DU.TextFont._resolvePath(data.url, name));
        offset += ss + 1;
      }
      break;
    case 4:
      for(x = 0; x < size; x += 20) {
        ch = {};
        ch.id = view.getUint32(offset, true);
        ch.x = view.getUint16(offset + 4, true);
        ch.y = view.getUint16(offset + 6, true);
        ch.width = view.getUint16(offset + 8, true);
        ch.height = view.getUint16(offset + 10, true);
        ch.xoffset = view.getInt16(offset + 12, true);
        ch.yoffset = view.getInt16(offset + 14, true);
        ch.xadvance = view.getInt16(offset + 16, true);
        ch.page = view.getUint8(offset + 18);
        ch.chnl = view.getUint8(offset + 19);
        offset += 20;
        chars[ch.id] = ch;
      }
      break;
    case 5:
      for(x = 0; x < size; x += 10) {
        ch = {};
        ch.first = view.getUint32(offset, true);
        ch.second = view.getUint32(offset + 4, true);
        ch.amount = view.getInt16(offset + 8, true);
        kernings.push(ch);
      }
      break;
    }
    offset = newOffset;
  }
  if(!havetype[1] || !havetype[2] || !havetype[3]) {
    return null;
  }
  return new H3DU.TextFont(info, chars, pages, kernings, commons, data.url);
};
/** @ignore */
H3DU.TextFont._loadTextFontInner = function(data) {
  "use strict";
  var text = data.data;
  var lines = text.split(/\r?\n/);
  var pages = [];
  var chars = [];
  var kernings = [];
  var common = null;
  var fontinfo = null;

  for(var i = 0; i < lines.length; i++) {
    var e = (/^(\w+)\s+(.*)/).exec(lines[i]);
    if(!e)continue;
    var word = e[1];
    var rest = e[2];
    var hash = {};
    for (;;) {
      e = (/^((\w+)\=(\"[^\"]+\"|\S+(?:\s+(?![^\s\=]+\=)[^\s\=]+)*)\s*)/).exec(rest);
      if(!e)break;
      var key = e[2];
      var value = e[3];
      if(value.charAt(0) === "\"") {
        value = value.substring(1, value.length - 1);
      } else if(value.match(/^-?\d+$/)) {
        value = parseInt(value, 10) | 0;
      } else if((key === "xoffset" || key === "yoffset" || key === "xadvance") && value.match(/^-?\d+\.\d+$/)) {
        value = parseFloat(value);
      }
      hash[key] = value;
      rest = rest.substr(e[1].length);
    }
    if(word === "page") {
      pages[hash.id | 0] = H3DU.TextFont._resolvePath(data.url, hash.file);
    }
    if(word === "char" && hash.id !== null) {
      chars[hash.id | 0] = hash;
    }
    if(word === "common") {
      if(common)return null;
      common = hash;
    }
    if(word === "kerning" && hash.first !== null) {
      kernings.push(hash);
    }
    if(word === "info" && hash.face !== null) {
      if(fontinfo)return null;
      fontinfo = hash;
    }
  }
  if(!fontinfo || !common || pages.length === 0) {
    return null;
  }
  return new H3DU.TextFont(fontinfo, chars, pages, kernings, common, data.url);
};
/**
 * Loads a bitmap font definition from a file along with the textures
 * used by that font.
 * @param {string} fontFileName The URL of the font data file
 * to load. The following file extensions are read as the following formats:<ul>
 * <li>".xml": XML</li>
 * <li>".json": JSON</li>
 * <li>".bin": Binary</li>
 * <li>".fnt": Text or binary</li>
 * <li>All others: Text</li></ul>
 * @param {H3DU.TextureLoader} textureLoader Texture loader object to use when
 * loading the textures.
 * @returns {Promise} A promise that is resolved
 * when the font data and textures are loaded successfully,
 * and is rejected when an error occurs.
 * If the promise is resolved, the result will be an object with the
 * following keys:<ul>
 * <li><code>url</code> - The URL of the font data file.
 * <li><code>font</code> - The font data in the form of an {@link H3DU.TextFont} object.
 * <li><code>textures</code> - An array of {@link H3DU.Texture} objects used by the font,
 * in the order in which they are declared in the font data file.
 * </ul>
 */
H3DU.TextFont.loadWithTextures = function(fontFileName, textureLoader) {
  "use strict";
  if(!textureLoader) {
    throw new Error();
  }
  return H3DU.TextFont.load(fontFileName).then(function(font) {
    return font.loadTextures(textureLoader).then(function(r) {
      return Promise.resolve({
        "url":font.fileUrl,
        "font":font,
        "textures":r
      });
    }, function(r) {
      return Promise.reject({
        "url":font.fileUrl,
        "results":r
      });
    });
  });
};
/**
 * Loads the texture files used by this font object.
 * @param {H3DU.TextureLoader} textureLoader Texture loader object to use when
 * loading the textures.
 * @returns {Promise<H3DU.Texture>} A promise as described in
 * {@link H3DU.getPromiseResultsAll}. If the promise
 * resolves, each item in the resulting array will be a loaded
 * {@link H3DU.Texture} object.
 */
H3DU.TextFont.prototype.loadTextures = function(textureLoader) {
  "use strict";
  var textures = [];
  for(var i = 0; i < this.pages.length; i++) {
    if(!this.pages[i])throw new Error();
    textures.push(this.pages[i]);
  }
  return textureLoader.loadTexturesAll(textures);
};

/**
 * Loads a bitmap font definition from a file.
 * Note that this method only loads the font data and not the bitmaps
 * used to represent the font.
 * @param {string} fontFileName The URL of the font data file
 * to load. The following file extensions are read as the following formats:<ul>
 * <li>".xml": XML</li>
 * <li>".json": JSON</li>
 * <li>".bin": Binary</li>
 * <li>".fnt": Text or binary</li>
 * <li>All others: Text</li></ul>
 * @returns {Promise<H3DU.TextFont>} A promise that is resolved
 * when the font data is loaded successfully (the result will be
 * an H3DU.TextFont object), and is rejected when an error occurs.
 */
H3DU.TextFont.load = function(fontFileName) {
  "use strict";
  if(/\.xml$/i.exec(fontFileName)) {
    return H3DU.loadFileFromUrl(fontFileName, "xml").then(
   function(data) {
     var ret = H3DU.TextFont._loadXmlFontInner(data);
     return ret ? Promise.resolve(ret) : Promise.reject({"url":data.url});
   });
  } else if(/\.bin$/i.exec(fontFileName)) {
    return H3DU.loadFileFromUrl(fontFileName, "arraybuffer").then(
   function(data) {
     var ret = H3DU.TextFont._loadBinaryFontInner(data);
     return ret ? Promise.resolve(ret) : Promise.reject({"url":data.url});
   });
  } else if(/\.fnt$/i.exec(fontFileName)) {
    return H3DU.loadFileFromUrl(fontFileName, "arraybuffer").then(
   function(data) {
     var view = new DataView(data.data);
     var ret = null;
     if(view.getUint8(0) === 66 && view.getUint8(1) === 77 && view.getUint8(2) === 70) {
       ret = H3DU.TextFont._loadBinaryFontInner(data);
     } else {
       view = new DataView(data.data);
       ret = H3DU.TextFont._loadTextFontInner({
         "url":data.url,
         "data":H3DU.TextFont._decodeUtf8(view, 0, view.byteLength)
       });
     }
     return ret ? Promise.resolve(ret) : Promise.reject({"url":data.url});
   });
  } else if(/\.json$/i.exec(fontFileName)) {
    return H3DU.loadFileFromUrl(fontFileName, "json").then(
   function(data) {
     var ret = H3DU.TextFont._loadJsonFontInner(data);
     return ret ? Promise.resolve(ret) : Promise.reject({"url":data.url});
   });
  } else {
    return H3DU.loadFileFromUrl(fontFileName).then(
   function(data) {
     var ret = H3DU.TextFont._loadTextFontInner(data);
     return ret ? Promise.resolve(ret) : Promise.reject({"url":data.url});
   });
  }
};

/** @ignore */
H3DU.TextFont._textureShader = function() {
  "use strict";
  var shader = [
    "#ifdef GL_ES",
    "#ifndef GL_FRAGMENT_PRECISION_HIGH",
    "precision mediump float;",
    "#else",
    "precision highp float;",
    "#endif",
    "#endif",
    "uniform sampler2D sampler;",
    "varying vec2 uvVar;",
    "void main() {",
    "  gl_FragColor=texture2D(sampler, uvVar);",
    "}"].join("\n");
  return shader;
};

/** @ignore */
H3DU.TextFont._textShader = function(msdf) {
  "use strict";
  var shader = [
    "#ifdef GL_OES_standard_derivatives",
    "#extension GL_OES_standard_derivatives : enable",
    "#endif",
    "#ifdef GL_ES",
    "#ifndef GL_FRAGMENT_PRECISION_HIGH",
    "precision mediump float;",
    "#else",
    "precision highp float;",
    "#endif",
    "#endif",
    "uniform vec4 md;",
    "uniform sampler2D sampler;",
    "uniform vec2 textureSize;",
    "varying vec2 uvVar;",
    "varying vec3 colorAttrVar;",
    "void main() {",
    " vec4 d=texture2D(sampler, uvVar);",
    msdf ? " float df=1.0-max(min(d.r,d.g),min(d.b,max(d.g,d.r)));" : "float df=d.a;",
    "#ifdef GL_OES_standard_derivatives", "#define SUPPORTS_DERIVATIVES", "#endif",
    "#ifdef GLSL_VERSION",
    "#if GLSL_VERSION>=300", "#define SUPPORTS_DERIVATIVES", "#endif", "#endif",
    "#ifdef SUPPORTS_DERIVATIVES",
    " float dsmooth=length(vec2(dFdx(df),dFdy(df)))*0.7;",
    " float o=smoothstep(0.5-dsmooth,0.5+dsmooth,df);",
    "#else",
    " float dsmooth=0.06;",
    " float o=smoothstep(0.5-dsmooth,0.5+dsmooth,df);",
    "#endif",
    " gl_FragColor=vec4(md.rgb,md.a*o);",
    "}"].join("\n");
  return shader;
};

// ///////////////

/**
 * A texture atlas specifies the location and size of images within a single
 * texture. It is useful when multiple different images should be drawn at
 * once without having to load multiple textures or doing multiple texture
 * binds. Instead, those images can be packed into one texture and the
 * application can draw different portions of that texture at once. The
 * texture atlas can specify where those portions are found.<p>
 * This implementation supports the ".atlas" format.<p>
 * NOTE: The constructor should not be called directly by applications.
 * Use the {@link H3DU.TextureAtlas.load} method to get an H3DU.TextureAtlas object.
 * <p>This class is considered a supplementary class to the
 * Public Domain HTML 3D Library and is not considered part of that
 * library. <p>
 * To use this class, you must include the script "extras/text.js"; the
 * class is not included in the "h3du_min.js" file which makes up
 * the HTML 3D Library. Example:<pre>
 * &lt;script type="text/javascript" src="extras/text.js">&lt;/script></pre>
 * @constructor
 * @memberof H3DU
 */
H3DU.TextureAtlas = function() {
  "use strict";
  this.sprites = {};
  this.textures = [];
  this.textureInfos = [];
};
/**
 * Makes a shape group used to display one or more sprites.
 * For the sprites to show upright, the coordinate system should have the
 * X axis pointing right and the Y axis pointing down (for example, an
 * orthographic projection where the left and top coordinates are less
 * than the right and bottom coordinates, respectively). The size of each
 * sprite will be in pixels; therefore, for best results, the coordinate system
 * should be scaled so that one unit equals one pixel.
 * @param {Array<Object>} sprites An array of objects whose keys have
 * the possibilities given below, and whose values are those
 * allowed for each key.<ul>
 * <li><code>name</code> - Name of the sprite, as listed in this texture
 * atlas.
 * <li><code>index</code> - If a sprite has multiple versions, use this index
 * parameter to distinguish them. Index can't be less than 0. If a sprite doesn't
 * have multiple versions, this value is not required.
 * <li><code>x</code> - X coordinate of the sprite.
 * <li><code>y</code> - Y coordinate of the sprite.
 * </ul>
 * @returns {H3DU.ShapeGroup} The generated group of shapes.
 */
H3DU.TextureAtlas.prototype.makeSprites = function(sprites) {
  "use strict";
  var meshes = [];
  for(var i = 0; i < sprites.length; i++) {
    if(!sprites[i])throw new Error();
    this._makeSprite(sprites[i].name, sprites[i].index, sprites[i].x, sprites[i].y, meshes);
  }
  var shader = new H3DU.ShaderInfo(null, H3DU.TextFont._textureShader());
  var group = new H3DU.ShapeGroup();
  for(i = 0; i < meshes.length; i++) {
    var mfp = meshes[i];
    if(!mfp)continue;
    var sh = new H3DU.Shape(mfp);
    var material = new H3DU.Material().setParams({
      "texture":this.textures[i],
      "shader":shader
    });
    sh.setMaterial(material);
    group.addShape(sh);
  }
  return group;
};
/** @ignore */
H3DU.TextureAtlas.prototype._makeSprite = function(name, index, x, y, meshesForPage) {
  "use strict";
  var sprite = null;
  if(typeof name === "undefined" || name === null)return;
  if(Object.prototype.hasOwnProperty.call(this.sprites, name)) {
    sprite = this.sprites[name];
    if(sprite instanceof Array) {
      if(index >= 0 && (typeof index !== "undefined" && index !== null)) {
        sprite = sprite[index] || null;
      } else {
        sprite = null;
      }
    }
  }
  if(!sprite)return;
  var recipWidth = 1.0 / sprite.info.size[0];
  var recipHeight = 1.0 / sprite.info.size[1];
  var sx = sprite.xy[0] * recipWidth;
  var sy = sprite.xy[1] * recipHeight;
  var sx2 = (sprite.xy[0] + sprite.size[0]) * recipWidth;
  var sy2 = (sprite.xy[1] + sprite.size[1]) * recipHeight;
  var vx = x + sprite.offset[0];
  var vy = y + sprite.offset[1];
  var vx2 = vx + sprite.size[0];
  var vy2 = vy + sprite.size[1];
  if(sprite.size[0] > 0 && sprite.size[1] > 0) {
    var chMesh = meshesForPage[sprite.info.index];
    if(!chMesh) {
      chMesh = new H3DU.Mesh();
      meshesForPage[sprite.info.index] = chMesh;
    }
    chMesh.mode(H3DU.Mesh.TRIANGLE_STRIP)
     .texCoord2(sx, 1 - sy)
     .vertex2(vx, vy)
     .texCoord2(sx, 1 - sy2)
     .vertex2(vx, vy2)
     .texCoord2(sx2, 1 - sy)
     .vertex2(vx2, vy)
     .texCoord2(sx2, 1 - sy2)
     .vertex2(vx2, vy2);
  }
};
/** @ignore */
H3DU.TextureAtlas._checkSprite = function(sprite) {
  "use strict";
  if(!sprite)return false;
  // Location of the sprite in the texture
  if(typeof sprite.xy === "undefined" || sprite.xy === null)return false;
  // Size of the sprite in the texture
  if(typeof sprite.size === "undefined" || sprite.size === null)return false;
  // Original size of the sprite (before being truncated)
  if(typeof sprite.orig === "undefined" || sprite.orig === null)return false;
  // Offset of the top left corner of the sprite relative to the original
  // location (may be other than "0,0" if the sprite was truncated)
  if(typeof sprite.offset === "undefined" || sprite.offset === null)return false;
  if(typeof sprite.rotate === "undefined" || sprite.rotate === null)return false;
  if(sprite.rotate !== "false") {
    throw new Error("rotate value not supported: " + sprite.rotate);
  }
  return true;
};
/** @ignore */
H3DU.TextureAtlas._loadText = function(data) {
  "use strict";
  var text = data.data;
  var lines = text.split(/\r?\n/);
  var textureInfo = null;
  var state = 0;
  var e = null;
  var sprites = [];
  var spriteHash = {};
  var textureInfos = [];
  var currentSprite = null;
  for(var i = 0; i < lines.length; i++) {
    switch(state) {
    case 0: // File name
      if((/^\s*$/).test(lines[i]))break;
      if((/^\s+/).test(lines[i]))return null;
      textureInfo = {
        "name":lines[i].replace(/\s+$/, ""),
        "index":textureInfos.length
      };
      textureInfos.push(textureInfo);
      state = 1;
      break;
    case 1: // Texture info
      e = (/^(\w+)\s*\:\s*(.*)/).exec(lines[i]);
      if(e) {
        var value = e[2].replace(/\s+$/, "");
        if(e[1] === "size") {
          var e1split = value.split(/\s*,\s*/);
          if(e1split.length !== 2)return null;
          if(!(/^-?\d+$/).test(e1split[0]) ||
             !(/^-?\d+$/).test(e1split[1]))return null;
          e1split[0] = parseInt(e1split[0], 10);
          e1split[1] = parseInt(e1split[1], 10);
          textureInfo[e[1]] = e1split;
        } else if(e[1] === "filter") {
          e1split = value.split(/\s*,\s*/);
          if(e1split.length !== 2)return null;
          textureInfo[e[1]] = e1split;
        } else if(e[1] === "format" || e[1] === "repeat") {
          textureInfo[e[1]] = value;
          if(e[1] === "repeat" && value !== "none") {
            throw new Error("repeat value not supported: " + value);
          }
        } else {
          return null;
        }
        break;
      }
      e = (/^([^\:\s]+)\s*$/).exec(lines[i]);
      if(e) { // Sprite name
        state = 2;
        currentSprite = {
          "name":e[1].replace(/\s+$/, ""),
          "info":textureInfo
        };
        break;
      }
      e = (/^\s*$/).exec(lines[i]);
      if(e) {
        currentSprite = null;
        state = 0;
        break;
      }
      return null;
    case 2: // Sprite info
      e = (/^([^\:\s]+)\s*$/).exec(lines[i]);
      if(e) {
        if(!H3DU.TextureAtlas._checkSprite(currentSprite))
          return null;
        sprites.push(currentSprite);
        currentSprite = {
          "name":e[1].replace(/\s+$/, ""),
          "info":textureInfo
        };
        break;
      }
      e = (/^\s+(\w+)\s*\:\s*(.*)/).exec(lines[i]);
      if(e) {
        value = e[2].replace(/\s+$/, "");
        if(e[1] === "size" || e[1] === "orig" || e[1] === "xy" || e[1] === "offset") {
          e1split = value.split(/\s*,\s*/);
          if(e1split.length === 1 && e[1] === "orig") {
            e1split = value.split(/\s*x\s*/);
          }
          if(e1split.length !== 2)return null;
          if(!(/^-?\d+$/).test(e1split[0]) ||
             !(/^-?\d+$/).test(e1split[1]))return null;
          e1split[0] = parseInt(e1split[0], 10);
          e1split[1] = parseInt(e1split[1], 10);
          currentSprite[e[1]] = e1split;
        } else if(e[1] === "split" || e[1] === "pad") {
          e1split = value.split(/\s*,\s*/);
          if(e1split.length !== 4)return null;
          var e1data = [];
          for(var j = 0; j < e1split.length; j++) {
            if(!(/^-?\d+$/).test(e1split[j]))return null;
            e1data[j] = parseInt(e1split[j], 10);
          }
          currentSprite[e[1]] = e1data;
        } else if(e[1] === "index") {
          if(!(/^-?\d+$/).test(value))return null;
          currentSprite[e[1]] = parseInt(value, 10);
        } else if(e[1] === "rotate") {
          currentSprite[e[1]] = value;
        } else {
          return null;
        }
        break;
      }
      e = (/^\s*$/).exec(lines[i]);
      if(e) {
        if(!H3DU.TextureAtlas._checkSprite(currentSprite))
          return null;
        sprites.push(currentSprite);
        currentSprite = null;
        state = 0;
        break;
      }
      return null;
    default:
      return null;
    }
  }
  if(currentSprite) {
    if(!H3DU.TextureAtlas._checkSprite(currentSprite))
      return null;
    sprites.push(currentSprite);
  }
  spriteHash = {};
  var ret = new H3DU.TextureAtlas();
  for(i = 0; i < sprites.length; i++) {
    var si = sprites[i];
    var index = si.index === null ? -1 : si.index;
    if(typeof spriteHash[si.name] === "undefined" || spriteHash[si.name] === null) {
      if(index >= 0) {
        spriteHash[si.name] = [];
        spriteHash[si.name][index] = si;
      } else {
        spriteHash[si.name] = si;
      }
    } else if(index >= 0) {
      if(!(spriteHash[si.name] instanceof Array))
        return null;
      spriteHash[si.name][index] = si;
    } else {
        // Sprite with that name is already defined
      return null;
    }
  }
  ret.pages = [];
  for(i = 0; i < textureInfos.length; i++) {
    ret.pages.push(textureInfos[i].name);
  }
  ret.sprites = spriteHash;
  ret.textureInfos = textureInfos;
  return ret;
};
/**
 * Loads the texture files used by this texture atlas.
 * @param {H3DU.TextureLoader} textureLoader Texture loader object to use when
 * loading the textures.
 * @returns {Promise<Array<H3DU.Texture>>} A promise as described in
 * {@link H3DU.getPromiseResultsAll}. If the promise
 * resolves, each item in the resulting array will be a loaded
 * {@link H3DU.Texture} object.
 */
H3DU.TextureAtlas.prototype.loadTextures = function(textureLoader) {
  "use strict";
  var textures = [];
  for(var i = 0; i < this.pages.length; i++) {
    if(!this.pages[i])throw new Error();
    textures.push(this.pages[i]);
  }
  var that = this;
  return textureLoader.loadTexturesAll(textures).then(function(r) {
    for(var i = 0; i < r.length; i++) {
      if(typeof that.textureInfos[i].size === "undefined" || that.textureInfos[i].size === null) {
        that.textureInfos[i].size = [r[i].getWidth(), r[i].getHeight()];
      }
    }
    return Promise.resolve(r);
  });
};
/**
 * Loads a texture atlas definition from a file along with the textures
 * it uses.
 * @param {string} atlasFileName The URL of the texture atlas to load.
 * @param {H3DU.TextureLoader} textureLoader Texture loader object to use when
 * loading the textures.
 * @returns {Promise} A promise that is resolved
 * when the texture atlas data and textures are loaded successfully,
 * and is rejected when an error occurs.
 * If the promise is resolved, the result will be an object with the
 * following keys:<ul>
 * <li><code>url</code> - The URL of the texture atlas data file.
 * <li><code>atlas</code> - The texture atlas data in the form of an {@link H3DU.TextureAtlas} object.
 * <li><code>textures</code> - An array of {@link H3DU.Texture} objects used by the font,
 * in the order in which they are declared in the font data file.
 * </ul>
 */
H3DU.TextureAtlas.loadWithTextures = function(atlasFileName, textureLoader) {
  "use strict";
  if(!textureLoader) {
    throw new Error();
  }
  return H3DU.TextureAtlas.load(atlasFileName).then(function(atlas) {
    return atlas.loadTextures(textureLoader).then(function(r) {
      return Promise.resolve({
        "url":atlas.fileUrl,
        "atlas":atlas,
        "textures":r
      });
    }, function(r) {
      return Promise.reject({
        "url":atlas.fileUrl,
        "results":r
      });
    });
  });
};
/**
 * Loads a texture atlas definition from a file.
 * Note that this method only loads the texture atlas data and not the bitmaps
 * used by the texture atlas.
 * @param {string} atlasFileName The URL of the texture atlas to load.
 * @returns {Promise<H3DU.TextureAtlas>} A promise that is resolved
 * when the texture atlas data is loaded successfully (the result will be
 * an H3DU.TextureAtlas object), and is rejected when an error occurs.
 */
H3DU.TextureAtlas.load = function(atlasFileName) {
  "use strict";
  return H3DU.loadFileFromUrl(atlasFileName, "arraybuffer").then(
   function(data) {
     var view = new DataView(data.data);
     var ret = H3DU.TextureAtlas._loadText({
       "url":data.url,
       "data":H3DU.TextFont._decodeUtf8(view, 0, view.byteLength)
     });
     if(!ret)return Promise.reject({"url":data.url});
     for(var i = 0; i < ret.textures.length; i++) {
       var p = ret.textures[i];
       ret.textures[i] = H3DU.TextFont._resolvePath(data.url, p);
     }
     ret.fileUrl = data.url;
     return Promise.resolve(ret);
   });
};
