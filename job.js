importScripts("./BIG.js");
importScripts("./Imaginary.js");

onmessage = (e) => {
  if (e.data.vals.perturb !== null)
    return perturbate(e);

  const space = e.data.vals.space;
  const lim = e.data.vals.lim;
  const wx = e.data.vals.width;
  const wy = e.data.vals.height;
  const shading = e.data.vals.shading;

  var res = []
  if (shading)
    var res_s = [];

  for (var y = e.data.from; y < e.data.till; y++)
  {
    res[y - e.data.from] = [];
    if (shading)
      res_s[y - e.data.from] = [];
    for (var x = 0; x < wx; x++)
    {
      const c_re = space.x + space.dim * x/wx;
      const c_im = space.y - space.dim * y/wy;

      // z_0 = 0
      // z_n+1 = z_n^2 + c
      var z_re = 0.0;
      var z_im = 0.0;

      var re2 = 0.0;
      var im2 = 0.0;

      if (shading)
      {
        // derivative w.r.t. c
        var d_re = 0.0;
        var d_im = 0.0;
      }

      var count = 0;
      while (count < lim && re2 + im2 < R)
      {
        count++;

        if (shading)
        {
          const nd_re = 2*(d_re*z_re - d_im*z_im) + 1;
          const nd_im = 2*(d_re*z_im + d_im*z_re);

          d_re = nd_re;
          d_im = nd_im;
        }

        // (a+bi)^2 = a^2 - b^2 + 2abi
        const n_re = re2 - im2 + c_re;
        const n_im = 2*z_re*z_im + c_im;

        z_re = n_re;
        z_im = n_im;

        re2 = z_re * z_re;
        im2 = z_im * z_im;
      }



      if (count === lim)
      {
        res[y - e.data.from][x] = 0;
        if (shading)
          res_s[y - e.data.from][x] = 0;
      }
      else
      {
        // real iteration number: count - ln(ln(sqrt(re2 + im2) / ln(R))) / ln(2)
        res[y - e.data.from][x] = count + 1
          - (Math.log(Math.log(re2 + im2)) - Math.log(Math.log(R))) / Math.log(2);


        if (shading)
        {
          // u = z/d
          var u_re = (z_re*d_re + z_im*d_im) / (d_re*d_re + d_im*d_im);
          var u_im = (z_im*d_re - z_re*d_im) / (d_re*d_re + d_im*d_im);
          // normalize
          const abs = Math.sqrt(u_re*u_re + u_im*u_im);
          u_re /= abs;
          u_im /= abs;

          // dot product with light direction
          var t = (u_re*l_re + u_im*l_im + l_z);
          t /= (1 + l_z);
          t = Math.max(0, t);

          res_s[y - e.data.from][x] = t;
        }
      }
    }
  }
  postMessage({from: e.data.from, result: res, shading: res_s});
}

function perturbate(e)
{
  const space = e.data.vals.space;
  const lim = e.data.vals.lim;
  const wx = e.data.vals.width;
  const wy = e.data.vals.height;
  const shading = e.data.vals.shading;
  const perturb = e.data.vals.perturb;

  const to_im = (v) => {
    const re = new BIG(v.re.coeff, v.re.exp);
    const im = new BIG(v.im.coeff, v.im.exp);
    return new Imaginary(re, im);
  };


  const A = perturb.A.map(to_im);
  const B = perturb.B.map(to_im);
  const C = perturb.C.map(to_im);
  const X = perturb.X.map(to_im);
  console.log("X", X);
  console.log("A", A);
  console.log("B", B);
  console.log("C", C);
  var res = [];
  if (shading)
    var res_s = [];

  for (var y = e.data.from; y < e.data.till; y++)
  {
    console.log(y);
    res[y - e.data.from] = [];
    if (shading)
      res_s[y - e.data.from] = [];
    for (var x = 0; x < wx; x++)
    {
      const y0 = new Imaginary(
        new BIG(space.x + space.dim * x/wx),
        new BIG(space.y - space.dim * y/wy));

      const d0 = y0.sub(X[0]);
      var i = 1;
      var Yi = y0;
      var di = d0;
      while (i <= lim && Yi.sq_abs().lt(BIG_R))
      {
        const tmp = X[i-1].mul( di ).mul( 2 ).add( di.mul(di) ).add( d0 );
        di = tmp;
        Yi = di.add( X[i] );
        i += 1;
      }

      if (i > lim)
        res[y - e.data.from][x] = 0;
      else
        res[y - e.data.from][x] = i + 1
          - (Math.log(Math.log(Yi.sq_abs().to_int())) - Math.log(Math.log(R))) / Math.log(2);
    }

  }
  postMessage({from: e.data.from, result: res, shading: res_s});

}

// escape radius, bigger the better, only slight effect on speed
const R = 100*100;
const BIG_R = new BIG(R);
// incoming light direction
const a = Math.PI / 8;
const l_re = Math.cos(a);
const l_im = Math.sin(a);
const l_z = 1.5;
