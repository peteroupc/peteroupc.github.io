# Graphics and Music Challenges for Classic-Style Computer Applications

The following are challenges I make to the computer community, relating to:

- [**Graphics for classic-style game development**](#Graphics_Challenge_for_Classic_Style_Games).
- [**MIDI music synthesis for classic-style games and apps**](#Building_a_Public_Domain_music_synthesis_library_and_instrument_banks).
- [**Tileable wallpapers with limited colors and resolution**](https://github.com/peteroupc/classic-wallpaper).
- [**Other challenges and projects**](#Other_Challenges_and_Projects).

All may interest 1990s computer users.

<a id=Contents></a>

## Contents

- [**Contents**](#Contents)
- [**Graphics Challenge for Classic-Style Games**](#Graphics_Challenge_for_Classic_Style_Games)
    - [**The Specification**](#The_Specification)
    - [**Classic Graphics in Scope**](#Classic_Graphics_in_Scope)
    - [**Optional Limits**](#Optional_Limits)
    - [**Notes on Specification**](#Notes_on_Specification)
        - [**Screen resolutions**](#Screen_resolutions)
        - [**Frame rate**](#Frame_rate)
        - [**3-D graphics**](#3_D_graphics)
        - [**Screen image effects (filters)**](#Screen_image_effects_filters)
        - [**Sounds**](#Sounds)
        - [**Memory**](#Memory)
- [**Building a Public-Domain music synthesis library and instrument banks**](#Building_a_Public_Domain_music_synthesis_library_and_instrument_banks)
- [**Other Challenges and Projects**](#Other_Challenges_and_Projects)
    - [**Classic desktop wallpaper**](#Classic_desktop_wallpaper)
    - [**Button and border styles for classic interfaces**](#Button_and_border_styles_for_classic_interfaces)
    - [**Survey of polygon and memory usage in 1990s 3-D games**](#Survey_of_polygon_and_memory_usage_in_1990s_3_D_games)
    - [**Sound bank development guide**](#Sound_bank_development_guide)
- [**License**](#License)
- [**Notes**](#Notes)

<a id=Graphics_Challenge_for_Classic_Style_Games></a>

## Graphics Challenge for Classic-Style Games

An interesting challenge for game developers, relating to designing games with classic graphics that run on an exceptional variety of modern and recent computers.

In general, _classic graphics_ means two- or three-dimensional graphics achieved by video games from 1999 or earlier, before the advent of programmable "shaders".  For details, see "[**Classic Graphics in Scope**](#Classic_Graphics_in_Scope)", later.

This challenge is intended to enable innovative video games with very low resource requirements; most desktop and laptop computers from 2010 on, and most smartphones from 2016 on, can draw even high-quality classic graphics using only software &mdash; without relying on specialized video cards &mdash; at screen resolutions typically targeted by video games in the 1990s and earlier.[^1]

The challenge sets an _upper bound_ on the kind of computer graphics that are of interest.  Further constraints to graphics computation (such as memory, resource, color, resolution, or triangle limits) are highly encouraged.

<a id=The_Specification></a>

### The Specification

Define the _larger screen dimension_ as the larger of the screen width and the screen height.

Limit 3-D graphics to the following:[^2]

1. The maximum number of primitives that can be displayed at a time (per frame) is equal to screen width times screen height divided by 24. \(See also survey project in "Other Challenges and Projects", later.)
    * A _primitive_ is either a triangle or a line segment.  An application may also consider a convex quadrilateral to be a primitive.
    * Each vertex of the primitive points to a vertex from the vertex list described later.
    * Each primitive can be translucent.

2. The maximum number of vertices that can be displayed at a time is 3 times the maximum number of primitives.
    * A _vertex_ consists of an XYZ position, an XY texture coordinate, and a red&ndash;green&ndash;blue vertex color.
    * Each vertex color follows this color format: The red, green, and blue components occupy up to 5 bits each.[^3]

3. Each _texture_ (an image that is applied to the surface of 3-D objects)&mdash;
    * is in a 16-bit-per-pixel format, where each pixel has the vertex color format given earlier, or
    * is in a 1-, 2-, 4-, or 8-bit-per-pixel format and has a table of colors with the vertex color format given earlier.

4. The width and height of each texture is a power of 2.
5. A texture's maximum width and maximum height, in pixels, are each equal to 256 or the larger screen dimension, whichever is smaller.
6. Textures may contain transparent pixels.
7. Depth buffers (Z buffers) and depth-based pixel-level fog are supported.
8. The 3-D graphics buffer's resolution is the same as the screen resolution.
9. 3-D primitives should undergo perspective correction, but this is optional.[^4]

> **Example:** For 640 &times; 480 pixels, no more than 12,800 primitives (640 &times; 480 / 24) and 38,400 vertices can be shown at a time, and the maximum texture size is 256 &times; 256 pixels.

Limit 2-D graphics to the following: [^5]

1. Up to three 2-D _layers_ can be displayed at a time.  If 3-D graphics are not being displayed, a fourth 2-D layer can also be displayed.  Otherwise, a layer for the 3-D graphics can be displayed.  Each 2-D layer is a rectangular array of references to _tiles_ (a _tile_ is a small rectangular array of pixels).
2. Up to two of the 2-D layers can undergo a 2-D affine transformation.
3. The tiles have the same size (32 &times; 32 pixels or smaller). A tile size of 8 &times; 8 pixels is suggested.
4. The application chooses one:
    1. Each tile is in a 1-bit-per-pixel format and uses one of 16 _color tables_, with 2 colors per table.
    2. Each tile is in a 2-bit-per-pixel format and uses one of 16 color tables, with 4 colors per table.
    3. Each tile is in a 4-bit-per-pixel format and uses one of 16 color tables, with 16 colors per table.
    3. There is a single 256-color table for use by tiles.  Each tile is in an 8-bit-per-pixel format.
5. Each color in each color table used by tiles is of the vertex color format given earlier.
6. Tiles can be horizontally flipped, vertically flipped, or both.
7. Separate from layers, 2-D _sprites_ can be displayed.  Each sprite is a rectangular array of either tiles or pixels.
8. Each sprite has size up to X &times; Y pixels, where X and Y are each 1/4 the larger screen dimension, rounded up to the nearest power of 2. (An alternative limit is X = 64 and Y = 64.)
9. Up to N sprites can be displayed at a time, where N is calculated as (screen width &times; screen height &times; 16) / (X &times; Y), rounded up, but not more than 512.[^6]
10. Each sprite made of pixels (rather than tiles) has a pixel format allowed for 3-D textures, given earlier.
11. Each sprite can be drawn above or below any of the 2-D layers.
12. The application chooses one:
    1. Each sprite can undergo a 2-D affine transformation.
    2. Each sprite can be horizontally flipped, vertically flipped, or both.[^7]
    3. No affine transformation or flipping of sprites is allowed.
13. Layers, tiles, and sprites may contain transparent pixels, but not translucent (semitransparent) pixels.  As an exception, the 3-D layer may contain translucent pixels.[^8]

The 3-D graphics layer, if any, can be alpha blended with the 2-D graphics layers in any order. [^9]

> **Example:** For 640 &times; 480 pixels, one choice is: 4-bit-per-pixel tiles, 8 &times; 8 tiles, sprites up to 160 &times; 160 pixels, no more than 192 sprites at a time, and no flipping or transformation of sprites.

Other requirements:

- **Screen resolution:** Screen resolution is no more than 307,200 total pixels (for example, 640 &times; 480, or 640 pixels wide by 480 pixels high).[^10]
- **Music:** Music is in Standard MIDI files (SMF) only. The General MIDI System level 1 should be followed for such files.[^11]

<a id=Classic_Graphics_in_Scope></a>

### Classic Graphics in Scope

This specification for "classic graphics"[^12] in modern games largely reflects the graphics limitations of&mdash;

- consumer PCs (personal computers) released in the mid- to late 1990s,
- home computers released before 1995,
- game consoles (handheld and for TVs) released before 2000,
- arcade machines with similar performance to machines described earlier, and
- the Game Boy Advance, Nintendo DS, and Nintendo 3DS, all of which were released after 2000 but have relatively meager graphics ability.

In addition, video-game graphics for personal digital assistants, graphical calculators, and cellular phones (generally those released before 2007) are within the spirit of this specification, up to the performance of consumer PCs released before 2000.

Some video game hardware from the late 1990s may have 3-D graphics capabilities beyond what is "classic" here, such as SEGA Model 3 (1996), SEGA NAOMI (1998), or NVIDIA GeForce 256 (late 1999).

In general, PC applications that feature classic graphics include:

1. Windows applications written for DirectX versions earlier than 7 and using Direct3D or DirectDraw for graphics.
2. Windows games using GDI or [**WinG**](https://www.pcgamingwiki.com/wiki/List_of_WinG_games) for graphics and supporting Windows 98 or earlier.  Examples are  _Chip's Challenge_ for Windows (1992) and Brian Goble's _The Adventures of MicroMan_ (1993).
3. Games for MS-DOS or PC-9801 that were published before 2000.  Examples are _Quake_ (1996), _WarCraft_ (1994), and the first titles of the Touhou Project series (1997-1998).
4. Games using an OpenGL version earlier than 1.2 for graphics.
5. So-called "multimedia titles" from the 1990s, or applications resembling interactive versions of books (generally reference and other nonfiction works), complete with sound, animation, and video.  See the _Authoring Guide_ that came with Microsoft's Multimedia Development Kit.

One of the following games can be considered an upper limit to what is considered "classic graphics" in this specification.

- _Quake III Arena_ (December 1999), which [**required DirectX 7 and at least 64 million bytes of memory**](https://www.dosdays.co.uk/topics/early_3d_games.php).
- _Falcon 4.0_ (1998).

<a id=Optional_Limits></a>

### Optional Limits

A game may impose further constraints to this specification (for example, to reduce the maximum number of 3-D triangles, to disallow 3-D graphics, to reduce the number of colors per tile allowed, or to [**reduce to a limited set the colors**](https://github.com/peteroupc/classic-wallpaper?tab=readme-ov-file#color-palettes) ultimately displayed on screen).  I would be interested in knowing about these limitations that a new game that adopts this document decides to impose.  I would also be interested in learning about a free and open-source graphics library that implements this specification.[^13]  Examples of optional constraints are the following:

- The game displays no more than 16 colors at a time.[^14]
- The game is limited to the 16 colors of the so-called _VGA palette_.
    - In the 8-bit-per-component color format, this palette's colors are: light gray, that is, (192, 192, 192); or each color component is 0 or 255; or each color component is 0 or 128.
    - In the vertex color format, the closest colors to this palette are: 24/24/24; or each color component is 0 or 16; or each color component is 0 or 31.
- All game files can be packaged in a ZIP file or Win32 program file that takes no more than&mdash;
    - 1,457,664 bytes (the capacity of a file-allocation-table (FAT) formatted high-density 3.5-inch floppy disk), or
    - 1,213,952 bytes (the capacity of a FAT formatted high-density 5.25-inch floppy disk), or
    - 730,112 bytes (the capacity of a FAT formatted normal-density 3.5-inch floppy disk), or
    - 362,496 bytes (the capacity of a FAT formatted "360K" 5.25-inch floppy disk), or
    - 681 million bytes (slightly less than the maximum capacity of a formatted CD-ROM).
- The game uses no more than 16 million bytes of system memory at a time.
- The game uses no more than 655,360 bytes of system memory (plus 262,144 bytes of additional memory for graphics use only) at a time.[^15]
- The game aims for a rate of 30 frames per second.
- The game's graphics are rendered in software.  That is, the rendering does not rely on a video card, a graphics accelerator chip, or the operating system’s graphics programming interface (such as GDI, OpenGL, or Direct3D) with the sole exception of sending a finished game screen image to the player's display (such as through GDI’s `StretchDIBits` or copying to VGA's video memory).
- The game's graphics rendering employs only 32-bit and smaller integers and fixed-point arithmetic.[^16]

<a id=Notes_on_Specification></a>

### Notes on Specification

This section has notes on this specification, such as how its requirements correspond to the graphics abilities of classic video games.

<a id=Screen_resolutions></a>

#### Screen resolutions

- Screen resolutions larger than 307,200 total pixels (such as 800 &times; 600) are not within the spirit of this challenge, even though more demanding games in the late 1990s, as well as the _PC 98 System Design Guide_ (1997), aimed for such resolutions for 3-D graphics.

- Screen resolutions that have been used in classic games include:[^17]

    - Video graphics array (VGA) display modes: 640 &times; 480,[^18] 320 &times; 240,[^19] 320 &times; 200.[^20]
    - 4:3 aspect ratio: 640 &times; 480,[^18] 512 &times; 384,[^21] 400 &times; 300,[^22] 320 &times; 240,[^19] 256 &times; 192,[^23] 160 &times; 120.[^24]
    - Game console aspect ratios: 640 &times; 448,[^25] 320 &times; 224,[^26] 256 &times; 224,[^27] 256 &times; 240,[^28] 240 &times; 160,[^29] 160 &times; 144.[^30]
    - 5:4 aspect ratio:[^31] 320 &times; 256,[^32] 360 &times; 288.[^33]
    - Two-color graphics: 720 &times; 348,[^34] 640 &times; 200,[^35] 512 &times; 342.[^36]
    - Enhanced Graphics Adapter aspect ratio: 640 &times; 350.[^37]
    - 8:5 aspect ratio: 640 &times; 400,[^38] 320 &times; 200.[^20]
    - Other: 280 &times; 192,[^39] 480 &times; 272,[^40] 512 &times; 424, [^41] 400 &times; 240,[^42] 384 &times; 224,[^43] 160 &times; 200,[^44] 480 &times; 240.[^45]

    This is not a complete list.  Arcade machines of the 1990s tended to vary greatly in their screen resolutions, and some game consoles, such as the SEGA Saturn or Nintendo 64, allowed games to alter the screen resolution during gameplay.

- As of early 1997, "[s]urveys indicate[d] that the great majority of [PC] users operate[d] in 640[ &times; ]480 resolution with 256 colors".[^46]

- A game can support&mdash;

    - multiple sizes for the area of the screen where the game's action is drawn, or
    - pixel-column or -row doubling,

    or both features, without changing the size of the game's image.  For example, the original _Doom_ (1993) supported several sizes of this kind (on PC, they were 96 &times; 48, 128 &times; 64, 160 &times; 80, and so on up to 288 &times; 144, as well as 320 &times; 168 and 320 &times; 200) and optional pixel-column doubling.[^47]

- Games within the scope of this challenge are meant to be run in a desktop window if the player's display is 800 &times; 600 pixels or larger.  The same is true if the game's resolution is 620 &times; 420 pixels or smaller and the player's display is 640 &times; 480 pixels.  The game may also support full-screen display.

<a id=Frame_rate></a>

#### Frame rate

- No particular frame rate is required.[^48]

- Modern games implementing this specification can choose to target a frame rate typical of today, such as 30, 40, or 60 frames per second.

- Game consoles for TVs were designed for how often TVs can draw their image (nearly 60 frames per second for NTSC and 50 for PAL).

- _Doom_ (1993) operated at 35 frames per second but could not be run at that rate (under default settings) by typical PCs of the time.[^47]

- For comfort reasons, a minimum frame rate may be required for video games that offer "[**3-D vision**](https://www.pcgamingwiki.com/wiki/Glossary:Native_3D)" by rendering multiple views of the scene at a time, in conjunction with special glasses (for example, a SEGA Master System accessory) or a virtual-reality headset (for example, Nintendo's Virtual Boy).  But such games were rare before 2000.

<a id=3_D_graphics></a>

#### 3-D graphics

- The ability to display more than 20,000 triangles at a time (per frame) is not within the spirit of this challenge, even for higher screen resolutions.  Most 3-D video games before 2000 displayed well fewer than that, but there may be exceptions, such as arcade games for the SEGA Model 3.
- This specification allows for prerendered graphics (as in _Space Quest 5_, _Myst_, or the original _Final Fantasy VII_ on PlayStation), to simulate showing more triangles or vertices at a time than otherwise allowed.
- This specification allows for drawing a 3-D graphic as a [**_voxel mesh_**](https://blog.danielschroeder.me/blog/voxel-renderer-objects-and-animation) (formed from very small brick-shaped elements called _voxels_), as long as the triangle limits are respected.  Unless done entirely in software, ways to render voxel meshes without relying on triangles (such as by layers of sprites) are outside the spirit of this specification.
- It wasn't until 1995 that 3-D video cards became widely available for consumer PCs.[^49] In 3-D video games for PCs "[i]n 1995/1996, it was not uncommon to have 30-50% of the game screen filled with polygons without textures" (according to an [**article**](https://retro.swarm.cz/s3-virge-325-vx-dx-gx-gx2-series-of-early-3d-accelerators-deep-dive/) that compared _Havoc_ [1995] with _Mortal Kombat 4_ [1997]).
- The following 3-D graphics capabilities, typical of the late 1990s, are within the spirit of this specification: Z buffering (depth buffering), bilinear filtering, flat shading, Gouraud shading, perspective correction,[^4] per-vertex specular highlighting, per-vertex depth-based fog, Bresenham's line drawing algorithm, multitexture blending, edge antialiasing (smoothing), MIP mapping, source alpha blending, and destination alpha blending.[^50] Software that is as performant as hardware meeting the requirements and recommendations of the _PC 99 System Design Guide_ sections 14.27 to 14.34, except for the screen resolution, frame rate, and double buffering requirements, is recommended.  Stencil buffers, bump mapping and environment mapping are borderline "classic-graphics" capabilities.  Bilinear filtering is optional under this specification.
- Phong shading (pixel-level specular highlighting) is not within the spirit of this specification, given that it was too slow for real-time graphics as of 2000's beginning.
- This specification is not centered on video games that offer "3-D vision" (see note under "Frame rate"), given how rare they were before 2000.

<a id=Screen_image_effects_filters></a>

#### Screen image effects (filters)

- Effects that modify the game screen image to emulate CRT displays[^51] are outside the scope of this challenge.   So are effects that [**scale**](https://www.pcgamingwiki.com/wiki/Glossary:Scaling) the game screen to fit the height or width of the player's display.[^52] This specification assumes those effects are not in place.  A game can have those effects if it wishes, but they should be in-game settings.

<a id=Sounds></a>

#### Sounds

- Besides the limitation on music, this specification has no further limitations on sounds.
- Early game consoles supported sound only through one or more _programmable sound generators_, such as square and triangle wave generators, as opposed to digitized sounds[^53].  Games that choose to constrain file size may wish to implement software versions of programmable sound generators for at least some of their sounds.
- When digitized sounds are supported in classic games, they typically have a sample rate of 8000, 11,025, 22,050, or 44,100 Hz, are either mono or stereo, and take 8 or 16 bits per sample.[^54]

<a id=Memory></a>

#### Memory

- This specification does not impose a limit on graphics memory use (akin to the video memory, or VRAM, of a video card).  One suggested example, given in kibibytes of graphics memory, is the screen width times screen height divided by 24, which is slightly less than 13.2 million bytes for 640 &times; 480 resolution. (A kibibyte is 1024 bytes.) Imposing a limit on graphics memory use does not limit the size or number of textures, 3-D models, or other graphics files a game can have.[^55]
- Before 1995, computer memory was expensive, so that computers with more than 4096 kibibytes of system memory (and 1024 kibibytes of video memory) were rare among consumers; see "[**Typical PCs Each Year**](https://www.dosdays.co.uk/topics/typical_pc_per_year.php)".
- Before 1999, computers with more than 32,768 kibibytes of system memory were rare among consumers. (In the _PC 99 System Design Guide_, "entertainment PCs" required at least 64 million bytes of system memory.)

<a id=Building_a_Public_Domain_music_synthesis_library_and_instrument_banks></a>

## Building a Public-Domain music synthesis library and instrument banks

To improve support for MIDI (Musical Instrument Digital Interface) music playback in open-source and other applications, I challenge the community to write the following items, all of which must be released to the public domain or under the Unlicense.

- A cross-platform open-source library for _software_ synthesis (translation into digitized sound such as PCM) of MIDI data stored in standard MIDI files (SMF, .mid), using instrument sound banks (synthesizer banks) in SoundFont 2 (.sf2), Downloadable Sounds (.dls), and in OPL2, OPL3, and other FM synthesis sound banks, and possibly also in Timidity++/UltraSound patch format (.cfg, .pat). (Similar to _Fluidsynth_, but in the public domain or under the Unlicense. Instrument sound banks are files that describe how to render MIDI instruments as sound.  In addition, the source code in the nonpublic-domain _foo\_midi_, _libADLMIDI_, _libOPNMIDI_, _OPL3BankEditor_, and _SpessaSynth_ may be useful here, but review their licenses first.)
    - The library should support popular loop-point conventions found in MIDI files.
    - The library should support seeking of MIDI files such that a pause and resume function can be offered by a media player.
- An instrument sound bank for wave-table synthesis of all instruments and percussive (drum) noises in the General MIDI System level 1 specification.
    - Instruments should correspond as closely as possible to those in that specification, but should be small in file size or be algorithmically generated.
    - Instruments can be generated using the public-domain single-cycle wave forms found in the AdventureKid Wave Form collection, found at: [**AKWF-FREE**](https://github.com/KristofferKarlAxelEkstrand/AKWF-FREE).
    - The samples for each instrument may, but need not, be generated by an algorithm, such as one that renders the instrument's tone in the frequency domain.  An example of this is found in [**`com.sun.media.sound.EmergencySoundbank`**](https://github.com/apple/openjdk/blob/xcodejdk14-release/src/java.desktop/share/classes/com/sun/media/sound/EmergencySoundbank.java), which however is licensed under the GNU General Public License version 2 rather than public domain.
    - The instrument sound bank should be in either SoundFont 2 (.sf2) or Downloadable Sounds (.dls) format. See next section on a challenge to writing a guide on sound bank development.
    - The volume of all instruments in the sound bank should be normalized; some instruments should not sound louder than others.
- An instrument sound bank for FM synthesis of all instruments and percussive noises in the General MIDI System level 1 specification. Instruments should correspond as closely as possible to those in that specification.

<a id=Other_Challenges_and_Projects></a>

## Other Challenges and Projects

Other challenges and projects I make to the computer community.

<a id=Classic_desktop_wallpaper></a>

### Classic desktop wallpaper

See the "[**peteroupc/classic-wallpaper**](https://github.com/peteroupc/classic-wallpaper)" repository for a challenge on creating tileable desktop wallpapers with a limited selection of colors and a limited pixel size &mdash; such wallpapers are getting ever harder to find because desktop backgrounds today tend to cover the full computer screen, to employ thousands of colors, and to have a high-definition resolution (1920 &times; 1080 or larger).

<a id=Button_and_border_styles_for_classic_interfaces></a>

### Button and border styles for classic interfaces

See [**"Traditional User-Interface Graphics" in the "peteroupc/classic-wallpaper" repository**](https://github.com/peteroupc/classic-wallpaper/blob/main/uielements.md) for a challenge on writing computer code (released to the public domain or under the Unlicense) to draw button and border styles for classic graphical user interfaces.

<a id=Survey_of_polygon_and_memory_usage_in_1990s_3_D_games></a>

### Survey of polygon and memory usage in 1990s 3-D games

To buttress the suggestions in the [**specification on classic graphics**](#Graphics_Challenge_for_Classic_Style_Games), given earlier in this page, it would be of interest to find the number of triangles or polygons per frame and graphics memory usage (for a given resolution and frame rate) actually achieved on average by 3-D video games in the mid- to late 1990s.  Such information is hard to find and is often anecdotal.[^56]

<a id=Sound_bank_development_guide></a>

### Sound bank development guide

Write an open-source and detailed guide on using free-of-cost software to produce decent-quality instrument banks from the recordings of real musical instruments (rather than copying or converting other instrument banks or recording from commercial synthesizers).  See the section on [**building instrument banks, earlier**](#Building_a_Public_Domain_music_synthesis_library_and_instrument_banks). For this purpose, a sound bank in SoundFont 2 or Downloadable Sounds format that is of decent quality is about 4 million bytes in size.

<a id=License></a>

## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).

<a id=Notes></a>

## Notes

[^1]: A computer has adequate performance for classic graphics if it achieves a score of&mdash;<br>(a) 3108 or more 3D marks on the 3DMark2000 benchmark (640 &times; 480) when run without graphics acceleration, or<br>(b) 195 or greater on the 3DMark2000 CPU speed test.<br>Both figures correspond to the running of two graphically demanding 3-D demos, at three levels of detail each, at 60 frames per second (adjusted downward as needed if a demo's detail level averages more than 12,800 triangles per frame; see the section "Test Descriptions" in the 3DMark2000 help).

[^2]: One editor specialized for creating classic 3-D models is the open-source tool [**_Blockbench_**](https://www.blockbench.net/).

[^3]: If there is interest, this format may instead be: The red and blue components occupy 5 bits each; the green component, 6 bits.

[^4]: Perspective correction accounts for distance from the viewer: closer objects appear larger.  The lack of perspective correction (as in what is called _affine texture mapping_), together with the rounding of vertex coordinates to integers and the lack of smoothing (antialiasing) of edges, contributed to the characteristic distortion and instability of 3-D graphics in many PlayStation (One) games.

[^5]: A possible alternative to these 2-D limits is to require the use of a frame buffer (array of pixels in computer memory) with no more than 8 bits per pixel (no more than 256 simultaneous colors) and to require that all graphics be rendered in software, but I don't know of a way to describe further restrictions useful for game programming in the mid- to late 1990s style.<br>The tile-based limits specified here also suit games that support only text display, and thus have graphics that resemble the text modes (as opposed to graphics modes) found in PCs and computer terminals.

[^6]: Tile- and sprite-based graphics were in place largely because they saved memory.  Indeed, this system, present in the Nintendo DS and many earlier game consoles, was abandoned in the Nintendo 3DS in favor of a frame buffer.

[^7]: SEGA arcade machines from the 1980s and earlier had rudimentary systems for scaling (stretching or shrinking) sprites horizontally and vertically.  In the Super Famicom/Super Nintendo Entertainment System, sprites could not be scaled, but they could be flipped.

[^8]: If there is interest I may allow 2-D sprites to have translucent pixels in this specification.  But support for such sprites was probably rare before 1995.

[^9]: But alpha blending (the mixing of one image with another) was "relatively new to PC games" at the time of _Quake_'s release in 1996, according to _Michael Abrash's Graphics Programming Black Book_. Only images with opaque and/or transparent pixels tended to be supported in early-1990s video games.

[^10]: If the game screen image uses two colors only (such as black and white), the game could choose to allow it to have up to 800,000 total pixels.  For example, a 1024 &times; 768 display has 786,432 total pixels.  However, two-color graphical display modes larger than 307,200 total pixels are probably rare among consumers.  The modern game _Return of the Obra Dinn_ employs a two-color 800 &times; 450 display (378,000 total pixels).

[^11]: Standard MIDI files should be played back using a cross-platform open-source software synthesizer (see section "Building a Public-Domain music synthesis library and instrument banks"), using either FM or wave-table synthesis; most modern PCs no longer come with hardware synthesizers.  I note that it's possible to write an FM software synthesizer supporting every MIDI instrument in less than 1024 kibibytes of code.<br>Standard MIDI files organize MIDI sounds into up to 16 _channels_, each occupied by at most one "instrument" at a time.  Under the _Multimedia PC Specification_ (1992), the first ten channels were intended for high-end synthesizers (where the tenth is percussion); the thirteenth through sixteenth, for low-end ones (sixteenth is percussion), and the nonpercussion channels were arranged in decreasing order of importance.  This convention was abandoned with the rise in support for the General MIDI System level 1 (see Q141087, "DOCERR: MarkMIDI Utility Not Provided in Win32 SDK", in the Microsoft Knowledge Base): now all 16 channels are supported (with only the tenth for percussion) and need not be arranged by importance.

[^12]: Matt Saettler, "Graphics Design and Optimization", Multimedia Technical Note (Microsoft), 1992, contains a rich discussion of graphics used in classic games and other audiovisual computer applications.  Not mentioned in that document are graphics resembling:<br> (1) Segmented liquid crystal displays, of the kind that Tiger Electronics was famous for.  These are simple to emulate, though: design a screen-size picture that assigns each segment a unique color and, each frame, draw black pixels on the screen where the segments that are "on" are, and draw white pixels (or another background) elsewhere on the screen.<br>(2) Vacuum fluorescent displays, notable in user interfaces of some media player applications that resemble a "stereo rack system".

[^13]: Especially if the library is self-contained and implements the specification with as little source code as possible.  The following are examples of a graphics library that follows the spirit of this specification, even though it doesn't necessarily meet its requirements exactly: [**_Tilengine_**](https://github.com/megamarc/Tilengine), [**_kit_**](https://github.com/rxi/kit/), [**_DOS-like_**](https://github.com/mattiasgustavsson/dos-like), [**_raylib_'s `rlsw` software renderer**](https://github.com/raysan5/raylib).  Michal Strehovský published an [**interesting technique to create small game applications**](https://migeel.sk/blog/2024/01/02/building-a-self-contained-game-in-csharp-under-2-kilobytes/).

[^14]: An example is _Loom_ (1990).

[^15]: MS-DOS applications are normally limited to 640 kibibytes or less of _conventional memory_, along with whatever memory is carried by the video card.  (PCs running on the very early Intel 8086 and 8088 processors can map out no more than 640 kibibytes of system memory.) 262,144 bytes is the usual minimum of graphics memory for VGA video cards.

[^16]: It wasn't until the Pentium processor's advent that floating-point arithmetic was embraced in 3-D game programming: for example, see chapter 63 of _Michael Abrash's Graphics Programming Black Book_.

[^17]: In addition to the resolutions shown here, there are modern games that employ low resolutions with the same 16:9 aspect ratio as high-definition displays.  These include 640 &times; 360 (_Blasphemous_); 400 &times; 225 (_Unsighted_); 480 &times; 270 (_Enter the Gungeon_); 320 &times; 180 (_Celeste_).

[^18]: VGA mode 12h (16 colors).

[^19]: PlayStation (One); Nintendo 3DS lower screen; larger VGA "mode X" (256 colors).

[^20]: Commodore 64; NEC PC-8001; VGA mode 13h (256 colors); Color/Graphics Adapter (CGA) 4-color mode; Atari ST 16-color mode; [**Amiga NTSC**](https://blog.johnnovak.net/2022/04/15/achieving-period-correct-graphics-in-personal-computer-emulators-part-1-the-amiga).

[^21]: One commonly supported "super-VGA" mode, especially in mid-1990s gaming, and which was also recommended by the _PC 98 System Design Guide_.

[^22]: One low resolution recommended by the _PC 98 System Design Guide_.

[^23]: Nintendo DS; NEC PC-6001; SEGA Master System/SEGA Mark III; MSX; Colecovision.

[^24]: Rarely used VGA display mode.

[^25]: PlayStation 2 NTSC.

[^26]: SEGA Mega Drive/SEGA Genesis; Neo Geo NTSC.

[^27]: Effective resolution of Famicom/Nintendo Entertainment System NTSC; Super Famicom/Super Nintendo Entertainment System NTSC; minimum resolution of PC Engine/TurboGrafx 16.

[^28]: Nintendo Entertainment System PAL; Super Nintendo Entertainment System PAL.

[^29]: Game Boy Advance.

[^30]: Game Boy, Game Boy Color, SEGA Game Gear.

[^31]: Aspect ratio found above all in PAL (phase-alternating-line) displays.  The resolution 640 &times; 512 (PlayStation 2 PAL), included in this category, covers more than 307,200 total pixels.

[^32]: Amiga PAL ("square" pixels); Neo Geo PAL.

[^33]: PAL overscan.

[^34]: Hercules Graphics Card two-color.

[^35]: Color/Graphics Adapter (CGA) two-color; NEC PC-8801 8-color mode; Atari ST 4-color mode.

[^36]: 12-inch classic Macintosh.

[^37]: 16 colors.

[^38]: NEC PC-9801 8-color mode; Atari ST two-color.

[^39]: Apple II.

[^40]: PlayStation Portable.

[^41]: MSX 2.

[^42]: Effective resolution of Nintendo 3DS upper screen without parallax effect.

[^43]: Virtual Boy.

[^44]: One "Tandy graphics adapter" mode.

[^45]: Minimum resolution for "handheld PCs" (_Windows CE Programmer's Guide_, MSDN Library, June 1998).

[^46]: S. Pruitt, "Frequently Asked Questions About HTML Coding for Internet Explorer 3.0", updated Jan. 30, 1997.

[^47]: Fabien Sanglard, _Game Engine Black Book: Doom_.

[^48]: Until the early 1990s, the number of pixels an application can transfer per second was usually small, limiting the supported size and frame rate for arbitrary video content.  Indeed, for example, the _Multimedia PC Specification_ (1992) recommended that video cards be able to transfer up to 8-bit-per-pixel graphics at a rate of 140,000 pixels per second or faster given 40 percent of CPU bandwidth.  The Multimedia PC level 2 specification (1993) upped this recommendation to 1.2 million pixels per second (sufficient for 320 &times; 240 pixel video at 15 frames per second, the recommendation in article Q139826, "AVI Video Authoring Tips & Compression Options Dialog Box", 1995).  For details on these specifications, see article Q106055 in the Microsoft Knowledge Base.  Both recommendations are far from the 6.144 million pixels per second needed to display 640 &times; 480 pixel video smoothly at 20 frames per second.

[^49]: By contrast, 3-D video cards have been offered for professional-use computers since the mid-1980s; the first such cards for PCs that supported real-time display were [**introduced in 1988**](https://retro.swarm.cz/sgi-irisvision-add-in-3d-accelerator-for-pc-1990/).

[^50]: _Quake_ (1996) also employed _subdivision rasterization_ for drawing small and relatively distant triangles whose vertices are rounded to integers, an algorithm likewise in scope here (_Michael Abrash's Graphics Programming Black Book_, chapter 69).

[^51]: CRT displays, or cathode-ray-tube displays, were the typical kind of computer monitors and TVs in the 1980s and 1990s.

[^52]: This does not include the decoding of small videos to fit the _game screen_, as opposed to the player's display.  It was common for 1990s games to have videos smaller than the game screen and to scale those videos to fit the game screen "on the fly", in the process of displaying them.  For example, such a game could decode videos of size 160x100 to fit a game screen of 320 &times; 200.

[^53]: Digitized sound is also known as pulse-code modulation (PCM) and is often stored in files ending in ".WAV".

[^54]: The _Multimedia PC Specification_ (1992) required support in "multimedia PCs" for playback of at least 8-bit-per-sample mono digitized sound at 11,025 and 22,050 Hz.  The Multimedia PC level 2 specification (1993) required support in "multimedia PCs" for playing back at least 16-bit-per-sample stereo digitized sound at 44,100 Hz.

[^55]: PC games released in 1999 tended to require 32 million bytes of system memory.  Meanwhile, _Quake_ (1996) required 8 million and recommended 16 million bytes of system memory.

[^56]: For example:<br>(1) B. Tschirren, "Realism and Believability in MPEG-4 Facial Models", Curtin University of Technology, 2000, includes a statement that games like _Quake III Arena_ [1999] render up to 10,000 triangles per frame.<br>(2) "A typical scene in a current [PC] application has 2000 to 2500 triangles per frame" (R. Fosner, "DirectX 6.0 Goes Ballistic With Multiple New Features And Much Faster Code", _Microsoft Systems Journal_ January 1999).<br>(3) "For context, _Quake_ on a Pentium Pro pumped out maybe 100K triangles/second (tris/sec.) ... at best" (M. Abrash, "Inside Xbox Graphics", _Dr. Dobb's Journal_, August 2000); to be noted here is that the game normally ran at 320 &times; 240 pixels.<br>(4) According to the help for the 3DMark2000 benchmark, that benchmark comes with two game scenes that average up to 9,400 polygons in low detail and up to 55,000 in high detail.<br>(5) An [**early study of polygon rendering rates**](http://www-graphics.stanford.edu/~bjohanso/index-virge-study.html) in DOS-based 3-D games, by B. Johanson and B. Oberstein (1996), shows the difficulty of finding triangle output rates in DOS games.
