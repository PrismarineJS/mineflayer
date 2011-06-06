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
    Chunk(const Int3D &pos, const Int3D &size, QByteArray data);

    Block getBlock(const Int3D & coord) const;
    void setBlock(const Int3D & coord, const Block & value);

    Int3D position() const { return m_pos; }
    Int3D size() const { return m_size; }

private:
    const Int3D m_pos;
    const Int3D m_size;
    const int m_volume;
    const int m_metadata_offset;
    const int m_light_offset;
    const int m_sky_light_offest;
    QByteArray m_data;

private:
    int indexOf(const Int3D & coord) const;
};

uint qHash(const Int3D & coord);

#endif // CHUNK_H
