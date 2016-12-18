/*
Written by Peter O. in 2015.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://peteroupc.github.io/
*/
/* global H3DU, Promise */
/**
OBJ file.<p>
* <p>This class is considered a supplementary class to the
* Public Domain HTML 3D Library and is not considered part of that
* library. <p>
* To use this class, you must include the script "extras/objmtl.js"; the
 * class is not included in the "h3du_min.js" file which makes up
 * the HTML 3D Library.  Example:<pre>
 * &lt;script type="text/javascript" src="extras/objmtl.js">&lt;/script></pre>
@class */
function ObjData() {
  /** URL of the OBJ file */
  "use strict";
  this.url = null;
  /** An array of meshes.  Two or more meshes may have
the same name (the "name" property in each mesh).  The "data"
property holds data for each mesh. */
  this.mtllib = null;
  this.mtl = null;
  this.meshes = [];
}
function MtlData() {
  "use strict";
  this.url = null;
  this.list = [];
}
/**
 * Creates one or more 3D shapes from the data
 * in this OBJ file.
 * @returns {H3DU.ShapeGroup} Group of shapes.
 * @memberof! ObjData#
*/
ObjData.prototype.toShape = function() {
  "use strict";
  var multi = new H3DU.ShapeGroup();
  for(var i = 0;i < this.meshes.length;i++) {
    var shape = new H3DU.Shape(this.meshes[i].data);
    var mat = this._getMaterial(this.meshes[i]);
    shape.setMaterial(mat);
    multi.addShape(shape);
  }
  return multi;
};
/** @private */
ObjData.prototype._gatherTextureNames = function() {
  "use strict";
  var textures = [];
  if(this.mtl) {
    for(var i = 0;i < this.mtl.list.length;i++) {
      var mtl = this.mtl.list[i].data;
      if(mtl.texture) {
        textures.push(mtl.texture);
      }
    }
  }
  return textures;
};
/**
 * Creates one or more 3D shapes from the named portion
 * of the data in this OBJ file.
 * @param {String} name Name from the OBJ file of the portion
 * of the model to use.
 * @returns {H3DU.ShapeGroup} Group of shapes. The group
 * will be empty if no shapes with the given name exist.
 * @memberof! ObjData#
*/
ObjData.prototype.toShapeFromName = function(name) {
  "use strict";
  var multi = new H3DU.ShapeGroup();
  for(var i = 0;i < this.meshes.length;i++) {
    if(this.meshes[i].name !== name)continue;
    var shape = new H3DU.Shape(this.meshes[i].data);
    var mat = this._getMaterial(this.meshes[i]);
    shape.setMaterial(mat);
    multi.addShape(shape);
  }
  return multi;
};
/** @private */
ObjData._resolvePath = function(path, name) {
  "use strict";
 // Relatively dumb for a relative path
 // resolver, but sufficient here, as it will
 // only be used with relative "mtllib"/"map_Kd"
 // strings

  var ret = path;
  var lastSlash = ret.lastIndexOf("/");
  if(lastSlash >= 0) {
    ret = ret.substr(0, lastSlash + 1) + name.replace(/\\/g, "/");
  } else {
    ret = name.replace(/\\/g, "/");
  }
  return ret;
};

/** @private */
ObjData.prototype._getMaterial = function(mesh) {
  "use strict";
  if(!this.mtl || !mesh) {
    return new H3DU.Material();
  } else if(mesh.usemtl) {
    var mtl = this.mtl.getMaterial(mesh.usemtl);
    if(!mtl)return new H3DU.Material();
    return mtl;
  } else {
    return new H3DU.Material();
  }
};

