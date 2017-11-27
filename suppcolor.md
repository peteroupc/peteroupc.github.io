# Supplemental Color Topics for Programmers

[Peter Occil](mailto:poccil14@gmail.com)

<a id=Introduction></a>
## Introduction

This document presents supplemental topics about color.

<a id=Contents></a>
## Contents

- [Introduction](#Introduction)
- [Contents](#Contents)
- [Notation and Definitions](#Notation_and_Definitions)
- [Kinds of Color Spaces](#Kinds_of_Color_Spaces)
- [Calculating the Mean Hue Angle](#Calculating_the_Mean_Hue_Angle)
- [Additional Color Models](#Additional_Color_Models)
    - [HSI](#HSI)
    - [Hunter L,a,b](#Hunter_L_a_b)
- [License](#License)

<a id=Notation_and_Definitions></a>
## Notation and Definitions

In this document:

- The [**pseudocode conventions**](https://peteroupc.github.io/pseudocode.html) apply to this document.
- The term _RGB_ means red-green-blue.
- The abbreviation _ISO_ means the International Organization for Standardization.
- The abbreviation _CIE_ means the International Commission on Illumination (CIE, for its initials in French).
- The term _D65 white point_ means the white point determined by the CIE's D65 illuminant and the CIE 1931 standard observer.
- The term _D50 white point_ means the white point determined by the CIE's D50 illuminant and the CIE 1931 standard observer.

<a id=Kinds_of_Color_Spaces></a>
## Kinds of Color Spaces

**Device-dependent** color spaces are based on how devices display or record color.  Such color spaces include&mdash;

- **light-mixture color spaces**, based on mixtures of colored lights (such as RGB, red-green-blue), and
- **colorant-mixture color spaces**, based on mixtures of inks, dyes, or other colorants (such as CMYK, cyan-magenta-yellow-black).

A color space defined in terms of a device-dependent color space is itself device-dependent.  Examples of this include HSL, HSV, and HWB, which transform an RGB color space to ease intuition.

**Device-independent** color spaces are based on how humans perceive color.  These include XYZ color spaces as well as color spaces defined in terms of the XYZ color model, such as CIELAB and CIELUV.

<a id=Calculating_the_Mean_Hue_Angle></a>
## Calculating the Mean Hue Angle

The `MeanAngle` method, as given in the pseudocode below, finds the average of one or more angles expressed in radians (which is important when averaging colors in hue-based color models such as HSL, HSV, and CIE _L\*C\*h_, which contain hue components that are angles).

    METHOD MeanAngle(angles)
        if size(angles)==0: return 0
        xm=0
        ym=0
        i=0
        while i < size(angles)
            c = cos(angles[i])
            s = sin(angles[i])
            i = i + 1
            xm = xm + (c - xm) / i
            ym = ym + (s - ym) / i
        end
        return atan2(ym, xm)
    END

<a id=Additional_Color_Models></a>
## Additional Color Models

<a id=HSI></a>
### HSI

A color following the HSI color model consists of three components, in the following order:

- _Hue_ has the same general meaning as HSV hue, but is calculated differently.
- A component called "saturation" is 0 or greater and 1 or less.
- A component called "intensity", the average of the red, green, and blue components, is 0 or greater and 1 or less.

The conversions given below are independent of RGB color space, but should be done using [_linearized RGB_ colors](#Linearized_and_Companded_RGB).

    METHOD RgbToHsi(rgb)
        sum=rgb[0]+rgb[1]+rgb[2]
        if sum==0: return [0,0,0]
        r=rgb[0]*1.0/sum
        g=rgb[1]*1.0/sum
        b=rgb[2]*1.0/sum
        coshue=(2*r-g-b)/(2*sqrt((b-g)*(b-r)+(g-r)*(g-r)))
        hue=atan2(sqrt(1-coshue*coshue),coshue)
        if b>g: hue=2*pi-hue
        return [hue, 1-min(r,g,b)*3, sum/3.0]
    END METHOD

    METHOD HsiToRgb(hsi)
       h=hsi[0]
       if h < 0: h = pi * 2 - mod(-h, pi * 2)
       if h >= pi * 2: h = mod(h, pi * 2)
       deg120=2*pi/3
       hmod=mod(h, deg120)
       a=hsi[2]*(1-hsi[1])
       b=(hsi[1]*cos(hmod)/sin(hmod+pi/6)+1)*hsi[2]
       c=3*hsi[2]-a-b
       if h>=deg120 and h < deg120*2: return [a,b,c]
       if h>=deg120*2: return [c,a,b]
       return [b,c,a]
    END METHOD

<a id=Hunter_L_a_b></a>
### Hunter L,a,b

The conversion between XYZ and Hunter L,a,b colors is as given below.

    METHOD HunterLabFromXYZ(xyz, wpoint)
        x=xyz[0]/wpoint[0]
        y=xyz[1]/wpoint[1]
        z=xyz[2]/wpoint[2]
        l=100*sqrt(y)
        if l==0: return [0,0,0]
        a=(7*sqrt(102)*sqrt(wpoint[0]/y)*(x-wpoint[0]*y))/(4*wpoint[0])
        b=(77*sqrt(70)*sqrt(wpoint[2]/y)*(wpoint[2]*y-z))/(100*wpoint[2])
        return [l,a,b]
    END METHOD

    METHOD HunterLabToXYZ(lab, wpoint)
        y=lab[0]*lab[0]/10000.0
        if y==0: return [0,0,0]
        x=2*sqrt(102)*lab[1]*wpoint[0]/(357*sqrt(wpoint[0]/y))+wpoint[0]*y
        z=-10*sqrt(70)*lab[1]*wpoint[2]/(539*sqrt(wpoint[2]/y))+wpoint[2]*y
        return [x,y/wpoint[1],z]
    END METHOD

The `LabToHue`, `LabToChroma`, `LabHueDifference`,
`LabChromaHueDifference`, and
`LchToLab` methods from the [discussion on CIELAB colors](colorgen.html#CIELAB) work with
Hunter L, a, b colors analogously to CIELAB colors.

The difference in lightness, _a_, _b_, or chroma (_&Delta;L_, _&Delta;a_, _&Delta;b_, or _&Delta;C_, respectively), between two Hunter L, a, b colors is simply the difference between the corresponding value of the second Hunter L, a, b color and that of the first.

<a id=License></a>
## License
This page is licensed under [Creative Commons Zero](https://creativecommons.org/publicdomain/zero/1.0/).
