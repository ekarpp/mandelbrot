// canvas dimensions, have to be the same
const wx = 500;
const wy = wx;

// space dimensions
var space = {
  dim: 4.0,  // space width and height (canvas w and h have to be same)
  x:  -2.0,  // x coordinate for picture top left
  y:   2.0,  // y coordinate for picture top left
};

const ITER_LIM = 500;

// object passed to workers
var worker_data = {
  space: space,
  lim: ITER_LIM,
  width: wx,
  height: wy,
  shading: false,
  image: []
};

var cf = {
  color_fun: () => {}
};

var workers = {
  count: 0,
  done: 0,
  arr: []
};


export {
  wx,
  wy,
  worker_data,
  space,
  workers,
  cf
}
