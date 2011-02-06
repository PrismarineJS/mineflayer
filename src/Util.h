#ifndef UTIL_H
#define UTIL_H

namespace Util
{
    const float half_pi = 1.57079633f;
    const float pi = 3.14159265f;
    const float two_pi = 6.28318531f;
    const float degrees_per_radian = 57.2957795f;
    const float radians_per_degree = 0.0174532925f;

    float degreesToRadians(float degrees);
    float radiansToDegrees(float radians);

    float euclideanMod(float numerator, float denominator);

    template <class T>
    int sign(T value) {
        if (value < 0)
            return -1;
        else if (value > 0)
            return 1;
        else
            return 0;
    }

    int abs(int number);
}

#endif // UTIL_H
