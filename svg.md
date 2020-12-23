# Essentials of SVG

The following short note explains the most useful things to know when writing vector graphics to SVG.

First, we start with a skeleton of an SVG file (which uses the XML data format):

    <svg width='300px' height='300px' viewBox='0 0 100 100'
         xmlns='http://www.w3.org/2000/svg'>
         <circle style='stroke:none;fill:red' cx='10' cy='10' r='2'/>
         <path style='stroke:black;fill:none' d='M10 10L20 20 L30 10Z'/>
    </svg>

In this very simple example, there are already several useful things we can see here:

- `width` and `height` give the size of the SVG in pixels relative to the host document.
- `viewBox` gives the size of the shape in SVG units (not pixels).  It has four numbers giving the left side, top side, width, and height.  Y coordinates run downwards.
- `circle` draws a circle.  `cx`, `cy`, and `r` gives the center's X coordinate, its Y coordinate, and its radius, all in SVG units.
- `path` gives the shape of the path in a compact form specified as the `d` attribute.  Each path is broken up into commands, which are [**detailed further in the SVG specification**](https://www.w3.org/TR/SVG/paths.html#PathData). The most important of these are perhaps M, L, and Z: the M command moves the pen; the L command draws with the pen, moving it to a new position; and the Z command closes the shape by drawing with the pen straight to the shape's beginning.  In general, numbers given in the path specification is in SVG units, relative to the SVG document itself.
- `style` gives styling instructions for the path or circle.  Perhaps the most important style rules are `stroke`, `fill`, and `stroke-width`, and the following are examples of the `style` attribute, which are mostly self-explanatory: `style='stroke:red;stroke-width:1px'`, `style='stroke:none;'`, `style='fill:blue;'`, `style='fill:none;'` (here `px` means an SVG unit, relative to the SVG document itself).

An SVG document can have any number of `path` and/or `circle` elements, and each one is a separate shape. Finally, each `path` and `circle` element can have a `transform` attribute, which describes an optional geometric transformation; the [**attribute's format**](https://www.w3.org/TR/SVG11/coords.html#TransformAttribute) is described in the SVG specification and is not detailed in this note.  Examples of the attribute include `transform='translate(3, 5)'`, `transform='rotate(90)'`, and `transform='scale(2) translate(2, 2)'`.

<a id=License></a>
## License

Any copyright to this page is released to the Public Domain.  In case this is not possible, this page is also licensed under [**Creative Commons Zero**](https://creativecommons.org/publicdomain/zero/1.0/).
