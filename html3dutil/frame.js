var FrameCounter=function(){
 this.fps=-1;
 this.lastFrame=-1;
 this.frameGaps=[]
 this.frameCount=0;
}
FrameCounter.prototype.update=function(){
 var now=("performance" in window) ?
   window.performance.now() : (new Date().getTime()*1000);
  if(this.lastFrame>=0){
    var gap=now-this.lastFrame;
    if(this.frameGaps.length>300)
     this.frameGaps.shift();
    if(gap>5000){
     // treat as a discontinuity, so discard all the
     // frame gaps recorded so far
     this.frameGaps=[];
    }
    this.frameGaps.push(gap);
  }
  this.lastFrame=now;
  this.frameCount++;
  if(this.frameGaps.length>0 && this.frameCount>=30){
    this.frameCount=0;
    var total=0;
    for(var i=0;i<this.frameGaps.length;i++){
      total+=this.frameGaps[i];
    }
    total/=1.0*this.frameGaps.length;
    this.fps=(total<=0) ? 60 : 1000.0/total;
  }
}
FrameCounter.prototype.getFPS=function(){
 return this.fps;
}
function FrameCounterDiv(scene){
 var canvas=scene.getContext().canvas
 var div=document.createElement("div")
 div.style.backgroundColor="white"
 div.style.position="absolute"
 div.style.left=canvas.offsetLeft+"px"
 div.style.top=canvas.offsetTop+"px"
 document.body.appendChild(div)
 this.div=div;
 this.count=0;
 this.fc=new FrameCounter();
}
FrameCounterDiv.prototype.update=function(){
 this.fc.update();
 this.count+=1;
 if(this.count>=20){
  var fps=this.fc.getFPS();
  fps=Math.round(fps*100);
  fps/=100;
  if(fps>=0){
   this.div.innerHTML=fps+" fps"
   this.count=0;
  }
 }
}
