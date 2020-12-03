/*
 Any copyright to this file is released to the Public Domain.
 In case this is not possible, this file is also licensed under Creative Commons Zero (CC0): http://creativecommons.org/publicdomain/zero/1.0/
 If you like this, you should donate
 to Peter O. (original author of
 the Public Domain HTML 3D Library) at:
 http://peteroupc.github.io/
*/
/* global H3DU, alert, updateShape */
/* exported formulaEditorHelp */
function formulaEditorHelp() {
  "use strict";
  if(typeof alert !== "undefined") {
    alert("" +
"* The operators `+` `-` `*` `/` work as they do in " +
"normal arithmetic.  (The symbol `*` means 'times'.)\n" +
"* You may use `(` and `)` to group operations.\n" +
"* The symbol `^` means 'to the power of' (exponent).\n" +
"* Order of operations is parentheses, exponents, " +
"multiplication and division, addition and subtraction, " +
"with the following notes:\n" +
"  * Exponents are right-associative: " +
"     5^3^2 means 5^(3^2).\n" +
"  * Multiplication and division is left-associative: " +
"     2/3*4 means (2/3)*4, 2*4/3 means (2*4)/3; " +
"     5/4x means (5/4)*x.\n" +
"* The letters `a` to `z`, except `e`, stand for " +
"variables.\n" +
"* You may leave out the `*` if a number or closing " +
"parenthesis is followed by a variable.  Example: " +
"`3x` means `3*x`.\n" +
"* You may use the symbols `pi` and `e`, which stand " +
"for the corresponding constants.\n" +
"* Functions:  You may use the following functions:\n" +
 "  * `sin(angle)` - Sine (angle in radians).\n" +
 "  * `cos(angle)` - Cosine.\n" +
 "  * `tan(angle)` - Tangent.\n" +
 "  * `abs(value)` - Absolute value.\n" +
 "  * `acos(value)` - Inverse cosine.\n" +
 "  * `asin(value)` - Inverse sine.\n" +
 "  * `atan(value)` - Inverse tangent.\n" +
 "  * `sqrt(value)` - Square root.\n" +
 "  * `ln(value)` - Natural logarithm.\n");
  }
}

// Class that positions an HTML text element
function Label(text, pos) {
  "use strict";
  this.label = document.createElement("div");
  this.label.innerHTML = text;
  this.label.style.width = "150px";
  this.label.style.textAlign = "center";
  this.label.style.display = "none";
  this.label.style.position = "absolute";
  this.label.style.overflow = "hidden";
  document.body.appendChild(this.label);
  this.pos = pos;
  this.update = function(projViewMatrix, width, height) {
    const pos = H3DU.MathUtil.vec3toWindowPoint(this.pos, projViewMatrix, [0, 0, width, height]);
    if(pos[2] < -1 || pos[2] > 1) {
      // Too close, too far, or behind the camera
      this.label.style.display = "none";
    } else {
      this.label.style.display = "block";
      this.label.style.left = pos[0] - 75 + "px";
      this.label.style.top = pos[1] + "px";
    }
  };
}

/* exported Labels */
let Labels = function(scene, batch) {
  "use strict";
  this.labels = [];
  this.batch = batch;
  this.scene = scene;
  this.add = function(text, pos) {
    this.labels.push(new Label(text, pos));
  };
  this.update = function() {
    if(this.labels.length === 0)return;
    let proj = this.batch.getProjectionMatrix();
    const view = this.batch.getViewMatrix();
    const width = this.scene.getWidth();
    const height = this.scene.getHeight();
    proj = H3DU.MathUtil.mat4multiply(proj, view);
    let i;
    for (i = 0; i < this.labels.length; i++) {
      this.labels[i].update(proj, width, height);
    }
  };
};
/* exported addLink */
function addLink(name, func) {
  "use strict";
  const s = document.createElement("span");
  const ins = document.createElement("span");
  ins.innerHTML = " - ";
  const a = document.createElement("a");
  a.href = "javascript:void(null)";
  a.onclick = function() {
    func();
  };
  a.innerHTML = name;
  s.appendChild(ins);
  s.appendChild(a);
  document.getElementById("links").appendChild(s);
}

