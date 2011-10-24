#include "Util.h"

float Util::degreesToRadians(float degrees)
{
    return degrees * radians_per_degree;
}

float Util::radiansToDegrees(float radians)
{
    return radians * degrees_per_radian;
}

int Util::abs(int number)
{
    return number < 0 ? -number : number;
}


