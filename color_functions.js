import { worker_data } from "./defs.js";

// apply shading data
function apply_shading(rgb, s)
{
  rgb.r *= s;
  rgb.g *= s;
  rgb.b *= s;
  return rgb;
}

// color functions take single argument: the real iteration number
// they return a object with fields r,g,b corresponding to the coefficient of each color
// that is they are multiplied by 255 when drawing the picture

// the argument is limited to [0, ITER_LIM[
// and is 0 if and only if pixel belongs to the Mandelbrot set

// color functions
// need to map select value to real function
const cf_map = {
  Simple: t => {
    const tp = t / worker_data.lim;
    const tip = 1 - tp;

    return {
      r: 8 * tp * tip + tp / 8,
      g: 4 * tp * tip + tp / 4,
      b: 2 * tp * tip + tp / 2
    };
  },
  BW: t => {
    return (t == 0)
      ? { r: 0, g: 0, b: 0 }
      : { r: 1, g: 1, b: 1 };
  },
  Periodic: t => {
    const sc = Math.sin(2*Math.PI*t);
    return {
      r: sc,
      g: sc,
      b: sc
    };
  },
  "Periodic color": t => {
    return {
      r: Math.sin(t),
      g: Math.sin(t / Math.sqrt(2)),
      b: Math.sin(t / Math.sqrt(3))
    };
  }
};

export {
  cf_map,
  apply_shading
}
