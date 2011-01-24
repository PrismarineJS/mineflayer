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



    // --------------
    // Implementation
    // --------------


    template <class vec> float angleBetween(const vec & vec1, const vec & vec2)
    {
        return acosf(vec1.normalized().dot(vec2.normalized()));
    }
}
#endif

