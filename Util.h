#ifndef _UTIL_H_
#define _UTIL_H_

#include "OpenEXR/ImathVec.h"
using namespace Imath;

namespace Util {
    // rotate a vector about another vector
    void rotateVector(Vec3<float> & vec, const Vec3<float> & axis,
        float radians);

    // get the angle in radians between two vectors
    template <class vec> float angleBetween(const vec & vec1, const vec & vec2);

    // returns -1 if < 0, 1 if > 0, 0 if 0.
    template <class T> int sign(T number);


    // --------------
    // Implementation
    // --------------


    template <class vec> float angleBetween(const vec & vec1, const vec & vec2)
    {
        return acosf(vec1.normalized().dot(vec2.normalized()));
    }

    template <class T> int sign(T number)
    {
        if (number < 0) {
            return -1;
        } else if (number > 0) {
            return 1;
        } else {
            return 0;
        }
    }
}
#endif

