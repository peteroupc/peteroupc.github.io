# Graphics and Music Challenges for Classic Computer Applications

The following are challenges I make to the computer community, relating to:

- [**Graphics for classic-style game development**](#Graphics_Challenge_for_Retro_Style_Games).
- [**MIDI music synthesis for classic-style games and apps**](#Building_a_Public_Domain_music_synthesis_library_and_instrument_banks).
- [**Tileable wallpapers with limited colors and resolution**](https://github.com/peteroupc/classic-wallpaper).
- [**Other challenges and projects**](#Other_Challenges_and_Projects).

All of them serve to arouse nostalgia among 1990s computer users.

<a id=Graphics_Challenge_for_Classic_Style_Games></a>

## Graphics Challenge for Classic-Style Games

An interesting challenge for game developers, relating to designing games with classic graphics that run on an exceptional variety of modern and recent computers.

In general, _classic graphics_ means two- or three-dimensional graphics achieved by video games from 1999 or earlier, before the _shader model_ of 3-D graphics programming became mainstream among game software.[^1]

Most desktop and laptop computers from 2010 on, and most smartphones from 2016 on, can render even high-quality classic graphics using only software &mdash; without relying on specialized video cards &mdash; at screen resolutions typically targeted by late-1990s games.[^2]

The specification in this challenge sets an _upper bound_ on the kind of computer graphics that are of interest.  Further constraints to graphics computation (such as memory, resource, color, resolution, or triangle limits) are highly encouraged.

-------

Define the _larger screen dimension_ as the larger of the screen width and the screen height.

Limit 3-D graphics to the following:

1. The maximum number of primitives that can be displayed at a time is equal to screen width times screen height divided by 24. \(Examples: 256 &times; 192 / 24 = 2048 primitives; 640 &times; 480 / 24 = 12800 primitives.  See also survey project in "Other Challenges and Projects", later.)
    * A _primitive_ is either a triangle, a convex quadrilateral, or a line segment.
    * Each vertex of the primitive must point to a vertex from the vertex list described later.
    * Each primitive can be translucent.

2. The maximum number of vertices that can be used at a time is 3 times the maximum number of primitives.
    * A vertex consists of an XYZ position, an XY texture coordinate, and a red&ndash;green&ndash;blue vertex color.
    * For each color, the red component is 5 bits, the green, 5 bits, and the blue, 5 bits.

3. Textures must have the same color format as vertex colors, or may employ a 4-, 16-, or 256-color palette with that color format. The width and height of each texture must be a power of 2.  A texture's maximum width and maximum height, in pixels, are each equal to 256 or the larger screen dimension, whichever is smaller.
4. Textures may contain transparent pixels.
5. Depth buffers (Z buffers), clear colors, and fog colors are supported.
6. The 3-D graphics buffer's resolution is the same as the screen resolution.
7. Primitives should undergo perspective-correct texture mapping, but affine mapping may be implemented instead.[^3]

Limit 2-D graphics to the following: [^4]

1. Up to three 2-D layers can be displayed at a time.  If 3-D graphics are not being displayed, a fourth 2-D layer can also be displayed.  Otherwise, a layer for the 3-D graphics can be displayed.  Each 2-D layer is a rectangular array of references to _tiles_ (a _tile_ is a small rectangular array of pixels).
2. There are sixteen palettes of 16 colors each (using the color format for vertex colors).
3. The tiles have the same size (32 &times; 32 pixels or smaller) and each tile uses the colors of one of the sixteen palettes just described.  A tile size of 8 &times; 8 pixels is suggested.
4. The 2-D and 3-D layers may contain transparent pixels.
5. Up to two of the 2-D layers can undergo a 2-D affine transformation.
6. Separate from layers, 2-D sprites can be displayed.  Each sprite is a rectangular array of either tiles or pixels, has size up to X &times; Y pixels, and may contain transparent pixels, but not translucent (semitransparent) pixels. Up to N sprites can be displayed at a time.  Each sprite can be rendered above or below any of the 2-D layers.

    - X and Y are each 1/4 the larger screen dimension, rounded up to the nearest power of 2. (An alternative limit is X = 64 and Y = 64.)
    - N is calculated as (screen width &times; screen height &times; 16) / (X &times; Y), rounded up, but not more than 512.[^5]

7. Tiles and sprites can be rendered flipped on either or both axes.

The 3-D graphics layer, if any, can be alpha blended with the 2-D graphics layers in any order. [^6]

Other requirements:

- **Screen resolution:** Screen resolution is 307,200 total pixels (for example, 640 &times; 480) or smaller.[^7]
- **Music:** Music is in Standard MIDI files (SMF) only. The General MIDI System level 1 and the [**Authoring Guidelines for MIDI Files**](https://learn.microsoft.com/en-us/windows/win32/multimedia/authoring-guidelines-for-midi-files) should be followed for such files.[^8]

------------

This specification was inspired by the graphics limitations of&mdash;

- PC games in the mid- to late 1990s,[^9]
- home computers released before 1995,
- game consoles (handheld and for TVs) released before 2000, and
- the Game Boy Advance, Nintendo DS, and Nintendo 3DS, all of which were released after 2000 but have relatively meager graphics capability.

A game may impose further resource limits to those specifications (for example, to reduce the maximum number of 3-D triangles, to disallow 3-D rendering, to reduce the number of colors per tile allowed, or [**reduce to a limited set the colors**](https://github.com/peteroupc/classic-wallpaper?tab=readme-ov-file#color-palettes) ultimately displayed on screen).  I would be interested in knowing about these limitations that a new game that adopts this document decides to impose.  I would also be interested in learning about a free and open-source graphics library that implements this specification.[^10]  Examples of optional constraints are the following:

- The game is limited to the 16 colors of the so-called _VGA palette_.
    - In the 8-bit-per-component format, this palette's colors are: light gray, that is, (192, 192, 192); or each color component is 0 or 255; or each color component is 0 or 128.
    - In the vertex color format, the closest colors to this palette are: 24/24/24; or each color component is 0 or 16; or each color component is 0 or 31.
- All game files can be packaged in a ZIP file or Win32 program file that takes no more than&mdash;
    - 1,457,664 bytes (the capacity of a file-allocation-table (FAT) formatted high-density 3.5-inch floppy disk), or
    - 1,213,952 bytes (the capacity of a FAT formatted high-density 5.25-inch floppy disk), or
    - 730,112 bytes (the capacity of a FAT formatted normal-density 3.5-inch floppy disk), or
    - 362,496 bytes (the capacity of a FAT formatted "360K" 5.25-inch floppy disk), or
    - 681 million bytes (slightly less than the maximum capacity of a formatted CD-ROM).
- The game uses no more than 16 million bytes of system memory at a time.
- The game uses no more than 655,360 bytes of system memory (plus 262,144 bytes of additional memory for graphics use only) at a time.[^11]
- The game aims for a frame rate of 30 frames per second.
- The game's graphics are rendered in software.  That is, the rendering does not rely on a video card, a graphics accelerator chip, or the operating system’s graphics programming interface (such as GDI, OpenGL, or Direct3D) with the sole exception of sending a finished frame buffer to the screen (such as through GDI’s `StretchDIBits` or copying to VGA’s frame buffer).
- The game's graphics rendering employs only 32-bit and smaller integers and fixed-point arithmetic.[^12]

<a id=Notes_on_Specifications></a>

### Notes on Specifications

Screen resolution:

- Screen resolutions larger than 307,200 total pixels (such as 800 &times; 600) are not within the spirit of this challenge, even though more demanding games in the late 1990s, as well as the _PC 98 System Design Guide_ (1997), aimed for such resolutions for 3-D graphics.

- Screen resolutions that have been used in classic games include:[^13]

    - Video graphics array (VGA) display modes: 640 &times; 480,[^14] 320 &times; 240,[^15] 320 &times; 200.[^16]
    - 4:3 aspect ratio: 640 &times; 480,[^14] 512 &times; 384,[^17] 400 &times; 300,[^18] 320 &times; 240,[^15] 256 &times; 192,[^19] 160 &times; 120.[^20]
    - Game console aspect ratios: 640 &times; 448,[^21] 320 &times; 224,[^22] 256 &times; 224,[^23] 256 &times; 240,[^24] 240 &times; 160,[^25] 160 &times; 144.[^26]
    - 5:4 aspect ratio (PAL): 320 &times; 256,[^27] 640 &times; 512,[^28] 360 &times; 288.[^29]
    - Two-level monochrome graphics: 720 &times; 348,[^30] 640 &times; 200,[^31] 512 &times; 342.[^32]
    - Enhanced Graphics Adapter aspect ratio: 640 &times; 350.[^33]
    - 8:5 aspect ratio: 640 &times; 400,[^34] 320 &times; 200.[^16]
    - Other: 280 &times; 192,[^35] 480 &times; 272,[^36] 512 &times; 424, [^37] 400 &times; 240,[^38] 384 &times; 224,[^39] 160 &times; 200,[^40] 480 &times; 240.[^41]

    This is not a complete list.  Arcade machines of the 1990s tended to vary greatly in their screen resolutions, and some game consoles, such as the Sega Saturn or Nintendo 64, allowed games to alter the screen resolution during gameplay.

- As of early 1997, "[s]urveys indicate[d] that the great majority of [PC] users operate[d] in 640[ &times; ]480 resolution with 256 colors" (S. Pruitt, "Frequently Asked Questions About HTML Coding for Internet Explorer 3.0", updated Jan. 30, 1997).

- A game can support multiple "viewport sizes" (for the area of the screen in which the game's action is drawn) and/or pixel-column or -row doubling, all without changing screen resolution.  For example, the original _Doom_ (1993) supported several viewport sizes (on PC, they were 96 &times; 48, 128 &times; 64, 160 &times; 80, and so on up to 288 &times; 144, as well as 320 &times; 168 and 320 &times; 200) and optional pixel-column doubling.[^42]

Primitives per frame:

- The ability to display more than 20,000 3-D primitives at a time is not within the spirit of this challenge, even for higher screen resolutions.  Most 3-D video games before 2000 displayed well fewer than that, but there may be exceptions, such as arcade games for the Sega Model 3.

Frame rate:

- No particular frame rate is required.  Modern games implementing this specification can choose to target a frame rate typical of today, such as 30, 40, or 60 frames per second.  Game consoles for TVs were designed for the TV's usual refresh rate (nearly 60 frames per second for NTSC and 50 for PAL).[^43] _Doom_ (1993) operated at 35 frames per second but could not be run at that rate (under default settings) by typical PCs of the time.[^42]

- For comfort reasons, a minimum frame rate may be required for games written for virtual-reality headsets.  But such games are outside the scope of this specification.

Music and sound:

- Besides the limitation on music, this specification has no further limitations on sounds.  Early game consoles supported sound only through one or more _programmable sound generators_, such as square and triangle wave generators, as opposed to digitized sound (pulse-code modulation, such as .WAV files).  Games that choose to constrain file size may wish to implement software versions of programmable sound generators for at least some of their sounds.  When digitized sounds are supported in classic games, they typically have a sample rate of 8000, 11,025, 22,050, or 44,100 Hz, are either mono or stereo, and take 8 or 16 bits per sample.[^44]

Memory:

- This specification does not impose a limit on graphics memory use (akin to the video memory, or VRAM, of a video card).  One suggested example, given in kibibytes of graphics memory, is the screen width times screen height divided by 24, which is slightly less than 13.2 million bytes for 640 &times; 480 resolution. (A kibibyte is 1024 bytes.) Imposing a limit on graphics memory use does not limit the size or number of textures, 3-D models, or other graphics files a game can have.[^45]

- Before 1995, computer memory was expensive, so that computers with more than 4096 kibibytes of system memory (and 1024 kibibytes of video memory) were rare among consumers.[^46]

- Before 1999, computers with more than 32,768 kibibytes of system memory were rare among consumers. (In the _PC 99 System Design Guide_, "entertainment PCs" required at least 64 million bytes of system memory.)

<a id=Building_a_Public_Domain_music_synthesis_library_and_instrument_banks></a>

## Building a Public-Domain music synthesis library and instrument banks

To improve support for MIDI (Musical Instrument Digital Interface) music playback in open-source and other applications, I challenge the community to write the following items, all of which must be released to the public domain or under the Unlicense.

- A cross-platform open-source library for _software_ synthesis (translation into digitized sound such as PCM) of MIDI data stored in standard MIDI files (SMF, .mid), using instrument sound banks (synthesizer banks) in SoundFont 2 (.sf2), Downloadable Sounds (.dls), and in OPL2, OPL3, and other FM synthesis sound banks, and possibly also in Timidity++/UltraSound patch format (.cfg, .pat). (Similar to _Fluidsynth_, but in the public domain or under the Unlicense. Instrument sound banks are files that describe how to render MIDI instruments as sound.  In addition, the source code in the nonpublic-domain _foo\_midi_, _libADLMIDI_, _libOPNMIDI_, _OPL3BankEditor_, and _SpessaSynth_ may be useful here, but review their licenses first.)
    - The library should support popular loop-point conventions found in MIDI files.
    - The library should support seeking of MIDI files such that a pause and resume function can be offered by a media player.
- An instrument sound bank for wave-table synthesis of all instruments and percussive noises in the General MIDI System level 1 specification.
    - Instruments should correspond as closely as possible to those in that specification, but should be small in file size or be algorithmically generated.
    - Instruments can be generated using the public-domain single-cycle wave forms found in the AdventureKid Wave Form collection, found at: [**AKWF-FREE**](https://github.com/KristofferKarlAxelEkstrand/AKWF-FREE).
    - The samples for each instrument may, but need not be, generated by an algorithm, such as one that renders the instrument's tone in the frequency domain.  An example of this is found in [**`com.sun.media.sound.EmergencySoundbank`**](https://github.com/apple/openjdk/blob/xcodejdk14-release/src/java.desktop/share/classes/com/sun/media/sound/EmergencySoundbank.java), which however is licensed under the GNU General Public License version 2 rather than public domain.
    - The instrument sound bank should be in either SoundFont 2 (.sf2) or Downloadable Sounds (.dls) format. See next section on a challenge to writing a guide on sound bank development.
    - The volume of all instruments in the sound bank should be normalized; some instruments should not sound louder than others.
- An instrument sound bank for FM synthesis of all instruments and percussive noises in the General MIDI System level 1 specification. Instruments should correspond as closely as possible to those in that specification.

<a id=Other_Challenges_and_Projects></a>

## Other Challenges and Projects

- **Classic desktop wallpaper:** See the "[**peteroupc/classic-wallpaper**](https://github.com/peteroupc/classic-wallpaper)" repository for a challenge on creating tileable desktop wallpapers with a limited palette of colors and a limited pixel size &mdash; such wallpapers are getting ever harder to find because desktop backgrounds today tend to cover the full computer screen, to employ thousands of colors, and to have a high-definition resolution (1920 &times; 1080 or larger).
- **Button and border styles:** See [**`uielements.md` in the "peteroupc/classic-wallpaper" repository**](https://github.com/peteroupc/classic-wallpaper/blob/main/uielements.md) for a challenge on writing computer code (released to the public domain or under the Unlicense) to draw button and border styles for classic graphical user interfaces.
- **Survey of polygon and memory usage in 1990s 3-D games:** To bolster the suggestions in the [**specification on classic graphics**](#Graphics_Challenge_for_Classic_Style_Games), given earlier in this page, it would be of interest to find the number of triangles or polygons per frame and graphics memory usage (for a given resolution and frame rate) actually achieved on average by 3-D video games in the mid- to late 1990s.  Such information is hard to find and is often anecdotal.[^47]
- **Sound bank development guide:** Write an open-source and detailed guide on using free-of-cost software to produce decent-quality instrument banks from the recordings of real musical instruments (rather than copying or converting other instrument banks or recording from commercial synthesizers).  See the section on [**building instrument banks, earlier**](#Building_a_Public_Domain_music_synthesis_library_and_instrument_banks). For this purpose, a sound bank in SoundFont 2 or Downloadable Sounds format that is of decent quality is about 4 million bytes in size.

<a id=License></a>

## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).

<a id=Notes></a>

## Notes

[^1]: In general, these video games were written for consumer PCs, other home computers, and game consoles from 1999 and earlier, or for similarly performant arcade machines; see another endnote given later. Some video game hardware from the late 1990s may have 3-D graphics capabilities exceeding what is "classic" here, such as Sega Model 3, Sega Naomi, or NVIDIA GeForce 256.<br><br>Matt Saettler, "Graphics Design and Optimization", Multimedia Technical Note (Microsoft), 1992, contains a rich discussion of graphics used in classic games and other audiovisual computer applications.  Not mentioned in that document are graphics resembling:<br> (1) Segmented liquid crystal displays, of the kind that Tiger Electronics was famous for.  These are simple to emulate, though: design a screen-size picture that assigns each segment a unique color and, each frame, draw black pixels on the screen where the segments that are "on" are, and draw white pixels (or another background) elsewhere on the screen.<br>(2) Vacuum fluorescent displays, notable in user interfaces of some media player applications that resemble a "stereo rack system".

[^2]: A computer has adequate performance for classic graphics if it achieves a score of&mdash;<br>(a) 2700 or greater on the 3DMark2000 benchmark when run without graphics acceleration, or<br>(b) 1500 or greater on the 3DMark2000 CPU Speed Test.<br>Either score corresponds to the running of a then-demanding 3-D graphics demo at 60 frames per second or faster.

[^3]: Affine (as opposed to perspective-correct) texture mapping, together with the rounding of vertex coordinates to integers and the lack of antialiasing, contributed to the characteristic distortion and instability of 3-D graphics in many PlayStation (One) games.

[^4]: A possible alternative to these 2-D limits is to require the use of a frame buffer with no more than 8 bits per pixel and to require that all graphics be rendered in software, but I don't know of a way to describe further restrictions useful for game programming in the mid- to late 1990s style.<br>The tile-based limits specified here also suit games that support only text display, and thus have graphics that resemble the text modes (as opposed to graphics modes) found in PCs and computer terminals.

[^5]: Tile- and sprite-based graphics were in place largely because they saved memory.  Indeed, this system, present in the Nintendo DS and many earlier game consoles, was abandoned in the Nintendo 3DS in favor of a frame buffer.

[^6]: But alpha blending (the partial mixing of one color with another) was "relatively new to PC games" at the time of _Quake_'s release in 1996, according to _Michael Abrash's Graphics Programming Black Book_. Only images with opaque and/or transparent pixels tended to be supported in early-1990s video games.

[^7]: If the game screen is two-level monochrome (one bit per pixel), a game could choose to allow screen resolutions up to 800,000 total pixels.  For example, a 1024 &times; 768 screen has 786,432 total pixels.  However, two-level monochrome graphical display modes larger than 307,200 total pixels are probably rare among consumers.  The modern game _Return of the Obra Dinn_ employs a two-level monochrome 800 &times; 450 display (378,000 total pixels).

[^8]: Standard MIDI files should be rendered using a cross-platform open-source software synthesizer (see section "Building a Public-Domain music synthesis library and instrument banks"), using either FM or wave-table synthesis; most modern PCs no longer come with hardware synthesizers.  I note that it's possible to write an FM software synthesizer supporting every MIDI instrument in less than 1024 kibibytes of code.<br>Standard MIDI files organize MIDI sounds into up to 16 _channels_, each occupied by at most one "instrument" at a time.  Under the _Multimedia PC Specification_ of 1991, the first ten channels were intended for high-end synthesizers (where the tenth is percussion); the thirteenth through sixteenth, for low-end ones (sixteenth is percussion), and the nonpercussion channels were arranged in decreasing order of importance.  This convention was abandoned with the rise in support for the General MIDI System level 1 (see Q141087, "DOCERR: MarkMIDI Utility Not Provided in Win32 SDK", in the Microsoft Knowledge Base): now all 16 channels are supported (with only the tenth for percussion) and need not be arranged by importance.

[^9]: This includes:<br>(1) Windows games and screen savers written for DirectX versions earlier than 7 and using Direct3D or DirectDraw for graphics.<br>(2) Windows games and screen savers using GDI or [**WinG**](https://www.pcgamingwiki.com/wiki/List_of_WinG_games) for graphics and supporting Windows 98 or earlier.  Examples are  _Chip's Challenge_ for Windows (1992) and Brian Goble's _The Adventures of MicroMan_ (1993).<br>(3) Games for MS-DOS or PC-9801 that were published before 2000.  Examples are _Quake_ (1996) and _WarCraft_ (1994).<br>(4) Games using an OpenGL version earlier than 1.2 for graphics.

[^10]: Especially if the library is self-contained and implements the specification with as little source code as possible.  The following are examples of a graphics library that follows the spirit of this specification, even though it doesn't necessarily meet its requirements exactly: [**_Tilengine_**](https://github.com/megamarc/Tilengine), [**_kit_**](https://github.com/rxi/kit/), [**_DOS-like_**](https://github.com/mattiasgustavsson/dos-like), [**_raylib_'s `rlsw` software renderer**](https://github.com/raysan5/raylib).  Michal Strehovský published an [**interesting technique to create small game applications**](https://migeel.sk/blog/2024/01/02/building-a-self-contained-game-in-csharp-under-2-kilobytes/).<br>This specification does not preclude the use of prerendered graphics (as in _Space Quest 5_, _Myst_, or the original _Final Fantasy VII_ on PlayStation) to simulate showing more triangles or vertices at a time than otherwise allowed.  Doing this simulation using other software programming tricks would not be within the spirit of this specification, though.

[^11]: MS-DOS applications are normally limited to 640 kibibytes or less of _conventional memory_, along with whatever memory is carried by the video card.  262,144 bytes is the usual minimum of graphics memory for VGA video cards.

[^12]: It wasn't until the Pentium processor's advent that floating-point arithmetic was embraced in 3-D game programming: for example, see chapter 63 of _Michael Abrash's Graphics Programming Black Book_.

[^13]: In addition to the resolutions shown here, there are modern games that employ low resolutions with the same 16:9 aspect ratio as high-definition displays.  These include 640 &times; 360 (_Blasphemous_); 400 &times; 225 (_Unsighted_); 480 &times; 270 (_Enter the Gungeon_); 320 &times; 180 (_Celeste_).

[^14]: VGA mode 12h (16 colors).

[^15]: PlayStation (One); Nintendo 3DS lower screen; larger VGA "mode X" (256 colors).

[^16]: Commodore 64; NEC PC-8001; VGA mode 13h (256 colors); Color/Graphics Adapter (CGA) 4-color mode; Atari ST 16-color mode; [**Amiga NTSC**](https://blog.johnnovak.net/2022/04/15/achieving-period-correct-graphics-in-personal-computer-emulators-part-1-the-amiga).

[^17]: One commonly supported "super-VGA" mode, especially in mid-1990s gaming, and which was also required by the _PC 98 System Design Guide_.

[^18]: One low resolution required by the _PC 98 System Design Guide_.

[^19]: Nintendo DS; NEC PC-6001; Sega Master System/Sega Mark III; MSX; Colecovision.

[^20]: Rarely used VGA display mode.

[^21]: PlayStation 2 NTSC.

[^22]: Sega Mega Drive/Sega Genesis; Neo Geo NTSC.

[^23]: Effective resolution of Famicom/Nintendo Entertainment System NTSC; Super Famicom/Super Nintendo Entertainment System NTSC; minimum resolution of PC Engine/TurboGrafx 16.

[^24]: Nintendo Entertainment System PAL; Super Nintendo Entertainment System PAL.

[^25]: Game Boy Advance.

[^26]: Game Boy, Game Boy Color, Sega Game Gear.

[^27]: Amiga PAL ("square" pixels); Neo Geo PAL.

[^28]: PlayStation 2 PAL.  Note that this covers more than 307,200 total pixels.

[^29]: PAL overscan.

[^30]: Hercules Graphics Card two-level monochrome.

[^31]: Color/Graphics Adapter (CGA) two-level monochrome; NEC PC-8801 8-color mode; Atari ST 4-color mode.

[^32]: 12-inch classic Macintosh.

[^33]: 16 colors.

[^34]: NEC PC-9801 8-color mode; Atari ST two-level monochrome.

[^35]: Apple II.

[^36]: PlayStation Portable.

[^37]: MSX 2.

[^38]: Effective resolution of Nintendo 3DS upper screen without parallax effect.

[^39]: Virtual Boy.

[^40]: CGA 16-color mode.

[^41]: Minimum resolution for "handheld PCs" (_Windows CE Programmer's Guide_, MSDN Library, June 1998).

[^42]: Fabien Sanglard, _Game Engine Black Book: Doom_.

[^43]: Until the early 1990s, the number of pixels rendered per second was usually small, limiting the supported size and frame rate for arbitrary video content.  Indeed, for example, the _Multimedia PC Specification_ (1991) recommended that video cards be able to transfer up to 8-bit-per-pixel graphics at a rate of 140,000 pixels per second or faster given 40 percent of CPU bandwidth.  The Multimedia PC level 2 specification (1993) upped this recommendation to 1.2 million pixels per second (sufficient for 320 &times; 240 pixel video at 15 frames per second, the recommendation in article Q139826, "AVI Video Authoring Tips & Compression Options Dialog Box", 1995).  For details on these specifications, see article Q106055 in the Microsoft Knowledge Base.  Both recommendations are far from the 6.144 million pixels per second needed to display 640 &times; 480 pixel video smoothly at 20 frames per second.

[^44]: The _Multimedia PC Specification_ (1991) required support in "multimedia PCs" for rendering at least 8-bit-per-sample mono digitized sound at 11,025 and 22,050 Hz.  The Multimedia PC level 2 specification (1993) required support in "multimedia PCs" for rendering at least 16-bit-per-sample stereo digitized sound at 44,100 Hz.

[^45]: PC games released in 1999 tended to require 32 million bytes of system memory.  Meanwhile, _Quake_ (1996) required 8 million and recommended 16 million bytes of system memory.

[^46]: A "top-of-the-line" PC from 1994 came with 8192 kibibytes of system memory: Fabien Sanglard, _Game Engine Black Book: Doom_.

[^47]: For example:<br>(1) B. Tschirren, "Realism and Believability in MPEG-4 Facial Models", Curtin University of Technology, 2000, includes a statement that games like _Quake III Arena_ [1999] render up to 10,000 triangles per frame.<br>(2) "A typical scene in a current [PC] application has 2000 to 2500 triangles per frame" (R. Fosner, "DirectX 6.0 Goes Ballistic With Multiple New Features And Much Faster Code", _Microsoft Systems Journal_ January 1999).<br>(3) "For context, _Quake_ on a Pentium Pro pumped out maybe 100K triangles/second (tris/sec.) ... at best" (M. Abrash, "Inside Xbox Graphics", _Dr. Dobb's Journal_, August 2000); to be noted here is that the game normally ran at 320 &times; 240 pixels.<br>(4) The [**3DMark2000 benchmark**](https://web.archive.org/web/20050404173017/http://www.nvnews.net/reviews/annihilator_pro/3dmark_2000/html/tests.htm#fill) comes with two game scenes that average up to 9,400 polygons in low detail and up to 55,000 in high detail and is intended for 640 &times; 480 resolution.<br>(5) An [**early study of polygon rendering rates**](http://www-graphics.stanford.edu/~bjohanso/index-virge-study.html) in DOS-based 3-D games, by B. Johanson and B. Oberstein (1996), shows the difficulty of finding triangle output rates in DOS games.
