require 'tmpdir'

# This Ruby script helps generate interesting variations on desktop
# wallpapers based on existing image files.
#
# This script is released to the public domain; in case that is not possible, the
# file is also licensed under Creative Commons Zero (CC0).

# Suggestion for improving this file: Support the pattern format
# from early versions of Microsoft Windows (such as Windows 3.1).
# Namely it's an 8x8 monochrome
# two-color tiling pattern represented as eight 8-bit bytes; the colors
# that represent "black" and "white" could be set separately.

################

# Escapes a filename to appear in a command line argument
# for Posix and Posix-like shells
def ufq(f)
  return "''" if !f || f.length==0
  if f && f[ /^[\-]/ ]
    # Filenames starting with hyphen may be misinterpreted
    # as command line options in some programs, even if they're
    # quoted, so add "./" to avoid this
   return "'./"+f+"'"
  end
  if f.include?("'")
   return f.gsub( /([\'\s\,\;\&\(\)\[\]\|\"\$\\\#\*\!\?<>\,\;\|]|^[\-\/])/ ){ "\\"+$1 }
  end
  if f[ /[\s\(\)\$\\\#\&\!\*\?<>\,\;\|]/ ]
   return "'"+f+"'"
  else
   return f
  end
end

def parsecolor(prc)
    return nil if !prc
    if prc[ /\s*\'?\#([A-Fa-f0-9]{4})([A-Fa-f0-9]{4})([A-Fa-f0-9]{4})\'?\s*/ ]
      return [$1.to_i(16)/256,$2.to_i(16)/256,$3.to_i(16)/256]
    end
    if prc[ /\s*\'?\#([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})([A-Fa-f0-9]{2})\'?\s*/ ]
      return [$1.to_i(16),$2.to_i(16),$3.to_i(16)]
    end
    return nil
end

def primarycolor()
    rgb2=[255,255,255]
    prc=`gsettings get org.cinnamon.desktop.background primary-color`
    prc=`gsettings get org.gnome.desktop.background primary-color` if prc.gsub(/\s+/)==""
    pc=parsecolor(prc)
    rgb2=pc if pc
    return rgb2
end

def secondarycolor()
    rgb2=[0,0,0]
    prc=`gsettings get org.cinnamon.desktop.background secondary-color`
    prc=`gsettings get org.gnome.desktop.background secondary-color` if prc.gsub(/\s+/)==""
    pc=parsecolor(prc)
    rgb2=pc if pc
    return rgb2
end

# Returns a string representing commands that set the desktop background,
# in a GNOME or compatible desktop environment, to the image
# with the filename specified in 'outfile'.
# Each of rgb1 and rgb2 can be nil, in which case its value
# is determined automatically.  outfile, the outputfile, can be nil.
def wallpapercmd(outfile,wallpaper=false)
  fileuri="file://"+outfile
  return "gconftool-2 --set /desktop/gnome/background/picture_filename --type string #{ufq(outfile)}"+
     " ; gsettings set org.cinnamon.desktop.background picture-uri #{ufq(fileuri)}"+
     " ; gsettings set org.cinnamon.desktop.background picture-options "+(wallpaper ? "wallpaper" : "stretched")+
     " ; gsettings set org.gnome.desktop.background picture-uri #{ufq(fileuri)}"+
     " ; gsettings set org.gnome.desktop.background picture-options "+(wallpaper ? "wallpaper" : "stretched")
end

def torgb(x)
 return (x[0]<<16)+(x[1]<<8)+x[2]
end
def adjustpixmap(fn,bases)
 w=0;h=0;pixmap=nil
 File.open(fn,"rb"){|f|
 fr=f.read(3)
 #p fr
 raise if fr!="P6\n"
 s=f.gets()
 #p s
 raise if s.length>20
 raise if !s[/\A(\d+) (\d+)\n/]
 w=$1.to_i
 h=$2.to_i
 raise if f.read(4)!="255\n"
 pixmap=f.read().unpack("C*")
 #p pixmap.length
 #p w*h*3
 i=0
 for y in 0...h
   for x in 0...w
     pix=[pixmap[i],pixmap[i+1],pixmap[i+2]]
     c=torgb(pix)
     bc=bases[c]
     raise pix.to_s if !bc
     c2=bc[(x+y)%2]
     pixmap[i]=(c2>>16)&0xff
     pixmap[i+1]=(c2>>8)&0xff
     pixmap[i+2]=(c2)&0xff
     i+=3
   end
 end
 }
 File.open(fn,"wb"){|f|
 f.write(sprintf("P6\n%d %d\n255\n",w,h))
 f.write(pixmap.pack("C*"))
 }
end

def reliefcore(infile,outfile,colors=nil,bas=true)
 if !colors
  colors=[[0,0,0],[255,255,255],[128,128,128],[192,192,192]]
 end
 raise if colors.length<3
 if colors.length==3
  colors=[colors[0],colors[1],colors[2],colors[3]]
 end
 w=0;h=0;pixmap=nil
 colorrelief=[]
 colorbytes=colors.map{|x|
   raise if x.length<3
   next x[0,3].pack("C*")
 }
 File.open(infile,"rb"){|f|
 fr=f.read(3)
 #p fr
 raise if fr!="P6\n"
 s=f.gets()
 #p s
 raise if s.length>20
 raise if !s[/\A(\d+) (\d+)\n/]
 w=$1.to_i
 h=$2.to_i
 depth=f.read(4)
 raise if depth!="255\n"
 pixmap=f.read().unpack("C*")
 #p pixmap.length
 #p w*h*3
 i=0
 for y in 0...h
   for x in 0...w
     pix=[pixmap[i],pixmap[i+1],pixmap[i+2]]
     c=torgb(pix)
     white=((pix[0]+pix[1]+pix[2])/3>=128) ? 1 : 0
     colorrelief.push(white)
     i+=3
   end
 end
 }
 File.open(outfile,"wb"){|f|
 f.write(sprintf("P6\n%d %d\n255\n",w,h))
 for y in 0...h
   for x in 0...w
     offset=1
     right=colorrelief[[y-offset,0].max*w+[x+offset,w-1].min]
     offset=bas ? 0 : 1
     down=colorrelief[[y+offset,h-1].min*w+[x-offset,0].max]
     if right==down
       f.write(colorbytes[2+right])
     else
       f.write(colorbytes[0+right])
     end
   end
 end
 }
end

# 'infile': input image file
# 'outfile': output image file
# 'colors': array of four colors; each color is a 3-item array
#   of the red, green, and blue components in that order.
#   The four colors are shadow, highlight, dark background, and light background
#   in that order. (The dark background is used for pixels that are black in both
#   shifted versions of the relief; the light, for those that are white.)
#   The fourth color can be left out, then the light background
#   equals the dark background.  The 'colors' parameter itself
#   can be left out, then default colors are used.
# 'bas': true=bas relief, false=haut relief
def relief(infile,outfile,colors=nil,bas=true)
 raise if !infile
 raise if !outfile
 raise if colors && colors.length<3
 Dir.mktmpdir{|t|
   tf=t+"/r.ppm"
   `convert #{ufq(infile)} -grayscale Rec709Luma -depth 8 #{ufq(tf)}`
   reliefcore(tf,tf,colors,bas)
   `convert #{ufq(tf)} #{ufq(outfile)}`
 }
end

def tobases(basecolors)
 bases={}
 for b in basecolors
  bases[b]=true
 end
 for i in 0...basecolors.length
  for j in (i+1)...basecolors.length
   bi=basecolors[i]
   bj=basecolors[j]
   b=[(bi[0]+bj[0])/2,(bi[1]+bj[1])/2,(bi[2]+bj[2])/2]
   bases[b]=true
  end
 end
 return bases
end
def tobases2(basecolors)
 bases2={}
 for b in basecolors
  bases2[torgb(b)]=[torgb(b),torgb(b)]
 end
 for i in 0...basecolors.length
  for j in (i+1)...basecolors.length
   bi=basecolors[i]
   bj=basecolors[j]
   b=[(bi[0]+bj[0])/2,(bi[1]+bj[1])/2,(bi[2]+bj[2])/2]
   bases2[torgb(b)]=[torgb(bi),torgb(bj)]
  end
 end
 return bases2
end
def toseeds(bases)
 return bases.keys.sort.map{|x| sprintf("#%02X%02X%02X",x[0],x[1],x[2]) }.join(";")
end
def solid(c,w,h,outfile)
 raise if w<=0 or h<=0 or w.to_i!=w or h.to_i!=h
 File.open(outfile,"wb"){|f|
  f.write(sprintf("P6\n#{w} #{h}\n255\n",w,h))
  kp=[c[0].to_i,c[1].to_i,c[2].to_i].pack("CCC")
  for k in 0...(w*h)
    f.write(kp)
  end
 }
end

# Returns an ImageMagick command to generate a desktop background from an image, in three steps.
# The input and output image file names are given in 'infile' and 'outfile', respectively.
# 1. If rgb1 and rgb2 are not nil, converts the input image to grayscale, then translates the grayscale
# palette to a gradient starting at rgb1 for black (e.g., [2,10,255] where each
# component is from 0 through 255) and ending at rgb2 for white (same format).
# The output image is the input for the next step.
# 2. If hue is not 0, performs a hue shift, in degrees (-180 to 180), of the input image.
# The output image is the input for the next step.
# 3. If basecolors is not nil, performs a dithering operation on the input image; that is, it
# reduces the number of colors of the image to those given in 'basecolors', which is a list
# of colors (each color is a 3-item array of the red, green, and blue components in that order),
# and scatters the remaining colors in the image so that they appear close to the original colors.
# Raises an error if 'basecolors' has a length greater than 256.
def magickgradientdither(infile,outfile,rgb1,rgb2,basecolors=nil,hue=0)
  raise if !infile
  raise if !outfile
  raise if hue<-180 or hue>180
  huemod=(hue+180)*100.0/180.0
  hueshift=hue==0 ? "" : sprintf("-modulate 100,100,%.02f",huemod)
  mgradient=nil
  infile=ufq(File.expand_path(infile))
  outfile=ufq(File.expand_path(outfile))
  if rgb1 && rgb2
    r1=sprintf("#%02x%02x%02x",rgb1[0].to_i,rgb1[1].to_i,rgb1[2].to_i)
    r2=sprintf("#%02x%02x%02x",rgb2[0].to_i,rgb2[1].to_i,rgb2[2].to_i)
    mgradient="\\( #{infile} -grayscale Rec709Luma \\) \\( -size "+
      "1x256 gradient:#{r1}-#{r2} \\) -clut"
  else
    mgradient=infile
  end
  if basecolors && basecolors.length>0
    raise if basecolors.length>256
    bases=basecolors.map{|k| sprintf("#%02X%02X%02X",k[0],k[1],k[2]) }
    # ImageMagick command to generate the palette image
    image="convert -size 1x1 "+(bases.map{|k| "xc:"+k}).join(" ")+" +append png:-"
    ditherkind="-ordered-dither 8x8" # for abstract or geometric images
    ditherkind="-dither FloydSteinberg" # for photographic images
    return "#{image} | convert #{mgradient} #{hueshift} #{ditherkind} -remap png:- #{outfile}"
  else
    return "convert #{mgradient} #{hueshift} #{outfile}"
  end
end

# Returns an ImageMagick command to generate a tileable
# desktop background from an image.
# The input and output image file names are given in 'infile' and 'outfile', respectively.
def tileable(infile,outfile)
  infile=ufq(File.expand_path(infile))
  outfile=ufq(File.expand_path(outfile))
  return "convert #{infile} \\( +clone -flip \\) -append \\( +clone -flop \\) +append #{outfile}"
end

def websafecolors()
 colors=[]
 for r in 0..5
   for g in 0..5
     for b in 0..5
       colors.push([r*51,g*51,b*51])
     end
   end
 end
 return colors
end

basecolors=[
[0,0,0],
[127,127,127],
[255,255,255],
[191,191,191],
[255,0,0],
[127,0,0],
[0,255,0],
[0,127,0],
[0,0,255],
[0,0,127],
[255,0,255],
[127,0,127],
[0,255,255],
[0,127,127],
[255,255,0],
[127,127,0]
]
# Resembles the brushed steel-like background used in Apple
# products from the mid-2000s.
def steel(output,width=256, height=256,strength=1,vert=false)
 raise if width<=0 or height<=0
 raise if !output
 raise if strength<=0 or strength>1
 strength=(255*strength).to_i
 raise if strength<=0
 maxStrip=[width,52].min
 noise=([256-strength]*(width*height)).map{|x| x+rand(strength) }
 image=[0]*(width*3*height)
 pos=0
 for y in 0...height
  currentRow=pos
  yw=y*width
  for x in 0...width
   val=0
   for k in 0...maxStrip
    val+=noise[yw+(x>=k ? x-k : (width+x-k))]
   end
   val=(val/maxStrip).to_i
   image[currentRow]=image[currentRow+1]=image[currentRow+2]=val
   currentRow+=(vert ? 3*width : 3)
  end
  pos+=(vert ? 3 : width*3)
 end
 File.open(output,"wb"){|f|
   f.write(sprintf("P6\n%d %d\n255\n",width,height))
   f.write(image.pack("C*"))
 }
end
