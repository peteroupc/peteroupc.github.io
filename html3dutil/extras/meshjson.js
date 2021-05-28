/*
 Any copyright to this file is released to the Public Domain.
In case this is not possible, this work is also
licensed under Creative Commons Zero (CC0):
https://creativecommons.org/publicdomain/zero/1.0/

*/
/* global H3DU, JSON, Promise */
/**
 * JSON exporter of graphics meshes.
 * <p>This class is considered a supplementary class to the
 * Public Domain HTML 3D Library and is not considered part of that
 * library. <p>
 * To use this class, you must include the script "extras/meshjson.js"; the
 * class is not included in the "h3du_min.js" file which makes up
 * the HTML 3D Library. Example:<pre>
 * &lt;script type="text/javascript" src="extras/meshjson.js">&lt;/script></pre>
 * @constructor
 */
H3DU.MeshJSON = {};

/** @ignore */
H3DU.MeshJSON._resolvePath = function(path, name) {
  "use strict";
  // Relatively dumb for a relative path
  // resolver, but sufficient here, as it will
  // only be used with relative path
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
/** @ignore */
H3DU.MeshJSON._toArray = function(a) {
  "use strict";
  var arr = [];
  for(var vIndex = 0; vIndex < a.length; vIndex++) {
    var v = a[vIndex];
    arr.push(v);
  }
  return arr;
};
/**
 * Converts a mesh to JSON format.
 * @param {H3DU.Mesh|H3DU.MeshBuffer} mesh A mesh object or mesh buffer object, as used
 * in the Public Domain HTML 3D Library.
 * @returns {string} A JSON string describing the mesh.
 */
H3DU.MeshJSON.toJSON = function(mesh) {
  "use strict";
  var json = {
    "metadata":{"formatVersion":3.1},
    "materials":[{
      "DbgColor":0xffffff,
      "DbgIndex":0,
      "DbgName":"Untitled",
      "colorDiffuse":[1, 1, 1],
      "colorAmbient":[1, 1, 1],
      "colorSpecular":[1, 1, 1],
      "specularCoef":5
    }]
  };
  if(mesh instanceof H3DU.Mesh) {
    mesh = mesh.toMeshBuffer();
  }
  var pos = mesh.getAttribute("POSITION_0");
  var norm = mesh.getAttribute("NORMAL_0");
  var cols = mesh.getAttribute("COLOR_0");
  var tc = mesh.getAttribute("TEXCOORD_0");
  var posBuffer = typeof pos !== "undefined" && pos !== null ? pos.buffer : [];
  json.vertices = H3DU.MeshJSON._toArray(posBuffer);
  json.indices = H3DU.MeshJSON._toArray(mesh.getIndices());
  if(typeof norm !== "undefined" && norm !== null) {
    json.normals = H3DU.MeshJSON._toArray(norm.buffer);
  }
  if(typeof cols !== "undefined" && cols !== null) {
    json.colors = H3DU.MeshJSON._toArray(cols.buffer);
  }
  if(typeof tc !== "undefined" && tc !== null) {
    json.uvs = [H3DU.MeshJSON._toArray(tc.buffer)];
  } else {
    json.uvs = [[]];
  }
  return JSON.stringify(json);
};
/** @ignore */
H3DU.MeshJSON._checkPath = function(path, file) {
  "use strict";
  if((/(?![\/\\])([^\:\?\#\t\r\n]+)/).test(file)) {
    return H3DU.MeshJSON._resolvePath(path, file);
  } else {
    return null;
  }
};
/** @ignore */
H3DU.MeshJSON._getJsonMaterial = function(mtl, path) {
  "use strict";
  var shininess = 1.0;
  var ambient = null;
  var diffuse = null;
  var specular = null;
  var emission = null;
  var textureName = null;
  var specularName = null;
  var normalName = null;
  if(Object.prototype.hasOwnProperty.call(mtl, "specularCoef")) {
    shininess = mtl.specularCoef;
  }
  if(Object.prototype.hasOwnProperty.call(mtl, "colorDiffuse")) {
    diffuse = mtl.colorDiffuse;
  }
  if(Object.prototype.hasOwnProperty.call(mtl, "colorAmbient")) {
    ambient = mtl.colorAmbient;
  }
  if(Object.prototype.hasOwnProperty.call(mtl, "mapDiffuse")) {
    textureName = H3DU.MeshJSON._checkPath(path, mtl.mapDiffuse);
  }
  if(Object.prototype.hasOwnProperty.call(mtl, "mapSpecular")) {
    specularName = H3DU.MeshJSON._checkPath(path, mtl.mapSpecular);
  }
  if(Object.prototype.hasOwnProperty.call(mtl, "mapNormal")) {
    normalName = H3DU.MeshJSON._checkPath(path, mtl.mapNormal);
  }
  if(Object.prototype.hasOwnProperty.call(mtl, "colorEmissive")) {
    var ke = mtl.colorEmissive;
    if(ke.length === 1) {
      emission = [ke, ke, ke];
    } else {
      emission = ke;
    }
  }
  if(Object.prototype.hasOwnProperty.call(mtl, "colorSpecular")) {
    specular = mtl.colorSpecular;
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
/** @ignore */
H3DU.MeshJSON._Model = function(mesh) {
  "use strict";
  this.meshes = [mesh];
  this.materials = [null];
  this.toShape = function() {
    var group = new H3DU.ShapeGroup();
    for(var i = 0; i < this.meshes.length; i++) {
      var shape = new H3DU.Shape(this.meshes[i]);
      if(this.materials[i])shape.setMaterial(this.materials[i]);
      group.addShape(shape);
    }
    return group;
  };
  this._setMeshes = function(meshes, materials) {
    for(var i = 0; i < meshes.length; i++) {
      this.meshes[i] = meshes[i];
      this.materials[i] = materials[i];
    }
    return this;
  };
};
/**
 * Loads a mesh from JSON format.
 * @param {string} url URL to a JSON mesh object, as used
 * in the Public Domain HTML 3D Library.
 * @returns {Promise} A promise that, when resolved, exposes an object
 * that implements a property named <code>toShape</code>, which is
 * a method that gets a {@link H3DU.ShapeGroup} describing the 3D mesh.
 */
H3DU.MeshJSON.loadJSON = function(url) {
  "use strict";
  function convHexColor(c) {
    if(typeof c === "number") {
      return [(c >> 16 & 0xFF) / 255.0,
        (c >> 8 & 0xFF) / 255.0,
        (c & 0xFF) / 255.0];
    }
    return H3DU.getGLColor(c);
  }
  return H3DU.loadFileFromUrl(url, "json").then(function(f) {
    var json = f.data;
    var i, ret;
    if(!json.vertices)return Promise.reject(new Error("invalid JSON: no verts"));
    if(json.indices) {
      var mb = new H3DU.MeshBuffer();
      mb.setIndices(json.indices);
      mb.setAttribute("POSITION", json.vertices, 3);
      if(typeof json.normals !== "undefined" && json.normals !== null) {
        mb.setAttribute("NORMAL", json.normals, 3);
      }
      return new H3DU.MeshJSON._Model(mb);
    } else if(json.faces) {
      var meshes = [];
      var materials = [];
      if(json.materials && json.materials.length > 0) {
        for(i = 0; i < json.materials.length; i++) {
          materials.push(H3DU.MeshJSON._getJsonMaterial(f.url, json.materials[i]));
          meshes[i] = new H3DU.Mesh().mode(H3DU.Mesh.TRIANGLES);
        }
      } else {
        meshes[0] = new H3DU.Mesh().mode(H3DU.Mesh.TRIANGLES);
        materials[0] = null;
      }
      var quadIndices = [0, 1, 3, 2, 3, 1];
      for(i = 0; i < json.faces.length;) {
        var flags = json.faces[i++];
        var size = (flags & 0x01) !== 0 ? 4 : 3;
        var vertPtr = i;
        var texcoord = -1;
        var normals = -1;
        var vnormals = -1;
        var colors = -1;
        var vcolors = -1;
        var material = -1;
        i += size;
        var mesh = meshes[0];
        if((flags & 0x02) !== 0) {
          material = json.faces[i];
          mesh = meshes[material];
          i++;
        }
        if((flags & 0x04) !== 0) {
          i++;
        }
        if((flags & 0x08) !== 0) {
          texcoord = i; i += size;
        }
        if((flags & 0x10) !== 0) {
          normals = i; i += 1;
        }
        if((flags & 0x20) !== 0) {
          vnormals = i; i += size;
        }
        if((flags & 0x40) !== 0) {
          colors = i; i += 1;
        }
        if((flags & 0x80) !== 0) {
          vcolors = i; i += size;
        }
        if(normals >= 0) {
          mesh.normal3(json.normals[json.faces[normals] * 3],
            json.normals[json.faces[normals] * 3 + 1],
            json.normals[json.faces[normals] * 3 + 2]);
        }
        if(colors >= 0) {
          mesh.color3(convHexColor(json.colors[json.faces[colors]]));
        }
        var trisize = size === 4 ? 6 : 3;
        for(var j = 0; j < trisize; j++) {
          var idx;
          if(vnormals >= 0) {
            idx = json.faces[vnormals + (size === 4 ? quadIndices[j] : j)] * 3;
            mesh.normal3(json.normals[idx],
              json.normals[idx + 1], json.normals[idx + 2]);
          }
          if(texcoord >= 0 && material >= 0) {
            idx = json.faces[texcoord + (size === 4 ? quadIndices[j] : j)] * 2;
            mesh.texCoord2(json.uvs[material][idx],
              json.uvs[material][idx + 1]);
          }
          if(vcolors >= 0) {
            idx = json.faces[vcolors + (size === 4 ? quadIndices[j] : j)];
            mesh.color3(convHexColor(json.colors[idx]));
          }
          idx = json.faces[vertPtr + (size === 4 ? quadIndices[j] : j)] * 3;
          mesh.vertex3(json.vertices[idx],
            json.vertices[idx + 1],
            json.vertices[idx + 2]);
        }
      }
      for(i = 0; i < meshes.length; i++) {
        meshes[i] = new H3DU.MeshBuffer(meshes[i]);
      }
      ret = new H3DU.MeshJSON._Model(null)._setMeshes(meshes, materials);
      return ret;
    } else {
      return Promise.reject(new Error("invalid JSON: no indices"));
    }
  });
};

/* exported MeshJSON */
/**
 * Alias for the {@link H3DU.MeshJSON} class.
 * @constructor
 * @alias MeshJSON
 * @deprecated Use {@link H3DU.MeshJSON} instead.
 */
var MeshJSON = H3DU.MeshJSON;
