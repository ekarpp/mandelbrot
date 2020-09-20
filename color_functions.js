// color functions
// need to map select value to real function
var cf_map = {
  Simple: simple,
  BW: bw,
  Periodic: periodic,
  "Periodic color": periodic_color,
  "Normal map": normal_map
}

var color_fun = Object.values(cf_map)[0];

// color functions take single argument: the real iteration number
// they return a object with fields r,g,b corresponding to the coefficient of each color
// that is they are multiplied by 255 when drawing the picture

// the argument is limited to [0, ITER_LIM[
// and is 0 if and only if pixel belongs to the Mandelbrot set


// black and white
function bw(t)
{
  if (t == 0)
    return {r: 0, g: 0, b: 0};
  else
    return {r: 1, g: 1, b: 1};
}

// calculates shading with directional light defined in "job.js"
// and normal to point potential line
// https://www.math.univ-toulouse.fr/~cheritat/wiki-draw/index.php/Mandelbrot_set#Normal_map_effect
function normal_map(t)
{
  if (t == 0)
    // color points not on the set as dark green
    return {r: 0, g: 0.5, b: 0};
  else
    return {r: t, g: t, b: t};
}

// random coloring
function simple(t)
{
  const tp = t / worker_data.lim;
  const tip = 1 - tp;

  const color = {
    r: 8 * tp * tip + tp / 8,
    g: 4 * tp * tip + tp / 4,
    b: 2 * tp * tip + tp / 2
  };

  return color;
}

function periodic(t)
{
  const sc = Math.sin(2*Math.PI*t);
  const color = {
    r: sc,
    g: sc,
    b: sc
  };
  return color;
}

function periodic_color(t)
{
  const color = {
    r: Math.sin(t),
    g: Math.sin(t / Math.sqrt(2)),
    b: Math.sin(t / Math.sqrt(3))
  };
  return color;
}
