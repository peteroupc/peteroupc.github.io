# This Python script helps generate interesting variations on desktop
# wallpapers based on existing image files.
#
# This script is released to the public domain; in case that is not possible, the
# file is also licensed under Creative Commons Zero (CC0).
#
# NOTE: Animation of tiled patterns composed from a wallpaper
# image can be implemented by shifting, with each frame, the starting
# position for drawing the top left corner of the wallpaper pattern
# (e.g., from the top left corner of the image
# to some other position in the image).
#
# NOTE: In Windows, if both an 8x8 monochrome pattern and a centered wallpaper
# are set as the desktop background, both the pattern and the wallpaper
# will be drawn on the desktop, the latter appearing above the former.
#
# NOTE: I would welcome it if readers could contribute computer code (released
# to the public domain or under Creative Commons Zero) to generate tileable—
# - noise,
# - procedural textures or patterns, or
# - arrangements of symbols or small images with partial transparency,
# without artificial intelligence, with a limited color palette and a small
# resolution, as long as the resulting images do not employ
# trademarks and are suitable for all ages.  For details on the color and
# resolution options as well as a broader challenge to generate tileable
# classic wallpapers, see:
#
# https://github.com/peteroupc/classic-wallpaper
#

import shlex
import os
import math

def websafecolors():
    colors = []
    for r in range(6):
        for g in range(6):
            for b in range(6):
                colors.append([r * 51, g * 51, b * 51])
    return colors

def egacolors():
    # 64 colors displayable by EGA displays
    colors = []
    for r in range(4):
        for g in range(4):
            for b in range(4):
                colors.append([r * 85, g * 85, b * 85])
    return colors

def cgacolors():
    # Canonical 16-color CGA palette
    # see also: https://int10h.org/blog/2022/06/ibm-5153-color-true-cga-palette/
    return [
        [0, 0, 0],
        [0, 0, 170],
        [0, 170, 0],
        [0, 170, 170],
        [170, 0, 0],
        [170, 0, 170],
        [170, 85, 0],  # [170, 170, 0] is another variant, given
        # that exact color values for CGA's 16 colors
        # are unstandardized beyond the notion of 'RGBI'.
        [170, 170, 170],
        [85, 85, 85],
        [85, 85, 255],
        [85, 255, 85],
        [85, 255, 255],
        [255, 85, 85],
        [255, 85, 255],
        [255, 255, 85],
        [255, 255, 255],
    ]

def classiccolors():
    # 16-color VGA palette
    return [
        [0, 0, 0],
        [128, 128, 128],
        [255, 255, 255],
        [192, 192, 192],
        [255, 0, 0],
        [128, 0, 0],
        [0, 255, 0],
        [0, 128, 0],
        [0, 0, 255],
        [0, 0, 128],
        [255, 0, 255],
        [128, 0, 128],
        [0, 255, 255],
        [0, 128, 128],
        [255, 255, 0],
        [128, 128, 0],
    ]

def tileable():
    return "\\( +clone -flip \\) -append \\( +clone -flop \\) +append"

def _isqrtceil(i):
    r = math.isqrt(i)
    return r if r * r == i else r + 1

