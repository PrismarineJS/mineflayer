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
        Block * block = new Block();
        block->type = 0;
        block->light = 0;
        block->sky_light = 0;
        block->metadata = 0;
        m_blocks.replace(i, QSharedPointer<Block>(block));
    }
    // no need to update since air has null textures
}

int Chunk::indexOf(const Int3D & coord) const
{
    return coord.y + (coord.z * m_size.y) + (coord.x * m_size.y * m_size.z);
}

QSharedPointer<Chunk::Block> Chunk::getBlock(const Int3D & coord) const
{
    return m_blocks.at(indexOf(coord));
}

void Chunk::randomize()
{
    // create and allocate this chunk
    m_size.setValue(16, 16, 128);
    m_blocks.resize(16 * 16 * 128);

    // for each block, assign random values
    Int3D coord;
    for (coord.z = 0; coord.z < m_size.z; coord.z++) {
        for (coord.y = 0; coord.y < m_size.y; coord.y++) {
            for (coord.x = 0; coord.x < m_size.x; coord.x++) {
                Block * new_block = new Block;
                new_block->type = (std::rand() % 20 == 1) ? (std::rand() % 92 + 1) : 0;
                if (std::rand() % 20 == 1)
                    new_block->type = 79;
                new_block->light = 0;
                new_block->metadata = 0;
                new_block->sky_light = 0;
                m_blocks.replace(indexOf(coord), QSharedPointer<Block>(new_block));
            }
        }
    }

}
