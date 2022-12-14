import { wx, wy, worker_data, workers, cf } from "./defs.js";
import { apply_shading, cf_map } from "./color_functions.js";

function init_workers(new_count)
{
  const wip = working();
  if (wip)
    for (var i = 0; i < workers.count; i++)
      workers.arr[i].terminate();


  if (new_count <= workers.count)
    workers.arr.length = new_count;
  else
  {
    for (var i = workers.count; i < new_count; i++)
    {
      workers.arr[i] = new Worker("job.js");
      workers.arr[i].onmessage = job_done;
      workers.arr[i].onerror = (e) => console.log(e);
    }
  }

  workers.count = new_count;
  workers.done = new_count;

  // start working again if it was interrupted
  if (wip)
    start_workers();
}

function working()
{
  return workers.count !== workers.done;
}

function start_workers()
{
  // already working
  if (working())
    return;

  worker_data.image = new ImageData(wx, wy);
  workers.done = 0;
  const lines = Math.floor(wy / workers.count);

  var prev = 0;
  for (var i = 0; i < workers.count - 1; i++)
  {
    workers.arr[i].postMessage({
      vals: worker_data,
      from: prev,           // render from line...
      till: prev + lines    // ...untill line
    });
    prev += lines;
  }

  // last one gets all of the remaining in case of an uneven split
  workers.arr[workers.count - 1].postMessage({
    vals: worker_data,
    from: prev,
    till: wy
  });

  document.getElementById("title").style.color = "red";
}

// gets called when some worker is done
function job_done(e)
{
  var offst = e.data.from;
  const result = e.data.result;
  const shading = e.data.shading;

  for (var y = 0; y < result.length; y++)
  {
    for (var x = 0; x < wx; x++)
    {
      const idx = 4*(x + wy*(y + offst));
      var c = cf.color_fun(result[y][x]);
      if (shading)
        c = apply_shading(c, shading[y][x]);
      worker_data.image.data[idx + 0] = 255 * c.r;
      worker_data.image.data[idx + 1] = 255 * c.g;
      worker_data.image.data[idx + 2] = 255 * c.b;
      worker_data.image.data[idx + 3] = 255; // alpha
    }
  }

  workers.done++;

  // everyone done -> draw image
  if (workers.done === workers.count)
  {
    document.getElementById("canvas")
      .getContext("2d")
      .putImageData(worker_data.image, 0, 0);
    document.getElementById("title").style.color = "black";
  }
}


export {
  init_workers,
  start_workers
}
