/* eslint strict: "off", no-unused-expressions: "off" */\n(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

/* global Float32Array, H3DU, Int16Array, Int32Array, Int8Array, Uint16Array, Uint32Array, Uint8Array */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

/** @ignore */
var GltfArray = function(array, count, type, byteSize, byteStride) {
  this.type = type;
  this.array = array;
  this.elementByteSize = byteSize;
  this.byteStride = byteStride;
  this.elementsPerValue = 0;
  if(type === "SCALAR")this.elementsPerValue = 1;
  if(type === "VEC2")this.elementsPerValue = 2;
  if(type === "VEC3")this.elementsPerValue = 3;
  if(type === "VEC4")this.elementsPerValue = 4;
  if(type === "MAT2")this.elementsPerValue = 4;
  if(type === "MAT3")this.elementsPerValue = 9;
  if(type === "MAT4")this.elementsPerValue = 16;
  this.valueCount = count;
  this.elementCount = count * this.elementsPerValue;
};
/** @ignore */
GltfArray.prototype.valueByteSize = function() {
  return this.elementByteSize * this.elementsPerValue;
};
/** @ignore */
GltfArray.prototype.elementStride = function() {
  if(this.byteStride === 0) {
    return this.elementsPerValue;
  }
  return this.byteStride / this.elementByteSize | 0;
};

/** @ignore */
GltfArray.prototype.toValueArray = function() {
  if(this.byteStride !== 0 && this.byteStride !== this.valueByteSize()) {
    throw new Error("Byte stride not yet supported in toValueArray");
  }
  if(this.elementsPerValue === 1) {
    return this.array.slice(0, this.elementCount);
  } else {
    var ret = [];
    var j = 0;
    for(var i = 0; i < this.valueCount; i++) {
      ret.push(this.array.slice(j, j + this.elementsPerValue));
      j += this.elementsPerValue;
    }
    return ret;
  }
};
  /** @ignore
   * @constructor */
var GltfUtil = function() {
    // empty
};
  /** @ignore */
GltfUtil.arrayToView = function(arr, reference) {
  if(reference instanceof Uint8Array) {
    return new Uint8Array(arr);
  }
  if(reference instanceof Uint32Array) {
    return new Uint32Array(arr);
  }
  return new Uint16Array(arr);
};
  /** @ignore */
GltfUtil.lineStripToLines = function(strip) {
  var ret = [];
  if(strip.length < 2) {
    return strip;
  }

  for(var i = 1; i < strip.length; i++) {
    ret.push(strip[i - 1], strip[i]);
  }
  return GltfUtil.arrayToView(ret, strip);
};
  /** @ignore */
GltfUtil.lineLoopToLines = function(strip) {
  var ret = [];
  if(strip.length < 2) {
    return strip;
  }
  for(var i = 1; i < strip.length; i++) {
    ret.push(strip[i - 1], strip[i]);
  }
  ret.push(strip[strip.length - 1], strip[0]);
  return GltfUtil.arrayToView(ret, strip);
};

/** @ignore */
GltfUtil.triangleFanToTriangles = function(fan) {
  var ret = [];
  if(fan.length < 3) {
    return fan;
  }
  for(var i = 2; i < fan.length; i++) {
    ret.push(fan[0], fan[i - 1], fan[i]);
  }
  return GltfUtil.arrayToView(ret, fan);
};

/** @ignore */
GltfUtil.triangleStripToTriangles = function(strip) {
  var ret = [];
  if(strip.length < 3) {
    return strip;
  }
  var flip = false;
  for(var i = 2; i < strip.length; i++) {
    if(flip) {
      ret.push(strip[i - 2], strip[i - 1], strip[i]);
    } else {
      ret.push(strip[i - 1], strip[i - 2], strip[i]);
    }
  }
  return GltfUtil.arrayToView(ret, strip);
};

/** @ignore */
GltfUtil._elementsPerValue = function(type) {
  if(type === "SCALAR")return 1;
  if(type === "VEC2")return 2;
  if(type === "VEC3")return 3;
  if(type === "VEC4")return 4;
  if(type === "MAT2")return 4;
  if(type === "MAT3")return 9;
  if(type === "MAT4")return 16;
  return 0;
};
/** @ignore */
GltfUtil._resolvePath = function(path, name) {
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
};

/** @ignore */
GltfUtil._makeArray = function(componentType, buffer, bufferOffset, elementCount) {
  if(componentType === 5120) {
    return new Int8Array(buffer, bufferOffset, elementCount);
  }
  if(componentType === 5121) {
    return new Uint8Array(buffer, bufferOffset, elementCount);
  }
  if(componentType === 5122) {
    return new Int16Array(buffer, bufferOffset, elementCount);
  }
  if(componentType === 5123) {
    return new Uint16Array(buffer, bufferOffset, elementCount);
  }
  if(componentType === 5124) {
    return new Int32Array(buffer, bufferOffset, elementCount);
  }
  if(componentType === 5125) {
    return new Uint32Array(buffer, bufferOffset, elementCount);
  }
  if(componentType === 5126) {
    return new Float32Array(buffer, bufferOffset, elementCount);
  }
  return null;
};
/** @ignore */
GltfUtil._bytesPerElement = function(componentType) {
  if(componentType === 5120 || componentType === 5121)return 1;
  if(componentType === 5122 || componentType === 5123)return 2;
  if(componentType === 5124 || componentType === 5125)return 4;
  if(componentType === 5126)return 4;
  return 0;
};
  /** @ignore */
GltfUtil._lerp = function(s, e, t) {
  if(s.length === 4 && e.length === 4) {
    return H3DU.Math.vec4lerp(s, e, t);
  } else if(s.length === 3 && e.length === 3) {
    return H3DU.Math.vec3lerp(s, e, t);
  } else {
    console.warn("Lerp not supported with this kind of data");
    return null;
  }
};
/** @ignore */
GltfUtil._slerp = function(s, e, t) {
  if(s.length === 4 && e.length === 4) {
    return H3DU.Math.quatSlerp(s, e, t);
  } else {
    console.warn("Slerp not supported with this kind of data");
    return null;
  }
};
/** @ignore */
GltfUtil.hasUniqueItems = function(items) {
  if(items.length === 0)return true;
  if(items.length === 1 && items[0] >= 0)return true;
  if(items[0] < 0)return false;
  var s = items.sort();
  for(var i = 0; i < s.length - 1; i++) {
    if(s[i] === s[i + 1])return false;
  }
  return true;
};
  /** @ignore */
GltfUtil.addExtensionsExtras = function(property, retval) {
  retval.extras = typeof property.extras !== "undefined" && property.extras !== null ?
  property.extras : {};
  retval.extensions = typeof property.extensions !== "undefined" && property.extensions !== null ?
    property.extensions : {};
  return retval;
};
  /** @ignore */
GltfUtil.addExtensionsExtrasName = function(property, retval) {
  retval.name = GltfUtil.parseString(property.name);
  return GltfUtil.addExtensionsExtras(property, retval);
};
  /** @ignore */
GltfUtil.parseStringDefault = function(value, defaultValue) {
  if(typeof value === "undefined")return defaultValue;
  if(typeof value !== "string")throw new Error("parse error");
  return value;
};
  /** @ignore */
GltfUtil.parseString = function(value) {
  if(typeof value === "undefined")return "";
  if(typeof value !== "string")throw new Error("parse error");
  return value;
};
  /** @ignore */
GltfUtil.parseArrayFixedLength = function(value, len, defvalue) {
  if(typeof value === "undefined")return defvalue;
  if(!(value instanceof Array) || value.length !== len)throw new Error("parse error");
  return value;
};
  /** @ignore */
GltfUtil.parseArrayMin1 = function(value) {
  if(typeof value === "undefined")return [];
  if(!(value instanceof Array) || value.length === 0)throw new Error("parse error");
  return value;
};
/**
 * TODO: Not documented yet.
 * @param {*} value
 * @returns {*} Return value.
 */
GltfUtil.parseArrayUniqueMin1 = function(value) {
  if(typeof value === "undefined")return [];
  if(!(value instanceof Array) || value.length === 0 ||
     !GltfUtil.hasUniqueItems(value))throw new Error("parse error");
  return value;
};
// Process a nonnegative integer value, returning -1
// if the value is undefined
GltfUtil.parseNonnegativeInteger = function(value) {
  if(typeof value === "undefined")return -1;
  if(typeof value !== "number" || Math.floor(value) !== value || isNaN(value) ||
     value === Number.POSITIVE_INFINITY || value < 0)throw new Error("parse error");
  return value;
};
  /** @ignore */
GltfUtil.parseNonnegativeNumber = function(value) {
  if(typeof value === "undefined")return -1;
  if(typeof value !== "number" || isNaN(value) ||
     value === Number.POSITIVE_INFINITY || value < 0)throw new Error("parse error");
  return value;
};
  /** @ignore */
GltfUtil.parseRangedNumber = function(value, mn, mx, defValue) {
  if(typeof value === "undefined")return defValue;
  if(typeof value !== "number" || isNaN(value) ||
     value === Number.POSITIVE_INFINITY ||
     value === Number.NEGATIVE_INFINITY || value < mn || value > mx)throw new Error("parse error");
  return value;
};
  /** @ignore */
GltfUtil.parseEnum = function(value, values, defValue) {
  if(typeof value === "undefined")return defValue;
  for(var i = 0; i < values.length; i++) {
    if(values[i] === value)return value;
  }
  throw new Error("parse error");
};
  /** @ignore */
GltfUtil.parseRangedInteger = function(value, mn, mx, defValue) {
  var n = GltfUtil.parseRangedNumber(value, mn, mx, defValue);
  if(Math.floor(n) !== n)throw new Error("parse error");
  return n;
};
  /** @ignore */
GltfUtil.parseBoolean = function(value, defValue) {
  if(typeof value === "undefined")return defValue;
  if(value === true || value === false)return value;
  throw new Error("not a boolean");
};
  /** @ignore */
GltfUtil.parseNonnegativeNumberDefault = function(value, defValue) {
  return typeof value === "undefined" ? defValue :
     GltfUtil.parseNonnegativeNumber(value);
};
  /** @ignore */
GltfUtil.parseNonnegativeIntegerDefault = function(value, defValue) {
  return typeof value === "undefined" ? defValue :
     GltfUtil.parseNonnegativeInteger(value);
};

/* global H3DU */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
function GltfInfo() {
  this.animChannels = [];
  this.batch = null;
  this.timer = {};
  this.imageUris = [];
}
/** @ignore */
GltfInfo.prototype.getImageURIs = function() {
  return this.imageUris.slice(0, this.imageUris.length);
};

/** @ignore */
GltfInfo.prototype.getShape = function() {
  return this.batch;
};
/** @ignore */
GltfInfo._interpolate = function(node, s, e, t, path) {
  switch(path) {
  case 0: {
      // translation
    node.getTransform().setPosition(
         GltfUtil._lerp(s, e, t));
    break;
  }
  case 1: {
      // scale
    node.getTransform().setScale(
         GltfUtil._lerp(s, e, t));
    break;
  }
  case 2: {
      // rotation
    node.getTransform().setQuaternion(
         GltfUtil._slerp(s, e, t));
    break;
  }
  default:
    break;
  }
};
/** @ignore */
GltfInfo.prototype.update = function(time) {
  if(this.maxEndTimeSecs > 0) {
    for(var i = 0; i < this.animChannels.length; i++) {
      var ch = this.animChannels[i];
      var node = ch.target;
      var maxInput = ch.sampler.input[ch.sampler.input.length - 1];
      var pos = H3DU.getTimePosition(this.timer, time,
      this.maxEndTimeSecs * 1000.0);
      if(pos * this.maxEndTimeSecs > maxInput) {
        // Reached end of animation
        var last = ch.sampler.output[ch.sampler.output.length - 1];
        GltfInfo._interpolate(node, last, last, 0, ch.path);
      } else {
        var invEnd = 1.0 / this.maxEndTimeSecs;
        var inputLen = ch.sampler.input.length;
        for(var j = 0; j < inputLen; j++) {
          var s = ch.sampler.input[j] * invEnd;
          var e = ch.sampler.input[j + 1] * invEnd;
      // LATER: Support STEP interpolation
          if(pos >= s && pos <= e) {
            var fac = s === e ? 0.0 : (pos - s) / (e - s);
            GltfInfo._interpolate(node,
      ch.sampler.output[j],
            ch.sampler.output[j + 1], fac, ch.path);
          }
        }
      }
    }
  }
};

/* global H3DU, Promise, Uint16Array, Uint32Array */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

/** @ignore
 * @constructor */
function GltfState1(gltf, path, promiseResults, promiseKinds, promiseNames) {
  this.buffers = {};
  this.shaders = {};
  this.meshes = {};
  this.materials = {};
  this.techniques = {};
  this.nodeShapes = {};
  this.error = "";
  this.gltf = gltf;
  this.path = path;
  this.version = 0; // glTF 1.0
  this.animChannels = [];
  for(var i = 0; i < promiseKinds.length; i++) {
    if(promiseKinds[i] === 0) {
      this.buffers[promiseNames[i]] = promiseResults[i].data;
    } else if(promiseKinds[i] === 1) {
      this.shaders[promiseNames[i]] = promiseResults[i].data;
    }
  }
  if(typeof this.gltf.asset !== "undefined" && this.gltf.asset !== null) {
    if(!(typeof this.gltf.asset.version !== "undefined" && this.gltf.asset.version !== null)) {
      this.error = "No version despite appearance of asset object";
    } else if(this.gltf.asset.version === "1.1") {
      this.version = 1;
    } else if(this.gltf.asset.version === "2.0") {
      this.version = 2;
    }
  }
  this.programs = this.preparePrograms();
  this.batch = new H3DU.ShapeGroup();
  this.imageUris = [];
  for(var k in this.gltf.images || {})
    if(Object.prototype.hasOwnProperty.call(this.gltf.images, k)) {
      var v = this.gltf.images[k];
      if(typeof v.uri === "undefined" || v.uri === null) {
        this.error = "No image URI given";
        break;
      } else {
        var uri = v.uri;
        uri = GltfUtil._resolvePath(this.path, uri);
        this.imageUris.push(uri);
      }
    }
}
/** @ignore */
GltfState1.prototype.preparePrograms = function() {
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
      if(typeof vs === "undefined" || vs === null || (typeof fs === "undefined" || fs === null)) {
        this.error = Promise.reject("missing shader");
        return null;
      }
      ret[programKey] = new H3DU.ShaderInfo(vs, fs);
    }
  return ret;
};

