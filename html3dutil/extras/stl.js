/*
Written by Peter O. in 2015.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://peteroupc.github.io/
*/
/* global H3DU, H3DU.Mesh, Promise */
(function(H3DU){
"use strict";
if((typeof H3DU === "undefined" || H3DU === null)){ H3DU={}; }
var H3DU._StlData={};
/**
* Loads a .STL file asynchronously.
* <p>This method is considered a supplementary method to the
* Public Domain HTML 3D Library and is not considered part of that
* library. <p>
* To use this method, you must include the script "extras/stl.js"; the
 * class is not included in the "h3du_min.js" file which makes up
 * the HTML 3D Library.  Example:<pre>
 * &lt;script type="text/javascript" src="extras/stl.js">&lt;/script></pre>
@alias H3DU.loadStlFromUrl
@param {String} url The URL to load.
@returns {Promise} A promise that:
- Resolves when:
The .STL file is loaded successfully.  The result is an {@link H3DU.Mesh} object.
- Is rejected when:
An error occurs when loading the .STL file.
*/
H3DU.loadStlFromUrl=function(url){
 return H3DU.loadFileFromUrl(url).then(
   function(e){
     var obj;
     obj=H3DU._StlData._loadStl(e.data);
     if(obj.error)return Promise.reject({"url":e.url, "error":obj.error});
     obj=obj.success;
     obj.url=e.url;
     // otherwise just return the object
     return Promise.resolve(obj);
   },
   function(e){
     return Promise.reject(e);
   });
};
/** @private */
H3DU._StlData.INITIAL=0;
/** @private */
H3DU._StlData.IN_SOLID=1;
/** @private */
H3DU._StlData.IN_FACET=2;
/** @private */
H3DU._StlData.IN_OUTER_LOOP=3;
/** @private */
H3DU._StlData.AFTER_SOLID=3;
/** @private */
H3DU._StlData._loadStl=function(str){
 var number="(-?(?:\\d+\\.?\\d*|\\d*\\.\\d+)(?:[Ee][\\+\\-]?\\d+)?)";
 var facet=new RegExp("^\\s*facet\\s+normal\\s+"+number+"\\s+"+number+
   "\\s+"+number+"\\s*");
 var vertex=new RegExp("^\\s*vertex\\s+"+number+"\\s+"+number+
   "\\s+"+number+"\\s*");
 var solid=new RegExp("^\\s*solid(?=\\s+(.*)|$)");
 var outerloop=new RegExp("^\\s*outer\\s+loop\\s*");
 var endfacet=new RegExp("^\\s*endfacet\\s*");
 var endloop=new RegExp("^\\s*endloop\\s*");
 var endsolid=new RegExp("^\\s*endsolid(?=\\s+.*|$)");
 var lines=str.split(/\r?\n/);
 var mesh=new H3DU.Mesh();
 var currentNormal=[];
 var state=H3DU._StlData.INITIAL;
 var vertexCount=0;
 var solidName="";
 for(var i=0;i<lines.length;i++){
  var line=lines[i];
  // skip empty lines
  if(line.length===0||(/^\s*$/).test(line))continue;
  var e=solid.exec(line);
  if(e && (state===H3DU._StlData.INITIAL || state===H3DU._StlData.AFTER_SOLID)){
    solidName=e[1];
    state=H3DU._StlData.IN_SOLID;
    continue;
  }
  e=facet.exec(line);
  if(e && state===H3DU._StlData.IN_SOLID){
    mesh.mode(H3DU.Mesh.TRIANGLE_FAN);
    mesh.normal3(parseFloat(e[1]),parseFloat(e[2]),parseFloat(e[3]));
    state=H3DU._StlData.IN_FACET;
    continue;
  }
  e=outerloop.exec(line);
  if(e && state===H3DU._StlData.IN_FACET){
    state=H3DU._StlData.IN_OUTER_LOOP;
    vertexCount=0;
    continue;
  }
  e=vertex.exec(line);
  if(e && state===H3DU._StlData.IN_OUTER_LOOP){
    mesh.vertex3(parseFloat(e[1]),parseFloat(e[2]),parseFloat(e[3]));
    continue;
  }
  e=endloop.exec(line);
  if(e && state===H3DU._StlData.IN_OUTER_LOOP){
    state=H3DU._StlData.IN_FACET;
    continue;
  }
  e=endfacet.exec(line);
  if(e && state===H3DU._StlData.IN_FACET){
    state=H3DU._StlData.IN_SOLID;
    continue;
  }
  e=endsolid.exec(line);
  if(e && state===H3DU._StlData.IN_SOLID){
    state=H3DU._StlData.AFTER_SOLID;
    continue;
  }
  return {"error": new Error("unsupported line: "+line)};
 }
 return {success: mesh};
};
})(H3DU);
