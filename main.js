const CANVAS_ID = "canvas";
var ITER_LIM = 500;

// space dimensions
var space = {
  dim: 4.0,  // space width and height (canvas w and h have to be same)
  x:  -2.0,  // x coordinate for picture top left
  y:   2.0,  // y coordinate for picture top left
}

// image variable to store work results, initialized in init()
var img;
// canvas context
var ctx;

// multiplier for transformations:
// move origin by p of current dimension (while moving)
// or reduce space dimension by p (while zooming)
const p = 0.25;
const q = 1 - p;
const qi = (1/q - 1);

// canvas dimensions (have to be same, only one variable for space dimensions)
const wx = 500;
const wy = wx;


// object passed to workers
var worker_data = {
  space: space,
  lim: ITER_LIM,
  width: wx,
  height: wy,
  shading: false,
  perturb: null
}

function init()
{
  // what if it fails ?
  var canvas = document.createElement("canvas");
  canvas.id = CANVAS_ID;
  canvas.width = wx;
  canvas.height = wy;
  ctx = canvas.getContext("2d");
  img = ctx.createImageData(wx, wy);

  const body = document.getElementsByTagName("body")[0];
  body.appendChild(canvas);

  // fill iteration count options
  const niters = document.getElementById("niters");
  const vals = [5, 10, 25, 50, 100, 500, 1000, 5000, 10000];
  vals.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.innerHTML = v;
    niters.appendChild(opt);
  });
  niters.value = ITER_LIM;

  // fill color function options
  const cfunc = document.getElementById("cfunc");
  Object.keys(cf_map).forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.innerHTML = v;
    cfunc.appendChild(opt);
  });
  cfunc.value = Object.keys(cf_map)[0];

  // fill threads options
  const threads = document.getElementById("threads");
  [1, 2, 4, 8, 16, 32].forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.innerHTML = v;
    threads.appendChild(opt);
  });
  threads.value = 1;

  const points = document.getElementById("points");
  const ps = [
    {name: "initial", loc: "0,0,1"},
    {name: "spiral", loc: "-0.761574,-0.0847597,3125"},
    //{name: "a", loc: "-0.34842633784126914,-0.60653940234393235,17952"},
    {name: "perturb", loc: "-1.78,3.75e-14,5.33e13"},
    {name: "input", loc: ""}
  ]
  ps.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v.loc;
    opt.innerHTML = v.name;
    points.appendChild(opt);
  });

  init_workers(Number(threads.value));

  // todo: dont change while working
  niters.onchange = () => {worker_data.lim = Number(niters.value); render();}
  cfunc.onchange = () => {color_fun = cf_map[cfunc.value]; render();}
  threads.onchange = () => init_workers(Number(threads.value));
  points.onchange = point_jump;

  // checkbox for toggleable shading
  // calculates shading between directional light defined in "job.js"
  // and normal to point potential line
  // https://www.math.univ-toulouse.fr/~cheritat/wiki-draw/index.php/Mandelbrot_set#Normal_map_effect
  const shading = document.getElementById("shading");
  worker_data.shading = shading.checked;
  shading.onclick = () => {
    worker_data.shading = shading.checked;
    render();
  };

  render();

  // keyboard input
  document.onkeypress = (e) => {
    // don't change variables if rendering in progress
    if (workers.count !== workers.done)
      return;

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
    }
  }
}


function perturb_pre_calc()
{
  var A = [];
  A[0] = new Imaginary(new BIG(1), new BIG(0));

  var B = [];
  B[0] = new Imaginary(new BIG(0), new BIG(0));

  var C = [];
  C[0] = new Imaginary(new BIG(0), new BIG(0));

  var X = [];
  X[0] = new Imaginary(new BIG(space.x + space.dim / 2), new BIG(space.y - space.dim / 2));

  for (var i = 1; i <= worker_data.lim; i++)
  {
    // C = 2*X*C +
    A[i] = X[i-1].mul( A[i-1] ).mul( 2 ).add( 1 );
    B[i] = X[i-1].mul( B[i-1] ).mul( 2 ).add( A[i-1].mul( A[i-1] ) );
    C[i] = X[i-1].mul( C[i-1] ).mul( 2 ).add( A[i-1].mul( B[i-1] ).mul( 2 ) );

    X[i] = X[i-1].mul( X[i-1] ).add( X[0] );
  }

  const perturb = {
    A: A,
    B: B,
    C: C,
    X: X
  };

  return perturb;
}


function render()
{
  const n = 3;
  // update move ui values
  const m_point = document.getElementById("m_point");
  m_point.value = (4.0 / space.dim).toPrecision(n);

  const x_point = document.getElementById("x_point");
  x_point.value = (space.x + space.dim / 2).toPrecision(n);

  const y_point = document.getElementById("y_point");
  y_point.value = (space.y - space.dim / 2).toPrecision(n);

  if (space.dim < 1e-13)
    worker_data.perturb = perturb_pre_calc();
  else
    worker_data.perturb = null;

  start_workers();
}

function go_button()
{
  const x = Number(document.getElementById("x_point").value);
  const y = Number(document.getElementById("y_point").value);
  const m = Number(document.getElementById("m_point").value);
  move_to(x, y, m);
}

function move_to(x, y, m)
{
  space.dim = 4.0 / m;
  space.x = x - space.dim / 2;
  space.y = y + space.dim / 2;
  render();
}

function point_jump()
{
  // hide the input ui
  const point_input = document.getElementById("point_input");
  point_input.style.display = "none";

  var point = document.getElementById("points").value;

  if (point == "")
    point_input.style.display = "block";
  else
  {
    point = point.split(",");
    const x = Number(point[0]);
    const y = Number(point[1]);
    const m = Number(point[2]);
    move_to(x, y, m);
  }
}
