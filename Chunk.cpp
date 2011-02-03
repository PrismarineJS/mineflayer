#include "Chunk.h"

#include <cstdlib>

uint qHash(const Int3D & coord)
{
    return (coord.x * 8191 + coord.z) * 131071 + coord.y;
}

Chunk::Chunk(const Int3D &pos, const Int3D &size) :
    m_pos(pos),
    m_size(size),
    m_blocks(m_size.x * m_size.y * m_size.z)
{

    // fill with dark air
    for (int i = 0; i < m_blocks.size(); i++) {
        Block block;
        block.type = Chunk::Air;
        block.light = 0;
        block.sky_light = 0;
        block.metadata = 0;
        m_blocks.replace(i, block);
    }
    // no need to update since air has null textures
}

int Chunk::indexOf(const Int3D & coord) const
{
    Q_ASSERT(0 <= coord.x && coord.x < m_size.x &&
             0 <= coord.y && coord.y < m_size.y &&
             0 <= coord.z && coord.z < m_size.z);
    return coord.y + (coord.z * m_size.y) + (coord.x * m_size.y * m_size.z);
}

Chunk::Block Chunk::getBlock(const Int3D & coord) const
{
    return m_blocks.at(indexOf(coord));
}
void Chunk::setBlock(const Int3D &coord, const Block &value)
{
    m_blocks.replace(indexOf(coord), value);
}
