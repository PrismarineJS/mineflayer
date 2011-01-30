#ifndef CHUNK_H
#define CHUNK_H

#include <QtGlobal>

#include <QVector>
#include <QSharedPointer>
#include <QHash>

#include "Int3D.h"

class Chunk {
public:
    struct Block {
        int type;
        int metadata;
        int light;
        int sky_light;
    };

public:
    Chunk(const Int3D & pos, const Int3D & size);

    // use to set or retrieve Block data. Call updateBlock when done.
    QSharedPointer<Block> getBlock(const Int3D & coord) const;

    // debug method to generate random blocks
    void randomize();

    Int3D position() const { return m_pos; }
    Int3D size() const { return m_size; }

    static void initialize();

private:
    Int3D m_pos;
    Int3D m_size;
    QVector<QSharedPointer<Block> > m_blocks;

    static bool s_initialized;

private:
    int indexOf(const Int3D & coord) const;
};

uint qHash(const Int3D & coord);

#endif // CHUNK_H
