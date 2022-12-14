// the work to be done by each thread
// computes n lines from the image

onmessage = e => {
  const from = e.data.from;
  const until = e.data.until;
  const config = e.data.config;

  const space = config.space;
  const iterations = config.iterations;
  const wx = config.canvas.wx;
  const wy = config.canvas.wy;

  // escape radius, bigger the better, only slight effect on speed
  const R = config.escape_r;

  // incoming light direction
  const lgt_x = config.light.x;
  const lgt_y = config.light.y;
  const lgt_z = config.light.z;

  const apply_shading = config.apply_shading;

  var image = [];
  if (apply_shading)
    var shading = [];

  for (var y = from; y < until; y++)
  {
    image[y - from] = [];
    if (apply_shading)
      shading[y - from] = [];
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

      if (apply_shading)
      {
        // derivative w.r.t. c
        var d_re = 0.0;
        var d_im = 0.0;
      }

      var count = 0;
      while (count < iterations && re2 + im2 < R*R)
      {
        count++;

        if (apply_shading)
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



      if (count === iterations)
      {
        image[y - from][x] = 0;
        if (apply_shading)
          shading[y - from][x] = 0;
      }
      else
      {
        // real iteration number: count - ln(ln(sqrt(re2 + im2) / ln(R))) / ln(2)
        image[y - from][x] = count + 1
          - (Math.log(Math.log(re2 + im2)) - Math.log(Math.log(R))) / Math.log(2);


        // calculates shading between directional light defined in "config.js"
        // and normal to point potential line
        // https://www.math.univ-toulouse.fr/~cheritat/wiki-draw/index.php/Mandelbrot_set#Normal_map_effect
        if (apply_shading)
        {
          // u = z/d
          var u_re = (z_re*d_re + z_im*d_im) / (d_re*d_re + d_im*d_im);
          var u_im = (z_im*d_re - z_re*d_im) / (d_re*d_re + d_im*d_im);
          // normalize
          const abs = Math.sqrt(u_re*u_re + u_im*u_im);
          u_re /= abs;
          u_im /= abs;

          // dot product with light direction
          var t = (u_re*lgt_x + u_im*lgt_y + lgt_z);
          t /= (1 + lgt_z);
          t = Math.max(0, t);

          shading[y - from][x] = t;
        }
      }
    }
  }
  postMessage({ from, image, shading, itr: config.iterations });
};
