# Color Topics for Programmers

[Peter Occil](mailto:poccil14@gmail.com)

<a id=Introduction></a>
## Introduction

This document presents an overview of many common color topics that are of general interest to programmers and that can be implemented in many different programming languages. **[Sample Python code](https://peteroupc.github.io/colorutil.py) that implements many of the methods in this document is available.**  [Supplemental topics](https://peteroupc.github.io/suppcolor.html) are listed in another open-source page.

**Topics this document covers include:**

- Red-green-blue (RGB) and other color models of practical interest.
- How to generate colors with certain properties.
- Color differences, color maps, and color mixing.
- Dominant colors of an image.
- Colors as spectral data.

**This document does not cover:**

- Procedures to change or set the color used&mdash;
    - in text, foregrounds, or backgrounds of user interface elements (such as buttons, text boxes, and windows),
    - in text or backgrounds of documents (such as HTML documents), or
    - when generating graphics (such as plots and charts).
- Determining which colors are used, or used by default, in user interface elements or documents.
- Color pickers, including how to choose colors with them.
- Specifics on retrieving colors (including pixel and palette colors) from images or screenshots (besides finding dominant colors).
- Setting colors (including pixel colors) on images.
- Colorization of command line outputs (or terminal or shell outputs) beyond describing the ANSI color codes.
- In general, topics that are specific to a programming language or application programming interface.

<a id=Contents></a>
## Contents

- [Introduction](#Introduction)
- [Contents](#Contents)
- [Notation and Definitions](#Notation_and_Definitions)
- [Specifying Colors](#Specifying_Colors)
- [RGB Color Model](#RGB_Color_Model)
    - [RGB Integer Formats](#RGB_Integer_Formats)
    - [HTML-Related Color Formats](#HTML_Related_Color_Formats)
    - [Linearized RGB and Companded RGB](#Linearized_RGB_and_Companded_RGB)
    - [sRGB](#sRGB)
- [Other Color Models](#Other_Color_Models)
    - [HSV](#HSV)
    - [HSL](#HSL)
    - [HWB](#HWB)
    - [CIE XYZ](#CIE_XYZ)
        - [Chromaticity Coordinates](#Chromaticity_Coordinates)
    - [CIELAB](#CIELAB)
    - [CIELUV](#CIELUV)
    - [Y&prime;C<sub>_B_</sub>C<sub>_R_</sub>](#Y_prime_C_B_C_R)
    - [CMYK](#CMYK)
- [Modifying Existing Colors](#Modifying_Existing_Colors)
    - [Relative Luminance (Grayscale)](#Relative_Luminance_Grayscale)
    - [Color Schemes](#Color_Schemes)
    - [Alpha Blending](#Alpha_Blending)
    - [Porter&ndash;Duff Formulas](#Porter_ndash_Duff_Formulas)
    - [Blend Modes](#Blend_Modes)
    - [Color Matrices](#Color_Matrices)
    - [Miscellaneous](#Miscellaneous)
- [Color Differences](#Color_Differences)
    - [Nearest Colors](#Nearest_Colors)
- [Dominant Colors of an Image](#Dominant_Colors_of_an_Image)
- [Color Maps](#Color_Maps)
    - [Kinds of Color Maps](#Kinds_of_Color_Maps)
    - [Color Collections](#Color_Collections)
    - [Visually Distinct Colors](#Visually_Distinct_Colors)
    - [Pseudocode](#Pseudocode)
- [Generating a Random Color](#Generating_a_Random_Color)
- [Spectral Color Functions](#Spectral_Color_Functions)
    - [Color Temperature](#Color_Temperature)
    - [Color Mixture](#Color_Mixture)
- [Terminal Colors](#Terminal_Colors)
- [Conclusion](#Conclusion)
    - [Questions for This Document](#Questions_for_This_Document)
- [Notes](#Notes)
- [License](#License)

<a id=Notation_and_Definitions></a>
## Notation and Definitions

- The [**pseudocode conventions**](https://peteroupc.github.io/pseudocode.html) apply to this document.
- **CIE.** French initials for the International Commission on Illumination.
- **Color model.** Describes, in general terms, the relationship of colors in a theoretical space.
- **Color space.** A mapping from colors to numbers that follows a particular color model.
- **D65 white point.** The white point determined by the CIE's D65 illuminant and the CIE 1931 standard observer.
- **D50 white point.** The white point determined by the CIE's D50 illuminant and the CIE 1931 standard observer.
- **IEC.** International Electrotechnical Commission.
- **ISO.** International Organization for Standardization.
- **Light source.** Means a [_primary light source_](http://eilv.cie.co.at/term/982) or an [_illuminant_](http://eilv.cie.co.at/term/554), as defined by the CIE.  Roughly means an emitter of light, or radiation describing an emitter of light.
- **RGB.** Red-green-blue.
- **`RNDNUMRANGE`, `RNDU01`, `RNDINT`, `RNDINTEXC`.** These methods are defined in my article on [random number generation methods](https://peteroupc.github.io/randomfunc.html).
- **SPD.** Spectral power distribution.

<a id=Specifying_Colors></a>
## Specifying Colors

A color can be specified in one of two ways:

* **As a point in space**, that is, as a small set of numbers (usually three numbers) showing where the color lies in a color space. This is what mostly happens in practice. Some color spaces include the following:
    - [RGB](#RGB_Color_Model) color spaces describe proportions of red, green, and blue dots of light.
    - [HSV](#HSV), [HSL](#HSL), and [HWB](#HWB) color spaces transform RGB colors to make their presentation more intuitive, but are not perception-based.
    - [XYZ](#CIE_XYZ), [CIELAB](#CIELAB), and [CIELUV](#CIELUV) color spaces are based on human color perception.
    - [CMYK](#CMYK) color spaces are especially used to describe proportions of four specific kinds of ink.
    - [Y&prime;C<sub>_B_</sub>C<sub>_R_</sub>](#Y_prime_C_B_C_R) color spaces are especially used in video encoding.
* **As a _spectral curve_**, which gives the behavior of light across the spectrum (see "[Spectral Color Functions](#Spectral_Color_Functions)").  Colors given as spectral curves, unlike colors in RGB or other color spaces, have the advantage that they are not specific to a lighting condition, whereas colors in a given color space assume a specific lighting, viewing, or printing condition.

<a id=RGB_Color_Model></a>
## RGB Color Model

The **red-green-blue (RGB) color model** is the most commonly seen color model in mainstream computer programming.

The RGB model is ideally based on the intensity that red, green, and blue dots of light should have in order to reproduce certain colors on electronic displays.<sup>[(1)](#Note1)</sup> The RGB model is a three-dimensional cube with one vertex set to black, the opposite vertex set to white, and the remaining vertices set to red, green, blue, cyan, yellow, and magenta.

**RGB color spaces** generally differ in their red, green, blue, and white points<sup>[(2)](#Note2)</sup> as well as in their [_color component transfer functions_](#Linear_RGB_and_Companded_RGB).

An **RGB color** (in a given RGB color space) consists of&mdash;
- a `red` component,
- a `green` component, and
- a `blue` component,

in that order, and each component is 0 or greater and 1 or less. (In this document, this format is called the  **0-1 format** and all RGB colors are in this format unless noted otherwise.)

**RGBA Colors:** Some RGB colors also contain a fourth component, called the _alpha_ component, which is 0 greater and 1 or less (from fully transparent to fully opaque). Such RGB colors are called _RGBA colors_ in this document.  RGB colors without an alpha component are generally considered to be fully opaque (and to have an implicit alpha component of 1).

**Note:** An RGB color&mdash;
- is white, black, or a shade of gray (_achromatic_) if it has equal red, green, and blue components, and
- is a ["Web safe" color](http://en.wikipedia.org/wiki/Web_colors) if its red, green, and blue components are each a multiple of 0.2.

A collection of colors (including a raster image) is achromatic or "Web safe" if all those colors are achromatic or "Web safe", respectively.

<a id=RGB_Integer_Formats></a>
### RGB Integer Formats

RGB and RGBA colors are often expressed by packing their components as integers. This document recognizes two general categories of RGB integer formats:

- **RN/GN/BN format:** With an RN-bit red component, a GN-bit green, and a BN-bit blue, resulting in an integer that's (RN + GN + BN) bits long.
- **RN/GN/BN/AN format:** With an RN-bit red component, a GN-bit green, a BN-bit blue, and an AN-bit alpha, resulting in an integer that's (RN + GN + BN + AN) bits long.

For both format categories, the lowest value of each component is 0, and its highest value is 2<sup>B</sup> - 1, where B is that component's size in bits.

The following are examples of these formats:
- **5/5/5 format:** As 15-bit integers (5 bits per component).
- **5/6/5 format:** As 16-bit integers (5 bits each for red and blue, and 6 bits for green).
- **8/8/8 format:** As 24-bit integers (8 bits per component).
- **8/8/8/8 format:** As 32-bit integers (8 bits each for red, green, blue, and alpha).
- **16/16/16 format:** As 48-bit integers (16 bits per component).

There are many ways to store RGB and RGBA colors in these formats as integers or as a series of bytes.  For example, the RGB color's components can be in "little endian" or "big endian" byte order, or RN/GN/BN colors can be packed red/green/blue, in that order from lowest to highest bits, or in a different order of those components.  A thorough survey of the integer color formats in common use is outside the scope of this document.

The following pseudocode contains methods for converting RGB colors to and from different color formats (where RGB color integers are packed red/green/blue, in that order from lowest to highest bits):

    // Converts 0-1 format to N/N/N format as an integer.
    METHOD ToNNN(rgb, scale)
       sm1 = scale - 1
       return round(rgb[2]*sm1) * scale * scale + round(rgb[1]*sm1) * scale +
             round(rgb[0]*sm1)
    END METHOD

    // Converts N/N/N integer format to 0-1 format
    METHOD FromNNN(rgb, scale)
       sm1 = scale - 1
       r = mod(rgb, scale)
       g = mod(floor(rgb / scale), scale)
       b = mod(floor(rgb / (scale * scale)), scale)
       return [ r / sm1, g / sm1, b / sm1]
    END METHOD

    METHOD To444(rgb): return ToNNN(rgb, 16)
    METHOD To555(rgb): return ToNNN(rgb, 32)
    METHOD To888(rgb): return ToNNN(rgb, 256)
    METHOD To161616(rgb): return ToNNN(rgb, 65536)
    METHOD From444(rgb): return FromNNN(rgb, 16)
    METHOD From555(rgb): return FromNNN(rgb, 32)
    METHOD From888(rgb): return FromNNN(rgb, 256)
    METHOD From161616(rgb): return FromNNN(rgb, 65536)

    METHOD To565(rgb, scale)
       return round(rgb[2] * 31) * 32 * 64 + round(rgb[1] * 63) * 32 +
             round(rgb[0] * 31)
    END METHOD

    METHOD From565(rgb, scale)
       r = mod(rgb, 32)
       g = mod(floor(rgb / 32.0), 64)
       b = mod(floor(rgb / (32.0 * 64.0)), 32)
       return [ r / 31.0, g / 63.0, b / 31.0]
    END METHOD

<a id=HTML_Related_Color_Formats></a>
### HTML-Related Color Formats

A color string in the **HTML color format** (also known as "hex" format), which expresses RGB colors in 8/8/8 format as text strings, consists of&mdash;

1. the character "#", followed by
2. six base-16 (hexadecimal) digits<sup>[(3)](#Note3)</sup>, two each for the red, green, and blue components, in that order.

For example, the HTML color `#003F86` expresses the RGB color whose red, green, and blue components in 8/8/8 format are (0, 63, 134).

Other variants of the HTML color format<sup>[(4)](#Note4)</sup>:

* The [CSS Color Module Level 3](https://www.w3.org/TR/css3-color/#rgb-color), which specifies this format, also mentions a **3-digit variant**, consisting of "#" followed by three base-16 digits, one each for the red, green, and blue components, in that order. Conversion to the 6-digit format involves replicating each base-16 component (for example, "#345" is the same as "#334455" in the 6-digit format).
* An **8-digit variant** used in the Android operating system consists of "#" followed by eight base-16 digits, two each for the alpha, red, green, and blue components, in that order.  This variant thus describes 8/8/8/8 RGBA colors.

The following pseudocode presents methods to convert RGB colors to and from the HTML color format or the 3-digit variant.

    METHOD NumToHex(x)
        if hex < 0 or hex >= 16: return error
        hexlist=["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"]
        return hexlist[x]
    END METHOD

    METHOD HexToNum(x)
        hexlist=["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"]
        hexdown=["a", "b", "c", "d", "e", "f"]
        i = 0
        while i < 16
                if hexlist[i] == x: return i
                i = i + 1
        end
        i = 0
        while i < 6
                if hexdown[i] == x: return 10 + i
                i = i + 1
        end
        return -1
    END METHOD

    METHOD ColorToHtml(rgb)
       r = round(rgb[0] * 255)
       g = round(rgb[1] * 255)
       b = round(rgb[2] * 255)
       return ["#",
         NumToHex(mod(floor(r/16),16)), NumToHex(mod(r, 16)),
         NumToHex(mod(floor(g/16),16)), NumToHex(mod(g, 16)),
         NumToHex(mod(floor(b/16),16)), NumToHex(mod(b, 16)),
       ]
    END METHOD

    METHOD HtmlToColor(colorString)
        if string[0]!="#": return error
        if size(colorString)==7
                r1=HexToNum(colorString[1])
                r2=HexToNum(colorString[2])
                g1=HexToNum(colorString[3])
                g2=HexToNum(colorString[4])
                b1=HexToNum(colorString[5])
                b2=HexToNum(colorString[6])
                if r1<0 or r2<0 or g1<0 or g2<0 or
                        b1<0 or b2<0: return error
                return [(r1*16+r2)/255.0,
                        (g1*16+g2)/255.0,
                        (b1*16+b2)/255.0]
        end
        if size(colorString)==4
                r=HexToNum(colorString[1])
                g=HexToNum(colorString[2])
                b=HexToNum(colorString[3])
                if r<0 or g<0 or b<0: return error
                return [(r*16+r)/255.0,
                        (g*16+g)/255.0,
                        (b*16+b)/255.0]
        end
        return error
    END METHOD

**Note:** As used in the [CSS color module level 3](http://www.w3.org/TR/css3-color/), for example, colors in the HTML color format or its 3-digit variant are in the [_sRGB color space_](#sRGB) (as companded colors).

<a id=Linearized_RGB_and_Companded_RGB></a>
### Linearized RGB and Companded RGB

In a given RGB color space:

- A _linear_ RGB color has a linear relationship of emitted light (as opposed to perceived light).
- A _companded_ RGB color has been encoded using that color space's _color component transfer function_, also known as _companding_ (one example is the `LinearTosRGB3` method [defined later](#sRGB)). For many RGB color spaces, companded RGB colors have a more or less linear relationship of perceived light, since human color perception is nonlinear.<sup>[(5)](#Note5)</sup>  RGB colors encoded in images and video or specified in documents are usually in companded form.

For many RGB color spaces, the _color component transfer function_ is a simple power function, such as _c_<sup>1/&gamma;</sup>, where _c_ is either the red, green, or blue component and &gamma; is a positive number. (In this case, that function is also called _gamma encoding_.)

In this document, all techniques involving RGB colors apply to such colors in linear or companded form, unless noted otherwise.

<a id=sRGB></a>
### sRGB

Among RGB color spaces, one of the most popular is the _sRGB color space_. sRGB, a "working space" for describing RGB colors, is based on the color output of cathode-ray-tube monitors.  (For background, see the [sRGB proposal](https://www.w3.org/Graphics/Color/sRGB).)<sup>[(6)](#Note6)</sup> The sRGB proposal recommends RGB image data in an unidentified RGB color space to be treated as sRGB.

The following methods convert colors between linear and companded sRGB.
(Note that the threshold `0.0031308` is that of IEC 61966-2-1, the official sRGB standard;
the sRGB proposal has a different value for this threshold.)

    // Convert a color component from companded to linearized RGB
    // NOTE: This is not gamma decoding; it's similar to, but
    // not exactly, c^2.2.
    METHOD LinearFromsRGB(c)
     // NOTE: Threshold here would more properly be
     // 12.92 * 0.0031308 = 0.040449936, but I don't know
     // whether that is what the IEC standard uses, either explicitly
     // or implicitly (see the "Conclusion" on this page).
      if c <= 0.04045: return c / 12.92
      return pow((0.055 + c) / 1.055, 2.4)
    END METHOD

    // Convert a color component from linear to companded sRGB
    // NOTE: This is not gamma encoding; it's similar to, but
    // not exactly, c^(1/2.2).
    METHOD LinearTosRGB(c)
      if c <= 0.0031308: return 12.92 * c
      return pow(c, 1.0 / 2.4) * 1.055 - 0.055
    END METHOD

    // Convert a color from companded to linearized RGB
    METHOD LinearFromsRGB3(c)
       return [LinearFromsRGB(c[0]), LinearFromsRGB(c[1]), LinearFromsRGB(c[2])]
    END METHOD

    // Convert a color from linear to companded sRGB
    METHOD LinearTosRGB3(c)
       return [LinearTosRGB(c[0]), LinearTosRGB(c[1]), LinearTosRGB(c[2])]
    END METHOD

<a id=Other_Color_Models></a>
## Other Color Models

The following sections discuss several color models, other than RGB, that are of practical interest.

<a id=HSV></a>
### HSV

[HSV](https://en.wikipedia.org/wiki/HSL_and_HSV)  (also known as HSB) is a color model that transforms RGB colors to make them easier to manipulate and reason with.  An HSV color consists of three components, in the following order:

- _Hue_ is an angle from red at 0 to yellow to green to cyan to blue to magenta to red.<sup>[(7)](#Note7)</sup>
- A component called "saturation", the distance of the color from gray and white (but not necessarily from black),
  is 0 or greater and 1 or less.
- A component variously called "value" or "brightness" is the distance of the color from black and is 0 or greater and 1 or less.

The following pseudocode converts colors between RGB and HSV.
The transformation is independent of RGB color space, but should be done using [_linear RGB_ colors](#Linear_RGB_and_Companded_RGB).

    METHOD RgbToHsv(rgb)
        mx = max(max(rgb[0], rgb[1]), rgb[2])
        mn = min(min(rgb[0], rgb[1]), rgb[2])
        if mx==mn: return [0,0,mx]
        s=(mx-mn)/mx
        h=0
        if rgb[0]==mx
                h=(rgb[1]-rgb[2])/(mx-mn)
        else if rgb[1]==mx
                h=2+(rgb[2]-rgb[0])/(mx-mn)
        else
                h=4+(rgb[0]-rgb[1])/(mx-mn)
        end
        if h < 6: h = 6 - mod(-h, 6)
        if h >= 6: h = mod(h, 6)
        return [h * (pi / 3), s, mx]
    END METHOD

    METHOD HsvToRgb(hsv)
        hue=hsv[0]
        sat=hsv[1]
        val=hsv[2]
        if hue < 0: hue = pi * 2 - mod(-hue, pi * 2)
        if hue >= pi * 2: hue = mod(hue, pi * 2)
        hue60 = hue * 3 / pi
        hi = floor(hue60)
        f = hue60 - hi
        c = val * (1 - sat)
        a = val * (1 - sat * f)
        e = val * (1 - sat * (1 - f))
        if hi == 0: return [val, e, c]
        if hi == 1: return [a, val, c]
        if hi == 2: return [c, val, e]
        if hi == 3: return [c, a, val]
        if hi == 4: return [e, c, val]
        return [val, c, a]
    END METHOD

In the rest of this document&mdash;

- **`HSVHue(color)`** is the HSV "hue" component of a color, that is, `RgbToHsv(color)[0]`,
- **`HSVSat(color)`** is the HSV "saturation" component of a color, that is, `RgbToHsv(color)[1]`, and
- **`HSVVal(color)`** is the HSV "brightness" or "value" component of a color, that is, `RgbToHsv(color)[2]`.

**Notes:**

- In most applications, hue is in degrees and is 0 or greater and less than 360.
- The HSV color model is not perception-based, as acknowledged in (Smith and Lyons 1996).

<a id=HSL></a>
### HSL

[HSL](https://en.wikipedia.org/wiki/HSL_and_HSV) (also known as HLS), like HSV, is a color model that transforms RGB colors to ease intuition.  An HSL color consists of three components, in the following order:

- _Hue_ is the same for a given RGB color as in [HSV](#HSV).
- A component called "saturation" is the distance of the color from gray (but not necessarily from
black or white), which is 0 or greater and 1 or less.
- A component variously called "lightness", "luminance", or "luminosity", is roughly the amount
of black or white mixed with the color and is 0 or greater and 1 or less, where 0 is black, 1 is white, closer to 0 means closer to black, and closer to 1 means closer to white.

The following pseudocode converts colors between RGB and HSL.  The transformation is independent of RGB color space, but should be done using [_linear RGB_ colors](#Linear_RGB_and_Companded_RGB).

    METHOD RgbToHsl(rgb)
        vmax = max(max(rgb[0], rgb[1]), rgb[2])
        vmin = min(min(rgb[0], rgb[1]), rgb[2])
        vadd = vmax + vmin
        // NOTE: "Lightness" is the midpoint between
        // the greatest and least RGB component
        lt = vadd / 2.0
        if vmax==vmin: return [0, 0, lt]
        vd = vmax - vmin
        divisor = vadd
        if lt > 0.5: divisor = 2.0 - vadd
        s = vd / divisor
        h = 0
        hvd = vd / 2.0
        deg60 = pi / 3
        if rgb[0]==vmax
                h=((vmax-rgb[2])*deg60 + hvd) / vd
                h = h - ((vmax-rgb[1])*deg60+hvd) / vd
        else if rgb[2]==vmax
                h=pi * 4 / 3 + ((vmax-rgb[1])*deg60 + hvd) / vd
                h = h - ((vmax-rgb[0])*deg60+hvd) / vd
        else
                h=pi * 2 / 3 + ((vmax-rgb[0])*deg60 + hvd) / vd
                h = h - ((vmax-rgb[2])*deg60+hvd) / vd
        end
        if h < 0: h = pi * 2 - mod(-h, pi * 2)
        if h >= pi * 2: h = mod(h, pi * 2)
        return [h, s, lt]
    END METHOD

    METHOD HslToRgb(hsl)
        if hsl[1]==0: return [hsl[2],hsl[2],hsl[2]]
        lum = hsl[2]
        sat = hsl[1]
        bb = 0
        if lum <= 0.5: bb = lum * (1.0 + sat)
        if lum > 0.5: bb= lum + sat - (lum * sat)
        a = lum * 2 - bb
        hueval = hsl[0]
        if hueval < 0: hueval = pi * 2 - mod(-hueval, pi * 2)
        if hueval >= pi * 2: hueval = mod(hueval, pi * 2)
        deg60 = pi / 3
        deg240 = pi * 4 / 3
        hue = hueval + pi * 2 / 3
        hue2 = hueval - pi * 2 / 3
        if hue >= pi * 2: hue = hue - pi * 2
        if hues2 < 0: hues2 = hues2 + pi * 2
        rgb = [a, a, a]
        hues = [hue, hueval, hue2]
        i = 0
        while i < 3
           if hues[i] < deg60: rgb[i] = a + (bb - a) * hues[i] / deg60
           else if hues[i] < pi: rgb[i] = bb
           else if hues[i] < deg240
                rgb[i] = a + (bb - a) * (deg240 - hues[i]) / deg60
           end
           i = i + 1
        end
        return rgb
    END METHOD

In the rest of this document&mdash;

- **`HSLSat(color)`** is the HSL "saturation" component of a color, that is, `RgbToHsl(color)[1]`, and
- **`HSLLgt(color)`** is the HSL "lightness" component of a color, that is, `RgbToHsl(color)[2]`.

**Notes:**

- In some applications and specifications, especially where this color model is called HLS, the HSL color's "lightness" component comes before "saturation".  This is not the case in this document, though.
- The HSL color model is not perception-based, as acknowledged in (Smith and Lyons 1996).

<a id=HWB></a>
### HWB

In 1996, the HWB model, which seeks to be more intuitive than HSV or HSL, was published (Smith and Lyons 1996).  An HWB color consists of three components in the following order:
- _Hue_ is the same for a given RGB color as in [HSV](#HSV).
- _Whiteness_, the amount of white mixed to the color, is 0 or greater and 1 or less.
- _Blackness_, the amount of black mixed to the color, is 0 or greater and 1 or less.

The conversions given below are independent of RGB color space, but should be done using [_linear RGB_ colors](#Linear_RGB_and_Companded_RGB).

- To convert an RGB color `color` to HWB, generate `[HSVHue(color), min(min(color[0], color[1]), color[2]), 1 - max(max(color[0], color[1]), color[2])]`.
- To convert an HWB color `hwb` to RGB, generate `HsvToRgb([hwb[0], 1 - hwb[1]/(1-hwb[2]), 1 - hwb[2]])` if `hwb[2] < 1`, or `[hwb[0], 0, 0]` otherwise.

**Note:** The HWB color model is not perception-based, as acknowledged in (Smith and Lyons 1996).

<a id=CIE_XYZ></a>
### CIE XYZ

The [CIE 1931 standard colorimetric system](https://en.wikipedia.org/wiki/CIE_1931_color_space) (called the _XYZ color model_ in this document) describes a transformation of a distribution of light into a point in three-dimensional space, as further explained in "[Spectral Color Functions](#Spectral_Color_Functions)".  An XYZ color consists of three components, in the following order:

- X is a component without special meaning.
- Y indicates the [_luminance_](http://6degreesoffreedom.co/luminance-vs-illuminance/) of the color.<sup>[(8)](#Note8)</sup>
- Z is a component without special meaning.

There are at least two conventions for XYZ colors:

- In one convention ("absolute XYZ"), the Y component represents an absolute luminance in candelas per square meter (cd/m<sup>2</sup>).
- In another convention ("relative XYZ"), the three components are normalized to a given white point and black point (usually those of a _reference medium_), such that Y ranges from 0 for black to a known value for white.  Specifically, the relative XYZ color is the absolute XYZ color minus the black point, then divided by the absolute-Y difference between the white point and the black point, then multiplied by a normalizing factor such as 1 or 100.  In this sense, the black point is generally, but not always, the absolute XYZ color `[0, 0, 0]` ("absolute black"), that is, one having a Y component (absolute luminance) of 0 cd/m<sup>2</sup>.

The following methods, in the pseudocode below, convert a companded sRGB color (`rgb`) to and from a relative XYZ color, where a Y of 0 means "absolute black":
- `XYZFromsRGB(rgb)` and  `XYZTosRGB(xyz)` treat a Y of 1 as the D65 white point.
- `XYZFromsRGBD50(rgb)` and  `XYZTosRGBD50(xyz)` treat a Y of 1 as the D50 white point (see note 2 later in this section)<sup>[(9)](#Note9)</sup>.

&nbsp;

    METHOD Clamp01(elements)
        return [min(max(elements[0],0), 1),
          min(max(elements[1],0), 1),
          min(max(elements[2],0), 1)]
    END METHOD

    // Applies a 3x3 matrix transformation
    METHOD Apply3x3Matrix(xyz, xyzmatrix)
        r=xyz[0]*xyzmatrix[0]+xyz[1]*xyzmatrix[1]+xyz[2]*xyzmatrix[2]
        g=xyz[0]*xyzmatrix[3]+xyz[1]*xyzmatrix[4]+xyz[2]*xyzmatrix[5]
        b=xyz[0]*xyzmatrix[6]+xyz[1]*xyzmatrix[7]+xyz[2]*xyzmatrix[8]
        return [r,g,b]
    END METHOD

    METHOD XYZFromsRGBD50(rgb)
        lin=LinearFromsRGB3(rgb)
        return Apply3x3Matrix(lin, [0.4360657, 0.3851515, 0.1430784,
                0.2224932, 0.7168870, 0.06061981, 0.01392392,
                0.09708132, 0.7140994])
    END METHOD

    // NOTE: Clamps components less than 0 or greater than 1 to be 0 or 1,
    // respectively.  If that's not
    // desired, omit the use of Clamp01 in the method below.
    METHOD XYZTosRGBD50(xyz)
        rgb=Apply3x3Matrix(xyz, [3.134136, -1.617386, -0.4906622,
                 -0.9787955, 1.916254, 0.03344287, 0.07195539,
                 -0.2289768, 1.405386])
        return Clamp01(LinearTosRGB3(rgb))
    END METHOD

    METHOD XYZFromsRGB(rgb)
        lin=LinearFromsRGB3(rgb)
        // NOTE: Official matrix is rounded to nearest 1/10000
        return Apply3x3Matrix(lin, [0.4123908, 0.3575843, 0.1804808,
                0.2126390, 0.7151687, 0.07219232, 0.01933082,
                0.1191948, 0.9505322])
    END METHOD

    // NOTE: Clamps components less than 0 or greater than 1 to be 0 or 1,
    // respectively.  If that's not
    // desired, omit the use of Clamp01 in the method below.
    METHOD XYZTosRGB(xyz)
        rgb=Apply3x3Matrix(xyz, [3.240970, -1.537383, -0.4986108,
                -0.9692436, 1.875968, 0.04155506, 0.05563008,
                -0.2039770, 1.056972])
        return Clamp01(LinearTosRGB3(rgb))
    END METHOD

**Notes:**

1. In the pseudocode just given, 3x3 matrices are used to transform a linearized RGB color to or from XYZ form. The matrix shown in `XYZTosRGB` or `XYZTosRGBD50` is the [inverse of the matrix](http://peteroupc.github.io/html3dutil/tutorial-matrixdetails.html#Matrix_Inversions) shown in `XYZFromsRGB` or `XYZFromsRGBD50`, respectively.<sup>[(10)](#Note10)</sup>
2. Where the XYZ color will be relative to a different white point than the RGB color space's usual white point,
a [_chromatic adaptation_](https://en.wikipedia.org/wiki/Chromatic_adaptation) from one white point to another (such as a linear Bradford transformation)
needs to be done to the RGB-to-XYZ matrix.  The XYZ-to-RGB matrix is then the [inverse](http://peteroupc.github.io/html3dutil/tutorial-matrixdetails.html#Matrix_Inversions) of the adapted matrix. The `XYZFromsRGBD50` and `XYZTosRGBD50` methods are examples of such adaptation.<sup>[(10)](#Note10)</sup>

<a id=Chromaticity_Coordinates></a>
#### Chromaticity Coordinates

_Chromaticity_ is the aspect of a color apart from its luminance. Some kinds of _chromaticity coordinates_ follow.

- **_xy_ chromaticity.** The chromaticity coordinates _x_, _y_, and _z_ are each the ratios of the corresponding component of an XYZ color to the sum of those components; therefore, those three coordinates sum to 1.  "xyY" form consists of _x_ then _y_ then the Y component of an XYZ color. "Yxy" form consists of the Y component then _x_ then _y_ of an XYZ color.
- **_u&prime;v&prime;_ chromaticity.**  _u&prime;_ and _v&prime;_ describe what are considered uniform chromaticity coordinates for light sources.<sup>[(11)](#Note11)</sup> "u&prime;v&prime;Y" form consists of _u&prime;_ then _v&prime;_  then  the Y component of an XYZ color.  "Yu&prime;v&prime;" form consists of the Y component then _u&prime;_ then _v&prime;_ of an XYZ color.
- **_rg_ chromaticity** (_r_, _g_, _b_) involves RGB colors rather than XYZ colors
and is calculated analogously to _xy_ chromaticity.

In the following pseudocode, `XYZToxyY` and `XYZFromxyY` convert XYZ colors to and from their "xyY" form, respectively, and `XYZTouvY` and `XYZFromuvY` convert XYZ colors to and from their "u&prime;v&prime;Y" form, respectively.

        METHOD XYZToxyY(xyz)
                // NOTE: Results undefined if sum==0
                sum=xyz[0]+xyz[1]+xyz[2]
                return [xyz[0]/sum, xyz[1]/sum, xyz[1]]
        END METHOD

        METHOD XYZFromxyY(xyy)
                // NOTE: Results undefined if xyy[1]==0
                return [xyy[0]*xyy[2]/xyy[1], xyy[2], xyy[2]*(1 - xyy[0] - xyy[1])/xyy[1]]
        END METHOD

        METHOD XYZTouvY(xyz)
                // NOTE: Results undefined if sum==0
                sum=xyz[0]+xyz[1]*15+xyz[2]*3
                return [4*xyz[0]/sum,9*xyz[1]/sum,xyz[1]]
        END METHOD

        METHOD XYZFromuvY(uvy)
                // NOTE: Results undefined if uvy[1]==0
                x=(9*uvy[0]*uvy[2])/(4*uvy[1])
                z=0-(x/3)-5*uvy[2]+(3*uvy[2]/uvy[1])
                return [x,uvy[1],z]
        END METHOD

<a id=CIELAB></a>
### CIELAB

[CIELAB](https://en.wikipedia.org/wiki/Lab_color_space) (also known as CIE _L\*a\*b\*_ or CIE 1976 _L\*a\*b\*_) is a three-dimensional color model designed for color comparisons.<sup>[(12)](#Note12)</sup> In general, CIELAB color spaces differ in their white points.

A color in CIELAB consists of three components, in the following order:

- _L\*_, or _lightness_ of a color (how bright that color appears in comparison to white), is 0 or greater and 100 or less, where 0 is black and 100 is white.
- _a\*_ is a coordinate of the red/green axis; the positive _a\*_ axis points to red (actually magenta)
 and the negative _a\*_ axis points to green.
- _b\*_ is a coordinate of the yellow/blue axis; the positive _b\*_ axis points to yellow
 and the negative _b\*_ axis points to blue.<sup>[(13)](#Note13)</sup>

In the following pseudocode:
- The following methods convert a companded sRGB color to and from CIELAB:
    - `SRGBToLab` and `SRGBFromLab` treat white as the D65 white point.
    - `SRGBToLabD50` and `SRGBFromLabD50` treat white as the D50 white point.<sup>[(9)](#Note9)</sup>
- `XYZToLab(xyz, wpoint)` and `LabToXYZ(lab, wpoint)` convert an XYZ color to or from CIELAB, respectively, treating `wpoint` (an XYZ color) as the white point.
- `LabToChroma(lab)` finds a CIELAB color's _chroma_ (_C\*_, relative colorfulness), or distance of that color from the "gray" line.<sup>[(14)](#Note14)</sup>
- `LabToHue(lab)` finds a CIELAB color's _hue_ (_h_, an angle)<sup>[(7)](#Note7)</sup>. Hue ranges from magenta at roughly 0 to red to yellow to green to cyan to blue to magenta.
- `LchToLab(lch)` finds a CIELAB color given a 3-item list of lightness, chroma, and hue (_L\*C\*h_), in that order.
- `LabHueDifference(lab1, lab2)` finds the _metric hue difference_ (_&Delta;H\*_) between two CIELAB colors.  The return value can be positive or negative, but in some cases, the absolute value of that return value can be important.
- `LabChromaHueDifference(lab1, lab2)` finds the _chromaticness difference_ (&Delta;_C_<sub>h</sub>) between two CIELAB colors, as given, for example, in ISO 13655.

&nbsp;

    METHOD XYZToLab(xyzval, wpoint)
        xyz=[xyzval[0]/wpoint[0],xyzval[1]/wpoint[1],xyzval[2]/wpoint[2]]
        i=0
        while i < 3
           if xyz[i] > 216.0 / 24389 // See BruceLindbloom.com
              xyz[i]=pow(xyz[i], 1.0/3.0)
           else
               kappa=24389.0/27 // See BruceLindbloom.com
               xyz[i]=(16.0 + kappa*xyz[i]) / 116
           end
           i=i+1
        end
        return [116.0*xyz[1] - 16,
            500 * (xyz[0] - xyz[1]),
            200 * (xyz[1] - xyz[2])]
    END METHOD

    METHOD LabToXYZ(lab,wpoint)
        fy=(lab[0]+16)/116.0
        fx=fy+lab[1]/500.0
        fz=fy-lab[2]/200.0
        fxcb=fx*fx*fx
        fzcb=fz*fz*fz
        xyz=[fxcb, 0, fzcb]
        eps=216.0/24389 // See BruceLindbloom.com
        if fxcb <= eps: xyz[0]=(108.0*fx/841)-432.0/24389
        if fzcb <= eps: xyz[2]=(108.0*fz/841)-432.0/24389
        if lab[0] > 8 // See BruceLindbloom.com
                xyz[1]=pow(((lab[0]+16)/116.0), 3.0)
        else
                xyz[1]=lab[0]*27.0/24389 // See BruceLindbloom.com
        end
        xyz[0]=xyz[0]*wpoint[0]
        xyz[1]=xyz[1]*wpoint[1]
        xyz[2]=xyz[2]*wpoint[2]
        return xyz
    END METHOD

    METHOD SRGBToLab(rgb)
        return XYZToLab(XYZFromsRGB(rgb), [0.9504559, 1, 1.089058])
    END METHOD

    METHOD SRGBFromLab(lab)
        return XYZTosRGB(LabToXYZ(lab, [0.9504559, 1, 1.089058]))
    END METHOD

    METHOD SRGBToLabD50(rgb)
        return XYZToLab(XYZFromsRGBD50(rgb), [0.9642957, 1, 0.8251046])
    END METHOD

    METHOD SRGBFromLabD50(lab)
        return XYZTosRGBD50(LabToXYZ(lab, [0.9642957, 1, 0.8251046]))
    END METHOD

       // -- Derived values from CIELAB colors

    METHOD LabToChroma(lab)
            return sqrt(lab[1]*lab[1] + lab[2]*lab[2])
    END METHOD

        METHOD LabToHue(lab)
                h = atan2(lab[2], lab[1])
                if h < 0: h = h + pi * 2
                return h
        END METHOD

        METHOD LchToLab(lch)
                return [lch[0], lch[1] * cos(lch[2]), lch[1] * sin(lch[2])]
        END METHOD

    METHOD LabHueDifference(lab1, lab2)
      cmul=LabToChroma(lab1)*LabToChroma(lab2)
      h2=LabToHue(lab2)
      h1=LabToHue(lab1)
      hdiff=h2-h1
      if abs(hdiff)>pi
            if h2<=h1: hdiff=hdiff+math.pi*2
            else: hdiff=hdiff-math.pi*2
      end
      return sqrt(cmul)*sin(hdiff*0.5)*2
    END METHOD

    METHOD LabChromaHueDifference(lab1, lab2)
                da=lab1[1]-lab2[1]
                db=lab1[2]-lab2[2]
                return sqrt(da*da+db*db)
        END METHOD

**Note:** The difference in lightness, _a\*_, _b\*_, or chroma (_&Delta;L\*_, _&Delta;a\*_, _&Delta;b\*_, or _&Delta;C\*_, respectively), between two CIELAB colors is simply the difference between the corresponding value of the second CIELAB color and that of the first.

<a id=CIELUV></a>
### CIELUV

CIELUV (also known as CIE _L\*u\*v\*_ or CIE 1976 _L\*u\*v\*_) is a second color model designed for color comparisons.   A CIELUV color has three components, namely, _L\*_, or _lightness_ (which is the same as in CIELAB), _u\*_, and _v\*_, in that order.  As [B. MacEvoy explains](http://www.handprint.com/HP/WCL/color7.html#CIELUV), "CIELUV represents the additive mixture of two lights as a straight line", so that this color model is especially used when working with colors of light sources.

In the following pseudocode, the `SRGBToLuv`, `SRGBFromLuv`, `SRGBToLuvD50`, `SRGBFromLuvD50`, `XYZToLuv`, and `LuvToXYZ` methods perform conversions involving CIELUV colors analogously to the similarly named methods for [CIELAB](#CIELAB).

    METHOD XYZToLuv(xyz, wpoint)
        lab=XYZToLab(xyz, wpoint)
        sum=xyz[0]+xyz[1]*15+xyz[2]*3
        lt=lab[0]
        if sum==0: return [lt, 0, 0]
        upr=4*xyz[0]/sum // U-prime chromaticity
        vpr=9*xyz[1]/sum // V-prime chromaticity
        sumwhite=wpoint[0]+15*wpoint[1]+wpoint[2]*3
        return [lt,
                lt*13*(upr - 4*wpoint[0]/sumwhite),
                lt*13*(vpr - 9.0*wpoint[1]/sumwhite)]
    END METHOD

    METHOD LuvToXYZ(luv, wpoint)
        if luv[0]==0: return [0, 0, 0]
        xyz=LabToXYZ([luv[0], 1, 1],wpoint)
        sumwhite=wpoint[0]+15*wpoint[1]+wpoint[2]*3
        u0=4*wpoint[0]/sumwhite
        v0=9.0*wpoint[1]/sumwhite
        lt=luv[0]
        a=(52*lt/(luv[1]+13*u0*lt)-1)/3.0
        d=xyz[1]*(39*lt/(luv[2]+13*v0*lt)-5)
        x=(d+5*xyz[1])/(a+1.0/3)
        z=x*a-5*xyz[1]
        return [x,xyz[1],z]
    END METHOD

    METHOD SRGBToLuv(rgb)
        return XYZToLuv(XYZFromsRGB(rgb), [0.9504559, 1, 1.089058])
    END METHOD

    METHOD SRGBFromLuv(luv)
        return XYZTosRGB(LuvToXYZ(luv, [0.9504559, 1, 1.089058]))
    END METHOD

    METHOD SRGBToLuvD50(rgb)
        return XYZToLuv(XYZFromsRGBD50(rgb), [0.9642957, 1, 0.8251046])
    END METHOD

    METHOD SRGBFromLuvD50(luv)
        return XYZTosRGBD50(LuvToXYZ(luv, [0.9642957, 1, 0.8251046]))
    END METHOD

Hue and chroma can be derived from a
CIELUV color in a similar way as from a CIELAB color, with
_u\*_ and _v\*_ used instead of _a\*_ and _b\*_, respectively.
The `LabToHue`, `LabToChroma`, `LabHueDifference`,
`LabChromaHueDifference`, and
`LchToLab` methods from the previous section work with
CIELUV colors analogously to CIELAB colors.
A color's [_saturation_](https://en.wikipedia.org/wiki/Colorfulness) (_s_<sub>uv</sub>)
can be derived from a CIELUV color with a method demonstrated
in the following pseudocode:

    METHOD LuvToSaturation(luv)
        if luv[0]==0: return 0
        return sqrt(luv[1]*luv[1]+luv[2]*luv[2])/luv[0]
    END METHOD

**Note:** The difference in lightness, _u\*_, _v\*_, chroma, or saturation (_&Delta;L\*_, _&Delta;u\*_, _&Delta;v\*_,  _&Delta;C\*_<sub>uv</sub>, or _&Delta;s_<sub>uv</sub>, respectively), between two CIELUV colors is simply the difference between the corresponding value of the second CIELUV color and that of the first.

<a id=Y_prime_C_B_C_R></a>
### Y&prime;C<sub>_B_</sub>C<sub>_R_</sub>

[Y&prime;C<sub>_B_</sub>C<sub>_R_</sub>](https://en.wikipedia.org/wiki/YCbCr) (also known as YCbCr, YCrCb, or  Y&prime;CrCb) is a color model used above all in video encoding.  A color in Y&prime;C<sub>_B_</sub>C<sub>_R_</sub> consists of three components in the following order:

- Y&prime;, or _luma_, is an integer 16 or greater and 235 or less: 16 for black, and 235 for white.<sup>[(15)](#Note15)</sup>
- C<sub>_B_</sub>, or _blue chroma_, is based on the difference between blue and luma and is an integer 16 or greater and 240 or less.
- C<sub>_R_</sub>, or _red chroma_, is, based on the difference between red and luma and is an integer 16 or greater and 240 or less.

The following pseudocode converts colors between RGB and Y&prime;C<sub>_B_</sub>C<sub>_R_</sub>.  Each RGB color is in 8/8/8 format (rather than 0-1 format) with the components separated out (still 0 or greater and 255 or less). There are three variants shown here, namely&mdash;

- the ITU-R BT.601 variant (for standard-definition digital video), as the `YCbCrToRgb` and `RgbToYCbCr` methods,
- the ITU-R BT.709 variant (for high-definition video), as the `YCbCrToRgb709` and `RgbToYCbCr709` methods, and
- the [JPEG File Interchange Format](https://www.w3.org/Graphics/JPEG/jfif3.pdf) variant (with all three components 0 or greater and 255 or less), as the `YCbCrToRgbJpeg` and `RgbToYCbCrJpeg` methods.<sup>[(16)](#Note16)</sup>

For all these variants, the transformation should be done using [_companded RGB_ colors](#Linear_RGB_and_Companded_RGB).<sup>[(17)](#Note17)</sup>

    // NOTE: Derived from scaled YPbPr using red/green/blue luminances
    // in the NTSC color space
    METHOD RgbToYCbCr(rgb)
        y = floor(16.0+rgb[0]*0.25678824+rgb[1]*0.50412941+rgb[2]*0.097905882)
        cb = floor(128.0-rgb[0]*0.1482229-rgb[1]*0.29099279+rgb[2]*0.43921569)
        cr = floor(128.0+rgb[0]*0.43921569-rgb[1]*0.36778831-rgb[2]*0.071427373)
        return [y, cb, cr]
    END METHOD

    // NOTE: Derived from scaled YPbPr using red/green/blue BT.709 luminances
    METHOD RgbToYCbCr709(rgb)
        y = floor(0.06200706*rgb[2] + 0.6142306*rgb[1] + 0.1825859*rgb[0] + 16.0)
        cb = floor(0.4392157*rgb[2] - 0.338572*rgb[1] - 0.1006437*rgb[0] + 128.0)
        cr = floor(-0.04027352*rgb[2] - 0.3989422*rgb[1] + 0.4392157*rgb[0] + 128.0)
        return [y, cb, cr]
    END METHOD

    // NOTE: Derived from unscaled YPbPr using red/green/blue luminances
    // in the NTSC color space
    METHOD RgbToYCbCrJpeg(rgb)
        y = floor(0.299*rgb[0] + 0.587*rgb[1] + 0.114*rgb[2])
        cb = floor(-0.1687359*rgb[0] - 0.3312641*rgb[1] + 0.5*rgb[2] + 128.0)
        cr = floor(0.5*rgb[0] - 0.4186876*rgb[1] - 0.08131241*rgb[2] + 128.0)
        return [y, cb, cr]
    END METHOD

    METHOD YCbCrToRgb(yCbCr)
        cb = yCbCr[1] - 128
        cr = yCbCr[2] - 128
        yp = 1.1643836 * (yCbCr[0] - 16)
        r = yp + 1.5960268 * cr
        g = yp - 0.39176229 * cb - 0.81296765 * cr
        b = yp + 2.0172321 * cb
        return [min(max(r,0),255),min(max(g,0),255),min(max(b,0),255)]
    END METHOD

    METHOD YCbCrToRgb709(yCbCr)
        cb = yCbCr[1] - 128
        cr = yCbCr[2] - 128
        yp = 1.1643836 * (yCbCr[0] - 16)
        r = yp + 1.7927411 * cr
        g = yp - 0.21324861 * cb - 0.53290933 * cr
        b = yp + 2.1124018 * cb
        return [min(max(r,0),255),min(max(g,0),255),min(max(b,0),255)]
    END METHOD

    METHOD YCbCrToRgbJpeg(yCbCr)
        cb = yCbCr[1] - 128
        cr = yCbCr[2] - 128
        yp = yCbCr[0]
        r = yp + 1.402 * cr
        g = yp - 0.34413629 * cb - 0.71413629 * cr
        b = yp + 1.772 * cb
        return [min(max(r,0),255),min(max(g,0),255),min(max(b,0),255)]
    END METHOD

**Note:** A thorough survey of the various ways in which Y&prime;C<sub>_B_</sub>C<sub>_R_</sub> data has been encoded is outside the scope of this document; in general, such encodings take into account the human eye's normally greater spatial sensitivity to luminance (Y, as approximated by Y&prime;, luma) than chromatic sensitivity (C<sub>_B_</sub>, C<sub>_R_</sub>).

<a id=CMYK></a>
### CMYK

The _CMYK color model_, ideally, describes the proportion of cyan, magenta, yellow, and black (K) inks to use to reproduce certain colors on paper.  However, since color mixture of inks is considerably complex (see "[Color Mixture](#Color_Mixture)", later), the proper interpretation of CMYK colors depends on the printing condition, including what inks and paper are used.<sup>[(18)](#Note18)</sup>

<a id=Modifying_Existing_Colors></a>
## Modifying Existing Colors

The following techniques show how existing colors can be modified to create new colors.

Note that for best results, these techniques need to be carried out with [_linear RGB_ colors](#Linear_RGB_and_Companded_RGB), unless noted otherwise.

<a id=Relative_Luminance_Grayscale></a>
### Relative Luminance (Grayscale)

_Relative luminance_ is a single number indicating a color's luminance relative to white &mdash; that is, how much light reaches the eyes when that color is viewed, in comparison to white. Relative luminance, called **`Luminance(color)`** in this document, is equivalent to the Y component of an [XYZ color](#CIE_XYZ), and is 0 or greater and 1 or less.

- For [_linear RGB_ colors](#Linear_RGB_and_Companded_RGB), relative luminance&mdash;
    - is `(color[0] * r + color[1] * g + color[2] * b)`,
where `r`, `g`, and `b` are the upper-case-Y components (relative luminances) of the RGB color space's red, green, and blue
points, respectively<sup>[(6)](#Note6)</sup><sup>[(19)](#Note19)</sup>, and
    - ranges from 0 for the RGB color space's "black point" to 1 for its white point.

    If a different white point than the RGB color space's usual white point should have a relative luminance of 1, then `r`, `g`, and `b` are the
    corresponding relative luminances after [_chromatic adaptation_](https://en.wikipedia.org/wiki/Chromatic_adaptation) from one white point to another.  Further details on such
    adaptation are outside the scope of this document, but see the examples. (See also E. Stone, "[The Luminance of an sRGB Color](https://ninedegreesbelow.com/photography/srgb-luminance.html)", 2013.)
- Applying the formula just given to _companded RGB_ colors results in a value more properly called _luma_, not (relative) luminance.<sup>[(20)](#Note20)</sup>

Examples follow for sRGB:

- **ITU BT.709** (`BT709(color)`): `(color[0] * 0.2126 + color[1] * 0.7152 + color[2] * 0.0722)` (sRGB Y values of red/green/blue<sup>[(6)](#Note6)</sup>).
- **sRGB with D50 white point**: `(color[0] * 0.2225 + color[1] * 0.7169 + color[2] * 0.0606)`<sup>[(9)](#Note9)</sup>.

Applications of relative luminance include the following:
- **Grayscale.** A color, `color`, can be converted to grayscale by calculating `[Luminance(color), Luminance(color), Luminance(color)]`.
- **Black and white.** Generate `[0, 0, 0]` (black) if `Luminance(color) < 0.5`, or `[1, 1, 1]` (white) otherwise.
- **Contrasting color.** A _contrasting color_ is a foreground (text) color with high contrast to the background color or vice versa.  For example, if [`Luminance(color)`](#Relative_Luminance_Grayscale) is 0.5 or less, select `[1, 1, 1]` (white) as a contrasting color; otherwise, select `[0, 0, 0]` (black) as a  contrasting color.<sup>[(21)](#Note21)</sup>

Finding the **average relative luminance** of a collection of colors (including a raster image) is often equivalent to&mdash;
- adding all the relative luminances (`Luminance(color)`) of the colors in the collection, then
- dividing the result by the number of such colors.

<a id=Color_Schemes></a>
### Color Schemes

The following techniques generate new colors that are related to existing colors.

- **Color harmonies**<sup>[(22)](#Note22)</sup> result by generating several colors that differ in hue (hue angle).  For each color harmony given below, the following numbers are added to a hue angle<sup>[(7)](#Note7)</sup> to generate the hues for the colors that make up that harmony:
    - **Analogous**: 0, Y, -Y, where Y is 2&pi;/3 or less. In general, _analogous colors_ are colors spaced at equal hue intervals from a central color.
    - **Complementary**: 0, &pi;.  This is the base hue with its opposite hue.
    - **Split complementary**: 0, &pi; - Y, &pi; + Y, where Y is greater than 0 and &pi;/2 or less.  The base hue and two hues close to the opposite hue.
    - **Triadic**: 0, 2&pi;/3, 4&pi;/3.  Base hue and the two hues at 120 degrees from that hue.
    - **Off-complementary** (mentioned by B. MacEvoy): 0, 2&pi;/3. Alternatively, 0, -2&pi;/3.
    - **Two-tone**: 0, Y, where Y is greater than -&pi;/2 and less than &pi;/2. This is the base hue and a close hue.
    - **Double complementary**: 0, Y, &pi;, &pi; + Y, where Y is -&pi;/2 or greater and &pi;/2 or less.  The base hue and a close hue, as well as their opposite hues.
- **Monochrome colors**: Colors with the same hue; for example, different [shades, tints, and/or tones](#Alpha_Blending) of a given color are monochrome colors.

<a id=Alpha_Blending></a>
### Alpha Blending

The `Lerp3` function below gets an "alpha blend" of two colors, where `color1` and `color2` are the two colors, and `alpha` is the _alpha component_ being 0 or greater and 1 or less (0 means equal to `color1` and 1 means equal to `color2`).<sup>[(23)](#Note23)</sup>
- Generating a **shade** of a color (mixing with black) is equivalent to alpha blending that color with black `[0, 0, 0]`.
- Generating a **tint** of a color (mixing with white) is equivalent to alpha blending that color with white `[1, 1, 1]`.
- Generating a **tone** of a color (mixing with gray) is equivalent to alpha blending that color with gray `[0.5, 0.5, 0.5]`.
- Averaging two colors is equivalent to alpha blending with `alpha` set to 0.5.
- Converting an RGBA color to an RGB color on white is equivalent to `Lerp3([color[0], color[1], color[2]], [1, 1, 1], color[3])`.
- Converting an RGBA color to an RGB color over `color2`, another RGB color, is equivalent to `Lerp3([color[0], color[1], color[2]], color2, color[3])`.

&nbsp;

    METHOD Lerp3(color1, color2, alpha)
        return [color1[0]+(color2[0]-color1[0])*alpha, color1[1]+(color2[1]-color1[1])*alpha,
            color1[2]+(color2[2]-color1[2])*alpha]
    END METHOD

<a id=Porter_ndash_Duff_Formulas></a>
### Porter&ndash;Duff Formulas

Porter and Duff (1984) define twelve formulas for combining (compositing) two RGBA colors. In the formulas below, it is assumed that the two colors are in the 0-1 format and have been _premultiplied_ (that is, their red, green, and blue components have been multiplied beforehand by their alpha component).  Given `src`, the source RGBA color, and `dst`, the destination RGBA color, the Porter&ndash;Duff formulas are as follows.
- **Source Over**: `[src[0]-dst[0]*(src[3] - 1), src[1]-dst[1]*(src[3] - 1), src[2]-dst[2]*(src[3] - 1), src[3]-dst[3]*(src[3] - 1)]`.
- **Source In**: `[dst[3]*src[0], dst[3]*src[1], dst[3]*src[2], dst[3]*src[3]]`.
- **Source Held Out**: `[src[0]*(1 - dst[3]), src[1]*(1 - dst[3]), src[2]*(1 - dst[3]), src[3]*(1 - dst[3])]`.
- **Source Atop**: `[dst[0]*src[3] - src[0]*(dst[3] - 1), dst[1]*src[3] - src[1]*(dst[3] - 1), dst[2]*src[3] - src[2]*(dst[3] - 1), src[3]]`.
- **Destination Over**: `[dst[0] - src[0]*(dst[3] - 1), dst[1] - src[1]*(dst[3] - 1), dst[2] - src[2]*(dst[3] - 1), dst[3] - src[3]*(dst[3] - 1)]`.
- **Destination In**: `[dst[0]*src[3], dst[1]*src[3], dst[2]*src[3], dst[3]*src[3]]`.  Uses the destination color/alpha with the source alpha as the "mask".
- **Destination Held Out**: `[dst[0]*(1 - src[3]), dst[1]*(1 - src[3]), dst[2]*(1 - src[3]), dst[3]*(1 - src[3])]`.
- **Destination Atop**: `[dst[3]*src[0] - dst[0]*(src[3] - 1), dst[3]*src[1] - dst[1]*(src[3] - 1), dst[3]*src[2] - dst[2]*(src[3] - 1), dst[3]]`.
- **Source**: `src`.
- **Destination**: `dst`.
- **Clear**: `[0, 0, 0, 0]`.
- **Xor**: `[-dst[3]*src[0] - dst[0]*src[3] + dst[0] + src[0], -dst[3]*src[1] - dst[1]*src[3] + dst[1] + src[1], -dst[3]*src[2] - dst[2]*src[3] + dst[2] + src[2], -2*dst[3]*src[3] + dst[3] + src[3]]`.

<a id=Blend_Modes></a>
### Blend Modes

[Blend modes](https://en.wikipedia.org/wiki/Blend_modes) take a source color and destination color and blend them to create a new color.  The same blend mode, or different blend modes, can be applied to each component of a given color.  In the idioms below, `src` is one component of the source color, `dst` is the same component of the destination color (for example, `src` and `dst` can both be two RGB colors' red components), and both components are assumed to be 0 or greater and 1 or less.  The following are examples of blend modes.

- **Normal**: `src`.
- **Lighten**: `max(src, dst)`.
- **Darken**: `min(src, dst)`.
- **Add**: `min(1.0, src + dst)`.
- **Subtract**: `max(0.0, src - dst)`.
- **Multiply**: `(src + dst)`.
- **Screen**: `1 - (1 - dst) * (1 - src)`.
- **Average**: `(src + dst) * 0.5`.
- **Difference**: `abs(src - dst)`.
- **Exclusion**: `src - 2 * src * dst + dst`.

<a id=Color_Matrices></a>
### Color Matrices

A _color matrix_ is a 9-item (3x3) list for transforming colors.  As used in this document, an RGB color (`color`)
is transformed with a color matrix (`matrix`) as follows:

    newColor = [
       min(max(color[0]*matrix[0]+color[1]*matrix[1]+color[2]*matrix[2],0),1),
       min(max(color[0]*matrix[3]+color[1]*matrix[4]+color[2]*matrix[5],0),1),
       min(max(color[0]*matrix[6]+color[1]*matrix[7]+color[2]*matrix[8],0),1),
    ]

Examples of matrices include:

- **Sepia**: `[0.393, 0.769, 0.189, 0.349, 0.686, 0.168, 0.272, 0.534, 0.131]`.
- **Saturate**: `[s+(1-s)*r, (1-s)*g, (1-s)*b, (1-s)*r, s+(1-s)*g,(1-s)*b,(1-s)*r,(1-s)*g,s+(1-s)*b]`, where `s` ranges
from 0 through 1 (the greater `s` is, the less saturated), and `r`, `g`, and `b` are as defined in the section "[Relative Luminance (Grayscale)](#Relative_Luminance_Grayscale)"<sup>[(24)](#Note24)</sup>.
- **Hue rotate**: `[-0.37124*sr + 0.7874*cr + 0.2126,  -0.49629*sr - 0.7152*cr + 0.7152, 0.86753*sr - 0.0722*cr + 0.0722, 0.20611*sr - 0.2126*cr + 0.2126, 0.08106*sr + 0.2848*cr + 0.7152, -0.28717*sr - 0.072199*cr + 0.0722, -0.94859*sr - 0.2126*cr + 0.2126, 0.65841*sr - 0.7152*cr + 0.7152, 0.29018*sr + 0.9278*cr + 0.0722]`, where `sr = sin(rotation)`, `cr = cos(rotation)`, and `rotation` is the hue rotation angle.<sup>[(25)](#Note25)</sup><sup>[(24)](#Note24)</sup>

<a id=Miscellaneous></a>
### Miscellaneous

In the following formulas, `color` is the source color in 0-1 format.

- **Invert ("film negative")**: `[1.0 - color[0], 1.0 - color[1], 1.0 - color[2]]`.<sup>[(26)](#Note26)</sup>
- **Lighten/Darken**: A choice of&mdash;
    - `[min(max(color[0]+value,0),1), min(max(color[1]+value,0),1), min(max(color[2]+value,0),1)]`,
    - `HslToRgb(HSVHue(color), HSLSat(color), min(max(HSLLgt(color) + value, 0), 1))`, or
    - `SRGBFromLab(min(max(lab[0] + (value * 100), 0), 100), lab[1], lab[2])`, where `lab = SRGBToLab(color)` (CIELAB),

    generates a lighter version of `color` if `value` is positive, and a darker version if `value` is negative, where `value` is 0 or greater and 1 or less.
- **Saturate/Desaturate**: `HsvToRgb(hsv[0], min(max(hsv[1] + color, 0), 1), hsv[0])`, where `hsv = RgbToHsv(color)`; this procedure saturates `color` if `value` is positive, and desaturates that color if `value` is negative. (Note that HSL's "saturation" is inferior here.)
- **Colorize**: Given a desired `color` and a source color `srcColor`, generate
 `[color[0]*Luminance(srcColor), color[1]*Luminance(srcColor), color[2]*Luminance(srcColor)]`.
- **Swap blue and red channels**: `[color[2], color[1], color[0]]`.
- **Red channel**: `[color[0], color[0], color[0]]`.
- **Green channel**: `[color[1], color[1], color[1]]`.
- **Blue channel**: `[color[2], color[2], color[2]]`.
- **Maximum**: `[c, c, c]`, where `c` is `max(max(color[0], color[1]), color[2])`.
- **Minimum**: `[c, c, c]`, where `c` is `min(min(color[0], color[1]), color[2])`.

**Note:** Image processing techniques that replace one color with another color (or some modified version of the original color), but only if the color meets certain requirements, techniques that include [_chroma key_](https://en.wikipedia.org/wiki/Chroma_key), are largely out of the scope of this document.

<a id=Color_Differences></a>
## Color Differences

Color difference algorithms are used to determine if two colors are similar.

In this document, `COLORDIFF(color1, color2)` is a function that calculates a [_color difference_](https://en.wikipedia.org/wiki/Color_difference) (also known as "color distance") between two colors in the same color space, where the lower the number, the closer the two colors are.  In general, however, color differences calculated using different color spaces or `COLORDIFF` implementations cannot be converted to each other.  Some ways to implement `COLORDIFF` are given in this section.

**Euclidean distance.** The following pseudocode implements the Euclidean distance of two colors.

    METHOD COLORDIFF(color1, color2)
       d1=color2[0] - color1[0]
       d2=color2[1] - color1[1]
       d3=color2[2] - color1[2]
       sqdist=d1*d1+d2*d2+d3*d3
       return sqrt(sqdist)
    END METHOD

Note that&mdash;
- the Euclidean distance is independent of color model; however, [_linear RGB_ colors](#Linear_RGB_and_Companded_RGB),
 rather than companded RGB colors, should be used;
- for CIELAB or CIELUV, the Euclidean distance method just given implements the 1976 _&Delta;E\*_<sub>ab</sub> ("delta E a b") or _&Delta;E\*_<sub>uv</sub>
color difference method, respectively (for the _&Delta;E\*_<sub>ab</sub> method, differences around 2.3 are just noticeable
[Mahy et al., 1994])<sup>[(27)](#Note27)</sup>; and
- if Euclidean distances are merely being compared (so that, for example, two distances are not added or multiplied), then the square root operation can be omitted.

**Riemersma's method.** T. Riemersma suggests an algorithm for color difference, to be applied to companded RGB colors, in his article ["Colour metric"](https://www.compuphase.com/cmetric.htm) (section "A low-cost approximation").

**CMC.** The following pseudocode implements the Color Measuring Committee color difference formula published in 1984, used above all in the textile industry. Note that in this formula, the order of the two [CIELAB](#CIELAB) colors is important (the first color is the reference, and the second color is the test). Here, the formula is referred to as CMC(`LPARAM`:`CPARAM`) where&mdash;

- `LPARAM` is a lightness tolerance and is usually either 2 or 1, and
- `CPARAM` is a chroma tolerance and is usually 1.

&nbsp;

    METHOD COLORDIFF(lab1, lab2)
        c1=LabToChroma(lab1)
        c2=LabToChroma(lab2)
        h1=LabToHue(lab1)
        dl=0.511
        if lab1[0]>=16: dl=0.040975*lab1[0]/(1+0.01765*lab1[0])
        dc=0.0638+(0.0638*c1/(0.0131*c1+1))
        f4=pow(c1,4)
        f4=sqrt(f4/(f4+1900))
        dt=0
        if h1>=41*pi/45 and h1<=23*pi/12
           dt=0.56+abs(0.2*cos(h1+14*pi/15))
        else
           dt=0.36+abs(0.4*cos(h1+7*pi/36))
        end
        dh=(dt*f4+1-f4)*dc
        dl=dl*LPARAM
        dc=dc*CPARAM
        da=lab2[1]-lab1[1]
        db=lab2[2]-lab1[2]
        dchr=c2-c1
        dhue=sqrt(max(0,da*da+db*db-dchr*dchr))
        dl=((lab2[0]-lab1[0])/dl)
        dc=(dchr/dc)
        dh=(dhue/dh)
        return sqrt(dl*dl+dc*dc+dh*dh)
    END METHOD

**CIE94.** The following pseudocode implements the color difference formula published in 1994 by the CIE, called CIE94 or _&Delta;E\*_<sub>94</sub>, between two [CIELAB](#CIELAB) colors.
Note that in this formula, the order of the two colors is important (the first color is the reference, and the second color is the test).  In the pseudocode below, `TEXTILES` is `true` for a color difference suitable for textile applications, and `false` otherwise.

    METHOD COLORDIFF(lab1, lab2)
        c1=LabToChroma(lab1)
        c2=LabToChroma(lab2)
        dl=1
        dc=1+0.045*c1
        dh=1+0.015*c1
        if TEXTILES
                dl=2
                dc=1+0.048*c1
                dh=1+0.014*c1
        end
        da=lab2[1]-lab1[1]
        db=lab2[2]-lab1[2]
        dchr=c2-c1
        dhue=sqrt(max(0,da*da+db*db-dchr*dchr))
        dl=((lab2[0]-lab1[0])/dl)
        dc=(dchr/dc)
        dh=(dhue/dh)
        return sqrt(dl*dl+dc*dc+dh*dh)
    END METHOD

**CIEDE2000.** The following pseudocode implements the color difference formula published in 2000 by the CIE, called CIEDE2000 or _&Delta;E\*_<sub>00</sub>, between two [CIELAB](#CIELAB) colors.

    METHOD COLORDIFF(lab1, lab2)
        dl=lab2[0]-lab1[0]
        hl=lab1[0]+dl*0.5
        sqb1=lab1[2]*lab1[2]
        sqb2=lab2[2]*lab2[2]
        c1=sqrt(lab1[1]*lab1[1]+sqb1)
        c2=sqrt(lab2[1]*lab2[1]+sqb2)
        hc7=pow((c1+c2)*0.5,7)
        trc=sqrt(hc7/(hc7+6103515625.0))
        t2=1.5-trc*0.5
        ap1=lab1[1]*t2
        ap2=lab2[1]*t2
        c1=sqrt(ap1*ap1+sqb1)
        c2=sqrt(ap2*ap2+sqb2)
        dc=c2-c1
        hc=c1+dc*0.5
        hc7=pow(hc,7)
        trc=sqrt(hc7/(hc7+6103515625.0))
        h1=atan2(lab1[2],ap1)
        if h1<0: h1=h1+pi*2
        h2=atan2(lab2[2],ap2)
        if h2<0: h2=h2+pi*2
        hdiff=h2-h1
        hh=h1+h2
        if abs(hdiff)>pi
                hh=hh+pi*2
                if h2<=h1: hdiff=hdiff+pi*2
                else: hdiff=hdiff-pi*2
        end
        hh=hh*0.5
        t2=1-0.17*cos(hh-pi/6)+0.24*cos(hh*2)
        t2=t2+0.32*cos(hh*3+pi/30)
        t2=t2-0.2*cos(hh*4-pi*63/180)
        dh=2*sqrt(c1*c2)*sin(hdiff*0.5)
        sqhl=(hl-50)*(hl-50)
        fl=dl/(1+(0.015*sqhl/sqrt(20+sqhl)))
        fc=dc/(hc*0.045+1)
        fh=dh/(t2*hc*0.015+1)
        dt=30*exp(-pow(36*hh-55*pi,2)/(25*pi*pi))
        r=0-2*trc*sin(2*dt*pi/180)
        return sqrt(fl*fl+fc*fc+fh*fh+r*fc*fh)
    END METHOD

<a id=Nearest_Colors></a>
### Nearest Colors

The **nearest color algorithm** is used, for example, to categorize colors or to reduce the number of colors used by an image.

In the pseudocode below,the method `NearestColorIndex` finds, for a given color (`color`), the index of the color nearest it in a given list (`list`) of colors.  `NearestColorIndex` is independent of color model; however, both `color` and each color in `list` must be in the same color space.

    METHOD NearestColorIndex(color, list)
       if size(list) == 0: return error
       if size(list) == 1: return 0
       i = 0
       best = -1
       bestIndex = 0
       while i < size(list)
           dist = COLORDIFF(color,list[i])
           if i == 0 or dist < best
              best = dist
              bestIndex = i
           end
           i = i + 1
       end
       return bestIndex
    END METHOD

**Examples:**

1. To find the nearest color to `color` in a list of colors (`list`), generate `nearestColor = list[NearestColorIndex(color, list)]`.
2. Sorting colors into **color categories** is equivalent to&mdash;
    - defining a list of **representative colors** `repColors` (for example, representative colors for red, blue, black, white, and so on), then
    - for each color (`color`) to be categorized, finding the nearest color to that color among the representative colors (for example, by calling `NearestColorIndex(color, repColors)`).

<a id=Dominant_Colors_of_an_Image></a>
## Dominant Colors of an Image

There are several methods of finding the kind or kinds of colors that appear most prominently in a collection of colors (including a raster image).

**Averaging.**  To find the dominant color using this technique&mdash;
- add all the colors (or a sample of them) in the collection of colors (for RGB colors, adding two or more colors means adding each of their components individually), then
- divide the result by the number of colors (not necessarily unique colors) added this way.

Note that for best results, this technique needs to be carried out with [_linear RGB colors_](#Linear_RGB_and_Companded_RGB).

**[Color quantization](https://en.wikipedia.org/wiki/Color_quantization).** In this more complicated technique, the collection of colors is reduced to a small set of colors (for example, ten to twenty).  The quantization algorithm is too complicated to discuss in the document. Again, for best results, color quantization needs to be carried out with [_linear RGB_ colors](#Linear_RGB_and_Companded_RGB).

**Histogram binning.** To find the dominant colors using this technique (which is independent of color model):

- Generate or furnish a list of colors that cover the space of colors well.  This is the _color palette_. A good example is the list of ["Web safe colors"](#RGB_Colors_and_the_0_1_Format).
- Create a list with as many zeros as the number of colors in the palette.  This is the _histogram_.
- For each color in the collection of colors, find the [nearest color](#Nearest_Colors) in the color palette to that pixel's color, and add 1 to the nearest color's corresponding value in the histogram.
- Find the color or colors in the color palette with the highest histogram values, and return those colors as the dominant colors in the image.

**Notes:**

- For all three techniques, in the case of a raster image, an implementation can resize that image before proceeding to find its dominant colors.  Algorithms to resize or "resample" images are out of scope for this page, however.
- Reducing the number of colors in an image usually involves finding that image's dominant colors and either&mdash;
    - applying a "nearest neighbor" approach (replacing that image's colors with their [nearest dominant colors](#Nearest_Colors)), or
    - applying a ["dithering"](https://en.wikipedia.org/wiki/Dither) technique (especially to reduce undesirable color "banding" in certain cases), which is outside the scope of this document, however.
- Finding the number of _unique_ colors in an image is equivalent to storing those colors as keys in a hash table, then counting the number of keys stored this way.<sup>[(28)](#Note28)</sup>
- **Extracting a scene's "true colors"**: For applications where matching colors from the real world is important, colors
  must be measured using a colorimeter or similar device, or be extracted from [_scene-referred_ image
  data](http://eilv.cie.co.at/term/567) (such as a raw image from a digital camera) whose colors have
  been corrected by calibration.  JPEG, PNG, and many other image formats store [sRGB](#sRGB) image
  data by default; however, sRGB is an [_output-referred_](http://eilv.cie.co.at/term/565) color space, not
  a scene-referred one (it's based on the color output of cathode-ray-tube monitors), making sRGB images
  unsuitable for real-world color matching without more.  Calibration techniques for such matching are outside this page's scope.

<a id=Color_Maps></a>
## Color Maps

A _color map_ (or _color palette_) is a list of colors, which are usually related. All the colors in a color map can be in any color space, but unless noted otherwise, [_linear RGB_ colors](#Linear_RGB_and_Companded_RGB) should be used rather than companded RGB colors.

**Example:**
- A **grayscale color map** consists of the companded RGB colors `[[0, 0, 0], [0.5, 0.5, 0.5], [1, 1, 1]]`.

<a id=Kinds_of_Color_Maps></a>
### Kinds of Color Maps

The [_ColorBrewer 2.0_](http://colorbrewer2.org/) Web site's suggestions for color maps are designed above all for visualizing data on land maps.  For such purposes, C. Brewer, the creator of _ColorBrewer 2.0_, has identified [three kinds](http://colorbrewer2.org/learnmore/schemes_full.html) of appropriate color maps:

- **Sequential color maps** for showing "ordered data that progress from low to high". Those found in _ColorBrewer 2.0_ use varying tints of the same hue or of two close hues.
- **Diverging color maps** for showing continuous data with a clearly defined midpoint (the "critical value") and where the distinction between low and high is also visually important. Those found in _ColorBrewer 2.0_ use varying tints of two "contrasting hues", one hue at each end, with lighter tints closer to the middle.  Where such color maps are used in 3D visualizations, K. Moreland [recommends](http://www.kennethmoreland.com/color-advice/) "limiting the color map to reasonably bright colors".
- **Qualitative color maps** for showing discrete categories of data (see also "[Visually Distinct Colors](#Visually_Distinct_Colors)"). Those found in _ColorBrewer 2.0_ use varying hues.

**Note:** The fact that _ColorBrewer 2.0_ identifies some of its color maps as being "print friendly"<sup>[(29)](#Note29)</sup> and/or "[color blind friendly](https://peteroupc.github.io/suppcolor.html#Defective_and_Animal_Color_Vision)" suggests that these two factors can be important when generating color maps of the three kinds just mentioned.

<a id=Color_Collections></a>
### Color Collections

If each color in a color map has a name, number, or code associated with it, the color map is also called a _color collection_.  Examples of names are "red", "vivid green", and "orange".  It's outside the scope of this document to provide a survey of color collections, but some of them are discussed in some detail in my [colors tutorial for the HTML 3D Library](https://peteroupc.github.io/html3dutil/tutorial-colors.html#What_Do_Some_Colors_Look_Like).

Converting a color (such as an RGB color) to a color name is equivalent to&mdash;
- retrieving the name keyed to that color in a hash table, or returning an error if that color doesn't exist in the hash table, or
- finding the [nearest color](#Nearest_Colors) to that color among the named colors, and returning the color found this way (and/or that color's name).<sup>[(28)](#Note28)</sup>

Converting a color name to a color is equivalent to retrieving the color keyed to that name (or optionally, its lower-cased form) in a hash table, or returning an error if no such color exists.<sup>[(28)](#Note28)</sup>

**Note:** As used in the [CSS color module level 3](http://www.w3.org/TR/css3-color/), named colors defined in that module are in the [_sRGB color space_](#sRGB) (as companded colors).

<a id=Visually_Distinct_Colors></a>
### Visually Distinct Colors

Color maps can list colors used to identify different items. Because of this
use, many applications need to use colors that are easily distinguishable by humans.  In this respect&mdash;

- K. Kelly (1965) proposed a list of "twenty two colors of maximum contrast"<sup>[(30)](#Note30)</sup>, the first nine of which
  were intended for readers with normal and [defective](https://peteroupc.github.io/suppcolor.html#Defective_and_Animal_Color_Vision) color vision, and
- B. Berlin and P. Kay, in a work published in 1969, identified eleven basic color terms: black, white, gray, purple, pink, red, green, blue, yellow, orange, and brown.

In general, the more colors used, the harder it is to distinguish them from each other.  Any application that needs to distinguish many items (especially more than 22 items, the number of colors in Kelly's list) should use other visual means in addition to color
(or rather than color) to help users identify them. (Note that under the
[Web Content Accessibility Guidelines 2.0](https://www.w3.org/TR/2008/REC-WCAG20-20081211/),
color should not be ["the only visual means of conveying information"](http://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-without-color).)

In general, any method that seeks to choose colors that are maximally distant in a particular
color space (that is, where the smallest [color difference](#Color_Differences) [`COLORDIFF`]
between them is maximized as much as feasible) can be used to select visually
distinct colors. Such colors can be pregenerated or generated at runtime, and such colors
can be limited to those in a particular _color gamut_. Here, the color difference method
should be _&Delta;E\*_<sub>ab</sub> or another color difference method that takes human color perception into account. (See also Tatarize, "[Color Distribution Methodology](http://godsnotwheregodsnot.blogspot.com/2012/09/color-distribution-methodology.html)".)

<a id=Pseudocode></a>
### Pseudocode

In the following pseudocode&mdash;
- `ColorMapContinuous` extracts a **continuous color** (blended color) from a color map (`colormap`), and
- `ColorMapDiscrete` extracts a **discrete color** (nearest color) from a color map (`colormap`),

where `value` is a number 0 or greater and 1 or less (0 and 1 are the start and end of the color map, respectively).

        METHOD ColorMapContinuous(colormap, value)
            nm1 = size(colormap) - 1
            index = (value * nm1) - floor(value * nm1)
            if index >= nm1: return colormap[index]
            fac = (value * nm1) - index)
            list1 = colormap[index]
            list2 = colormap[index + 1]
            return [list1[0]+(list2[0]-list1[0])*fac, list1[1]+(list2[1]-list1[1])*fac,
                list1[2]+(list2[2]-list1[2])*fac]
        END METHOD

        METHOD ColorMapDiscrete(colormap, value)
           return colormap[round(value * (N - 1))]
        END METHOD

<a id=Generating_a_Random_Color></a>
## Generating a Random Color

The following techniques can be used to generate random RGB colors. Note that for best results, these techniques need to use [_linear RGB_ colors](#Linear_RGB_and_Companded_RGB), unless noted otherwise.

- Generating a random color in the **8/8/8 format** is equivalent to calling `From888(RNDINT(16777215))`.
- Generating a random string in the **HTML color format** is equivalent to generating a [random hexadecimal string](https://peteroupc.github.io/randomfunc.html#Creating_a_Random_Character_String) with length 6, then inserting the string "#" at the beginning of that string. But see the [note from earlier](#HTML_Color_Format).
- Generating a random color in the **0-1 format** is equivalent to generating `[RNDU01(), RNDU01(), RNDU01()]`.
- To generate a random **dark color**, either&mdash;
    - generate `color = [RNDU01(), RNDU01(), RNDU01()]` until [`Luminance(color)`](#Relative_Luminance_Grayscale) is less than a given threshold, e.g., 0.5, or
    - generate `color = [RNDU01() * maxComp, RNDU01() * maxComp, RNDU01() * maxComp]`, where `maxComp` is the
       maximum value of each color component, e.g., 0.5.
- To generate a random **light color**, either&mdash;
    - generate `color = [RNDU01(), RNDU01(), RNDU01()]` until [`Luminance(color)`](#Relative_Luminance_Grayscale) is greater than a given threshold, e.g., 0.5, or
    - generate `color = [minComp + RNDU01() * (1.0 - minComp), minComp + RNDU01() * (1.0 - minComp), minComp + RNDU01() * (1.0 - minComp)]`, where `minComp` is the minimum value of each color component, e.g., 0.5.
- One way to generate a random **pastel color** is to generate `color = [RNDU01(), RNDU01(), RNDU01()]` until [`Luminance(color)`](#Relative_Luminance_Grayscale) is greater than 0.75 and less than 0.9.
- To generate a **random color at or between two others** (`color1` and `color2`), generate `Lerp3(color1, color2, RNDU01())`.
- To generate a **random shade** of a given color, generate `Lerp3(color1, [0, 0, 0], RNDNUMRANGE(0.2, 1.0))`.
- To generate a **random tint** of a given color, generate `Lerp3(color1, [1, 1, 1], RNDNUMRANGE(0.0, 0.9))`.
- To generate a **random tone** of a given color, generate `Lerp3(color1, [0.5, 0.5, 0.5], RNDNUMRANGE(0.0, 0.9))`.
- To generate a **random monochrome color**, generate `HslToRgb(H, RNDU01(),RNDU01())`, where `H` is an arbitrary [hue](#HSV).
- **Random color sampling:**
    - To select a random continuous color from a color map (`colormap`): `ColorMapContinuous(colormap, RNDU01())`.
    - To select one random color from a color map (`colormap`): `colormap[RNDINTEXC(size(colormap))]`.  See also ["Choosing a Random Item from a List"](https://peteroupc.github.io/randomfunc.html#Sampling_With_Replacement_Choosing_a_Random_Item_from_a_List).
    - To select several random colors from a color map: See ["Choosing Several Unique Items"](https://peteroupc.github.io/randomfunc.html#Sampling_Without_Replacement_Choosing_Several_Unique_Items).
- **Similar random colors:** Generating a random color that's similar to another is equivalent to generating a random color (`color1`) until `COLORDIFF(color1, color2)` (defined [earlier](#Color_Differences)) is less than a predetermined threshold, where `color2` is the color to compare.
- **Data hashing:** A technique similar to generating random colors is to generate a color from arbitrary data using a [_hash function_](https://peteroupc.github.io/random.html#Hash_Functions).

<a id=Spectral_Color_Functions></a>
## Spectral Color Functions

A color stimulus can be represented as a function ("curve") that describes a distribution of radiation (such as light) across the spectrum.  There are three cases of objects that provoke a color sensation by light:

- **Light sources.** A _spectral power distribution_ (SPD) describes the intensity of a light source at each wavelength of the spectrum.
- **Reflective materials.** A _(spectral) reflectance curve_ describes the fraction of light reflected by a reflective (opaque) material.
- **Transmissive materials.** A _transmittance curve_ describes the fraction of light that passes through a transmissive (translucent or transparent) material, such as a light filter.

A material's perceived color depends on its reflectance or transmittance curve, the light source, and the viewer (whose visual response is modeled by three _color matching functions_).  That curve, the light source's SPD, and the color matching functions, are converted to three numbers (called _tristimulus values_) that uniquely identify that color.

The pseudocode below includes a `SpectrumToTristim` method for computing tristimulus values.  In the method:

- `REFL(wl)`, `LIGHT(wl)`, and `CMF(wl)` are arbitrary functions further described later.  All three take a
  wavelength (`wl`) in nanometers (nm) and return the corresponding values at that wavelength.
   (_See also note 3 later in this section._)
- `REFL(wl)` models the **reflectance or transmittance curve**. Values on the curve are 0 or greater and, with the exception of fluorescent materials, 1 or less.  `REFL` can always return 1 to model a _perfect reflecting_ or _perfect transmitting diffuser_, e.g., if the purpose is to get the perceived color of the light source itself. `REFL` returns the value of the curve at the wavelength `wl`.
- `LIGHT(wl)` models a **light source's SPD**; it returns the source's relative intensity at the wavelength `wl`.  Choices for `LIGHT` include&mdash;
    - the D65 illuminant<sup>[(31)](#Note31)</sup>, which approximates 6504-kelvin (noon) daylight (with a correlated color temperature of about 6504 kelvins),
    - the D50 illuminant, which approximates 5003-kelvin (sunrise) daylight, and
    - the blackbody spectral formula given in "[Color Temperature](#Color_Temperature)".
- `CMF(wl)` models three **color matching functions** and returns a list of those functions' values at the wavelength `wl`. The choice of `CMF` determines the kind of tristimulus values returned by `SpectrumToTristim`. Choices for `CMF` include&mdash;
    - the CIE 1931 (2-degree) standard observer<sup>[(31)](#Note31)</sup><sup>[(32)](#Note32)</sup>, which is used to generate [XYZ colors](#CIE_XYZ) based on color stimuli seen at a 2-degree field of view, and
    - the  CIE 1964 (10-degree) standard observer<sup>[(31)](#Note31)</sup>, which is used to generate XYZ colors based on color stimuli seen at a 10-degree field of view.

&nbsp;

    METHOD SpectrumToTristim()
        i = 360 // Start of relevant part of spectrum
        xyz=[0,0,0]
        weight = 0
        // Sample at 5 nm intervals
        while i <= 830 // End of relevant part of spectrum
                 cmf=CMF(i)
                 refl=REFL(i)
                 spec=LIGHT(i)
                 weight=weight+cmf[1]*spec*5
                 xyz[0]=xyz[0]+refl*spec*cmf[0]*5
                 xyz[1]=xyz[1]+refl*spec*cmf[1]*5
                 xyz[2]=xyz[2]+refl*spec*cmf[2]*5
                 i = i + 5
        end
        if weight==0: return xyz
        // NOTE: Note that `weight` is constant for a given
        // color matching function set and light source together,
        // so that `weight` can be precomputed if they will
        // not change.
        // NOTE: If `weight` is 1/683, `CMF` outputs XYZ
        // values, and `REFL` always returns 1, then SpectrumToTristim
        // will output XYZ values in lumens per watt.
        xyz[0] = xyz[0] / weight
        xyz[1] = xyz[1] / weight
        xyz[2] = xyz[2] / weight
        return xyz
    END METHOD

**Notes:**

1. The choices of `LIGHT` and `CMF` determine the _adopted white point_.
2. In general, wavelengths in this document mean wavelengths in air. (See the entry "[wavelength](http://eilv.cie.co.at/term/1426)" in the CIE's International Lighting Vocabulary.)
3. Although `REFL`, `LIGHT`, and `CMF` are nominally continuous functions, in practice tristimulus values are calculated based on samples at discrete wavelengths.  For example, CIE Publication 15 recommends a 5-nm wavelength interval.  For purposes of color reproduction, only wavelengths within the range 360-830 nm (0.36-0.83 &mu;m) are relevant in practice.
4. In applications where matching colors from the real world is important, reflectance and transmittance curves (`REFL`) can
be less ambiguous than colors in the form of three tristimulus values (such as XYZ or RGB colors), because for a given
combination of viewer (`CMF`) and light source (`LIGHT`)&mdash;
    - two different curves can match the same color (and be _metamers_) or match different colors, whereas
    - two identical curves match the same color (but are not called metamers).

**Example:** If `LIGHT` and `CMF` are the D65 illuminant and the CIE 1931 standard observer, respectively (both used in the [sRGB color space](#sRGB))&mdash;
- the adopted white point is the D65 white point,
- the tristimulus values (e.g., from `SpectrumToTristim()`) will be a relative [XYZ color](#CIE_XYZ) such that Y ranges from 0 for "absolute black" to 1 for the D65 white point,
- the idiom `XYZTosRGB(SpectrumToTristim())` computes, in companded sRGB, the perceived color of the stimulus, and
- the idiom `XYZTosRGB(CMF(wl))` computes, in companded sRGB, the perceived color of a light source that emits light only at the wavelength `wl` (a _monochromatic stimulus_), where the wavelength is expressed in nm.

<a id=Color_Temperature></a>
### Color Temperature

A _blackbody_ is an idealized material that emits light based only on its temperature.  The `Planckian` method shown below finds the SPD of a blackbody with the given temperature in kelvins (its **color temperature**). The `LIGHT` function below (for `SpectrumToTristim()`) uses that formula (where `TEMP` is the desired color temperature).<sup>[(33)](#Note33)</sup>

    METHOD Planckian(wavelength, temp)
        num = pow(wavelength, -5)
        return num / (exp(0.014387863/(wavelength*pow(10, -9)*temp)) - 1)
    END METHOD

    METHOD LIGHT(wavelength) # NOTE: Relative only
        return Planckian(wavelength, TEMP) * 100.0 /
            Planckian(wavelength, 560)
    END METHOD

The following method (`XYZToCCT`) computes an approximate color temperature, in kelvins, from an
[XYZ color](#CIE_XYZ). Because of the limited perceived color range of light emitted by blackbodies (namely red, orange, pale yellow, white, or sky blue), the color temperature found by
this formula is often called _correlated color temperature_ (CCT).  The formula given here is based on
the one found in McCamy 1992.

    METHOD XYZToCCT(xyz)
        xyy = XYZToxyY(xyz)
        c = (xyy[0] - 0.3320) / (0.1858 - xyy[1])
        return ((449*c+3525)*c+6823.3)*c+5520.33
    END METHOD

**Note:** Color temperature, as used here, is not to be confused with the division of colors into _warm_ (usually red, yellow, and orange) and _cool_ (usually blue and blue green) categories, a subjective division which admits of much variation.  In the context of light sources, however, the lower the light's CCT, the "warmer" the light appears, and the higher the CCT, the "cooler".

<a id=Color_Mixture></a>
### Color Mixture

In "[Subtractive Color Mixture Computation](http://scottburns.us/subtractive-color-mixture/)", Scott A. Burns indicates that the color mixture of two pigments, or the mixture of two colors that is similar to mixing two pigments with those colors, can be simulated by&mdash;

1. finding the [_reflectance curves_](#Spectral_Color_Functions) of the pigments or colors,
2. generating a mixed reflectance curve by the _weighted geometric mean_ of the source curves, which
  takes into account the relative proportions of the colors or pigments in the mixture, and
3. converting the mixed reflectance curve to an RGB color.<sup>[(34)](#Note34)</sup>

For convenience, computing the weighted geometric mean of one or more numbers is given below.

    METHOD WGM(values, weights)
        if size(values)!=size(weights): return error
        if size(values)==0: return values[0]
        sum=0
        i=0
        while i < size(weights)
          sum=sum+weights[i]
          i=i+1
        end
        if sum<=0: return error
        ret=1
        while i < size(values)
          ret=ret*pow(values[i],weights[i]/sum)
          i=i+1
        end
        return ret
    END METHOD

When computing the weighted geometric mean of several reflectance curves, all the numbers
passed at once to the `WGM` function just given must be from the same wavelength.

**Notes:**
- Finding a _representative_ reflectance curve for an arbitrary (companded) RGB color can be done, for example, by the method described in [Smits 1999](http://www.cs.utah.edu/~bes/papers/color/) or the method described in [Burns 2015](http://scottburns.us/reflectance-curves-from-srgb/). (Note that [widely varying reflectance curves](http://www.handprint.com/HP/WCL/color18a.html#ctprin38) can match the same RGB color.)
- If the "reflectance curves" represent light passing through transmissive materials (such as light filters), rather than reflected from pigments, the [simple product](http://www.handprint.com/HP/WCL/color3.html#mixprofile) of those curves, rather than the geometric mean as given in step 2, yields the mixed curve of their mixture, according to B. MacEvoy.
- An alternative method of color formulation, based on the _Kubelka&ndash;Munk_ theory, uses two curves for each colorant: an _absorption coefficient_ curve (K curve) and a _scattering coefficient_ curve (S curve).  The ratio of absorption to scattering (_K/S_) has a simple relationship to reflectance factors in the Kubelka&ndash;Munk theory.  The Python sample code implements the Kubelka&ndash;Munk equations.  One way to predict a color formula using this theory is described in a 1985 thesis by E. Walowit.  ISO 18314-2 is also a relevant document.

<a id=Terminal_Colors></a>
## Terminal Colors

Some command-line shells support coloring the background or foreground of text.  In shells that support [ANSI color codes](https://en.wikipedia.org/wiki/ANSI_escape_code) (generally in the category "select graphic rendition", or SGR), the sequence U+001B (escape character) followed by "[" followed by a semicolon-separated sequence of numbers (given below) followed by "m" is a graphic control sequence (see also Ecma-048, sec. 8.3.117):

- "0": Reset the foreground and background color and other graphic properties to default.  (U+001B followed by "[m" has the same effect.)
- "1": Set the following text in bold.
- "2": Use a slightly dimmer foreground color than usual.
- "3": Set the following text in italics.
- "4": Underline the following text.
- "7": Reverse the meaning of "foreground" and "background" in the following text.
- "8": Hide text while still taking up space.
- "21", "22", "23", "24", "27", "28": Turns off the feature mentioned earlier in "1", "2", "3", "4", "7", or "8", respectively.
- "3" followed by one of the _color numbers_ below: Dimmer foreground color.
- "4" followed by color number: Dimmer background color.
- "9" followed by color number: Brighter foreground color.
- "10" followed by color number: Brighter background color.

The _color number_ is one of the following: "0" (black), "1" (red), "2" (green), "3" (yellow), "4" (blue), "5" (magenta), "6" (cyan), or "7" (white).  Note that not all shells support all the ANSI SGR codes given here, and that the exact colors named by each color number can vary with the implementation.

<a id=Conclusion></a>
## Conclusion

This page discussed many topics on color that are generally relevant in programming.

Feel free to send comments. They may help improve this page.  In particular, corrections to any method given on
this page are welcome.

I acknowledge&mdash;
- the CodeProject user Mike-MadBadger, who suggested additional clarification on color spaces and color models,
- "RawConvert" from the pixls.us discussion forum,
- Elle Stone, and
- Thomas Mansencal.

<a id=Questions_for_This_Document></a>
### Questions for This Document

Questions for this document:

- Are there color topics not covered by this document that should be covered?
- Is the threshold for the sRGB inverse component transfer function, as specified in the latest version of the IEC standard, 0.04045 (truncated to five decimal places) or `12.92 * 0.0031308 = 0.040449936`?

<a id=Notes></a>
## Notes

<small>

<sup id=Note1>(1)</sup> Although most electronic color displays in the past used three dots per pixel (red, green, and blue), this may hardly be the case today.  Nowadays, recent electronic displays and luminaires are likely to use more than three dots per pixel &mdash; such as red, green, blue, and white, or RGBW &mdash; and ideally, color spaces following the _RGBW color model_, or similar color models, describe the intensity those dots should have in order to reproduce a given color (if possible).  Such color spaces, though, are not yet of practical interest to most programmers outside of hardware and driver development for LEDs, luminaires, or electronic displays.

<sup id=Note2>(2)</sup> Although most RGB color spaces in common use define their red, green, and blue points as actual colors, this is not always the case.  For example, the [ACES2065-1 color space](http://www.oscars.org/science-technology/sci-tech-projects/aces) of the Academy of Motion Picture Arts and Sciences covers almost all colors but has imaginary green and blue points. See also note 6.

<sup id=Note3>(3)</sup> The base-16 digits, in order, are 0 through 9, followed by A through F. The digits A through F can be uppercase or lowercase.

<sup id=Note4>(4)</sup> A [Working Draft](http://www.w3.org/TR/2016/WD-css-color-4-20160705/#hex-notation) of the CSS Color Module Level 4 mentions two additional formats, namely&mdash;

- an 8-digit format, consisting of "#" followed by eight base-16 digits, two each for the red, green, blue, and alpha components, in that order, and
- a 4-digit format, consisting of "#" followed by four base-16 digits, one each for the red, green, blue, and alpha components, in that order (where, for example, "#345F" is the same as "#334455FF" in the 8-digit format).

<sup id=Note5>(5)</sup> J. Novak, in "[What every coder should know about gamma](http://blog.johnnovak.net/2016/09/21/what-every-coder-should-know-about-gamma/)", uses the terms _physically linear_ and _perceptually linear_ to refer to what are called _linear_ and _companded_ RGB colors, respectively, in this document.

<sup id=Note6>(6)</sup> A thorough survey of working spaces other than sRGB, such as eciRGB and NTSC, as well as how to convert between RGB working spaces, are not discussed in detail in this document.  B. Lindbloom, "[RGB Working Space Information](http://www.brucelindbloom.com/index.html?WorkingSpaceInfo.html)", contains further information on RGB working spaces.

<sup id=Note7>(7)</sup> The hue angle is in radians, and the angle is 0 or greater and less than 2&pi;. Radians can be converted to degrees by multiplying by `180 / pi`.  Degrees can be converted to radians by multiplying by `pi / 180`.

<sup id=Note8>(8)</sup> In interior and architectural design, Y is also known as _light reflectance value_ (LRV), provided the XYZ color is such that Y ranges from 0 for black to 100 for white.

<sup id=Note9>(9)</sup> Conversions and formulas relative to the D50 white point are provided because the following circumstances, among others, can make such a white point more convenient than the D65 white point, which is otherwise usual for sRGB:

- Calculations relative to the D50 white point can improve interoperability with applications color-managed with International Color Consortium (ICC) version 2 or 4 profiles.
- In the printing industry, the D50 illuminant and D50 white point are in wide use; for example, the CIELAB color space in use there is generally based on the D50 white point.

<sup id=Note10>(10)</sup> Further details on chromatic adaptation or on finding the inverse of a matrix are outside the scope of this document.

<sup id=Note11>(11)</sup> [CIE Technical Note 001:2014](http://www.cie.co.at/publications/technical-notes) says the chromaticity difference (_&Delta;<sub>u&prime;v&prime;</sub>_) should be calculated as the [Euclidean distance](#Color_Differences) between two _u&prime;v&prime;_ pairs and that a chromaticity difference of 0.0013 is just noticeable "at 50% probability".

<sup id=Note12>(12)</sup> Although the CIELAB color model is also often called "perceptually uniform"&mdash;
- CIELAB "was not designed to have the perceptual qualities needed for gamut mapping", according to [B. Lindbloom](http://www.brucelindbloom.com/index.html?UPLab.html), and
- such a claim "is really only the case for very low spatial frequencies", according to P. Kovesi (P. Kovesi, "Good Colour Maps: How to Design Them", arXiv:1509.03700 [cs.GR], 2015).

<sup id=Note13>(13)</sup> The placement of the _L\*_, _a\*_, and _b\*_ axes is related to the light/dark contrast, the _opponent signal_ red vs. green, and the opponent signal yellow vs. blue, respectively, which are believed to be generated by the human visual system in response to a stimulus of light. (These three contrasts are largely associated with E. Hering's work.  See also the entry "[hue](http://eilv.cie.co.at/term/542)" in the CIE's International Lighting Vocabulary.)

<sup id=Note14>(14)</sup> The terms _lightness_ and _chroma_ are relative to an area appearing white.  The corresponding terms _brightness_ and _saturation_, respectively, are subjective terms: _brightness_ is the perceived degree of reflected or emitted light, and _saturation_ is the perceived hue strength (_colorfulness_) compared to other colors of the same hue and brightness. (See also the CIE's International Lighting Vocabulary.) Note, however, that CIELAB has no formal saturation formula (see the Wikipedia article on [colorfulness](https://en.wikipedia.org/wiki/Colorfulness)).

<sup id=Note15>(15)</sup> The prime symbol appears near Y because the conversion from RGB usually involves [companded RGB colors](#Linear_RGB_and_Companded_RGB), so that Y&prime; will be similar to luminance, but not the same as luminance (Y).  See C. Poynton, ["_YUV_ and _luminance_ considered harmful"](http://poynton.ca/PDFs/YUV_and_luminance_harmful.pdf).

<sup id=Note16>(16)</sup> The prime symbol is left out in function names and other names in the pseudocode for convenience only.

<sup id=Note17>(17)</sup> The BT.2020 standard defines a color model called _YcCbcCrc_ for encoding ultra-high-definition video.  Unlike for Y&prime;C<sub>_B_</sub>C<sub>_R_</sub>, _linear RGB_ colors, rather than companded ones, should be converted to and from YcCbcCrc.  However, YcCbcCrc is not yet of such practical interest to many programmers to discuss further.

<sup id=Note18>(18)</sup> As an example of this point, the International Color Consortium maintains a [list of standardized conversions](http://www.color.org/chardata/drsection1.xalter) of CMYK colors, usually to CIELAB colors relative to the D50 white point, for different standardized printing conditions.  Such standardized conversions are generally known as _characterization data_ or _characterization tables_.

A very rough approximate conversion of an RGB color (`color`) to a CMYK color involves generating `k = min(min(1.0 - color[0], 1.0 - color[1]), 1.0 - color[2])`, then generating `[0, 0, 0, 1]` if `k` is 1, or `[((1.0 - color[0]) - k) / (1 - k), ((1.0 - color[2]) - k) / (1 - k), ((1.0 - color[2]) - k) / (1 - k), k]` otherwise.  A very rough approximate conversion of a CMYK color (`color`) to an RGB color involves generating `[(1 - color[0]) * ik, (1 - color[1]) * ik, (1 - color[2]) * ik]`, where `ik = 1 - color[3]`.

Printing systems that use mixtures of inks other than cyan, magenta, yellow, and black are usually not of general interest to programmers.

<sup id=Note19>(19)</sup> Other methods that have been used for approximating relative luminance (and which don't really yield "relative luminance" as used here) include&mdash;

- using the average (`(color[0]+color[1]+color[2])/3.0`), minimum, or maximum of the three color components (as shown on [T. Helland's site](http://www.tannerhelland.com/3643/grayscale-image-algorithm-vb6/), for example),
- using the [HSL](#HSL) "lightness" (see J. Cook, ["Converting color to grayscale"](https://www.johndcook.com/blog/2009/08/24/algorithms-convert-color-grayscale/)), and
- using one of the three color components (also as seen on T. Helland's site).

<sup id=Note20>(20)</sup> See C. Poynton, ["_YUV_ and _luminance_ considered harmful"](http://poynton.ca/PDFs/YUV_and_luminance_harmful.pdf).

<sup id=Note21>(21)</sup> In the [Web Content Accessibility Guidelines 2.0](https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast), the _contrast ratio_ of two colors is `(RelLum(brighter) + 0.05) / (RelLum(darker) + 0.05)`, where `RelLum(color)` is the "relative luminance" of a color as defined in the guidelines, `brighter` is the color with higher `RelLum`; and `darker` is the other color.  In general, under those guidelines, a _contrasting color_ is one whose contrast ratio with another color is 4.5 or greater (or 7 or greater for a stricter conformance level).

For companded sRGB 8/8/8 colors, `RelLum(color)` is effectively equivalent to `BT709(LinearFromsRGB3(From888(color)))`, with the guidelines using a different version of `LinearFromsRGB`, with 0.03928 (the value used in the sRGB proposal) rather than 0.04045, but this difference doesn't affect the result for such 8/8/8 colors.  `RelLum(color)` is equivalent to [`Luminance(color)`](#Relative_Luminance_Grayscale) whenever conformance to the guidelines is not important.  The guidelines use "relative luminance" rather than "luminance" because ["Web content does not emit light itself"](https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html).

A small percentage of people have [defective color vision](https://peteroupc.github.io/suppcolor.html#Defective_and_Animal_Color_Vision) and so may find certain colors harder to distinguish.  However, according to ["Understanding WCAG 2.0"](https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html), "effective [luminance contrast](#Relative_Luminance_Grayscale) can generally be computed without regard to specific color deficiency, except for the use of predominantly long wavelength colors [such as red] against darker colors ... for [people with] protanopia".

<sup id=Note22>(22)</sup> B. MacEvoy calls these [_hue harmonies_](http://www.handprint.com/HP/WCL/tech13.html#harmonies).  See also his [summary of harmonious color relationships](http://www.handprint.com/HP/WCL/tech13.html#harmonyoverview).

<sup id=Note23>(23)</sup> `Lerp3` is equivalent to `mix` in GLSL (OpenGL Shading Language).  Making `alpha` the output of a function (for example, `Lerp3(color1, color2, FUNC(...))`,
where `FUNC` is an arbitrary function of one or more variables) can be done to achieve special nonlinear blends.  Such blends (interpolations) are described in further detail [in another page](https://peteroupc.github.io/html3dutil/H3DU.Math.html#H3DU.Math.vec3lerp).

<sup id=Note24>(24)</sup> P. Haeberli, ["Matrix Operations for Image Processing"](http://www.graficaobscura.com/matrix/index.html), 1993.  The hue rotation matrix given was generated using the technique in the section "Hue Rotation While Preserving Luminance", with constants rounded to five significant digits and with `rwgt=0.2126`, `gwgt=0.7152`, and `bwgt = 0.0722`, the sRGB relative luminances for the red, green, and blue points.  For the saturation and hue rotation matrices, the sRGB relative luminances are used rather than the values recommended by the source.

<sup id=Note25>(25)</sup> The hue rotation angle is in radians, and the angle is greater than -2&pi; and less than 2&pi;. Degrees can be converted to radians by multiplying by `pi / 180`.

<sup id=Note26>(26)</sup> This is often called the "CMY" (cyan-magenta-yellow) version of the RGB color (although the resulting color is not necessarily based on a proportion of cyan, magenta, and yellow inks; see also "[CMYK](#CMYK)").  If such an operation is used, the conversions between "CMY" and RGB are exactly the same.

<sup id=Note27>(27)</sup> The "E" here stands for the German word _Empfindung_.

<sup id=Note28>(28)</sup> How to implement hash tables is outside the scope of this document.

<sup id=Note29>(29)</sup> In general, a color can be considered "print friendly" if it lies within the extent of colors (_color gamut_) that can be reproduced under a given or standardized printing condition (see also "[CMYK](#CMYK)").

<sup id=Note30>(30)</sup> An approximation of the colors to companded sRGB, in order, is (in [HTML color format](#HTML_Color_Format)): "#F0F0F1", "#181818", "#F7C100", "#875392", "#F78000", "#9EC9EF", "#C0002D", "#C2B280", "#838382", "#008D4B", "#E68DAB", "#0067A8", "#F99178", "#5E4B97", "#FBA200", "#B43E6B", "#DDD200", "#892610", "#8DB600", "#65421B", "#E4531B", "#263A21". The list was generated by converting the Munsell renotations (and a similar renotation for black) to sRGB using the Python `colour-science` package.

<sup id=Note31>(31)</sup> The CIE publishes [tabulated data](http://www.cie.co.at/technical-work/technical-resources) for the D65 illuminant and the CIE 1931 and 1964 standard observers at its Web site.

<sup id=Note32>(32)</sup> In some cases, the CIE 1931 standard observer can be approximated using the methods given in [Wyman, Sloan, and Shirley 2013](http://jcgt.org/published/0002/02/01/).

<sup id=Note33>(33)</sup> See also J. Walker, "[Colour Rendering of Spectra](http://www.fourmilab.ch/documents/specrend/)".

<sup id=Note34>(34)</sup> As [B. MacEvoy explains](http://www.handprint.com/HP/WCL/color18a.html#compmatch) (at "Other Factors in Material Mixtures"), things that affect the mixture of two colorants include their "refractive index, particle size, crystal form, hiding power and tinting strength" (see also his [principles 39 to 41](http://www.handprint.com/HP/WCL/color18a.html#ctprin39)), and "the material attributes of the support [e.g., the paper or canvas] and the paint application methods" are also relevant here.  These factors, to the extent the reflectance curves don't take them into account, are not dealt with in this method.

</small>

<a id=License></a>
## License
This page is licensed under [Creative Commons Zero](https://creativecommons.org/publicdomain/zero/1.0/).
