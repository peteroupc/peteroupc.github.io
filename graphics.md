# Graphics Challenge for Retro Style Games

An interesting challenge for game developers.

Limit 3D graphics to the following:

1. No more than 2048 polygons can be displayed at a time.
    * A polygon is either a triangle, a convex quadrilateral, or a line segment.
    * Each vertex of the polygon must point to a vertex from the vertex list described below.
    * Each polygon can be translucent and/or wireframed.

2. No more than 6144 vertices can be used at a time.
    * A vertex consists of an XYZ position, an XY texture coordinate, and an RGB vertex color.
    * For each color, the red component is 5 bits, the green, 5 bits, and the blue, 5 bits.

3. Textures must have the same color format as vertex colors, or may employ a 4-, 16-, or 256-color palette with that color format.  Texture rendering supports flips and repeats on either or both axes.  Maximum image size of textures is 192 kibibytes.
4. Depth tests, clear colors, and fog colors are supported.
5. The 3D graphics buffer's resolution is the same as the screen resolution.

Limit 2D graphics to the following:

1. Three tile-based 2D layers.  If 3D graphics are not being displayed, there is a fourth 2D layer.  Otherwise, there is a layer for the 3D graphics.
2. Each tile is 8&times;8 pixels and uses no more than 16 colors.
3. Memory for 2D sprites.  The sprites may be tile-based, bitmap-based, or both.  No more than 256 kibibytes of sprite memory may be used.

General:

- The 3D graphics layer, if any, can be alpha blended with the 2D graphics layers in any order.
- 256&times;192 screen resolution with 60 frames per second, or 256&times;384 screen resolution with 30 frames per second.

A game might use a different resolution than shown.  In that case, the maximum allowed number of polygons and vertices and the maximum texture and sprite memory sizes will change in proportion to the new resolution.

A game may impose further limitations to the specifications given here (for example, to reduce the maximum number of 3D polygons or reduce the number of colors per tile allowed).  I would be interested in knowing about these limitations that new game that adopts this document decides to impose.

These limitations were inspired by the graphics limitations of classic handheld game consoles.

<a id=License></a>

## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
