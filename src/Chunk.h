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
    Chunk(const Int3D & pos, const Int3D & size);

    Block getBlock(const Int3D & coord) const;
    void setBlock(const Int3D & coord, const Block & value);

    Int3D position() const { return m_pos; }
    Int3D size() const { return m_size; }

private:
    Int3D m_pos;
    Int3D m_size;
    QVector<Block> m_blocks;

private:
    int indexOf(const Int3D & coord) const;
};

uint qHash(const Int3D & coord);

#endif // CHUNK_H
