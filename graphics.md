# Graphics and Music Challenges for Classic Computer Applications

The following are three challenges I make to the computer community, relating to:

- Graphics for retro-style game development.
- MIDI music synthesis for retro-style games and apps.
- Tileable wallpapers with limited colors and resolution.

All three serve to arouse nostalgia among 90s computer users.

<a id=Graphics_Challenge_for_Retro_Style_Games></a>

## Graphics Challenge for Retro Style Games

An interesting challenge for game developers.

Limit 3D graphics to the following:

1. No more than 2048 polygons can be displayed at a time.
    * A polygon is either a triangle, a convex quadrilateral, or a line segment.
    * Each vertex of the polygon must point to a vertex from the vertex list described below.
    * Each polygon can be translucent and/or wireframed.

2. Polygons undergo perspective-correct rendering.
3. The maximum number of vertices can be used at a time is 3 times the maximum number of polygons.
    * A vertex consists of an XYZ position, an XY texture coordinate, and an RGB vertex color.
    * For each color, the red component is 5 bits, the green, 5 bits, and the blue, 5 bits.

4. Textures must have the same color format as vertex colors, or may employ a 4-, 16-, or 256-color palette with that color format.  Texture rendering supports flips and repeats on either or both axes.  A texture's maximum image size is 192 kibibytes.
5. Depth tests, clear colors, and fog colors are supported.
6. The 3D graphics buffer's resolution is the same as the screen resolution.

Limit 2D graphics to the following:

1. Up to three tile-based 2D layers can be displayed at a time.  If 3D graphics are not being displayed, a fourth tile-based 2D layer can also be displayed.  Otherwise, a layer for the 3D graphics can be displayed.
2. There are sixteen palettes of 16 colors each (using the color format for vertex colors).
3. Each tile is 8&times;8 pixels and uses the colors of one of the sixteen palettes just described.
4. The 2D and 3D layers may contain transparent parts.
5. One of the 2D layers can undergo a 2D affine transformation.
6. Separate from layers, 2D sprites can be displayed.  No more than 128 sprites may be displayed at a time. Each sprite may be tile-based or bitmap-based and must have a width and height of no more than 64 pixels each.  Sprites may contain transparent parts.

General:

- The 3D graphics layer, if any, can be alpha blended with the 2D graphics layers in any order.
- 256&times;192 screen resolution with up to 60 frames per second, or 256&times;384 screen resolution with up to 30 frames per second.
- A game may limit the amount of graphics memory (akin to VRAM) to a certain maximum size, say, 2048 kibibytes.  This does not limit the size or number of graphics assets a game can have.
- Music:  Standard MIDI files (SMF) only.  The files should be rendered using a cross-platform open-source software synthesizer (see next section), using either FM or wavetable synthesis.[^1]  As much as possible, instruments should match their meanings in the General MIDI System level 1.

A game might use a different resolution than shown.  In that case, the maximum allowed number of polygons and vertices and the maximum texture size, sprite size, and sprite count, as well as the maximum graphics memory size, if any, will change in proportion to the new resolution. (For example, if the resolution is 640&times;480 with up to 60 frames per second, these maximums are multiplied by 6.25 = (640&times;480) / (256&times;192).  Other resolutions used in classic games include 320&times;200, 320&times;240, 640&times;350, and 512&times;384.)

These limitations were inspired by the graphics limitations of classic handheld game consoles.

A game may impose further resource limits to the specifications given here (for example, to reduce the maximum number of 3D polygons, to disallow polygons, or to reduce the number of colors per tile allowed).  I would be interested in knowing about these limitations that a new game that adopts this document decides to impose.  I would also be interested in learning about a free and open-source graphics library that implements this specification.[^2]

<a id=Building_a_Public_Domain_music_synthesis_library_and_instrument_banks></a>

## Building a Public-Domain music synthesis library and instrument banks

To improve support for MIDI (Musical Instrument Digital Interface) music playback in open-source and other applications, I challenge the community to write the following items, all of which must be released to the public domain (Creative Commons Zero).

- A cross-platform open-source library for _software_ synthesis of MIDI data stored in standard MIDI files (SMF, .mid), using instrument sound banks in SoundFont 2 (.sf2), downloadable sounds (.dls), and in OPL2, OPL3, and other FM synthesis sound banks, and possibly also in Timidity++/UltraSound patch format (.cfg, .pat).  (Similar to _Fluidsynth_, but in the public domain.  In addition, the source code in the non-public-domain _libADLMIDI_, _libOPNMIDI_, and _OPL3BankEditor_ may be useful here.)
    - The library should support popular loop-point conventions found in MIDI files.
    - The library should support seeking of MIDI files such that a pause and resume function can be offered by a media player.