# Returns an ImageMagick filter string to generate a desktop background from an image, in three steps.
# 1. If rgb1 and rgb2 are not nil, converts the input image to grayscale, then translates the grayscale
# palette to a gradient starting at rgb1 for black ( a 3-item array of the red,
# green, and blue components in that order; e.g., [2,10,255] where each
# component is from 0 through 255) and ending at rgb2 for white (same format as rgb1).
# Raises an error if rgb1 or rgb2 has a length less than 3.
# The output image is the input for the next step.
# 2. If hue is not 0, performs a hue shift, in degrees (-180 to 180), of the input image.
# The output image is the input for the next step.
# 3. If basecolors is not nil, performs a dithering operation on the input image; that is, it
# reduces the number of colors of the image to those given in 'basecolors', which is a list
# of colors (each color is of the same format as rgb1 and rgb2),
# and scatters the remaining colors in the image so that they appear close to the original colors.
# Raises an error if 'basecolors' has a length greater than 256.
# 'abstractImage' indicates that the image to apply the filter to
# is abstract or geometric (as opposed to photographic).  Default is False.
def magickgradientditherfilter(
    rgb1=None, rgb2=None, basecolors=None, hue=0, abstractImage=False
):
    if hue < -180 or hue > 180:
        raise ValueError
    if rgb1 and len(rgb1) < 3:
        raise ValueError
    if rgb2 and len(rgb2) < 3:
        raise ValueError
    if basecolors:
        if len(basecolors) > 256:
            raise ValueError
        for k in basecolors:
            if (not k) or len(k) < 3:
                raise ValueError
    huemod = (hue + 180) * 100.0 / 180.0
    hueshift = "" if hue == 0 else ("-modulate 100,100,%.02f" % (huemod))
    mgradient = None
    if rgb1 != None and rgb2 != None:
        r1 = "#%02x%02x%02x" % (int(rgb1[0]), int(rgb1[1]), int(rgb1[2]))
        r2 = "#%02x%02x%02x" % (int(rgb2[0]), int(rgb2[1]), int(rgb2[2]))
        mgradient = (
            "\\( +clone -grayscale Rec709Luma \\) \\( -size 1x256 gradient:%s-%s \\) -delete 0 -clut"
            % (r1, r2)
        )
    else:
        mgradient = ""
    if basecolors and len(basecolors) > 0:
        bases = ["xc:#%02X%02X%02X" % (k[0], k[1], k[2]) for k in basecolors]
        # ImageMagick command to generate the palette image
        image = "-size 1x1 " + (" ".join(bases)) + " +append -write mpr:z +delete"
        # Apply Floyd-Steinberg error diffusion dither.
        # NOTE: For abstractImage = True, ImageMagick's ordered 8x8 dithering
        # algorithm ("-ordered-dither 8x8") is by default a per-channel monochrome
        # (2-level) dither, not a true color dithering approach that takes much
        # account of the color palette.
        # As a result, for example, dithering a grayscale image with the algorithm will
        # lead to an image with only black and white pixels, even if the palette contains,
        # say, ten shades of gray.  The number after "8x8" is the number of color levels
        # per color channel in the ordered dither algorithm, and this number is taken
        # as the square root of the palette size, rounded up, minus 1, but not less
        # than 2.
        ditherkind = (
            "-ordered-dither 8x8,%d" % (min(2, _isqrtceil(len(basecolors)) - 1))
            if abstractImage
            else "-dither FloydSteinberg"
        )
        return "%s %s \\( %s \\) %s -remap mpr:z" % (
            mgradient,
            hueshift,
            image,
            ditherkind,
        )
    else:
        return "%s %s" % (mgradient, hueshift)

def solid(bg=[192, 192, 192], w=64, h=64):
    if bg == None or len(bg) < 3:
        raise ValueError
    bc = "#%02x%02x%02x" % (int(bg[0]), int(bg[1]), int(bg[2]))
    return "-size %dx%d xc:%s" % (w, h, bg)

def hautrelief(bg=[192, 192, 192], highlight=[255, 255, 255], shadow=[0, 0, 0]):
    if bg == None or len(bg) < 3:
        raise ValueError
    if highlight == None or len(highlight) < 3:
        raise ValueError
    if shadow == None or len(shadow) < 3:
        raise ValueError
    bc = "#%02x%02x%02x" % (int(bg[0]), int(bg[1]), int(bg[2]))
    hc = "#%02x%02x%02x" % (int(highlight[0]), int(highlight[1]), int(highlight[2]))
    sc = "#%02x%02x%02x" % (int(shadow[0]), int(shadow[1]), int(shadow[2]))
    return (
        "-grayscale Rec709Luma -channel RGB -threshold 50%% -write mpr:z "
        + '\\( -clone 0 -morphology Convolve "3:0,0,0 0,0,0 0,0,1" -write mpr:z1 \\) '
        + '\\( -clone 0 -morphology Convolve "3:1,0,0 0,0,0 0,0,0" -write mpr:z2 \\) -delete 0 '
        + "-compose Multiply -composite "
        + "\\( mpr:z1 mpr:z2 -compose Screen -composite -negate \\) -compose Plus -composite "
        + "\\( -size 1x1 xc:black xc:%s +append \\) -clut -write mpr:a1 -delete 0 "
        + 'mpr:z1 \\( mpr:z -negate -morphology Convolve "3:1,0,0 0,0,0 0,0,0" \\) -compose Multiply -composite '
        + "\\( -size 1x1 xc:black xc:%s +append \\) -clut -write mpr:a2 -delete 0 "
        + '\\( mpr:z -negate -morphology Convolve "3:0,0,0 0,0,0 0,0,1" \\) mpr:z2 -compose Multiply -composite '
        + "\\( -size 1x1 xc:black xc:%s +append \\) -clut mpr:a2 -compose Plus -composite mpr:a1 -compose Plus -composite"
    ) % (bc, hc, sc)

