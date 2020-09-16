// canvas dimensions
const wx = 500
const wy = 500

// dimensions in space
var w_space = 2.0;
var h_space = 2.0;

const CANVAS_ID = "canvas";
const ITER_LIM = 500;

function init()
{
  // what if it fails ?
  var canvas = document.createElement("canvas");
  canvas.id = CANVAS_ID;
  canvas.width = wx;
  canvas.height = wy;

  const body = document.getElementsByTagName("body")[0];
  body.appendChild(canvas);

  render();

  document.onkeypress = (e) => {
    switch(e.key) {
    case "z": case "Z":
      break; // zoom in
    case "x": case "X":
      break; // zoom out
    case "w": case "W":
      break; // move up
    case "s": case "S":
      break; // move down
    case "d": case "D":
      break; // move left
    case "a": case "A":
      break; // move right
    case "r": case "R":
      break; // reset
    }
  }
}

function render()
{
  const ctx = document.getElementById(CANVAS_ID).getContext("2d");
  const img = ctx.createImageData(wx, wy);

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

  ctx.putImageData(img, 0, 0);
}


function get_color(x, y)
{
  const iters = iter(x, y);

  if (iters == ITER_LIM)
    return {r: 0, g: 0, b: 0};
  else
    return {r: 255, g: 255, b: 255};
}

function iter(x, y)
{
  const c_re = 4*x/wx - w_space;
  const c_im = 4*y/wy - h_space;
  // z_0 = 0
  // z_n+1 = z_n^2 + c
  var z_re = 0.0;
  var z_im = 0.0;

  var count = 0;
  while (count < ITER_LIM && z_re*z_re + z_im*z_im < 4.0)
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
