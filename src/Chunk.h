#ifndef CHUNK_H
#define CHUNK_H

#include <QtGlobal>

#include <QVector>
#include <QSharedPointer>
#include <QHash>

#include "Vector3D.h"
#include "Block.h"

class Chunk {
public:
    Chunk(const Int3D &pos, const Int3D &size, const QByteArray data, bool contains_add_data, bool contains_biome_data);

    Int3D position() const { return m_pos; }
    Int3D size() const { return m_size; }

    Block block(const Int3D & coord) const;
    void setBlock(const Int3D & coord, const Block & value);

    int dataSize() const { return m_data_size; }

private:
    const Int3D m_pos;
    const Int3D m_size;
    const int m_volume;
    const int m_metadata_offset;
    const int m_light_offset;
    const int m_sky_light_offset;
    int m_add_offset;
    int m_biome_offset;
    QByteArray m_data;
    int m_data_size;

private:
    int indexOf(const Int3D & coord) const;
};

uint qHash(const Int3D & coord);

#endif // CHUNK_H
