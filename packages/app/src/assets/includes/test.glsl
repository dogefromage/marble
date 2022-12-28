
Solid inc_union(Solid a, Solid b)
{
    if (a.sd < b.sd) return a;
    else             return b;
}

Solid inc_difference(Solid a, Solid b)
{
    b.sd = -b.sd;
    if (a.sd > b.sd) return a;
    else              return b;
}

float inc_multiply(float a, float b)
{
    return a * b;
}