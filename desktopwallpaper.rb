require 'tmpdir'

# This Ruby script helps generate interesting variations on desktop
# wallpapers based on existing image files.
#
# This script is released to the public domain; in case that is not possible, the
# file is also licensed under Creative Commons Zero (CC0).

# Suggestion for improving this file: Support the pattern format
# from early versions of Microsoft Windows.  Namely it's an 8x8 monochrome
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

# Returns a string representing an ImageMagick command that
# converts an input image file to grayscale, then translates the grayscale
# palette to a gradient starting at rgb1 for black (e.g., [2,10,255] where each
# component is from 0 through 255) and ending at rgb2 for white (same format).
# The output image is intended to serve as a desktop background.
#
# The command has the following form:
# convert \(INFILE -grayscale Rec709Luma\) \( -size 1x256 gradient:#RRGGBB-#RRGGBB \) -clut OUTFILE
#
# Example:
# puts magickgradient([0,0,255],[255,255,255],
#  "input.jpg","output.bmp")
def magickgradient(rgb1,rgb2,infile,outfile)
  r1=sprintf("#%02x%02x%02x",rgb1[0].to_i,rgb1[1].to_i,rgb1[2].to_i)
  r2=sprintf("#%02x%02x%02x",rgb2[0].to_i,rgb2[1].to_i,rgb2[2].to_i)
  infile=File.expand_path(infile)
  outfile=File.expand_path(outfile)
  return "convert \\( #{ufq(infile)} -grayscale Rec709Luma \\) \\( -size "+
    "1x256 gradient:#{r1}-#{r2} \\) -clut #{ufq(outfile)}"
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

# Returns a string representing commands that set the desktop background,
# in a GNOME or compatible desktop environment, to an image generated
# by magickgradient.
# Each of rgb1 and rgb2 can be nil, in which case its value
# is determined automatically.
def magickgradientcmd(infile,rgb1=nil,rgb2=nil,wallpaper=false)
  outfile=Dir::home()+"/.cache/magickgradient001122.png"
  fileuri="file://"+outfile
  if !rgb2
    rgb2=[255,255,255]
    prc=`gsettings get org.cinnamon.desktop.background primary-color`
    prc=`gsettings get org.gnome.desktop.background primary-color` if prc.gsub(/\s+/)==""
    pc=parsecolor(prc)
    rgb2=pc if pc
  end
  if !rgb1
    rgb1=[0,0,0]
    prc=`gsettings get org.cinnamon.desktop.background secondary-color`
    prc=`gsettings get org.gnome.desktop.background secondary-color` if prc.gsub(/\s+/)==""
    pc=parsecolor(prc)
    rgb1=pc if pc
  end
  return magickgradient(rgb1,rgb2,infile,outfile)+
     " ; gconftool-2 --set /desktop/gnome/background/picture_filename --type string #{ufq(outfile)}"+
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
  colors=[[128,128,128],[0,0,0],[255,255,255]]
 end
 w=0;h=0;pixmap=nil
 colorrelief=[]
 colorbytes=colors.map{|x|
   raise if colors.length<3
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
       f.write(colorbytes[0])
     else
       f.write(colorbytes[1+right])
     end
   end
 end
 }
end

# 'infile': input image file
# 'outfile': output image file
# 'colors': array of three colors; each color is a 3-item array
#   of the red, green, and blue components in that order.
#   The three colors are background, shadow, and highlight color
#   in that order.  Can be left out, then default colors are used.
# 'bas': true=bas relief, false=haut relief
def relief(infile,outfile,colors=nil,bas=true)
 raise if !infile
 raise if !outfile
 raise if colors && colors.length<3
 Dir.mktmpdir{|t|
   tf=t+"/r.ppm"
   `convert #{ufq(infile)} -depth 8 #{ufq(tf)}`
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

# Uses ImageMagick to dither the image in 'infile' to the colors in 'basecolors'
# and output the resulting image to 'outfile'.
def dithertobasecolors(infile,outfile,basecolors)
 raise if !infile
 raise if !outfile
 raise if !basecolors || basecolors.length==0
 bases=tobases(basecolors)
 bases2=tobases2(basecolors)
 Dir.mktmpdir {|tmpdir|
 cmptmp=tmpdir+"/cmapdithertobasecolors.ppm"
 cmpsmall=tmpdir+"/cmapsmalldithertobasecolors.ppm"
 File.open(cmptmp,"wb"){|f|
  f.write(sprintf("P6\n%d 1\n255\n",bases.keys.length))
  for k in bases.keys.sort
    f.write(k.pack("CCC"))
  end
 }
 File.open(cmpsmall,"wb"){|f|
  f.write(sprintf("P6\n%d 1\n255\n",basecolors.length))
  for k in basecolors
    f.write(k.pack("CCC"))
  end
 }
 infile=ufq(infile)
 outfile=ufq(outfile)
 intermedfile=tmpdir+"/ccdithertobasecolors.ppm"
 #`convert #{infile} -dither Riemersma -remap #{ufq(cmptmp)} #{ufq(intermedfile)}`
 # "-remap" appears to use Riemersma dither by default
 #`convert #{infile} -dither Floyd-Steinberg -remap #{ufq(cmptmp)} #{ufq(intermedfile)}`
 `convert #{ufq(infile)} -ordered-dither 8x8 -remap #{ufq(cmpsmall)} #{outfile}`
 File.delete(cmptmp)
 File.delete(cmpsmall)
 File.delete(intermedfile)
 }
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