/** @ignore */
GltfState1.prototype.readTexture = function(texture) {
  if(typeof texture === "undefined" || texture === null) {
    return null;
  }
  if(typeof texture.sampler === "undefined" || texture.sampler === null) {
    return null;
  }
  var sampler = texture.sampler;
  if(typeof texture.source === "undefined" || texture.source === null) {
    return null;
  }
  var source = texture.source;
  var format = typeof texture.format === "undefined" || texture.format === null ? 6408 : texture.format;
  var internalFormat = typeof texture.internalFormat === "undefined" || texture.internalFormat === null ?
             format : texture.internalFormat;
  var target = typeof texture.target === "undefined" || texture.target === null ? 3553 : texture.target;
  var type = typeof texture.type === "undefined" || texture.type === null ? 5121 : texture.type;
  if(typeof this.gltf.samplers === "undefined" || this.gltf.samplers === null ||
 (typeof this.gltf.samplers[sampler] === "undefined" || this.gltf.samplers[sampler] === null)) {
    return null;
  }

  if(typeof this.gltf.images === "undefined" || this.gltf.images === null ||
 (typeof this.gltf.images[source] === "undefined" || this.gltf.images[source] === null)) {
    return null;
  }
  var sourceValue = this.gltf.images[source];
  if(typeof sourceValue.uri === "undefined" || sourceValue.uri === null) {
    return null;
  }
  var uri = GltfUtil._resolvePath(this.path, sourceValue.uri);
  return new H3DU.TextureInfo({
    "magFilter": typeof sampler.magFilter === "undefined" || sampler.magFilter === null ? 9729 : sampler.magFilter,
    "minFilter": typeof sampler.minFilter === "undefined" || sampler.minFilter === null ? 9986 : sampler.minFilter,
    "wrapS": typeof sampler.wrapS === "undefined" || sampler.wrapS === null ? 10497 : sampler.wrapS,
    "wrapT": typeof sampler.wrapT === "undefined" || sampler.wrapT === null ? 10497 : sampler.wrapT,
    "format":format,
    "topDown":true,
    "internalFormat":internalFormat,
    "uri":uri,
    "target":target,
    "type":type
  });
};
/** @ignore */
GltfState1.prototype.getUniformValue = function(paramType, paramValue) {
  var uniformValue = null;
  if((paramType >= 5120 && paramType <= 5126 || paramType === 35678) && this.version > 0) {
    uniformValue = paramValue[0];
  } else {
    uniformValue = paramValue;
  }
  if(paramType === 35678) {
    if(typeof this.gltf.textures === "undefined" || this.gltf.textures === null || (typeof this.gltf.textures[uniformValue] === "undefined" || this.gltf.textures[uniformValue] === null)) {
      return null;
    }
    var tex = this.gltf.textures[uniformValue];
    uniformValue = this.readTexture(tex);
  }
  return uniformValue;
};

