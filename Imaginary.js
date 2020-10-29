class Imaginary {
  constructor(re, im) {
    this.re = re;
    this.im = im;

    if (this.im === undefined)
      this.im = new BIG(0);
  }

  add(other) {
    if (typeof(other) === "number")
      return new Imaginary(this.re.add( new BIG(other) ), this.im);
    else
      return new Imaginary(this.re.add( other.re ), this.im.add( other.im ));
  }

  sub(other) {
    if (typeof(other) === "number")
      return new Imaginary(this.re.add( new BIG(-other) ), this.im);
    else
      return new Imaginary(this.re.sub( other.re ), this.im.sub( other.im ));
  }

  mul(other) {
    if (typeof(other) === "number")
      return new Imaginary(this.re.mul( other ), this.im);
    else
      return new Imaginary(this.re.mul( other.re ).sub( this.im.mul( other.im ) ),
                           this.im.mul( other.re ).add( this.re.mul( other.im ) ));
  }

  sq_abs() {
    return this.re.mul( this.re ).add( this.im.mul( this.im ) );
  }
}
