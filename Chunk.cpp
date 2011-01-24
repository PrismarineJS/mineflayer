#include "Chunk.h"
#include "Constants.h"

bool Chunk::s_initialized = false;
Bitmap * Chunk::s_brick_bitmap = NULL;
Texture * Chunk::s_brick_texture = NULL;
Mesh * Chunk::s_block_mesh = NULL;

uint qHash(Chunk::Coord coord)
{
    return (coord.x * 8191 + coord.z) * 131071 + coord.y;
}


Chunk::Chunk()
{
    initialize();
}

void Chunk::initialize()
{
    if (s_initialized)
        return;
    s_initialized = true;

    s_brick_bitmap = new Bitmap("brick.bmp");
    s_brick_texture = new Texture(s_brick_bitmap);
    s_block_mesh = Mesh::createUnitCube(Constants::white, s_brick_texture);
}

void Chunk::render()
{
    Coord coord;
    for (coord.z = 0; coord.z < m_size.z; coord.z++) {
        for (coord.y = 0; coord.y < m_size.y; coord.y++) {
            for (coord.x = 0; coord.x < m_size.x; coord.x++) {
                block(coord).data()->mesh_instance.data()->draw();
            }
        }
    }
}

void Chunk::updateBlock(const Coord & coord)
{
    QSharedPointer<Block> block = m_blocks.at(indexOf(coord));
    Vec3<float> loc = m_pos + coord * Constants::block_size;
    block.data()->mesh_instance = QSharedPointer<MeshInstance>(new MeshInstance(
            s_block_mesh, loc, Constants::block_size, Constants::up, Constants::forwardX));
}

void Chunk::updateEntireChunkMesh()
{
    Coord coord;
    for (coord.z = 0; coord.z < m_size.z; coord.z++) {
        for (coord.y = 0; coord.y < m_size.y; coord.y++) {
            for (coord.x = 0; coord.x < m_size.x; coord.x++) {
                updateBlock(coord);
            }
        }
    }
}

int Chunk::indexOf(const Coord & coord) const
{
    return coord.y + (coord.z * (m_size.y+1)) + (coord.x * (m_size.y+1) * (m_size.z+1));
}

QSharedPointer<Chunk::Block> Chunk::block(const Coord & coord) const
{
    return m_blocks.at(indexOf(coord));
}
