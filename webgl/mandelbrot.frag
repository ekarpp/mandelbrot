#version 300 es
precision highp float;

uniform float escape_rad;
uniform int iters_max;

// position in the complex plane
in vec2 c_pos;
out vec4 frag_color;

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
        frag_color = vec4(0, 0, 0, 1);
    else
    {
        float scaled = float(iter) + 1.0 - log(log(length(loc)) / log(escape_rad)) / log(2.0);
        float tp = 1.0 / scaled;
        float tip = 1.0 - tp;
        frag_color = vec4(
            8.0 * tp * tip + tp / 8.0,
            4.0 * tp * tip + tp / 4.0,
            2.0 * tp * tip + tp / 2.0,
            1
        );
    }
}
