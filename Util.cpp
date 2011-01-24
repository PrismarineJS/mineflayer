#include <OpenEXR/ImathMatrix.h>

#include "Util.h"

void Util::rotateVector(Vec3<float> & vec, const Vec3<float> & axis,
    float radians)
{
    Vec3<float> normAxis = axis.normalized();
    Matrix33<float> I;
    Matrix33<float> L(
        0, normAxis.z, -normAxis.y,
        -normAxis.z, 0, normAxis.x,
        normAxis.y, -normAxis.x, 0
    );
    float d = normAxis.length();
    vec *= ( I + (sinf(radians)/d) * L + (((1 - cosf(radians))/(d*d)) * (L * L) ));
}
