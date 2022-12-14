import { config } from "./config.js";
import { cf_map } from "./color_functions.js";

function init_workers(new_count)
{
  const wip = working();
  if (wip)
    for (var i = 0; i < config.workers.count; i++)
      config.workers.arr[i].terminate();


  if (new_count <= config.workers.count)
    config.arr.length = new_count;
  else
  {
    for (var i = config.workers.count; i < new_count; i++)
    {
      config.workers.arr[i] = new Worker("./job.js", { type: "module" });
      config.workers.arr[i].onmessage = job_done;
      config.workers.arr[i].onerror = (e) => console.log(e);
    }
  }

  config.workers.count = new_count;
  config.workers.done = new_count;

  // start working again if it was interrupted
  if (wip)
    start_workers();
}

function working()
{
  return config.workers.count !== config.workers.done;
}

function start_workers()
{
  // already working
  if (working())
    return;

  config.workers.image = new ImageData(config.canvas.wx, config.canvas.wy);
  config.workers.done = 0;
  const lines = Math.floor(config.canvas.wy / config.workers.count);

  var prev = 0;

  for (var i = 0; i < config.workers.count - 1; i++)
  {
    config.workers.arr[i].postMessage({
      from: prev,
      until: prev + lines
    });
    prev += lines;
  }

  // last one gets all of the remaining in case of an uneven split
  config.workers.arr[config.workers.count - 1].postMessage({
    from: prev,
    until: config.canvas.wy
  });

  document.getElementById("title").style.color = "red";
}

// gets called when some worker is done
function job_done(e)
{
  const offset = e.data.from;
  const image = e.data.image;
  const shading = e.data.shading;

  for (var y = 0; y < image.length; y++)
  {
    for (var x = 0; x < config.canvas.wx; x++)
    {
      const idx = 4*(x + config.canvas.wy*(y + offset));
      var c = config.color_fun(image[y][x]);
      if (shading)
        c = c.map(v => v * shading[y][x]);
      config.workers.image.data[idx + 0] = 255 * c[0];
      config.workers.image.data[idx + 1] = 255 * c[1];
      config.workers.image.data[idx + 2] = 255 * c[2];
      config.workers.image.data[idx + 3] = 255; // alpha
    }
  }
  config.workers.done++;

  // everyone done -> draw image
  if (config.workers.done === config.workers.count)
  {
    document.getElementById("canvas")
      .getContext("2d")
      .putImageData(config.workers.image, 0, 0);
    document.getElementById("title").style.color = "black";
  }
}


export {
  init_workers,
  start_workers
}
