/* global Float32Array, H3DU, Int16Array, Int32Array, Int8Array, Promise, Uint16Array, Uint32Array, Uint8Array */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

function gltfMakeArray(componentType, buffer) {
  "use strict";
  if(componentType === 5120)return new Int8Array(buffer);
  if(componentType === 5121)return new Uint8Array(buffer);
  if(componentType === 5122)return new Int16Array(buffer);
  if(componentType === 5123)return new Uint16Array(buffer);
  if(componentType === 5124)return new Int32Array(buffer);
  if(componentType === 5125)return new Uint32Array(buffer);
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
  this.nodeShapes = {};
  this.error = "";
  this.gltf = gltf;
  this.version = 0; // glTF 1.0
  this.animChannels = [];
  for(var i = 0;i < promiseKinds.length;i++) {
    if(promiseKinds[i] === 0) {
      this.buffers[promiseNames[i]] = promiseResults[i].data;
    } else if(promiseKinds[i] === 1) {
      this.shaders[promiseNames[i]] = promiseResults[i].data;
    }
  }
  this.version = "";
  if(typeof this.gltf.asset !== "undefined" && this.gltf.asset !== null) {
    if(!(typeof this.gltf.asset.version !== "undefined" && this.gltf.asset.version !== null)) {
      this.error = "No version despite appearance of asset object";
    } else if(this.gltf.asset.version === "1.1")
      this.version = 1;
  }
  this.programs = this.preparePrograms();
  this.batch = new H3DU.Batch3D();
}
/** @private */
GltfState._componentSize = function(componentType) {
  "use strict";
  if(componentType === 5120 || componentType === 5121)return 1;
  if(componentType === 5122 || componentType === 5123)return 2;
  if(componentType === 5124 || componentType === 5125)return 4;
  if(componentType === 5126)return 4;
  return 0;
};
/** @private */
GltfState.prototype.preparePrograms = function() {
  "use strict";
  var ret = {};
  for(var programKey in this.gltf.programs || {})
    if(Object.prototype.hasOwnProperty.call( this.gltf.programs, programKey)) {
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
  var params = technique.parameters || {};
  var paramValues = {};
  for(var uniformKey in technique.uniforms || {})
    if(Object.prototype.hasOwnProperty.call( technique.uniforms, uniformKey)) {
      var uniformValue = technique.uniforms[uniformKey];
      if(typeof params[uniformValue] === "undefined" || params[uniformValue] === null) {
        return null;
      }
      var param = params[uniformValue];
      if(typeof param.type === "undefined" || param.type === null) {
        return null;
      }
      if(typeof param.value !== "undefined" && param.value !== null) {
        var unif = {};
        uniformValue = null;
        if((param.type >= 5120 && param.type <= 5126 || param.type === 35678) && this.version > 0) {
          uniformValue = param.value[0];
        } else {
          uniformValue = param.value;
        }
        unif[uniformKey] = uniformValue;
        if(param.type === 35678) {
    // TODO: Refers to a texture in gltf.textures
        }
        shader.setUniforms(unif);
      }
      if(typeof param.semantic !== "undefined" && param.semantic !== null) {
        var sem = 0;
        if(param.semantic === "MODEL" && param.type === 35676) {
          sem = H3DU.ShaderInfo.MODEL;
        }
        if(param.semantic === "VIEW" && param.type === 35676) {
          sem = H3DU.ShaderInfo.VIEW;
        }
        if(param.semantic === "PROJECTION" && param.type === 35676) {
          sem = H3DU.ShaderInfo.PROJECTION;
        }
        if(param.semantic === "MODELVIEW" && param.type === 35676) {
          sem = H3DU.ShaderInfo.MODELVIEW;
        }
        if(param.semantic === "MODELVIEWPROJECTION" && param.type === 35676) {
          sem = H3DU.ShaderInfo.MODELVIEWPROJECTION;
        }
        if(param.semantic === "MODELVIEWINVERSETRANSPOSE" &&
          param.type === 35675) {
          sem = H3DU.ShaderInfo.MODELVIEWINVERSETRANSPOSE;
        }
        if(param.semantic === "VIEWINVERSE" &&
          param.type === 35676) {
          sem = H3DU.ShaderInfo.VIEWINVERSE;
        }
        if(sem === 0) {
          console.log("Unsupported semantic: " + param.semantic);
        } else {
          shader.setUniformSemantic(uniformKey, sem);
        }
      }
      if(!paramValues[uniformValue]) {
        paramValues[uniformValue] = [uniformKey];
      } else {
        paramValues[uniformValue].push(uniformKey);
      }
    }
  for(var attributeKey in technique.attributes || {})
    if(Object.prototype.hasOwnProperty.call( technique.attributes, attributeKey)) {
      var attributeValue = technique.attributes[attributeKey];
      if(typeof params[attributeValue] === "undefined" || params[attributeValue] === null) {
        return null;
      }
      param = params[attributeValue];
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
var GltfArray = function(array, count, type, byteSize, byteStride) {
  "use strict";
  this.type = type;
  this.array = array;
  this.elementByteSize = byteSize;
  this.byteStride = byteStride;
  this.elementsPerValue = gltfItemSize(type);
  this.valueCount = count;
  this.elementCount = count * this.elementsPerValue;
};
/** @private */
GltfArray.prototype.elementStride = function() {
  "use strict";
  if(this.byteStride === 0) {
    return this.elementsPerValue;
  }
  return this.byteStride / this.elementByteSize | 0;
};

/** @private */
GltfArray.prototype.toValueArray = function() {
  "use strict";
  if(this.byteStride !== 0) {
    throw new Error("Byte stride not yet supported in toValueArray");
  }
  if(this.elementsPerValue === 1) {
    return this.array.slice(0, this.elementCount);
  } else {
    var ret = [];
    var j = 0;
    for(var i = 0;i < this.valueCount;i++) {
      ret.push(this.array.slice(j, j + this.elementsPerValue));
      j += this.elementsPerValue;
    }
    return ret;
  }
};
/** @private */
GltfState.prototype.arrayFromAccessor = function(accessor) {
  "use strict";
  if(typeof accessor === "undefined" || (accessor === null || typeof accessor === "undefined")) {
    return null;
  }
  if(typeof accessor.bufferView === "undefined" || accessor.bufferView === null) {
    return null;
  }
  var bufferViewName = accessor.bufferView;
  if(typeof accessor.byteOffset === "undefined" || accessor.byteOffset === null) {
    return null;
  }
  var byteOffset = accessor.byteOffset;
  if(typeof accessor.componentType === "undefined" || accessor.componentType === null) {
    return null;
  }
  var componentType = accessor.componentType;
  var componentSize = GltfState._componentSize(componentType);
  if(componentSize === 0) {
    this.error = "Unsupported component type";
    return null;
  }
  var byteStride = typeof accessor.byteStride === "undefined" || accessor.byteStride === null ? 0 : accessor.byteStride;
  if(byteStride !== 0) {
    if(byteStride < 0) {
      this.error = "Byte stride less than 0 is not supported";
      return null;
    }
    if(byteStride % componentSize !== 0) {
      this.error = "Byte stride not divisible by component size is not yet supported";
      return null;
    }
  }
  if(typeof accessor.count === "undefined" || accessor.count === null) {
    return null;
  }
  var count = accessor.count;
  if(typeof accessor.type === "undefined" || accessor.type === null) {
    return null;
  }
  var type = accessor.type;
  if(typeof this.gltf.bufferViews === "undefined" || this.gltf.bufferViews === null) {
    return null;
  }
  if(typeof this.gltf.bufferViews[bufferViewName] === "undefined" || this.gltf.bufferViews[bufferViewName] === null) {
    return null;
  }
  var bufferView = this.gltf.bufferViews[bufferViewName];
  if(typeof bufferView.byteOffset === "undefined" || bufferView.byteOffset === null) {
    return null;
  }
  if(typeof bufferView.buffer === "undefined" || bufferView.buffer === null) {
    return null;
  }
  var bufferViewBuffer = bufferView.buffer;
  if(typeof this.buffers[bufferViewBuffer] === "undefined" || this.buffers[bufferViewBuffer] === null) {
    return null;
  }
  var bufferData = this.buffers[bufferViewBuffer];
  var viewByteOffset = bufferView.byteOffset;
  var viewByteLength = typeof bufferView.byteLength === "undefined" || bufferView.byteLength === null ? 0 : bufferView.byteLength;
  var itemSize = gltfItemSize(type);
  if(itemSize === 0) {
    return null;
  }
  var bufferOffset = viewByteOffset + byteOffset;
  var bufferEnd = viewByteOffset + viewByteLength;
  if(bufferOffset > bufferEnd) {
    return null;
  }
  var buf = bufferData.slice(bufferOffset, bufferEnd);
  var array = gltfMakeArray(componentType, buf);
 // console.log(new GltfArray(array, count, type, componentSize,
  // byteStride))
  if(!array) {
    return null;
  }
  return new GltfArray(array, count, type, componentSize,
    byteStride);
};

var GltfSampler = function(input, output, interpolation) {
  "use strict";
  this.input = input.toValueArray();
  this.output = output.toValueArray();
  this.interpolation = interpolation === "LINEAR" ? 0 : -1;
  if(interpolation === "STEP") {
    this.interpolation = 1;
  }
};
/** @private */
GltfState.prototype.readSampler = function(sampler, parameters) {
  "use strict";
  if(typeof sampler === "undefined" || (sampler === null || typeof sampler === "undefined")) {
    return null;
  }
  if(this.version === 0) {
    if(typeof parameters === "undefined" || (parameters === null || typeof parameters === "undefined")) {
      return null;
    }
  }
  if(typeof sampler.input === "undefined" || sampler.input === null) {
    return null;
  }
  var input = sampler.input;
  if(typeof sampler.output === "undefined" || sampler.output === null) {
    return null;
  }
  var output = sampler.output;
  var interp = typeof sampler.interpolation === "undefined" || sampler.interpolation === null ? "LINEAR" : sampler.interpolation;
  if(this.version === 0 && interp !== "LINEAR") {
    this.error = "Unsupported interpolation: " + interp;
    return null;
  }
  if(interp !== "STEP" && interp !== "LINEAR") {
    this.error = "Unsupported interpolation: " + interp;
    return null;
  }
  if(typeof this.gltf.accessors === "undefined" || this.gltf.accessors === null) {
    return null;
  }
  if(this.version === 0) {
    if(typeof parameters[input] === "undefined" || parameters[input] === null) {
      return null;
    }
    if(typeof parameters[output] === "undefined" || parameters[output] === null) {
      return null;
    }
    input = parameters[input];
    output = parameters[output];
  }
  if(typeof this.gltf.accessors[input] === "undefined" || this.gltf.accessors[input] === null) {
    return null;
  }
  var accessorInput = this.gltf.accessors[input];
  if(typeof this.gltf.accessors[output] === "undefined" || this.gltf.accessors[output] === null) {
    return null;
  }
  var accessorOutput = this.gltf.accessors[output];
  var inputBuffer = this.arrayFromAccessor(accessorInput);
  var outputBuffer = this.arrayFromAccessor(accessorOutput);
  if(!(typeof accessorInput.componentType !== "undefined" && accessorInput.componentType !== null) || accessorInput.componentType !== 5126) {
    this.error = "Input's component type is not FLOAT";
    return null;
  }
  if(inputBuffer === null || typeof inputBuffer === "undefined" || (outputBuffer === null || typeof outputBuffer === "undefined")) {
    this.error = "Can't read input or output from sampler";
    return null;
  }
  return new GltfSampler(inputBuffer, outputBuffer, interp);
};
/** @private */
GltfState.prototype.readMaterialValues = function(material, techInfo) {
  "use strict";
  for(var materialKey in material.values || {})
    if(Object.prototype.hasOwnProperty.call( material.values, materialKey)) {
      var materialValue = material.values[materialKey];
      if(typeof techInfo.paramValues[materialKey] === "undefined" || techInfo.paramValues[materialKey] === null) {
        return null;
      }
      var uniforms = techInfo.paramValues[materialKey];
      var unif = {};
      for(var i = 0;i < uniforms.length;i++) {
        unif[uniforms[i]] = materialValue;
      }
      techInfo.shader.setUniforms(unif);
    }
  return this;
};
/** @private */
GltfState.prototype.readAnimations = function() {
  "use strict";
  var animChannels = [];
  for(var animationKey in this.gltf.animations || {})
    if(Object.prototype.hasOwnProperty.call(this.gltf.animations, animationKey)) {
      var animationValue = this.gltf.animations[animationKey];
      var samplers = {};
      var params = typeof animationValue.parameters === "undefined" || animationValue.parameters === null ? {} : animationValue.parameters;
      for(var samplerKey in animationValue.samplers || {})
        if(Object.prototype.hasOwnProperty.call(animationValue.samplers, samplerKey)) {
          var samplerValue = animationValue.samplers[samplerKey];
          var sampler = this.readSampler(samplerValue, params);
          if(typeof sampler === "undefined" || (sampler === null || typeof sampler === "undefined")) {
            return null;
          }
          samplers[samplerKey] = sampler;
        }
      if(typeof animationValue.samplers !== "undefined" && animationValue.samplers !== null) {
        var channels = typeof animationValue.channels === "undefined" || animationValue.channels === null ? [] : animationValue.channels;
        for(var i = 0;i < channels.length;i++) {
          if(typeof channels[i] === "undefined" || channels[i] === null) {
            return null;
          }
          if(typeof channels[i].sampler === "undefined" || channels[i].sampler === null) {
            return null;
          }
          samplerKey = channels[i].sampler;
          if(typeof channels[i].target === "undefined" || channels[i].target === null) {
            return null;
          }
          var target = channels[i].target;
          if(typeof target.id === "undefined" || target.id === null) {
            return null;
          }
          var targetId = target.id;
          if(typeof target.path === "undefined" || target.path === null) {
            return null;
          }
          if(typeof samplers[samplerKey] === "undefined" || samplers[samplerKey] === null) {
            return null;
          }
          sampler = samplers[samplerKey];
          if(typeof this.nodeShapes[targetId] === "undefined" || this.nodeShapes[targetId] === null) {
            return null;
          }
          var path = -1;
          if(target.path === "translation")path = 0;
          if(target.path === "scale")path = 1;
          if(target.path === "rotation")path = 2;
          if(path < 0) {
            this.error = "Unsupported path type";
            return null;
          }
          var targetNode = this.nodeShapes[targetId];
          animChannels.push({
            "sampler":sampler,
            "target":targetNode,
            "path":path
          });
        }
      }
    }
  this.animChannels = animChannels;
  return this;
};

/** @private */
GltfState.prototype.readNode = function(node, nodeName, parent) {
  "use strict";
  var nodeShapeGroup = new H3DU.ShapeGroup();
  this.nodeShapes[nodeName] = nodeShapeGroup;
  for(var meshName in node.meshes || {})
    if(Object.prototype.hasOwnProperty.call( node.meshes, meshName)) {
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
        var maxCount = 0;
        for(var attributeName in prim.attributes || {})
          if(Object.prototype.hasOwnProperty.call( prim.attributes, attributeName)) {
            if(typeof this.gltf.accessors === "undefined" || this.gltf.accessors === null) {
              return null;
            }
            var attrAcc = this.gltf.accessors[prim.attributes[attributeName]];
            array = this.arrayFromAccessor(attrAcc);
            if(!array) {
              return null;
            }
            maxCount = Math.max(maxCount, array.valueCount);
            meshBuffer.setAttribute(attributeName, 0, array.array, 0,
                      array.elementsPerValue, array.elementStride());
          }
        if(typeof prim.indices !== "undefined" && prim.indices !== null) {
          if(typeof this.gltf.accessors === "undefined" || this.gltf.accessors === null) {
            return null;
          }
          if(typeof this.gltf.accessors[prim.indices] === "undefined" || this.gltf.accessors[prim.indices] === null) {
            return null;
          }
          var indexAccessor = this.gltf.accessors[prim.indices];
          if(indexAccessor.componentType !== 5121 &&
      indexAccessor.componentType !== 5123 &&
      (this.version === 0 || indexAccessor.componentType !== 5125)) {
            this.error = "invalid component type for indices"; return null;
          }
          array = this.arrayFromAccessor(indexAccessor);
          if(!array) {
            return null;
          }
          if(array.elementsPerValue !== 1 || array.byteStride !== 0) {
            this.error = "invalid array for indices"; return null;
          }
          meshBuffer.setIndices(array.array, array.elementByteSize);
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
        if(typeof prim.material !== "undefined" && prim.material !== null) {
          var material = this.gltf.materials[prim.material];
          if(typeof material.technique !== "undefined" && material.technique !== null) {
            var technique = this.gltf.techniques[material.technique];
            var techInfo = this.readTechnique(technique);
            if(!techInfo) {
              return null;
            }
            if(!this.readMaterialValues(material, techInfo)) {
              return null;
            }
            shape.setMaterialParams({"shader":techInfo.shader});
          }
        }
        shapeGroup.addShape(shape);
        if(p === 0)firstShape = shape;
      }
      var meshShape = prims.length === 1 ? firstShape : shapeGroup;
      this.meshes[meshName] = meshShape;
      nodeShapeGroup.addShape(meshShape);
    }
  if(typeof node.matrix !== "undefined" && node.matrix !== null) {
    nodeShapeGroup.getTransform().setMatrix(node.matrix);
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
  if(typeof node.children !== "undefined" && node.children !== null) {
    for(var i = 0;i < node.children.length;i++) {
      if(typeof node.children[i] === "undefined" || node.children[i] === null) {
        return null;
      }
      var child = node.children[i];
      if(typeof this.gltf.nodes[child] === "undefined" || this.gltf.nodes[child] === null) {
        return null;
      }
      if(!this.readNode(this.gltf.nodes[child], child, nodeShapeGroup)) {
        return null;
      }
    }
  }
  parent.addShape(nodeShapeGroup);
  return this;
};

/** @private */
GltfState.prototype.readScenes = function() {
  "use strict";
  for(var sceneKey in this.gltf.scenes || {})
    if(Object.prototype.hasOwnProperty.call(this.gltf.scenes, sceneKey)) {
      var scene = this.gltf.scenes[sceneKey];
      for(var nodeKey in scene.nodes || {})
        if(Object.prototype.hasOwnProperty.call( scene.nodes, nodeKey)) {
          var nodeName = scene.nodes[nodeKey];
          if(typeof this.gltf.nodes[nodeName] === "undefined" || this.gltf.nodes[nodeName] === null) {
            return null;
          }
          var node = this.gltf.nodes[nodeName];
          if(!this.readNode(node, nodeName, this.batch)) {
            return null;
          }
        }
    }
  return this;
};

function Gltf() {
  "use strict";
  this.animChannels = [];
  this.batch = null;
  this.timer = {};
}
/**
 * TODO: Not documented yet.
 * @returns {*} Return value.
 * @memberof! Gltf#
 */
Gltf.prototype.getBatch = function() {
  "use strict";
  return this.batch;
};
/** @private */
Gltf._lerp = function(s, e, t) {
  "use strict";
  if(s.length === 4 && e.length === 4) {
    return H3DU.Math.vec4lerp(s, e, t);
  } else if(s.length === 3 && e.length === 3) {
    return H3DU.Math.vec3lerp(s, e, t);
  } else {
    console.warn("Lerp not supported with this kind of data");
    return null;
  }
};
/** @private */
Gltf._slerp = function(s, e, t) {
  "use strict";
  if(s.length === 4 && e.length === 4) {
    return H3DU.Math.quatSlerp(s, e, t);
  } else {
    console.warn("Slerp not supported with this kind of data");
    return null;
  }
};
/** @private */
Gltf._interpolate = function(node, s, e, t, path) {
  "use strict";
  switch(path) {
  case 0: {
      // translation
    node.getTransform().setPosition(
         Gltf._lerp(s, e, t));
    break;
  }
  case 1: {
      // scale
    node.getTransform().setScale(
         Gltf._lerp(s, e, t));
    break;
  }
  case 2: {
      // rotation
    node.getTransform().setQuaternion(
         Gltf._slerp(s, e, t));
    break;
  }
  default:
    break;
  }
};
/**
 * TODO: Not documented yet.
 * @param {*} time
 * @returns {*} Return value.
 * @memberof! Gltf#
 */
Gltf.prototype.update = function(time) {
  "use strict";
  for(var i = 0;i < this.animChannels.length;i++) {
    var ch = this.animChannels[i];
    var node = ch.target;
    var endTime = ch.sampler.input[ch.sampler.input.length - 1];
    var pos = H3DU.getTimePosition(this.timer, time, endTime * 1000.0);
    for(var j = 0;j < ch.sampler.input.length - 1;j++) {
      var s = ch.sampler.input[j] / endTime;
      var e = ch.sampler.input[j + 1] / endTime;
      var fac = s === e ? 0.0 : (pos - e) / (e - s);
      // TODO: Support STEP interpolation
      if(pos >= s && pos <= e) {
        Gltf._interpolate(node, ch.sampler.output[j],
            ch.sampler.output[j + 1], fac, ch.path);
      }
    }
  }
};
/**
 * TODO: Not documented yet.
 * @returns {*} Return value.
 * @memberof! GltfState#
 */
GltfState.prototype.toGltf = function() {
  "use strict";
  var ret = new Gltf();
  ret.batch = this.batch;
  ret.animChannels = this.animChannels;
  return ret;
};
/** @private */
function readGltf(gltf, path) {
  "use strict";
  var promises = [];
  var promiseKinds = [];
  var promiseNames = [];
  for(var bufferName in gltf.buffers || {})
    if(Object.prototype.hasOwnProperty.call( gltf.buffers, bufferName)) {
      var bufferValue = gltf.buffers[bufferName];
      if(typeof bufferValue === "undefined" || (bufferValue === null || typeof bufferValue === "undefined")) {
        return Promise.reject("buffer not found");
      }
      var uri = gltfResolvePath(path, bufferValue.uri);
      promises.push(H3DU.loadFileFromUrl(uri, "arraybuffer"));
      promiseNames.push(bufferName);
      promiseKinds.push(0);
    }
  for(var shaderName in gltf.shaders || {})
    if(Object.prototype.hasOwnProperty.call( gltf.shaders, shaderName)) {
      var shaderValue = gltf.shaders[shaderName];
      if(typeof shaderValue === "undefined" || (shaderValue === null || typeof shaderValue === "undefined")) {
        return Promise.reject("shader not found");
      }
      uri = gltfResolvePath(path, shaderValue.uri);
      promises.push(H3DU.loadFileFromUrl(uri));
      promiseNames.push(shaderName);
      promiseKinds.push(1);
    }
  return H3DU.getPromiseResultsAll(promises)
   .then(function(promiseResults) {
     var state = new GltfState(gltf, promiseResults, promiseKinds, promiseNames);
     var retState = state.readScenes();
     if(!retState)return Promise.reject(state.error);
     retState = state.readAnimations();
     if(!retState)return Promise.reject(state.error);
     return Promise.resolve(state.toGltf());
   });
}
/**
 * TODO: Not documented yet.
 * @param {*} url
 * @returns {*}
 */
H3DU.loadGltfFromUrl = function(url) {
  "use strict";
  return H3DU.loadFileFromUrl(url, "json").then(function(data) {
    return readGltf(data.data, data.url);
  });
};
