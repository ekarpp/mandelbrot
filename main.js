import { config } from "./config.js";
import { init_workers, start_workers } from "./workers.js";
import { cf_map } from "./color_functions.js";

// multiplier for transformations:
// move origin by p of current dimension (while moving)
// or reduce space dimension by p (while zooming)
const p = 0.25;
const q = 1 - p;
const qi = (1/q - 1);


function init()
{
  const canvas = document.getElementById("canvas");
  canvas.width = config.canvas.wx;
  canvas.height = config.canvas.wy;

  // fill iteration count options
  const niters = document.getElementById("niters");
  const vals = [5, 10, 25, 50, 100, 500, 1000, 5000, 10000];
  vals.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.innerHTML = v;
    niters.appendChild(opt);
  });
  niters.value = config.iterations;
  niters.onchange = () => {
    config.iterations = Number(niters.value);
    render();
  };


  // fill color function options
  const cfunc = document.getElementById("cfunc");
  Object.keys(cf_map).forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.innerHTML = v;
    cfunc.appendChild(opt);
  });
  cfunc.value = Object.keys(cf_map)[0];
  config.color_fun = cf_map[cfunc.value];
  cfunc.onchange = () => {
    config.color_fun = cf_map[cfunc.value];
    render();
  };

  // fill threads options
  const threads = document.getElementById("threads");
  [1, 2, 4, 8, 16, 32].forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.innerHTML = v;
    threads.appendChild(opt);
  });
  threads.value = 4;
  threads.onchange = () => init_workers(Number(threads.value));

  const points = document.getElementById("points");
  const ps = [
    {name: "initial", loc: "0,0,1"},
    {name: "spiral", loc: "-0.761574,-0.0847597,3125"},
    {name: "a", loc: "-0.34842633784126914,-0.60653940234393235,17952"},
    {name: "b", loc: "2.613577e-1,-2.018128e-3,3.354786e+3"},
    {name: "input", loc: ""}
  ];
  ps.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v.loc;
    opt.innerHTML = v.name;
    points.appendChild(opt);
  });
  points.onchange = point_jump;


  // checkbox for toggleable shading
  // calculates shading between directional light defined in "config.js"
  // and normal to point potential line
  // https://www.math.univ-toulouse.fr/~cheritat/wiki-draw/index.php/Mandelbrot_set#Normal_map_effect
  const shading = document.getElementById("shading");
  config.apply_shading = shading.checked;
  shading.onclick = () => {
    config.apply_shading = shading.checked;
    render();
  };

  // set the move button onclick
  document.getElementById("go_button").onclick = go_button;

  init_workers(Number(threads.value));

  render();

  // keyboard input
  document.onkeypress = (e) => {
    // don't change variables if rendering in progress
    if (config.workers.count !== config.workers.done)
      return;

    switch(e.key) {
    case "z": case "Z": // zoom in
      // we have to move origin to keep the picture stable
      // shrinks by q, so we have to move the picture by half of (1-q)=p towards the bottomright
      config.space.x += config.space.dim * p / 2;
      config.space.y -= config.space.dim * p / 2;
      config.space.dim = config.space.dim * q;
      break;
    case "x": case "X": // zoom out
      // qi = (1/q - 1)
      config.space.x -= config.space.dim * qi / 2;
      config.space.y += config.space.dim * qi / 2;
      config.space.dim = config.space.dim / q;
      break;
    case "w": case "W": // move up
      config.space.y += config.space.dim * p;
      break;
    case "s": case "S": // move down
      config.space.y -= config.space.dim * p;
      break;
    case "a": case "A": // move right
      config.space.x -= config.space.dim * p;
      break;
    case "d": case "D": // move left
      config.space.x += config.space.dim * p;
      break;
    }

    render();
  };
}


function render()
{
  // update move ui values
  const m_point = document.getElementById("m_point");
  m_point.value = 4.0 / config.space.dim;

  const x_point = document.getElementById("x_point");
  x_point.value = config.space.x + config.space.dim / 2;

  const y_point = document.getElementById("y_point");
  y_point.value = config.space.y - config.space.dim / 2;

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
  config.space.dim = 4.0 / m;
  config.space.x = x - config.space.dim / 2;
  config.space.y = y + config.space.dim / 2;

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

export {
  init
}
