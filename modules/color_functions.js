// color functions take two arguments:
//   the real iteration number and maximum number of iterations
// they return an array with 3 elements [r, g, b] corresponding to the coefficient of each color
// that is they are multiplied by 255 when drawing the picture

// the argument is limited to [0, ITER_LIM[
// and is 0 if and only if pixel belongs to the Mandelbrot set

// these get passed as strings to the workers and then parsed to javascript

// color functions
// need to map select value to real function
const cf_map = {
  // replace simple and get rid of having to pass it...
  Simple: (t, it) => {
    const tp = t / it;
    const tip = 1 - tp;

    return [
      8 * tp * tip + tp / 8,
      4 * tp * tip + tp / 4,
      2 * tp * tip + tp / 2
    ];
  },
  BW: (t, it) => {
    return (t == 0)
      ? [ 0, 0, 0 ]
      : [ 1, 1, 1 ];
  },
  Periodic: (t, it) => {
    const sc = Math.sin(2*Math.PI*t);
    return [ sc, sc, sc ];
  },
  "Periodic color": (t, it) => {
    return [
      Math.sin(t),
      Math.sin(t / Math.sqrt(2)),
      Math.sin(t / Math.sqrt(3))
    ];
  }
};

export {
  cf_map
}
