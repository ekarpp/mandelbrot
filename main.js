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
  normal: false
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
  threads.value = 4;

  const points = document.getElementById("points");
  const ps = [
    {name: "initial", loc: "0,0,1"},
    {name: "spiral", loc: "-0.761574,-0.0847597,3125"},
    {name: "a", loc: "-0.34842633784126914,-0.60653940234393235,17952"},
    {name: "b", loc: "2.613577e-1,-2.018128e-3,3.354786e+3"},
    {name: "input", loc: ""}
  ]
  ps.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v.loc;
    opt.innerHTML = v.name;
    points.appendChild(opt);
  });

  init_workers(Number(threads.value));

  render();

  // todo: dont change while working
  niters.onchange = () => {worker_data.lim = Number(niters.value); render();}
  cfunc.onchange = () => {color_fun = cf_map[cfunc.value]; render();}
  threads.onchange = () => init_workers(Number(threads.value));
  points.onchange = point_jump;

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


function render()
{
  // update move input values
  const m_point = document.getElementById("m_point");
  m_point.value = 4.0 / space.dim;

  const x_point = document.getElementById("x_point");
  x_point.value = space.x + space.dim / 2;

  const y_point = document.getElementById("y_point");
  y_point.value = space.y - space.dim / 2;


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

  // todo: add arbitrary input
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
