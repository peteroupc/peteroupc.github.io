/*
Quick-and-dirty MathML polyfill.

Written by Peter O.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://peteroupc.github.io/
*/

(function(window){

var formatMathML=function(element){
 var name=element.tagName.toUpperCase();
 var elements=[];
 var text=(element.textContent||"")
 var ret="";
 for(var i=0;i<element.childNodes.length;i++){
  var cn=element.childNodes[i];
  if(cn.tagName){
   elements.push(cn);
  }
 }
 if(name=="MATH"){
  for(var i=0;i<elements.length;i++){
   ret+=formatMathML(elements[i])
  }
 } if(name=="MFENCED"){
  var open=element.getAttribute("open")
  var closed=element.getAttribute("close")
  ret="<table><tr><td style='font-size: 6em'>"+open+"</td>"
  for(var i=0;i<elements.length;i++){
   ret+="<td>"+formatMathML(elements[i])+"</td>"
  }
  ret+="<td style='font-size: 6em'>"+closed+"</td></tr>"
 } else if(name=="MTABLE"){
  ret="<table>"
  for(var i=0;i<elements.length;i++){
   ret+=formatMathML(elements[i])
  }
  ret+="</table>"
 } else if(name=="MTR"){
  ret="<tr>"
  for(var i=0;i<elements.length;i++){
   ret+=formatMathML(elements[i])
  }
  ret+="</tr>"
 } else if(name=="MTD"){
  ret="<td style='padding: 3px'>"
  for(var i=0;i<elements.length;i++){
   ret+=formatMathML(elements[i])
  }
  ret+="</td>"
 } else if(name=="MN" || name=="MI" || name=="MO"){
  ret+=text
 }
 return ret;
}

window.addEventListener("load",function(){
 // Recent Gecko-based browsers already support MathML
 if(window.navigator.userAgent.indexOf("Gecko/")>=0)
  return;
 var mathelements=window.document.getElementsByTagName(
   "math")
 var els=[];
 for(var i=0;i<mathelements.length;i++){
  els.push(mathelements[i])
 }
 for(var i=0;i<els.length;i++){
   var el=els[i];
   var div=document.createElement("div")
   div.innerHTML=formatMathML(el)
   el.parentNode.insertBefore(div,el)
   el.parentNode.removeChild(el)
 }
})

})(this);
