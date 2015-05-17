var FrameCounter=function(){
 this.fps=-1;
 this.lastFrame=-1;
 this.frameGaps=[]
 this.frameCount=0;
}
/**
 * Not documented yet.
 */
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
/**
 * Not documented yet.
 */
FrameCounter.prototype.getFPS=function(){
 return this.fps;
}

function FrameCounterDiv(scene){
 var canvas=scene.getContext().canvas
 this.div=FrameCounterDiv._makeDiv(canvas);
 this.count=0;
 this.scene=scene;
 this.fc=new FrameCounter();
}
FrameCounterDiv._makeDiv=function(element){
 var div=document.createElement("div")
 div.style.backgroundColor="white"
 div.style.position="absolute"
 div.style.left=element.offsetLeft+"px"
 div.style.top=element.offsetTop+"px"
 document.body.appendChild(div)
 return div
}
/**
 * Not documented yet.
 */
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

function PrimitiveCounter(scene){
 var canvas=scene.getContext().canvas
 this.div=FrameCounterDiv._makeDiv(canvas);
 this.count=0;
 this.scene=scene;
}
/**
 * Not documented yet.
 */
PrimitiveCounter.prototype.update=function(){
 var v=this.scene.vertexCount();
 var p=this.scene.primitiveCount();
 this.div.innerHTML=v+" vertices, "+p+" primitives"
}
