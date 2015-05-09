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