- An instrument sound bank for wavetable synthesis of all instruments and drum noises in the General MIDI System level 1 specification.
    - Instruments should correspond as closely as possible to those in that specification, but should be small in file size or be algorithmically generated.
    - Instruments can be generated using the public-domain single-cycle wave forms found in the AdventureKid Wave Form collection, found at: [**AKWF-FREE**](https://github.com/KristofferKarlAxelEkstrand/AKWF-FREE).
    - The samples for each instrument are preferably generated by an algorithm, such as one that renders the instrument's tone in the frequency domain.  An example of this is found in [**`com.sun.media.sound.EmergencySoundbank`**](https://github.com/apple/openjdk/blob/xcodejdk14-release/src/java.desktop/share/classes/com/sun/media/sound/EmergencySoundbank.java), which however is licensed under the GNU General Public License version 2 rather than public domain (Creative Commons Zero).
    - The instrument sound bank should be in either SoundFont 2 (.sf2) or downloadable sounds (.dls) format.
        - A sound bank of decent quality in either format is about 4 million bytes in size.
    - The volume of all instruments in the sound bank should be normalized; some instruments should not sound louder than others.
- An instrument sound bank for FM synthesis of all instruments and drum noises in the General MIDI System level 1 specification. Instruments should correspond as closely as possible to those in that specification.

<a id=Classic_Wallpaper_Challenge></a>

## Classic Wallpaper Challenge

Given that desktop backgrounds today tend to cover the full computer screen, to employ thousands of colors, and to have a high-definition resolution (1920&times;1080 or larger), rendering tileable backgrounds with limited colors and pixel size ever harder to find, I make the following challenge.

Create a tileable desktop wallpaper image meeting the following requirements.

- The image employs one of the following color options:
    - Two colors only.
        - Such as black and white, which allows for hue shifting to, say, a black-to-red or gray-to-blue palette.
    - Three tints: black, gray (128, 128, 128), white.
        - Allows for hue shifting to, say, a black-to-red palette.
    - Four tints: black, gray (128, 128, 128), light gray (192, 192, 192), white.
        - Allows for hue shifting to, say, a black-to-red palette.
    - 16-color [**canonical CGA palette**](https://int10h.org/blog/2022/06/ibm-5153-color-true-cga-palette/) (each color component is 85 or 255; or each color component is 0 or 170, except (170, 85, 0) instead of (170, 170, 0)).[^3]
    - 16-color VGA palette (light gray; or each color component is 0 or 255; or each color component is 0 or 128).[^3]
    - Up to four colors from the VGA palette.
    - Up to four colors from the canonical CGA palette.
    - Up to eight colors from the VGA palette.
    - 216-color "web safe" palette (each color component is a multiple of 51).[^3]
    - 216-color "web safe" palette plus VGA palette.[^3]
    - The 64 colors displayable by EGA monitors (each color component is 0, 85, 170, or 255).[^3]
    - Up to 16 colors from the "web safe" palette.
    - Up to 16 colors from the "web safe" and VGA palettes.
    - Up to 16 colors from those displayable by EGA monitors (each color component is 0, 85, 170, or 255).
    - 5- to 64-color grayscale palette (all color components the same).
    - Not preferred: Up to 16 colors from those displayable by pure VGA monitors (each color component modulo 4 is 0).
    - Not preferred: 65- to 236-color grayscale palette (all color components the same).
    - Not preferred: 237- to 256-color grayscale palette (all color components the same).
- The image employs one of the following pixel dimension options:
    - Preferred: 8&times;8, 16&times;16, 32&times;32, 64&times;64, 64&times;32, 32&times;64, 96&times;96, 128&times;128, 256&times;256.
    - Not preferred: 320&times;240, 320&times;200.
    - Not preferred: Custom size up to 96&times;96.
    - Not preferred: Custom size up to 256&times;256.
- The image is preferably abstract, should not employ trademarks, and is suitable for all ages.
- The image is in the public domain or licensed under Creative Commons Zero or Attribution or, less preferably, another open-source license.
- The image was not produced by artificial intelligence tools or with their help.

Also welcome would be computer code (released to the public domain or under Creative Commons Zero) to generate tileable&mdash;

- noise,
- procedural textures or patterns, or
- arrangements of symbols or small images with partial transparency,

meeting the requirements given above.

<a id=License></a>

## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).

----------------

[^1]: I note that it's possible to write an FM software synthesizer supporting every MIDI instrument in less than 1024 kibibytes of code.

[^2]: Especially if the library is self-contained and implements the specification with as little source code as possible.  It would not be within the spirit of this document to, say, display more polygons or vertices at a time than the maximum allowed using programming tricks, but any such tricks should not be hardware-accelerated.  An example of a 2D library that follows the spirit of this specification, even though it doesn't necessarily meet its requirements exactly, is called [**_Tilengine_**](https://github.com/megamarc/Tilengine).

[^3]: Tileable wallpapers employing more than 256 colors are acceptable, though not preferable, if they otherwise meet all requirements here, since they can be reduced to this color palette using known techniques for color dithering.
