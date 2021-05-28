/*
Written by Peter O.

Any copyright to this work is released to the Public Domain.
In case this is not possible, this work is also
licensed under Creative Commons Zero (CC0):
http://creativecommons.org/publicdomain/zero/1.0/

*/
/**
OBJ file.<p>
 * To use this class, you must include the script "objmtl.js"; the
 * class is not included in the "glutil_min.js" file which makes up
 * the HTML 3D Library.  Example:<pre>
 * &lt;script type="text/javascript" src="glutil_min.js">&lt;/script></pre>
@class */
function ObjData(){
  /** URL of the OBJ file */
  this.url=null;
  /** An array of meshes.  Two or more meshes may have
the same name (the "name" property in each mesh).  The "data"
property holds data for each mesh. */
  this.mtllib=null;
  this.mtl=null;
  this.meshes=[];
}
function MtlData(){
  this.url=null;
  this.list=[];
}
/**
 * Creates one or more 3D shapes from the data
 * in this OBJ file.
 * @param {Scene3D} scene 3D scene to load the shape with.
 * @return {glutil.ShapeGroup} Group of shapes.
 */
ObjData.prototype.toShape=function(scene){
 var multi=new ShapeGroup();
 for(var i=0;i<this.meshes.length;i++){
  var shape=scene.makeShape(this.meshes[i].data);
  var mat=this._getMaterial(this.meshes[i]);
  shape.setMaterial(mat);
  multi.addShape(shape);
 }
 return multi;
}
/**
 * Not documented yet.
 * @param {*} scene
 * @param {*} resolved
 * @param {*} rejected
 */
ObjData.prototype.loadTextures=function(scene,resolved,rejected){
 var textures=[];
 if(this.mtl){
  for(var i=0;i<this.mtl.list.length;i++){
    var mtl=this.mtl.list[i].data;
    if(mtl.texture){
      textures.push(mtl.texture);
    }
  }
 }
 return scene.loadAndMapTextures(textures,resolved,rejected);
}
/**
 * Creates one or more 3D shapes from the named portion
 * of the data in this OBJ file.
 * @param {Scene3D} scene 3D scene to load the shape with.
 * @param {string} name Name from the OBJ file of the portion
 * of the model to use.
 * @return {glutil.ShapeGroup} Group of shapes. The group
 * will be empty if no shapes with the given name exist.
 */
ObjData.prototype.toShapeFromName=function(scene, name){
 var multi=new ShapeGroup();
 for(var i=0;i<this.meshes.length;i++){
  if(this.meshes[i].name!=name)continue;
  var shape=scene.makeShape(this.meshes[i].data);
  var mat=this._getMaterial(this.meshes[i]);
  shape.setMaterial(mat);
  multi.addShape(shape);
 }
 return multi;
}
ObjData._resolvePath=function(path, name){
 // Relatively dumb for a relative path
 // resolver, but sufficient here, as it will
 // only be used with relative "mtllib"/"map_Kd"
 // strings
 var ret=path;
 var lastSlash=ret.lastIndexOf("/")
 if(lastSlash>=0){
  ret=ret.substr(0,lastSlash+1)+name.replace(/\\/g,"/");
 } else {
  ret=name.replace(/\\/g,"/");
 }
 return ret;
}

/** @private */
ObjData.prototype._getMaterial=function(mesh){
 if(!this.mtl || !mesh){
  return new Material();
 } else {
  if(mesh.usemtl){
   var mtl=this.mtl.getMaterial(mesh.usemtl);
   if(!mtl)return new Material();
   return mtl;
  } else {
   return new Material();
  }
 }
}

/** @private */
MtlData.prototype._resolveTextures=function(){
  for(var i=0;i<this.list.length;i++){
    var mtl=this.list[i].data;
    if(mtl.texture){
     var resolvedName=ObjData._resolvePath(
       this.url,mtl.texture.name);
     this.list[i].data=mtl.copy()
       .setParams({"texture":resolvedName});
    }
  }
}
/**
 * Not documented yet.
 * @param {*} name
 */
