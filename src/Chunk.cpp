#include "Chunk.h"

uint qHash(const Int3D & coord)
{
    return (coord.x * 8191 + coord.z) * 131071 + coord.y;
}

Chunk::Chunk(const Int3D &pos, const Int3D &size, const QByteArray data, bool contains_add_data, bool contains_biome_data) :
    m_pos(pos),
    m_size(size),
    m_volume(size.x * size.y * size.z),
    m_metadata_offset(m_volume),
    m_light_offset(m_metadata_offset + m_volume / 2),
    m_sky_light_offset(m_light_offset + m_volume / 2),
    m_add_offset(-1),
    m_biome_offset(-1),
    m_data(data)
{
    // at least one of the dimensions is guaranteed to be even.
    Q_ASSERT((m_volume & 1) == 0);

    m_data_size = m_sky_light_offset + m_volume / 2;
    if (contains_add_data) {
        m_add_offset = m_data_size;
        m_data_size += m_volume / 2;
    }

    if (contains_biome_data) {
        m_biome_offset = m_data_size;
        m_data_size += m_size.y;
    }
}

int Chunk::indexOf(const Int3D & coord) const
{
    Q_ASSERT(0 <= coord.x && coord.x < m_size.x &&
             0 <= coord.y && coord.y < m_size.y &&
             0 <= coord.z && coord.z < m_size.z);
    return coord.x + (coord.z * m_size.x) + (coord.y * m_size.x * m_size.z);
}

Block Chunk::block(const Int3D & coord) const
{
    int array_index = indexOf(coord);
    int nibble_shifter = (array_index & 1) * 4;
    Block block;
    block.setType((Item::ItemType)(m_data.at(array_index) & 0xff));
    block.setMetadata((m_data.at( m_metadata_offset + array_index / 2) >> nibble_shifter) & 0xf);
    block.setLight(   (m_data.at(    m_light_offset + array_index / 2) >> nibble_shifter) & 0xf);
    block.setSkyLight((m_data.at(m_sky_light_offset + array_index / 2) >> nibble_shifter) & 0xf);
    // TODO: support the "add" block property
    // TODO: support the "biome" block property
    return block;
}

void Chunk::setBlock(const Int3D &coord, const Block &value)
{
    // TODO test this
    int array_index = indexOf(coord);
    int nibble_shifter = (array_index & 1) * 4;
    quint8 innactive_nibble_mask = 0xf0 >> nibble_shifter;
    m_data[array_index] = (quint8)value.type();
    m_data[ m_metadata_offset + array_index / 2] = (m_data.at( m_metadata_offset + array_index / 2) & innactive_nibble_mask) | (value.m_metadata  << nibble_shifter);
    m_data[    m_light_offset + array_index / 2] = (m_data.at(    m_light_offset + array_index / 2) & innactive_nibble_mask) | (value.light()     << nibble_shifter);
    m_data[m_sky_light_offset + array_index / 2] = (m_data.at(m_sky_light_offset + array_index / 2) & innactive_nibble_mask) | (value.m_sky_light << nibble_shifter);
}
