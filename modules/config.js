// canvas dimensions, have to be the same
const wx = 500;
const wy = wx;

const light_angle = Math.PI / 8;

const config = {
  canvas: {
    wx, wy // canvas dimensions in pixels
  },
  space: {
    dim: 4.0,  // space width and height (canvas w and h have to be same)
    x:  -2.0,  // x coordinate for picture top left
    y:   2.0   // y coordinate for picture top left
  },
  light: {
    // incoming light direction
    x: Math.cos(light_angle),
    y: Math.sin(light_angle),
    z: 1.5 // "height" of light
  },
  iterations: 500, // number of iterations for each point
  color_fun: a => a,
  // escape radius, bigger the better, only slight effect on speed
  escape_r: 100,
  apply_shading: false,
  workers: {
    count: 0,
    done: 0,
    arr: [], // array of workers
    image: undefined // ImageData, final result stored here
  }
};

export {
  config
}
