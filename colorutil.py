"""
Sample code for the article "Color Topics for Programmers"

Written by Peter O.
Any copyright is released to the Public Domain.
https://creativecommons.org/publicdomain/zero/1.0/
"""

import math

# Convert a color component from nonlinearized to linearized RGB
def linearFromsRGB(c):
  if c <= 0.04045:
    return c / 12.92
  return math.pow((0.055 + c) / 1.055, 2.4)

def clamp(a,mn,mx):
  if a<mn:
    return mn
  return mx if a>mx else a

def clamp3(v,mn,mx):
  return [clamp(v[i],mn[i],mx[i]) for i in range(3)]

def linearTosRGB(c):
  """
Converts a color component from linearized to nonlinearized sRGB.
  """
  if c <= 0.0031308:
    return 12.92 * c
  return math.pow(c, 1.0 / 2.4) * 1.055 - 0.055

# Convert a color from nonlinearized to linearized RGB
def linearFromsRGB3(c):
   return [linearFromsRGB(c[0]), linearFromsRGB(c[1]), linearFromsRGB(c[2])]

# Convert a color from linearized to nonlinearized sRGB
def linearTosRGB3(c):
   return [linearTosRGB(c[0]), linearTosRGB(c[1]), linearTosRGB(c[2])]

def rgbToHsv(rgb):
    mx = max(max(rgb[0], rgb[1]), rgb[2])
    mn = min(min(rgb[0], rgb[1]), rgb[2])
    if mx==mn:
      return [0,0,mx]
    s=(mx-mn)*1.0/mx
    h=0
    if rgb[0]==mx:
            h=(rgb[1]-rgb[2])*1.0/(mx-mn)
    if rgb[1]==mx:
            h=2+(rgb[2]-rgb[0])*1.0/(mx-mn)
    if rgb[2]==mx:
            h=4+(rgb[0]-rgb[1])*1.0/(mx-mn)
    end
    if h < 6:
        h = 6 - ((-h)% 6)
    if h >= 6:
        h = (h % 6)
    return [h * (math.pi / 3), s, mx]

def hsvToRgb(hsv):
    hue=hsv[0]
    sat=hsv[1]
    val=hsv[2]
    if hue < 0:
      hue = pi * 2 - (-hue)%( pi * 2)
    if hue >= pi * 2:
      hue = (hue)%( pi * 2)
    hue60 = hue * 3 / pi
    hi = int(hue60)
    f = hue60 - hi
    c = val * (1 - sat)
    a = val * (1 - sat * f)
    e = val * (1 - sat * (1 - f))
    if hi == 0:
      return [val, e, c]
    if hi == 1:
      return [a, val, c]
    if hi == 2:
      return [c, val, e]
    if hi == 3:
      return [c, a, val]
    if hi == 4:
      return [e, c, val]
    return [val, c, a]

def hsvHue(rgb):
  return rgbToHsv(rgb)[0]

def rgbToHwb(color):
  return [hsvHue(color), \
    min(min(color[0],color[1]),color[2]), \
    1-max(max(color[0],color[1]),color[2])]

def hwbToRgb(hwb):
  if hwb[2]>=1:
    return [hwb[0],0,0]
  return hsvToRgb([hwb[0], \
    1 - hwb[1]/(1-hwb[2]), 1 - hwb[2]])

# applies a 3x3 matrix transformation
def apply3x3Matrix(xyz, xyzmatrix):
        r=xyz[0]*xyzmatrix[0]+xyz[1]*xyzmatrix[1]+xyz[2]*xyzmatrix[2]
        g=xyz[0]*xyzmatrix[3]+xyz[1]*xyzmatrix[4]+xyz[2]*xyzmatrix[5]
        b=xyz[0]*xyzmatrix[6]+xyz[1]*xyzmatrix[7]+xyz[2]*xyzmatrix[8]
        return [r,g,b]

def xyzFromsRGBD50(rgb):
    lin=linearFromsRGB3(rgb)
    return apply3x3Matrix(lin, [0.4360657, 0.3851515, 0.1430784,
            0.2224932, 0.7168870, 0.06061981, 0.01392392,
            0.09708132, 0.7140994])

def xyzTosRGBD50(xyz):
    rgb=apply3x3Matrix(xyz, [3.134136, -1.617386, -0.4906622,
             -0.9787955, 1.916254, 0.03344287, 0.07195539,
             -0.2289768, 1.405386])
    return clamp3(linearTosRGB3(rgb), [0,0,0],[1,1,1])

def xyzFromsRGB(rgb):
    lin=linearFromsRGB3(rgb)
    # NOTE: Official matrix is rounded to nearest 1/10000
    return apply3x3Matrix(lin, [0.4123908, 0.3575843, 0.1804808,
            0.2126390, 0.7151687, 0.07219232, 0.01933082,
            0.1191948, 0.9505322])

def xyzTosRGB(xyz):
    rgb=apply3x3Matrix(xyz, [3.240970, -1.537383, -0.4986108,
            -0.9692436, 1.875968, 0.04155506, 0.05563008,
            -0.2039770, 1.056972])
    return clamp3(linearTosRGB3(rgb), [0,0,0],[1,1,1])