MtlData.prototype.getMaterial=function(name){
  for(var i=0;i<this.list.length;i++){
    if(this.list[i].name==name){
      return this.list[i].data
    }
  }
  return null;
}
MtlData._getMaterial=function(mtl){
 var shininess=1.0;
 var ambient=null;
 var diffuse=null;
 var specular=null;
 var emission=null;
 var textureName=null;
 if(mtl.hasOwnProperty("Ns")){
  shininess=mtl["Ns"];
 }
 if(mtl.hasOwnProperty("Kd")){
  diffuse=(mtl["Kd"]);
 }
 if(mtl.hasOwnProperty("map_Kd")){
  textureName=mtl["map_Kd"];
 }
 if(mtl.hasOwnProperty("Ka")){
  ambient=(mtl["Ka"]);
 }
 if(mtl.hasOwnProperty("Ke")){
  var ke=mtl["Ke"];
  if(ke.length==1){
   emission=[ke,ke,ke];
  } else {
   emission=(ke);
  }
 }
 if(mtl.hasOwnProperty("Ks")){
  specular=(mtl["Ks"]);
 }
 if(mtl.hasOwnProperty("illum")){
  if(mtl["illum"]==0){
   // no shading
  } else if(mtl["illum"]==1){
   specular=[0,0,0];
  }
 }
 var ret=new Material(ambient,diffuse,specular,shininess,
   emission);
 if(textureName){
  ret=ret.setParams({
   "texture":textureName
  })
 }
 return ret;
}
ObjData.loadMtlFromUrl=function(url){
 return GLUtil.loadFileFromUrl(url).then(
   function(e){
     var mtl=MtlData._loadMtl(e.data);
     if(mtl.error)return Promise.reject({"url":e.url, "error": mtl.error});
     var mtldata=mtl.success;
     mtldata.url=e.url;
     mtldata._resolveTextures();
     return Promise.resolve(mtldata);
   },
   function(e){
     return Promise.reject(e)
   });
}
/**
Loads a WaveFront OBJ file (along with its associated MTL, or
material file, if available) asynchronously.
@param {string} url The URL to load.
@return {Promise} A promise that resolves when
the OBJ file is loaded successfully, whether or not its associated
MTL is also loaded successfully (the result is an ObjData object),
and is rejected when an error occurs when loading the OBJ file.
*/
ObjData.loadObjFromUrl=function(url){
 return GLUtil.loadFileFromUrl(url).then(
   function(e){
     var obj;
     obj=ObjData._loadObj(e.data);
     if(obj.error)return Promise.reject({"url":e.url, "error":obj.error});
     obj=obj.success;
     obj.url=e.url;
     if(obj.mtllib){
       // load the material file if available
       var mtlURL=ObjData._resolvePath(e.url,obj.mtllib);
       return ObjData.loadMtlFromUrl(mtlURL).then(
        function(result){
          obj.mtl=result;
          return Promise.resolve(obj);
        }, function(result){
          // MTL not loaded successfully, ignore
          obj.mtl=null;
          return Promise.resolve(obj);
        });
     } else {
       // otherwise just return the object
       return Promise.resolve(obj);
     }
   },
   function(e){
     return Promise.reject(e)
   });
}
MtlData._loadMtl=function(str){
 function xyzToRgb(xyz){
  // convert CIE XYZ to RGB
  var x=xyz[0];
  var y=xyz[1];
  var z=xyz[2];
  var rgb=[2.2878384873407613*x-0.8333676778352163*y-0.4544707958714208*z,
    -0.5116513807438615*x+1.4227583763217775*y+0.08889300175529392*z,
    0.005720409831409596*x-0.01590684851040362*y+1.0101864083734013*z]
  // ensure RGB value fits in 0..1
  var w=-Math.min(0,rgb[0],rgb[1],rgb[2]);
  if(w>0){
    rgb[0]+=w; rgb[1]+=w; rgb[2]+=w;
  }
  w=Math.max(rgb[0],rgb[1],rgb[2]);
  if(w>1){
    rgb[0]/=w; rgb[1]/=w; rgb[2]/=w;
  }
  return rgb;
 }
 var number="(-?(?:\\d+\\.?\\d*|\\d*\\.\\d+)(?:[Ee][\\+\\-]?\\d+)?)"
 var nonnegInteger="(\\d+)"
 var oneNumLine=new RegExp("^[ \\t]*(Ns|d|Tr|Ni)\\s+"+number+"\\s*$")
 var oneIntLine=new RegExp("^[ \\t]*(illum)\\s+"+nonnegInteger+"\\s*$")
 var threeNumLine=new RegExp("^[ \\t]*(Tf)\\s+"+number+"\\s+"+number
   +"\\s+"+number+"\\s*$")
 var oneOrThreeNumLine=new RegExp("^[ \\t]*(Ke)\\s+"+number+"(?:\\s+"+number
   +"\\s+"+number+")?\\s*$")
 var threeOrFourNumLine=new RegExp("^[ \\t]*(Kd|Ka|Ks)\\s+"+number+"\\s+"+number
   +"\\s+"+number+"(?:\\s+"+number+")?\\s*$")
 var threeOrFourNumLineXYZ=new RegExp("^[ \\t]*(Kd|Ka|Ks)\\s+xyz\\s+"+number+"\\s+"+number
   +"\\s+"+number+"(?:\\s+"+number+")?\\s*$")
 var mapLine=new RegExp("^[ \\t]*(map_Kd|map_bump|map_Ka|map_Ks)\\s+(.*?)\\s*$")
 var newmtlLine=new RegExp("^newmtl\\s+([^\\s]*)$")
 var faceStart=new RegExp("^f\\s+")
 var lines=str.split(/\r?\n/)
 var firstLine=true;
 var materials=[];
 var currentMat=null;
 for(var i=0;i<lines.length;i++){
  var line=lines[i];
  // skip empty lines
  if(line.length==0)continue;
  // skip comments
  if(line.charAt(0)=="#")continue;
  while(line.charAt(line.length-1)=="\\" &&
    i+1<line.length){
    // The line continues on the next line
   line=line.substr(0,line.length-1);
   line+=" "+lines[i+1];
   i++;
  }
  if(line.charAt(line.length-1)=="\\"){
   line=line.substr(0,line.length-1);
  }
  if(firstLine && !(/^newmtl\s+/)){
   return {"error": "newmtl not the first line in MTL file"};
  }
  firstLine=false;
  var e=newmtlLine.exec(line)
  if(e){
    var name=e[1];
    currentMat={};
    materials.push({name:name, data: currentMat});
    continue;
  }
  e=threeOrFourNumLine.exec(line)
  if(e){
    if(e[5]){
      currentMat[e[1]]=[parseFloat(e[2]),parseFloat(e[3]),parseFloat(e[4]),parseFloat(e[5])];
    } else {
      currentMat[e[1]]=[parseFloat(e[2]),parseFloat(e[3]),parseFloat(e[4])];
    }
    continue;
  }
  e=threeOrFourNumLineXYZ.exec(line)
  if(e){
    if(e[5]){
      currentMat[e[1]]=xyzToRgb([parseFloat(e[2]),parseFloat(e[3]),parseFloat(e[4])]);
      currentMat[e[1]][3]=parseFloat(e[5]);
    } else {
      currentMat[e[1]]=xyzToRgb([parseFloat(e[2]),parseFloat(e[3]),parseFloat(e[4])]);
    }
    continue;
  }
  e=threeNumLine.exec(line)
  if(e){
    currentMat[e[1]]=[parseFloat(e[2]),parseFloat(e[3]),parseFloat(e[4])];
    continue;
  }
  e=oneOrThreeNumLine.exec(line)
  if(e){
    if(e[3]){
      currentMat[e[1]]=[parseFloat(e[2]),parseFloat(e[3]),parseFloat(e[4])];
    } else {
      currentMat[e[1]]=[parseFloat(e[2]),parseFloat(e[2]),parseFloat(e[2])];
    }
    continue;
  }
  e=oneNumLine.exec(line)
  if(e){
    currentMat[e[1]]=parseFloat(e[2]);
    continue;
  }
  e=mapLine.exec(line)
  if(e){
     // only allow relative paths
    if((/^(?![\/\\])([^\:\?\#\s]+)$/).test(e[2])){
     currentMat[e[1]]=e[2];
    }
    continue;
  }
  e=oneIntLine.exec(line)
  if(e){
    currentMat[e[1]]=[parseInt(e[2],10)];
    continue;
  }
  return {"error": new Error("unsupported line: "+line)}
 }
 var mtl=new MtlData();
 mtl.list=materials;
 for(var i=0;i<mtl.list.length;i++){
  mtl.list[i].data=MtlData._getMaterial(mtl.list[i].data)
 }
 return {success: mtl};
}
ObjData._loadObj=function(str){
 var number="(-?(?:\\d+\\.?\\d*|\\d*\\.\\d+)(?:[Ee][\\+\\-]?\\d+)?)"
 var nonnegInteger="(\\d+)"
 var vertexOnly=new RegExp("^"+nonnegInteger+"($|\\s+)")
 var vertexNormalOnly=new RegExp("^"+nonnegInteger+"\\/\\/"+nonnegInteger+"($|\\s+)")
 var vertexUVOnly=new RegExp("^"+nonnegInteger+"\\/"+
   nonnegInteger+"($|\\s+)")
 var vertexUVNormal=new RegExp("^"+nonnegInteger+"\\/"+nonnegInteger+
   "\\/"+nonnegInteger+"($|\\s+)")
 var vertexLine=new RegExp("^v\\s+"+number+"\\s+"+number+"\\s+"+number+"\\s*$")
 var uvLine=new RegExp("^vt\\s+"+number+"\\s+"+number+"(\\s+"+number+")?\\s*$")
 var smoothLine=new RegExp("^(s)\\s+(.*)$")
 var usemtlLine=new RegExp("^(usemtl|o|g)\\s+([^\\s]*)\\s*$")
 var mtllibLine=new RegExp("^(mtllib)\\s+(?![\\/\\\\])([^\\:\\?\\#\\t\\r\\n]+)\\s*$")
 var normalLine=new RegExp("^vn\\s+"+number+"\\s+"+number+"\\s+"+number+"\\s*")
 var faceStart=new RegExp("^f\\s+")
 var lineStart=new RegExp("^l\\s+")
 var pointStart=new RegExp("^p\\s+")
 var lines=str.split(/\r?\n/)
 var vertices=[];
 var currentMesh=new Mesh();
 var normals=[];
 var uvs=[];
 var faces=[];
 var meshName=name;
 var usemtl=null;
 var currentFaces=[];
 var ret=new ObjData();
 var lastPrimitiveSeen=-1;
 var haveNormals=false;
 var vertexKind=-1;
 var mesh=new Mesh();
 var objName="";
 var oldObjName="";
 var seenFacesAfterObjName=false;
 var flat=false;
 for(var i=0;i<lines.length;i++){
  var line=lines[i];
  // skip empty lines
  if(line.length==0)continue;
  // skip comments
  if(line.charAt(0)=="#")continue;
  while(line.charAt(line.length-1)=="\\" &&
    i+1<line.length){
    // The line continues on the next line
   line=line.substr(0,line.length-1);
   line+=" "+lines[i+1];
   i++;
  }
  if(line.charAt(line.length-1)=="\\"){
   line=line.substr(0,line.length-1);
  }
  var e=vertexLine.exec(line)
  if(e){
    vertices.push([parseFloat(e[1]),parseFloat(e[2]),parseFloat(e[3])]);
    continue;
  }
  e=normalLine.exec(line)
  if(e){
    normals.push([parseFloat(e[1]),parseFloat(e[2]),parseFloat(e[3])]);
    continue;
  }
  e=uvLine.exec(line)
  if(e){
    uvs.push([parseFloat(e[1]),parseFloat(e[2])]);
    continue;
  }
  var prim=-1;
  e=faceStart.exec(line)
  if(e){
   prim=Mesh.TRIANGLES;
  } else {
   e=lineStart.exec(line)
   if(e){
    prim=Mesh.LINES;
   } else {
    e=pointStart.exec(line)
    if(e){
     prim=Mesh.POINTS;
    }
   }
  }
  if(e && prim!=-1){
    var oldline=line;
    seenFacesAfterObjName=true;
    line=line.substr(e[0].length);
    if(lastPrimitiveSeen!=-1 && lastPrimitiveSeen!=prim &&
        mesh.vertexCount()>0){
       if(!haveNormals){
         // No normals in this mesh, so calculate them
         mesh.recalcNormals(flat);
      }
      ret.meshes.push({
          "name": seenFacesAfterObjName ? objName : oldObjName,
          "usemtl": usemtl, "data": mesh});
      vertexKind=-1;
      lastPrimitiveSeen=-1;
      haveNormals=false;
      mesh=new Mesh();
    }
    mesh.mode(prim==Mesh.TRIANGLES ?
      Mesh.TRIANGLE_FAN :
      (prim==Mesh.LINES ? Mesh.LINE_STRIP : Mesh.POINTS));
    while(line.length>0){
     e=vertexOnly.exec(line)
     if(e){
      if(vertexKind!=0 || lastPrimitiveSeen!=prim){
       vertexKind=0; // position only
      }
      var vtx=parseInt(e[1],10)-1;
      mesh.normal3(0,0,0).texCoord2(0,0)
        .vertex3(vertices[vtx][0],vertices[vtx][1],vertices[vtx][2]);
        line=line.substr(e[0].length);
      continue;
     }
     e=vertexNormalOnly.exec(line)
     if(e){
      if(vertexKind!=1){
       vertexKind=1; // position/normal
      }
      var vtx=parseInt(e[1],10)-1;
      var norm=parseInt(e[2],10)-1;
      haveNormals=true;
      mesh.normal3(normals[norm][0],normals[norm][1],
         normals[norm][2])
        .texCoord2(0,0)
        .vertex3(vertices[vtx][0],vertices[vtx][1],vertices[vtx][2]);
        line=line.substr(e[0].length);
      continue;
     }
     e=vertexUVOnly.exec(line)
     if(e){
      if(vertexKind!=2 || lastPrimitiveSeen!=prim){
       vertexKind=2; // position/UV
      }
      var vtx=parseInt(e[1],10)-1;
      var uv=parseInt(e[2],10)-1;
      mesh.normal3(0,0,0)
        .texCoord2(uvs[uv][0],uvs[uv][1])
        .vertex3(vertices[vtx][0],vertices[vtx][1],vertices[vtx][2]);
        line=line.substr(e[0].length);
      continue;
     }
     e=vertexUVNormal.exec(line)
     if(e){
      if(vertexKind!=3 || lastPrimitiveSeen!=prim){
       vertexKind=3; // position/UV/normal
      }
      var vtx=parseInt(e[1],10)-1;
      var uv=parseInt(e[2],10)-1;
      var norm=parseInt(e[3],10)-1;
      haveNormals=true;
      mesh.normal3(normals[norm][0],normals[norm][1],
         normals[norm][2])
        .texCoord2(uvs[uv][0],uvs[uv][1])
        .vertex3(vertices[vtx][0],vertices[vtx][1],vertices[vtx][2]);
        line=line.substr(e[0].length);
      continue;
     }
     return {"error": new Error("unsupported face: "+oldline)}
    }
    continue;
  }
  e=usemtlLine.exec(line)
  if(e){
    if(e[1]=="usemtl"){
      // Changes the material used
      if(mesh.vertexCount()>0){
        if(!haveNormals){
         // No normals in this mesh, so calculate them
         mesh.recalcNormals(flat);
        }
        ret.meshes.push({
          "name": seenFacesAfterObjName ? objName : oldObjName,
          "usemtl": usemtl, "data": mesh});
        vertexKind=-1;
        lastPrimitiveSeen=-1;
        haveNormals=false;
        mesh=new Mesh();
      }
      usemtl=e[2];
    } else if(e[1]=="g"){
      // Starts a new group
      if(mesh.vertexCount()>0){
        if(!haveNormals){
         // No normals in this mesh, so calculate them
         mesh.recalcNormals(flat);
        }
        ret.meshes.push({
          "name": seenFacesAfterObjName ? objName : oldObjName,
          "usemtl": usemtl, "data": mesh});
        vertexKind=-1;
        lastPrimitiveSeen=-1;
        haveNormals=false;
        usemtl=null;
        mesh=new Mesh();
      }
      meshName=e[2];
    } else if(e[1]=="o"){
      oldObjName=objName;
      objName=e[2];
      seenFacesAfterObjName=false;
    }
    continue;
  }
  e=mtllibLine.exec(line)
  if(e){
    if(e[1]=="mtllib"){
      ret.mtllib=e[2];
    }
    continue;
  }
  e=smoothLine.exec(line)
  if(e){
    flat=(e[2]=="off");
    continue;
  }
  return {"error": new Error("unsupported line: "+line)}
 }
 if(!haveNormals){
   // No normals in this mesh, so calculate them
   mesh.recalcNormals(flat);
 }
 ret.meshes.push({
          "name": seenFacesAfterObjName ? objName : oldObjName,
          "usemtl": usemtl, "data": mesh});
 return {"success": ret};
}
