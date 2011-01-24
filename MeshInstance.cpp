#include <OpenEXR/ImathPlatform.h>

#include "Util.h"
#include "MeshInstance.h"

#include <QtOpenGL>

MeshInstance::MeshInstance(Mesh * mesh, Vec3<float> pos, Vec3<float> scale,
                            Vec3<float> up, Vec3<float> forward) :
    m_mesh(mesh),
    m_pos(pos),
    m_scale(scale),
    m_up(up),
    m_forward(forward)
{
}

MeshInstance::MeshInstance(Mesh * mesh) :
    m_mesh(mesh),
    m_pos(Vec3<float>(0,0,0)),
    m_scale(Vec3<float>(1, 1, 1)),
    m_up(Vec3<float>(0, 0, 1)),
    m_forward(Vec3<float>(-1, -1, 0))
{
}

// setters
// how to scale the mesh
void MeshInstance::setScale(Vec3<float> scale) {
    m_scale = scale;
}

// vector pointing up
void MeshInstance::setUp(Vec3<float> up) {
    m_up = up;
}

// vector pointing forward
void MeshInstance::setForward(Vec3<float> forward) {
    m_forward = forward;
}

void MeshInstance::render() {
    // scale the mesh and draw it
    glPushMatrix();

    glTranslatef(m_pos.x, m_pos.y, m_pos.z);

    // rotate to correct for m_up and m_forward
    Vec3<float> oldUp = Vec3<float>(0, 0, 1);
    Vec3<float> oldForward = Vec3<float>(1, 0, 0);
    Vec3<float> axis = oldUp.cross(m_up);
    glRotatef((180.0f / M_PI) * Util::angleBetween(oldForward, m_forward),
        oldUp.x, oldUp.y, oldUp.z);
    glRotatef((180.0f / M_PI) * Util::angleBetween(oldUp, m_up),
        axis.x, axis.y, axis.z);


    glScalef(m_scale.x, m_scale.y, m_scale.z);
    m_mesh->draw();

    glPopMatrix();
}

void MeshInstance::moveBy(const Vec3<float> & delta) {
    m_pos += delta;
}

void MeshInstance::setPos(Vec3<float> pos) {
    m_pos = pos;
}