def emboss():
    # Emboss a two-color black and white image into a 3-color (black/gray/white) image
    return (
        "\\( +clone \\( +clone \\) -append \\( +clone \\) +append -crop 50%x50%+1+1 \\( "
        + "-size 1x2 gradient:#FFFFFF-#808080 \\) -clut \\) -compose Multiply -composite"
    )

def basrelief(bg=[192, 192, 192], highlight=[255, 255, 255], shadow=[0, 0, 0]):
    if bg == None or len(bg) < 3:
        raise ValueError
    if highlight == None or len(highlight) < 3:
        raise ValueError
    if shadow == None or len(shadow) < 3:
        raise ValueError
    bc = "#%02x%02x%02x" % (int(bg[0]), int(bg[1]), int(bg[2]))
    hc = "#%02x%02x%02x" % (int(highlight[0]), int(highlight[1]), int(highlight[2]))
    sc = "#%02x%02x%02x" % (int(shadow[0]), int(shadow[1]), int(shadow[2]))
    return (
        "-grayscale Rec709Luma -channel RGB -threshold 50%% -write mpr:z "
        + '\\( -clone 0 -morphology Convolve "3:0,0,0 0,0,0 0,0,1" -write mpr:z1 \\) '
        + '\\( -clone 0 -morphology Convolve "3:1,0,0 0,0,0 0,0,0" -write mpr:z2 \\) -delete 0--1 '
        + "mpr:z2 \\( mpr:z -negate \\) -compose Multiply -composite -write mpr:a10 "
        + "\\( -size 1x1 xc:black xc:%s +append \\) -clut -write mpr:a2 -delete 0 "
        + "\\( mpr:z -negate \\) mpr:z1 -compose Multiply -composite -write mpr:a20 "
        + "\\( -size 1x1 xc:black xc:%s +append \\) -clut -write mpr:a1 -delete 0 "
        + "mpr:a10 mpr:a20 -compose Plus -composite -negate "
        + "\\( -size 1x1 xc:black xc:%s +append \\) -clut mpr:a2 -compose Plus -composite "
        + "mpr:a1 -compose Plus -composite"
    ) % (sc, hc, bc)

def magickgradientditherfilterrandom():
    rgb1 = None
    rgb2 = None
    hue = 0
    basecolors = None
    while rgb1 == None and rgb2 == None and hue == 0 and basecolors == None:
        if random.randint(0, 99) == 1:
            return magickgradientditherfilter()
        rgb1 = None
        rgb2 = None
        hue = 0
        basecolors = None
        if random.randint(0, 9) < 6:
            rgb1 = [0, 0, 0]
            rgb2 = [
                random.randint(0, 255),
                random.randint(0, 255),
                random.randint(0, 255),
            ]
        if random.randint(0, 9) < 3:
            hue = random.randint(0, 50) - 180
        r = random.randint(0, 9)
        if r < 3:
            basecolors = classiccolors()
        elif r < 6:
            basecolors = websafecolors()
        elif r < 8 and rgb1 != None:
            basecolors = [rgb1, rgb2]
    return magickgradientditherfilter(rgb1, rgb2, basecolors, hue=hue)

