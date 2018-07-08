const d3path = require("d3-path")
const hpgl = require("../")
const multiContext = require("d3-multi-context")
const fs = require("fs")
const path = require("path")

const halfPi = Math.PI / 2
const pi = Math.PI
const tau = Math.PI * 2

const coords = {
  top: 0,
  right: 14540,
  bottom: 10080,
  left: 0
}

const ctx = multiContext.path([
  hpgl.hpgl(),
  d3path.path()
])

// lineTo - horizontals
for (let i = 0; i <= 5; i++) {
  ctx.moveTo(i % 2 ? 0 : 500, 4000 + i * 100);
  ctx.lineTo(i % 2 ? 500 : 0, 4000 + i * 100);
}

// lineTo - verticals
for (let i = 0; i <= 5; i++) {
  ctx.moveTo(600 + i * 100, i % 2 ? 4000 : 4500);
  ctx.lineTo(600 + i * 100, i % 2 ? 4500 : 4000);
}

// lineTo - diagonales
ctx.moveTo(1200, 4100);
ctx.lineTo(1300, 4000);
ctx.moveTo(1400, 4000);
ctx.lineTo(1200, 4200);
ctx.moveTo(1200, 4300);
ctx.lineTo(1500, 4000);
ctx.moveTo(1600, 4000);
ctx.lineTo(1200, 4400);
ctx.moveTo(1200, 4500);
ctx.lineTo(1700, 4000);
ctx.moveTo(1300, 4500);
ctx.lineTo(1700, 4100);
ctx.moveTo(1700, 4200);
ctx.lineTo(1400, 4500);
ctx.moveTo(1500, 4500);
ctx.lineTo(1700, 4300);
ctx.moveTo(1700, 4400);
ctx.lineTo(1600, 4500);

// lineTo, closePath - Triangle
ctx.moveTo(2050, 4000);
ctx.lineTo(2300, 4500);
ctx.lineTo(1800, 4500);
ctx.closePath()

// arc - circles
ctx.moveTo(2850, 4250);
ctx.arc(2600, 4250, 250, 0, tau);
ctx.moveTo(2750, 4250);
ctx.arc(2600, 4250, 150, 0, tau, true);
ctx.moveTo(2650, 4250);
ctx.arc(2600, 4250, 50, 0, tau);

// arc - arc segment
let s = pi * 0.75
let r = 250
ctx.moveTo(3200 + Math.cos(s) * r, 4250 + Math.sin(s) * r);
ctx.arc(3200, 4250, r, s, pi * 0.25);
r = 150
ctx.arc(3200, 4250, r, pi * 0.25, s, true);
ctx.closePath();

// arcTo
ctx.moveTo(3750, 4500);
ctx.arcTo(3500, 4500, 3750, 4000, 50);
ctx.arcTo(3750, 4000, 4000, 4500, 50);
ctx.arcTo(4000, 4500, 3500, 4500, 50);
ctx.closePath()

// quadraticCurveTo
let a = 100
for (let i = 0; i <= 5; i++) {
  let x = 4100
  let y = 4000 + i * 100
  ctx.moveTo(x, y);
  ctx.quadraticCurveTo(x + 250, y + (i % 2 ? -a : a), x + 500, y);
}

// bezierCurveTo
for (let i = 0; i <= 5; i++) {
  let x = 4700
  let y = 4000 + i * 100
  a += 200
  ctx.moveTo(x, y);
  ctx.bezierCurveTo(x + 250, y + a, x + 250, y - a, x + 500, y);
}

// D3 logo
ctx.moveTo(0, 0);
ctx.lineTo(155, 0);
ctx.arc(155, 910, 910, -halfPi, halfPi);
ctx.lineTo(0, 1820);
ctx.lineTo(0, 1420);
ctx.arc(155, 910, 510, halfPi, -halfPi, 1);
ctx.lineTo(0, 400);
ctx.closePath();

ctx.moveTo(725, 0);
ctx.lineTo(1365, 0);
ctx.arc(1365, 555, 555, -halfPi, 0.6940);
ctx.arc(1365, 1265, 555, -0.6940, halfPi);
ctx.lineTo(725, 1820);
ctx.arc(155, 910, 1073.79, 1.0111, 0.4949, 1);
ctx.lineTo(1365, 1420);
ctx.arc(1365, 1265, 155, halfPi, -halfPi, 1);
ctx.lineTo(1210, 1110);
ctx.arc(155, 910, 1073.79, 0.1873, -0.1873, 1);
ctx.lineTo(1365, 710);
ctx.arc(1365, 555, 155, halfPi, -halfPi, 1);
ctx.lineTo(1100, 400);
ctx.arc(155, 910, 1073.79, -0.4949, -1.0111, 1);
ctx.closePath();

// HPGL
// Font from http://moebio.com/research/typode/
// Thanks Moebio <3
const font = {
  "H": [[[0, 3], [0, 0]], [[2, 3], [2, 0]], [[0, 1], [2, 1]]],
  "P": [[[0, 3], [0, 0], [2, 0], [2, 2], [0, 2]]],
  "G": [[[2, 0], [0, 0], [0, 3], [2, 3], [2, 2], [1, 2]]],
  "L": [[[2, 3], [0, 3], [0, 0]]]
}

const letters = 'HPGL'.split('')

let y = 2100
let scale = 220
letters.forEach((l, i) => {
  let x = scale * i * 2.3
  font[l].forEach(c => {
    // console.log(c)
    ctx.moveTo(x + c[0][0] * scale, y + c[0][1] * scale)
    c.forEach(d => ctx.lineTo(x + d[0] * scale, y + d[1] * scale))
  })
})


var out = ctx.toArray()
writeHpgl(out[0])
writeSvg(out[1])

function writeHpgl(out) {
  const outHpgl = `IN;\nSP 1;\n${out}PU;\nSP 0;\n`
  const f = path.join(__dirname, "example.hpgl")
  fs.writeFileSync(f, outHpgl)
  console.log(`Writen ${f}`, outHpgl.length + ' bytes')
}

function writeSvg(out) {
  const outSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${[coords.left, coords.top, coords.right - coords.left, coords.bottom - coords.top]}">
  <defs></defs>
  <rect x="${coords.left}" y="${coords.top}" width="${coords.right - coords.left}" height="${coords.bottom - coords.top}" fill="white"/>
  <circle r="100"/>
  <path fill="none" stroke="#f90" vector-effect="non-scaling-stroke" d="${out}" />
  </svg>`

  const f = path.join(__dirname, "example.svg")
  fs.writeFileSync(f, outSvg)
}
