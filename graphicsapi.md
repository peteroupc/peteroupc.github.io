# Lean Programming Interfaces for Classic Graphics

Notes on developing an application programming interface (API) for classic graphics with as few entry points as possible.  As given in my [**specification for such graphics**](https://peteroupc.github.io/graphics.html), _classic graphics_ generally means 2-D or 3-D graphics achieved by video games before the year 2000 and the rise of programmable "shaders".

<a id=Goal_An_Open_Source_Engine_or_API_for_Classic_Graphics></a>

## Goal: An Open-Source Engine or API for Classic Graphics

It would be of interest to write a free and open-source graphics engine that implements this specification and renders graphics in software (with a minimum of source code and dependencies),[^1] or to establish a lean API for this specification.  The following are examples:

- _Quake_ (1996), _Quake II_ (1997), and _Quake III Arena_ (1999) popularized the practice of using only a subset of the OpenGL 1.1 API for a game's graphics rendering (see, for example, "Optimizing OpenGL drivers for Quake3" by the developer of _Quake III Arena_).
- The [**API reference**](https://github.com/kitao/pyxel?tab=readme-ov-file#api-reference) for the two-dimensional (2-D) game engine _Pyxel_.  But, in addition to the efforts there, a minimal version of the Python language runtime and nonreliance on hardware acceleration (notably the OpenGL API) would be worthwhile.
- BGI, a 2-D graphics API (`graphics.h`) by what was then known as Borland.

The graphics engine is intended to run even on computers from around 2005 (and maybe even on older computers), and with low resources, and so to enable innovative video games on those computers.

<a id=2_D_Graphics></a>

## 2-D Graphics

The simplest way to proceed is to give the application a _frame buffer_, a block of memory consisting of a rectangular array of pixel samples.  The nature of each pixel sample depends on the game's needs; for example, it may be an 8-bit index to a color palette, or a 16-bit color value.  In this case, the application must render graphics in software.[^1]

> **Note:** Under the classic-graphics specification, the frame buffer has no more than 307,200 pixels.

A tile- and sprite-based API suggested by the classic-graphics specification is yet to be determined.

The following is a sketch of what could be included in a lean API for copying and stretching 2-D images as well as for geometric drawing.[^2] \(For such an API, antialiasing support is optional.)

- Getting and setting pixel values of an image.
- Filling an axis-aligned rectangular area of an image with a solid color, supporting only integer coordinates.
- Copying an axis-aligned rectangular area of an image onto another image, with optional nearest-neighbor scaling.  The copying can optionally exclude transparent pixels or pixels of a certain color.
- Filling 2-D paths with a solid color, with even/odd or nonzero winding order. 2-D paths are sequences of path segments (line segments, quadratic Bézier curves, cubic Bézier curves, and elliptical arcs).
- Drawing one-unit-thick outlines of 2-D paths with a solid color.[^3]
- Flood filling colored areas of an image.

A leaner API could provide for the following instead:

- Getting and setting pixel values of an image.
- Filling the following figures with a solid color, supporting only integer coordinates.
    - Axis-aligned rectangles and ellipses.
    - Polygons with even/odd or nonzero winding order.  The API can choose to support arbitrary polygons, convex polygons only, or monotone-vertical polygons only.[^4]
- Drawing one-unit-thick line segments with a solid color, supporting only integer coordinates.  Support for drawing elliptical arcs this way is optional.
- Flood filling colored areas of an image.

<a id=3_D_Graphics></a>

## 3-D Graphics

Unlike with today's programmable "shaders", classic 3-D video-game graphics support only simple, yet admirable capabilities for real-time rendering of three-dimensional scenes, as well as a low scene complexity (fewer than 20,000 triangles per frame).

This section gives suggestions for a lean API supporting 3-D graphics. Any implementation of it should render graphics in software[^1] and optionally with hardware acceleration.

The [**classic-graphics specification**](https://peteroupc.github.io/graphics.html) recognizes the following [**3-D graphics capabilities**](https://peteroupc.github.io/graphics.html#3_D_graphics) as within its spirit:

- Z buffering (depth buffering).
- Bilinear filtering.
- Flat shading and Gouraud shading.
- Perspective correction.
- Per-vertex specular highlighting.
- Per-vertex depth-based fog.
- Line drawing.
- Two-texture blending.
- Edge antialiasing (smoothing).
- MIP mapping.
- Source and destination alpha blending.

The _PC 99 System Design Guide_ sections 14.27 to 14.34 (except for the screen resolution, frame rate, and double buffering requirements) are also in scope.

Stencil buffers, bump mapping, environment mapping, and three- or four-texture blending are borderline capabilities.

<a id=Suggested_C_Language_Functions></a>

### Suggested C-Language Functions

    DrawTrianglesOneTex(State3D *state, float* vertices, uint32_t numvertices,
       uint32_t * indices, uint32_t numindices, Texture *texture);

Draws a sequence of triangles.  The `vertices` array is a rectangular array of numbers organized into "vertex blocks". The number of `float`s pointed to must equal the number of `float`s per vertex block times `numvertices`. The number of indices (`numindices`) must be a multiple of 3. `float` is a number in IEEE 754 binary32 format.

> **Note:** As given in the classic graphics specification, the number of vertices per frame should be no more than 38,400 for a screen resolution of 640 &times; 480.

There are several possibilities for "vertex blocks":

- Each "vertex block" has eight `float` values: the x-, y-, and z-coordinates; the normal vector's X, Y, and Z components; and the texture coordinates (U and V).
- Each "vertex block" has five `float` values: the x-, y-, and z-coordinates; and the two texture coordinates.  This is for games that render only textured triangles and calculate their own lighting.

`state` is the 3-D graphics state, to be determined.  This state will include the game's frame buffer, and possibly additional parameters yet to be determined.

`texture` is information about the texture, to be determined.  This information will include the texture's image data and a blending operation (add, modulate, etc.).

    DrawTriangleFanOneTex(State3D *state, float* vertices, uint32_t numvertices, Texture *texture);

Draws a triangle fan.  `vertices`, `texture`, and `numvertices` are as in `DrawTrianglesOneTex`. Moreover, `numvertices` must be 3 or greater.

    DrawTriangleStripOneTex(State3D *state, float* vertices, uint32_t numvertices, Texture *texture);

Draws a triangle strip.  `vertices`, `texture`, and `numvertices` are as in `DrawTrianglesOneTex`. Moreover, `numvertices` must be 3 or greater.

    DrawTrianglesTwoTex(State3D *state, float* vertices, uint32_t numvertices,
       uint32_t * indices, uint32_t numindices, Texture *texture1, Texture *texture2);
    DrawTriangleFanTwoTex(State3D *state, float* vertices, uint32_t numvertices,
       Texture *texture1, Texture *texture2);
    DrawTriangleStripTwoTex(State3D *state, float* vertices, uint32_t numvertices,
       Texture *texture1, Texture *texture2);

Like the corresponding `...OneTex` versions, with the following exceptions. Each vertex block has ten `float` values: the x-, y-, and z-coordinates; the normal vector's X, Y, and Z components; the texture coordinates (U and V) for `texture1`; and the texture coordinates for `texture2`.  These functions are suggested here because some games from the late 1990s rely on so-called _light-map_ textures and two-texture blending rather than in-game lighting calculations.

    DrawTriangles(State3D *state, float* vertices, uint32_t numvertices,
       uint32_t * indices, uint32_t numindices);
    DrawTriangleFan(State3D *state, float* vertices, uint32_t numvertices);
    DrawTriangleStrip(State3D *state, float* vertices, uint32_t numvertices);

Draws triangles without textures.  Like the corresponding `...OneTex` versions, with the following exceptions. Each "vertex block" has six `float` values: the x-, y-, and z-coordinates; and a color's red, green, and blue values, each ranging from 0 through 1.  This is for games that render only triangles without textures.  These functions are suggested here because some games from the mid- to late 1990s often draw polygons without textures.

This is far from a complete list of useful 3-D drawing functions; there may be others, but the goal is to define a compact set of functions supporting only those 3-D capabilities actually used by video games in the 1990s and earlier.

<a id=Further_Reading></a>

## Further Reading

- Jon Christiansen, "Microsoft Windows CE Graphical Features". Describes the 2-D graphics features of Windows CE 2.0 (an operating system for embedded and handheld computers) from about 1997.
- "Microsoft C/C++ Version 7.0 Run-Time Library Reference" (1991), section 2.6.  Describes the graphics routines the named library supports.

<a id=License></a>

## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).

<a id=Notes></a>

## Notes

[^1]: In this document, "rendering in software" means that the rendering of graphics does not rely on a video card, a graphics accelerator chip, or the operating system’s graphics API (such as GDI, OpenGL, or Direct3D) with the sole exception of sending a finished game screen image to the player's display (such as through GDI’s `StretchDIBits` or copying to VGA's video memory).  The following are examples of a graphics library that follows the spirit, even if not the letter, of the classic-graphics specification: [**_Tilengine_**](https://github.com/megamarc/Tilengine), [**_kit_**](https://github.com/rxi/kit/), [**_DOS-like_**](https://github.com/mattiasgustavsson/dos-like), [**_raylib_'s `rlsw` software renderer**](https://github.com/raysan5/raylib).  Michal Strehovský published an [**interesting technique to create small game applications**](https://migeel.sk/blog/2024/01/02/building-a-self-contained-game-in-csharp-under-2-kilobytes/).

[^2]: It is unclear whether to include any of the following in the lean 2-D graphics API; this will depend on how heavily pre-2000 or pre-1995 games made use of them.<br><br>a. 2-D affine transformations (which keep parallel lines parallel; examples are scalings, shears, and rotations).<br>b. Translations, rotations and scalings, but no other 2-D affine transformations.<br>c. Translations, rotations, scalings, and reflections, but no other 2-D affine transformations.<br>d. So-called "[**raster operations**](https://learn.microsoft.com/en-us/windows/win32/gdi/raster-operation-codes)" (bit-by-bit operations between two images), such as those found in the Windows API.<br>e. [**Alpha compositing**](https://ciechanow.ski/alpha-compositing/) while drawing 2-D graphics.<br>f. Drawing one image part over another (Porter and Duff's "over" operation), with optional translucency, but no other nontrivial alpha compositing.  The images may have translucent (semitransparent) or transparent pixels.<br>g. Same as (f), except the images can't have translucent pixels.<br>h. Drawing dashed 2-D paths.<br><br>By contrast, text rendering is not included in this lean API, since the needs of applications in supporting writing systems and languages vary, as do approaches to rendering text.

[^3]: Here, a "unit" means the spacing between an image's pixels.  Thicker outlines can be drawn by approximating the 2-D path with line segments, then drawing filled circles around each segment's endpoints, then drawing filled rectangles that follow the path of each line segment. Thus, a lean graphics API need not support outlining paths thicker than one unit.  See also Ron Gery, "Primitive Cool", Microsoft Developer Network, Mar. 17, 1992.

[^4]: A "monotone-vertical" polygon is one that changes direction along the y-axis exactly twice, whether or not the polygon is self-intersecting. Every convex polygon is monotone-vertical.  See chapter 41 of Michael Abrash's Graphics Programming Black Book Special Edition, 1997.
