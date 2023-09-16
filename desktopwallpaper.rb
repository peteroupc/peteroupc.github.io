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