def horizhatch(f, hatchspace=8):
    size = hatchspace * 4
    fd = open(f, "wb")
    fd.write(bytes("P6\n%d %d\n255\n" % (size, size), "utf-8"))
    for y in range(size):
        b = 0 if y % hatchspace == 0 else 255
        fd.write(bytes([b for i in range(size * 3)]))
    fd.close()

def crosshatch(f, hhatchspace=8, vhatchspace=8):
    fd = open(f, "wb")
    width = vhatchspace * 4
    height = hhatchspace * 4
    fd.write(bytes("P6\n%d %d\n255\n" % (width, height), "utf-8"))
    for y in range(height * 4):
        if y % hhatchspace == 0:
            fd.write(bytes([0 for i in range(width * 3)]))
        else:
            fd.write(
                bytes(
                    [
                        0 if (i // 3) % vhatchspace == 0 else 255
                        for i in range(width * 3)
                    ]
                )
            )
    fd.close()

def verthatch(f, hatchspace=8):
    size = hatchspace * 4
    fd = open(f, "wb")
    fd.write(bytes("P6\n%d %d\n255\n" % (size, size), "utf-8"))
    for y in range(size):
        fd.write(
            bytes([0 if (i // 3) % hatchspace == 0 else 255 for i in range(size * 3)])
        )
    fd.close()

def diaggradient(f):
    size = 64
    fd = open(f, "wb")
    fd.write(bytes("P6\n%d %d\n255\n" % (size, size), "utf-8"))
    row = [0 for i in range(size * 3)]
    for y in range(size):
        for x in range(size):
            r = abs(x - (63 - y)) * 255 // (size - 1)
            row[x * 3] = r
            row[x * 3 + 1] = r
            row[x * 3 + 2] = r
        fd.write(bytes(row))
    fd.close()

# What follows are methods for generating scalable vector graphics (SVGs) of
# classic OS style borders and button controls.  Although the SVGs are scalable
# by definition, they are pixelated just as they would appear in classic OSs.
#
# NOTE: A more flexible approach for this kind of drawing
# is to prepare an SVG defining the frame of a user interface element
# with five different parts (in the form of 2D shapes): an "upper outer part", a
# "lower outer part", an "upper inner part", a "lower inner part", and a "middle part".
# Each of these five parts can be colored separately or filled with a pattern.

# helper for rectangle drawing
def _rect(x0, y0, x1, y1, c):
    if x0 >= x1 or y0 >= y1:
        return ""
    return "<path style='stroke:none;fill:%s' d='M%d %dL%d %dL%d %dL%d %dZ'/>" % (
        c,
        x0,
        y0,
        x1,
        y0,
        x1,
        y1,
        x0,
        y1,
    )

# helper for edge drawing (top left edge "dominates")
# hilt = upper part of edge, dksh = lower part of edge
def _drawedgetopdom(x0, y0, x1, y1, hilt, dksh=None, edgesize=1):
    if x1 - x0 < edgesize * 2 or y1 - y0 < edgesize * 2:  # too narrow and short
        return _drawedgebotdom(x0, y0, x1, y1, hilt, dksh, edgesize)
    return (
        _rect(x0, y0, x0 + edgesize, y1, hilt)  # left edge
        + _rect(x0 + edgesize, y0, x1, y0 + edgesize, hilt)  # top edge
        + _rect(x1 - edgesize, y0 + edgesize, x1, y1, dksh)  # right edge
        + _rect(x0 + edgesize, y1 - edgesize, x1 - edgesize, y1, dksh)  # bottom edge
    )

def _drawface(x0, y0, x1, y1, face, edgesize=1):
    if x1 - x0 < edgesize * 2 and y1 - y0 < edgesize * 2:  # too narrow and short
        return ""
    if x1 - x0 < edgesize * 2:  # too narrow
        return _rect(x0, y0 + edgesize, x1, y0 - edgesize, face)
    if y1 - y0 < edgesize * 2:  # too short
        return _rect(x0 + edgesize, y0, x1 - edgesize, y1, face)
    return _rect(x0 + edgesize, y0 + edgesize, x1 - edgesize, y1 - edgesize, face)

# helper for edge drawing (bottom right edge "dominates")
# hilt = upper part of edge, dksh = lower part of edge
def _drawedgebotdom(x0, y0, x1, y1, hilt, dksh=None, edgesize=1):
    if hilt and (dksh is None):
        dksh = hilt
    if dksh and (hilt is None):
        hilt = dksh
    if x1 - x0 < edgesize * 2 and y1 - y0 < edgesize * 2:  # too narrow and short
        return _rect(x0, y0, x1, y1, dksh)
    if x1 - x0 < edgesize * 2:  # too narrow
        return (
            _rect(x0, y0, x1, y0 + edgesize, hilt)
            + _rect(x0, y0 + edgesize, x1, y0 - edgesize, hilt)
            + _rect(x0, y1 - edgesize, x1, y1, dksh)
        )
    if y1 - y0 < edgesize * 2:  # too short
        return (
            _rect(x0, y0, x0 + edgesize, y1, dksh)
            + _rect(x0 + edgesize, y0, x1 - edgesize, y1, hilt)
            + _rect(x1 - edgesize, y0, x1, y1, dksh)
        )
    return (
        _rect(x0, y0, x0 + edgesize, y1 - edgesize, hilt)  # left edge
        + _rect(x0 + edgesize, y0, x1 - edgesize, y0 + edgesize, hilt)  # top edge
        + _rect(x1 - edgesize, y0, x1, y1, dksh)  # right edge
        + _rect(x0, y1 - edgesize, x1 - edgesize, y1, dksh)  # bottom edge
    )

# hilt = upper part of edge, dksh = lower part of edge
def _drawroundedge(x0, y0, x1, y1, hilt, dksh=None, edgesize=1):
    if hilt and (dksh is None):
        dksh = hilt
    if dksh and (hilt is None):
        hilt = dksh
    if x1 - x0 < edgesize * 2 and y1 - y0 < edgesize * 2:  # too narrow and short
        return ""
    if x1 - x0 < edgesize * 2:  # too narrow
        return _rect(x0, y0 + edgesize, x1, y0 - edgesize, hilt)
    if y1 - y0 < edgesize * 2:  # too short
        return _rect(x0 + edgesize, y0, x1 - edgesize, y1, hilt)
    return (
        _rect(x0, y0 + edgesize, x0 + edgesize, y1 - edgesize, hilt)  # left edge
        + _rect(x0 + edgesize, y0, x1 - edgesize, y0 + edgesize, hilt)  # top edge
        + _rect(
            x1 - edgesize,
            y0 + edgesize,
            x1,
            y1 - edgesize,
            hilt if dksh is None else dksh,
        )  # right edge
        + _rect(
            x0 + edgesize,
            y1 - edgesize,
            x1 - edgesize,
            y1,
            hilt if dksh is None else dksh,
        )  # bottom edge
    )

def _drawinnerface(x0, y0, x1, y1, face):
    edgesize = 1
    return _drawface(
        x0 + edgesize,
        y0 + edgesize,
        x1 - edgesize,
        y1 - edgesize,
        face,
        edgesize=edgesize,
    )

# highlight color, light color, shadow color, dark shadow color
def drawraisedouter(x0, y0, x1, y1, hilt, lt, sh, dksh):
    return _drawedgebotdom(x0, y0, x1, y1, lt, dksh)

def drawraisedinner(x0, y0, x1, y1, hilt, lt, sh, dksh):
    edgesize = 1
    return _drawedgebotdom(
        x0 + edgesize,
        y0 + edgesize,
        x1 - edgesize,
        y1 - edgesize,
        hilt,  # draw the "upper part" with this color
        sh,  # draw the "lower part" with this color
        edgesize=edgesize,
    )

def drawsunkenouter(x0, y0, x1, y1, hilt, lt, sh, dksh):
    return _drawedgebotdom(x0, y0, x1, y1, sh, hilt)

def drawsunkeninner(x0, y0, x1, y1, hilt, lt, sh, dksh):
    edgesize = 1
    return _drawedgebotdom(
        x0 + edgesize,
        y0 + edgesize,
        x1 - edgesize,
        y1 - edgesize,
        dksh,  # draw the "upper part" with this color
        lt,  # draw the "lower part" with this color
        edgesize=edgesize,
    )

# button edges (also known as "soft" edges)
def drawraisedouterbutton(x0, y0, x1, y1, hilt, lt, sh, dksh):
    return _drawedgebotdom(x0, y0, x1, y1, hilt, dksh)

def drawraisedinnerbutton(x0, y0, x1, y1, hilt, lt, sh, dksh):
    edgesize = 1
    return _drawedgebotdom(
        x0 + edgesize,
        y0 + edgesize,
        x1 - edgesize,
        y1 - edgesize,
        lt,  # draw the "upper part" with this color
        sh,  # draw the "lower part" with this color
        edgesize=edgesize,
    )

def drawsunkenouterbutton(x0, y0, x1, y1, hilt, lt, sh, dksh):
    return _drawedgebotdom(x0, y0, x1, y1, dksh, hilt)

def drawsunkeninnerbutton(x0, y0, x1, y1, hilt, lt, sh, dksh):
    edgesize = 1
    return _drawedgebotdom(
        x0 + edgesize,
        y0 + edgesize,
        x1 - edgesize,
        y1 - edgesize,
        sh,  # draw the "upper part" with this color
        lt,  # draw the "lower part" with this color
        edgesize=edgesize,
    )

def monoborder(  # "Monochrome" flat border
    x0,
    y0,
    x1,
    y1,
    clientAreaColor,  # draw the inner and middle parts with this color
    windowFrameColor,  # draw the outer parts with this color
):
    return (
        drawraisedouter(  # upper and lower outer parts
            x0,
            y0,
            x1,
            y1,
            windowFrameColor,
            windowFrameColor,
            windowFrameColor,
            windowFrameColor,
        )
        + drawraisedinner(  # upper and lower inner parts
            x0,
            y0,
            x1,
            y1,
            clientAreaColor,
            clientAreaColor,
            clientAreaColor,
            clientAreaColor,
        )
        + _drawinnerface(  # middle
            x0,
            y0,
            x1,
            y1,
            clientAreaColor,
            clientAreaColor,
            clientAreaColor,
            clientAreaColor,
        )
    )

def flatborder(  # Flat border
    x0,
    y0,
    x1,
    y1,
    sh,  # draw the outer parts with this color
    buttonFace,  # draw the inner and middle parts with this color
):
    return (
        drawraisedouter(x0, y0, x1, y1, sh, sh, sh, sh)
        + drawraisedinner(
            x0, y0, x1, y1, buttonFace, buttonFace, buttonFace, buttonFace
        )
        + _drawinnerface(x0, y0, x1, y1, buttonFace, buttonFace, buttonFace, buttonFace)
    )

def windowborder(
    x0,
    y0,
    x1,
    y1,
    hilt,  # highlight color
    lt,  # light color
    sh,  # shadow color
    dksh,  # dark shadow color
    face=None,  # face color
):
    face = face if face else lt
    return (
        drawraisedouter(x0, y0, x1, y1, hilt, lt, sh, dksh)
        + drawraisedinner(x0, y0, x1, y1, hilt, lt, sh, dksh)
        + _drawinnerface(x0, y0, x1, y1, face)
    )

def buttonup(
    x0,
    y0,
    x1,
    y1,
    hilt,
    lt,
    sh,
    dksh,
    face=None,
):
    face = face if face else lt
    return (
        drawraisedouterbutton(x0, y0, x1, y1, hilt, lt, sh, dksh)
        + drawraisedinnerbutton(x0, y0, x1, y1, hilt, lt, sh, dksh)
        + _drawinnerface(x0, y0, x1, y1, face)
    )

def buttondown(
    x0,
    y0,
    x1,
    y1,
    hilt,
    lt,
    sh,
    dksh,
    face=None,
):
    face = face if face else lt
    return (
        drawsunkenouterbutton(x0, y0, x1, y1, hilt, lt, sh, dksh)
        + drawsunkeninnerbutton(x0, y0, x1, y1, hilt, lt, sh, dksh)
        + _drawinnerface(x0, y0, x1, y1, face)
    )

def fieldbox(
    x0,
    y0,
    x1,
    y1,
    hilt,
    lt,
    sh,
    dksh,
    face=None,  # Usually the textbox face color if unpressed, button face if pressed
    pressed=False,
):
    face = face if face else (lt if pressed else hilt)
    return (
        drawsunkenouter(x0, y0, x1, y1, hilt, lt, sh, dksh)
        + drawsunkeninner(x0, y0, x1, y1, hilt, lt, sh, dksh)
        + _drawinnerface(x0, y0, x1, y1, face)
    )

def wellborder(x0, y0, x1, y1, hilt, windowText):
    face = face if face else (lt if pressed else hilt)
    return (
        drawsunkenouter(x0, y0, x1, y1, hilt, hilt, hilt, hilt)
        + drawsunkeninner(
            x0, y0, x1, y1, windowText, windowText, windowText, windowText
        )
        + drawsunkenouter(
            x0 - 1,
            y0 - 1,
            x1 + 1,
            y1 + 1,
            windowText,
            windowText,
            windowText,
            windowText,
        )
    )

def groupingbox(
    x0,
    y0,
    x1,
    y1,
    hilt,
    lt,
    sh,
    dksh,
    face=None,
):
    face = face if face else lt
    return (
        drawsunkenouter(x0, y0, x1, y1, hilt, lt, sh, dksh)
        + drawraisedinner(x0, y0, x1, y1, hilt, lt, sh, dksh)
        + _drawinnerface(x0, y0, x1, y1, face)
    )

def statusfieldbox(
    x0,
    y0,
    x1,
    y1,
    hilt,
    lt,
    sh,
    dksh,
    face=None,
):
    face = face if face else lt
    return drawsunkenouter(x0, y0, x1, y1, hilt, lt, sh, dksh) + _drawinnerface(
        x0, y0, x1, y1, face
    )

def _drawrsedge(x0, y0, x1, y1, lt, sh, squareedge=False):
    if squareedge:
        return _drawedgebotdom(x0, y0, x1, y1, lt, sh)
    else:
        return _drawroundedge(x0, y0, x1, y1, lt, sh)

def _dither(face, hilt, hiltIsScrollbarColor=False):
    if hiltIsScrollbarColor:
        return _rect(0, 0, 2, 2, hilt)
    # if 256 or more colors and hilt is not white:
    #    return _rect(0, 0, 2, 2, mix(face, hilt))
    return (
        _rect(0, 0, 1, 1, hilt)
        + _rect(1, 1, 2, 2, hilt)
        + _rect(0, 1, 1, 2, face)
        + _rect(1, 0, 2, 1, face)
    )

# Generate SVG code for an 8x8 monochrome pattern.
# 'idstr' is a string identifying the pattern in SVG.
# 'pattern' is an 8-item array with integers in the interval [0,255].
# The first integer represents the first row, the second, the second row, etc.
# For each integer, the eight bits from most to least significant represent
# the column from left to right (right to left if 'msbfirst' is False).
# If a bit is set, the corresponding position
# in the pattern is filled with 'black'; if clear, with 'white'.
# 'black' is the black color (or pattern color), and 'white' is the white color
# (or user-selected background color).
# Either can be set to None to omit pixels of that color in the pattern
# 'msbfirst' is the bit order for each integer in 'pattern'.  If True,
# the Windows convention is used; if False, the X pixmap convention is used.
# 'originX' and 'originY' give the initial offset of the monochrome pattern, from
# the top left corner of the image.
def monopattern(
    idstr, pattern, black="black", white="white", msbfirst=True, originX=0, originY=0
):
    if pattern is None or len(pattern) < 8:
        raise ValueError
    if black is None and white is None:
        return ""
    ret = (
        "<pattern patternUnits='userSpaceOnUse' id='"
        + idstr
        + (
            "' width='8' height='8' patternTransform='translate(%d %d)'>"
            % (4 - originX, 4 - originY)
        )
    )
    bw = [white, black]
    for y in range(8):
        for x in range(8):
            c = (
                bw[(pattern[y] >> (7 - x)) & 1]
                if msbfirst
                else bw[(pattern[y] >> x) & 1]
            )
            if c is None:
                continue
            ret += _rect(x, y, x + 1, y + 1, c)
    return ret + "</pattern>"

def _ditherbg(idstr, face, hilt, hiltIsScrollbarColor=False):
    if hiltIsScrollbarColor:
        return hilt
    if "'" in idstr:
        raise ValueError
    if '"' in idstr:
        raise ValueError
    return (
        "<pattern patternUnits='userSpaceOnUse' id='"
        + idstr
        + "' width='2' height='2' patternTransform='translate(1 1)'>"
        + _dither(face, hilt, hiltIsScrollbarColor)
        + "</pattern>"
    )

def drawbutton(
    x0,
    y0,
    x1,
    y1,
    hilt,
    lt,
    sh,
    dksh,
    btn,  # button face color
    frame=None,  # optional frame color
    squareedge=True,
):
    edge = 0 if frame == None else 1
    return buttonup(
        x0 + edge, y0 + edge, x1 - edge, y1 - edge, hilt, lt, sh, dksh, btn
    ) + ("" if frame is None else _drawrsedge(x0, y0, x1, y1, frame, frame, squareedge))

def draw16buttonsquare(x0, y0, x1, y1, lt, sh, btn, frame=None, squareedge=True):
    return drawbutton(x0, y0, x1, y1, lt, btn, sh, sh, btn, frame, squareedge)

def draw16buttonfocus(
    x0,
    y0,
    x1,
    y1,
    lt,
    sh,
    btn,  # button face color
    frame=None,  # optional frame color
    squareframe=False,
):
    return draw16button(x0 + 1, y0 + 1, x1 - 1, y1 - 1, lt, sh, btn, None) + (
        ""
        if frame is None
        else _drawrsedge(x0, y0, x1, y1, frame, frame, squareframe)
        + _drawedgebotdom(x0 + 1, y0 + 1, x1 - 1, y1 - 1, frame, frame)
    )

def draw16buttonpush(
    x0,
    y0,
    x1,
    y1,
    lt,
    sh,
    btn,  # button face color
    frame=None,  # optional frame color
    squareframe=False,
):
    return (
        _drawedgetopdom(x0 + 2, y0 + 2, x1 - 2, y1 - 2, sh, btn)
        + _rect(x0 + 3, y0 + 3, x1 - 3, y1 - 3, btn)
        + (
            ""
            if frame is None
            else _drawrsedge(x0, y0, x1, y1, frame, frame, squareframe)
            + _drawedgebotdom(x0 + 1, y0 + 1, x1 - 1, y1 - 1, frame, frame)
        )
    )

def draw16button(
    x0,
    y0,
    x1,
    y1,
    lt,
    sh,
    btn,  # button face color
    frame=None,  # optional frame color
    squareframe=False,
):
    return (
        _drawedgebotdom(x0 + 1, y0 + 1, x1 - 1, y1 - 1, lt, sh)
        + _drawedgebotdom(x0 + 2, y0 + 2, x1 - 2, y1 - 2, lt, sh)
        + _rect(x0 + 3, y0 + 3, x1 - 3, y1 - 3, btn)
        + (
            ""
            if frame is None
            else _drawrsedge(x0, y0, x1, y1, frame, frame, squareframe)
        )
    )

def makesvg():
    width = 100
    height = 100
    hilt = "white"
    lt = "rgb(192,192,192)"
    sh = "rgb(128,128,128)"
    dksh = "black"
    face = "rgb(192,192,192)"
    face = "url(#ditherbg)"
    frame = None  # "black"
    return (
        "<svg width='%dpx' height='%dpx' viewBox='0 0 %d %d'"
        % (width, height, width, height)
        + " xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink'>"
        + monopattern(
            "ditherbg", [64, 192, 200, 120, 120, 72, 0, 0], "rgb(192,192,192)", hilt
        )
        # + _ditherbg("ditherbg", "rgb(192,192,192)", hilt)
        + windowborder(
            0 + 10, 0 + 10, width - 10, height - 10, hilt, lt, sh, dksh, face
        )
        + "</svg>"
    )