/** @private */
MtlData.prototype._resolveTextures = function() {
  "use strict";
  for(var i = 0;i < this.list.length;i++) {
    var mtl = this.list[i].data;
    if(mtl.texture) {
      var resolvedName = ObjData._resolvePath(
       this.url, mtl.texture);
      this.list[i].data = mtl.copy()
       .setParams({"texture":resolvedName});
    }
  }
};
/**
 * TODO: Not documented yet.
 * @param {String} name
* @return {Object}
 * @memberof! MtlData#
*/
MtlData.prototype.getMaterial = function(name) {
  "use strict";
  for(var i = 0;i < this.list.length;i++) {
    if(this.list[i].name === name) {
      return this.list[i].data;
    }
  }
  return null;
};
/** @private */
MtlData._getMaterial = function(mtl) {
  "use strict";
  var shininess = 1.0;
  var ambient = null;
  var diffuse = null;
  var specular = null;
  var emission = null;
  var specularName = null;
  var normalName = null;
  var textureName = null;
  if(Object.prototype.hasOwnProperty.call(mtl, "Ns")) {
    shininess = mtl.Ns;
  }
  if(Object.prototype.hasOwnProperty.call(mtl, "Kd")) {
    diffuse = mtl.Kd;
  }
  if(Object.prototype.hasOwnProperty.call(mtl, "map_Kd")) {
    textureName = mtl.map_Kd;
  }
  if(Object.prototype.hasOwnProperty.call(mtl, "map_Ks")) {
    specularName = mtl.map_Ks;
  }
  if(Object.prototype.hasOwnProperty.call(mtl, "map_Bump")) {
    normalName = mtl.map_Bump;
  }
  if(Object.prototype.hasOwnProperty.call(mtl, "map_bump")) {
    normalName = mtl.map_bump;
  }
  if(Object.prototype.hasOwnProperty.call(mtl, "bump")) {
    normalName = mtl.bump;
  }
  if(Object.prototype.hasOwnProperty.call(mtl, "Ka")) {
    ambient = mtl.Ka;
  }
  if(Object.prototype.hasOwnProperty.call(mtl, "Ke")) {
    var ke = mtl.Ke;
    if(ke.length === 1) {
      emission = [ke, ke, ke];
    } else {
      emission = ke;
    }
  }
  if(Object.prototype.hasOwnProperty.call(mtl, "Ks")) {
    specular = mtl.Ks;
  }
 // NOTE: illum must be checked last
  if(Object.prototype.hasOwnProperty.call(mtl, "illum")) {
    if(mtl.illum === 0) {
      ambient = diffuse ? diffuse.slice(0, 3) : [0, 0, 0];
      diffuse = [0, 0, 0];
      specular = [0, 0, 0];
    } else if(mtl.illum === 1) {
      specular = [0, 0, 0];
    }
  }
  var ret = new H3DU.Material(ambient, diffuse, specular, shininess,
   emission);
  if(textureName) {
    ret = ret.setParams({"texture":textureName});
  }
  if(specularName) {
    ret = ret.setParams({"specularMap":specularName});
  }
  if(normalName) {
    ret = ret.setParams({"normalMap":normalName});
  }
  return ret;
};
/**
 * TODO: Not documented yet.
 * @param {String} url The URL to load the material data file from.
 */
ObjData.loadMtlFromUrl = function(url) {
  "use strict";
  return H3DU.loadFileFromUrl(url).then(
   function(e) {
     var mtl = MtlData._loadMtl(e.data);
     if(mtl.error)return Promise.reject({
       "url":e.url,
       "error": mtl.error
     });
     var mtldata = mtl.success;
     mtldata.url = e.url;
     mtldata._resolveTextures();
     return Promise.resolve(mtldata);
   },
   function(e) {
     return Promise.reject(e);
   });
};
/**
 * Loads a WaveFront OBJ file (along with its associated MTL, or
 * material file, if available), along with the textures it uses,
 * asynchronously.
 * @param {String} url The URL to load.
 * @param {TextureLoader} textureLoader An object to load
 * textures with.
 */
ObjData.loadObjFromUrlWithTextures = function(url, textureLoader) {
  "use strict";

  return ObjData.loadObjFromUrl(url).then(function(obj) {
    var o = obj;
    return textureLoader.loadTexturesAll(o._gatherTextureNames())
     .then(function() {
       return Promise.resolve(o);
     }, function(results) {
       return Promise.reject({
         "url":url,
         "textureResults":results
       });
     });
  });
};

