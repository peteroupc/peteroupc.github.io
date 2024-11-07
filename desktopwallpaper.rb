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
