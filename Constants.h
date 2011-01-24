#ifndef CONSTANTS_H
#define CONSTANTS_H

#include <OpenEXR/ImathVec.h>
using namespace Imath;

namespace Constants {
    Vec3<int> block_size = Vec3<int>(32, 32, 32);

    Vec3<float> up = Vec3<float>(0, 0, 1.0f);
    Vec3<float> down = Vec3<float>(0, 0, -1.0f);
    Vec3<float> forwardX = Vec3<float>(1.0f, 0, 0);
    Vec3<float> forwardY = Vec3<float>(0, 1.0f, 0);
    Vec3<float> backwardX = Vec3<float>(-1.0f, 0, 0);
    Vec3<float> backwardY = Vec3<float>(0, -1.0f, 0);

    Vec3<float> unit = Vec3<float>(1.0f, 1.0f, 1.0f);
    Vec3<float> zero = Vec3<float>(0, 0, 0);
    Vec3<float> white = Vec3<float>(1.0f, 1.0f, 1.0f);
    Vec3<float> black = Vec3<float>(0, 0, 0);
}

#endif // CONSTANTS_H
