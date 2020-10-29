class BIG {
  constructor(coeff, exp) {
    this.coeff = coeff;
    this.exp = exp;

    if (this.exp === undefined)
      this.exp = 0;

    if (this.coeff === 0)
      return;

    const neg = this.coeff < 0;
    if (neg)
      this.coeff = -this.coeff;

    // make coeff in range ]10.0, 1.0]
    while (this.coeff >= 10.0)
    {
      this.coeff /= 10;
      this.exp += 1;
    }

    while (this.coeff < 1.0)
    {
      this.coeff *= 10;
      this.exp -= 1;
    }

    if (neg)
      this.coeff = -this.coeff;
  }

  to_int() {
    return this.coeff * Math.pow(10, this.exp);
  }

  mul(other) {
    if (typeof(other) === "object")
      return new BIG(this.coeff * other.coeff, this.exp + other.exp);
    else
      return new BIG(this.coeff * other, this.exp);
  }

  div(other) {
    return new BIG(this.coeff / other.coeff, this.exp - other.exp);
  }

  gt(other) {
    return this.exp > other.exp
      || (this.exp == other.exp && this.coeff > other.coeff);
  }

  lt(other) {
    return !this.gt(other);
  }

  add(other) {
    var bigger = other;
    var smaller = this;

    if (this.gt(other))
    {
      bigger = this;
      smaller = other;
    }

    const diff = bigger.exp - smaller.exp;
    if (diff > 5)
      return bigger;

    var c = smaller.coeff;
    for (var i = 0; i < diff; i++)
      c /= 10;

    return new BIG(bigger.coeff + c, bigger.exp);
  }

  sub(other) {
    return this.add( new BIG(-other.coeff, other.exp) );
  }

}
