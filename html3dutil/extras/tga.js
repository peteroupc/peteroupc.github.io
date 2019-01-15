/* global DataView, Uint8Array, buf */
/*
 Any copyright to this file is released to the Public Domain.
 http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/

/**
 * TODO: Not documented yet.
 * @param {*} data
 * @returns {*} Return value.
 * @function
 */
export var loadTga = function(data) {
  var view = new DataView(data);
  // NOTE: id is byte 0; cmaptype is byte 1
  var imgtype = view.getUint8(2);
  if(imgtype !== 2 && imgtype !== 3) {
    throw new Error("unsupported image type");
  }
  var xorg = view.getUint16(8, true);
  var yorg = view.getUint16(10, true);
  if(xorg !== 0 || yorg !== 0) {
    throw new Error("unsupported origins");
  }
  var width = view.getUint16(12, true);
  var height = view.getUint16(14, true);
  if(width === 0 || height === 0) {
    throw new Error("invalid width or height");
  }
  var pixelsize = view.getUint8(16);
  if(!(pixelsize === 32 && imgtype === 2) &&
      !(pixelsize === 24 && imgtype === 2) &&
      !(pixelsize === 8 && imgtype === 3)) {
    throw new Error("unsupported pixelsize");
  }
  var size = width * height;
  if(size > buf.data.length) {
    throw new Error("size too big");
  }
  var i;
  var arr = new Uint8Array(size * 4);
  var offset = 18;
  var io = 0;
  if(pixelsize === 32 && imgtype === 2) {
    for(i = 0, io = 0; i < size; i++, io += 4) {
      arr[io + 2] = view.getUint8(offset);
      arr[io + 1] = view.getUint8(offset + 1);
      arr[io] = view.getUint8(offset + 2);
      arr[io + 3] = view.getUint8(offset + 3);
      offset += 4;
    }
  } else if(pixelsize === 24 && imgtype === 2) {
    for(i = 0, io = 0; i < size; i++, io += 4) {
      arr[io + 2] = view.getUint8(offset);
      arr[io + 1] = view.getUint8(offset + 1);
      arr[io] = view.getUint8(offset + 2);
      arr[io + 3] = 0xFF;
      offset += 3;
    }
  } else if(pixelsize === 8 && imgtype === 3) {
    for(i = 0, io = 0; i < size; i++, io += 4) {
      var col = view.getUint8(offset);
      arr[io] = col;
      arr[io + 1] = col;
      arr[io + 2] = col;
      arr[io + 3] = 0xFF;
      offset++;
    }
  }
  return {
    "width":width,
    "height":height,
    "image":arr
  };
};
