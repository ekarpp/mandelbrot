onmessage = (e) => {
  const space = e.data.vals.space;
  const lim = e.data.vals.lim;
  const wx = e.data.vals.width;
  const wy = e.data.vals.height;

  var res = []

  for (var y = e.data.from; y < e.data.till; y++)
  {
    res[y - e.data.from] = [];
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

      var count = 0;
      while (count < lim && re2 + im2 < 4.0)
      {
        count++;
        // (a+bi)^2 = a^2 - b^2 + 2abi
        const n_re = re2 - im2 + c_re;
        const n_im = 2*z_re*z_im + c_im;

        z_re = n_re;
        z_im = n_im;

        re2 = z_re * z_re;
        im2 = z_im * z_im;
      }

      res[y - e.data.from][x] = count / lim;
    }
  }
  postMessage({from: e.data.from, result: res});
}
