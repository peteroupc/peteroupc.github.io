# Color Topics for Programmers

[Peter Occil](mailto:poccil14@gmail.com)

<a id=Introduction></a>
## Introduction

This document presents an overview of many common color topics that are of general interest to programmers and that can be implemented in many different programming languages.   Many of the topics contain pseudocode that shows their implementation. In particular, this document discusses&mdash;

- popular formats for red-green-blue (RGB) colors,
- several color models of practical interest, including conversion methods,
- how to generate colors with certain properties,
- color differences,
- color mixing,
- color maps,
- how to find the dominant colors of an image, and
- colors as spectral functions.

In general, topics that are specific to a programming language or application programming interface are out of the scope of this document.  Moreover, the following topics are beyond this page's scope:

- Procedures to change or set the color used&mdash;
    - in text, foregrounds, or backgrounds of user interface elements (such as buttons, text boxes, and windows),
    - in text or backgrounds of documents (such as HTML documents), or
    - when generating graphics (such as plots and charts),

   are beyond the scope of this document because they generally vary depending on the specific application
   programming interface, document format, or plotting or charting technology.
- Determining which colors are used, or used by default, in user interface elements or documents.
- Color pickers, including how to choose colors with them.
- Specifics on retrieving colors (including pixel and palette colors) from images or screenshots (besides finding dominant colors).
- Setting colors (including pixel colors) on images.
- Colorization of command line outputs (or terminal or shell outputs) beyond describing the ANSI color codes.

<a id=Contents></a>
## Contents

