var tape = require("tape"),
    hpgl = require("../");

require("./pathEqual");

tape("hpgl is an instanceof hpgl", function(test) {
  var p = hpgl.hpgl();
  test.ok(p instanceof hpgl.hpgl);
  test.equal(p.constructor.name, "Hpgl");
  test.pathEqual(p, "");
  test.end();
});

tape("hpgl.moveTo(x, y) appends an PU command", function(test) {
  var p = hpgl.hpgl(); p.moveTo(150, 50);
  test.pathEqual(p, "PU 150,-50; PD;\n");
  p.lineTo(200, 100);
  test.pathEqual(p, "PU 150,-50; PD;\nPA 200,-100;\n");
  p.moveTo(100, 50);
  test.pathEqual(p, "PU 150,-50; PD;\nPA 200,-100;\nPU 100,-50; PD;\n");
  test.end();
});

tape("hpgl.closePath() draws a path the start", function(test) {
  var p = hpgl.hpgl(); p.moveTo(150, 50);
  test.pathEqual(p, "PU 150,-50; PD;\n");
  p.closePath();
  test.pathEqual(p, "PU 150,-50; PD;\nPA 150,-50;\n");
  p.lineTo(250, 150);
  p.closePath();
  test.pathEqual(p, "PU 150,-50; PD;\nPA 150,-50;\nPA 250,-150;\nPA 150,-50;\n");
  test.end();
});

tape("hpgl.closePath() does nothing if the path is empty", function(test) {
  var p = hpgl.hpgl();
  test.pathEqual(p, "");
  p.closePath();
  test.pathEqual(p, "");
  test.end();
});

tape("hpgl.lineTo(x, y) appends an PA command", function(test) {
  var p = hpgl.hpgl(); p.moveTo(150, 50);
  test.pathEqual(p, "PU 150,-50; PD;\n");
  p.lineTo(200, 100);
  test.pathEqual(p, "PU 150,-50; PD;\nPA 200,-100;\n");
  p.lineTo(100, 50);
  test.pathEqual(p, "PU 150,-50; PD;\nPA 200,-100;\nPA 100,-50;\n");
  test.end();
});

tape("hpgl.quadraticCurveTo(x1, y1, x, y) creates a series of PD commands", function(test) {
  var p = hpgl.hpgl(); p.moveTo(150, 50);
  test.pathEqual(p, "PU 150,-50; PD;\n");
  p.quadraticCurveTo(100, 50, 200, 100);
  test.pathEqual(p, "PU 150,-50; PD;\nPA 150,-50;\nPA 134,-50;\nPA 117,-53;\nPA 143,-71;\nPA 200,-100;\n");
  test.end();
});

tape("hpgl.bezierCurveTo(x1, y1, x, y) creates a series of PD commands", function(test) {
  var p = hpgl.hpgl(); p.moveTo(150, 50);
  test.pathEqual(p, "PU 150,-50; PD;\n");
  p.bezierCurveTo(100, 50, 0, 24, 200, 100);
  test.pathEqual(p, "PU 150,-50; PD;\nPA 150,-50;\nPA 109,-47;\nPA 83,-51;\nPA 138,-76;\nPA 200,-100;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, startAngle, endAngle) throws an error if the radius is negative", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100);
  test.throws(function () { p.arc(100, 100, -50, 0, Math.PI / 2); }, /negative radius/);
  test.end();
});