/** @ignore */
GltfState1.prototype.readTechnique = function(techniqueName) {
  if(typeof this.techniques[techniqueName] !== "undefined" && this.techniques[techniqueName] !== null) {
      // Technique was already read, return it
    return this.techniques[techniqueName];
  }
  if(typeof this.gltf.techniques === "undefined" || this.gltf.techniques === null ||
 (typeof this.gltf.techniques[techniqueName] === "undefined" || this.gltf.techniques[techniqueName] === null)) {
    return null;
  }
  var technique = this.gltf.techniques[techniqueName];
  if(typeof technique.program === "undefined" || technique.program === null) {
    return null;
  }
  var tprog = technique.program;
  if(typeof this.programs[tprog] === "undefined" || this.programs[tprog] === null) {
    return null;
  }
  var program = this.programs[tprog];
  var shader = program.copy();
  var params = technique.parameters || {};
  var paramValues = {};
  var paramTypes = {};
  var unif = {};
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
      paramTypes[uniformKey] = param.type;
      if(typeof param.value !== "undefined" && param.value !== null) {
        var unifValue = this.getUniformValue( param.type, param.value);
        if(typeof unifValue === "undefined" || unifValue === null) {
          return null;
        }
        unif[uniformKey] = unifValue;
      }
      if(typeof param.semantic !== "undefined" && param.semantic !== null) {
    // LATER: Semantic + param.node
        var sem = 0;
        if(param.semantic === "MODEL" && param.type === 35676) {
          sem = H3DU.Semantic.MODEL;
        } else if(param.semantic === "VIEW" && param.type === 35676) {
          sem = H3DU.Semantic.VIEW;
        } else if(param.semantic === "PROJECTION" && param.type === 35676) {
          sem = H3DU.Semantic.PROJECTION;
        } else if(param.semantic === "MODELVIEW" && param.type === 35676) {
          sem = H3DU.Semantic.MODELVIEW;
        } else if(param.semantic === "MODELVIEWPROJECTION" && param.type === 35676) {
          sem = H3DU.Semantic.MODELVIEWPROJECTION;
        } else if(param.semantic === "MODELVIEWINVERSETRANSPOSE" &&
          param.type === 35675) {
          sem = H3DU.Semantic.MODELVIEWINVERSETRANSPOSE;
        } else if(param.semantic === "VIEWINVERSE" &&
          param.type === 35676) {
          sem = H3DU.Semantic.VIEWINVERSE;
        } else if(param.semantic === "JOINTMATRIX" &&
          param.type === 35676) {
          sem = H3DU.Semantic.JOINTMATRIX;
        }
        if(sem === 0) {
          console.log("Unsupported semantic: " + [param.semantic, param.type]);
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
  shader.setUniforms(unif);
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
      if(typeof semantic !== "undefined" && semantic !== null) {
        shader.setSemantic(attributeKey, semantic);
      }
    }
  var ret = {
    "shader":shader,
    "paramTypes":paramTypes,
    "paramValues":paramValues
  };
  this.techniques[techniqueName] = ret;
  return ret;
};
/** @ignore */
GltfState1.prototype.arrayFromAccessor = function(accessor) {
  if(typeof accessor === "undefined" || accessor === null) {
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
  var componentSize = GltfUtil._bytesPerElement(componentType);
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
  var itemSize = GltfUtil._elementsPerValue(type);
  var bytesPerElement = GltfUtil._bytesPerElement(componentType);
  if(itemSize === 0) {
    return null;
  }
  var bufferOffset = viewByteOffset + byteOffset;
  var bufferLength = viewByteLength - byteOffset;
  var elementCount = itemSize * count;
  if(elementCount < 0) {
    return null;
  }
  if(elementCount * bytesPerElement > bufferLength) {
    this.error = "Buffer can't fit given number of values";
    return null;
  }
  var array = GltfUtil._makeArray(componentType, bufferData, bufferOffset, elementCount);
  if(!array) {
    return null;
  }
  return new GltfArray(array, count, type, componentSize,
    byteStride);
};

var GltfSampler = function(input, output, interpolation) {
  this.input = input.toValueArray();
  this.output = output.toValueArray();
  this.interpolation = interpolation === "LINEAR" ? 0 : -1;
  if(interpolation === "STEP") {
    this.interpolation = 1;
  }
};
/** @ignore */
GltfState1.prototype.readSampler = function(sampler, parameters) {
  if(typeof sampler === "undefined" || sampler === null) {
    return null;
  }
  if(this.version === 0) {
    if(typeof parameters === "undefined" || parameters === null) {
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
  if(typeof inputBuffer === "undefined" || inputBuffer === null || (typeof outputBuffer === "undefined" || outputBuffer === null)) {
    this.error = "Can't read input or output from sampler";
    return null;
  }
  return new GltfSampler(inputBuffer, outputBuffer, interp);
};
/** @ignore */
GltfState1.prototype.readMaterialValues = function(material, techInfo) {
  var shader = techInfo.shader;
  if(typeof material.values === "undefined" || material.values === null) {
    return shader;
  }
    // We have parameter values, make a copy of this shader
  shader = shader.copy();
  for(var materialKey in material.values || {})
    if(Object.prototype.hasOwnProperty.call( material.values, materialKey)) {
      var materialValue = material.values[materialKey];
      if(typeof techInfo.paramValues[materialKey] === "undefined" || techInfo.paramValues[materialKey] === null) {
        this.error = "no values for " + materialKey;
        return null;
      }
      var uniforms = techInfo.paramValues[materialKey];
      var unif = {};
      for(var i = 0; i < uniforms.length; i++) {
        var uniformName = uniforms[i];
        if(typeof techInfo.paramTypes[uniformName] === "undefined" || techInfo.paramTypes[uniformName] === null) {
          this.error = "no type for " + uniformName;
          return null;
        }
        var materialType = techInfo.paramTypes[uniformName];
        var unifValue = this.getUniformValue(materialType, materialValue);
        if(typeof unifValue === "undefined" || unifValue === null) {
          return null;
        }
        unif[uniformName] = unifValue;
      }
      shader.setUniforms(unif);
    }
  return shader;
};
/** @ignore */
GltfState1.prototype.readAnimations = function() {
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
          if(typeof sampler === "undefined" || sampler === null) {
            return null;
          }
          samplers[samplerKey] = sampler;
        }
      if(typeof animationValue.samplers !== "undefined" && animationValue.samplers !== null) {
        var channels = typeof animationValue.channels === "undefined" || animationValue.channels === null ? [] : animationValue.channels;
        for(var i = 0; i < channels.length; i++) {
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

/** @ignore */
GltfState1.prototype.readNode = function(node, nodeName, parent) {
  var nodeShapeGroup = new H3DU.ShapeGroup();
  this.nodeShapes[nodeName] = nodeShapeGroup;
  var nodeMeshes = typeof node.meshes === "undefined" || node.meshes === null ? [] : node.meshes;
  var i;
  for(i = 0; i < nodeMeshes.length; i++) {
    if(typeof nodeMeshes[i] === "undefined" || nodeMeshes[i] === null) {
      return null;
    }
    var meshName = nodeMeshes[i];
    if(typeof this.gltf.meshes === "undefined" || this.gltf.meshes === null ||
 (typeof this.gltf.meshes[meshName] === "undefined" || this.gltf.meshes[meshName] === null)) {
      return null;
    }
    var mesh = this.gltf.meshes[meshName];
    if(this.meshes[meshName]) {
      nodeShapeGroup.addShape(this.meshes[meshName].copy());
      continue;
    }
    var firstShape = null;
    var shapeGroup = new H3DU.ShapeGroup();
    var prims = mesh.primitives || [];
    for(var p = 0; p < prims.length; p++) {
      var prim = prims[p];
      var meshBuffer = new H3DU.MeshBuffer();
      var array;
      var maxCount = 0;
      var primMode = typeof prim.mode === "undefined" || prim.mode === null ? 4 : prim.mode;
      var triangleFan = primMode === 6;
      var triangleStrip = primMode === 5;
      var lineStrip = primMode === 2;
      var lineLoop = primMode === 3;
      if(primMode > 6 || primMode < 0) {
        this.error = "Primitive mode " + primMode + " is invalid";
        return null;
      }
      if(primMode === 0) {
        meshBuffer.setPrimitiveType(H3DU.Mesh.POINTS);
      }
      if(primMode === 4 || triangleFan || triangleStrip) {
        meshBuffer.setPrimitiveType(H3DU.Mesh.TRIANGLES);
      }
      if(primMode === 1 || lineStrip || lineLoop) {
        meshBuffer.setPrimitiveType(H3DU.Mesh.LINES);
      }
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
          meshBuffer.setAttribute(attributeName, array.array,
                      array.elementsPerValue, 0, array.elementStride());
        }
      var indexArray = null;

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
        if(array.elementsPerValue !== 1 ||
      array.byteStride !== 0 && array.byteStride !== array.valueByteSize() ||
      array.elementByteSize !== 1 && array.elementByteSize !== 2 && array.elementByteSize !== 4) {
          this.error = "invalid array for indices"; return null;
        }
        indexArray = array.array;
      } else {
     // Synthesize a list of indices
        var indexList = [];
        for(var k = 0; k < maxCount; k++) {
          indexList.push(k);
        }
        indexArray = maxCount - 1 < 65536 ? new Uint16Array(indexList) :
            new Uint32Array(indexList);
      }
      if(triangleFan)indexArray = GltfUtil.triangleFanToTriangles(indexArray);
      if(triangleStrip)indexArray = GltfUtil.triangleStripToTriangles(indexArray);
      if(lineStrip)indexArray = GltfUtil.lineStripToLines(indexArray);
      if(lineLoop)indexArray = GltfUtil.lineLoopToLines(indexArray);
      meshBuffer.setIndices(indexArray);
      var shape = new H3DU.Shape(meshBuffer);
      shape.getMaterial().setParams({
        "albedo":[0, 0, 0],
        "emission":[0.5, 0.5, 0.5],
        "metalness":0.0,
        "roughness":1.0
      });
      if(typeof prim.material === "undefined" || prim.material === null) {
        return null;
      }
      if(typeof this.materials[prim.material] !== "undefined" && this.materials[prim.material] !== null) {
        shape.setMaterial(this.materials[prim.material]);
      } else {
        if(typeof this.gltf.materials === "undefined" || this.gltf.materials === null ||
 (typeof this.gltf.materials[prim.material] === "undefined" || this.gltf.materials[prim.material] === null)) {
          return null;
        }
        var material = this.gltf.materials[prim.material];
        if(this.version >= 2 && (typeof material.pbrMetallicRoughness !== "undefined" && material.pbrMetallicRoughness !== null)) {
          var shader = shape.getMaterial().shader;
          var pbr = material.pbrMetallicRoughness;
          if(typeof pbr.baseColorFactor === "undefined" || pbr.baseColorFactor === null) {
            return null;
          }
          var baseColor = pbr.baseColorFactor;
          if(typeof pbr.metallicFactor === "undefined" || pbr.metallicFactor === null) {
            return null;
          }
          var metal = pbr.metallicFactor;
          if(typeof pbr.roughnessFactor === "undefined" || pbr.roughnessFactor === null) {
            return null;
          }
          var rough = pbr.roughnessFactor;
          var pbrMaterial = new H3DU.PbrMaterial({
            "albedo":baseColor,
            "metalness":metal,
            "roughness":rough
          });
          shape.setMaterial(pbrMaterial);
          shape.getMaterial().setParams({"shader":shader});
        }
        if(typeof material.technique !== "undefined" &&
        material.technique !== null && this.version < 2) {
          var techInfo = this.readTechnique(material.technique);
          if(!techInfo) {
            return null;
          }
          shader = this.readMaterialValues(material, techInfo);
          if(typeof shader === "undefined" || shader === null) {
            return null;
          }
          shape.getMaterial().setParams({"shader":shader});
        }
        this.materials[prim.material] = shape.getMaterial();
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
    for(i = 0; i < node.children.length; i++) {
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

/** @ignore */
GltfState1.prototype.readScenes = function() {
  var defaultScene = typeof this.gltf.scene === "undefined" ? null : this.gltf.scene;
  var scenes = typeof this.gltf.scenes === "undefined" || this.gltf.scenes === null ? [] : this.gltf.scenes;
  var sceneKeys = Object.keys(scenes);
  if((typeof defaultScene === "undefined" || defaultScene === null) && sceneKeys.length === 1) {
    defaultScene = sceneKeys[0];
  }
  if(typeof defaultScene === "undefined" || defaultScene === null) {
      // nothing to render
    return this;
  }
  for(var sceneKey in scenes)
    if(Object.prototype.hasOwnProperty.call(scenes, sceneKey)) {
      if(sceneKey !== defaultScene) {
        continue;
      }
      var scene = scenes[sceneKey];
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

/** @ignore */
GltfState1.prototype.toGltf = function() {
  var ret = new GltfInfo();
  ret.batch = this.batch;
  ret.animChannels = this.animChannels;
  ret.imageUris = this.imageUris;
  ret.maxEndTimeSecs = 0;
  for(var i = 0; i < ret.animChannels.length; i++) {
    var input = ret.animChannels[i].sampler.input;
    ret.maxEndTimeSecs = Math.max(
      ret.maxEndTimeSecs,
        input[input.length - 1]);
  }
  return ret;
};
/**
 * @ignore
 */
GltfState1.readBuffersAndShaders = function(gltf, path, promises, promiseKinds, promiseNames) {
  for(var bufferName in gltf.buffers || {})
    if(Object.prototype.hasOwnProperty.call( gltf.buffers, bufferName)) {
      var bufferValue = gltf.buffers[bufferName];
      if(typeof bufferValue === "undefined" || bufferValue === null) {
        return Promise.reject("buffer not found");
      }
      var uri = GltfUtil._resolvePath(path, bufferValue.uri);
      promises.push(H3DU.loadFileFromUrl(uri, "arraybuffer"));
      promiseNames.push(bufferName);
      promiseKinds.push(0);
    }
  for(var shaderName in gltf.shaders || {})
    if(Object.prototype.hasOwnProperty.call( gltf.shaders, shaderName)) {
      var shaderValue = gltf.shaders[shaderName];
      if(typeof shaderValue === "undefined" || shaderValue === null) {
        return Promise.reject("shader not found");
      }
      uri = GltfUtil._resolvePath(path, shaderValue.uri);
      promises.push(H3DU.loadFileFromUrl(uri));
      promiseNames.push(shaderName);
      promiseKinds.push(1);
    }
};

/** @ignore */
GltfState1.readGltf = function(gltf, path) {
  var promises = [];
  var promiseKinds = [];
  var promiseNames = [];
  GltfState1.readBuffersAndShaders(gltf, path, promises, promiseKinds, promiseNames);
  return H3DU.getPromiseResultsAll(promises)
   .then(function(promiseResults) {
     var state = new GltfState1(gltf, path, promiseResults, promiseKinds, promiseNames);
     var retState = state.readScenes();
     if(!retState)return Promise.reject(state.error);
     retState = state.readAnimations();
     if(!retState)return Promise.reject(state.error);
     return Promise.resolve(state.toGltf());
   });
};

/* global GltfState2, H3DU, Promise */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

// import {GltfState2} from "./gltf2";
// LATER: Convert batches/shape groups to glTF

/**
 * Loads a 3D scene stored in glTF format, together with the buffers and
 * shaders it uses.
 * <p>This method is considered a supplementary method to the
 * Public Domain HTML 3D Library and is not considered part of that
 * library. <p>
 * To use this class, you must include the script "extras/gltf.js"; the
 * class is not included in the "h3du_min.js" file which makes up
 * the HTML 3D Library. Example:<pre>
 * &lt;script type="text/javascript" src="extras/gltf.js">&lt;/script></pre>
 * @param {string} url URL of the glTF file to load.
 * @returns {Promise<Object>} A promise; when it resolves, the result will
 * be an object that implements the following methods:<ul>
 * <li><code>getShape()</code> - Gets an {@link H3DU.ShapeGroup} object described
 * by the glTF data.
 * <li><code>getImageURIs()</code> - Gets an array of URI (uniform resource identifier)
 * strings for the texture images described by the glTF data. Each URI will be relative
 * to the "url" parameter of the loadGltfFromFile method.
 * <li><code>update(time)</code> - A single-parameter method that should be called
 * if the glTF data describes an animation; this method updates the state of the
 * 3D batch in accordance with that animation. The single parameter, <code>time</code>
 * (type Number), is a time stamp in milliseconds.
 * </ul>If an error occurs in loading the glTF data or any of the buffers and shaders
 * it uses, the promise will be rejected.
 */
H3DU.loadGltfFromUrl = function(url) {
  return H3DU.loadFileFromUrl(url, "json").then(function(data) {
    var gltf = data.data;

    if(typeof gltf.asset !== "undefined" && gltf.asset !== null && (typeof gltf.asset.version !== "undefined" && gltf.asset.version !== null)) {
      if(gltf.asset.version === "2.0" && (typeof GltfState2 !== "undefined" && GltfState2 !== null)) {
        return GltfState2.readGltf(gltf, data.url);
      } else if(gltf.asset.version === "1.1") {
        return Promise.reject({"url":url});
      } else if(gltf.asset.version !== "1.0" && gltf.asset.version !== "1.0.1") {
        throw new Error("Not supported yet");
      }
    }
    return GltfState1.readGltf(gltf, data.url);
  });
};

})));
