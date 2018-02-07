"""
Sample code for the article "Color Topics for Programmers"
https://www.codeproject.com/Articles/1202772/Color-Topics-for-Programmers

Written by Peter O.
Any copyright is released to the Public Domain.
https://creativecommons.org/publicdomain/zero/1.0/
"""

import math

# The following tables were taken from
# "Selected Colorimetric Tables" on the CIE Web site:
# http://www.cie.co.at/technical-work/technical-resources

# CIE 1931 Observer

CIE1931=[
0.001368,0.000039,0.006450,
0.002236,0.000064,0.010550,
0.004243,0.000120,0.020050,
0.007650,0.000217,0.036210,
0.014310,0.000396,0.067850,
0.023190,0.000640,0.110200,
0.043510,0.001210,0.207400,
0.077630,0.002180,0.371300,
0.134380,0.004000,0.645600,
0.214770,0.007300,1.039050,
0.283900,0.011600,1.385600,
0.328500,0.016840,1.622960,
0.348280,0.023000,1.747060,
0.348060,0.029800,1.782600,
0.336200,0.038000,1.772110,
0.318700,0.048000,1.744100,
0.290800,0.060000,1.669200,
0.251100,0.073900,1.528100,
0.195360,0.090980,1.287640,
0.142100,0.112600,1.041900,
0.095640,0.139020,0.812950,
0.057950,0.169300,0.616200,
0.032010,0.208020,0.465180,
0.014700,0.258600,0.353300,
0.004900,0.323000,0.272000,
0.002400,0.407300,0.212300,
0.009300,0.503000,0.158200,
0.029100,0.608200,0.111700,
0.063270,0.710000,0.078250,
0.109600,0.793200,0.057250,
0.165500,0.862000,0.042160,
0.225750,0.914850,0.029840,
0.290400,0.954000,0.020300,
0.359700,0.980300,0.013400,
0.433450,0.994950,0.008750,
0.512050,1.000000,0.005750,
0.594500,0.995000,0.003900,
0.678400,0.978600,0.002750,
0.762100,0.952000,0.002100,
0.842500,0.915400,0.001800,
0.916300,0.870000,0.001650,
0.978600,0.816300,0.001400,
1.026300,0.757000,0.001100,
1.056700,0.694900,0.001000,
1.062200,0.631000,0.000800,
1.045600,0.566800,0.000600,
1.002600,0.503000,0.000340,
0.938400,0.441200,0.000240,
0.854450,0.381000,0.000190,
0.751400,0.321000,0.000100,
0.642400,0.265000,0.000050,
0.541900,0.217000,0.000030,
0.447900,0.175000,0.000020,
0.360800,0.138200,0.000010,
0.283500,0.107000,0.000000,
0.218700,0.081600,0.000000,
0.164900,0.061000,0.000000,
0.121200,0.044580,0.000000,
0.087400,0.032000,0.000000,
0.063600,0.023200,0.000000,
0.046770,0.017000,0.000000,
0.032900,0.011920,0.000000,
0.022700,0.008210,0.000000,
0.015840,0.005723,0.000000,
0.011359,0.004102,0.000000,
0.008111,0.002929,0.000000,
0.005790,0.002091,0.000000,
0.004109,0.001484,0.000000,
0.002899,0.001047,0.000000,
0.002049,0.000740,0.000000,
0.001440,0.000520,0.000000,
0.001000,0.000361,0.000000,
0.000690,0.000249,0.000000,
0.000476,0.000172,0.000000,
0.000332,0.000120,0.000000,
0.000235,0.000085,0.000000,
0.000166,0.000060,0.000000,
0.000117,0.000042,0.000000,
0.000083,0.000030,0.000000,
0.000059,0.000021,0.000000,
0.000042,0.000015,0.000000 ]

# D Series coefficients

