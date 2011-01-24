#ifndef CHUNK_H
#define CHUNK_H

#include <QVector>
#include <QSharedPointer>

#include <OpenEXR/ImathVec.h>
using namespace Imath;

#include "Drawable.h"
#include "Bitmap.h"
#include "Texture.h"
#include "Mesh.h"
#include "MeshInstance.h"

class Chunk : public Drawable {
public:
    typedef Vec3<int> Coord;

    struct Block {
        int type;
        int metadata;
        int light;
        int sky_light;
        QSharedPointer<MeshInstance> mesh_instance;
    };

public:
    Chunk();

    // use to set or retrieve Block data. Call updateBlock when done.
    QSharedPointer<Block> block(const Coord & coord) const;
    // call this if you edit the data from a block.
    void updateBlock(const Coord & coord);

protected:
    void render();

private:
    QVector<QSharedPointer<Block> > m_blocks;
    Vec3<int> m_size;
    Vec3<int> m_pos;

    static bool s_initialized;
    static Bitmap * s_brick_bitmap;
    static Texture * s_brick_texture;
    static Mesh * s_block_mesh;

private:
    int indexOf(const Coord & coord) const;

    static void initialize();

    void updateEntireChunkMesh();
};

uint qHash(Chunk::Coord coord);

#endif // CHUNK_H
