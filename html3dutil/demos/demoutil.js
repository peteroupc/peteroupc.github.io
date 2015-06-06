function formulaEditorHelp(){
alert(""+
"* The operators `+` `-` `*` `/` work as they do in "+
"normal arithmetic.  (The symbol `*` means 'times'.)\n"+
"* You may use `(` and `)` to group operations.\n"+
"* The symbol `^` means 'to the power of' (exponent).\n"+
"* Order of operations is parentheses, exponents, "+
"multiplication and division, addition and subtraction, "+
"with the following notes:\n"+
"  * Exponents are right-associative: "+
"     5^3^2 means 5^(3^2).\n"+
"  * Multiplication and division is left-associative: "+
"     2/3*4 means (2/3)*4, 2*4/3 means (2*4)/3; "+
"     5/4x means (5/4)*x.\n"+
"* The letters `a` to `z`, except `e`, stand for "+
"variables.\n"+
"* You may leave out the `*` if a number or closing "+
"parenthesis is followed by a variable.  Example: "+
"`3x` means `3*x`.\n"+
"* You may use the symbols `pi` and `e`, which stand "+
"for the corresponding constants.\n"+
"* Functions:  You may use the following functions:\n"+
 "  * `sin(angle)` - Sine (angle in radians).\n"+
 "  * `cos(angle)` - Cosine.\n"+
 "  * `tan(angle)` - Tangent.\n"+
 "  * `abs(value)` - Absolute value.\n"+
 "  * `acos(value)` - Inverse cosine.\n"+
 "  * `asin(value)` - Inverse sine.\n"+
 "  * `atan(value)` - Inverse tangent.\n"+
 "  * `sqrt(value)` - Square root.\n"+
 "  * `ln(value)` - Natural logarithm.\n")
}

function addLink(name,func){
 var s=document.createElement("span")
 var ins=document.createElement("span")
 ins.innerHTML=" - "
 var a=document.createElement("a")
 a.href="javascript:void(null)"
 a.onclick=function(){ func() }
 a.innerHTML=name
 s.appendChild(ins)
 s.appendChild(a)
 document.getElementById("links").appendChild(s)
}

function addRange(label,min,max,step,defvalue,func){
 var div=document.createElement("div")
 var lbl=document.createElement("span")
 lbl.innerHTML=label
 var defvaluelbl=document.createElement("span")
 defvaluelbl.innerHTML=defvalue
 var input=document.createElement("input")
 input.setAttribute("type","range")
 input.setAttribute("value",""+defvalue)
 input.setAttribute("min",""+min)
 input.setAttribute("max",""+max)
 input.setAttribute("step",""+step)
 var oldvalue=[defvalue];
 input.addEventListener("input",function(e){
  var val=e.target.value*1.0
  if(oldvalue[0]!=val){
   defvaluelbl.innerHTML=val+""
   if(func)func(val);
   oldvalue[0]=val
  }
 })
 div.appendChild(lbl)
 div.appendChild(input)
 div.appendChild(defvaluelbl)
 return div
}

function setRanges(ranges){
 var settings=document.getElementById("settings")
 settings.innerHTML=""
 for(var i=0;i<ranges.length;i++){
  settings.appendChild(ranges[i]);
 }
}

function meshToJson(mesh){
 function colorToHex(x){
  var r=Math.round(x[0]*255);
  var g=Math.round(x[1]*255);
  var b=Math.round(x[2]*255);
  r=Math.min(Math.max(r,0),255);
  g=Math.min(Math.max(g,0),255);
  b=Math.min(Math.max(b,0),255);
  return (r<<16)|(g<<8)|b;
 }
 var roundNum=function(num){
  return Math.round(num*1000000)/1000000;
 }
 var faces=[];
 var vertices=[];
 var colors=[];
 var normals=[];
 var texcoords=[[]];
 var json={
   "metadata":{"formatVersion":3.1},
   "materials":[{"DbgColor":0xffffff, "DbgIndex":0,
     "DbgName":"Untitled", "colorDiffuse":[1,1,1],
     "colorAmbient":[1,1,1],"colorSpecular":[1,1,1],
     "specularCoef":5}]
 }
 json.faces=faces;
 json.vertices=vertices;
 json.colors=colors;
 json.uvs=texcoords;
 json.normals=normals;
 function pushItemAndMaybeReuse3(obj,x,y,z){
  var idx=obj.length;
  var index=idx/3;
  var endIdx=Math.max(0,idx-48);
  for(var i=idx-3;i>=endIdx;i-=3){
   if(obj[i]==x && obj[i+1]==y && obj[i+2]==z){
    return i/3;
   }
  }
  obj.push(x)
  obj.push(y)
  obj.push(z)
  return index;
 }
 function pushItemAndMaybeReuse2(obj,x,y){
  var idx=obj.length;
  var index=idx/2;
  var endIdx=Math.max(0,idx-48);
  for(var i=idx-2;i>=endIdx;i-=2){
   if(obj[i]==x && obj[i+1]==y){
    return i/2;
   }
  }
  obj.push(x)
  obj.push(y)
  return index;
 }
 function pushItemAndMaybeReuse1(obj,x){
  var idx=obj.length;
  var index=idx;
  var endIdx=Math.max(0,idx-48);
  for(var i=idx-1;i>=endIdx;i-=1){
   if(obj[i]==x){
    return i;
   }
  }
  obj.push(x)
  return index;
 }
 mesh.enumPrimitives(function(prim){
  if(prim.length!=3)throw new Error("lines and points not supported");
  var idx=faces.length;
  var flags=0;
  faces.push(0);
  for(var j=0;j<3;j++){
   faces.push(
    pushItemAndMaybeReuse3(vertices,
      roundNum(prim[j].position[0]),
      roundNum(prim[j].position[1]),
      roundNum(prim[j].position[2])))
  }
  if(prim[0].uv && prim[1].uv && prim[2].uv){
   var tc=texcoords[0];
   for(var j=0;j<3;j++){
    faces.push(
     pushItemAndMaybeReuse2(tc,
      roundNum(prim[j].uv[0]),
      roundNum(prim[j].uv[1])))
   }
   flags|=0x08;
  }
  if(prim[0].normal && prim[1].normal && prim[2].normal){
   for(var j=0;j<3;j++){
    faces.push(
     pushItemAndMaybeReuse3(normals,
      roundNum(prim[j].normal[0]),
      roundNum(prim[j].normal[1]),
      roundNum(prim[j].normal[2])))
   }
   flags|=0x20;
  }
  if(prim[0].color && prim[1].color && prim[2].color){
   for(var j=0;j<3;j++){
    faces.push(
     pushItemAndMaybeReuse1(colors,
      colorToHex(prim[j].color)))
   }
   flags|=0x80;
  }
  faces[idx]=flags;
 })
 return JSON.stringify(json);
}

