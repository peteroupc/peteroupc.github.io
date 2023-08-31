# Graphics Challenge for Retro Style Games

An interesting challenge for game developers.

Limit 3D graphics to the following:

1. No more than 2048 polygons can be displayed at a time.
    * A polygon is either a triangle, a convex quadrilateral, or a line segment.
    * Each vertex of the polygon must point to a vertex from the vertex list described below.
    * Each polygon can be translucent and/or wireframed.

2. Polygons undergo perspective-correct rendering.
3. No more than 6144 vertices can be used at a time.
    * A vertex consists of an XYZ position, an XY texture coordinate, and an RGB vertex color.
    * For each color, the red component is 5 bits, the green, 5 bits, and the blue, 5 bits.

4. Textures must have the same color format as vertex colors, or may employ a 4-, 16-, or 256-color palette with that color format.  Texture rendering supports flips and repeats on either or both axes.  Maximum image size of textures is 192 kibibytes.
5. Depth tests, clear colors, and fog colors are supported.
6. The 3D graphics buffer's resolution is the same as the screen resolution.

Limit 2D graphics to the following:

1. Up to three tile-based 2D layers can be displayed at a time.  If 3D graphics are not being displayed, a fourth 2D layer can also be displayed.  Otherwise, a layer for the 3D graphics can be displayed.
2. There are sixteen palettes of 16 colors each (using the color format for vertex colors).
3. Each tile is 8&times;8 pixels and uses the colors of one of the sixteen palettes just described.
4. The 2D and 3D layers may contain transparent parts.
5. One of the 2D layers can undergo a 2D affine transformation.
6. Separate from layers, 2D sprites can be displayed.  No more than 128 sprites may be displayed at a time. Each sprite may be tile-based or bitmap-based and must have a width and height of no more than 64 pixels each.  Sprites may contain transparent parts.

General:

- The 3D graphics layer, if any, can be alpha blended with the 2D graphics layers in any order.
- 256&times;192 screen resolution with up to 60 frames per second, or 256&times;384 screen resolution with up to 30 frames per second.
- A game may limit the amount of graphics memory (akin to VRAM) to a certain maximum size, say, 2048 kibibytes.  This does not limit the size or number of graphics assets a game can have.
- Music:  Standard MIDI files (SMF) only.  The files should be rendered using a cross-platform open-source software synthesizer, using either FM or wavetable synthesis.[^1]  As much as possible, instruments should match their usual MIDI meanings.

A game might use a different resolution than shown.  In that case, the maximum allowed number of polygons and vertices and the maximum texture size, sprite size, and sprite count, as well as the maximum graphics memory size, if any, will change in proportion to the new resolution. (For example, if the resolution is 640&times;480 with up to 60 frames per second, these maximums are multiplied by 6.25 = (640&times;480) / (256&times;192).)

These limitations were inspired by the graphics limitations of classic handheld game consoles.

A game may impose further resource limits to the specifications given here (for example, to reduce the maximum number of 3D polygons, to disallow polygons, or to reduce the number of colors per tile allowed).  I would be interested in knowing about these limitations that a new game that adopts this document decides to impose.  I would also be interested in learning about a free and open-source graphics library that implements this specification.[^2]

<a id=License></a>

## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).

----------------

[^1]: I note that it's possible to write an FM software synthesizer supporting every MIDI instrument in less than 1024 kibibytes of code.

[^2]: Especially if the library is self-contained and implements the specification with as little source code as possible.  It would not be within the spirit of this document to, say, display more polygons or vertices at a time than the maximum allowed using programming tricks, but any such tricks should not be hardware-accelerated.  An example of a 2D library that follows the spirit of this specification, even though it doesn't necessarily meet its requirements exactly, is called [**_Tilengine_**](https://github.com/megamarc/Tilengine).
