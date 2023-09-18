import { config } from "./config.js";

function init_workers(new_count)
{
  if (new_count <= config.workers.count)
    config.workers.arr.length = new_count;
  else
  {
    for (var i = config.workers.count; i < new_count; i++)
    {
      config.workers.arr[i] = new Worker("./modules/job.js", { type: "module" });
      config.workers.arr[i].onmessage = job_done;
      config.workers.arr[i].onerror = e => console.error(e);
    }
  }

  config.workers.count = new_count;
  config.workers.done = new_count;
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

  if (config.workers.count !== config.threads)
    init_workers(config.threads);

  config.workers.image = new ImageData(config.canvas.wx, config.canvas.wy);
  config.workers.done = 0;
  const lines = Math.floor(config.canvas.wy / config.workers.count);

  var prev = 0;
  // need to pass the possibly updated configuration to the workers
  const worker_cfg = {
    space: config.space,
    iterations: config.iterations,
    canvas: config.canvas,
    escape_r: config.escape_r,
    color_fun: config.color_fun,
    light: config.light,
    apply_shading: config.apply_shading
  };
  for (var i = 0; i < config.workers.count - 1; i++)
  {
    config.workers.arr[i].postMessage({
      config: worker_cfg,
      from: prev,
      until: prev + lines
    });
    prev += lines;
  }

  // last one gets all of the remaining in case of an uneven split
  config.workers.arr[config.workers.count - 1].postMessage({
    config: worker_cfg,
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

  for (var y = 0; y < image.length; y++)
  {
    for (var x = 0; x < config.canvas.wx; x++)
    {
      const idx = 4*(x + config.canvas.wy*(y + offset));
      var c = image[y][x];
      config.workers.image.data[idx + 0] = c[0];
      config.workers.image.data[idx + 1] = c[1];
      config.workers.image.data[idx + 2] = c[2];
      config.workers.image.data[idx + 3] = 255; // alpha
    }
  }
  config.workers.done++;

  // everyone done -> draw image. move to main? future etc..
  if (config.workers.done === config.workers.count)
  {
    document.getElementById("canvas")
      .getContext("2d")
      .putImageData(config.workers.image, 0, 0);
    document.getElementById("title").style.color = "black";
  }
}


export {
  start_workers,
}