function addRange(label, min, max, step, defvalue, func) {
  "use strict";
  const div = document.createElement("div");
  const lbl = document.createElement("span");
  lbl.innerHTML = label;
  const defvaluelbl = document.createElement("span");
  defvaluelbl.innerHTML = defvalue;
  const input = document.createElement("input");
  input.setAttribute("type", "range");
  input.setAttribute("value", "" + defvalue);
  input.setAttribute("min", "" + min);
  input.setAttribute("max", "" + max);
  input.setAttribute("step", "" + step);
  const oldvalue = [defvalue];
  input.addEventListener("input", function(e) {
    const val = e.target.value * 1.0;
    if(oldvalue[0] !== val) {
      defvaluelbl.innerHTML = val + "";
      if(func)func(val);
      oldvalue[0] = val;
    }
  });
  div.appendChild(lbl);
  div.appendChild(input);
  div.appendChild(defvaluelbl);
  return div;
}

function setRanges(ranges) {
  "use strict";
  const settings = document.getElementById("settings");
  settings.innerHTML = "";
  let i;
  for (i = 0; i < ranges.length; i++) {
    settings.appendChild(ranges[i]);
  }
}

/* exported saveString */
function saveString(string, type, filename) {
  "use strict";
  let extension = ".txt";
  type = type || "text/plain";
  if(type === "text/plain")extension = ".txt";
  else if(type === "application/json")extension = ".json";
  else if(type === "model/vnd.collada+xml")extension = ".dae";
  else if(type.indexOf("+xml") >= 0)extension = ".xml";
  const a = document.createElement("a");
  const utf8 = new TextEncoder("utf-8").encode(string);
  const blob = new Blob([utf8], {"type": type});
  a.href = window.URL.createObjectURL(blob);
  a.download = filename || "savefile" + extension;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/* exported pushSettings */
function pushSettings(allsettings, shapeGroup, updateMeshFunc, settings) {
  "use strict";
  function settingOnChange(name, updateMeshFunc) {
    return function(val) {
      allsettings[name] = val;
      updateShape(updateMeshFunc, allsettings, shapeGroup);
    };
  }
  const ranges = [];
  let setting;
  for (setting in settings) {
    if(settings[setting] && settings[setting].constructor === Array) {
      const name = setting;
      const label = settings[setting][0];
      const defvalue = settings[setting][1];
      const min = settings[setting][2];
      const max = settings[setting][3];
      const step = settings[setting][4];
      if(typeof allsettings[name] === "undefined") {
        allsettings[name] = defvalue;
      }
      ranges.push(addRange(label, min, max, step, allsettings[name],
        settingOnChange(name, updateMeshFunc)));
    }
  }
  setRanges(ranges);
  updateShape(updateMeshFunc, allsettings, shapeGroup);
}

/* exported makeMesh */
function makeMesh(func, resolutionU, resolutionV) {
  // Default resolution is 50
  "use strict";
  if(typeof resolutionV === "undefined" || resolutionV === null)resolutionV = resolutionU;
  if(typeof resolutionU === "undefined" || resolutionU === null)resolutionU = 50;
  if(typeof resolutionV === "undefined" || resolutionV === null)resolutionV = 50;
  // define a color gradient evaluator for
  // demonstration purposes. Instead of X, Y, and Z,
  // generate a Red/Green/Blue color based on
  // the same parameters U and V as the surface
  // function for 3D points.
  const colorGradient = {
    "evaluate":function(u, v) {
      return [1 - u, v, u];
    }
  };
  return new H3DU.SurfaceBuilder()
    .positionNormal(func)
    .attribute(colorGradient, H3DU.Semantic.COLOR)
    // Evaluate the surface and generate a triangle
    // mesh, using resolution+1 different U coordinates,
    // and resolution+1 different V coordinates.
    // Instead of H3DU.Mesh.TRIANGLES, we could use
    // H3DU.Mesh.LINES to create a wireframe mesh,
    // or H3DU.Mesh.POINTS to create a point mesh.
    .evalSurface(H3DU.Mesh.TRIANGLES, resolutionU, resolutionV)
    .toMeshBuffer();
}

window.addEventListener("load", function() {
  "use strict";
  const a = document.createElement("a");
  a.setAttribute("style", "margin-left:2px;margin-top:2px;margin-bottom:2px;position:absolute;left:80%;top:0;" +
   "background-color:white;text-align:center;text-decoration:none;font-weight:bold");
  a.href = "javascript:void(null)";
  a.innerHTML = "View Source";
  const e = document.createElement("pre");
  e.setAttribute("style", "border:2px solid;margin:2px 2px 2px 2px;left:10;padding:2px 2px 2px 2px;" +
  "background:rgba(255,255,255,0.8);left:10%;width:85%;height:80%;overflow:scroll;position:absolute;float:right;top:2em");
  let demoContent = document.documentElement ? document.documentElement.outerHTML :
    document.body.outerHTML;
  demoContent = demoContent.replace(/&/g, "&amp;");
  demoContent = demoContent.replace(/</g, "&lt;");
  demoContent = demoContent.replace(/>/g, "&gt;");
  demoContent = demoContent.replace(/src\s*=\s*\"([A-Za-z0-9-_\.\/]+)\"/g, function(a, b) {
    return "src=\"<a href=\"" + b + "\">" + b + "</a>\"";
  });
  demoContent = "&lt;!-- NOTE: The following source code may contain generated\n" +
    "  content.  You can also use your browser's 'View Source' feature.--&gt;\n" + demoContent;
  e.innerHTML = demoContent;
  e.style.display = "none";
  document.body.appendChild(a);
  document.body.appendChild(e);
  let viewed = false;
  a.addEventListener("click", function() {
    if(viewed) {
      viewed = false;
      a.innerHTML = "View Source";
      e.style.display = "none";
    } else {
      viewed = true;
      a.innerHTML = "Hide Source";
      e.style.display = "block";
    }
  });
});

