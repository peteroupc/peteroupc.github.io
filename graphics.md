# Graphics and Music Challenges for Classic Computer Applications

The following are three challenges I make to the computer community, relating to:

- [**Graphics for retro-style game development**](#Graphics_Challenge_for_Retro_Style_Games).
- [**MIDI music synthesis for retro-style games and apps**](#Building_a_Public_Domain_music_synthesis_library_and_instrument_banks).
- [**Tileable wallpapers with limited colors and resolution**](https://github.com/peteroupc/classic-wallpaper).

All three serve to arouse nostalgia among 1990s computer users.

<a id=Graphics_Challenge_for_Retro_Style_Games></a>

## Graphics Challenge for Retro Style Games

An interesting challenge for game developers, relating to designing games with classic graphics that run on an exceptional variety of modern and recent computers.

Define the _larger screen dimension_ as the larger of the screen width and the screen height.

Limit 3D graphics to the following:

1. The maximum number of polygons that can be displayed at a time is equal to screen width times screen height divided by 24.[^1] \(An example is 256 &times; 192 / 24 = 2048.)
    * A polygon is either a triangle, a convex quadrilateral, or a line segment.
    * Each vertex of the polygon must point to a vertex from the vertex list described below.
    * Each polygon can be translucent and/or wireframed.

2. The maximum number of vertices that can be used at a time is 3 times the maximum number of polygons.
    * A vertex consists of an XYZ position, an XY texture coordinate, and a red&ndash;green&ndash;blue vertex color.
    * For each color, the red component is 5 bits, the green, 5 bits, and the blue, 5 bits.

3. Textures must have the same color format as vertex colors, or may employ a 4-, 16-, or 256-color palette with that color format.  Texture rendering supports flips and repeats on either or both axes.  The width and height of each texture must be a power of 2.  A texture's maximum width and maximum height, in pixels, are each equal to 256 or the larger screen dimension, whichever is smaller.
4. Depth tests, clear colors, and fog colors are supported.
5. The 3D graphics buffer's resolution is the same as the screen resolution.

Polygons may, but need not, undergo perspective-correct rendering.

Limit 2D graphics to the following:

1. Up to three tile-based 2D layers can be displayed at a time.  If 3D graphics are not being displayed, a fourth tile-based 2D layer can also be displayed.  Otherwise, a layer for the 3D graphics can be displayed.
2. There are sixteen palettes of 16 colors each (using the color format for vertex colors).
3. Each tile is 8 &times; 8 pixels and uses the colors of one of the sixteen palettes just described.
4. The 2D and 3D layers may contain transparent pixels.
5. One of the 2D layers can undergo a 2D affine transformation.
6. Separate from layers, 2D sprites can be displayed.  The maximum number of sprites that may be displayed at a time is equal to 1/2 the larger screen dimension. Each sprite may be tile-based or bitmap-based and has a maximum pixel width and maximum pixel height each equal to 1/4 the larger screen dimension.  Sprites may contain transparent pixels.

Music:

- Standard MIDI files (SMF) only.  The files should be rendered using a cross-platform open-source software synthesizer (see next section), using either FM or wavetable synthesis.[^2]  As much as possible, instruments should match their meanings in the General MIDI System level 1.

Other Notes:

- The 3D graphics layer, if any, can be alpha blended with the 2D graphics layers in any order.
- A game may limit the amount of graphics memory (akin to VRAM) to a certain maximum size in kibibytes.  One example is the screen width times screen height divided by 24.  This does not limit the size or number of graphics assets a game can have.
- For classic games released in the 1990s, the number of pixels rendered per second (screen width times screen height times frames per second) is usually a small number, no more than 10 million.  For example, if the game runs at a 256 &times; 192 screen resolution (256 pixels wide by 192 pixels high) at up to 60 frames per second, that makes 256 &times; 192 &times; 60 = 2,949,120 pixels per second.[^3]
- Screen resolutions that have been used in classic games include 256 &times; 192, 640 &times; 480, 320 &times; 200, 320 &times; 240, 256 &times; 224, 240 &times; 160, 640 &times; 350, 640 &times; 400, 640 &times; 200, 400 &times; 300, 512 &times; 352, 512 &times; 384, and 160 &times; 120.  Classic games tended to aim for a frame rate of 30, 40, or 60 frames per second.

These limitations were inspired by the graphics limitations of classic handheld game consoles.

A game may impose further resource limits to the specifications given here (for example, to reduce the maximum number of 3D polygons, to disallow polygons, or to reduce the number of colors per tile allowed).  I would be interested in knowing about these limitations that a new game that adopts this document decides to impose.  I would also be interested in learning about a free and open-source graphics library that implements this specification.[^4]

<a id=Building_a_Public_Domain_music_synthesis_library_and_instrument_banks></a>

## Building a Public-Domain music synthesis library and instrument banks

To improve support for MIDI (Musical Instrument Digital Interface) music playback in open-source and other applications, I challenge the community to write the following items, all of which must be released to the public domain or under the Unlicense.

- A cross-platform open-source library for _software_ synthesis of MIDI data stored in standard MIDI files (SMF, .mid), using instrument sound banks in SoundFont 2 (.sf2), Downloadable Sounds (.dls), and in OPL2, OPL3, and other FM synthesis sound banks, and possibly also in Timidity++/UltraSound patch format (.cfg, .pat). (Similar to _Fluidsynth_, but in the public domain or under the Unlicense. Instrument sound banks are files that describe how to render MIDI instruments as sound.  In addition, the source code in the nonpublic-domain _foo\_midi_, _libADLMIDI_, _libOPNMIDI_, and _OPL3BankEditor_ may be useful here, but review their licenses first.)
    - The library should support popular loop-point conventions found in MIDI files.
    - The library should support seeking of MIDI files such that a pause and resume function can be offered by a media player.
- An instrument sound bank for wavetable synthesis of all instruments and drum noises in the General MIDI System level 1 specification.
    - Instruments should correspond as closely as possible to those in that specification, but should be small in file size or be algorithmically generated.
    - Instruments can be generated using the public-domain single-cycle wave forms found in the AdventureKid Wave Form collection, found at: [**AKWF-FREE**](https://github.com/KristofferKarlAxelEkstrand/AKWF-FREE).
    - The samples for each instrument are preferably generated by an algorithm, such as one that renders the instrument's tone in the frequency domain.  An example of this is found in [**`com.sun.media.sound.EmergencySoundbank`**](https://github.com/apple/openjdk/blob/xcodejdk14-release/src/java.desktop/share/classes/com/sun/media/sound/EmergencySoundbank.java), which however is licensed under the GNU General Public License version 2 rather than public domain.
    - The instrument sound bank should be in either SoundFont 2 (.sf2) or Downloadable Sounds (.dls) format. [^5]
    - The volume of all instruments in the sound bank should be normalized; some instruments should not sound louder than others.
- An instrument sound bank for FM synthesis of all instruments and drum noises in the General MIDI System level 1 specification. Instruments should correspond as closely as possible to those in that specification.

<a id=Classic_Wallpaper_Challenge></a>

## Classic Wallpaper Challenge

See the "[**peteroupc/classic-wallpaper**](https://github.com/peteroupc/classic-wallpaper)" repository for a challenge on creating tileable desktop wallpapers with a limited palette of colors and a limited pixel size &mdash; such wallpapers are getting ever harder to find because desktop backgrounds today tend to cover the full computer screen, to employ thousands of colors, and to have a high-definition resolution (1920 &times; 1080 or larger).

<a id=License></a>

## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).

----------------

[^2]: I note that it's possible to write an FM software synthesizer supporting every MIDI instrument in less than 1024 kibibytes of code.

[^3]: Especially if the library is self-contained and implements the specification with as little source code as possible.  It would not be within the spirit of this document to, say, display more polygons or vertices at a time than the maximum allowed using programming tricks, but any such tricks should not be hardware-accelerated.  An example of a 2D library that follows the spirit of this specification, even though it doesn't necessarily meet its requirements exactly, is called [**_Tilengine_**](https://github.com/megamarc/Tilengine).

[^4]: A sound bank of decent quality in either format is about 4 million bytes in size.  Making these banks would be easier if there were a guide on producing decent-quality instrument banks from the recordings of real musical instruments (rather than copying or converting other instrument banks or recording from commercial synthesizers).

[^1]: The _Multimedia PC Specification_ (1992) recommended that video cards be able to transfer up to 8-bit-per-pixel graphics at a rate of 140,000 pixels per second or faster given 40 percent of CPU bandwidth.  The Multimedia PC level 2 specification (1993) upped this recommendation to 1.2 million pixels per second (sufficient for 320 &times; 240 video at 15 frames per second, the recommendation in article Q139826, "AVI Authoring Tips & Compression Options Dialog Box", 1995).  For details on these specifications, see article Q106055 in the Microsoft Knowledge Base.  Both recommendations are far from the 6.144 million pixels per second needed to display 640 &times; 480 pixel video smoothly at 20 frames per second.

[^5]: As Ron Fosner wrote in early 1999: "A typical scene in a current [PC] application has 2000 to 2500 triangles per frame".  R. Fosner, "DirectX 6.0 Goes Ballistic With Multiple New Features And Much Faster Code", _Microsoft Systems Journal_ January 1999.
