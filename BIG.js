class BIG {
  constructor(coeff, exp) {
    this.coeff = coeff;
    this.exp = exp;

    if (this.coeff === 0)
      return;

    const neg = this.coeff < 0;
    if (neg)
      this.coeff = -this.coeff;

    // make coeff (10.0, 1.0] exclusive
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

  mul(other) {
    return new BIG(this.coeff * other.coeff, this.exp + other.exp);
  }

  div(other) {
    return new BIG(this.coeff / other.coeff, this.exp - other.exp);
  }

  gt(other) {
    return this.exp > other.exp
      || (this.exp == other.exp && this.coeff > other.coeff);
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
    return this.add(new BIG(-other.coeff, other.exp));
  }
}