DSERIES = [
0.04,0.02,0.00,
3.02,2.26,1.00,
6.00,4.50,2.00,
17.80,13.45,3.00,
29.60,22.40,4.00,
42.45,32.20,6.25,
55.30,42.00,8.50,
56.30,41.30,8.15,
57.30,40.60,7.80,
59.55,41.10,7.25,
61.80,41.60,6.70,
61.65,39.80,6.00,
61.50,38.00,5.30,
65.15,40.20,5.70,
68.80,42.40,6.10,
66.10,40.45,4.55,
63.40,38.50,3.00,
64.60,36.75,2.10,
65.80,35.00,1.20,
80.30,39.20,0.05,
94.80,43.40,-1.10,
99.80,44.85,-0.80,
104.80,46.30,-0.50,
105.35,45.10,-0.60,
105.90,43.90,-0.70,
101.35,40.50,-0.95,
96.80,37.10,-1.20,
105.35,36.90,-1.90,
113.90,36.70,-2.60,
119.75,36.30,-2.75,
125.60,35.90,-2.90,
125.55,34.25,-2.85,
125.50,32.60,-2.80,
123.40,30.25,-2.70,
121.30,27.90,-2.60,
121.30,26.10,-2.60,
121.30,24.30,-2.60,
117.40,22.20,-2.20,
113.50,20.10,-1.80,
113.30,18.15,-1.65,
113.10,16.20,-1.50,
111.95,14.70,-1.40,
110.80,13.20,-1.30,
108.65,10.90,-1.25,
106.50,8.60,-1.20,
107.65,7.35,-1.10,
108.80,6.10,-1.00,
107.05,5.15,-0.75,
105.30,4.20,-0.50,
104.85,3.05,-0.40,
104.40,1.90,-0.30,
102.20,0.95,-0.15,
100.00,0.00,0.00,
98.00,-0.80,0.10,
96.00,-1.60,0.20,
95.55,-2.55,0.35,
95.10,-3.50,0.50,
92.10,-3.50,1.30,
89.10,-3.50,2.10,
89.80,-4.65,2.65,
90.50,-5.80,3.20,
90.40,-6.50,3.65,
90.30,-7.20,4.10,
89.35,-7.90,4.40,
88.40,-8.60,4.70,
86.20,-9.05,4.90,
84.00,-9.50,5.10,
84.55,-10.20,5.90,
85.10,-10.90,6.70,
83.50,-10.80,7.00,
81.90,-10.70,7.30,
82.25,-11.35,7.95,
82.60,-12.00,8.60,
83.75,-13.00,9.20,
84.90,-14.00,9.80,
83.10,-13.80,10.00,
81.30,-13.60,10.20,
76.60,-12.80,9.25,
71.90,-12.00,8.30,
73.10,-12.65,8.95,
74.30,-13.30,9.60,
75.35,-13.10,9.05,
76.40,-12.90,8.50,
69.85,-11.75,7.75,
63.30,-10.60,7.00,
67.50,-11.10,7.30,
71.70,-11.60,7.60,
74.35,-11.90,7.80,
77.00,-12.20,8.00,
71.10,-11.20,7.35,
65.20,-10.20,6.70,
56.45,-9.00,5.95,
47.70,-7.80,5.20,
58.15,-9.50,6.30,
68.60,-11.20,7.40,
66.80,-10.80,7.10,
65.00,-10.40,6.80,
65.50,-10.50,6.90,
66.00,-10.60,7.00,
63.50,-10.15,6.70,
61.00,-9.70,6.40,
57.15,-9.00,5.95,
53.30,-8.30,5.50,
56.10,-8.80,5.80,
58.90,-9.30,6.10,
60.40,-9.55,6.30,
61.90,-9.80,6.50 ]

class SPD:
  """ Spectral power distribution class. """
  def __init__(self, values, interval, minWavelength, maxWavelength=None):
    self.values=values
    self.minWavelength=minWavelength
    if maxWavelength==None:
       self.maxWavelength=minWavelength+interval*(len(values)-1)
    else:
       self.maxWavelength=maxWavelength
    self.interval=interval

  def calcd(self, wavelength):
    if wavelength < self.minWavelength or wavelength > self.maxWavelength:
      return 0
    index=int(round((wavelength-self.minWavelength)*1.0/self.interval))
    return self.values[index]

  def calc(self, wavelength):
    if wavelength < self.minWavelength or wavelength > self.maxWavelength:
      return 0
    mm=wavelength%self.interval
    s=self.calcd(wavelength-mm)
    if mm==0:
       return s
    m=mm*1.0/self.interval
    e=self.calcd((wavelength-mm)+self.interval)
    return s+(e-s)*m

#
#  Illuminants and observers
#

def planckian(temp, wavelength):
    """ Spectral distribution for blackbody (Planckian) radiation. """
    num = wavelength**(-5)
    v=num / (math.exp(0.014387863/(wavelength*(10**(-9))*temp)) - 1)
    v2=(560**(-5)) / (math.exp(0.014387863/(560*(10**(-9))*temp)) - 1)
    return v*100.0/v2

def cie1931cmf(wavelength):
  """ CIE 1931 standard observer. """
  if wavelength < 380 or wavelength > 780:
    return [0, 0, 0]
  index=int(round((wavelength-380)/5.0))*3
  return [CIE1931[index+i] for i in range(3)]

def dxy(temp):
  ex=0
  invt=1.0/temp
  h=0.01
  if temp < 7000:
   ex=0.244063+(9911*h+(2967800.0-4607000000.0*invt)*invt)*invt
  else:
   ex=2963/12500.0+(6187/25.0+(1901800.0-2006400000.0*invt)*invt)*invt
  return [ex,ex*(-3*ex+287*h)-11.0/40.0]

