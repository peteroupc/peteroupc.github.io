/* global H3DU */
/*
 Any copyright to this file is released to the Public Domain.
In case this is not possible, this work is also
licensed under Creative Commons Zero (CC0):
https://creativecommons.org/publicdomain/zero/1.0/

*/
/* exported fragmentShaderLib */

function quadBatch(shader) {
  "use strict";
  // Create a quad to fill the frame buffer
  return new H3DU.Batch3D().addShape(
    new H3DU.Shape(
      new H3DU.MeshBuffer()
        .setAttribute("POSITION", [-1, 1, 0, -1, -1, 0, 1, 1, 0, 1, -1, 0], 3)
        .setIndices([0, 1, 2, 2, 1, 3])).setShader(shader));
}

/* exported renderTexture */
function renderTexture(scene, shader, width, height) {
  "use strict";
  if(typeof width === "undefined" || width === null)width = 512;
  if(typeof height === "undefined" || height === null)height = 512;
  // Create a frame buffer info with the given dimensions
  var fbo = new H3DU.FrameBufferInfo(width, height);
  // Render to the frame buffer
  scene.render([
    new H3DU.RenderPass(quadBatch(shader), {
      "frameBuffer":fbo,
      "useFrameBufferSize":true
    })
  ]);
  return fbo;
}
