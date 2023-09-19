#version 300 es

in vec4 vertex_pos;
out vec2 c_pos;

void main()
{
    gl_Position = vertex_pos;
    c_pos = vertex_pos.xy;
}
