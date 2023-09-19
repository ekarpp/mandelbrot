#version 300 es
precision highp float;

#define PI 3.1415926535897932384626433832795

uniform float escape_rad;
uniform int iters_max;
uniform int cfun_idx;

// position in the complex plane
in vec2 c_pos;
out vec4 frag_color;

vec3 color_fun(float scaled)
{
    switch (cfun_idx)
    {
    // simple
    case 0:
        float tp = scaled / float(iters_max);
        float tip = 1.0 - tp;
        return vec3(
            8.0 * tp * tip + tp / 8.0,
            4.0 * tp * tip + tp / 4.0,
            2.0 * tp * tip + tp / 2.0
        );
    // black and white
    case 1:
        return (scaled == 0.0)
            ? vec3(0)
            : vec3(1);
    // periodic
    case 2:
        return vec3(sin(2.0 * PI * scaled));
    // periodic color
    case 3:
        return vec3(
            sin(scaled),
            sin(scaled / sqrt(2.0)),
            sin(scaled / sqrt(3.0))
        );
    default:
        return vec3(0);
    }
}

void main()
{
    frag_color = vec4(1.0, 0.0, 0.0, 1.0);
    vec2 loc = vec2(0, 0);
    int iter = 0;
    while (iter < iters_max && dot(loc, loc) < escape_rad * escape_rad)
    {
        iter++;
        loc = vec2(loc.x * loc.x - loc.y * loc.y, 2.0 * loc.x * loc.y) + c_pos;
    }

    if (iter == iters_max)
        frag_color = vec4(color_fun(0.0), 1.0);
    else
    {
        float scaled = float(iter) + 1.0 - log(log(length(loc)) / log(escape_rad)) / log(2.0);
        frag_color = vec4(color_fun(scaled), 1.0);
    }
}
