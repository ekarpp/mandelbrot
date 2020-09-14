const wx = 200
const wy = 200

const LIM = 500;

function iter(x, y)
{
  const c_re = 4*x/wx - 2.0;
  const c_im = 4*y/wy - 2.0;
  // z_0 = 0
  // z_n+1 = z_n^2 + c
  var z_re = 0.0;
  var z_im = 0.0;

  var count = 0;
  while (count < LIM && z_re*z_re + z_im*z_im < 4.0)
  {
    count++;
    // (a+bi)^2 = a^2 - b^2 + 2abi
    const n_re = z_re*z_re - z_im*z_im + c_re;
    const n_im = 2*z_re*z_im + c_im;

    z_re = n_re;
    z_im = n_im;
  }

  return count;
}

function get_color(x, y)
{
  const iters = iter(x, y);

  if (iters == LIM)
    return {r: 0, g: 0, b: 0};
  else
    return {r: 255, g: 255, b: 255};
}

function load()
{
  var canv = document.getElementById("canvas");
  var c = canv.getContext("2d");
  var img = c.createImageData(wx, wy);

  for (var x = 0; x < wx; x++)
  {
    for (var y = 0; y < wy; y++)
    {
      const idx = 4*(x + wy*y)
      const c = get_color(x, y);
      img.data[idx + 0] = c.r;
      img.data[idx + 1] = c.g;
      img.data[idx + 2] = c.b;
      img.data[idx + 3] = 255; // alpha
    }
  }

  c.putImageData(img, 0, 0);
}
