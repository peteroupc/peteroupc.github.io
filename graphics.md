# Graphics and Music Challenges for Classic-Style Computer Applications

The following are challenges I make to the computer community, relating to:

- [**Graphics for classic-style game development**](#Graphics_Challenge_for_Classic_Style_Games).
- [**MIDI music synthesis for classic-style games and apps**](#Building_a_Public_Domain_music_synthesis_library_and_instrument_banks).
- [**Tileable wallpapers with limited colors and resolution**](https://peteroupc.github.io/classic-wallpaper).
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
    - [**Seeking Comments**](#Seeking_Comments)
    - [**Further Reading**](#Further_Reading)
- [**Building a Public-Domain music synthesis library and instrument banks**](#Building_a_Public_Domain_music_synthesis_library_and_instrument_banks)
- [**Other Challenges and Projects**](#Other_Challenges_and_Projects)
    - [**Classic desktop wallpaper**](#Classic_desktop_wallpaper)
    - [**Button and border styles for classic interfaces**](#Button_and_border_styles_for_classic_interfaces)
    - [**Sound bank development guide**](#Sound_bank_development_guide)
    - [**Guide for creating 3-D models in the pre-2000 style**](#Guide_for_creating_3_D_models_in_the_pre_2000_style)
- [**Acknowledgments**](#Acknowledgments)
- [**License**](#License)
- [**Notes**](#Notes)

<a id=Graphics_Challenge_for_Classic_Style_Games></a>

## Graphics Challenge for Classic-Style Games

An interesting challenge for game developers, relating to designing games with classic graphics that run on an exceptional variety of modern and recent computers.

In this document, _classic graphics_ generally means two- or three-dimensional graphics achieved by video games from 1999 or earlier, before the advent of programmable "shaders".  For details, see "[**Classic Graphics in Scope**](#Classic_Graphics_in_Scope)", later. (To summarize: In general, a game screen of 640 &times; 480 or smaller, up to 12,800 3-D polygons at a time [fewer if the game screen is smaller], and tile- or sprite-based 2-D graphics are involved.)

This challenge is intended to encourage the making of&mdash;

-  modern video games that simulate pre-2000 graphics and run with very low resource requirements (say, 64 million bytes of memory or less) and even on very low-end computers (say, those that date from 2010 or earlier or support Windows 7, Windows XP, or even older), and
-  graphics engines (especially free and open-source ones) devoted to pre-2000 computer graphics and meant for developing such modern video games.[^1]

Most desktop and laptop computers from 2010 on, and most smartphones from 2016 on, can draw even high-quality pre-2000 graphics using only software &mdash; without relying on specialized video cards &mdash; at 640 &times; 480 pixels or smaller, screen resolutions typically targeted by video games in the 1990s and earlier.[^2]

The challenge sets an _upper bound_ on the kind of computer graphics that are of interest.  Further [**constraints to graphics computation**](#Optional_Limits) (such as memory, resource, color, resolution, or triangle limits) are highly encouraged. It is also encouraged to establish a lean programming interface for this graphics specification; for details, see "[**Lean Programming Interfaces for Classic Graphics**](https://peteroupc.github.io/graphicsapi.html)".

<a id=The_Specification></a>

### The Specification

Define the _larger screen dimension_ as the larger of the screen width and the screen height.

Limit 3-D graphics to the following:[^3]

1. The maximum number of primitives that can be shown at a time is equal to screen width times screen height divided by 24.[^4] \(See also survey project in "Other Challenges and Projects", later.)
    * A _primitive_ is either a triangle or a line segment.  An application may also consider a convex quadrilateral to be a primitive.
    * Each vertex of the primitive points to a vertex from the vertex list described later.
    * Each primitive can be translucent.

2. The maximum number of vertices that can be displayed at a time is 3 times the maximum number of primitives.
    * A _vertex_ consists of an XYZ position, an XY texture coordinate, and a red&ndash;green&ndash;blue vertex color.
    * Each vertex color follows this color format: The red, green, and blue components occupy up to 5 bits each.[^5]

3. Each _texture_ (an image that is applied to the surface of 3-D objects)&mdash;
    * is in a 16-bit-per-pixel format, where each pixel has the vertex color format given earlier, or
    * is in a 1-, 2-, 4-, or 8-bit-per-pixel format and has a table of colors with that color format.

4. The width and height of each texture are each powers of 2.
5. A texture's maximum width and maximum height, in pixels, are each equal to 256 or the larger screen dimension, whichever is smaller.
6. Textures may contain transparent pixels.
7. Textures should not be "pixelated" before the game uses them.  A "pixelated" image occurs when an image is enlarged with point filtering (also called nearest-neighbor filtering), with the result that some or all of the resulting image's rows and columns are repeated.
8. For 3-D graphics, Z buffering (depth buffering), flat shading, Gouraud shading, per-vertex specular highlighting, per-vertex depth-based fog, line drawing, two-texture blending, MIP mapping, source alpha blending, and destination alpha blending are supported.[^6]  Bilinear filtering and edge antialiasing (smoothing)[^7] are optional.
9. 3-D primitives should undergo perspective correction, but this is optional.[^8]
10. The 3-D graphics buffer's resolution is the same as the "screen resolution".

> **Example:** For a "screen resolution" (see later) of 640 &times; 480 pixels, no more than 12,800 primitives (640 &times; 480 / 24) and 38,400 vertices can be shown at a time, and the maximum texture size is 256 &times; 256 pixels.  For 320 &times; 240 pixels, the maximums are 3200 primitives, 9600 vertices, and textures of 256 &times; 256 pixels.  For 320 &times; 200 pixels, the maximums are 2666 primitives, 8000 vertices, and textures of 256 &times; 256 pixels.

Limit 2-D graphics to the following: [^9]

1. Layers:
    1. Up to four _2-D layers_ can be displayed at a time.  Each 2-D layer is a rectangular array of references to _tiles_ (see later), and can also be called a _tile map_.[^10]
    2. Up to two of the 2-D layers can undergo a 2-D affine transformation.
    3. If 3-D graphics are being displayed, one of the 2-D layers is replaced with a _3-D layer_, which is an image on which the 3-D graphics are drawn. The 2-D layer replaced this way can vary over time.
    4. The 2-D layers may contain transparent pixels.  The 3-D layer may contain transparent and translucent (semitransparent) pixels.[^11]
2. Tiles. A _tile_ is a small rectangular array of pixels.
    1. Every tile has the same width and the same height as every other.  The width must be 32 or less, and the height must be 32 or less.
    2. The application chooses one:
        1. Each tile is in a 1-bit-per-pixel format and uses one of 16 _color tables_, with 2 colors per table.
        2. Each tile is in a 2-bit-per-pixel format and uses one of 16 color tables, with 4 colors per table.
        3. Each tile is in a 4-bit-per-pixel format and uses one of 16 color tables, with 16 colors per table.
        4. There is a single 256-color table for use by tiles.  Each tile is in an 8-bit-per-pixel format.
    3. Each color in each color table used by tiles is of the vertex color format given earlier.
    4. Tiles may contain transparent, but not translucent, pixels.
    5. Tiles should not be "pixelated" before the game uses them.
    6. When referenced in a 2-D layer, a tile can be horizontally flipped, vertically flipped, or both.
3. Sprites.  A _sprite_ is a rectangular array of either tiles or pixels.
    1. Each sprite has up to X &times; Y pixels, where X and Y are each 1/4 the larger screen dimension, rounded up to the nearest power of 2. (An alternative limit is X = 64 and Y = 64.)
    2. Besides the previous point, sprites can have any width and height.
    3. Each sprite made of pixels (rather than tiles) has a pixel format allowed for _3-D textures_, given earlier, and may contain transparent, but not translucent, pixels.
    4. Each sprite can be drawn above or below any of the 2-D or 3-D layers.
    5. The application chooses one:
        1. Each sprite can undergo a 2-D affine transformation.
        2. Each sprite can be horizontally flipped, vertically flipped, or both.[^12]
        3. No affine transformation or flipping of sprites is allowed.
    6. Sprites should not be "pixelated" before the game uses them.
    7. Up to N sprites can be displayed at a time, where N is calculated as (screen width &times; screen height &times; 16) / (X &times; Y), rounded up, but not more than 512.[^13]

> **Note:** The suggested width and height for tiles is 8 pixels &times; 8 pixels.
>
> **Example:** For a "screen resolution" (see later) of 640 &times; 480 pixels, one choice is: 4-bit-per-pixel tiles, 8 &times; 8 tiles, sprites up to 160 &times; 160 pixels, no more than 192 sprites at a time, and no flipping or transformation of sprites.

Other requirements:

- **Screen resolution:** The game screen image has no more than 307,200 total pixels (for example, 640 &times; 480, or 640 pixels horizontally and 480 pixels vertically).[^14]  Support for game screen resolutions larger than this limit, in addition to resolutions meeting the limit, is optional.
- **Rendering in software:** The game should include a mode in which the graphics are _rendered in software_.  This means that the rendering of graphics does not rely on a video card, a graphics accelerator chip, or the operating system’s graphics API (such as GDI, OpenGL, or Direct3D) with the sole exception of sending a finished game screen image to the player's display (such as through GDI’s `StretchDIBits` or copying to VGA's video memory).  The game can optionally support hardware acceleration of graphics as well (and can even use such acceleration by default when the game detects its availability).
- **Music:** Music is in Standard MIDI files (SMF) only. The General MIDI System level 1 should be followed for such files.[^15]

<a id=Classic_Graphics_in_Scope></a>

### Classic Graphics in Scope

This specification for "classic graphics"[^16] in modern games largely reflects the graphics limitations of&mdash;

- consumer PCs (personal computers) released in the mid- to late 1990s,
- home computers released before 1995,
- game consoles (handheld and for TVs) released before 2000,
- arcade machines with similar performance to machines described earlier, and
- the Game Boy Advance and Nintendo DS, both of which were released after 2000 but have relatively meager graphics ability.

In addition, video-game graphics for personal digital assistants, graphical calculators, and cellular phones (generally those released before 2007) are within the spirit of this specification, up to the performance of consumer PCs released before 2000.[^17]

Some video game hardware from the late 1990s may have 3-D graphics capabilities beyond what is "classic" here, such as SEGA Model 3 (1996), SEGA NAOMI (1998), or NVIDIA GeForce 256 (late 1999).

In general, PC applications that feature classic graphics include:

1. Windows applications written for DirectX versions earlier than 7 and using Direct3D or DirectDraw for graphics.
2. Windows games using GDI or [**WinG**](https://www.pcgamingwiki.com/wiki/List_of_WinG_games) for graphics and supporting Windows 98 or earlier.  Examples are  _Chip's Challenge_ for Windows (1992) and Brian Goble's _The Adventures of MicroMan_ (1993).
3. Games for MS-DOS or PC-9801 that were published before 2000.  Examples are _Quake_ (1996), _WarCraft_ (1994), and the first titles of the Touhou Project series (1997-1998).
4. Games using OpenGL 1.2 or earlier for graphics.
5. So-called "multimedia titles" from the 1990s, or applications resembling interactive versions of books (generally reference and other nonfiction works), complete with sound, animation, and video.  See the _Authoring Guide_ that came with Microsoft's Multimedia Development Kit.

One of the following games can be considered an upper limit to what is considered "classic graphics" in this specification.

- _Quake III Arena_ (December 1999), which [**required DirectX 7 and at least 64 million bytes of memory**](https://www.dosdays.co.uk/topics/early_3d_games.php).
- _Falcon 4.0_ (1998).

<a id=Optional_Limits></a>

### Optional Limits

A game may impose further constraints to this specification (for example, to reduce the maximum number of 3-D triangles, to disallow 3-D graphics, to reduce the number of colors per tile allowed, or to [**reduce to a limited set the colors**](https://peteroupc.github.io/classic-wallpaper#Color_Palettes) ultimately displayed on screen).  I would be interested in knowing about these limitations that a new game that adopts this document decides to impose.

Examples of optional constraints are the following:

- The game displays no more than 16 colors at a time.[^18]
- The game is limited to the 16 colors of the so-called _VGA palette_.
    - In the 8-bit-per-component color format, this palette's colors are: light gray, that is, (192, 192, 192); or each color component is 0 or 255; or each color component is 0 or 128.
    - In the vertex color format, the closest colors to this palette are: 24/24/24; or each color component is 0 or 16; or each color component is 0 or 31.
- The game displays no more than 256 colors at a time.[^19]
- All game files can be packaged in a ZIP file or Win32 program file that takes no more than&mdash;
    - 1,457,664 bytes (the capacity of a file-allocation-table (FAT) formatted high-density 3.5-inch floppy disk), or
    - 1,213,952 bytes (the capacity of a FAT formatted high-density 5.25-inch floppy disk), or
    - 730,112 bytes (the capacity of a FAT formatted normal-density 3.5-inch floppy disk), or
    - 362,496 bytes (the capacity of a FAT formatted double-density 5.25-inch floppy disk), or
    - 65,536 bytes,[^20] or
    - 681 million bytes (slightly less than the maximum capacity of a formatted CD-ROM).
- The game uses no more than 16 million bytes of system memory at a time.
- The game uses no more than 655,360 bytes of system memory (plus 262,144 bytes of additional memory for graphics use only) at a time.[^21]
- The game is a Win32 application compatible with Windows XP.
- The game is a Win32 application compatible with Windows 98.
- The game aims for a rate of 30 frames per second.
- The game's graphics must be _rendered in software_.
- The game's graphics rendering employs only 32-bit and smaller integers and fixed-point arithmetic.[^22]
- The game renders only one-unit-thick white line segments on a black background (or vice versa), and displays no more than 320 of those segments at a time.

<a id=Notes_on_Specification></a>

### Notes on Specification

This section has notes on this specification, such as how its requirements correspond to the graphics abilities of pre-2000 video games.

<a id=Screen_resolutions></a>

#### Screen resolutions

- Screen resolutions larger than 307,200 total pixels (such as 800 &times; 600) are not within the spirit of this challenge, even though more demanding games in the late 1990s, as well as the _PC 98 System Design Guide_ (1997), aimed for the 800 &times; 600 resolution or higher for 3-D graphics.   Indeed, for the most part, major game consoles and arcade machines in the 1990s and earlier supported a resolution of no more than 307,200 total pixels.[^23]

- Screen resolutions that have been used in classic games include:[^24]

    - Video graphics array (VGA) display modes: 640 &times; 480,[^25] 320 &times; 240,[^26] 320 &times; 200.[^27]
    - 4:3 aspect ratio: 640 &times; 480,[^25] 512 &times; 384,[^28] 400 &times; 300,[^29] 320 &times; 240,[^26] 256 &times; 192,[^30] 160 &times; 120.[^31]
    - Game console aspect ratios: 640 &times; 448,[^32] 320 &times; 224,[^33] 256 &times; 224,[^34] 256 &times; 240,[^35] 240 &times; 160,[^36] 160 &times; 144.[^37]
    - 5:4 aspect ratio:[^38] 320 &times; 256,[^39] 360 &times; 288.[^40]
    - Two-color graphics: 720 &times; 348,[^41] 640 &times; 200,[^42] 512 &times; 342.[^43]
    - Enhanced Graphics Adapter aspect ratio: 640 &times; 350.[^44]
    - 8:5 aspect ratio: 640 &times; 400,[^45] 320 &times; 200.[^27]
    - Other: 280 &times; 192,[^46] 480 &times; 272,[^47] 512 &times; 424, [^48] 400 &times; 240,[^49] 384 &times; 224,[^50] 160 &times; 200,[^51] 480 &times; 240.[^52]

    This is not a complete list.  Arcade machines of the 1990s tended to vary greatly in their screen resolutions, and some game consoles, such as the SEGA Saturn or Nintendo 64, allowed games to alter the screen resolution during gameplay.

- As of early 1997, "[s]urveys indicate[d] that the great majority of [PC] users operate[d] in 640[ &times; ]480 resolution with 256 colors".[^53]

- A game can support&mdash;

    - multiple sizes for the area of the screen where the game's action is drawn, or
    - pixel-column or -row doubling as a "quality" setting,

    or both features, without changing the size of the game's image.  For example, the original _Doom_ (1993) supported several sizes of this kind (on PC, they were 96 &times; 48, 128 &times; 64, 160 &times; 80, and so on up to 288 &times; 144, as well as 320 &times; 168 and 320 &times; 200) and optional pixel-column doubling.[^54]

- Games within the scope of this challenge are meant to be run in a desktop window if the player's display is 800 &times; 600 pixels or larger.  The same is true if the game's resolution is 620 &times; 420 or smaller and the player's display is 640 &times; 480.  The game may also support full-screen display.

<a id=Frame_rate></a>

#### Frame rate

- No particular frame rate is required.[^55]

- Modern games implementing this specification can choose to target a frame rate typical of today, such as 30, 40, or 60 frames per second.

- Game consoles for TVs were designed for how often TVs can draw their image (nearly 60 frames per second for NTSC[^56] and 50 for PAL[^57]).

- _Doom_ (1993) operated at 35 frames per second but could not be run at that rate (under default settings) by typical PCs of the time.[^54]

- For comfort reasons, a minimum frame rate may be required for video games that offer "[**3-D vision**](https://www.pcgamingwiki.com/wiki/Glossary:Native_3D)" by rendering multiple views of the scene at a time, in conjunction with special glasses (for example, a SEGA Master System accessory) or a virtual-reality headset (for example, Nintendo's Virtual Boy).  But such games were rare before 2000.

<a id=3_D_graphics></a>

#### 3-D graphics

- The _PC 99 System Design Guide_ sections 14.27 to 14.34 gives guidelines on 3-D graphics support for PCs to be launched in 1999.  This challenge recommends the writing of software that performs as well as hardware meeting such guidelines, except for the screen resolution, frame rate, and double buffering requirements.
- An application may choose to support stencil buffers, bump mapping, environment mapping, and three- or four-texture blending, but these are borderline pre-2000 graphics capabilities.
- For years earlier than 1999, some of the 3-D capabilities mentioned in the specification (such as texture blending) might not be typical.
- This specification allows for:
    - Prerendered graphics (as in _Space Quest 5_, _Myst_, or the original _Final Fantasy VII_ on PlayStation [1997]), to simulate showing highly detailed imagery.
    - Drawing a 3-D graphic as a [**_voxel mesh_**](https://blog.danielschroeder.me/blog/voxel-renderer-objects-and-animation) (formed from point samples in 3-D, rather than 2-D, called _voxels_), as long as the triangle limits are respected.
- The following are not within the spirit of this challenge:
    - Displaying more than 20,000 triangles at a time (per frame), even for higher screen resolutions.  Most 3-D video games before 2000 displayed well fewer than that, but there may be exceptions, such as arcade games for the SEGA Model 3.
    - Phong shading (per-pixel specular highlighting), ray-traced graphics (other than the _ray casting_ technique), and path-traced graphics, which were too slow for real-time graphics in the 20th century.
- It wasn't until 1995 that 3-D video cards became widely available for consumer PCs.[^58] In 3-D video games for PCs "[i]n 1995/1996, it was not uncommon to have 30-50% of the game screen filled with polygons without textures" (according to an [**article**](https://retro.swarm.cz/s3-virge-325-vx-dx-gx-gx2-series-of-early-3d-accelerators-deep-dive/) that compared _Havoc_ [1995] with _Mortal Kombat 4_ [1997]).
- This specification is not centered on video games that offer "3-D vision" (see note under "Frame rate"), given how rare they were before 2000.

<a id=Screen_image_effects_filters></a>

#### Screen image effects (filters)

- Effects that modify the game screen image to emulate CRT displays[^59] are outside the scope of this challenge.  So are effects that [**scale**](https://www.pcgamingwiki.com/wiki/Glossary:Scaling) the game screen to fit the height or width of the player's display.[^60] This specification assumes those effects are not in place.  A game can have those effects if it wishes, but they should be in-game settings.

<a id=Sounds></a>

#### Sounds

- Besides the limitation on music, this specification has no further limitations on sounds.
- Early game consoles supported sound only through one or more _programmable sound generators_, such as square and triangle wave generators, as opposed to digitized sounds[^61].  Games that choose to constrain file size may wish to implement software versions of programmable sound generators for at least some of their sounds.
- When digitized sounds are supported in classic games, they typically have a sample rate of 8000, 11,025, 22,050, or 44,100 Hz, are either mono or stereo, and take 8 or 16 bits per sample.[^62]

<a id=Memory></a>

#### Memory

- This specification does not impose a limit on graphics memory use (akin to the video memory, or VRAM, of a video card).  One suggested example, given in kibibytes of graphics memory, is the screen width times screen height divided by 24, which is slightly less than 13.2 million bytes for 640 &times; 480 resolution. (A kibibyte is 1024 bytes.) Imposing a limit on graphics memory use does not limit the size or number of textures, 3-D models, or other graphics files a game can have.[^63]
- According to "[**Typical PCs Each Year**](https://www.dosdays.co.uk/topics/typical_pc_per_year.php)", the following ranges of system memory were typical for PCs sold in the specified years:[^64]
    - 1994: 4MB to 8 MB, with more expensive PCs having 16 MB.[^65]
    - 1997: 8MB to 32MB.[^66]
    - 1998: 32MB to 128MB.[^67]

<a id=Seeking_Comments></a>

### Seeking Comments

As with the rest of this open-source article, [**comments on this specification**](https://www.reddit.com/r/retrogamedev/comments/1rl36fo/pre2000_computer_graphics_for_modern_video_games/) are welcome.  But most useful would be comments that improve or refine the specification to fit the graphics abilities of pre-2000 video games.

Examples are comments that give _measurements_ (or references to other works that make such measurements) on the graphics capabilities actually achieved by video games released in 1999 and earlier (or released in, say, 1994 or earlier) for home computers or game consoles.  (I repeat: _measurements_, not inferences or guesses from screenshots or videos.)

This includes statements like the following, with references or measurements:

- "Game X shows up to Y polygons at a time at Z frames per second and screen resolution W".[^68]
- "Scenes in game X have Y triangles on average".
- "Game X shows no more than [16 or 256] simultaneous colors".
- "Game X uses Y bytes of memory while running on Windows 98".
- "Game X shows up to Y sprites at a time [at screen resolution Z]" (for 2-D games such as those built using the tool Director, then by Macromedia).
- The 2-D game X, from year Y, supports a [**given 2-D graphics capability**](https://peteroupc.github.io/graphicsapi.html#2_D_Graphics) (for example, 2-D rotations of sprites; filling ellipses with a solid color; flood filling; antialiasing of lines and shapes; translucent alpha blending; translucent sprites).
- The 3-D game X, from year Y, supports a [**given 3-D graphics capability**](https://peteroupc.github.io/graphicsapi.html#3_D_Graphics) (for example, texture mapping, Gouraud shading, bump mapping, edge antialiasing, alpha blending, texturing of most polygons in a scene, or MIP mapping).

(Those statements will also help me define constraints for video games up to an earlier year than 1999.)

Statements like the following are also useful, with references:

- "In year X [1999 or earlier], Y% of PC users used screen resolution Z".
- In year X, a given 3-D graphics capability became typical in 3-D video games.
- In year X, a given 2-D graphics capability became typical in 2-D video games.
- "In year X [1999 or earlier], Y% of home computers in use were equipped with Z million bytes of memory".
- "In year X, Y% of home PCs were equipped with 3-D video cards".
- A market-share-weighted average of system memory requirements of video games in year X.
- On a market-share-weighted basis, X% of video games in year Y&mdash;
    - ran on [16 or 256]-color display modes, or
    - were 3-D video games, or
    - were played on arcade machines, or
    - were played on PCs, or
    - were played on game console Z.

By contrast, statements like the following are not very useful, since they often don't relate to the actual performance of specific video games:

- "Game console X can process up to Y triangles per second".
- "Video card X can render up to Y polygons per frame".
- "Video card X can render up to Y pixels per second".
- "Game X renders Y triangles per second", without stating the frame rate or the screen resolution.
- "Game X issues Y draw calls per frame", since a single draw call can draw one triangle or tens of thousands.
- "Character models in game X average Y triangles".

The following are examples of the kind of statements desired:

- _Actua Soccer_ (_VR Soccer '96_) (1995) [**averaged 776 triangles per frame**](http://www-graphics.stanford.edu/~bjohanso/asoccer_stats/) at 640 &times; 480 resolution.
- _Terminal Velocity_ (1995) [**averaged 498 triangles per frame**](http://www-graphics.stanford.edu/~bjohanso/tv_stats/) at 640 &times; 480 resolution.
- A benchmark of _Quake III Arena_ averaged about 3,250 and topped out at about 6,970 triangles per frame after back-face culling, at screen resolution 640 &times; 480 (Antochi et al. 2003)[^69], (Antochi et al. 2004)[^70].

<a id=Further_Reading></a>

### Further Reading

- Abrash, M., [**_Michael Abrash's Graphics Programming Black Book: Special Edition_**](https://github.com/jagregory/abrash-black-book), 1997.
- (Akenine-)Möller, T., Haines, E., _Real-Time Rendering_ (first edition), 1999.
- Donnelly, P., "Moving Your Game to Windows, Part III: Sound, Graphics, Installation, and Documentation", Microsoft Developer Network, Nov. 25, 1996.
- Lamothe, A., _Black Art of 3D Game Programming_, Waite Group Press, 1995.
- Lamothe, A., _Tricks of the 3D Game Programming Gurus: Advanced 3D Graphics and Rasterization_, Sams, 2003. Published after 1999, but most of the 3-D capabilities discussed there are within the spirit of this specification.
- Lamothe, A., _Tricks of the Windows Game Programming Gurus_, Sams, 1999.
- Roca, Jordi, et al., "[**Workload Characterization of 3D Games**](https://ieeexplore.ieee.org/abstract/document/4086130)", _2006 IEEE International Symposium on Workload Characterization_. IEEE, 2006.  Study on measuring certain features of 3-D games that are of interest in this specification, including triangles per frame.  See the [**`attila-sim` repository**](https://github.com/attila-gpu/attila-sim).
- Rodent, H., "Animation in Win32", Microsoft Developer Network, Feb. 1, 1994.
- Thompson, N., _Animation Techniques in Win32_, Microsoft Press, 1995.

<a id=Building_a_Public_Domain_music_synthesis_library_and_instrument_banks></a>

## Building a Public-Domain music synthesis library and instrument banks

To improve support for MIDI (Musical Instrument Digital Interface) music playback in open-source and other applications, I challenge the community to write the following items, all of which must be released to the public domain or under the Unlicense.

- A cross-platform open-source library for _software_ synthesis (translation into digitized sound) of MIDI data stored in standard MIDI files (SMF, .mid), using instrument sound banks (synthesizer banks) in SoundFont 2 (.sf2), Downloadable Sounds (.dls), and in OPL2, OPL3, and other FM synthesis sound banks, and possibly also in Timidity++/UltraSound patch format (.cfg, .pat). (Similar to _Fluidsynth_, but in the public domain or under the Unlicense. Instrument sound banks are files that describe how to render MIDI instruments as sound.  In addition, the source code in the nonpublic-domain _foo\_midi_, _libADLMIDI_, _libOPNMIDI_, _OPL3BankEditor_, and _SpessaSynth_ may be useful here, but review their licenses first.)
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

See the "[**peteroupc/classic-wallpaper**](https://peteroupc.github.io/classic-wallpaper)" repository for a challenge on creating tileable desktop wallpapers with a limited selection of colors and limited dimensions in pixels &mdash; such wallpapers are getting ever harder to find because desktop backgrounds today tend to cover the full computer screen, to employ thousands of colors, and to have a high-definition resolution (1920 &times; 1080 or larger).

<a id=Button_and_border_styles_for_classic_interfaces></a>

### Button and border styles for classic interfaces

See [**"Traditional User-Interface Graphics"**](https://peteroupc.github.io/classic-wallpaper/docs/uielements.html) for a challenge on writing computer code (released to the public domain or under the Unlicense) to draw button and border styles for classic graphical user interfaces.

<a id=Sound_bank_development_guide></a>

### Sound bank development guide

Write an open-source and detailed guide on using free-of-cost software to produce decent-quality instrument banks from the recordings of real musical instruments (rather than copying or converting other instrument banks or recording from commercial synthesizers).  See the section on [**building instrument banks, earlier**](#Building_a_Public_Domain_music_synthesis_library_and_instrument_banks). For this purpose, a sound bank in SoundFont 2 or Downloadable Sounds format that is of decent quality is about 4 million bytes in size.

<a id=Guide_for_creating_3_D_models_in_the_pre_2000_style></a>

### Guide for creating 3-D models in the pre-2000 style

Develop a guide for creating 3-D models for use in modern video games that follow the [**specification**](#Graphics_Challenge_for_Classic_Style_Games) given earlier on classic (pre-2000) 3-D graphics, in a similar vein to "[**Game-Ready 3D Models: Requirements, Creation, and Export**](https://threedium.io/3d-model/game-ready)" (which was designed for high-system-resource games from 2024 or so).  Notably, no shader-based techniques should be required for any such models, and advice should apply to models for a game just as though the game were developed in 1999 (or an earlier year) rather than today, but the use of modern creation tools is allowed. (For example, instead of normal, roughness, or ambient-occlusion maps, late-1990s 3-D game models typically employed light maps and bump maps, and such models were generally much coarser than today's models.)

<a id=Acknowledgments></a>

## Acknowledgments

I acknowledge the advice of the `gameenginedevs` community on Reddit.

<a id=License></a>

## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).

<a id=Notes></a>

## Notes

[^1]: The following are examples of a graphics library that follows the spirit, even if not the letter, of this specification: [**_Tilengine_**](https://github.com/megamarc/Tilengine), [**_kit_**](https://github.com/rxi/kit/), [**_DOS-like_**](https://github.com/mattiasgustavsson/dos-like), [**_raylib_'s `rlsw` software renderer**](https://github.com/raysan5/raylib).  Michal Strehovský published an [**interesting technique to create small game applications**](https://migeel.sk/blog/2024/01/02/building-a-self-contained-game-in-csharp-under-2-kilobytes/), and so did [**Jani Peltonen**](https://www.codeslow.com/2019/12/tiny-windows-executable-in-rust.html).<br>I offer a [**template for Win32 applications**](https://gist.github.com/peteroupc/f1a5d8e45e27123b86b284271cfd802b) that supports 8- and 24-bit-per-pixel game images and paints finished game images using `StretchDIBits`.<br>By contrast, even though today's Unity and Unreal game engines can allow the making of games with "classic graphics", they are far from lightweight and their use is not within the spirit of this challenge.

[^2]: A computer has adequate performance for classic graphics if it achieves a score of&mdash;<br>(a) 3108 or more 3D marks on the 3DMark2000 benchmark (640 &times; 480) when run without graphics acceleration, or<br>(b) 195 or greater on the 3DMark2000 CPU speed test.<br>Both figures correspond to the running of two graphically demanding 3-D demos, at three levels of detail each, at 60 frames per second (adjusted downward as needed if a demo's detail level averages more than 12,800 triangles per frame; see the section "Test Descriptions" in the 3DMark2000 help).

[^3]: One editor specialized for creating classic 3-D models is the open-source tool [**_Blockbench_**](https://www.blockbench.net/). For classic 3-D scenes, there is the open-source tool [**_Trenchbroom_**](https://trenchbroom.github.io/).

[^4]: This is also known as _visible primitives_ or _visible primitives per frame_; in the case of polygons or triangles, this is also called _visible polygons (per frame)_ or _visible triangles (per frame)_.

[^5]: If there is interest, this format may instead be: The red and blue components occupy 5 bits each; the green component, 6 bits.

[^6]: _Quake_ (1996) also employed _subdivision rasterization_ for drawing small and relatively distant triangles whose vertices are rounded to integers, an algorithm likewise in scope here (Abrash (1997), chapter 69).

[^7]: Antialiasing "[**didn’t appear in home console graphics architectures**](https://imagequalitymatters.blogspot.com/2011/01/retro-tech-analysis-virtua-racing-md-vs.html) until the debut of the \[Nintendo 64\] in late 1996". _Tricks of the Mac Game Programming Gurus_ (1995) considers antialiasing among the features "unlikely" to be needed in game programming.

[^8]: Perspective correction accounts for distance from the viewer: closer objects appear larger.  The lack of perspective correction (as in what is called _affine texture mapping_), together with the lack of smoothing (antialiasing) of edges, contributed to the characteristic distortion and instability of 3-D graphics in many PlayStation (One) games.

[^9]: It is being considered whether to replace these 2-D limits with one of the following alternatives:<br><br>1. Instead of tiles, sprites, and layers, the game uses a _frame buffer_ (array of color samples, called pixels, in computer memory) with no more than 8 bits per pixel (no more than 256 simultaneous colors) and all graphics in the game must be _rendered in software_.  But I don't know of a way to describe further restrictions useful for game programming in the mid- to late 1990s style.<br>2. The 2-D limits in the specification apply, but instead of replacing a 2-D layer, the 3-D layer is simply a special sprite that covers the game screen (the usual size limits for sprites don't apply) and can have transparent and translucent pixels.<br>3. Same as (2), but in addition, there are no tiles or 2-D layers (all the graphics are sprites).<br><br>The tile-based limits in this specification also suit games that support only text display, and thus have graphics that resemble the text modes (as opposed to graphics modes) found in PCs and computer terminals.

[^10]: The Neo Geo (1990) has only one 2-D layer; the rest of the graphics are sprites drawn below that layer.

[^11]: Translucent pixels enable _alpha blending_ techniques (the mixing of one image with another).  But alpha blending was “relatively new to PC games” at the time of _Quake_’s release in 1996, according to Abrash (1997), and is practically not discussed at all in _Tricks of the Mac Game Programming Gurus_ (1995). Only images with opaque and/or transparent pixels tended to be supported in early-1990s video games.

[^12]: SEGA arcade machines from the 1980s and earlier had rudimentary systems for scaling (stretching or shrinking) sprites horizontally and vertically. In the Super Famicom/Super Nintendo Entertainment System (1990), sprites could not be scaled, but they could be flipped.

[^13]: Tile- and sprite-based graphics were in place largely because they saved memory; they were popularized by the arcade game _Galaxian_.  Indeed, this system, present in the Nintendo DS and many earlier game consoles, was abandoned in the Nintendo 3DS in favor of a frame buffer.<br>Game consoles employing tile-based graphics tended to limit not only the number of sprites per frame, but also the number of sprites per row of pixels, but a per-row limit is not adopted here.  As for the per-frame limit, the Famicom/Nintendo Entertainment System (1983), SEGA Master System/SEGA Mark III (1985), and PC Engine/TurboGrafx 16 (1987) had a limit of 64 sprites; the Game Boy (1989), 40; the SEGA Mega Drive/Genesis (1988), 80; the Super Famicom/Super Nintendo Entertainment System (1990), 128; and the relatively expensive Neo Geo (1990), 381.

[^14]: If the game screen image uses two colors only (such as black and white), the game could choose to allow it to have up to 800,000 total pixels.  For example, a 1024 &times; 768 display has 786,432 total pixels.  However, two-color graphical display modes larger than 307,200 total pixels are probably rare among consumers.  The modern game _Return of the Obra Dinn_ employs a two-color 800 &times; 450 display (378,000 total pixels) (but even so this resolution was ["up from 640[ &times; ]350"](https://forums.tigsource.com/index.php?topic=40832.msg1363742#msg1363742)).<br><br>In the Godot engine, the screen resolution corresponds to the "Viewport Width" (`window/size/viewport_width`) and "Viewport Height" (`window/size/viewport_height`) project settings.  For the Unity engine, there is advice from 2019 relating to the graphics style in [**"8-bit"**](https://blog.unity.com/technology/2d-pixel-perfect-how-to-set-up-your-unity-project-for-retro-8-bits-games) and [**"16-bit"**](https://blog.unity.com/technology/2d-pixel-perfect-how-to-set-up-your-unity-project-for-retro-16-bit-games) game consoles.  In Unreal Engine, the screen resolution apparently corresponds to `ResolutionSizeX` and `ResolutionSizeY`.  But a lighter-weight graphics engine than Unity, Unreal, or even Godot would better suit the spirit of this specification.

[^15]: Standard MIDI files should be played back using a cross-platform open-source software synthesizer (see section "Building a Public-Domain music synthesis library and instrument banks"), using either FM or wave-table synthesis; most modern PCs no longer come with hardware synthesizers.  I note that it's possible to write an FM software synthesizer supporting every MIDI instrument in less than 1024 kibibytes of code.<br>Standard MIDI files organize MIDI commands into up to 16 _channels_, each occupied by at most one "instrument" at a time.  Under the _Multimedia PC Specification_ (1992), the first ten channels were intended for high-end synthesizers (where the tenth is percussion); the thirteenth through sixteenth, for low-end ones (sixteenth is percussion), and the nonpercussion channels were arranged in decreasing order of importance.  This convention was abandoned with the rise in support for the General MIDI System level 1 (see Q141087, "DOCERR: MarkMIDI Utility Not Provided in Win32 SDK", in the Microsoft Knowledge Base): now all 16 channels are supported (with only the tenth for percussion) and need not be arranged by importance.

[^16]: Matt Saettler, "Graphics Design and Optimization", Multimedia Technical Note (Microsoft), 1992, contains a rich discussion of graphics used in computer games and other audiovisual computer applications up to 1992.  Not mentioned in that document are graphics resembling:<br> (1) Segmented liquid crystal displays, of the kind found in Nintendo's Game & Watch and many Tiger Electronics handheld games.  These are simple to emulate, though: design a screen-size image that assigns each segment a unique color and, each frame, draw black where where the segments that are "on" are, and draw white (or another background) elsewhere on the screen.<br>(2) Vacuum fluorescent displays, notable in user interfaces of some media player applications that resemble a "stereo rack system".

[^17]: Examples are the [**Sharp MI-Zaurus**](https://dench.flatlib.jp/app/chiraks_em) (2000) and the many cellular phones that came with Java Micro Edition, its Mobile Information Device Profile (MIDP, [**Java specification request 37**](https://jcp.org/en/jsr/detail?id=37) and [**JSR 118**](https://jcp.org/en/jsr/detail?id=118)), and extensions (especially [**JSR 184, Mobile 3D Graphics API**](https://jcp.org/en/jsr/detail?id=184)).

[^18]: An example is _Loom_ (1990).

[^19]: This was recommended for Macintosh games in J. McCornack et al., _Tricks of the Mac Game Programming Gurus_ (Hayden Books, 1995), notably because 8-bit-per-pixel images transfer faster and save memory over images with more bits per pixel; see also chapter 70 of Abrash (1997) (dealing with the porting of an 8-bit-per-pixel game to a 16-bit-per-pixel video card).

[^20]: Popular file size limit of so-called "64K intros".

[^21]: MS-DOS applications are normally limited to 640 kibibytes or less of _conventional memory_, along with whatever memory is carried by the video card.  (PCs running on the very early Intel 8086 and 8088 processors can map out no more than 640 kibibytes of system memory.) 262,144 bytes is the usual minimum of graphics memory for VGA video cards.

[^22]: It wasn't until the Pentium processor's advent that floating-point arithmetic was embraced in 3-D game programming: for example, see chapter 63 of Abrash (1997).

[^23]: Moreover, PC games before 2000 that required screen resolutions larger than 640 &times; 480 are rare, and according to PCGamingWiki they include the following games (most of which are 2-D): _Timon & Pumbaa's Jungle Games_ (1995); _Tequila & Boom Boom_ (1995); _Romance of the Three Kingdoms IV: Wall of Fire_ (1995/1996); _Joint Strike Fighter_ (1997), but only when run with the Glide graphics interface; _Links LS: 1998 Edition_ (1997); _Emergency: Fighters for Life_ (1998); _Championship Manager: Season 99/00_ (1999); _Heroes of Might and Magic III_ (1999); _Alien Nations_ (1999); _Pizza Syndicate_/_Fast Food Tycoon_ (1999); _Age of Empires II: The Age of Kings_ (1999).

[^24]: In addition to the resolutions shown here, there are modern games that employ low resolutions with the same 16:9 aspect ratio as high-definition displays.  These include 640 &times; 360 (_Blasphemous_); 400 &times; 225 (_Unsighted_); 480 &times; 270 (_Enter the Gungeon_); 320 &times; 180 (_Celeste_).

[^25]: VGA mode 12h (16 colors).

[^26]: PlayStation (One); Nintendo 3DS lower screen; larger VGA "mode X" (256 colors).

[^27]: Commodore 64; NEC PC-8001; VGA mode 13h (256 colors), especially seen in MS-DOS games; Color/Graphics Adapter (CGA) 4-color mode; Atari ST 16-color mode; [**Amiga NTSC**](https://blog.johnnovak.net/2022/04/15/achieving-period-correct-graphics-in-personal-computer-emulators-part-1-the-amiga).

[^28]: One commonly supported "super-VGA" mode, especially in mid-1990s gaming, and which was also recommended by the _PC 98 System Design Guide_.

[^29]: One low resolution recommended by the _PC 98 System Design Guide_.

[^30]: Nintendo DS; NEC PC-6001; SEGA Master System/SEGA Mark III; MSX; Colecovision.

[^31]: Rarely used VGA display mode.

[^32]: PlayStation 2 NTSC.

[^33]: SEGA Mega Drive/SEGA Genesis; Neo Geo NTSC.

[^34]: Effective resolution of Famicom/Nintendo Entertainment System NTSC; Super Famicom/Super Nintendo Entertainment System NTSC; minimum resolution of PC Engine/TurboGrafx 16.

[^35]: Nintendo Entertainment System PAL; Super Nintendo Entertainment System PAL.

[^36]: Game Boy Advance.

[^37]: Game Boy, Game Boy Color, SEGA Game Gear.

[^38]: Aspect ratio found above all in PAL (phase-alternating-line) displays.  The resolution 640 &times; 512 (PlayStation 2 PAL), included in this category, covers more than 307,200 total pixels.

[^39]: Amiga PAL (same pixel spacing horizontally as vertically); Neo Geo PAL.

[^40]: PAL overscan.

[^41]: Hercules Graphics Card two-color.

[^42]: Color/Graphics Adapter (CGA) two-color; NEC PC-8801 8-color mode; Atari ST 4-color mode.

[^43]: 12-inch classic Macintosh.

[^44]: 16 colors.

[^45]: NEC PC-9801 8-color mode; Atari ST two-color.

[^46]: Apple II.

[^47]: PlayStation Portable.

[^48]: MSX 2.

[^49]: Effective resolution of Nintendo 3DS upper screen without parallax effect.

[^50]: Virtual Boy.

[^51]: One "Tandy graphics adapter" mode.

[^52]: Minimum resolution for "handheld PCs" (_Windows CE Programmer's Guide_, MSDN Library, June 1998).

[^53]: S. Pruitt, "Frequently Asked Questions About HTML Coding for Internet Explorer 3.0", updated Jan. 30, 1997.

[^54]: Fabien Sanglard, _Game Engine Black Book: Doom_.

[^55]: Until the early 1990s, the number of color samples (pixels) an application can transfer per second was usually small, limiting the supported size and frame rate for arbitrary video content.  Indeed, for example, the _Multimedia PC Specification_ (1992) recommended that video cards be able to transfer up to 8-bit-per-sample graphics at a rate of 140,000 samples per second or faster given 40 percent of CPU bandwidth.  The Multimedia PC level 2 specification (1993) upped this recommendation to 1.2 million samples per second (sufficient for 320 &times; 240 video at 15 frames per second, the recommendation in article Q139826, "AVI Video Authoring Tips & Compression Options Dialog Box", 1995).  For details on these specifications, see article Q106055 in the Microsoft Knowledge Base.  Both recommendations are far from the 6.144 million samples per second needed to display 640 &times; 480 video smoothly at 20 frames per second.

[^56]: Stands for the National Television Standards Committee of the Electronics Industries Association.  "NTSC" often refers to the video standard known as RS-170A.

[^57]: Stands for phase alternating line.

[^58]: By contrast, 3-D video cards have been offered for professional-use computers since the mid-1980s; the first such cards for PCs that supported real-time display were [**introduced in 1988**](https://retro.swarm.cz/sgi-irisvision-add-in-3d-accelerator-for-pc-1990/).

[^59]: CRT displays, or cathode-ray-tube displays, were the typical kind of computer monitors and TVs in the 1980s and 1990s.

[^60]: Effects to scale the game screen include so-called "pixel-art scaling algorithms" such as `HQX` and `2xSaI`, as well as bilinear or point filtering.<br>Effects to scale the game screen do not include the decoding of small videos to fit the _game screen_, as opposed to the player's display.  It was common for 1990s games to have videos smaller than the game screen and to scale those videos to fit the game screen "on the fly", in the process of displaying them.  For example, such a game could decode videos of size 160x100 to fit a game screen of 320 &times; 200. (See, for instance, Nigel Thompson, "[**Stretching 256-Color Images Using Interpolation**](https://learn.microsoft.com/en-us/previous-versions/ms969922(v=msdn.10))", Microsoft Developer Network, March 7, 1995.)

[^61]: Sound today is most commonly digitized by pulse-code modulation (PCM), and PCM-digitized sound is often stored in computer files ending in ".WAV".

[^62]: The _Multimedia PC Specification_ (1992) required support in "multimedia PCs" for playback of at least 8-bit-per-sample mono digitized sound at 11,025 and 22,050 Hz.  The Multimedia PC level 2 specification (1993) required support in "multimedia PCs" for playing back at least 16-bit-per-sample stereo digitized sound at 44,100 Hz.

[^63]: PC games released in 1999 tended to require 32 million bytes of system memory.  Meanwhile, _Quake_ (1996) required 8 million and recommended 16 million bytes of system memory.

[^64]: "MB" is ambiguous here; it often means either one million bytes or 1024 times 1024 bytes.

[^65]: "Typical PCs in 1994", [**https://www.dosdays.co.uk/topics/1994.php.**](https://www.dosdays.co.uk/topics/1994.php.)

[^66]: "Typical PCs in 1997", [**https://www.dosdays.co.uk/topics/1997.php.**](https://www.dosdays.co.uk/topics/1997.php.)

[^67]: "Typical PCs in 1998", [**https://www.dosdays.co.uk/topics/1998.php.**](https://www.dosdays.co.uk/topics/1998.php.)

[^68]: Statements like this that relate to polygons or triangles per frame are hard to find and often anecdotal, and they cannot always be inferred from screenshots or videos of gameplay.  For example:<br>(1) "A typical scene in a current [PC] application has 2000 to 2500 triangles per frame" (R. Fosner, "DirectX 6.0 Goes Ballistic With Multiple New Features And Much Faster Code", _Microsoft Systems Journal_ January 1999).<br>(2) "For context, _Quake_ on a Pentium Pro pumped out maybe 100K triangles/second (tris/sec.) ... at best" (M. Abrash, "Inside Xbox Graphics", _Dr. Dobb's Journal_, August 2000); to be noted here is that the game normally ran at a screen resolution of 320 &times; 240.<br>(3) According to the help for the 3DMark2000 benchmark, that benchmark comes with two game scenes that average up to 9,400 polygons in low detail and up to 55,000 in high detail.<br>(4) The game engine for _SpecOps: Rangers Lead the Way_ (1998) targeted 10,000 triangles per frame ([**"Postmortem: Zombie's _SpecOps: Rangers Lead the Way_"**](https://www.gamedeveloper.com/design/postmortem-zombie-s-i-specops-rangers-lead-the-way-i-), Jan. 31, 2000).  So did _Quake III Arena_ (1999) (John Carmack .plan, Sep. 2, 1999).

[^69]: Antochi, Iosif, et al. "3D Graphics Benchmarks for Low-Power Architectures." 14th Annual Workshop on Circuits, Systems and Signal Processing. 2003.

[^70]: Antochi, Iosif, et al., "GraalBench: a 3D graphics benchmark suite for mobile phones", _ACM SIGPLAN Notices_ 39(7), 2004.
