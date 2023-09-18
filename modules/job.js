// the work to be done by each thread
// computes n lines from the image
import { cf_map } from "./color_functions.js";

self.onmessage = e => {
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
  const color_fun = cf_map[config.color_fun];
  var image = [];

  for (var y = from; y < until; y++)
  {
    image[y - from] = [];
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
        // map from [0,1] to [0,255]. color function might map 0 to nonzero values
        image[y - from][x] = color_fun(0, iterations).map(v => 255*v);
      else
      {
        // real iteration number: count - ln(ln(sqrt(re2 + im2) / ln(R))) / ln(2)
        const real_it_number = count + 1
              - (Math.log(Math.log(re2 + im2)) - Math.log(Math.log(R))) / Math.log(2);
        var color = color_fun(real_it_number, iterations);
        // calculates shading between directional light defined in "config.js"
        // and normal to point potential line
        // https://www.math.univ-toulouse.fr/~cheritat/wiki-draw/index.php/Mandelbrot_set#Normal_map_effect
        var t = 1;
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
          t = (u_re*lgt_x + u_im*lgt_y + lgt_z);
          t /= (1 + lgt_z);
          t = Math.max(0, t);
        }
        // map from [0,1] to [0,255] and apply shading (if applicable)
        image[y - from][x] = color.map(v => v*t*255);
      }
    }
  }
  postMessage({ from, image });
};