def xyzToLab(xyzval,wpoint):
    xyz=[xyzval[0]/wpoint[0],xyzval[1]/wpoint[1],xyzval[2]/wpoint[2]]
    i=0
    while i < 3:
       if xyz[i] > 216.0 / 24389: # See BruceLindbloom.com
          xyz[i]=math.pow(xyz[i], 1.0/3.0)
       else:
           kappa=24389.0/27 # See BruceLindbloom.com
           xyz[i]=(16.0 + kappa*xyz[i]) / 116
       i=i+1
    return [116.0*xyz[1] - 16,\
        500 * (xyz[0] - xyz[1]),\
        200 * (xyz[1] - xyz[2])]

def labToXYZ(lab,wpoint):
    fy=(lab[0]+16)/116.0
    fx=fy+lab[1]/500.0
    fz=fy-lab[2]/200.0
    fxcb=fx*fx*fx
    fzcb=fz*fz*fz
    xyz=[fxcb, 0, fzcb]
    eps=216.0/24389 # See BruceLindbloom.com
    if fxcb <= eps:
       xyz[0]=(108.0*fx/841)-432.0/24389
    if fzcb <= eps:
       xyz[2]=(108.0*fz/841)-432.0/24389
    if lab[0] > 8: # See BruceLindbloom.com
            xyz[1]=math.pow(((lab[0]+16)/116.0), 3.0)
    else:
            xyz[1]=lab[0]*27/24389.0 # See BruceLindbloom.com
    xyz[0]=xyz[0]*wpoint[0]
    xyz[1]=xyz[1]*wpoint[1]
    xyz[2]=xyz[2]*wpoint[2]
    return xyz

def labToChroma(lab):
  return math.sqrt(lab[1]*lab[1] + lab[2]*lab[2])

def labToHue(lab):
  h=math.atan2(lab[2],lab[1])
  if h<0:
    h=h+math.pi*2
  return h

def lchToLab(lch):
  # NOTE: Assumes hue is in radians, not degrees
  return [lch[0], lch[1] * math.cos(lch[2]), lch[1] * math.sin(lch[2])]

def euclideanDist(color1,color2):
   d1=color2[0] - color1[0]
   d2=color2[1] - color1[1]
   d3=color2[2] - color1[2]
   sqdist=d1*d1+d2*d2+d3*d3
   return math.sqrt(sqdist)

def ciede2000(lab1, lab2):
    dl=lab2[0]-lab1[0]
    hl=lab1[0]+dl*0.5
    sqb1=lab1[2]*lab1[2]
    sqb2=lab2[2]*lab2[2]
    c1=math.sqrt(lab1[1]*lab1[1]+sqb1)
    c2=math.sqrt(lab2[1]*lab2[1]+sqb2)
    hc7=math.pow((c1+c2)*0.5,7)
    trc=math.sqrt(hc7/(hc7+6103515625))
    t2=1.5-trc*0.5
    ap1=lab1[1]*t2
    ap2=lab2[1]*t2
    c1=math.sqrt(ap1*ap1+sqb1)
    c2=math.sqrt(ap2*ap2+sqb2)
    dc=c2-c1
    hc=c1+dc*0.5
    hc7=math.pow(hc,7)
    trc=math.sqrt(hc7/(hc7+6103515625))
    h1=math.atan2(lab1[2],ap1)
    if h1<0:
      h1=h1+math.pi*2
    h2=math.atan2(lab2[2],ap2)
    if h2<0:
      h2=h2+math.pi*2
    hdiff=h2-h1
    hh=h1+h2
    if abs(hdiff)>math.pi:
            hh=hh+math.pi*2
            if h2<=h1:
               hdiff=hdiff+math.pi*2
            else:
               hdiff=hdiff-math.pi*2
    hh=hh*0.5
    t2=1-0.17*math.cos(hh-math.pi/6)+0.24*math.cos(hh*2)
    t2=t2+0.32*math.cos(hh*3+math.pi/30)
    t2=t2-0.2*math.cos(hh*4-math.pi*63/180)
    dh=2*math.sqrt(c1*c2)*math.sin(hdiff*0.5)
    sqhl=(hl-50)*(hl-50)
    fl=dl/(1+(0.015*sqhl/math.sqrt(20+sqhl)))
    fc=dc/(hc*0.045+1)
    fh=dh/(t2*hc*0.015+1)
    dt=30*math.exp(-math.pow(36*hh-55*math.pi,2)/(25*math.pi*math.pi))
    r=-2*trc*math.sin(2*dt*math.pi/180)
    return math.sqrt(fl*fl+fc*fc+fh*fh+r*fc*fh)

def sRGBLuminance(x):
  lin=linearFromsRGB3(x)
  return lin[0]*0.2126+lin[1]*0.7152+lin[2]*0.0722

def sRGBContrastRatio(color1,color2):
  """
  Finds the contrast ratio for two nonlinearized sRGB colors.
  NOTE: This calculation is not strict because the notes
  for relative luminance in WCAG 2.0 define sRGB relative
  luminance slightly differently.
  """
  l1=srgbLuminance(color1)
  l2=srgbLuminance(color2)
  return (max(l1,l2)+0.05)/(min(l1,l2)+0.05)

def sRGBToLab(rgb):
    return xyzToLab(xyzFromsRGB(rgb), [0.9504559, 1, 1.089058])

def sRGBFromLab(lab):
    return xyzTosRGB(labToXYZ(lab, [0.9504559, 1, 1.089058]))

def sRGBToLabD50(rgb):
    return xyzToLab(xyzFromsRGBD50(rgb), [0.9642957, 1, 0.8251046])

def sRGBFromLabD50(lab):
    return xyzTosRGBD50(labToXYZ(lab, [0.9642957, 1, 0.8251046]))