function saveString(string,type,filename){
 extension=".txt"
 type=type||"text/plain"
 if(type=="text/plain")extension=".txt"
 else if(type=="application/json")extension=".json"
 else if(type=="model/vnd.collada+xml")extension=".dae"
 else if(type.indexOf("+xml")>=0)extension=".xml"
  var a = document.createElement('a');
  var utf8=new TextEncoder("utf-8").encode(string)
  var blob = new Blob([utf8], {'type': type});
  a.href = window.URL.createObjectURL(blob);
  a.download = filename || "savefile"+extension;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function updateShape(func){
  var settings=document.getElementById("settings-link")
  if(!settings){
    settings=document.getElementById("settings")
    if(settings){
        var div=document.createElement("div")
        var a = document.createElement('a');
        a.href="javascript:void(null)"
        a.id="settings-link"
        a.innerHTML="Save this model (JSON)"
        a.addEventListener("click",function(){
           var json=meshToJson(func(allsettings));
           saveString(json,"application/json","model.json")
        });
        div.appendChild(a)
        settings.appendChild(div)
    }
  }
  shapeGroup.removeShape(shapeGroup.shapes[0]);
  shapeGroup.addShape(scene.makeShape(func(allsettings)).setMaterial(
    new Material().setParams({
     "diffuse":"black",
     "specular":"white",
     "shininess":10
    })))
}

function pushSettings(updateMeshFunc,settings){
 function settingOnChange(name,updateMeshFunc){
   return function(val){
     allsettings[name]=val
     updateShape(updateMeshFunc);
   }
 }
 var ranges=[];
 for(var setting in settings){
  if(settings[setting] && settings[setting].constructor==Array){
   var name=setting
   var label=settings[setting][0]
   var defvalue=settings[setting][1]
   var min=settings[setting][2]
   var max=settings[setting][3]
   var step=settings[setting][4]
   if(typeof allsettings[name]=="undefined"){
    allsettings[name]=defvalue;
   }
   ranges.push(addRange(label,min,max,step,allsettings[name],
     settingOnChange(name,updateMeshFunc)))
  }
 }
 setRanges(ranges);
 updateShape(updateMeshFunc);
};
window.addEventListener("load",function(){
 var a=document.createElement("a")
 a.setAttribute("style","margin-left:2px;margin-top:2px;margin-bottom:2px;position:absolute;left:80%;top:0;"+
   "background-color:white;text-align:center;text-decoration:none;font-weight:bold")
 a.href="javascript:void(null)"
 a.innerHTML="View Source"
 var e=document.createElement("pre")
 e.setAttribute("style","border:2px solid;margin:2px 2px 2px 2px;left:10;padding:2px 2px 2px 2px;"+
  "background:rgba(255,255,255,0.8);left:10%;width:85%;height:80%;overflow:scroll;position:absolute;float:right;top:2em")
 e.innerHTML=document.getElementById("demo").textContent.replace(/</g,"&lt;")
 e.style.display="none"
 document.body.appendChild(a)
 document.body.appendChild(e)
 var viewed=false;
 a.addEventListener("click",function(){
   if(viewed){
    viewed=false;
    a.innerHTML="View Source"
    e.style.display="none"
   } else {
    viewed=true;
    a.innerHTML="Hide Source"
    e.style.display="block"
   }
 })
})