tape("hpgl.arc(x, y, radius, startAngle, endAngle) may append only an PU command if the radius is zero", function (test) {
  var p = hpgl.hpgl(); p.arc(100, 100, 0, 0, Math.PI / 2);
  test.pathEqual(p, "PU 100,-100; PD;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, startAngle, endAngle) may append only an PA command if the radius is zero", function (test) {
  var p = hpgl.hpgl(); p.moveTo(0, 0); p.arc(100, 100, 0, 0, Math.PI / 2);
  test.pathEqual(p, "PU 0,0; PD;\nPA 100,-100;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, startAngle, endAngle) may append only an PU command if the angle is zero", function (test) {
  var p = hpgl.hpgl(); p.arc(100, 100, 0, 0, 0);
  test.pathEqual(p, "PU 100,-100; PD;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, startAngle, endAngle) may append only an PU command if the angle is near zero", function (test) {
  var p = hpgl.hpgl(); p.arc(100, 100, 0, 0, 1e-16);
  test.pathEqual(p, "PU 100,-100; PD;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, startAngle, endAngle) may append an PU command if the path was empty", function (test) {
  var p = hpgl.hpgl(); p.arc(100, 100, 50, 0, Math.PI * 2);
  test.pathEqual(p, "PU 150,-100; PD;\nAA 100,-100,-360,5;\n");
  p = hpgl.hpgl(); p.arc(0, 50, 50, -Math.PI / 2, 0);
  test.pathEqual(p, "PU 0,0; PD;\nAA 0,-50,-90,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, startAngle, endAngle) may append an PD command if the arc doesn’t start at the current point", function (test) {
  var p = hpgl.hpgl(); p.moveTo(100, 100); p.arc(100, 100, 50, 0, Math.PI * 2);
  test.pathEqual(p, "PU 100,-100; PD;\nPA 150,-100;\nAA 100,-100,-360,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, startAngle, endAngle) appends a single AA command if the angle is less than π", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, Math.PI / 2);
  test.pathEqual(p, "PU 150,-100; PD;\nAA 100,-100,-90,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, startAngle, endAngle) appends a single AA command if the angle is less than τ", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, Math.PI * 1);
  test.pathEqual(p, "PU 150,-100; PD;\nAA 100,-100,-180,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, startAngle, endAngle) appends a single CI command if the angle is greater than τ", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, Math.PI * 2);
  test.pathEqual(p, "PU 150,-100; PD;\nAA 100,-100,-360,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, 0, π/2, false) draws a small clockwise arc", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, Math.PI / 2, false);
  test.skip(p, "PU 150,-100; PD;\nAA 100,-100,90,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, -π/2, 0, false) draws a small clockwise arc", function (test) {
  var p = hpgl.hpgl(); p.moveTo(100, 50); p.arc(100, 100, 50, -Math.PI / 2, 0, false);
  test.pathEqual(p, "PU 100,-50; PD;\nAA 100,-100,-90,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, 0, ε, true) draws an anticlockwise circle", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 1e-16, true);
  test.pathEqual(p, "PU 150,-100; PD;\nAA 100,-100,360,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, 0, ε, false) draws nothing", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 1e-16, false);
  test.pathEqual(p, "PU 150,-100; PD;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, 0, -ε, true) draws nothing", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, -1e-16, true);
  test.pathEqual(p, "PU 150,-100; PD;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, 0, -ε, false) draws a clockwise circle", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, -1e-16, false);
  test.pathEqual(p, "PU 150,-100; PD;\nAA 100,-100,-360,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, 0, τ, true) draws an anticlockwise circle", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 2 * Math.PI, true);
  test.pathEqual(p, "PU 150,-100; PD;\nAA 100,-100,360,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, 0, τ, false) draws a clockwise circle", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 2 * Math.PI, false);
  test.pathEqual(p, "PU 150,-100; PD;\nAA 100,-100,-360,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, 0, τ + ε, true) draws an anticlockwise circle", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 2 * Math.PI + 1e-13, true);
  test.pathEqual(p, "PU 150,-100; PD;\nAA 100,-100,360,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, 0, τ - ε, false) draws a clockwise circle", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 2 * Math.PI - 1e-13, false);
  test.pathEqual(p, "PU 150,-100; PD;\nAA 100,-100,-360,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, τ, 0, true) draws an anticlockwise circle", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 2 * Math.PI, true);
  test.pathEqual(p, "PU 150,-100; PD;\nAA 100,-100,360,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, τ, 0, false) draws a clockwise circle", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 2 * Math.PI, false);
  test.pathEqual(p, "PU 150,-100; PD;\nAA 100,-100,-360,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, 0, 13π/2, false) draws a clockwise circle", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 13 * Math.PI / 2, false);
  test.pathEqual(p, "PU 150,-100; PD;\nAA 100,-100,-360,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, 13π/2, 0, false) draws a big clockwise arc", function (test) {
  var p = hpgl.hpgl(); p.moveTo(100, 150); p.arc(100, 100, 50, 13 * Math.PI / 2, 0, false);
  test.pathEqual(p, "PU 100,-150; PD;\nAA 100,-100,-270,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, π/2, 0, false) draws a big clockwise arc", function (test) {
  var p = hpgl.hpgl(); p.moveTo(100, 150); p.arc(100, 100, 50, Math.PI / 2, 0, false);
  test.pathEqual(p, "PU 100,-150; PD;\nAA 100,-100,-270,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, 3π/2, 0, false) draws a small clockwise arc", function (test) {
  var p = hpgl.hpgl(); p.moveTo(100, 50); p.arc(100, 100, 50, 3 * Math.PI / 2, 0, false);
  test.pathEqual(p, "PU 100,-50; PD;\nAA 100,-100,-90,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, 15π/2, 0, false) draws a small clockwise arc", function (test) {
  var p = hpgl.hpgl(); p.moveTo(100, 50); p.arc(100, 100, 50, 15 * Math.PI / 2, 0, false);
  test.pathEqual(p, "PU 100,-50; PD;\nAA 100,-100,-90,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, 0, π/2, true) draws a big anticlockwise arc", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, Math.PI / 2, true);
  test.pathEqual(p, "PU 150,-100; PD;\nAA 100,-100,270,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, -π/2, 0, true) draws a big anticlockwise arc", function (test) {
  var p = hpgl.hpgl(); p.moveTo(100, 50); p.arc(100, 100, 50, -Math.PI / 2, 0, true);
  test.pathEqual(p, "PU 100,-50; PD;\nAA 100,-100,270,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, -13π/2, 0, true) draws a big anticlockwise arc", function (test) {
  var p = hpgl.hpgl(); p.moveTo(100, 50); p.arc(100, 100, 50, -13 * Math.PI / 2, 0, true);
  test.pathEqual(p, "PU 100,-50; PD;\nAA 100,-100,270,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, -13π/2, 0, false) draws a big clockwise arc", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, -13 * Math.PI / 2, false);
  test.pathEqual(p, "PU 150,-100; PD;\nAA 100,-100,-270,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, 0, 13π/2, true) draws a big anticlockwise arc", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100); p.arc(100, 100, 50, 0, 13 * Math.PI / 2, true);
  test.pathEqual(p, "PU 150,-100; PD;\nAA 100,-100,270,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, π/2, 0, true) draws a small anticlockwise arc", function (test) {
  var p = hpgl.hpgl(); p.moveTo(100, 150); p.arc(100, 100, 50, Math.PI / 2, 0, true);
  test.pathEqual(p, "PU 100,-150; PD;\nAA 100,-100,90,5;\n");
  test.end();
});

tape("hpgl.arc(x, y, radius, 3π/2, 0, true) draws a big anticlockwise arc", function (test) {
  var p = hpgl.hpgl(); p.moveTo(100, 50); p.arc(100, 100, 50, 3 * Math.PI / 2, 0, true);
  test.pathEqual(p, "PU 100,-50; PD;\nAA 100,-100,270,5;\n");
  test.end();
});

tape("path.arcTo(x1, y1, x2, y2, radius) throws an error if the radius is negative", function (test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100);
  test.throws(function () { p.arcTo(270, 39, 163, 100, -53); }, /negative radius/);
  test.end();
});

tape("path.arcTo(x1, y1, x2, y2, radius) appends an M command if the path was empty", function (test) {
  var p = hpgl.hpgl(); p.arcTo(270, 39, 163, 100, 53);
  test.pathEqual(p, "PU 270,-39; PD;\n");
  test.end();
});

tape("path.arcTo(x1, y1, x2, y2, radius) does nothing if the previous point was ⟨x1,y1⟩", function (test) {
  var p = hpgl.hpgl(); p.moveTo(270, 39); p.arcTo(270, 39, 163, 100, 53);
  test.pathEqual(p, "PU 270,-39; PD;\n");
  test.end();
});

tape("path.arcTo(x1, y1, x2, y2, radius) appends an L command if the previous point, ⟨x1,y1⟩ and ⟨x2,y2⟩ are collinear", function (test) {
  var p = hpgl.hpgl(); p.moveTo(100, 50); p.arcTo(101, 51, 102, 52, 10);
  test.pathEqual(p, "PU 100,-50; PD;\nPA 101,-51;\n");
  test.end();
});

tape("path.arcTo(x1, y1, x2, y2, radius) appends an L command if ⟨x1,y1⟩ and ⟨x2,y2⟩ are coincident", function (test) {
  var p = hpgl.hpgl(); p.moveTo(100, 50); p.arcTo(101, 51, 101, 51, 10);
  test.pathEqual(p, "PU 100,-50; PD;\nPA 101,-51;\n");
  test.end();
});

tape("path.arcTo(x1, y1, x2, y2, radius) appends an L command if the radius is zero", function (test) {
  var p = hpgl.hpgl(); p.moveTo(270, 182), p.arcTo(270, 39, 163, 100, 0);
  test.pathEqual(p, "PU 270,-182; PD;\nPA 270,-39;\n");
  test.end();
});

tape("path.arcTo(x1, y1, x2, y2, radius) appends L and A commands if the arc does not start at the current point", function (test) {
  var p = hpgl.hpgl(); p.moveTo(270, 182), p.arcTo(270, 39, 163, 100, 53);
  test.pathEqual(p, "PU 270,-182; PD;\nPA 270,-130;\nAA 244,-84,-119.69,5;\n");
  p = hpgl.hpgl(); p.moveTo(270, 182), p.arcTo(270, 39, 363, 100, 53);
  test.pathEqual(p, "PU 270,-182; PD;\nPA 270,-137;\nAA 323,-137,-123.26,5;\n");
  test.end();
});

tape("path.arcTo(x1, y1, x2, y2, radius) appends only an A command if the arc starts at the current point", function (test) {
  var p = hpgl.hpgl(); p.moveTo(100, 100), p.arcTo(200, 100, 200, 200, 100);
  test.pathEqual(p, "PU 100,-100; PD;\nAA 100,-200,-90,5;\n");
  test.end();
});

tape("path.arcTo(x1, y1, x2, y2, radius) sets the last point to be the end tangent of the arc", function (test) {
  var p = hpgl.hpgl(); p.moveTo(100, 100), p.arcTo(200, 100, 200, 200, 50); p.arc(150, 150, 50, 0, Math.PI);
  test.pathEqual(p, "PU 100,-100; PD;\nPA 150,-100;\nAA 150,-150,-90,5;\nAA 150,-150,-180,5;\n");
  test.end();
});

tape("hpgl.rect(x, y, w, h) appends M, h, v, h, and Z commands", function(test) {
  var p = hpgl.hpgl(); p.moveTo(150, 100), p.rect(100, 200, 50, 25);
  test.pathEqual(p, "PU 100,-200; PD;\nPA 150,-200;\nPA 150,-225;\nPA 100,-225;\nPA 100,-200;\n");
  test.end();
});