def dseries(temp, wavelength):
  """
  Calculates a CIE D-series illuminant at the given
  wavelength and color temperature (the latter
  should not be less than 4000 K).
  """
  if wavelength < 300 or wavelength > 830:
    return 0
  index=int(round((wavelength-300)/5.0))*3
  d=dxy(temp)
  t=10000.0/(2562*d[0]-7341*d[1]+241)
  t1=(-1.7703*d[0]+5.9114*d[1]-1.3515)*t*DSERIES[index+1]
  t2=(-31.4424*d[0]+30.0717*d[1]+0.03)*t*DSERIES[index+2]
  return t1+t2+DSERIES[index]

def referenceIllum(ct, wavelength):
  """
  Reference illuminant for a given color temperature.
  """
  if ct <= 0:
    return 0
  if ct < 4000:
    return planckian(ct, wavelength)
  if ct < 5000:
    p=planckian(ct, wavelength)
    d=dseries(ct, wavelength)
    return p+(d-p)*(ct-4000)/1500.0
  return dseries(ct, wavelength)

def perfectrefl(wavelength):
   """ Perfect reflecting diffuser. """
   return 1.0

def brange(interval,mn,mx):
  ret=[0 for i in range((mx-mn)/interval+1)]
  r=mn
  i=0
  while r <= mx:
    ret[i]=r
    r+=interval
    i+=1
  return ret

""" CIE D50 Illuminant. """
d50Illum=SPD([dseries(5003,i) for i in brange(5,300,830)],5,300).calc

""" CIE D65 Illuminant. """
d65Illum=SPD([dseries(6503,i) for i in brange(5,300,830)],5,300).calc

def spectrumToTristim(refl, light=d65Illum, cmf=cie1931cmf):
    i = 360
    xyz=[0,0,0]
    weight = 0
    while i <= 830:
             cmfv=cmf(i)
             re=refl(i)
             spec=light(i)
             weight=weight+cmfv[1]*spec*5
             xyz[0]=xyz[0]+re*spec*cmfv[0]*5
             xyz[1]=xyz[1]+re*spec*cmfv[1]*5
             xyz[2]=xyz[2]+re*spec*cmfv[2]*5
             i = i + 5
    if weight==0:
             return xyz
    xyz[0] = xyz[0] / weight
    xyz[1] = xyz[1] / weight
    xyz[2] = xyz[2] / weight
    return xyz

##################################################

