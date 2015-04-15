/*
Written by Peter O. in 2015.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://upokecenter.dreamhosters.com/articles/donate-now-2/
*/
/**
Loads a .STL file asynchronously.
@param {string} url The URL to load.
@return {Promise} A promise that:
- Resolves when:
The .STL file is loaded successfully.  The result is a Mesh object.
- Is rejected when:
An error occurs when loading the .STL file.
*/
if(!GLUtil){
 GLUtil={};
}
(function(GLUtil){
var StlData={};
GLUtil.loadStlFromUrl=function(url){
 return GLUtil.loadFileFromUrl(url).then(
   function(e){
     var obj;
     obj=StlData._loadStl(e.data);
     if(obj.error)return Promise.reject({url:e.url, "error":obj.error});
     obj=obj.success;
     obj.url=e.url;
     // otherwise just return the object
     return Promise.resolve(obj);
   },
   function(e){
     return Promise.reject(e)
   });
}
/** @private
 @const */
StlData.INITIAL=0;
/** @private
 @const */
StlData.IN_SOLID=1;
/** @private
 @const */
StlData.IN_FACET=2;
/** @private
 @const */
StlData.IN_OUTER_LOOP=3;
/** @private
 @const */
StlData.AFTER_SOLID=3;
StlData._loadStl=function(str){
 var number="(-?(?:\\d+\\.?\\d*|\\d*\\.\\d+)(?:[Ee][\\+\\-]?\\d+)?)"
 var facet=new RegExp("^\\s*facet\\s+normal\\s+"+number+"\\s+"+number
   +"\\s+"+number+"\\s*")
 var vertex=new RegExp("^\\s*vertex\\s+"+number+"\\s+"+number
   +"\\s+"+number+"\\s*")
 var solid=new RegExp("^\\s*solid\\s+(\\S+)\\s*")
 var outerloop=new RegExp("^\\s*outer\\s+loop\\s*")
 var endfacet=new RegExp("^\\s*endfacet\\s*")
 var endloop=new RegExp("^\\s*endloop\\s*")
 var endsolid=new RegExp("^\\s*endsolid\\s+(\\S+)\\s*$")
 var lines=str.split(/\r?\n/)
 var mesh=new Mesh()
 var currentNormal=[]
 var state=StlData.INITIAL;
 var vertexCount=0;
 var solidName="";
 for(var i=0;i<lines.length;i++){
  var line=lines[i];
  // skip empty lines
  if(line.length==0||(/^\s*$/).test(line))continue;
  var e=solid.exec(line)
  if(e && (state==StlData.INITIAL || state==StlData.AFTER_SOLID)){
    solidName=e[1];
    state=StlData.IN_SOLID;
    continue;
  }
  e=facet.exec(line)
  if(e && state==StlData.IN_SOLID){
    mesh.mode(Mesh.TRIANGLE_FAN);
    mesh.normal3(parseFloat(e[1]),parseFloat(e[2]),parseFloat(e[3]));
    state=StlData.IN_FACET;
    continue;
  }
  e=outerloop.exec(line)
  if(e && state==StlData.IN_FACET){
    state=StlData.IN_OUTER_LOOP;
    vertexCount=0;
    continue;
  }
  e=vertex.exec(line)
  if(e && state==StlData.IN_OUTER_LOOP){
    mesh.vertex3(parseFloat(e[1]),parseFloat(e[2]),parseFloat(e[3]));
    continue;
  }
  e=endloop.exec(line)
  if(e && state==StlData.IN_OUTER_LOOP){
    state=StlData.IN_FACET;
    continue;
  }
  e=endfacet.exec(line)
  if(e && state==StlData.IN_FACET){
    state=StlData.IN_SOLID;
    continue;
  }
  e=endsolid.exec(line)
  if(e && state==StlData.IN_SOLID){
    if(solidName!=e[1]){
     return {"error": new Error("unexpected solid name "+e[1])}
    }
    state=StlData.AFTER_SOLID;
    continue;
  }
  return {"error": new Error("unsupported line: "+line)}
 }
 return {success: mesh};
}
})(GLUtil);
