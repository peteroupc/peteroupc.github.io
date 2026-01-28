# Lean Programming Interfaces for Classic Graphics

Notes on developing an application programming interface (API) for classic graphics with as few entry points as possible.  As given in my [**specification for such graphics**](https://peteroupc.github.io/graphics.html), _classic graphics_ generally means 2-D or 3-D graphics achieved by video games before the year 2000 and the rise of programmable "shaders".

<a id=Goal_An_Open_Source_Engine_or_API_for_Classic_Graphics></a>

## Goal: An Open-Source Engine or API for Classic Graphics

It would be of interest to write a free and open-source graphics engine that implements this specification and renders graphics in software (with a minimum of source code and dependencies),[^1] or to establish a lean API for this specification.  The following are examples:

- _Quake_ (1996), _Quake II_ (1997), and _Quake III Arena_ (1999) popularized the practice of using only a subset of the OpenGL 1.1 API for a game's graphics rendering (see, for example, "Optimizing OpenGL drivers for Quake3" by the developer of _Quake III Arena_).
- The [**API reference**](https://github.com/kitao/pyxel?tab=readme-ov-file#api-reference) for the 2-D game engine _Pyxel_.  But, in addition to the efforts there, a minimal version of the Python language runtime and nonreliance on hardware acceleration (notably the OpenGL API) would be worthwhile.

<a id=2_D_Graphics></a>

## 2-D Graphics

The simplest way to proceed is to give the application a _frame buffer_, a block of memory consisting of a rectangular array of pixel samples.  The nature of each pixel sample depends on the game's needs; for example, it may be an 8-bit index to a color palette, or a 16-bit color value.  In this case, the application must render graphics in software.[^1]

> **Note:** Under the classic-graphics specification, the frame buffer has no more than 307,200 pixels.

A tile- and sprite-based API suggested by the classic-graphics specification is yet to be determined.

<a id=3_D_Graphics></a>

## 3-D Graphics

The following are potential C-language functions a lean graphics API can have.  The API may have any or all of these functions, depending on its needs:

    DrawTrianglesOneTex(State3D *state, float* vertices, uint32_t numvertices,
       uint32_t * indices, uint32_t numindices, Texture *texture);

Draws a sequence of triangles.  The `vertices` array is a rectangular array of numbers organized into "vertex blocks". The number of `float`s pointed to must equal the number of `float`s per vertex block times `numvertices`. The number of indices (`numindices`) must be a multiple of 3.

> **Note:** As given in the classic graphics specification, the number of vertices per frame should be no more than 38,400 for a screen resolution of 640 &times; 480.

There are several possibilities for "vertex blocks":

- Each "vertex block" has eight `float` values: the x-, y-, and z-coordinates; the normal vector's X, Y, and Z components; and the texture coordinates (U and V).
- Each "vertex block" has five `float` values: the x-, y-, and z-coordinates; and a color's red, green, and blue values, each ranging from 0 through 1.  This is for games that render only triangles without textures.
- Each "vertex block" has five `float` values: the x-, y-, and z-coordinates; and the two texture coordinates.  This is for games that render only textured triangles.

`state` is the 3-D graphics state, to be determined.  This state will include the game's frame buffer, and possibly additional parameters yet to be determined.

`texture` is information about the texture, to be determined.  This information will include the texture's image data and a blending operation (add, modulate, etc.).

    DrawTriangleFanOneTex(State3D *state, float* vertices, uint32_t numvertices, Texture *texture);

Draws a triangle fan.  `vertices`, `texture`, and `numvertices` are as in `DrawTrianglesOneTex`. Moreover, `numvertices` must be 3 or greater.

    DrawTriangleStripOneTex(State3D *state, float* vertices, uint32_t numvertices, Texture *texture);

Draws a triangle strip.  `vertices`, `texture`, and `numvertices` are as in `DrawTrianglesOneTex`. Moreover, `numvertices` must be 3 or greater.

    DrawTrianglesTwoTex(State3D *state, float* vertices, uint32_t numvertices,
       uint32_t * indices, uint32_t numindices, Texture *texture1, Texture *texture2);
    DrawTriangleFanTwoTex(State3D *state, float* vertices, uint32_t numvertices,
       uint32_t * indices, uint32_t numindices, Texture *texture1, Texture *texture2);
    DrawTriangleStripTwoTex(State3D *state, float* vertices, uint32_t numvertices,
       uint32_t * indices, uint32_t numindices, Texture *texture1, Texture *texture2);

Like the corresponding `...OneTex` versions, with the following exceptions. The `vertices` array is a rectangular array of vertices, where each vertex takes up ten `float` values: the x-, y-, and z-coordinates; the normal vector's X, Y, and Z components; the texture coordinates (U and V) for `texture1`; and the texture coordinates for `texture2`.  These functions are suggested here because some games from the late 1990s rely on so-called _light-map_ textures and two-texture blending rather than in-game lighting calculations.

This is far from a complete list of useful 3-D drawing functions; there may be others, but the goal is to define only those functions and 3-D capabilities actually used by video games in the 1990s and earlier.

The [**classic-graphics specification**](https://peteroupc.github.io/graphics.html) recognizes the following [**3-D graphics capabilities**](https://peteroupc.github.io/graphics.html#3_D_Graphics) as within its spirit: Z buffering (depth buffering), bilinear filtering, flat shading, Gouraud shading, perspective correction, per-vertex specular highlighting, per-vertex depth-based fog, line drawing, two-texture blending, edge antialiasing (smoothing), MIP mapping, source alpha blending, and destination alpha blending. The _PC 99 System Design Guide_ sections 14.27 to 14.34 (except for the screen resolution, frame rate, and double buffering requirements) are also in scope.  Stencil buffers, bump mapping, environment mapping, and three- or four-texture blending are borderline capabilities.

<a id=License></a>

## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).

<a id=Notes></a>

## Notes

[^1]: In this document, "rendering in software" means that the rendering of graphics does not rely on a video card, a graphics accelerator chip, or the operating system’s graphics API (such as GDI, OpenGL, or Direct3D) with the sole exception of sending a finished game screen image to the player's display (such as through GDI’s `StretchDIBits` or copying to VGA's video memory).  The following are examples of a graphics library that follows the spirit, even if not the letter, of the classic-graphics specification: [**_Tilengine_**](https://github.com/megamarc/Tilengine), [**_kit_**](https://github.com/rxi/kit/), [**_DOS-like_**](https://github.com/mattiasgustavsson/dos-like), [**_raylib_'s `rlsw` software renderer**](https://github.com/raysan5/raylib).  Michal Strehovský published an [**interesting technique to create small game applications**](https://migeel.sk/blog/2024/01/02/building-a-self-contained-game-in-csharp-under-2-kilobytes/).
