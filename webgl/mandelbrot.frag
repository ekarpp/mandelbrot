#version 300 es
precision highp float;

#define R 100.0
#define ITERS 500

// position in the complex plane
in vec2 c_pos;
out vec4 frag_color;

void main()
{
    frag_color = vec4(1.0, 0.0, 0.0, 1.0);
    vec2 loc = vec2(0, 0);
    int iter = 0;
    while (iter < ITERS && dot(loc, loc) < R * R)
    {
        iter++;
        loc = vec2(loc.x * loc.x - loc.y * loc.y, 2.0 * loc.x * loc.y)
            + c_pos;
    }

    if (iter == ITERS)
        frag_color = vec4(0, 0, 0, 1);
    else
        frag_color = vec4(1, 1, 1, 1);
}
