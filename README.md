![d3-hpgle](https://thumbs.gfycat.com/MindlessWaterloggedAmethystsunbird-size_restricted.gif)

# d3-hpgl

D3-hpgl is a adaptor with the same API as [d3-path](https://github.com/d3/d3-path) which outputs [HPGL](https://en.wikipedia.org/wiki/HPGL) which is used with pen plotters and other equipment.

Say you have some code that draws to a 2D canvas:

```js
function drawCircle(context, radius) {
  context.moveTo(radius, 0);
  context.arc(0, 0, radius, 0, 2 * Math.PI);
}
```

The d3-hpgl module lets you take this exact code and additionally render to [HPGL](https://en.wikipedia.org/wiki/HPGL). It works by [serializing](#hpgl_toString) [CanvasPathMethods](http://www.w3.org/TR/2dcontext/#canvaspathmethods) calls to HPGL.

Please note, since *HPGL doesn't directly support beziers*, they are implemented as a series of `lineTo` commands using [adaptive-bezier-curve](https://www.npmjs.com/package/adaptive-bezier-curve).

See also [d3-multi-context](https://www.npmjs.com/package/d3-multi-context) for rendering to multiple contexts.

So far I've only tested the output HPGL with my plotter which is a Roland DPX-3300. Please let me know if you have problems or success with other plotters.

```js
var context = d3.hpgl();
drawCircle(context, 40);
console.log(context.toString()));
```

Now code you write once can be used with any HPGL compatible device along with both Canvas (for performance) and SVG (for convenience). For a practical example of shapes you can create, see [d3-shape](https://github.com/d3/d3-shape).

See (and try plotting) the [example.hpgl](https://github.com/aubergene/d3-hpgl/blob/master/examples/example.hpgl) and [example.svg](https://github.com/aubergene/d3-hpgl/blob/master/examples/example.svg) for reference.

## Installing

If you use NPM, `npm install d3-hpgl`. Otherwise, download the [latest release](https://github.com/aubergene/d3-hpgl/releases/latest). AMD, CommonJS, and vanilla environments are supported. In vanilla, a `d3` global is exported:

```js
var path = d3.hpgl();
path.moveTo(1, 2);
path.lineTo(3, 4);
path.closePath();
```

## Coordinate System

The plotting coordinate system is same as for Canvas. This means positive x goes right and positive y goes down. The actual HPGL which is output is reversed so if you read the HPGL which is output the Y axis coordinates and degree output for arcs will be inverted. You shouldn't need to think about this unless you're debugging the HPGL output.

## API Reference

<a name="hpgl" href="#hpgl">#</a> d3.<b>hpgl</b>() [<>](https://github.com/aubergene/d3-hpgl/blob/master/src/hpgl.js")

Constructs a new path serializer that implements [CanvasPathMethods](http://www.w3.org/TR/2dcontext/#canvaspathmethods).

<a name="hpgl_moveTo" href="#hpgl_moveTo">#</a> <i>hpgl</i>.<b>moveTo</b>(<i>x</i>, <i>y</i>) [<>](https://github.com/aubergene/d3-hpgl/blob/master/src/hpgl.js "Source")

Move to the specified point ⟨*x*, *y*⟩. [*context*.moveTo](http://www.w3.org/TR/2dcontext/#dom-context-2d-moveto) and SVG’s [“moveto” command](http://www.w3.org/TR/SVG/paths.html#PathDataMovetoCommands).

<a name="hpgl_closePath" href="#hpgl_closePath">#</A> <i>hpgl</i>.<b>closePath</b>() [<>](https://github.com/aubergene/d3-hpgl/blob/master/src/hpgl.js "Source")

Ends the current subpath and causes an automatic straight line to be drawn from the current point to the initial point of the current subpath. Equivalent to [*context*.closePath](http://www.w3.org/TR/2dcontext/#dom-context-2d-closepath) and SVG’s [“closepath” command](http://www.w3.org/TR/SVG/paths.html#PathDataClosePathCommand).

<a name="hpgl_lineTo" href="#hpgl_lineTo">#</a> <i>hpgl</i>.<b>lineTo</b>(<i>x</i>, <i>y</i>) [<>](https://github.com/aubergene/d3-hpgl/blob/master/src/hpgl.js "Source")

Draws a straight line from the current point to the specified point ⟨*x*, *y*⟩. Equivalent to [*context*.lineTo](http://www.w3.org/TR/2dcontext/#dom-context-2d-lineto) and SVG’s [“lineto” command](http://www.w3.org/TR/SVG/paths.html#PathDataLinetoCommands).

<a name="hpgl_quadraticCurveTo" href="#hpgl_quadraticCurveTo">#</a> <i>hpgl</i>.<b>quadraticCurveTo</b>(<i>cpx</i>, <i>cpy</i>, <i>x</i>, <i>y</i>) [<>](https://github.com/aubergene/d3-hpgl/blob/master/src/hpgl.js "Source")

Draws a quadratic Bézier segment from the current point to the specified point ⟨*x*, *y*⟩, with the specified control point ⟨*cpx*, *cpy*⟩. Equivalent to [*context*.quadraticCurveTo](http://www.w3.org/TR/2dcontext/#dom-context-2d-quadraticcurveto) and SVG’s [quadratic Bézier curve commands](http://www.w3.org/TR/SVG/paths.html#PathDataQuadraticBezierCommands).

<a name="hpgl_bezierCurveTo" href="#hpgl_bezierCurveTo">#</a> <i>hpgl</i>.<b>bezierCurveTo</b>(<i>cpx1</i>, <i>cpy1</i>, <i>cpx2</i>, <i>cpy2</i>, <i>x</i>, <i>y</i>) [<>](https://github.com/aubergene/d3-hpgl/blob/master/src/hpgl.js "Source")

Draws a cubic Bézier segment from the current point to the specified point ⟨*x*, *y*⟩, with the specified control points ⟨*cpx1*, *cpy1*⟩ and ⟨*cpx2*, *cpy2*⟩. Equivalent to [*context*.bezierCurveTo](http://www.w3.org/TR/2dcontext/#dom-context-2d-beziercurveto) and SVG’s [cubic Bézier curve commands](http://www.w3.org/TR/SVG/paths.html#PathDataCubicBezierCommands).

<a name="hpgl_arcTo" href="#hpgl_arcTo">#</a> <i>hpgl</i>.<b>arcTo</b>(<i>x1</i>, <i>y1</i>, <i>x2</i>, <i>y2</i>, <i>radius</i>) [<>](https://github.com/aubergene/d3-hpgl/blob/master/src/hpgl.js "Source")

Draws a circular arc segment with the specified *radius* that starts tangent to the line between the current point and the specified point ⟨*x1*, *y1*⟩ and ends tangent to the line between the specified points ⟨*x1*, *y1*⟩ and ⟨*x2*, *y2*⟩. If the first tangent point is not equal to the current point, a straight line is drawn between the current point and the first tangent point. Equivalent to [*context*.arcTo](http://www.w3.org/TR/2dcontext/#dom-context-2d-arcto) and uses SVG’s [elliptical arc curve commands](http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands).

<a name="hpgl_arc" href="#hpgl_arc">#</a> <i>hpgl</i>.<b>arc</b>(<i>x</i>, <i>y</i>, <i>radius</i>, <i>startAngle</i>, <i>endAngle</i>[, <i>anticlockwise</i>]) [<>](https://github.com/aubergene/d3-hpgl/blob/master/src/hpgl.js "Source")

Draws a circular arc segment with the specified center ⟨*x*, *y*⟩, *radius*, *startAngle* and *endAngle*. If *anticlockwise* is true, the arc is drawn in the anticlockwise direction; otherwise, it is drawn in the clockwise direction. If the current point is not equal to the starting point of the arc, a straight line is drawn from the current point to the start of the arc. Equivalent to [*context*.arc](http://www.w3.org/TR/2dcontext/#dom-context-2d-arc) and uses SVG’s [elliptical arc curve commands](http://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands).

<a name="hpgl_rect" href="#hpgl_rect">#</a> <i>hpgl</i>.<b>rect</b>(<i>x</i>, <i>y</i>, <i>w</i>, <i>h</i>) [<>](https://github.com/aubergene/d3-hpgl/blob/master/src/hpgl.js "Source")

Creates a new subpath containing just the four points ⟨*x*, *y*⟩, ⟨*x* + *w*, *y*⟩, ⟨*x* + *w*, *y* + *h*⟩, ⟨*x*, *y* + *h*⟩, with those four points connected by straight lines, and then marks the subpath as closed. Equivalent to [*context*.rect](http://www.w3.org/TR/2dcontext/#dom-context-2d-rect) and uses SVG’s [“lineto” commands](http://www.w3.org/TR/SVG/paths.html#PathDataLinetoCommands).

<a name="hpgl_toString" href="#hpgl_toString">#</a> <i>hpgl</i>.<b>toString</b>() [<>](https://github.com/aubergene/d3-hpgl/blob/master/src/hpgl.js "Source")

Returns the string representation of this *path* in HPGL.
