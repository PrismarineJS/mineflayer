#include "Util.h"

#include <cmath>

float Util::degreesToRadians(float degrees)
{
    return degrees * radians_per_degree;
}

float Util::radiansToDegrees(float radians)
{
    return radians * degrees_per_radian;
}

float Util::euclideanMod(float numerator, float denominator)
{
    float result = std::fmod(numerator, denominator);
    if (result < 0)
        result += denominator;
    return result;
}

int Util::sign(int value)
{
    return value < 0 ? -1 : value == 0 ? 0 : 1;
}

int Util::abs(int number)
{
    return number < 0 ? -number : number;
}
