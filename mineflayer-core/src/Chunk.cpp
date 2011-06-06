#include "Chunk.h"

#include <cstdlib>

uint qHash(const Int3D & coord)
{
    return (coord.x * 8191 + coord.z) * 131071 + coord.y;
}

Chunk::Chunk(const Int3D &pos, const Int3D &size, QByteArray data) :
    m_pos(pos),
    m_size(size),
    m_volume(size.x * size.y * size.z),
    m_metadata_offset(m_volume * 2 / 2),
    m_light_offset(m_volume * 3 / 2),
    m_sky_light_offest(m_volume * 4 / 2),
    m_data(data)
{
    // at least one of the dimensions is guaranteed to be even.
    Q_ASSERT((m_volume & 1) == 0);
}

int Chunk::indexOf(const Int3D & coord) const
{
    Q_ASSERT(0 <= coord.x && coord.x < m_size.x &&
             0 <= coord.y && coord.y < m_size.y &&
             0 <= coord.z && coord.z < m_size.z);
    return coord.y + (coord.z * m_size.y) + (coord.x * m_size.y * m_size.z);
}

Block Chunk::getBlock(const Int3D & coord) const
{
    int array_index = indexOf(coord);
    int nibble_shifter = (array_index & 1) * 4;
    Block block;
    block.setType((mineflayer_ItemType)(m_data.at(array_index) & 0xff));
    block.setMetadata((m_data.at( m_metadata_offset + array_index / 2) >> nibble_shifter) & 0xf);
    block.setLight(   (m_data.at(    m_light_offset + array_index / 2) >> nibble_shifter) & 0xf);
    block.setSkyLight((m_data.at(m_sky_light_offest + array_index / 2) >> nibble_shifter) & 0xf);
    return block;
}

void Chunk::setBlock(const Int3D &coord, const Block &value)
{
    // TODO test this
    int array_index = indexOf(coord);
    int nibble_shifter = (array_index & 1) * 4;
    quint8 innactive_nibble_mask = 0xf0 >> nibble_shifter;
    m_data[array_index] = (quint8)value.data.type;
    m_data[ m_metadata_offset + array_index / 2] = (m_data.at( m_metadata_offset + array_index / 2) & innactive_nibble_mask) | (value.data.metadata  << nibble_shifter);
    m_data[    m_light_offset + array_index / 2] = (m_data.at(    m_light_offset + array_index / 2) & innactive_nibble_mask) | (value.data.light     << nibble_shifter);
    m_data[m_sky_light_offest + array_index / 2] = (m_data.at(m_sky_light_offest + array_index / 2) & innactive_nibble_mask) | (value.data.sky_light << nibble_shifter);
}
