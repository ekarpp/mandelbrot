import { config } from "./config.js";


function webgl_render()
{
  // needs a separate webgl canvas...
  const gl = document.getElementById("canvas").getContext("webgl");

  if (!gl)
  {
    console.log(gl);
    console.log("WebGL not available");
    return;
  }

  const vertex_src = document.querySelector("#vertex-shader");
  const vertex = create_shader(gl, gl.VERTEX_SHADER, vertex_src);
  if (vertex === undefined)
  {
    gl.deleteShader(vertex);
    console.log("Error while creating vertex shader");
    return;
  }

  const fragment_src = document.querySelector("#fragment-shader");
  const fragment = create_shader(gl, gl.FRAGMENT_SHADER, vertex_src);
  if (fragment === undefined)
  {
    gl.deleteShader(fragment);
    gl.deleteShader(vertex);
    console.log("Error while creating fragment shader");
    return;
  }

  const program = create_program(gl, vertex, fragment);
  if (program === undefined)
  {
    gl.deleteShader(fragment);
    gl.deleteShader(vertex);
    gl.deleteProgram(program);
    console.log("Error while linking shaders");
    return;
  }

  const a_position_location = gl.getAttribLocation(program, "a_position");

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.useProgram(program);
  gl.enableVertexAttribArray(a_position_location);
}

function create_shader(gl, type, src)
{
  var shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.shaderCompile(shader);
  const ok = gl.getShaderParameter(shader, gl.COMPILE_STATUS);

  return (ok) ? shader : undefined;
}

function create_program(gl, vertex, fragment)
{
  var program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  const ok = gl.getProgramParameter(program, gl.LINK_STATUS);

  return (ok) ? program : undefined;
}

export {
  webgl_render,
}
