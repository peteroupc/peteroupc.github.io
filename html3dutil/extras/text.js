/*
Written by Peter O. in 2016.

Any copyright is dedicated to the Public Domain.
http://creativecommons.org/publicdomain/zero/1.0/
If you like this, you should donate to Peter O.
at: http://upokecenter.dreamhosters.com/articles/donate-now-2/
*/
/* global GLUtil, Mesh, Promise */
(function(exports){
"use strict";
if(!GLUtil){ GLUtil={}; }

/**
* Renderer for drawing text using bitmap fonts.  This class supports
* traditional bitmap fonts and signed distance field fonts.<p>
* Bitmap fonts consist of a font definition file and one
* or more bitmaps containing the shape of each font glyph.  The glyphs
* are packed so they take as little space as possible and the glyphs don't
* overlap each other.<p>
* In a signed distance field font, each pixel's alpha value depends on the
* distance from that location to the edge of the glyph.  A pixel alpha less
* than 0.5 (127 in most image formats) means the pixel is outside the
* glyph, greater than 0.5 means the pixel is inside the glyph, and 0 (for
* outside the glyph) and 1 (for inside the glyph) means the pixel is
* outside a buffer zone formed by the glyph's outline.  Each glyph is usually
* given extra space to accommodate the signed distance field information.<p>
* The font definition file formats supported are text (".fnt"),
* JSON (".json"), binary (".fnt" or ".bin"), and XML (".xml").
* The text and binary file formats are specified at
* <a href="http://www.angelcode.com/products/bmfont/doc/file_format.html">this
* page</a>.  The XML format is very similar to the text file format.
* The JSON format is described at
* <a href="https://github.com/Jam3/load-bmfont/blob/master/json-spec.md">this
* page</a>.
* <p>
* See <a href="https://github.com/mattdesl/text-modules#bitmap-text">this page</a>
* for a list of bitmap font generation tools. (No one tool is recommended over any
* other, and the mention of this link is not an endorsement or sponsorship
* of any particular tool.)
* <p>This class is considered a supplementary class to the
* Public Domain HTML 3D Library and is not considered part of that
* library. <p>
* To use this class, you must include the script "extras/text.js"; the
 * class is not included in the "glutil_min.js" file which makes up
 * the HTML 3D Library.  Example:<pre>
 * &lt;script type="text/javascript" src="extras/text.js">&lt;/script></pre>
* @class
* @alias TextRenderer
* @param {glutil.Scene3D|glutil.Subscene3D} scene 3D scene to load font textures with.
*/
function TextRenderer(scene){
 this.scene=scene;
 this.shader=new ShaderInfo(null,TextRenderer._textShader());
 this.fontTextures=[]
}
/** @private */
TextRenderer.prototype._getFontTextures=function(font){
 for(var i=0;i<this.fontTextures.length;i++){
  if(this.fontTextures[i][0]==font){
   return this.fontTextures[i][1]
  }
 }
 return []
}
/** @private */
TextRenderer.prototype._setFontTextures=function(font,textureList){
 for(var i=0;i<this.fontTextures.length;i++){
  if(this.fontTextures[i][0]==font){
   this.fontTextures[i][1]=textureList;
   return;
  }
 }
 this.fontTextures.push([font,textureList]);
}

/**
* Creates a shape containing the primitives needed to
* draw text in the given position, size, and color.
* @param {TextFont} font The bitmap font to use when drawing the text.
* @param {String} string The text to draw.  Line breaks ("\n") are recognized
* by this method.
* @param {Number} xPos X-coordinate of the top left corner of the text.
* @param {Number} yPos Y-coordinate of the top left corner of the text.
* @param {Number} height Size of the text in units.
* @param {string|Array<Number>} [color] The color to draw the text with.
* An array of three or
* four color components; or a string
* specifying an [HTML or CSS color]{@link glutil.GLUtil.toGLColor}.
* If null or omitted, the bitmap font is assumed to be a signed distance field
* font.
*/
TextRenderer.prototype.textShape=function(font, str, xPos, yPos, height, color){
 var group=new ShapeGroup();
 var fontTextures=this._getFontTextures(font);
 var meshesForPage=font.makeShapeMeshes(str,xPos,yPos,height);
 for(var i=0;i<meshesForPage.length;i++){
  var mfp=meshesForPage[i];
  if(!mfp || !fontTextures[i])continue;
  var sh=new Shape(mfp);
  var material=new Material(
     color||[0,0,0,0],
     color||[0,0,0,0]).setParams({
   "texture":fontTextures[i],
   "basic":true,
   "shader":color ? this.shader : null
  });
  sh.setMaterial(material);
  group.addShape(sh);
 }
 return group;
}
/**
* Loads a bitmap font definition from a file,
* as well as the bitmaps used by that font, and maps them
* to WebGL textures.  See {@link TextRenderer} for
* more information.
* @param {String} fontFileName The URL of the font data file
* to load.  The following file extensions are read as the following formats:<ul>
* <li>".xml": XML</li>
* <li>".json": JSON</li>
* <li>".bin": Binary</li>
* <li>".fnt": Text or binary</li>
* <li>All others: Text</li></ul>
* @returns {Promise<TextFont>} A promise that is resolved
* when the font data and all the textures it uses are loaded successfully (the result will be
* a TextFont object), and is rejected when an error occurs.
*/
TextRenderer.prototype.loadFont=function(fontFileName){
 var thisObject=this;
 // TODO: Don't rely on an instance variable
 // treated as private; maybe take TextureLoader instead
 var loader=this.scene._textureLoader;
 return TextFont.loadWithTextures(fontFileName,loader)
   .then(function(f){
     var textures=[];
     for(var i=0;i<f.pages.length;i++){
      textures.push(loader.getTexture(f.pages[i]));
     }
     thisObject._setFontTextures(f,textures);
     return Promise.resolve(f);
   });
}
/**
* Represents a bitmap font.
* NOTE: The constructor should not be called directly by applications.
* Use the {@link TextFont.load} method to get a TextFont object.  This
* constructor's parameters are undocumented and are subject to change.
* @class
* @alias TextFont
*/
function TextFont(fontinfo,chars,pages,kernings,common,fileUrl){
 this.info=fontinfo
 this.common=common
 if(this.info){
  this.info.padding=TextFont._toArray(this.info.padding,4)
  this.info.spacing=TextFont._toArray(this.info.spacing,2)
 }
 this.fileUrl=fileUrl;
 this.chars=chars
 this.pages=pages
 this.kern=[];
 for(var i=0;i<kernings.length;i++){
  var k=kernings[i]
  if(!this.kern[k.first])this.kern[k.first]=[]
  this.kern[k.first][k.second]=k
 }
}
/** @private */
TextFont._toArray=function(str,minLength){
 var spl;
 if(typeof str==="string"){
  spl=str.split(",")
  for(var i=0;i<spl.length;i++){
   spl[i]=parseInt(spl[i])
  }
 } else if(str!=null &&
   str.constructor==Array && str.length>=minLength){
  return str;
 } else {
  spl=[]
 }
 for(var i=spl.length;i<minLength;i++){
  spl.push(0)
 }
 return spl
}

/**
 * Calculates the width and height of a text string when
 * drawn using this font.
 * @param {String} str A text string.
 * @param {Number} height The line height to use when
 * measuring the text.  Cannot be less than 0.
 * @returns {Array<Number>} An array of two numbers;
 * the first is the width of the string, and the second is the
 * height of the string (taking into account line feed characters,
 * U+000A, that break lines).
 */
TextFont.prototype.measure=function(str,height){
 if(height<0)throw new Error;
 var haveChar=false;
 var scale=height/this.common.lineHeight;
 var lastChar=-1;
 var xSize=0;
 var xPos=0;
 var yPos=0;
 for(var i=0;i<str.length;i++){
  var c=str.charCodeAt(i);
  if(c>=0xd800 && c<0xdc00 && i+1<str.length){
   c = 0x10000 + ((c - 0xd800) << 10) + (str.charCodeAt(i+1) -
          0xdc00);
   i++;
  } else if(c>=0xd800 && c<0xe000){
   c=0xfffd
  }
  if(c === 0x0a){
   yPos+=this.common.lineHeight*scale;
   xPos=0;
   lastChar=c;
   continue;
  }
  var ch=this.chars[c]||this.chars[0]||null
  if(ch){
   xSize=Math.max(xSize,xPos+ch.width*scale);
   haveChar=true;
   if(lastChar!=-1){
    if(this.kern[lastChar] && this.kern[lastChar][c]){
     xPos+=this.kern[lastChar][c].amount*scale;
    }
   }
   xPos+=ch.xadvance*scale;
  }
  lastChar=c;
 }
 var ySize=yPos;
 if(haveChar)ySize+=this.common.lineHeight*scale;
 return [xSize,ySize];
}

/**
 * Not documented yet.
 * @param {*} str
 * @param {*} xPos
 * @param {*} yPos
 * @param {*} height
 */
TextFont.prototype.makeShapeMeshes=function(str,xPos,yPos,height){
 var meshesForPage=[];
 var scale=height/this.common.lineHeight;
 var recipPageWidth=1.0/this.common.scaleW;
 var recipPageHeight=1.0/this.common.scaleH;
 var startXPos=xPos;
 var lastChar=-1;
 for(var i=0;i<str.length;i++){
  var c=str.charCodeAt(i);
  if(c>=0xd800 && c<0xdc00 && i+1<str.length){
   c = 0x10000 + ((c - 0xd800) << 10) + (str.charCodeAt(i+1) -
          0xdc00);
   i++;
  } else if(c>=0xd800 && c<0xe000){
   c=0xfffd
  }
  if(c === 0x0a){
   yPos+=this.common.lineHeight*scale;
   xPos=startXPos;
   lastChar=c;
   continue;
  }
  var ch=this.chars[c]||this.chars[0]||null
  if(ch){
   var sx=ch.x*recipPageWidth;
   var sy=ch.y*recipPageHeight;
   var sx2=(ch.x+ch.width)*recipPageWidth;
   var sy2=(ch.y+ch.height)*recipPageHeight;
   var xo=ch.xoffset*scale;
   var yo=ch.yoffset*scale;
   var vx=xPos+xo;
   var vy=yPos+yo;
   var vx2=vx+ch.width*scale;
   var vy2=vy+ch.height*scale;
   var chMesh=meshesForPage[ch.page];
   if(!chMesh){
    chMesh=new Mesh();
    meshesForPage[ch.page]=chMesh;
   }
   chMesh.mode(Mesh.TRIANGLE_STRIP)
     .texCoord2(sx,1-sy)
     .vertex2(vx,vy)
     .texCoord2(sx,1-sy2)
     .vertex2(vx,vy2)
     .texCoord2(sx2,1-sy)
     .vertex2(vx2,vy)
     .texCoord2(sx2,1-sy2)
     .vertex2(vx2,vy2);
   if(lastChar!=-1){
    if(this.kern[lastChar] && this.kern[lastChar][c]){
     xPos+=this.kern[lastChar][c].amount*scale;
    }
   }
   xPos+=ch.xadvance*scale;
  }
  lastChar=c;
 }
 return meshesForPage;
}
/** @private */
TextFont._resolvePath=function(path,name){
 // Relatively dumb for a relative path
 // resolver, but sufficient for TextFont's purposes
 "use strict";
var ret=path;
 var lastSlash=ret.lastIndexOf("/");
 if(lastSlash>=0){
  ret=ret.substr(0,lastSlash+1)+name.replace(/\\/g,"/");
 } else {
  ret=name.replace(/\\/g,"/");
 }
 return ret;
};
/** @private */
TextFont._elementToObject=function(element){
 var attrs=element.getAttributeNames();
 var x={};
 for(var i=0;i<attrs.length;i++){
  var n=attrs[i];
  if(n=="face" || n=="charset" || n=="file" || n=="padding" ||
     n=="spacing"){
    x[n]=element.getAttribute(n)
   } else {
    x[n]=parseInt(element.getAttribute(n))
    if(isNaN(x[n]))x[n]=0;
   }
 }
 return x;
}
/** @private */
TextFont._loadJsonFontInner=function(data){
 var xchars=[]
 var xpages=[]
 var xkernings=[]
 var json=data.data
 if(!json.pages || !json.chars || !json.info ||
   !json.common){
   return null;
 }
  for(var i=0;i<json.chars.length;i++){
   xchars[json.chars[i].id]=json.chars[i]
  }
  for(var i=0;i<json.pages.length;i++){
   var p=json.pages[i]
   xpages[i]=TextFont._resolvePath(data.url,p);
  }
 if(json.kernings){
   xkernings=json.kernings
 }
 return new TextFont(json.info,xchars,xpages,xkernings,
   json.common,data.url)
}
/** @private */
TextFont._loadXmlFontInner=function(data){
 var doc=data.data
 var commons=doc.getElementsByTagName("common")
 if(commons.length === 0)return null;
 var infos=doc.getElementsByTagName("info")
 if(infos.length === 0)return null;
 var pages=doc.getElementsByTagName("page")
 if(pages.length === 0)return null;
 var chars=doc.getElementsByTagName("char")
 var kernings=doc.getElementsByTagName("kerning")
 var xchars=[]
 var xpages=[]
 var xkernings=[]
 var xcommons=TextFont._elementToObject(commons[0])
 var xinfos=TextFont._elementToObject(infos[0])
 for(var i=0;i<pages.length;i++){
  var p=TextFont._elementToObject(pages[i])
  xpages[p.id]=TextFont._resolvePath(data.url,p.file);
 }
 for(var i=0;i<chars.length;i++){
  var p=TextFont._elementToObject(chars[i])
  xchars[p.id]=p
 }
 for(var i=0;i<kernings.length;i++){
  var p=TextFont._elementToObject(kernings[i])
  xkernings.push(p)
 }
 return new TextFont(xinfos,xchars,xpages,xkernings,xcommons,data.url)
}
/** @private */
TextFont._decodeUtf8=function(data,offset,endOffset){
var ret=[];
var cp,bytesSeen;
var bytesNeeded=0;
var lower=0x80;
var upper=0xbf;
 if(offset>endOffset)throw new Error();
 while (true) {
          if (offset >= endOffset) {
            if (bytesNeeded != 0) {
              return null;
            }
            return ret.join("");
          }
          var b = data.getUint8(offset++);
          if (bytesNeeded === 0) {
            if ((b & 0x7f) == b) {
              ret.push(String.fromCharCode(b));
              continue;
            } else if (b >= 0xc2 && b <= 0xdf) {
              bytesNeeded = 1;
              cp = (b - 0xc0) << 6;
            } else if (b >= 0xe0 && b <= 0xef) {
              lower = (b === 0xe0) ? 0xa0 : 0x80;
              upper = (b === 0xed) ? 0x9f : 0xbf;
              bytesNeeded = 2;
              cp = (b - 0xe0) << 12;
            } else if (b >= 0xf0 && b <= 0xf4) {
              lower = (b === 0xf0) ? 0x90 : 0x80;
              upper = (b === 0xf4) ? 0x8f : 0xbf;
              bytesNeeded = 3;
              cp = (b - 0xf0) << 18;
            } else {
              return null;
            }
            continue;
          }
          if (b < lower || b > upper) {
            return null;
          } else {
            lower = 0x80;
            upper = 0xbf;
            ++bytesSeen;
            cp += (b - 0x80) << (6 * (bytesNeeded - bytesSeen));
            if (bytesSeen != bytesNeeded) {
              continue;
            }
            var cpRet = cp;
            cp = 0;
            bytesSeen = 0;
            bytesNeeded = 0;
            if(cpRet>=0x10000){
              ret.push(String.fromCharCode(((cpRet - 0x10000) >> 10) + 0xd800));
              ret.push(String.fromCharCode(((cpRet - 0x10000) & 0x3ff) + 0xdc00));
            } else {
              ret.push(String.fromCharCode(cpRet));
            }
          }
        }
}
/** @private */
TextFont._loadBinaryFontInner=function(data){
 var view=new DataView(data.data)
 var offset=4;
 if(view.getUint8(0)!=66||
  view.getUint8(1)!=77||
  view.getUint8(2)!=70||
  view.getUint8(3)!=3){
  throw new Error()
   return null;
 }
 var info={}
 var chars=[]
 var pages=[]
 var kernings=[]
 var commons={}
 var havetype=[false,false,false,false,false,false]
 function utf8stringsize(view,startIndex,endIndex){
   for(var i=startIndex;i<endIndex;i++){
     if(view.getUint8(i) === 0){
      return (i-startIndex)
     }
   }
   return -1
 }
 function utf8string(view,startIndex,endIndex){
   for(var i=startIndex;i<endIndex;i++){
     if(view.getUint8(i) === 0){
      return TextFont._decodeUtf8(view,startIndex,i);
     }
   }
   return null
 }
 while (offset<view.byteLength) {
  var type=view.getUint8(offset)
  var size=view.getUint32(offset+1,true)
  if(type==null || type<1 || type>5){return null;}
  if(havetype[type]){return null;}
  var newOffset=offset+5+size;
  havetype[type]=true
  offset+=5
  switch(type){
   case 1:
    if(size<14){return null;}
    info.fontSize=view.getInt16(offset,true);
    info.bitField=view.getUint8(offset+2);
    var cs=view.getUint8(offset+3);
    // return null if charset is unsupported
    if(cs!=0){return null;}
    info.charSet=""; // ignore charSet field, not used
    info.stretchH=view.getUint16(offset+4,true)
    info.aa=view.getUint8(offset+6)
    info.padding=[
      view.getUint8(offset+7),
      view.getUint8(offset+8),
      view.getUint8(offset+9),
      view.getUint8(offset+10)],
    info.spacing=[
      view.getUint8(offset+11),
      view.getUint8(offset+12)]
    info.outline=view.getUint8(offset+13)
    info.fontName=utf8string(view,offset+14,offset+size)
    if(info.fontName==null){return null;}
    break;
   case 2:
    commons.lineHeight=view.getUint16(offset,true)
    commons.base=view.getUint16(offset+2,true)
    commons.scaleW=view.getUint16(offset+4,true)
    commons.scaleH=view.getUint16(offset+6,true)
    commons.pages=view.getUint16(offset+8,true)
    commons.bitField=view.getUint8(offset+10)
    commons.alphaChnl=view.getUint8(offset+11)
    commons.redChnl=view.getUint8(offset+12)
    commons.greenChnl=view.getUint8(offset+13)
    commons.blueChnl=view.getUint8(offset+14)
    break;
   case 3:
    var ss=utf8stringsize(view,offset,offset+size)
    if(ss<0){return null}
    for(var x=0;x<size;x+=ss+1){
     var name=utf8string(view,offset,offset+ss+1)
     if(name==null){return null}
     pages.push(TextFont._resolvePath(data.url,name))
     offset+=ss+1
    }
    break;
   case 4:
    for(var x=0;x<size;x+=20){
     var ch={}
     ch.id=view.getUint32(offset,true)
     ch.x=view.getUint16(offset+4,true)
     ch.y=view.getUint16(offset+6,true)
     ch.width=view.getUint16(offset+8,true)
     ch.height=view.getUint16(offset+10,true)
     ch.xoffset=view.getInt16(offset+12,true)
     ch.yoffset=view.getInt16(offset+14,true)
     ch.xadvance=view.getInt16(offset+16,true)
     ch.page=view.getUint8(offset+18)
     ch.chnl=view.getUint8(offset+19)
     offset+=20
     chars[ch.id]=ch
    }
    break;
   case 5:
    for(var x=0;x<size;x+=10){
     var ch={}
     ch.first=view.getUint32(offset,true)
     ch.second=view.getUint32(offset+4,true)
     ch.amount=view.getInt16(offset+8,true)
     kernings.push(ch)
    }
    break;
  }
  offset=newOffset;
 }
if(!havetype[1] || !havetype[2] || !havetype[3]){
  return null;}
 return new TextFont(info,chars,pages,kernings,commons,data.url)
}
/** @private */
TextFont._loadTextFontInner=function(data){
  var text=data.data
  var lines=text.split(/\r?\n/)
  var pages=[]
  var chars=[]
  var kernings=[]
  var common=null;
  var fontinfo=null;
  var firstline=true;
  for(var i=0;i<lines.length;i++){
   var e=(/^(\w+)\s+(.*)/).exec(lines[i]);
   if(!e)continue;
   var word=e[1];
   var rest=e[2];
   var hash={};
   while(true){
     e=(/^((\w+)\=(\"[^\"]+\"|\S+(?:\s+(?![^\s\=]+\=)[^\s\=]+)*)\s*)/).exec(rest)
     if(!e)break;
     var key=e[2];
     var value=e[3];
     if(value.charAt(0)=='"'){
      value=value.substring(1,value.length-1);
     } else if(value.match(/^-?\d+$/)){
      value=parseInt(value)|0;
     }
     hash[key]=value;
     rest=rest.substr(e[1].length);
   }
   if(word=="page"){
    pages[hash.id|0]=TextFont._resolvePath(data.url,hash.file);
   }
   if(word=="char" && hash.id!=null){
    chars[hash.id|0]=hash;
   }
   if(word=="common"){
    if(common)return null;
    common=hash
   }
   if(word=="kerning" && hash.first!=null){
    kernings.push(hash)
   }
   if(word=="info" && hash.face!=null){
    if(fontinfo)return null;
    fontinfo=hash
   }
  }
  if(!fontinfo || !common || pages.length === 0){
   return null;
  }
  return new TextFont(fontinfo,chars,pages,kernings,common,data.url)
}
/**
* Loads a bitmap font definition from a file along with the textures
* used by that font.
* @param {String} fontFileName The URL of the font data file
* to load.  The following file extensions are read as the following formats:<ul>
* <li>".xml": XML</li>
* <li>".json": JSON</li>
* <li>".bin": Binary</li>
* <li>".fnt": Text or binary</li>
* <li>All others: Text</li></ul>
 * @param {glutil.TextureLoader} textureLoader
* @returns {Promise} A promise that is resolved
* when the font data and textures are loaded successfully (the result will be
* a TextFont object), and is rejected when an error occurs.
*/
TextFont.loadWithTextures=function(fontFileName,textureLoader){
 if(!textureLoader){
  return TextFont.load(fontFileName);
 }
 return TextFont.load(fontFileName).then(function(font){
  var textures=[]
  for(var i=0;i<font.pages.length;i++){
   if(!font.pages[i])continue
   textures.push(font.pages[i])
  }
  var thisObject=font;
  return textureLoader.loadTexturesAll(textures).then(function(r){
     return Promise.resolve(font);
  },function(r){
     return Promise.reject({"url":font.fileUrl,"results":r});
  });
 });
}

/**
* Loads a bitmap font definition from a file.
* Note that this method only loads the font data and not the bitmaps
* used to represent the font.
* @param {String} fontFileName The URL of the font data file
* to load.  The following file extensions are read as the following formats:<ul>
* <li>".xml": XML</li>
* <li>".json": JSON</li>
* <li>".bin": Binary</li>
* <li>".fnt": Text or binary</li>
* <li>All others: Text</li></ul>
* @returns {Promise<TextFont>} A promise that is resolved
* when the font data is loaded successfully (the result will be
* a TextFont object), and is rejected when an error occurs.
*/
TextFont.load=function(fontFileName){
 if((/\.xml$/i.exec(fontFileName))){
  return GLUtil.loadFileFromUrl(fontFileName,"xml").then(
   function(data){
    var ret=TextFont._loadXmlFontInner(data)
    return ret ? Promise.resolve(ret) : Promise.reject({"url":data.url})
   })
 } else if((/\.bin$/i.exec(fontFileName))){
  return GLUtil.loadFileFromUrl(fontFileName,"arraybuffer").then(
   function(data){
    var ret=TextFont._loadBinaryFontInner(data)
    return ret ? Promise.resolve(ret) : Promise.reject({"url":data.url})
   },function(e){
    console.log(e)
   })
 } else if((/\.fnt$/i.exec(fontFileName))){
  return GLUtil.loadFileFromUrl(fontFileName,"arraybuffer").then(
   function(data){
    var view=new DataView(data.data)
    var ret=null;
    if(view.getUint8(0) === 66 && view.getUint8(1) === 77 && view.getUint8(2) === 70) {
     ret=TextFont._loadBinaryFontInner(data)
    } else {
     var view=new DataView(data.data)
     ret=TextFont._loadTextFontInner({
       "url":data.url,"data":TextFont._decodeUtf8(view,0,view.byteLength)})
    }
    return ret ? Promise.resolve(ret) : Promise.reject({"url":data.url})
   })
 } else if((/\.json$/i.exec(fontFileName))){
  return GLUtil.loadFileFromUrl(fontFileName,"json").then(
   function(data){
    var ret=TextFont._loadJsonFontInner(data)
    return ret ? Promise.resolve(ret) : Promise.reject({"url":data.url})
   })
 } else {
  return GLUtil.loadFileFromUrl(fontFileName).then(
   function(data){
    var ret=TextFont._loadTextFontInner(data)
    return ret ? Promise.resolve(ret) : Promise.reject({"url":data.url})
   })
 }
}

TextRenderer._textShader=function(){
"use strict";
var i;
var shader=""
shader+="#ifdef GL_OES_standard_derivatives\n"
shader+="#extension GL_OES_standard_derivatives : enable\n"
shader+="#endif\n"
shader+=ShaderProgram.fragmentShaderHeader() +
"uniform vec4 md;\n" +
"uniform sampler2D sampler;\n" +
"varying vec2 uvVar;\n"+
"varying vec3 colorAttrVar;\n" +
"void main(){\n" +
" float d=texture2D(sampler, uvVar).a;\n"
shader+="#ifdef GL_OES_standard_derivatives\n"
shader+=" float dsmooth=length(vec2(dFdx(d),dFdy(d)))*0.75;\n";
shader+="#else\n"
shader+=" float dsmooth=0.06;\n";
shader+="#endif\n"
shader+=" gl_FragColor=vec4(md.rgb,md.a*smoothstep(0.5-dsmooth,0.5+dsmooth,d));\n" +
"}";
return shader;
};

exports.TextFont=TextFont;
exports.TextRenderer=TextRenderer;

})(this);
