#version 300 es

uniform vec3 space;

in vec4 vertex_pos;
out vec2 c_pos;

void main()
{
    gl_Position = vertex_pos;
    // move top left corner to origin and scale to space size
    c_pos = vertex_pos.xy + vec2(1, -1);
    c_pos *= space.z / 2.0;
    c_pos += space.xy;
}
