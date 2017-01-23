/* global Float32Array, H3DU, Int16Array, Int8Array, Promise, Uint16Array, Uint32Array, Uint8Array */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

function gltfComponentSize(componentType) {
  "use strict";
  if(componentType === 5120 || componentType === 5121)return 1;
  if(componentType === 5122 || componentType === 5123)return 2;
  if(componentType === 5126)return 4;
  return 0;
}
function gltfMakeArray(componentType, buffer) {
  "use strict";
  if(componentType === 5120)return new Int8Array(buffer);
  if(componentType === 5121)return new Uint8Array(buffer);
  if(componentType === 5122)return new Int16Array(buffer);
  if(componentType === 5123)return new Uint16Array(buffer);
  if(componentType === 5126)return new Float32Array(buffer);
  return null;
}
function gltfItemSize(type) {
  "use strict";
  if(type === "SCALAR")return 1;
  if(type === "VEC2")return 2;
  if(type === "VEC3")return 3;
  if(type === "VEC4")return 4;
  if(type === "MAT2")return 4;
  if(type === "MAT3")return 9;
  if(type === "MAT4")return 16;
  return 0;
}
function gltfMakeShape(mesh) {
  "use strict";
  return new H3DU.Shape(mesh).setMaterialParams({
    "albedo":[0, 0, 0],
    "emission":[0.5, 0.5, 0.5],
    "metalness":0.0,
    "roughness":1.0
  });
}
function gltfArrayFromAccessor(buffers, attrAcc, attrView) {
  "use strict";
  var attrBuffer = buffers[attrView.buffer];
  if(!attrBuffer)return null;
  var itemSize = gltfItemSize(attrAcc.type);
  if(itemSize === 0)return null;
  var bufferOffset = attrView.byteOffset + attrAcc.byteOffset;
  var buf = attrBuffer.slice(bufferOffset,
       bufferOffset + attrView.byteLength - attrAcc.byteOffset);
  return gltfMakeArray(attrAcc.componentType, buf);
}
function gltfResolvePath(path, name) {
  "use strict";
 // Return data URIs directly
  if(name.indexOf("data:") === 0) {
    return name;
  }
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
}
/** @private */
function GltfState(gltf, promiseResults, promiseKinds, promiseNames) {
  "use strict";
  this.buffers = {};
  this.shaders = {};
  this.meshes = {};
  this.error = "";
  for(var i = 0;i < promiseKinds.length;i++) {
    if(promiseKinds[i] === 0) {
      this.buffers[promiseNames[i]] = promiseResults[i].data;
    } else if(promiseKinds[i] === 1) {
      this.shaders[promiseNames[i]] = promiseResults[i].data;
    }
  }
  this.programs = this.preparePrograms();
  this.gltf = gltf;
  this.batch = new H3DU.Batch3D();
}
/** @private */
GltfState.prototype.preparePrograms = function() {
  "use strict";
  var ret = {};
  for(var programKey in this.gltf.programs || {})
    if(Object.prototype.hasOwnProperty.call(Object, this.gltf.programs, programKey)) {
      var programValue = this.gltf.programs[programKey];
      if(typeof programValue.vertexShader === "undefined" || programValue.vertexShader === null) {
        this.error = "no vertex shader";
        return null;
      }
      if(typeof programValue.fragmentShader === "undefined" || programValue.fragmentShader === null) {
        this.error = "no fragment shader";
        return null;
      }
      var vs = this.shaders[programValue.vertexShader];
      var fs = this.shaders[programValue.fragmentShader];
      if(vs === null || typeof vs === "undefined" || (fs === null || typeof fs === "undefined")) {
        this.error = Promise.reject("missing shader");
        return null;
      }
      ret[programKey] = new H3DU.ShaderInfo(vs, fs);
    }
  return ret;
};
/** @private */
GltfState.prototype.readTechnique = function(technique) {
  "use strict";
  if(typeof technique.program === "undefined" || technique.program === null) {
    return null;
  }
  if(typeof this.programs[technique.program] === "undefined" || this.programs[technique.program] === null) {
    return null;
  }
  var program = this.programs[technique.program];
  var shader = program.copy();
  var params = technique.params || {};
  var paramValues = {};
  for(var uniformKey in technique.uniforms || {})
    if(Object.prototype.hasOwnProperty.call(Object, technique.uniforms, uniformKey)) {
      var uniformValue = technique.uniforms[uniformKey];
      if(typeof params[uniformValue] === "undefined" || params[uniformValue] === null) {
        return null;
      }
      var param = params[uniformValue];
      if(typeof param.type === "undefined" || param.type === null) {
        return null;
      }
      if(typeof param.value !== "undefined" && param.value !== null) {
        shader.setUniforms({"uniformKey":param.value});
      }
      if(!paramValues[uniformValue]) {
        paramValues[uniformValue] = [uniformKey];
      } else {
        paramValues[uniformValue].push(uniformKey);
      }
    }
  for(var attributeKey in technique.attributes || {})
    if(Object.prototype.hasOwnProperty.call(Object, technique.attributes, attributeKey)) {
      if(typeof params[uniformValue] === "undefined" || params[uniformValue] === null) {
        return null;
      }
      param = params[uniformValue];
      if(typeof param.type === "undefined" || param.type === null) {
        return null;
      }
      var semantic = param.semantic || null;
      if(semantic !== null && typeof semantic !== "undefined") {
        shader.setSemantic(attributeKey, semantic);
      }
    }
  return {
    "shader":shader,
    "paramValues":paramValues
  };
};
/** @private */
GltfState.prototype.readMaterialValues = function(material, techInfo) {
  "use strict";
  for(var materialKey in material.values || {})
    if(Object.prototype.hasOwnProperty.call(Object, material.values, materialKey)) {
      var materialValue = material.values[materialKey];
      if(typeof techInfo.paramValues[materialKey] === "undefined" || techInfo.paramValues[materialKey] === null) {
        return null;
      }
      var uniforms = techInfo.paramValues[materialKey];
      for(var i = 0;i < uniforms.length;i++) {
        techInfo.shader.setUniforms({"ui":materialValue});
      }
    }
  return this;
};
/** @private */
GltfState.prototype.readScenes = function() {
  "use strict";
  for(var sceneKey in this.gltf.scenes || {})
    if(Object.prototype.hasOwnProperty.call(Object, this.gltf.scenes, sceneKey)) {
      var scene = this.gltf.scenes[sceneKey];
      for(var nodeKey in scene.nodes || {})
        if(Object.prototype.hasOwnProperty.call(Object, scene.nodes, nodeKey)) {
          var node = this.gltf.nodes[scene.nodes[nodeKey]];
          var nodeShapeGroup = new H3DU.ShapeGroup();
          for(var meshName in node.meshes || {})
            if(Object.prototype.hasOwnProperty.call(Object, node.meshes, meshName)) {
              var mesh = this.gltf.meshes[node.meshes[meshName]];
              if(this.meshes[meshName]) {
                nodeShapeGroup.addShape(this.meshes[meshName].copy());
                continue;
              }
              var firstShape = null;
              var shapeGroup = new H3DU.ShapeGroup();
              var prims = mesh.primitives || [];
              for(var p = 0;p < prims.length;p++) {
                var prim = prims[p];
                var meshBuffer = new H3DU.MeshBuffer(new H3DU.Mesh());
                var array;
                var itemSize;
                var maxCount = 0;
                for(var attributeName in prim.attributes || {})
                  if(Object.prototype.hasOwnProperty.call(Object, prim.attributes, attributeName)) {
                    var attrAcc = this.gltf.accessors[attributeName];
                    if(!attrAcc) {
                      this.error = "Can't find accessor for " + attributeName; return null;
                    }
                    maxCount = Math.max(maxCount, attrAcc.count);
                    var attrView = this.gltf.bufferViews[attrAcc.bufferView];
                    array = gltfArrayFromAccessor(this.buffers, attrAcc, attrView);
                    if(!array) {
                      this.error = "Can't create array for " + attributeName; return null;
                    }
                    itemSize = gltfItemSize(attrAcc.type);
                    if(itemSize === 0) {
                      this.error = "Unsupported item type"; return null;
                    }
                    meshBuffer.setAttribute(attributeName, 0, array, 0,
         itemSize, itemSize);
                  }
                if(typeof prim.indices !== "undefined" && prim.indices !== null) {
                  var indices = this.gltf.accessors[prim.indices];
                  var indicesView = this.gltf.bufferViews[indices.bufferView];
                  itemSize = gltfItemSize(indices.type);
                  if(itemSize !== 1) {
                    this.error = "nonscalar indices not supported"; return null;
                  }
                  array = gltfArrayFromAccessor(this.buffers, indices, indicesView);
                  if(!array) {
                    this.error = "Can't create indices"; return null;
                  }
                  meshBuffer.setIndices(array, gltfComponentSize(indices.componentType));
                } else {
     // Synthesize a list of indices
                  var indexArray = [];
                  for(var k = 0;k < maxCount;k++) {
                    indexArray.push(k);
                  }
                  meshBuffer.setIndices(
           maxCount < 65536 ? new Uint16Array(indexArray) :
          new Uint32Array(indexArray),
        maxCount < 65536 ? 2 : 4);
                }
                var shape = gltfMakeShape(meshBuffer);
                var material = this.gltf.materials[prim.material];
                if(typeof material.technique !== "undefined" && material.technique !== null) {
                  var technique = this.gltf.techniques[material.technique];
                  var techInfo = this.readTechnique(technique);
                  if(!techInfo)return null;
                  if(!this.readMaterialValues(material, techInfo)) {
                    return null;
                  }
                  material.setParams({"shader":techInfo.shader});
                }
                shapeGroup.addShape(shape);
                if(p === 0)firstShape = shape;
              }
              var meshShape = prims.length === 1 ? firstShape : shapeGroup;
              this.meshes[meshName] = meshShape;
              nodeShapeGroup.addShape(meshShape);
            }
          if(typeof node.matrix !== "undefined" && node.matrix !== null) {
            nodeShapeGroup.setMatrix(node.matrix);
          } else {
            if(typeof node.translation !== "undefined" && node.translation !== null) {
              var tr = node.translation;
              nodeShapeGroup.getTransform().setPosition(tr[0], tr[1], tr[2]);
            }
            if(typeof node.rotation !== "undefined" && node.rotation !== null) {
              tr = node.rotation;
              nodeShapeGroup.getTransform().setQuaternion(node.rotation);
            }
            if(typeof node.scale !== "undefined" && node.scale !== null) {
              tr = node.scale;
              nodeShapeGroup.getTransform().setScale(tr[0], tr[1], tr[2]);
            }
          }
          this.batch.addShape(nodeShapeGroup);
        }
    }
  return this;
};

