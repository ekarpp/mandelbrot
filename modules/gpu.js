import { config } from "./config.js";
import { cf_idxs } from "./color_functions.js";

function webgl_render()
{
  const canvas = document.getElementById("canvas");
  const gl_canvas = document.getElementById("gl-canvas");
  const gl = gl_canvas.getContext("webgl2");

  if (!gl)
  {
    console.log(gl);
    console.log("WebGL not available");
    return;
  }
  document.getElementById("title").style.color = "red";

  const vertex_src = get_src("webgl/mandelbrot.vert");
  const vertex = create_shader(gl, gl.VERTEX_SHADER, vertex_src);
  if (vertex === undefined)
  {
    gl.deleteShader(vertex);
    console.log("Error while creating vertex shader");
    document.getElementById("title").style.color = "black";
    return;
  }

  const fragment_src = get_src("webgl/mandelbrot.frag");
  const fragment = create_shader(gl, gl.FRAGMENT_SHADER, fragment_src);
  if (fragment === undefined)
  {
    gl.deleteShader(fragment);
    gl.deleteShader(vertex);
    console.log("Error while creating fragment shader");
    document.getElementById("title").style.color = "black";
    return;
  }

  const program = create_program(gl, vertex, fragment);
  if (program === undefined)
  {
    gl.deleteShader(fragment);
    gl.deleteShader(vertex);
    gl.deleteProgram(program);
    console.log("Error while linking shaders");
    document.getElementById("title").style.color = "black";
    return;
  }

  // rendering
  gl.useProgram(program);
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  const vertices = [
    [ 1,  1],
    [ 1, -1],
    [-1,  1],
    [-1, -1],
  ];

  // fill whole canvas with rectangle
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.flat()), gl.STATIC_DRAW);
  const vertex_pos = gl.getAttribLocation(program, "vertex_pos");
  gl.enableVertexAttribArray(vertex_pos);
  gl.vertexAttribPointer(vertex_pos, 2, gl.FLOAT, false, 0, 0);

  // pass config arguments
  const escape_rad = gl.getUniformLocation(program, "escape_rad");
  gl.uniform1f(escape_rad, config.escape_r);

  const space = gl.getUniformLocation(program, "space");
  gl.uniform3f(space, config.space.x, config.space.y, config.space.dim);

  const iters_max = gl.getUniformLocation(program, "iters_max");
  gl.uniform1i(iters_max, config.iterations);

  const cfun_idx = gl.getUniformLocation(program, "cfun_idx");
  gl.uniform1i(cfun_idx, cf_idxs[config.color_fun]);

  gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length);

  gl_canvas.hidden = false;
  canvas.hidden = true;
  document.getElementById("title").style.color = "black";
}

function get_src(file_name)
{
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", file_name, false );
  xmlHttp.send( null );
  return xmlHttp.responseText;
}

function create_shader(gl, type, src)
{
  var shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  const ok = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (ok)
    return shader;

  console.log(gl.getShaderInfoLog(shader));
  return undefined;
}

function create_program(gl, vertex, fragment)
{
  var program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  const ok = gl.getProgramParameter(program, gl.LINK_STATUS);

  if (ok)
    return program;

  console.log(gl.getProgramInfoLog(program));
  return undefined;
}

export {
  webgl_render,
}
