import bezier from 'adaptive-bezier-curve'

const pi = Math.PI,
    tau = 2 * pi,
    epsilon = 1e-6,
    tauEpsilon = tau - epsilon,
    radDeg = 180 / Math.PI,
    bezierScale = 0.1,
    arcDeg = ',5';

function Hpgl() {
  this._x0 = this._y0 = // start of current subpath
  this._x1 = this._y1 = null; // end of current subpath
  this._ = [];
}

function hpgl() {
  return new Hpgl;
}

Hpgl.prototype = hpgl.prototype = {
  constructor: Hpgl,
  moveTo: function(x, y) {
    const l = this._.length
    y *= -1
    if (l && this._[l-1][0] === 'PU ') this._.pop()
    this._.push([
      "PU ", Math.round(this._x0 = this._x1 = +x), ",", Math.round(this._y0 = this._y1 = +y),
      "; PD"
    ]);
  },
  closePath: function() {
    if (this._x1 !== null) {
      this._.push(["PA ", Math.round(this._x1 = this._x0), ",", Math.round(this._y1 = this._y0)]);
    }
  },
  lineTo: function(x, y) {
    y *= -1
    this._.push(["PA ", Math.round(this._x1 = +x), ",", Math.round(this._y1 = +y)]);
  },
  quadraticCurveTo: function(x1, y1, x, y) {
    y1 *= -1
    y *= -1
    var points = bezier(
      [this._x0, this._y0],
      [x1, y1],
      [x1, y1],
      [this._x0 = this._x1 = +x, this._y0 = this._y1 = +y],
      bezierScale
    )
    for (var i = 0; i < points.length; i++) {
      this.lineTo(points[i][0], points[i][1] * -1)
    }
  },
  bezierCurveTo: function(x1, y1, x2, y2, x, y) {
    y1 *= -1
    y2 *= -1
    y *= -1
    var points = bezier(
      [this._x0, this._y0],
      [x1, y1],
      [x2, y2],
      [this._x0 = this._x1 = +x, this._y0 = this._y1 = +y],
      bezierScale
    )
    for (var i = 0; i < points.length; i++) {
      this.lineTo(points[i][0], points[i][1] * -1)
    }
  },
  arcTo: function (x1, y1, x2, y2, r) {
    x1 = +x1, y1 = +y1, x2 = +x2, y2 = +y2, r = +r;
    y1 *= -1
    y2 *= -1
    var x0 = this._x1,
      y0 = this._y1,
      x21 = x2 - x1,
      y21 = y2 - y1,
      x01 = x0 - x1,
      y01 = y0 - y1,
      l01_2 = x01 * x01 + y01 * y01;

    // Is the radius negative? Error.
    if (r < 0) throw new Error("negative radius: " + r);

    // Is this path empty? Move to (x1,y1).
    if (this._x1 === null) {
      // this._ += "M" + (this._x1 = x1) + "," + (this._y1 = y1);
      this.moveTo(x1, y1 * -1)
    }

    // Or, is (x1,y1) coincident with (x0,y0)? Do nothing.
    else if (!(l01_2 > epsilon)) { }

    // Or, are (x0,y0), (x1,y1) and (x2,y2) collinear?
    // Equivalently, is (x1,y1) coincident with (x2,y2)?
    // Or, is the radius zero? Line to (x1,y1).
    else if (!(Math.abs(y01 * x21 - y21 * x01) > epsilon) || !r) {
      // this._ += "L" + (this._x1 = x1) + "," + (this._y1 = y1);
      this.lineTo(x1, y1 * -1)
    }

    // Otherwise, draw an arc!
    else {
      var x20 = x2 - x0,
        y20 = y2 - y0,
        l21_2 = x21 * x21 + y21 * y21,
        l20_2 = x20 * x20 + y20 * y20,
        l21 = Math.sqrt(l21_2),
        l01 = Math.sqrt(l01_2),
        l = r * Math.tan((pi - Math.acos((l21_2 + l01_2 - l20_2) / (2 * l21 * l01))) / 2),
        t01 = l / l01,
        t21 = l / l21;

      // If the start tangent is not coincident with (x0,y0), line to.
      if (Math.abs(t01 - 1) > epsilon) {
        this.lineTo(x1 + t01 * x01, (y1 + t01 * y01) * -1)
      }

      const x3 = (x1 + t21 * x21)
      const y3 = (y1 + t21 * y21)

      var h = Math.hypot(x3 - this._x1, y3 - this._y1)
      const a = Math.asin(h / 2 / r) * 2

      var x4 = (this._x1 + x3) / 2
      var y4 = (this._y1 + y3) / 2

      var basex = Math.sqrt((r * r) - (Math.pow(h / 2, 2))) * (y3 - this._y1) / h
      var basey = Math.sqrt((r * r) - (Math.pow(h / 2, 2))) * (this._x1 - x3) / h

      this._.push([
        "AA ", Math.round(x4 + basex), ",", Math.round(y4 + basey), ",", (-a * radDeg).toFixed(2), arcDeg
      ]);

      this._x1 = x3
      this._y1 = y3
    }
  },
  arc: function(x, y, r, a0, a1, ccw) {
    x = +x, y = +y * -1, r = +r;
    var dx = r * Math.cos(a0),
        dy = r * Math.sin(a0) * -1,
        x0 = x + dx,
        y0 = y + dy,
        cw = 1 ^ ccw,
        da = ccw ? a0 - a1 : a1 - a0;

    // Is the radius negative? Error.
    if (r < 0) throw new Error("negative radius: " + r);

    // Is this path empty? Move to (x0,y0).
    if (this._x1 === null) {
      this.moveTo(x0, y0 * -1)
    }

    // Or, is (x0,y0) not coincident with the previous point? Line to (x0,y0).
    else if (Math.abs(this._x1 - x0) > epsilon || Math.abs(this._y1 - y0) > epsilon) {
      this.lineTo(x0, y0 * -1)
    }

    // Is this arc empty? We’re done.
    if (!r) return;

    // Does the angle go the wrong way? Flip the direction.
    if (da < 0) da = da % tau + tau;

    // Is this a complete circle?
    if (da > tauEpsilon) {
      this._.push([
        "AA ", Math.round(x), ",", Math.round(y), ",", cw ? -360 : 360, arcDeg
      ]);
    }

    // Otherwise, draw an arc!
    else if (da > epsilon) {
      if (cw) {
        da = -da
      }

      this._.push([
        "AA ", Math.round(x), ",", Math.round(y), ",", (radDeg * da).toFixed(2), arcDeg
      ]);
      this._x1 = x + r * Math.cos(a1)
      this._y1 = y * -1 + r * Math.sin(a1)
    }
  },
  rect: function(x, y, w, h) {
    this.moveTo(x, y)
    this.lineTo(x+w, y)
    this.lineTo(x+w, y+h)
    this.lineTo(x, y+h)
    this.lineTo(x, y)
  },
  toString: function() {
    if (!this._.length) return ""
    return this._.map(function(d) {
      return d.join("")
    }).join(';\n') + ';\n';
  }
};

export default hpgl;