/* exported makeAxisLines */
function makeAxisLines(width) {
  "use strict";
  if(typeof width === "undefined" || width === null)width = 0.01;
  const xyz = new H3DU.ShapeGroup();
  const length = 50;
  const halfLength = length / 2.0;
  const axisline = new H3DU.Shape(H3DU.Meshes.createCapsule(width / 2.0, length, 6, 4));
  const zaxis = axisline.copy().setColor("blue");
  zaxis.getTransform().setPosition(0, 0, -halfLength);
  const yaxis = axisline.copy().setColor("green");
  yaxis.getTransform().setRotation(90, -1, 0, 0).setPosition(0, -halfLength, 0);
  const xaxis = axisline.copy().setColor("red");
  xaxis.getTransform().setRotation(90, 0, -1, 0).setPosition(-halfLength, 0, 0);
  const zaxis2 = axisline.copy().setColor("blue");
  zaxis2.getTransform().setPosition(0, 0, halfLength * 3).setScale(3);
  const yaxis2 = axisline.copy().setColor("green");
  yaxis2.getTransform().setRotation(90, -1, 0, 0).setPosition(0, halfLength * 3, 0).setScale(3);
  const xaxis2 = axisline.copy().setColor("red");
  xaxis2.getTransform().setRotation(90, 0, -1, 0).setPosition(halfLength * 3, 0, 0).setScale(3);
  return xyz.addShape(xaxis).addShape(yaxis).addShape(zaxis)
    .addShape(xaxis2).addShape(yaxis2).addShape(zaxis2);
}

document.write("<script src='../extras/meshjson.js'></script>");
