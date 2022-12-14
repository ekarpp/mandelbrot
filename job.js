onmessage = (e) => {
  const space = e.data.vals.space;
  const lim = e.data.vals.lim;
  const wx = e.data.vals.width;
  const wy = e.data.vals.height;
  const shading = e.data.vals.shading;

  var res = [];
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
      while (count < lim && re2 + im2 < R*R)
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
};

// escape radius, bigger the better, only slight effect on speed
const R = 100;

// incoming light direction
const a = Math.PI / 8;
const l_re = Math.cos(a);
const l_im = Math.sin(a);
const l_z = 1.5;
