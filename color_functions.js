// color functions
// need to map select value to real function
var cf_map = {
  simpl: simpl,
  bw: bw
}

var color_fun = simpl;


// black and white
function bw(t)
{
  if (t < 1)
    return {r: 255, g: 255, b: 255};
  else
    return {r: 0, g: 0, b: 0};
}

// random coloring
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
