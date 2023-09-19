import { config } from "./config.js";
import { start_workers } from "./workers.js";
import { cf_map } from "./color_functions.js";
import { webgl_render } from "./gpu.js";

// multiplier for transformations:
// move origin by p of current dimension (while moving)
// or reduce space dimension by p (while zooming)
const p = 0.25;
const q = 1 - p;
const qi = (1/q - 1);


function init()
{
  const canvas = document.getElementById("canvas");
  const gl_canvas = document.getElementById("gl-canvas");
  canvas.width = gl_canvas.width = config.canvas.wx;
  canvas.height = gl_canvas.height = config.canvas.wy;


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

  // fill threads options
  const threads = document.getElementById("threads");
  [0, 1, 2, 4, 8, 16, 32].forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.innerHTML = (v === 0) ? "GPU" : v;
    threads.appendChild(opt);
  });
  threads.value = 0;
  config.threads = Number(threads.value);
  threads.onchange = () => {
    config.threads = Number(threads.value);
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
  config.color_fun = cfunc.value;
  cfunc.onchange = () => {
    config.color_fun = cfunc.value;
    render();
  };

  const points = document.getElementById("points");
  const ps = [
    { name: "Initial", loc: "0,0,1" },
    { name: "Spiral", loc: "-0.761574,-0.0847597,3125" },
    { name: "Void", loc: "-0.34842633784126914,-0.60653940234393235,17952" },
    { name: "Funky", loc: "2.613577e-1,-2.018128e-3,3.354786e+3" },
    { name: "Input", loc: "" }
  ];
  ps.forEach((v) => {
    const opt = document.createElement("option");
    opt.value = v.loc;
    opt.innerHTML = v.name;
    points.appendChild(opt);
  });
  points.onchange = e => {
    // hide the input ui
    const point_input = document.getElementById("point_input");
    point_input.style.display = "none";

    var point = document.getElementById("points").value;
    if (point === "")
      point_input.style.display = "block";
    else
    {
      point = point.split(",");
      const x = Number(point[0]);
      const y = Number(point[1]);
      const m = Number(point[2]);
      move_to(x, y, m);
    }
  };


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

  // set the move form submission
  document.getElementById("point_form").onsubmit = e => {
    e.preventDefault();
    const x = Number(document.getElementById("x_point").value);
    const y = Number(document.getElementById("y_point").value);
    const m = Number(document.getElementById("m_point").value);
    move_to(x, y, m);
  };

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
    default:
      return;
    }

    render();
  };

  // init workers and render initial image
  // ready to render now
  render();
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

  if (config.threads !== 0)
    start_workers();
  else // use GPU
    webgl_render();
}

function move_to(x, y, m)
{
  config.space.dim = 4.0 / m;
  config.space.x = x - config.space.dim / 2;
  config.space.y = y + config.space.dim / 2;

  render();
}

export {
  init
}
