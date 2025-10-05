# Graphics and Music Challenges for Classic Computer Applications

The following are three challenges I make to the computer community, relating to:

- [**Graphics for classic-style game development**](#Graphics_Challenge_for_Retro_Style_Games).
- [**MIDI music synthesis for classic-style games and apps**](#Building_a_Public_Domain_music_synthesis_library_and_instrument_banks).
- [**Tileable wallpapers with limited colors and resolution**](https://github.com/peteroupc/classic-wallpaper).

All three serve to arouse nostalgia among 1990s computer users.

<a id=Graphics_Challenge_for_Classic_Style_Games></a>

## Graphics Challenge for Classic-Style Games

An interesting challenge for game developers, relating to designing games with classic graphics that run on an exceptional variety of modern and recent computers.

Classic graphics here means two- or three-dimensional graphics achieved by video games from 1999 or earlier, before the _shader model_ of 3-D graphics programming became mainstream among game software.

Most desktop and laptop computers from 2010 on, and most smartphones from 2016 on, can render even high-quality classic graphics using only software &mdash; without relying on specialized video cards &mdash; at screen resolutions typically targeted by late-1990s games.[^1]

The specification in this challenge sets an _upper bound_ on the kind of computer graphics that are of interest.  Further constraints to graphics computation (such as memory, resource, color, resolution, or polygon limits) are highly encouraged.

-------

Define the _larger screen dimension_ as the larger of the screen width and the screen height.

Limit 3D graphics to the following:

1. The maximum number of polygons that can be displayed at a time is equal to screen width times screen height divided by 24.[^2] \(Examples: 256 &times; 192 / 24 = 2048 polygons; 640 &times; 480 / 24 = 12800 polygons.)
    * A polygon is either a triangle, a convex quadrilateral, or a line segment.
    * Each vertex of the polygon must point to a vertex from the vertex list described later.
    * Each polygon can be translucent and/or wireframed.

2. The maximum number of vertices that can be used at a time is 3 times the maximum number of polygons.
    * A vertex consists of an XYZ position, an XY texture coordinate, and a red&ndash;green&ndash;blue vertex color.
    * For each color, the red component is 5 bits, the green, 5 bits, and the blue, 5 bits.

3. Textures must have the same color format as vertex colors, or may employ a 4-, 16-, or 256-color palette with that color format.  Texture rendering supports flips and repeats on either or both axes.  The width and height of each texture must be a power of 2.  A texture's maximum width and maximum height, in pixels, are each equal to 256 or the larger screen dimension, whichever is smaller.
4. Depth buffers, clear colors, and fog colors are supported.
5. The 3D graphics buffer's resolution is the same as the screen resolution.

Polygons should undergo perspective-correct texture mapping, but affine mapping may be implemented instead.[^3]

Limit 2D graphics to the following: [^4]

1. Up to three 2D layers can be displayed at a time.  If 3D graphics are not being displayed, a fourth 2D layer can also be displayed.  Otherwise, a layer for the 3D graphics can be displayed.  Each 2D layer is a rectangular array of references to _tiles_ (a _tile_ is a small rectangular array of pixels).
2. There are sixteen palettes of 16 colors each (using the color format for vertex colors).
3. The tiles have the same size (32 &times; 32 pixels or smaller) and each tile uses the colors of one of the sixteen palettes just described.  A tile size of 8 &times; 8 pixels is suggested.
4. The 2D and 3D layers may contain transparent pixels.
5. Up to two of the 2D layers can undergo a 2D affine transformation.
6. Separate from layers, 2D sprites can be displayed.  The maximum number of sprites that may be displayed at a time is equal to 1/2 the larger screen dimension. Each sprite is a rectangular array of either tiles or pixels and has a maximum pixel width and maximum pixel height each equal to 1/4 the larger screen dimension.  Sprites may contain transparent pixels, but not translucent (semitransparent) pixels.

The 3D graphics layer, if any, can be alpha blended with the 2D graphics layers in any order. [^5]

Screen resolution:

- Screen resolutions that have been used in classic games include:
    - Video graphics array (VGA) display modes: 640 &times; 480, 320 &times; 240,[^6] 320 &times; 200.[^7]
    - 4 &times; 3 aspect ratio: 640 &times; 480, 512 &times; 384,[^8] 400 &times; 300, 320 &times; 240,[^6] 256 &times; 192,[^9] 160 &times; 120.
    - 16 &times; 9 aspect ratio: 640 &times; 360, 320 &times; 180, 512 &times; 288, and 256 &times; 144.
    - Game console aspect ratios: 640 &times; 448, 352 &times; 240, 320 &times; 224,[^10] 256 &times; 224,[^11] 256 &times; 240,[^12] 240 &times; 160,[^13] 160 &times; 144.[^14]
    - PAL home computer aspect ratios: 320 &times; 256,[^15] 640 &times; 512, 360 &times; 288.
    - Monochrome graphics: 720 &times; 348,[^16] 640 &times; 200,[^17] 512 &times; 342.
    - Extended Graphics Adapter aspect ratio: 640 &times; 350.
    - Vertical arcade systems: 320 &times; 224.
    - 8 &times; 5 aspect ratio: 640 &times; 400[^18], 320 &times; 200.[^7]
    - Other: 512 &times; 352, 416 &times; 240, 280 &times; 192,[^19] 480 &times; 272,[^20] 512 &times; 424, [^21] 400 &times; 240,[^22] 384 &times; 224.[^23]

    More demanding games in the late 1990s aimed for 800 &times; 600 resolution, but any screen resolution greater than 307,200 total pixels (640 &times; 480) is not within the spirit of this challenge.

Frame rate:

- Any frame rate is allowed.  But classic games for desktop or laptop computers tended to aim for a frame rate of 30, 40, or 60 frames per second, and game consoles for TVs were designed for the TV's usual refresh rate (about 60 frames per second for NTSC and about 50 for PAL).

Memory:

- This specification does not impose a limit on graphics memory use (akin to the video memory, or VRAM, of a video card).  One suggested example, given in kibibytes of graphics memory, is the screen width times screen height divided by 24. (A kibibyte is 1024 bytes.) Imposing a limit on graphics memory use does not limit the size or number of textures, 3-D models, or other graphics files a game can have.[^24]

Music:

- Standard MIDI files (SMF) only.  The files should be rendered using a cross-platform open-source software synthesizer (see next section), using either FM or wavetable synthesis.[^25]  As much as possible, instruments should match their meanings in the General MIDI System level 1.

Other Notes:

- For classic games released in the 1990s, the number of pixels rendered per second (screen width times screen height times frames per second) is usually a small number, no more than 10 million.  For example, if the game runs at a 256 &times; 192 screen resolution (256 pixels wide by 192 pixels high) at up to 60 frames per second, that makes 256 &times; 192 &times; 60 = 2,949,120 pixels per second.[^26]
- Matt Saettler, "Graphics Design and Optimization", Multimedia Technical Note (Microsoft), 1992, contains a rich  discussion of graphics used in classic multimedia and game applications. [^27]

These limitations were inspired by the graphics limitations of&mdash;

- PC games in the mid- to late 1990s,[^28]
- home computers released before 1995,
- game consoles (handheld and for TVs) released before 2000, and
- the Game Boy Advance, Nintendo DS, and Nintendo 3DS, all of which were released after 2000 but have relatively meager graphics capability.

------------

A game may impose further resource limits to the specifications given here (for example, to reduce the maximum number of 3D polygons, to disallow polygons, to reduce the number of colors per tile allowed, or [**reduce to a limited set the colors**](https://github.com/peteroupc/classic-wallpaper?tab=readme-ov-file#color-palettes) ultimately displayed on screen).  I would be interested in knowing about these limitations that a new game that adopts this document decides to impose.  I would also be interested in learning about a free and open-source graphics library that implements this specification.[^29]  Examples of optional constraints are the following:

- The game is limited to the 16 colors of the so-called _VGA palette_ (light gray, that is, (192, 192, 192); or each color component is 0 or 255; or each color component is 0 or 128).
- All game files can be packaged in a ZIP file or Win32 program file that takes no more than&mdash;
    - 1,457,664 bytes (the capacity of a file-allocation-table (FAT) formatted high-density 3.5-inch floppy disk), or
    - 1,213,952 bytes (the capacity of a FAT formatted high-density 5.25-inch floppy disk), or
    - 730,112 bytes (the capacity of a FAT formatted normal-density 3.5-inch floppy disk), or
    - 362,496 bytes (the capacity of a FAT formatted "360K" 5.25-inch floppy disk), or
    - 681 million bytes (slightly less than the maximum capacity of a formatted CD-ROM).
- The game uses no more than 16 million bytes of system memory at a time.
- The game's graphics are rendered in software.  That is, the rendering does not rely on a video card, a graphics accelerator chip, or the operating system’s graphics programming interface (such as GDI, OpenGL, or Direct3D) with the sole exception of sending a finished frame buffer to the screen (such as through GDI’s `StretchDIBits` or copying to VGA’s frame buffer).
- The game's graphics rendering employs only 32-bit and smaller integers and fixed-point arithmetic.[^30]

<a id=Building_a_Public_Domain_music_synthesis_library_and_instrument_banks></a>

## Building a Public-Domain music synthesis library and instrument banks

To improve support for MIDI (Musical Instrument Digital Interface) music playback in open-source and other applications, I challenge the community to write the following items, all of which must be released to the public domain or under the Unlicense.

- A cross-platform open-source library for _software_ synthesis (translation into digitized sound such as PCM) of MIDI data stored in standard MIDI files (SMF, .mid), using instrument sound banks (synthesizer banks) in SoundFont 2 (.sf2), Downloadable Sounds (.dls), and in OPL2, OPL3, and other FM synthesis sound banks, and possibly also in Timidity++/UltraSound patch format (.cfg, .pat). (Similar to _Fluidsynth_, but in the public domain or under the Unlicense. Instrument sound banks are files that describe how to render MIDI instruments as sound.  In addition, the source code in the nonpublic-domain _foo\_midi_, _libADLMIDI_, _libOPNMIDI_, and _OPL3BankEditor_ may be useful here, but review their licenses first.)
    - The library should support popular loop-point conventions found in MIDI files.
    - The library should support seeking of MIDI files such that a pause and resume function can be offered by a media player.
- An instrument sound bank for wavetable synthesis of all instruments and drum noises in the General MIDI System level 1 specification.
    - Instruments should correspond as closely as possible to those in that specification, but should be small in file size or be algorithmically generated.
    - Instruments can be generated using the public-domain single-cycle wave forms found in the AdventureKid Wave Form collection, found at: [**AKWF-FREE**](https://github.com/KristofferKarlAxelEkstrand/AKWF-FREE).
    - The samples for each instrument are preferably generated by an algorithm, such as one that renders the instrument's tone in the frequency domain.  An example of this is found in [**`com.sun.media.sound.EmergencySoundbank`**](https://github.com/apple/openjdk/blob/xcodejdk14-release/src/java.desktop/share/classes/com/sun/media/sound/EmergencySoundbank.java), which however is licensed under the GNU General Public License version 2 rather than public domain.
    - The instrument sound bank should be in either SoundFont 2 (.sf2) or Downloadable Sounds (.dls) format. [^31]
    - The volume of all instruments in the sound bank should be normalized; some instruments should not sound louder than others.
- An instrument sound bank for FM synthesis of all instruments and drum noises in the General MIDI System level 1 specification. Instruments should correspond as closely as possible to those in that specification.

<a id=Classic_Wallpaper_Challenge></a>

## Classic Wallpaper Challenge

See the "[**peteroupc/classic-wallpaper**](https://github.com/peteroupc/classic-wallpaper)" repository for a challenge on creating tileable desktop wallpapers with a limited palette of colors and a limited pixel size &mdash; such wallpapers are getting ever harder to find because desktop backgrounds today tend to cover the full computer screen, to employ thousands of colors, and to have a high-definition resolution (1920 &times; 1080 or larger).

<a id=License></a>

## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).

<a id=Notes></a>

## Notes

[^1]: A computer has adequate performance for classic graphics if it achieves a score of&mdash;<br>(a) 2700 or greater on the 3DMark2000 benchmark when run without graphics acceleration, or<br>(b) 1500 or greater on the 3DMark2000 CPU Speed Test.

[^2]: To bolster the suggestions in this specification, it would be of interest to find the number of polygons per frame and graphics memory use (for a given resolution and frame rate) actually achieved on average by 3-D video games in the mid- to late 1990s.  Such information is hard to find and is often anecdotal. For example:<br>(1) B. Tschirren, "Realism and Believability in MPEG-4 Facial Models", Curtin University of Technology, 2000, includes a statement that games like _Quake III Arena_ [1999] render up to 10,000 triangles per frame.<br>(2) "A typical scene in a current [PC] application has 2000 to 2500 triangles per frame" (R. Fosner, "DirectX 6.0 Goes Ballistic With Multiple New Features And Much Faster Code", _Microsoft Systems Journal_ January 1999).<br>(3) "For context, _Quake_ on a Pentium Pro pumped out maybe 100K triangles/second (tris/sec.) ... at best" (M. Abrash, "Inside Xbox Graphics", _Dr. Dobb's Journal_, August 2000), noting that the game normally ran at 320 &times; 240 pixels.<br>(4) The [**3DMark2000 benchmark**](https://web.archive.org/web/20050404173017/http://www.nvnews.net/reviews/annihilator_pro/3dmark_2000/html/tests.htm#fill) comes with two game scenes that average up to 9,400 polygons in low detail and up to 55,000 in high detail and is intended for 640 &times; 480 resolution.

[^3]: Affine (as opposed to perspective-correct) texture mapping, together with the rounding of vertex coordinates to integers and the lack of antialiasing, contributed to the characteristic distortion of 3-D graphics in many PlayStation (One) games.

[^4]: A possible alternative to these 2D limits is to require the use of a frame buffer of 640 &times; 480 pixels or a smaller resolution with no more than 16 or 256 simultaneous colors and to require that all graphics be rendered in software, but I don't know of a way to describe further restrictions useful for game programming in the mid- to late 1990s style.<br>The tile-based limits specified here also suit games that support only text display, and thus have graphics that resemble the text modes (as opposed to graphics modes) found in PCs and terminal workstations.

[^5]: But alpha blending (the partial mixing of one color with another) was "relatively new to PC games" at the time of _Quake_'s release in 1996, according to _Michael Abrash's Graphics Programming Black Book_. Only images with opaque and/or transparent pixels tended to be supported in early-1990s video games.

[^6]: PlayStation (One); Nintendo 3DS lower screen; VGA "mode X".

[^7]: Commodore 64; NEC PC-8001; VGA mode 13h.

[^8]: 12-inch classic Macintosh; one commonly supported "super VGA" mode.

[^9]: Nintendo DS; NEC PC-6001; Sega Master System/Sega Mark III; MSX.

[^10]: PC Engine/TurboGrafx 16; Sega Mega Drive/Sega Genesis; Neo Geo NTSC.

[^11]: Effective resolution of Famicom/Nintendo Entertainment System NTSC; Super Famicom/Super Nintendo Entertainment System NTSC.

[^12]: Nintendo Entertainment System PAL; Super Nintendo Entertainment System PAL.

[^13]: Game Boy Advance.

[^14]: Game Boy, Game Boy Color.

[^15]: Amiga PAL; Neo Geo PAL.

[^16]: Hercules Graphics Card monochrome.

[^17]: Color/Graphics Adapter (CGA) monochrome; NEC PC-8801.

[^18]: NEC PC-9801.

[^19]: Apple II.

[^20]: PlayStation Portable.

[^21]: MSX 2.

[^22]: Effective resolution of Nintendo 3DS upper screen without parallax effect.

[^23]: Virtual Boy.

[^24]: PC games released in 1999 tended to require 32 million bytes of system memory.  Meanwhile, _Quake_ (1996) required 8 million and recommended 16 million bytes of system memory.<br>It is worth noting that, before 1995, computer memory was expensive, so that computers with more than 4096 kibibytes of system memory (and 1024 kibibytes of video memory) were rare among consumers.

[^25]: I note that it's possible to write an FM software synthesizer supporting every MIDI instrument in less than 1024 kibibytes of code.

[^26]: The _Multimedia PC Specification_ (1992) recommended that video cards be able to transfer up to 8-bit-per-pixel graphics at a rate of 140,000 pixels per second or faster given 40 percent of CPU bandwidth.  The Multimedia PC level 2 specification (1993) upped this recommendation to 1.2 million pixels per second (sufficient for 320 &times; 240 video at 15 frames per second, the recommendation in article Q139826, "AVI Authoring Tips & Compression Options Dialog Box", 1995).  For details on these specifications, see article Q106055 in the Microsoft Knowledge Base.  Both recommendations are far from the 6.144 million pixels per second needed to display 640 &times; 480 pixel video smoothly at 20 frames per second.

[^27]: Not mentioned in that document are graphics resembling:<br> (1) Segmented liquid crystal displays, of the kind that Tiger Electronics was famous for.  These are simple to emulate, though: design a screen-size picture that assigns each segment a unique color and, each frame, draw black pixels on the screen where the segments that are "on" are, and draw white pixels (or another background) elsewhere on the screen.<br>(2) Vacuum fluorescent displays, notable in user interfaces of some media player applications that resemble a "stereo rack system".

[^28]: This includes:<br>(1) Windows games written for DirectX versions earlier than 7 and using Direct3D or DirectDraw for graphics.<br>(2) Windows games using GDI or [**WinG**](https://www.pcgamingwiki.com/wiki/List_of_WinG_games) for graphics and supporting Windows 98 or earlier.<br>(3) Games for MS-DOS or PC-9801 that were published before 2000.

[^29]: Especially if the library is self-contained and implements the specification with as little source code as possible.  The following are examples of a graphics library that follows the spirit of this specification, even though it doesn't necessarily meet its requirements exactly: [**_Tilengine_**](https://github.com/megamarc/Tilengine), [**_kit_**](https://github.com/rxi/kit/), [**_DOS-like_**](https://github.com/mattiasgustavsson/dos-like).  Michal Strehovský published an [**interesting technique to create small game applications**](https://migeel.sk/blog/2024/01/02/building-a-self-contained-game-in-csharp-under-2-kilobytes/).<br>This specification does not preclude the use of prerendered graphics (as in _Space Quest 5_, _Myst_, or the original _Final Fantasy VII_) to simulate showing more polygons or vertices at a time than otherwise allowed.  Doing this simulation using other software programming tricks would not be within the spirit of this specification, though.

[^30]: It wasn't until the Pentium processor's advent that floating-point arithmetic was embraced in 3-D game programming: for example, see chapter 63 of _Michael Abrash's Graphics Programming Black Book_.

[^31]: A sound bank of decent quality in either format is about 4 million bytes in size.  Making these banks would be easier if there were a guide on producing decent-quality instrument banks from the recordings of real musical instruments (rather than copying or converting other instrument banks or recording from commercial synthesizers).
