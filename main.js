const CANVAS_ID = "canvas";
var ITER_LIM = 500;

// space dimensions
var space = {
  dim: 4.0,  // space width and height (canvas w and h have to be same)
  x:  -2.0,  // x coordinate for picture top left
  y:   2.0,  // y coordinate for picture top left
}

// multiplier for transformations:
// move origin by p of current dimension (while moving)
// or reduce space dimension by p (while zooming)
const p = 0.25;
const q = 1 - p;
const qi = (1/q - 1);

// canvas dimensions (have to be same, only one variable for space dimensions)
const wx = 500;
const wy = 500;

// color functions
// need to map select value to real function
var cf_map = {
  simpl: simpl
}

var color_fun = null;

const onkeypress = (e) => {
  switch(e.key) {
  case "z": case "Z": // zoom in
    // we have to move origin to keep the picture stable
    // shrinks by q, so we have to move the picture by half of (1-q)=p towards the bottomright
    space.x += space.dim * p / 2;
    space.y -= space.dim * p / 2;
    space.dim = space.dim * q;
    render();
    break;
  case "x": case "X": // zoom out
    // qi = (1/q - 1)
    space.x -= space.dim * qi / 2;
    space.y += space.dim * qi / 2;
    space.dim = space.dim / q;
    render();
    break;
  case "w": case "W": // move up
    space.y += space.dim * p;
    render();
    break;
  case "s": case "S": // move down
    space.y -= space.dim * p;
    render();
    break;
  case "a": case "A": // move right
    space.x -= space.dim * p;
    render();
    break;
  case "d": case "D": // move left
    space.x += space.dim * p;
    render();
    break;
  case "r": case "R": // reset
    // save initial config ?
    // add boxes so user can change values ?
    break;
  }
}

function init()
{
  // what if it fails ?
  var canvas = document.createElement("canvas");
  canvas.id = CANVAS_ID;
  canvas.width = wx;
  canvas.height = wy;

  const body = document.getElementsByTagName("body")[0];
  body.appendChild(canvas);

  const niters = document.getElementById("niters");
  const vals = [5, 10, 25, 50, 100, 500, 1000, 5000, 10000];
  vals.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.innerHTML = v;
    niters.appendChild(opt);
  });
  niters.value = ITER_LIM;

  const cfunc = document.getElementById("cfunc");
  const cfs = ["simpl"]
  cfs.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.innerHTML = v;
    cfunc.appendChild(opt);
  });
  cfunc.value = "simpl";
  color_fun = simpl;

  render();

  document.onkeypress = onkeypress;
  niters.onchange = () => {ITER_LIM = niters.value; render();}
  cfs.onchange = () => {color_fun = cf_map[cfs.value]; render();}
}

function update_values()
{

  render();
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

// add more colorings
// maybe new file for just these?
function simpl(t)
{
  const tt = 1 - t;

  const color = {
    r: 255 * 8 * t * tt + 32 * tt,
    g: 255 * 4 * t * tt + 64 * tt,
    b: 255 * 2 * t * tt + 128 * tt,
  };

  return color;
}


function get_color(x, y)
{
  const iters = iter(x, y);
  return color_fun(iters / ITER_LIM);
}

function iter(x, y)
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
  while (count < ITER_LIM && re2 + im2 < 4.0)
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

  return count;
}