/**
Loads a WaveFront OBJ file (along with its associated MTL, or
material file, if available) asynchronously.
@param {String} url The URL to load.
@returns {Promise} A promise that resolves when
the OBJ file is loaded successfully, whether or not its associated
MTL is also loaded successfully (the result is an ObjData object),
and is rejected when an error occurs when loading the OBJ file.
*/
ObjData.loadObjFromUrl = function(url) {
  "use strict";
  return H3DU.loadFileFromUrl(url).then(
   function(e) {
     var obj;
     obj = ObjData._loadObj(e.data);
     if(obj.error)return Promise.reject({
       "url":e.url,
       "error":obj.error
     });
     obj = obj.success;
     obj.url = e.url;
     if(obj.mtllib) {
       // load the material file if available
       var mtlURL = ObjData._resolvePath(e.url, obj.mtllib);
       return ObjData.loadMtlFromUrl(mtlURL).then(
        function(result) {
          obj.mtl = result;
          return Promise.resolve(obj);
        }, function() {
          // MTL not loaded successfully, ignore
         obj.mtl = null;
         return Promise.resolve(obj);
       });
     } else {
       // otherwise just return the object
       return Promise.resolve(obj);
     }
   },
   function(e) {
     return Promise.reject(e);
   });
};
/** @private */
MtlData._loadMtl = function(str) {
  "use strict";
  function xyzToRgb(xyz) {
  // convert CIE XYZ to RGB
    var x = xyz[0];
    var y = xyz[1];
    var z = xyz[2];
    var rgb = [2.2878384873407613 * x - 0.8333676778352163 * y - 0.4544707958714208 * z,
      -0.5116513807438615 * x + 1.4227583763217775 * y + 0.08889300175529392 * z,
      0.005720409831409596 * x - 0.01590684851040362 * y + 1.0101864083734013 * z];
  // ensure RGB value fits in 0..1
    var w = -Math.min(0, rgb[0], rgb[1], rgb[2]);
    if(w > 0) {
      rgb[0] += w; rgb[1] += w; rgb[2] += w;
    }
    w = Math.max(rgb[0], rgb[1], rgb[2]);
    if(w > 1) {
      rgb[0] /= w; rgb[1] /= w; rgb[2] /= w;
    }
    return rgb;
  }
  var number = "(-?(?:\\d+\\.?\\d*|\\d*\\.\\d+)(?:[Ee][\\+\\-]?\\d+)?)";
  var nonnegInteger = "(\\d+)";
  var oneNumLine = new RegExp("^[ \\t]*(Ns|d|Tr|Ni)\\s+" + number + "\\s*$");
  var oneIntLine = new RegExp("^[ \\t]*(illum)\\s+" + nonnegInteger + "\\s*$");
  var threeNumLine = new RegExp("^[ \\t]*(Tf)\\s+" + number + "\\s+" + number +
   "\\s+" + number + "\\s*$");
  var oneOrThreeNumLine = new RegExp("^[ \\t]*(Ke)\\s+" + number + "(?:\\s+" + number +
   "\\s+" + number + ")?\\s*$");
  var threeOrFourNumLine = new RegExp("^[ \\t]*(Kd|Ka|Ks)\\s+" + number + "\\s+" + number +
   "\\s+" + number + "(?:\\s+" + number + ")?\\s*$");
  var threeOrFourNumLineXYZ = new RegExp("^[ \\t]*(Kd|Ka|Ks)\\s+xyz\\s+" + number + "\\s+" + number +
   "\\s+" + number + "(?:\\s+" + number + ")?\\s*$");
  var mapLine = new RegExp("^[ \\t]*(map_Kd|bump|map_[Bb]ump|map_Ka|map_Ks)\\s+(.*?)\\s*$");
  var newmtlLine = new RegExp("^newmtl\\s+([^\\s]*)$");
  // var faceStart=new RegExp("^f\\s+");
  var lines = str.split(/\r?\n/);
  var firstLine = true;
  var materials = [];
  var currentMat = null;
  for(var i = 0;i < lines.length;i++) {
    var line = lines[i];
  // skip empty lines
    if(line.length === 0)continue;
  // skip comments
    if(line.charAt(0) === "#")continue;
    while(line.charAt(line.length - 1) === "\\" &&
    i + 1 < line.length) {
    // The line continues on the next line
      line = line.substr(0, line.length - 1);
      line += " " + lines[i + 1];
      i++;
    }
    if(line.charAt(line.length - 1) === "\\") {
      line = line.substr(0, line.length - 1);
    }
    if(firstLine && !/^newmtl\s+/) {
      return {"error": "newmtl not the first line in MTL file"};
    }
    firstLine = false;
    var e = newmtlLine.exec(line);
    if(e) {
      currentMat = {};
      materials.push({
        "name":e[1],
        "data": currentMat
      });
      continue;
    }
    e = threeOrFourNumLine.exec(line);
    if(e) {
      if(e[5]) {
        currentMat[e[1]] = [parseFloat(e[2]), parseFloat(e[3]), parseFloat(e[4]), parseFloat(e[5])];
      } else {
        currentMat[e[1]] = [parseFloat(e[2]), parseFloat(e[3]), parseFloat(e[4])];
      }
      continue;
    }
    e = threeOrFourNumLineXYZ.exec(line);
    if(e) {
      if(e[5]) {
        currentMat[e[1]] = xyzToRgb([parseFloat(e[2]), parseFloat(e[3]), parseFloat(e[4])]);
        currentMat[e[1]][3] = parseFloat(e[5]);
      } else {
        currentMat[e[1]] = xyzToRgb([parseFloat(e[2]), parseFloat(e[3]), parseFloat(e[4])]);
      }
      continue;
    }
    e = threeNumLine.exec(line);
    if(e) {
      currentMat[e[1]] = [parseFloat(e[2]), parseFloat(e[3]), parseFloat(e[4])];
      continue;
    }
    e = oneOrThreeNumLine.exec(line);
    if(e) {
      if(e[3]) {
        currentMat[e[1]] = [parseFloat(e[2]), parseFloat(e[3]), parseFloat(e[4])];
      } else {
        currentMat[e[1]] = [parseFloat(e[2]), parseFloat(e[2]), parseFloat(e[2])];
      }
      continue;
    }
    e = oneNumLine.exec(line);
    if(e) {
      currentMat[e[1]] = parseFloat(e[2]);
      continue;
    }
    e = mapLine.exec(line);
    if(e) {
     // only allow relative paths
      if((/^(?![\/\\])([^\:\?\#\s]+)$/).test(e[2])) {
        currentMat[e[1]] = e[2];
      }
      continue;
    }
    e = oneIntLine.exec(line);
    if(e) {
      currentMat[e[1]] = [parseInt(e[2], 10)];
      continue;
    }
    return {"error": new Error("unsupported line: " + line)};
  }
  var mtl = new MtlData();
  mtl.list = materials;
  for(i = 0;i < mtl.list.length;i++) {
    mtl.list[i].data = MtlData._getMaterial(mtl.list[i].data);
  }
  return {"success": mtl};
};
/** @private */
ObjData._refIndex = function(idxstr, arr) {
  "use strict";
  var ret = parseInt(idxstr, 10);
  ret = ret < 0 ? arr.length - ret : ret - 1;
  if(ret < 0 || ret >= arr.length)ret = 0;
  return ret;
};
/** @private */
ObjData._loadObj = function(str) {
  "use strict";
  var number = "(-?(?:\\d+\\.?\\d*|\\d*\\.\\d+)(?:[Ee][\\+\\-]?\\d+)?)";
  var signedInteger = "(-?\\d+)";
  var vertexOnly = new RegExp("^" + signedInteger + "($|\\s+)");
  var vertexNormalOnly = new RegExp("^" + signedInteger + "\\/\\/" + signedInteger + "($|\\s+)");
  var vertexUVOnly = new RegExp("^" + signedInteger + "\\/" +
   signedInteger + "($|\\s+)");
  var vertexUVNormal = new RegExp("^" + signedInteger + "\\/" + signedInteger +
   "\\/" + signedInteger + "($|\\s+)");
  var vertexLine = new RegExp("^v\\s+" + number + "\\s+" + number + "\\s+" + number + "\\s*$");
  var uvLine = new RegExp("^vt\\s+" + number + "\\s+" + number + "(\\s+" + number + ")?\\s*$");
  var smoothLine = new RegExp("^(s)\\s+(.*)$");
  var usemtlLine = new RegExp("^(usemtl|o|g)\\s+([^\\s]*)\\s*$");
  var mtllibLine = new RegExp("^(mtllib)\\s+(?![\\/\\\\])([^\\:\\?\\#\\t\\r\\n]+)\\s*$");
  var normalLine = new RegExp("^vn\\s+" + number + "\\s+" + number + "\\s+" + number + "\\s*");
  var faceStart = new RegExp("^f\\s+");
  var lineStart = new RegExp("^l\\s+");
  var pointStart = new RegExp("^p\\s+");
  var lines = str.split(/\r?\n/);
  var vertices = [];
  // var currentMesh=new H3DU.Mesh();
  var normals = [];
  var uvs = [];

  var usemtl = null;

  var ret = new ObjData();
  var lastPrimitiveSeen = -1;
  var haveNormals = false;
  var vertexKind = -1;
  var mesh = new H3DU.Mesh();
  var objName = "";
  var oldObjName = "";
  var seenFacesAfterObjName = false;
  var flat = false;
  for(var i = 0;i < lines.length;i++) {
    var line = lines[i];
  // skip empty lines
    if(line.length === 0)continue;
  // skip comments
    if(line.charAt(0) === "#")continue;
    while(line.charAt(line.length - 1) === "\\" &&
    i + 1 < line.length) {
    // The line continues on the next line
      line = line.substr(0, line.length - 1);
      line += " " + lines[i + 1];
      i++;
    }
    if(line.charAt(line.length - 1) === "\\") {
      line = line.substr(0, line.length - 1);
    }
    var e = vertexLine.exec(line);
    if(e) {
      vertices.push([parseFloat(e[1]), parseFloat(e[2]), parseFloat(e[3])]);
      continue;
    }
    e = normalLine.exec(line);
    if(e) {
      normals.push([parseFloat(e[1]), parseFloat(e[2]), parseFloat(e[3])]);
      continue;
    }
    e = uvLine.exec(line);
    if(e) {
      uvs.push([parseFloat(e[1]), parseFloat(e[2])]);
      continue;
    }
    var prim = -1;
    e = faceStart.exec(line);
    if(e) {
      prim = H3DU.Mesh.TRIANGLES;
    } else {
      e = lineStart.exec(line);
      if(e) {
        prim = H3DU.Mesh.LINES;
      } else {
        e = pointStart.exec(line);
        if(e) {
          prim = H3DU.Mesh.POINTS;
        }
      }
    }
    var vtx, uv, norm;
    if(e && prim !== -1) {
      var oldline = line;
      seenFacesAfterObjName = true;
      line = line.substr(e[0].length);
      if(lastPrimitiveSeen !== -1 && lastPrimitiveSeen !== prim &&
        mesh.vertexCount() > 0) {
        if(!haveNormals) {
         // No normals in this mesh, so calculate them
          mesh.recalcNormals(flat);
        }
        ret.meshes.push({
          "name": seenFacesAfterObjName ? objName : oldObjName,
          "usemtl": usemtl,
          "data": mesh
        });
        vertexKind = -1;
        lastPrimitiveSeen = -1;
        haveNormals = false;
        mesh = new H3DU.Mesh();
      }
      mesh.mode(prim === H3DU.Mesh.TRIANGLES ?
      H3DU.Mesh.TRIANGLE_FAN :
      prim === H3DU.Mesh.LINES ? H3DU.Mesh.LINE_STRIP : H3DU.Mesh.POINTS);
      while(line.length > 0) {
        e = vertexOnly.exec(line);
        if(e) {
          if(vertexKind !== 0 || lastPrimitiveSeen !== prim) {
            vertexKind = 0; // position only
          }
          vtx = ObjData._refIndex(e[1], vertices);
          mesh.normal3(0, 0, 0).texCoord2(0, 0)
        .vertex3(vertices[vtx][0], vertices[vtx][1], vertices[vtx][2]);
          line = line.substr(e[0].length);
          continue;
        }
        e = vertexNormalOnly.exec(line);
        if(e) {
          if(vertexKind !== 1) {
            vertexKind = 1; // position/normal
          }
          vtx = ObjData._refIndex(e[1], vertices);
          norm = ObjData._refIndex(e[2], normals);
          haveNormals = true;
          mesh.normal3(normals[norm][0], normals[norm][1],
         normals[norm][2])
        .texCoord2(0, 0)
        .vertex3(vertices[vtx][0], vertices[vtx][1], vertices[vtx][2]);
          line = line.substr(e[0].length);
          continue;
        }
        e = vertexUVOnly.exec(line);
        if(e) {
          if(vertexKind !== 2 || lastPrimitiveSeen !== prim) {
            vertexKind = 2; // position/UV
          }
          vtx = ObjData._refIndex(e[1], vertices);
          uv = ObjData._refIndex(e[2], uvs);
          mesh.normal3(0, 0, 0)
        .texCoord2(uvs[uv][0], uvs[uv][1])
        .vertex3(vertices[vtx][0], vertices[vtx][1], vertices[vtx][2]);
          line = line.substr(e[0].length);
          continue;
        }
        e = vertexUVNormal.exec(line);
        if(e) {
          if(vertexKind !== 3 || lastPrimitiveSeen !== prim) {
            vertexKind = 3; // position/UV/normal
          }
          vtx = ObjData._refIndex(e[1], vertices);
          uv = ObjData._refIndex(e[2], uvs);
          norm = ObjData._refIndex(e[3], normals);
          haveNormals = true;
          mesh.normal3(normals[norm][0], normals[norm][1],
         normals[norm][2])
        .texCoord2(uvs[uv][0], uvs[uv][1])
        .vertex3(vertices[vtx][0], vertices[vtx][1], vertices[vtx][2]);
          line = line.substr(e[0].length);
          continue;
        }
        return {"error": new Error("unsupported face: " + oldline)};
      }
      continue;
    }
    e = usemtlLine.exec(line);
    if(e) {
      if(e[1] === "usemtl") {
      // Changes the material used
        if(mesh.vertexCount() > 0) {
          if(!haveNormals) {
         // No normals in this mesh, so calculate them
            mesh.recalcNormals(flat);
          }
          ret.meshes.push({
            "name": seenFacesAfterObjName ? objName : oldObjName,
            "usemtl": usemtl,
            "data": mesh
          });
          vertexKind = -1;
          lastPrimitiveSeen = -1;
          haveNormals = false;
          mesh = new H3DU.Mesh();
        }
        usemtl = e[2];
      } else if(e[1] === "g") {
      // Starts a new group
        if(mesh.vertexCount() > 0) {
          if(!haveNormals) {
         // No normals in this mesh, so calculate them
            mesh.recalcNormals(flat);
          }
          ret.meshes.push({
            "name": seenFacesAfterObjName ? objName : oldObjName,
            "usemtl": usemtl,
            "data": mesh
          });
          vertexKind = -1;
          lastPrimitiveSeen = -1;
          haveNormals = false;
          usemtl = null;
          mesh = new H3DU.Mesh();
        }
 // meshName=e[2];
      } else if(e[1] === "o") {
        oldObjName = objName;
        objName = e[2];
        seenFacesAfterObjName = false;
      }
      continue;
    }
    e = mtllibLine.exec(line);
    if(e) {
      if(e[1] === "mtllib") {
        ret.mtllib = e[2];
      }
      continue;
    }
    e = smoothLine.exec(line);
    if(e) {
      flat = e[2] === "off";
      continue;
    }
    return {"error": new Error("unsupported line: " + line)};
  }
  if(!haveNormals) {
   // No normals in this mesh, so calculate them
    mesh.recalcNormals(flat);
  }
  ret.meshes.push({
    "name": seenFacesAfterObjName ? objName : oldObjName,
    "usemtl": usemtl,
    "data": mesh
  });
  return {"success": ret};
};
