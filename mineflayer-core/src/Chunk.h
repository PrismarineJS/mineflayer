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
    static int bufferLengthFromSize(const Int3D &size) { return size.x * size.y * size.z * 5 / 2; }

public:
    Chunk(const Int3D &pos, const Int3D &size, QByteArray data);

    Int3D position() const { return m_pos; }
    Int3D size() const { return m_size; }

    Block getBlock(const Int3D & coord) const;
    void setBlock(const Int3D & coord, const Block & value);
    void copyDataTo(unsigned char * buffer);

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