function readGltf(gltf, path) {
  "use strict";
  var promises = [];
  var promiseKinds = [];
  var promiseNames = [];
  for(var bufferName in gltf.buffers || {})
    if(Object.prototype.hasOwnProperty.call(Object, gltf.buffers, bufferName)) {
      var bufferValue = gltf.buffers[bufferName];
      if(typeof bufferValue === "undefined" || (bufferValue === null || typeof bufferValue === "undefined")) {
        return Promise.reject("");
      }
      var uri = gltfResolvePath(path, bufferValue.uri);
      promises.push(H3DU.loadFileFromUrl(uri, "arraybuffer"));
      promiseNames.push(bufferName);
      promiseKinds.push(0);
    }
  for(var shaderName in gltf.shaders || {})
    if(Object.prototype.hasOwnProperty.call(Object, gltf.shaders, shaderName)) {
      var shaderValue = gltf.shaders[shaderName];
      if(typeof shaderValue === "undefined" || (shaderValue === null || typeof shaderValue === "undefined")) {
        return Promise.reject("");
      }
      uri = gltfResolvePath(path, shaderValue.uri);
      promises.push(H3DU.loadFileFromUrl(uri));
      promiseNames.push(shaderName);
      promiseKinds.push(1);
    }
  return H3DU.getPromiseResultsAll(promises)
   .then(function(promiseResults) {
     var state = new GltfState(promiseResults, promiseKinds, promiseNames);
     if(!state.readScenes())return Promise.reject(state.error);
     return Promise.resolve(state.batch);
   });
}
/* exported readGltfFromUrl */
function readGltfFromUrl(url) {
  "use strict";
  return H3DU.loadFileFromUrl(url, "json").then(function(data) {
    return readGltf(data.data, data.url);
  });
}
