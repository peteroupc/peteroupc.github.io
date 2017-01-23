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

function readGltf(gltf, path) {
  "use strict";
  var promises = [];
  var promiseKinds = [];
  var promiseNames = [];
  if(typeof gltf.buffers !== "undefined" && gltf.buffers !== null) {
    var bufferNames = Object.keys(gltf.buffers);
    for(var i = 0;i < bufferNames.length;i++) {
      var uri = gltfResolvePath(path, gltf.buffers[bufferNames[i]].uri);
      promises.push(H3DU.loadFileFromUrl(uri, "arraybuffer"));
      promiseNames.push(bufferNames[i]);
      promiseKinds.push(0);
    }
  }
  if(typeof gltf.shaders !== "undefined" && gltf.shaders !== null) {
    var shaderNames = Object.keys(gltf.shaders);
    for(i = 0;i < shaderNames.length;i++) {
      uri = gltfResolvePath(path, gltf.shaders[shaderNames[i]].uri);
      promises.push(H3DU.loadFileFromUrl(uri));
      promiseNames.push(shaderNames[i]);
      promiseKinds.push(1);
    }
  }
  return H3DU.getPromiseResultsAll(promises)
   .then(function(promiseResults) {
     var keys;
     var buffers = {};
     var shaders = {};
     var meshes = {};
     var programs = {};
     for(var i = 0;i < promiseKinds.length;i++) {
       if(promiseKinds[i] === 0) {
         buffers[promiseNames[i]] = promiseResults[i].data;
       } else if(promiseKinds[i] === 1) {
         shaders[promiseNames[i]] = promiseResults[i].data;
       }
     }
     if(typeof gltf.programs !== "undefined" && gltf.programs !== null) {
       if(gltf.programs.length > 0 && ((typeof gltf.shaders === "undefined" || gltf.shaders === null))) {
         return Promise.reject("have programs but no shaders");
       }
       keys = Object.keys(gltf.programs);
       for(i = 0;i < gltf.programs.length;i++) {
         if(typeof programs.vertexShader === "undefined" || programs.vertexShader === null) {
           return Promise.reject("no vertex shader");
         }
         if(typeof programs.fragmentShader === "undefined" || programs.fragmentShader === null) {
           return Promise.reject("no fragment shader");
         }
         var vs = shaders[programs.vertexShader];
         var fs = shaders[programs.fragmentShader];
         if(vs === null || typeof vs === "undefined" || (fs === null || typeof fs === "undefined"))return Promise.reject("missing shader");
         programs[gltf.programs[i]] = new H3DU.ShaderInfo(vs, fs);
       }
     }
     var batch = new H3DU.Batch3D();
     keys = Object.keys(gltf.scenes);
     for(i = 0;i < keys.length;i++) {
       var scene = gltf.scenes[keys[i]];
       for(var n = 0;n < scene.nodes.length;n++) {
         var node = gltf.nodes[scene.nodes[n]];
         var nodeShapeGroup = new H3DU.ShapeGroup();
         for(var m = 0;node.meshes && m < node.meshes.length;m++) {
           var meshName = node.meshes[m];
           var shapeGroup;
           if(meshes[meshName]) {
             nodeShapeGroup.addShape(meshes[meshName].copy());
             continue;
           }
           var mesh = gltf.meshes[meshName];
           var firstShape = null;
           shapeGroup = new H3DU.ShapeGroup();
           for(var p = 0;p < mesh.primitives.length;p++) {
             var prim = mesh.primitives[p];
             var meshBuffer = new H3DU.MeshBuffer(new H3DU.Mesh());
             var attr = prim.attributes || {};
             var attributeNames = Object.keys(attr);
             var array;
             var itemSize;
             var maxCount = 0;
             for(var j = 0;j < attributeNames.length;j++) {
               var attrAcc = gltf.accessors[attr[attributeNames[j]]];
               if(!attrAcc)return Promise.reject("Can't find accessor for " + attributeNames[j]);
               maxCount = Math.max(maxCount, attrAcc.count);
               var attrView = gltf.bufferViews[attrAcc.bufferView];
               array = gltfArrayFromAccessor(buffers, attrAcc, attrView);
               if(!array)return Promise.reject("Can't create array for " + attributeNames[j]);
               itemSize = gltfItemSize(attrAcc.type);
               if(itemSize === 0)return Promise.reject("Unsupported item type");
               meshBuffer.setAttribute(attributeNames[j], 0, array, 0,
         itemSize, itemSize);
             }
             if(typeof prim.indices !== "undefined" && prim.indices !== null) {
               var indices = gltf.accessors[prim.indices];
               var indicesView = gltf.bufferViews[indices.bufferView];
               itemSize = gltfItemSize(indices.type);
               if(itemSize !== 1)return Promise.reject("nonscalar indices not supported");
               array = gltfArrayFromAccessor(buffers, indices, indicesView);
               if(!array)return Promise.reject("Can't create indices");
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
             var material = gltf.materials[prim.material];
             if(typeof material.technique !== "undefined" && material.technique !== null) {
               var technique = gltf.techniques[material.technique];
               if(technique) {
                 if(typeof material.values !== "undefined" && material.values !== null) {
                 }
               }
             }
             shapeGroup.addShape(shape);
             if(p === 0)firstShape = shape;
           }
           var meshShape = mesh.primitives.length === 1 ? firstShape : shapeGroup;
           meshes[meshName] = meshShape;
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
         batch.addShape(nodeShapeGroup);
       }
     }
     return Promise.resolve(batch);
   });
}
/* exported readGltfFromUrl */
function readGltfFromUrl(url) {
  "use strict";
  return H3DU.loadFileFromUrl(url, "json").then(function(data) {
    return readGltf(data.data, data.url);
  });
}
