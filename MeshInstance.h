#ifndef _MESH_INSTANCE_H_
#define _MESH_INSTANCE_H_

#include "Mesh.h"

class MeshInstance : public Drawable {
    public:
        MeshInstance(Mesh * mesh, Vec3<float> pos, Vec3<float> scale,
            Vec3<float> up, Vec3<float> forward);
        MeshInstance(Mesh * mesh);

        // setters
        // where is it
        void setPos(Vec3<float> pos);
        void moveBy(const Vec3<float> & delta);
        // how to scale the mesh
        void setScale(Vec3<float> scale); 
        // vector pointing up
        void setUp(Vec3<float> up);
        // vector pointing forward
        void setForward(Vec3<float> forward);

        // accessors
        inline Vec3<float> pos() const { return m_pos; }
        inline Vec3<float> scale() const { return m_scale; }
        inline Vec3<float> up() const { return m_up; }
        inline Vec3<float> forward() const { return m_forward; }

    protected:
        void render();

    private:
        Mesh * m_mesh;
        Vec3<float> m_pos;
        Vec3<float> m_scale;
        Vec3<float> m_up;
        Vec3<float> m_forward;

};

#endif