# Convert a color component from companded to linearized RGB
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
Converts a color component from linearized to companded sRGB.
  """
  if c <= 0.0031308:
    return 12.92 * c
  return math.pow(c, 1.0 / 2.4) * 1.055 - 0.055

# Convert a color from companded to linearized RGB
def linearFromsRGB3(c):
   return [linearFromsRGB(c[0]), linearFromsRGB(c[1]), linearFromsRGB(c[2])]

# Convert a color from linearized to companded sRGB
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

def rgbToHsl(rgb):
        vmax = max(max(rgb[0], rgb[1]), rgb[2])
        vmin = min(min(rgb[0], rgb[1]), rgb[2])
        vadd = vmax + vmin
        # NOTE: "Lightness" is the midpoint between
        # the greatest and least RGB component
        lt = vadd / 2.0
        if vmax==vmin:
             return [0, 0, lt]
        vd = vmax - vmin
        divisor = vadd
        if lt > 0.5: divisor = 2.0 - vadd
        s = vd / divisor
        h = 0
        hvd = vd / 2.0
        deg60 = math.pi / 3
        if rgb[0]==vmax:
                h=((vmax-rgb[2])*deg60 + hvd) / vd
                h = h - ((vmax-rgb[1])*deg60+hvd) / vd
        if rgb[2]==vmax:
                h=math.pi * 4 / 3 + ((vmax-rgb[1])*deg60 + hvd) / vd
                h = h - ((vmax-rgb[0])*deg60+hvd) / vd
        if rgb[1]==vmax:
                h=math.pi * 2 / 3 + ((vmax-rgb[0])*deg60 + hvd) / vd
                h = h - ((vmax-rgb[2])*deg60+hvd) / vd
        if h < 0:
          h = math.pi * 2 - (-h)%(math.pi * 2)
        if h >= math.pi * 2:
           h = (h)%(math.pi * 2)
        return [h, s, lt]

def hslToRgb(hsl):
        if hsl[1]==0:
           return [hsl[2],hsl[2],hsl[2]]
        lum = hsl[2]
        sat = hsl[1]
        if lum <= 0.5: bb = lum * (1.0 + sat)
        if lum > 0.5: bb= lum + sat - (lum * sat)
        a = lum * 2 - bb
        r = a
        g = a
        b = a
        deg60 = math.pi / 3
        deg240 = math.pi * 4 / 3
        if hueval < 0:
          hueval = math.pi * 2 - (-hueval)%(math.pi * 2)
        if hueval >= math.pi * 2:
          hueval = (hueval)%(math.pi * 2)
        deg60 = pi / 3
        deg240 = pi * 4 / 3
        hue = hueval + pi * 2 / 3
        hue2 = hueval - pi * 2 / 3
        if hue >= pi * 2:
            hue = hue - pi * 2
        if hues2 < 0:
            hues2 = hues2 + pi * 2
        rgb = [a, a, a]
        hues = [hue, hueval, hue2]
        i = 0
        while i < 3:
           if hues[i] < deg60:
                 rgb[i] = a + (bb - a) * hues[i] / deg60
           if hues[i] >= deg60 and hues[i] < pi:
              rgb[i] = bb
           if hues[i] >= pi and hues[i] < deg240:
               rgb[i] = a + (bb - a) * (deg240 - hues[i]) / deg60
           i = i + 1
        return rgb

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

def labHueDifference(lab1,lab2):
    cmul=labToChroma(lab1)*labToChroma(lab2)
    h2=labToHue(lab2)
    h1=labToHue(lab1)
    hdiff=h2-h1
    if abs(hdiff)>math.pi:
            if h2<=h1:
               hdiff=hdiff+math.pi*2
            else:
               hdiff=hdiff-math.pi*2
    return math.sqrt(cmul)*math.sin(hdiff*0.5)*2

def lchToLab(lch):
  # NOTE: Assumes hue is in radians, not degrees
  return [lch[0], lch[1] * math.cos(lch[2]), lch[1] * math.sin(lch[2])]

def euclideanDist(color1,color2):
   d1=color2[0] - color1[0]
   d2=color2[1] - color1[1]
   d3=color2[2] - color1[2]
   sqdist=d1*d1+d2*d2+d3*d3
   return math.sqrt(sqdist)

def xyzToxyY(xyz):
                # NOTE: Results undefined if sum==0
                sum=xyz[0]+xyz[1]+xyz[2]
                return [xyz[0]/sum, xyz[1]/sum, xyz[1]]

def xyzFromxyY(xyy):
                # NOTE: Results undefined if xyy[1]==0
                return [xyy[0]*xyy[2]/xyy[1], xyy[2], xyy[2]*(1 - xyy[0] - xyy[1])/xyy[1]]

def xyzTouvY(xyz):
                # NOTE: Results undefined if sum==0
                sum=xyz[0]+xyz[1]*15+xyz[2]*3
                return [4*xyz[0]/sum,9*xyz[1]/sum,xyz[1]]

def xyzFromuvY(uvy):
                # NOTE: Results undefined if uvy[1]==0
                x=(9*uvy[0]*uvy[2])/(4*uvy[1])
                z=-(x/3)-5*uvy[2]+(3*uvy[2]/uvy[1])
                return [x,uvy[1],z]

def xyzToCCT(xyz):
        sum = xyz[0] + xyz[1] + xyz[2]
        # Adjust sum to avoid division by 0
        if sum == 0:
              sum = 0.00001
        x = xyz[0] / sum
        y = xyz[1] / sum
        c = (x - 0.332) / (0.1858 - y)
        return ((449*c+3525)*c+6823.3)*c+5520.33

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
  Finds the contrast ratio for two companded sRGB colors.
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

###############

""" Kubelka-Munk color mixture functions. """

def kubelkaMunkReflectanceToKS(reflList):
  """  Calculates K/S ratios from a list of reflectances (0-1). """
  # NOTE: Here, divisions by 0 are avoided
  return [((1.0-refl)**2)/(2.0*max(0.00001,refl)) for refl in reflList]

def kubelkaMunkKSToReflectance(ksList):
  """  Calculates reflectances from a list of K/S ratios (0-1). """
  return [ks+1.0-math.sqrt(ks*(ks+2.0)) for ks in ksList]

def kubelkaMunkMix(colorantsKS):
  """
  Generates a mixed K/S curve from the list of colorants.
  Each colorant is a hash with the following keys:
  ks - list of K/S ratios
  strength - fraction from 0 to 1 in the total mixture, or
     1 for the "base" color.
  Example:
  >>> kubelkaMunkMix([ \
  >>>    {"strength":0.5, "ks":[0.3, ...]}, \
  >>>    {"strength":0.5, "ks":[0.2, ...]}, \
  >>>    {"strength":1.0, "ks":[0.4, ...]}  \ # base
  >>>  ])
  """
  size=len(colorantsKS[0]["ks"])
  return [ \
      sum([cks["strength"]*cks["ks"][i] for cks in colorantsKS]) \
      for i in range(size)]
