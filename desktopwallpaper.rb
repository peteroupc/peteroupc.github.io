require 'tmpdir'

# This script is released to the public domain; in case that is not possible, the
# file is also licensed under Creative Commons Zero (CC0).

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

def nearestColor(r,g,b,pal)
  i=0;best=-1;bestIndex=0
  while i<pal.length
    pi=pal[i]
    dist=(r-((pi>>16)&0xff))**2+
      (g-((pi>>8)&0xff))**2+
      (b-((pi)&0xff))**2
    if i==0 || dist<best
      best=dist;bestIndex=i
    end
    i=i+1
  end
  return pal[bestIndex]
end

DitherMatrix=[ # Bayer 8x8 ordered dither matrix
    0, 32,  8, 40,  2, 34, 10, 42,
    48, 16, 56, 24, 50, 18, 58, 26,
    12, 44,  4, 36, 14, 46,  6, 38,
    60, 28, 52, 20, 62, 30, 54, 22,
     3, 35, 11, 43,  1, 33,  9, 41,
    51, 19, 59, 27, 49, 17, 57, 25,
    15, 47,  7, 39, 13, 45,  5, 37,
    63, 31, 55, 23, 61, 29, 53, 21]

def websafedither(fn,outfn=nil)
 pm=p6pixmap(fn)
 w=pm[0];h=pm[1];pixmap=pm[2]
 i=0
 for y in 0...h
   for x in 0...w
     r=pixmap[i]
     g=pixmap[i+1]
     b=pixmap[i+2]
     # Get dither matrix value based on
     # X and Y coordinates
     d=DitherMatrix[((y&7)<<3)|(x&7)]-32;
     # Add dither matrix value to each component
     # to get a dithered version
     r=[[r+d,0].max,255].min
     g=[[g+d,0].max,255].min
     b=[[b+d,0].max,255].min
     # Get close Web safe version
     r=(r/51).round*51
     g=(g/51).round*51
     b=(b/51).round*51
     pixmap[i]=r&0xff
     pixmap[i+1]=g&0xff
     pixmap[i+2]=b&0xff
     i+=3
   end
 end
 outfn=fn if !fn
 File.open(outfn,"wb"){|f|
 f.write(sprintf("P6\n%d %d\n255\n",w,h))
 f.write(pixmap.pack("C*"))
 }
end
