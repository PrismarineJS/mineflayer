#ifndef _CAMERA_H_
#define _CAMERA_H_

#include <OpenEXR/ImathVec.h>
using namespace Imath;

class Camera {
    public:
        Camera(const Vec3<float> & pos, const Vec3<float> & up,
            const Vec3<float> & look);
        ~Camera();

        // call opengl methods to move the camera
        void applyTransformations();

        // move the camera
        void moveBy(const Vec3<float> & delta);
        void moveTo(const Vec3<float> & newPos);
        void moveLeft(float distance);
        void moveRight(float distance);
        void moveUp(float distance);
        void moveDown(float distance);
        void moveForward(float distance);
        void moveBackward(float distance);

        // point the camera
        void pointAt(const Vec3<float> & vec);
        void pointBy(const Vec3<float> & delta);
        void pointLeft(float radians);
        void pointRight(float radians);
        void pointUp(float radians);
        void pointDown(float radians);

        // properties
        // position
        const Vec3<float> & pos() const;
        // where it is looking
        const Vec3<float> & look() const;
    private:
        Vec3<float> m_pos;
        Vec3<float> m_up;
        Vec3<float> m_look;

        Vec3<float> m_refPoint;

        // should be called when either m_pos or m_look changes
        inline void calcRefPoint() { m_refPoint = m_pos + m_look; }
};

#endif