- [Introduction](#Introduction)
- [Contents](#Contents)
- [Notation and Definitions](#Notation_and_Definitions)
    - [Utility Functions](#Utility_Functions)
- [RGB Color Model](#RGB_Color_Model)
    - [RGB Colors and the 0-1 Format](#RGB_Colors_and_the_0_1_Format)
    - [Integer Component Formats](#Integer_Component_Formats)
    - [HTML-Related Color Formats](#HTML_Related_Color_Formats)
    - [sRGB and Linearized RGB](#sRGB_and_Linearized_RGB)
- [Other Color Models](#Other_Color_Models)
    - [HSV](#HSV)
    - [HSL](#HSL)
    - [HWB](#HWB)
    - [CIE XYZ](#CIE_XYZ)
    - [CIE _L\*a\*b\*_](#CIE__L_a_b)
    - [CIE _L\*u\*v\*_](#CIE__L_u_v)
    - [CMYK](#CMYK)
    - [Y&prime;C<sub>_B_</sub>C<sub>_R_</sub>](#Y_prime_C_sub__B__sub_C_sub__R__sub)
- [Modifying Existing Colors](#Modifying_Existing_Colors)
    - [Shades, Tints, and Tones](#Shades_Tints_and_Tones)
    - [Relative Luminance (Grayscale)](#Relative_Luminance_Grayscale)
    - [Color Schemes](#Color_Schemes)
    - [Color Matrices](#Color_Matrices)
    - [Blending and Alpha Compositing](#Blending_and_Alpha_Compositing)
    - [Miscellaneous](#Miscellaneous)
- [Color Difference and Nearest Colors](#Color_Difference_and_Nearest_Colors)
    - [Examples](#Examples)
- [Generating a Random Color](#Generating_a_Random_Color)
- [Dominant Colors of an Image](#Dominant_Colors_of_an_Image)
- [Color Maps](#Color_Maps)
    - [Named Colors](#Named_Colors)
    - [Visually Distinct Colors](#Visually_Distinct_Colors)
- [Colors as Spectral Functions](#Colors_as_Spectral_Functions)
    - [Color Temperature](#Color_Temperature)
- [Color Mixture](#Color_Mixture)
- [Other Color Topics](#Other_Color_Topics)
    - [Colorblindness](#Colorblindness)
    - [Terminal Colors](#Terminal_Colors)
- [Conclusion](#Conclusion)
- [Notes](#Notes)
- [License](#License)

<a id=Notation_and_Definitions></a>
## Notation and Definitions

In this document:

- The [**pseudocode conventions**](https://peteroupc.github.io/pseudocode.html) apply to this document.
- `RNDNUMRANGE`, `RNDU01`, and `RNDINT` are as defined in my article on [random number generation methods](https://peteroupc.github.io/randomfunc.html).
- The term _RGB_ means red-green-blue.
- The abbreviation _ICC_ means the International Color Consortium.
- The abbreviation _CIE_ means the International Commission on Illumination (CIE, for its initials in French).
- The term _linearized_ refers to RGB colors with a linear relationship of emitted light (rather than perceived light).
- The term _nonlinearized_ or _companded_ refers to RGB colors that are not linearized (generally with a more or less linear relationship of perceived light).<sup>[(3)](#Note3)</sup>
- The term _D65 white point_ means the white point determined by the CIE's D65 illuminant and the CIE 1931 color matching functions.
- The term _D50 white point_ means the white point determined by the CIE's D50 illuminant and the CIE 1931 color matching functions.

<a id=Utility_Functions></a>
### Utility Functions

In the pseudocode below, the utility function&mdash;
- `Lerp3` returns a blended form of two lists of three numbers (`list1` and `list2`); here, `fac` is 0 or greater and 1 or less, where 0 means equal to `list1` and 1 means equal to `list2`, and `Lerp3` is equivalent to `mix` in GLSL (OpenGL Shading Language);
- `Clamp` returns `minimum` if the given value is less than `minimum`, `maximum` if greater than `maximum`,
or `value` otherwise, and is equivalent to `clamp` in GLSL;
- `Clamp3` applies the `Clamp` function separately to each item of a three-element list; here, `value`, `minimum`,
and `maximum` are each three-element lists; and
- `MeanAngle` finds the average of one or more angles expressed in radians (which is important when averaging colors in hue-based color models, which contain hue components that are angles).

**Note:** For `Lerp3`, making `fac` the output of a function (for example, `Lerp3(list1, list2, FUNC(...))`,
where `FUNC` is an arbitrary function of one or more variables) can be done to achieve special nonlinear interpolations.
Detailing such interpolations is outside the scope of this document, but are described in further detail [in another page](https://peteroupc.github.io/html3dutil/H3DU.Math.html#H3DU.Math.vec3lerp).

    METHOD Lerp3(a, b, fac)
        return [a[0]+(b[0]-a[0])*fac, a[1]+(b[1]-a[1])*fac, a[2]+(b[2]-a[2])*fac]
    END METHOD

    METHOD Clamp(value, minimum, maximum)
        if value < minimum: return minimum
        if value > maximum: return maximum
        return value
    END METHOD

    METHOD Clamp3(value, minimum, maximum)
        return [Clamp(value[0],minimum[0], maximum[0]),
          Clamp(value[1],minimum[1], maximum[1]),
          Clamp(value[2],minimum[2], maximum[2])]
    END METHOD

    METHOD MeanAngle(angles)
        if size(angles)==0: return 0
        xm=0
        ym=0
        i=0
        while i < size(angles)
            xm = xm + cos(angles[i])
            ym = ym + sin(angles[i])
            i = i + 1
        end
        return atan2(ym / size(angles), xm / size(angles))
    END

<a id=RGB_Color_Model></a>
## RGB Color Model

A _color model_ describes, in general terms, the relationship of colors in a theoretical space.  A _color space_ is a mapping from colors to numbers that follows a particular color model.

The _red-green-blue (RGB) color model_ is based, at least theoretically, on the intensity that a set of tiny red, green, and blue light-emitting dots should have in order to reproduce a given color on an electronic display.<sup>[(10)](#Note10)</sup> The RGB model is a three-dimensional cube with one vertex set to black, the opposite vertex set to white, and the remaining vertices set to what are called the "additive primaries" red, green, and blue, and the "subtractive primaries" cyan, yellow, and magenta.

In general, _RGB color spaces_ differ in what they consider pure red, green, blue, and white.  Because human color perception is nonlinear, RGB color spaces also differ in their _transfer functions_ (also known as _companding_ conversions, conversions to and from linearized RGB).

The following details concepts related to the RGB color model.

<a id=RGB_Colors_and_the_0_1_Format></a>
### RGB Colors and the 0-1 Format
In an RGB color space, an _RGB color_ consists of three components.  Given `color`, which is an RGB color&mdash;
- `color[0]` is the color's red component,
- `color[1]` is the color's green component, and
- `color[2]` is the color's blue component,

and each component is 0 or greater and 1 or less, where brighter colors have higher-valued components in general. (The term **0-1 format** will be used in this document to describe this format.  All RGB colors in this document are in the 0-1 format unless noted otherwise.)

Some RGB colors also contain an alpha component, expressed as `color[3]` (the fourth item in `color`) and being 0 or greater and 1 or less, where 0 means fully transparent and 1 means fully opaque. Such RGB colors are called _RGBA colors_ in this document.  RGB colors without an alpha component are generally considered to be fully opaque (and to have an implicit alpha component of 1).

**Note:** An RGB color is white, black, or a shade of gray (_achromatic_) if it has equal red, green, and blue components. A collection of RGB colors (including a raster image) is achromatic if all its RGB colors are achromatic.

<a id=Integer_Component_Formats></a>
### Integer Component Formats

RGB and RGBA colors are often expressed by packing their red, green, and blue components
(or those three components as well as alpha) as integers.

In this document, there are two general categories for such formats, described below.
In the pseudocode below, `red`, `green`, `blue`, and `alpha` are the corresponding components
of the formats described below, and `color` is an RGB color in [0-1 format](#0_1_Format).

- **RN/GN/BN format:** As integers that are (RN + GN + BN) bits long, where&mdash;
    - the red component is RN bits long and calculated as follows: `floor(color[0] * (pow(2, RN) - 1) + 0.5)`,
    - the green component is GN bits long and calculated as follows: `floor(color[1] * (pow(2, GN) - 1) + 0.5)`,
    - the blue component is BN bits long and calculated as follows: `floor(color[2] * (pow(2, BN) - 1)+ 0.5)`, and
    - the components are converted to 0-1 format as follows:
        `[red/pow(2, RN) - 1, green/(pow(2, GN) - 1), blue/(pow(2, BN) - 1)]`,
- **RN/GN/BN/AN format:** As integers that are (RN + GN + BN +AN) bits long, where&mdash;
    - the red component is RN bits long and calculated as follows: `floor(color[0] * (pow(2, RN)- 1) + 0.5)`,
    - the green component is GN bits long and calculated as follows: `floor(color[1] * (pow(2, GN)- 1) + 0.5)`,
    - the blue component is BN bits long and calculated as follows: `floor(color[2] * (pow(2, BN)- 1) + 0.5)`,
    - the alpha component is AN bits long and calculated as follows: `floor(color[3] *( pow(2, AN)- 1) + 0.5)`, and
    - the components are converted to 0-1 format as follows:
        `[red/pow(2, RN) - 1, green/(pow(2, GN) - 1), blue/(pow(2, BN) - 1), alpha/(pow(2, AN) - 1)]`,

Special cases of these formats include the following:
- **5/5/5 format:** As 15-bit integers (5 bits per component).
- **5/6/5 format:** As 16-bit integers (5 bits each for red and blue, and 6 bits for green).
- **8/8/8 format:** As 24-bit integers (8 bits per component).
- **8/8/8/8 format:** As 32-bit integers (8 bits each for red, green, blue, and alpha).
- **16/16/16 format:** As 48-bit integers (16 bits per component).

How the RGB or RGBA color's components are packed into an integer varies considerably.  Among
other possibilities, they can be packed in any of the following orders from lowest to highest bits:

- *RN/GN/BN format*: Red, green, blue.
- *RN/GN/BN format*: Blue, green, red.
- *RN/GN/BN/AN format*: Red, green, blue, alpha.
- *RN/GN/BN/AN format*: Alpha, red, green, blue.
- *RN/GN/BN/AN format*: Blue, green, red, alpha.
- *RN/GN/BN/AN format*: Alpha, blue, green, red.

(Little-endian/big-endian issues and other considerations when storing colors as a series of bytes are outside the scope of this document, and so is a thorough survey of the integer color formats in common use.)

The following pseudocode contains methods for converting RGB colors to and from different color formats (where the red component is stored in the low bits of each RGB color number):

    METHOD Upscale(v, c)
       return floor(c * v + 0.5)
    END METHOD

    // Converts 0-1 format to N/N/N format as an integer
    METHOD ToNNN(rgb, scale)
       sm1 = scale - 1
       return Upscale(rgb[2], sm1) * scale * scale + Upscale(rgb[1], sm1) * scale +
             Upscale(rgb[0], sm1)
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
       return Upscale(rgb[2], 31) * 32 * 64 + Upscale(rgb[1], 63) * 32 +
             Upscale(rgb[0], 31)
    END METHOD

    METHOD From565(rgb, scale)
       r = mod(rgb, 32)
       g = mod(floor(rgb / 32.0), 64)
       b = mod(floor(rgb / (32.0 * 64.0)), 32)
       return [ r / 31.0, g / 63.0, b / 31.0]
    END METHOD

<a id=HTML_Related_Color_Formats></a>
### HTML-Related Color Formats

A color string in the _HTML color format_ (also known as "hex" format), which expresses RGB colors in 8/8/8 format as a string, consists of&mdash;

- the character "#",
- followed by the two base-16 (hexadecimal) digits<sup>[(1)](#Note1)</sup> of the red component,
- followed by the two base-16 digits of the green component,
- followed by the two base-16 digits of the blue component.

For example, the HTML color `#003F86` expresses the RGB color whose red, green, and blue components in 8/8/8 format are (0, 63, 134).<sup>[(6)](#Note6)</sup>

The [CSS Color Module Level 3](https://www.w3.org/TR/css3-color/#rgb-color), which specifies the HTML color format, also mentions a 3-digit format, consisting of "#" followed by one base-16 digit each for the red, green, and blue components, respectively. Conversion to the 6-digit format involves replicating each base-16 component (for example, "#345" is the same as "#334455" in the 6-digit format).

An 8-digit variant used in the Android operating system consists of "#" followed by two base-16 digits each for the alpha, red, green, and blue components, respectively.  This variant thus describes 8/8/8/8 RGBA colors.

The following pseudocode presents methods to convert RGB colors (actually lists of text
characters) to and from the HTML color format or the 3-digit format.

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
       // NOTE: Upscale method is given earlier in "Integer
       // Component Formats"
       r = Upscale(rgb[0], 255)
       g = Upscale(rgb[1], 255)
       b = Upscale(rgb[2], 255)
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

**Note:** As used in the [CSS color module level 3](http://www.w3.org/TR/css3-color/), for example, colors in the HTML color format or the 3-digit format are in the (nonlinearized) [_sRGB color space_](#sRGB_and_Linearized_RGB).

<a id=sRGB_and_Linearized_RGB></a>
### sRGB and Linearized RGB

Among RGB color spaces, one of the most popular is the sRGB color space. The _sRGB color space_ is a "working space" for describing red-green-blue colors and is based on the color output of cathode-ray-tube monitors.  (For background, see the [sRGB proposal](https://www.w3.org/Graphics/Color/sRGB).)<sup>[(2)](#Note2)</sup>

Although many RGB working spaces are linearized by _gamma decoding_, sRGB is different; the formula to use to linearize sRGB colors (the sRGB _transfer function_) is similar to, but is not, applying a gamma exponent of 2.2.

The following methods linearize and de-linearize sRGB colors.  (Note that the thresholds `0.4045` and `0.0031308` are those of IEC 61966-2-1, the official sRGB standard; the sRGB proposal has different values for these thresholds.)

    // Convert a color component from nonlinearized to linearized RGB
    METHOD LinearFromsRGB(c)
      if c <= 0.04045: return c / 12.92
      return pow((0.055 + c) / 1.055, 2.4)
    END METHOD

    // Convert a color component from linearized to nonlinearized sRGB
    METHOD LinearTosRGB(c)
      if c <= 0.0031308: return 12.92 * c
      return pow(c, 1.0 / 2.4) * 1.055 - 0.055
    END METHOD

    // Convert a color from nonlinearized to linearized RGB
    METHOD LinearFromsRGB3(c)
       return [LinearFromsRGB(c[0]), LinearFromsRGB(c[1]), LinearFromsRGB(c[2])]
    END METHOD

    // Convert a color from linearized to nonlinearized sRGB
    METHOD LinearTosRGB3(c)
       return [LinearTosRGB(c[0]), LinearTosRGB(c[1]), LinearTosRGB(c[2])]
    END METHOD

<a id=Other_Color_Models></a>
## Other Color Models

The following discusses several color models, other than RGB, that are of practical interest.

<a id=HSV></a>
### HSV

[HSV](https://en.wikipedia.org/wiki/HSL_and_HSV)  (also known as HSB) is a color model that transforms RGB colors to make them easier to manipulate and reason with.  An HSV color consists of three components, in the following order:

- _Hue_, or angle in the color wheel, is in radians and is 0 or greater and less than 2&pi; (from red at 0 to yellow to green to cyan to blue to magenta to red).
- _Saturation_, the distance of the color from gray and white (but not necessarily from black),
  is 0 or greater and 1 or less.
- A component variously called "value" or "brightness" is the distance of the color from black and is 0 or greater and 1 or less.

The following pseudocode converts colors between RGB and HSV. Each RGB color is in 0-1 format.
The transformation is independent of RGB color space, but should be done using [_linearized RGB_ colors](#sRGB_and_Linearized_RGB).

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
- **`HSVSat(color)`** is the HSV saturation component of a color, that is, `RgbToHsv(color)[1]`, and
- **`HSVVal(color)`** is the HSV brightness or "value" component of a color, that is, `RgbToHsv(color)[2]`.

**Notes:**

- In most applications, hue is in degrees and is 0 or greater and less than 360.
- The HSV color model is not perception-based, as acknowledged in (Smith and Lyons 1996).

<a id=HSL></a>
### HSL

[HSL](https://en.wikipedia.org/wiki/HSL_and_HSV) (also known as HLS), like HSV, is a color model that transforms RGB colors to ease intuition.  An HSL color consists of three components, in the following order:

- _Hue_, which is the same for a given RGB color as in HSV.
- A component called "saturation" is the distance of the color from gray (but not necessarily from
black or white), which is 0 or greater and 1 or less.
- A component variously called "lightness", "luminance", or "luminosity", is roughly the amount
of black or white mixed with the color and which is 0 or greater and 1 or less, where 0 is black, 1 is white, and 0.5 is neither black nor white.

The following pseudocode converts colors between RGB and HSL. Each RGB color is in 0-1 format.  The transformation is independent of RGB color space, but should be done using [_linearized RGB_ colors](#sRGB_and_Linearized_RGB).

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
        if lum <= 0.5: bb = lum * (1.0 + sat)
        if lum > 0.5: bb= lum + sat - (lum * sat)
        a = lum * 2 - bb
        r = a
        g = a
        b = a
        hueval = hsl[0]
        if hueval < 0: hueval = pi * 2 - mod(-hueval, pi * 2)
        if hueval >= pi * 2: hueval = mod(hueval, pi * 2)
        hue = hueval + pi * 2 / 3
        deg60 = pi / 3
        deg240 = pi * 4 / 3
        if hue >= pi * 2: hue = hue - pi * 2
        if hue < deg60: r = a + (bb - a) * hue / deg60
        else if hue < pi: r = bb
        else if hue < deg240
                r = a + (bb - a) * (deg240 - hue) / deg60
        end
        hue = hueval
        if hue < deg60: g = a + (bb - a) * hue / deg60
        else if hue < pi: g = bb
        else if hue < deg240
                g = a + (bb - a) * (deg240 - hue) / deg60
        end
        hue = hueval - pi * 2 / 3
        if hue < 0: hue = hue + pi * 2
        if hue < deg60: b = a + (bb - a) * hue / deg60
        else if hue < pi: b = bb
        else if hue < deg240
                b = a + (bb - a) * (deg240 - hue) / deg60
        end
        return [r, g, b]
    END METHOD

In the rest of this document&mdash;

- **`HSLSat(color)`** is the HSL "saturation" component of a color, that is, `RgbToHsl(color)[1]`, and
- **`HSLLgt(color)`** is the HSL "lightness" component of a color, that is, `RgbToHsl(color)[2]`.

**Notes:**

- In some applications and specifications, especially where this color model is called HLS, the HSL color's "lightness" component comes before "saturation".  This is not the case in this document, though.
- In most applications, hue is in degrees and is 0 or greater and less than 360.
- The HSL color model is not perception-based, as acknowledged in (Smith and Lyons 1996).

<a id=HWB></a>
### HWB

In 1996, the HWB model, which seeks to be more intuitive than HSV or HSL, was published (Smith and Lyons 1996).  An HWB color consists of three components in the following order:
- _Hue_ is the same as in [HSV](#HSV).
- _Whiteness_ is the amount of white in the color.
- _Blackness_ is the amount of black in the color.

The conversion is relatively simple given HSV conversion methods:

- To convert an RGB color `color` to HWB, generate `[HSVHue(color), min(min(color[0], color[1]), color[2]), 1 - max(max(color[0], color[1]), color[2])]`.
- To convert an HWB color `hwb` to RGB, generate `HsvToRgb([hwb[0], 1 - hwb[1]/(1-hwb[2]), 1 - hwb[2]])` if `hwb[2] < 1`, or `[hwb[0], 0, 0]` otherwise.

**Note:** The HWB color model is not perception-based, as acknowledged in (Smith and Lyons 1996).

<a id=CIE_XYZ></a>
### CIE XYZ

The [CIE 1931 standard colorimetric system](https://en.wikipedia.org/wiki/CIE_1931_color_space) (called the _XYZ color model_ in this document) describes a transformation of a distribution of light into a point in three-dimensional space, as further explained in "[Colors as Spectral Functions](#Colors_as_Spectral_Functions)".  An XYZ color consists of three components, in the following order:

- X is a component without special meaning.
- Y indicates the _luminance_ of the color.
- Z is a component without special meaning.

There are at least two conventions for XYZ colors:

- In one convention ("absolute XYZ"), the Y component represents an absolute luminance in candelas per square meter (cd/m<sup>2</sup>).
- In another convention ("relative XYZ"), the three components are normalized to a reference white point and "black point", such that Y ranges from 0 for black to a known value for white.  Specifically, the relative XYZ color is the absolute XYZ color minus the "black point", then divided by the absolute-Y difference between the white point and the "black point", then multiplied by a normalizing factor such as 1 or 100.  In this sense, the "black point" is generally, but not always, the absolute XYZ color `[0, 0, 0]`, that is, one having a Y component (absolute luminance) of 0 cd/m<sup>2</sup>.

In the following pseudocode&mdash;

- `XYZFromsRGB(rgb)` converts a nonlinearized sRGB color (`rgb`) to an XYZ color, where an XYZ color with Y = 1 is the D65 white point (as is usual for sRGB), and `XYZTosRGB(xyz)` does the opposite conversion, and
- `XYZFromsRGBD50(rgb)` converts a nonlinearized sRGB color (`rgb`) to an XYZ color, where an XYZ color with Y = 1 is the D50 white point, e.g., for interoperability with applications color-managed with ICC profiles, and `XYZTosRGBD50(xyz)` does the opposite conversion (see the notes later in this section).

The pseudocode follows.

    // Applies a 3x3 matrix transformation
    METHOD Apply3x3Matrix(xyz, xyzmatrix)
        r=x*xyzmatrix[0]+y*xyzmatrix[1]+z*xyzmatrix[2]
        g=x*xyzmatrix[3]+y*xyzmatrix[4]+z*xyzmatrix[5]
        b=x*xyzmatrix[6]+y*xyzmatrix[7]+z*xyzmatrix[8]
        return [r,g,b]
    END METHOD

    METHOD XYZFromsRGBD50(rgb)
        lin=LinearFromsRGB3(rgb)
        return Apply3x3Matrix(lin, [0.4360657, 0.3851515, 0.1430784,
                0.2224932, 0.7168870, 0.06061981, 0.01392392,
                0.09708132, 0.7140994])
    END METHOD

    METHOD XYZTosRGBD50(xyz)
        rgb=Apply3x3Matrix(xyz, [3.134136, -1.617386, -0.4906622,
                 -0.9787955, 1.916254, 0.03344287, 0.07195539,
                 -0.2289768, 1.405386])
        return Clamp3(LinearTosRGB3(rgb), [0,0,0],[1,1,1])
    END METHOD

    METHOD XYZFromsRGB(rgb)
        lin=LinearFromsRGB3(rgb)
        return Apply3x3Matrix(lin, [0.4123908, 0.3575843, 0.1804808,
                0.2126390, 0.7151687, 0.07219232, 0.01933082,
                0.1191948, 0.9505322])
    END METHOD

    METHOD XYZTosRGB(xyz)
        rgb=Apply3x3Matrix(xyz, [3.240970, -1.537383, -0.4986108,
                -0.9692436, 1.875968, 0.04155506, 0.05563008,
                -0.2039770, 1.056972])
        return Clamp3(LinearTosRGB3(rgb), [0,0,0],[1,1,1])
    END METHOD

**Notes:**

- In this document, unless noted otherwise, XYZ colors use a "relative XYZ" convention in which the Y component is 1 for the white point and 0 for a color with an ideal absolute luminance of 0 cd/m<sup>2</sup>.
- In the pseudocode just given, 3x3 matrices are used to transform a linearized RGB color to or from XYZ form. The matrix shown in `XYZTosRGB` or `XYZTosRGBD50` is the inverse of the matrix shown in `XYZFromsRGB` or `XYZFromsRGBD50`, respectively.
- Where the XYZ color will be relative to a different white point than the RGB color space's usual white point,
a [_chromatic adaptation_](https://en.wikipedia.org/wiki/Chromatic_adaptation) from one white point to another (such as a linear Bradford transformation)
needs to be done to the RGB-to-XYZ matrix.  The XYZ-to-RGB matrix is then the inverse of the adapted matrix.
The `XYZFromsRGBD50` and `XYZTosRGBD50` methods are examples of such adaptation.
- Further details on chromatic adaptation or on finding the inverse of a matrix are outside the scope of this document.
- An XYZ color (`xyz`) can be converted to "xyY" form (where the "xy" is _chromaticity_ and "Y" is _luminance_) by generating
`[xyz[0]/(xyz[0]+xyz[1]+xyz[2]), xyz[1]/(xyz[0]+xyz[1]+xyz[2]), xyz[1]]`.  Note that if the sum of the XYZ components is 0, the result
is undefined.
- A color in "xyY" form (`xyy`) can be converted to an XYZ color by generating
`[xyy[0]*xyy[2]/xyy[1], xyy[2], xyy[2]*(1 - xyy[0] - xyy[1])/xyy[1]]`.  Note that if the small-_y_ component is 0,
the result is undefined.

<a id=CIE__L_a_b></a>
### CIE _L\*a\*b\*_

CIE _L\*a\*b\*_ (also known as CIELAB) is a color model designed for color comparisons.<sup>[(11)](#Note11)</sup>  It arranges colors in three-dimensional space such that colors that appear similar will generally be close in space, and places white at the origin of the space.  In general, _L\*a\*b\*_ color spaces differ in what they consider white (also called a _reference white point_).

A color in CIE _L\*a\*b\*_ consists of three components, in the following order:

- _L\*_, or _lightness_ of a color, ranges from 0 (black) to 100 (white).  The _L\*a\*b\*_ color `[100, 0, 0]` is the reference white point.
- _a\*_ and _b\*_, in that order, are coordinates of two axes that extend away from the gray line.

In the following pseudocode&mdash;
- the `SRGBToLab` method converts a nonlinearized sRGB color to CIE _L\*a\*b\*_, where
 the _L\*a\*b*_ color `[100, 0, 0]` is the D65 white point, and the `SRGBFromLab` method does the opposite conversion,
- the `SRGBToLabD50` method converts a nonlinearized sRGB color to CIE _L\*a\*b\*_, where
 the _L\*a\*b*_ color `[100, 0, 0]` is the D50 white point, e.g., for interoperability with applications color-managed with ICC profiles, and the `SRGBFromLabD50` method does the opposite conversion, and
- the `XYZToLab(xyz, wpoint)` method converts an XYZ color to _L\*a\*b\*_ relative to the white point `wpoint` (a relative XYZ color),
 and the `LabToXYZ(lab, wpoint)` method does the opposite conversion.

The pseudocode follows.

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

    METHOD LabToXYZ(xyz,wpx,wpz)
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
                xyz[1]=lab[0]*27/24389.0 // See BruceLindbloom.com
        end
        xyz[0]=xyz[0]*wpx
        xyz[2]=xyz[2]*wpz
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

A color's _chroma_ (or relative colorfulness) can be derived from a _L\*a\*b\*_ color
with a method demonstrated in the following pseudocode.  The closer chroma
is to 0 &mdash; or the closer the point (_a\*_, _b\*_) is to the origin (0, 0) &mdash;
the closer the color is to the "gray" line.

    METHOD LabToChroma(lab)
        return sqrt(lab[1]*lab[1] + lab[2]*lab[2])
    END METHOD

A color's _hue_ (an angle in radians) can be derived from a _L\*a\*b\*_ color
with a method demonstrated in the following pseudocode. (Radians
can be converted to degrees by multiplying by `180 / pi`.)  Hue is 0 or greater
and less than 2&pi; (from red at roughly 0 to yellow to green to cyan to blue to magenta to red).

    METHOD LabToHue(lab)
        h = atan2(lab[2], lab[1])
        if h < 0: h = h + pi * 2
        return h
    END METHOD

The following method converts lightness, chroma, and hue to a
_L\*a\*b*_ color.  It takes a list of those three elements in that order.

    METHOD LchToLab(lch)
       // NOTE: Assumes hue is in radians, not degrees
       return [lch[0], lch[1] * cos(lch[2]), lch[1] * sin(lch[2])]
    END METHOD

CIE _L\*a\*b\*_ has no formal saturation formula (see the Wikipedia article
on [colorfulness](https://en.wikipedia.org/wiki/Colorfulness)).

<a id=CIE__L_u_v></a>
### CIE _L\*u\*v\*_

CIE _L\*u\*v\*_ (also known as CIELUV) is a second color model designed for color comparisons, but is probably less common
than CIE _L\*a\*b\*_.   _L\*u\*v\*_ is similar to _L\*a\*b\*_, except that the three components
are _L\*_, or _lightness_ of a color (which is the same as in _L\*a\*b\*_), _u\*_,
and _v\*_, in that order.

In the following pseudocode&mdash;
- the `SRGBToLuv` method converts a nonlinearized sRGB color to CIE _L\*u\*v\*_, where
 the _L\*u\*v*_ color `[100, 0, 0]` is the D65 white point, and the `SRGBFromLuv` method does the opposite conversion,
- the `SRGBToLuvD50` method converts a nonlinearized sRGB color to CIE _L\*u\*v\*_, where
 the _L\*u\*v*_ color `[100, 0, 0]` is the D50 white point, e.g., for interoperability with applications color-managed with ICC profiles, and the `SRGBFromLuvD50` method does the opposite conversion, and
- the `XYZToLuv(xyz, wpoint)` method converts an XYZ color to _L\*u\*v\*_  relative to the white point `wpoint` (a relative XYZ color),
and the `LuvToXYZ(luv, wpoint)` method does the opposite conversion.

The pseudocode follows.

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
_L\*u\*v\*_ color in a similar way as from a _L\*a\*b\*_, color, with
_u\*_ and _v\*_ used instead of _a\*_ and _b\*_, respectively.
The `LabToHue`, `LabToChroma`, and
`LchToLab` methods from the previous section work with
_L\*u\*v\*_ colors analogously to _L\*a\*b\*_ colors.
A color's [_saturation_](https://en.wikipedia.org/wiki/Colorfulness)
can be derived from a _L\*u\*v\*_ color with a method demonstrated
in the following pseudocode:

    METHOD LuvToSaturation(luv)
        if luv[0]==0: return 0
        return sqrt(luv[1]*luv[1]+luv[2]*luv[2])/luv[0]
    END METHOD

<a id=CMYK></a>
### CMYK

CMYK is a color model describing the amount and proportion of cyan, magenta, yellow, and black (K) inks to use to reproduce a given color on paper.  However, a proper conversion of a CMYK color to RGB, or vice versa, is not trivial, in part because&mdash;
- the conversion to RGB deals with color mixture of inks, which is not as simple as mixing abstract colors (see "[Color Mixture](#Color_Mixture)", later), and
- the meaning and conversion of CMYK colors can vary depending on numerous printing conditions, including inks and paper; for example, different inks have different light reflectances.<sup>[(5)](#Note5)</sup>

<a id=Y_prime_C_sub__B__sub_C_sub__R__sub></a>
### Y&prime;C<sub>_B_</sub>C<sub>_R_</sub>

[Y&prime;C<sub>_B_</sub>C<sub>_R_</sub>](https://en.wikipedia.org/wiki/YCbCr) (also known as YCbCr, YCrCb, or  Y&prime;CrCb) is a color model used above all in video encoding.  A color in Y&prime;C<sub>_B_</sub>C<sub>_R_</sub> consists of three components in the following order:

- Y&prime;, or _luma_, is an integer 16 or greater and 235 or less: 16 for black, and 235 for white.<sup>[(14)](#Note14)</sup>
- C<sub>_B_</sub>, or _blue chroma_, is, theoretically, the scaled difference between blue and luma and is an integer 16 or greater and 240 or less.
- C<sub>_R_</sub>, or _red chroma_, is, theoretically, the scaled difference between red and luma and is an integer 16 or greater and 240 or less.

Note that a thorough survey of the various ways in which Y&prime;C<sub>_B_</sub>C<sub>_R_</sub> data has been encoded is outside
the scope of this document.

The following pseudocode converts colors between RGB and Y&prime;C<sub>_B_</sub>C<sub>_R_</sub>.  Each RGB color is in 8/8/8
format with the components separated out (still 0 or greater and 255 or less). There are three variants shown here, namely&mdash;

- the ITU-R BT.601 variant (for digital standard-definition video), as the `YCbCrToRgb` and `RgbToYCbCr` methods (the prime symbol is left out of those and other names in the pseudocode below for convenience only),
- the ITU-R BT.709 variant (for high-definition video), as the `YCbCrToRgb709` and `RgbToYCbCr709` methods, and
- the [JPEG File Interchange Format](https://www.w3.org/Graphics/JPEG/jfif3.pdf) variant (with all three components 0 or greater and 255 or less), as the `YCbCrToRgbJpeg` and `RgbToYCbCrJpeg` methods.

For all these variants, the transformation should be done using [_nonlinearized RGB_ colors](#sRGB_and_Linearized_RGB).   For efficiency reasons, however, Y&prime;C<sub>_B_</sub>C<sub>_R_</sub> conversion is sometimes done using a series of lookup tables, rather than directly applying the conversion methods given below.

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

    METHOD YCbCrToRgb(YCbCr)
        cb = YCbCr[1] - 128
        cr = YCbCr[2] - 128
        yp = 1.1643836 * (YCbCr[0] - 16)
        r = yp + 1.5960268 * cr
        g = yp - 0.39176229 * cb - 0.81296765 * cr
        b = yp + 2.0172321 * cb
        return Clamp3([r, g, b], [0,0,0],[255,255,255])
    END METHOD

    METHOD YCbCrToRgb709(YCbCr)
        cb = YCbCr[1] - 128
        cr = YCbCr[2] - 128
        yp = 1.1643836 * (YCbCr[0] - 16)
        r = yp + 1.7927411 * cr
        g = yp - 0.21324861 * cb - 0.53290933 * cr
        b = yp + 2.1124018 * cb
        return Clamp3([r, g, b], [0,0,0],[255,255,255])
    END METHOD

    METHOD YCbCrToRgbJpeg(YCbCr)
        cb = YCbCr[1] - 128
        cr = YCbCr[2] - 128
        yp = YCbCr[0]
        r = yp + 1.402 * cr
        g = yp - 0.34413629 * cb - 0.71413629 * cr
        b = yp + 1.772 * cb
        return Clamp3([r, g, b], [0,0,0],[255,255,255])
    END METHOD

<a id=Modifying_Existing_Colors></a>
## Modifying Existing Colors

The following techniques show how existing colors can be modified to create new colors.

Note that for best results, these techniques need to be carried out with [_linearized RGB colors_](#sRGB_and_Linearized_RGB), unless noted otherwise.

<a id=Shades_Tints_and_Tones></a>
### Shades, Tints, and Tones

- **Shades**: The idiom `Lerp3(color, [0, 0, 0], shading)` generates a _shade_ of the given `color` (a mixing of `color`
  with black).  The parameter `shading` is 0 or greater and 1 or less (0 means equal to `color` and 1 means equal to black); the greater the parameter, the darker the resulting color.
- **Tints**: The idiom `Lerp3(color, [1, 1, 1], tinting)` generates a _tint_ of the given `color` (a mixing of `color`
  with white).  The parameter `tinting` is 0 or greater and 1 or less (0 means equal to `color` and 1 means equal to white); the greater the parameter, the lighter the resulting color.
- **Tones**: The idiom `Lerp3(color, [0.5, 0.5, 0.5], toning)` generates a _tone_ of the given `color` (a mixing of `color`
  with gray).  The parameter `toning` is 0 or greater and 1 or less (0 means equal to `color` and 1 means equal to gray); the greater the parameter, the less saturated the resulting color.
- **Lighten/Darken**: A choice of&mdash;
    - `Clamp3([color[0]+value, color[1]+value, color[2]+value], [0, 0, 0], [1, 1, 1])`, or
    - `HslToRgb(HSVHue(color), HSLSat(color), Clamp(HSLLgt(color) + value, 0, 1))`,

    generates a lighter version of `color` if `value` is positive, and a darker version if `value` is negative.
- **Lighten/Darken (_L\*a\*b\*_)**: If `color` is a nonlinearized sRGB color, generate `lab = SRGBToLab(color)`, then generate `modifiedColor = SRGBFromLab(Clamp(lab[0] + value, 0, 100), lab[1], lab[2])`, where a positive `value` generates a lighter version of `color` and a negative `value`, a darker version.
- **Saturate/Desaturate**: Generate `hsv = RgbToHsv(color)`, then generate `modifiedColor = HsvToRgb(hsv[0], Clamp(hsv[1] + color, 0, 1), hsv[0])`; this procedure saturates `color` if `value` is positive, and desaturates that color if `value` is negative. (Note that HSL's "saturation" is inferior here.)

<a id=Relative_Luminance_Grayscale></a>
### Relative Luminance (Grayscale)

Relative luminance is a single number, being 0 or greater and 1 or less, that indicates how light or dark a color is; relative luminance is equivalent to the Y-axis in the [XYZ color model](#CIE_XYZ).

- For [_linearized RGB_ color spaces](#sRGB_and_Linearized_RGB)&mdash;
    - relative luminance can be found by calculating `(color[0] * r + color[1] * g + color[2] * b)`,
where `r`, `g`, and `b` are the upper-case-Y components (relative luminances) of the RGB color space's red, green, and blue
points, respectively<sup>[(2)](#Note2)</sup><sup>[(9)](#Note9)</sup>,
    - the RGB color space's "black point" has a relative luminance of 0, and
    - the RGB color space's white point has a relative luminance of 1.

    Where a different white point than the RGB color space's usual white point should have a relative luminance of 1, then `r`, `g`, and `b` are the
    corresponding relative luminances after [_chromatic adaptation_](https://en.wikipedia.org/wiki/Chromatic_adaptation) from one white point to another.  Further details on such
    adaptation are outside the scope of this document, but see the examples. (See also E. Stone, "[sRGB luminance](https://ninedegreesbelow.com/photography/srgb-luminance.html)", 2013.)
- Applying the formula just given to _nonlinearized RGB_ colors results in a value more properly called _luma_, not luminance.<sup>[(13)](#Note13)</sup>

Examples follow for sRGB:

- **ITU BT.709** (`BT709(color)`): `(color[0] * 0.2126 + color[1] * 0.7152 + color[2] * 0.0722)` (sRGB Y values of red/green/blue<sup>[(2)](#Note2)</sup>).
- **sRGB with D50 white point**: `(color[0] * 0.2225 + color[1] * 0.7169 + color[2] * 0.0606)` (for interoperability with applications color-managed with ICC profiles).

In the sections that follow, the method **[`Luminance(color)`](#Relative_Luminance_Grayscale)** returns the relative luminance of the color `color`.

Applications of luminance include the following:
- **Grayscale.** A color, `color`, can be converted to grayscale by calculating `[Relative Luminance(color), Luminance(color), Luminance(color)]`.
- **Black and white.** Generate `[0, 0, 0]` (black) if `Luminance(color) < 0.5`, or `[1, 1, 1]` (white) otherwise.
- **Contrasting color.** A _contrasting color_ is a foreground (text) color with high contrast to the background color or vice versa.  For example, if [`Luminance(color)`](#Relative_Luminance_Grayscale) is 0.5 or less, select `[1, 1, 1]` (white) as a contrasting color; otherwise, select `[0, 0, 0]` (black) as a  contrasting color.
    - **Note:** In the [Web Content Accessibility Guidelines 2.0](https://www.w3.org/TR/2008/REC-WCAG20-20081211/#visual-audio-contrast-contrast), the _contrast ratio_ of two colors is `(RelLum(brighter) + 0.05) / (RelLum(darker) + 0.05)`, where `RelLum(color)` is the relative luminance of a color, as defined in the guidelines<sup>[(4)](#Note4)</sup>; `brighter` is the color with higher `RelLum`; and `darker` is the other color.  In general, under those guidelines, a _contrasting color_ is one whose contrast ratio with another color is 4.5 (or 7) or greater.

Finding the **average relative luminance of an image** or collection of colors is often equivalent to&mdash;
- adding all the relative luminances (`Luminance(color)`) of the colors in the image or collection, then
- dividing the result by the number of such colors.

<a id=Color_Schemes></a>
### Color Schemes

The following techniques generate new colors that are related to existing colors.

- **Color harmonies** result by generating several related colors, such as with the idiom `HslToRgb(HSVHue(color) + X, HSLSat(color), HSLLgt(color))`, where X is the following for each color:
    - **Analogous**: 0, Y, -Y, where Y is 2&pi;/3 or less. In general, _analogous colors_ are colors spaced at equal hue intervals from a central color.
    - **Complementary**: 0, &pi;.  This is the base hue with its opposite hue.
    - **Split complementary**: 0, &pi; - Y, &pi; + Y, where Y is greater than 0 and &pi;/2 or less.  The base hue and two hues close to the opposite hue.
    - **Triadic**: 0, 2&pi;/3, 4&pi;/3.  Base hue and the two hues at 120 degrees from that hue.
    - **Two-tone**: 0, Y, where Y is greater than -&pi;/2 and less than &pi;/2. This is the base hue and a close hue.
    - **Double complementary**: 0, Y, &pi;, &pi; + Y, where Y is -&pi;/2 or greater and &pi;/2 or less.  The base hue and a close hue, as well as their opposite hues.
- **Monochrome colors**: Colors with the same hue.  Examples of generating such colors include the following:
    - **Arbitrary monochrome colors**: Generate one or more `HsvToRgb(HSVHue(color), S, V)`, where `S` is an arbitrary HSV saturation and `V` is an arbitrary HSV brightness.
    - **HSL "Lightness" Adjustments**: Generate one or more `HslToRgb(HSVHue(color), HSLSat(color), L)`, where `L` is an arbitrary HSL "lightness" (less than 0.5 results in a color closer to black, and greater than 0.5 results in a color closer to white).
    - **HSL "Saturation" Adjustments**: Generate one or more `HslToRgb(HSVHue(color), S, HSLLgt(color))`, where `S` is an arbitrary  HSL "saturation".
    - **HSV Brightness Adjustments**: Generate one or more `HsvToRgb(HSVHue(color), HSVSat(color), V)`, where `V` is an arbitrary  HSV brightness.
    - **HSV Saturation Adjustments**: Generate one or more `HsvToRgb(HSVHue(color), S, HSVVal(color))`, where `S` is an arbitrary  HSV saturation.

<a id=Color_Matrices></a>
### Color Matrices

A _color matrix_ is a 9-item (3x3) list for transforming colors.  As used in this document, an RGB color (`color`)
is transformed with a color matrix (`matrix`) as follows:

    newColor = Clamp3([
       color[0]*matrix[0]+color[1]*matrix[1]+color[2]*matrix[2],
       color[0]*matrix[3]+color[1]*matrix[4]+color[2]*matrix[5],
       color[0]*matrix[6]+color[1]*matrix[7]+color[2]*matrix[8]
    ], [0,0,0], [1,1,1])

Examples of matrices include:

- **Sepia**: `[0.393, 0.769, 0.189, 0.349, 0.686, 0.168, 0.272, 0.534, 0.131]`.
- **Saturate**: `[s+(1-s)*r, (1-s)*g, (1-s)*b, (1-s)*r, s+(1-s)*g,(1-s)*b,(1-s)*r,(1-s)*g,s+(1-s)*b]`, where `s` is
 a saturation factor (0 for totally saturated and 1 for totally unsaturated), and `r`, `g`, and `b` are as defined in the section "[Relative Luminance (Grayscale)](#Relative_Luminance_Grayscale)"
 (the source recommends different values for `r`, `g`, and `b` <sup>[(8)](#Note8)</sup>).
- **Hue rotate**: `[-0.37124*sr + 0.7874*cr + 0.2126,  -0.49629*sr - 0.7152*cr + 0.7152, 0.86753*sr - 0.0722*cr + 0.0722, 0.20611*sr - 0.2126*cr + 0.2126, 0.08106*sr + 0.2848*cr + 0.7152, -0.28717*sr - 0.072199*cr + 0.0722, -0.94859*sr - 0.2126*cr + 0.2126, 0.65841*sr - 0.7152*cr + 0.7152, 0.29018*sr + 0.9278*cr + 0.0722]`, where `sr = sin(rotation)`, `cr = cos(rotation)`, and `rotation` is the hue rotation angle in radians.<sup>[(8)](#Note8)</sup>

<a id=Blending_and_Alpha_Compositing></a>
### Blending and Alpha Compositing

**General alpha blend**: To get a blend of two colors, generate `Lerp3(color1, color2, alpha)`, where `color1` and `color2` are the two colors, and `alpha` is the _alpha component_ being 0 or greater and 1 or less (0 means equal to `color1` and 1 means equal to `color2`).
- Shading is equivalent to alpha blending one color with black `[0, 0, 0]`.
- Tinting is equivalent to alpha blending one color with white `[1, 1, 1]`.
- Averaging two colors is equivalent to alpha blending with `alpha` set to 0.5.
- Converting an RGBA color to an RGB color on white is equivalent to `Lerp3([color[0], color[1], color[2]], [1, 1, 1], color[3])`.
- Converting an RGBA color to an RGB color over `color2`, another RGB color, is equivalent to `Lerp3([color[0], color[1], color[2]], color2, color[3])`.

**Porter&ndash;Duff Formulas**: Porter and Duff (1984) define twelve formulas for combining (compositing) two RGBA colors. In the formulas below, it is assumed that the two colors are in the 0-1 format and have been premultiplied (that is, their red, green, and blue components have been multiplied beforehand by their alpha component).  Given `src`, the source RGBA color, and `dst`, the destination RGBA color, the Porter&ndash;Duff formulas are as follows.
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

**Blend Modes**: [Blend modes](https://en.wikipedia.org/wiki/Blend_modes) take a source color and destination color and blend them to create a new color.  The same blend mode, or different blend modes, can be applied to each component of a given color.  In the idioms below, `src` is one component of the source color, `dst` is the same component of the destination color (for example, `src` and `dst` can both be two RGB colors' red components), and both components are assumed to be 0 or greater and 1 or less.  The following are examples of blend modes.

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

<a id=Miscellaneous></a>
### Miscellaneous

- **Invert (negative)**: Generate `[1.0 - color[0], 1.0 - color[1], 1.0 - color[2]]`, where `color` is the given color.<sup>[(12)](#Note12)</sup>
- **Colorize**: Given a desired `color` and a source color `srcColor`, generate
 `[color[0]*Luminance(srcColor), color[1]*Luminance(srcColor), color[2]*Luminance(srcColor)]`.
- **Swap blue and red channels**: Generate `[color[2], color[1], color[0]]`.
- **Red channel**: Generate `[color[0], color[0], color[0]]`.
- **Green channel**: Generate `[color[1], color[1], color[1]]`.
- **Blue channel**: Generate `[color[2], color[2], color[2]]`.
- **Maximum**: Generate `[c, c, c]`, where `c` is `max(max(color[0], color[1]), color[2])`.
- **Minimum**: Generate `[c, c, c]`, where `c` is `min(min(color[0], color[1]), color[2])`.

**Note:** Image processing techniques that replace one color with another color (or some modified version of the original color), but only if the color meets certain requirements, techniques that include [_chroma key_](https://en.wikipedia.org/wiki/Chroma_key), are largely out of the scope of this document.

<a id=Color_Difference_and_Nearest_Colors></a>
## Color Difference and Nearest Colors

_Color difference_ algorithms are used to determine if two colors are similar.  The _nearest color_ algorithm is used, for example, to categorize colors or to reduce the number of colors used by an image.

In the pseudocode below:

- The method `NearestColorIndex` finds, for a given color (`color`), the index of the color nearest it in a given list (`list`) of colors.
- `COLORDIFF(color1, color2)` is a function that calculates a [_color difference_](https://en.wikipedia.org/wiki/Color_difference) between two colors, where the lower the number, the closer the two colors are.
- The method `NearestColorIndex` is independent of color model; however, both `color` and each color in `list` must be in the same color space.

The pseudocode follows.

    METHOD NearestColorIndex(color, list)
       if size(list) == 0: return error
       if size(list) == 1: return 0
       i = 0
       best = -1
       bestIndex = 0
       while i < size(list)
           dist = COLORDIFF(color, list[i])
           if i == 0 or dist < best
              best = dist
              bestIndex = i
           end
           i = i + 1
       end
       return bestIndex
    END METHOD

Finding the nearest color in the list then proceeds as in the following example:

    nearestColor = list[NearestColorIndex(color, list)]

There are many ways to implement `COLORDIFF`, the color difference.  One simple way is to use the Euclidean distance of the two colors, as shown in the following pseudocode.

    METHOD COLORDIFF(color1, color2)
       d1=color2[0] - color1[0]
       d2=color2[1] - color1[1]
       d3=color2[2] - color1[2]
       sqdist=d1*d1+d2*d2+d3*d3
       return sqrt(sqdist)
    END METHOD

Note that&mdash;
- the Euclidean distance can be used, for example, if the colors passed to `NearestColorIndex`&mdash;
    - are expressed in a [_linearized RGB_ color space](#sRGB_and_Linearized_RGB), or
    - are expressed in CIE _L\*a\*b\*_ or CIE _L\*u\*v\*_ (rather than in RGB), in which case the Euclidean distance method just given implements the 1976 _&Delta;E\*_ ("delta E") color difference method for the corresponding color model (for the _L\*a\*b\*_ _&Delta;E\*_ method, differences around 2.3 are just noticeable [Mahy et al., 1994]), and
- if Euclidean distances are merely being compared (so that, for example, two distances are not added or multiplied), then the square root operation can be omitted.

T. Riemersma suggests an algorithm for color difference to be applied to nonlinearized RGB colors in his article ["Colour metric"](https://www.compuphase.com/cmetric.htm) (section "A low-cost approximation").

<a id=Examples></a>
### Examples

Sorting colors into **color categories** is equivalent to&mdash;

- defining a list of _representative colors_ `repColors` (for example, representative colors for red, blue, black, white, and so on), then
- for each color (`color`) to be categorized, finding the nearest color to that color among the representative colors (for example, by calling `NearestColorIndex(color, repColors)`).

<a id=Generating_a_Random_Color></a>
## Generating a Random Color

The following techniques can be used to generate random RGB colors.

Note that for best results, these techniques need to use [_linearized RGB colors_](#sRGB_and_Linearized_RGB), unless noted otherwise.

- Generating a random color in the **8/8/8 format** is equivalent to calling `From888(RNDINT(16777215))`. This technique is independent of RGB color space.
- Generating a random string in the **HTML color format** is equivalent to generating a [random hexadecimal string](https://peteroupc.github.io/randomfunc.html#Creating_a_Random_Character_String) with length 6, then inserting the string "#" at the beginning of that string.
This technique is independent of RGB color space, but see the [note from earlier](#HTML_Color_Format).
- Generating a random color in the **0-1 format** is equivalent to generating `[RNDU01(), RNDU01(), RNDU01()]`.
- To generate a random **dark color**, either&mdash;
    - generate `color = [RNDU01(), RNDU01(), RNDU01()]` until [`Luminance(color)`](#Relative_Luminance_Grayscale) is less than a given threshold, e.g., 0.5, or
    - generate `color = [RNDU01() * maxComp, RNDU01() * maxComp, RNDU01() * maxComp]`, where `maxComp` is the
       maximum value of each color component, e.g., 0.5.
- To generate a random **light color**, either&mdash;
    - generate `color = [RNDU01(), RNDU01(), RNDU01()]` until [`Luminance(color)`](#Relative_Luminance_Grayscale) is greater than a given threshold, e.g., 0.5, or
    - generate `color = [minComp + RNDU01() * (1.0 - minComp), minComp + RNDU01() * (1.0 - minComp), minComp + RNDU01() * (1.0 - minComp)]`, where `minComp` is the minimum value of each color component, e.g., 0.5.
- One way to generate a random **pastel color** is to generate `color = [RNDU01(), RNDU01(), RNDU01()]` until [`Luminance(color)`](#Relative_Luminance_Grayscale) is greater than 0.75 and less than 0.9.
- To generate a **random color at or between two others** (`color1` and `color2`), generate `Lerp(color1, color2, RNDU01())`.
- To generate a **random shade** of a given color, generate `Lerp(color1, [0, 0, 0], RNDNUMRANGE(0.2, 1.0))`.
- To generate a **random tint** of a given color, generate `Lerp(color1, [1, 1, 1], RNDNUMRANGE(0.0, 0.9))`.
- To generate a **random monochrome color**, generate `HslToRgb(H, RNDU01(),RNDU01())`, where `H` is an arbitrary hue.
- **Random color sampling:** If colors are to be selected at random from a [color map](#Color_Maps), see [Choosing a Random Item from a List](https://peteroupc.github.io/randomfunc.html#Sampling_With_Replacement_Choosing_a_Random_Item_from_a_List) and [Choosing Several Unique Items](https://peteroupc.github.io/randomfunc.html#Sampling_Without_Replacement_Choosing_Several_Unique_Items), for example.
- **Similar random colors:** Generating a random color that's similar to another is equivalent to generating a random color (`color1`) until `COLORDIFF(color1, color2)` (defined [earlier](#Color_Difference_and_Nearest_Colors)) is less than a predetermined threshold, where `color2` is the color to compare.  For example, if a reddish color is to be generated, `color2` would have the linearized sRGB value (1.0, 0.0, 0.0), among other possibilities.
- **Data hashing:** A technique similar to generating random colors is to generate a color from arbitrary data (such as a sequence of bytes or a sequence of characters).  This can involve using a _hash function_ to convert the data to a _hash code_ (with at least 24 bits), then taking the lowest 24 bits of the hash code as an 8/8/8 RGB color.  Any such hash function should be designed such that&mdash;
    - every bit of the input affects every bit of the output without a clear preference for 0 or 1 (the so-called "avalanche" property), and
    - if the hashing implicates computer or information security, it is cost-prohibitive to find a second input with the same output as that of a given input or to find an unknown input that leads to a given output.

<a id=Dominant_Colors_of_an_Image></a>
## Dominant Colors of an Image

There are several methods of finding the kind or kinds of colors that appear most prominently in a collection of colors (including a raster image).

One simple way to do so (called _averaging_) is to&mdash;
- add all the RGB colors (or a sample of them) in the collection of colors (for RGB colors, adding two colors means adding each of their components individually), then
- divide the result by the number of pixels added this way.

Note that for best results, this technique needs to be carried out with [_linearized RGB colors_](#sRGB_and_Linearized_RGB).

A second, more complicated technique is called [_color quantization_](https://en.wikipedia.org/wiki/Color_quantization), where the collection of colors is reduced to a small set of colors (for example, ten to twenty).  The quantization algorithm is too complicated to discuss in the document. Again, for best results, color quantization needs to be carried out with [_linearized RGB colors_](#sRGB_and_Linearized_RGB).

A third technique is called _histogram binning_.  To find the dominant colors using this technique (which is independent of color model):

- Generate or furnish a list of colors that cover the space of colors well.  This is the _color palette_. A good example is the list of ["web-safe colors"](https://peteroupc.github.io/html3dutil/tutorial-colors.html#What_Do_Some_Colors_Look_Like).
- Create a list with as many zeros as the number of colors in the palette.  This is the _histogram_.
- For each color in the collection of colors, find the [nearest color](#Color_Difference_and_Nearest_Colors) in the color palette to that pixel's color, and add 1 to the nearest color's corresponding value in the histogram.
- Find the color or colors in the color palette with the highest histogram values, and return those colors as the dominant colors in the image.

For all three techniques, in the case of a raster image, an implementation can resize that image before proceeding to find its dominant colors.  Algorithms to resize or "resample" images are out of scope for this page, however.

**Notes:**

- Reducing the number of colors in an image usually involves finding that image's dominant colors and either&mdash;
    - applying a "nearest neighbor" approach (replacing that image's colors with their [nearest dominant colors](#Color_Difference_and_Nearest_Colors)), or
    - applying a ["dithering"](https://en.wikipedia.org/wiki/Dither) technique (especially to reduce undesirable color "banding" in certain cases), which is outside the scope of this document, however.
- Finding the number of _unique_ colors in an image is equivalent to storing those colors as keys in a hash table, then counting the number of keys stored this way. (How to implement hash tables is beyond the scope of this page.)

<a id=Color_Maps></a>
## Color Maps

A _color map_ (or _color palette_) is a list of colors (which are usually related). All the colors in a color map can be in any color space, but unless noted otherwise, a linearized RGB color space should be used rather than a nonlinearized RGB color space.

- To extract a **continuous color** from an `N`-color color map given a number 0 or greater and 1 or less (`value`)&mdash;
    - generate `index = (value * (N - 1)) - floor(value * (N - 1))`, then
    - generate `color = Lerp3(colormap[index], colormap[index+1], (value * (N - 1)) - index)`.
- To extract a **discrete color** from an `N`-color color map given a number 0 or greater and 1 or less (`value`),
   generate `color = colormap[floor(value * (N - 1) + 0.5)]`.
- The **grayscale color map** consists of the nonlinearized sRGB colors `[[0, 0, 0], [0.5, 0.5, 0.5], [1, 1, 1]]`.
- The [_ColorBrewer 2.0_](http://colorbrewer2.org/) Web site contains many helpful suggestions for color maps.  The suggested color maps are designed above all to show discrete categories of data on land maps.

<a id=Named_Colors></a>
### Named Colors

If each color in a color map has a name associated with it, the color map is also called a _named color list_.  Examples of names are "red", "blue", and "orange".  It's outside the scope of this document to provide a survey of named color lists, but some of them are discussed in some detail in my [colors tutorial for the HTML 3D Library](https://peteroupc.github.io/html3dutil/tutorial-colors.html#What_Do_Some_Colors_Look_Like).  Although names are usually associated with RGB colors, the colors can be in any color space.

Converting a color (such as an RGB color) to a color name is equivalent to&mdash;
- retrieving the name keyed to that color in a hash table, or returning an error if that color doesn't exist in the hash table, or
- finding the [nearest color](#Color_Difference_and_Nearest_Colors) to that color among the named colors, and returning the color found this way (and/or that color's name).

Converting a color name to a color is equivalent to retrieving the color keyed to that name in a hash table, or returning an error if that name (or optionally, its lower-cased form) doesn't exist in the hash table.

**Note:** As used in the [CSS color module level 3](http://www.w3.org/TR/css3-color/), for example, named colors defined in that module are in the (nonlinearized) [_sRGB color space_](#sRGB_and_Linearized_RGB).

<a id=Visually_Distinct_Colors></a>
### Visually Distinct Colors

Color maps can list colors used to identify different items. Because of this
use, many applications need to use colors that are easily distinguishable by humans.  In this respect&mdash;

- K. Kelly (1965) proposed a list of "twenty two colors of maximum contrast"<sup>[(7)](#Note7)</sup>, the first nine of which
  were intended for readers with normal and defective color vision, and
- R. Boynton (1989) revealed a list of "eleven colors that are almost never confused", namely,
  black, white, gray, magenta, pink, red, green, blue, yellow, orange, and brown.

In general, more than 22 colors (the number of colors in Kelly's list) are hard to distinguish from each other.
Any application that needs to distinguish more than 22 items should use other means in addition to color
(or rather than color) to help users identify them. (Note that under the
[Web Content Accessibility Guidelines 2.0](https://www.w3.org/TR/2008/REC-WCAG20-20081211/),
color should generally not be the only means to call attention to information.)

In general, any method that seeks to choose colors that are maximally distant in a particular
color space (that is, where the smallest [color difference](#Color_Difference_and_Nearest_Colors), or `COLORDIFF`,
between them is maximized as much as feasible) can be used to select visually
distinct colors. Such colors can be pregenerated or generated at runtime. Here, the color difference method
should be _&Delta;E\*_ ("delta E") or another color difference method that takes human color perception into account.

<a id=Colors_as_Spectral_Functions></a>
## Colors as Spectral Functions

Colors can also be represented as functions that describe a distribution of radiation (such as light) across
the visible spectrum.  There are two cases of objects that provoke a color sensation by light:

- **Light sources.** A source of light is described by a _spectral power distribution_, a "curve" which describes the intensity of the source at each wavelength of the visible spectrum.  In 1931, the CIE published three _color matching functions_, which, when multiplied by a spectral power distribution and then integrated, give the three coordinates of the light's perceived color in the [XYZ color model](#CIE_XYZ).  Although spectral power distributions and color matching functions are continuous functions, in practice the "integration" is done by sampling at discrete wavelengths.
- **Reflective objects.** Most objects in nature merely reflect light, rather than being sources of light themselves.  The light they reflect can be described by a _reflectance curve_, which describes the fraction of light reflected at each wavelength of the visible spectrum.  Finding an object's perceived color requires knowing its reflectance curve, the light source's spectral power distribution, and the color matching functions in use.

In the pseudocode below:

- `REFL(wavelength)` is an arbitrary function returning&mdash;
   - the **object's reflectance** at `wavelength` (the reflectance is 0 or greater and, with the exception of fluorescent objects, 1 or less, and the wavelength is in nanometers [nm]), or
   - the number 1 at every wavelength, if a reflective object is not being modeled.
- `LIGHT(wavelength)` is an arbitrary function returning the **relative spectral power of the light source** at `wavelength` (the wavelength is in nm).
- `CMF(wavelength)` is an arbitrary function returning a three-item list containing the X, Y, and Z components, respectively, of the **color matching functions** at `wavelength` (the wavelength is in nm).
- `SpectrumToXYZ` computes, in XYZ form, the color perceived from a reflective object or a light source.
- `SpectrumTosRGB` computes, in nonlinearized sRGB, the perceived color of the light source or reflective object.
- `WavelengthTosRGB` computes, in nonlinearized sRGB, the perceived color of a light source that emits light only at the wavelength `wavelength`.

There are various choices for the `LIGHT` and `CMF` functions.  Popular choices include the D65 _illuminant_ (a theoretical light source) and the CIE 1931 (2-degree) standard observer, respectively.  Both are used in the [sRGB color space](#sRGB_and_Linearized_RGB), and for both, the CIE publishes [tabulated data](http://www.cie.co.at/index.php/LEFTMENUE/index.php?i_ca_id=298) at its Web site.  The CIE 1931 standard observer can also be approximated using the methods given in [Wyman, Sloan, and Shirley 2013](http://jcgt.org/published/0002/02/01/).

Note that for purposes of color reproduction, only wavelengths within the range 360-830 nm (0.36-0.83 &mu;m) are relevant in practice.

    METHOD SpectrumToXYZ()
        i = 360 # Start of visible spectrum
        xyz=[0,0,0]
        weight = 0
        while i <= 830 # End of visible spectrum
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
        xyz[0] = xyz[0] / weight
        xyz[1] = xyz[1] / weight
        xyz[2] = xyz[2] / weight
        return xyz
    END METHOD

    METHOD WavelengthTosRGB(wavelength)
        return XYZTosRGB(CMF(wavelength))
    END METHOD

    METHOD SpectrumTosRGB()
        return XYZTosRGB(SpectrumToXYZ())
    END METHOD

<a id=Color_Temperature></a>
### Color Temperature

Another choice for `LIGHT` is the formula for finding the spectral power of a blackbody (an idealized object that emits light based only on its temperature).  Such a formula is useful for converting **color temperature** to RGB colors.  The formula follows, where `TEMP` is the blackbody's temperature in kelvins (source: J. Walker, "[Colour Rendering of Spectra](http://www.fourmilab.ch/documents/specrend/)"):

    METHOD LIGHT(wavelength)
        meters = wavelength*pow(10, -9)
        num = 3.74183*pow(10, -16)*pow(meters, -5)
        return num / (exp(0.014388/(meters*TEMP)) - 1)
    END METHOD

The following method (`XYZToCCT`) computes an approximate color temperature, in kelvins, from an
[XYZ color](#CIE_XYZ). Because of the limited perceived color range of light emitted by blackbodies (namely red, orange, pale yellow, white, or sky blue), the color temperature found by
this formula is often called _correlated color temperature_ (CCT).  The formula given here is based on
the one found in McCamy 1992.

    METHOD XYZToCCT(xyz)
        sum = xyz[0] + xyz[1] + xyz[2]
        // Adjust sum to avoid division by 0
        if sum == 0: sum = 0.00001
        x = xyz[0] / sum
        y = xyz[1] / sum
        // NOTE: `x` and `y` (and optionally `z = 1 - x - y`)
        // define the _chromaticity_ of an XYZ color
        // (`x=y=z=0` actually has undefined chromaticity,
        // but in such a case, the sum is changed to nonzero
        // here for convenience).
        c = (x - 0.3320) / (0.1858 - y)
        return ((449*c+3525)*c+6823.3)*c+5520.33
    END METHOD

<a id=Color_Mixture></a>
## Color Mixture

In general, mixing colors in a similar way to mixing paint is not as simple as
averaging two colors in an RGB color space or another color space.  In a [Web article](http://scottburns.us/subtractive-color-mixture/), Scott A. Burns (who uses the term _subtractive color mixture_ for this kind of mixing) indicates that two pigments or colors
can be mixed this way by&mdash;

- finding the [_reflectance curves_](#Colors_as_Spectral_Functions) of the pigments or colors,
- generating a mixed reflectance curve by the _weighted geometric mean_ of the source curves, which
  takes into account the relative proportions of the colors or pigments in the mixture, and
- converting the mixed reflectance curve to an RGB color.

Finding a representative reflectance curve for an arbitrary RGB color can be done, for example, by the method described in [Smits 1999](http://www.cs.utah.edu/~bes/papers/color/) or the method described in [Burns 2015](http://scottburns.us/reflectance-curves-from-srgb/).

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

<a id=Other_Color_Topics></a>
## Other Color Topics

This section discusses miscellaneous topics related to colors.

<a id=Colorblindness></a>
### Colorblindness

What is generally known as ["colorblindness"](https://en.wikipedia.org/wiki/Color_blindness) results from a lack of one or more kinds of cones in the retina of each eye and affects a small portion of people, usually males.

Each human retina usually has three kinds of cones (L, M, and S), and eyes sense different colors by the relative degree to which all three kinds of cones respond to a light stimulus.  Usually, at least two of these three kinds of cones will respond to light this way.  The most common forms of colorblindness, _protanopia_ and _deuteranopia_, result from a lack of the L or M cones, respectively, so that for a person with either condition, colors where the S and M or S and L cones, respectively, respond similarly (usually magenta-red and green-cyan hues) are harder to distinguish.

However, "effective luminance contrast [that is, [color contrast](#Relative_Luminance_Grayscale)] can generally be computed without regard to specific color deficiency, except for the use of predominantly long wavelength colors [such as magenta and red] against darker colors ... for [people with] protanopia" (see "[Understanding WCAG 2.0](https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html)").

<a id=Terminal_Colors></a>
### Terminal Colors

Some command-line shells support coloring the background or foreground of text.  In shells that support [ANSI color codes](https://en.wikipedia.org/wiki/ANSI_escape_code) (generally in the category "select graphic rendition", or SGR), the sequence U+001B (escape character) followed by "[" followed by a semicolon-separated sequence of numbers (given below) followed by "m" is a graphic control sequence:

- "0": Reset the foreground and background color and other graphic properties to default.  (U+001B followed by "[m" has the same effect.)
- "1": Set the color of the following text in bold.
- "2": Use a slightly dimmer foreground color than usual.
- "3": Set the color of the following text in italics.
- "4": Set the color of the following text underlined.
- "7": Reverse the meaning of "foreground" and "background" in the following text.
- "8": Hide text while still taking up space.
- "21", "22", "23", "24", "27", "28": Turns off the feature mentioned earlier in "1", "2", "3", "4", "7", or "8", respectively.
- "3" followed by one of the _color numbers_ below: Dimmer foreground color.
- "4" followed by color number: Dimmer background color.
- "9" followed by color number: Brighter foreground color.
- "10" followed by color number: Brighter background color.

The _color number_ is one of the following, whose RGB color value can vary with the implementation: "0" (black), "1" (red), "2" (green), "3" (yellow), "4" (blue), "5" (magenta), "6" (cyan), or "7" (white).  Note that not all shells support all the ANSI SGR codes given here.

<a id=Conclusion></a>
## Conclusion

This page discussed many topics on color that are generally relevant in programming.

Feel free to send comments. They may help improve this page.  In particular, corrections to any method given on
this page are welcome.

I acknowledge&mdash;
- the CodeProject user Mike-MadBadger, who suggested additional clarification on color spaces and color models,
- Elle Stone, and
- Thomas Mansencal.

<a id=Notes></a>
## Notes
<small>
 <sup id=Note1>(1)</sup> The base-16 digits, in order, are 0 through 9, followed by A through F. The digits A to F can be uppercase or lowercase.

<sup id=Note2>(2)</sup> RGB working spaces other than sRGB (such as Adobe RGB and NTSC), as well as how to convert between RGB working spaces, are not discussed in detail in this document.  B. Lindbloom, "[RGB Working Space Information](http://www.brucelindbloom.com/index.html?WorkingSpaceInfo.html)", contains further information on RGB working spaces.

<sup id=Note3>(3)</sup> J. Novak, in "[What every coder should know about gamma](http://blog.johnnovak.net/2016/09/21/what-every-coder-should-know-about-gamma/)", uses the terms _physically linear_ and _perceptually linear_ to refer to what are called _linearized_ and _nonlinearized_ RGB color spaces, respectively, in this document.

<sup id=Note4>(4)</sup> For nonlinearized sRGB 8/8/8 colors this is effectively equivalent to `BT709(LinearFromsRGB3(From888(color)))`.  Note that the guidelines use a different version of `LinearFromsRGB`, with 0.03928 (the value used in the sRGB proposal) rather than 0.04045, but this difference doesn't affect the result for such 8/8/8 colors.  `RelLum(color)` is equivalent to [`Luminance(color)`](#Relative_Luminance_Grayscale) whenever conformance to the guidelines is not important.  The guidelines use "relative luminance" rather than "luminance" because "[Web content does not emit light itself](https://www.w3.org/TR/UNDERSTANDING-WCAG20/visual-audio-contrast-contrast.html)".  (In fact, relative luminance, as used in this document, is ultimately relative to a reference white point, rather than being expressed in absolute units such as candelas per square meter.)

<sup id=Note5>(5)</sup> A very rough approximation of an RGB color (`color`) to a CMYK color involves generating `k = Min(1.0 - color[0], 1.0 - color[1], 1.0 - color[2])`, then generating `[0, 0, 0, 1]` if `k` is 1, or `[((1.0 - color[0]) - k) / (1 - k), ((1.0 - color[2]) - k) / (1 - k), ((1.0 - color[2]) - k) / (1 - k), k]` otherwise.  A very rough approximation of a CMYK color (`color`) to an RGB color involves generating `[(1 - color[0]) * ik, (1 - color[1]) * ik, (1 - color[2]) * ik]`, where `ik = 1 - color[3]`.

<sup id=Note6>(6)</sup> A [Working Draft](http://www.w3.org/TR/2016/WD-css-color-4-20160705/#hex-notation) of the CSS Color Module Level 4 mentions two additional formats, namely&mdash;

- an 8-digit format, consisting of "#" followed by two base-16 digits each for the red, green, blue, and alpha components, respectively, and
- a 4-digit format, consisting of "#" followed by one base-16 digit each for the red, green, blue, and alpha components, respectively (where, for example, "#345F" is the same as "#334455FF" in the 8-digit format).

<sup id=Note7>(7)</sup> An approximation of the colors to nonlinearized sRGB, in order, is (in HTML color format): "#F0F0F1", "#181818", "#F7C100", "#875392", "#F78000", "#9EC9EF", "#C0002D", "#C2B280", "#838382", "#008D4B", "#E68DAB", "#0067A8", "#F99178", "#5E4B97", "#FBA200", "#B43E6B", "#DDD200", "#892610", "#8DB600", "#65421B", "#E4531B", "#263A21". The list was generated by converting the Munsell renotations (and a similar renotation for black) to sRGB using the Python `colour-science` package.

<sup id=Note8>(8)</sup> P. Haeberli, ["Matrix Operations for Image Processing"](http://www.graficaobscura.com/matrix/index.html), 1993.  The hue rotation matrix given was generated using the technique in the section "Hue Rotation While Preserving Luminance", with constants rounded to five significant digits and with `rwgt=0.2126`, `gwgt=0.7152`, and `bwgt = 0.0722`, the sRGB capital-Y values for the red, green, and blue points.

<sup id=Note9>(9)</sup> Other methods that have been used for approximating relative luminance (and which don't really yield "relative luminance" as used here) include&mdash;

- using the average (`(color[0]+color[1]+color[2])/3.0`), minimum, or maximum of the three color components (as shown on [T. Helland's site](http://www.tannerhelland.com/3643/grayscale-image-algorithm-vb6/), for example),
- using the [HSL](#HSL) "lightness" (for the latter, see J. Cook, ["Converting color to grayscale"](https://www.johndcook.com/blog/2009/08/24/algorithms-convert-color-grayscale/)), and
- using one of the three color components (also as seen on T. Helland's site).

<sup id=Note10>(10)</sup> Although most electronic color displays used three dots per pixel (red, green, and blue), this may hardly be the case today.  Nowadays, recent electronic displays are likely to use four dots per pixel (red, green, blue, and white, or RGBW), and color spaces following the _RGBW color model_ describe, at least in theory, the intensity those four dots should have in order to reproduce a given color.  Such color spaces, though, are not yet of practical interest to most programmers outside of display hardware and display driver development.

<sup id=Note11>(11)</sup> Although the _L\*a\*b\*_ color model is also often called "perceptually uniform", it wasn't designed that way, according to [B. Lindbloom](http://www.brucelindbloom.com/index.html?UPLab.html).

<sup id=Note12>(12)</sup> This is often called the "CMY" (cyan-magenta-yellow) version of the RGB color (although the resulting color is not necessarily a proportion of cyan, magenta, and yellow inks; see also "[CMYK](#CMYK)").  If such an operation is used, the conversions between "CMY" and RGB are exactly the same.

<sup id=Note13>(13)</sup> See C. Poynton, ["_YUV_ and _luminance_ considered harmful"](http://poynton.ca/PDFs/YUV_and_luminance_harmful.pdf).

<sup id=Note14>(14)</sup> The prime symbol appears near Y because the conversion from RGB usually involves [nonlinearized RGB colors](#sRGB_and_Linearized_RGB), so that Y&prime; will be similar to luminance, but not the same as luminance (Y).  See C. Poynton, ["_YUV_ and _luminance_ considered harmful"](http://poynton.ca/PDFs/YUV_and_luminance_harmful.pdf).

</small>

<a id=License></a>
## License
This page is licensed under [Creative Commons Zero](https://creativecommons.org/publicdomain/zero/1.0/).
